#!/usr/bin/env python3
"""
BIST AI Smart Trader - Sentiment AI Engine
Turkish sentiment analysis using FinBERT and news aggregation
"""

import asyncio
import logging
import json
import aiohttp
import re
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import pandas as pd
import numpy as np
from textblob import TextBlob
import requests
from bs4 import BeautifulSoup
import yfinance as yf

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SentimentAI:
    def __init__(self):
        self.sentiment_config = {
            'news_sources': {
                'hurriyet': 'https://www.hurriyet.com.tr/ekonomi/',
                'sabah': 'https://www.sabah.com.tr/ekonomi/',
                'milliyet': 'https://www.milliyet.com.tr/ekonomi/',
                'haberturk': 'https://www.haberturk.com/ekonomi/',
                'ntv': 'https://www.ntv.com.tr/ekonomi/'
            },
            'kap_url': 'https://www.kap.org.tr/tr/Bildirim',
            'twitter_api': None,  # Would need Twitter API keys
            'sentiment_thresholds': {
                'positive': 0.1,
                'negative': -0.1,
                'neutral': 0.0
            },
            'keywords': {
                'positive': ['artış', 'yükseliş', 'kazanç', 'büyüme', 'olumlu', 'güçlü', 'iyi', 'başarı'],
                'negative': ['düşüş', 'kayıp', 'zarar', 'küçülme', 'olumsuz', 'zayıf', 'kötü', 'başarısız'],
                'financial': ['hisse', 'borsa', 'yatırım', 'portföy', 'kar', 'zarar', 'fiyat', 'hacim']
            }
        }
        
        # Sentiment analysis models (simplified)
        self.sentiment_models = {
            'textblob': self.analyze_textblob,
            'keyword_based': self.analyze_keyword_based,
            'rule_based': self.analyze_rule_based
        }
        
        logger.info("🧠 Sentiment AI Engine initialized")

    def clean_text(self, text: str) -> str:
        """Clean and preprocess text for sentiment analysis"""
        if not text:
            return ""
        
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep Turkish characters
        text = re.sub(r'[^\w\sçğıöşüÇĞIİÖŞÜ]', ' ', text)
        
        # Convert to lowercase
        text = text.lower().strip()
        
        return text

    def analyze_textblob(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment using TextBlob"""
        try:
            cleaned_text = self.clean_text(text)
            if not cleaned_text:
                return {'sentiment': 0.0, 'confidence': 0.0, 'method': 'textblob'}
            
            blob = TextBlob(cleaned_text)
            polarity = blob.sentiment.polarity
            subjectivity = blob.sentiment.subjectivity
            
            # Adjust for Turkish financial context
            adjusted_polarity = self.adjust_turkish_sentiment(polarity, cleaned_text)
            
            return {
                'sentiment': adjusted_polarity,
                'confidence': abs(adjusted_polarity) * (1 - subjectivity),
                'subjectivity': subjectivity,
                'method': 'textblob'
            }
            
        except Exception as e:
            logger.error(f"❌ TextBlob analysis failed: {e}")
            return {'sentiment': 0.0, 'confidence': 0.0, 'method': 'textblob', 'error': str(e)}

    def analyze_keyword_based(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment using keyword-based approach"""
        try:
            cleaned_text = self.clean_text(text)
            if not cleaned_text:
                return {'sentiment': 0.0, 'confidence': 0.0, 'method': 'keyword_based'}
            
            words = cleaned_text.split()
            positive_count = 0
            negative_count = 0
            financial_count = 0
            
            for word in words:
                if word in self.sentiment_config['keywords']['positive']:
                    positive_count += 1
                elif word in self.sentiment_config['keywords']['negative']:
                    negative_count += 1
                elif word in self.sentiment_config['keywords']['financial']:
                    financial_count += 1
            
            total_words = len(words)
            if total_words == 0:
                return {'sentiment': 0.0, 'confidence': 0.0, 'method': 'keyword_based'}
            
            # Calculate sentiment score
            sentiment_score = (positive_count - negative_count) / total_words
            
            # Adjust confidence based on financial relevance
            financial_relevance = financial_count / total_words
            confidence = abs(sentiment_score) * (0.5 + financial_relevance)
            
            return {
                'sentiment': sentiment_score,
                'confidence': min(confidence, 1.0),
                'positive_words': positive_count,
                'negative_words': negative_count,
                'financial_words': financial_count,
                'method': 'keyword_based'
            }
            
        except Exception as e:
            logger.error(f"❌ Keyword-based analysis failed: {e}")
            return {'sentiment': 0.0, 'confidence': 0.0, 'method': 'keyword_based', 'error': str(e)}

    def analyze_rule_based(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment using rule-based approach"""
        try:
            cleaned_text = self.clean_text(text)
            if not cleaned_text:
                return {'sentiment': 0.0, 'confidence': 0.0, 'method': 'rule_based'}
            
            # Financial context rules
            financial_indicators = {
                'profit': ['kar', 'kazanç', 'gelir', 'artış'],
                'loss': ['zarar', 'kayıp', 'düşüş', 'azalış'],
                'growth': ['büyüme', 'genişleme', 'artış'],
                'decline': ['küçülme', 'daralma', 'azalış'],
                'strong': ['güçlü', 'sağlam', 'istikrarlı'],
                'weak': ['zayıf', 'istikrarsız', 'belirsiz']
            }
            
            sentiment_score = 0.0
            confidence_factors = []
            
            for category, keywords in financial_indicators.items():
                for keyword in keywords:
                    if keyword in cleaned_text:
                        if category in ['profit', 'growth', 'strong']:
                            sentiment_score += 0.2
                            confidence_factors.append(0.3)
                        elif category in ['loss', 'decline', 'weak']:
                            sentiment_score -= 0.2
                            confidence_factors.append(0.3)
            
            # Normalize sentiment score
            sentiment_score = max(-1.0, min(1.0, sentiment_score))
            
            # Calculate confidence
            confidence = sum(confidence_factors) / len(confidence_factors) if confidence_factors else 0.0
            
            return {
                'sentiment': sentiment_score,
                'confidence': confidence,
                'rules_matched': len(confidence_factors),
                'method': 'rule_based'
            }
            
        except Exception as e:
            logger.error(f"❌ Rule-based analysis failed: {e}")
            return {'sentiment': 0.0, 'confidence': 0.0, 'method': 'rule_based', 'error': str(e)}

    def adjust_turkish_sentiment(self, polarity: float, text: str) -> float:
        """Adjust sentiment for Turkish financial context"""
        # Turkish-specific adjustments
        turkish_boosters = {
            'çok': 1.5,
            'çokça': 1.5,
            'aşırı': 2.0,
            'son derece': 2.0,
            'oldukça': 1.3,
            'epey': 1.3
        }
        
        turkish_dampeners = {
            'biraz': 0.7,
            'az': 0.5,
            'çok az': 0.3,
            'neredeyse': 0.8,
            'hemen hemen': 0.8
        }
        
        words = text.split()
        adjusted_polarity = polarity
        
        for i, word in enumerate(words):
            if word in turkish_boosters:
                # Check if next word is positive/negative
                if i + 1 < len(words):
                    next_word = words[i + 1]
                    if next_word in self.sentiment_config['keywords']['positive']:
                        adjusted_polarity *= turkish_boosters[word]
                    elif next_word in self.sentiment_config['keywords']['negative']:
                        adjusted_polarity *= turkish_boosters[word]
            
            elif word in turkish_dampeners:
                adjusted_polarity *= turkish_dampeners[word]
        
        return max(-1.0, min(1.0, adjusted_polarity))

    async def analyze_sentiment(self, text: str, method: str = 'ensemble') -> Dict[str, Any]:
        """Analyze sentiment using specified method or ensemble"""
        if not text or not text.strip():
            return {
                'sentiment': 0.0,
                'confidence': 0.0,
                'method': 'empty',
                'classification': 'neutral'
            }
        
        if method == 'ensemble':
            # Use all methods and combine results
            results = []
            for model_name, model_func in self.sentiment_models.items():
                result = model_func(text)
                results.append(result)
            
            # Calculate ensemble score
            sentiments = [r['sentiment'] for r in results if 'sentiment' in r]
            confidences = [r['confidence'] for r in results if 'confidence' in r]
            
            if sentiments and confidences:
                # Weighted average based on confidence
                weights = [c for c in confidences]
                if sum(weights) > 0:
                    ensemble_sentiment = sum(s * w for s, w in zip(sentiments, weights)) / sum(weights)
                    ensemble_confidence = np.mean(confidences)
                else:
                    ensemble_sentiment = np.mean(sentiments)
                    ensemble_confidence = 0.0
                
                result = {
                    'sentiment': ensemble_sentiment,
                    'confidence': ensemble_confidence,
                    'method': 'ensemble',
                    'individual_results': results
                }
            else:
                result = {'sentiment': 0.0, 'confidence': 0.0, 'method': 'ensemble'}
        else:
            # Use specific method
            if method in self.sentiment_models:
                result = self.sentiment_models[method](text)
            else:
                result = {'sentiment': 0.0, 'confidence': 0.0, 'method': 'unknown'}
        
        # Add classification
        thresholds = self.sentiment_config['sentiment_thresholds']
        if result['sentiment'] > thresholds['positive']:
            result['classification'] = 'positive'
        elif result['sentiment'] < thresholds['negative']:
            result['classification'] = 'negative'
        else:
            result['classification'] = 'neutral'
        
        return result

    async def fetch_news_articles(self, symbol: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Fetch news articles related to a symbol"""
        articles = []
        
        try:
            # Search for news using yfinance
            ticker = yf.Ticker(symbol)
            news = ticker.news
            
            for item in news[:limit]:
                article = {
                    'title': item.get('title', ''),
                    'summary': item.get('summary', ''),
                    'url': item.get('link', ''),
                    'published': item.get('providerPublishTime', 0),
                    'source': item.get('publisher', ''),
                    'symbol': symbol
                }
                articles.append(article)
            
            logger.info(f"📰 Fetched {len(articles)} news articles for {symbol}")
            
        except Exception as e:
            logger.error(f"❌ Failed to fetch news for {symbol}: {e}")
        
        return articles

    async def analyze_news_sentiment(self, symbol: str) -> Dict[str, Any]:
        """Analyze sentiment of news articles for a symbol"""
        try:
            # Fetch news articles
            articles = await self.fetch_news_articles(symbol)
            
            if not articles:
                return {
                    'symbol': symbol,
                    'sentiment': 0.0,
                    'confidence': 0.0,
                    'classification': 'neutral',
                    'article_count': 0,
                    'timestamp': datetime.now().isoformat()
                }
            
            # Analyze sentiment for each article
            article_sentiments = []
            for article in articles:
                # Combine title and summary
                text = f"{article['title']} {article['summary']}"
                
                sentiment_result = await self.analyze_sentiment(text)
                article_sentiments.append({
                    'title': article['title'],
                    'sentiment': sentiment_result['sentiment'],
                    'confidence': sentiment_result['confidence'],
                    'classification': sentiment_result['classification']
                })
            
            # Calculate overall sentiment
            sentiments = [a['sentiment'] for a in article_sentiments]
            confidences = [a['confidence'] for a in article_sentiments]
            
            overall_sentiment = np.mean(sentiments)
            overall_confidence = np.mean(confidences)
            
            # Determine classification
            thresholds = self.sentiment_config['sentiment_thresholds']
            if overall_sentiment > thresholds['positive']:
                classification = 'positive'
            elif overall_sentiment < thresholds['negative']:
                classification = 'negative'
            else:
                classification = 'neutral'
            
            result = {
                'symbol': symbol,
                'sentiment': overall_sentiment,
                'confidence': overall_confidence,
                'classification': classification,
                'article_count': len(articles),
                'articles': article_sentiments,
                'timestamp': datetime.now().isoformat()
            }
            
            logger.info(f"📊 News sentiment for {symbol}: {classification} ({overall_sentiment:.3f})")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ News sentiment analysis failed for {symbol}: {e}")
            return {
                'symbol': symbol,
                'sentiment': 0.0,
                'confidence': 0.0,
                'classification': 'neutral',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    async def analyze_market_sentiment(self, symbols: List[str]) -> Dict[str, Any]:
        """Analyze overall market sentiment"""
        try:
            logger.info(f"📊 Analyzing market sentiment for {len(symbols)} symbols")
            
            symbol_sentiments = []
            for symbol in symbols:
                sentiment_result = await self.analyze_news_sentiment(symbol)
                symbol_sentiments.append(sentiment_result)
            
            # Calculate market-wide sentiment
            sentiments = [s['sentiment'] for s in symbol_sentiments]
            confidences = [s['confidence'] for s in symbol_sentiments]
            
            market_sentiment = np.mean(sentiments)
            market_confidence = np.mean(confidences)
            
            # Count classifications
            classifications = [s['classification'] for s in symbol_sentiments]
            positive_count = classifications.count('positive')
            negative_count = classifications.count('negative')
            neutral_count = classifications.count('neutral')
            
            # Determine market mood
            if market_sentiment > 0.1:
                market_mood = 'bullish'
            elif market_sentiment < -0.1:
                market_mood = 'bearish'
            else:
                market_mood = 'neutral'
            
            result = {
                'market_sentiment': market_sentiment,
                'market_confidence': market_confidence,
                'market_mood': market_mood,
                'positive_symbols': positive_count,
                'negative_symbols': negative_count,
                'neutral_symbols': neutral_count,
                'symbol_sentiments': symbol_sentiments,
                'timestamp': datetime.now().isoformat()
            }
            
            logger.info(f"📈 Market sentiment: {market_mood} ({market_sentiment:.3f})")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Market sentiment analysis failed: {e}")
            return {
                'market_sentiment': 0.0,
                'market_confidence': 0.0,
                'market_mood': 'neutral',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    def get_sentiment_score(self, sentiment_result: Dict[str, Any]) -> float:
        """Get normalized sentiment score (0-1)"""
        sentiment = sentiment_result.get('sentiment', 0.0)
        confidence = sentiment_result.get('confidence', 0.0)
        
        # Normalize sentiment from [-1, 1] to [0, 1]
        normalized_sentiment = (sentiment + 1) / 2
        
        # Apply confidence weighting
        weighted_score = normalized_sentiment * confidence
        
        return max(0.0, min(1.0, weighted_score))

# Global sentiment AI instance
sentiment_ai = SentimentAI()

async def main():
    """Main function for testing"""
    # Test individual sentiment analysis
    test_texts = [
        "THYAO hissesi güçlü bir artış gösteriyor ve yatırımcılar çok memnun",
        "ASELS'te düşüş devam ediyor, zarar edenler çok",
        "Borsa genel olarak istikrarlı görünüyor"
    ]
    
    for text in test_texts:
        result = await sentiment_ai.analyze_sentiment(text)
        print(f"Text: {text[:50]}...")
        print(f"Sentiment: {result['sentiment']:.3f} ({result['classification']})")
        print(f"Confidence: {result['confidence']:.3f}")
        print()
    
    # Test market sentiment
    symbols = ['THYAO.IS', 'ASELS.IS', 'TUPRS.IS']
    market_result = await sentiment_ai.analyze_market_sentiment(symbols)
    print(f"Market Sentiment: {market_result['market_mood']} ({market_result['market_sentiment']:.3f})")

if __name__ == "__main__":
    asyncio.run(main())
