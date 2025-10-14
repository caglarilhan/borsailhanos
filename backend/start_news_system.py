#!/usr/bin/env python3
"""
7/24 Haber Tarama Sistemi Başlatıcı
- KAP, Bloomberg, Reuters, Twitter'dan sürekli haber tarar
- Önemli haberleri tespit edip bildirim gönderir
- Haber + fiyat analizi birlikte sunar
"""

import asyncio
import logging
from backend.services.news_monitor import start_news_monitoring

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    """7/24 haber tarama sistemini başlat"""
    logger.info("📰 7/24 Haber Tarama Sistemi Başlatılıyor...")
    logger.info("🔍 Kaynaklar: KAP, Bloomberg, Reuters, Twitter")
    logger.info("🎯 Sadece %50+ etki skorunda haber bildirimleri gönderilecek")
    logger.info("⏰ 5 dakikada bir tarama yapılacak")
    
    try:
        await start_news_monitoring()
    except KeyboardInterrupt:
        logger.info("⏹️ Haber tarama sistemi durduruldu")
    except Exception as e:
        logger.error(f"❌ Sistem hatası: {e}")

if __name__ == "__main__":
    asyncio.run(main())



