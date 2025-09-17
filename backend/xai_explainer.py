"""
XAI (Explainable AI) Sistemi
Sinyal açıklaması için SHAP ve LIME entegrasyonu
"""

import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, List, Tuple, Optional, Any
import logging
from dataclasses import dataclass
import os

# XAI kütüphaneleri
try:
    import shap
    import lime
    from lime.lime_tabular import LimeTabularExplainer
    SHAP_AVAILABLE = True
    LIME_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False
    LIME_AVAILABLE = False
    logger.warning("⚠️ SHAP veya LIME kütüphaneleri yüklü değil. XAI özellikleri devre dışı.")

logger = logging.getLogger(__name__)

@dataclass
class XAIExplanation:
    """XAI açıklama sonucu"""
    symbol: str
    timeframe: str
    signal_action: str
    confidence: float
    explanation_method: str
    feature_contributions: Dict[str, float]
    explanation_text: str
    explanation_date: datetime
    model_type: str

class XAIExplainer:
    """XAI Açıklayıcı"""
    
    def __init__(self, data_dir: str = "data/xai"):
        self.data_dir = data_dir
        self.explanations: Dict[str, XAIExplanation] = {}
        
        # XAI dosyalarını oluştur
        os.makedirs(data_dir, exist_ok=True)
        
        # SHAP ve LIME durumunu kontrol et
        if not SHAP_AVAILABLE:
            logger.warning("⚠️ SHAP kütüphanesi yüklü değil. SHAP açıklamaları devre dışı.")
        if not LIME_AVAILABLE:
            logger.warning("⚠️ LIME kütüphanesi yüklü değil. LIME açıklamaları devre dışı.")
    
    def explain_signal(self, symbol: str, timeframe: str, 
                      signal_data: Dict, model_data: Dict, 
                      method: str = "both") -> XAIExplanation:
        """Sinyal açıklaması oluştur"""
        try:
            logger.info(f"🔍 {symbol} {timeframe} için XAI açıklaması oluşturuluyor...")
            
            if method == "shap" and SHAP_AVAILABLE:
                explanation = self._explain_with_shap(symbol, timeframe, signal_data, model_data)
            elif method == "lime" and LIME_AVAILABLE:
                explanation = self._explain_with_lime(symbol, timeframe, signal_data, model_data)
            elif method == "both":
                # Her iki yöntemi de dene
                if SHAP_AVAILABLE:
                    explanation = self._explain_with_shap(symbol, timeframe, signal_data, model_data)
                elif LIME_AVAILABLE:
                    explanation = self._explain_with_lime(symbol, timeframe, signal_data, model_data)
                else:
                    explanation = self._explain_with_simple(symbol, timeframe, signal_data, model_data)
            else:
                explanation = self._explain_with_simple(symbol, timeframe, signal_data, model_data)
            
            if explanation:
                # Sonucu kaydet
                self.explanations[f"{symbol}_{timeframe}"] = explanation
                self._save_explanation(explanation)
                
                logger.info(f"✅ {symbol} {timeframe} XAI açıklaması tamamlandı")
                return explanation
            else:
                logger.warning(f"⚠️ {symbol} {timeframe} XAI açıklaması oluşturulamadı")
                return None
                
        except Exception as e:
            logger.error(f"❌ XAI açıklama hatası {symbol} {timeframe}: {e}")
            return None
    
    def _explain_with_shap(self, symbol: str, timeframe: str, 
                          signal_data: Dict, model_data: Dict) -> XAIExplanation:
        """SHAP ile açıklama oluştur"""
        try:
            if not SHAP_AVAILABLE:
                return None
            
            # Model ve veri hazırla
            model = model_data.get('model')
            features = model_data.get('features')
            feature_names = model_data.get('feature_names', [])
            
            if model is None or features is None:
                logger.warning(f"⚠️ {symbol} {timeframe}: Model veya features bulunamadı")
                return None
            
            # SHAP explainer oluştur
            if hasattr(model, 'predict_proba'):
                # Sınıflandırma modeli
                explainer = shap.TreeExplainer(model)
                shap_values = explainer.shap_values(features)
                
                # En son örnek için SHAP değerleri
                if len(shap_values.shape) > 2:
                    shap_values = shap_values[1]  # Pozitif sınıf için
                
                last_shap_values = shap_values[-1]
                
            else:
                # Regresyon modeli
                explainer = shap.TreeExplainer(model)
                shap_values = explainer.shap_values(features)
                last_shap_values = shap_values[-1]
            
            # Feature katkılarını hesapla
            feature_contributions = {}
            for i, feature_name in enumerate(feature_names):
                if i < len(last_shap_values):
                    feature_contributions[feature_name] = float(last_shap_values[i])
            
            # Açıklama metni oluştur
            explanation_text = self._generate_shap_explanation_text(
                signal_data, feature_contributions
            )
            
            return XAIExplanation(
                symbol=symbol,
                timeframe=timeframe,
                signal_action=signal_data.get('action', 'UNKNOWN'),
                confidence=signal_data.get('confidence', 0.0),
                explanation_method="SHAP",
                feature_contributions=feature_contributions,
                explanation_text=explanation_text,
                explanation_date=datetime.now(),
                model_type=type(model).__name__
            )
            
        except Exception as e:
            logger.error(f"❌ SHAP açıklama hatası: {e}")
            return None
    
    def _explain_with_lime(self, symbol: str, timeframe: str, 
                          signal_data: Dict, model_data: Dict) -> XAIExplanation:
        """LIME ile açıklama oluştur"""
        try:
            if not LIME_AVAILABLE:
                return None
            
            # Model ve veri hazırla
            model = model_data.get('model')
            features = model_data.get('features')
            feature_names = model_data.get('feature_names', [])
            
            if model is None or features is None:
                logger.warning(f"⚠️ {symbol} {timeframe}: Model veya features bulunamadı")
                return None
            
            # LIME explainer oluştur
            explainer = LimeTabularExplainer(
                features,
                feature_names=feature_names,
                mode='classification' if hasattr(model, 'predict_proba') else 'regression',
                discretize_continuous=True
            )
            
            # En son örnek için açıklama
            last_instance = features[-1]
            
            # LIME açıklaması oluştur
            explanation = explainer.explain_instance(
                last_instance,
                model.predict_proba if hasattr(model, 'predict_proba') else model.predict,
                num_features=min(10, len(feature_names))
            )
            
            # Feature katkılarını al
            feature_contributions = {}
            for feature_idx, contribution in explanation.as_list():
                feature_contributions[feature_idx] = contribution
            
            # Açıklama metni oluştur
            explanation_text = self._generate_lime_explanation_text(
                signal_data, feature_contributions
            )
            
            return XAIExplanation(
                symbol=symbol,
                timeframe=timeframe,
                signal_action=signal_data.get('action', 'UNKNOWN'),
                confidence=signal_data.get('confidence', 0.0),
                explanation_method="LIME",
                feature_contributions=feature_contributions,
                explanation_text=explanation_text,
                explanation_date=datetime.now(),
                model_type=type(model).__name__
            )
            
        except Exception as e:
            logger.error(f"❌ LIME açıklama hatası: {e}")
            return None
    
    def _explain_with_simple(self, symbol: str, timeframe: str, 
                           signal_data: Dict, model_data: Dict) -> XAIExplanation:
        """Basit açıklama oluştur (SHAP/LIME yoksa)"""
        try:
            # Basit feature analizi
            feature_contributions = {}
            
            # Teknik indikatörlerden katkı hesapla
            indicators = signal_data.get('indicators', {})
            
            for indicator_name, value in indicators.items():
                if isinstance(value, (int, float)) and not np.isnan(value):
                    # Basit katkı hesaplama
                    if indicator_name in ['RSI', 'MACD', 'EMA_9', 'EMA_21']:
                        feature_contributions[indicator_name] = float(value) * 0.1
                    elif indicator_name in ['Volume_Ratio', 'VWAP']:
                        feature_contributions[indicator_name] = float(value) * 0.05
                    else:
                        feature_contributions[indicator_name] = float(value) * 0.02
            
            # Açıklama metni oluştur
            explanation_text = self._generate_simple_explanation_text(
                signal_data, feature_contributions
            )
            
            return XAIExplanation(
                symbol=symbol,
                timeframe=timeframe,
                signal_action=signal_data.get('action', 'UNKNOWN'),
                confidence=signal_data.get('confidence', 0.0),
                explanation_method="SIMPLE",
                feature_contributions=feature_contributions,
                explanation_text=explanation_text,
                explanation_date=datetime.now(),
                model_type="Simple"
            )
            
        except Exception as e:
            logger.error(f"❌ Basit açıklama hatası: {e}")
            return None
    
    def _generate_shap_explanation_text(self, signal_data: Dict, 
                                      feature_contributions: Dict[str, float]) -> str:
        """SHAP açıklama metni oluştur"""
        try:
            action = signal_data.get('action', 'UNKNOWN')
            confidence = signal_data.get('confidence', 0.0)
            
            # En önemli feature'ları bul
            sorted_features = sorted(
                feature_contributions.items(), 
                key=lambda x: abs(x[1]), 
                reverse=True
            )[:5]
            
            explanation_parts = [
                f"🧠 {action} sinyali için XAI açıklaması (SHAP):",
                f"📊 Güven Skoru: {confidence:.3f}",
                "",
                "🔍 En Önemli Faktörler:"
            ]
            
            for feature_name, contribution in sorted_features:
                direction = "pozitif" if contribution > 0 else "negatif"
                impact = "artırıyor" if contribution > 0 else "azaltıyor"
                explanation_parts.append(
                    f"   • {feature_name}: {contribution:.3f} ({direction} etki, güveni {impact})"
                )
            
            # Genel açıklama
            explanation_parts.extend([
                "",
                "📈 Sinyal Mantığı:",
                f"   Bu sinyal, {len(feature_contributions)} farklı teknik indikatörün",
                f"   analizi sonucunda {confidence:.1%} güvenle üretilmiştir.",
                "   SHAP değerleri, her indikatörün sinyal kararına katkısını gösterir."
            ])
            
            return "\n".join(explanation_parts)
            
        except Exception as e:
            logger.error(f"❌ SHAP açıklama metni hatası: {e}")
            return f"❌ Açıklama metni oluşturulamadı: {e}"
    
    def _generate_lime_explanation_text(self, signal_data: Dict, 
                                      feature_contributions: Dict[str, float]) -> str:
        """LIME açıklama metni oluştur"""
        try:
            action = signal_data.get('action', 'UNKNOWN')
            confidence = signal_data.get('confidence', 0.0)
            
            # En önemli feature'ları bul
            sorted_features = sorted(
                feature_contributions.items(), 
                key=lambda x: abs(x[1]), 
                reverse=True
            )[:5]
            
            explanation_parts = [
                f"🧠 {action} sinyali için XAI açıklaması (LIME):",
                f"📊 Güven Skoru: {confidence:.3f}",
                "",
                "🔍 En Önemli Faktörler:"
            ]
            
            for feature_name, contribution in sorted_features:
                direction = "pozitif" if contribution > 0 else "negatif"
                impact = "artırıyor" if contribution > 0 else "azaltıyor"
                explanation_parts.append(
                    f"   • {feature_name}: {contribution:.3f} ({direction} etki, güveni {impact})"
                )
            
            # Genel açıklama
            explanation_parts.extend([
                "",
                "📈 Sinyal Mantığı:",
                f"   Bu sinyal, {len(feature_contributions)} farklı teknik indikatörün",
                f"   analizi sonucunda {confidence:.1%} güvenle üretilmiştir.",
                "   LIME değerleri, yerel açıklanabilirlik sağlar."
            ])
            
            return "\n".join(explanation_parts)
            
        except Exception as e:
            logger.error(f"❌ LIME açıklama metni hatası: {e}")
            return f"❌ Açıklama metni oluşturulamadı: {e}"
    
    def _generate_simple_explanation_text(self, signal_data: Dict, 
                                        feature_contributions: Dict[str, float]) -> str:
        """Basit açıklama metni oluştur"""
        try:
            action = signal_data.get('action', 'UNKNOWN')
            confidence = signal_data.get('confidence', 0.0)
            
            # En önemli feature'ları bul
            sorted_features = sorted(
                feature_contributions.items(), 
                key=lambda x: abs(x[1]), 
                reverse=True
            )[:5]
            
            explanation_parts = [
                f"🧠 {action} sinyali için basit açıklama:",
                f"📊 Güven Skoru: {confidence:.3f}",
                "",
                "🔍 En Önemli Faktörler:"
            ]
            
            for feature_name, contribution in sorted_features:
                direction = "pozitif" if contribution > 0 else "negatif"
                impact = "artırıyor" if contribution > 0 else "azaltıyor"
                explanation_parts.append(
                    f"   • {feature_name}: {contribution:.3f} ({direction} etki, güveni {impact})"
                )
            
            # Genel açıklama
            explanation_parts.extend([
                "",
                "📈 Sinyal Mantığı:",
                f"   Bu sinyal, {len(feature_contributions)} farklı teknik indikatörün",
                f"   analizi sonucunda {confidence:.1%} güvenle üretilmiştir.",
                "   Basit analiz yöntemi kullanılmıştır."
            ])
            
            return "\n".join(explanation_parts)
            
        except Exception as e:
            logger.error(f"❌ Basit açıklama metni hatası: {e}")
            return f"❌ Açıklama metni oluşturulamadı: {e}"
    
    def _save_explanation(self, explanation: XAIExplanation):
        """Açıklamayı kaydet"""
        try:
            filename = f"{explanation.symbol}_{explanation.timeframe}_xai.json"
            filepath = os.path.join(self.data_dir, filename)
            
            # JSON olarak kaydet
            import json
            explanation_dict = {
                'symbol': explanation.symbol,
                'timeframe': explanation.timeframe,
                'signal_action': explanation.signal_action,
                'confidence': explanation.confidence,
                'explanation_method': explanation.explanation_method,
                'feature_contributions': explanation.feature_contributions,
                'explanation_text': explanation.explanation_text,
                'explanation_date': explanation.explanation_date.isoformat(),
                'model_type': explanation.model_type
            }
            
            with open(filepath, 'w') as f:
                json.dump(explanation_dict, f, indent=2)
            
            logger.info(f"✅ XAI açıklaması kaydedildi: {filepath}")
            
        except Exception as e:
            logger.error(f"❌ XAI kaydetme hatası: {e}")
    
    def get_explanation(self, symbol: str, timeframe: str) -> Optional[XAIExplanation]:
        """Açıklamayı al"""
        try:
            return self.explanations.get(f"{symbol}_{timeframe}")
        except Exception as e:
            logger.error(f"❌ Açıklama alma hatası: {e}")
            return None
    
    def generate_explanation_summary(self, symbol: str, timeframe: str) -> str:
        """Açıklama özeti oluştur"""
        try:
            explanation = self.get_explanation(symbol, timeframe)
            
            if not explanation:
                return f"❌ {symbol} {timeframe} için açıklama bulunamadı"
            
            return explanation.explanation_text
            
        except Exception as e:
            logger.error(f"❌ Açıklama özeti hatası: {e}")
            return f"❌ Açıklama özeti oluşturulamadı: {e}"
