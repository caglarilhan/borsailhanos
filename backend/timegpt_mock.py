"""
⏰ TimeGPT Mock - BIST AI Smart Trader
10 günlük (veya istenen periyot) makro tahmin üretir
API anahtarı olmadan çalışabilen hafif mock sınıfı
"""

from datetime import datetime, timedelta
from typing import List
import numpy as np
import pandas as pd

class TimeGPTMock:
    """TimeGPT mock tahmin üretici"""

    def __init__(self, base_price: float = 100.0, daily_trend: float = 0.15, noise_std: float = 0.8):
        self.base_price = base_price
        self.daily_trend = daily_trend  # her adım için artış miktarı
        self.noise_std = noise_std

    def predict(self, periods: int = 10, freq: str = '1D') -> pd.DataFrame:
        now = datetime.now()
        if freq.upper() in ('1D', 'D', 'DAY'):
            dates = [now + timedelta(days=i) for i in range(1, periods + 1)]
        elif freq.upper() in ('4H', 'H4'):
            dates = [now + timedelta(hours=4 * i) for i in range(1, periods + 1)]
        else:
            dates = [now + timedelta(days=i) for i in range(1, periods + 1)]

        preds: List[float] = []
        price = self.base_price
        for i in range(periods):
            noise = np.random.normal(0, self.noise_std)
            price = max(price + self.daily_trend + noise, 1.0)
            preds.append(price)

        lower = [p * 0.98 for p in preds]
        upper = [p * 1.02 for p in preds]

        return pd.DataFrame({
            'date': dates,
            'prediction': preds,
            'lower_bound': lower,
            'upper_bound': upper,
        })

if __name__ == '__main__':
    mock = TimeGPTMock()
    df = mock.predict(10, '1D')
    print(df.head())

