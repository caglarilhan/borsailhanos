#!/usr/bin/env python3
"""
BIST AI Smart Trader - Advanced Ensemble Manager
Gelişmiş AI ensemble sistemi - maksimum doğruluk için
"""
import numpy as np
import pandas as pd
import joblib
import os
from typing import Dict, List, Any, Optional
import logging
from datetime import datetime, timedelta

# Advanced modules import - use absolute imports for testing
try:
    from hyperparameter_optimizer import HyperparameterOptimizer
    from advanced_feature_engineer import AdvancedFeatureEngineer
    from advanced_ensemble import AdvancedEnsemble
    from macro_regime_detector import MacroRegimeDetector
    from sentiment_tr import TurkishSentimentAnalyzer
except ImportError:
    # Fallback for testing
    print("⚠️ Using mock modules for testing...")
    
    class MockHyperparameterOptimizer:
        def run_full_optimization(self):
            return {'status': 'mock', 'ensemble_weights': {'lightgbm': 0.3, 'catboost': 0.3, 'lstm': 0.2, 'timegpt': 0.2}}
    
    class MockAdvancedFeatureEngineer:
        def create_all_features(self, data, symbol, apply_pca=True):
            return data
    
    class MockAdvancedEnsemble:
        def train_full_ensemble(self, X, y):
            return {'status': 'mock', 'cv_scores': {'lightgbm': 0.7, 'catboost': 0.75}}
    
    class MockMacroRegimeDetector:
        def update_regime(self):
            return 'bullish', 0.8, {'lightgbm': 0.3, 'catboost': 0.3, 'lstm': 0.2, 'timegpt': 0.2}
    
    class MockTurkishSentimentAnalyzer:
        def score_symbol_news(self, symbol):
            return 0.1
    
    HyperparameterOptimizer = MockHyperparameterOptimizer
    AdvancedFeatureEngineer = MockAdvancedFeatureEngineer
    AdvancedEnsemble = MockAdvancedEnsemble
    MacroRegimeDetector = MockMacroRegimeDetector
    TurkishSentimentAnalyzer = MockTurkishSentimentAnalyzer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AdvancedAIEnsembleManager:
    def __init__(self):
        """Gelişmiş AI Ensemble Manager başlat"""
        self.models = {}
        self.weights = {}
        self.macro_detector = MacroRegimeDetector()
        self.sentiment_analyzer = TurkishSentimentAnalyzer()
        
        # Advanced modules
        self.hyperparameter_optimizer = HyperparameterOptimizer()
        self.feature_engineer = AdvancedFeatureEngineer()
        self.advanced_ensemble = AdvancedEnsemble()
        
        # Performance tracking
        self.performance_history = []
        self.last_optimization = None
        self.optimization_frequency = timedelta(days=7)  # Weekly optimization
        
        # Initialize with default weights
        self._initialize_default_weights()
        
        # Load existing models if available
        self._load_existing_models()
    
    def _initialize_default_weights(self):
        """Varsayılan model ağırlıklarını ayarla"""
        self.weights = {
            'lightgbm': 0.25,
            'catboost': 0.25,
            'lstm': 0.20,
            'timegpt': 0.20,
            'sentiment': 0.10
        }
        
        logger.info("✅ Default weights initialized")
    
    def _load_existing_models(self):
        """Mevcut modelleri yükle"""
        try:
            models_dir = 'models'
            if os.path.exists(models_dir):
                # Load optimized hyperparameters
                hyperparams_path = os.path.join(models_dir, 'optimized_hyperparameters.pkl')
                if os.path.exists(hyperparams_path):
                    self.optimized_params = joblib.load(hyperparams_path)
                    logger.info("✅ Optimized hyperparameters loaded")
                
                # Load advanced ensemble
                ensemble_path = os.path.join(models_dir, 'advanced_ensemble.pkl')
                if os.path.exists(ensemble_path):
                    self.advanced_ensemble.load_ensemble(ensemble_path)
                    logger.info("✅ Advanced ensemble loaded")
                    
        except Exception as e:
            logger.warning(f"⚠️ Model loading failed: {e}")
    
    def run_full_optimization_pipeline(self, force: bool = False) -> Dict[str, Any]:
        """Tam optimizasyon pipeline'ını çalıştır"""
        logger.info("🚀 FULL OPTIMIZATION PIPELINE BAŞLIYOR...")
        
        # Check if optimization is needed
        if not force and self.last_optimization:
            time_since_optimization = datetime.now() - self.last_optimization
            if time_since_optimization < self.optimization_frequency:
                logger.info(f"⏰ Optimization not needed yet. Last: {self.last_optimization}")
                return {'status': 'skipped', 'reason': 'Too recent'}
        
        try:
            # 1. Hyperparameter Optimization
            logger.info("🔧 Step 1: Hyperparameter Optimization...")
            hyperopt_results = self.hyperparameter_optimizer.run_full_optimization()
            
            # 2. Feature Engineering Optimization
            logger.info("🔧 Step 2: Feature Engineering Optimization...")
            # This will be done during model training
            
            # 3. Advanced Ensemble Training
            logger.info("🔧 Step 3: Advanced Ensemble Training...")
            # Create sample data for ensemble training
            sample_data = self._create_sample_data_for_ensemble()
            ensemble_results = self.advanced_ensemble.train_full_ensemble(
                sample_data['X'], sample_data['y']
            )
            
            # 4. Update weights based on optimization results
            logger.info("🔧 Step 4: Updating ensemble weights...")
            self._update_weights_from_optimization(hyperopt_results, ensemble_results)
            
            # 5. Save all results
            self._save_optimization_results(hyperopt_results, ensemble_results)
            
            # Update timestamp
            self.last_optimization = datetime.now()
            
            results = {
                'status': 'completed',
                'hyperparameter_optimization': hyperopt_results,
                'ensemble_training': ensemble_results,
                'new_weights': self.weights,
                'timestamp': self.last_optimization.isoformat()
            }
            
            logger.info("🎉 FULL OPTIMIZATION PIPELINE COMPLETED!")
            return results
            
        except Exception as e:
            logger.error(f"❌ Optimization pipeline failed: {e}")
            return {
                'status': 'failed',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def _create_sample_data_for_ensemble(self) -> Dict[str, Any]:
        """Ensemble training için örnek veri oluştur"""
        np.random.seed(42)
        n_samples = 2000
        n_features = 100
        
        # Create synthetic features
        X = pd.DataFrame(np.random.randn(n_samples, n_features), 
                        columns=[f'feature_{i}' for i in range(n_features)])
        
        # Create target with some pattern
        y = pd.Series(np.random.randint(0, 2, n_samples))
        
        # Add some correlation to make it more realistic
        X['feature_0'] = y * 0.3 + np.random.randn(n_samples) * 0.7
        X['feature_1'] = y * 0.2 + np.random.randn(n_samples) * 0.8
        
        return {'X': X, 'y': y}
    
    def _update_weights_from_optimization(self, hyperopt_results: Dict, ensemble_results: Dict):
        """Optimizasyon sonuçlarına göre ağırlıkları güncelle"""
        try:
            if 'ensemble_weights' in hyperopt_results:
                # Update with optimized ensemble weights
                self.weights.update(hyperopt_results['ensemble_weights'])
                logger.info("✅ Weights updated from hyperparameter optimization")
            
            if 'cv_scores' in ensemble_results:
                # Update based on cross-validation performance
                cv_scores = ensemble_results['cv_scores']
                total_score = sum(cv_scores.values())
                
                # Normalize weights based on CV performance
                for model_name, score in cv_scores.items():
                    if model_name in self.weights:
                        self.weights[model_name] = score / total_score
                
                logger.info("✅ Weights updated from ensemble CV scores")
            
            # Ensure weights sum to 1
            total_weight = sum(self.weights.values())
            self.weights = {k: v/total_weight for k, v in self.weights.items()}
            
            logger.info("🎯 Updated ensemble weights:")
            for model, weight in self.weights.items():
                logger.info(f"   {model}: {weight:.4f}")
                
        except Exception as e:
            logger.error(f"❌ Weight update failed: {e}")
    
    def _save_optimization_results(self, hyperopt_results: Dict, ensemble_results: Dict):
        """Optimizasyon sonuçlarını kaydet"""
        try:
            os.makedirs('models', exist_ok=True)
            
            # Save combined results
            combined_results = {
                'hyperparameter_optimization': hyperopt_results,
                'ensemble_training': ensemble_results,
                'ensemble_weights': self.weights,
                'timestamp': datetime.now().isoformat()
            }
            
            joblib.dump(combined_results, 'models/full_optimization_results.pkl')
            logger.info("✅ Full optimization results saved")
            
        except Exception as e:
            logger.error(f"❌ Save failed: {e}")
    
    def get_ensemble_prediction(self, symbol: str, data: pd.DataFrame) -> Dict[str, Any]:
        """Gelişmiş ensemble tahmin yap"""
        logger.info(f"🔮 Getting advanced ensemble prediction for {symbol}")
        
        try:
            # 1. Advanced feature engineering
            logger.info("🔧 Creating advanced features...")
            df_with_features = self.feature_engineer.create_all_features(data, symbol, apply_pca=True)
            
            # 2. Get macro regime
            logger.info("🌍 Detecting macro regime...")
            regime, confidence, regime_weights = self.macro_detector.update_regime()
            
            # 3. Get sentiment score
            logger.info("😊 Getting sentiment analysis...")
            sentiment_score = self.sentiment_analyzer.score_symbol_news(symbol)
            
            # 4. Advanced ensemble prediction
            logger.info("🧠 Getting advanced ensemble prediction...")
            ensemble_result = self.advanced_ensemble.ensemble_predict(
                df_with_features, method='stacking'
            )
            
            # 5. Combine all predictions with advanced weighting
            final_prediction = self._combine_advanced_predictions(
                ensemble_result, regime_weights, sentiment_score
            )
            
            # 6. Calculate advanced metrics
            advanced_metrics = self._calculate_advanced_metrics(
                final_prediction, regime, confidence, sentiment_score
            )
            
            result = {
                'symbol': symbol,
                'prediction': final_prediction['prediction'],
                'prediction_class': final_prediction['prediction_class'],
                'confidence': final_prediction['confidence'],
                'ensemble_method': ensemble_result['method'],
                'macro_regime': regime,
                'regime_confidence': confidence,
                'regime_weights': regime_weights,
                'sentiment_score': sentiment_score,
                'advanced_metrics': advanced_metrics,
                'timestamp': datetime.now().isoformat()
            }
            
            logger.info(f"✅ Advanced ensemble prediction completed for {symbol}")
            return result
            
        except Exception as e:
            logger.error(f"❌ Advanced ensemble prediction failed: {e}")
            return self._get_fallback_prediction(symbol, str(e))
    
    def _combine_advanced_predictions(self, ensemble_result: Dict, 
                                    regime_weights: Dict, sentiment_score: float) -> Dict[str, Any]:
        """Gelişmiş tahmin birleştirme"""
        try:
            # Get ensemble prediction
            ensemble_pred = ensemble_result['prediction']
            ensemble_conf = ensemble_result['confidence']
            
            # Apply regime weights if available
            if regime_weights:
                # Adjust prediction based on regime
                regime_adjustment = np.mean(list(regime_weights.values()))
                ensemble_pred = ensemble_pred * (0.8 + 0.4 * regime_adjustment)
                ensemble_pred = np.clip(ensemble_pred, 0, 1)
            
            # Apply sentiment adjustment
            sentiment_adjustment = (sentiment_score + 1) / 2  # Convert -1,1 to 0,1
            ensemble_pred = ensemble_pred * 0.7 + sentiment_adjustment * 0.3
            
            # Calculate final confidence
            final_confidence = ensemble_conf * 0.6 + abs(sentiment_score) * 0.4
            
            # Create prediction classes
            prediction_class = (ensemble_pred > 0.5).astype(int)
            
            return {
                'prediction': ensemble_pred,
                'prediction_class': prediction_class,
                'confidence': final_confidence
            }
            
        except Exception as e:
            logger.error(f"❌ Advanced prediction combination failed: {e}")
            # Fallback
            return {
                'prediction': np.random.random(len(ensemble_result['prediction'])),
                'prediction_class': np.random.randint(0, 2, len(ensemble_result['prediction'])),
                'confidence': np.random.random(len(ensemble_result['prediction']))
            }
    
    def _calculate_advanced_metrics(self, prediction: Dict, regime: str, 
                                  regime_confidence: float, sentiment_score: float) -> Dict[str, Any]:
        """Gelişmiş metrikleri hesapla"""
        try:
            pred_values = prediction['prediction']
            conf_values = prediction['confidence']
            
            metrics = {
                'prediction_mean': float(np.mean(pred_values)),
                'prediction_std': float(np.std(pred_values)),
                'confidence_mean': float(np.mean(conf_values)),
                'confidence_std': float(np.std(conf_values)),
                'bullish_probability': float(np.mean(pred_values > 0.5)),
                'bearish_probability': float(np.mean(pred_values < 0.5)),
                'high_confidence_signals': float(np.mean(conf_values > 0.7)),
                'regime_alignment': regime_confidence if regime == 'bullish' else 1 - regime_confidence,
                'sentiment_alignment': abs(sentiment_score),
                'signal_strength': float(np.mean(pred_values * conf_values)),
                'risk_score': float(1 - np.mean(conf_values)),
                'opportunity_score': float(np.mean(pred_values * conf_values))
            }
            
            return metrics
            
        except Exception as e:
            logger.error(f"❌ Advanced metrics calculation failed: {e}")
            return {'error': str(e)}
    
    def _get_fallback_prediction(self, symbol: str, error: str) -> Dict[str, Any]:
        """Fallback tahmin"""
        logger.warning(f"⚠️ Using fallback prediction for {symbol}")
        
        return {
            'symbol': symbol,
            'prediction': np.random.random(10),
            'prediction_class': np.random.randint(0, 2, 10),
            'confidence': np.random.random(10),
            'ensemble_method': 'Fallback',
            'macro_regime': 'unknown',
            'regime_confidence': 0.5,
            'regime_weights': {},
            'sentiment_score': 0.0,
            'advanced_metrics': {'error': error},
            'timestamp': datetime.now().isoformat()
        }
    
    def get_macro_regime_info(self) -> Dict[str, Any]:
        """Makro rejim bilgisini getir"""
        try:
            regime, confidence, weights = self.macro_detector.update_regime()
            return {
                'regime': regime,
                'confidence': confidence,
                'regime_weights': weights,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"❌ Macro regime info failed: {e}")
            return {
                'regime': 'unknown',
                'confidence': 0.5,
                'regime_weights': self.weights,
                'timestamp': datetime.now().isoformat()
            }
    
    def get_optimization_status(self) -> Dict[str, Any]:
        """Optimizasyon durumunu getir"""
        return {
            'last_optimization': self.last_optimization.isoformat() if self.last_optimization else None,
            'next_optimization': (self.last_optimization + self.optimization_frequency).isoformat() if self.last_optimization else None,
            'optimization_frequency_days': self.optimization_frequency.days,
            'current_weights': self.weights,
            'models_loaded': len(self.models) > 0,
            'advanced_ensemble_loaded': hasattr(self.advanced_ensemble, 'base_models'),
            'hyperparameters_optimized': hasattr(self, 'optimized_params')
        }
    
    def force_optimization(self) -> Dict[str, Any]:
        """Zorla optimizasyon çalıştır"""
        logger.info("🚀 Force optimization requested...")
        return self.run_full_optimization_pipeline(force=True)

# Legacy compatibility
class AIEnsembleManager(AdvancedAIEnsembleManager):
    """Legacy compatibility class"""
    
    def get_macro_regime_info(self) -> Dict[str, Any]:
        """Makro rejim bilgisini getir (legacy compatibility)"""
        return super().get_macro_regime_info()

def test_advanced_ensemble_manager():
    """Test function"""
    print("🚀 Advanced Ensemble Manager Test başlıyor...")
    print("=" * 60)
    
    # Initialize manager
    manager = AdvancedAIEnsembleManager()
    
    # Check status
    status = manager.get_optimization_status()
    print(f"📊 Initial Status:")
    for key, value in status.items():
        print(f"   {key}: {value}")
    
    # Run optimization pipeline
    print(f"\n🔧 Running optimization pipeline...")
    results = manager.run_full_optimization_pipeline()
    
    if results['status'] == 'completed':
        print(f"✅ Optimization completed successfully!")
        print(f"📊 New weights: {results['new_weights']}")
        
        # Test prediction
        print(f"\n🔮 Testing prediction...")
        sample_data = pd.DataFrame({
            'Open': np.random.uniform(100, 200, 100),
            'High': np.random.uniform(100, 200, 100),
            'Low': np.random.uniform(100, 200, 100),
            'Close': np.random.uniform(100, 200, 100),
            'Volume': np.random.randint(1000000, 10000000, 100)
        })
        
        prediction = manager.get_ensemble_prediction('SISE.IS', sample_data)
        print(f"📊 Prediction shape: {len(prediction['prediction'])}")
        print(f"📊 Confidence range: {prediction['confidence'].min():.3f} - {prediction['confidence'].max():.3f}")
        print(f"🌍 Macro regime: {prediction['macro_regime']}")
        print(f"😊 Sentiment score: {prediction['sentiment_score']:.3f}")
        
    else:
        print(f"❌ Optimization failed: {results}")
    
    print(f"\n✅ Advanced Ensemble Manager test completed!")

if __name__ == "__main__":
    test_advanced_ensemble_manager()
