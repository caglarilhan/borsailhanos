"""
🚀 BIST AI Smart Trader - Signal Event Manager
==============================================

AI sinyal değişimlerini yakalayan ve WebSocket'e yayınlayan event listener.
Sinyal değişikliklerini loglar ve gerçek zamanlı bildirimleri tetikler.

Özellikler:
- Sinyal değişiklik tespiti
- Event logging
- WebSocket broadcast
- Notification trigger
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Callable
import aiohttp
from dataclasses import dataclass
from enum import Enum

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SignalType(Enum):
    """Sinyal türleri"""
    BUY = "BUY"
    SELL = "SELL"
    HOLD = "HOLD"
    STRONG_BUY = "STRONG_BUY"
    STRONG_SELL = "STRONG_SELL"

@dataclass
class SignalEvent:
    """Sinyal event veri yapısı"""
    symbol: str
    old_signal: Optional[str]
    new_signal: str
    confidence: float
    timestamp: datetime
    source: str
    metadata: Dict = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

class SignalEventManager:
    """Sinyal event yöneticisi"""
    
    def __init__(self, websocket_url: str = "http://localhost:8002"):
        self.websocket_url = websocket_url
        self.last_signals: Dict[str, Dict] = {}
        self.event_handlers: List[Callable] = []
        self.is_running = False
        
    def add_event_handler(self, handler: Callable):
        """Event handler ekle"""
        self.event_handlers.append(handler)
        logger.info(f"✅ Event handler added: {handler.__name__}")
    
    async def start_monitoring(self):
        """Sinyal monitoring başlat"""
        self.is_running = True
        logger.info("🚀 Signal event monitoring started")
        
        while self.is_running:
            try:
                await self.check_signal_changes()
                await asyncio.sleep(5)  # 5 saniyede bir kontrol et
            except Exception as e:
                logger.error(f"❌ Monitoring error: {e}")
                await asyncio.sleep(10)  # Hata durumunda 10 saniye bekle
    
    async def stop_monitoring(self):
        """Sinyal monitoring durdur"""
        self.is_running = False
        logger.info("🛑 Signal event monitoring stopped")
    
    async def check_signal_changes(self):
        """Sinyal değişikliklerini kontrol et"""
        try:
            # Backend'den güncel sinyalleri al
            current_signals = await self.fetch_current_signals()
            
            for symbol, signal_data in current_signals.items():
                await self.process_signal_update(symbol, signal_data)
                
        except Exception as e:
            logger.error(f"❌ Signal check error: {e}")
    
    async def fetch_current_signals(self) -> Dict[str, Dict]:
        """Backend'den güncel sinyalleri getir"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.websocket_url.replace(':8002', ':8001')}/api/signals") as response:
                    if response.status == 200:
                        data = await response.json()
                        signals = {}
                        
                        for signal in data.get('signals', []):
                            symbol = signal.get('symbol', '').upper()
                            if symbol:
                                signals[symbol] = {
                                    'signal': signal.get('signal', 'HOLD'),
                                    'confidence': signal.get('confidence', 0),
                                    'timestamp': signal.get('timestamp', datetime.now().isoformat()),
                                    'source': signal.get('source', 'ai_ensemble')
                                }
                        
                        return signals
                    else:
                        logger.warning(f"⚠️ Failed to fetch signals: {response.status}")
                        return {}
                        
        except Exception as e:
            logger.error(f"❌ Fetch signals error: {e}")
            return {}
    
    async def process_signal_update(self, symbol: str, signal_data: Dict):
        """Sinyal güncellemesini işle"""
        try:
            old_signal_data = self.last_signals.get(symbol)
            new_signal = signal_data.get('signal', 'HOLD')
            new_confidence = signal_data.get('confidence', 0)
            
            # İlk kez görülen sembol
            if old_signal_data is None:
                self.last_signals[symbol] = signal_data
                logger.info(f"📊 New symbol tracked: {symbol} -> {new_signal}")
                return
            
            old_signal = old_signal_data.get('signal', 'HOLD')
            
            # Sinyal değişikliği kontrolü
            if old_signal != new_signal:
                # Event oluştur
                event = SignalEvent(
                    symbol=symbol,
                    old_signal=old_signal,
                    new_signal=new_signal,
                    confidence=new_confidence,
                    timestamp=datetime.now(),
                    source=signal_data.get('source', 'ai_ensemble'),
                    metadata={
                        'old_confidence': old_signal_data.get('confidence', 0),
                        'confidence_change': new_confidence - old_signal_data.get('confidence', 0),
                        'signal_strength': self.calculate_signal_strength(new_signal, new_confidence)
                    }
                )
                
                # Event'i işle
                await self.handle_signal_event(event)
                
                logger.info(f"🔔 Signal change detected: {symbol} {old_signal} -> {new_signal} ({new_confidence:.1f}%)")
            
            # Güncel sinyali kaydet
            self.last_signals[symbol] = signal_data
            
        except Exception as e:
            logger.error(f"❌ Process signal update error for {symbol}: {e}")
    
    def calculate_signal_strength(self, signal: str, confidence: float) -> str:
        """Sinyal gücünü hesapla"""
        if signal in ['STRONG_BUY', 'STRONG_SELL']:
            return 'very_strong'
        elif signal in ['BUY', 'SELL'] and confidence > 80:
            return 'strong'
        elif signal in ['BUY', 'SELL'] and confidence > 60:
            return 'moderate'
        elif signal == 'HOLD':
            return 'neutral'
        else:
            return 'weak'
    
    async def handle_signal_event(self, event: SignalEvent):
        """Sinyal event'ini işle"""
        try:
            # Event handler'ları çağır
            for handler in self.event_handlers:
                try:
                    await handler(event)
                except Exception as e:
                    logger.error(f"❌ Event handler error: {e}")
            
            # WebSocket'e broadcast et
            await self.broadcast_signal_event(event)
            
            # Notification gönder
            await self.send_notification(event)
            
        except Exception as e:
            logger.error(f"❌ Handle signal event error: {e}")
    
    async def broadcast_signal_event(self, event: SignalEvent):
        """Sinyal event'ini WebSocket'e broadcast et"""
        try:
            async with aiohttp.ClientSession() as session:
                payload = {
                    'symbol': event.symbol,
                    'signal_data': {
                        'signal': event.new_signal,
                        'confidence': event.confidence,
                        'timestamp': event.timestamp.isoformat(),
                        'source': event.source,
                        'metadata': event.metadata
                    }
                }
                
                async with session.post(
                    f"{self.websocket_url}/api/realtime/broadcast/signal",
                    json=payload
                ) as response:
                    if response.status == 200:
                        logger.info(f"📡 Signal event broadcasted: {event.symbol}")
                    else:
                        logger.warning(f"⚠️ Broadcast failed: {response.status}")
                        
        except Exception as e:
            logger.error(f"❌ Broadcast signal event error: {e}")
    
    async def send_notification(self, event: SignalEvent):
        """Bildirim gönder"""
        try:
            # Notification servisine gönder
            notification_data = {
                'type': 'signal_change',
                'symbol': event.symbol,
                'old_signal': event.old_signal,
                'new_signal': event.new_signal,
                'confidence': event.confidence,
                'timestamp': event.timestamp.isoformat(),
                'priority': 'high' if event.new_signal in ['BUY', 'SELL', 'STRONG_BUY', 'STRONG_SELL'] else 'medium',
                'message': self.generate_notification_message(event)
            }
            
            # Notification servisine HTTP POST
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.websocket_url.replace(':8002', ':8001')}/api/notifications/send",
                    json=notification_data
                ) as response:
                    if response.status == 200:
                        logger.info(f"📱 Notification sent: {event.symbol}")
                    else:
                        logger.warning(f"⚠️ Notification failed: {response.status}")
                        
        except Exception as e:
            logger.error(f"❌ Send notification error: {e}")
    
    def generate_notification_message(self, event: SignalEvent) -> str:
        """Bildirim mesajı oluştur"""
        signal_emoji = {
            'BUY': '🟢',
            'SELL': '🔴', 
            'HOLD': '🟡',
            'STRONG_BUY': '🟢💪',
            'STRONG_SELL': '🔴💪'
        }
        
        emoji = signal_emoji.get(event.new_signal, '🟡')
        strength = event.metadata.get('signal_strength', 'moderate')
        
        if event.old_signal and event.old_signal != event.new_signal:
            return f"{emoji} {event.symbol} sinyali değişti: {event.old_signal} → {event.new_signal} (%{event.confidence:.1f} güven)"
        else:
            return f"{emoji} {event.symbol} yeni sinyal: {event.new_signal} (%{event.confidence:.1f} güven)"
    
    async def manual_signal_update(self, symbol: str, signal: str, confidence: float, source: str = "manual"):
        """Manuel sinyal güncellemesi"""
        try:
            signal_data = {
                'signal': signal,
                'confidence': confidence,
                'timestamp': datetime.now().isoformat(),
                'source': source
            }
            
            await self.process_signal_update(symbol.upper(), signal_data)
            logger.info(f"✅ Manual signal update: {symbol} -> {signal}")
            
        except Exception as e:
            logger.error(f"❌ Manual signal update error: {e}")
    
    def get_signal_history(self, symbol: str, limit: int = 10) -> List[Dict]:
        """Sinyal geçmişini getir"""
        # Bu fonksiyon veritabanından geçmiş verileri çekebilir
        # Şimdilik son sinyal bilgisini döndür
        if symbol in self.last_signals:
            return [self.last_signals[symbol]]
        return []
    
    def get_active_symbols(self) -> List[str]:
        """Aktif sembolleri getir"""
        return list(self.last_signals.keys())

# Global event manager instance
signal_event_manager = SignalEventManager()

# Event handler örnekleri
async def log_signal_event(event: SignalEvent):
    """Sinyal event'ini logla"""
    logger.info(f"📊 Signal Event: {event.symbol} {event.old_signal} -> {event.new_signal}")

async def update_dashboard(event: SignalEvent):
    """Dashboard'u güncelle"""
    # Bu fonksiyon frontend dashboard'u güncelleyebilir
    logger.info(f"🔄 Dashboard update: {event.symbol}")

# Event handler'ları ekle
signal_event_manager.add_event_handler(log_signal_event)
signal_event_manager.add_event_handler(update_dashboard)

if __name__ == "__main__":
    async def main():
        """Ana fonksiyon"""
        logger.info("🚀 Starting Signal Event Manager...")
        
        # Monitoring başlat
        await signal_event_manager.start_monitoring()
    
    # Event loop başlat
    asyncio.run(main())
