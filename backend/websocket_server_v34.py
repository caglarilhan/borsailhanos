#!/usr/bin/env python3
"""
BIST AI Smart Trader v3.4 Fix Edition - WebSocket Server
Real-time data streaming with auto-reconnect and ping/pong
"""

import asyncio
import json
import time
import random
from datetime import datetime
from typing import Dict, List, Set
import websockets
from websockets.server import WebSocketServerProtocol
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class RealtimeDataManager:
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
            "connection_count": 0
        }
        self.is_running = False

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
        except websockets.exceptions.ConnectionClosed:
            await self.unregister(websocket)

    async def broadcast(self, message: Dict):
        """Broadcast a message to all connected WebSockets"""
        if not self.connections:
            return

        # Create a copy of connections to avoid modification during iteration
        connections_copy = self.connections.copy()
        
        for websocket in connections_copy:
            try:
                await websocket.send(json.dumps(message))
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
            except websockets.exceptions.ConnectionClosed:
                await self.unregister(websocket)

    async def update_price(self, symbol: str, price: float):
        """Update price for a symbol and broadcast to subscribers"""
        self.latest_prices[symbol] = price
        message = {
            "type": "price_update",
            "symbol": symbol,
            "price": price,
            "timestamp": time.time()
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
        message = {
            "type": "performance_stats",
            "stats": self.performance_stats,
            "timestamp": time.time()
        }
        await self.broadcast(message)

    async def simulate_data_updates(self):
        """Simulate real-time data updates"""
        symbols = ["THYAO", "TUPRS", "ASELS", "GARAN", "ISCTR", "SAHOL", "KRDMD", "AKBNK"]
        
        while self.is_running:
            try:
                # Update prices
                for symbol in symbols:
                    # Simulate realistic price movements
                    base_price = {
                        "THYAO": 245.50,
                        "TUPRS": 180.30,
                        "ASELS": 48.20,
                        "GARAN": 12.45,
                        "ISCTR": 8.90,
                        "SAHOL": 15.60,
                        "KRDMD": 22.30,
                        "AKBNK": 9.75
                    }
                    
                    change = random.uniform(-0.02, 0.02)  # ±2% change
                    new_price = base_price[symbol] * (1 + change)
                    await self.update_price(symbol, round(new_price, 2))

                # Update signals occasionally
                if random.random() < 0.3:  # 30% chance
                    symbol = random.choice(symbols)
                    signal_types = ["BUY", "SELL", "HOLD"]
                    signal = random.choice(signal_types)
                    confidence = random.uniform(70, 95)
                    
                    signal_data = {
                        "symbol": symbol,
                        "signal": signal,
                        "confidence": round(confidence, 1),
                        "price": self.latest_prices.get(symbol, 0),
                        "change": round(random.uniform(-3, 3), 1),
                        "timestamp": datetime.now().isoformat(),
                        "note": f"AI Analysis: {signal} signal detected with {confidence:.1f}% confidence"
                    }
                    
                    await self.update_signal(symbol, signal_data)

                # Update performance stats
                await self.update_performance_stats({
                    "latency": round(random.uniform(50, 200), 2),
                    "memory_usage": round(random.uniform(500, 1500), 2),
                    "cpu_usage": round(random.uniform(20, 80), 2),
                    "inference_count": random.randint(1000, 5000),
                    "connection_count": len(self.connections)
                })

                # Add notifications occasionally
                if random.random() < 0.1:  # 10% chance
                    notifications = [
                        "Yeni AI sinyali tespit edildi",
                        "Piyasa volatilitesi arttı",
                        "Risk seviyesi güncellendi",
                        "Model performansı optimize edildi"
                    ]
                    await self.add_notification({
                        "title": random.choice(notifications),
                        "body": f"Detay: {datetime.now().strftime('%H:%M:%S')}",
                        "type": "info"
                    })

                await asyncio.sleep(2)  # Update every 2 seconds

            except Exception as e:
                logger.error(f"❌ Error in data simulation: {e}")
                await asyncio.sleep(5)

    def start(self):
        """Start the data simulation"""
        self.is_running = True
        logger.info("🚀 Starting real-time data simulation")

    def stop(self):
        """Stop the data simulation"""
        self.is_running = False
        logger.info("⏹️ Stopping real-time data simulation")

# Global data manager instance
data_manager = RealtimeDataManager()

async def handle_websocket(websocket: WebSocketServerProtocol, path: str):
    """Handle WebSocket connections"""
    await data_manager.register(websocket)
    
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                
                if data.get("type") == "ping":
                    # Respond to ping with pong
                    await data_manager.send_to_websocket(websocket, {"type": "pong", "timestamp": time.time()})
                
                elif data.get("type") == "subscribe":
                    symbol = data.get("symbol")
                    if symbol:
                        await data_manager.subscribe_symbol(websocket, symbol)
                
                elif data.get("type") == "unsubscribe":
                    symbol = data.get("symbol")
                    if symbol:
                        await data_manager.unsubscribe_symbol(websocket, symbol)
                
                elif data.get("type") == "get_active_symbols":
                    active_symbols = list(data_manager.symbol_subscribers.keys())
                    await data_manager.send_to_websocket(websocket, {
                        "type": "active_symbols",
                        "symbols": active_symbols,
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
        await data_manager.unregister(websocket)

async def main():
    """Main function to start the WebSocket server"""
    logger.info("🚀 Starting BIST AI Smart Trader v3.4 WebSocket Server")
    
    # Start data simulation
    data_manager.start()
    
    # Start WebSocket server
    server = await websockets.serve(
        handle_websocket,
        "localhost",
        8081,
        ping_interval=30,  # Send ping every 30 seconds
        ping_timeout=10,   # Wait 10 seconds for pong
        max_size=1024*1024,  # 1MB max message size
        compression=None
    )
    
    logger.info("🌐 WebSocket server running on ws://localhost:8081")
    
    # Start data simulation task
    simulation_task = asyncio.create_task(data_manager.simulate_data_updates())
    
    try:
        await server.wait_closed()
    except KeyboardInterrupt:
        logger.info("⏹️ Shutting down WebSocket server...")
        data_manager.stop()
        simulation_task.cancel()
        server.close()
        await server.wait_closed()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("👋 WebSocket server stopped")


