"""
PRD v2.0 - P0-1: Canlı Fiyat Katmanı (OPTIMIZED)
Finnhub WebSocket + yfinance fallback ile BIST ve ABD borsaları için
Latency < 250ms hedefi - Production Ready
"""

import asyncio
import json
import logging
import time
import gc
from typing import Dict, List, Optional, Callable, Any
import websockets
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import aiohttp
import nest_asyncio
from dataclasses import dataclass, asdict
from collections import defaultdict, deque
import weakref
import signal
import sys

nest_asyncio.apply()

# Production logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('live_price_layer.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class PriceData:
    """Optimized price data structure"""
    symbol: str
    price: float
    volume: int
    timestamp: int
    source: str
    change: float = 0.0
    change_percent: float = 0.0
    bid: Optional[float] = None
    ask: Optional[float] = None
    high: Optional[float] = None
    low: Optional[float] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

class MemoryOptimizedCache:
    """Memory optimized cache with LRU eviction"""
    
    def __init__(self, max_size: int = 10000):
        self.max_size = max_size
        self.cache = {}
        self.access_order = deque()
        self.access_count = defaultdict(int)
        
    def get(self, key: str) -> Optional[PriceData]:
        if key in self.cache:
            # Update access order
            self.access_order.remove(key)
            self.access_order.append(key)
            self.access_count[key] += 1
            return self.cache[key]
        return None
    
    def set(self, key: str, value: PriceData):
        if len(self.cache) >= self.max_size:
            # Evict least recently used
            lru_key = self.access_order.popleft()
            del self.cache[lru_key]
            del self.access_count[lru_key]
        
        self.cache[key] = value
        self.access_order.append(key)
        self.access_count[key] = 1
    
    def cleanup(self):
        """Clean up old entries and trigger garbage collection"""
        current_time = time.time()
        keys_to_remove = []
        
        for key, value in self.cache.items():
            if current_time - value.timestamp / 1000 > 3600:  # 1 hour old
                keys_to_remove.append(key)
        
        for key in keys_to_remove:
            del self.cache[key]
            self.access_order.remove(key)
            del self.access_count[key]
        
        # Force garbage collection
        gc.collect()
    
    def get_stats(self) -> Dict[str, Any]:
        return {
            'size': len(self.cache),
            'max_size': self.max_size,
            'memory_usage_mb': sys.getsizeof(self.cache) / 1024 / 1024,
            'most_accessed': sorted(self.access_count.items(), key=lambda x: x[1], reverse=True)[:10]
        }

class LivePriceLayer:
    """
    Canlı Fiyat Katmanı - PRD v2.0 P0-1 (OPTIMIZED)
    Finnhub WebSocket + yfinance fallback
    """
    
    def __init__(self, finnhub_api_key: str = None, max_cache_size: int = 10000):
        self.finnhub_api_key = finnhub_api_key
        self.ws_connection = None
        self.price_cache = MemoryOptimizedCache(max_cache_size)
        self.last_update = {}
        self.subscribers = weakref.WeakSet()  # Prevent memory leaks
        self.is_connected = False
        self.reconnect_attempts = 0
        self.max_reconnect_attempts = 5
        self.connection_health = {
            'last_heartbeat': time.time(),
            'missed_heartbeats': 0,
            'total_errors': 0
        }
        
        # BIST 100 + ABD major stocks (optimized list)
        self.symbols = {
            'BIST': [
                'AKBNK.IS', 'ASELS.IS', 'BIMAS.IS', 'EREGL.IS', 'FROTO.IS',
                'GARAN.IS', 'HEKTS.IS', 'ISCTR.IS', 'KCHOL.IS', 'KOZAL.IS',
                'KRDMD.IS', 'MGROS.IS', 'PGSUS.IS', 'SAHOL.IS', 'SASA.IS',
                'SISE.IS', 'TAVHL.IS', 'THYAO.IS', 'TOASO.IS', 'TUPRS.IS'
            ],
            'US': [
                'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA',
                'NFLX', 'AMD', 'INTC', 'CRM', 'ORCL', 'ADBE', 'PYPL'
            ]
        }
        
        # Performance metrics with rolling window
        self.latency_metrics = deque(maxlen=1000)
        self.connection_uptime = 0
        self.start_time = time.time()
        self.total_requests = 0
        self.successful_requests = 0
        
        # Background tasks
        self.cleanup_task = None
        self.health_check_task = None
        self.is_running = False
        
        # Signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
        
    def _signal_handler(self, signum, frame):
        """Graceful shutdown handler"""
        logger.info(f"Signal {signum} received, shutting down gracefully...")
        asyncio.create_task(self.stop())
        
    async def connect_finnhub_ws(self) -> bool:
        """Finnhub WebSocket bağlantısı kur (optimized)"""
        if not self.finnhub_api_key:
            logger.warning("Finnhub API key yok, yfinance fallback kullanılacak")
            return False
            
        try:
            # Connection timeout
            ws_url = f"wss://ws.finnhub.io?token={self.finnhub_api_key}"
            self.ws_connection = await asyncio.wait_for(
                websockets.connect(ws_url),
                timeout=10.0
            )
            
            # Subscribe to symbols in batches
            batch_size = 50
            for i in range(0, len(self.symbols['US']), batch_size):
                batch = self.symbols['US'][i:i+batch_size]
                subscribe_msg = {
                    "type": "subscribe",
                    "symbol": batch
                }
                await self.ws_connection.send(json.dumps(subscribe_msg))
                await asyncio.sleep(0.1)  # Rate limiting
                
            self.is_connected = True
            self.reconnect_attempts = 0
            self.connection_health['last_heartbeat'] = time.time()
            logger.info("Finnhub WebSocket bağlantısı kuruldu")
            return True
            
        except asyncio.TimeoutError:
            logger.error("Finnhub WebSocket bağlantı timeout")
            return False
        except Exception as e:
            logger.error(f"Finnhub WebSocket bağlantı hatası: {e}")
            self.connection_health['total_errors'] += 1
            return False
    
    async def listen_finnhub_ws(self):
        """Finnhub WebSocket'ten veri dinle (optimized)"""
        if not self.ws_connection:
            return
            
        try:
            async for message in self.ws_connection:
                try:
                    # Heartbeat check
                    if time.time() - self.connection_health['last_heartbeat'] > 30:
                        await self._send_heartbeat()
                    
                    data = json.loads(message)
                    if data.get('type') == 'trade':
                        await self.process_finnhub_data(data)
                    elif data.get('type') == 'ping':
                        await self._send_pong()
                        
                except json.JSONDecodeError:
                    continue
                except Exception as e:
                    logger.error(f"Message processing error: {e}")
                    self.connection_health['total_errors'] += 1
                    
        except websockets.exceptions.ConnectionClosed:
            logger.warning("Finnhub WebSocket bağlantısı kapandı")
            self.is_connected = False
            await self.reconnect()
        except Exception as e:
            logger.error(f"WebSocket listening error: {e}")
            self.connection_health['total_errors'] += 1
            await self.reconnect()
    
    async def _send_heartbeat(self):
        """Send heartbeat to keep connection alive"""
        try:
            if self.ws_connection:
                await self.ws_connection.send(json.dumps({"type": "ping"}))
                self.connection_health['last_heartbeat'] = time.time()
        except Exception as e:
            logger.warning(f"Heartbeat error: {e}")
    
    async def _send_pong(self):
        """Send pong response"""
        try:
            if self.ws_connection:
                await self.ws_connection.send(json.dumps({"type": "pong"}))
        except Exception as e:
            logger.warning(f"Pong error: {e}")
            
    async def process_finnhub_data(self, data: Dict):
        """Finnhub verilerini işle (optimized)"""
        start_time = time.time()
        
        try:
            for trade in data.get('data', []):
                symbol = trade.get('s')
                price = trade.get('p')
                volume = trade.get('v')
                timestamp = trade.get('t')
                
                if symbol and price and price > 0:
                    # Create optimized PriceData object
                    price_data = PriceData(
                        symbol=symbol,
                        price=float(price),
                        volume=int(volume) if volume else 0,
                        timestamp=int(timestamp) if timestamp else int(time.time() * 1000),
                        source='finnhub_ws'
                    )
                    
                    # Update cache
                    self.price_cache.set(symbol, price_data)
                    self.last_update[symbol] = time.time()
                    
                    # Notify subscribers asynchronously
                    asyncio.create_task(self.notify_subscribers(symbol, price_data))
            
            # Latency measurement
            latency = (time.time() - start_time) * 1000
            self.latency_metrics.append(latency)
            self.successful_requests += 1
            
        except Exception as e:
            logger.error(f"Finnhub data processing error: {e}")
            self.connection_health['total_errors'] += 1
        
        self.total_requests += 1
    
    async def get_yfinance_data(self, symbols: List[str]) -> Dict:
        """yfinance ile fallback veri çek (optimized)"""
        try:
            start_time = time.time()
            
            # Batch download with error handling
            tickers = yf.Tickers(' '.join(symbols))
            data = {}
            
            # Process symbols in parallel
            tasks = []
            for symbol in symbols:
                task = asyncio.create_task(self._fetch_symbol_data(tickers, symbol))
                tasks.append(task)
            
            # Wait for all tasks with timeout
            results = await asyncio.wait_for(
                asyncio.gather(*tasks, return_exceptions=True),
                timeout=30.0
            )
            
            # Process results
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.warning(f"yfinance veri çekme hatası {symbols[i]}: {result}")
                    continue
                if result:
                    symbol, price_data = result
                    data[symbol] = price_data
                    self.price_cache.set(symbol, price_data)
                    self.last_update[symbol] = time.time()
            
            latency = (time.time() - start_time) * 1000
            self.latency_metrics.append(latency)
            self.successful_requests += 1
            
            return data
            
        except asyncio.TimeoutError:
            logger.error("yfinance batch download timeout")
            return {}
        except Exception as e:
            logger.error(f"yfinance batch download hatası: {e}")
            self.connection_health['total_errors'] += 1
            return {}
    
    async def _fetch_symbol_data(self, tickers, symbol: str) -> Optional[tuple]:
        """Fetch data for a single symbol"""
        try:
            ticker = tickers.tickers[symbol]
            hist = ticker.history(period='1d', interval='1m')
            
            if not hist.empty:
                latest = hist.iloc[-1]
                price_data = PriceData(
                    symbol=symbol,
                    price=float(latest['Close']),
                    volume=int(latest['Volume']),
                    timestamp=int(time.time() * 1000),
                    source='yfinance',
                    change=float(latest['Close'] - latest['Open']),
                    change_percent=float((latest['Close'] - latest['Open']) / latest['Open'] * 100),
                    high=float(latest['High']),
                    low=float(latest['Low'])
                )
                return symbol, price_data
        except Exception as e:
            logger.warning(f"Symbol data fetch error {symbol}: {e}")
            return None
    
    async def get_bist_data(self) -> Dict:
        """BIST hisseleri için yfinance verisi çek"""
        return await self.get_yfinance_data(self.symbols['BIST'])
    
    async def get_us_data(self) -> Dict:
        """ABD hisseleri için yfinance verisi çek"""
        return await self.get_yfinance_data(self.symbols['US'])
    
    async def get_all_prices(self) -> Dict:
        """Tüm semboller için fiyat verisi al (optimized)"""
        all_data = {}
        
        # Get data from cache first
        current_time = time.time()
        for symbol in self.symbols['BIST'] + self.symbols['US']:
            cached_data = self.price_cache.get(symbol)
            if cached_data and current_time - self.last_update.get(symbol, 0) < 60:
                all_data[symbol] = cached_data.to_dict()
        
        # Get missing data from yfinance
        missing_symbols = []
        for market in self.symbols.values():
            for symbol in market:
                if symbol not in all_data or current_time - self.last_update.get(symbol, 0) > 60:
                    missing_symbols.append(symbol)
        
        if missing_symbols:
            # Process in smaller batches to avoid timeout
            batch_size = 20
            for i in range(0, len(missing_symbols), batch_size):
                batch = missing_symbols[i:i+batch_size]
                yf_data = await self.get_yfinance_data(batch)
                all_data.update(yf_data)
                await asyncio.sleep(0.5)  # Rate limiting
        
        return all_data
    
    async def get_symbol_price(self, symbol: str) -> Optional[Dict]:
        """Belirli bir sembol için fiyat verisi al (optimized)"""
        # Check cache first
        cached_data = self.price_cache.get(symbol)
        if cached_data:
            last_update = self.last_update.get(symbol, 0)
            if time.time() - last_update < 60:  # 1 dakika içinde
                return cached_data.to_dict()
        
        # Fetch from yfinance
        data = await self.get_yfinance_data([symbol])
        return data.get(symbol)
    
    def subscribe(self, callback: Callable):
        """Fiyat güncellemeleri için callback ekle (memory safe)"""
        self.subscribers.add(callback)
    
    async def notify_subscribers(self, symbol: str, price_data: PriceData):
        """Subscriber'lara güncelleme bildir (optimized)"""
        dead_subscribers = set()
        
        for callback in self.subscribers:
            try:
                await callback(symbol, price_data)
            except Exception as e:
                logger.error(f"Subscriber callback hatası: {e}")
                dead_subscribers.add(callback)
        
        # Remove dead subscribers
        for dead_callback in dead_subscribers:
            self.subscribers.discard(dead_callback)
    
    async def reconnect(self):
        """WebSocket bağlantısını yeniden kur (optimized)"""
        if self.reconnect_attempts >= self.max_reconnect_attempts:
            logger.error("Maksimum reconnect denemesi aşıldı")
            return
            
        self.reconnect_attempts += 1
        logger.info(f"Reconnect denemesi {self.reconnect_attempts}/{self.max_reconnect_attempts}")
        
        # Exponential backoff
        wait_time = min(5 * (2 ** (self.reconnect_attempts - 1)), 60)
        await asyncio.sleep(wait_time)
        
        if await self.connect_finnhub_ws():
            asyncio.create_task(self.listen_finnhub_ws())
    
    async def _cleanup_old_data(self):
        """Clean up old data periodically"""
        while self.is_running:
            try:
                await asyncio.sleep(300)  # Every 5 minutes
                self.price_cache.cleanup()
                logger.debug("Cache cleanup completed")
            except Exception as e:
                logger.error(f"Cleanup error: {e}")
    
    async def _health_check(self):
        """Periodic health check"""
        while self.is_running:
            try:
                await asyncio.sleep(60)  # Every minute
                
                # Check connection health
                if self.is_connected and time.time() - self.connection_health['last_heartbeat'] > 60:
                    self.connection_health['missed_heartbeats'] += 1
                    logger.warning(f"Missed heartbeat #{self.connection_health['missed_heartbeats']}")
                    
                    if self.connection_health['missed_heartbeats'] > 3:
                        logger.error("Too many missed heartbeats, reconnecting...")
                        await self.reconnect()
                        self.connection_health['missed_heartbeats'] = 0
                
                # Log performance metrics
                if self.total_requests > 0:
                    success_rate = (self.successful_requests / self.total_requests) * 100
                    logger.info(f"Success rate: {success_rate:.2f}% ({self.successful_requests}/{self.total_requests})")
                    
            except Exception as e:
                logger.error(f"Health check error: {e}")
    
    def get_performance_metrics(self) -> Dict:
        """Performans metriklerini al (enhanced)"""
        if not self.latency_metrics:
            return {}
            
        avg_latency = sum(self.latency_metrics) / len(self.latency_metrics)
        max_latency = max(self.latency_metrics)
        min_latency = min(self.latency_metrics)
        
        # Calculate percentiles
        sorted_latencies = sorted(self.latency_metrics)
        p95_latency = sorted_latencies[int(len(sorted_latencies) * 0.95)]
        p99_latency = sorted_latencies[int(len(sorted_latencies) * 0.99)]
        
        return {
            'avg_latency_ms': round(avg_latency, 2),
            'max_latency_ms': round(max_latency, 2),
            'min_latency_ms': round(min_latency, 2),
            'p95_latency_ms': round(p95_latency, 2),
            'p99_latency_ms': round(p99_latency, 2),
            'total_requests': self.total_requests,
            'successful_requests': self.successful_requests,
            'success_rate_percent': round((self.successful_requests / max(self.total_requests, 1)) * 100, 2),
            'connection_uptime': time.time() - self.start_time,
            'is_connected': self.is_connected,
            'cache_stats': self.price_cache.get_stats(),
            'connection_health': self.connection_health,
            'last_updates': len([s for s, t in self.last_update.items() if time.time() - t < 60])
        }
    
    async def start(self):
        """Live Price Layer'ı başlat (optimized)"""
        logger.info("🚀 Live Price Layer başlatılıyor...")
        
        self.is_running = True
        
        # Start background tasks
        self.cleanup_task = asyncio.create_task(self._cleanup_old_data())
        self.health_check_task = asyncio.create_task(self._health_check())
        
        # Finnhub WS bağlantısı dene
        if self.finnhub_api_key:
            if await self.connect_finnhub_ws():
                asyncio.create_task(self.listen_finnhub_ws())
        
        # İlk veri çekme (parallel)
        tasks = [
            self.get_bist_data(),
            self.get_us_data()
        ]
        await asyncio.gather(*tasks, return_exceptions=True)
        
        logger.info("✅ Live Price Layer başlatıldı")
    
    async def stop(self):
        """Live Price Layer'ı durdur (graceful shutdown)"""
        logger.info("🛑 Live Price Layer durduruluyor...")
        
        self.is_running = False
        
        # Cancel background tasks
        if self.cleanup_task:
            self.cleanup_task.cancel()
        if self.health_check_task:
            self.health_check_task.cancel()
        
        # Close WebSocket connection
        if self.ws_connection:
            await self.ws_connection.close()
        
        self.is_connected = False
        
        # Final cleanup
        self.price_cache.cleanup()
        gc.collect()
        
        logger.info("✅ Live Price Layer durduruldu")

# Test fonksiyonu (optimized)
async def test_live_price_layer():
    """Live Price Layer test fonksiyonu (production ready)"""
    print("🚀 Live Price Layer Test Başlatılıyor...")
    
    layer = LivePriceLayer()
    
    # Test callback
    async def price_callback(symbol, price_data):
        print(f"🔄 {symbol}: ${price_data.price:.2f} (Vol: {price_data.volume})")
    
    layer.subscribe(price_callback)
    
    try:
        await layer.start()
        
        # 15 saniye test et
        await asyncio.sleep(15)
        
        # Performans metrikleri
        metrics = layer.get_performance_metrics()
        print(f"\n📊 Performans Metrikleri:")
        for key, value in metrics.items():
            if isinstance(value, dict):
                print(f"  {key}:")
                for k, v in value.items():
                    print(f"    {k}: {v}")
            else:
                print(f"  {key}: {value}")
        
    except KeyboardInterrupt:
        print("\n⏹️ Test kullanıcı tarafından durduruldu")
    except Exception as e:
        print(f"❌ Test hatası: {e}")
    finally:
        await layer.stop()
        print("\n✅ Live Price Layer Test Tamamlandı!")

if __name__ == "__main__":
    asyncio.run(test_live_price_layer())
