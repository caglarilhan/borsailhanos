#!/usr/bin/env python3
"""
Anlık Bildirim Sistemi Başlatıcı
- Sabah 8 - Akşam 22 arası çalışır
- Sadece yüksek doğrulukta tahminleri gönderir
"""

import asyncio
import logging
from backend.services.instant_alerts import start_instant_monitoring

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    """Anlık bildirim sistemini başlat"""
    logger.info("🚀 Yüksek Doğruluk Anlık Bildirim Sistemi Başlatılıyor...")
    logger.info("⏰ Çalışma Saatleri: 08:00 - 22:00")
    logger.info("🎯 Sadece %85+ güven skorunda bildirimler gönderilecek")
    
    try:
        await start_instant_monitoring()
    except KeyboardInterrupt:
        logger.info("⏹️ Sistem durduruldu")
    except Exception as e:
        logger.error(f"❌ Sistem hatası: {e}")

if __name__ == "__main__":
    asyncio.run(main())



