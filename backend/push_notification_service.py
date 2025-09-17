"""
Push Notification Service
Firebase Cloud Messaging (FCM) entegrasyonu
"""

import os
import json
import requests
import logging
from typing import Dict, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class PushNotificationService:
    """Firebase Cloud Messaging servisi"""
    
    def __init__(self):
        self.fcm_server_key = os.getenv('FCM_SERVER_KEY')
        self.fcm_url = 'https://fcm.googleapis.com/fcm/send'
        self.enabled = bool(self.fcm_server_key)
        
        if not self.enabled:
            logger.warning("⚠️ FCM_SERVER_KEY bulunamadı, push notification devre dışı")
        else:
            logger.info("✅ Push Notification Service başlatıldı")
    
    def send_notification(
        self,
        title: str,
        body: str,
        data: Optional[Dict] = None,
        topic: Optional[str] = None,
        tokens: Optional[List[str]] = None
    ) -> bool:
        """Push notification gönder"""
        
        if not self.enabled:
            logger.warning("❌ Push notification devre dışı")
            return False
        
        try:
            payload = {
                "notification": {
                    "title": title,
                    "body": body,
                    "sound": "default",
                    "click_action": "FLUTTER_NOTIFICATION_CLICK"
                },
                "data": data or {},
                "priority": "high"
            }
            
            # Topic veya token'lara göre hedef belirle
            if topic:
                payload["to"] = f"/topics/{topic}"
            elif tokens:
                payload["registration_ids"] = tokens
            else:
                logger.error("❌ Topic veya token belirtilmeli")
                return False
            
            headers = {
                'Authorization': f'key={self.fcm_server_key}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(
                self.fcm_url,
                headers=headers,
                data=json.dumps(payload),
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"✅ Push notification gönderildi: {title}")
                return True
            else:
                logger.error(f"❌ FCM Error: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Push notification hatası: {e}")
            return False
    
    def send_trading_signal(
        self,
        symbol: str,
        signal: str,
        confidence: float,
        market: str = "BIST"
    ) -> bool:
        """Trading sinyali bildirimi gönder"""
        
        title = f"🚨 {market} Sinyal: {symbol}"
        body = f"{signal} - Güven: {confidence:.1%}"
        
        data = {
            "symbol": symbol,
            "signal": signal,
            "confidence": str(confidence),
            "market": market,
            "timestamp": datetime.now().isoformat(),
            "type": "trading_signal"
        }
        
        # Market'e göre topic seç
        topic = f"{market.lower()}_signals"
        
        return self.send_notification(
            title=title,
            body=body,
            data=data,
            topic=topic
        )
    
    def send_robot_alert(
        self,
        alert_type: str,
        message: str,
        data: Optional[Dict] = None
    ) -> bool:
        """Robot uyarısı gönder"""
        
        title = f"🤖 Robot Uyarısı: {alert_type}"
        body = message
        
        alert_data = {
            "alert_type": alert_type,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "type": "robot_alert",
            **(data or {})
        }
        
        return self.send_notification(
            title=title,
            body=body,
            data=alert_data,
            topic="robot_alerts"
        )
    
    def send_performance_update(
        self,
        profit: float,
        win_rate: float,
        total_trades: int
    ) -> bool:
        """Performans güncellemesi gönder"""
        
        title = f"📊 Performans Güncellemesi"
        body = f"Kar: ₺{profit:.2f} | Kazanma: {win_rate:.1%} | İşlem: {total_trades}"
        
        data = {
            "profit": str(profit),
            "win_rate": str(win_rate),
            "total_trades": str(total_trades),
            "timestamp": datetime.now().isoformat(),
            "type": "performance_update"
        }
        
        return self.send_notification(
            title=title,
            body=body,
            data=data,
            topic="performance_updates"
        )
    
    def send_market_alert(
        self,
        market: str,
        alert_type: str,
        message: str
    ) -> bool:
        """Market uyarısı gönder"""
        
        title = f"🌍 {market} Market Uyarısı"
        body = f"{alert_type}: {message}"
        
        data = {
            "market": market,
            "alert_type": alert_type,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "type": "market_alert"
        }
        
        return self.send_notification(
            title=title,
            body=body,
            data=data,
            topic=f"{market.lower()}_alerts"
        )

# Global instance
push_service = PushNotificationService()
