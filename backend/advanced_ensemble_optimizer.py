#!/usr/bin/env python3
"""
🚀 Advanced Ensemble Optimization - SPRINT 4
BIST AI Smart Trader v2.0 - %80+ Doğruluk Hedefi

Model ensemble optimizasyonu ile doğruluğu artırma:
- Stacking & Blending
- Dynamic Weighting
- Model Diversity
- Performance Optimization
"""

import asyncio
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
import pandas as pd
import numpy as np
import yfinance as yf
from dataclasses import dataclass
from sklearn.ensemble import StackingRegressor, VotingRegressor
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.model_selection import cross_val_score, TimeSeriesSplit
from sklearn.metrics import mean_squared_error, r2_score

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class EnsembleConfig:
    """Ensemble konfigürasyonu"""
    stacking_enabled: bool = True
    dynamic_weighting: bool = True
    model_diversity: bool = True
    cross_validation_folds: int = 5
    time_series_split: bool = True
    performance_threshold: float = 0.7

@dataclass
class ModelPerformance:
    """Model performans metrikleri"""
    model_name: str
    mse: float
    r2_score: float
    cross_val_score: float
    weight: float
    last_update: datetime
    performance_trend: float = 0.0

@dataclass
class EnsembleResult:
    """Ensemble sonucu"""
    symbol: str
    timestamp: datetime
    prediction: float
    confidence: float
    model_weights: Dict[str, float]
    performance_metrics: Dict[str, float]
    ensemble_type: str

class BaseModel:
    """Temel model sınıfı"""
    
    def __init__(self, name: str):
        self.name = name
        self.model = None
        self.is_trained = False
        self.last_training = None
        
    def train(self, X: np.ndarray, y: np.ndarray):
        """Modeli eğit"""
        raise NotImplementedError
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Tahmin yap"""
        if not self.is_trained:
            raise ValueError(f"Model {self.name} henüz eğitilmemiş")
        return self.model.predict(X)
    
    def get_performance(self, X: np.ndarray, y: np.ndarray) -> ModelPerformance:
        """Model performansını hesapla"""
        if not self.is_trained:
            return None
        
        try:
            predictions = self.predict(X)
            mse = mean_squared_error(y, predictions)
            r2 = r2_score(y, predictions)
            
            # Cross-validation score
            cv_scores = cross_val_score(self.model, X, y, cv=5, scoring='r2')
            cv_score = np.mean(cv_scores)
            
            return ModelPerformance(
                model_name=self.name,
                mse=mse,
                r2_score=r2,
                cross_val_score=cv_score,
                weight=1.0,  # Default weight
                last_update=datetime.now()
            )
            
        except Exception as e:
            logger.warning(f"Model performans hesaplama hatası {self.name}: {e}")
            return None

class LinearModel(BaseModel):
    """Linear model"""
    
    def __init__(self, name: str, model_type: str = "linear"):
        super().__init__(name)
        if model_type == "linear":
            self.model = LinearRegression()
        elif model_type == "ridge":
            self.model = Ridge(alpha=1.0)
        else:
            self.model = LinearRegression()
    
    def train(self, X: np.ndarray, y: np.ndarray):
        """Linear modeli eğit"""
        try:
            self.model.fit(X, y)
            self.is_trained = True
            self.last_training = datetime.now()
            logger.info(f"✅ {self.name} modeli eğitildi")
        except Exception as e:
            logger.error(f"❌ {self.name} model eğitim hatası: {e}")

class PolynomialModel(BaseModel):
    """Polynomial model"""
    
    def __init__(self, name: str, degree: int = 2):
        super().__init__(name)
        self.degree = degree
        from sklearn.preprocessing import PolynomialFeatures
        from sklearn.pipeline import Pipeline
        
        self.model = Pipeline([
            ('poly', PolynomialFeatures(degree=degree)),
            ('linear', LinearRegression())
        ])
    
    def train(self, X: np.ndarray, y: np.ndarray):
        """Polynomial modeli eğit"""
        try:
            self.model.fit(X, y)
            self.is_trained = True
            self.last_training = datetime.now()
            logger.info(f"✅ {self.name} modeli eğitildi")
        except Exception as e:
            logger.error(f"❌ {self.name} model eğitim hatası: {e}")

class AdvancedEnsembleOptimizer:
    """Gelişmiş ensemble optimizasyonu"""
    
    def __init__(self, config: EnsembleConfig):
        self.config = config
        self.models = {}
        self.performance_history = {}
        self.ensemble = None
        self.last_optimization = None
        
        # Initialize base models
        self._initialize_models()
        
        logger.info("✅ Advanced Ensemble Optimizer başlatıldı")
    
    def _initialize_models(self):
        """Temel modelleri başlat"""
        try:
            # Linear models
            self.models['linear'] = LinearModel("Linear Regression", "linear")
            self.models['ridge'] = LinearModel("Ridge Regression", "ridge")
            
            # Polynomial models
            self.models['poly2'] = PolynomialModel("Polynomial (deg=2)", 2)
            self.models['poly3'] = PolynomialModel("Polynomial (deg=3)", 3)
            
            # Ensemble models
            if self.config.stacking_enabled:
                self._create_stacking_ensemble()
            
            logger.info(f"✅ {len(self.models)} model başlatıldı")
            
        except Exception as e:
            logger.error(f"❌ Model başlatma hatası: {e}")
    
    def _create_stacking_ensemble(self):
        """Stacking ensemble oluştur"""
        try:
            # Base models for stacking
            base_models = [
                ('linear', self.models['linear'].model),
                ('ridge', self.models['ridge'].model),
                ('poly2', self.models['poly2'].model),
                ('poly3', self.models['poly3'].model)
            ]
            
            # Meta-learner
            meta_learner = LinearRegression()
            
            # Create stacking ensemble
            self.ensemble = StackingRegressor(
                estimators=base_models,
                final_estimator=meta_learner,
                cv=5,
                n_jobs=-1
            )
            
            logger.info("✅ Stacking ensemble oluşturuldu")
            
        except Exception as e:
            logger.error(f"❌ Stacking ensemble hatası: {e}")
    
    async def train_all_models(self, X: np.ndarray, y: np.ndarray):
        """Tüm modelleri eğit"""
        try:
            logger.info(f"🔧 {len(self.models)} model eğitiliyor...")
            
            # Data preprocessing: NaN ve infinite değerleri temizle
            X_clean, y_clean = self._clean_data(X, y)
            
            if len(X_clean) < 10:
                logger.warning("⚠️ Temizlenmiş veri çok az, eğitim atlanıyor")
                return
            
            # Train individual models
            for name, model in self.models.items():
                if hasattr(model, 'train'):
                    model.train(X_clean, y_clean)
                    
                    # Calculate performance
                    performance = model.get_performance(X_clean, y_clean)
                    if performance:
                        self.performance_history[name] = performance
            
            # Train ensemble if available
            if self.ensemble is not None:
                try:
                    self.ensemble.fit(X_clean, y_clean)
                    logger.info("✅ Stacking ensemble eğitildi")
                except Exception as e:
                    logger.warning(f"⚠️ Stacking ensemble eğitim hatası: {e}")
            
            self.last_optimization = datetime.now()
            logger.info("✅ Tüm modeller eğitildi")
            
        except Exception as e:
            logger.error(f"❌ Model eğitim hatası: {e}")
    
    def _clean_data(self, X: np.ndarray, y: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Data'yı temizle: NaN ve infinite değerleri kaldır"""
        try:
            # NaN kontrolü
            valid_mask = ~(np.isnan(X).any(axis=1) | np.isnan(y))
            
            # Infinite kontrolü
            valid_mask &= ~(np.isinf(X).any(axis=1) | np.isinf(y))
            
            # Zero division kontrolü (çok küçük değerler)
            valid_mask &= ~(np.abs(X) < 1e-10).any(axis=1)
            valid_mask &= ~(np.abs(y) < 1e-10)
            
            X_clean = X[valid_mask]
            y_clean = y[valid_mask]
            
            logger.info(f"🔧 Data temizlendi: {len(X)} -> {len(X_clean)} satır")
            return X_clean, y_clean
            
        except Exception as e:
            logger.warning(f"⚠️ Data temizleme hatası: {e}")
            return X, y
    
    def optimize_weights(self) -> Dict[str, float]:
        """Model ağırlıklarını optimize et"""
        try:
            if not self.performance_history:
                logger.warning("⚠️ Performans verisi yok, eşit ağırlıklar kullanılıyor")
                return {name: 1.0/len(self.models) for name in self.models.keys()}
            
            # Performance-based weighting
            weights = {}
            total_score = 0
            
            for name, performance in self.performance_history.items():
                if performance and performance.cross_val_score > 0:
                    # Use cross-validation score as weight
                    score = max(performance.cross_val_score, 0.1)  # Minimum weight
                    weights[name] = score
                    total_score += score
                else:
                    weights[name] = 0.1  # Minimum weight
                    total_score += 0.1
            
            # Normalize weights
            if total_score > 0:
                for name in weights:
                    weights[name] /= total_score
            
            logger.info("✅ Model ağırlıkları optimize edildi")
            return weights
            
        except Exception as e:
            logger.error(f"❌ Ağırlık optimizasyon hatası: {e}")
            return {name: 1.0/len(self.models) for name in self.models.keys()}
    
    def dynamic_weighting(self, market_regime: str = "normal") -> Dict[str, float]:
        """Piyasa rejimine göre dinamik ağırlıklandırma"""
        try:
            base_weights = self.optimize_weights()
            
            if not self.config.dynamic_weighting:
                return base_weights
            
            # Market regime adjustments
            regime_multipliers = {
                "bull": {"linear": 1.2, "ridge": 1.1, "poly2": 0.9, "poly3": 0.8},
                "bear": {"linear": 0.8, "ridge": 0.9, "poly2": 1.1, "poly3": 1.2},
                "volatile": {"linear": 0.9, "ridge": 1.0, "poly2": 1.0, "poly3": 1.1},
                "normal": {"linear": 1.0, "ridge": 1.0, "poly2": 1.0, "poly3": 1.0}
            }
            
            multiplier = regime_multipliers.get(market_regime, regime_multipliers["normal"])
            
            # Apply regime multipliers
            adjusted_weights = {}
            total_weight = 0
            
            for name, base_weight in base_weights.items():
                if name in multiplier:
                    adjusted_weight = base_weight * multiplier[name]
                    adjusted_weights[name] = adjusted_weight
                    total_weight += adjusted_weight
            
            # Normalize
            if total_weight > 0:
                for name in adjusted_weights:
                    adjusted_weights[name] /= total_weight
            
            logger.info(f"✅ Dinamik ağırlıklandırma ({market_regime} rejimi) uygulandı")
            return adjusted_weights
            
        except Exception as e:
            logger.error(f"❌ Dinamik ağırlıklandırma hatası: {e}")
            return self.optimize_weights()
    
    async def predict_ensemble(self, X: np.ndarray, symbol: str, 
                             market_regime: str = "normal") -> EnsembleResult:
        """Ensemble tahmin yap"""
        try:
            if not self.models:
                raise ValueError("Hiç model yok")
            
            # Get optimized weights
            weights = self.dynamic_weighting(market_regime)
            
            # Individual predictions
            predictions = {}
            for name, model in self.models.items():
                if hasattr(model, 'predict'):
                    try:
                        pred = model.predict(X)
                        predictions[name] = pred
                    except Exception as e:
                        logger.warning(f"⚠️ {name} model tahmin hatası: {e}")
                        predictions[name] = np.zeros(X.shape[0])
            
            # Weighted ensemble prediction
            if predictions:
                ensemble_pred = np.zeros(X.shape[0])
                total_weight = 0
                
                for name, pred in predictions.items():
                    if name in weights:
                        weight = weights[name]
                        ensemble_pred += pred * weight
                        total_weight += weight
                
                if total_weight > 0:
                    ensemble_pred /= total_weight
                
                # Calculate confidence based on model agreement
                confidence = self._calculate_confidence(predictions, weights)
                
                # Performance metrics
                performance_metrics = {
                    'model_count': len(predictions),
                    'weighted_models': len([w for w in weights.values() if w > 0.01]),
                    'confidence': confidence
                }
                
                result = EnsembleResult(
                    symbol=symbol,
                    timestamp=datetime.now(),
                    prediction=ensemble_pred[-1] if len(ensemble_pred) > 0 else 0.0,
                    confidence=confidence,
                    model_weights=weights,
                    performance_metrics=performance_metrics,
                    ensemble_type="weighted_ensemble"
                )
                
                logger.info(f"✅ {symbol} için ensemble tahmin tamamlandı")
                return result
            else:
                raise ValueError("Hiç tahmin yapılamadı")
                
        except Exception as e:
            logger.error(f"❌ Ensemble tahmin hatası: {e}")
            return None
    
    def _calculate_confidence(self, predictions: Dict[str, np.ndarray], 
                            weights: Dict[str, float]) -> float:
        """Tahmin güven skoru hesapla"""
        try:
            if not predictions:
                return 0.0
            
            # Calculate prediction variance
            pred_array = np.array(list(predictions.values()))
            pred_variance = np.var(pred_array, axis=0)
            
            # Calculate weighted variance
            weighted_variance = 0
            total_weight = 0
            
            for name, weight in weights.items():
                if name in predictions:
                    weighted_variance += weight * pred_variance[-1] if len(pred_variance) > 0 else 0
                    total_weight += weight
            
            if total_weight > 0:
                weighted_variance /= total_weight
            
            # Convert variance to confidence (0-1)
            # Lower variance = higher confidence
            confidence = max(0.1, 1.0 - min(weighted_variance, 1.0))
            
            return confidence
            
        except Exception as e:
            logger.warning(f"Güven skoru hesaplama hatası: {e}")
            return 0.5
    
    def get_ensemble_summary(self) -> Dict[str, Any]:
        """Ensemble özeti"""
        try:
            summary = {
                'total_models': len(self.models),
                'trained_models': sum(1 for m in self.models.values() if hasattr(m, 'is_trained') and m.is_trained),
                'ensemble_type': 'stacking' if self.ensemble else 'weighted',
                'last_optimization': self.last_optimization.isoformat() if self.last_optimization else None,
                'performance_history': len(self.performance_history),
                'config': {
                    'stacking_enabled': self.config.stacking_enabled,
                    'dynamic_weighting': self.config.dynamic_weighting,
                    'model_diversity': self.config.model_diversity
                }
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"❌ Ensemble özet hatası: {e}")
            return {}

# Test fonksiyonu
async def test_advanced_ensemble_optimizer():
    """Advanced Ensemble Optimizer'ı test et"""
    logger.info("🧪 Advanced Ensemble Optimizer Test Başlıyor...")
    
    # Test data oluştur
    symbol = "GARAN.IS"
    
    try:
        # Yahoo Finance'den test verisi çek
        ticker = yf.Ticker(symbol)
        data = ticker.history(period="100d")
        
        if data.empty:
            logger.error("❌ Test verisi çekilemedi")
            return None
        
        logger.info(f"✅ Test verisi çekildi: {len(data)} gün")
        
        # Feature engineering (simplified)
        data['Returns'] = data['Close'].pct_change()
        data['Volume_MA'] = data['Volume'].rolling(20).mean()
        data['Price_MA'] = data['Close'].rolling(20).mean()
        data['Volatility'] = data['Returns'].rolling(20).std()
        
        # Create features
        features = ['Volume_MA', 'Price_MA', 'Volatility']
        X = data[features].dropna().values
        y = data['Returns'].dropna().values
        
        # Align data
        min_len = min(len(X), len(y))
        X = X[:min_len]
        y = y[:min_len]
        
        if len(X) < 50:
            logger.error("❌ Yeterli veri yok")
            return None
        
        logger.info(f"✅ Feature matrix oluşturuldu: {X.shape}")
        
        # Advanced Ensemble Optimizer oluştur
        config = EnsembleConfig(
            stacking_enabled=True,
            dynamic_weighting=True,
            model_diversity=True,
            cross_validation_folds=5,
            time_series_split=True,
            performance_threshold=0.7
        )
        
        optimizer = AdvancedEnsembleOptimizer(config)
        
        # Modelleri eğit
        await optimizer.train_all_models(X, y)
        
        # Ensemble özeti
        summary = optimizer.get_ensemble_summary()
        logger.info(f"📊 Ensemble Özeti:")
        for key, value in summary.items():
            logger.info(f"   {key}: {value}")
        
        # Ensemble tahmin
        market_regime = "normal"
        ensemble_result = await optimizer.predict_ensemble(X, symbol, market_regime)
        
        if ensemble_result:
            logger.info(f"📊 {symbol} Ensemble Tahmin Sonuçları:")
            logger.info(f"   Tahmin: {ensemble_result.prediction:.6f}")
            logger.info(f"   Güven: {ensemble_result.confidence:.4f}")
            logger.info(f"   Ensemble Tipi: {ensemble_result.ensemble_type}")
            logger.info(f"   Model Ağırlıkları:")
            for model, weight in ensemble_result.model_weights.items():
                logger.info(f"     {model}: {weight:.4f}")
            logger.info(f"   Performans Metrikleri:")
            for metric, value in ensemble_result.performance_metrics.items():
                logger.info(f"     {metric}: {value}")
            
            return ensemble_result
        else:
            logger.error("❌ Ensemble tahmin başarısız")
            return None
            
    except Exception as e:
        logger.error(f"❌ Test hatası: {e}")
        return None

if __name__ == "__main__":
    # Test çalıştır
    asyncio.run(test_advanced_ensemble_optimizer())
