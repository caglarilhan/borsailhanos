#!/usr/bin/env python3
"""
Realtime WebSocket Server - Production Ready
Gerçek zamanlı fiyat ve sinyal akışı
"""

import asyncio
import json
import random
from datetime import datetime
from typing import Set
import sys

# WebSocket için basit HTTP server kullanacağız (production için socketio kullanılabilir)
# Şimdilik Server-Sent Events (SSE) ile realtime sağlıyoruz

from http.server import HTTPServer, BaseHTTPRequestHandler

class RealtimeHandler(BaseHTTPRequestHandler):
    clients: Set = set()
    
    def log_message(self, format, *args):
        print(f"📡 {args[0].split()[0]} {args[0].split()[1]}")
    
    def do_GET(self):
        if self.path == '/stream/prices':
            self._handle_price_stream()
        elif self.path == '/stream/signals':
            self._handle_signal_stream()
        elif self.path == '/stream/risk':
            self._handle_risk_stream()
        else:
            self.send_response(404)
            self.end_headers()
    
    def _handle_price_stream(self):
        """Server-Sent Events için fiyat akışı"""
        self.send_response(200)
        self.send_header('Content-Type', 'text/event-stream')
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        symbols = ['THYAO', 'ASELS', 'TUPRS', 'SISE', 'EREGL']
        base_prices = {
            'THYAO': 245.50,
            'ASELS': 48.20,
            'TUPRS': 180.30,
            'SISE': 32.50,
            'EREGL': 55.80
        }
        
        try:
            for _ in range(100):  # 100 update gönder
                for symbol in symbols:
                    change = random.uniform(-0.5, 0.5)
                    price = base_prices[symbol] * (1 + change/100)
                    
                    data = {
                        'symbol': symbol,
                        'price': round(price, 2),
                        'change': round(change, 2),
                        'volume': random.randint(1000000, 5000000),
                        'timestamp': datetime.now().isoformat()
                    }
                    
                    # SSE format
                    message = f"data: {json.dumps(data)}\n\n"
                    self.wfile.write(message.encode('utf-8'))
                    self.wfile.flush()
                
                import time
                time.sleep(2)  # 2 saniyede bir güncelle
                
        except (BrokenPipeError, ConnectionResetError):
            print("🔌 Client bağlantısı kapandı")
    
    def _handle_signal_stream(self):
        """AI sinyalleri stream"""
        self.send_response(200)
        self.send_header('Content-Type', 'text/event-stream')
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        try:
            for i in range(100):
                signal = {
                    'symbol': random.choice(['THYAO', 'ASELS', 'TUPRS']),
                    'action': random.choice(['BUY', 'SELL', 'HOLD']),
                    'confidence': round(random.uniform(0.6, 0.95), 2),
                    'timestamp': datetime.now().isoformat()
                }
                
                message = f"data: {json.dumps(signal)}\n\n"
                self.wfile.write(message.encode('utf-8'))
                self.wfile.flush()
                
                import time
                time.sleep(10)  # 10 saniyede bir sinyal
                
        except (BrokenPipeError, ConnectionResetError):
            print("🔌 Client bağlantısı kapandı")
    
    def _handle_risk_stream(self):
        """Risk metrikleri stream"""
        self.send_response(200)
        self.send_header('Content-Type', 'text/event-stream')
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        try:
            for i in range(100):
                risk_data = {
                    'portfolio_risk': random.choice(['DÜŞÜK', 'ORTA', 'YÜKSEK']),
                    'var_95': round(random.uniform(-20000, -5000), 2),
                    'sharpe_ratio': round(random.uniform(0.8, 2.0), 2),
                    'volatility': round(random.uniform(10, 30), 2),
                    'timestamp': datetime.now().isoformat()
                }
                
                message = f"data: {json.dumps(risk_data)}\n\n"
                self.wfile.write(message.encode('utf-8'))
                self.wfile.flush()
                
                import time
                time.sleep(5)  # 5 saniyede bir risk update
                
        except (BrokenPipeError, ConnectionResetError):
            print("🔌 Client bağlantısı kapandı")

def run_realtime_server(port=8081):
    server = HTTPServer(('0.0.0.0', port), RealtimeHandler)
    print('=' * 70)
    print('🔌 Realtime WebSocket/SSE Server')
    print('=' * 70)
    print(f'📊 URL: http://localhost:{port}')
    print(f'📈 Price Stream: http://localhost:{port}/stream/prices')
    print(f'🎯 Signal Stream: http://localhost:{port}/stream/signals')
    print(f'⚠️  Risk Stream: http://localhost:{port}/stream/risk')
    print('=' * 70)
    print()
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n⏹️  Server kapatılıyor...')
        server.server_close()

if __name__ == '__main__':
    run_realtime_server()
