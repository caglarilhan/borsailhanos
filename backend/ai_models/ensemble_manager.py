"""
AI Ensemble Manager - Model Ağırlıklandırma ve Birleştirme
- LightGBM + LSTM + TimeGPT ensemble
- Dynamic weight adjustment
- Performance monitoring
- Risk management
"""

import pandas as pd
import numpy as np
import logging
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import json
import os

# Model imports
from .lightgbm_model import LightGBMModel
# LSTMModel lazy import to avoid tensorflow dependency at import time
try:
    from .lstm_model import LSTMModel  # may fail on unsupported Python
    _LSTM_AVAILABLE = True
except Exception:
    LSTMModel = None  # type: ignore
    _LSTM_AVAILABLE = False
from .timegpt_model import TimeGPTModel, TimeGPTForecast

logger = logging.getLogger(__name__)

class AIEnsembleManager:
    def __init__(self, models_dir: str = "models/"):
        self.models_dir = models_dir
        self.models = {}
        self.weights = {}
        self.performance_history = []
        self.is_initialized = False
        
        # Model ağırlıkları (başlangıç)
        self.default_weights = {
            'lightgbm': 0.4,    # Günlük yön tahmini
            'lstm': 0.35,       # 4 saatlik pattern
            'timegpt': 0.25     # 10 günlük forecast
        }
        
        # Performance thresholds
        self.min_accuracy = 0.6
        self.max_weight = 0.6
        self.min_weight = 0.1
        
        self.initialize_models()
    
    def initialize_models(self):
        """AI modellerini başlat"""
        try:
            logger.info("AI Ensemble modelleri başlatılıyor...")
            
            # LightGBM
            self.models['lightgbm'] = LightGBMModel(f"{self.models_dir}lightgbm_model.pkl")
            
            # LSTM (optional)
            if _LSTM_AVAILABLE:
                self.models['lstm'] = LSTMModel(f"{self.models_dir}lstm_model.h5")
            else:
                self.models['lstm'] = None
            
            # TimeGPT
            self.models['timegpt'] = TimeGPTModel()
            
            # Ağırlıkları yükle
            self.load_weights()
            
            self.is_initialized = True
            logger.info("AI Ensemble başlatıldı")
            
        except Exception as e:
            logger.error(f"AI Ensemble başlatma hatası: {e}")
    
    def load_weights(self):
        """Model ağırlıklarını yükle"""
        try:
            weights_path = f"{self.models_dir}ensemble_weights.json"
            if os.path.exists(weights_path):
                with open(weights_path, 'r') as f:
                    self.weights = json.load(f)
                logger.info("Model ağırlıkları yüklendi")
            else:
                self.weights = self.default_weights.copy()
                self.save_weights()
                logger.info("Varsayılan ağırlıklar kullanılıyor")
                
        except Exception as e:
            logger.error(f"Ağırlık yükleme hatası: {e}")
            self.weights = self.default_weights.copy()
    
    def save_weights(self):
        """Model ağırlıklarını kaydet"""
        try:
            os.makedirs(self.models_dir, exist_ok=True)
            weights_path = f"{self.models_dir}ensemble_weights.json"
            
            with open(weights_path, 'w') as f:
                json.dump(self.weights, f, indent=2)
                
            logger.info("Model ağırlıkları kaydedildi")
            
        except Exception as e:
            logger.error(f"Ağırlık kaydetme hatası: {e}")
    
    def get_ensemble_prediction(self, df: pd.DataFrame, symbol: str) -> Dict:
        """Ensemble tahmin yap"""
        try:
            if not self.is_initialized:
                raise ValueError("AI Ensemble başlatılmamış")
            
            predictions = {}
            confidences = {}
            
            # 1. LightGBM - Günlük yön tahmini
            try:
                if self.models['lightgbm'].is_trained:
                    direction, probability = self.models['lightgbm'].predict(df)
                    predictions['lightgbm'] = {
                        'direction': 'BULLISH' if direction == 1 else 'BEARISH',
                        'confidence': probability,
                        'horizon': '1D'
                    }
                    confidences['lightgbm'] = probability
                else:
                    logger.warning("LightGBM model eğitilmemiş")
            except Exception as e:
                logger.error(f"LightGBM tahmin hatası: {e}")
            
            # 2. LSTM - 4 saatlik pattern
            try:
                if self.models.get('lstm') is not None and getattr(self.models['lstm'], 'is_trained', False):
                    prediction, multi_step = self.models['lstm'].predict(df)
                    predictions['lstm'] = {
                        'prediction': prediction,
                        'multi_step': multi_step,
                        'confidence': 0.7,  # LSTM için sabit confidence
                        'horizon': '4H'
                    }
                    confidences['lstm'] = 0.7
                else:
                    logger.info("LSTM modeli devre dışı veya eğitilmemiş (TensorFlow bulunamadı veya model yüklenmedi)")
            except Exception as e:
                logger.error(f"LSTM tahmin hatası: {e}")
            
            # 3. TimeGPT - 10 günlük forecast
            try:
                forecast = self.models['timegpt'].forecast(df, symbol)
                if forecast:
                    predictions['timegpt'] = {
                        'forecast': forecast,
                        'confidence': forecast.model_accuracy,
                        'horizon': '10D'
                    }
                    confidences['timegpt'] = forecast.model_accuracy
                else:
                    logger.warning("TimeGPT forecast başarısız")
            except Exception as e:
                logger.error(f"TimeGPT tahmin hatası: {e}")
            
            # Ensemble tahmin
            ensemble_result = self.combine_predictions(predictions, confidences)
            
            # Performance tracking
            self.track_performance(symbol, ensemble_result)
            
            return ensemble_result
            
        except Exception as e:
            logger.error(f"Ensemble tahmin hatası: {e}")
            return {}
    
    def combine_predictions(self, predictions: Dict, confidences: Dict) -> Dict:
        """Model tahminlerini birleştir"""
        try:
            if not predictions:
                return {}
            
            # Ağırlıklı ensemble
            weighted_score = 0
            total_weight = 0
            
            # LightGBM yön tahmini
            if 'lightgbm' in predictions:
                weight = self.weights['lightgbm']
                direction_score = 1 if predictions['lightgbm']['direction'] == 'BULLISH' else -1
                weighted_score += direction_score * weight * confidences['lightgbm']
                total_weight += weight
            
            # LSTM pattern score
            if 'lstm' in predictions:
                weight = self.weights['lstm']
                lstm_score = predictions['lstm']['prediction']  # -1 ile 1 arası
                weighted_score += lstm_score * weight * confidences['lstm']
                total_weight += weight
            
            # TimeGPT trend score
            if 'timegpt' in predictions:
                weight = self.weights['timegpt']
                forecast = predictions['timegpt']['forecast']
                # Determine trend direction from predictions sequence
                try:
                    pred_seq = getattr(forecast, 'predictions', [])
                    trend_direction = 'UP' if (len(pred_seq) >= 2 and pred_seq[-1] > pred_seq[0]) else 'DOWN'
                except Exception:
                    trend_direction = 'DOWN'
                trend_score = 1 if trend_direction == 'UP' else -1
                weighted_score += trend_score * weight * confidences['timegpt']
                total_weight += weight
            
            # Normalize
            if total_weight > 0:
                ensemble_score = weighted_score / total_weight
            else:
                ensemble_score = 0
            
            # Final tahmin
            if ensemble_score > 0.1:
                final_direction = 'BULLISH'
                final_confidence = min(abs(ensemble_score), 0.95)
            elif ensemble_score < -0.1:
                final_direction = 'BEARISH'
                final_confidence = min(abs(ensemble_score), 0.95)
            else:
                final_direction = 'NEUTRAL'
                final_confidence = 0.5
            
            # Risk/reward hesapla
            risk_reward = self.calculate_risk_reward(predictions, ensemble_score)
            
            return {
                'symbol': symbol if (symbol := predictions.get('symbol', None)) else 'UNKNOWN',
                'ensemble_direction': final_direction,
                'ensemble_confidence': final_confidence,
                'ensemble_score': ensemble_score,
                'model_predictions': predictions,
                'model_weights': self.weights,
                'risk_reward': risk_reward,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Tahmin birleştirme hatası: {e}")
            return {}
    
    def calculate_risk_reward(self, predictions: Dict, ensemble_score: float) -> float:
        """Risk/reward oranı hesapla"""
        try:
            # Volatilite bazlı risk
            volatility_risk = 0.5
            
            # LSTM volatility
            if 'lstm' in predictions:
                lstm_pred = predictions['lstm']['prediction']
                volatility_risk += abs(lstm_pred) * 0.3
            
            # TimeGPT confidence
            if 'timegpt' in predictions:
                timegpt_conf = predictions['timegpt']['confidence']
                volatility_risk += (1 - timegpt_conf) * 0.2
            
            # Risk/reward = potential_gain / potential_loss
            if ensemble_score > 0:
                potential_gain = ensemble_score * 0.1  # %10 potansiyel kazanç
                potential_loss = volatility_risk * 0.05  # %5 potansiyel kayıp
            else:
                potential_gain = abs(ensemble_score) * 0.1
                potential_loss = volatility_risk * 0.05
            
            if potential_loss > 0:
                risk_reward = potential_gain / potential_loss
            else:
                risk_reward = 1.0
            
            return min(risk_reward, 5.0)  # Max 5x
            
        except Exception as e:
            logger.error(f"Risk/reward hesaplama hatası: {e}")
            return 1.0
    
    def update_weights(self, performance_metrics: Dict):
        """Model ağırlıklarını güncelle"""
        try:
            if not performance_metrics:
                return
            
            # Her model için accuracy
            model_accuracies = {}
            
            for model_name in self.models.keys():
                if model_name in performance_metrics:
                    accuracy = performance_metrics[model_name].get('accuracy', 0.5)
                    model_accuracies[model_name] = accuracy
            
            if not model_accuracies:
                return
            
            # Ağırlıkları güncelle
            total_accuracy = sum(model_accuracies.values())
            
            for model_name in self.models.keys():
                if model_name in model_accuracies:
                    # Accuracy'ye göre ağırlık
                    new_weight = model_accuracies[model_name] / total_accuracy
                    
                    # Min/max sınırları
                    new_weight = max(self.min_weight, min(self.max_weight, new_weight))
                    
                    self.weights[model_name] = new_weight
            
            # Normalize et
            total_weight = sum(self.weights.values())
            for model_name in self.weights:
                self.weights[model_name] /= total_weight
            
            # Kaydet
            self.save_weights()
            
            logger.info(f"Model ağırlıkları güncellendi: {self.weights}")
            
        except Exception as e:
            logger.error(f"Ağırlık güncelleme hatası: {e}")
    
    def track_performance(self, symbol: str, prediction: Dict):
        """Performance tracking"""
        try:
            if not prediction:
                return
            
            performance_record = {
                'symbol': symbol,
                'timestamp': datetime.now().isoformat(),
                'ensemble_direction': prediction.get('ensemble_direction'),
                'ensemble_confidence': prediction.get('ensemble_confidence'),
                'ensemble_score': prediction.get('ensemble_score'),
                'risk_reward': prediction.get('risk_reward'),
                'model_weights': prediction.get('model_weights', {})
            }
            
            self.performance_history.append(performance_record)
            
            # Son 1000 kaydı tut
            if len(self.performance_history) > 1000:
                self.performance_history = self.performance_history[-1000:]
            
        except Exception as e:
            logger.error(f"Performance tracking hatası: {e}")
    
    def get_performance_summary(self) -> Dict:
        """Performance özeti"""
        try:
            if not self.performance_history:
                return {}
            
            # Son 100 tahmin
            recent_predictions = self.performance_history[-100:]
            
            # Direction accuracy
            total_predictions = len(recent_predictions)
            bullish_predictions = len([p for p in recent_predictions if p['ensemble_direction'] == 'BULLISH'])
            bearish_predictions = len([p for p in recent_predictions if p['ensemble_direction'] == 'BEARISH'])
            neutral_predictions = len([p for p in recent_predictions if p['ensemble_direction'] == 'NEUTRAL'])
            
            # Ortalama confidence
            avg_confidence = np.mean([p['ensemble_confidence'] for p in recent_predictions])
            avg_risk_reward = np.mean([p['risk_reward'] for p in recent_predictions])
            
            return {
                'total_predictions': total_predictions,
                'bullish_percentage': round(bullish_predictions / total_predictions * 100, 2),
                'bearish_percentage': round(bearish_predictions / total_predictions * 100, 2),
                'neutral_percentage': round(neutral_predictions / total_predictions * 100, 2),
                'avg_confidence': round(avg_confidence, 3),
                'avg_risk_reward': round(avg_risk_reward, 3),
                'current_weights': self.weights,
                'last_updated': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Performance özeti hatası: {e}")
            return {}

# Test fonksiyonu
def test_ensemble():
    """AI Ensemble test"""
    print("=== AI Ensemble Manager Test ===")
    
    # Manager oluştur
    manager = AIEnsembleManager()
    
    if manager.is_initialized:
        print("✅ AI Ensemble başlatıldı")
        print(f"Model ağırlıkları: {manager.weights}")
        
        # Performance özeti
        summary = manager.get_performance_summary()
        if summary:
            print(f"Performance özeti: {summary}")
        
        return manager
    else:
        print("❌ AI Ensemble başlatılamadı")
        return None

if __name__ == "__main__":
    test_ensemble()
