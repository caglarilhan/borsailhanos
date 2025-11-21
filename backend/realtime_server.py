#!/usr/bin/env python3
"""
BIST AI Smart Trader - Realtime WebSocket Server
Stable connection with auto-reconnect and error handling
"""

import asyncio
import websockets
import json
import logging
import signal
import sys
from datetime import datetime
from typing import Set, Dict, Any
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import threading
import time

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/realtime_server.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class RealtimeServer:
    def __init__(self):
        self.app = FastAPI(title="BIST AI Realtime Server")
        self.connected_clients: Set[WebSocket] = set()
        self.data_cache: Dict[str, Any] = {}
        self.is_running = False
        
        # CORS middleware
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        # WebSocket endpoint
        self.app.websocket("/ws")(self.websocket_endpoint)
        
        # Health check endpoint
        self.app.get("/api/health")(self.health_check)
        
        # Data endpoints
        self.app.get("/api/signals")(self.get_signals)
        self.app.get("/api/prices")(self.get_prices)
        
        # Lifecycle events
        @self.app.on_event("startup")
        async def startup_event():
            self.is_running = True
            self.start_time = time.time()
            asyncio.create_task(self.start_data_simulation())
            logger.info("🚀 Realtime Server startup tasks scheduled")

        @self.app.on_event("shutdown")
        async def shutdown_event():
            self.is_running = False
            logger.info("🛑 Realtime Server shutdown complete")
        
        logger.info("🚀 Realtime Server initialized")

    async def websocket_endpoint(self, websocket: WebSocket):
        """Handle WebSocket connections with auto-reconnect"""
        await websocket.accept()
        self.connected_clients.add(websocket)
        client_id = id(websocket)
        
        logger.info(f"🔗 Client {client_id} connected. Total clients: {len(self.connected_clients)}")
        
        try:
            # Send welcome message
            await websocket.send_text(json.dumps({
                "type": "connection",
                "status": "connected",
                "client_id": client_id,
                "timestamp": datetime.now().isoformat()
            }))
            
            # Keep connection alive
            while True:
                try:
                    # Wait for client message (ping/pong)
                    message = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                    data = json.loads(message)
                    
                    if data.get("type") == "ping":
                        await websocket.send_text(json.dumps({
                            "type": "pong",
                            "timestamp": datetime.now().isoformat()
                        }))
                    
                except asyncio.TimeoutError:
                    # Send heartbeat
                    await websocket.send_text(json.dumps({
                        "type": "heartbeat",
                        "timestamp": datetime.now().isoformat()
                    }))
                    
        except WebSocketDisconnect:
            logger.info(f"🔌 Client {client_id} disconnected")
        except Exception as e:
            logger.error(f"❌ WebSocket error for client {client_id}: {e}")
        finally:
            self.connected_clients.discard(websocket)
            logger.info(f"📊 Total clients: {len(self.connected_clients)}")

    async def broadcast_to_clients(self, message: Dict[str, Any]):
        """Broadcast message to all connected clients"""
        if not self.connected_clients:
            return
            
        disconnected_clients = set()
        
        for client in self.connected_clients:
            try:
                await client.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"❌ Failed to send to client {id(client)}: {e}")
                disconnected_clients.add(client)
        
        # Remove disconnected clients
        for client in disconnected_clients:
            self.connected_clients.discard(client)

    async def health_check(self):
        """Health check endpoint"""
        return {
            "status": "ok",
            "timestamp": datetime.now().isoformat(),
            "connected_clients": len(self.connected_clients),
            "uptime": time.time() - self.start_time if hasattr(self, 'start_time') else 0
        }

    async def get_signals(self):
        """Get current trading signals"""
        # Mock data for now - will be replaced with real AI signals
        signals = [
            {
                "symbol": "THYAO",
                "signal": "BUY",
                "confidence": 0.87,
                "price": 245.50,
                "change": 2.3,
                "timestamp": datetime.now().isoformat(),
                "xaiExplanation": "EMA Cross + RSI Oversold",
                "shapValues": {"Technical": 0.4, "Fundamental": 0.3, "Sentiment": 0.2, "Macro": 0.1},
                "confluenceScore": 0.87,
                "marketRegime": "Bullish",
                "sentimentScore": 0.7,
                "expectedReturn": 14.5,
                "stopLoss": 235.0,
                "takeProfit": 260.0
            },
            {
                "symbol": "ASELS",
                "signal": "SELL",
                "confidence": 0.74,
                "price": 48.20,
                "change": -1.8,
                "timestamp": datetime.now().isoformat(),
                "xaiExplanation": "Resistance Break + Volume Spike",
                "shapValues": {"Technical": 0.5, "Fundamental": 0.2, "Sentiment": 0.2, "Macro": 0.1},
                "confluenceScore": 0.74,
                "marketRegime": "Bearish",
                "sentimentScore": 0.4,
                "expectedReturn": -6.2,
                "stopLoss": 52.0,
                "takeProfit": 42.0
            }
        ]
        
        # Broadcast to WebSocket clients
        await self.broadcast_to_clients({
            "type": "signals",
            "signals": signals,
            "timestamp": datetime.now().isoformat()
        })
        
        return signals

    async def get_prices(self):
        """Get current market prices"""
        prices = {
            "THYAO": {"price": 245.50, "change": 2.3, "volume": 1250000},
            "ASELS": {"price": 48.20, "change": -1.8, "volume": 890000},
            "TUPRS": {"price": 180.30, "change": 3.1, "volume": 2100000},
            "SISE": {"price": 95.40, "change": 1.2, "volume": 750000},
            "EREGL": {"price": 67.80, "change": -0.5, "volume": 980000}
        }
        
        # Broadcast to WebSocket clients
        await self.broadcast_to_clients({
            "type": "prices",
            "prices": prices,
            "timestamp": datetime.now().isoformat()
        })
        
        return prices

    async def start_data_simulation(self):
        """Simulate real-time data updates"""
        while self.is_running:
            try:
                # Simulate price updates every 5 seconds
                await asyncio.sleep(5)
                
                # Generate random price changes
                import random
                symbols = ["THYAO", "ASELS", "TUPRS", "SISE", "EREGL"]
                
                for symbol in symbols:
                    change = random.uniform(-2.0, 2.0)
                    price = self.data_cache.get(symbol, {}).get("price", 100.0)
                    new_price = price * (1 + change / 100)
                    
                    self.data_cache[symbol] = {
                        "price": new_price,
                        "change": change,
                        "volume": random.randint(500000, 2000000),
                        "timestamp": datetime.now().isoformat()
                    }
                
                # Broadcast price updates
                await self.broadcast_to_clients({
                    "type": "price_update",
                    "prices": self.data_cache,
                    "timestamp": datetime.now().isoformat()
                })
                
            except Exception as e:
                logger.error(f"❌ Data simulation error: {e}")

    def start(self):
        """Start the realtime server"""
        # flag is managed by lifecycle hooks, still ensure defaults when standalone run
        if not hasattr(self, "start_time"):
            self.is_running = True
            self.start_time = time.time()
        
        logger.info("🚀 Starting Realtime Server on port 8081")
        
        # Run the server
        uvicorn.run(
            self.app,
            host="0.0.0.0",
            port=8081,
            log_level="info",
            access_log=True
        )

    def stop(self):
        """Stop the realtime server"""
        self.is_running = False
        logger.info("🛑 Realtime Server stopped")

# Global server instance
server = RealtimeServer()

def signal_handler(signum, frame):
    """Handle shutdown signals"""
    logger.info("🛑 Received shutdown signal")
    server.stop()
    sys.exit(0)

# Register signal handlers
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

if __name__ == "__main__":
    try:
        server.start()
    except KeyboardInterrupt:
        logger.info("🛑 Server stopped by user")
    except Exception as e:
        logger.error(f"❌ Server error: {e}")
        sys.exit(1)