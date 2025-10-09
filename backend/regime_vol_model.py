from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Dict

import numpy as np
import pandas as pd
import yfinance as yf


@dataclass
class RegimeState:
    symbol: str
    regime: str  # Risk-On / Neutral / Risk-Off
    vol_ema: float
    vol_persist: float  # 0-1 (proxy kalıcılık)
    timestamp: datetime

    def to_dict(self) -> Dict:
        return {
            "symbol": self.symbol,
            "regime": self.regime,
            "vol_ema": round(self.vol_ema, 4),
            "vol_persist": round(self.vol_persist, 3),
            "timestamp": self.timestamp.isoformat(),
        }


class RegimeVolModel:
    """MVP: HMM/GARCH olmadan hızlı proxy — EMA vol ve kalıcılık.
    - Günlük getirilerden vol_ema (EMA(20))
    - Kalıcılık proxysi: corr(ret_t, ret_{t-1..t-5}) ortalaması → [0,1]
    """

    def __init__(self, lookback_days: int = 200) -> None:
        self.lookback_days = lookback_days

    def analyze(self, symbol: str) -> RegimeState:
        end = datetime.now()
        start = end - timedelta(days=self.lookback_days + 20)
        df = yf.download(symbol, start=start, end=end, interval="1d", progress=False)
        if df is None or df.empty:
            raise RuntimeError(f"Veri yok: {symbol}")
        df = df.dropna()
        df["ret"] = df["Close"].pct_change()

        ret = df["ret"].dropna()
        if ret.empty:
            vol_ema = 0.0
        else:
            vol_ema = float(ret.ewm(span=20, adjust=False).std().iloc[-1])

        # kalıcılık proxysi: kısa gecikmeli korelasyonların ortalaması
        corrs = []
        for lag in range(1, 6):
            corr = ret.corr(ret.shift(lag))
            if pd.notna(corr):
                corrs.append(corr)
        persist = float(np.clip(np.nanmean(corrs) if corrs else 0.0, 0.0, 1.0))

        # rejim: vol_ema eşiğe göre
        if vol_ema > 0.03:
            regime = "Risk-Off"
        elif vol_ema < 0.012:
            regime = "Risk-On"
        else:
            regime = "Neutral"

        return RegimeState(
            symbol=symbol,
            regime=regime,
            vol_ema=vol_ema,
            vol_persist=persist,
            timestamp=datetime.now(),
        )



