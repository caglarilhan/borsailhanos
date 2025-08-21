"""
PRD v2.0 - Real-Time Data Streaming
Real-time veri akışı, WebSocket, Redis cache ve live trading signals
"""

import asyncio
import websockets
import json
import redis
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Optional, Tuple, Any
import aiohttp
import yfinance as yf
from collections import deque
import threading
import time

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RealTimeStreaming:
    """Real-time veri akışı ve WebSocket entegrasyonu"""
    
    def __init__(self):
        self.websocket_connections = {}
        self.data_streams = {}
        self.redis_client = None
        self.live_signals = {}
        self.alert_subscribers = {}
        
        # Redis connection
        try:
            self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
            logger.info("✅ Redis bağlantısı kuruldu")
        except:
            logger.warning("⚠️ Redis bağlantısı kurulamadı")
        
        # Data sources
        self.data_sources = {
            "finnhub": {
                "base_url": "wss://ws.finnhub.io",
                "api_key": "YOUR_FINNHUB_API_KEY"
            },
            "polygon": {
                "base_url": "wss://delayed.polygon.io",
                "api_key": "YOUR_POLYGON_API_KEY"
            },
            "yahoo": {
                "base_url": "https://query1.finance.yahoo.com",
                "api_key": None
            }
        }
        
        # Streaming configuration
        self.stream_config = {
            "update_interval": 1,      # 1 saniye
            "max_cache_size": 1000,    # 1000 veri noktası
            "alert_threshold": 0.05,   # %5 değişim
            "signal_confidence": 0.7   # %70 güven
        }
        
        # Performance tracking
        self.performance_metrics = {
            "data_latency": deque(maxlen=100),
            "signal_accuracy": deque(maxlen=100),
            "connection_uptime": 0,
            "total_signals": 0
        }
    
    async def start_finnhub_stream(self, symbols: List[str]) -> Dict:
        """Finnhub WebSocket stream başlat"""
        try:
            logger.info(f"🚀 Finnhub stream başlatılıyor: {symbols}")
            
            # WebSocket connection
            uri = f"{self.data_sources['finnhub']['base_url']}?token={self.data_sources['finnhub']['api_key']}"
            
            async with websockets.connect(uri) as websocket:
                # Subscribe to symbols
                for symbol in symbols:
                    subscribe_message = {
                        "type": "subscribe",
                        "symbol": symbol
                    }
                    await websocket.send(json.dumps(subscribe_message))
                
                # Listen for messages
                while True:
                    try:
                        message = await websocket.recv()
                        data = json.loads(message)
                        
                        if data.get("type") == "trade":
                            await self._process_trade_data(data)
                        elif data.get("type") == "quote":
                            await self._process_quote_data(data)
                        
                    except websockets.exceptions.ConnectionClosed:
                        logger.error("❌ WebSocket bağlantısı kapandı")
                        break
                    except Exception as e:
                        logger.error(f"❌ Stream hatası: {e}")
                        continue
            
        except Exception as e:
            logger.error(f"❌ Finnhub stream hatası: {e}")
            return {"error": str(e)}
    
    async def start_yahoo_stream(self, symbols: List[str]) -> Dict:
        """Yahoo Finance real-time stream (polling)"""
        try:
            logger.info(f"🚀 Yahoo Finance stream başlatılıyor: {symbols}")
            
            while True:
                try:
                    # Real-time data fetch
                    for symbol in symbols:
                        data = await self._fetch_yahoo_data(symbol)
                        if data:
                            await self._process_yahoo_data(symbol, data)
                    
                    # Wait for next update
                    await asyncio.sleep(self.stream_config["update_interval"])
                    
                except Exception as e:
                    logger.error(f"❌ Yahoo stream hatası: {e}")
                    await asyncio.sleep(5)  # Wait before retry
            
        except Exception as e:
            logger.error(f"❌ Yahoo stream hatası: {e}")
            return {"error": str(e)}
    
    async def _fetch_yahoo_data(self, symbol: str) -> Optional[Dict]:
        """Yahoo Finance'dan veri çek"""
        try:
            # Real-time quote
            url = f"{self.data_sources['yahoo']['base_url']}/v8/finance/chart/{symbol}"
            params = {
                "interval": "1m",
                "range": "1d",
                "includePrePost": "false"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_yahoo_data(data, symbol)
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Yahoo veri çekme hatası: {e}")
            return None
    
    def _parse_yahoo_data(self, data: Dict, symbol: str) -> Dict:
        """Yahoo veri parse et"""
        try:
            chart = data.get("chart", {})
            result = chart.get("result", [{}])[0]
            
            # Quote data
            quote = result.get("quote", [{}])[0]
            timestamp = result.get("timestamp", [])
            
            if not timestamp or not quote:
                return {}
            
            # Latest data
            latest_idx = -1
            latest_data = {
                "symbol": symbol,
                "timestamp": datetime.fromtimestamp(timestamp[latest_idx]),
                "open": quote.get("open", [0])[latest_idx],
                "high": quote.get("high", [0])[latest_idx],
                "low": quote.get("low", [0])[latest_idx],
                "close": quote.get("close", [0])[latest_idx],
                "volume": quote.get("volume", [0])[latest_idx]
            }
            
            return latest_data
            
        except Exception as e:
            logger.error(f"❌ Yahoo veri parse hatası: {e}")
            return {}
    
    async def _process_trade_data(self, data: Dict) -> None:
        """Trade verisi işle"""
        try:
            symbol = data.get("data", [{}])[0].get("s", "")
            price = data.get("data", [{}])[0].get("p", 0)
            volume = data.get("data", [{}])[0].get("v", 0)
            timestamp = data.get("data", [{}])[0].get("t", 0)
            
            # Cache data
            await self._cache_trade_data(symbol, price, volume, timestamp)
            
            # Check for alerts
            await self._check_price_alerts(symbol, price)
            
            # Generate live signals
            await self._generate_live_signals(symbol, price)
            
        except Exception as e:
            logger.error(f"❌ Trade veri işleme hatası: {e}")
    
    async def _process_quote_data(self, data: Dict) -> None:
        """Quote verisi işle"""
        try:
            symbol = data.get("data", {}).get("s", "")
            bid = data.get("data", {}).get("b", 0)
            ask = data.get("data", {}).get("a", 0)
            last = data.get("data", {}).get("c", 0)
            timestamp = data.get("data", {}).get("t", 0)
            
            # Cache quote data
            await self._cache_quote_data(symbol, bid, ask, last, timestamp)
            
            # Calculate spread
            spread = ask - bid if ask > 0 and bid > 0 else 0
            spread_pct = (spread / last * 100) if last > 0 else 0
            
            # Check for unusual activity
            if spread_pct > 1.0:  # %1'den fazla spread
                await self._alert_unusual_activity(symbol, "high_spread", spread_pct)
            
        except Exception as e:
            logger.error(f"❌ Quote veri işleme hatası: {e}")
    
    async def _process_yahoo_data(self, symbol: str, data: Dict) -> None:
        """Yahoo verisi işle"""
        try:
            if not data:
                return
            
            # Cache data
            await self._cache_yahoo_data(symbol, data)
            
            # Check for alerts
            await self._check_price_alerts(symbol, data.get("close", 0))
            
            # Generate live signals
            await self._generate_live_signals(symbol, data.get("close", 0))
            
        except Exception as e:
            logger.error(f"❌ Yahoo veri işleme hatası: {e}")
    
    async def _cache_trade_data(self, symbol: str, price: float, volume: int, timestamp: int) -> None:
        """Trade verisini cache'e kaydet"""
        try:
            if not self.redis_client:
                return
            
            # Data structure
            trade_data = {
                "symbol": symbol,
                "price": price,
                "volume": volume,
                "timestamp": timestamp,
                "datetime": datetime.fromtimestamp(timestamp/1000).isoformat()
            }
            
            # Cache key
            cache_key = f"trade:{symbol}:{timestamp}"
            
            # Save to Redis
            self.redis_client.setex(
                cache_key,
                3600,  # 1 saat TTL
                json.dumps(trade_data)
            )
            
            # Update symbol cache
            symbol_key = f"symbol:{symbol}:trades"
            self.redis_client.lpush(symbol_key, cache_key)
            self.redis_client.ltrim(symbol_key, 0, self.stream_config["max_cache_size"] - 1)
            
        except Exception as e:
            logger.error(f"❌ Trade cache hatası: {e}")
    
    async def _cache_quote_data(self, symbol: str, bid: float, ask: float, last: float, timestamp: int) -> None:
        """Quote verisini cache'e kaydet"""
        try:
            if not self.redis_client:
                return
            
            # Data structure
            quote_data = {
                "symbol": symbol,
                "bid": bid,
                "ask": ask,
                "last": last,
                "spread": ask - bid,
                "timestamp": timestamp,
                "datetime": datetime.fromtimestamp(timestamp/1000).isoformat()
            }
            
            # Cache key
            cache_key = f"quote:{symbol}:{timestamp}"
            
            # Save to Redis
            self.redis_client.setex(
                cache_key,
                3600,  # 1 saat TTL
                json.dumps(quote_data)
            )
            
            # Update symbol cache
            symbol_key = f"symbol:{symbol}:quotes"
            self.redis_client.lpush(symbol_key, cache_key)
            self.redis_client.ltrim(symbol_key, 0, self.stream_config["max_cache_size"] - 1)
            
        except Exception as e:
            logger.error(f"❌ Quote cache hatası: {e}")
    
    async def _cache_yahoo_data(self, symbol: str, data: Dict) -> None:
        """Yahoo verisini cache'e kaydet"""
        try:
            if not self.redis_client:
                return
            
            # Data structure
            yahoo_data = {
                "symbol": symbol,
                "open": data.get("open", 0),
                "high": data.get("high", 0),
                "low": data.get("low", 0),
                "close": data.get("close", 0),
                "volume": data.get("volume", 0),
                "timestamp": data.get("timestamp", datetime.now().isoformat()),
                "source": "yahoo"
            }
            
            # Cache key
            cache_key = f"yahoo:{symbol}:{int(time.time())}"
            
            # Save to Redis
            self.redis_client.setex(
                cache_key,
                3600,  # 1 saat TTL
                json.dumps(yahoo_data)
            )
            
            # Update symbol cache
            symbol_key = f"symbol:{symbol}:yahoo"
            self.redis_client.lpush(symbol_key, cache_key)
            self.redis_client.ltrim(symbol_key, 0, self.stream_config["max_cache_size"] - 1)
            
        except Exception as e:
            logger.error(f"❌ Yahoo cache hatası: {e}")
    
    async def _check_price_alerts(self, symbol: str, current_price: float) -> None:
        """Fiyat alarmlarını kontrol et"""
        try:
            # Get previous price from cache
            if not self.redis_client:
                return
            
            symbol_key = f"symbol:{symbol}:yahoo"
            recent_data = self.redis_client.lrange(symbol_key, 0, 1)
            
            if not recent_data:
                return
            
            # Parse previous data
            try:
                prev_data = json.loads(recent_data[0])
                prev_price = prev_data.get("close", current_price)
            except:
                prev_price = current_price
            
            # Calculate price change
            if prev_price > 0:
                price_change = (current_price - prev_price) / prev_price
                price_change_pct = price_change * 100
                
                # Check threshold
                if abs(price_change_pct) > self.stream_config["alert_threshold"]:
                    await self._send_price_alert(symbol, current_price, prev_price, price_change_pct)
            
        except Exception as e:
            logger.error(f"❌ Fiyat alarm kontrolü hatası: {e}")
    
    async def _send_price_alert(self, symbol: str, current_price: float, prev_price: float, change_pct: float) -> None:
        """Fiyat alarmı gönder"""
        try:
            alert_data = {
                "type": "price_alert",
                "symbol": symbol,
                "current_price": current_price,
                "previous_price": prev_price,
                "change_percent": change_pct,
                "direction": "up" if change_pct > 0 else "down",
                "timestamp": datetime.now().isoformat(),
                "severity": "high" if abs(change_pct) > 5 else "medium"
            }
            
            # Send to subscribers
            await self._notify_subscribers(alert_data)
            
            # Log alert
            logger.info(f"🚨 Fiyat Alarmı: {symbol} {change_pct:+.2f}% ({prev_price:.2f} → {current_price:.2f})")
            
        except Exception as e:
            logger.error(f"❌ Fiyat alarmı gönderme hatası: {e}")
    
    async def _generate_live_signals(self, symbol: str, current_price: float) -> None:
        """Canlı sinyal üret"""
        try:
            # Get recent price data
            if not self.redis_client:
                return
            
            symbol_key = f"symbol:{symbol}:yahoo"
            recent_data = self.redis_client.lrange(symbol_key, 0, 20)  # Son 20 veri
            
            if len(recent_data) < 10:
                return
            
            # Parse data
            prices = []
            volumes = []
            for data_str in recent_data:
                try:
                    data = json.loads(data_str)
                    prices.append(data.get("close", 0))
                    volumes.append(data.get("volume", 0))
                except:
                    continue
            
            if len(prices) < 10:
                return
            
            # Calculate technical indicators
            prices = np.array(prices)
            volumes = np.array(volumes)
            
            # Simple moving averages
            sma_5 = np.mean(prices[-5:])
            sma_10 = np.mean(prices[-10:])
            
            # RSI (simplified)
            price_changes = np.diff(prices)
            gains = np.where(price_changes > 0, price_changes, 0)
            losses = np.where(price_changes < 0, -price_changes, 0)
            
            avg_gain = np.mean(gains[-14:])
            avg_loss = np.mean(losses[-14:])
            
            if avg_loss > 0:
                rs = avg_gain / avg_loss
                rsi = 100 - (100 / (1 + rs))
            else:
                rsi = 100
            
            # Volume analysis
            avg_volume = np.mean(volumes[-10:])
            current_volume = volumes[-1]
            volume_ratio = current_volume / avg_volume if avg_volume > 0 else 1
            
            # Generate signal
            signal = self._calculate_live_signal(
                current_price, sma_5, sma_10, rsi, volume_ratio
            )
            
            if signal["strength"] > self.stream_config["signal_confidence"]:
                await self._send_live_signal(symbol, signal)
            
        except Exception as e:
            logger.error(f"❌ Canlı sinyal üretme hatası: {e}")
    
    def _calculate_live_signal(self, price: float, sma_5: float, sma_10: float, rsi: float, volume_ratio: float) -> Dict:
        """Canlı sinyal hesapla"""
        try:
            signal_strength = 0.0
            signal_type = "NEUTRAL"
            reasons = []
            
            # Trend analysis
            if sma_5 > sma_10:
                signal_strength += 0.3
                reasons.append("SMA5 > SMA10 (uptrend)")
            else:
                signal_strength -= 0.3
                reasons.append("SMA5 < SMA10 (downtrend)")
            
            # RSI analysis
            if rsi < 30:
                signal_strength += 0.4
                reasons.append("RSI oversold (<30)")
            elif rsi > 70:
                signal_strength -= 0.4
                reasons.append("RSI overbought (>70)")
            elif 40 < rsi < 60:
                signal_strength += 0.1
                reasons.append("RSI neutral (40-60)")
            
            # Volume analysis
            if volume_ratio > 1.5:
                signal_strength += 0.2
                reasons.append("High volume (>1.5x avg)")
            elif volume_ratio < 0.5:
                signal_strength -= 0.1
                reasons.append("Low volume (<0.5x avg)")
            
            # Signal type
            if signal_strength > 0.3:
                signal_type = "BUY"
            elif signal_strength < -0.3:
                signal_type = "SELL"
            else:
                signal_type = "HOLD"
            
            return {
                "type": signal_type,
                "strength": abs(signal_strength),
                "score": signal_strength,
                "reasons": reasons,
                "indicators": {
                    "sma_5": sma_5,
                    "sma_10": sma_10,
                    "rsi": rsi,
                    "volume_ratio": volume_ratio
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Sinyal hesaplama hatası: {e}")
            return {"type": "NEUTRAL", "strength": 0, "score": 0, "reasons": [], "indicators": {}}
    
    async def _send_live_signal(self, symbol: str, signal: Dict) -> None:
        """Canlı sinyal gönder"""
        try:
            signal_data = {
                "type": "live_signal",
                "symbol": symbol,
                "signal": signal,
                "timestamp": datetime.now().isoformat()
            }
            
            # Send to subscribers
            await self._notify_subscribers(signal_data)
            
            # Log signal
            logger.info(f"📡 Canlı Sinyal: {symbol} {signal['type']} (Güç: {signal['strength']:.2f})")
            
            # Update performance metrics
            self.performance_metrics["total_signals"] += 1
            
        except Exception as e:
            logger.error(f"❌ Canlı sinyal gönderme hatası: {e}")
    
    async def _notify_subscribers(self, data: Dict) -> None:
        """Abonelere bildirim gönder"""
        try:
            # WebSocket subscribers
            for connection_id, websocket in self.websocket_connections.items():
                try:
                    await websocket.send(json.dumps(data))
                except:
                    # Remove dead connections
                    del self.websocket_connections[connection_id]
            
            # Alert subscribers
            for subscriber_id, callback in self.alert_subscribers.items():
                try:
                    await callback(data)
                except Exception as e:
                    logger.error(f"❌ Subscriber callback hatası: {e}")
            
        except Exception as e:
            logger.error(f"❌ Abone bildirimi hatası: {e}")
    
    async def _alert_unusual_activity(self, symbol: str, activity_type: str, value: float) -> None:
        """Olağandışı aktivite alarmı"""
        try:
            alert_data = {
                "type": "unusual_activity",
                "symbol": symbol,
                "activity_type": activity_type,
                "value": value,
                "timestamp": datetime.now().isoformat()
            }
            
            # Send to subscribers
            await self._notify_subscribers(alert_data)
            
            # Log alert
            logger.warning(f"⚠️ Olağandışı Aktivite: {symbol} {activity_type} = {value}")
            
        except Exception as e:
            logger.error(f"❌ Aktivite alarmı hatası: {e}")
    
    def add_websocket_connection(self, connection_id: str, websocket) -> None:
        """WebSocket bağlantısı ekle"""
        self.websocket_connections[connection_id] = websocket
        logger.info(f"✅ WebSocket bağlantısı eklendi: {connection_id}")
    
    def remove_websocket_connection(self, connection_id: str) -> None:
        """WebSocket bağlantısını kaldır"""
        if connection_id in self.websocket_connections:
            del self.websocket_connections[connection_id]
            logger.info(f"❌ WebSocket bağlantısı kaldırıldı: {connection_id}")
    
    def add_alert_subscriber(self, subscriber_id: str, callback) -> None:
        """Alarm abonesi ekle"""
        self.alert_subscribers[subscriber_id] = callback
        logger.info(f"✅ Alarm abonesi eklendi: {subscriber_id}")
    
    def remove_alert_subscriber(self, subscriber_id: str) -> None:
        """Alarm abonesini kaldır"""
        if subscriber_id in self.alert_subscribers:
            del self.alert_subscribers[subscriber_id]
            logger.info(f"❌ Alarm abonesi kaldırıldı: {subscriber_id}")
    
    def get_performance_metrics(self) -> Dict:
        """Performans metriklerini getir"""
        try:
            return {
                "data_latency": {
                    "current": np.mean(self.performance_metrics["data_latency"]) if self.performance_metrics["data_latency"] else 0,
                    "min": np.min(self.performance_metrics["data_latency"]) if self.performance_metrics["data_latency"] else 0,
                    "max": np.max(self.performance_metrics["data_latency"]) if self.performance_metrics["data_latency"] else 0
                },
                "signal_accuracy": {
                    "current": np.mean(self.performance_metrics["signal_accuracy"]) if self.performance_metrics["signal_accuracy"] else 0,
                    "min": np.min(self.performance_metrics["signal_accuracy"]) if self.performance_metrics["signal_accuracy"] else 0,
                    "max": np.max(self.performance_metrics["signal_accuracy"]) if self.performance_metrics["signal_accuracy"] else 0
                },
                "connection_uptime": self.performance_metrics["connection_uptime"],
                "total_signals": self.performance_metrics["total_signals"],
                "active_connections": len(self.websocket_connections),
                "active_subscribers": len(self.alert_subscribers)
            }
        except Exception as e:
            logger.error(f"❌ Performans metrikleri hatası: {e}")
            return {}

# Test fonksiyonu
if __name__ == "__main__":
    streaming = RealTimeStreaming()
    
    # Test
    logger.info("✅ Real-Time Streaming modülü hazır!")
    logger.info(f"📊 Veri kaynakları: {list(streaming.data_sources.keys())}")
    logger.info(f"🔧 Stream konfigürasyonu: {streaming.stream_config}")
    
    # Performance metrics
    metrics = streaming.get_performance_metrics()
    logger.info(f"📈 Performans metrikleri: {metrics}")
