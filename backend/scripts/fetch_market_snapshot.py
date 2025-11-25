"""
BIST + US market snapshot fetcher.
Kaynak: yfinance
Çıktı: data/snapshots/{YYYYMMDD_HHMM}.json
"""
import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import pandas as pd
import requests
import yfinance as yf

# backend modüllerine erişmek için path ayarı
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.append(str(BACKEND_ROOT))

from config.secret_vault import get_secret  # noqa: E402

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("snapshot")

SNAPSHOT_ROOT = Path("data/snapshots")
SNAPSHOT_ROOT.mkdir(parents=True, exist_ok=True)

BIST_SYMBOLS = [
    "THYAO.IS", "AKBNK.IS", "GARAN.IS", "TUPRS.IS", "EREGL.IS",
    "SISE.IS", "BIMAS.IS", "ASELS.IS", "KRDMD.IS", "PGSUS.IS"
]
US_SYMBOLS = [
    "AAPL", "MSFT", "NVDA", "AMZN", "GOOGL",
    "META", "TSLA", "JPM", "NFLX", "AMD"
]

TWELVE_DATA_API_KEY = get_secret("TWELVE_DATA_API_KEY")
TWELVE_DATA_BASE_URL = os.getenv("TWELVE_DATA_BASE_URL", "https://api.twelvedata.com")
TWELVE_TIMEOUT = float(os.getenv("TWELVE_DATA_TIMEOUT", "10"))
TWELVE_DATA_SYMBOL_LIMIT = int(os.getenv("TWELVE_DATA_SYMBOL_LIMIT", "8"))


def _twelvedata_symbol_params(symbol: str) -> Dict[str, str]:
    if symbol.endswith(".IS"):
        return {"symbol": symbol.split(".")[0], "exchange": "BIST"}
    if symbol.endswith(".US"):
        return {"symbol": symbol.split(".")[0], "exchange": "NYSE"}
    # Varsayılan: sembolü olduğu gibi kullan
    return {"symbol": symbol}


def _mock_record(symbol: str) -> Dict[str, Any]:
    import random

    base = random.uniform(50, 300)
    change_pct = random.uniform(-2, 2)
    change = base * change_pct / 100
    return {
        "symbol": symbol,
        "timestamp": datetime.utcnow().isoformat(),
        "close": base,
        "open": base - change * 0.3,
        "high": base + abs(change),
        "low": base - abs(change),
        "volume": random.uniform(1e5, 5e6),
        "change": change,
        "change_pct": change_pct,
        "mock": True,
    }


def _fetch_symbol_twelvedata(symbol: str, interval: str = "1day") -> Dict[str, Any]:
    if not TWELVE_DATA_API_KEY:
        raise RuntimeError("TWELVE_DATA_API_KEY missing")
    params = {
        "interval": interval,
        "outputsize": 2,
        "apikey": TWELVE_DATA_API_KEY,
    }
    params.update(_twelvedata_symbol_params(symbol))
    resp = requests.get(
        f"{TWELVE_DATA_BASE_URL.rstrip('/')}/time_series",
        params=params,
        timeout=TWELVE_TIMEOUT,
    )
    resp.raise_for_status()
    payload = resp.json()
    if "values" not in payload:
        raise RuntimeError(f"TwelveData response error: {payload.get('message') or payload}")
    values = payload["values"]
    if not values:
        raise RuntimeError("TwelveData returned empty values list")
    latest = values[0]
    prev = values[1] if len(values) > 1 else latest

    def _as_float(value: Any) -> float:
        try:
            return float(value)
        except (TypeError, ValueError):
            return 0.0

    change = _as_float(latest["close"]) - _as_float(prev["close"])
    prev_close = _as_float(prev["close"]) or 1.0
    change_pct = (change / prev_close) * 100 if prev_close else 0.0

    return {
        "symbol": symbol,
        "timestamp": latest.get("datetime", datetime.utcnow().isoformat()),
        "close": _as_float(latest.get("close")),
        "open": _as_float(latest.get("open")),
        "high": _as_float(latest.get("high")),
        "low": _as_float(latest.get("low")),
        "volume": _as_float(latest.get("volume")),
        "change": change,
        "change_pct": change_pct,
        "source": "twelve-data",
    }


def _fetch_symbol_yfinance(symbol: str, period: str = "1mo", interval: str = "1d") -> Dict[str, Any]:
    ticker = yf.Ticker(symbol)
    hist = ticker.history(period=period, interval=interval)
    if hist.empty:
        raise ValueError("empty data")
    last = hist.iloc[-1]
    prev = hist.iloc[-2] if len(hist) > 1 else last
    change = float(last["Close"] - prev["Close"])
    change_pct = float((change / prev["Close"]) * 100) if prev["Close"] else 0.0
    return {
        "symbol": symbol,
        "timestamp": last.name.isoformat() if isinstance(last.name, pd.Timestamp) else datetime.utcnow().isoformat(),
        "close": float(last["Close"]),
        "open": float(last["Open"]),
        "high": float(last["High"]),
        "low": float(last["Low"]),
        "volume": float(last["Volume"]),
        "change": change,
        "change_pct": change_pct,
        "source": "yfinance",
    }


def fetch_symbol(symbol: str, prefer_twelvedata: bool = True) -> Dict[str, Any]:
    if TWELVE_DATA_API_KEY and prefer_twelvedata:
        try:
            return _fetch_symbol_twelvedata(symbol)
        except Exception as exc:
            logger.warning("⚠️ Twelve Data hata %s: %s (falling back to yfinance)", symbol, exc)
    return _fetch_symbol_yfinance(symbol)


def build_snapshot(symbols: List[str], market: str, td_budget: Optional[Dict[str, int]] = None) -> Dict[str, Any]:
    items = []
    for sym in symbols:
        prefer_twelvedata = bool(
            td_budget and td_budget.get("remaining", 0) > 0 and TWELVE_DATA_API_KEY
        )
        try:
            data = fetch_symbol(sym, prefer_twelvedata)
            items.append(data)
            logger.info("✅ %s fetched", sym)
        except Exception as exc:
            logger.warning("⚠️ %s fetch failed: %s (using mock)", sym, exc)
            data = _mock_record(sym)
            items.append(data)
        if prefer_twelvedata and td_budget:
            td_budget["remaining"] = max(td_budget.get("remaining", 0) - 1, 0)
    return {"market": market, "count": len(items), "symbols": items}


def main():
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M")
    td_budget = {"remaining": max(TWELVE_DATA_SYMBOL_LIMIT, 0)}
    us_snapshot = build_snapshot(US_SYMBOLS, "US", td_budget)
    bist_snapshot = build_snapshot(BIST_SYMBOLS, "BIST", td_budget)
    output = {
        "generated_at": datetime.utcnow().isoformat(),
        "bist": bist_snapshot,
        "us": us_snapshot,
    }
    out_path = SNAPSHOT_ROOT / f"snapshot_{timestamp}.json"
    out_path.write_text(json.dumps(output, indent=2))
    logger.info("📦 Snapshot saved: %s", out_path)


if __name__ == "__main__":
    main()
