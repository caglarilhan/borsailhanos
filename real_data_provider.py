"""
Gerçek Finansal Veri Entegrasyonu
yfinance ile Amerika ve BIST hisseleri için gerçek veri çekme
"""

import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import time
import random

class RealDataProvider:
    def __init__(self):
        self.cache = {}
        self.cache_timeout = 300  # 5 dakika cache
        
    def get_stock_data(self, symbol, period="1d", interval="1m"):
        """Gerçek hisse verisi çek"""
        try:
            # Cache kontrolü
            cache_key = f"{symbol}_{period}_{interval}"
            if cache_key in self.cache:
                data, timestamp = self.cache[cache_key]
                if time.time() - timestamp < self.cache_timeout:
                    return data
            
            # yfinance ile veri çek
            ticker = yf.Ticker(symbol)
            data = ticker.history(period=period, interval=interval)
            
            if data.empty:
                return None
                
            # Cache'e kaydet
            self.cache[cache_key] = (data, time.time())
            return data
            
        except Exception as e:
            print(f"Veri çekme hatası {symbol}: {e}")
            return None
    
    def get_current_price(self, symbol):
        """Güncel fiyat al"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            return info.get('currentPrice', info.get('regularMarketPrice', 0))
        except:
            return 0
    
    def get_price_change(self, symbol):
        """Fiyat değişimi al"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            current = info.get('currentPrice', info.get('regularMarketPrice', 0))
            previous = info.get('previousClose', current)
            if previous > 0:
                return ((current - previous) / previous) * 100
            return 0
        except:
            return 0
    
    def get_volume(self, symbol):
        """Hacim bilgisi al"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            return info.get('volume', info.get('averageVolume', 0))
        except:
            return 0
    
    def get_market_cap(self, symbol):
        """Piyasa değeri al"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            return info.get('marketCap', 0)
        except:
            return 0
    
    def get_pe_ratio(self, symbol):
        """P/E oranı al"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            return info.get('trailingPE', info.get('forwardPE', 0))
        except:
            return 0
    
    def get_dividend_yield(self, symbol):
        """Temettü verimi al"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            return info.get('dividendYield', 0) * 100 if info.get('dividendYield') else 0
        except:
            return 0
    
    def get_sector(self, symbol):
        """Sektör bilgisi al"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            return info.get('sector', 'Unknown')
        except:
            return 'Unknown'
    
    def get_technical_indicators(self, symbol):
        """Teknik indikatörler hesapla"""
        try:
            data = self.get_stock_data(symbol, period="5d", interval="1d")
            if data is None or data.empty:
                return {}
            
            # RSI hesapla
            delta = data['Close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            
            # MACD hesapla
            ema12 = data['Close'].ewm(span=12).mean()
            ema26 = data['Close'].ewm(span=26).mean()
            macd = ema12 - ema26
            signal = macd.ewm(span=9).mean()
            
            return {
                'rsi': rsi.iloc[-1] if not rsi.empty and not pd.isna(rsi.iloc[-1]) else 50,
                'macd': macd.iloc[-1] if not macd.empty and not pd.isna(macd.iloc[-1]) else 0,
                'signal': signal.iloc[-1] if not signal.empty and not pd.isna(signal.iloc[-1]) else 0,
                'current_price': data['Close'].iloc[-1],
                'volume': data['Volume'].iloc[-1]
            }
        except:
            return {}

# Amerika hisseleri için semboller
US_STOCKS = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'TSLA': 'Tesla Inc.',
    'META': 'Meta Platforms Inc.',
    'NVDA': 'NVIDIA Corporation',
    'JPM': 'JPMorgan Chase & Co.',
    'JNJ': 'Johnson & Johnson',
    'V': 'Visa Inc.',
    'PG': 'Procter & Gamble Co.',
    'UNH': 'UnitedHealth Group Inc.',
    'HD': 'Home Depot Inc.',
    'MA': 'Mastercard Inc.',
    'DIS': 'Walt Disney Co.',
    'PYPL': 'PayPal Holdings Inc.',
    'ADBE': 'Adobe Inc.',
    'CMCSA': 'Comcast Corporation',
    'NFLX': 'Netflix Inc.',
    'CRM': 'Salesforce Inc.'
}

# BIST hisseleri için semboller (yfinance'de .IS uzantısı ile)
BIST_STOCKS = {
    'THYAO.IS': 'Turkish Airlines',
    'ASELS.IS': 'Aselsan Elektronik',
    'TUPRS.IS': 'Tüpraş',
    'SISE.IS': 'Şişe Cam',
    'EREGL.IS': 'Ereğli Demir Çelik',
    'BIMAS.IS': 'BİM Birleşik Mağazalar',
    'KCHOL.IS': 'Koç Holding',
    'SAHOL.IS': 'Sabancı Holding',
    'AKBNK.IS': 'Akbank',
    'ISCTR.IS': 'İş Bankası',
    'GARAN.IS': 'Garanti BBVA',
    'HALKB.IS': 'Halkbank',
    'VAKBN.IS': 'VakıfBank',
    'YKBNK.IS': 'Yapı Kredi',
    'PETKM.IS': 'Petkim',
    'TCELL.IS': 'Turkcell',
    'ARCLK.IS': 'Arçelik',
    'KOZAL.IS': 'Koza Altın',
    'KOZAA.IS': 'Koza Anadolu',
    'TOASO.IS': 'Tofaş'
}

def get_real_trading_signals():
    """Gerçek AI sinyalleri üret"""
    provider = RealDataProvider()
    signals = []
    
    # Amerika hisseleri için sinyaller
    for symbol, name in list(US_STOCKS.items())[:6]:
        try:
            price = provider.get_current_price(symbol)
            change = provider.get_price_change(symbol)
            volume = provider.get_volume(symbol)
            market_cap = provider.get_market_cap(symbol)
            pe_ratio = provider.get_pe_ratio(symbol)
            dividend_yield = provider.get_dividend_yield(symbol)
            sector = provider.get_sector(symbol)
            technicals = provider.get_technical_indicators(symbol)
            
            if price > 0:
                # AI sinyal üretimi (gerçek verilerle)
                rsi = technicals.get('rsi', 50)
                macd = technicals.get('macd', 0)
                
                # NaN kontrolü
                if pd.isna(rsi) or pd.isna(macd):
                    rsi = 50
                    macd = 0
                
                # Sinyal belirleme
                if rsi < 30 and macd > 0 and change > 0:
                    signal = 'BUY'
                    confidence = min(0.95, 0.7 + abs(change) * 0.1)
                elif rsi > 70 and macd < 0 and change < 0:
                    signal = 'SELL'
                    confidence = min(0.95, 0.7 + abs(change) * 0.1)
                else:
                    signal = 'HOLD'
                    confidence = 0.5 + abs(change) * 0.05
                
                signals.append({
                    'symbol': symbol.replace('.IS', ''),
                    'name': name,
                    'signal': signal,
                    'confidence': confidence,
                    'price': price,
                    'change': change,
                    'volume': volume,
                    'market_cap': market_cap,
                    'pe_ratio': pe_ratio,
                    'dividend_yield': dividend_yield,
                    'sector': sector,
                    'rsi': rsi,
                    'macd': macd,
                    'timestamp': datetime.now().isoformat(),
                    'xai_explanation': f"RSI: {rsi:.1f}, MACD: {macd:.3f}, Değişim: {change:.1f}%",
                    'expected_return': change * 0.8,  # Gerçekçi beklenti
                    'stop_loss': price * (0.95 if signal == 'BUY' else 1.05),
                    'take_profit': price * (1.05 if signal == 'BUY' else 0.95)
                })
                
        except Exception as e:
            print(f"Hata {symbol}: {e}")
            continue
    
    return signals

def get_real_market_data():
    """Gerçek piyasa verisi"""
    provider = RealDataProvider()
    market_data = []
    
    # Amerika hisseleri
    for symbol, name in list(US_STOCKS.items())[:10]:
        try:
            price = provider.get_current_price(symbol)
            change = provider.get_price_change(symbol)
            volume = provider.get_volume(symbol)
            market_cap = provider.get_market_cap(symbol)
            pe_ratio = provider.get_pe_ratio(symbol)
            dividend_yield = provider.get_dividend_yield(symbol)
            sector = provider.get_sector(symbol)
            
            if price > 0:
                market_data.append({
                    'symbol': symbol.replace('.IS', ''),
                    'name': name,
                    'price': price,
                    'change': change,
                    'volume': volume,
                    'market_cap': market_cap,
                    'pe_ratio': pe_ratio,
                    'dividend_yield': dividend_yield,
                    'sector': sector
                })
                
        except Exception as e:
            print(f"Hata {symbol}: {e}")
            continue
    
    return market_data

# Test fonksiyonu
if __name__ == "__main__":
    print("🚀 Gerçek Veri Testi Başlıyor...")
    
    # Test sinyalleri
    signals = get_real_trading_signals()
    print(f"✅ {len(signals)} gerçek sinyal üretildi")
    
    for signal in signals[:3]:
        print(f"📈 {signal['symbol']}: {signal['signal']} - ${signal['price']:.2f} ({signal['change']:+.1f}%)")
    
    # Test piyasa verisi
    market_data = get_real_market_data()
    print(f"✅ {len(market_data)} gerçek piyasa verisi alındı")
    
    for data in market_data[:3]:
        print(f"📊 {data['symbol']}: ${data['price']:.2f} ({data['change']:+.1f}%) - {data['sector']}")
