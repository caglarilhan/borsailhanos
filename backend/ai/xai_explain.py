"""
🚀 BIST AI Smart Trader - XAI Explainability Engine
==================================================

SHAP & LIME ile model kararlarını açıklayan sistem.
Hisse bazında "Neden bu sinyal?" açıklaması verir.

Özellikler:
- SHAP (SHapley Additive exPlanations)
- LIME (Local Interpretable Model-agnostic Explanations)
- Feature importance analysis
- Model decision explanations
- Interactive explanations
"""

import asyncio
import json
import logging
import numpy as np
import pandas as pd
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
import pickle

# XAI Libraries
try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False
    print("⚠️ SHAP not available - install with: pip install shap")

try:
    import lime
    import lime.tabular
    LIME_AVAILABLE = True
except ImportError:
    LIME_AVAILABLE = False
    print("⚠️ LIME not available - install with: pip install lime")

# ML Libraries
try:
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.preprocessing import StandardScaler
    from sklearn.model_selection import train_test_split
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("⚠️ Scikit-learn not available")

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ExplanationResult:
    """Açıklama sonucu"""
    symbol: str
    prediction: str
    confidence: float
    shap_values: Dict[str, float]
    lime_explanation: Dict[str, Any]
    feature_importance: Dict[str, float]
    decision_factors: List[str]
    timestamp: datetime
    
    def to_dict(self):
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data

@dataclass
class FeatureExplanation:
    """Feature açıklaması"""
    feature_name: str
    feature_value: float
    importance_score: float
    contribution: float
    explanation: str
    
    def to_dict(self):
        return asdict(self)

class XAIExplainEngine:
    """XAI açıklama motoru"""
    
    def __init__(self, models_dir: str = "backend/ai/models"):
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(parents=True, exist_ok=True)
        
        # Model cache
        self.loaded_models: Dict[str, Any] = {}
        self.scalers: Dict[str, StandardScaler] = {}
        
        # Explanation cache
        self.explanation_cache: Dict[str, ExplanationResult] = {}
        
        # Feature names (teknik indikatörler)
        self.feature_names = [
            'close_price', 'sma_20', 'sma_50', 'ema_12', 'ema_26',
            'macd', 'macd_signal', 'rsi', 'bb_upper', 'bb_middle', 'bb_lower',
            'volume_ratio', 'price_change', 'volume_change', 'volatility'
        ]
        
        # Feature açıklamaları
        self.feature_descriptions = {
            'close_price': 'Güncel fiyat',
            'sma_20': '20 günlük basit hareketli ortalama',
            'sma_50': '50 günlük basit hareketli ortalama',
            'ema_12': '12 günlük üstel hareketli ortalama',
            'ema_26': '26 günlük üstel hareketli ortalama',
            'macd': 'MACD değeri',
            'macd_signal': 'MACD sinyal çizgisi',
            'rsi': 'RSI (Relative Strength Index)',
            'bb_upper': 'Bollinger Bantları üst çizgisi',
            'bb_middle': 'Bollinger Bantları orta çizgisi',
            'bb_lower': 'Bollinger Bantları alt çizgisi',
            'volume_ratio': 'Hacim oranı',
            'price_change': 'Fiyat değişimi',
            'volume_change': 'Hacim değişimi',
            'volatility': 'Volatilite'
        }
    
    def load_model(self, model_type: str, model_path: str) -> bool:
        """Modeli yükle"""
        try:
            if model_path in self.loaded_models:
                return True
            
            if model_path.endswith('.pkl'):
                with open(model_path, 'rb') as f:
                    model = pickle.load(f)
            elif model_path.endswith('.h5'):
                # TensorFlow model
                from tensorflow.keras.models import load_model
                model = load_model(model_path)
            else:
                logger.error(f"❌ Unsupported model format: {model_path}")
                return False
            
            self.loaded_models[model_path] = model
            logger.info(f"✅ Model loaded: {model_type} from {model_path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Load model error: {e}")
            return False
    
    def prepare_features(self, data: Dict[str, float]) -> np.ndarray:
        """Feature'ları hazırla"""
        try:
            features = []
            
            for feature_name in self.feature_names:
                value = data.get(feature_name, 0.0)
                features.append(value)
            
            return np.array(features).reshape(1, -1)
            
        except Exception as e:
            logger.error(f"❌ Prepare features error: {e}")
            return np.zeros((1, len(self.feature_names)))
    
    def explain_with_shap(self, model, features: np.ndarray, model_type: str) -> Dict[str, float]:
        """SHAP ile açıklama"""
        try:
            if not SHAP_AVAILABLE:
                logger.warning("⚠️ SHAP not available")
                return {}
            
            # SHAP explainer oluştur
            if model_type == 'tree':
                explainer = shap.TreeExplainer(model)
            elif model_type == 'neural':
                explainer = shap.DeepExplainer(model, features)
            else:
                explainer = shap.Explainer(model)
            
            # SHAP değerlerini hesapla
            shap_values = explainer.shap_values(features)
            
            # Feature importance hesapla
            if isinstance(shap_values, list):
                shap_values = shap_values[0]  # İlk sınıf için
            
            feature_importance = {}
            for i, feature_name in enumerate(self.feature_names):
                feature_importance[feature_name] = float(abs(shap_values[0][i]))
            
            logger.info(f"✅ SHAP explanation completed")
            return feature_importance
            
        except Exception as e:
            logger.error(f"❌ SHAP explanation error: {e}")
            return {}
    
    def explain_with_lime(self, model, features: np.ndarray, model_type: str) -> Dict[str, Any]:
        """LIME ile açıklama"""
        try:
            if not LIME_AVAILABLE:
                logger.warning("⚠️ LIME not available")
                return {}
            
            # LIME explainer oluştur
            explainer = lime.tabular.LimeTabularExplainer(
                features,
                feature_names=self.feature_names,
                class_names=['SELL', 'HOLD', 'BUY'],
                mode='classification'
            )
            
            # LIME açıklaması
            explanation = explainer.explain_instance(
                features[0],
                model.predict_proba,
                num_features=len(self.feature_names)
            )
            
            # Sonuçları parse et
            lime_result = {
                'explanation': explanation.as_list(),
                'score': explanation.score,
                'prediction': explanation.prediction
            }
            
            logger.info(f"✅ LIME explanation completed")
            return lime_result
            
        except Exception as e:
            logger.error(f"❌ LIME explanation error: {e}")
            return {}
    
    def generate_decision_factors(self, feature_importance: Dict[str, float], data: Dict[str, float]) -> List[str]:
        """Karar faktörlerini oluştur"""
        try:
            factors = []
            
            # En önemli feature'ları sırala
            sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
            
            for feature_name, importance in sorted_features[:5]:  # Top 5
                if importance > 0.1:  # Minimum threshold
                    value = data.get(feature_name, 0)
                    description = self.feature_descriptions.get(feature_name, feature_name)
                    
                    # Değere göre açıklama oluştur
                    if feature_name == 'rsi':
                        if value > 70:
                            factor = f"RSI aşırı alım bölgesinde ({value:.1f}) - Satış baskısı"
                        elif value < 30:
                            factor = f"RSI aşırı satım bölgesinde ({value:.1f}) - Alım fırsatı"
                        else:
                            factor = f"RSI normal seviyede ({value:.1f})"
                    elif feature_name == 'macd':
                        if value > 0:
                            factor = f"MACD pozitif ({value:.3f}) - Yükseliş momentumu"
                        else:
                            factor = f"MACD negatif ({value:.3f}) - Düşüş momentumu"
                    elif feature_name == 'volume_ratio':
                        if value > 1.5:
                            factor = f"Yüksek hacim ({value:.1f}x) - Güçlü hareket"
                        elif value < 0.5:
                            factor = f"Düşük hacim ({value:.1f}x) - Zayıf hareket"
                        else:
                            factor = f"Normal hacim ({value:.1f}x)"
                    else:
                        factor = f"{description}: {value:.2f}"
                    
                    factors.append(factor)
            
            return factors
            
        except Exception as e:
            logger.error(f"❌ Generate decision factors error: {e}")
            return ["Açıklama oluşturulamadı"]
    
    async def explain_prediction(self, 
                                symbol: str,
                                model_path: str,
                                model_type: str,
                                data: Dict[str, float],
                                prediction: str,
                                confidence: float) -> ExplanationResult:
        """Tahmin açıklaması oluştur"""
        try:
            # Cache kontrolü
            cache_key = f"{symbol}_{model_path}_{hash(str(data))}"
            if cache_key in self.explanation_cache:
                logger.info(f"📋 Using cached explanation for {symbol}")
                return self.explanation_cache[cache_key]
            
            # Modeli yükle
            if not self.load_model(model_type, model_path):
                raise Exception(f"Model could not be loaded: {model_path}")
            
            model = self.loaded_models[model_path]
            
            # Feature'ları hazırla
            features = self.prepare_features(data)
            
            # SHAP açıklaması
            shap_importance = self.explain_with_shap(model, features, model_type)
            
            # LIME açıklaması
            lime_explanation = self.explain_with_lime(model, features, model_type)
            
            # Karar faktörlerini oluştur
            decision_factors = self.generate_decision_factors(shap_importance, data)
            
            # Sonuç oluştur
            explanation = ExplanationResult(
                symbol=symbol,
                prediction=prediction,
                confidence=confidence,
                shap_values=shap_importance,
                lime_explanation=lime_explanation,
                feature_importance=shap_importance,
                decision_factors=decision_factors,
                timestamp=datetime.now()
            )
            
            # Cache'e ekle
            self.explanation_cache[cache_key] = explanation
            
            logger.info(f"✅ Explanation generated for {symbol}")
            return explanation
            
        except Exception as e:
            logger.error(f"❌ Explain prediction error: {e}")
            # Fallback explanation
            return ExplanationResult(
                symbol=symbol,
                prediction=prediction,
                confidence=confidence,
                shap_values={},
                lime_explanation={},
                feature_importance={},
                decision_factors=["Açıklama oluşturulamadı"],
                timestamp=datetime.now()
            )
    
    def get_feature_explanations(self, explanation: ExplanationResult) -> List[FeatureExplanation]:
        """Feature açıklamalarını getir"""
        try:
            explanations = []
            
            for feature_name, importance in explanation.feature_importance.items():
                if importance > 0.05:  # Minimum threshold
                    description = self.feature_descriptions.get(feature_name, feature_name)
                    
                    explanations.append(FeatureExplanation(
                        feature_name=feature_name,
                        feature_value=0,  # Bu değer data'dan alınmalı
                        importance_score=importance,
                        contribution=importance * 100,
                        explanation=description
                    ))
            
            # Önem sırasına göre sırala
            explanations.sort(key=lambda x: x.importance_score, reverse=True)
            
            return explanations
            
        except Exception as e:
            logger.error(f"❌ Get feature explanations error: {e}")
            return []
    
    def generate_summary_explanation(self, explanation: ExplanationResult) -> str:
        """Özet açıklama oluştur"""
        try:
            symbol = explanation.symbol
            prediction = explanation.prediction
            confidence = explanation.confidence
            
            # Ana faktörleri al
            top_factors = explanation.decision_factors[:3]
            
            summary = f"📊 {symbol} için {prediction} sinyali (%{confidence:.1f} güven):\n\n"
            
            for i, factor in enumerate(top_factors, 1):
                summary += f"{i}. {factor}\n"
            
            # SHAP özeti
            if explanation.shap_values:
                top_feature = max(explanation.shap_values.items(), key=lambda x: x[1])
                summary += f"\n🔍 En etkili faktör: {self.feature_descriptions.get(top_feature[0], top_feature[0])}"
            
            return summary
            
        except Exception as e:
            logger.error(f"❌ Generate summary explanation error: {e}")
            return f"📊 {explanation.symbol} için {explanation.prediction} sinyali (%{explanation.confidence:.1f} güven)"
    
    def get_explanation_statistics(self) -> Dict[str, Any]:
        """Açıklama istatistiklerini getir"""
        try:
            stats = {
                'total_explanations': len(self.explanation_cache),
                'models_loaded': len(self.loaded_models),
                'features_available': len(self.feature_names),
                'shap_available': SHAP_AVAILABLE,
                'lime_available': LIME_AVAILABLE,
                'cache_hit_rate': 0,  # Bu hesaplanabilir
                'average_explanation_time': 0  # Bu hesaplanabilir
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"❌ Get explanation statistics error: {e}")
            return {}
    
    def clear_cache(self):
        """Cache'i temizle"""
        try:
            self.explanation_cache.clear()
            logger.info("🧹 Explanation cache cleared")
            
        except Exception as e:
            logger.error(f"❌ Clear cache error: {e}")

# Global instance
xai_explain_engine = XAIExplainEngine()

if __name__ == "__main__":
    async def test_xai():
        """Test fonksiyonu"""
        logger.info("🧪 Testing XAI Explain Engine...")
        
        # Test verisi
        test_data = {
            'close_price': 245.50,
            'sma_20': 240.30,
            'sma_50': 235.80,
            'ema_12': 243.20,
            'ema_26': 238.90,
            'macd': 4.30,
            'macd_signal': 2.10,
            'rsi': 65.5,
            'bb_upper': 250.20,
            'bb_middle': 240.10,
            'bb_lower': 230.00,
            'volume_ratio': 1.8,
            'price_change': 2.3,
            'volume_change': 15.2,
            'volatility': 0.12
        }
        
        # Test açıklama
        explanation = await xai_explain_engine.explain_prediction(
            symbol="THYAO",
            model_path="test_model.pkl",
            model_type="tree",
            data=test_data,
            prediction="BUY",
            confidence=0.87
        )
        
        logger.info(f"✅ Test explanation: {explanation.decision_factors}")
        
        # Özet açıklama
        summary = xai_explain_engine.generate_summary_explanation(explanation)
        logger.info(f"📊 Summary: {summary}")
        
        logger.info("✅ XAI Explain Engine test completed")
    
    # Test çalıştır
    asyncio.run(test_xai())