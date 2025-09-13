"""
🚀 Ensemble Demo - BIST AI Smart Trader
LightGBM + Prophet + TimeGPT mock ile birleştirme demosu
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta

from lightgbm_pipeline import LightGBMPipeline
from prophet_model import ProphetModel
from timegpt_mock import TimeGPTMock
from ensemble_combiner import EnsembleCombiner


def build_synthetic_daily_data(days: int = 400) -> pd.DataFrame:
    dates = pd.date_range(datetime.now() - timedelta(days=days), periods=days, freq='D')
    np.random.seed(42)
    prices = [100.0]
    for _ in range(1, days):
        change = np.random.normal(0.0005, 0.01)
        prices.append(max(prices[-1] * (1 + change), 1.0))
    df = pd.DataFrame({
        'Date': dates,
        'Open': prices,
        'High': [p * (1 + abs(np.random.normal(0, 0.01))) for p in prices],
        'Low': [p * (1 - abs(np.random.normal(0, 0.01))) for p in prices],
        'Close': prices,
        'Volume': np.random.uniform(1e6, 5e6, len(dates)),
    })
    df['High'] = np.maximum(df['High'], df['Close'])
    df['Low'] = np.minimum(df['Low'], df['Close'])
    return df


def run_demo():
    print("\n🚀 Ensemble Demo Başlıyor...")

    # 1) LightGBM günlük modelini eğit
    daily_data = build_synthetic_daily_data()
    lgbm = LightGBMPipeline()
    _ = lgbm.train_model(daily_data, daily_data['Close'])

    # Son gün için LGBM olasılığı (basitçe son 20 günü kullanarak)
    X_features, _ = lgbm.prepare_features(daily_data)
    last_prob = lgbm.model.predict(X_features.tail(1))[0]

    # 2) Prophet (mock/real) eğit ve 4H tahmin al
    prophet = ProphetModel()
    _ = prophet.train_model(build_synthetic_daily_data(200))
    prophet_forecast = prophet.predict(periods=6, freq='4H')  # 24 saatlik 6 adım
    prophet_price = float(prophet_forecast['prediction'].iloc[-1])

    # 3) TimeGPT mock ile 10 günlük tahmin al
    timegpt = TimeGPTMock(base_price=float(daily_data['Close'].iloc[-1]))
    timegpt_forecast = timegpt.predict(periods=10, freq='1D')
    timegpt_price = float(timegpt_forecast['prediction'].iloc[0])

    # 4) Ensemble combine
    last_close = float(daily_data['Close'].iloc[-1])
    combiner = EnsembleCombiner(w_lgbm=0.5, w_prophet=0.3, w_timegpt=0.2)
    decision = combiner.combine(
        lgbm_prob=last_prob,
        prophet_price=prophet_price,
        timegpt_price=timegpt_price,
        last_close=last_close,
    )

    print("\n📊 Ensemble Sonucu:")
    print(decision)

    # 5) Sonuçları dosyaya kaydet
    output = {
        'timestamp': datetime.now().isoformat(),
        'last_close': last_close,
        'lgbm_prob': last_prob,
        'prophet_price': prophet_price,
        'timegpt_price': timegpt_price,
        'ensemble': decision,
    }
    out_path = f"ensemble_demo_result_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    import json
    with open(out_path, 'w') as f:
        json.dump(output, f, indent=2)
    print(f"\n💾 Sonuç kaydedildi: {out_path}")


if __name__ == '__main__':
    run_demo()
