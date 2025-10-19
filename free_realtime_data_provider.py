"""
BIST AI Smart Trader - Ücretsiz Anlık Veri Sağlayıcısı
Çoklu kaynak ile sürekli çalışan anlık veri sistemi
"""

import requests
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import asyncio
import time
import threading
from typing import List, Dict, Optional, Tuple
import yfinance as yf

class FreeRealTimeDataProvider:
    def __init__(self):
        # Ücretsiz veri kaynakları
        self.data_sources = {
            'yfinance': {
                'enabled': True,
                'rate_limit': 2000,  # requests/hour
                'last_request': 0,
                'min_interval': 1.8  # seconds between requests
            },
            'alpha_vantage': {
                'enabled': False,  # API key gerekli
                'rate_limit': 5,  # requests/minute (free)
                'api_key': None
            },
            'finnhub': {
                'enabled': False,  # API key gerekli
                'rate_limit': 60,  # requests/minute (free)
                'api_key': None
            },
            'polygon': {
                'enabled': False,  # API key gerekli
                'rate_limit': 5,  # requests/minute (free)
                'api_key': None
            }
        }
        
        # BIST hisse sembolleri
        self.bist_symbols = [
            'AKBNK.IS', 'ARCLK.IS', 'ASELS.IS', 'BIMAS.IS', 'EKGYO.IS',
            'EREGL.IS', 'FROTO.IS', 'GARAN.IS', 'HALKB.IS', 'ISCTR.IS',
            'KCHOL.IS', 'KOZAL.IS', 'KOZAA.IS', 'PETKM.IS', 'PGSUS.IS',
            'SAHOL.IS', 'SASA.IS', 'SISE.IS', 'TAVHL.IS', 'THYAO.IS',
            'TKFEN.IS', 'TOASO.IS', 'TUPRS.IS', 'VAKBN.IS', 'YKBNK.IS',
            'ZOREN.IS', 'ADNAC.IS', 'BUCIM.IS', 'CCOLA.IS', 'DOHOL.IS'
        ]
        
        # ABD hisse sembolleri
        self.us_symbols = [
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
            'AMD', 'INTC', 'CRM', 'ADBE', 'PYPL', 'UBER', 'LYFT', 'ZOOM'
        ]
        
        # Veri cache
        self.price_cache = {}
        self.last_update = {}
        self.cache_duration = 30  # seconds
        
        # WebSocket bağlantıları (mock)
        self.websocket_connections = {}
        
        # Rate limiting
        self.request_times = []
        
    def _rate_limit_check(self, source: str) -> bool:
        """Rate limit kontrolü"""
        try:
            source_config = self.data_sources[source]
            if not source_config['enabled']:
                return False
            
            current_time = time.time()
            
            # Son istek zamanını kontrol et
            if current_time - source_config['last_request'] < source_config['min_interval']:
                return False
            
            # Rate limit kontrolü
            self.request_times.append(current_time)
            # Son 1 saatteki istekleri say
            recent_requests = [t for t in self.request_times if current_time - t < 3600]
            if len(recent_requests) > source_config['rate_limit']:
                return False
            
            source_config['last_request'] = current_time
            return True
            
        except Exception as e:
            print(f"⚠️ Rate limit kontrol hatası: {e}")
            return False
    
    def get_realtime_price(self, symbol: str, source: str = 'yfinance') -> Dict:
        """Tek hisse için anlık fiyat"""
        try:
            # Cache kontrolü
            cache_key = f"{symbol}_{source}"
            if cache_key in self.price_cache:
                cache_time = self.last_update.get(cache_key, 0)
                if time.time() - cache_time < self.cache_duration:
                    return self.price_cache[cache_key]
            
            # Rate limit kontrolü
            if not self._rate_limit_check(source):
                return self._get_cached_or_mock_price(symbol)
            
            if source == 'yfinance':
                return self._get_yfinance_price(symbol)
            elif source == 'alpha_vantage':
                return self._get_alpha_vantage_price(symbol)
            elif source == 'finnhub':
                return self._get_finnhub_price(symbol)
            else:
                return self._get_mock_price(symbol)
                
        except Exception as e:
            print(f"⚠️ {symbol} anlık fiyat hatası: {e}")
            return self._get_mock_price(symbol)
    
    def _get_yfinance_price(self, symbol: str) -> Dict:
        """Yahoo Finance'den fiyat al"""
        try:
            ticker = yf.Ticker(symbol)
            
            # Anlık fiyat bilgisi
            info = ticker.info
            hist = ticker.history(period="1d", interval="1m")
            
            if hist.empty:
                return self._get_mock_price(symbol)
            
            latest = hist.iloc[-1]
            prev_close = hist.iloc[-2]['Close'] if len(hist) > 1 else latest['Close']
            
            price_data = {
                'symbol': symbol.replace('.IS', ''),
                'price': float(latest['Close']),
                'change': float(latest['Close'] - prev_close),
                'change_percent': float((latest['Close'] - prev_close) / prev_close * 100),
                'volume': int(latest['Volume']),
                'high': float(latest['High']),
                'low': float(latest['Low']),
                'open': float(latest['Open']),
                'timestamp': datetime.now().isoformat(),
                'source': 'yfinance',
                'market_cap': info.get('marketCap', 0),
                'pe_ratio': info.get('trailingPE', 0),
                'dividend_yield': info.get('dividendYield', 0) * 100 if info.get('dividendYield') else 0
            }
            
            # Cache'e kaydet
            cache_key = f"{symbol}_yfinance"
            self.price_cache[cache_key] = price_data
            self.last_update[cache_key] = time.time()
            
            return price_data
            
        except Exception as e:
            print(f"⚠️ Yahoo Finance hatası: {e}")
            return self._get_mock_price(symbol)
    
    def _get_alpha_vantage_price(self, symbol: str) -> Dict:
        """Alpha Vantage'den fiyat al (API key gerekli)"""
        # Mock implementasyon - gerçek API key ile aktif edilebilir
        return self._get_mock_price(symbol)
    
    def _get_finnhub_price(self, symbol: str) -> Dict:
        """Finnhub'dan fiyat al (API key gerekli)"""
        # Mock implementasyon - gerçek API key ile aktif edilebilir
        return self._get_mock_price(symbol)
    
    def _get_mock_price(self, symbol: str) -> Dict:
        """Mock fiyat verisi"""
        base_price = 100 + hash(symbol) % 200  # Sembole göre sabit fiyat
        change = np.random.uniform(-5, 5)
        
        return {
            'symbol': symbol.replace('.IS', ''),
            'price': base_price + change,
            'change': change,
            'change_percent': (change / base_price) * 100,
            'volume': np.random.randint(1000000, 10000000),
            'high': base_price + abs(change) + np.random.uniform(0, 2),
            'low': base_price - abs(change) - np.random.uniform(0, 2),
            'open': base_price + np.random.uniform(-1, 1),
            'timestamp': datetime.now().isoformat(),
            'source': 'mock',
            'market_cap': base_price * np.random.randint(1000000, 10000000),
            'pe_ratio': np.random.uniform(5, 25),
            'dividend_yield': np.random.uniform(0, 5)
        }
    
    def _get_cached_or_mock_price(self, symbol: str) -> Dict:
        """Cache'den veya mock veri"""
        cache_key = f"{symbol}_yfinance"
        if cache_key in self.price_cache:
            return self.price_cache[cache_key]
        return self._get_mock_price(symbol)
    
    def get_bulk_realtime_prices(self, symbols: List[str], source: str = 'yfinance') -> List[Dict]:
        """Toplu anlık fiyatlar"""
        try:
            prices = []
            for symbol in symbols:
                try:
                    price_data = self.get_realtime_price(symbol, source)
                    prices.append(price_data)
                    
                    # Rate limiting için bekle
                    if source == 'yfinance':
                        time.sleep(0.1)  # 100ms bekle
                        
                except Exception as e:
                    print(f"⚠️ {symbol} bulk fiyat hatası: {e}")
                    continue
            
            return prices
            
        except Exception as e:
            print(f"⚠️ Bulk fiyat hatası: {e}")
            return []
    
    def get_bist_realtime_prices(self, limit: int = 10) -> List[Dict]:
        """BIST hisseleri için anlık fiyatlar"""
        try:
            symbols = self.bist_symbols[:limit]
            return self.get_bulk_realtime_prices(symbols, 'yfinance')
        except Exception as e:
            print(f"⚠️ BIST anlık fiyat hatası: {e}")
            return []
    
    def get_us_realtime_prices(self, limit: int = 10) -> List[Dict]:
        """ABD hisseleri için anlık fiyatlar"""
        try:
            symbols = self.us_symbols[:limit]
            return self.get_bulk_realtime_prices(symbols, 'yfinance')
        except Exception as e:
            print(f"⚠️ ABD anlık fiyat hatası: {e}")
            return []
    
    def get_market_overview(self) -> Dict:
        """Piyasa genel durumu"""
        try:
            # BIST ve ABD hisselerinden örnekler
            bist_prices = self.get_bist_realtime_prices(5)
            us_prices = self.get_us_realtime_prices(5)
            
            # Piyasa istatistikleri
            all_prices = bist_prices + us_prices
            
            if not all_prices:
                return {
                    'success': False,
                    'error': 'Fiyat verisi alınamadı',
                    'timestamp': datetime.now().isoformat()
                }
            
            # İstatistikler
            total_change = sum(price['change_percent'] for price in all_prices)
            avg_change = total_change / len(all_prices)
            
            positive_count = sum(1 for price in all_prices if price['change_percent'] > 0)
            negative_count = len(all_prices) - positive_count
            
            # En iyi ve en kötü performans
            best_performer = max(all_prices, key=lambda x: x['change_percent'])
            worst_performer = min(all_prices, key=lambda x: x['change_percent'])
            
            return {
                'success': True,
                'market_summary': {
                    'total_stocks': len(all_prices),
                    'average_change': avg_change,
                    'positive_count': positive_count,
                    'negative_count': negative_count,
                    'best_performer': {
                        'symbol': best_performer['symbol'],
                        'change_percent': best_performer['change_percent']
                    },
                    'worst_performer': {
                        'symbol': worst_performer['symbol'],
                        'change_percent': worst_performer['change_percent']
                    }
                },
                'bist_prices': bist_prices,
                'us_prices': us_prices,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"⚠️ Piyasa genel durumu hatası: {e}")
            return {
                'success': False,
                'error': f'Piyasa genel durumu hatası: {str(e)}',
                'timestamp': datetime.now().isoformat()
            }
    
    def start_realtime_stream(self, symbols: List[str], callback_func) -> bool:
        """Anlık veri akışını başlat (mock WebSocket)"""
        try:
            def stream_worker():
                while True:
                    try:
                        for symbol in symbols:
                            price_data = self.get_realtime_price(symbol)
                            if callback_func:
                                callback_func(price_data)
                        
                        time.sleep(5)  # 5 saniyede bir güncelle
                        
                    except Exception as e:
                        print(f"⚠️ Stream worker hatası: {e}")
                        time.sleep(10)
            
            # Thread'i başlat
            stream_thread = threading.Thread(target=stream_worker, daemon=True)
            stream_thread.start()
            
            return True
            
        except Exception as e:
            print(f"⚠️ Realtime stream başlatma hatası: {e}")
            return False
    
    def get_technical_indicators(self, symbol: str, period: str = '1d') -> Dict:
        """Teknik göstergeler"""
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period, interval="1m")
            
            if hist.empty:
                return self._get_mock_technical_indicators(symbol)
            
            # Basit teknik göstergeler
            closes = hist['Close'].values
            
            # RSI (14 periyot)
            rsi = self._calculate_rsi(closes, 14)
            
            # SMA (20 periyot)
            sma20 = np.mean(closes[-20:]) if len(closes) >= 20 else np.mean(closes)
            
            # MACD
            macd_line, signal_line = self._calculate_macd(closes)
            
            # Bollinger Bands
            bb_upper, bb_middle, bb_lower = self._calculate_bollinger_bands(closes)
            
            return {
                'symbol': symbol.replace('.IS', ''),
                'rsi': float(rsi[-1]) if len(rsi) > 0 else 50,
                'sma20': float(sma20),
                'macd': float(macd_line[-1]) if len(macd_line) > 0 else 0,
                'macd_signal': float(signal_line[-1]) if len(signal_line) > 0 else 0,
                'bb_upper': float(bb_upper[-1]) if len(bb_upper) > 0 else closes[-1],
                'bb_middle': float(bb_middle[-1]) if len(bb_middle) > 0 else closes[-1],
                'bb_lower': float(bb_lower[-1]) if len(bb_lower) > 0 else closes[-1],
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"⚠️ Teknik göstergeler hatası: {e}")
            return self._get_mock_technical_indicators(symbol)
    
    def _calculate_rsi(self, prices: np.ndarray, period: int = 14) -> np.ndarray:
        """RSI hesapla"""
        try:
            deltas = np.diff(prices)
            gains = np.where(deltas > 0, deltas, 0)
            losses = np.where(deltas < 0, -deltas, 0)
            
            avg_gains = np.zeros_like(prices)
            avg_losses = np.zeros_like(prices)
            
            for i in range(period, len(prices)):
                avg_gains[i] = np.mean(gains[i-period:i])
                avg_losses[i] = np.mean(losses[i-period:i])
            
            rs = avg_gains / (avg_losses + 1e-10)
            rsi = 100 - (100 / (1 + rs))
            
            return rsi
            
        except Exception as e:
            print(f"⚠️ RSI hesaplama hatası: {e}")
            return np.full(len(prices), 50)
    
    def _calculate_macd(self, prices: np.ndarray, fast: int = 12, slow: int = 26, signal: int = 9) -> Tuple[np.ndarray, np.ndarray]:
        """MACD hesapla"""
        try:
            ema_fast = self._calculate_ema(prices, fast)
            ema_slow = self._calculate_ema(prices, slow)
            
            macd_line = ema_fast - ema_slow
            signal_line = self._calculate_ema(macd_line, signal)
            
            return macd_line, signal_line
            
        except Exception as e:
            print(f"⚠️ MACD hesaplama hatası: {e}")
            return np.zeros_like(prices), np.zeros_like(prices)
    
    def _calculate_ema(self, prices: np.ndarray, period: int) -> np.ndarray:
        """EMA hesapla"""
        try:
            alpha = 2 / (period + 1)
            ema = np.zeros_like(prices)
            ema[0] = prices[0]
            
            for i in range(1, len(prices)):
                ema[i] = alpha * prices[i] + (1 - alpha) * ema[i-1]
            
            return ema
            
        except Exception as e:
            print(f"⚠️ EMA hesaplama hatası: {e}")
            return prices
    
    def _calculate_bollinger_bands(self, prices: np.ndarray, period: int = 20, std_dev: float = 2) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Bollinger Bands hesapla"""
        try:
            sma = np.zeros_like(prices)
            upper_band = np.zeros_like(prices)
            lower_band = np.zeros_like(prices)
            
            for i in range(period-1, len(prices)):
                sma[i] = np.mean(prices[i-period+1:i+1])
                std = np.std(prices[i-period+1:i+1])
                upper_band[i] = sma[i] + (std_dev * std)
                lower_band[i] = np.maximum(sma[i] - (std_dev * std), 0)
            
            return upper_band, sma, lower_band
            
        except Exception as e:
            print(f"⚠️ Bollinger Bands hesaplama hatası: {e}")
            return prices, prices, prices
    
    def _get_mock_technical_indicators(self, symbol: str) -> Dict:
        """Mock teknik göstergeler"""
        return {
            'symbol': symbol.replace('.IS', ''),
            'rsi': np.random.uniform(20, 80),
            'sma20': np.random.uniform(50, 150),
            'macd': np.random.uniform(-2, 2),
            'macd_signal': np.random.uniform(-2, 2),
            'bb_upper': np.random.uniform(100, 200),
            'bb_middle': np.random.uniform(80, 180),
            'bb_lower': np.random.uniform(60, 160),
            'timestamp': datetime.now().isoformat()
        }

# Test fonksiyonu
if __name__ == "__main__":
    provider = FreeRealTimeDataProvider()
    
    print("🚀 BIST AI Smart Trader - Ücretsiz Anlık Veri Sağlayıcısı Test")
    print("=" * 60)
    
    # Tek hisse testi
    print("\n📊 AKBNK Anlık Fiyat:")
    akbnk_price = provider.get_realtime_price('AKBNK.IS')
    print(f"Fiyat: ₺{akbnk_price['price']:.2f}")
    print(f"Değişim: {akbnk_price['change_percent']:.2f}%")
    print(f"Kaynak: {akbnk_price['source']}")
    
    # Toplu fiyat testi
    print("\n📈 BIST Toplu Fiyatlar:")
    bist_prices = provider.get_bist_realtime_prices(3)
    for price in bist_prices:
        print(f"{price['symbol']}: ₺{price['price']:.2f} ({price['change_percent']:+.2f}%)")
    
    # Piyasa genel durumu
    print("\n🌍 Piyasa Genel Durumu:")
    market_overview = provider.get_market_overview()
    if market_overview['success']:
        summary = market_overview['market_summary']
        print(f"Ortalama Değişim: {summary['average_change']:.2f}%")
        print(f"Pozitif: {summary['positive_count']}, Negatif: {summary['negative_count']}")
        print(f"En İyi: {summary['best_performer']['symbol']} ({summary['best_performer']['change_percent']:+.2f}%)")
    
    # Teknik göstergeler
    print("\n📊 Teknik Göstergeler:")
    technical = provider.get_technical_indicators('AKBNK.IS')
    print(f"RSI: {technical['rsi']:.2f}")
    print(f"SMA20: {technical['sma20']:.2f}")
    print(f"MACD: {technical['macd']:.2f}")
