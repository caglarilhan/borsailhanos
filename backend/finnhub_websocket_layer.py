"""
🚀 Finnhub WebSocket Layer - BIST AI Smart Trader
Canlı fiyat akışı için Finnhub WebSocket entegrasyonu
BIST ve ABD hisseleri için ≤30 sembol desteği
"""

import asyncio
import json
import logging
import websockets
from typing import Dict, List, Optional, Callable
from datetime import datetime
import pandas as pd
import os
from dotenv import load_dotenv
import random

# Environment variables
load_dotenv()

class FinnhubWebSocketLayer:
    """
    Finnhub WebSocket ile canlı fiyat akışı
    BIST ve ABD hisseleri için optimize edilmiş
    """
    
    def __init__(self, api_key: Optional[str] = None, use_mock: bool = False):
        self.api_key = api_key or os.getenv('FINNHUB_API_KEY')
        self.use_mock = use_mock or not self.api_key
        
        if not self.api_key and not self.use_mock:
            print("⚠️ FINNHUB_API_KEY yok, mock mode kullanılıyor")
            self.use_mock = True
        
        self.ws_url = f"wss://ws.finnhub.io?token={self.api_key}" if self.api_key else None
        self.websocket = None
        self.is_connected = False
        self.subscribed_symbols = set()
        self.price_callbacks = []
        self.max_symbols = 30  # Finnhub limit
        
        # Logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Price storage
        self.latest_prices = {}
        self.price_history = {}
        
        # Mock data için
        if self.use_mock:
            self.logger.info("🔧 Mock mode aktif - Test verisi kullanılıyor")
    
    async def connect(self):
        """WebSocket bağlantısını kur"""
        if self.use_mock:
            self.is_connected = True
            self.logger.info("✅ Mock WebSocket bağlantısı kuruldu")
            return True
        
        try:
            self.websocket = await websockets.connect(self.ws_url)
            self.is_connected = True
            self.logger.info("✅ Finnhub WebSocket bağlantısı kuruldu")
            return True
        except Exception as e:
            self.logger.error(f"❌ WebSocket bağlantı hatası: {e}")
            return False
    
    async def disconnect(self):
        """WebSocket bağlantısını kapat"""
        if self.websocket:
            await self.websocket.close()
        self.is_connected = False
        self.logger.info("🔌 WebSocket bağlantısı kapatıldı")
    
    async def subscribe_symbols(self, symbols: List[str]):
        """Hisse sembollerini subscribe et (max 30)"""
        if len(symbols) > self.max_symbols:
            self.logger.warning(f"⚠️ Maksimum {self.max_symbols} sembol desteklenir. İlk {self.max_symbols} alınacak.")
            symbols = symbols[:self.max_symbols]
        
        if self.use_mock:
            # Mock mode: sembolleri kaydet
            self.subscribed_symbols.update(symbols)
            self.logger.info(f"✅ {len(symbols)} sembol mock mode'da subscribe edildi: {symbols}")
            return
        
        subscription_message = {
            "type": "subscribe",
            "symbol": symbols
        }
        
        try:
            await self.websocket.send(json.dumps(subscription_message))
            self.subscribed_symbols.update(symbols)
            self.logger.info(f"✅ {len(symbols)} sembol subscribe edildi: {symbols}")
        except Exception as e:
            self.logger.error(f"❌ Subscribe hatası: {e}")
    
    async def unsubscribe_symbols(self, symbols: List[str]):
        """Hisse sembollerini unsubscribe et"""
        if self.use_mock:
            self.subscribed_symbols.difference_update(symbols)
            self.logger.info(f"🔌 {len(symbols)} sembol mock mode'da unsubscribe edildi")
            return
        
        unsubscribe_message = {
            "type": "unsubscribe",
            "symbol": symbols
        }
        
        try:
            await self.websocket.send(json.dumps(unsubscribe_message))
            self.subscribed_symbols.difference_update(symbols)
            self.logger.info(f"🔌 {len(symbols)} sembol unsubscribe edildi")
        except Exception as e:
            self.logger.error(f"❌ Unsubscribe hatası: {e}")
    
    def add_price_callback(self, callback: Callable):
        """Fiyat güncellemeleri için callback ekle"""
        self.price_callbacks.append(callback)
        self.logger.info(f"📞 Price callback eklendi: {callback.__name__}")
    
    def _generate_mock_price(self, symbol: str) -> Dict:
        """Mock fiyat verisi oluştur"""
        # Sembol tipine göre fiyat aralığı
        if '.IS' in symbol:  # BIST
            base_price = random.uniform(10, 100)
        else:  # ABD
            base_price = random.uniform(50, 500)
        
        # Fiyat değişimi
        price_change = random.uniform(-0.05, 0.05)
        current_price = base_price * (1 + price_change)
        
        # Volume
        volume = random.randint(1000, 100000)
        
        # Timestamp
        timestamp = int(datetime.now().timestamp() * 1000)
        
        return {
            's': symbol,
            'p': round(current_price, 2),
            'v': volume,
            't': timestamp
        }
    
    async def _process_message(self, message: str):
        """Gelen WebSocket mesajını işle"""
        try:
            data = json.loads(message)
            
            if data.get('type') == 'trade':
                # Trade data
                trades = data.get('data', [])
                for trade in trades:
                    symbol = trade.get('s')
                    price = trade.get('p')
                    volume = trade.get('v')
                    timestamp = trade.get('t')
                    
                    if symbol and price:
                        # Fiyat güncelle
                        self.latest_prices[symbol] = {
                            'price': price,
                            'volume': volume,
                            'timestamp': timestamp,
                            'datetime': datetime.fromtimestamp(timestamp / 1000)
                        }
                        
                        # Price history güncelle
                        if symbol not in self.price_history:
                            self.price_history[symbol] = []
                        
                        self.price_history[symbol].append({
                            'price': price,
                            'volume': volume,
                            'timestamp': timestamp,
                            'datetime': datetime.fromtimestamp(timestamp / 1000)
                        })
                        
                        # Son 1000 veriyi tut
                        if len(self.price_history[symbol]) > 1000:
                            self.price_history[symbol] = self.price_history[symbol][-1000:]
                        
                        # Callback'leri çağır
                        for callback in self.price_callbacks:
                            try:
                                await callback(symbol, price, volume, timestamp)
                            except Exception as e:
                                self.logger.error(f"❌ Callback hatası: {e}")
            
            elif data.get('type') == 'ping':
                # Ping mesajına pong ile cevap ver
                pong_message = {"type": "pong"}
                await self.websocket.send(json.dumps(pong_message))
                
        except json.JSONDecodeError as e:
            self.logger.error(f"❌ JSON decode hatası: {e}")
        except Exception as e:
            self.logger.error(f"❌ Mesaj işleme hatası: {e}")
    
    async def _mock_streaming(self):
        """Mock streaming - test için"""
        try:
            while self.is_connected and self.subscribed_symbols:
                # Her sembol için mock fiyat oluştur
                for symbol in list(self.subscribed_symbols):
                    mock_trade = self._generate_mock_price(symbol)
                    
                    # Fiyat güncelle
                    symbol = mock_trade['s']
                    price = mock_trade['p']
                    volume = mock_trade['v']
                    timestamp = mock_trade['t']
                    
                    self.latest_prices[symbol] = {
                        'price': price,
                        'volume': volume,
                        'timestamp': timestamp,
                        'datetime': datetime.fromtimestamp(timestamp / 1000)
                    }
                    
                    # Price history güncelle
                    if symbol not in self.price_history:
                        self.price_history[symbol] = []
                    
                    self.price_history[symbol].append({
                        'price': price,
                        'volume': volume,
                        'timestamp': timestamp,
                        'datetime': datetime.fromtimestamp(timestamp / 1000)
                    })
                    
                    # Son 1000 veriyi tut
                    if len(self.price_history[symbol]) > 1000:
                        self.price_history[symbol] = self.price_history[symbol][-1000:]
                    
                    # Callback'leri çağır
                    for callback in self.price_callbacks:
                        try:
                            await callback(symbol, price, volume, timestamp)
                        except Exception as e:
                            self.logger.error(f"❌ Mock callback hatası: {e}")
                
                # 2 saniye bekle
                await asyncio.sleep(2)
                
        except Exception as e:
            self.logger.error(f"❌ Mock streaming hatası: {e}")
    
    async def listen(self):
        """WebSocket mesajlarını dinle"""
        if not self.is_connected:
            self.logger.error("❌ WebSocket bağlı değil")
            return
        
        if self.use_mock:
            # Mock streaming
            await self._mock_streaming()
            return
        
        try:
            async for message in self.websocket:
                await self._process_message(message)
        except websockets.exceptions.ConnectionClosed:
            self.logger.warning("⚠️ WebSocket bağlantısı kapandı")
            self.is_connected = False
        except Exception as e:
            self.logger.error(f"❌ Listen hatası: {e}")
            self.is_connected = False
    
    def get_latest_price(self, symbol: str) -> Optional[Dict]:
        """Belirli bir sembolün en son fiyatını al"""
        return self.latest_prices.get(symbol)
    
    def get_price_history(self, symbol: str, limit: int = 100) -> List[Dict]:
        """Belirli bir sembolün fiyat geçmişini al"""
        history = self.price_history.get(symbol, [])
        return history[-limit:] if history else []
    
    def get_all_latest_prices(self) -> Dict:
        """Tüm sembollerin en son fiyatlarını al"""
        return self.latest_prices.copy()
    
    async def start_streaming(self, symbols: List[str]):
        """Streaming'i başlat"""
        # Bağlan
        if not await self.connect():
            return False
        
        # Sembolleri subscribe et
        await self.subscribe_symbols(symbols)
        
        # Dinlemeye başla
        await self.listen()
        
        return True

# Test fonksiyonu
async def test_finnhub_ws():
    """Finnhub WebSocket test fonksiyonu"""
    
    # Test sembolleri (BIST + ABD)
    test_symbols = [
        "AAPL", "GOOGL", "MSFT",  # ABD
        "SISE.IS", "EREGL.IS", "TUPRS.IS"  # BIST
    ]
    
    # WebSocket layer oluştur (mock mode)
    ws_layer = FinnhubWebSocketLayer(use_mock=True)
    
    # Price callback ekle
    async def price_callback(symbol, price, volume, timestamp):
        print(f"📈 {symbol}: ${price:.2f} | Volume: {volume} | Time: {datetime.fromtimestamp(timestamp/1000)}")
    
    ws_layer.add_price_callback(price_callback)
    
    try:
        # Streaming başlat
        print("🚀 Finnhub WebSocket test başlıyor... (Mock Mode)")
        await ws_layer.start_streaming(test_symbols)
        
    except KeyboardInterrupt:
        print("\n⏹️ Test durduruldu")
    finally:
        await ws_layer.disconnect()

if __name__ == "__main__":
    # Test çalıştır
    asyncio.run(test_finnhub_ws())
