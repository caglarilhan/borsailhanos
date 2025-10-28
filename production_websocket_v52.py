#!/usr/bin/env python3
"""
BIST AI Smart Trader v5.2 Production-Ready Edition - WebSocket Server
Kurumsal seviye real-time data streaming with auto-reconnect
"""

import asyncio
import json
import time
import random
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Set
import websockets
from websockets.server import WebSocketServerProtocol

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ProductionRealtimeManager:
    def __init__(self):
        self.connections: Set[WebSocketServerProtocol] = set()
        self.symbol_subscribers: Dict[str, Set[WebSocketServerProtocol]] = {}
        self.latest_prices: Dict[str, float] = {}
        self.latest_signals: Dict[str, Dict] = {}
        self.notifications: List[Dict] = []
        self.performance_stats = {
            "latency": 0,
            "memory_usage": 0,
            "cpu_usage": 0,
            "inference_count": 0,
            "connection_count": 0,
            "messages_sent": 0,
            "uptime": time.time()
        }
        self.is_running = False
        self.symbols = ['THYAO', 'TUPRS', 'ASELS', 'GARAN', 'ISCTR', 'SAHOL', 'KRDMD', 'AKBNK']
        
        # Initialize base prices
        self.base_prices = {
            'THYAO': 245.50, 'TUPRS': 180.30, 'ASELS': 48.20,
            'GARAN': 12.45, 'ISCTR': 8.90, 'SAHOL': 15.60,
            'KRDMD': 22.30, 'AKBNK': 9.75
        }

    async def register(self, websocket: WebSocketServerProtocol):
        """Register a new WebSocket connection"""
        self.connections.add(websocket)
        self.performance_stats["connection_count"] = len(self.connections)
        logger.info(f"🔗 WebSocket connected: {websocket.remote_address}. Total connections: {len(self.connections)}")

    async def unregister(self, websocket: WebSocketServerProtocol):
        """Unregister a WebSocket connection"""
        self.connections.discard(websocket)
        
        # Remove from all symbol subscriptions
        for symbol in list(self.symbol_subscribers.keys()):
            self.symbol_subscribers[symbol].discard(websocket)
            if not self.symbol_subscribers[symbol]:
                del self.symbol_subscribers[symbol]
        
        self.performance_stats["connection_count"] = len(self.connections)
        logger.info(f"🔌 WebSocket disconnected: {websocket.remote_address}. Total connections: {len(self.connections)}")

    async def subscribe_symbol(self, websocket: WebSocketServerProtocol, symbol: str):
        """Subscribe to updates for a specific symbol"""
        if symbol not in self.symbol_subscribers:
            self.symbol_subscribers[symbol] = set()
        self.symbol_subscribers[symbol].add(websocket)
        logger.info(f"📊 WebSocket {websocket.remote_address} subscribed to {symbol}")

        # Send latest data for the subscribed symbol
        if symbol in self.latest_prices:
            await self.send_to_websocket(websocket, {
                "type": "price_update",
                "symbol": symbol,
                "price": self.latest_prices[symbol],
                "timestamp": time.time()
            })

        if symbol in self.latest_signals:
            await self.send_to_websocket(websocket, {
                "type": "signal_update",
                "symbol": symbol,
                "signal": self.latest_signals[symbol],
                "timestamp": time.time()
            })

    async def unsubscribe_symbol(self, websocket: WebSocketServerProtocol, symbol: str):
        """Unsubscribe from updates for a specific symbol"""
        if symbol in self.symbol_subscribers:
            self.symbol_subscribers[symbol].discard(websocket)
            if not self.symbol_subscribers[symbol]:
                del self.symbol_subscribers[symbol]
        logger.info(f"📊 WebSocket {websocket.remote_address} unsubscribed from {symbol}")

    async def send_to_websocket(self, websocket: WebSocketServerProtocol, message: Dict):
        """Send a message to a specific WebSocket"""
        try:
            await websocket.send(json.dumps(message))
            self.performance_stats["messages_sent"] += 1
        except websockets.exceptions.ConnectionClosed:
            await self.unregister(websocket)

    async def broadcast(self, message: Dict):
        """Broadcast a message to all connected WebSockets"""
        if not self.connections:
            return

        connections_copy = self.connections.copy()
        
        for websocket in connections_copy:
            try:
                await websocket.send(json.dumps(message))
                self.performance_stats["messages_sent"] += 1
            except websockets.exceptions.ConnectionClosed:
                await self.unregister(websocket)

    async def broadcast_to_symbol(self, symbol: str, message: Dict):
        """Broadcast a message to all WebSockets subscribed to a specific symbol"""
        if symbol not in self.symbol_subscribers:
            return

        connections_copy = self.symbol_subscribers[symbol].copy()
        
        for websocket in connections_copy:
            try:
                await websocket.send(json.dumps(message))
                self.performance_stats["messages_sent"] += 1
            except websockets.exceptions.ConnectionClosed:
                await self.unregister(websocket)

    async def update_price(self, symbol: str, price: float):
        """Update price for a symbol and broadcast to subscribers"""
        self.latest_prices[symbol] = price
        message = {
            "type": "price_update",
            "symbol": symbol,
            "price": price,
            "timestamp": time.time(),
            "change": round((price - self.base_prices.get(symbol, price)) / self.base_prices.get(symbol, price) * 100, 2)
        }
        await self.broadcast_to_symbol(symbol, message)

    async def update_signal(self, symbol: str, signal_data: Dict):
        """Update signal for a symbol and broadcast to subscribers"""
        self.latest_signals[symbol] = signal_data
        message = {
            "type": "signal_update",
            "symbol": symbol,
            "signal": signal_data,
            "timestamp": time.time()
        }
        await self.broadcast_to_symbol(symbol, message)

    async def add_notification(self, notification: Dict):
        """Add a notification and broadcast to all connections"""
        self.notifications.append(notification)
        message = {
            "type": "notification",
            "notification": notification,
            "timestamp": time.time()
        }
        await self.broadcast(message)

    async def update_performance_stats(self, stats: Dict):
        """Update performance statistics and broadcast to all connections"""
        self.performance_stats.update(stats)
        self.performance_stats["uptime"] = time.time() - self.performance_stats["uptime"]
        
        message = {
            "type": "performance_stats",
            "stats": self.performance_stats,
            "timestamp": time.time()
        }
        await self.broadcast(message)

    async def simulate_production_data(self):
        """Simulate realistic production data updates"""
        logger.info("🚀 Starting production data simulation...")
        
        while self.is_running:
            try:
                # Update prices every 2 seconds
                for symbol in self.symbols:
                    base_price = self.base_prices.get(symbol, 100.0)
                    
                    # Simulate realistic price movements with trend
                    trend = random.uniform(-0.001, 0.001)  # Small trend
                    volatility = random.uniform(-0.02, 0.02)  # 2% volatility
                    change = trend + volatility
                    
                    new_price = base_price * (1 + change)
                    await self.update_price(symbol, round(new_price, 2))
                    
                    # Update base price for next iteration
                    self.base_prices[symbol] = new_price

                # Update signals occasionally (30% chance every 10 seconds)
                if random.random() < 0.3:
                    symbol = random.choice(self.symbols)
                    
                    # Generate realistic signal based on price movement
                    current_price = self.latest_prices.get(symbol, self.base_prices[symbol])
                    price_change = (current_price - self.base_prices[symbol]) / self.base_prices[symbol] * 100
                    
                    if price_change > 1:
                        signal = "BUY"
                        confidence = random.uniform(75, 95)
                    elif price_change < -1:
                        signal = "SELL"
                        confidence = random.uniform(75, 95)
                    else:
                        signal = "HOLD"
                        confidence = random.uniform(60, 80)
                    
                    signal_data = {
                        "symbol": symbol,
                        "signal": signal,
                        "confidence": round(confidence, 1),
                        "price": current_price,
                        "change": round(price_change, 2),
                        "timestamp": datetime.now().isoformat(),
                        "analysis": f"AI Analysis: {signal} signal detected with {confidence:.1f}% confidence based on price movement",
                        "technical": {
                            "rsi": round(random.uniform(20, 80), 1),
                            "macd": round(random.uniform(-2, 2), 2),
                            "volume_ratio": round(random.uniform(0.5, 2.0), 2)
                        }
                    }
                    
                    await self.update_signal(symbol, signal_data)

                # Update performance stats
                await self.update_performance_stats({
                    "latency": round(random.uniform(30, 150), 2),
                    "memory_usage": round(random.uniform(400, 1200), 2),
                    "cpu_usage": round(random.uniform(15, 70), 2),
                    "inference_count": random.randint(1000, 5000),
                    "connection_count": len(self.connections)
                })

                # Add notifications occasionally (10% chance)
                if random.random() < 0.1:
                    notifications = [
                        "Yeni AI sinyali tespit edildi",
                        "Piyasa volatilitesi arttı",
                        "Risk seviyesi güncellendi",
                        "Model performansı optimize edildi",
                        "Sistem sağlık kontrolü tamamlandı",
                        "Gerçek zamanlı veri akışı aktif"
                    ]
                    
                    await self.add_notification({
                        "title": random.choice(notifications),
                        "body": f"Detay: {datetime.now().strftime('%H:%M:%S')}",
                        "type": "info",
                        "priority": random.choice(["low", "medium", "high"])
                    })

                await asyncio.sleep(2)  # Update every 2 seconds

            except Exception as e:
                logger.error(f"❌ Error in production data simulation: {e}")
                await asyncio.sleep(5)

    def start(self):
        """Start the production data simulation"""
        self.is_running = True
        logger.info("🚀 Starting production real-time data simulation")

    def stop(self):
        """Stop the production data simulation"""
        self.is_running = False
        logger.info("⏹️ Stopping production real-time data simulation")

# Global production data manager instance
production_manager = ProductionRealtimeManager()

async def handle_production_websocket(websocket, path=None):
    """Handle production WebSocket connections"""
    await production_manager.register(websocket)
    
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                
                if data.get("type") == "ping":
                    # Respond to ping with pong
                    await production_manager.send_to_websocket(websocket, {
                        "type": "pong", 
                        "timestamp": time.time(),
                        "server": "v5.2-production"
                    })
                
                elif data.get("type") == "subscribe":
                    symbol = data.get("symbol")
                    if symbol:
                        await production_manager.subscribe_symbol(websocket, symbol)
                
                elif data.get("type") == "unsubscribe":
                    symbol = data.get("symbol")
                    if symbol:
                        await production_manager.unsubscribe_symbol(websocket, symbol)
                
                elif data.get("type") == "get_active_symbols":
                    active_symbols = list(production_manager.symbol_subscribers.keys())
                    await production_manager.send_to_websocket(websocket, {
                        "type": "active_symbols",
                        "symbols": active_symbols,
                        "timestamp": time.time()
                    })
                
                elif data.get("type") == "get_status":
                    await production_manager.send_to_websocket(websocket, {
                        "type": "status",
                        "status": "ACTIVE",
                        "version": "v5.2-production",
                        "connections": len(production_manager.connections),
                        "uptime": time.time() - production_manager.performance_stats["uptime"],
                        "timestamp": time.time()
                    })
                
                else:
                    logger.warning(f"⚠️ Unknown message type: {data.get('type')}")
                    
            except json.JSONDecodeError:
                logger.error("❌ Invalid JSON received")
            except Exception as e:
                logger.error(f"❌ Error processing message: {e}")
                
    except websockets.exceptions.ConnectionClosed:
        pass
    except Exception as e:
        logger.error(f"❌ WebSocket error: {e}")
    finally:
        await production_manager.unregister(websocket)

async def main():
    """Main function to start the production WebSocket server"""
    logger.info("🚀 Starting BIST AI Smart Trader v5.2 Production WebSocket Server")
    
    # Start production data simulation
    production_manager.start()
    
    # Start WebSocket server
    server = await websockets.serve(
        handle_production_websocket,
        "localhost",
        8081,
        ping_interval=30,  # Send ping every 30 seconds
        ping_timeout=10,   # Wait 10 seconds for pong
        max_size=1024*1024,  # 1MB max message size
        compression=None
    )
    
    logger.info("🌐 Production WebSocket server running on ws://localhost:8081")
    
    # Start production data simulation task
    simulation_task = asyncio.create_task(production_manager.simulate_production_data())
    
    try:
        await server.wait_closed()
    except KeyboardInterrupt:
        logger.info("⏹️ Shutting down production WebSocket server...")
        production_manager.stop()
        simulation_task.cancel()
        server.close()
        await server.wait_closed()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("👋 Production WebSocket server stopped")


