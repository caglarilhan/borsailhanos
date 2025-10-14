#!/usr/bin/env python3
"""
7/24 Haber Tarama Sistemi
- KAP, Bloomberg, Reuters, Twitter'dan sürekli haber tarar
- Önemli haberleri tespit edip bildirim gönderir
- Haber + fiyat analizi birlikte sunar
"""

import asyncio
import time
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging

# Local imports
try:
    from backend.data.price_layer import fetch_recent_ohlcv
    from backend.services.pattern_adapter import detect_patterns_from_ohlcv
    from backend.services.notifications import get_fcm
    from backend.services.sentiment import sentiment_tr
except ImportError:
    from ..data.price_layer import fetch_recent_ohlcv
    from ..services.pattern_adapter import detect_patterns_from_ohlcv
    from ..services.notifications import get_fcm
    from ..services.sentiment import sentiment_tr

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# BIST sembolleri ve anahtar kelimeler
BIST_SYMBOLS = {
    'SISE.IS': ['Sisecam', 'Sise Cam', 'cam', 'glass'],
    'EREGL.IS': ['Ereğli', 'Erdemir', 'çelik', 'steel'],
    'TUPRS.IS': ['Tüpraş', 'Tupras', 'petrol', 'oil', 'rafineri'],
    'AKBNK.IS': ['Akbank', 'bank', 'finans'],
    'GARAN.IS': ['Garanti', 'bank', 'finans'],
    'THYAO.IS': ['Türk Hava Yolları', 'THY', 'havayolu', 'airline'],
    'BIMAS.IS': ['BİM', 'market', 'retail', 'perakende'],
    'ASELS.IS': ['Aselsan', 'savunma', 'defense', 'teknoloji'],
    'PETKM.IS': ['Petkim', 'petrokimya', 'kimya'],
    'TCELL.IS': ['Turkcell', 'telekom', 'telecom']
}

# Önemli haber anahtar kelimeleri
IMPORTANT_KEYWORDS = [
    'kar', 'zarar', 'kâr', 'satış', 'büyüme', 'yatırım', 'ortaklık',
    'anlaşma', 'sözleşme', 'ihale', 'proje', 'fabrika', 'tesis',
    'hisse', 'temettü', 'bölünme', 'birleşme', 'satın alma',
    'CEO', 'genel müdür', 'yönetim', 'kurul', 'toplantı',
    'dava', 'ceza', 'yaptırım', 'ambargo', 'kısıtlama',
    'döviz', 'kur', 'enflasyon', 'faiz', 'merkez bankası'
]

class NewsMonitor:
    def __init__(self):
        self.fcm = get_fcm()
        self.processed_news = set()  # Duplicate önleme
        self.news_cooldown = {}  # Spam önleme
        
    async def fetch_kap_news(self) -> List[Dict]:
        """KAP haberlerini çek (simülasyon)"""
        # Gerçek implementasyon için KAP API veya web scraping gerekir
        # Şimdilik simülasyon
        return [
            {
                'source': 'KAP',
                'title': 'Sisecam 2024 Q3 kar açıklaması',
                'content': 'Sisecam 2024 üçüncü çeyrek net karı %15 artış gösterdi...',
                'symbol': 'SISE.IS',
                'timestamp': datetime.now(),
                'url': 'https://kap.org.tr/tr/Bildirim/123456'
            }
        ]
        
    async def fetch_bloomberg_news(self) -> List[Dict]:
        """Bloomberg haberlerini çek (simülasyon)"""
        return [
            {
                'source': 'Bloomberg',
                'title': 'Turkish Airlines reports strong Q3 results',
                'content': 'Turkish Airlines posted better-than-expected quarterly results...',
                'symbol': 'THYAO.IS',
                'timestamp': datetime.now(),
                'url': 'https://bloomberg.com/news/123456'
            }
        ]
        
    async def fetch_twitter_news(self) -> List[Dict]:
        """Twitter'dan haber çek (simülasyon)"""
        return [
            {
                'source': 'Twitter',
                'title': 'Akbank CEO açıklaması',
                'content': 'Akbank CEO: "Dijital dönüşümde öncüyüz" #Akbank #Finans',
                'symbol': 'AKBNK.IS',
                'timestamp': datetime.now(),
                'url': 'https://twitter.com/status/123456'
            }
        ]
        
    def extract_symbol_from_news(self, title: str, content: str) -> Optional[str]:
        """Haber metninden hisse sembolünü çıkar"""
        text = (title + ' ' + content).lower()
        
        for symbol, keywords in BIST_SYMBOLS.items():
            for keyword in keywords:
                if keyword.lower() in text:
                    return symbol
                    
        return None
        
    def is_important_news(self, title: str, content: str) -> bool:
        """Haberin önemli olup olmadığını kontrol et"""
        text = (title + ' ' + content).lower()
        
        # Önemli anahtar kelime sayısı
        important_count = sum(1 for keyword in IMPORTANT_KEYWORDS if keyword.lower() in text)
        
        # Finansal sayılar (kar, zarar, yüzde)
        financial_numbers = re.findall(r'%?\d+[.,]?\d*%?', text)
        
        # Duygusal kelimeler
        emotional_words = ['artış', 'düşüş', 'yükseliş', 'çöküş', 'rekor', 'tarihi', 'ilk']
        emotional_count = sum(1 for word in emotional_words if word in text)
        
        # Önem skoru
        importance_score = (important_count * 2 + 
                          len(financial_numbers) * 1.5 + 
                          emotional_count * 1)
        
        return importance_score >= 3
        
    async def analyze_news_impact(self, news_item: Dict) -> Dict:
        """Haberin fiyat etkisini analiz et"""
        symbol = news_item['symbol']
        if not symbol:
            return {}
            
        try:
            # Fiyat verisi
            df = fetch_recent_ohlcv(symbol=symbol, period="1d", interval="5m")
            if df.empty:
                return {}
                
            # Son fiyat değişimi
            current_price = df['close'].iloc[-1]
            prev_price = df['close'].iloc[-2] if len(df) > 1 else current_price
            price_change = (current_price - prev_price) / prev_price
            
            # Pattern analizi
            patterns = detect_patterns_from_ohlcv(df.tail(20))
            bullish_patterns = [p for p in patterns if p.get('signal') in ['BUY', 'BULLISH']]
            
            # Sentiment analizi
            sentiment = sentiment_tr(news_item['title'] + ' ' + news_item['content'])
            
            # Haber etki skoru
            impact_score = 0
            if abs(price_change) > 0.02:  # %2+ değişim
                impact_score += 30
            if len(bullish_patterns) > 0:
                impact_score += 20
            if sentiment['score'] > 0.3:  # Pozitif sentiment
                impact_score += 25
            if sentiment['score'] < -0.3:  # Negatif sentiment
                impact_score += 25
                
            return {
                'symbol': symbol,
                'price_change': price_change,
                'current_price': current_price,
                'patterns': len(bullish_patterns),
                'sentiment': sentiment,
                'impact_score': impact_score,
                'news_item': news_item
            }
            
        except Exception as e:
            logger.error(f"❌ {symbol} haber etki analizi hatası: {e}")
            return {}
            
    async def send_news_alert(self, analysis: Dict):
        """Haber + fiyat analizi bildirimi gönder"""
        symbol = analysis['symbol']
        news_item = analysis['news_item']
        price_change = analysis['price_change']
        sentiment = analysis['sentiment']
        impact_score = analysis['impact_score']
        
        # Spam önleme (15 dakika cooldown)
        now = datetime.now()
        if symbol in self.news_cooldown:
            if (now - self.news_cooldown[symbol]).seconds < 900:
                return
                
        self.news_cooldown[symbol] = now
        
        # Sadece yüksek etki skorunda bildirim gönder
        if impact_score < 50:
            logger.info(f"⚠️ {symbol} haber etki skoru düşük: {impact_score} - Bildirim gönderilmedi")
            return
            
        # Bildirim metni
        change_emoji = "📈" if price_change > 0 else "📉"
        sentiment_emoji = "😊" if sentiment['score'] > 0.2 else ("😟" if sentiment['score'] < -0.2 else "😐")
        
        title = f"📰 {symbol} Önemli Haber!"
        body = (f"{change_emoji} Fiyat: {price_change:+.1%}\n"
                f"{sentiment_emoji} Sentiment: {sentiment['label']}\n"
                f"📊 Etki: {impact_score}/100\n"
                f"📝 {news_item['title'][:50]}...\n"
                f"🔗 {news_item['source']}\n"
                f"⏰ {now.strftime('%H:%M')}")
        
        try:
            self.fcm.send(
                title=title,
                body=body,
                topic="news_alerts"
            )
            logger.info(f"✅ {symbol} haber bildirimi gönderildi (Etki: {impact_score})")
        except Exception as e:
            logger.error(f"❌ FCM gönderim hatası: {e}")
            
    async def monitor_news(self):
        """7/24 haber tarama"""
        logger.info("📰 7/24 Haber Tarama Sistemi Başlatıldı")
        
        while True:
            try:
                # Tüm haber kaynaklarından çek
                all_news = []
                
                # KAP haberleri
                kap_news = await self.fetch_kap_news()
                all_news.extend(kap_news)
                
                # Bloomberg haberleri
                bloomberg_news = await self.fetch_bloomberg_news()
                all_news.extend(bloomberg_news)
                
                # Twitter haberleri
                twitter_news = await self.fetch_twitter_news()
                all_news.extend(twitter_news)
                
                # Her haber için analiz
                for news_item in all_news:
                    # Duplicate kontrolü
                    news_id = f"{news_item['source']}_{news_item['title']}"
                    if news_id in self.processed_news:
                        continue
                        
                    self.processed_news.add(news_id)
                    
                    # Sembol çıkar
                    if not news_item.get('symbol'):
                        news_item['symbol'] = self.extract_symbol_from_news(
                            news_item['title'], news_item['content']
                        )
                    
                    # Önemli haber kontrolü
                    if not self.is_important_news(news_item['title'], news_item['content']):
                        continue
                        
                    # Etki analizi
                    analysis = await self.analyze_news_impact(news_item)
                    if analysis:
                        await self.send_news_alert(analysis)
                        
                # 5 dakika bekle
                await asyncio.sleep(300)
                
            except Exception as e:
                logger.error(f"❌ Haber tarama hatası: {e}")
                await asyncio.sleep(60)

# Global news monitor
news_monitor = NewsMonitor()

async def start_news_monitoring():
    """Haber taramayı başlat"""
    await news_monitor.monitor_news()

if __name__ == "__main__":
    # Test için hemen çalıştır
    asyncio.run(start_news_monitoring())



