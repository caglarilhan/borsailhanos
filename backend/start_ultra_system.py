#!/usr/bin/env python3
"""
Ultra Yüksek Doğruluk Sistemi Başlatıcı (%95+)
- Tüm faktörleri analiz eder: fiyat, teknik, fundamental, makro, sentiment, haber
- Sadece %95+ güven skorlarında bildirim gönderir
- Çoklu doğrulama katmanları ile risk değerlendirmesi
"""

import asyncio
import logging
from backend.services.ultra_high_confidence_system import start_ultra_monitoring

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    """Ultra yüksek doğruluk sistemini başlat"""
    logger.info("🎯 Ultra Yüksek Doğruluk Sistemi Başlatılıyor...")
    logger.info("=" * 60)
    logger.info("📊 Analiz Faktörleri:")
    logger.info("  • Fiyat & Volume Analizi")
    logger.info("  • Teknik Analiz (RSI, MACD, Bollinger, EMA)")
    logger.info("  • Fundamental Analiz (TOPSIS, Finansal Oranlar)")
    logger.info("  • Makro Ekonomik Analiz (Risk-On/Off)")
    logger.info("  • Sentiment Analizi")
    logger.info("  • Haber Analizi")
    logger.info("  • AI Ensemble Skoru")
    logger.info("  • Risk Değerlendirmesi")
    logger.info("=" * 60)
    logger.info("🎯 Sadece %95+ güven skorlarında bildirim gönderilecek")
    logger.info("⏰ Çalışma Saatleri: 08:00 - 22:00")
    logger.info("🔄 Kontrol Sıklığı: 2 dakikada bir")
    logger.info("📱 FCM Topic: ultra_high_confidence")
    logger.info("=" * 60)
    
    try:
        await start_ultra_monitoring()
    except KeyboardInterrupt:
        logger.info("⏹️ Ultra sistem durduruldu")
    except Exception as e:
        logger.error(f"❌ Sistem hatası: {e}")

if __name__ == "__main__":
    asyncio.run(main())



