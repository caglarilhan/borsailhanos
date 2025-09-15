"""
🎯 Ensemble Combiner - BIST AI Smart Trader
LightGBM + Prophet + TimeGPT tahminlerini ağırlıklı ortalama ile birleştirir
"""

import logging
import pandas as pd
import numpy as np
from typing import Optional, Dict

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnsembleCombiner:
    """Ağırlıklı ensemble tahmin birleştirici"""

    def __init__(self, w_lgbm: float = 0.5, w_prophet: float = 0.3, w_timegpt: float = 0.2):
        w_sum = w_lgbm + w_prophet + w_timegpt
        if abs(w_sum - 1.0) > 1e-6:
            w_lgbm, w_prophet, w_timegpt = [w / w_sum for w in (w_lgbm, w_prophet, w_timegpt)]
        self.weights = {
            'lightgbm': w_lgbm,
            'prophet': w_prophet,
            'timegpt': w_timegpt
        }
        logger.info(f"✅ Ensemble weights: {self.weights}")

    def combine(self,
                lgbm_prob: Optional[float],
                prophet_price: Optional[float],
                timegpt_price: Optional[float],
                last_close: Optional[float]) -> Dict:
        """
        Farklı kaynaklardaki sinyalleri birleştirir.

        - LightGBM: olasılık (0-1)
        - Prophet/TimeGPT: fiyat
        - last_close: referans fiyat
        """
        if last_close is None:
            raise ValueError("last_close gereklidir")

        # LightGBM olasılığını getirisel sinyale dönüştür (centered)
        lgbm_signal = None
        if lgbm_prob is not None:
            lgbm_signal = (lgbm_prob - 0.5) * 2.0  # -1..+1 aralığı

        # Prophet ve TimeGPT fiyatlarını yüzde değişim sinyaline dönüştür
        prophet_signal = None
        if prophet_price is not None:
            prophet_signal = (prophet_price / last_close) - 1.0

        timegpt_signal = None
        if timegpt_price is not None:
            timegpt_signal = (timegpt_price / last_close) - 1.0

        # Eksik sinyaller için 0 kabul (nötr)
        lgbm_signal = 0.0 if lgbm_signal is None else lgbm_signal
        prophet_signal = 0.0 if prophet_signal is None else prophet_signal
        timegpt_signal = 0.0 if timegpt_signal is None else timegpt_signal

        # Ağırlıklı toplam
        combined_signal = (
            self.weights['lightgbm'] * lgbm_signal +
            self.weights['prophet'] * prophet_signal +
            self.weights['timegpt'] * timegpt_signal
        )

        # Karar eşiği
        decision = 'BUY' if combined_signal > 0.02 else 'SELL' if combined_signal < -0.02 else 'HOLD'

        result = {
            'combined_signal': combined_signal,
            'decision': decision,
            'components': {
                'lgbm_signal': lgbm_signal,
                'prophet_signal': prophet_signal,
                'timegpt_signal': timegpt_signal,
                'weights': self.weights
            }
        }
        logger.info(f"🎯 Ensemble decision: {decision} | signal={combined_signal:.4f}")
        return result

if __name__ == '__main__':
    comb = EnsembleCombiner()
    out = comb.combine(0.62, 102.0, 101.5, 100.0)
    print(out)

