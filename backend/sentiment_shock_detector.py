import logging
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Dict

import numpy as np
import pandas as pd
import yfinance as yf

logger = logging.getLogger(__name__)


@dataclass
class ShockResult:
    symbol: str
    shock_score: float  # 0-1
    sentiment_z: float
    return_z: float
    half_life_days: float
    timestamp: datetime

    def to_dict(self) -> Dict:
        return {
            "symbol": self.symbol,
            "shock_score": round(self.shock_score, 3),
            "sentiment_z": round(self.sentiment_z, 2),
            "return_z": round(self.return_z, 2),
            "half_life_days": round(self.half_life_days, 2),
            "timestamp": self.timestamp.isoformat(),
        }


class SentimentShockDetector:
    """MVP: Haber duygu verisi olmadan da çalışabilen proxy şok dedektörü.
    - Fiyat getirilerinin z-skoru
    - Basit proxy sentiment: son 5 gün up/down oranı
    Gelecekte gerçek haber/KAP/Twitter skorları ile beslenir.
    """

    def __init__(self, lookback_days: int = 120) -> None:
        self.lookback_days = lookback_days

    @staticmethod
    def _zscore(series: pd.Series) -> pd.Series:
        mu = series.mean()
        sd = series.std(ddof=0)
        if sd == 0 or np.isnan(sd):
            return pd.Series(np.zeros(len(series)), index=series.index)
        return (series - mu) / sd

    def detect_shock(self, symbol: str) -> ShockResult:
        end = datetime.now()
        start = end - timedelta(days=self.lookback_days + 10)
        df = yf.download(symbol, start=start, end=end, interval="1d", progress=False)
        if df is None or df.empty:
            raise RuntimeError(f"Veri yok: {symbol}")

        df = df.dropna()
        df["ret"] = df["Close"].pct_change()
        ret_z = self._zscore(df["ret"].dropna())
        latest_ret_z = float(ret_z.iloc[-1]) if not ret_z.empty else 0.0

        # Proxy sentiment: son 5 gün up-down dengesi -> [-1,1]
        last5 = df["ret"].tail(5)
        ups = int((last5 > 0).sum())
        downs = int((last5 < 0).sum())
        proxy_sentiment = 0.0 if len(last5) == 0 else (ups - downs) / max(1, len(last5))

        # sentiment z-skoru gibi normalize
        sentiment_z = float(proxy_sentiment * 2.0)

        # Şok skoru: birleşik aralığa 0-1 map
        raw = abs(latest_ret_z) * 0.7 + abs(sentiment_z) * 0.3
        shock_score = float(max(0.0, min(1.0, raw / 3.0)))

        # Yarı-ömür tahmini: şok yüksekse daha uzun
        half_life_days = 1.0 + 4.0 * shock_score

        return ShockResult(
            symbol=symbol,
            shock_score=shock_score,
            sentiment_z=sentiment_z,
            return_z=latest_ret_z,
            half_life_days=half_life_days,
            timestamp=datetime.now(),
        )



