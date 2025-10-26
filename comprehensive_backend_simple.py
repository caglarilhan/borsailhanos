#!/usr/bin/env python3
import json
import random
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime

class SimpleAPI(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"📡 {args[0].split()[0]} {args[0].split()[1]}")
    
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')                                                        
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()
    
    def do_OPTIONS(self):
        self._set_headers(200)
    
    def do_GET(self):
        path = self.path.split('?')[0]
        
        if path == '/api/signals':
            self._set_headers(200)
            response = {
                'timestamp': datetime.now().isoformat(),
                'signals': [
                    {'symbol': 'THYAO', 'signal': 'BUY', 'confidence': 85.2, 'price': 245.50, 'change': 2.3, 'timestamp': datetime.now().isoformat()},                                                   
                    {'symbol': 'TUPRS', 'signal': 'SELL', 'confidence': 78.7, 'price': 180.30, 'change': -1.8, 'timestamp': datetime.now().isoformat()},                                                 
                    {'symbol': 'ASELS', 'signal': 'HOLD', 'confidence': 72.1, 'price': 48.20, 'change': 0.5, 'timestamp': datetime.now().isoformat()}                                                    
                ]
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
        
        elif path == '/api/metrics':
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
        
        elif path == '/api/chart':
            # Parse query parameters
            query_params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            symbol = query_params.get('symbol', ['THYAO'])[0]
            range_param = query_params.get('range', ['1D'])[0]
            
            self._set_headers(200)
            
            # Generate mock chart data based on range
            chart_data = []
            base_price = {'THYAO': 245.50, 'TUPRS': 180.30, 'ASELS': 48.20}.get(symbol, 100.0)
            
            if range_param == '1D':
                # Hourly data for 1 day
                for i in range(24):
                    time_str = f"{i:02d}:00"
                    price = base_price * (1 + random.uniform(-0.05, 0.05))
                    chart_data.append({
                        'time': time_str,
                        'price': round(price, 2),
                        'volume': random.randint(1000000, 5000000)
                    })
            elif range_param == '1W':
                # Daily data for 1 week
                for i in range(7):
                    time_str = f"Day {i+1}"
                    price = base_price * (1 + random.uniform(-0.1, 0.1))
                    chart_data.append({
                        'time': time_str,
                        'price': round(price, 2),
                        'volume': random.randint(5000000, 15000000)
                    })
            elif range_param == '1M':
                # Weekly data for 1 month
                for i in range(4):
                    time_str = f"Week {i+1}"
                    price = base_price * (1 + random.uniform(-0.15, 0.15))
                    chart_data.append({
                        'time': time_str,
                        'price': round(price, 2),
                        'volume': random.randint(10000000, 30000000)
                    })
            else:  # 3M
                # Monthly data for 3 months
                for i in range(3):
                    time_str = f"Month {i+1}"
                    price = base_price * (1 + random.uniform(-0.2, 0.2))
                    chart_data.append({
                        'time': time_str,
                        'price': round(price, 2),
                        'volume': random.randint(20000000, 50000000)
                    })
            
            response = {
                'timestamp': datetime.now().isoformat(),
                'symbol': symbol,
                'range': range_param,
                'chartData': chart_data
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
        
        elif path == '/api/market/overview':
            self._set_headers(200)
            response = {
                'timestamp': datetime.now().isoformat(),
                'markets': [
                    {'symbol': 'THYAO', 'price': 245.50, 'change': 2.3, 'volume': 15000000},                                          
                    {'symbol': 'TUPRS', 'price': 180.30, 'change': -1.8, 'volume': 8000000},                                          
                    {'symbol': 'ASELS', 'price': 48.20, 'change': 0.5, 'volume': 12000000}                                            
                ]
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
        
        else:
            self._set_headers(404)
            response = {'error': 'Endpoint bulunamadı', 'path': path}                                                                 
            self.wfile.write(json.dumps(response).encode('utf-8'))

def run_server():
    port = 8000
    httpd = HTTPServer(('', port), SimpleAPI)
    print('=' * 70)
    print('🚀 BIST AI Backend v3.4 Fix Edition - Port 8000')
    print('=' * 70)
    print(f'📡 http://localhost:{port}/api/signals')
    print(f'📡 http://localhost:{port}/api/metrics')
    print(f'📡 http://localhost:{port}/api/chart')
    print(f'📡 http://localhost:{port}/api/market/overview')
    print('=' * 70)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n⏹️  Server kapatılıyor...')
        httpd.server_close()

if __name__ == '__main__':
    run_server()


