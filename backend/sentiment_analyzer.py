#!/usr/bin/env python3
"""
📰 Sentiment Analysis System
PRD v2.0 - FinBERT-TR + News Analysis
"""

import numpy as np
import pandas as pd
import logging
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
import requests
import json
import re
from collections import Counter
import warnings
warnings.filterwarnings('ignore')

# Transformers for FinBERT-TR
try:
    from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    logging.warning("Transformers not available. Install with: pip install transformers")

logger = logging.getLogger(__name__)

@dataclass
class SentimentResult:
    """Sentiment analiz sonucu"""
    symbol: str
    overall_sentiment: float  # -1 to 1
    confidence: float
    news_count: int
    positive_news: int
    negative_news: int
    neutral_news: int
    sentiment_score: float  # 0 to 1
    key_events: List[str]
    timestamp: datetime

@dataclass
class NewsItem:
    """Haber öğesi"""
    title: str
    content: str
    source: str
    published_at: datetime
    sentiment_score: float
    relevance_score: float

class SentimentAnalyzer:
    """Sentiment analiz sistemi"""
    
    def __init__(self):
        self.sentiment_pipeline = None
        self.tokenizer = None
        self.model = None
        self.news_cache = {}
        
        # FinBERT-TR modelini yükle
        self._load_sentiment_model()
        
        # Finansal anahtar kelimeler
        self.financial_keywords = [
            'kar', 'zarar', 'büyüme', 'düşüş', 'artış', 'azalış',
            'yatırım', 'portföy', 'hisse', 'borsa', 'piyasa',
            'faiz', 'enflasyon', 'döviz', 'altın', 'petrol',
            'şirket', 'hisse senedi', 'temettü', 'bilanço',
            'ciro', 'satış', 'üretim', 'kapasite', 'ihracat',
            'ithalat', 'dış ticaret', 'ekonomi', 'büyüme'
        ]
        
        # Pozitif/negatif kelimeler
        self.positive_words = [
            'artış', 'büyüme', 'kazanç', 'kar', 'başarı', 'güçlü',
            'iyi', 'olumlu', 'pozitif', 'yükseliş', 'gelişme',
            'ilerleme', 'başarılı', 'kârlı', 'verimli', 'etkili'
        ]
        
        self.negative_words = [
            'düşüş', 'azalış', 'zarar', 'kayıp', 'başarısız', 'zayıf',
            'kötü', 'olumsuz', 'negatif', 'düşüş', 'gerileme',
            'sorun', 'risk', 'tehlike', 'kriz', 'bunalım'
        ]
    
    def _load_sentiment_model(self):
        """Sentiment modelini yükle"""
        if not TRANSFORMERS_AVAILABLE:
            logger.warning("⚠️ Transformers mevcut değil, basit sentiment analizi kullanılacak")
            return
        
        try:
            logger.info("🤖 FinBERT-TR modeli yükleniyor...")
            
            # FinBERT-TR model (Türkçe finansal sentiment)
            model_name = "dbmdz/bert-base-turkish-cased"
            
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
            
            self.sentiment_pipeline = pipeline(
                "sentiment-analysis",
                model=self.model,
                tokenizer=self.tokenizer,
                return_all_scores=True
            )
            
            logger.info("✅ FinBERT-TR modeli yüklendi")
            
        except Exception as e:
            logger.error(f"❌ Sentiment model yükleme hatası: {e}")
            self.sentiment_pipeline = None
    
    def fetch_news(self, symbol: str, days: int = 7) -> List[NewsItem]:
        """Haberleri çek"""
        logger.info(f"📰 {symbol} için haberler çekiliyor...")
        
        try:
            # NewsAPI kullanımı (ücretsiz plan)
            api_key = "your_news_api_key"  # Gerçek API key gerekli
            
            # Şirket adını sembolden çıkar
            company_name = self._get_company_name(symbol)
            
            # NewsAPI'den haber çek
            url = "https://newsapi.org/v2/everything"
            params = {
                'q': f"{company_name} OR {symbol}",
                'language': 'tr',
                'sortBy': 'publishedAt',
                'from': (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d'),
                'pageSize': 50,
                'apiKey': api_key
            }
            
            # Demo için mock haberler
            mock_news = self._generate_mock_news(symbol, company_name)
            
            news_items = []
            for news_data in mock_news:
                news_item = NewsItem(
                    title=news_data['title'],
                    content=news_data['content'],
                    source=news_data['source'],
                    published_at=news_data['published_at'],
                    sentiment_score=0.0,  # Sonradan hesaplanacak
                    relevance_score=news_data['relevance_score']
                )
                news_items.append(news_item)
            
            logger.info(f"✅ {symbol}: {len(news_items)} haber bulundu")
            return news_items
            
        except Exception as e:
            logger.error(f"❌ {symbol} haber çekme hatası: {e}")
            return []
    
    def _generate_mock_news(self, symbol: str, company_name: str) -> List[Dict]:
        """Mock haberler oluştur (demo için)"""
        mock_news = [
            {
                'title': f"{company_name} Q3 sonuçları açıklandı",
                'content': f"{company_name} şirketi üçüncü çeyrek sonuçlarını açıkladı. Şirket, beklenenin üzerinde kar elde etti.",
                'source': 'Ekonomi Haberleri',
                'published_at': datetime.now() - timedelta(hours=2),
                'relevance_score': 0.9
            },
            {
                'title': f"{company_name} yeni yatırım planı",
                'content': f"{company_name} gelecek yıl için büyük yatırım planları açıkladı. Şirket kapasitesini artıracak.",
                'source': 'Finans Dünyası',
                'published_at': datetime.now() - timedelta(hours=5),
                'relevance_score': 0.8
            },
            {
                'title': f"{company_name} hisse senedi analizi",
                'content': f"Analistler {company_name} hisse senedi için pozitif görüş bildiriyor. Hedef fiyat yükseltildi.",
                'source': 'Borsa Analiz',
                'published_at': datetime.now() - timedelta(hours=8),
                'relevance_score': 0.7
            },
            {
                'title': f"Sektörde {company_name} etkisi",
                'content': f"{company_name} şirketinin son açıklamaları sektörde olumlu etki yarattı.",
                'source': 'Sektör Haberleri',
                'published_at': datetime.now() - timedelta(hours=12),
                'relevance_score': 0.6
            },
            {
                'title': f"{company_name} temettü ödemesi",
                'content': f"{company_name} yıl sonu temettü ödemesi için tarih açıkladı. Yatırımcılar memnun.",
                'source': 'Yatırım Haberleri',
                'published_at': datetime.now() - timedelta(days=1),
                'relevance_score': 0.8
            }
        ]
        
        return mock_news
    
    def _get_company_name(self, symbol: str) -> str:
        """Sembolden şirket adını çıkar"""
        company_names = {
            'GARAN.IS': 'Garanti BBVA',
            'AKBNK.IS': 'Akbank',
            'ISCTR.IS': 'İş Bankası',
            'YKBNK.IS': 'Yapı Kredi',
            'THYAO.IS': 'Türk Hava Yolları',
            'SISE.IS': 'Şişe Cam',
            'EREGL.IS': 'Ereğli Demir Çelik',
            'TUPRS.IS': 'Tüpraş',
            'ASELS.IS': 'Aselsan',
            'KRDMD.IS': 'Kardemir'
        }
        return company_names.get(symbol, symbol)
    
    def analyze_sentiment(self, text: str) -> Tuple[float, float]:
        """Metin sentiment analizi"""
        if self.sentiment_pipeline is not None:
            return self._bert_sentiment_analysis(text)
        else:
            return self._rule_based_sentiment_analysis(text)
    
    def _bert_sentiment_analysis(self, text: str) -> Tuple[float, float]:
        """BERT tabanlı sentiment analizi"""
        try:
            # Metni kısalt (BERT token limiti)
            if len(text) > 512:
                text = text[:512]
            
            results = self.sentiment_pipeline(text)
            
            # Pozitif ve negatif skorları al
            positive_score = 0.0
            negative_score = 0.0
            
            for result in results[0]:
                if result['label'] == 'POSITIVE':
                    positive_score = result['score']
                elif result['label'] == 'NEGATIVE':
                    negative_score = result['score']
            
            # Net sentiment (-1 to 1)
            sentiment = positive_score - negative_score
            confidence = max(positive_score, negative_score)
            
            return sentiment, confidence
            
        except Exception as e:
            logger.error(f"❌ BERT sentiment analizi hatası: {e}")
            return self._rule_based_sentiment_analysis(text)
    
    def _rule_based_sentiment_analysis(self, text: str) -> Tuple[float, float]:
        """Kural tabanlı sentiment analizi"""
        try:
            text_lower = text.lower()
            
            # Pozitif kelime sayısı
            positive_count = sum(1 for word in self.positive_words if word in text_lower)
            
            # Negatif kelime sayısı
            negative_count = sum(1 for word in self.negative_words if word in text_lower)
            
            # Finansal kelime sayısı
            financial_count = sum(1 for word in self.financial_keywords if word in text_lower)
            
            # Sentiment skoru
            if positive_count + negative_count == 0:
                sentiment = 0.0
                confidence = 0.3
            else:
                sentiment = (positive_count - negative_count) / (positive_count + negative_count)
                confidence = min(0.8, (positive_count + negative_count) / 10)
            
            # Finansal kelime bonusu
            if financial_count > 0:
                confidence = min(1.0, confidence + 0.2)
            
            return sentiment, confidence
            
        except Exception as e:
            logger.error(f"❌ Kural tabanlı sentiment analizi hatası: {e}")
            return 0.0, 0.3
    
    def analyze_stock_sentiment(self, symbol: str) -> Optional[SentimentResult]:
        """Hisse sentiment analizi"""
        logger.info(f"📊 {symbol} sentiment analizi başlıyor...")
        
        try:
            # Haberleri çek
            news_items = self.fetch_news(symbol)
            
            if not news_items:
                logger.warning(f"⚠️ {symbol} için haber bulunamadı")
                return None
            
            # Her haber için sentiment analizi
            sentiment_scores = []
            positive_count = 0
            negative_count = 0
            neutral_count = 0
            key_events = []
            
            for news_item in news_items:
                # Sentiment analizi
                sentiment, confidence = self.analyze_sentiment(
                    f"{news_item.title} {news_item.content}"
                )
                
                news_item.sentiment_score = sentiment
                
                # Kategorize et
                if sentiment > 0.1:
                    positive_count += 1
                elif sentiment < -0.1:
                    negative_count += 1
                else:
                    neutral_count += 1
                
                # Önemli olayları kaydet
                if abs(sentiment) > 0.3 and news_item.relevance_score > 0.7:
                    key_events.append(news_item.title)
                
                # Ağırlıklı sentiment skoru
                weighted_sentiment = sentiment * confidence * news_item.relevance_score
                sentiment_scores.append(weighted_sentiment)
            
            # Genel sentiment hesapla
            if sentiment_scores:
                overall_sentiment = np.mean(sentiment_scores)
                sentiment_score = (overall_sentiment + 1) / 2  # 0-1 arası
                confidence = min(1.0, len(sentiment_scores) / 10)
            else:
                overall_sentiment = 0.0
                sentiment_score = 0.5
                confidence = 0.3
            
            result = SentimentResult(
                symbol=symbol,
                overall_sentiment=overall_sentiment,
                confidence=confidence,
                news_count=len(news_items),
                positive_news=positive_count,
                negative_news=negative_count,
                neutral_news=neutral_count,
                sentiment_score=sentiment_score,
                key_events=key_events[:5],  # En önemli 5 olay
                timestamp=datetime.now()
            )
            
            logger.info(f"✅ {symbol} sentiment analizi tamamlandı:")
            logger.info(f"   Genel Sentiment: {overall_sentiment:.3f}")
            logger.info(f"   Pozitif Haberler: {positive_count}")
            logger.info(f"   Negatif Haberler: {negative_count}")
            logger.info(f"   Güven Skoru: {confidence:.2f}")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ {symbol} sentiment analizi hatası: {e}")
            return None
    
    def get_sector_sentiment(self, symbols: List[str]) -> Dict[str, float]:
        """Sektör sentiment analizi"""
        logger.info(f"🏭 {len(symbols)} hisse için sektör sentiment analizi...")
        
        sector_sentiments = {}
        
        for symbol in symbols:
            sentiment_result = self.analyze_stock_sentiment(symbol)
            
            if sentiment_result:
                sector_sentiments[symbol] = sentiment_result.sentiment_score
        
        # Sektör ortalaması
        if sector_sentiments:
            avg_sentiment = np.mean(list(sector_sentiments.values()))
            logger.info(f"📊 Sektör ortalama sentiment: {avg_sentiment:.3f}")
        
        return sector_sentiments

def test_sentiment_analyzer():
    """Sentiment analyzer test fonksiyonu"""
    logger.info("🧪 Sentiment Analyzer test başlıyor...")
    
    analyzer = SentimentAnalyzer()
    test_symbols = ["GARAN.IS", "AKBNK.IS", "SISE.IS"]
    
    results = []
    
    for symbol in test_symbols:
        result = analyzer.analyze_stock_sentiment(symbol)
        
        if result:
            results.append(result)
            
            logger.info(f"📈 {symbol}:")
            logger.info(f"   Sentiment: {result.overall_sentiment:.3f}")
            logger.info(f"   Güven: {result.confidence:.2f}")
            logger.info(f"   Haber Sayısı: {result.news_count}")
            logger.info(f"   Pozitif/Negatif: {result.positive_news}/{result.negative_news}")
            
            if result.key_events:
                logger.info(f"   Önemli Olaylar: {len(result.key_events)}")
    
    logger.info(f"✅ Sentiment Analyzer test tamamlandı: {len(results)} analiz")
    return results

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    test_sentiment_analyzer()