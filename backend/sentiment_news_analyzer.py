#!/usr/bin/env python3
"""
🚀 Sentiment & News Analysis - SPRINT 3
BIST AI Smart Trader v2.0 - %80+ Doğruluk Hedefi

Haber ve sentiment analizi ile doğruluğu artırma:
- FinBERT-TR Integration
- News Aggregation
- Event Detection
- Sentiment Scoring
"""

import asyncio
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
import pandas as pd
import numpy as np
import requests
import json
import re
from dataclasses import dataclass
# from textblob import TextBlob  # Not needed for now

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class NewsItem:
    """Haber öğesi"""
    title: str
    content: str
    source: str
    url: str
    published_at: datetime
    sentiment_score: float = 0.0
    sentiment_label: str = "neutral"
    relevance_score: float = 0.0
    keywords: List[str] = None

@dataclass
class SentimentAnalysis:
    """Sentiment analiz sonucu"""
    symbol: str
    timestamp: datetime
    
    # Overall sentiment
    overall_sentiment: float = 0.0
    sentiment_label: str = "neutral"
    
    # News sentiment
    news_sentiment_score: float = 0.0
    news_count: int = 0
    positive_news_count: int = 0
    negative_news_count: int = 0
    neutral_news_count: int = 0
    
    # Social media sentiment
    social_sentiment_score: float = 0.0
    social_mention_count: int = 0
    
    # Event sentiment
    event_sentiment_score: float = 0.0
    upcoming_events: List[Dict] = None
    
    # Confidence
    confidence: float = 0.0

class NewsAggregator:
    """Haber toplayıcı"""
    
    def __init__(self):
        self.sources = {
            'reuters': 'https://www.reuters.com',
            'bloomberg': 'https://www.bloomberg.com',
            'yahoo_finance': 'https://finance.yahoo.com',
            'investing': 'https://tr.investing.com'
        }
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'BIST-AI-Trader/2.0'
        })
    
    async def search_company_news(self, symbol: str, company_name: str = "", days: int = 7) -> List[NewsItem]:
        """Şirket haberlerini ara"""
        try:
            # Simplified news search (mock data for now)
            # In production, this would integrate with real news APIs
            
            mock_news = [
                {
                    'title': f'{company_name or symbol} Finansal Performans Raporu',
                    'content': f'{company_name or symbol} şirketi güçlü finansal performans sergiledi. Gelir artışı ve kâr marjı iyileşmesi kaydedildi.',
                    'source': 'Financial News',
                    'url': f'https://example.com/news/{symbol}',
                    'published_at': datetime.now() - timedelta(days=1),
                    'sentiment_score': 0.8,
                    'sentiment_label': 'positive',
                    'relevance_score': 0.9,
                    'keywords': ['finansal', 'performans', 'gelir', 'kâr']
                },
                {
                    'title': f'{company_name or symbol} Yeni Yatırım Projesi',
                    'content': f'{company_name or symbol} şirketi yeni yatırım projesi başlattı. Bu proje şirketin büyüme stratejisinin bir parçası.',
                    'source': 'Business News',
                    'url': f'https://example.com/business/{symbol}',
                    'published_at': datetime.now() - timedelta(days=2),
                    'sentiment_score': 0.6,
                    'sentiment_label': 'positive',
                    'relevance_score': 0.8,
                    'keywords': ['yatırım', 'proje', 'büyüme', 'strateji']
                },
                {
                    'title': f'{company_name or symbol} Piyasa Analizi',
                    'content': f'{company_name or symbol} hissesi piyasada karışık sinyaller veriyor. Teknik analiz ve temel analiz farklı sonuçlar gösteriyor.',
                    'source': 'Market Analysis',
                    'url': f'https://example.com/analysis/{symbol}',
                    'published_at': datetime.now() - timedelta(days=3),
                    'sentiment_score': 0.0,
                    'sentiment_label': 'neutral',
                    'relevance_score': 0.7,
                    'keywords': ['piyasa', 'analiz', 'teknik', 'temel']
                }
            ]
            
            # Filter by days
            cutoff_date = datetime.now() - timedelta(days=days)
            filtered_news = [
                news for news in mock_news 
                if news['published_at'] >= cutoff_date
            ]
            
            # Convert to NewsItem objects
            news_items = []
            for news in filtered_news:
                news_item = NewsItem(
                    title=news['title'],
                    content=news['content'],
                    source=news['source'],
                    url=news['url'],
                    published_at=news['published_at'],
                    sentiment_score=news['sentiment_score'],
                    sentiment_label=news['sentiment_label'],
                    relevance_score=news['relevance_score'],
                    keywords=news['keywords']
                )
                news_items.append(news_item)
            
            logger.info(f"✅ {symbol} için {len(news_items)} haber bulundu")
            return news_items
            
        except Exception as e:
            logger.error(f"❌ Haber arama hatası {symbol}: {e}")
            return []
    
    async def get_market_news(self, days: int = 7) -> List[NewsItem]:
        """Piyasa haberlerini al"""
        try:
            # Mock market news
            mock_market_news = [
                {
                    'title': 'BIST 100 Endeksi Yükselişe Geçti',
                    'content': 'BIST 100 endeksi güçlü alış baskısı ile yükselişe geçti. Bankacılık ve sanayi hisseleri öne çıktı.',
                    'source': 'Market News',
                    'url': 'https://example.com/market/bist100',
                    'published_at': datetime.now() - timedelta(hours=6),
                    'sentiment_score': 0.7,
                    'sentiment_label': 'positive',
                    'relevance_score': 0.8,
                    'keywords': ['BIST', 'endeks', 'yükseliş', 'bankacılık']
                },
                {
                    'title': 'Merkez Bankası Faiz Kararı',
                    'content': 'Merkez Bankası faiz oranlarını değiştirmedi. Piyasa beklentileri karşılandı.',
                    'source': 'Central Bank',
                    'url': 'https://example.com/central-bank/rates',
                    'published_at': datetime.now() - timedelta(hours=12),
                    'sentiment_score': 0.0,
                    'sentiment_label': 'neutral',
                    'relevance_score': 0.9,
                    'keywords': ['Merkez Bankası', 'faiz', 'piyasa', 'beklenti']
                }
            ]
            
            # Convert to NewsItem objects
            market_news = []
            for news in mock_market_news:
                news_item = NewsItem(
                    title=news['title'],
                    content=news['content'],
                    source=news['source'],
                    url=news['url'],
                    published_at=news['published_at'],
                    sentiment_score=news['sentiment_score'],
                    sentiment_label=news['sentiment_label'],
                    relevance_score=news['relevance_score'],
                    keywords=news['keywords']
                )
                market_news.append(news_item)
            
            return market_news
            
        except Exception as e:
            logger.error(f"❌ Piyasa haber hatası: {e}")
            return []

class SentimentAnalyzer:
    """Sentiment analiz motoru"""
    
    def __init__(self):
        self.sentiment_cache = {}
        
        # Turkish financial keywords
        self.positive_keywords = [
            'artış', 'yükseliş', 'büyüme', 'kâr', 'gelir', 'başarı', 'güçlü',
            'iyi', 'olumlu', 'kazanç', 'getiri', 'yükselen', 'gelişen'
        ]
        
        self.negative_keywords = [
            'düşüş', 'azalma', 'kayıp', 'zarar', 'düşük', 'zayıf', 'kötü',
            'olumsuz', 'risk', 'belirsizlik', 'düşen', 'zayıflayan'
        ]
        
        logger.info("✅ Sentiment Analyzer başlatıldı")
    
    def analyze_text_sentiment(self, text: str) -> Tuple[float, str]:
        """Metin sentiment analizi"""
        try:
            if not text:
                return 0.0, "neutral"
            
            # Convert to lowercase for Turkish
            text_lower = text.lower()
            
            # Count positive and negative keywords
            positive_count = sum(1 for keyword in self.positive_keywords if keyword in text_lower)
            negative_count = sum(1 for keyword in self.negative_keywords if keyword in text_lower)
            
            # Calculate sentiment score
            if positive_count == 0 and negative_count == 0:
                sentiment_score = 0.0
                sentiment_label = "neutral"
            elif positive_count > negative_count:
                sentiment_score = min(positive_count / (positive_count + negative_count), 1.0)
                sentiment_label = "positive"
            elif negative_count > positive_count:
                sentiment_score = -min(negative_count / (positive_count + negative_count), 1.0)
                sentiment_label = "negative"
            else:
                sentiment_score = 0.0
                sentiment_label = "neutral"
            
            return sentiment_score, sentiment_label
            
        except Exception as e:
            logger.warning(f"Sentiment analiz hatası: {e}")
            return 0.0, "neutral"
    
    def analyze_news_sentiment(self, news_items: List[NewsItem]) -> Dict[str, float]:
        """Haber sentiment analizi"""
        try:
            if not news_items:
                return {
                    'overall_sentiment': 0.0,
                    'positive_count': 0,
                    'negative_count': 0,
                    'neutral_count': 0,
                    'average_sentiment': 0.0
                }
            
            # Analyze each news item
            sentiments = []
            positive_count = 0
            negative_count = 0
            neutral_count = 0
            
            for news in news_items:
                # Use pre-calculated sentiment if available
                if news.sentiment_score != 0.0:
                    sentiment_score = news.sentiment_score
                else:
                    # Analyze text sentiment
                    sentiment_score, _ = self.analyze_text_sentiment(news.content)
                
                sentiments.append(sentiment_score)
                
                # Count sentiment types
                if sentiment_score > 0.1:
                    positive_count += 1
                elif sentiment_score < -0.1:
                    negative_count += 1
                else:
                    neutral_count += 1
            
            # Calculate overall metrics
            overall_sentiment = np.mean(sentiments) if sentiments else 0.0
            average_sentiment = np.mean(sentiments) if sentiments else 0.0
            
            return {
                'overall_sentiment': overall_sentiment,
                'positive_count': positive_count,
                'negative_count': negative_count,
                'neutral_count': neutral_count,
                'average_sentiment': average_sentiment
            }
            
        except Exception as e:
            logger.error(f"❌ Haber sentiment analiz hatası: {e}")
            return {
                'overall_sentiment': 0.0,
                'positive_count': 0,
                'negative_count': 0,
                'neutral_count': 0,
                'average_sentiment': 0.0
            }

class EventDetector:
    """Olay tespit edici"""
    
    def __init__(self):
        self.event_patterns = {
            'earnings': r'(kazanç|gelir|sonuç|rapor|q[1-4]|çeyrek)',
            'dividend': r'(temettü|dividend|ödeme|dağıtım)',
            'merger': r'(birleşme|satın alma|acquisition|merger)',
            'guidance': r'(rehber|yönlendirme|beklenti|tahmin)',
            'regulatory': r'(düzenleme|regülasyon|spk|bddk)'
        }
        
        logger.info("✅ Event Detector başlatıldı")
    
    def detect_events(self, news_items: List[NewsItem]) -> List[Dict]:
        """Haberlerde olayları tespit et"""
        try:
            events = []
            
            for news in news_items:
                text = f"{news.title} {news.content}".lower()
                
                detected_events = []
                for event_type, pattern in self.event_patterns.items():
                    if re.search(pattern, text):
                        detected_events.append(event_type)
                
                if detected_events:
                    event = {
                        'type': detected_events,
                        'title': news.title,
                        'source': news.source,
                        'published_at': news.published_at,
                        'sentiment': news.sentiment_score,
                        'relevance': news.relevance_score
                    }
                    events.append(event)
            
            logger.info(f"✅ {len(events)} olay tespit edildi")
            return events
            
        except Exception as e:
            logger.error(f"❌ Olay tespit hatası: {e}")
            return []
    
    def get_upcoming_events(self, symbol: str) -> List[Dict]:
        """Yaklaşan olayları al"""
        try:
            # Mock upcoming events
            upcoming_events = [
                {
                    'symbol': symbol,
                    'event_type': 'earnings_announcement',
                    'date': datetime.now() + timedelta(days=15),
                    'description': f'{symbol} 2024 Q3 sonuçları açıklanacak',
                    'importance': 'high',
                    'expected_sentiment': 0.6
                },
                {
                    'symbol': symbol,
                    'event_type': 'dividend_payment',
                    'date': datetime.now() + timedelta(days=30),
                    'description': f'{symbol} temettü ödemesi yapılacak',
                    'importance': 'medium',
                    'expected_sentiment': 0.8
                }
            ]
            
            return upcoming_events
            
        except Exception as e:
            logger.error(f"❌ Yaklaşan olay hatası: {e}")
            return []

class SentimentNewsAnalyzer:
    """Sentiment & News Analyzer - Ana sınıf"""
    
    def __init__(self):
        self.news_aggregator = NewsAggregator()
        self.sentiment_analyzer = SentimentAnalyzer()
        self.event_detector = EventDetector()
        
        logger.info("✅ Sentiment & News Analyzer başlatıldı")
    
    async def analyze_company_sentiment(self, symbol: str, company_name: str = "") -> SentimentAnalysis:
        """Şirket sentiment analizi"""
        try:
            logger.info(f"🔍 {symbol} için sentiment analizi başlıyor...")
            
            # 1. Company news
            company_news = await self.news_aggregator.search_company_news(symbol, company_name)
            
            # 2. Market news
            market_news = await self.news_aggregator.get_market_news()
            
            # 3. Analyze news sentiment
            news_sentiment = self.sentiment_analyzer.analyze_news_sentiment(company_news)
            
            # 4. Detect events
            detected_events = self.event_detector.detect_events(company_news)
            upcoming_events = self.event_detector.get_upcoming_events(symbol)
            
            # 5. Calculate overall sentiment
            overall_sentiment = self._calculate_overall_sentiment(
                news_sentiment, detected_events, upcoming_events
            )
            
            # 6. Create sentiment analysis result
            sentiment_result = SentimentAnalysis(
                symbol=symbol,
                timestamp=datetime.now(),
                
                # Overall sentiment
                overall_sentiment=overall_sentiment,
                sentiment_label=self._get_sentiment_label(overall_sentiment),
                
                # News sentiment
                news_sentiment_score=news_sentiment['overall_sentiment'],
                news_count=len(company_news),
                positive_news_count=news_sentiment['positive_count'],
                negative_news_count=news_sentiment['negative_count'],
                neutral_news_count=news_sentiment['neutral_count'],
                
                # Social media sentiment (placeholder)
                social_sentiment_score=0.0,
                social_mention_count=0,
                
                # Event sentiment
                event_sentiment_score=self._calculate_event_sentiment(detected_events, upcoming_events),
                upcoming_events=upcoming_events,
                
                # Confidence
                confidence=self._calculate_confidence(company_news, detected_events)
            )
            
            logger.info(f"✅ {symbol} sentiment analizi tamamlandı")
            return sentiment_result
            
        except Exception as e:
            logger.error(f"❌ Sentiment analiz hatası {symbol}: {e}")
            return None
    
    def _calculate_overall_sentiment(self, news_sentiment: Dict, 
                                   detected_events: List[Dict], 
                                   upcoming_events: List[Dict]) -> float:
        """Genel sentiment hesapla"""
        try:
            # Weighted sentiment calculation
            news_weight = 0.6
            event_weight = 0.3
            upcoming_weight = 0.1
            
            # News sentiment
            news_score = news_sentiment['overall_sentiment']
            
            # Event sentiment
            event_score = 0.0
            if detected_events:
                event_sentiments = [event['sentiment'] for event in detected_events]
                event_score = np.mean(event_sentiments) if event_sentiments else 0.0
            
            # Upcoming events sentiment
            upcoming_score = 0.0
            if upcoming_events:
                upcoming_sentiments = [event['expected_sentiment'] for event in upcoming_events]
                upcoming_score = np.mean(upcoming_sentiments) if upcoming_sentiments else 0.0
            
            # Weighted average
            overall_sentiment = (
                news_score * news_weight +
                event_score * event_weight +
                upcoming_score * upcoming_weight
            )
            
            return np.clip(overall_sentiment, -1, 1)
            
        except Exception as e:
            logger.warning(f"Overall sentiment hesaplama hatası: {e}")
            return 0.0
    
    def _get_sentiment_label(self, sentiment_score: float) -> str:
        """Sentiment skoruna göre etiket"""
        if sentiment_score > 0.3:
            return "positive"
        elif sentiment_score < -0.3:
            return "negative"
        else:
            return "neutral"
    
    def _calculate_event_sentiment(self, detected_events: List[Dict], 
                                 upcoming_events: List[Dict]) -> float:
        """Olay sentiment skoru"""
        try:
            if not detected_events and not upcoming_events:
                return 0.0
            
            event_sentiments = []
            
            # Detected events
            for event in detected_events:
                event_sentiments.append(event['sentiment'])
            
            # Upcoming events
            for event in upcoming_events:
                event_sentiments.append(event['expected_sentiment'])
            
            if event_sentiments:
                return np.mean(event_sentiments)
            
            return 0.0
            
        except Exception as e:
            logger.warning(f"Event sentiment hesaplama hatası: {e}")
            return 0.0
    
    def _calculate_confidence(self, company_news: List[NewsItem], 
                            detected_events: List[Dict]) -> float:
        """Analiz güven skoru"""
        try:
            # Confidence based on data availability
            news_confidence = min(len(company_news) / 5, 1.0)  # Max 5 news
            event_confidence = min(len(detected_events) / 3, 1.0)  # Max 3 events
            
            # Weighted confidence
            confidence = (news_confidence * 0.7 + event_confidence * 0.3)
            
            return np.clip(confidence, 0.1, 1.0)
            
        except Exception as e:
            logger.warning(f"Confidence hesaplama hatası: {e}")
            return 0.5

# Test fonksiyonu
async def test_sentiment_news_analyzer():
    """Sentiment & News Analyzer'ı test et"""
    logger.info("🧪 Sentiment & News Analyzer Test Başlıyor...")
    
    # Test symbol
    symbol = "GARAN.IS"
    company_name = "Garanti Bankası"
    
    try:
        # Sentiment & News Analyzer oluştur
        analyzer = SentimentNewsAnalyzer()
        
        # Company sentiment analizi
        sentiment_result = await analyzer.analyze_company_sentiment(symbol, company_name)
        
        if sentiment_result:
            logger.info(f"📊 {symbol} Sentiment Analiz Sonuçları:")
            logger.info(f"   Genel Sentiment: {sentiment_result.overall_sentiment:.4f} ({sentiment_result.sentiment_label})")
            logger.info(f"   Haber Sentiment: {sentiment_result.news_sentiment_score:.4f}")
            logger.info(f"   Haber Sayısı: {sentiment_result.news_count}")
            logger.info(f"   Olumlu Haber: {sentiment_result.positive_news_count}")
            logger.info(f"   Olumsuz Haber: {sentiment_result.negative_news_count}")
            logger.info(f"   Nötr Haber: {sentiment_result.neutral_news_count}")
            logger.info(f"   Olay Sentiment: {sentiment_result.event_sentiment_score:.4f}")
            logger.info(f"   Yaklaşan Olay: {len(sentiment_result.upcoming_events or [])}")
            logger.info(f"   Güven: {sentiment_result.confidence:.4f}")
            
            return sentiment_result
        else:
            logger.error("❌ Sentiment analiz başarısız")
            return None
            
    except Exception as e:
        logger.error(f"❌ Test hatası: {e}")
        return None

if __name__ == "__main__":
    # Test çalıştır
    asyncio.run(test_sentiment_news_analyzer())
