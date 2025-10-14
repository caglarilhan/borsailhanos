#!/usr/bin/env python3
"""
Günlük Analiz Servisi - Her sabah 09:00'da çalışır
- BIST 100'ü tarar
- Yükseliş potansiyeli yüksek hisseleri tespit eder
- FCM ile bildirim gönderir
"""

import asyncio
import schedule
import time
from datetime import datetime, timedelta
from typing import List, Dict
import logging

# Local imports
try:
    from backend.data.price_layer import fetch_recent_ohlcv
    from backend.data.fundamentals import fetch_basic_fundamentals
    from backend.services.mcdm import compute_entropy_topsis
    from backend.services.pattern_adapter import detect_patterns_from_ohlcv
    from backend.services.notifications import get_fcm
    from backend.services.rl_agent import SimpleRLAagent
except ImportError:
    from ..data.price_layer import fetch_recent_ohlcv
    from ..data.fundamentals import fetch_basic_fundamentals
    from ..services.mcdm import compute_entropy_topsis
    from ..services.pattern_adapter import detect_patterns_from_ohlcv
    from ..services.notifications import get_fcm
    from ..services.rl_agent import SimpleRLAagent

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# BIST 100 ana hisseleri
BIST_100_SYMBOLS = [
    'SISE.IS', 'EREGL.IS', 'TUPRS.IS', 'AKBNK.IS', 'GARAN.IS', 'ISCTR.IS',
    'THYAO.IS', 'BIMAS.IS', 'KCHOL.IS', 'SAHOL.IS', 'PETKM.IS', 'TCELL.IS',
    'ASELS.IS', 'HALKB.IS', 'VAKBN.IS', 'YKBNK.IS', 'PGSUS.IS', 'TOASO.IS',
    'ARCLK.IS', 'KOZAL.IS', 'KOZAA.IS', 'ENKAI.IS', 'FROTO.IS', 'SASA.IS',
    'MGROS.IS', 'OTKAR.IS', 'ULKER.IS', 'TAVHL.IS', 'DOAS.IS', 'CCOLA.IS'
]

class DailyAnalyzer:
    def __init__(self):
        self.fcm = get_fcm()
        self.rl_agent = SimpleRLAagent()
        
    async def analyze_daily_picks(self) -> List[Dict]:
        """Günlük yükseliş potansiyeli yüksek hisseleri analiz et"""
        logger.info("🔍 Günlük analiz başlatılıyor...")
        
        picks = []
        
        # Fundamental verileri çek
        fundamentals = fetch_basic_fundamentals(BIST_100_SYMBOLS)
        
        # TOPSIS skorları hesapla
        if not fundamentals.empty:
            benefit_flags = [1, 1, 0]  # NetProfitMargin, ROE (benefit), DebtEquity (cost)
            topsis_scores = compute_entropy_topsis(
                fundamentals[["NetProfitMargin", "ROE", "DebtEquity"]], 
                benefit_flags
            )
        else:
            topsis_scores = None
            
        # Her hisse için analiz
        for symbol in BIST_100_SYMBOLS[:10]:  # İlk 10'u analiz et (hız için)
            try:
                # Fiyat verisi
                df = fetch_recent_ohlcv(symbol=symbol, period="1mo", interval="1d")
                if df.empty:
                    continue
                    
                # Pattern analizi
                patterns = detect_patterns_from_ohlcv(df.tail(50))
                
                # TOPSIS skoru
                topsis_score = float(topsis_scores.get(symbol)) if topsis_scores is not None and symbol in topsis_scores.index else 0.5
                
                # Son fiyat değişimi
                current_price = df['close'].iloc[-1]
                prev_price = df['close'].iloc[-2] if len(df) > 1 else current_price
                price_change = (current_price - prev_price) / prev_price
                
                # Yükseliş potansiyeli skoru
                bullish_patterns = [p for p in patterns if p.get('signal') in ['BUY', 'BULLISH']]
                pattern_score = len(bullish_patterns) * 0.2
                
                # Toplam skor
                total_score = (topsis_score * 0.4 + 
                             pattern_score * 0.3 + 
                             max(0, price_change) * 0.3)
                
                if total_score > 0.6:  # Yüksek potansiyel eşiği
                    picks.append({
                        'symbol': symbol,
                        'score': total_score,
                        'topsis': topsis_score,
                        'price_change': price_change,
                        'current_price': current_price,
                        'patterns': len(bullish_patterns),
                        'recommendation': 'BUY' if total_score > 0.7 else 'WATCH'
                    })
                    
            except Exception as e:
                logger.error(f"❌ {symbol} analiz hatası: {e}")
                continue
                
        # Skora göre sırala
        picks.sort(key=lambda x: x['score'], reverse=True)
        
        logger.info(f"✅ {len(picks)} yüksek potansiyelli hisse bulundu")
        return picks[:5]  # Top 5'i döndür
        
    async def send_daily_report(self, picks: List[Dict]):
        """Günlük raporu FCM ile gönder"""
        if not picks:
            return
            
        # Rapor metni oluştur
        report_lines = ["📈 Günlük Yükseliş Potansiyeli Raporu", ""]
        
        for i, pick in enumerate(picks, 1):
            symbol = pick['symbol']
            score = pick['score']
            recommendation = pick['recommendation']
            price_change = pick['price_change']
            
            emoji = "🚀" if recommendation == "BUY" else "👀"
            change_text = f"+{price_change:.1%}" if price_change > 0 else f"{price_change:.1%}"
            
            report_lines.append(f"{i}. {emoji} {symbol}")
            report_lines.append(f"   Skor: {score:.2f} | Değişim: {change_text}")
            report_lines.append(f"   Öneri: {recommendation}")
            report_lines.append("")
            
        report_text = "\n".join(report_lines)
        
        # FCM gönder
        try:
            self.fcm.send(
                title="📊 Günlük BIST Analizi",
                body=report_text[:500] + "..." if len(report_text) > 500 else report_text,
                topic="daily_analysis"
            )
            logger.info("✅ Günlük rapor gönderildi")
        except Exception as e:
            logger.error(f"❌ FCM gönderim hatası: {e}")
            
    async def run_daily_analysis(self):
        """Günlük analizi çalıştır"""
        try:
            picks = await self.analyze_daily_picks()
            await self.send_daily_report(picks)
        except Exception as e:
            logger.error(f"❌ Günlük analiz hatası: {e}")

# Global analyzer instance
daily_analyzer = DailyAnalyzer()

def schedule_daily_analysis():
    """Günlük analizi zamanla"""
    schedule.every().day.at("09:00").do(lambda: asyncio.run(daily_analyzer.run_daily_analysis()))
    schedule.every().day.at("15:00").do(lambda: asyncio.run(daily_analyzer.run_daily_analysis()))  # Öğleden sonra da
    
    logger.info("⏰ Günlük analiz zamanlandı: 09:00 ve 15:00")
    
    # Schedule'ı çalıştır
    while True:
        schedule.run_pending()
        time.sleep(60)  # Her dakika kontrol et

if __name__ == "__main__":
    # Test için hemen çalıştır
    asyncio.run(daily_analyzer.run_daily_analysis())



