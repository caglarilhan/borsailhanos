#!/usr/bin/env python3
"""
Gelişmiş Sentiment Analizi
- FinBERT-TR entegrasyonu
- Çoklu kaynak sentiment
- Finansal terim odaklı analiz
"""

import asyncio
import re
from typing import Dict, List, Optional
import logging

# Local imports
try:
    from backend.services.ai_models import ai_ensemble
    from backend.services.sentiment import sentiment_tr
except ImportError:
    from ..services.ai_models import ai_ensemble
    from ..services.sentiment import sentiment_tr

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedSentimentAnalyzer:
    """Gelişmiş Sentiment Analiz Sistemi"""
    
    def __init__(self):
        self.financial_keywords = {
            'positive': [
                'artış', 'yükseliş', 'büyüme', 'kâr', 'kar', 'başarı', 'güçlü', 'pozitif',
                'rekor', 'tarihi', 'yüksek', 'iyi', 'mükemmel', 'harika', 'süper',
                'yatırım', 'genişleme', 'büyüme', 'gelişme', 'ilerleme', 'başarılı',
                'kârlı', 'verimli', 'etkili', 'başarılı', 'kazanç', 'getiri'
            ],
            'negative': [
                'düşüş', 'azalış', 'kayıp', 'zarar', 'zayıf', 'negatif', 'kötü',
                'başarısız', 'düşük', 'zayıf', 'kötü', 'berbat', 'felaket',
                'kriz', 'bunalım', 'çöküş', 'iflas', 'batık', 'kayıp',
                'zarar', 'kötüleşme', 'gerileme', 'düşüş', 'azalma'
            ],
            'neutral': [
                'değişim', 'hareket', 'dalgalanma', 'istikrar', 'sabit', 'aynı',
                'beklenti', 'tahmin', 'analiz', 'rapor', 'açıklama', 'bildirim'
            ]
        }
        
        self.financial_terms = {
            'profit': ['kar', 'kâr', 'profit', 'kazanç', 'getiri', 'gelir'],
            'loss': ['zarar', 'loss', 'kayıp', 'gider', 'maliyet'],
            'growth': ['büyüme', 'growth', 'artış', 'genişleme', 'gelişme'],
            'decline': ['düşüş', 'decline', 'azalış', 'küçülme', 'gerileme'],
            'investment': ['yatırım', 'investment', 'sermaye', 'fon'],
            'dividend': ['temettü', 'dividend', 'kâr payı', 'dağıtım'],
            'merger': ['birleşme', 'merger', 'satın alma', 'acquisition'],
            'ipo': ['halka arz', 'ipo', 'ilk halka arz', 'public offering']
        }
        
    async def analyze_comprehensive_sentiment(self, text: str, symbol: str = "") -> Dict:
        """Kapsamlı sentiment analizi"""
        try:
            # 1. FinBERT-TR analizi
            finbert_result = await self._analyze_with_finbert(text)
            
            # 2. Basit keyword analizi
            keyword_result = self._analyze_with_keywords(text)
            
            # 3. Finansal terim analizi
            financial_result = self._analyze_financial_terms(text)
            
            # 4. Ensemble sentiment
            ensemble_result = self._ensemble_sentiment(
                finbert_result, keyword_result, financial_result
            )
            
            # 5. Sembol-spesifik analiz
            symbol_result = await self._analyze_symbol_sentiment(text, symbol)
            
            return {
                'text': text,
                'symbol': symbol,
                'finbert': finbert_result,
                'keyword': keyword_result,
                'financial': financial_result,
                'symbol_specific': symbol_result,
                'ensemble': ensemble_result,
                'final_sentiment': ensemble_result,
                'confidence': self._calculate_confidence(finbert_result, keyword_result, financial_result)
            }
            
        except Exception as e:
            logger.error(f"❌ Sentiment analiz hatası: {e}")
            return {'error': str(e)}
            
    async def _analyze_with_finbert(self, text: str) -> Dict:
        """FinBERT-TR ile analiz"""
        try:
            if ai_ensemble.finbert.is_loaded:
                return ai_ensemble.finbert.predict_sentiment(text)
            else:
                # Fallback to simple sentiment
                return sentiment_tr(text)
        except Exception as e:
            logger.error(f"❌ FinBERT analiz hatası: {e}")
            return sentiment_tr(text)
            
    def _analyze_with_keywords(self, text: str) -> Dict:
        """Keyword tabanlı analiz"""
        text_lower = text.lower()
        
        positive_count = sum(1 for word in self.financial_keywords['positive'] if word in text_lower)
        negative_count = sum(1 for word in self.financial_keywords['negative'] if word in text_lower)
        neutral_count = sum(1 for word in self.financial_keywords['neutral'] if word in text_lower)
        
        total_count = positive_count + negative_count + neutral_count
        
        if total_count == 0:
            return {'score': 0.0, 'label': 'neutral', 'confidence': 0.0}
            
        # Score hesapla
        score = (positive_count - negative_count) / total_count
        score = max(-1.0, min(1.0, score))
        
        # Label belirle
        if score > 0.2:
            label = 'positive'
        elif score < -0.2:
            label = 'negative'
        else:
            label = 'neutral'
            
        # Confidence
        confidence = max(positive_count, negative_count, neutral_count) / total_count
        
        return {
            'score': score,
            'label': label,
            'confidence': confidence,
            'counts': {
                'positive': positive_count,
                'negative': negative_count,
                'neutral': neutral_count
            }
        }
        
    def _analyze_financial_terms(self, text: str) -> Dict:
        """Finansal terim analizi"""
        text_lower = text.lower()
        
        term_scores = {}
        for category, terms in self.financial_terms.items():
            count = sum(1 for term in terms if term in text_lower)
            term_scores[category] = count
            
        # Finansal etki skoru
        positive_terms = ['profit', 'growth', 'investment', 'dividend', 'merger', 'ipo']
        negative_terms = ['loss', 'decline']
        
        positive_score = sum(term_scores.get(term, 0) for term in positive_terms)
        negative_score = sum(term_scores.get(term, 0) for term in negative_terms)
        
        total_terms = positive_score + negative_score
        
        if total_terms == 0:
            return {'score': 0.0, 'label': 'neutral', 'financial_impact': 0.0}
            
        score = (positive_score - negative_score) / total_terms
        score = max(-1.0, min(1.0, score))
        
        label = 'positive' if score > 0.1 else ('negative' if score < -0.1 else 'neutral')
        financial_impact = total_terms / 10.0  # Normalize
        
        return {
            'score': score,
            'label': label,
            'financial_impact': financial_impact,
            'term_scores': term_scores
        }
        
    def _ensemble_sentiment(self, finbert: Dict, keyword: Dict, financial: Dict) -> Dict:
        """Ensemble sentiment skoru"""
        scores = []
        weights = []
        confidences = []
        
        # FinBERT skoru
        if finbert and 'score' in finbert:
            scores.append(finbert['score'])
            weights.append(0.5)
            confidences.append(finbert.get('confidence', 0.5))
            
        # Keyword skoru
        if keyword and 'score' in keyword:
            scores.append(keyword['score'])
            weights.append(0.3)
            confidences.append(keyword.get('confidence', 0.5))
            
        # Financial skoru
        if financial and 'score' in financial:
            scores.append(financial['score'])
            weights.append(0.2)
            confidences.append(0.8)  # Financial terms genelde güvenilir
            
        if not scores:
            return {'score': 0.0, 'label': 'neutral', 'confidence': 0.0}
            
        # Weighted average
        ensemble_score = sum(s * w for s, w in zip(scores, weights)) / sum(weights)
        ensemble_confidence = sum(c * w for c, w in zip(confidences, weights)) / sum(weights)
        
        # Label belirle
        if ensemble_score > 0.2:
            label = 'positive'
        elif ensemble_score < -0.2:
            label = 'negative'
        else:
            label = 'neutral'
            
        return {
            'score': ensemble_score,
            'label': label,
            'confidence': ensemble_confidence,
            'individual_scores': scores,
            'weights': weights
        }
        
    async def _analyze_symbol_sentiment(self, text: str, symbol: str) -> Dict:
        """Sembol-spesifik sentiment analizi"""
        if not symbol:
            return {'score': 0.0, 'label': 'neutral'}
            
        # Sembol-spesifik anahtar kelimeler
        symbol_keywords = {
            'SISE.IS': ['cam', 'glass', 'sisecam', 'inşaat', 'construction'],
            'EREGL.IS': ['çelik', 'steel', 'erdemir', 'ereğli', 'metal'],
            'TUPRS.IS': ['petrol', 'oil', 'tüpraş', 'rafineri', 'refinery'],
            'AKBNK.IS': ['akbank', 'bank', 'finans', 'finance', 'kredi'],
            'GARAN.IS': ['garanti', 'bank', 'finans', 'finance'],
            'THYAO.IS': ['thy', 'havayolu', 'airline', 'uçak', 'aircraft'],
            'BIMAS.IS': ['bim', 'market', 'retail', 'perakende', 'gıda'],
            'ASELS.IS': ['aselsan', 'savunma', 'defense', 'teknoloji', 'technology'],
            'PETKM.IS': ['petkim', 'petrokimya', 'petrochemical', 'kimya', 'chemistry'],
            'TCELL.IS': ['turkcell', 'telekom', 'telecom', 'mobil', 'mobile']
        }
        
        symbol_terms = symbol_keywords.get(symbol, [])
        text_lower = text.lower()
        
        symbol_count = sum(1 for term in symbol_terms if term in text_lower)
        
        if symbol_count == 0:
            return {'score': 0.0, 'label': 'neutral', 'symbol_relevance': 0.0}
            
        # Sembol relevansı
        symbol_relevance = min(1.0, symbol_count / 3.0)
        
        # Sembol-spesifik sentiment (basit)
        return {
            'score': 0.1 * symbol_relevance,  # Pozitif bias
            'label': 'positive' if symbol_relevance > 0.5 else 'neutral',
            'symbol_relevance': symbol_relevance,
            'symbol_terms_found': symbol_count
        }
        
    def _calculate_confidence(self, finbert: Dict, keyword: Dict, financial: Dict) -> float:
        """Genel güven skoru"""
        confidences = []
        
        if finbert and 'confidence' in finbert:
            confidences.append(finbert['confidence'])
            
        if keyword and 'confidence' in keyword:
            confidences.append(keyword['confidence'])
            
        if financial and 'financial_impact' in financial:
            confidences.append(financial['financial_impact'])
            
        if not confidences:
            return 0.5
            
        return sum(confidences) / len(confidences)

# Global enhanced sentiment analyzer
enhanced_sentiment = EnhancedSentimentAnalyzer()



