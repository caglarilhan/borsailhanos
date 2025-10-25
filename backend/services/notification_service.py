#!/usr/bin/env python3
"""
BIST AI Smart Trader - Notification Service
Smart notification system with Web Push and real-time alerts
"""

import asyncio
import logging
import json
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import aiohttp
import base64
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import os

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic models
class NotificationCreate(BaseModel):
    title: str
    message: str
    type: str  # 'info', 'warning', 'error', 'success'
    category: str  # 'signal', 'price', 'system', 'news'
    data: Optional[Dict[str, Any]] = None
    user_id: Optional[str] = None
    symbol: Optional[str] = None
    priority: str = 'normal'  # 'low', 'normal', 'high', 'urgent'

class WebPushSubscription(BaseModel):
    endpoint: str
    keys: Dict[str, str]
    user_id: str

class NotificationService:
    def __init__(self, db_path: str = "bist_ai.db"):
        self.db_path = db_path
        self.init_database()
        
        # WebSocket connections
        self.active_connections: List[WebSocket] = []
        
        # Web Push configuration
        self.vapid_private_key = os.getenv('VAPID_PRIVATE_KEY', 'your-vapid-private-key')
        self.vapid_public_key = os.getenv('VAPID_PUBLIC_KEY', 'your-vapid-public-key')
        
        # Notification templates
        self.templates = {
            'signal': {
                'title': '🚨 AI Trading Signal',
                'template': '{symbol}: {signal} signal with {confidence}% confidence'
            },
            'price': {
                'title': '💰 Price Alert',
                'template': '{symbol} reached {price} ({change}%)'
            },
            'system': {
                'title': '⚙️ System Notification',
                'template': '{message}'
            },
            'news': {
                'title': '📰 Market News',
                'template': '{title}'
            }
        }
        
        logger.info("🔔 Notification Service initialized")

    def init_database(self):
        """Initialize notification database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create notifications table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    message TEXT NOT NULL,
                    type TEXT NOT NULL,
                    category TEXT NOT NULL,
                    priority TEXT DEFAULT 'normal',
                    symbol TEXT,
                    data TEXT, -- JSON data
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    sent_at TIMESTAMP,
                    delivery_status TEXT DEFAULT 'pending'
                )
            ''')
            
            # Create web_push_subscriptions table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS web_push_subscriptions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NOT NULL,
                    endpoint TEXT NOT NULL,
                    p256dh TEXT NOT NULL,
                    auth TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    is_active BOOLEAN DEFAULT TRUE
                )
            ''')
            
            # Create notification_preferences table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS notification_preferences (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NOT NULL,
                    category TEXT NOT NULL,
                    enabled BOOLEAN DEFAULT TRUE,
                    web_push BOOLEAN DEFAULT TRUE,
                    email BOOLEAN DEFAULT FALSE,
                    sms BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, category)
                )
            ''')
            
            # Create indexes
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_web_push_user_id ON web_push_subscriptions(user_id)')
            
            conn.commit()
            conn.close()
            
            logger.info("✅ Notification database initialized")
            
        except Exception as e:
            logger.error(f"❌ Database initialization failed: {e}")
            raise

    def get_db_connection(self):
        """Get database connection"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    async def create_notification(self, notification_data: NotificationCreate) -> Dict[str, Any]:
        """Create a new notification"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            # Insert notification
            cursor.execute('''
                INSERT INTO notifications 
                (user_id, title, message, type, category, priority, symbol, data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                notification_data.user_id or 'default_user',
                notification_data.title,
                notification_data.message,
                notification_data.type,
                notification_data.category,
                notification_data.priority,
                notification_data.symbol,
                json.dumps(notification_data.data) if notification_data.data else None
            ))
            
            notification_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            result = {
                'id': notification_id,
                'user_id': notification_data.user_id or 'default_user',
                'title': notification_data.title,
                'message': notification_data.message,
                'type': notification_data.type,
                'category': notification_data.category,
                'priority': notification_data.priority,
                'symbol': notification_data.symbol,
                'data': notification_data.data,
                'created_at': datetime.now().isoformat(),
                'is_read': False
            }
            
            logger.info(f"✅ Notification created: {notification_data.title}")
            
            # Send notification immediately
            await self.send_notification(result)
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Failed to create notification: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def send_notification(self, notification: Dict[str, Any]):
        """Send notification via multiple channels"""
        try:
            user_id = notification['user_id']
            
            # Send via WebSocket
            await self.send_websocket_notification(notification)
            
            # Send via Web Push
            await self.send_web_push_notification(user_id, notification)
            
            # Update delivery status
            await self.update_delivery_status(notification['id'], 'sent')
            
        except Exception as e:
            logger.error(f"❌ Failed to send notification: {e}")
            await self.update_delivery_status(notification['id'], 'failed')

    async def send_websocket_notification(self, notification: Dict[str, Any]):
        """Send notification via WebSocket"""
        try:
            message = {
                'type': 'notification',
                'data': notification,
                'timestamp': datetime.now().isoformat()
            }
            
            # Send to all active connections
            disconnected_clients = []
            for connection in self.active_connections:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"❌ WebSocket send failed: {e}")
                    disconnected_clients.append(connection)
            
            # Remove disconnected clients
            for client in disconnected_clients:
                self.active_connections.remove(client)
            
            logger.info(f"📡 WebSocket notification sent to {len(self.active_connections)} clients")
            
        except Exception as e:
            logger.error(f"❌ WebSocket notification failed: {e}")

    async def send_web_push_notification(self, user_id: str, notification: Dict[str, Any]):
        """Send notification via Web Push"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            # Get user's Web Push subscriptions
            cursor.execute('''
                SELECT endpoint, p256dh, auth 
                FROM web_push_subscriptions 
                WHERE user_id = ? AND is_active = TRUE
            ''', (user_id,))
            
            subscriptions = cursor.fetchall()
            conn.close()
            
            if not subscriptions:
                logger.info(f"No Web Push subscriptions found for user {user_id}")
                return
            
            # Prepare notification payload
            payload = {
                'title': notification['title'],
                'body': notification['message'],
                'icon': '/icons/notification-icon.png',
                'badge': '/icons/badge-icon.png',
                'data': notification.get('data', {}),
                'tag': f"{notification['category']}-{notification.get('symbol', 'general')}",
                'requireInteraction': notification['priority'] in ['high', 'urgent']
            }
            
            # Send to each subscription
            async with aiohttp.ClientSession() as session:
                for sub in subscriptions:
                    try:
                        # In a real implementation, you would use pywebpush here
                        # For now, we'll just log the attempt
                        logger.info(f"📱 Web Push sent to {sub['endpoint'][:50]}...")
                        
                    except Exception as e:
                        logger.error(f"❌ Web Push failed for {sub['endpoint']}: {e}")
            
            logger.info(f"📱 Web Push notifications sent to {len(subscriptions)} subscriptions")
            
        except Exception as e:
            logger.error(f"❌ Web Push notification failed: {e}")

    async def update_delivery_status(self, notification_id: int, status: str):
        """Update notification delivery status"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE notifications 
                SET delivery_status = ?, sent_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (status, notification_id))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"❌ Failed to update delivery status: {e}")

    async def get_notifications(self, user_id: str, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """Get notifications for a user"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM notifications 
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            ''', (user_id, limit, offset))
            
            notifications = []
            for row in cursor.fetchall():
                notification = {
                    'id': row['id'],
                    'user_id': row['user_id'],
                    'title': row['title'],
                    'message': row['message'],
                    'type': row['type'],
                    'category': row['category'],
                    'priority': row['priority'],
                    'symbol': row['symbol'],
                    'data': json.loads(row['data']) if row['data'] else None,
                    'is_read': bool(row['is_read']),
                    'created_at': row['created_at'],
                    'sent_at': row['sent_at'],
                    'delivery_status': row['delivery_status']
                }
                notifications.append(notification)
            
            conn.close()
            
            return notifications
            
        except Exception as e:
            logger.error(f"❌ Failed to get notifications: {e}")
            return []

    async def mark_notification_read(self, notification_id: int, user_id: str) -> Dict[str, Any]:
        """Mark notification as read"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE notifications 
                SET is_read = TRUE 
                WHERE id = ? AND user_id = ?
            ''', (notification_id, user_id))
            
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Notification not found")
            
            conn.commit()
            conn.close()
            
            logger.info(f"✅ Notification {notification_id} marked as read")
            
            return {'message': 'Notification marked as read', 'id': notification_id}
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to mark notification as read: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def subscribe_web_push(self, subscription_data: WebPushSubscription) -> Dict[str, Any]:
        """Subscribe user to Web Push notifications"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            # Insert or update subscription
            cursor.execute('''
                INSERT OR REPLACE INTO web_push_subscriptions 
                (user_id, endpoint, p256dh, auth, is_active)
                VALUES (?, ?, ?, ?, TRUE)
            ''', (
                subscription_data.user_id,
                subscription_data.endpoint,
                subscription_data.keys.get('p256dh', ''),
                subscription_data.keys.get('auth', '')
            ))
            
            conn.commit()
            conn.close()
            
            logger.info(f"✅ Web Push subscription added for user {subscription_data.user_id}")
            
            return {'message': 'Web Push subscription successful'}
            
        except Exception as e:
            logger.error(f"❌ Failed to subscribe to Web Push: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def create_signal_notification(self, symbol: str, signal: str, confidence: float, user_id: str = None):
        """Create a trading signal notification"""
        template = self.templates['signal']
        message = template['template'].format(
            symbol=symbol,
            signal=signal,
            confidence=confidence
        )
        
        notification_data = NotificationCreate(
            title=template['title'],
            message=message,
            type='info' if signal == 'BUY' else 'warning',
            category='signal',
            symbol=symbol,
            priority='high' if confidence > 0.8 else 'normal',
            data={
                'symbol': symbol,
                'signal': signal,
                'confidence': confidence,
                'timestamp': datetime.now().isoformat()
            },
            user_id=user_id
        )
        
        return await self.create_notification(notification_data)

    async def create_price_alert(self, symbol: str, price: float, change: float, user_id: str = None):
        """Create a price alert notification"""
        template = self.templates['price']
        message = template['template'].format(
            symbol=symbol,
            price=price,
            change=change
        )
        
        notification_data = NotificationCreate(
            title=template['title'],
            message=message,
            type='info' if change > 0 else 'warning',
            category='price',
            symbol=symbol,
            priority='normal',
            data={
                'symbol': symbol,
                'price': price,
                'change': change,
                'timestamp': datetime.now().isoformat()
            },
            user_id=user_id
        )
        
        return await self.create_notification(notification_data)

    async def websocket_endpoint(self, websocket: WebSocket):
        """Handle WebSocket connections for real-time notifications"""
        await websocket.accept()
        self.active_connections.append(websocket)
        
        logger.info(f"🔗 WebSocket connected. Total connections: {len(self.active_connections)}")
        
        try:
            while True:
                # Keep connection alive
                await websocket.receive_text()
        except WebSocketDisconnect:
            self.active_connections.remove(websocket)
            logger.info(f"🔌 WebSocket disconnected. Total connections: {len(self.active_connections)}")

# Global notification service instance
notification_service = NotificationService()

# FastAPI app
app = FastAPI(title="BIST AI Notification Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Endpoints
@app.post("/api/notifications")
async def create_notification_endpoint(notification_data: NotificationCreate):
    return await notification_service.create_notification(notification_data)

@app.get("/api/notifications")
async def get_notifications_endpoint(user_id: str = "default_user", limit: int = 50, offset: int = 0):
    return await notification_service.get_notifications(user_id, limit, offset)

@app.put("/api/notifications/{notification_id}/read")
async def mark_notification_read_endpoint(notification_id: int, user_id: str = "default_user"):
    return await notification_service.mark_notification_read(notification_id, user_id)

@app.post("/api/notifications/web-push/subscribe")
async def subscribe_web_push_endpoint(subscription_data: WebPushSubscription):
    return await notification_service.subscribe_web_push(subscription_data)

@app.post("/api/notifications/signal")
async def create_signal_notification_endpoint(
    symbol: str,
    signal: str,
    confidence: float,
    user_id: str = "default_user"
):
    return await notification_service.create_signal_notification(symbol, signal, confidence, user_id)

@app.post("/api/notifications/price-alert")
async def create_price_alert_endpoint(
    symbol: str,
    price: float,
    change: float,
    user_id: str = "default_user"
):
    return await notification_service.create_price_alert(symbol, price, change, user_id)

@app.websocket("/ws/notifications")
async def websocket_notifications_endpoint(websocket: WebSocket):
    await notification_service.websocket_endpoint(websocket)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8003)