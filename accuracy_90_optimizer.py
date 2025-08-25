#!/usr/bin/env python3
"""
🚀 Accuracy 90% Optimizer - SPRINT 7-8
BIST AI Smart Trader v2.0 - %90 Doğruluk Hedefi

Tüm advanced modülleri entegre ederek doğruluğu %80'den %90'a çıkarma:
- Deep Learning Models (LSTM + Transformer)
- Advanced Feature Optimization
- Market Regime Detection
- Ensemble Diversity Enhancement
- Adaptive Learning Systems
"""

import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
import warnings
warnings.filterwarnings('ignore')

# Import our advanced modules
try:
    from advanced_deep_learning_models import AdvancedDeepLearningOptimizer, DeepLearningConfig
    from advanced_feature_optimization import AdvancedFeatureOptimizer, FeatureOptimizationConfig
    from market_regime_detector import MarketRegimeDetector, MarketRegimeConfig
    MODULES_AVAILABLE = True
except ImportError as e:
    MODULES_AVAILABLE = False
    logging.warning(f"⚠️ Advanced modules bulunamadı: {e}")

# Scikit-learn imports
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.model_selection import TimeSeriesSplit, cross_val_score
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, VotingRegressor
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.svm import SVR
from sklearn.neural_network import MLPRegressor

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class Accuracy90Config:
    """%90 accuracy için konfigürasyon"""
    target_accuracy: float = 0.90
    current_accuracy: float = 0.80
    accuracy_gap: float = 0.10
    max_iterations: int = 10
    convergence_threshold: float = 0.001
    ensemble_size: int = 5
    cross_validation_folds: int = 5
    feature_selection_methods: List[str] = None
    deep_learning_enabled: bool = True
    regime_detection_enabled: bool = True
    adaptive_learning_enabled: bool = True

@dataclass
class OptimizationResult:
    """Optimization sonucu"""
    iteration: int
    accuracy: float
    improvement: float
    method_used: str
    features_count: int
    models_count: int
    training_time: float
    timestamp: datetime

class Accuracy90Optimizer:
    """%90 accuracy optimizer - Ana entegrasyon modülü"""
    
    def __init__(self, config: Accuracy90Config):
        self.config = config
        self.scaler = StandardScaler()
        self.optimization_history = []
        self.best_accuracy = config.current_accuracy
        self.best_config = None
        
        # Initialize advanced modules
        self.deep_learning_optimizer = None
        self.feature_optimizer = None
        self.regime_detector = None
        
        if MODULES_AVAILABLE:
            self._initialize_advanced_modules()
        
        logger.info("🚀 Accuracy 90% Optimizer başlatıldı")
        logger.info(f"🎯 Hedef: %{self.config.target_accuracy * 100}")
        logger.info(f"📍 Mevcut: %{self.config.current_accuracy * 100}")
        logger.info(f"📏 Gap: %{self.config.accuracy_gap * 100}")
    
    def _initialize_advanced_modules(self):
        """Advanced modülleri başlat"""
        try:
            # Deep Learning Optimizer
            dl_config = DeepLearningConfig(
                lstm_hidden_size=128,
                lstm_num_layers=3,
                transformer_d_model=64,
                transformer_nhead=8,
                epochs=100
            )
            self.deep_learning_optimizer = AdvancedDeepLearningOptimizer(dl_config)
            
            # Feature Optimizer
            fo_config = FeatureOptimizationConfig(
                target_accuracy=0.90,
                min_features=15,
                max_features=80,
                n_trials=100
            )
            self.feature_optimizer = AdvancedFeatureOptimizer(fo_config)
            
            # Regime Detector
            mr_config = MarketRegimeConfig(
                n_regimes=3,
                lookback_period=252,
                volatility_window=20
            )
            self.regime_detector = MarketRegimeDetector(mr_config)
            
            logger.info("✅ Advanced modüller başlatıldı")
            
        except Exception as e:
            logger.error(f"❌ Advanced modül başlatma hatası: {e}")
    
    def create_diverse_ensemble(self, X: np.ndarray, y: np.ndarray) -> VotingRegressor:
        """Diverse ensemble model oluştur"""
        try:
            # Base models with different algorithms
            models = [
                ('random_forest', RandomForestRegressor(
                    n_estimators=200, max_depth=15, random_state=42
                )),
                ('gradient_boosting', GradientBoostingRegressor(
                    n_estimators=200, max_depth=8, learning_rate=0.1, random_state=42
                )),
                ('ridge', Ridge(alpha=1.0)),
                ('lasso', Lasso(alpha=0.1)),
                ('svr', SVR(kernel='rbf', C=100, gamma='scale')),
                ('mlp', MLPRegressor(
                    hidden_layer_sizes=(100, 50), max_iter=500, random_state=42
                ))
            ]
            
            # Create voting regressor
            ensemble = VotingRegressor(
                estimators=models[:self.config.ensemble_size],
                weights=None  # Equal weights initially
            )
            
            logger.info(f"✅ Diverse ensemble oluşturuldu: {len(models[:self.config.ensemble_size])} model")
            return ensemble
            
        except Exception as e:
            logger.error(f"❌ Ensemble oluşturma hatası: {e}")
            return None
    
    def optimize_features_iteratively(self, data: pd.DataFrame, target_col: str) -> Tuple[List[str], float]:
        """Iterative feature optimization"""
        try:
            if self.feature_optimizer is None:
                logger.warning("⚠️ Feature optimizer bulunamadı")
                return [], 0.0
            
            best_features = []
            best_accuracy = 0.0
            
            # Multiple feature selection methods
            methods = ['hybrid', 'importance_only', 'rfe_only']
            
            for method in methods:
                logger.info(f"🔍 Feature optimization: {method}")
                
                # Create feature set
                feature_set = self.feature_optimizer.create_optimized_feature_set(
                    data, target_col, method
                )
                
                if feature_set:
                    # Evaluate
                    success = self.feature_optimizer.evaluate_feature_set(
                        data, feature_set, target_col
                    )
                    
                    if success and feature_set.accuracy > best_accuracy:
                        best_accuracy = feature_set.accuracy
                        best_features = feature_set.features
                        
                        logger.info(f"✅ Yeni best accuracy: {best_accuracy:.4f}")
                        logger.info(f"   Features: {len(best_features)}")
            
            return best_features, best_accuracy
            
        except Exception as e:
            logger.error(f"❌ Feature optimization hatası: {e}")
            return [], 0.0
    
    def train_deep_learning_models(self, data: pd.DataFrame, target_col: str) -> bool:
        """Deep learning modelleri eğit"""
        try:
            if self.deep_learning_optimizer is None:
                logger.warning("⚠️ Deep learning optimizer bulunamadı")
                return False
            
            # Prepare data for deep learning
            X_tensor, y_tensor = self.deep_learning_optimizer.prepare_data(
                data, target_col, sequence_length=60
            )
            
            if X_tensor is None or y_tensor is None:
                logger.warning("⚠️ Deep learning data hazırlanamadı")
                return False
            
            # Train LSTM
            logger.info("🧠 LSTM modeli eğitiliyor...")
            lstm_success = self.deep_learning_optimizer.train_lstm_model(
                X_tensor, y_tensor, "LSTM_Accuracy90"
            )
            
            # Train Transformer
            logger.info("🧠 Transformer modeli eğitiliyor...")
            transformer_success = self.deep_learning_optimizer.train_transformer_model(
                X_tensor, y_tensor, "Transformer_Accuracy90"
            )
            
            return lstm_success or transformer_success
            
        except Exception as e:
            logger.error(f"❌ Deep learning eğitim hatası: {e}")
            return False
    
    def detect_market_regime(self, data: pd.DataFrame, market_data: pd.DataFrame = None) -> Optional[Dict]:
        """Market regime detection"""
        try:
            if self.regime_detector is None:
                logger.warning("⚠️ Regime detector bulunamadı")
                return None
            
            # Regime analysis
            analysis = self.regime_detector.get_regime_analysis(data, market_data)
            
            if analysis:
                return {
                    'regime_name': analysis.current_regime.regime_name,
                    'confidence': analysis.confidence,
                    'model_weights': analysis.current_regime.model_weights,
                    'volatility_regime': analysis.volatility_regime,
                    'macro_regime': analysis.macro_regime
                }
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Regime detection hatası: {e}")
            return None
    
    def adaptive_ensemble_weights(self, base_weights: Dict[str, float], 
                                 regime_info: Dict = None) -> Dict[str, float]:
        """Adaptive ensemble weights"""
        try:
            # Base weights
            weights = base_weights.copy()
            
            # Regime-based adjustments
            if regime_info:
                regime_name = regime_info.get('regime_name', 'Unknown')
                confidence = regime_info.get('confidence', 0.5)
                
                if regime_name == 'Bear':
                    # Emphasize technical and LSTM models in bear market
                    weights['technical'] = min(weights.get('technical', 0.2) * 1.5, 0.4)
                    weights['lstm'] = min(weights.get('lstm', 0.25) * 1.3, 0.35)
                    
                elif regime_name == 'Bull':
                    # Emphasize transformer and ensemble models in bull market
                    weights['transformer'] = min(weights.get('transformer', 0.25) * 1.5, 0.4)
                    weights['ensemble'] = min(weights.get('ensemble', 0.3) * 1.2, 0.4)
                    
                elif regime_name == 'Volatile':
                    # Balanced approach in volatile market
                    weights['ensemble'] = min(weights.get('ensemble', 0.3) * 1.3, 0.4)
                    weights['lstm'] = min(weights.get('lstm', 0.25) * 1.2, 0.35)
                
                # Confidence-based adjustments
                if confidence > 0.8:
                    # High confidence: emphasize regime-specific models
                    pass
                else:
                    # Low confidence: more balanced weights
                    for key in weights:
                        weights[key] = 1.0 / len(weights)
            
            # Normalize weights
            total_weight = sum(weights.values())
            normalized_weights = {k: v/total_weight for k, v in weights.items()}
            
            return normalized_weights
            
        except Exception as e:
            logger.error(f"❌ Adaptive weights hatası: {e}")
            return base_weights
    
    def optimize_for_accuracy_90(self, data: pd.DataFrame, target_col: str = 'Close',
                                market_data: pd.DataFrame = None) -> Dict[str, Any]:
        """Ana optimization loop - %90 accuracy için"""
        try:
            logger.info("🚀 %90 Accuracy Optimization Başlıyor...")
            
            start_time = datetime.now()
            current_accuracy = self.config.current_accuracy
            iteration = 0
            
            while (current_accuracy < self.config.target_accuracy and 
                   iteration < self.config.max_iterations):
                
                iteration += 1
                logger.info(f"🔄 Iteration {iteration}: Accuracy = {current_accuracy:.4f}")
                
                iteration_start = datetime.now()
                
                # 1. Feature Optimization
                logger.info("🔍 Feature optimization...")
                best_features, feature_accuracy = self.optimize_features_iteratively(data, target_col)
                
                if best_features and feature_accuracy > current_accuracy:
                    current_accuracy = feature_accuracy
                    logger.info(f"✅ Feature optimization: {current_accuracy:.4f}")
                    
                    # Update data with best features
                    data_optimized = data[best_features + [target_col]]
                else:
                    data_optimized = data
                
                # 2. Deep Learning Models
                if self.config.deep_learning_enabled:
                    logger.info("🧠 Deep learning optimization...")
                    dl_success = self.train_deep_learning_models(data_optimized, target_col)
                    
                    if dl_success:
                        # Get deep learning performance
                        dl_summary = self.deep_learning_optimizer.get_performance_summary()
                        dl_accuracy = dl_summary.get('overall_accuracy', 0.0)
                        
                        if dl_accuracy > current_accuracy:
                            current_accuracy = dl_accuracy
                            logger.info(f"✅ Deep learning: {current_accuracy:.4f}")
                
                # 3. Market Regime Detection
                regime_info = None
                if self.config.regime_detection_enabled:
                    logger.info("🔍 Market regime detection...")
                    regime_info = self.detect_market_regime(data_optimized, market_data)
                    
                    if regime_info:
                        logger.info(f"✅ Regime detected: {regime_info['regime_name']}")
                
                # 4. Ensemble Optimization
                logger.info("🔧 Ensemble optimization...")
                
                # Prepare data for ensemble
                feature_cols = [col for col in data_optimized.columns if col != target_col]
                X = data_optimized[feature_cols].fillna(0).values
                y = data_optimized[target_col].fillna(0).values
                
                # Create diverse ensemble
                ensemble = self.create_diverse_ensemble(X, y)
                
                if ensemble:
                    # Cross-validation
                    cv = TimeSeriesSplit(n_splits=self.config.cross_validation_folds)
                    cv_scores = cross_val_score(ensemble, X, y, cv=cv, scoring='r2')
                    ensemble_accuracy = np.mean(cv_scores)
                    
                    if ensemble_accuracy > current_accuracy:
                        current_accuracy = ensemble_accuracy
                        logger.info(f"✅ Ensemble optimization: {current_accuracy:.4f}")
                
                # 5. Adaptive Learning
                if self.config.adaptive_learning_enabled and regime_info:
                    logger.info("🔄 Adaptive learning...")
                    
                    # Adaptive weights
                    base_weights = {'lstm': 0.25, 'transformer': 0.25, 'ensemble': 0.3, 'technical': 0.2}
                    adaptive_weights = self.adaptive_ensemble_weights(base_weights, regime_info)
                    
                    logger.info("🔧 Adaptive weights:")
                    for model, weight in adaptive_weights.items():
                        logger.info(f"   {model}: {weight:.3f}")
                
                # Calculate improvement
                improvement = current_accuracy - self.best_accuracy
                
                # Record iteration result
                iteration_time = (datetime.now() - iteration_start).total_seconds()
                result = OptimizationResult(
                    iteration=iteration,
                    accuracy=current_accuracy,
                    improvement=improvement,
                    method_used="comprehensive",
                    features_count=len(best_features) if best_features else len(data.columns) - 1,
                    models_count=self.config.ensemble_size,
                    training_time=iteration_time,
                    timestamp=datetime.now()
                )
                
                self.optimization_history.append(result)
                
                # Update best accuracy
                if current_accuracy > self.best_accuracy:
                    self.best_accuracy = current_accuracy
                    self.best_config = {
                        'features': best_features,
                        'regime_info': regime_info,
                        'ensemble_size': self.config.ensemble_size
                    }
                
                # Check convergence
                if abs(improvement) < self.config.convergence_threshold:
                    logger.info("✅ Convergence reached")
                    break
                
                logger.info(f"📊 Iteration {iteration} tamamlandı:")
                logger.info(f"   Accuracy: {current_accuracy:.4f}")
                logger.info(f"   Improvement: {improvement:.4f}")
                logger.info(f"   Time: {iteration_time:.2f}s")
                
                # Early stopping if target reached
                if current_accuracy >= self.config.target_accuracy:
                    logger.info("🎯 Target accuracy reached!")
                    break
            
            # Final summary
            total_time = (datetime.now() - start_time).total_seconds()
            
            final_result = {
                'target_accuracy': self.config.target_accuracy,
                'final_accuracy': current_accuracy,
                'best_accuracy': self.best_accuracy,
                'accuracy_gap': self.config.target_accuracy - current_accuracy,
                'iterations': iteration,
                'total_time': total_time,
                'converged': current_accuracy >= self.config.target_accuracy,
                'best_config': self.best_config,
                'optimization_history': [
                    {
                        'iteration': r.iteration,
                        'accuracy': r.accuracy,
                        'improvement': r.improvement,
                        'method': r.method_used,
                        'time': r.training_time
                    }
                    for r in self.optimization_history
                ]
            }
            
            logger.info("=" * 60)
            logger.info("🎯 ACCURACY 90% OPTIMIZATION SONUÇLARI")
            logger.info("=" * 60)
            logger.info(f"📊 Final Accuracy: {current_accuracy:.4f}")
            logger.info(f"🏆 Best Accuracy: {self.best_accuracy:.4f}")
            logger.info(f"🎯 Target: {self.config.target_accuracy:.4f}")
            logger.info(f"📏 Gap: {final_result['accuracy_gap']:.4f}")
            logger.info(f"🔄 Iterations: {iteration}")
            logger.info(f"⏱️ Total Time: {total_time:.2f}s")
            logger.info(f"✅ Converged: {final_result['converged']}")
            
            if final_result['converged']:
                logger.info("🎉 HEDEF %90 DOĞRULUK BAŞARILI!")
            else:
                logger.info("⚠️ Hedef %90'a ulaşılamadı, daha fazla optimization gerekli")
            
            logger.info("=" * 60)
            
            return final_result
            
        except Exception as e:
            logger.error(f"❌ Accuracy optimization hatası: {e}")
            return {}
    
    def get_optimization_summary(self) -> Dict[str, Any]:
        """Optimization özeti"""
        try:
            summary = {
                'target_accuracy': self.config.target_accuracy,
                'current_accuracy': self.best_accuracy,
                'accuracy_gap': self.config.target_accuracy - self.best_accuracy,
                'total_iterations': len(self.optimization_history),
                'converged': self.best_accuracy >= self.config.target_accuracy,
                'best_config': self.best_config,
                'modules_available': MODULES_AVAILABLE
            }
            
            if self.optimization_history:
                # Performance trends
                accuracies = [r.accuracy for r in self.optimization_history]
                improvements = [r.improvement for r in self.optimization_history]
                
                summary['accuracy_trend'] = {
                    'start': accuracies[0] if accuracies else 0,
                    'end': accuracies[-1] if accuracies else 0,
                    'max': max(accuracies) if accuracies else 0,
                    'min': min(accuracies) if accuracies else 0
                }
                
                summary['improvement_summary'] = {
                    'total_improvement': sum(improvements),
                    'max_improvement': max(improvements) if improvements else 0,
                    'avg_improvement': np.mean(improvements) if improvements else 0
                }
            
            return summary
            
        except Exception as e:
            logger.error(f"❌ Optimization summary hatası: {e}")
            return {}

def main():
    """Test fonksiyonu"""
    logger.info("🚀 Accuracy 90% Optimizer Test Başlıyor...")
    
    # Config
    config = Accuracy90Config(
        target_accuracy=0.90,
        current_accuracy=0.80,
        max_iterations=5,
        ensemble_size=4
    )
    
    # Optimizer
    optimizer = Accuracy90Optimizer(config)
    
    # Test data oluştur
    np.random.seed(42)
    n_samples = 1000
    n_features = 25
    
    # Synthetic data with clear patterns
    X = np.random.randn(n_samples, n_features)
    
    # Add some correlations and patterns
    X[:, 1] = X[:, 0] * 0.8 + np.random.randn(n_samples) * 0.2
    X[:, 2] = X[:, 0] * 0.6 + np.random.randn(n_samples) * 0.4
    X[:, 3] = X[:, 1] * 0.7 + np.random.randn(n_samples) * 0.3
    
    # Target variable with clear relationship
    y = (X[:, 0] * 0.4 + X[:, 1] * 0.3 + X[:, 3] * 0.2 + 
         X[:, 5] * 0.1 + np.random.randn(n_samples) * 0.05)
    
    # DataFrame'e çevir
    feature_cols = [f'feature_{i}' for i in range(n_features)]
    data = pd.DataFrame(X, columns=feature_cols)
    data['Close'] = y
    
    # Market data (simulated)
    market_data = pd.DataFrame({
        'Close': [p * (1 + np.random.normal(0, 0.01)) for p in y]
    })
    
    logger.info(f"📊 Test data oluşturuldu: {data.shape}")
    
    # Run optimization
    logger.info("🚀 %90 Accuracy optimization başlıyor...")
    result = optimizer.optimize_for_accuracy_90(data, 'Close', market_data)
    
    if result:
        # Summary
        summary = optimizer.get_optimization_summary()
        logger.info("📋 Optimization Summary:")
        logger.info(f"   Target: {summary['target_accuracy']:.4f}")
        logger.info(f"   Achieved: {summary['current_accuracy']:.4f}")
        logger.info(f"   Gap: {summary['accuracy_gap']:.4f}")
        logger.info(f"   Converged: {summary['converged']}")
        logger.info(f"   Iterations: {summary['total_iterations']}")
        
        if summary['best_config']:
            best = summary['best_config']
            logger.info("🏆 Best Configuration:")
            logger.info(f"   Features: {len(best.get('features', []))}")
            if best.get('regime_info'):
                regime = best['regime_info']
                logger.info(f"   Regime: {regime['regime_name']}")
                logger.info(f"   Confidence: {regime['confidence']:.3f}")
    
    logger.info("✅ Test tamamlandı!")

if __name__ == "__main__":
    main()
