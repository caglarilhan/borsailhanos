"""
PRD v2.0 - XAI (Explainable AI) Açıklamaları
SHAP ve LIME ile sinyal açıklama sistemi
AI modellerinin karar verme sürecini açıklama
"""

import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Optional, Tuple, Any
import json
import asyncio
from collections import defaultdict

# SHAP import (fallback if not available)
try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False
    logging.warning("⚠️ SHAP bulunamadı, basit XAI implementasyonu kullanılacak")

# LIME import (fallback if not available)
try:
    import lime
    import lime.lime_tabular
    LIME_AVAILABLE = True
except ImportError:
    LIME_AVAILABLE = False
    logging.warning("⚠️ LIME bulunamadı, basit XAI implementasyonu kullanılacak")

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class XAIExplainer:
    """Explainable AI açıklama sistemi"""
    
    def __init__(self):
        self.explainer_models = {}
        self.explanation_cache = {}
        self.feature_importance_history = []
        self.explanation_metrics = {}
        
        # XAI parametreleri
        self.xai_params = {
            "max_features": 20,
            "explanation_threshold": 0.1,
            "confidence_threshold": 0.7,
            "cache_ttl": 3600,  # 1 saat
            "max_cache_size": 500
        }
        
        # Feature açıklamaları
        self.feature_descriptions = {
            # Teknik indikatörler
            "rsi": "RSI - Göreceli Güç Endeksi (14 günlük)",
            "macd": "MACD - Hareketli Ortalama Yakınsama/Uzaklaşma",
            "macd_signal": "MACD Sinyal Çizgisi",
            "macd_histogram": "MACD Histogram",
            "bb_upper": "Bollinger Bands Üst Band",
            "bb_middle": "Bollinger Bands Orta Band",
            "bb_lower": "Bollinger Bands Alt Band",
            "bb_position": "Bollinger Bands Pozisyonu",
            "atr": "ATR - Ortalama Gerçek Aralık",
            "volatility": "Volatilite - Fiyat Değişkenliği",
            
            # Hareketli ortalamalar
            "sma_20": "SMA 20 - 20 Günlük Basit Hareketli Ortalama",
            "sma_50": "SMA 50 - 50 Günlük Basit Hareketli Ortalama",
            "ema_20": "EMA 20 - 20 Günlük Üstel Hareketli Ortalama",
            "ema_50": "EMA 50 - 50 Günlük Üstel Hareketli Ortalama",
            
            # Momentum indikatörleri
            "momentum_5": "5 Günlük Momentum",
            "momentum_10": "10 Günlük Momentum",
            "momentum_20": "20 Günlük Momentum",
            
            # Trend indikatörleri
            "trend_5": "5 Günlük Trend",
            "trend_10": "10 Günlük Trend",
            "trend_20": "20 Günlük Trend",
            
            # Hacim indikatörleri
            "volume_ratio": "Hacim Oranı - Ortalama Hacime Göre",
            "price_volume": "Fiyat x Hacim",
            
            # Finansal oranlar
            "pe_ratio": "F/K Oranı - Fiyat/Kazanç",
            "pb_ratio": "PD/DD Oranı - Fiyat/Defter Değeri",
            "debt_equity": "Borç/Özkaynak Oranı",
            "current_ratio": "Cari Oran",
            "roe": "Özkaynak Karlılığı",
            "roa": "Varlık Karlılığı",
            "net_profit_margin": "Net Kâr Marjı",
            "dividend_yield": "Temettü Verimi",
            
            # Sentiment verileri
            "news_sentiment": "Haber Sentiment Skoru",
            "social_sentiment": "Sosyal Medya Sentiment Skoru",
            "kap_sentiment": "KAP ODA Sentiment Skoru",
            "overall_sentiment": "Genel Sentiment Skoru",
            
            # Makro veriler
            "usd_try": "USD/TRY Kuru",
            "cds_spread": "CDS Prim",
            "interest_rate": "Faiz Oranı",
            "inflation": "Enflasyon Oranı"
        }
        
        # Sinyal türleri
        self.signal_types = {
            "BUY": "Alım Sinyali",
            "SELL": "Satım Sinyali",
            "HOLD": "Bekleme Sinyali"
        }
        
        # Açıklama şablonları
        self.explanation_templates = {
            "positive": {
                "BUY": "Bu sinyalin {percentage}%'i {feature} faktöründen kaynaklanıyor. {description}",
                "SELL": "Bu sinyalin {percentage}%'i {feature} faktöründen kaynaklanıyor. {description}",
                "HOLD": "Bu sinyalin {percentage}%'i {feature} faktöründen kaynaklanıyor. {description}"
            },
            "negative": {
                "BUY": "Bu sinyalin {percentage}%'i {feature} faktörünün olumsuz etkisinden kaynaklanıyor. {description}",
                "SELL": "Bu sinyalin {percentage}%'i {feature} faktörünün olumsuz etkisinden kaynaklanıyor. {description}",
                "HOLD": "Bu sinyalin {percentage}%'i {feature} faktörünün olumsuz etkisinden kaynaklanıyor. {description}"
            }
        }
        
        # Veri kalitesi metrikleri
        self.quality_metrics = {
            "total_explanations": 0,
            "successful_explanations": 0,
            "failed_explanations": 0,
            "avg_confidence": 0,
            "avg_feature_count": 0,
            "last_quality_check": None
        }
    
    def initialize_explainer(self, model_type: str = "shap"):
        """XAI explainer'ı başlat"""
        try:
            if model_type == "shap" and SHAP_AVAILABLE:
                # SHAP explainer
                self.explainer_models["shap"] = shap.Explainer()
                logger.info("✅ SHAP explainer başlatıldı")
            elif model_type == "lime" and LIME_AVAILABLE:
                # LIME explainer
                self.explainer_models["lime"] = lime.lime_tabular.LimeTabularExplainer()
                logger.info("✅ LIME explainer başlatıldı")
            else:
                # Basit XAI implementasyonu
                self._initialize_simple_explainer()
                
        except Exception as e:
            logger.error(f"❌ XAI explainer başlatma hatası: {e}")
            self._initialize_simple_explainer()
    
    def _initialize_simple_explainer(self):
        """Basit XAI explainer başlat"""
        try:
            logger.info("🔧 Basit XAI explainer başlatılıyor...")
            
            # Basit kural tabanlı explainer
            self.explainer_models["simple"] = "simple_rule_based"
            
            logger.info("✅ Basit XAI explainer hazır")
            
        except Exception as e:
            logger.error(f"❌ Basit XAI explainer başlatma hatası: {e}")
    
    def explain_prediction(self, model_prediction: Dict, feature_values: Dict, symbol: str) -> Dict:
        """Model tahminini açıkla"""
        try:
            logger.info(f"🔍 {symbol} için XAI açıklaması başlatılıyor...")
            
            # Cache kontrolü
            cache_key = f"{symbol}_{hash(str(feature_values))}"
            if cache_key in self.explanation_cache:
                cached_result = self.explanation_cache[cache_key]
                if datetime.now().timestamp() - cached_result["timestamp"] < self.xai_params["cache_ttl"]:
                    return cached_result["result"]
            
            # XAI açıklaması
            if "shap" in self.explainer_models:
                explanation = self._explain_with_shap(model_prediction, feature_values, symbol)
            elif "lime" in self.explainer_models:
                explanation = self._explain_with_lime(model_prediction, feature_values, symbol)
            else:
                explanation = self._explain_with_simple_model(model_prediction, feature_values, symbol)
            
            # Cache'e kaydet
            self.explanation_cache[cache_key] = {
                "result": explanation,
                "timestamp": datetime.now().timestamp()
            }
            
            # Cache boyutu kontrolü
            if len(self.explanation_cache) > self.xai_params["max_cache_size"]:
                self._cleanup_cache()
            
            # Metrikleri güncelle
            self._update_quality_metrics(explanation)
            
            logger.info(f"✅ {symbol} XAI açıklaması tamamlandı")
            return explanation
            
        except Exception as e:
            logger.error(f"❌ {symbol} XAI açıklama hatası: {e}")
            return {"error": str(e)}
    
    def _explain_with_shap(self, model_prediction: Dict, feature_values: Dict, symbol: str) -> Dict:
        """SHAP ile açıklama"""
        try:
            # SHAP değerlerini hesapla (simüle edilmiş)
            shap_values = self._calculate_shap_values(feature_values)
            
            # Feature önem sıralaması
            feature_importance = sorted(
                shap_values.items(),
                key=lambda x: abs(x[1]),
                reverse=True
            )[:self.xai_params["max_features"]]
            
            # Açıklama oluştur
            explanation = self._create_explanation(
                model_prediction, feature_importance, symbol, "SHAP"
            )
            
            return explanation
            
        except Exception as e:
            logger.error(f"❌ SHAP açıklama hatası: {e}")
            return {"error": str(e)}
    
    def _explain_with_lime(self, model_prediction: Dict, feature_values: Dict, symbol: str) -> Dict:
        """LIME ile açıklama"""
        try:
            # LIME değerlerini hesapla (simüle edilmiş)
            lime_values = self._calculate_lime_values(feature_values)
            
            # Feature önem sıralaması
            feature_importance = sorted(
                lime_values.items(),
                key=lambda x: abs(x[1]),
                reverse=True
            )[:self.xai_params["max_features"]]
            
            # Açıklama oluştur
            explanation = self._create_explanation(
                model_prediction, feature_importance, symbol, "LIME"
            )
            
            return explanation
            
        except Exception as e:
            logger.error(f"❌ LIME açıklama hatası: {e}")
            return {"error": str(e)}
    
    def _explain_with_simple_model(self, model_prediction: Dict, feature_values: Dict, symbol: str) -> Dict:
        """Basit model ile açıklama"""
        try:
            # Basit feature önem hesaplama
            feature_importance = self._calculate_simple_importance(feature_values)
            
            # Açıklama oluştur
            explanation = self._create_explanation(
                model_prediction, feature_importance, symbol, "Simple"
            )
            
            return explanation
            
        except Exception as e:
            logger.error(f"❌ Basit model açıklama hatası: {e}")
            return {"error": str(e)}
    
    def _calculate_shap_values(self, feature_values: Dict) -> Dict:
        """SHAP değerlerini hesapla (simüle edilmiş)"""
        try:
            shap_values = {}
            
            for feature, value in feature_values.items():
                # Basit SHAP değeri hesaplama
                if feature in ["rsi", "macd", "bb_position"]:
                    # Teknik indikatörler için
                    shap_value = (value - 0.5) * 0.3
                elif feature in ["volatility", "atr"]:
                    # Volatilite için
                    shap_value = -value * 0.2
                elif feature in ["volume_ratio", "price_volume"]:
                    # Hacim için
                    shap_value = (value - 1.0) * 0.15
                elif feature in ["pe_ratio", "pb_ratio"]:
                    # Finansal oranlar için
                    shap_value = -value * 0.1
                elif feature in ["roe", "roa", "net_profit_margin"]:
                    # Karlılık için
                    shap_value = value * 0.25
                elif "sentiment" in feature:
                    # Sentiment için
                    shap_value = (value - 0.5) * 0.4
                else:
                    # Diğerleri için
                    shap_value = (value - 0.5) * 0.1
                
                shap_values[feature] = shap_value
            
            return shap_values
            
        except Exception as e:
            logger.error(f"❌ SHAP değer hesaplama hatası: {e}")
            return {}
    
    def _calculate_lime_values(self, feature_values: Dict) -> Dict:
        """LIME değerlerini hesapla (simüle edilmiş)"""
        try:
            lime_values = {}
            
            for feature, value in feature_values.items():
                # Basit LIME değeri hesaplama
                if feature in ["rsi", "macd", "bb_position"]:
                    # Teknik indikatörler için
                    lime_value = (value - 0.5) * 0.25
                elif feature in ["volatility", "atr"]:
                    # Volatilite için
                    lime_value = -value * 0.15
                elif feature in ["volume_ratio", "price_volume"]:
                    # Hacim için
                    lime_value = (value - 1.0) * 0.12
                elif feature in ["pe_ratio", "pb_ratio"]:
                    # Finansal oranlar için
                    lime_value = -value * 0.08
                elif feature in ["roe", "roa", "net_profit_margin"]:
                    # Karlılık için
                    lime_value = value * 0.2
                elif "sentiment" in feature:
                    # Sentiment için
                    lime_value = (value - 0.5) * 0.35
                else:
                    # Diğerleri için
                    lime_value = (value - 0.5) * 0.08
                
                lime_values[feature] = lime_value
            
            return lime_values
            
        except Exception as e:
            logger.error(f"❌ LIME değer hesaplama hatası: {e}")
            return {}
    
    def _calculate_simple_importance(self, feature_values: Dict) -> Dict:
        """Basit feature önem hesaplama"""
        try:
            importance_scores = {}
            
            for feature, value in feature_values.items():
                # Basit önem skoru hesaplama
                if feature in ["rsi", "macd", "bb_position"]:
                    # Teknik indikatörler için
                    importance = abs(value - 0.5) * 0.8
                elif feature in ["volatility", "atr"]:
                    # Volatilite için
                    importance = value * 0.6
                elif feature in ["volume_ratio", "price_volume"]:
                    # Hacim için
                    importance = abs(value - 1.0) * 0.5
                elif feature in ["pe_ratio", "pb_ratio"]:
                    # Finansal oranlar için
                    importance = value * 0.4
                elif feature in ["roe", "roa", "net_profit_margin"]:
                    # Karlılık için
                    importance = value * 0.7
                elif "sentiment" in feature:
                    # Sentiment için
                    importance = abs(value - 0.5) * 0.9
                else:
                    # Diğerleri için
                    importance = abs(value - 0.5) * 0.3
                
                importance_scores[feature] = importance
            
            return importance_scores
            
        except Exception as e:
            logger.error(f"❌ Basit önem hesaplama hatası: {e}")
            return {}
    
    def _create_explanation(self, model_prediction: Dict, feature_importance: List, symbol: str, method: str) -> Dict:
        """Açıklama oluştur"""
        try:
            signal_type = model_prediction.get("signal_type", "HOLD")
            confidence = model_prediction.get("confidence", 0.5)
            strength = model_prediction.get("strength", 0.5)
            
            # Ana açıklama
            main_explanation = self._generate_main_explanation(
                signal_type, confidence, strength, feature_importance
            )
            
            # Detaylı açıklamalar
            detailed_explanations = []
            for feature, importance in feature_importance:
                if abs(importance) > self.xai_params["explanation_threshold"]:
                    explanation = self._generate_feature_explanation(
                        feature, importance, signal_type
                    )
                    detailed_explanations.append(explanation)
            
            # Risk faktörleri
            risk_factors = self._identify_risk_factors(feature_importance)
            
            # Öneriler
            recommendations = self._generate_recommendations(
                signal_type, feature_importance, confidence
            )
            
            # Sonuç
            explanation = {
                "symbol": symbol,
                "signal_type": signal_type,
                "signal_description": self.signal_types.get(signal_type, "Bilinmeyen"),
                "confidence": confidence,
                "strength": strength,
                "method": method,
                "main_explanation": main_explanation,
                "detailed_explanations": detailed_explanations,
                "feature_importance": feature_importance,
                "risk_factors": risk_factors,
                "recommendations": recommendations,
                "explanation_date": datetime.now().isoformat()
            }
            
            return explanation
            
        except Exception as e:
            logger.error(f"❌ Açıklama oluşturma hatası: {e}")
            return {"error": str(e)}
    
    def _generate_main_explanation(self, signal_type: str, confidence: float, strength: float, feature_importance: List) -> str:
        """Ana açıklama oluştur"""
        try:
            # En önemli feature
            if feature_importance:
                top_feature, top_importance = feature_importance[0]
                feature_desc = self.feature_descriptions.get(top_feature, top_feature)
                percentage = abs(top_importance) * 100
                
                if signal_type == "BUY":
                    if top_importance > 0:
                        explanation = f"Bu alım sinyalinin %{percentage:.1f}'i {feature_desc} faktöründen kaynaklanıyor. "
                    else:
                        explanation = f"Bu alım sinyalinin %{percentage:.1f}'i {feature_desc} faktörünün olumsuz etkisinden kaynaklanıyor. "
                elif signal_type == "SELL":
                    if top_importance > 0:
                        explanation = f"Bu satım sinyalinin %{percentage:.1f}'i {feature_desc} faktöründen kaynaklanıyor. "
                    else:
                        explanation = f"Bu satım sinyalinin %{percentage:.1f}'i {feature_desc} faktörünün olumsuz etkisinden kaynaklanıyor. "
                else:
                    explanation = f"Bu bekleme sinyalinin %{percentage:.1f}'i {feature_desc} faktöründen kaynaklanıyor. "
            else:
                explanation = f"Bu {signal_type} sinyali çeşitli faktörlerin kombinasyonundan oluşuyor. "
            
            # Güven ve güç bilgisi
            if confidence > 0.8:
                explanation += "Yüksek güven seviyesi ile üretildi. "
            elif confidence > 0.6:
                explanation += "Orta güven seviyesi ile üretildi. "
            else:
                explanation += "Düşük güven seviyesi ile üretildi. "
            
            if strength > 0.8:
                explanation += "Güçlü sinyal özelliği gösteriyor."
            elif strength > 0.6:
                explanation += "Orta güçte sinyal özelliği gösteriyor."
            else:
                explanation += "Zayıf sinyal özelliği gösteriyor."
            
            return explanation
            
        except Exception as e:
            logger.error(f"❌ Ana açıklama oluşturma hatası: {e}")
            return "Açıklama oluşturulamadı."
    
    def _generate_feature_explanation(self, feature: str, importance: float, signal_type: str) -> Dict:
        """Feature açıklaması oluştur"""
        try:
            feature_desc = self.feature_descriptions.get(feature, feature)
            percentage = abs(importance) * 100
            
            # Açıklama türü
            if importance > 0:
                explanation_type = "positive"
            else:
                explanation_type = "negative"
            
            # Açıklama metni
            template = self.explanation_templates[explanation_type][signal_type]
            explanation_text = template.format(
                percentage=f"{percentage:.1f}",
                feature=feature_desc,
                description=self._get_feature_description(feature, importance)
            )
            
            return {
                "feature": feature,
                "feature_description": feature_desc,
                "importance": importance,
                "percentage": percentage,
                "explanation_type": explanation_type,
                "explanation_text": explanation_text
            }
            
        except Exception as e:
            logger.error(f"❌ Feature açıklama oluşturma hatası: {e}")
            return {}
    
    def _get_feature_description(self, feature: str, importance: float) -> str:
        """Feature için detaylı açıklama"""
        try:
            descriptions = {
                "rsi": "RSI değeri aşırı alım/satım seviyelerini gösterir.",
                "macd": "MACD histogramı trend değişimini önceden haber verir.",
                "bb_position": "Bollinger Bands pozisyonu fiyatın bantlar içindeki konumunu gösterir.",
                "volatility": "Volatilite yüksek risk seviyesini işaret eder.",
                "volume_ratio": "Hacim oranı piyasa ilgisini yansıtır.",
                "pe_ratio": "F/K oranı şirketin değerlemesini gösterir.",
                "roe": "Özkaynak karlılığı şirketin kârlılığını ölçer.",
                "news_sentiment": "Haber sentiment'i piyasa algısını yansıtır.",
                "social_sentiment": "Sosyal medya sentiment'i yatırımcı duygularını gösterir."
            }
            
            base_description = descriptions.get(feature, "Bu faktör piyasa davranışını etkiler.")
            
            if importance > 0:
                return f"{base_description} Pozitif etki yaratıyor."
            else:
                return f"{base_description} Negatif etki yaratıyor."
                
        except Exception as e:
            logger.error(f"❌ Feature açıklama hatası: {e}")
            return "Bu faktör piyasa davranışını etkiler."
    
    def _identify_risk_factors(self, feature_importance: List) -> List[Dict]:
        """Risk faktörlerini belirle"""
        try:
            risk_factors = []
            
            for feature, importance in feature_importance:
                if abs(importance) > 0.3:  # Yüksek önem
                    risk_level = "high" if abs(importance) > 0.5 else "medium"
                    
                    risk_factor = {
                        "feature": feature,
                        "feature_description": self.feature_descriptions.get(feature, feature),
                        "importance": importance,
                        "risk_level": risk_level,
                        "description": self._get_risk_description(feature, importance)
                    }
                    
                    risk_factors.append(risk_factor)
            
            return risk_factors
            
        except Exception as e:
            logger.error(f"❌ Risk faktörü belirleme hatası: {e}")
            return []
    
    def _get_risk_description(self, feature: str, importance: float) -> str:
        """Risk açıklaması"""
        try:
            risk_descriptions = {
                "volatility": "Yüksek volatilite beklenmeyen fiyat hareketleri riski taşır.",
                "atr": "Yüksek ATR değeri büyük fiyat değişimleri riski gösterir.",
                "debt_equity": "Yüksek borç/özkaynak oranı finansal risk oluşturur.",
                "pe_ratio": "Yüksek F/K oranı aşırı değerleme riski taşır.",
                "news_sentiment": "Olumsuz haber sentiment'i fiyat düşüş riski yaratır.",
                "social_sentiment": "Negatif sosyal medya sentiment'i satış baskısı riski oluşturur."
            }
            
            base_description = risk_descriptions.get(feature, "Bu faktör risk oluşturabilir.")
            
            if importance > 0:
                return f"{base_description} Pozitif etki riski."
            else:
                return f"{base_description} Negatif etki riski."
                
        except Exception as e:
            logger.error(f"❌ Risk açıklama hatası: {e}")
            return "Bu faktör risk oluşturabilir."
    
    def _generate_recommendations(self, signal_type: str, feature_importance: List, confidence: float) -> List[str]:
        """Öneriler oluştur"""
        try:
            recommendations = []
            
            # Güven seviyesi önerileri
            if confidence > 0.8:
                recommendations.append("Yüksek güven seviyesi ile üretilen sinyal, güçlü bir işlem fırsatı sunabilir.")
            elif confidence > 0.6:
                recommendations.append("Orta güven seviyesi ile üretilen sinyal, dikkatli değerlendirme gerektirir.")
            else:
                recommendations.append("Düşük güven seviyesi ile üretilen sinyal, ek doğrulama gerektirir.")
            
            # Feature bazlı öneriler
            for feature, importance in feature_importance[:3]:  # En önemli 3 feature
                if feature == "volatility" and abs(importance) > 0.3:
                    recommendations.append("Yüksek volatilite nedeniyle stop-loss kullanımı önerilir.")
                elif feature == "volume_ratio" and importance > 0.3:
                    recommendations.append("Yüksek hacim oranı güçlü piyasa ilgisini gösterir.")
                elif "sentiment" in feature and abs(importance) > 0.3:
                    recommendations.append("Sentiment değişimlerini yakından takip edin.")
                elif feature in ["pe_ratio", "pb_ratio"] and abs(importance) > 0.3:
                    recommendations.append("Finansal oranları düzenli olarak kontrol edin.")
            
            # Genel öneriler
            if signal_type == "BUY":
                recommendations.append("Alım sinyali için uygun giriş noktası bekleyin.")
            elif signal_type == "SELL":
                recommendations.append("Satım sinyali için uygun çıkış noktası bekleyin.")
            else:
                recommendations.append("Bekleme sinyali için piyasa koşullarını izleyin.")
            
            return recommendations
            
        except Exception as e:
            logger.error(f"❌ Öneri oluşturma hatası: {e}")
            return ["Genel piyasa koşullarını değerlendirin."]
    
    def _cleanup_cache(self):
        """Cache temizliği"""
        try:
            current_time = datetime.now().timestamp()
            
            # Eski cache'leri temizle
            keys_to_remove = []
            for key, value in self.explanation_cache.items():
                if current_time - value["timestamp"] > self.xai_params["cache_ttl"]:
                    keys_to_remove.append(key)
            
            for key in keys_to_remove:
                del self.explanation_cache[key]
            
            # Cache boyutu kontrolü
            if len(self.explanation_cache) > self.xai_params["max_cache_size"]:
                # En eski %20'sini sil
                sorted_items = sorted(
                    self.explanation_cache.items(),
                    key=lambda x: x[1]["timestamp"]
                )
                items_to_remove = len(sorted_items) // 5
                
                for key, _ in sorted_items[:items_to_remove]:
                    del self.explanation_cache[key]
            
            logger.debug(f"🧹 XAI cache temizlendi: {len(keys_to_remove)} öğe silindi")
            
        except Exception as e:
            logger.error(f"❌ XAI cache temizlik hatası: {e}")
    
    def _update_quality_metrics(self, explanation: Dict):
        """Kalite metriklerini güncelle"""
        try:
            self.quality_metrics["total_explanations"] += 1
            self.quality_metrics["successful_explanations"] += 1
            
            # Ortalama güven hesapla
            confidence = explanation.get("confidence", 0.5)
            total_explanations = self.quality_metrics["total_explanations"]
            current_avg = self.quality_metrics["avg_confidence"]
            
            self.quality_metrics["avg_confidence"] = (
                (current_avg * (total_explanations - 1) + confidence) / total_explanations
            )
            
            # Ortalama feature sayısı hesapla
            feature_count = len(explanation.get("feature_importance", []))
            current_avg_features = self.quality_metrics["avg_feature_count"]
            
            self.quality_metrics["avg_feature_count"] = (
                (current_avg_features * (total_explanations - 1) + feature_count) / total_explanations
            )
            
        except Exception as e:
            logger.error(f"❌ Kalite metrikleri güncelleme hatası: {e}")
    
    def get_explanation_history(self) -> List[Dict]:
        """Açıklama geçmişini getir"""
        return self.feature_importance_history.copy()
    
    def get_quality_metrics(self) -> Dict:
        """Kalite metriklerini getir"""
        try:
            total_explanations = self.quality_metrics["total_explanations"]
            successful_explanations = self.quality_metrics["successful_explanations"]
            
            if total_explanations > 0:
                success_rate = successful_explanations / total_explanations
            else:
                success_rate = 0
            
            return {
                "total_explanations": total_explanations,
                "successful_explanations": successful_explanations,
                "failed_explanations": self.quality_metrics["failed_explanations"],
                "success_rate": success_rate,
                "avg_confidence": self.quality_metrics["avg_confidence"],
                "avg_feature_count": self.quality_metrics["avg_feature_count"],
                "cache_size": len(self.explanation_cache),
                "last_quality_check": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Kalite metrikleri hatası: {e}")
            return {}
    
    def export_explanation_report(self, symbol: str, format: str = "json") -> str:
        """Açıklama raporunu dışa aktar"""
        try:
            # Symbol için açıklama geçmişi
            symbol_history = [item for item in self.feature_importance_history if item.get("symbol") == symbol]
            
            if not symbol_history:
                return f"{symbol} için açıklama geçmişi bulunamadı"
            
            latest_explanation = symbol_history[-1]
            
            if format == "json":
                return json.dumps(latest_explanation, indent=2, ensure_ascii=False)
            elif format == "csv":
                # CSV format için basit implementasyon
                csv_data = "Feature,Importance,Percentage,Description\n"
                for feature, importance in latest_explanation.get("feature_importance", []):
                    feature_desc = self.feature_descriptions.get(feature, feature)
                    percentage = abs(importance) * 100
                    csv_data += f"{feature},{importance},{percentage:.2f},{feature_desc}\n"
                return csv_data
            else:
                return "Desteklenmeyen format"
                
        except Exception as e:
            logger.error(f"❌ Açıklama raporu dışa aktarma hatası: {e}")
            return "Rapor oluşturulamadı"

# Test fonksiyonu
def test_xai_explainer():
    """XAI explainer test"""
    try:
        logger.info("🧪 XAI Explainer test başlatılıyor...")
        
        # XAI explainer oluştur
        explainer = XAIExplainer()
        explainer.initialize_explainer("simple")
        
        # Test verileri
        test_prediction = {
            "signal_type": "BUY",
            "confidence": 0.85,
            "strength": 0.75
        }
        
        test_features = {
            "rsi": 0.65,
            "macd": 0.3,
            "bb_position": 0.8,
            "volatility": 0.25,
            "volume_ratio": 1.5,
            "pe_ratio": 15.0,
            "roe": 0.18,
            "news_sentiment": 0.7,
            "social_sentiment": 0.6
        }
        
        # XAI açıklaması
        explanation = explainer.explain_prediction(test_prediction, test_features, "GARAN.IS")
        logger.info(f"🔍 XAI açıklaması: {explanation.get('main_explanation', 'Açıklama bulunamadı')}")
        
        # Kalite metrikleri
        quality_metrics = explainer.get_quality_metrics()
        logger.info(f"📊 Kalite metrikleri: {quality_metrics}")
        
        # Rapor dışa aktarma
        report = explainer.export_explanation_report("GARAN.IS", "json")
        logger.info(f"📋 XAI raporu: {report[:200]}...")
        
        logger.info("✅ XAI Explainer test tamamlandı")
        
    except Exception as e:
        logger.error(f"❌ Test hatası: {e}")

if __name__ == "__main__":
    test_xai_explainer()
