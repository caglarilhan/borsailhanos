#!/usr/bin/env python3
"""
📰 US Market Sentiment Analyzer
US marketlerin haber ve sentiment analizi için özel araçlar
"""

import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Optional, Tuple, Any
import asyncio
import json
from dataclasses import dataclass
from enum import Enum
import re
from collections import Counter

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SentimentType(Enum):
    """Sentiment türleri"""
    VERY_BULLISH = "VERY_BULLISH"      # Çok yükseliş
    BULLISH = "BULLISH"                # Yükseliş
    NEUTRAL = "NEUTRAL"                # Nötr
    BEARISH = "BEARISH"                # Düşüş
    VERY_BEARISH = "VERY_BEARISH"      # Çok düşüş

class NewsSource(Enum):
    """Haber kaynakları"""
    YAHOO_FINANCE = "YAHOO_FINANCE"
    REDDIT = "REDDIT"
    TWITTER = "TWITTER"
    BLOOMBERG = "BLOOMBERG"
    REUTERS = "REUTERS"
    CNBC = "CNBC"
    MARKETWATCH = "MARKETWATCH"

@dataclass
class SentimentSignal:
    """Sentiment sinyali"""
    symbol: str
    sentiment: SentimentType
    score: float  # -1.0 to 1.0
    confidence: float
    source: NewsSource
    headline: str
    content: str
    timestamp: datetime
    keywords: List[str]
    impact_score: float  # 0.0 to 1.0
    market_reaction: str  # "POSITIVE", "NEGATIVE", "NEUTRAL"

class USMarketSentimentAnalyzer:
    """US Market Sentiment Analyzer"""
    
    def __init__(self):
        self.us_symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "NFLX"]
        
        # Sentiment kelimeleri
        self.bullish_words = [
            "bullish", "buy", "strong", "growth", "positive", "up", "rise", "gain",
            "outperform", "beat", "exceed", "surge", "rally", "momentum", "breakout",
            "upgrade", "target", "price", "increase", "profit", "earnings", "revenue",
            "success", "win", "victory", "breakthrough", "innovation", "leading"
        ]
        
        self.bearish_words = [
            "bearish", "sell", "weak", "decline", "negative", "down", "fall", "loss",
            "underperform", "miss", "disappoint", "crash", "plunge", "drop", "breakdown",
            "downgrade", "cut", "price", "decrease", "loss", "earnings", "revenue",
            "failure", "lose", "defeat", "problem", "issue", "concern", "risk"
        ]
        
        self.neutral_words = [
            "neutral", "hold", "stable", "flat", "sideways", "range", "consolidation",
            "wait", "monitor", "observe", "maintain", "unchanged", "steady"
        ]
        
        # Market impact kelimeleri
        self.high_impact_words = [
            "earnings", "guidance", "forecast", "outlook", "merger", "acquisition",
            "partnership", "deal", "contract", "approval", "rejection", "lawsuit",
            "investigation", "regulation", "policy", "rate", "inflation", "recession"
        ]
        
        self.medium_impact_words = [
            "product", "launch", "release", "update", "upgrade", "feature", "service",
            "expansion", "growth", "investment", "funding", "hiring", "layoff"
        ]
        
        self.sentiment_history = []
        self.performance_metrics = {
            "total_analyses": 0,
            "accurate_predictions": 0,
            "accuracy_rate": 0.0,
            "avg_sentiment_score": 0.0,
            "bullish_signals": 0,
            "bearish_signals": 0,
            "neutral_signals": 0
        }
        
    def analyze_market_sentiment(self) -> List[SentimentSignal]:
        """Market sentiment analizi yap"""
        try:
            logger.info("📰 US Market sentiment analizi başlatılıyor...")
            
            signals = []
            for symbol in self.us_symbols:
                try:
                    # Mock haber verisi oluştur
                    news_data = self._get_mock_news_data(symbol)
                    if not news_data:
                        continue
                    
                    # Sentiment analizi yap
                    sentiment_signal = self._analyze_symbol_sentiment(symbol, news_data)
                    if sentiment_signal:
                        signals.append(sentiment_signal)
                        logger.info(f"📊 {symbol}: {sentiment_signal.sentiment.value} - Skor: {sentiment_signal.score:.2f}")
                    
                except Exception as e:
                    logger.error(f"❌ {symbol} sentiment hatası: {e}")
                    continue
            
            # Sinyalleri impact skoruna göre sırala
            signals.sort(key=lambda x: x.impact_score, reverse=True)
            
            logger.info(f"✅ {len(signals)} sentiment sinyali bulundu")
            return signals
            
        except Exception as e:
            logger.error(f"❌ Sentiment analiz hatası: {e}")
            return []
    
    def _get_mock_news_data(self, symbol: str) -> List[Dict]:
        """Mock haber verisi oluştur"""
        try:
            # Gerçekçi mock haberler
            mock_news = [
                {
                    "headline": f"{symbol} Reports Strong Q3 Earnings Beat",
                    "content": f"{symbol} reported better-than-expected earnings for Q3, with revenue growth exceeding analyst estimates. The company's strong performance was driven by increased demand for its products and services.",
                    "source": "YAHOO_FINANCE",
                    "timestamp": datetime.now() - timedelta(hours=2)
                },
                {
                    "headline": f"{symbol} Stock Up 5% on Positive Analyst Upgrade",
                    "content": f"Analysts upgraded {symbol} stock rating from 'Hold' to 'Buy' citing strong fundamentals and growth prospects. Price target increased to reflect improved outlook.",
                    "source": "CNBC",
                    "timestamp": datetime.now() - timedelta(hours=4)
                },
                {
                    "headline": f"{symbol} Faces Regulatory Concerns",
                    "content": f"{symbol} is facing increased regulatory scrutiny which could impact future growth. Investors are monitoring the situation closely.",
                    "source": "REUTERS",
                    "timestamp": datetime.now() - timedelta(hours=6)
                },
                {
                    "headline": f"{symbol} Announces New Product Launch",
                    "content": f"{symbol} announced the launch of its latest product which is expected to drive revenue growth in the coming quarters.",
                    "source": "MARKETWATCH",
                    "timestamp": datetime.now() - timedelta(hours=8)
                },
                {
                    "headline": f"{symbol} Stock Trading Sideways",
                    "content": f"{symbol} stock has been trading in a narrow range as investors await more clarity on the company's future direction.",
                    "source": "BLOOMBERG",
                    "timestamp": datetime.now() - timedelta(hours=10)
                }
            ]
            
            return mock_news
            
        except Exception as e:
            logger.error(f"❌ {symbol} mock haber hatası: {e}")
            return []
    
    def _analyze_symbol_sentiment(self, symbol: str, news_data: List[Dict]) -> Optional[SentimentSignal]:
        """Sembol sentiment analizi"""
        try:
            if not news_data:
                return None
            
            # En son haberi al
            latest_news = news_data[0]
            
            # Sentiment skoru hesapla
            sentiment_score = self._calculate_sentiment_score(latest_news)
            
            # Sentiment türünü belirle
            sentiment_type = self._determine_sentiment_type(sentiment_score)
            
            # Güven skoru hesapla
            confidence = self._calculate_sentiment_confidence(latest_news, sentiment_score)
            
            # Impact skoru hesapla
            impact_score = self._calculate_impact_score(latest_news)
            
            # Anahtar kelimeleri çıkar
            keywords = self._extract_keywords(latest_news)
            
            # Market reaksiyonu tahmin et
            market_reaction = self._predict_market_reaction(sentiment_score, impact_score)
            
            # Sentiment sinyali oluştur
            signal = SentimentSignal(
                symbol=symbol,
                sentiment=sentiment_type,
                score=sentiment_score,
                confidence=confidence,
                source=NewsSource(latest_news["source"]),
                headline=latest_news["headline"],
                content=latest_news["content"],
                timestamp=latest_news["timestamp"],
                keywords=keywords,
                impact_score=impact_score,
                market_reaction=market_reaction
            )
            
            return signal
            
        except Exception as e:
            logger.error(f"❌ {symbol} sentiment analiz hatası: {e}")
            return None
    
    def _calculate_sentiment_score(self, news: Dict) -> float:
        """Sentiment skoru hesapla"""
        try:
            text = (news["headline"] + " " + news["content"]).lower()
            
            bullish_count = 0
            bearish_count = 0
            neutral_count = 0
            
            # Bullish kelimeleri say
            for word in self.bullish_words:
                bullish_count += text.count(word)
            
            # Bearish kelimeleri say
            for word in self.bearish_words:
                bearish_count += text.count(word)
            
            # Neutral kelimeleri say
            for word in self.neutral_words:
                neutral_count += text.count(word)
            
            # Skor hesapla
            total_words = bullish_count + bearish_count + neutral_count
            if total_words == 0:
                return 0.0
            
            # Ağırlıklı skor
            bullish_weight = bullish_count * 1.0
            bearish_weight = bearish_count * -1.0
            neutral_weight = neutral_count * 0.0
            
            score = (bullish_weight + bearish_weight + neutral_weight) / total_words
            
            # -1.0 ile 1.0 arasında sınırla
            return max(-1.0, min(1.0, score))
            
        except Exception as e:
            logger.error(f"❌ Sentiment skor hesaplama hatası: {e}")
            return 0.0
    
    def _determine_sentiment_type(self, score: float) -> SentimentType:
        """Sentiment türünü belirle"""
        try:
            if score >= 0.6:
                return SentimentType.VERY_BULLISH
            elif score >= 0.2:
                return SentimentType.BULLISH
            elif score >= -0.2:
                return SentimentType.NEUTRAL
            elif score >= -0.6:
                return SentimentType.BEARISH
            else:
                return SentimentType.VERY_BEARISH
                
        except Exception as e:
            logger.error(f"❌ Sentiment türü belirleme hatası: {e}")
            return SentimentType.NEUTRAL
    
    def _calculate_sentiment_confidence(self, news: Dict, score: float) -> float:
        """Sentiment güven skoru hesapla"""
        try:
            confidence = 0.0
            
            # Skor mutlak değeri
            abs_score = abs(score)
            confidence += abs_score * 0.4
            
            # Metin uzunluğu
            text_length = len(news["headline"] + news["content"])
            if text_length > 200:
                confidence += 0.2
            elif text_length > 100:
                confidence += 0.1
            
            # Kaynak güvenilirliği
            source = news["source"]
            if source in ["BLOOMBERG", "REUTERS", "CNBC"]:
                confidence += 0.2
            elif source in ["YAHOO_FINANCE", "MARKETWATCH"]:
                confidence += 0.1
            
            # Anahtar kelime sayısı
            keywords = self._extract_keywords(news)
            if len(keywords) > 5:
                confidence += 0.1
            elif len(keywords) > 3:
                confidence += 0.05
            
            return min(confidence, 1.0)
            
        except Exception as e:
            logger.error(f"❌ Güven skoru hesaplama hatası: {e}")
            return 0.0
    
    def _calculate_impact_score(self, news: Dict) -> float:
        """Impact skoru hesapla"""
        try:
            text = (news["headline"] + " " + news["content"]).lower()
            
            high_impact_count = 0
            medium_impact_count = 0
            
            # Yüksek impact kelimeleri
            for word in self.high_impact_words:
                high_impact_count += text.count(word)
            
            # Orta impact kelimeleri
            for word in self.medium_impact_words:
                medium_impact_count += text.count(word)
            
            # Impact skoru hesapla
            impact_score = (high_impact_count * 0.8 + medium_impact_count * 0.4) / 10.0
            
            return min(impact_score, 1.0)
            
        except Exception as e:
            logger.error(f"❌ Impact skoru hesaplama hatası: {e}")
            return 0.0
    
    def _extract_keywords(self, news: Dict) -> List[str]:
        """Anahtar kelimeleri çıkar"""
        try:
            text = (news["headline"] + " " + news["content"]).lower()
            
            # Tüm kelimeleri birleştir
            all_words = self.bullish_words + self.bearish_words + self.neutral_words + self.high_impact_words + self.medium_impact_words
            
            # Metinde geçen kelimeleri bul
            keywords = []
            for word in all_words:
                if word in text:
                    keywords.append(word)
            
            # Tekrarları kaldır ve sırala
            keywords = list(set(keywords))
            keywords.sort()
            
            return keywords[:10]  # En fazla 10 anahtar kelime
            
        except Exception as e:
            logger.error(f"❌ Anahtar kelime çıkarma hatası: {e}")
            return []
    
    def _predict_market_reaction(self, sentiment_score: float, impact_score: float) -> str:
        """Market reaksiyonu tahmin et"""
        try:
            # Sentiment ve impact kombinasyonu
            if sentiment_score > 0.3 and impact_score > 0.5:
                return "POSITIVE"
            elif sentiment_score < -0.3 and impact_score > 0.5:
                return "NEGATIVE"
            else:
                return "NEUTRAL"
                
        except Exception as e:
            logger.error(f"❌ Market reaksiyonu tahmin hatası: {e}")
            return "NEUTRAL"
    
    def get_sentiment_summary(self, signals: List[SentimentSignal]) -> Dict:
        """Sentiment özeti al"""
        try:
            if not signals:
                return {"error": "Sinyal bulunamadı"}
            
            # Genel sentiment
            total_score = sum(signal.score for signal in signals)
            avg_score = total_score / len(signals)
            
            # Sentiment dağılımı
            sentiment_counts = Counter(signal.sentiment.value for signal in signals)
            
            # Impact dağılımı
            high_impact = len([s for s in signals if s.impact_score > 0.7])
            medium_impact = len([s for s in signals if 0.3 <= s.impact_score <= 0.7])
            low_impact = len([s for s in signals if s.impact_score < 0.3])
            
            # Market reaksiyonu
            positive_reactions = len([s for s in signals if s.market_reaction == "POSITIVE"])
            negative_reactions = len([s for s in signals if s.market_reaction == "NEGATIVE"])
            neutral_reactions = len([s for s in signals if s.market_reaction == "NEUTRAL"])
            
            return {
                "total_signals": len(signals),
                "average_sentiment_score": avg_score,
                "sentiment_distribution": dict(sentiment_counts),
                "impact_distribution": {
                    "high": high_impact,
                    "medium": medium_impact,
                    "low": low_impact
                },
                "market_reactions": {
                    "positive": positive_reactions,
                    "negative": negative_reactions,
                    "neutral": neutral_reactions
                },
                "top_keywords": self._get_top_keywords(signals),
                "most_bullish": max(signals, key=lambda x: x.score).symbol if signals else None,
                "most_bearish": min(signals, key=lambda x: x.score).symbol if signals else None,
                "highest_impact": max(signals, key=lambda x: x.impact_score).symbol if signals else None
            }
            
        except Exception as e:
            logger.error(f"❌ Sentiment özet hatası: {e}")
            return {"error": str(e)}
    
    def _get_top_keywords(self, signals: List[SentimentSignal]) -> List[str]:
        """En çok kullanılan anahtar kelimeleri al"""
        try:
            all_keywords = []
            for signal in signals:
                all_keywords.extend(signal.keywords)
            
            # Kelime sayılarını hesapla
            keyword_counts = Counter(all_keywords)
            
            # En çok kullanılan 10 kelimeyi döndür
            return [word for word, count in keyword_counts.most_common(10)]
            
        except Exception as e:
            logger.error(f"❌ Anahtar kelime özet hatası: {e}")
            return []
    
    def get_performance_report(self) -> Dict:
        """Performans raporu al"""
        try:
            return {
                "performance_metrics": self.performance_metrics,
                "total_history": len(self.sentiment_history),
                "last_10_analyses": self.sentiment_history[-10:] if self.sentiment_history else []
            }
            
        except Exception as e:
            logger.error(f"❌ Performans raporu hatası: {e}")
            return {"error": str(e)}

# Demo fonksiyonu
async def demo_sentiment_analyzer():
    """Sentiment analyzer demo"""
    try:
        logger.info("🚀 US Market Sentiment Analyzer Demo Başlatılıyor...")
        
        analyzer = USMarketSentimentAnalyzer()
        
        # Sentiment analizi yap
        signals = analyzer.analyze_market_sentiment()
        
        if signals:
            logger.info(f"📊 {len(signals)} sentiment sinyali bulundu!")
            
            # Sentiment özeti
            summary = analyzer.get_sentiment_summary(signals)
            logger.info(f"📈 Sentiment Özeti:")
            logger.info(f"   Ortalama Skor: {summary['average_sentiment_score']:.2f}")
            logger.info(f"   En Bullish: {summary['most_bullish']}")
            logger.info(f"   En Bearish: {summary['most_bearish']}")
            logger.info(f"   En Yüksek Impact: {summary['highest_impact']}")
            logger.info(f"   Top Keywords: {summary['top_keywords'][:5]}")
            
        else:
            logger.info("⏸️ Şu an sentiment sinyali yok")
        
        # Performans raporu
        performance = analyzer.get_performance_report()
        logger.info(f"📊 Performans: {performance}")
        
    except Exception as e:
        logger.error(f"❌ Demo hatası: {e}")

if __name__ == "__main__":
    asyncio.run(demo_sentiment_analyzer())
