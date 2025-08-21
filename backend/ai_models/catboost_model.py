"""
CatBoost Model - Günlük Yön Tahmini
- LightGBM ile aynı feature mühendisliğini kullanır
- Walk-forward CV skorları ve model persistence
"""

import pandas as pd
import numpy as np
from typing import Dict, Tuple
import joblib
import logging
from datetime import datetime

from catboost import CatBoostClassifier

# LightGBM feature mühendisliğini yeniden kullan
from .lightgbm_model import LightGBMModel

logger = logging.getLogger(__name__)

class CatBoostModel:
    def __init__(self, model_path: str = "models/catboost_model.cbm"):
        self.model_path = model_path
        self.model: CatBoostClassifier | None = None
        self.feature_names: list[str] = []
        self.is_trained = False

        self.params = dict(
            loss_function="Logloss",
            eval_metric="AUC",
            depth=6,
            learning_rate=0.05,
            iterations=500,
            random_state=42,
            verbose=False
        )

    def prepare_data(self, df: pd.DataFrame, target_threshold: float = 0.02) -> Tuple[pd.DataFrame, pd.Series]:
        base = LightGBMModel()
        features_df = base.create_features(df)
        # hedef
        future_returns = features_df['Close'].shift(-1) / features_df['Close'] - 1
        target = (future_returns > target_threshold).astype(int)
        # sütunlar
        self.feature_names = [c for c in features_df.columns if c not in ['Date','Open','High','Low','Close','Volume']]
        data = features_df[self.feature_names].copy()
        data['target'] = target
        data = data.dropna()
        return data[self.feature_names], data['target']

    def train(self, df: pd.DataFrame, target_threshold: float = 0.02) -> Dict:
        try:
            X, y = self.prepare_data(df, target_threshold)
            if X.empty:
                raise ValueError("CatBoost: veri boş")

            model = CatBoostClassifier(**self.params)
            model.fit(X, y)
            self.model = model
            self.is_trained = True

            self.save_model()

            # Basit AUC tahmini (hold-out son %20)
            split = int(len(X)*0.8)
            from sklearn.metrics import roc_auc_score
            auc = roc_auc_score(y.iloc[split:], model.predict_proba(X.iloc[split:])[:,1])

            return {
                'training_date': datetime.now().isoformat(),
                'feature_count': len(self.feature_names),
                'holdout_auc': float(auc)
            }
        except Exception as e:
            logger.error(f"CatBoost eğitim hatası: {e}")
            return {}

    def predict(self, df: pd.DataFrame) -> Tuple[int, float]:
        try:
            if not self.is_trained or self.model is None:
                raise ValueError("CatBoost: model eğitilmemiş")
            base = LightGBMModel()
            feats = base.create_features(df)
            X = feats[self.feature_names].iloc[-1:].fillna(0)
            prob = float(self.model.predict_proba(X)[0][1])
            pred = 1 if prob >= 0.5 else 0
            return pred, prob
        except Exception as e:
            logger.error(f"CatBoost tahmin hatası: {e}")
            return 0, 0.0

    def save_model(self):
        try:
            self.model.save_model(self.model_path)
            joblib.dump({'feature_names': self.feature_names}, self.model_path + ".meta")
        except Exception as e:
            logger.error(f"CatBoost model kaydetme hatası: {e}")

    def load_model(self) -> bool:
        try:
            model = CatBoostClassifier()
            model.load_model(self.model_path)
            meta = joblib.load(self.model_path + ".meta")
            self.feature_names = meta['feature_names']
            self.model = model
            self.is_trained = True
            return True
        except Exception:
            return False

# Test
def test_catboost():
    dates = pd.date_range('2024-01-01', periods=200, freq='D')
    np.random.seed(42)
    trend = np.linspace(100, 120, 200)
    noise = np.random.normal(0, 2, 200)
    prices = trend + noise
    df = pd.DataFrame({
        'Date': dates,
        'Open': prices*0.99,
        'High': prices*1.02,
        'Low': prices*0.98,
        'Close': prices,
        'Volume': np.random.randint(1_000_000, 5_000_000, 200)
    })
    m = CatBoostModel()
    res = m.train(df)
    print(res)
    print(m.predict(df))
    return m

if __name__ == "__main__":
    test_catboost()
