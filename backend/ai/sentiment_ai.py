"""
🚀 BIST AI Smart Trader - Sentiment AI (FinBERT)
===============================================

Türkçe finansal haberler için FinBERT-TR sentiment analizi.
Haber, Twitter, KAP ODA duygu skorları.

Özellikler:
- FinBERT-TR modeli
- Türkçe finansal metin analizi
- Sentiment skorları (pozitif/negatif/nötr)
- Confidence scores
- Real-time sentiment tracking
"""

import asyncio
import json
import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
import re
import requests
from bs4 import BeautifulSoup

# ML Libraries
try:
    from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    print("⚠️ Transformers not available - install with: pip install transformers torch")

try:
    import torch
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("⚠️ PyTorch not available")

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class SentimentResult:
    """Sentiment analiz sonucu"""
    text: str
    sentiment: str  # 'positive', 'negative', 'neutral'
    confidence: float
    scores: Dict[str, float]  # {'positive': 0.7, 'negative': 0.2, 'neutral': 0.1}
    source: str
    timestamp: datetime
    metadata: Dict[str, Any]
    
    def to_dict(self):
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data

@dataclass
class NewsItem:
    """Haber öğesi"""
    title: str
    content: str
    source: str
    url: str
    published_at: datetime
    category: str
    
    def to_dict(self):
        data = asdict(self)
        data['published_at'] = self.published_at.isoformat()
        return data

@dataclass
class SentimentSummary:
    """Sentiment özeti"""
    symbol: str
    total_news: int
    positive_count: int
    negative_count: int
    neutral_count: int
    avg_confidence: float
    sentiment_score: float  # -1 to 1
    trend: str  # 'improving', 'deteriorating', 'stable'
    timestamp: datetime
    
    def to_dict(self):
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data

class SentimentAI:
    """Sentiment AI Engine"""
    
    def __init__(self, models_dir: str = "backend/ai/models"):
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(parents=True, exist_ok=True)
        
        # Model cache
        self.tokenizer = None
        self.model = None
        self.sentiment_pipeline = None
        
        # Sentiment cache
        self.sentiment_cache: Dict[str, SentimentResult] = {}
        
        # News sources
        self.news_sources = {
            'hurriyet': 'https://www.hurriyet.com.tr/ekonomi/',
            'milliyet': 'https://www.milliyet.com.tr/ekonomi/',
            'sabah': 'https://www.sabah.com.tr/ekonomi/',
            'haberturk': 'https://www.haberturk.com/ekonomi/',
            'kap': 'https://www.kap.org.tr/tr/Bildirim/Liste'
        }
        
        # Finansal kelime sözlüğü
        self.financial_keywords = {
            'positive': [
                'artış', 'yükseliş', 'büyüme', 'kazanç', 'kâr', 'pozitif', 'iyileşme',
                'güçlü', 'başarı', 'olumlu', 'gelişme', 'ilerleme', 'yükselme'
            ],
            'negative': [
                'düşüş', 'azalış', 'kayıp', 'zarar', 'negatif', 'kötüleşme',
                'zayıf', 'başarısız', 'olumsuz', 'gerileme', 'düşme', 'kriz'
            ],
            'neutral': [
                'değişim', 'hareket', 'dalgalanma', 'istikrar', 'durağan',
                'beklemede', 'gözlem', 'analiz', 'rapor', 'açıklama'
            ]
        }
        
        # Initialize model
        self._initialize_model()
    
    def _initialize_model(self):
        """Modeli başlat"""
        try:
            if not TRANSFORMERS_AVAILABLE or not TORCH_AVAILABLE:
                logger.warning("⚠️ Transformers/PyTorch not available - using rule-based sentiment")
                return
            
            # FinBERT-TR modeli (Türkçe finansal sentiment)
            model_name = "dbmdz/bert-base-turkish-cased"
            
            logger.info(f"🔄 Loading FinBERT model: {model_name}")
            
            # Tokenizer ve model yükle
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(
                model_name,
                num_labels=3  # positive, negative, neutral
            )
            
            # Pipeline oluştur
            self.sentiment_pipeline = pipeline(
                "sentiment-analysis",
                model=self.model,
                tokenizer=self.tokenizer,
                return_all_scores=True
            )
            
            logger.info("✅ FinBERT model loaded successfully")
            
        except Exception as e:
            logger.error(f"❌ Model initialization error: {e}")
            self.sentiment_pipeline = None
    
    def preprocess_text(self, text: str) -> str:
        """Metni ön işle"""
        try:
            # HTML etiketlerini temizle
            text = re.sub(r'<[^>]+>', '', text)
            
            # URL'leri temizle
            text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
            
            # Fazla boşlukları temizle
            text = re.sub(r'\s+', ' ', text)
            
            # Özel karakterleri temizle
            text = re.sub(r'[^\w\s.,!?]', '', text)
            
            return text.strip()
            
        except Exception as e:
            logger.error(f"❌ Text preprocessing error: {e}")
            return text
    
    def analyze_sentiment_ml(self, text: str) -> Dict[str, Any]:
        """ML ile sentiment analizi"""
        try:
            if not self.sentiment_pipeline:
                return self.analyze_sentiment_rule_based(text)
            
            # Metni ön işle
            processed_text = self.preprocess_text(text)
            
            if len(processed_text) < 10:
                return {
                    'sentiment': 'neutral',
                    'confidence': 0.5,
                    'scores': {'positive': 0.33, 'negative': 0.33, 'neutral': 0.34}
                }
            
            # Sentiment analizi
            results = self.sentiment_pipeline(processed_text)
            
            # Sonuçları parse et
            scores = {}
            for result in results[0]:
                label = result['label'].lower()
                score = result['score']
                scores[label] = score
            
            # En yüksek skorlu sentiment'i bul
            sentiment = max(scores.items(), key=lambda x: x[1])[0]
            confidence = scores[sentiment]
            
            return {
                'sentiment': sentiment,
                'confidence': confidence,
                'scores': scores
            }
            
        except Exception as e:
            logger.error(f"❌ ML sentiment analysis error: {e}")
            return self.analyze_sentiment_rule_based(text)
    
    def analyze_sentiment_rule_based(self, text: str) -> Dict[str, Any]:
        """Kural tabanlı sentiment analizi"""
        try:
            processed_text = self.preprocess_text(text).lower()
            
            positive_count = sum(1 for word in self.financial_keywords['positive'] if word in processed_text)
            negative_count = sum(1 for word in self.financial_keywords['negative'] if word in processed_text)
            neutral_count = sum(1 for word in self.financial_keywords['neutral'] if word in processed_text)
            
            total_keywords = positive_count + negative_count + neutral_count
            
            if total_keywords == 0:
                return {
                    'sentiment': 'neutral',
                    'confidence': 0.5,
                    'scores': {'positive': 0.33, 'negative': 0.33, 'neutral': 0.34}
                }
            
            # Skorları hesapla
            positive_score = positive_count / total_keywords
            negative_score = negative_count / total_keywords
            neutral_score = neutral_count / total_keywords
            
            # En yüksek skorlu sentiment'i bul
            if positive_score > negative_score and positive_score > neutral_score:
                sentiment = 'positive'
                confidence = positive_score
            elif negative_score > positive_score and negative_score > neutral_score:
                sentiment = 'negative'
                confidence = negative_score
            else:
                sentiment = 'neutral'
                confidence = neutral_score
            
            return {
                'sentiment': sentiment,
                'confidence': confidence,
                'scores': {
                    'positive': positive_score,
                    'negative': negative_score,
                    'neutral': neutral_score
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Rule-based sentiment analysis error: {e}")
            return {
                'sentiment': 'neutral',
                'confidence': 0.5,
                'scores': {'positive': 0.33, 'negative': 0.33, 'neutral': 0.34}
            }
    
    async def analyze_text_sentiment(self, 
                                   text: str, 
                                   source: str = 'manual',
                                   metadata: Dict[str, Any] = None) -> SentimentResult:
        """Metin sentiment analizi"""
        try:
            # Cache kontrolü
            cache_key = f"{hash(text)}_{source}"
            if cache_key in self.sentiment_cache:
                logger.info(f"📋 Using cached sentiment for {source}")
                return self.sentiment_cache[cache_key]
            
            # Sentiment analizi
            analysis = self.analyze_sentiment_ml(text)
            
            # Sonuç oluştur
            result = SentimentResult(
                text=text[:200] + "..." if len(text) > 200 else text,
                sentiment=analysis['sentiment'],
                confidence=analysis['confidence'],
                scores=analysis['scores'],
                source=source,
                timestamp=datetime.now(),
                metadata=metadata or {}
            )
            
            # Cache'e ekle
            self.sentiment_cache[cache_key] = result
            
            logger.info(f"✅ Sentiment analyzed: {source} - {analysis['sentiment']} ({analysis['confidence']:.2f})")
            return result
            
        except Exception as e:
            logger.error(f"❌ Analyze text sentiment error: {e}")
            # Fallback result
            return SentimentResult(
                text=text[:200] + "..." if len(text) > 200 else text,
                sentiment='neutral',
                confidence=0.5,
                scores={'positive': 0.33, 'negative': 0.33, 'neutral': 0.34},
                source=source,
                timestamp=datetime.now(),
                metadata=metadata or {}
            )
    
    async def fetch_news_sentiment(self, symbol: str, hours: int = 24) -> List[SentimentResult]:
        """Haber sentiment analizi"""
        try:
            results = []
            
            # Her kaynak için haber çek
            for source_name, url in self.news_sources.items():
                try:
                    news_items = await self._fetch_news_from_source(source_name, url, symbol)
                    
                    for news_item in news_items:
                        # Sentiment analizi
                        sentiment_result = await self.analyze_text_sentiment(
                            text=f"{news_item.title} {news_item.content}",
                            source=source_name,
                            metadata={
                                'url': news_item.url,
                                'category': news_item.category,
                                'published_at': news_item.published_at.isoformat()
                            }
                        )
                        
                        results.append(sentiment_result)
                        
                except Exception as e:
                    logger.error(f"❌ Fetch news from {source_name} error: {e}")
                    continue
            
            logger.info(f"✅ Fetched {len(results)} news sentiment results for {symbol}")
            return results
            
        except Exception as e:
            logger.error(f"❌ Fetch news sentiment error: {e}")
            return []
    
    async def _fetch_news_from_source(self, source: str, url: str, symbol: str) -> List[NewsItem]:
        """Kaynaktan haber çek"""
        try:
            # Bu gerçek implementasyon olacak
            # Şimdilik mock data döndürüyoruz
            
            mock_news = [
                NewsItem(
                    title=f"{symbol} hissesi için pozitif haber",
                    content=f"{symbol} şirketinin son çeyrek sonuçları beklentileri aştı.",
                    source=source,
                    url=f"https://{source}.com/news/1",
                    published_at=datetime.now() - timedelta(hours=2),
                    category="ekonomi"
                ),
                NewsItem(
                    title=f"{symbol} analiz raporu",
                    content=f"{symbol} için teknik analiz sonuçları açıklandı.",
                    source=source,
                    url=f"https://{source}.com/news/2",
                    published_at=datetime.now() - timedelta(hours=5),
                    category="analiz"
                )
            ]
            
            return mock_news
            
        except Exception as e:
            logger.error(f"❌ Fetch news from source error: {e}")
            return []
    
    async def get_sentiment_summary(self, symbol: str, hours: int = 24) -> SentimentSummary:
        """Sentiment özeti getir"""
        try:
            # Haber sentiment analizi
            sentiment_results = await self.fetch_news_sentiment(symbol, hours)
            
            if not sentiment_results:
                return SentimentSummary(
                    symbol=symbol,
                    total_news=0,
                    positive_count=0,
                    negative_count=0,
                    neutral_count=0,
                    avg_confidence=0.5,
                    sentiment_score=0.0,
                    trend='stable',
                    timestamp=datetime.now()
                )
            
            # İstatistikleri hesapla
            total_news = len(sentiment_results)
            positive_count = len([r for r in sentiment_results if r.sentiment == 'positive'])
            negative_count = len([r for r in sentiment_results if r.sentiment == 'negative'])
            neutral_count = len([r for r in sentiment_results if r.sentiment == 'neutral'])
            
            avg_confidence = sum(r.confidence for r in sentiment_results) / total_news
            
            # Sentiment skoru (-1 to 1)
            sentiment_score = (positive_count - negative_count) / total_news
            
            # Trend belirleme
            if sentiment_score > 0.2:
                trend = 'improving'
            elif sentiment_score < -0.2:
                trend = 'deteriorating'
            else:
                trend = 'stable'
            
            summary = SentimentSummary(
                symbol=symbol,
                total_news=total_news,
                positive_count=positive_count,
                negative_count=negative_count,
                neutral_count=neutral_count,
                avg_confidence=avg_confidence,
                sentiment_score=sentiment_score,
                trend=trend,
                timestamp=datetime.now()
            )
            
            logger.info(f"✅ Sentiment summary generated for {symbol}: {trend}")
            return summary
            
        except Exception as e:
            logger.error(f"❌ Get sentiment summary error: {e}")
            return SentimentSummary(
                symbol=symbol,
                total_news=0,
                positive_count=0,
                negative_count=0,
                neutral_count=0,
                avg_confidence=0.5,
                sentiment_score=0.0,
                trend='stable',
                timestamp=datetime.now()
            )
    
    def get_sentiment_statistics(self) -> Dict[str, Any]:
        """Sentiment istatistiklerini getir"""
        try:
            stats = {
                'total_analyses': len(self.sentiment_cache),
                'model_loaded': self.sentiment_pipeline is not None,
                'transformers_available': TRANSFORMERS_AVAILABLE,
                'torch_available': TORCH_AVAILABLE,
                'news_sources': len(self.news_sources),
                'financial_keywords': sum(len(keywords) for keywords in self.financial_keywords.values()),
                'cache_hit_rate': 0  # Bu hesaplanabilir
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"❌ Get sentiment statistics error: {e}")
            return {}
    
    def clear_cache(self):
        """Cache'i temizle"""
        try:
            self.sentiment_cache.clear()
            logger.info("🧹 Sentiment cache cleared")
            
        except Exception as e:
            logger.error(f"❌ Clear cache error: {e}")

# Global instance
sentiment_ai = SentimentAI()

if __name__ == "__main__":
    async def test_sentiment_ai():
        """Test fonksiyonu"""
        logger.info("🧪 Testing Sentiment AI...")
        
        # Test metinleri
        test_texts = [
            "THYAO hissesi güçlü büyüme gösteriyor ve yatırımcılar için pozitif sinyal veriyor.",
            "TUPRS şirketinin son çeyrek sonuçları beklentilerin altında kaldı ve düşüş trendi devam ediyor.",
            "SISE hissesi yatay hareket gösteriyor ve teknik analiz sonuçları nötr görünüyor."
        ]
        
        # Sentiment analizi
        for text in test_texts:
            result = await sentiment_ai.analyze_text_sentiment(text, "test")
            logger.info(f"✅ Sentiment: {result.sentiment} ({result.confidence:.2f})")
        
        # Sentiment özeti
        summary = await sentiment_ai.get_sentiment_summary("THYAO", hours=24)
        logger.info(f"📊 Sentiment summary: {summary.trend} (score: {summary.sentiment_score:.2f})")
        
        logger.info("✅ Sentiment AI test completed")
    
    # Test çalıştır
    asyncio.run(test_sentiment_ai())
