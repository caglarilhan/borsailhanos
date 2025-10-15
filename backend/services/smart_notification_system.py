#!/usr/bin/env python3
"""
🔔 Smart Notification System
Kişiselleştirilmiş, akıllı bildirim sistemi
"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging
from dataclasses import dataclass, asdict
from enum import Enum
import random

class NotificationPriority(Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class NotificationType(Enum):
    PRICE_ALERT = "PRICE_ALERT"
    PATTERN_DETECTED = "PATTERN_DETECTED"
    AI_SIGNAL = "AI_SIGNAL"
    RISK_WARNING = "RISK_WARNING"
    MARKET_EVENT = "MARKET_EVENT"
    PORTFOLIO_UPDATE = "PORTFOLIO_UPDATE"
    NEWS_ALERT = "NEWS_ALERT"
    VOLATILITY_SPIKE = "VOLATILITY_SPIKE"

@dataclass
class NotificationRule:
    user_id: str
    symbol: str
    rule_type: str
    condition: Dict[str, Any]
    priority: NotificationPriority
    is_active: bool
    created_at: str
    last_triggered: Optional[str] = None
    trigger_count: int = 0

@dataclass
class Notification:
    id: str
    user_id: str
    type: NotificationType
    priority: NotificationPriority
    title: str
    message: str
    symbol: Optional[str]
    data: Dict[str, Any]
    timestamp: str
    is_read: bool = False
    is_delivered: bool = False

class SmartNotificationSystem:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.notification_rules: Dict[str, List[NotificationRule]] = {}
        self.notifications: Dict[str, List[Notification]] = {}
        self.user_preferences: Dict[str, Dict[str, Any]] = {}
        
        # Initialize default preferences
        self._initialize_default_preferences()

    def _initialize_default_preferences(self):
        """Initialize default user preferences"""
        self.user_preferences = {
            "default": {
                "email_notifications": True,
                "push_notifications": True,
                "sms_notifications": False,
                "sound_enabled": True,
                "quiet_hours": {"start": "22:00", "end": "08:00"},
                "priority_filter": ["CRITICAL", "HIGH", "MEDIUM"],
                "symbols_filter": [],
                "risk_tolerance": "MEDIUM"
            }
        }

    async def create_notification_rule(self, user_id: str, rule: NotificationRule) -> bool:
        """Create a new notification rule"""
        try:
            if user_id not in self.notification_rules:
                self.notification_rules[user_id] = []
            
            self.notification_rules[user_id].append(rule)
            
            self.logger.info(f"Created notification rule for user {user_id}: {rule.rule_type}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error creating notification rule: {e}")
            return False

    async def check_price_alerts(self, user_id: str, symbol: str, current_price: float) -> List[Notification]:
        """Check if price alerts should be triggered"""
        notifications = []
        
        if user_id not in self.notification_rules:
            return notifications
        
        for rule in self.notification_rules[user_id]:
            if (rule.symbol == symbol and 
                rule.rule_type == "PRICE_ALERT" and 
                rule.is_active):
                
                condition = rule.condition
                trigger_price = condition.get("price")
                alert_type = condition.get("type")  # "above" or "below"
                
                should_trigger = False
                if alert_type == "above" and current_price >= trigger_price:
                    should_trigger = True
                elif alert_type == "below" and current_price <= trigger_price:
                    should_trigger = True
                
                if should_trigger:
                    notification = await self._create_price_alert_notification(
                        user_id, symbol, current_price, trigger_price, alert_type, rule.priority
                    )
                    notifications.append(notification)
                    
                    # Update rule
                    rule.last_triggered = datetime.now().isoformat()
                    rule.trigger_count += 1
        
        return notifications

    async def check_pattern_alerts(self, user_id: str, symbol: str, patterns: List[Dict[str, Any]]) -> List[Notification]:
        """Check if pattern alerts should be triggered"""
        notifications = []
        
        if user_id not in self.notification_rules:
            return notifications
        
        for rule in self.notification_rules[user_id]:
            if (rule.symbol == symbol and 
                rule.rule_type == "PATTERN_ALERT" and 
                rule.is_active):
                
                condition = rule.condition
                pattern_type = condition.get("pattern_type")
                min_confidence = condition.get("min_confidence", 0.7)
                
                for pattern in patterns:
                    if (pattern.get("pattern_type") == pattern_type and 
                        pattern.get("confidence", 0) >= min_confidence):
                        
                        notification = await self._create_pattern_alert_notification(
                            user_id, symbol, pattern, rule.priority
                        )
                        notifications.append(notification)
                        
                        # Update rule
                        rule.last_triggered = datetime.now().isoformat()
                        rule.trigger_count += 1
        
        return notifications

    async def check_ai_signal_alerts(self, user_id: str, symbol: str, ai_signal: Dict[str, Any]) -> List[Notification]:
        """Check if AI signal alerts should be triggered"""
        notifications = []
        
        if user_id not in self.notification_rules:
            return notifications
        
        for rule in self.notification_rules[user_id]:
            if (rule.symbol == symbol and 
                rule.rule_type == "AI_SIGNAL" and 
                rule.is_active):
                
                condition = rule.condition
                min_confidence = condition.get("min_confidence", 0.8)
                signal_types = condition.get("signal_types", ["BUY", "SELL"])
                
                if (ai_signal.get("confidence", 0) >= min_confidence and 
                    ai_signal.get("prediction") in signal_types):
                    
                    notification = await self._create_ai_signal_notification(
                        user_id, symbol, ai_signal, rule.priority
                    )
                    notifications.append(notification)
                    
                    # Update rule
                    rule.last_triggered = datetime.now().isoformat()
                    rule.trigger_count += 1
        
        return notifications

    async def check_risk_alerts(self, user_id: str, portfolio_data: Dict[str, Any]) -> List[Notification]:
        """Check if risk alerts should be triggered"""
        notifications = []
        
        # Check portfolio risk metrics
        total_value = portfolio_data.get("total_value", 0)
        daily_pnl = portfolio_data.get("daily_pnl", 0)
        max_drawdown = portfolio_data.get("max_drawdown", 0)
        
        # Risk thresholds based on user preferences
        preferences = self.user_preferences.get(user_id, self.user_preferences["default"])
        risk_tolerance = preferences.get("risk_tolerance", "MEDIUM")
        
        risk_thresholds = {
            "LOW": {"daily_loss": 0.02, "drawdown": 0.05},
            "MEDIUM": {"daily_loss": 0.05, "drawdown": 0.10},
            "HIGH": {"daily_loss": 0.10, "drawdown": 0.20}
        }
        
        thresholds = risk_thresholds.get(risk_tolerance, risk_thresholds["MEDIUM"])
        
        # Check daily loss
        if daily_pnl < -thresholds["daily_loss"] * total_value:
            notification = await self._create_risk_alert_notification(
                user_id, "DAILY_LOSS", daily_pnl, total_value, NotificationPriority.HIGH
            )
            notifications.append(notification)
        
        # Check drawdown
        if max_drawdown > thresholds["drawdown"]:
            notification = await self._create_risk_alert_notification(
                user_id, "DRAWDOWN", max_drawdown, total_value, NotificationPriority.CRITICAL
            )
            notifications.append(notification)
        
        return notifications

    async def _create_price_alert_notification(self, user_id: str, symbol: str, current_price: float, 
                                             trigger_price: float, alert_type: str, priority: NotificationPriority) -> Notification:
        """Create price alert notification"""
        direction = "üzerinde" if alert_type == "above" else "altında"
        
        return Notification(
            id=f"price_alert_{user_id}_{symbol}_{datetime.now().timestamp()}",
            user_id=user_id,
            type=NotificationType.PRICE_ALERT,
            priority=priority,
            title=f"💰 {symbol} Fiyat Uyarısı",
            message=f"{symbol} fiyatı ₺{trigger_price:.2f} {direction} - Mevcut: ₺{current_price:.2f}",
            symbol=symbol,
            data={
                "current_price": current_price,
                "trigger_price": trigger_price,
                "alert_type": alert_type,
                "change_percent": ((current_price - trigger_price) / trigger_price) * 100
            },
            timestamp=datetime.now().isoformat()
        )

    async def _create_pattern_alert_notification(self, user_id: str, symbol: str, pattern: Dict[str, Any], 
                                               priority: NotificationPriority) -> Notification:
        """Create pattern alert notification"""
        pattern_type = pattern.get("pattern_type", "Unknown")
        confidence = pattern.get("confidence", 0)
        direction = pattern.get("direction", "Unknown")
        
        return Notification(
            id=f"pattern_alert_{user_id}_{symbol}_{datetime.now().timestamp()}",
            user_id=user_id,
            type=NotificationType.PATTERN_DETECTED,
            priority=priority,
            title=f"📊 {symbol} Formasyon Tespit Edildi",
            message=f"{pattern_type} {direction} formasyonu tespit edildi (Güven: %{confidence*100:.0f})",
            symbol=symbol,
            data={
                "pattern_type": pattern_type,
                "direction": direction,
                "confidence": confidence,
                "target_price": pattern.get("target_price"),
                "stop_loss": pattern.get("stop_loss")
            },
            timestamp=datetime.now().isoformat()
        )

    async def _create_ai_signal_notification(self, user_id: str, symbol: str, ai_signal: Dict[str, Any], 
                                           priority: NotificationPriority) -> Notification:
        """Create AI signal notification"""
        prediction = ai_signal.get("prediction", "UNKNOWN")
        confidence = ai_signal.get("confidence", 0)
        
        signal_emoji = {"BUY": "🟢", "SELL": "🔴", "HOLD": "🟡"}.get(prediction, "⚪")
        
        return Notification(
            id=f"ai_signal_{user_id}_{symbol}_{datetime.now().timestamp()}",
            user_id=user_id,
            type=NotificationType.AI_SIGNAL,
            priority=priority,
            title=f"{signal_emoji} {symbol} AI Sinyali",
            message=f"AI {prediction} sinyali - Güven: %{confidence*100:.0f}",
            symbol=symbol,
            data={
                "prediction": prediction,
                "confidence": confidence,
                "price_target": ai_signal.get("price_target"),
                "stop_loss": ai_signal.get("stop_loss"),
                "take_profit": ai_signal.get("take_profit")
            },
            timestamp=datetime.now().isoformat()
        )

    async def _create_risk_alert_notification(self, user_id: str, risk_type: str, value: float, 
                                            total_value: float, priority: NotificationPriority) -> Notification:
        """Create risk alert notification"""
        if risk_type == "DAILY_LOSS":
            loss_percent = (abs(value) / total_value) * 100
            return Notification(
                id=f"risk_alert_{user_id}_{risk_type}_{datetime.now().timestamp()}",
                user_id=user_id,
                type=NotificationType.RISK_WARNING,
                priority=priority,
                title="⚠️ Günlük Kayıp Uyarısı",
                message=f"Portföyünüzde %{loss_percent:.1f} günlük kayıp tespit edildi",
                symbol=None,
                data={
                    "risk_type": risk_type,
                    "loss_amount": value,
                    "loss_percent": loss_percent,
                    "total_value": total_value
                },
                timestamp=datetime.now().isoformat()
            )
        elif risk_type == "DRAWDOWN":
            return Notification(
                id=f"risk_alert_{user_id}_{risk_type}_{datetime.now().timestamp()}",
                user_id=user_id,
                type=NotificationType.RISK_WARNING,
                priority=priority,
                title="🚨 Yüksek Drawdown Uyarısı",
                message=f"Portföyünüzde %{value*100:.1f} drawdown tespit edildi",
                symbol=None,
                data={
                    "risk_type": risk_type,
                    "drawdown_percent": value * 100,
                    "total_value": total_value
                },
                timestamp=datetime.now().isoformat()
            )

    async def send_notification(self, notification: Notification) -> bool:
        """Send notification to user"""
        try:
            # Store notification
            if notification.user_id not in self.notifications:
                self.notifications[notification.user_id] = []
            
            self.notifications[notification.user_id].append(notification)
            
            # Check user preferences
            preferences = self.user_preferences.get(notification.user_id, self.user_preferences["default"])
            
            # Check quiet hours
            if self._is_quiet_hours(preferences):
                if notification.priority != NotificationPriority.CRITICAL:
                    self.logger.info(f"Notification delayed due to quiet hours: {notification.id}")
                    return True
            
            # Check priority filter
            if notification.priority.value not in preferences.get("priority_filter", []):
                self.logger.info(f"Notification filtered by priority: {notification.id}")
                return True
            
            # Send via different channels
            sent = False
            
            if preferences.get("push_notifications", True):
                sent = await self._send_push_notification(notification)
            
            if preferences.get("email_notifications", True) and notification.priority in [NotificationPriority.CRITICAL, NotificationPriority.HIGH]:
                sent = await self._send_email_notification(notification)
            
            if preferences.get("sms_notifications", False) and notification.priority == NotificationPriority.CRITICAL:
                sent = await self._send_sms_notification(notification)
            
            notification.is_delivered = sent
            return sent
            
        except Exception as e:
            self.logger.error(f"Error sending notification: {e}")
            return False

    def _is_quiet_hours(self, preferences: Dict[str, Any]) -> bool:
        """Check if current time is in quiet hours"""
        try:
            quiet_hours = preferences.get("quiet_hours", {})
            if not quiet_hours:
                return False
            
            now = datetime.now().time()
            start_time = datetime.strptime(quiet_hours.get("start", "22:00"), "%H:%M").time()
            end_time = datetime.strptime(quiet_hours.get("end", "08:00"), "%H:%M").time()
            
            if start_time <= end_time:
                return start_time <= now <= end_time
            else:  # Crosses midnight
                return now >= start_time or now <= end_time
                
        except Exception as e:
            self.logger.error(f"Error checking quiet hours: {e}")
            return False

    async def _send_push_notification(self, notification: Notification) -> bool:
        """Send push notification (mock implementation)"""
        # In real implementation, this would use FCM or similar
        self.logger.info(f"📱 Push notification sent: {notification.title}")
        return True

    async def _send_email_notification(self, notification: Notification) -> bool:
        """Send email notification (mock implementation)"""
        # In real implementation, this would use SMTP or email service
        self.logger.info(f"📧 Email notification sent: {notification.title}")
        return True

    async def _send_sms_notification(self, notification: Notification) -> bool:
        """Send SMS notification (mock implementation)"""
        # In real implementation, this would use SMS service
        self.logger.info(f"📱 SMS notification sent: {notification.title}")
        return True

    async def get_user_notifications(self, user_id: str, limit: int = 50) -> List[Notification]:
        """Get user notifications"""
        if user_id not in self.notifications:
            return []
        
        notifications = self.notifications[user_id]
        notifications.sort(key=lambda x: x.timestamp, reverse=True)
        
        return notifications[:limit]

    async def mark_notification_read(self, user_id: str, notification_id: str) -> bool:
        """Mark notification as read"""
        try:
            if user_id not in self.notifications:
                return False
            
            for notification in self.notifications[user_id]:
                if notification.id == notification_id:
                    notification.is_read = True
                    return True
            
            return False
            
        except Exception as e:
            self.logger.error(f"Error marking notification as read: {e}")
            return False

    async def get_notification_rules(self, user_id: str) -> List[NotificationRule]:
        """Get user notification rules"""
        return self.notification_rules.get(user_id, [])

    async def update_user_preferences(self, user_id: str, preferences: Dict[str, Any]) -> bool:
        """Update user notification preferences"""
        try:
            self.user_preferences[user_id] = preferences
            self.logger.info(f"Updated preferences for user {user_id}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error updating user preferences: {e}")
            return False

    async def get_notification_stats(self, user_id: str) -> Dict[str, Any]:
        """Get notification statistics for user"""
        if user_id not in self.notifications:
            return {
                "total_notifications": 0,
                "unread_count": 0,
                "by_type": {},
                "by_priority": {}
            }
        
        notifications = self.notifications[user_id]
        
        stats = {
            "total_notifications": len(notifications),
            "unread_count": sum(1 for n in notifications if not n.is_read),
            "by_type": {},
            "by_priority": {}
        }
        
        # Count by type
        for notification in notifications:
            type_name = notification.type.value
            stats["by_type"][type_name] = stats["by_type"].get(type_name, 0) + 1
        
        # Count by priority
        for notification in notifications:
            priority_name = notification.priority.value
            stats["by_priority"][priority_name] = stats["by_priority"].get(priority_name, 0) + 1
        
        return stats

# Global instance
smart_notification_system = SmartNotificationSystem()
