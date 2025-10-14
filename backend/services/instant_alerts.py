#!/usr/bin/env python3
"""
Anlık Yükseliş Tespit Sistemi
- Sürekli fiyat değişimlerini izler
- Kesin yükseliş sinyali geldiğinde anında bildirim gönderir
"""

import asyncio
import time
from datetime import datetime, time as dt_time
from typing import Dict, List
import logging

# Local imports
try:
    from backend.data.price_layer import fetch_recent_ohlcv
    from backend.services.pattern_adapter import detect_patterns_from_ohlcv
    from backend.services.notifications import get_fcm
    from backend.services.rl_agent import SimpleRLAagent
except ImportError:
    from ..data.price_layer import fetch_recent_ohlcv
    from ..services.pattern_adapter import detect_patterns_from_ohlcv
    from ..services.notifications import get_fcm
    from ..services.rl_agent import SimpleRLAagent

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# İzlenen hisseler (daha az sayıda, hızlı tespit için)
WATCHED_SYMBOLS = [
    'SISE.IS', 'EREGL.IS', 'TUPRS.IS', 'AKBNK.IS', 'GARAN.IS', 
    'THYAO.IS', 'BIMAS.IS', 'ASELS.IS', 'PETKM.IS', 'TCELL.IS'
]

class InstantAlertSystem:
    def __init__(self):
        self.fcm = get_fcm()
        self.rl_agent = SimpleRLAagent()
        self.last_prices = {}  # Son fiyatları takip et
        self.alert_cooldown = {}  # Spam önleme
        self.market_start = dt_time(8, 0)  # Sabah 8:00
        self.market_end = dt_time(22, 0)   # Akşam 22:00
        self.recent_news = {}  # Son haberler cache
        
    def is_market_hours(self) -> bool:
        """Piyasa saatleri kontrolü (8:00-22:00)"""
        now = datetime.now().time()
        return self.market_start <= now <= self.market_end
        
    async def check_instant_signals(self, symbol: str) -> Dict:
        """Tek hisse için anlık sinyal kontrolü - Yüksek doğruluk kriterleri"""
        try:
            # Piyasa saatleri kontrolü
            if not self.is_market_hours():
                return {}
                
            # Son 2 saatlik veri (5dk interval)
            df = fetch_recent_ohlcv(symbol=symbol, period="1d", interval="5m")
            if df.empty or len(df) < 20:
                return {}
                
            current_price = df['close'].iloc[-1]
            prev_price = df['close'].iloc[-2] if len(df) > 1 else current_price
            
            # Fiyat değişimi
            price_change = (current_price - prev_price) / prev_price
            
            # Pattern analizi (son 30 mum)
            patterns = detect_patterns_from_ohlcv(df.tail(30))
            
            # Çok güçlü yükseliş sinyalleri (daha sıkı kriterler)
            very_strong_bullish = [
                p for p in patterns 
                if p.get('confidence', 0) > 90 and p.get('signal') in ['BUY', 'BULLISH']
            ]
            
            # Hacim artışı kontrolü (daha sıkı)
            current_volume = df['volume'].iloc[-1] if 'volume' in df.columns else 0
            avg_volume = df['volume'].tail(15).mean() if 'volume' in df.columns else 0
            volume_spike = current_volume > avg_volume * 2.0 if avg_volume > 0 else False
            
            # Momentum kontrolü (RSI benzeri)
            price_momentum = df['close'].tail(5).pct_change().mean()
            
            # Trend kuvveti (EMA cross)
            ema_short = df['close'].ewm(span=5).mean().iloc[-1]
            ema_long = df['close'].ewm(span=15).mean().iloc[-1]
            trend_bullish = ema_short > ema_long
            
            # Yüksek doğruluk kriterleri (çok sıkı)
            high_confidence_bullish = (
                price_change > 0.05 and  # %5+ yükseliş (daha yüksek eşik)
                len(very_strong_bullish) >= 2 and  # En az 2 çok güçlü pattern
                volume_spike and  # Hacim artışı
                price_momentum > 0.02 and  # Pozitif momentum
                trend_bullish  # Trend desteği
            )
            
            if high_confidence_bullish:
                # Toplam güven skoru
                pattern_confidence = sum([p.get('confidence', 0) for p in very_strong_bullish]) / len(very_strong_bullish)
                total_confidence = (pattern_confidence * 0.4 + 
                                  min(price_change * 1000, 100) * 0.3 + 
                                  (100 if volume_spike else 0) * 0.2 + 
                                  (100 if trend_bullish else 0) * 0.1)
                
                # Haber kontrolü (opsiyonel)
                news_context = await self.check_recent_news(symbol)
                
                return {
                    'symbol': symbol,
                    'price_change': price_change,
                    'current_price': current_price,
                    'patterns': len(very_strong_bullish),
                    'volume_spike': volume_spike,
                    'confidence': min(total_confidence, 100),
                    'alert_type': 'HIGH_CONFIDENCE_BULLISH',
                    'momentum': price_momentum,
                    'trend': 'BULLISH' if trend_bullish else 'BEARISH',
                    'news_context': news_context
                }
                
        except Exception as e:
            logger.error(f"❌ {symbol} anlık sinyal hatası: {e}")
            
        return {}
        
    async def check_recent_news(self, symbol: str) -> Optional[Dict]:
        """Son 1 saatteki haberleri kontrol et"""
        try:
            # Haber cache'den kontrol et
            if symbol in self.recent_news:
                news_time = self.recent_news[symbol].get('timestamp')
                if news_time and (datetime.now() - news_time).seconds < 3600:  # 1 saat
                    return self.recent_news[symbol]
            return None
        except Exception:
            return None
        
    async def send_instant_alert(self, alert_data: Dict):
        """Yüksek doğruluk anlık bildirim gönder"""
        symbol = alert_data['symbol']
        price_change = alert_data['price_change']
        confidence = alert_data['confidence']
        patterns = alert_data['patterns']
        momentum = alert_data.get('momentum', 0)
        
        # Spam önleme (10 dakika cooldown - daha uzun)
        now = datetime.now()
        if symbol in self.alert_cooldown:
            if (now - self.alert_cooldown[symbol]).seconds < 600:
                return
                
        self.alert_cooldown[symbol] = now
        
        # Sadece çok yüksek güven skorlarında bildirim gönder
        if confidence < 85:
            logger.info(f"⚠️ {symbol} güven skoru düşük: {confidence:.1f}% - Bildirim gönderilmedi")
            return
        
        # Haber bağlamı kontrolü
        news_context = alert_data.get('news_context')
        news_text = ""
        if news_context:
            news_text = f"\n📰 Haber: {news_context.get('title', '')[:40]}..."
        
        # Detaylı bildirim metni
        title = f"🎯 {symbol} Yüksek Güven Yükseliş!"
        body = (f"Fiyat: +{price_change:.1%}\n"
                f"Güven: {confidence:.0f}%\n"
                f"Pattern: {patterns} güçlü sinyal\n"
                f"Momentum: +{momentum:.1%}"
                f"{news_text}\n"
                f"⏰ {now.strftime('%H:%M')}")
        
        try:
            self.fcm.send(
                title=title,
                body=body,
                topic="high_confidence_alerts"
            )
            logger.info(f"✅ {symbol} yüksek güven bildirimi gönderildi (Güven: {confidence:.1f}%)")
        except Exception as e:
            logger.error(f"❌ FCM gönderim hatası: {e}")
            
    async def monitor_symbols(self):
        """Tüm hisseleri izle - Sadece piyasa saatlerinde"""
        logger.info("👀 Yüksek doğruluk anlık izleme başlatıldı (8:00-22:00)")
        
        while True:
            try:
                # Piyasa saatleri kontrolü
                if self.is_market_hours():
                    logger.info(f"📊 Piyasa saatleri - İzleme aktif: {datetime.now().strftime('%H:%M')}")
                    
                    for symbol in WATCHED_SYMBOLS:
                        alert_data = await self.check_instant_signals(symbol)
                        if alert_data:
                            await self.send_instant_alert(alert_data)
                            
                    # 1 dakika bekle (daha sık kontrol)
                    await asyncio.sleep(60)
                else:
                    # Piyasa kapalı - 30 dakika bekle
                    logger.info(f"😴 Piyasa kapalı - {datetime.now().strftime('%H:%M')} - 30dk bekleniyor")
                    await asyncio.sleep(1800)
                
            except Exception as e:
                logger.error(f"❌ İzleme hatası: {e}")
                await asyncio.sleep(60)

# Global alert system
instant_alerts = InstantAlertSystem()

async def start_instant_monitoring():
    """Anlık izlemeyi başlat"""
    await instant_alerts.monitor_symbols()

if __name__ == "__main__":
    # Test için hemen çalıştır
    asyncio.run(start_instant_monitoring())
