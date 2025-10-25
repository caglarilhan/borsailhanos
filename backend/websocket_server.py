#!/usr/bin/env python3
"""
WebSocket Server - Gerçek zamanlı veri akışı
"""

import asyncio
import json
import random
from datetime import datetime
from http.server import HTTPServer, SimpleHTTPRequestHandler
import threading

# Basit WebSocket server (production için websockets library kullanılmalı)
class WebSocketHandler:
    def __init__(self):
        self.clients = []
        self.running = True
    
    async def broadcast_prices(self):
        """Fiyatları sürekli broadcast et"""
        symbols = ['THYAO', 'ASELS', 'TUPRS', 'SISE', 'EREGL']
        base_prices = {
            'THYAO': 245.50,
            'ASELS': 48.20,
            'TUPRS': 180.30,
            'SISE': 32.50,
            'EREGL': 55.80
        }
        
        while self.running:
            for symbol in symbols:
                # Rastgele fiyat değişimi (gerçek veri için API bağlantısı eklenecek)
                change = random.uniform(-0.5, 0.5)
                price = base_prices[symbol] * (1 + change/100)
                
                data = {
                    'type': 'price_update',
                    'symbol': symbol,
                    'price': round(price, 2),
                    'change': round(change, 2),
                    'volume': random.randint(1000000, 5000000),
                    'timestamp': datetime.now().isoformat()
                }
                
                print(f"📊 {symbol}: {price:.2f} ({change:+.2f}%)")
            
            await asyncio.sleep(2)  # 2 saniyede bir güncelle

# HTTP endpoint olarak çalıştır (basit versiyon)
def start_websocket_server():
    ws = WebSocketHandler()
    asyncio.run(ws.broadcast_prices())

if __name__ == '__main__':
    print("🔌 WebSocket Server başlatıldı (Mock Mode)")
    print("📊 Gerçek zamanlı fiyat güncellemeleri aktif")
    start_websocket_server()
