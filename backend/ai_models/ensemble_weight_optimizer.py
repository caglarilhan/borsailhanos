#!/usr/bin/env python3
"""
BIST AI Smart Trader - Ensemble Weight Optimizer
AI modellerinin ağırlıklarını Optuna ile optimize eder
"""

import optuna
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple
import logging
from sklearn.metrics import roc_auc_score, precision_score, recall_score, f1_score
import joblib
import os
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnsembleWeightOptimizer:
    """AI ensemble ağırlıklarını optimize eder"""
    
    def __init__(self, models_dir: str = "models/ensemble"):
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(parents=True, exist_ok=True)
        
        # Model ağırlık aralıkları
        self.weight_bounds = {
            'lightgbm': (0.1, 0.6),
            'catboost': (0.1, 0.6),
            'lstm': (0.05, 0.4),
            'timegpt': (0.05, 0.4),
            'technical': (0.05, 0.3),
            'sentiment': (0.02, 0.2),
            'macro': (0.02, 0.2)
        }
        
        # Optimizasyon parametreleri
        self.n_trials = 100
        self.timeout = 300  # 5 dakika
        
        logger.info("✅ Ensemble Weight Optimizer başlatıldı")
    
    def optimize_weights(self, training_data: pd.DataFrame, validation_data: pd.DataFrame) -> Dict[str, Any]:
        """Ensemble ağırlıklarını optimize et"""
        try:
            logger.info("🚀 Ensemble ağırlık optimizasyonu başlıyor...")
            
            # Optuna study oluştur
            study = optuna.create_study(
                direction='maximize',
                sampler=optuna.samplers.TPESampler(seed=42),
                pruner=optuna.pruners.MedianPruner()
            )
            
            # Objective function
            def objective(trial):
                weights = self._suggest_weights(trial)
                score = self._evaluate_weights(weights, training_data, validation_data)
                return score
            
            # Optimizasyon çalıştır
            study.optimize(
                objective,
                n_trials=self.n_trials,
                timeout=self.timeout,
                show_progress_bar=True
            )
            
            # En iyi sonuçları al
            best_weights = self._suggest_weights(study.best_trial)
            best_score = study.best_value
            
            # Sonuçları kaydet
            results = {
                'best_weights': best_weights,
                'best_score': best_score,
                'optimization_history': study.trials_dataframe().to_dict('records'),
                'n_trials': len(study.trials),
                'optimization_time': 0  # study.duration mevcut değil
            }
            
            self._save_optimization_results(results)
            
            logger.info(f"✅ Optimizasyon tamamlandı! En iyi skor: {best_score:.4f}")
            return results
            
        except Exception as e:
            logger.error(f"❌ Optimizasyon hatası: {e}")
            return {'error': str(e)}
    
    def _suggest_weights(self, trial: optuna.Trial) -> Dict[str, float]:
        """Trial için ağırlık önerisi yap"""
        weights = {}
        
        # Ana modeller
        weights['lightgbm'] = trial.suggest_float('lightgbm', *self.weight_bounds['lightgbm'])
        weights['catboost'] = trial.suggest_float('catboost', *self.weight_bounds['catboost'])
        weights['lstm'] = trial.suggest_float('lstm', *self.weight_bounds['lstm'])
        weights['timegpt'] = trial.suggest_float('timegpt', *self.weight_bounds['timegpt'])
        
        # Ek faktörler
        weights['technical'] = trial.suggest_float('technical', *self.weight_bounds['technical'])
        weights['sentiment'] = trial.suggest_float('sentiment', *self.weight_bounds['sentiment'])
        weights['macro'] = trial.suggest_float('macro', *self.weight_bounds['macro'])
        
        # Ağırlıkları normalize et (toplam = 1)
        total_weight = sum(weights.values())
        weights = {k: v / total_weight for k, v in weights.items()}
        
        return weights
    
    def _evaluate_weights(self, weights: Dict[str, float], 
                         training_data: pd.DataFrame, 
                         validation_data: pd.DataFrame) -> float:
        """Ağırlık kombinasyonunu değerlendir"""
        try:
            # Mock predictions (gerçek implementasyonda model predictions kullanılır)
            predictions = self._generate_mock_predictions(validation_data, weights)
            
            # Ground truth (gerçek implementasyonda validation_data'dan alınır)
            y_true = validation_data.get('target', np.random.randint(0, 2, len(validation_data)))
            
            # Metrikleri hesapla
            metrics = self._calculate_metrics(y_true, predictions)
            
            # Combined score (ROC-AUC + Precision + Recall + F1)
            combined_score = np.mean([
                metrics['roc_auc'],
                metrics['precision'],
                metrics['recall'],
                metrics['f1']
            ])
            
            return combined_score
            
        except Exception as e:
            logger.error(f"❌ Ağırlık değerlendirme hatası: {e}")
            return 0.0
    
    def _generate_mock_predictions(self, data: pd.DataFrame, weights: Dict[str, float]) -> np.ndarray:
        """Mock predictions oluştur (gerçek implementasyonda model predictions)"""
        n_samples = len(data)
        
        # Her model için mock prediction
        lightgbm_pred = np.random.random(n_samples) * weights['lightgbm']
        catboost_pred = np.random.random(n_samples) * weights['catboost']
        lstm_pred = np.random.random(n_samples) * weights['lstm']
        timegpt_pred = np.random.random(n_samples) * weights['timegpt']
        technical_pred = np.random.random(n_samples) * weights['technical']
        sentiment_pred = np.random.random(n_samples) * weights['sentiment']
        macro_pred = np.random.random(n_samples) * weights['macro']
        
        # Weighted ensemble
        ensemble_pred = (
            lightgbm_pred + catboost_pred + lstm_pred + timegpt_pred + 
            technical_pred + sentiment_pred + macro_pred
        )
        
        # Sigmoid activation
        ensemble_pred = 1 / (1 + np.exp(-ensemble_pred))
        
        return ensemble_pred
    
    def _calculate_metrics(self, y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
        """Metrikleri hesapla"""
        try:
            # Binary predictions
            y_pred_binary = (y_pred > 0.5).astype(int)
            
            metrics = {
                'roc_auc': roc_auc_score(y_true, y_pred),
                'precision': precision_score(y_true, y_pred_binary, zero_division=0),
                'recall': recall_score(y_true, y_pred_binary, zero_division=0),
                'f1': f1_score(y_true, y_pred_binary, zero_division=0)
            }
            
            return metrics
            
        except Exception as e:
            logger.error(f"❌ Metrik hesaplama hatası: {e}")
            return {
                'roc_auc': 0.0,
                'precision': 0.0,
                'recall': 0.0,
                'f1': 0.0
            }
    
    def _save_optimization_results(self, results: Dict[str, Any]):
        """Optimizasyon sonuçlarını kaydet"""
        try:
            timestamp = pd.Timestamp.now().strftime("%Y%m%d_%H%M%S")
            
            # Weights dosyası
            weights_file = self.models_dir / f"optimized_weights_{timestamp}.json"
            weights_data = {
                'weights': results['best_weights'],
                'score': results['best_score'],
                'timestamp': timestamp
            }
            
            with open(weights_file, 'w') as f:
                import json
                json.dump(weights_data, f, indent=2)
            
            # En güncel weights
            latest_weights = self.models_dir / "latest_weights.json"
            with open(latest_weights, 'w') as f:
                json.dump(weights_data, f, indent=2)
            
            # Full results
            results_file = self.models_dir / f"optimization_results_{timestamp}.pkl"
            joblib.dump(results, results_file)
            
            logger.info(f"✅ Optimizasyon sonuçları kaydedildi: {weights_file}")
            
        except Exception as e:
            logger.error(f"❌ Sonuç kaydetme hatası: {e}")
    
    def load_optimized_weights(self) -> Dict[str, float]:
        """En güncel optimize edilmiş ağırlıkları yükle"""
        try:
            latest_file = self.models_dir / "latest_weights.json"
            
            if not latest_file.exists():
                logger.warning("⚠️ Optimize edilmiş ağırlık bulunamadı, default kullanılıyor")
                return self._get_default_weights()
            
            with open(latest_file, 'r') as f:
                import json
                weights_data = json.load(f)
            
            return weights_data['weights']
            
        except Exception as e:
            logger.error(f"❌ Ağırlık yükleme hatası: {e}")
            return self._get_default_weights()
    
    def _get_default_weights(self) -> Dict[str, float]:
        """Default ağırlıkları döndür"""
        return {
            'lightgbm': 0.3,
            'catboost': 0.25,
            'lstm': 0.2,
            'timegpt': 0.15,
            'technical': 0.05,
            'sentiment': 0.03,
            'macro': 0.02
        }
    
    def get_optimization_summary(self) -> Dict[str, Any]:
        """Optimizasyon özeti"""
        try:
            latest_file = self.models_dir / "latest_weights.json"
            
            if not latest_file.exists():
                return {'error': 'Henüz optimizasyon yapılmamış'}
            
            with open(latest_file, 'r') as f:
                import json
                weights_data = json.load(f)
            
            return {
                'current_weights': weights_data['weights'],
                'best_score': weights_data['score'],
                'last_optimization': weights_data['timestamp'],
                'models_dir': str(self.models_dir)
            }
            
        except Exception as e:
            logger.error(f"❌ Özet alma hatası: {e}")
            return {'error': str(e)}

def test_ensemble_optimizer():
    """Test function"""
    print("🚀 Ensemble Weight Optimizer Test başlıyor...")
    print("=" * 60)
    
    optimizer = EnsembleWeightOptimizer()
    
    # Mock data oluştur
    n_samples = 1000
    training_data = pd.DataFrame({
        'feature1': np.random.randn(n_samples),
        'feature2': np.random.randn(n_samples),
        'target': np.random.randint(0, 2, n_samples)
    })
    
    validation_data = pd.DataFrame({
        'feature1': np.random.randn(n_samples // 2),
        'feature2': np.random.randn(n_samples // 2),
        'target': np.random.randint(0, 2, n_samples // 2)
    })
    
    print("📊 Mock data oluşturuldu")
    print(f"Training samples: {len(training_data)}")
    print(f"Validation samples: {len(validation_data)}")
    
    # Optimizasyon başlat
    print("\n🔄 Ensemble ağırlık optimizasyonu başlatılıyor...")
    results = optimizer.optimize_weights(training_data, validation_data)
    
    if 'error' not in results:
        print(f"✅ Optimizasyon tamamlandı!")
        print(f"🎯 En iyi skor: {results['best_score']:.4f}")
        print(f"📈 Toplam trial: {results['n_trials']}")
        print(f"⏱️ Süre: {results['optimization_time']:.2f} saniye")
        
        print(f"\n🏆 En iyi ağırlıklar:")
        for model, weight in results['best_weights'].items():
            print(f"  {model}: {weight:.3f}")
        
        # Özet al
        summary = optimizer.get_optimization_summary()
        print(f"\n📋 Optimizasyon özeti:")
        print(f"  Son optimizasyon: {summary['last_optimization']}")
        print(f"  En iyi skor: {summary['best_score']:.4f}")
        
    else:
        print(f"❌ Optimizasyon hatası: {results['error']}")
    
    print(f"\n✅ Ensemble Weight Optimizer test completed!")

if __name__ == "__main__":
    test_ensemble_optimizer()
