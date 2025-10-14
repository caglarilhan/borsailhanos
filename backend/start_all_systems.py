#!/usr/bin/env python3
"""
Tüm Sistemleri Başlatıcı
- Günlük analiz (09:00, 15:00)
- Anlık yükseliş tespit (08:00-22:00)
- 7/24 haber tarama
- API server
"""

import asyncio
import threading
import logging
from datetime import datetime

# Local imports
from backend.services.daily_analyzer import schedule_daily_analysis
from backend.services.instant_alerts import start_instant_monitoring
from backend.services.news_monitor import start_news_monitoring
from backend.services.ultra_high_confidence_system import start_ultra_monitoring

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def start_all_systems():
    """Tüm sistemleri paralel olarak başlat"""
    logger.info("🚀 BIST AI Smart Trader - Tüm Sistemler Başlatılıyor...")
    logger.info("=" * 60)
    
    # Paralel görevler
    tasks = [
        # Günlük analiz (schedule thread)
        asyncio.create_task(run_daily_scheduler()),
        
        # Anlık yükseliş tespit
        asyncio.create_task(start_instant_monitoring()),
        
        # 7/24 haber tarama
        asyncio.create_task(start_news_monitoring()),
        
        # Ultra yüksek doğruluk sistemi
        asyncio.create_task(start_ultra_monitoring()),
    ]
    
    try:
        await asyncio.gather(*tasks)
    except KeyboardInterrupt:
        logger.info("⏹️ Tüm sistemler durduruldu")
    except Exception as e:
        logger.error(f"❌ Sistem hatası: {e}")

async def run_daily_scheduler():
    """Günlük analiz scheduler'ını çalıştır"""
    def run_scheduler():
        schedule_daily_analysis()
    
    # Thread'de çalıştır
    scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
    scheduler_thread.start()
    
    # Ana thread'i beklet
    while True:
        await asyncio.sleep(60)

async def main():
    """Ana başlatıcı"""
    logger.info("🎯 Sistem Özellikleri:")
    logger.info("📊 Günlük Analiz: 09:00 ve 15:00")
    logger.info("⚡ Anlık Tespit: 08:00-22:00 (Sadece %85+ güven)")
    logger.info("🎯 Ultra Doğruluk: 08:00-22:00 (Sadece %95+ güven)")
    logger.info("📰 Haber Tarama: 7/24 (5dk'da bir)")
    logger.info("🤖 Soru-Cevap: /ask endpoint")
    logger.info("📱 FCM Bildirimler: daily_analysis, high_confidence_alerts, news_alerts, ultra_high_confidence")
    logger.info("=" * 60)
    
    await start_all_systems()

if __name__ == "__main__":
    asyncio.run(main())
