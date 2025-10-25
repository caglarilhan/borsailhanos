"""
🚀 BIST AI Smart Trader - WebSocket Realtime Server
==================================================

Gerçek zamanlı fiyat akışı, sinyal güncellemesi ve bildirim sistemi.
Socket.IO ile anlık veri akışı sağlar.

Özellikler:
- Anlık fiyat güncellemeleri
- AI sinyal değişimleri
- Smart notifications
- JWT authentication
- Rate limiting
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional
import socketio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from backend.services.auth_service import AuthService
from backend.services.rate_limiter import RateLimiter

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Socket.IO server instance
sio = socketio.AsyncServer(
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True
)

# FastAPI app for HTTP endpoints
app = FastAPI(title="BIST AI Realtime Server", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Services
auth_service = AuthService()
rate_limiter = RateLimiter()

# In-memory storage for active connections and data
active_connections: Dict[str, Dict] = {}
price_data: Dict[str, Dict] = {}
signal_data: Dict[str, Dict] = {}

class RealtimeDataManager:
    """Gerçek zamanlı veri yöneticisi"""
    
    def __init__(self):
        self.subscribers: Dict[str, List[str]] = {}
        self.last_prices: Dict[str, float] = {}
        self.last_signals: Dict[str, Dict] = {}
    
    async def broadcast_price_update(self, symbol: str, price_data: Dict):
        """Fiyat güncellemesini tüm abonelere gönder"""
        try:
            # Fiyat değişikliği kontrolü
            if symbol in self.last_prices:
                price_change = price_data.get('price', 0) - self.last_prices[symbol]
                price_change_pct = (price_change / self.last_prices[symbol]) * 100
                price_data['change'] = price_change
                price_data['change_pct'] = price_change_pct
            
            self.last_prices[symbol] = price_data.get('price', 0)
            
            # Abonelere gönder
            if symbol in self.subscribers:
                for session_id in self.subscribers[symbol]:
                    await sio.emit('price_update', {
                        'symbol': symbol,
                        'data': price_data,
                        'timestamp': datetime.now().isoformat()
                    }, room=session_id)
            
            logger.info(f"📈 Price update broadcasted for {symbol}: {price_data}")
            
        except Exception as e:
            logger.error(f"❌ Price broadcast error for {symbol}: {e}")
    
    async def broadcast_signal_update(self, symbol: str, signal_data: Dict):
        """Sinyal güncellemesini tüm abonelere gönder"""
        try:
            # Sinyal değişikliği kontrolü
            signal_changed = False
            if symbol in self.last_signals:
                old_signal = self.last_signals[symbol]
                new_signal = signal_data.get('signal', 'HOLD')
                if old_signal.get('signal') != new_signal:
                    signal_changed = True
            
            self.last_signals[symbol] = signal_data
            
            # Abonelere gönder
            if symbol in self.subscribers:
                for session_id in self.subscribers[symbol]:
                    await sio.emit('signal_update', {
                        'symbol': symbol,
                        'data': signal_data,
                        'changed': signal_changed,
                        'timestamp': datetime.now().isoformat()
                    }, room=session_id)
            
            # Eğer sinyal değiştiyse notification gönder
            if signal_changed:
                await self.send_smart_notification(symbol, signal_data)
            
            logger.info(f"🔔 Signal update broadcasted for {symbol}: {signal_data}")
            
        except Exception as e:
            logger.error(f"❌ Signal broadcast error for {symbol}: {e}")
    
    async def send_smart_notification(self, symbol: str, signal_data: Dict):
        """Smart notification gönder"""
        try:
            signal = signal_data.get('signal', 'HOLD')
            confidence = signal_data.get('confidence', 0)
            
            notification = {
                'type': 'signal_change',
                'symbol': symbol,
                'signal': signal,
                'confidence': confidence,
                'message': f"🚨 {symbol} için yeni sinyal: {signal} (%{confidence:.1f} güven)",
                'timestamp': datetime.now().isoformat(),
                'priority': 'high' if signal in ['BUY', 'SELL'] else 'medium'
            }
            
            # Tüm aktif bağlantılara gönder
            await sio.emit('smart_notification', notification)
            
            logger.info(f"📱 Smart notification sent: {notification['message']}")
            
        except Exception as e:
            logger.error(f"❌ Smart notification error: {e}")

# Global data manager
data_manager = RealtimeDataManager()

# Socket.IO event handlers
@sio.event
async def connect(sid, environ, auth=None):
    """Yeni bağlantı kurulduğunda"""
    try:
        # Rate limiting kontrolü
        client_ip = environ.get('REMOTE_ADDR', 'unknown')
        if not rate_limiter.is_allowed(client_ip):
            await sio.disconnect(sid)
            return False
        
        # JWT token kontrolü (opsiyonel)
        if auth and 'token' in auth:
            try:
                user_data = auth_service.verify_token(auth['token'])
                active_connections[sid] = {
                    'user_id': user_data.get('user_id'),
                    'ip': client_ip,
                    'connected_at': datetime.now(),
                    'subscriptions': []
                }
            except Exception as e:
                logger.warning(f"⚠️ Invalid token for {sid}: {e}")
                await sio.disconnect(sid)
                return False
        else:
            # Anonymous connection
            active_connections[sid] = {
                'user_id': None,
                'ip': client_ip,
                'connected_at': datetime.now(),
                'subscriptions': []
            }
        
        logger.info(f"✅ Client connected: {sid} from {client_ip}")
        await sio.emit('connection_status', {
            'status': 'connected',
            'sid': sid,
            'timestamp': datetime.now().isoformat()
        }, room=sid)
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Connection error for {sid}: {e}")
        await sio.disconnect(sid)
        return False

@sio.event
async def disconnect(sid):
    """Bağlantı kesildiğinde"""
    try:
        if sid in active_connections:
            # Abonelikleri temizle
            subscriptions = active_connections[sid].get('subscriptions', [])
            for symbol in subscriptions:
                if symbol in data_manager.subscribers:
                    data_manager.subscribers[symbol].remove(sid)
            
            del active_connections[sid]
        
        logger.info(f"❌ Client disconnected: {sid}")
        
    except Exception as e:
        logger.error(f"❌ Disconnect error for {sid}: {e}")

@sio.event
async def subscribe_symbol(sid, data):
    """Hisse sembolüne abone ol"""
    try:
        symbol = data.get('symbol', '').upper()
        if not symbol:
            await sio.emit('error', {'message': 'Symbol is required'}, room=sid)
            return
        
        # Abonelik ekle
        if symbol not in data_manager.subscribers:
            data_manager.subscribers[symbol] = []
        
        if sid not in data_manager.subscribers[symbol]:
            data_manager.subscribers[symbol].append(sid)
        
        # Kullanıcı aboneliklerini güncelle
        if sid in active_connections:
            active_connections[sid]['subscriptions'].append(symbol)
        
        logger.info(f"📡 {sid} subscribed to {symbol}")
        
        await sio.emit('subscription_confirmed', {
            'symbol': symbol,
            'status': 'subscribed',
            'timestamp': datetime.now().isoformat()
        }, room=sid)
        
    except Exception as e:
        logger.error(f"❌ Subscription error: {e}")
        await sio.emit('error', {'message': 'Subscription failed'}, room=sid)

@sio.event
async def unsubscribe_symbol(sid, data):
    """Hisse sembolünden abonelikten çık"""
    try:
        symbol = data.get('symbol', '').upper()
        if not symbol:
            await sio.emit('error', {'message': 'Symbol is required'}, room=sid)
            return
        
        # Abonelikten çıkar
        if symbol in data_manager.subscribers and sid in data_manager.subscribers[symbol]:
            data_manager.subscribers[symbol].remove(sid)
        
        # Kullanıcı aboneliklerini güncelle
        if sid in active_connections:
            subscriptions = active_connections[sid].get('subscriptions', [])
            if symbol in subscriptions:
                subscriptions.remove(symbol)
        
        logger.info(f"📡 {sid} unsubscribed from {symbol}")
        
        await sio.emit('unsubscription_confirmed', {
            'symbol': symbol,
            'status': 'unsubscribed',
            'timestamp': datetime.now().isoformat()
        }, room=sid)
        
    except Exception as e:
        logger.error(f"❌ Unsubscription error: {e}")
        await sio.emit('error', {'message': 'Unsubscription failed'}, room=sid)

@sio.event
async def get_active_symbols(sid, data=None):
    """Aktif sembolleri getir"""
    try:
        symbols = list(data_manager.subscribers.keys())
        await sio.emit('active_symbols', {
            'symbols': symbols,
            'count': len(symbols),
            'timestamp': datetime.now().isoformat()
        }, room=sid)
        
    except Exception as e:
        logger.error(f"❌ Get active symbols error: {e}")
        await sio.emit('error', {'message': 'Failed to get active symbols'}, room=sid)

# HTTP endpoints
@app.get("/api/realtime/status")
async def get_realtime_status():
    """Realtime server durumu"""
    return {
        "status": "active",
        "active_connections": len(active_connections),
        "subscribed_symbols": len(data_manager.subscribers),
        "uptime": datetime.now().isoformat(),
        "features": [
            "real_time_prices",
            "signal_updates", 
            "smart_notifications",
            "jwt_auth",
            "rate_limiting"
        ]
    }

@app.post("/api/realtime/broadcast/price")
async def broadcast_price_update(symbol: str, price_data: dict):
    """Fiyat güncellemesi yayınla (internal API)"""
    try:
        await data_manager.broadcast_price_update(symbol.upper(), price_data)
        return {"status": "success", "message": f"Price update broadcasted for {symbol}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/realtime/broadcast/signal")
async def broadcast_signal_update(symbol: str, signal_data: dict):
    """Sinyal güncellemesi yayınla (internal API)"""
    try:
        await data_manager.broadcast_signal_update(symbol.upper(), signal_data)
        return {"status": "success", "message": f"Signal update broadcasted for {symbol}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/realtime/connections")
async def get_connections():
    """Aktif bağlantıları listele"""
    return {
        "total_connections": len(active_connections),
        "connections": [
            {
                "sid": sid,
                "user_id": conn.get('user_id'),
                "ip": conn.get('ip'),
                "connected_at": conn.get('connected_at').isoformat() if conn.get('connected_at') else None,
                "subscriptions": conn.get('subscriptions', [])
            }
            for sid, conn in active_connections.items()
        ]
    }

# Socket.IO app integration
socket_app = socketio.ASGIApp(sio, app)

if __name__ == "__main__":
    logger.info("🚀 Starting BIST AI Realtime Server...")
    uvicorn.run(
        socket_app,
        host="0.0.0.0",
        port=int(os.getenv("REALTIME_PORT", 8002)),
        log_level="info"
    )
