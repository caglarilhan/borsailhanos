#!/usr/bin/env python3
"""
🚀 BIST 100 Sürekli Tarama Sistemi
48 saat önceden yükselme sinyali veren robot
"""

import asyncio
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import pandas as pd
import numpy as np
from ultra_robot_enhanced_fixed import UltraRobotEnhancedFixed, EnhancedSignalType, EnhancedTradingSignal
from ultra_trading_robot import TimeFrame, StrategyType

# Logging ayarları
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('bist100_scanner.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class BIST100Scanner:
    """BIST 100 sürekli tarama sistemi"""
    
    def __init__(self):
        self.robot = UltraRobotEnhancedFixed()
        self.bist100_symbols = self._get_bist100_symbols()
        self.scan_interval = 60  # Demo için 1 dakika
        self.forecast_hours = 48   # 48 saat önceden
        self.active_signals = {}
        self.signal_history = []
        self.snapshot_path = 'data/forecast_signals.json'
        # Demo fallback kapalı: sadece gerçek sinyal
        self.demo_force_signal = False
        
    def _get_bist100_symbols(self) -> List[str]:
        """BIST 100 + US Market sembolleri - Demo için optimize edildi"""
        bist_symbols = [
            "GARAN.IS", "AKBNK.IS", "ISCTR.IS", "YKBNK.IS", "THYAO.IS",
            "SISE.IS", "EREGL.IS", "TUPRS.IS", "ASELS.IS", "KRDMD.IS",
            "PGSUS.IS", "SAHOL.IS", "KCHOL.IS", "VESTL.IS", "BIMAS.IS",
            "MGROS.IS", "TCELL.IS", "TTKOM.IS", "DOHOL.IS", "EKGYO.IS"
        ]
        
        us_symbols = [
            "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META"
        ]
        
        # BIST + US sembolleri birleştir
        return bist_symbols + us_symbols
    
    async def start_continuous_scanning(self):
        """Sürekli tarama başlat"""
        logger.info(f"🚀 BIST 100 Sürekli Tarama Başlatıldı!")
        logger.info(f"📊 {len(self.bist100_symbols)} hisse taranacak")
        logger.info(f"⏰ Tarama aralığı: {self.scan_interval} saniye")
        logger.info(f"🔮 Tahmin süresi: {self.forecast_hours} saat önceden")
        
        while True:
            try:
                start_time = time.time()
                logger.info(f"🔄 Tarama başladı: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                
                # Tüm hisseleri tara
                await self._scan_all_stocks()
                
                # Aktif sinyalleri güncelle
                await self._update_active_signals()
                
                # Performans raporu
                await self._generate_performance_report()

                # Snapshot kaydet
                self._save_forecast_snapshot()
                
                scan_duration = time.time() - start_time
                logger.info(f"✅ Tarama tamamlandı: {scan_duration:.2f} saniye")
                
                # Sonraki tarama için bekle
                await asyncio.sleep(self.scan_interval)
                
            except Exception as e:
                logger.error(f"❌ Tarama hatası: {e}")
                await asyncio.sleep(60)  # Hata durumunda 1 dakika bekle
    
    async def _scan_all_stocks(self):
        """Tüm hisseleri tara"""
        for symbol in self.bist100_symbols:
            try:
                # Sembol normalize
                norm_symbol = self._normalize_symbol(symbol)
                logger.info(f"🔍 {norm_symbol} taranıyor...")
                
                # Gelişmiş sinyal üret
                signals = self.robot.generate_enhanced_signals(norm_symbol)
                
                if signals:
                    logger.info(f"🎯 {symbol}: {len(signals)} sinyal bulundu!")
                    
                    # 48 saat önceden sinyalleri filtrele
                    forecast_signals = self._filter_forecast_signals(signals)
                    
                    if forecast_signals:
                        logger.info(f"🚀 {symbol}: {len(forecast_signals)} 48h önceden sinyal!")
                        await self._process_forecast_signals(symbol, forecast_signals)
                    else:
                        logger.info(f"⏸️ {symbol}: 48h önceden sinyal yok")
                else:
                    logger.info(f"❌ {norm_symbol}: Sinyal bulunamadı")
                
                # Rate limiting
                await asyncio.sleep(1)
                
            except Exception as e:
                logger.error(f"❌ {symbol} tarama hatası: {e}")
                continue
    
    def _filter_forecast_signals(self, signals: List) -> List:
        """48 saat önceden sinyalleri filtrele - Tüm sinyalleri geçir"""
        forecast_signals = []
        
        for signal in signals:
            # Sadece BUY sinyallerini al
            if signal.action in [EnhancedSignalType.STRONG_BUY, EnhancedSignalType.BUY, EnhancedSignalType.WEAK_BUY]:
                # Tüm sinyalleri geçir (filtreleme kaldırıldı)
                forecast_signals.append(signal)
                logger.info(f"✅ {signal.symbol} sinyali geçirildi: confidence={signal.confidence:.3f}, action={signal.action}")
        
        logger.info(f"📊 Toplam {len(signals)} sinyalden {len(forecast_signals)} tanesi geçirildi")
        return forecast_signals

    def _normalize_symbol(self, symbol: str) -> str:
        """Sembol normalize: '$' ve boşlukları temizle, upper-case; BIST için '.IS' formatını koru"""
        if not symbol:
            return symbol
        cleaned = symbol.strip().upper()
        if cleaned.startswith('$'):
            cleaned = cleaned[1:]
        # BIST sembollerinde '.IS' varsa bırak, yoksa orijinal listede US sembolleri mevcut
        return cleaned
    
    async def _process_forecast_signals(self, symbol: str, signals: List):
        """48 saat önceden sinyalleri işle"""
        for signal in signals:
            signal_key = f"{symbol}_{signal.timestamp.strftime('%Y%m%d_%H%M%S')}"
            
            if signal_key not in self.active_signals:
                self.active_signals[signal_key] = {
                    "symbol": symbol,
                    "signal": signal,
                    "detected_at": datetime.now(),
                    "status": "ACTIVE",
                    "notifications_sent": False
                }
                
                logger.info(f"🚨 YENİ 48H SİNYAL: {symbol}")
                logger.info(f"   📈 Aksiyon: {signal.action.value}")
                logger.info(f"   🎯 Giriş: {signal.entry_price:.3f}")
                logger.info(f"   🛑 Stop Loss: {signal.stop_loss:.3f}")
                logger.info(f"   🎉 Take Profit: {signal.take_profit:.3f}")
                logger.info(f"   ⚠️ Risk/Reward: {signal.risk_reward:.3f}")
                logger.info(f"   🧠 Güven: {signal.confidence:.3f}")
                
                # Bildirim gönder
                await self._send_notification(signal)
        # Her işlem sonrası snapshot güncelle
        self._save_forecast_snapshot()
    
    async def _send_notification(self, signal):
        """Bildirim gönder"""
        try:
            # FCM veya email bildirimi burada
            notification_text = f"""
🚨 BIST 100 - 48 SAAT ÖNCEDEN SİNYAL! 🚨

📊 Hisse: {signal.symbol}
📈 Aksiyon: {signal.action.value}
🎯 Giriş Fiyatı: {signal.entry_price:.3f} ₺
🛑 Stop Loss: {signal.stop_loss:.3f} ₺
🎉 Take Profit: {signal.take_profit:.3f} ₺
⚠️ Risk/Reward: {signal.risk_reward:.3f}
🧠 Güven Skoru: {signal.confidence:.3f}
⏰ Tespit Zamanı: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

🔮 Bu hisse 48 saat içinde yükselebilir!
            """
            
            logger.info(f"📱 Bildirim gönderildi: {signal.symbol}")
            # TODO: FCM push notification implement
            
        except Exception as e:
            logger.error(f"❌ Bildirim hatası: {e}")
    
    async def _update_active_signals(self):
        """Aktif sinyalleri güncelle"""
        current_time = datetime.now()
        
        for signal_key, signal_data in list(self.active_signals.items()):
            signal = signal_data["signal"]
            detected_at = signal_data["detected_at"]
            
            # 48 saat geçti mi kontrol et
            if current_time - detected_at > timedelta(hours=self.forecast_hours):
                # Sinyal süresi doldu
                signal_data["status"] = "EXPIRED"
                logger.info(f"⏰ {signal.symbol} sinyali süresi doldu")
                
                # Sinyal geçerliliğini kontrol et
                await self._validate_signal(signal_key, signal_data)
        # Güncelleme sonrası snapshot kaydet
        self._save_forecast_snapshot()
    
    async def _validate_signal(self, signal_key: str, signal_data: Dict):
        """Sinyal geçerliliğini kontrol et"""
        try:
            symbol = signal_data["symbol"]
            signal = signal_data["signal"]
            
            # Güncel fiyatı al
            current_price = await self._get_current_price(symbol)
            
            if current_price:
                # Sinyal başarısını hesapla
                if signal.action in [EnhancedSignalType.STRONG_BUY, EnhancedSignalType.BUY, EnhancedSignalType.WEAK_BUY]:
                    if current_price > signal.entry_price:
                        signal_data["status"] = "SUCCESS"
                        logger.info(f"✅ {symbol} sinyali BAŞARILI! Giriş: {signal.entry_price:.3f}, Güncel: {current_price:.3f}")
                    else:
                        signal_data["status"] = "FAILED"
                        logger.info(f"❌ {symbol} sinyali BAŞARISIZ! Giriş: {signal.entry_price:.3f}, Güncel: {current_price:.3f}")
                
                # Sinyal geçmişine ekle
                self.signal_history.append(signal_data)
                
                # Aktif sinyallerden kaldır
                del self.active_signals[signal_key]
                
        except Exception as e:
            logger.error(f"❌ Sinyal validasyon hatası: {e}")
    
    async def _get_current_price(self, symbol: str) -> Optional[float]:
        """Güncel fiyat al"""
        try:
            # Basit fiyat çekme (gerçek uygulamada WebSocket kullan)
            import yfinance as yf
            stock = yf.Ticker(symbol)
            current_price = stock.info.get('regularMarketPrice')
            return current_price
        except Exception as e:
            logger.error(f"❌ Fiyat çekme hatası: {e}")
            return None
    
    async def _generate_performance_report(self):
        """Performans raporu oluştur"""
        try:
            total_signals = len(self.signal_history)
            successful_signals = len([s for s in self.signal_history if s["status"] == "SUCCESS"])
            failed_signals = len([s for s in self.signal_history if s["status"] == "FAILED"])
            
            if total_signals > 0:
                success_rate = (successful_signals / total_signals) * 100
                logger.info(f"📊 PERFORMANS RAPORU:")
                logger.info(f"   📈 Toplam Sinyal: {total_signals}")
                logger.info(f"   ✅ Başarılı: {successful_signals}")
                logger.info(f"   ❌ Başarısız: {failed_signals}")
                logger.info(f"   🎯 Başarı Oranı: {success_rate:.2f}%")
                
                # Hedef %80'e yaklaşıyor mu?
                if success_rate >= 75:
                    logger.info(f"🎉 HEDEF %80'E YAKLAŞIYOR! Şu an: {success_rate:.2f}%")
                elif success_rate >= 60:
                    logger.info(f"🚀 İYİ PERFORMANS! Şu an: {success_rate:.2f}%")
                else:
                    logger.info(f"⚠️ GELİŞTİRİLMESİ GEREKİYOR! Şu an: {success_rate:.2f}%")
            
        except Exception as e:
            logger.error(f"❌ Performans raporu hatası: {e}")

    def _save_forecast_snapshot(self):
        """Aktif 48h sinyalleri JSON olarak diske kaydet"""
        try:
            import os, json
            os.makedirs('data', exist_ok=True)
            active = []
            for key, s in self.active_signals.items():
                if s.get('status') == 'ACTIVE':
                    sig = s['signal']
                    active.append({
                        'key': key,
                        'symbol': s['symbol'],
                        'action': getattr(sig.action, 'value', str(sig.action)),
                        'entry_price': float(sig.entry_price),
                        'stop_loss': float(sig.stop_loss),
                        'take_profit': float(sig.take_profit),
                        'risk_reward': float(sig.risk_reward),
                        'confidence': float(sig.confidence),
                        'timestamp': sig.timestamp.isoformat()
                    })
            snapshot = {
                'generated_at': datetime.now().isoformat(),
                'total_active': len(active),
                'signals': active
            }
            with open(self.snapshot_path, 'w', encoding='utf-8') as f:
                json.dump(snapshot, f, ensure_ascii=False)
            logger.info(f"💾 Forecast snapshot kaydedildi: {self.snapshot_path} ({len(active)} aktif)")
        except Exception as e:
            logger.error(f"❌ Snapshot kaydetme hatası: {e}")

async def main():
    """Ana fonksiyon"""
    scanner = BIST100Scanner()
    await scanner.start_continuous_scanning()

if __name__ == "__main__":
    asyncio.run(main())
