"""
BIST + US market snapshot fetcher.
Kaynak: yfinance
Çıktı: data/snapshots/{YYYYMMDD_HHMM}.json
"""
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List

import pandas as pd
import yfinance as yf

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


def fetch_symbol(symbol: str, period: str = "1mo", interval: str = "1d") -> Dict[str, Any]:
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
    }


def build_snapshot(symbols: List[str], market: str) -> Dict[str, Any]:
    items = []
    for sym in symbols:
        try:
            data = fetch_symbol(sym)
            items.append(data)
            logger.info("✅ %s fetched", sym)
        except Exception as exc:
            logger.warning("⚠️ %s fetch failed: %s (using mock)", sym, exc)
            data = _mock_record(sym)
            items.append(data)
    return {"market": market, "count": len(items), "symbols": items}


def main():
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M")
    output = {
        "generated_at": datetime.utcnow().isoformat(),
        "bist": build_snapshot(BIST_SYMBOLS, "BIST"),
        "us": build_snapshot(US_SYMBOLS, "US"),
    }
    out_path = SNAPSHOT_ROOT / f"snapshot_{timestamp}.json"
    out_path.write_text(json.dumps(output, indent=2))
    logger.info("📦 Snapshot saved: %s", out_path)


if __name__ == "__main__":
    main()
