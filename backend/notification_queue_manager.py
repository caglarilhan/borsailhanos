"""
Push Bildirim Kuyruk Yöneticisi
FCM, Email, Telegram, Discord webhook'larını kuyrukla ve stabilize et
"""

import asyncio
import logging
import queue
import threading
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime
import json
import requests
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

@dataclass
class NotificationMessage:
    """Bildirim mesajı"""
    title: str
    body: str
    data: Dict[str, Any]
    channels: List[str]  # ['fcm', 'email', 'telegram', 'discord']
    priority: str = 'normal'  # 'low', 'normal', 'high', 'urgent'
    timestamp: datetime = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()

class NotificationQueueManager:
    """Bildirim kuyruk yöneticisi"""
    
    def __init__(self, max_workers: int = 4, max_queue_size: int = 1000):
        self.max_workers = max_workers
        self.max_queue_size = max_queue_size
        self.notification_queue = queue.Queue(maxsize=max_queue_size)
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.running = False
        self.worker_threads = []
        
        # Kanal konfigürasyonları
        self.channel_configs = {
            'fcm': {
                'enabled': True,
                'server_key': None,  # FCM server key
                'url': 'https://fcm.googleapis.com/fcm/send'
            },
            'email': {
                'enabled': True,
                'smtp_server': 'smtp.gmail.com',
                'smtp_port': 587,
                'username': None,
                'password': None
            },
            'telegram': {
                'enabled': True,
                'bot_token': None,
                'chat_id': None
            },
            'discord': {
                'enabled': True,
                'webhook_url': None
            }
        }
        
        # İstatistikler
        self.stats = {
            'total_sent': 0,
            'total_failed': 0,
            'queue_size': 0,
            'active_workers': 0
        }
    
    def start(self):
        """Kuyruk yöneticisini başlat"""
        if self.running:
            logger.warning("⚠️ Notification queue manager zaten çalışıyor")
            return
        
        self.running = True
        
        # Worker thread'leri başlat
        for i in range(self.max_workers):
            worker_thread = threading.Thread(
                target=self._worker_loop,
                name=f"NotificationWorker-{i}",
                daemon=True
            )
            worker_thread.start()
            self.worker_threads.append(worker_thread)
        
        logger.info(f"✅ Notification queue manager başlatıldı ({self.max_workers} worker)")
    
    def stop(self):
        """Kuyruk yöneticisini durdur"""
        if not self.running:
            return
        
        self.running = False
        
        # Worker thread'leri bekle
        for thread in self.worker_threads:
            thread.join(timeout=5)
        
        self.executor.shutdown(wait=True)
        logger.info("🛑 Notification queue manager durduruldu")
    
    def _worker_loop(self):
        """Worker thread döngüsü"""
        while self.running:
            try:
                # Kuyruktan mesaj al
                message = self.notification_queue.get(timeout=1)
                if message is None:
                    continue
                
                # Mesajı işle
                self._process_message(message)
                
                # Kuyruk işaretini temizle
                self.notification_queue.task_done()
                
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"❌ Worker loop hatası: {e}")
    
    def _process_message(self, message: NotificationMessage):
        """Mesajı işle ve gönder"""
        try:
            self.stats['active_workers'] += 1
            
            # Her kanal için mesaj gönder
            for channel in message.channels:
                if channel in self.channel_configs and self.channel_configs[channel]['enabled']:
                    try:
                        self._send_to_channel(channel, message)
                        self.stats['total_sent'] += 1
                    except Exception as e:
                        logger.error(f"❌ {channel} kanalına gönderim hatası: {e}")
                        self.stats['total_failed'] += 1
            
            # İstatistikleri güncelle
            self.stats['queue_size'] = self.notification_queue.qsize()
            
        except Exception as e:
            logger.error(f"❌ Mesaj işleme hatası: {e}")
        finally:
            self.stats['active_workers'] -= 1
    
    def _send_to_channel(self, channel: str, message: NotificationMessage):
        """Belirli kanala mesaj gönder"""
        if channel == 'fcm':
            self._send_fcm(message)
        elif channel == 'email':
            self._send_email(message)
        elif channel == 'telegram':
            self._send_telegram(message)
        elif channel == 'discord':
            self._send_discord(message)
    
    def _send_fcm(self, message: NotificationMessage):
        """FCM push notification gönder"""
        config = self.channel_configs['fcm']
        if not config['server_key']:
            logger.warning("⚠️ FCM server key yok")
            return
        
        headers = {
            'Authorization': f'key={config["server_key"]}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'to': '/topics/trading_signals',
            'notification': {
                'title': message.title,
                'body': message.body
            },
            'data': message.data
        }
        
        response = requests.post(config['url'], headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        
        logger.info(f"✅ FCM bildirimi gönderildi: {message.title}")
    
    def _send_email(self, message: NotificationMessage):
        """Email gönder"""
        config = self.channel_configs['email']
        if not config['username'] or not config['password']:
            logger.warning("⚠️ Email konfigürasyonu eksik")
            return
        
        # SMTP ile email gönder (basit implementasyon)
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        
        msg = MIMEMultipart()
        msg['From'] = config['username']
        msg['To'] = config['username']  # Kendine gönder
        msg['Subject'] = message.title
        
        body = f"{message.body}\n\nData: {json.dumps(message.data, indent=2)}"
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(config['smtp_server'], config['smtp_port'])
        server.starttls()
        server.login(config['username'], config['password'])
        server.send_message(msg)
        server.quit()
        
        logger.info(f"✅ Email bildirimi gönderildi: {message.title}")
    
    def _send_telegram(self, message: NotificationMessage):
        """Telegram mesajı gönder"""
        config = self.channel_configs['telegram']
        if not config['bot_token'] or not config['chat_id']:
            logger.warning("⚠️ Telegram konfigürasyonu eksik")
            return
        
        url = f"https://api.telegram.org/bot{config['bot_token']}/sendMessage"
        
        text = f"*{message.title}*\n\n{message.body}\n\n"
        if message.data:
            text += f"```json\n{json.dumps(message.data, indent=2)}\n```"
        
        payload = {
            'chat_id': config['chat_id'],
            'text': text,
            'parse_mode': 'Markdown'
        }
        
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        
        logger.info(f"✅ Telegram bildirimi gönderildi: {message.title}")
    
    def _send_discord(self, message: NotificationMessage):
        """Discord webhook gönder"""
        config = self.channel_configs['discord']
        if not config['webhook_url']:
            logger.warning("⚠️ Discord webhook URL eksik")
            return
        
        # Discord embed formatı
        embed = {
            'title': message.title,
            'description': message.body,
            'color': 0x00ff00 if message.priority == 'high' else 0x0099ff,
            'timestamp': message.timestamp.isoformat(),
            'fields': []
        }
        
        # Data'yı field'lara ekle
        for key, value in message.data.items():
            embed['fields'].append({
                'name': key,
                'value': str(value),
                'inline': True
            })
        
        payload = {
            'embeds': [embed]
        }
        
        response = requests.post(config['webhook_url'], json=payload, timeout=10)
        response.raise_for_status()
        
        logger.info(f"✅ Discord bildirimi gönderildi: {message.title}")
    
    def queue_notification(self, title: str, body: str, data: Dict[str, Any], 
                          channels: List[str] = None, priority: str = 'normal'):
        """Bildirim kuyruğa ekle"""
        if not self.running:
            logger.warning("⚠️ Notification queue manager çalışmıyor")
            return False
        
        if channels is None:
            channels = ['fcm', 'email', 'telegram', 'discord']
        
        message = NotificationMessage(
            title=title,
            body=body,
            data=data,
            channels=channels,
            priority=priority
        )
        
        try:
            self.notification_queue.put(message, timeout=5)
            logger.info(f"✅ Bildirim kuyruğa eklendi: {title}")
            return True
        except queue.Full:
            logger.error(f"❌ Bildirim kuyruğu dolu: {title}")
            return False
    
    def get_stats(self) -> Dict[str, Any]:
        """İstatistikleri döndür"""
        return {
            **self.stats,
            'queue_size': self.notification_queue.qsize(),
            'running': self.running
        }
    
    def configure_channel(self, channel: str, config: Dict[str, Any]):
        """Kanal konfigürasyonunu güncelle"""
        if channel in self.channel_configs:
            self.channel_configs[channel].update(config)
            logger.info(f"✅ {channel} kanalı konfigüre edildi")
        else:
            logger.warning(f"⚠️ Bilinmeyen kanal: {channel}")

# Global instance
notification_manager = NotificationQueueManager()
