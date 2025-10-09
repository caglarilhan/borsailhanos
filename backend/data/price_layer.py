from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Optional

import pandas as pd

try:
    import yfinance as yf
except Exception:  # pragma: no cover
    yf = None  # type: ignore


@dataclass
class PriceSourceConfig:
    finnhub_api_key: Optional[str] = None
    request_timeout_sec: float = 10.0


def _ensure_yfinance_available() -> None:
    if yf is None:
        raise RuntimeError("yfinance not installed. Please add it to requirements and install.")


def fetch_recent_ohlcv(symbol: str, period: str = "3mo", interval: str = "1d") -> pd.DataFrame:
    """Fetch recent OHLCV using yfinance.

    For Sprint-0 we keep it simple; Finnhub WS skeleton will be added separately.
    """
    _ensure_yfinance_available()
    ticker = yf.Ticker(symbol)
    df = ticker.history(period=period, interval=interval, auto_adjust=False)
    if df is None or df.empty:
        raise ValueError(f"No data returned for {symbol}")
    df = df.rename(columns={
        "Open": "open",
        "High": "high",
        "Low": "low",
        "Close": "close",
        "Volume": "volume",
    })
    df.index.name = "Date"
    return df


class FinnhubWSSkeleton:
    """Minimal placeholder for future WS integration.

    In Sprint-0, we define the interface without opening a real connection.
    """

    def __init__(self, api_key: Optional[str] = None) -> None:
        self.api_key = api_key
        self.connected = False

    def connect(self) -> None:
        # Placeholder connect to be implemented with websocket-client or websockets
        self.connected = True

    def subscribe(self, symbol: str) -> None:
        if not self.connected:
            raise RuntimeError("WS not connected")
        # no-op in skeleton

    def receive(self) -> Optional[dict]:
        if not self.connected:
            return None
        time.sleep(0.1)
        return None


