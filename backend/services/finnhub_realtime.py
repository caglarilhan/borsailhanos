"""
PRD v2.0 - Finnhub WebSocket Gerçek Zamanlı Veri Entegrasyonu
Finnhub WebSocket API ile gerçek zamanlı fiyat verisi
Fallback: yfinance polling mekanizması
"""

import asyncio
import websockets
import json
import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Optional, Callable, Any
import httpx
import time

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FinnhubRealtimeData:
    """Finnhub WebSocket ile gerçek zamanlı veri"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or "demo"  # Demo key for testing
        self.websocket = None
        self.connected = False
        self.subscribers = {}  # symbol -> list of callbacks
        self.price_cache = {}
        self.last_update = {}
        
        # Finnhub WebSocket URL
        self.ws_url = f"wss://ws.finnhub.io?token={self.api_key}"
        
        # Fallback parametreleri
        self.fallback_enabled = True
        self.fallback_interval = 5  # saniye
        self.max_reconnect_attempts = 5
        self.reconnect_delay = 10  # saniye
        
        # Veri kalitesi parametreleri
        self.data_quality_threshold = 0.8
        self.price_change_threshold = 0.05  # %5 değişim eşiği
        
        # BIST 100 sembolleri
        self.bist_symbols = [
            "GARAN.IS", "AKBNK.IS", "ISCTR.IS", "THYAO.IS", "TUPRS.IS",
            "ASELS.IS", "KRDMD.IS", "SAHOL.IS", "BIMAS.IS", "EREGL.IS",
            "SISE.IS", "KOZAL.IS", "PETKM.IS", "TCELL.IS", "VAKBN.IS",
            "ARCLK.IS", "KCHOL.IS", "TOASO.IS", "ENKAI.IS", "MGROS.IS"
        ]
        
        # ABD sembolleri
        self.us_symbols = [
            "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA",
            "META", "NVDA", "NFLX", "AMD", "INTC"
        ]
        
        # Tüm semboller
        self.all_symbols = self.bist_symbols + self.us_symbols
        
        # Veri kalitesi metrikleri
        self.data_quality_metrics = {
            "total_updates": 0,
            "successful_updates": 0,
            "failed_updates": 0,
            "avg_latency": 0,
            "last_quality_check": None
        }
    
    async def connect(self) -> bool:
        """WebSocket bağlantısı kur"""
        try:
            logger.info(f"🔌 Finnhub WebSocket bağlantısı kuruluyor...")
            
            self.websocket = await websockets.connect(self.ws_url)
            self.connected = True
            
            logger.info("✅ Finnhub WebSocket bağlantısı kuruldu")
            
            # Heartbeat gönder
            await self._send_heartbeat()
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Finnhub WebSocket bağlantı hatası: {e}")
            self.connected = False
            return False
    
    async def disconnect(self):
        """WebSocket bağlantısını kes"""
        try:
            if self.websocket:
                await self.websocket.close()
                self.connected = False
                logger.info("❌ Finnhub WebSocket bağlantısı kesildi")
        except Exception as e:
            logger.error(f"❌ WebSocket kapatma hatası: {e}")
    
    async def _send_heartbeat(self):
        """Heartbeat gönder"""
        try:
            if self.connected and self.websocket:
                heartbeat = {"type": "ping"}
                await self.websocket.send(json.dumps(heartbeat))
                logger.debug("💓 Heartbeat gönderildi")
        except Exception as e:
            logger.error(f"❌ Heartbeat hatası: {e}")
    
    async def subscribe_to_symbol(self, symbol: str, callback: Callable = None):
        """Sembole abone ol"""
        try:
            if not self.connected:
                logger.warning("⚠️ WebSocket bağlı değil, abonelik ertelendi")
                return False
            
            # Abonelik mesajı
            subscribe_msg = {
                "type": "subscribe",
                "symbol": symbol
            }
            
            await self.websocket.send(json.dumps(subscribe_msg))
            
            # Callback kaydet
            if callback:
                if symbol not in self.subscribers:
                    self.subscribers[symbol] = []
                self.subscribers[symbol].append(callback)
            
            logger.info(f"📡 {symbol} sembolüne abone olundu")
            return True
            
        except Exception as e:
            logger.error(f"❌ {symbol} abonelik hatası: {e}")
            return False
    
    async def unsubscribe_from_symbol(self, symbol: str):
        """Sembolden abonelikten çık"""
        try:
            if not self.connected:
                return False
            
            # Abonelikten çıkma mesajı
            unsubscribe_msg = {
                "type": "unsubscribe",
                "symbol": symbol
            }
            
            await self.websocket.send(json.dumps(unsubscribe_msg))
            
            # Callback'leri temizle
            if symbol in self.subscribers:
                del self.subscribers[symbol]
            
            logger.info(f"📡 {symbol} abonelikten çıkarıldı")
            return True
            
        except Exception as e:
            logger.error(f"❌ {symbol} abonelikten çıkma hatası: {e}")
            return False
    
    async def listen_for_updates(self):
        """WebSocket mesajlarını dinle"""
        try:
            logger.info("👂 Finnhub WebSocket mesajları dinleniyor...")
            
            while self.connected:
                try:
                    # Mesaj al
                    message = await self.websocket.recv()
                    data = json.loads(message)
                    
                    # Mesaj türüne göre işle
                    if data.get("type") == "trade":
                        await self._handle_trade_update(data)
                    elif data.get("type") == "ping":
                        await self._handle_ping(data)
                    elif data.get("type") == "error":
                        await self._handle_error(data)
                    else:
                        logger.debug(f"📨 Bilinmeyen mesaj türü: {data}")
                
                except websockets.exceptions.ConnectionClosed:
                    logger.warning("⚠️ WebSocket bağlantısı kapandı")
                    break
                except Exception as e:
                    logger.error(f"❌ Mesaj işleme hatası: {e}")
                    await asyncio.sleep(1)
            
        except Exception as e:
            logger.error(f"❌ WebSocket dinleme hatası: {e}")
        finally:
            self.connected = False
    
    async def _handle_trade_update(self, data: Dict):
        """Trade güncellemesini işle"""
        try:
            symbol = data.get("data", [{}])[0].get("s")
            price = data.get("data", [{}])[0].get("p")
            volume = data.get("data", [{}])[0].get("v")
            timestamp = data.get("data", [{}])[0].get("t")
            
            if not symbol or not price:
                return
            
            # Fiyat verisini güncelle
            price_data = {
                "symbol": symbol,
                "price": price,
                "volume": volume,
                "timestamp": timestamp,
                "source": "finnhub_ws",
                "latency": time.time() - (timestamp / 1000) if timestamp else 0
            }
            
            # Cache'e kaydet
            self.price_cache[symbol] = price_data
            self.last_update[symbol] = datetime.now()
            
            # Veri kalitesi kontrolü
            await self._check_data_quality(symbol, price_data)
            
            # Callback'leri çağır
            if symbol in self.subscribers:
                for callback in self.subscribers[symbol]:
                    try:
                        await callback(price_data)
                    except Exception as e:
                        logger.error(f"❌ Callback hatası: {e}")
            
            logger.debug(f"📊 {symbol}: {price} (Volume: {volume})")
            
        except Exception as e:
            logger.error(f"❌ Trade güncelleme hatası: {e}")
    
    async def _handle_ping(self, data: Dict):
        """Ping mesajını işle"""
        try:
            # Pong gönder
            pong_msg = {"type": "pong"}
            await self.websocket.send(json.dumps(pong_msg))
            logger.debug("🏓 Pong gönderildi")
        except Exception as e:
            logger.error(f"❌ Pong hatası: {e}")
    
    async def _handle_error(self, data: Dict):
        """Hata mesajını işle"""
        try:
            error_msg = data.get("msg", "Bilinmeyen hata")
            logger.error(f"❌ Finnhub WebSocket hatası: {error_msg}")
            
            # Veri kalitesi metriklerini güncelle
            self.data_quality_metrics["failed_updates"] += 1
            
        except Exception as e:
            logger.error(f"❌ Hata işleme hatası: {e}")
    
    async def _check_data_quality(self, symbol: str, price_data: Dict):
        """Veri kalitesini kontrol et"""
        try:
            # Latency kontrolü
            latency = price_data.get("latency", 0)
            if latency > 1.0:  # 1 saniyeden fazla gecikme
                logger.warning(f"⚠️ {symbol} yüksek gecikme: {latency:.2f}s")
            
            # Fiyat değişim kontrolü
            if symbol in self.price_cache:
                prev_price = self.price_cache[symbol].get("price", 0)
                current_price = price_data.get("price", 0)
                
                if prev_price > 0:
                    change_pct = abs(current_price - prev_price) / prev_price
                    if change_pct > self.price_change_threshold:
                        logger.warning(f"⚠️ {symbol} büyük fiyat değişimi: {change_pct:.2%}")
            
            # Veri kalitesi metriklerini güncelle
            self.data_quality_metrics["total_updates"] += 1
            self.data_quality_metrics["successful_updates"] += 1
            
            # Ortalama gecikme hesapla
            if latency > 0:
                total_updates = self.data_quality_metrics["total_updates"]
                current_avg = self.data_quality_metrics["avg_latency"]
                self.data_quality_metrics["avg_latency"] = (
                    (current_avg * (total_updates - 1) + latency) / total_updates
                )
            
        except Exception as e:
            logger.error(f"❌ Veri kalitesi kontrol hatası: {e}")
    
    async def get_realtime_price(self, symbol: str) -> Optional[Dict]:
        """Gerçek zamanlı fiyat verisi getir"""
        try:
            # Cache'den kontrol et
            if symbol in self.price_cache:
                cache_data = self.price_cache[symbol]
                cache_time = self.last_update.get(symbol)
                
                # Cache verisi güncel mi? (5 saniye içinde)
                if cache_time and (datetime.now() - cache_time).seconds < 5:
                    return cache_data
            
            # Fallback: yfinance ile veri çek
            if self.fallback_enabled:
                return await self._get_fallback_price(symbol)
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Gerçek zamanlı fiyat hatası: {e}")
            return None
    
    async def _get_fallback_price(self, symbol: str) -> Optional[Dict]:
        """Fallback fiyat verisi (yfinance)"""
        try:
            logger.debug(f"🔄 {symbol} için fallback veri çekiliyor...")
            
            stock = yf.Ticker(symbol)
            hist = stock.history(period="1d", interval="1m")
            
            if hist.empty:
                return None
            
            # Son fiyat
            latest = hist.iloc[-1]
            
            price_data = {
                "symbol": symbol,
                "price": latest['Close'],
                "volume": latest['Volume'],
                "timestamp": int(datetime.now().timestamp() * 1000),
                "source": "yfinance_fallback",
                "latency": 0
            }
            
            # Cache'e kaydet
            self.price_cache[symbol] = price_data
            self.last_update[symbol] = datetime.now()
            
            logger.debug(f"📊 {symbol} fallback veri: {price_data['price']}")
            return price_data
            
        except Exception as e:
            logger.error(f"❌ Fallback fiyat hatası: {e}")
            return None
    
    async def get_multiple_prices(self, symbols: List[str]) -> Dict[str, Dict]:
        """Birden fazla sembol için fiyat verisi getir"""
        try:
            results = {}
            
            for symbol in symbols:
                price_data = await self.get_realtime_price(symbol)
                if price_data:
                    results[symbol] = price_data
            
            return results
            
        except Exception as e:
            logger.error(f"❌ Çoklu fiyat hatası: {e}")
            return {}
    
    async def subscribe_to_multiple_symbols(self, symbols: List[str], callback: Callable = None):
        """Birden fazla sembole abone ol"""
        try:
            success_count = 0
            
            for symbol in symbols:
                success = await self.subscribe_to_symbol(symbol, callback)
                if success:
                    success_count += 1
                await asyncio.sleep(0.1)  # Rate limiting
            
            logger.info(f"📡 {success_count}/{len(symbols)} sembole abone olundu")
            return success_count == len(symbols)
            
        except Exception as e:
            logger.error(f"❌ Çoklu abonelik hatası: {e}")
            return False
    
    async def start_fallback_polling(self, symbols: List[str], interval: int = 5):
        """Fallback polling başlat"""
        try:
            logger.info(f"🔄 Fallback polling başlatılıyor ({interval}s interval)")
            
            while True:
                try:
                    for symbol in symbols:
                        await self._get_fallback_price(symbol)
                        await asyncio.sleep(0.1)  # Rate limiting
                    
                    await asyncio.sleep(interval)
                    
                except Exception as e:
                    logger.error(f"❌ Fallback polling hatası: {e}")
                    await asyncio.sleep(interval)
            
        except Exception as e:
            logger.error(f"❌ Fallback polling başlatma hatası: {e}")
    
    async def reconnect(self) -> bool:
        """Yeniden bağlan"""
        try:
            logger.info("🔄 WebSocket yeniden bağlanıyor...")
            
            # Mevcut bağlantıyı kapat
            await self.disconnect()
            
            # Yeniden bağlan
            success = await self.connect()
            
            if success:
                # Abonelikleri yenile
                for symbol in self.subscribers.keys():
                    await self.subscribe_to_symbol(symbol)
                    await asyncio.sleep(0.1)
                
                logger.info("✅ WebSocket yeniden bağlandı")
            else:
                logger.error("❌ WebSocket yeniden bağlanamadı")
            
            return success
            
        except Exception as e:
            logger.error(f"❌ Yeniden bağlanma hatası: {e}")
            return False
    
    async def start_connection_manager(self):
        """Bağlantı yöneticisini başlat"""
        try:
            logger.info("🔧 Bağlantı yöneticisi başlatılıyor...")
            
            reconnect_attempts = 0
            
            while reconnect_attempts < self.max_reconnect_attempts:
                try:
                    # Bağlantı kur
                    success = await self.connect()
                    
                    if success:
                        # Mesaj dinleme başlat
                        await self.listen_for_updates()
                        reconnect_attempts = 0  # Başarılı bağlantı sonrası sıfırla
                    else:
                        reconnect_attempts += 1
                        logger.warning(f"⚠️ Bağlantı başarısız, deneme {reconnect_attempts}/{self.max_reconnect_attempts}")
                        await asyncio.sleep(self.reconnect_delay)
                
                except Exception as e:
                    logger.error(f"❌ Bağlantı yöneticisi hatası: {e}")
                    reconnect_attempts += 1
                    await asyncio.sleep(self.reconnect_delay)
            
            logger.error("❌ Maksimum yeniden bağlanma denemesi aşıldı")
            
        except Exception as e:
            logger.error(f"❌ Bağlantı yöneticisi başlatma hatası: {e}")
    
    def get_data_quality_metrics(self) -> Dict:
        """Veri kalitesi metriklerini getir"""
        try:
            total_updates = self.data_quality_metrics["total_updates"]
            successful_updates = self.data_quality_metrics["successful_updates"]
            
            if total_updates > 0:
                success_rate = successful_updates / total_updates
            else:
                success_rate = 0
            
            return {
                "total_updates": total_updates,
                "successful_updates": successful_updates,
                "failed_updates": self.data_quality_metrics["failed_updates"],
                "success_rate": success_rate,
                "avg_latency": self.data_quality_metrics["avg_latency"],
                "connected": self.connected,
                "subscribed_symbols": list(self.subscribers.keys()),
                "cache_size": len(self.price_cache),
                "last_quality_check": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Veri kalitesi metrikleri hatası: {e}")
            return {}
    
    def get_cached_prices(self) -> Dict[str, Dict]:
        """Cache'lenmiş fiyatları getir"""
        return self.price_cache.copy()
    
    async def cleanup(self):
        """Temizlik işlemleri"""
        try:
            # WebSocket bağlantısını kapat
            await self.disconnect()
            
            # Cache'i temizle
            self.price_cache.clear()
            self.last_update.clear()
            self.subscribers.clear()
            
            logger.info("🧹 Finnhub realtime data temizlendi")
            
        except Exception as e:
            logger.error(f"❌ Temizlik hatası: {e}")

# Test fonksiyonu
async def test_finnhub_realtime():
    """Finnhub realtime data test"""
    try:
        logger.info("🧪 Finnhub Realtime Data test başlatılıyor...")
        
        # Finnhub instance oluştur
        finnhub = FinnhubRealtimeData()
        
        # Test callback
        async def price_callback(price_data):
            logger.info(f"📊 Fiyat güncellemesi: {price_data}")
        
        # Bağlantı kur
        success = await finnhub.connect()
        if not success:
            logger.error("❌ Bağlantı kurulamadı")
            return
        
        # Test sembollerine abone ol
        test_symbols = ["AAPL", "MSFT", "GARAN.IS"]
        await finnhub.subscribe_to_multiple_symbols(test_symbols, price_callback)
        
        # 30 saniye dinle
        logger.info("👂 30 saniye dinleniyor...")
        await asyncio.sleep(30)
        
        # Veri kalitesi metrikleri
        metrics = finnhub.get_data_quality_metrics()
        logger.info(f"📊 Veri kalitesi: {metrics}")
        
        # Cache'lenmiş fiyatlar
        cached_prices = finnhub.get_cached_prices()
        logger.info(f"💾 Cache'lenmiş fiyatlar: {len(cached_prices)} sembol")
        
        # Temizlik
        await finnhub.cleanup()
        
        logger.info("✅ Finnhub Realtime Data test tamamlandı")
        
    except Exception as e:
        logger.error(f"❌ Test hatası: {e}")

if __name__ == "__main__":
    asyncio.run(test_finnhub_realtime())
