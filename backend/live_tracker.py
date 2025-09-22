#!/usr/bin/env python3
"""
🚀 BIST Canlı Takip Sistemi
Seçilen hisseleri kapanışa kadar takip eder ve sonuçları raporlar
"""

import asyncio
import logging
import time
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import yfinance as yf
import pandas as pd

# Logging ayarları
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('live_tracker.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class LiveTracker:
    """Canlı takip sistemi"""
    
    def __init__(self):
        self.tracked_stocks = {
            "ASELS.IS": {
                "entry_price": 214.00,
                "take_profit": 227.03,
                "stop_loss": 205.31,
                "action": "BUY",
                "upside_pct": 6.09,
                "confidence": 0.85,
                "start_time": datetime.now(),
                "current_price": None,
                "status": "ACTIVE"
            },
            "YKBNK.IS": {
                "entry_price": 35.60,
                "take_profit": 36.94,
                "stop_loss": 34.71,
                "action": "BUY", 
                "upside_pct": 3.76,
                "confidence": 0.85,
                "start_time": datetime.now(),
                "current_price": None,
                "status": "ACTIVE"
            }
        }
        self.update_interval = 30  # 30 saniye
        self.results_file = 'data/live_tracking_results.json'
        
    async def start_tracking(self):
        """Takibi başlat"""
        logger.info("🚀 BIST Canlı Takip Başlatıldı!")
        logger.info(f"📊 Takip edilen hisseler: {list(self.tracked_stocks.keys())}")
        
        for symbol, data in self.tracked_stocks.items():
            logger.info(f"📈 {symbol}: Giriş {data['entry_price']:.2f}₺, TP {data['take_profit']:.2f}₺, SL {data['stop_loss']:.2f}₺")
        
        while True:
            try:
                await self._update_prices()
                await self._check_targets()
                await self._log_status()
                
                # Market kapanış kontrolü (17:00)
                if datetime.now().hour >= 17:
                    logger.info("🏁 Market kapanışı! Takip sonuçları hazırlanıyor...")
                    await self._generate_final_report()
                    break
                    
                await asyncio.sleep(self.update_interval)
                
            except Exception as e:
                logger.error(f"❌ Takip hatası: {e}")
                await asyncio.sleep(60)
    
    async def _update_prices(self):
        """Güncel fiyatları güncelle"""
        for symbol in self.tracked_stocks.keys():
            try:
                stock = yf.Ticker(symbol)
                hist = stock.history(period="1d", interval="1m")
                
                if not hist.empty:
                    current_price = hist['Close'].iloc[-1]
                    self.tracked_stocks[symbol]['current_price'] = current_price
                    
                    # Fiyat değişimi hesapla
                    entry = self.tracked_stocks[symbol]['entry_price']
                    change_pct = ((current_price - entry) / entry) * 100
                    
                    logger.info(f"📊 {symbol}: {current_price:.2f}₺ ({change_pct:+.2f}%)")
                    
            except Exception as e:
                logger.error(f"❌ {symbol} fiyat güncelleme hatası: {e}")
    
    async def _check_targets(self):
        """Hedefleri kontrol et"""
        for symbol, data in self.tracked_stocks.items():
            if data['status'] != 'ACTIVE' or data['current_price'] is None:
                continue
                
            current_price = data['current_price']
            entry_price = data['entry_price']
            take_profit = data['take_profit']
            stop_loss = data['stop_loss']
            
            # Take Profit kontrolü
            if current_price >= take_profit:
                data['status'] = 'TAKE_PROFIT_HIT'
                data['exit_price'] = current_price
                data['exit_time'] = datetime.now()
                profit_pct = ((current_price - entry_price) / entry_price) * 100
                logger.info(f"🎉 {symbol} TAKE PROFIT! Çıkış: {current_price:.2f}₺ (+{profit_pct:.2f}%)")
                
            # Stop Loss kontrolü
            elif current_price <= stop_loss:
                data['status'] = 'STOP_LOSS_HIT'
                data['exit_price'] = current_price
                data['exit_time'] = datetime.now()
                loss_pct = ((current_price - entry_price) / entry_price) * 100
                logger.info(f"🛑 {symbol} STOP LOSS! Çıkış: {current_price:.2f}₺ ({loss_pct:.2f}%)")
    
    async def _log_status(self):
        """Durum logla"""
        active_count = sum(1 for data in self.tracked_stocks.values() if data['status'] == 'ACTIVE')
        logger.info(f"📈 Aktif pozisyonlar: {active_count}/{len(self.tracked_stocks)}")
    
    async def _generate_final_report(self):
        """Final raporu oluştur"""
        logger.info("📊 FINAL RAPOR HAZIRLANIYOR...")
        
        report = {
            "tracking_date": datetime.now().strftime("%Y-%m-%d"),
            "market_close_time": datetime.now().strftime("%H:%M:%S"),
            "total_stocks": len(self.tracked_stocks),
            "results": []
        }
        
        total_profit_pct = 0
        successful_trades = 0
        
        for symbol, data in self.tracked_stocks.items():
            if data['current_price'] is None:
                continue
                
            entry_price = data['entry_price']
            current_price = data['current_price']
            profit_pct = ((current_price - entry_price) / entry_price) * 100
            
            result = {
                "symbol": symbol,
                "action": data['action'],
                "entry_price": entry_price,
                "current_price": current_price,
                "take_profit": data['take_profit'],
                "stop_loss": data['stop_loss'],
                "profit_loss_pct": profit_pct,
                "status": data['status'],
                "confidence": data['confidence'],
                "upside_pct": data['upside_pct']
            }
            
            if data['status'] in ['TAKE_PROFIT_HIT', 'STOP_LOSS_HIT']:
                result['exit_price'] = data['exit_price']
                result['exit_time'] = data['exit_time'].strftime("%H:%M:%S")
            
            report["results"].append(result)
            total_profit_pct += profit_pct
            
            if profit_pct > 0:
                successful_trades += 1
        
        report["total_profit_pct"] = total_profit_pct
        report["success_rate"] = (successful_trades / len(self.tracked_stocks)) * 100
        report["avg_profit_pct"] = total_profit_pct / len(self.tracked_stocks)
        
        # Raporu kaydet
        import os
        os.makedirs('data', exist_ok=True)
        with open(self.results_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        # Konsola yazdır
        logger.info("="*80)
        logger.info("📊 BIST CANLI TAKİP SONUÇLARI")
        logger.info("="*80)
        
        for result in report["results"]:
            status_emoji = "🎉" if result['profit_loss_pct'] > 0 else "📉"
            logger.info(f"{status_emoji} {result['symbol']}: {result['current_price']:.2f}₺ ({result['profit_loss_pct']:+.2f}%) - {result['status']}")
        
        logger.info("-"*80)
        logger.info(f"📈 Toplam Getiri: {report['total_profit_pct']:+.2f}%")
        logger.info(f"🎯 Başarı Oranı: {report['success_rate']:.1f}%")
        logger.info(f"📊 Ortalama Getiri: {report['avg_profit_pct']:+.2f}%")
        logger.info("="*80)
        
        return report

async def main():
    """Ana fonksiyon"""
    tracker = LiveTracker()
    await tracker.start_tracking()

if __name__ == "__main__":
    asyncio.run(main())
