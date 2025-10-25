"""
🚀 BIST AI Smart Trader - Smart Notifications v2
===============================================

AI sinyal değişikliklerinde Web Push bildirimleri gönderen sistem.
Tarayıcı bildirimleri, email ve SMS desteği ile.

Özellikler:
- Web Push Notifications
- Email notifications
- SMS notifications (opsiyonel)
- Priority-based filtering
- User preferences
- Rate limiting
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Union
from dataclasses import dataclass
from enum import Enum
import aiohttp
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NotificationType(Enum):
    """Bildirim türleri"""
    SIGNAL_CHANGE = "signal_change"
    PRICE_ALERT = "price_alert"
    SYSTEM_UPDATE = "system_update"
    MARKET_ANALYSIS = "market_analysis"
    RISK_WARNING = "risk_warning"

class Priority(Enum):
    """Öncelik seviyeleri"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class Notification:
    """Bildirim veri yapısı"""
    id: str
    type: NotificationType
    title: str
    message: str
    priority: Priority
    user_id: Optional[str]
    symbol: Optional[str]
    metadata: Dict = None
    timestamp: datetime = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}
        if self.timestamp is None:
            self.timestamp = datetime.now()

class SmartNotificationService:
    """Smart notification servisi"""
    
    def __init__(self):
        self.web_push_subscriptions: Dict[str, List[Dict]] = {}
        self.user_preferences: Dict[str, Dict] = {}
        self.notification_history: List[Notification] = []
        self.rate_limits: Dict[str, Dict] = {}
        
    async def send_notification(self, notification: Notification):
        """Bildirim gönder"""
        try:
            # Rate limiting kontrolü
            if not self.check_rate_limit(notification):
                logger.warning(f"⚠️ Rate limit exceeded for {notification.user_id}")
                return False
            
            # Kullanıcı tercihlerini kontrol et
            if not self.should_send_notification(notification):
                logger.info(f"ℹ️ Notification filtered by user preferences: {notification.user_id}")
                return False
            
            # Bildirim türüne göre gönder
            success = False
            
            if notification.user_id and notification.user_id in self.web_push_subscriptions:
                success = await self.send_web_push(notification)
            
            # Email bildirimi (yüksek öncelik için)
            if notification.priority in [Priority.HIGH, Priority.CRITICAL]:
                await self.send_email(notification)
            
            # Geçmişe ekle
            self.notification_history.append(notification)
            
            # Geçmişi temizle (son 1000 bildirim)
            if len(self.notification_history) > 1000:
                self.notification_history = self.notification_history[-1000:]
            
            logger.info(f"📱 Notification sent: {notification.title}")
            return success
            
        except Exception as e:
            logger.error(f"❌ Send notification error: {e}")
            return False
    
    def check_rate_limit(self, notification: Notification) -> bool:
        """Rate limiting kontrolü"""
        try:
            user_id = notification.user_id or "anonymous"
            now = datetime.now()
            
            if user_id not in self.rate_limits:
                self.rate_limits[user_id] = {
                    'last_notification': now,
                    'count': 0,
                    'window_start': now
                }
                return True
            
            rate_data = self.rate_limits[user_id]
            
            # 1 dakikalık pencere kontrolü
            if now - rate_data['window_start'] > timedelta(minutes=1):
                rate_data['count'] = 0
                rate_data['window_start'] = now
            
            # Limit kontrolü (dakikada max 10 bildirim)
            if rate_data['count'] >= 10:
                return False
            
            rate_data['count'] += 1
            rate_data['last_notification'] = now
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Rate limit check error: {e}")
            return True  # Hata durumunda gönder
    
    def should_send_notification(self, notification: Notification) -> bool:
        """Kullanıcı tercihlerine göre bildirim gönderilip gönderilmeyeceğini kontrol et"""
        try:
            if not notification.user_id:
                return True  # Anonymous kullanıcılar için gönder
            
            preferences = self.user_preferences.get(notification.user_id, {})
            
            # Bildirim türü kontrolü
            notification_types = preferences.get('notification_types', [])
            if notification_types and notification.type.value not in notification_types:
                return False
            
            # Öncelik kontrolü
            min_priority = preferences.get('min_priority', Priority.LOW.value)
            priority_order = [Priority.LOW.value, Priority.MEDIUM.value, Priority.HIGH.value, Priority.CRITICAL.value]
            
            if priority_order.index(notification.priority.value) < priority_order.index(min_priority):
                return False
            
            # Sembol kontrolü
            if notification.symbol:
                watchlist = preferences.get('watchlist', [])
                if watchlist and notification.symbol not in watchlist:
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"❌ User preferences check error: {e}")
            return True  # Hata durumunda gönder
    
    async def send_web_push(self, notification: Notification) -> bool:
        """Web Push bildirimi gönder"""
        try:
            if notification.user_id not in self.web_push_subscriptions:
                return False
            
            subscriptions = self.web_push_subscriptions[notification.user_id]
            
            payload = {
                'title': notification.title,
                'body': notification.message,
                'icon': '/icons/notification-icon.png',
                'badge': '/icons/badge-icon.png',
                'data': {
                    'notification_id': notification.id,
                    'type': notification.type.value,
                    'symbol': notification.symbol,
                    'priority': notification.priority.value,
                    'timestamp': notification.timestamp.isoformat()
                },
                'actions': self.get_notification_actions(notification),
                'tag': f"bist-ai-{notification.type.value}",
                'requireInteraction': notification.priority in [Priority.HIGH, Priority.CRITICAL]
            }
            
            success_count = 0
            
            for subscription in subscriptions:
                try:
                    async with aiohttp.ClientSession() as session:
                        async with session.post(
                            subscription['endpoint'],
                            json=payload,
                            headers={
                                'Authorization': f"Bearer {subscription.get('auth', '')}",
                                'Content-Type': 'application/json'
                            }
                        ) as response:
                            if response.status == 201:
                                success_count += 1
                            else:
                                logger.warning(f"⚠️ Web push failed: {response.status}")
                                
                except Exception as e:
                    logger.error(f"❌ Web push subscription error: {e}")
            
            logger.info(f"📱 Web push sent to {success_count}/{len(subscriptions)} subscriptions")
            return success_count > 0
            
        except Exception as e:
            logger.error(f"❌ Send web push error: {e}")
            return False
    
    async def send_email(self, notification: Notification):
        """Email bildirimi gönder"""
        try:
            # Email konfigürasyonu (environment variables'dan alınmalı)
            smtp_server = "smtp.gmail.com"
            smtp_port = 587
            email_user = "noreply@borsailhanos.com"
            email_password = "your_app_password"
            
            # Email içeriği
            subject = f"🚨 BIST AI Alert: {notification.title}"
            
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #0B0C10; color: #FFFFFF;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #00E0FF, #FFB600); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                        <h1 style="margin: 0; color: #0B0C10;">🚀 BIST AI Smart Trader</h1>
                    </div>
                    
                    <div style="background-color: #1A1A1A; padding: 20px; border-radius: 10px; border-left: 4px solid #00E0FF;">
                        <h2 style="color: #00E0FF; margin-top: 0;">{notification.title}</h2>
                        <p style="font-size: 16px; line-height: 1.6;">{notification.message}</p>
                        
                        {f'<p style="color: #FFB600;"><strong>Sembol:</strong> {notification.symbol}</p>' if notification.symbol else ''}
                        <p style="color: #888;"><strong>Zaman:</strong> {notification.timestamp.strftime("%d.%m.%Y %H:%M")}</p>
                        <p style="color: #888;"><strong>Öncelik:</strong> {notification.priority.value.upper()}</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="https://borsailhanos.com" style="background-color: #00E0FF; color: #0B0C10; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                            📊 Platforma Git
                        </a>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
                        <p>Bu bildirim BIST AI Smart Trader tarafından gönderilmiştir.</p>
                        <p>Bildirimleri kapatmak için <a href="https://borsailhanos.com/settings" style="color: #00E0FF;">ayarlar</a> sayfasını ziyaret edin.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Email gönder (gerçek implementasyon için email servisi gerekli)
            logger.info(f"📧 Email notification prepared: {notification.title}")
            
        except Exception as e:
            logger.error(f"❌ Send email error: {e}")
    
    def get_notification_actions(self, notification: Notification) -> List[Dict]:
        """Bildirim aksiyonları"""
        actions = []
        
        if notification.symbol:
            actions.append({
                'action': 'view_symbol',
                'title': f'📊 {notification.symbol} Görüntüle',
                'icon': '/icons/chart-icon.png'
            })
        
        actions.append({
            'action': 'view_platform',
            'title': '🚀 Platforma Git',
            'icon': '/icons/platform-icon.png'
        })
        
        return actions
    
    def add_web_push_subscription(self, user_id: str, subscription: Dict):
        """Web Push aboneliği ekle"""
        try:
            if user_id not in self.web_push_subscriptions:
                self.web_push_subscriptions[user_id] = []
            
            # Duplicate kontrolü
            existing_endpoints = [sub['endpoint'] for sub in self.web_push_subscriptions[user_id]]
            if subscription['endpoint'] not in existing_endpoints:
                self.web_push_subscriptions[user_id].append(subscription)
                logger.info(f"✅ Web push subscription added for {user_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"❌ Add web push subscription error: {e}")
            return False
    
    def remove_web_push_subscription(self, user_id: str, endpoint: str):
        """Web Push aboneliğini kaldır"""
        try:
            if user_id in self.web_push_subscriptions:
                self.web_push_subscriptions[user_id] = [
                    sub for sub in self.web_push_subscriptions[user_id]
                    if sub['endpoint'] != endpoint
                ]
                logger.info(f"❌ Web push subscription removed for {user_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"❌ Remove web push subscription error: {e}")
            return False
    
    def update_user_preferences(self, user_id: str, preferences: Dict):
        """Kullanıcı tercihlerini güncelle"""
        try:
            self.user_preferences[user_id] = preferences
            logger.info(f"✅ User preferences updated for {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Update user preferences error: {e}")
            return False
    
    def get_notification_history(self, user_id: str, limit: int = 50) -> List[Dict]:
        """Bildirim geçmişini getir"""
        try:
            user_notifications = [
                {
                    'id': n.id,
                    'type': n.type.value,
                    'title': n.title,
                    'message': n.message,
                    'priority': n.priority.value,
                    'symbol': n.symbol,
                    'timestamp': n.timestamp.isoformat(),
                    'metadata': n.metadata
                }
                for n in self.notification_history
                if not user_id or n.user_id == user_id
            ]
            
            return user_notifications[-limit:]
            
        except Exception as e:
            logger.error(f"❌ Get notification history error: {e}")
            return []
    
    async def send_signal_notification(self, symbol: str, old_signal: str, new_signal: str, confidence: float, user_id: str = None):
        """Sinyal değişikliği bildirimi gönder"""
        try:
            signal_emoji = {
                'BUY': '🟢',
                'SELL': '🔴',
                'HOLD': '🟡',
                'STRONG_BUY': '🟢💪',
                'STRONG_SELL': '🔴💪'
            }
            
            emoji = signal_emoji.get(new_signal, '🟡')
            
            if old_signal and old_signal != new_signal:
                title = f"{emoji} {symbol} Sinyali Değişti"
                message = f"{symbol} için sinyal değişikliği: {old_signal} → {new_signal} (%{confidence:.1f} güven)"
            else:
                title = f"{emoji} {symbol} Yeni Sinyal"
                message = f"{symbol} için yeni sinyal: {new_signal} (%{confidence:.1f} güven)"
            
            # Öncelik belirleme
            priority = Priority.MEDIUM
            if new_signal in ['STRONG_BUY', 'STRONG_SELL']:
                priority = Priority.HIGH
            elif new_signal in ['BUY', 'SELL'] and confidence > 80:
                priority = Priority.HIGH
            
            notification = Notification(
                id=f"signal_{symbol}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                type=NotificationType.SIGNAL_CHANGE,
                title=title,
                message=message,
                priority=priority,
                user_id=user_id,
                symbol=symbol,
                metadata={
                    'old_signal': old_signal,
                    'new_signal': new_signal,
                    'confidence': confidence,
                    'signal_strength': 'strong' if confidence > 80 else 'moderate'
                }
            )
            
            return await self.send_notification(notification)
            
        except Exception as e:
            logger.error(f"❌ Send signal notification error: {e}")
            return False

# Global notification service instance
notification_service = SmartNotificationService()

if __name__ == "__main__":
    async def test_notifications():
        """Test fonksiyonu"""
        logger.info("🧪 Testing Smart Notification Service...")
        
        # Test bildirimi
        test_notification = Notification(
            id="test_001",
            type=NotificationType.SIGNAL_CHANGE,
            title="🧪 Test Bildirimi",
            message="Bu bir test bildirimidir.",
            priority=Priority.MEDIUM,
            user_id="test_user",
            symbol="THYAO"
        )
        
        await notification_service.send_notification(test_notification)
        
        # Test sinyal bildirimi
        await notification_service.send_signal_notification(
            symbol="THYAO",
            old_signal="HOLD",
            new_signal="BUY",
            confidence=85.5,
            user_id="test_user"
        )
        
        logger.info("✅ Test completed")
    
    # Test çalıştır
    asyncio.run(test_notifications())
