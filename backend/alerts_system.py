#!/usr/bin/env python3
"""
🔔 Real-time Alerts System
PRD v2.0 Enhancement - Comprehensive alerting system
"""

import asyncio
import logging
from typing import Dict, List, Optional, Callable
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)

class AlertType(Enum):
    """Alert türleri"""
    PRICE_BREAKOUT = "PRICE_BREAKOUT"
    VOLUME_SPIKE = "VOLUME_SPIKE"
    PATTERN_DETECTED = "PATTERN_DETECTED"
    RISK_THRESHOLD = "RISK_THRESHOLD"
    PORTFOLIO_REBALANCE = "PORTFOLIO_REBALANCE"
    NEWS_SENTIMENT = "NEWS_SENTIMENT"

class AlertPriority(Enum):
    """Alert öncelikleri"""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

@dataclass
class Alert:
    """Alert öğesi"""
    alert_id: str
    alert_type: AlertType
    priority: AlertPriority
    symbol: str
    title: str
    message: str
    data: Dict
    timestamp: datetime
    sent: bool = False

class AlertManager:
    """Alert yönetim sistemi"""
    
    def __init__(self):
        self.active_alerts = {}
        self.alert_history = []
        self.subscribers = {}
        self.alert_rules = {}
        
    def add_alert_rule(self, rule_name: str, condition_func: Callable, 
                      alert_type: AlertType, priority: AlertPriority):
        """Alert kuralı ekle"""
        self.alert_rules[rule_name] = {
            'condition': condition_func,
            'type': alert_type,
            'priority': priority
        }
        logger.info(f"📋 Alert kuralı eklendi: {rule_name}")
    
    def check_alerts(self, symbol: str, data: Dict) -> List[Alert]:
        """Alert'leri kontrol et"""
        alerts = []
        
        for rule_name, rule in self.alert_rules.items():
            try:
                if rule['condition'](symbol, data):
                    alert = Alert(
                        alert_id=f"{symbol}_{rule_name}_{datetime.now().timestamp()}",
                        alert_type=rule['type'],
                        priority=rule['priority'],
                        symbol=symbol,
                        title=f"{rule['type'].value} Alert for {symbol}",
                        message=self._generate_alert_message(rule['type'], symbol, data),
                        data=data,
                        timestamp=datetime.now()
                    )
                    alerts.append(alert)
                    
            except Exception as e:
                logger.error(f"❌ Alert kuralı {rule_name} hatası: {e}")
        
        return alerts
    
    def send_alert(self, alert: Alert):
        """Alert gönder"""
        try:
            # Console log
            logger.info(f"🔔 ALERT: {alert.title}")
            logger.info(f"   Mesaj: {alert.message}")
            logger.info(f"   Öncelik: {alert.priority.value}")
            
            # Email gönder (opsiyonel)
            # self._send_email_alert(alert)
            
            # Webhook gönder (opsiyonel)
            # self._send_webhook_alert(alert)
            
            alert.sent = True
            self.alert_history.append(alert)
            
        except Exception as e:
            logger.error(f"❌ Alert gönderme hatası: {e}")
    
    def _generate_alert_message(self, alert_type: AlertType, symbol: str, data: Dict) -> str:
        """Alert mesajı oluştur"""
        messages = {
            AlertType.PRICE_BREAKOUT: f"{symbol} fiyatı önemli seviyeyi kırdı: {data.get('price', 'N/A')}",
            AlertType.VOLUME_SPIKE: f"{symbol} hacimde ani artış: {data.get('volume_ratio', 'N/A')}x",
            AlertType.PATTERN_DETECTED: f"{symbol} için {data.get('pattern', 'bilinmeyen')} pattern tespit edildi",
            AlertType.RISK_THRESHOLD: f"{symbol} risk seviyesi eşiği aştı: {data.get('risk_score', 'N/A')}",
            AlertType.PORTFOLIO_REBALANCE: f"Portföy yeniden dengeleme önerisi",
            AlertType.NEWS_SENTIMENT: f"{symbol} için sentiment değişimi: {data.get('sentiment', 'N/A')}"
        }
        
        return messages.get(alert_type, f"{symbol} için genel alert")

# Alert condition functions
def price_breakout_condition(symbol: str, data: Dict) -> bool:
    """Fiyat breakout kontrolü"""
    try:
        current_price = data.get('current_price', 0)
        resistance = data.get('resistance_level', 0)
        support = data.get('support_level', 0)
        
        if current_price > resistance * 1.02:  # %2 üzerinde
            return True
        elif current_price < support * 0.98:  # %2 altında
            return True
        
        return False
    except:
        return False

def volume_spike_condition(symbol: str, data: Dict) -> bool:
    """Hacim spike kontrolü"""
    try:
        volume_ratio = data.get('volume_ratio', 1.0)
        return volume_ratio > 2.0  # 2x'den fazla hacim
    except:
        return False

def risk_threshold_condition(symbol: str, data: Dict) -> bool:
    """Risk eşik kontrolü"""
    try:
        risk_score = data.get('risk_score', 50)
        return risk_score < 30 or risk_score > 80  # Çok düşük veya yüksek risk
    except:
        return False

def test_alerts_system():
    """Alerts system test"""
    logger.info("🧪 Alerts System test başlıyor...")
    
    alert_manager = AlertManager()
    
    # Alert kuralları ekle
    alert_manager.add_alert_rule(
        "price_breakout",
        price_breakout_condition,
        AlertType.PRICE_BREAKOUT,
        AlertPriority.HIGH
    )
    
    alert_manager.add_alert_rule(
        "volume_spike",
        volume_spike_condition,
        AlertType.VOLUME_SPIKE,
        AlertPriority.MEDIUM
    )
    
    alert_manager.add_alert_rule(
        "risk_threshold",
        risk_threshold_condition,
        AlertType.RISK_THRESHOLD,
        AlertPriority.CRITICAL
    )
    
    # Test verisi
    test_data = {
        'current_price': 220.0,
        'resistance_level': 215.0,
        'support_level': 200.0,
        'volume_ratio': 2.5,
        'risk_score': 25
    }
    
    # Alert'leri kontrol et
    alerts = alert_manager.check_alerts("GARAN.IS", test_data)
    
    # Alert'leri gönder
    for alert in alerts:
        alert_manager.send_alert(alert)
    
    logger.info(f"✅ {len(alerts)} alert işlendi")
    return alerts

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    test_alerts_system()
