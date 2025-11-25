#!/usr/bin/env python3
"""Collects a lightweight US equity snapshot for downstream AI pipelines."""
from __future__ import annotations

import json
import random
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List

try:
    import yfinance as yf
except ImportError:  # pragma: no cover
    yf = None

ROOT = Path(__file__).resolve().parents[2]
SNAPSHOT_PATH = ROOT / "data" / "snapshots" / "us_market_snapshot.json"
SNAPSHOT_PATH.parent.mkdir(parents=True, exist_ok=True)

TOP_US_TICKERS = [
    "AAPL",
    "MSFT",
    "NVDA",
    "AMZN",
    "GOOGL",
    "META",
    "TSLA",
    "JPM",
    "NFLX",
    "AMD",
]


def _fetch_from_yfinance(tickers: List[str]) -> List[Dict]:
    if yf is None:
        raise RuntimeError("yfinance is not installed, falling back to mock data")

    snapshot: List[Dict] = []
    for ticker in tickers:
        ticker_info = yf.Ticker(ticker)
        hist = ticker_info.history(period="5d", interval="1d")
        if hist.empty:
            raise ValueError(f"No history for {ticker}")
        last = hist.iloc[-1]
        prev = hist.iloc[-2] if len(hist) >= 2 else last
        change_pct = ((last["Close"] - prev["Close"]) / prev["Close"]) * 100 if prev["Close"] else 0
        snapshot.append(
            {
                "symbol": ticker,
                "price": round(float(last["Close"]), 2),
                "changePct": round(float(change_pct), 2),
                "volume": int(last.get("Volume", 0)),
                "market": "US",
            }
        )
    return snapshot


def _mock_snapshot(tickers: List[str]) -> List[Dict]:
    rand = random.Random(42)
    sample = []
    for ticker in tickers:
        price = round(rand.uniform(50, 500), 2)
        change = round(rand.uniform(-3, 3), 2)
        sample.append(
            {
                "symbol": ticker,
                "price": price,
                "changePct": change,
                "volume": rand.randint(5_000_000, 80_000_000),
                "market": "US",
            }
        )
    return sample


def main() -> None:
    try:
        data = _fetch_from_yfinance(TOP_US_TICKERS)
        source = "yfinance"
    except Exception as exc:  # pragma: no cover
        print(f"[fetch_us_market] warning: {exc}")
        data = _mock_snapshot(TOP_US_TICKERS)
        source = "mock"

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": source,
        "symbols": data,
    }
    SNAPSHOT_PATH.write_text(json.dumps(payload, indent=2))
    print(f"Saved snapshot to {SNAPSHOT_PATH.relative_to(ROOT)} ({source})")


if __name__ == "__main__":
    main()
