#!/usr/bin/env python3
"""
Notification Service - Web Push & Email Alerts
Kullanıcı bildirim sistemi
"""

import json
from datetime import datetime
from typing import List, Dict

class NotificationService:
    """
    Bildirim yönetim servisi
    """
    
    def __init__(self):
        self.subscriptions = []  # Web Push subscriptions
        self.alert_rules = []    # Kullanıcı alert kuralları
        self.notification_history = []
    
    def subscribe(self, subscription_data: dict):
        """
        Web Push subscription kaydet
        
        Args:
            subscription_data: {endpoint, keys: {p256dh, auth}}
        
        Returns:
            dict: Success status
        """
        self.subscriptions.append({
            'subscription': subscription_data,
            'created_at': datetime.now().isoformat(),
            'enabled': True
        })
        
        return {
            'status': 'success',
            'message': 'Subscription kaydedildi',
            'subscription_id': len(self.subscriptions) - 1
        }
    
    def send_notification(self, title: str, body: str, priority: str = 'MEDIUM', data: dict = None):
        """
        Bildirim gönder
        
        Args:
            title: Bildirim başlığı
            body: Bildirim içeriği
            priority: CRITICAL, HIGH, MEDIUM, LOW
            data: Ek veri
        
        Returns:
            dict: Gönderim durumu
        """
        notification = {
            'id': len(self.notification_history),
            'title': title,
            'body': body,
            'priority': priority,
            'data': data or {},
            'timestamp': datetime.now().isoformat(),
            'sent_to': len(self.subscriptions),
            'status': 'sent'
        }
        
        self.notification_history.append(notification)
        
        # TODO: Gerçek Web Push API çağrısı yapılacak (Firebase, OneSignal)
        print(f"📬 Notification sent: {title} ({priority})")
        
        return {
            'status': 'success',
            'notification_id': notification['id'],
            'sent_count': len(self.subscriptions)
        }
    
    def create_alert_rule(self, user_id: str, rule_type: str, condition: dict):
        """
        Alert kuralı oluştur
        
        Args:
            user_id: Kullanıcı ID
            rule_type: 'PRICE', 'SIGNAL', 'RISK', 'VOLUME'
            condition: {symbol, operator, value}
        
        Example:
            create_alert_rule('user123', 'PRICE', {
                'symbol': 'THYAO',
                'operator': '>',
                'value': 250.0
            })
        """
        rule = {
            'rule_id': len(self.alert_rules),
            'user_id': user_id,
            'type': rule_type,
            'condition': condition,
            'created_at': datetime.now().isoformat(),
            'enabled': True
        }
        
        self.alert_rules.append(rule)
        
        return {
            'status': 'success',
            'rule_id': rule['rule_id'],
            'message': f'{rule_type} alert kuralı oluşturuldu'
        }
    
    def check_alerts(self, current_data: dict):
        """
        Alert kurallarını kontrol et ve gerekirse bildirim gönder
        
        Args:
            current_data: {symbol: {price, volume, signal, risk}}
        """
        triggered_alerts = []
        
        for rule in self.alert_rules:
            if not rule['enabled']:
                continue
            
            symbol = rule['condition'].get('symbol')
            if symbol not in current_data:
                continue
            
            # Kontrol et
            if self._check_condition(current_data[symbol], rule):
                triggered_alerts.append(rule)
                
                # Bildirim gönder
                self.send_notification(
                    title=f"🔔 {symbol} Alert!",
                    body=f"{rule['type']} koşulu sağlandı",
                    priority='HIGH',
                    data={'rule_id': rule['rule_id'], 'symbol': symbol}
                )
        
        return {
            'checked': len(self.alert_rules),
            'triggered': len(triggered_alerts),
            'alerts': triggered_alerts
        }
    
    def _check_condition(self, data: dict, rule: dict):
        """Koşul kontrolü"""
        condition = rule['condition']
        operator = condition.get('operator', '>')
        value = condition.get('value', 0)
        
        if rule['type'] == 'PRICE':
            current = data.get('price', 0)
        elif rule['type'] == 'VOLUME':
            current = data.get('volume', 0)
        elif rule['type'] == 'SIGNAL':
            return data.get('signal') == condition.get('value')
        else:
            return False
        
        # Operator kontrolü
        if operator == '>':
            return current > value
        elif operator == '<':
            return current < value
        elif operator == '>=':
            return current >= value
        elif operator == '<=':
            return current <= value
        elif operator == '==':
            return abs(current - value) < 0.01
        
        return False
    
    def get_notification_history(self, limit: int = 50):
        """Son bildirimler"""
        return {
            'total': len(self.notification_history),
            'notifications': self.notification_history[-limit:]
        }

# Global instance
notification_service = NotificationService()

if __name__ == '__main__':
    # Test
    print("📬 Notification Service Test")
    print("=" * 50)
    
    # Subscribe
    sub = notification_service.subscribe({
        'endpoint': 'https://fcm.googleapis.com/...',
        'keys': {'p256dh': 'xxx', 'auth': 'yyy'}
    })
    print("Subscribe:", sub)
    
    # Create alert rule
    rule = notification_service.create_alert_rule(
        'user123',
        'PRICE',
        {'symbol': 'THYAO', 'operator': '>', 'value': 250.0}
    )
    print("\nAlert Rule:", rule)
    
    # Send notification
    notif = notification_service.send_notification(
        '🚀 THYAO BUY Sinyali',
        'Güven: %87, Hedef: 260 TL',
        'HIGH'
    )
    print("\nNotification:", notif)
