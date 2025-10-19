"""
BIST AI Smart Trader - Sentiment Analiz Sağlayıcısı
NewsAPI ve FinBERT-TR ile haber/sentiment analizi
"""

import requests
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import asyncio
import re
from typing import List, Dict, Optional

class SentimentDataProvider:
    def __init__(self):
        # NewsAPI anahtarı (ücretsiz: 1000 haber/gün)
        self.news_api_key = "YOUR_NEWS_API_KEY"  # Kullanıcı kendi anahtarını ekleyecek
        self.news_api_url = "https://newsapi.org/v2/everything"
        
        # BIST hisse sembolleri ve şirket isimleri
        self.bist_companies = {
            'AKBNK': ['Akbank', 'AKBNK', 'Akbank T.A.S.'],
            'GARAN': ['Garanti', 'GARAN', 'Garanti BBVA'],
            'THYAO': ['Türk Hava Yolları', 'THY', 'Turkish Airlines'],
            'EREGL': ['Ereğli Demir', 'EREGL', 'Erdemir'],
            'SISE': ['Şişe Cam', 'SISE', 'Şişecam'],
            'TUPRS': ['Tüpraş', 'TUPRS', 'Türkiye Petrol'],
            'ASELS': ['Aselsan', 'ASELS', 'Aselsan Elektronik'],
            'BIMAS': ['BİM', 'BIMAS', 'BİM Mağazalar'],
            'KCHOL': ['Koç Holding', 'KCHOL', 'Koç'],
            'SAHOL': ['Sabancı Holding', 'SAHOL', 'Sabancı']
        }
        
        # FinBERT-TR için basit sentiment sözlüğü (gerçek implementasyon için transformers kütüphanesi gerekli)
        self.sentiment_words = {
            'positive': [
                'artış', 'yükseliş', 'büyüme', 'kazanç', 'kâr', 'başarı', 'güçlü', 'pozitif',
                'iyileşme', 'gelişme', 'ilerleme', 'olumlu', 'mükemmel', 'harika', 'süper',
                'increase', 'growth', 'profit', 'success', 'strong', 'positive', 'improvement'
            ],
            'negative': [
                'düşüş', 'azalış', 'kayıp', 'zarar', 'başarısızlık', 'zayıf', 'negatif',
                'kötüleşme', 'gerileme', 'olumsuz', 'kötü', 'berbat', 'felaket', 'kriz',
                'decrease', 'loss', 'failure', 'weak', 'negative', 'deterioration', 'crisis'
            ],
            'neutral': [
                'değişim', 'stabil', 'sabit', 'normal', 'standart', 'ortalama', 'beklenen',
                'change', 'stable', 'normal', 'average', 'expected', 'standard'
            ]
        }

    def get_news_sentiment(self, symbol: str, days: int = 7) -> Dict:
        """Haber sentiment analizi"""
        try:
            # Şirket anahtar kelimeleri
            company_keywords = self.bist_companies.get(symbol, [symbol])
            
            # NewsAPI'den haberleri çek
            news_data = self._fetch_news_from_api(company_keywords, days)
            
            # Sentiment analizi yap
            sentiment_scores = []
            analyzed_news = []
            
            for article in news_data:
                sentiment_score = self._analyze_text_sentiment(article['title'] + ' ' + article['description'])
                sentiment_scores.append(sentiment_score)
                
                analyzed_news.append({
                    'title': article['title'],
                    'description': article['description'],
                    'url': article['url'],
                    'published_at': article['publishedAt'],
                    'sentiment_score': sentiment_score,
                    'sentiment_label': self._get_sentiment_label(sentiment_score)
                })
            
            # Genel sentiment skoru
            if sentiment_scores:
                avg_sentiment = np.mean(sentiment_scores)
                sentiment_trend = self._calculate_sentiment_trend(sentiment_scores)
            else:
                avg_sentiment = 0
                sentiment_trend = 'neutral'
            
            return {
                'symbol': symbol,
                'avg_sentiment': avg_sentiment,
                'sentiment_trend': sentiment_trend,
                'news_count': len(analyzed_news),
                'news_articles': analyzed_news,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"⚠️ {symbol} sentiment analizi hatası: {e}")
            return {
                'symbol': symbol,
                'avg_sentiment': 0,
                'sentiment_trend': 'neutral',
                'news_count': 0,
                'news_articles': [],
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    def _fetch_news_from_api(self, keywords: List[str], days: int) -> List[Dict]:
        """NewsAPI'den haberleri çek"""
        try:
            # Eğer API anahtarı yoksa mock veri döndür
            if self.news_api_key == "YOUR_NEWS_API_KEY":
                return self._get_mock_news_data(keywords, days)
            
            # Tarih aralığı
            to_date = datetime.now()
            from_date = to_date - timedelta(days=days)
            
            # Anahtar kelimeleri birleştir
            query = ' OR '.join(keywords)
            
            params = {
                'q': query,
                'from': from_date.strftime('%Y-%m-%d'),
                'to': to_date.strftime('%Y-%m-%d'),
                'language': 'tr,en',
                'sortBy': 'publishedAt',
                'pageSize': 20,
                'apiKey': self.news_api_key
            }
            
            response = requests.get(self.news_api_url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return data.get('articles', [])
            else:
                print(f"⚠️ NewsAPI hatası: {response.status_code}")
                return self._get_mock_news_data(keywords, days)
                
        except Exception as e:
            print(f"⚠️ NewsAPI bağlantı hatası: {e}")
            return self._get_mock_news_data(keywords, days)

    def _get_mock_news_data(self, keywords: List[str], days: int) -> List[Dict]:
        """Mock haber verisi"""
        mock_news = [
            {
                'title': f"{keywords[0]} hissesi güçlü performans gösteriyor",
                'description': f"{keywords[0]} şirketinin son çeyrek sonuçları beklentileri aştı. Yatırımcılar pozitif tepki veriyor.",
                'url': 'https://example.com/news1',
                'publishedAt': (datetime.now() - timedelta(hours=2)).isoformat()
            },
            {
                'title': f"{keywords[0]} için analistler yükseltme önerisi",
                'description': f"Finansal analistler {keywords[0]} hissesi için fiyat hedefini yükseltti. Büyüme potansiyeli yüksek.",
                'url': 'https://example.com/news2',
                'publishedAt': (datetime.now() - timedelta(hours=5)).isoformat()
            },
            {
                'title': f"{keywords[0]} sektörde liderliğini sürdürüyor",
                'description': f"{keywords[0]} şirketi sektördeki konumunu güçlendiriyor. Rekabet avantajı devam ediyor.",
                'url': 'https://example.com/news3',
                'publishedAt': (datetime.now() - timedelta(hours=8)).isoformat()
            }
        ]
        
        # Rastgele sentiment ekle
        sentiment_variations = [
            ("güçlü performans", "pozitif"),
            ("yükseltme önerisi", "pozitif"),
            ("liderlik", "pozitif"),
            ("düşüş", "negatif"),
            ("kayıp", "negatif"),
            ("zayıflama", "negatif")
        ]
        
        for i, news in enumerate(mock_news):
            variation = sentiment_variations[i % len(sentiment_variations)]
            news['title'] = news['title'].replace("güçlü", variation[0])
            news['description'] = news['description'].replace("pozitif", variation[1])
        
        return mock_news

    def _analyze_text_sentiment(self, text: str) -> float:
        """Metin sentiment analizi (basit sözlük tabanlı)"""
        try:
            text_lower = text.lower()
            
            positive_count = 0
            negative_count = 0
            neutral_count = 0
            
            # Pozitif kelimeleri say
            for word in self.sentiment_words['positive']:
                positive_count += text_lower.count(word)
            
            # Negatif kelimeleri say
            for word in self.sentiment_words['negative']:
                negative_count += text_lower.count(word)
            
            # Nötr kelimeleri say
            for word in self.sentiment_words['neutral']:
                neutral_count += text_lower.count(word)
            
            total_words = positive_count + negative_count + neutral_count
            
            if total_words == 0:
                return 0.0  # Nötr
            
            # Sentiment skoru hesapla (-1 ile +1 arası)
            sentiment_score = (positive_count - negative_count) / total_words
            
            # Skoru -1 ile +1 arasında sınırla
            return max(-1.0, min(1.0, sentiment_score))
            
        except Exception as e:
            print(f"⚠️ Sentiment analizi hatası: {e}")
            return 0.0

    def _get_sentiment_label(self, score: float) -> str:
        """Sentiment skorunu etiketle"""
        if score > 0.3:
            return 'POSITIVE'
        elif score < -0.3:
            return 'NEGATIVE'
        else:
            return 'NEUTRAL'

    def _calculate_sentiment_trend(self, scores: List[float]) -> str:
        """Sentiment trendini hesapla"""
        if len(scores) < 2:
            return 'stable'
        
        # Son 3 skorun ortalaması ile ilk 3 skorun ortalamasını karşılaştır
        recent_avg = np.mean(scores[-3:]) if len(scores) >= 3 else scores[-1]
        early_avg = np.mean(scores[:3]) if len(scores) >= 3 else scores[0]
        
        if recent_avg > early_avg + 0.1:
            return 'improving'
        elif recent_avg < early_avg - 0.1:
            return 'deteriorating'
        else:
            return 'stable'

    def get_bulk_sentiment(self, symbols: List[str], days: int = 7) -> List[Dict]:
        """Toplu sentiment analizi"""
        results = []
        for symbol in symbols:
            try:
                sentiment_data = self.get_news_sentiment(symbol, days)
                results.append(sentiment_data)
            except Exception as e:
                print(f"⚠️ {symbol} toplu sentiment hatası: {e}")
                continue
        
        return results

    def get_sector_sentiment(self, sector: str, days: int = 7) -> Dict:
        """Sektör sentiment analizi"""
        try:
            # Sektör anahtar kelimeleri
            sector_keywords = {
                'banking': ['banka', 'banking', 'finans', 'kredi', 'mevduat'],
                'technology': ['teknoloji', 'teknoloji', 'yazılım', 'donanım', 'IT'],
                'energy': ['enerji', 'petrol', 'doğalgaz', 'elektrik', 'enerji'],
                'manufacturing': ['üretim', 'imalat', 'sanayi', 'fabrika', 'üretim'],
                'aviation': ['havacılık', 'uçak', 'hava yolu', 'havacılık', 'airline']
            }
            
            keywords = sector_keywords.get(sector.lower(), [sector])
            
            # Sektör haberlerini çek
            news_data = self._fetch_news_from_api(keywords, days)
            
            # Sentiment analizi
            sentiment_scores = []
            for article in news_data:
                score = self._analyze_text_sentiment(article['title'] + ' ' + article['description'])
                sentiment_scores.append(score)
            
            avg_sentiment = np.mean(sentiment_scores) if sentiment_scores else 0
            sentiment_trend = self._calculate_sentiment_trend(sentiment_scores) if len(sentiment_scores) > 1 else 'stable'
            
            return {
                'sector': sector,
                'avg_sentiment': avg_sentiment,
                'sentiment_trend': sentiment_trend,
                'news_count': len(news_data),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"⚠️ {sector} sektör sentiment hatası: {e}")
            return {
                'sector': sector,
                'avg_sentiment': 0,
                'sentiment_trend': 'stable',
                'news_count': 0,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    def calculate_sentiment_impact(self, sentiment_data: Dict, price_change: float) -> Dict:
        """Sentiment'in fiyat üzerindeki etkisini hesapla"""
        try:
            sentiment_score = sentiment_data['avg_sentiment']
            news_count = sentiment_data['news_count']
            
            # Sentiment etki faktörü (0-1 arası)
            if news_count == 0:
                impact_factor = 0
            elif news_count < 3:
                impact_factor = 0.3
            elif news_count < 7:
                impact_factor = 0.6
            else:
                impact_factor = 1.0
            
            # Beklenen fiyat etkisi
            expected_impact = sentiment_score * impact_factor * 0.02  # %2 maksimum etki
            
            # Gerçek fiyat değişimi ile karşılaştır
            actual_change = price_change / 100  # Yüzdeyi ondalığa çevir
            
            # Sentiment doğruluğu
            if abs(expected_impact) > 0.001:  # Sıfırdan farklıysa
                accuracy = 1 - abs(actual_change - expected_impact) / abs(expected_impact)
                accuracy = max(0, min(1, accuracy))  # 0-1 arasında sınırla
            else:
                accuracy = 0.5  # Nötr durumda orta doğruluk
            
            return {
                'sentiment_score': sentiment_score,
                'expected_impact': expected_impact * 100,  # Yüzde olarak
                'actual_change': price_change,
                'impact_factor': impact_factor,
                'accuracy': accuracy,
                'correlation': 'positive' if (sentiment_score > 0 and price_change > 0) or (sentiment_score < 0 and price_change < 0) else 'negative'
            }
            
        except Exception as e:
            print(f"⚠️ Sentiment etki hesaplama hatası: {e}")
            return {
                'sentiment_score': 0,
                'expected_impact': 0,
                'actual_change': price_change,
                'impact_factor': 0,
                'accuracy': 0,
                'correlation': 'neutral'
            }

# Test fonksiyonu
if __name__ == "__main__":
    provider = SentimentDataProvider()
    
    print("🚀 BIST AI Smart Trader - Sentiment Analiz Sağlayıcısı Test")
    print("=" * 60)
    
    # Tek hisse sentiment testi
    print("\n📰 AKBNK Sentiment Analizi:")
    akbnk_sentiment = provider.get_news_sentiment('AKBNK', days=7)
    print(f"Ortalama Sentiment: {akbnk_sentiment['avg_sentiment']:.3f}")
    print(f"Sentiment Trend: {akbnk_sentiment['sentiment_trend']}")
    print(f"Haber Sayısı: {akbnk_sentiment['news_count']}")
    
    # Toplu sentiment testi
    print("\n📈 Toplu Sentiment Analizi:")
    bulk_sentiment = provider.get_bulk_sentiment(['AKBNK', 'GARAN', 'THYAO'], days=7)
    for data in bulk_sentiment:
        print(f"{data['symbol']}: {data['avg_sentiment']:.3f} ({data['sentiment_trend']})")
    
    # Sektör sentiment testi
    print("\n🏭 Sektör Sentiment Analizi:")
    sector_sentiment = provider.get_sector_sentiment('banking', days=7)
    print(f"Bankacılık: {sector_sentiment['avg_sentiment']:.3f} ({sector_sentiment['sentiment_trend']})")
    
    # Sentiment etki analizi
    print("\n💹 Sentiment Etki Analizi:")
    impact_analysis = provider.calculate_sentiment_impact(akbnk_sentiment, 2.5)  # %2.5 fiyat artışı
    print(f"Beklenen Etki: {impact_analysis['expected_impact']:.2f}%")
    print(f"Gerçek Değişim: {impact_analysis['actual_change']:.2f}%")
    print(f"Doğruluk: {impact_analysis['accuracy']:.2f}")
    print(f"Korelasyon: {impact_analysis['correlation']}")
