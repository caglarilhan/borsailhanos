from __future__ import annotations

from typing import Dict, List

import pandas as pd


def _ema(series: pd.Series, window: int) -> pd.Series:
    return series.ewm(span=window, adjust=False).mean()


def generate_basic_signals(df: pd.DataFrame) -> List[Dict]:
    """Generate minimal EMA20/EMA50 cross and bullish engulfing-like signal.

    Note: We avoid external TA libs for Sprint-0 to reduce dependencies.
    """
    data = df.copy()
    if {"open", "high", "low", "close"}.issubset(set(data.columns)) is False:
        # try common yfinance columns
        rename_map = {
            "Open": "open",
            "High": "high",
            "Low": "low",
            "Close": "close",
            "Volume": "volume",
        }
        intersect = {k: v for k, v in rename_map.items() if k in data.columns}
        data = data.rename(columns=intersect)

    data["ema20"] = _ema(data["close"], 20)
    data["ema50"] = _ema(data["close"], 50)
    data["ema_cross_up"] = (data["ema20"].shift(1) < data["ema50"].shift(1)) & (data["ema20"] > data["ema50"])

    # Simple bullish engulfing approximation (without ta-lib):
    # prev bearish (close<open) and current bullish (close>open) and body covers prev body
    prev_bear = (data["close"].shift(1) < data["open"].shift(1))
    curr_bull = (data["close"] > data["open"])
    body_engulf = (data["close"] >= data["open"].shift(1)) & (data["open"] <= data["close"].shift(1))
    data["bullish_engulf"] = prev_bear & curr_bull & body_engulf

    signals: List[Dict] = []
    for ts, row in data.tail(5).iterrows():
        tags = []
        if bool(row.get("ema_cross_up", False)):
            tags.append("ema_cross_up")
        if bool(row.get("bullish_engulf", False)):
            tags.append("bullish_engulf")
        if tags:
            signals.append({
                "timestamp": str(ts),
                "tags": tags,
                "close": float(row.get("close", float("nan"))),
            })

    return signals


