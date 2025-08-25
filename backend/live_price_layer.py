"""
PRD v2.0 - P0-1: Canlı Fiyat Katmanı
Finnhub WebSocket + yfinance fallback ile BIST ve ABD borsaları için
Latency < 250ms hedefi
"""

import asyncio
import json
import logging
import time
from typing import Dict, List, Optional, Callable
import websockets
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import aiohttp
import nest_asyncio

nest_asyncio.apply()

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LivePriceLayer:
    """
    Canlı Fiyat Katmanı - PRD v2.0 P0-1
    Finnhub WebSocket + yfinance fallback
    """
    
    def __init__(self, finnhub_api_key: str = None):
        self.finnhub_api_key = finnhub_api_key
        self.ws_connection = None
        self.price_cache = {}
        self.last_update = {}
        self.subscribers = []
        self.is_connected = False
        self.reconnect_attempts = 0
        self.max_reconnect_attempts = 5
        
        # BIST 100 + ABD major stocks
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
        
        # Performance metrics
        self.latency_metrics = []
        self.connection_uptime = 0
        self.start_time = time.time()
        
    async def connect_finnhub_ws(self) -> bool:
        """Finnhub WebSocket bağlantısı kur"""
        if not self.finnhub_api_key:
            logger.warning("Finnhub API key yok, yfinance fallback kullanılacak")
            return False
            
        try:
            ws_url = f"wss://ws.finnhub.io?token={self.finnhub_api_key}"
            self.ws_connection = await websockets.connect(ws_url)
            
            # Subscribe to symbols
            for symbol in self.symbols['US']:
                subscribe_msg = {
                    "type": "subscribe",
                    "symbol": symbol
                }
                await self.ws_connection.send(json.dumps(subscribe_msg))
                
            self.is_connected = True
            self.reconnect_attempts = 0
            logger.info("Finnhub WebSocket bağlantısı kuruldu")
            return True
            
        except Exception as e:
            logger.error(f"Finnhub WebSocket bağlantı hatası: {e}")
            return False
    
    async def listen_finnhub_ws(self):
        """Finnhub WebSocket'ten veri dinle"""
        if not self.ws_connection:
            return
            
        try:
            async for message in self.ws_connection:
                try:
                    data = json.loads(message)
                    if data.get('type') == 'trade':
                        await self.process_finnhub_data(data)
                except json.JSONDecodeError:
                    continue
                    
        except websockets.exceptions.ConnectionClosed:
            logger.warning("Finnhub WebSocket bağlantısı kapandı")
            self.is_connected = False
            await self.reconnect()
            
    async def process_finnhub_data(self, data: Dict):
        """Finnhub verilerini işle"""
        start_time = time.time()
        
        for trade in data.get('data', []):
            symbol = trade.get('s')
            price = trade.get('p')
            volume = trade.get('v')
            timestamp = trade.get('t')
            
            if symbol and price:
                self.price_cache[symbol] = {
                    'price': price,
                    'volume': volume,
                    'timestamp': timestamp,
                    'source': 'finnhub_ws'
                }
                self.last_update[symbol] = time.time()
                
                # Notify subscribers
                await self.notify_subscribers(symbol, price, volume, timestamp)
        
        # Latency measurement
        latency = (time.time() - start_time) * 1000  # ms
        self.latency_metrics.append(latency)
        
        # Keep only last 1000 measurements
        if len(self.latency_metrics) > 1000:
            self.latency_metrics = self.latency_metrics[-1000:]
    
    async def get_yfinance_data(self, symbols: List[str]) -> Dict:
        """yfinance ile fallback veri çek"""
        try:
            start_time = time.time()
            
            # Batch download
            tickers = yf.Tickers(' '.join(symbols))
            data = {}
            
            for symbol in symbols:
                try:
                    ticker = tickers.tickers[symbol]
                    info = ticker.info
                    hist = ticker.history(period='1d', interval='1m')
                    
                    if not hist.empty:
                        latest = hist.iloc[-1]
                        data[symbol] = {
                            'price': float(latest['Close']),
                            'volume': int(latest['Volume']),
                            'timestamp': int(time.time() * 1000),
                            'source': 'yfinance',
                            'change': float(latest['Close'] - latest['Open']),
                            'change_percent': float((latest['Close'] - latest['Open']) / latest['Open'] * 100)
                        }
                        
                        # Cache'e ekle
                        self.price_cache[symbol] = data[symbol]
                        self.last_update[symbol] = time.time()
                        
                except Exception as e:
                    logger.warning(f"yfinance veri çekme hatası {symbol}: {e}")
                    continue
            
            latency = (time.time() - start_time) * 1000
            self.latency_metrics.append(latency)
            
            return data
            
        except Exception as e:
            logger.error(f"yfinance batch download hatası: {e}")
            return {}
    
    async def get_bist_data(self) -> Dict:
        """BIST hisseleri için yfinance verisi çek"""
        return await self.get_yfinance_data(self.symbols['BIST'])
    
    async def get_us_data(self) -> Dict:
        """ABD hisseleri için yfinance verisi çek"""
        return await self.get_yfinance_data(self.symbols['US'])
    
    async def get_all_prices(self) -> Dict:
        """Tüm semboller için fiyat verisi al"""
        all_data = {}
        
        # Finnhub WS'den gelen veriler
        if self.is_connected:
            for symbol, data in self.price_cache.items():
                if time.time() - self.last_update.get(symbol, 0) < 60:  # 1 dakika içinde
                    all_data[symbol] = data
        
        # Eksik veriler için yfinance
        missing_symbols = []
        for market in self.symbols.values():
            for symbol in market:
                if symbol not in all_data or time.time() - self.last_update.get(symbol, 0) > 60:
                    missing_symbols.append(symbol)
        
        if missing_symbols:
            yf_data = await self.get_yfinance_data(missing_symbols)
            all_data.update(yf_data)
        
        return all_data
    
    async def get_symbol_price(self, symbol: str) -> Optional[Dict]:
        """Belirli bir sembol için fiyat verisi al"""
        # Cache'den kontrol et
        if symbol in self.price_cache:
            last_update = self.last_update.get(symbol, 0)
            if time.time() - last_update < 60:  # 1 dakika içinde
                return self.price_cache[symbol]
        
        # yfinance'dan çek
        data = await self.get_yfinance_data([symbol])
        return data.get(symbol)
    
    def subscribe(self, callback: Callable):
        """Fiyat güncellemeleri için callback ekle"""
        self.subscribers.append(callback)
    
    async def notify_subscribers(self, symbol: str, price: float, volume: int, timestamp: int):
        """Subscriber'lara güncelleme bildir"""
        for callback in self.subscribers:
            try:
                await callback(symbol, price, volume, timestamp)
            except Exception as e:
                logger.error(f"Subscriber callback hatası: {e}")
    
    async def reconnect(self):
        """WebSocket bağlantısını yeniden kur"""
        if self.reconnect_attempts >= self.max_reconnect_attempts:
            logger.error("Maksimum reconnect denemesi aşıldı")
            return
            
        self.reconnect_attempts += 1
        logger.info(f"Reconnect denemesi {self.reconnect_attempts}/{self.max_reconnect_attempts}")
        
        await asyncio.sleep(5)  # 5 saniye bekle
        
        if await self.connect_finnhub_ws():
            asyncio.create_task(self.listen_finnhub_ws())
    
    def get_performance_metrics(self) -> Dict:
        """Performans metriklerini al"""
        if not self.latency_metrics:
            return {}
            
        avg_latency = sum(self.latency_metrics) / len(self.latency_metrics)
        max_latency = max(self.latency_metrics)
        min_latency = min(self.latency_metrics)
        
        return {
            'avg_latency_ms': round(avg_latency, 2),
            'max_latency_ms': round(max_latency, 2),
            'min_latency_ms': round(min_latency, 2),
            'total_updates': len(self.latency_metrics),
            'connection_uptime': time.time() - self.start_time,
            'is_connected': self.is_connected,
            'cache_size': len(self.price_cache),
            'last_updates': len([s for s, t in self.last_update.items() if time.time() - t < 60])
        }
    
    async def start(self):
        """Live Price Layer'ı başlat"""
        logger.info("Live Price Layer başlatılıyor...")
        
        # Finnhub WS bağlantısı dene
        if self.finnhub_api_key:
            if await self.connect_finnhub_ws():
                asyncio.create_task(self.listen_finnhub_ws())
        
        # İlk veri çekme
        await self.get_bist_data()
        await self.get_us_data()
        
        logger.info("Live Price Layer başlatıldı")
    
    async def stop(self):
        """Live Price Layer'ı durdur"""
        if self.ws_connection:
            await self.ws_connection.close()
        self.is_connected = False
        logger.info("Live Price Layer durduruldu")

# Test fonksiyonu
async def test_live_price_layer():
    """Live Price Layer test fonksiyonu"""
    layer = LivePriceLayer()
    
    # Test callback
    async def price_callback(symbol, price, volume, timestamp):
        print(f"🔄 {symbol}: ${price:.2f} (Vol: {volume})")
    
    layer.subscribe(price_callback)
    
    await layer.start()
    
    # 10 saniye test et
    await asyncio.sleep(10)
    
    # Performans metrikleri
    metrics = layer.get_performance_metrics()
    print(f"\n📊 Performans Metrikleri:")
    for key, value in metrics.items():
        print(f"  {key}: {value}")
    
    await layer.stop()

if __name__ == "__main__":
    asyncio.run(test_live_price_layer())
