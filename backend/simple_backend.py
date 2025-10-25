#!/usr/bin/env python3
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime

class SimpleBackend(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/real/trading_signals':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'timestamp': datetime.now().isoformat(),
                'signals': [
                    {'symbol': 'THYAO', 'action': 'BUY', 'confidence': 0.87, 'price': 245.50, 'target': 260.0, 'stop_loss': 235.0, 'reason': 'EMA Cross + RSI Oversold'},
                    {'symbol': 'ASELS', 'action': 'SELL', 'confidence': 0.74, 'price': 48.20, 'target': 42.0, 'stop_loss': 52.0, 'reason': 'Resistance Break + Volume Spike'},
                    {'symbol': 'TUPRS', 'action': 'BUY', 'confidence': 0.91, 'price': 180.30, 'target': 195.0, 'stop_loss': 170.0, 'reason': 'Bullish Engulfing + MACD Cross'}
                ]
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'message': 'BIST AI API v2.0', 'status': 'active'}).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', 8080), SimpleBackend)
    print('🚀 Backend API başlatıldı: http://localhost:8080')
    print('📊 Endpoint: http://localhost:8080/api/real/trading_signals')
    server.serve_forever()
