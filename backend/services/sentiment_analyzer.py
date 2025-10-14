"""
PRD v2.0 - Sentiment Entegrasyonu
FinBERT-TR, Twitter, KAP ODA ile haber/sentiment analizi
Türkçe finansal metin analizi ve duygu skoru
"""

import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Optional, Tuple, Any
import json
import re
import asyncio
import httpx
from collections import defaultdict

# Transformers import (fallback if not available)
try:
    from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    logging.warning("⚠️ Transformers bulunamadı, basit sentiment analizi kullanılacak")

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    """Finansal sentiment analizi"""
    
    def __init__(self):
        self.sentiment_model = None
        self.tokenizer = None
        self.sentiment_cache = {}
        self.news_cache = {}
        self.sentiment_history = []
        
        # Sentiment sözlükleri
        self.positive_words = {
            "yükseliş", "artış", "kazanç", "kâr", "başarı", "güçlü", "pozitif",
            "iyi", "mükemmel", "harika", "süper", "gelişme", "büyüme", "artma",
            "çıkış", "yukarı", "alım", "satın alma", "yatırım", "fırsat",
            "umut", "iyimser", "güven", "stabil", "sağlam", "güçlendirme"
        }
        
        self.negative_words = {
            "düşüş", "azalış", "zarar", "kayıp", "başarısız", "zayıf", "negatif",
            "kötü", "berbat", "felaket", "kriz", "çöküş", "küçülme", "azalma",
            "iniş", "aşağı", "satış", "satma", "risk", "tehlike", "korku",
            "karamsar", "güvensiz", "istikrarsız", "zayıflama", "düşme"
        }
        
        self.neutral_words = {
            "değişim", "hareket", "dalgalanma", "volatilite", "beklenti",
            "analiz", "rapor", "veri", "sonuç", "durum", "seviye", "oran"
        }
        
        # Finansal terimler
        self.financial_terms = {
            "hisse", "borsa", "piyasa", "sermaye", "yatırım", "portföy",
            "likidite", "volatilite", "risk", "getiri", "kâr", "zarar",
            "fiyat", "değer", "oran", "endeks", "sektör", "şirket"
        }
        
        # Sentiment ağırlıkları
        self.sentiment_weights = {
            "news": 0.4,
            "social_media": 0.3,
            "kap_oda": 0.3
        }
        
        # Model parametreleri
        self.model_params = {
            "max_length": 512,
            "truncation": True,
            "padding": True,
            "return_tensors": "pt"
        }
        
        # Cache parametreleri
        self.cache_ttl = 3600  # 1 saat
        self.max_cache_size = 1000
        
        # API endpoints (simüle edilmiş)
        self.api_endpoints = {
            "twitter": "https://api.twitter.com/v2/tweets/search/recent",
            "news": "https://newsapi.org/v2/everything",
            "kap_oda": "https://www.kap.org.tr/tr/Bildirim"
        }
        
        # Veri kalitesi metrikleri
        self.quality_metrics = {
            "total_analyses": 0,
            "successful_analyses": 0,
            "failed_analyses": 0,
            "avg_confidence": 0,
            "last_quality_check": None
        }
    
    def initialize_model(self):
        """Sentiment modelini başlat"""
        try:
            if TRANSFORMERS_AVAILABLE:
                # FinBERT-TR modeli (simüle edilmiş)
                model_name = "dbmdz/bert-base-turkish-cased"
                
                try:
                    self.tokenizer = AutoTokenizer.from_pretrained(model_name)
                    self.sentiment_model = AutoModelForSequenceClassification.from_pretrained(model_name)
                    logger.info("✅ FinBERT-TR modeli yüklendi")
                except Exception as e:
                    logger.warning(f"⚠️ FinBERT-TR yüklenemedi: {e}")
                    self._initialize_simple_model()
            else:
                self._initialize_simple_model()
                
        except Exception as e:
            logger.error(f"❌ Model başlatma hatası: {e}")
            self._initialize_simple_model()
    
    def _initialize_simple_model(self):
        """Basit sentiment modeli başlat"""
        try:
            logger.info("🔧 Basit sentiment modeli başlatılıyor...")
            
            # Basit kural tabanlı model
            self.sentiment_model = "simple_rule_based"
            self.tokenizer = "simple_tokenizer"
            
            logger.info("✅ Basit sentiment modeli hazır")
            
        except Exception as e:
            logger.error(f"❌ Basit model başlatma hatası: {e}")
    
    def analyze_text_sentiment(self, text: str) -> Dict:
        """Metin sentiment analizi"""
        try:
            if not text or len(text.strip()) == 0:
                return {"sentiment": "neutral", "confidence": 0.5, "score": 0.0}
            
            # Cache kontrolü
            cache_key = hash(text)
            if cache_key in self.sentiment_cache:
                cached_result = self.sentiment_cache[cache_key]
                if datetime.now().timestamp() - cached_result["timestamp"] < self.cache_ttl:
                    return cached_result["result"]
            
            # Sentiment analizi
            if self.sentiment_model == "simple_rule_based":
                result = self._analyze_with_simple_model(text)
            else:
                result = self._analyze_with_transformer_model(text)
            
            # Cache'e kaydet
            self.sentiment_cache[cache_key] = {
                "result": result,
                "timestamp": datetime.now().timestamp()
            }
            
            # Cache boyutu kontrolü
            if len(self.sentiment_cache) > self.max_cache_size:
                self._cleanup_cache()
            
            # Metrikleri güncelle
            self._update_quality_metrics(result)
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Metin sentiment analizi hatası: {e}")
            return {"sentiment": "neutral", "confidence": 0.5, "score": 0.0}
    
    def _analyze_with_simple_model(self, text: str) -> Dict:
        """Basit kural tabanlı sentiment analizi"""
        try:
            # Metni temizle ve küçük harfe çevir
            clean_text = re.sub(r'[^\w\s]', ' ', text.lower())
            words = clean_text.split()
            
            # Kelime sayıları
            positive_count = sum(1 for word in words if word in self.positive_words)
            negative_count = sum(1 for word in words if word in self.negative_words)
            neutral_count = sum(1 for word in words if word in self.neutral_words)
            financial_count = sum(1 for word in words if word in self.financial_terms)
            
            # Sentiment skoru hesapla
            total_words = len(words)
            if total_words == 0:
                return {"sentiment": "neutral", "confidence": 0.5, "score": 0.0}
            
            # Ağırlıklı skor
            positive_score = positive_count / total_words
            negative_score = negative_count / total_words
            neutral_score = neutral_count / total_words
            
            # Finansal terim bonusu
            financial_bonus = min(financial_count / total_words, 0.2)
            
            # Net skor
            net_score = positive_score - negative_score
            confidence = min(abs(net_score) + financial_bonus, 1.0)
            
            # Sentiment belirleme
            if net_score > 0.1:
                sentiment = "positive"
            elif net_score < -0.1:
                sentiment = "negative"
            else:
                sentiment = "neutral"
            
            return {
                "sentiment": sentiment,
                "confidence": confidence,
                "score": net_score,
                "positive_words": positive_count,
                "negative_words": negative_count,
                "neutral_words": neutral_count,
                "financial_terms": financial_count,
                "total_words": total_words
            }
            
        except Exception as e:
            logger.error(f"❌ Basit model analizi hatası: {e}")
            return {"sentiment": "neutral", "confidence": 0.5, "score": 0.0}
    
    def _analyze_with_transformer_model(self, text: str) -> Dict:
        """Transformer modeli ile sentiment analizi"""
        try:
            # Tokenize
            inputs = self.tokenizer(
                text,
                max_length=self.model_params["max_length"],
                truncation=self.model_params["truncation"],
                padding=self.model_params["padding"],
                return_tensors=self.model_params["return_tensors"]
            )
            
            # Model tahmini
            with torch.no_grad():
                outputs = self.sentiment_model(**inputs)
                predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
            
            # Sonuçları çıkar
            sentiment_scores = predictions[0].tolist()
            sentiment_labels = ["negative", "neutral", "positive"]
            
            # En yüksek skor
            max_score = max(sentiment_scores)
            max_index = sentiment_scores.index(max_score)
            sentiment = sentiment_labels[max_index]
            
            return {
                "sentiment": sentiment,
                "confidence": max_score,
                "score": sentiment_scores[2] - sentiment_scores[0],  # positive - negative
                "all_scores": dict(zip(sentiment_labels, sentiment_scores))
            }
            
        except Exception as e:
            logger.error(f"❌ Transformer model analizi hatası: {e}")
            return {"sentiment": "neutral", "confidence": 0.5, "score": 0.0}
    
    def _cleanup_cache(self):
        """Cache temizliği"""
        try:
            current_time = datetime.now().timestamp()
            
            # Eski cache'leri temizle
            keys_to_remove = []
            for key, value in self.sentiment_cache.items():
                if current_time - value["timestamp"] > self.cache_ttl:
                    keys_to_remove.append(key)
            
            for key in keys_to_remove:
                del self.sentiment_cache[key]
            
            # Cache boyutu kontrolü
            if len(self.sentiment_cache) > self.max_cache_size:
                # En eski %20'sini sil
                sorted_items = sorted(
                    self.sentiment_cache.items(),
                    key=lambda x: x[1]["timestamp"]
                )
                items_to_remove = len(sorted_items) // 5
                
                for key, _ in sorted_items[:items_to_remove]:
                    del self.sentiment_cache[key]
            
            logger.debug(f"🧹 Cache temizlendi: {len(keys_to_remove)} öğe silindi")
            
        except Exception as e:
            logger.error(f"❌ Cache temizlik hatası: {e}")
    
    def _update_quality_metrics(self, result: Dict):
        """Kalite metriklerini güncelle"""
        try:
            self.quality_metrics["total_analyses"] += 1
            self.quality_metrics["successful_analyses"] += 1
            
            # Ortalama güven hesapla
            confidence = result.get("confidence", 0.5)
            total_analyses = self.quality_metrics["total_analyses"]
            current_avg = self.quality_metrics["avg_confidence"]
            
            self.quality_metrics["avg_confidence"] = (
                (current_avg * (total_analyses - 1) + confidence) / total_analyses
            )
            
        except Exception as e:
            logger.error(f"❌ Kalite metrikleri güncelleme hatası: {e}")
    
    async def get_news_sentiment(self, symbol: str, days: int = 7) -> Dict:
        """Haber sentiment analizi"""
        try:
            logger.info(f"📰 {symbol} için haber sentiment analizi başlatılıyor...")
            
            # Cache kontrolü
            cache_key = f"news_{symbol}_{days}"
            if cache_key in self.news_cache:
                cached_result = self.news_cache[cache_key]
                if datetime.now().timestamp() - cached_result["timestamp"] < self.cache_ttl:
                    return cached_result["result"]
            
            # Haber verilerini çek
            news_data = await self._fetch_news_data(symbol, days)
            
            if not news_data:
                return {"sentiment": "neutral", "confidence": 0.5, "score": 0.0, "news_count": 0}
            
            # Her haber için sentiment analizi
            sentiment_scores = []
            confidence_scores = []
            
            for news_item in news_data:
                text = f"{news_item.get('title', '')} {news_item.get('description', '')}"
                sentiment_result = self.analyze_text_sentiment(text)
                
                sentiment_scores.append(sentiment_result["score"])
                confidence_scores.append(sentiment_result["confidence"])
            
            # Ortalama sentiment
            if sentiment_scores:
                avg_sentiment_score = np.mean(sentiment_scores)
                avg_confidence = np.mean(confidence_scores)
                
                # Sentiment belirleme
                if avg_sentiment_score > 0.1:
                    sentiment = "positive"
                elif avg_sentiment_score < -0.1:
                    sentiment = "negative"
                else:
                    sentiment = "neutral"
                
                result = {
                    "sentiment": sentiment,
                    "confidence": avg_confidence,
                    "score": avg_sentiment_score,
                    "news_count": len(news_data),
                    "news_data": news_data,
                    "analysis_date": datetime.now().isoformat()
                }
            else:
                result = {"sentiment": "neutral", "confidence": 0.5, "score": 0.0, "news_count": 0}
            
            # Cache'e kaydet
            self.news_cache[cache_key] = {
                "result": result,
                "timestamp": datetime.now().timestamp()
            }
            
            logger.info(f"✅ {symbol} haber sentiment analizi tamamlandı")
            return result
            
        except Exception as e:
            logger.error(f"❌ {symbol} haber sentiment hatası: {e}")
            return {"sentiment": "neutral", "confidence": 0.5, "score": 0.0, "news_count": 0}
    
    async def _fetch_news_data(self, symbol: str, days: int) -> List[Dict]:
        """Haber verilerini çek"""
        try:
            # Simüle edilmiş haber verisi
            news_data = []
            
            # Son N gün için haber oluştur
            for i in range(days):
                date = datetime.now() - timedelta(days=i)
                
                # Rastgele haber içeriği
                news_templates = [
                    f"{symbol} hissesi güçlü performans gösteriyor",
                    f"{symbol} şirketi yeni yatırım planı açıkladı",
                    f"{symbol} hissesi piyasa beklentilerini aştı",
                    f"{symbol} şirketi kâr marjlarını artırdı",
                    f"{symbol} hissesi düşüş trendinde",
                    f"{symbol} şirketi zorlu piyasa koşullarıyla karşılaşıyor",
                    f"{symbol} hissesi volatilite yaşıyor",
                    f"{symbol} şirketi sektör ortalamasında"
                ]
                
                # Rastgele haber seç
                template = np.random.choice(news_templates)
                
                news_item = {
                    "title": template,
                    "description": f"{template} - Detaylı analiz ve yorumlar",
                    "date": date.isoformat(),
                    "source": "Simulated News",
                    "url": f"https://example.com/news/{symbol}_{i}",
                    "sentiment": "positive" if "güçlü" in template or "artırdı" in template else "negative" if "düşüş" in template or "zorlu" in template else "neutral"
                }
                
                news_data.append(news_item)
            
            return news_data
            
        except Exception as e:
            logger.error(f"❌ Haber verisi çekme hatası: {e}")
            return []
    
    async def get_social_media_sentiment(self, symbol: str, days: int = 7) -> Dict:
        """Sosyal medya sentiment analizi"""
        try:
            logger.info(f"🐦 {symbol} için sosyal medya sentiment analizi başlatılıyor...")
            
            # Cache kontrolü
            cache_key = f"social_{symbol}_{days}"
            if cache_key in self.news_cache:
                cached_result = self.news_cache[cache_key]
                if datetime.now().timestamp() - cached_result["timestamp"] < self.cache_ttl:
                    return cached_result["result"]
            
            # Sosyal medya verilerini çek
            social_data = await self._fetch_social_media_data(symbol, days)
            
            if not social_data:
                return {"sentiment": "neutral", "confidence": 0.5, "score": 0.0, "post_count": 0}
            
            # Her post için sentiment analizi
            sentiment_scores = []
            confidence_scores = []
            
            for post in social_data:
                text = post.get("text", "")
                sentiment_result = self.analyze_text_sentiment(text)
                
                sentiment_scores.append(sentiment_result["score"])
                confidence_scores.append(sentiment_result["confidence"])
            
            # Ortalama sentiment
            if sentiment_scores:
                avg_sentiment_score = np.mean(sentiment_scores)
                avg_confidence = np.mean(confidence_scores)
                
                # Sentiment belirleme
                if avg_sentiment_score > 0.1:
                    sentiment = "positive"
                elif avg_sentiment_score < -0.1:
                    sentiment = "negative"
                else:
                    sentiment = "neutral"
                
                result = {
                    "sentiment": sentiment,
                    "confidence": avg_confidence,
                    "score": avg_sentiment_score,
                    "post_count": len(social_data),
                    "social_data": social_data,
                    "analysis_date": datetime.now().isoformat()
                }
            else:
                result = {"sentiment": "neutral", "confidence": 0.5, "score": 0.0, "post_count": 0}
            
            # Cache'e kaydet
            self.news_cache[cache_key] = {
                "result": result,
                "timestamp": datetime.now().timestamp()
            }
            
            logger.info(f"✅ {symbol} sosyal medya sentiment analizi tamamlandı")
            return result
            
        except Exception as e:
            logger.error(f"❌ {symbol} sosyal medya sentiment hatası: {e}")
            return {"sentiment": "neutral", "confidence": 0.5, "score": 0.0, "post_count": 0}
    
    async def _fetch_social_media_data(self, symbol: str, days: int) -> List[Dict]:
        """Sosyal medya verilerini çek"""
        try:
            # Simüle edilmiş sosyal medya verisi
            social_data = []
            
            # Son N gün için post oluştur
            for i in range(days * 5):  # Günde 5 post
                date = datetime.now() - timedelta(hours=i*5)
                
                # Rastgele post içeriği
                post_templates = [
                    f"{symbol} hissesi çok güçlü görünüyor! 🚀",
                    f"{symbol} şirketi harika bir performans sergiliyor",
                    f"{symbol} hissesi düşüş trendinde, dikkatli olun",
                    f"{symbol} şirketi zorlu dönemden geçiyor",
                    f"{symbol} hissesi volatilite yaşıyor",
                    f"{symbol} şirketi sektör ortalamasında",
                    f"{symbol} hissesi için umutlu görünüyor",
                    f"{symbol} şirketi güvenilir bir yatırım"
                ]
                
                # Rastgele post seç
                template = np.random.choice(post_templates)
                
                post = {
                    "text": template,
                    "date": date.isoformat(),
                    "source": "Twitter",
                    "author": f"user_{i}",
                    "likes": np.random.randint(0, 100),
                    "retweets": np.random.randint(0, 50),
                    "sentiment": "positive" if "🚀" in template or "harika" in template else "negative" if "düşüş" in template or "zorlu" in template else "neutral"
                }
                
                social_data.append(post)
            
            return social_data
            
        except Exception as e:
            logger.error(f"❌ Sosyal medya verisi çekme hatası: {e}")
            return []
    
    async def get_kap_oda_sentiment(self, symbol: str, days: int = 7) -> Dict:
        """KAP ODA sentiment analizi"""
        try:
            logger.info(f"📋 {symbol} için KAP ODA sentiment analizi başlatılıyor...")
            
            # Cache kontrolü
            cache_key = f"kap_{symbol}_{days}"
            if cache_key in self.news_cache:
                cached_result = self.news_cache[cache_key]
                if datetime.now().timestamp() - cached_result["timestamp"] < self.cache_ttl:
                    return cached_result["result"]
            
            # KAP ODA verilerini çek
            kap_data = await self._fetch_kap_oda_data(symbol, days)
            
            if not kap_data:
                return {"sentiment": "neutral", "confidence": 0.5, "score": 0.0, "announcement_count": 0}
            
            # Her duyuru için sentiment analizi
            sentiment_scores = []
            confidence_scores = []
            
            for announcement in kap_data:
                text = f"{announcement.get('title', '')} {announcement.get('content', '')}"
                sentiment_result = self.analyze_text_sentiment(text)
                
                sentiment_scores.append(sentiment_result["score"])
                confidence_scores.append(sentiment_result["confidence"])
            
            # Ortalama sentiment
            if sentiment_scores:
                avg_sentiment_score = np.mean(sentiment_scores)
                avg_confidence = np.mean(confidence_scores)
                
                # Sentiment belirleme
                if avg_sentiment_score > 0.1:
                    sentiment = "positive"
                elif avg_sentiment_score < -0.1:
                    sentiment = "negative"
                else:
                    sentiment = "neutral"
                
                result = {
                    "sentiment": sentiment,
                    "confidence": avg_confidence,
                    "score": avg_sentiment_score,
                    "announcement_count": len(kap_data),
                    "kap_data": kap_data,
                    "analysis_date": datetime.now().isoformat()
                }
            else:
                result = {"sentiment": "neutral", "confidence": 0.5, "score": 0.0, "announcement_count": 0}
            
            # Cache'e kaydet
            self.news_cache[cache_key] = {
                "result": result,
                "timestamp": datetime.now().timestamp()
            }
            
            logger.info(f"✅ {symbol} KAP ODA sentiment analizi tamamlandı")
            return result
            
        except Exception as e:
            logger.error(f"❌ {symbol} KAP ODA sentiment hatası: {e}")
            return {"sentiment": "neutral", "confidence": 0.5, "score": 0.0, "announcement_count": 0}
    
    async def _fetch_kap_oda_data(self, symbol: str, days: int) -> List[Dict]:
        """KAP ODA verilerini çek"""
        try:
            # Simüle edilmiş KAP ODA verisi
            kap_data = []
            
            # Son N gün için duyuru oluştur
            for i in range(days):
                date = datetime.now() - timedelta(days=i)
                
                # Rastgele duyuru içeriği
                announcement_templates = [
                    f"{symbol} şirketi kâr artışı duyurusu",
                    f"{symbol} şirketi yeni yatırım projesi",
                    f"{symbol} şirketi ortaklık anlaşması",
                    f"{symbol} şirketi finansal sonuçları",
                    f"{symbol} şirketi yönetim kurulu kararı",
                    f"{symbol} şirketi sektör gelişmeleri",
                    f"{symbol} şirketi pazar durumu",
                    f"{symbol} şirketi stratejik plan"
                ]
                
                # Rastgele duyuru seç
                template = np.random.choice(announcement_templates)
                
                announcement = {
                    "title": template,
                    "content": f"{template} - Detaylı bilgi ve açıklamalar",
                    "date": date.isoformat(),
                    "source": "KAP ODA",
                    "url": f"https://www.kap.org.tr/tr/Bildirim/{symbol}_{i}",
                    "type": "financial",
                    "sentiment": "positive" if "artış" in template or "yatırım" in template else "negative" if "kayıp" in template else "neutral"
                }
                
                kap_data.append(announcement)
            
            return kap_data
            
        except Exception as e:
            logger.error(f"❌ KAP ODA verisi çekme hatası: {e}")
            return []
    
    async def get_comprehensive_sentiment(self, symbol: str, days: int = 7) -> Dict:
        """Kapsamlı sentiment analizi"""
        try:
            logger.info(f"🔍 {symbol} için kapsamlı sentiment analizi başlatılıyor...")
            
            # Tüm kaynaklardan sentiment analizi
            news_sentiment = await self.get_news_sentiment(symbol, days)
            social_sentiment = await self.get_social_media_sentiment(symbol, days)
            kap_sentiment = await self.get_kap_oda_sentiment(symbol, days)
            
            # Ağırlıklı ortalama
            weighted_score = (
                news_sentiment["score"] * self.sentiment_weights["news"] +
                social_sentiment["score"] * self.sentiment_weights["social_media"] +
                kap_sentiment["score"] * self.sentiment_weights["kap_oda"]
            )
            
            weighted_confidence = (
                news_sentiment["confidence"] * self.sentiment_weights["news"] +
                social_sentiment["confidence"] * self.sentiment_weights["social_media"] +
                kap_sentiment["confidence"] * self.sentiment_weights["kap_oda"]
            )
            
            # Sentiment belirleme
            if weighted_score > 0.1:
                overall_sentiment = "positive"
            elif weighted_score < -0.1:
                overall_sentiment = "negative"
            else:
                overall_sentiment = "neutral"
            
            # Sonuç
            result = {
                "symbol": symbol,
                "overall_sentiment": overall_sentiment,
                "overall_score": weighted_score,
                "overall_confidence": weighted_confidence,
                "news_sentiment": news_sentiment,
                "social_sentiment": social_sentiment,
                "kap_sentiment": kap_sentiment,
                "weights": self.sentiment_weights,
                "analysis_date": datetime.now().isoformat()
            }
            
            # Geçmişe kaydet
            self.sentiment_history.append(result)
            
            logger.info(f"✅ {symbol} kapsamlı sentiment analizi tamamlandı")
            logger.info(f"📊 Genel sentiment: {overall_sentiment} (Skor: {weighted_score:.3f})")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ {symbol} kapsamlı sentiment hatası: {e}")
            return {"error": str(e)}
    
    def get_sentiment_history(self) -> List[Dict]:
        """Sentiment geçmişini getir"""
        return self.sentiment_history.copy()
    
    def get_quality_metrics(self) -> Dict:
        """Kalite metriklerini getir"""
        try:
            total_analyses = self.quality_metrics["total_analyses"]
            successful_analyses = self.quality_metrics["successful_analyses"]
            
            if total_analyses > 0:
                success_rate = successful_analyses / total_analyses
            else:
                success_rate = 0
            
            return {
                "total_analyses": total_analyses,
                "successful_analyses": successful_analyses,
                "failed_analyses": self.quality_metrics["failed_analyses"],
                "success_rate": success_rate,
                "avg_confidence": self.quality_metrics["avg_confidence"],
                "cache_size": len(self.sentiment_cache),
                "news_cache_size": len(self.news_cache),
                "last_quality_check": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Kalite metrikleri hatası: {e}")
            return {}
    
    def export_sentiment_report(self, symbol: str, format: str = "json") -> str:
        """Sentiment raporunu dışa aktar"""
        try:
            # Symbol için sentiment geçmişi
            symbol_history = [item for item in self.sentiment_history if item.get("symbol") == symbol]
            
            if not symbol_history:
                return f"{symbol} için sentiment geçmişi bulunamadı"
            
            latest_sentiment = symbol_history[-1]
            
            if format == "json":
                return json.dumps(latest_sentiment, indent=2, ensure_ascii=False)
            elif format == "csv":
                # CSV format için basit implementasyon
                csv_data = "Source,Sentiment,Score,Confidence,Count\n"
                csv_data += f"News,{latest_sentiment['news_sentiment']['sentiment']},{latest_sentiment['news_sentiment']['score']},{latest_sentiment['news_sentiment']['confidence']},{latest_sentiment['news_sentiment']['news_count']}\n"
                csv_data += f"Social,{latest_sentiment['social_sentiment']['sentiment']},{latest_sentiment['social_sentiment']['score']},{latest_sentiment['social_sentiment']['confidence']},{latest_sentiment['social_sentiment']['post_count']}\n"
                csv_data += f"KAP,{latest_sentiment['kap_sentiment']['sentiment']},{latest_sentiment['kap_sentiment']['score']},{latest_sentiment['kap_sentiment']['confidence']},{latest_sentiment['kap_sentiment']['announcement_count']}\n"
                return csv_data
            else:
                return "Desteklenmeyen format"
                
        except Exception as e:
            logger.error(f"❌ Sentiment raporu dışa aktarma hatası: {e}")
            return "Rapor oluşturulamadı"

# Test fonksiyonu
async def test_sentiment_analyzer():
    """Sentiment analyzer test"""
    try:
        logger.info("🧪 Sentiment Analyzer test başlatılıyor...")
        
        # Sentiment analyzer oluştur
        analyzer = SentimentAnalyzer()
        analyzer.initialize_model()
        
        # Test metinleri
        test_texts = [
            "GARAN hissesi çok güçlü performans gösteriyor ve yatırımcılar memnun",
            "AKBNK şirketi zorlu piyasa koşullarıyla karşılaşıyor",
            "THYAO hissesi volatilite yaşıyor ve belirsizlik var"
        ]
        
        # Metin sentiment analizi
        for text in test_texts:
            result = analyzer.analyze_text_sentiment(text)
            logger.info(f"📊 Metin: {text[:50]}...")
            logger.info(f"   Sentiment: {result['sentiment']}, Skor: {result['score']:.3f}")
        
        # Kapsamlı sentiment analizi
        test_symbol = "GARAN.IS"
        comprehensive_result = await analyzer.get_comprehensive_sentiment(test_symbol, days=3)
        logger.info(f"🔍 {test_symbol} kapsamlı sentiment: {comprehensive_result['overall_sentiment']}")
        
        # Kalite metrikleri
        quality_metrics = analyzer.get_quality_metrics()
        logger.info(f"📊 Kalite metrikleri: {quality_metrics}")
        
        # Rapor dışa aktarma
        report = analyzer.export_sentiment_report(test_symbol, "json")
        logger.info(f"📋 Sentiment raporu: {report[:200]}...")
        
        logger.info("✅ Sentiment Analyzer test tamamlandı")
        
    except Exception as e:
        logger.error(f"❌ Test hatası: {e}")

if __name__ == "__main__":
    asyncio.run(test_sentiment_analyzer())
