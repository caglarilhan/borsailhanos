#!/usr/bin/env python3
"""
Comprehensive Backend API - Tüm frontend endpoint'leri için
Hiçbir external dependency gerektirmez (sadece Python standard library)
"""

import json
import random
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime, timedelta
from urllib.parse import urlparse, parse_qs

class ComprehensiveAPI(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        """Logging'i sessiz yap"""
        print(f"📡 {args[0].split()[0]} {args[0].split()[1]}")
    
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()
    
    def _parse_query(self):
        """URL parametrelerini parse et"""
        parsed = urlparse(self.path)
        return parse_qs(parsed.query)
    
    def do_OPTIONS(self):
        self._set_headers(200)
    
    def do_GET(self):
        path = self.path.split('?')[0]  # Query parametrelerini ayır
        
        # ==================== TRADING SIGNALS ====================
        if path == '/api/signals':
            self._handle_signals()
        
        elif path == '/api/metrics':
            self._handle_metrics()
        
        # ==================== MARKET DATA ====================
        elif path == '/api/market/overview':
            self._handle_market_overview()
        
        else:
            self._set_headers(404)
            response = {
                'error': 'Endpoint bulunamadı',
                'path': path
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
    
    def _handle_signals(self):
        self._set_headers(200)
        response = {
            'timestamp': datetime.now().isoformat(),
            'signals': [
                {
                    'symbol': 'THYAO',
                    'signal': 'BUY',
                    'confidence': 85.2,
                    'price': 245.50,
                    'change': 2.3,
                    'timestamp': datetime.now().isoformat(),
                    'xaiExplanation': 'Güçlü teknik formasyon ve pozitif momentum sinyalleri',
                    'confluenceScore': 92,
                    'marketRegime': 'Risk-On',
                    'sentimentScore': 15.3
                },
                {
                    'symbol': 'TUPRS',
                    'signal': 'SELL',
                    'confidence': 78.7,
                    'price': 180.30,
                    'change': -1.8,
                    'timestamp': datetime.now().isoformat(),
                    'xaiExplanation': 'Direnç seviyesinde satış baskısı tespit edildi',
                    'confluenceScore': 88,
                    'marketRegime': 'Risk-Off',
                    'sentimentScore': -8.2
                },
                {
                    'symbol': 'ASELS',
                    'signal': 'HOLD',
                    'confidence': 72.1,
                    'price': 48.20,
                    'change': 0.5,
                    'timestamp': datetime.now().isoformat(),
                    'xaiExplanation': 'Piyasa belirsizliği nedeniyle bekleme pozisyonu',
                    'confluenceScore': 75,
                    'marketRegime': 'Neutral',
                    'sentimentScore': 2.1
                }
            ]
        }
        self.wfile.write(json.dumps(response).encode('utf-8'))
    
    def _handle_metrics(self):
        self._set_headers(200)
        response = {
            'timestamp': datetime.now().isoformat(),
            'totalProfit': round(random.uniform(8000, 15000), 2),
            'accuracyRate': round(random.uniform(75, 95), 1),
            'riskScore': random.choice(['Düşük', 'Orta', 'Yüksek']),
            'activeSignals': random.randint(5, 15),
            'winRate': round(random.uniform(60, 85), 1),
            'sharpeRatio': round(random.uniform(1.2, 2.5), 2),
            'maxDrawdown': round(random.uniform(5, 15), 1),
            'totalTrades': random.randint(50, 200),
            'avgReturn': round(random.uniform(2, 8), 2)
        }
        self.wfile.write(json.dumps(response).encode('utf-8'))
    
    def _handle_market_overview(self):
        self._set_headers(200)
        response = {
            'timestamp': datetime.now().isoformat(),
            'markets': [
                {
                    'symbol': 'THYAO',
                    'price': 245.50,
                    'change': 2.3,
                    'volume': 15000000,
                    'marketCap': 125000000000,
                    'sector': 'Teknoloji'
                },
                {
                    'symbol': 'TUPRS',
                    'price': 180.30,
                    'change': -1.8,
                    'volume': 8000000,
                    'marketCap': 90000000000,
                    'sector': 'Kimya'
                },
                {
                    'symbol': 'ASELS',
                    'price': 48.20,
                    'change': 0.5,
                    'volume': 12000000,
                    'marketCap': 45000000000,
                    'sector': 'Savunma'
                }
            ]
        }
        self.wfile.write(json.dumps(response).encode('utf-8'))

def run_server():
    port = 8000
    server_address = ('', port)
    httpd = HTTPServer(server_address, ComprehensiveAPI)
    
    print('=' * 70)
    print('🚀 BIST AI Smart Trader - Comprehensive Backend API')
    print('=' * 70)
    print(f'📡 Server başlatıldı: http://localhost:{port}')
    print('🔗 Örnek Endpoint\'ler:')
    print(f'  • http://localhost:{port}/api/signals')
    print(f'  • http://localhost:{port}/api/metrics')
    print(f'  • http://localhost:{port}/api/market/overview')
    print('=' * 70)
    print()
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n⏹️  Server kapatılıyor...')
        httpd.server_close()
        print('✅ Server kapatıldı')

if __name__ == '__main__':
    run_server()