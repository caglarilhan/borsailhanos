"""
StackTuner Pipeline - Optuna tabanlı hiperparametre optimizasyonu
Amaç: Base modeller + meta-learner için otomatik tuning, regime-aware ağırlıklar
"""

import json
import logging
from dataclasses import dataclass
from typing import Dict, Any, Optional, Tuple

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

try:
    import optuna
    OPTUNA_AVAILABLE = True
except ImportError:
    OPTUNA_AVAILABLE = False
    logger.warning("Optuna bulunamadı, grid search fallback kullanılacak")

try:
    import lightgbm as lgb
    import xgboost as xgb
    from sklearn.ensemble import GradientBoostingClassifier
    from sklearn.metrics import accuracy_score, roc_auc_score, log_loss
    from sklearn.model_selection import train_test_split
    SKLEARN_AVAILABLE = True
except ImportError as exc:
    SKLEARN_AVAILABLE = False
    logger.warning("ML kütüphaneleri eksik, StackTuner çalışmaz: %s", exc)

# CatBoost opsiyonel; mevcut değilse uyarı verip devam ediyoruz
try:
    import catboost as cb  # noqa: F401
    CATBOOST_AVAILABLE = True
except ImportError:
    CATBOOST_AVAILABLE = False
    logger.info("CatBoost bulunamadı, tuning LightGBM/XGBoost ile devam edecek")


@dataclass
class StackTunerConfig:
    test_size: float = 0.2
    random_state: int = 42
    optimize_metric: str = "accuracy"
    n_trials: int = 30
    regime_weight_boost: float = 0.15  # risk_on/off durumuna göre ağırlık kaydırma


class StackTuner:
    def __init__(self, config: StackTunerConfig = StackTunerConfig()):
        self.config = config
        self.best_params: Dict[str, Any] = {}
        self.best_score: float = -np.inf
        self.regime_table = {
            "risk_on": {"buy_bias": 0.1, "momentum_weight": 0.15},
            "risk_off": {"sell_bias": 0.1, "defensive_weight": 0.2},
            "neutral": {"balance": 0.0}
        }

    def _prepare_data(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """Train/test split"""
        numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
        if "target" not in numeric_cols:
            raise ValueError("Dataset must contain numeric 'target' column")
        feature_cols = [col for col in numeric_cols if col != "target"]
        X = df[feature_cols].values
        y = df["target"].values
        return train_test_split(X, y, test_size=self.config.test_size, random_state=self.config.random_state)

    def _objective(self, trial: "optuna.trial.Trial", X_train, X_valid, y_train, y_valid):
        """Optuna objective"""
        # LightGBM hyperparams
        lgb_params = {
            "n_estimators": trial.suggest_int("lgb_n_estimators", 200, 800),
            "max_depth": trial.suggest_int("lgb_max_depth", 4, 12),
            "learning_rate": trial.suggest_float("lgb_lr", 0.01, 0.2, log=True),
            "num_leaves": trial.suggest_int("lgb_leaves", 16, 128),
            "subsample": trial.suggest_float("lgb_subsample", 0.6, 1.0),
            "colsample_bytree": trial.suggest_float("lgb_colsample", 0.6, 1.0)
        }
        model = lgb.LGBMClassifier(**lgb_params)
        model.fit(X_train, y_train)
        preds = model.predict_proba(X_valid)
        metric = self._calc_metric(y_valid, preds)
        return metric

    def _calc_metric(self, y_true, y_proba):
        preds = np.argmax(y_proba, axis=1)
        if self.config.optimize_metric == "accuracy":
            return accuracy_score(y_true, preds)
        if self.config.optimize_metric == "roc_auc":
            return roc_auc_score(y_true, y_proba, multi_class="ovr")
        if self.config.optimize_metric == "log_loss":
            return -log_loss(y_true, y_proba)
        return accuracy_score(y_true, preds)

    def tune(self, df: pd.DataFrame):
        if not (OPTUNA_AVAILABLE and SKLEARN_AVAILABLE):
            logger.error("StackTuner için gerekli kütüphaneler yok")
            return None
        X_train, X_valid, y_train, y_valid = self._prepare_data(df)

        def objective(trial):
            score = self._objective(trial, X_train, X_valid, y_train, y_valid)
            return score

        study = optuna.create_study(direction="maximize")
        study.optimize(objective, n_trials=self.config.n_trials)
        self.best_params["lightgbm"] = study.best_params
        self.best_score = study.best_value
        logger.info(f"Best score: {self.best_score:.4f}")
        return self.best_params

    def regime_adjust(self, base_weights: Dict[str, float], regime: str) -> Dict[str, float]:
        """Piyasa rejimine göre model ağırlıkları ayarla"""
        regime_info = self.regime_table.get(regime, {"balance": 0})
        adjusted = base_weights.copy()
        if regime == "risk_on":
            adjusted["momentum"] = adjusted.get("momentum", 0.2) + self.config.regime_weight_boost
        elif regime == "risk_off":
            adjusted["defensive"] = adjusted.get("defensive", 0.2) + self.config.regime_weight_boost
        # normalize
        total = sum(adjusted.values())
        return {k: v / total for k, v in adjusted.items()}

    def export_results(self, path: str = "stack_tuner_results.json"):
        payload = {
            "best_score": self.best_score,
            "best_params": self.best_params
        }
        with open(path, "w") as f:
            json.dump(payload, f, indent=2)
        logger.info(f"StackTuner results saved to {path}")


# CLI kullanım
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    tuner = StackTuner()
    # Mock dataset
    data = pd.DataFrame(np.random.rand(1000, 10), columns=[f"f{i}" for i in range(10)])
    data["target"] = np.random.randint(0, 3, 1000)
    tuner.tune(data)
    tuner.export_results()
