#!/usr/bin/env python3
"""
Ultra Yüksek Doğruluk Sistemi (%95+)
- Sadece çok yüksek güven skorlarında bildirim gönderir
- Çoklu doğrulama katmanları
- Risk değerlendirmesi ile birlikte
"""

import asyncio
import time
from datetime import datetime, time as dt_time
from typing import Dict, List
import logging

# Local imports
try:
    from backend.services.advanced_analyzer import advanced_analyzer
    from backend.services.notifications import get_fcm
except ImportError:
    from ..services.advanced_analyzer import advanced_analyzer
    from ..services.notifications import get_fcm

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# İzlenen hisseler
WATCHED_SYMBOLS = [
    'SISE.IS', 'EREGL.IS', 'TUPRS.IS', 'AKBNK.IS', 'GARAN.IS', 
    'THYAO.IS', 'BIMAS.IS', 'ASELS.IS', 'PETKM.IS', 'TCELL.IS'
]

class UltraHighConfidenceSystem:
    def __init__(self):
        self.fcm = get_fcm()
        self.alert_cooldown = {}  # Spam önleme
        self.market_start = dt_time(8, 0)  # Sabah 8:00
        self.market_end = dt_time(22, 0)   # Akşam 22:00
        self.min_confidence = 0.95  # %95 minimum güven
        
    def is_market_hours(self) -> bool:
        """Piyasa saatleri kontrolü"""
        now = datetime.now().time()
        return self.market_start <= now <= self.market_end
        
    async def analyze_symbol(self, symbol: str) -> Dict:
        """Tek hisse için ultra yüksek doğruluk analizi"""
        try:
            # Kapsamlı analiz
            analysis = await advanced_analyzer.comprehensive_analysis(symbol)
            
            if not analysis:
                return {}
                
            final_confidence = analysis.get('final_confidence', 0)
            recommendation = analysis.get('recommendation', {})
            risk_assessment = analysis.get('risk_assessment', {})
            
            # Ultra yüksek güven kriterleri
            if (final_confidence >= self.min_confidence and 
                recommendation.get('action') in ['STRONG_BUY', 'BUY'] and
                risk_assessment.get('risk_level') in ['LOW', 'MEDIUM']):
                
                return {
                    'symbol': symbol,
                    'confidence': final_confidence,
                    'recommendation': recommendation,
                    'risk_assessment': risk_assessment,
                    'analysis': analysis,
                    'alert_type': 'ULTRA_HIGH_CONFIDENCE'
                }
                
        except Exception as e:
            logger.error(f"❌ {symbol} ultra analiz hatası: {e}")
            
        return {}
        
    async def send_ultra_alert(self, alert_data: Dict):
        """Ultra yüksek güven bildirimi gönder"""
        symbol = alert_data['symbol']
        confidence = alert_data['confidence']
        recommendation = alert_data['recommendation']
        risk_assessment = alert_data['risk_assessment']
        analysis = alert_data['analysis']
        
        # Spam önleme (30 dakika cooldown)
        now = datetime.now()
        if symbol in self.alert_cooldown:
            if (now - self.alert_cooldown[symbol]).seconds < 1800:
                return
                
        self.alert_cooldown[symbol] = now
        
        # Analiz detayları
        price_analysis = analysis.get('price_analysis', {})
        technical_analysis = analysis.get('technical_analysis', {})
        fundamental_analysis = analysis.get('fundamental_analysis', {})
        
        # Bildirim metni
        title = f"🎯 {symbol} ULTRA YÜKSEK GÜVEN!"
        body = (f"🔥 Güven: {confidence:.1%}\n"
                f"📊 Aksiyon: {recommendation.get('action', 'N/A')}\n"
                f"💰 Pozisyon: %{recommendation.get('position_size', 0)*100:.0f}\n"
                f"⚠️ Risk: {risk_assessment.get('risk_level', 'N/A')}\n"
                f"📈 Fiyat: {price_analysis.get('price_change_1d', 0):+.1%}\n"
                f"📊 TOPSIS: {fundamental_analysis.get('topsis_score', 0):.2f}\n"
                f"🎯 RSI: {technical_analysis.get('rsi', 0):.0f}\n"
                f"⏰ {now.strftime('%H:%M')}")
        
        try:
            self.fcm.send(
                title=title,
                body=body,
                topic="ultra_high_confidence"
            )
            logger.info(f"✅ {symbol} ULTRA yüksek güven bildirimi gönderildi (Güven: {confidence:.1%})")
        except Exception as e:
            logger.error(f"❌ FCM gönderim hatası: {e}")
            
    async def monitor_ultra_confidence(self):
        """Ultra yüksek güven izleme"""
        logger.info("🎯 Ultra Yüksek Doğruluk Sistemi Başlatıldı (%95+ güven)")
        
        while True:
            try:
                if self.is_market_hours():
                    logger.info(f"📊 Piyasa saatleri - Ultra analiz aktif: {datetime.now().strftime('%H:%M')}")
                    
                    for symbol in WATCHED_SYMBOLS:
                        alert_data = await self.analyze_symbol(symbol)
                        if alert_data:
                            await self.send_ultra_alert(alert_data)
                            
                    # 2 dakika bekle (daha sık kontrol)
                    await asyncio.sleep(120)
                else:
                    # Piyasa kapalı - 1 saat bekle
                    logger.info(f"😴 Piyasa kapalı - {datetime.now().strftime('%H:%M')} - 1 saat bekleniyor")
                    await asyncio.sleep(3600)
                    
            except Exception as e:
                logger.error(f"❌ Ultra izleme hatası: {e}")
                await asyncio.sleep(60)

# Global ultra system
ultra_system = UltraHighConfidenceSystem()

async def start_ultra_monitoring():
    """Ultra yüksek güven izlemeyi başlat"""
    await ultra_system.monitor_ultra_confidence()

if __name__ == "__main__":
    # Test için hemen çalıştır
    asyncio.run(start_ultra_monitoring())



