"""
Crypto Markets Integration
Bitcoin, Ethereum, altcoin entegrasyonu ve analizi
"""

import numpy as np
import pandas as pd
import logging
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import json
import requests
import asyncio
import aiohttp
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class CryptoExchange(Enum):
    """Kripto borsaları"""
    BINANCE = "binance"
    COINBASE = "coinbase"
    KRAKEN = "kraken"
    KUCOIN = "kucoin"
    BYBIT = "bybit"

@dataclass
class CryptoAsset:
    """Kripto varlık"""
    symbol: str
    name: str
    market_cap: float
    volume_24h: float
    price: float
    change_24h: float
    change_7d: float
    market_cap_rank: int
    category: str  # 'coin', 'token', 'defi', 'nft', etc.

class CryptoDataProvider:
    """Kripto veri sağlayıcısı"""
    
    def __init__(self):
        self.coinmarketcap_api_key = None  # CoinMarketCap API key
        self.coingecko_api_key = None      # CoinGecko API key
        self.binance_api_key = None        # Binance API key
        
    def get_top_cryptos(self, limit: int = 100) -> List[CryptoAsset]:
        """En büyük kripto paraları getir"""
        try:
            # CoinGecko API (ücretsiz)
            url = f"https://api.coingecko.com/api/v3/coins/markets"
            params = {
                'vs_currency': 'usd',
                'order': 'market_cap_desc',
                'per_page': limit,
                'page': 1,
                'sparkline': False
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                cryptos = []
                
                for item in data:
                    crypto = CryptoAsset(
                        symbol=item['symbol'].upper(),
                        name=item['name'],
                        market_cap=item['market_cap'] or 0,
                        volume_24h=item['total_volume'] or 0,
                        price=item['current_price'] or 0,
                        change_24h=item['price_change_percentage_24h'] or 0,
                        change_7d=item['price_change_percentage_7d_in_currency'] or 0,
                        market_cap_rank=item['market_cap_rank'] or 0,
                        category=item.get('categories', ['coin'])[0] if item.get('categories') else 'coin'
                    )
                    cryptos.append(crypto)
                
                logger.info(f"✅ {len(cryptos)} kripto para verisi alındı")
                return cryptos
            else:
                logger.error(f"❌ CoinGecko API hatası: {response.status_code}")
                return self._get_mock_cryptos(limit)
                
        except Exception as e:
            logger.error(f"❌ Kripto veri alma hatası: {e}")
            return self._get_mock_cryptos(limit)
    
    def _get_mock_cryptos(self, limit: int) -> List[CryptoAsset]:
        """Mock kripto verisi"""
        mock_cryptos = [
            CryptoAsset("BTC", "Bitcoin", 800000000000, 25000000000, 42000, 2.5, 8.3, 1, "coin"),
            CryptoAsset("ETH", "Ethereum", 300000000000, 15000000000, 2500, 1.8, 12.1, 2, "coin"),
            CryptoAsset("BNB", "Binance Coin", 50000000000, 2000000000, 350, -0.5, 5.2, 3, "token"),
            CryptoAsset("ADA", "Cardano", 15000000000, 800000000, 0.45, 3.2, 15.7, 4, "coin"),
            CryptoAsset("SOL", "Solana", 12000000000, 600000000, 28, 4.1, 22.3, 5, "coin"),
            CryptoAsset("XRP", "XRP", 10000000000, 500000000, 0.52, -1.2, 3.8, 6, "coin"),
            CryptoAsset("DOT", "Polkadot", 8000000000, 400000000, 6.5, 2.8, 18.9, 7, "coin"),
            CryptoAsset("DOGE", "Dogecoin", 6000000000, 300000000, 0.08, 5.5, 25.1, 8, "coin"),
            CryptoAsset("AVAX", "Avalanche", 5000000000, 250000000, 20, 1.9, 14.6, 9, "coin"),
            CryptoAsset("MATIC", "Polygon", 4000000000, 200000000, 0.85, 2.3, 11.2, 10, "token")
        ]
        
        logger.info(f"🤖 {len(mock_cryptos)} mock kripto verisi oluşturuldu")
        return mock_cryptos[:limit]
    
    def get_crypto_price_history(self, symbol: str, days: int = 30) -> pd.DataFrame:
        """Kripto fiyat geçmişi"""
        try:
            # CoinGecko API ile fiyat geçmişi
            url = f"https://api.coingecko.com/api/v3/coins/{symbol.lower()}/market_chart"
            params = {
                'vs_currency': 'usd',
                'days': days,
                'interval': 'daily'
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # DataFrame oluştur
                prices = data['prices']
                volumes = data['total_volumes']
                market_caps = data['market_caps']
                
                df = pd.DataFrame({
                    'timestamp': [datetime.fromtimestamp(p[0]/1000) for p in prices],
                    'price': [p[1] for p in prices],
                    'volume': [v[1] for v in volumes],
                    'market_cap': [m[1] for m in market_caps]
                })
                
                df.set_index('timestamp', inplace=True)
                df.sort_index(inplace=True)
                
                logger.info(f"✅ {symbol} fiyat geçmişi alındı: {len(df)} gün")
                return df
            else:
                logger.error(f"❌ {symbol} fiyat geçmişi alınamadı: {response.status_code}")
                return self._get_mock_price_history(symbol, days)
                
        except Exception as e:
            logger.error(f"❌ {symbol} fiyat geçmişi hatası: {e}")
            return self._get_mock_price_history(symbol, days)
    
    def _get_mock_price_history(self, symbol: str, days: int) -> pd.DataFrame:
        """Mock fiyat geçmişi"""
        dates = pd.date_range(end=datetime.now(), periods=days, freq='D')
        
        # Simüle edilmiş fiyat hareketi
        np.random.seed(hash(symbol) % 2**32)
        base_price = 100 if symbol == 'BTC' else 50
        returns = np.random.normal(0, 0.05, days)  # %5 günlük volatilite
        
        prices = [base_price]
        for ret in returns[1:]:
            prices.append(prices[-1] * (1 + ret))
        
        df = pd.DataFrame({
            'price': prices,
            'volume': np.random.randint(1000000, 10000000, days),
            'market_cap': [p * 1000000 for p in prices]  # Basit market cap
        }, index=dates)
        
        logger.info(f"🤖 {symbol} mock fiyat geçmişi oluşturuldu: {len(df)} gün")
        return df
    
    def get_crypto_fear_greed_index(self) -> Dict:
        """Crypto Fear & Greed Index"""
        try:
            url = "https://api.alternative.me/fng/"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                fng_data = data['data'][0]
                
                return {
                    'value': int(fng_data['value']),
                    'classification': fng_data['value_classification'],
                    'timestamp': datetime.fromtimestamp(int(fng_data['timestamp'])),
                    'success': True
                }
            else:
                return self._get_mock_fear_greed()
                
        except Exception as e:
            logger.error(f"❌ Fear & Greed Index hatası: {e}")
            return self._get_mock_fear_greed()
    
    def _get_mock_fear_greed(self) -> Dict:
        """Mock Fear & Greed Index"""
        value = np.random.randint(20, 80)
        classifications = {
            (0, 25): "Extreme Fear",
            (25, 45): "Fear", 
            (45, 55): "Neutral",
            (55, 75): "Greed",
            (75, 100): "Extreme Greed"
        }
        
        classification = next(
            (v for k, v in classifications.items() if k[0] <= value < k[1]),
            "Neutral"
        )
        
        return {
            'value': value,
            'classification': classification,
            'timestamp': datetime.now(),
            'success': True
        }

class CryptoAnalyzer:
    """Kripto analiz motoru"""
    
    def __init__(self):
        self.data_provider = CryptoDataProvider()
    
    def analyze_crypto_market(self) -> Dict:
        """Genel kripto market analizi"""
        try:
            logger.info("🚀 Kripto market analizi başlıyor...")
            
            # Top cryptos al
            cryptos = self.data_provider.get_top_cryptos(50)
            
            # Market metrikleri hesapla
            total_market_cap = sum(c.market_cap for c in cryptos)
            total_volume_24h = sum(c.volume_24h for c in cryptos)
            
            # Performans analizi
            positive_24h = len([c for c in cryptos if c.change_24h > 0])
            negative_24h = len([c for c in cryptos if c.change_24h < 0])
            
            positive_7d = len([c for c in cryptos if c.change_7d > 0])
            negative_7d = len([c for c in cryptos if c.change_7d < 0])
            
            # En iyi ve en kötü performans
            best_24h = max(cryptos, key=lambda x: x.change_24h)
            worst_24h = min(cryptos, key=lambda x: x.change_24h)
            
            best_7d = max(cryptos, key=lambda x: x.change_7d)
            worst_7d = min(cryptos, key=lambda x: x.change_7d)
            
            # Fear & Greed Index
            fng = self.data_provider.get_crypto_fear_greed_index()
            
            # Kategorilere göre analiz
            categories = {}
            for crypto in cryptos:
                cat = crypto.category
                if cat not in categories:
                    categories[cat] = []
                categories[cat].append(crypto)
            
            category_performance = {}
            for cat, coins in categories.items():
                avg_change_24h = np.mean([c.change_24h for c in coins])
                avg_change_7d = np.mean([c.change_7d for c in coins])
                category_performance[cat] = {
                    'count': len(coins),
                    'avg_change_24h': avg_change_24h,
                    'avg_change_7d': avg_change_7d,
                    'total_market_cap': sum(c.market_cap for c in coins)
                }
            
            result = {
                'success': True,
                'timestamp': datetime.now().isoformat(),
                'market_overview': {
                    'total_market_cap': total_market_cap,
                    'total_volume_24h': total_volume_24h,
                    'crypto_count': len(cryptos),
                    'market_cap_change_24h': np.mean([c.change_24h for c in cryptos])
                },
                'performance_analysis': {
                    'positive_24h': positive_24h,
                    'negative_24h': negative_24h,
                    'positive_7d': positive_7d,
                    'negative_7d': negative_7d,
                    'best_24h': {
                        'symbol': best_24h.symbol,
                        'name': best_24h.name,
                        'change': best_24h.change_24h
                    },
                    'worst_24h': {
                        'symbol': worst_24h.symbol,
                        'name': worst_24h.name,
                        'change': worst_24h.change_24h
                    },
                    'best_7d': {
                        'symbol': best_7d.symbol,
                        'name': best_7d.name,
                        'change': best_7d.change_7d
                    },
                    'worst_7d': {
                        'symbol': worst_7d.symbol,
                        'name': worst_7d.name,
                        'change': worst_7d.change_7d
                    }
                },
                'fear_greed_index': fng,
                'category_analysis': category_performance,
                'top_cryptos': [
                    {
                        'symbol': c.symbol,
                        'name': c.name,
                        'price': c.price,
                        'market_cap': c.market_cap,
                        'change_24h': c.change_24h,
                        'change_7d': c.change_7d,
                        'rank': c.market_cap_rank
                    }
                    for c in cryptos[:20]  # Top 20
                ]
            }
            
            logger.info("✅ Kripto market analizi tamamlandı")
            return result
            
        except Exception as e:
            logger.error(f"❌ Kripto market analizi hatası: {e}")
            return {'error': str(e)}
    
    def analyze_crypto_technical(self, symbol: str, days: int = 30) -> Dict:
        """Kripto teknik analizi"""
        try:
            logger.info(f"🚀 {symbol} teknik analizi başlıyor...")
            
            # Fiyat geçmişi al
            df = self.data_provider.get_crypto_price_history(symbol, days)
            
            if df.empty:
                return {'error': f'{symbol} için veri bulunamadı'}
            
            # Teknik indikatörler hesapla
            df['sma_7'] = df['price'].rolling(7).mean()
            df['sma_14'] = df['price'].rolling(14).mean()
            df['sma_30'] = df['price'].rolling(30).mean()
            
            df['ema_7'] = df['price'].ewm(span=7).mean()
            df['ema_14'] = df['price'].ewm(span=14).mean()
            
            # RSI hesapla
            delta = df['price'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            df['rsi'] = 100 - (100 / (1 + rs))
            
            # Bollinger Bands
            sma_20 = df['price'].rolling(20).mean()
            std_20 = df['price'].rolling(20).std()
            df['bb_upper'] = sma_20 + (std_20 * 2)
            df['bb_lower'] = sma_20 - (std_20 * 2)
            df['bb_middle'] = sma_20
            
            # MACD
            ema_12 = df['price'].ewm(span=12).mean()
            ema_26 = df['price'].ewm(span=26).mean()
            df['macd'] = ema_12 - ema_26
            df['macd_signal'] = df['macd'].ewm(span=9).mean()
            df['macd_histogram'] = df['macd'] - df['macd_signal']
            
            # Volatilite
            df['volatility'] = df['price'].pct_change().rolling(14).std() * np.sqrt(365)
            
            # Son değerler
            latest = df.iloc[-1]
            prev = df.iloc[-2]
            
            # Sinyaller
            signals = {
                'ma_cross': 'bullish' if latest['sma_7'] > latest['sma_14'] else 'bearish',
                'rsi_signal': 'oversold' if latest['rsi'] < 30 else 'overbought' if latest['rsi'] > 70 else 'neutral',
                'bb_position': 'upper' if latest['price'] > latest['bb_upper'] else 'lower' if latest['price'] < latest['bb_lower'] else 'middle',
                'macd_signal': 'bullish' if latest['macd'] > latest['macd_signal'] else 'bearish',
                'trend': 'uptrend' if latest['price'] > latest['sma_30'] else 'downtrend'
            }
            
            # Güven skoru (0-100)
            confidence_score = 0
            
            # MA cross sinyali
            if signals['ma_cross'] == 'bullish':
                confidence_score += 20
            elif signals['ma_cross'] == 'bearish':
                confidence_score -= 20
            
            # RSI sinyali
            if signals['rsi_signal'] == 'oversold':
                confidence_score += 15
            elif signals['rsi_signal'] == 'overbought':
                confidence_score -= 15
            
            # BB pozisyonu
            if signals['bb_position'] == 'lower':
                confidence_score += 10
            elif signals['bb_position'] == 'upper':
                confidence_score -= 10
            
            # MACD sinyali
            if signals['macd_signal'] == 'bullish':
                confidence_score += 15
            elif signals['macd_signal'] == 'bearish':
                confidence_score -= 15
            
            # Trend
            if signals['trend'] == 'uptrend':
                confidence_score += 20
            elif signals['trend'] == 'downtrend':
                confidence_score -= 20
            
            confidence_score = max(0, min(100, confidence_score))
            
            result = {
                'success': True,
                'symbol': symbol,
                'timestamp': datetime.now().isoformat(),
                'current_price': latest['price'],
                'price_change_24h': ((latest['price'] - prev['price']) / prev['price']) * 100,
                'technical_indicators': {
                    'sma_7': latest['sma_7'],
                    'sma_14': latest['sma_14'],
                    'sma_30': latest['sma_30'],
                    'ema_7': latest['ema_7'],
                    'ema_14': latest['ema_14'],
                    'rsi': latest['rsi'],
                    'bb_upper': latest['bb_upper'],
                    'bb_middle': latest['bb_middle'],
                    'bb_lower': latest['bb_lower'],
                    'macd': latest['macd'],
                    'macd_signal': latest['macd_signal'],
                    'volatility': latest['volatility']
                },
                'signals': signals,
                'confidence_score': confidence_score,
                'recommendation': self._get_recommendation(confidence_score)
            }
            
            logger.info(f"✅ {symbol} teknik analizi tamamlandı - Confidence: {confidence_score}")
            return result
            
        except Exception as e:
            logger.error(f"❌ {symbol} teknik analizi hatası: {e}")
            return {'error': str(e)}
    
    def _get_recommendation(self, confidence_score: float) -> str:
        """Güven skoruna göre öneri"""
        if confidence_score >= 80:
            return "STRONG_BUY"
        elif confidence_score >= 60:
            return "BUY"
        elif confidence_score >= 40:
            return "HOLD"
        elif confidence_score >= 20:
            return "SELL"
        else:
            return "STRONG_SELL"

class CryptoPortfolioManager:
    """Kripto portföy yöneticisi"""
    
    def __init__(self):
        self.analyzer = CryptoAnalyzer()
        self.portfolio = {}  # {symbol: quantity}
        self.initial_capital = 100000.0
        self.current_capital = self.initial_capital
    
    def add_crypto(self, symbol: str, quantity: float, price: float = None):
        """Portföye kripto ekle"""
        try:
            if price is None:
                # Güncel fiyatı al
                cryptos = self.analyzer.data_provider.get_top_cryptos(1000)
                crypto = next((c for c in cryptos if c.symbol == symbol.upper()), None)
                if crypto:
                    price = crypto.price
                else:
                    logger.error(f"❌ {symbol} fiyatı bulunamadı")
                    return False
            
            cost = quantity * price
            if cost > self.current_capital:
                logger.error(f"❌ Yetersiz sermaye: {cost} > {self.current_capital}")
                return False
            
            self.portfolio[symbol.upper()] = self.portfolio.get(symbol.upper(), 0) + quantity
            self.current_capital -= cost
            
            logger.info(f"✅ {symbol} portföye eklendi: {quantity} @ {price}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Portföye ekleme hatası: {e}")
            return False
    
    def remove_crypto(self, symbol: str, quantity: float = None):
        """Portföyden kripto çıkar"""
        try:
            symbol = symbol.upper()
            if symbol not in self.portfolio:
                logger.error(f"❌ {symbol} portföyde yok")
                return False
            
            if quantity is None:
                quantity = self.portfolio[symbol]
            
            if quantity > self.portfolio[symbol]:
                logger.error(f"❌ Yetersiz miktar: {quantity} > {self.portfolio[symbol]}")
                return False
            
            # Güncel fiyatı al
            cryptos = self.analyzer.data_provider.get_top_cryptos(1000)
            crypto = next((c for c in cryptos if c.symbol == symbol), None)
            if crypto:
                price = crypto.price
            else:
                logger.error(f"❌ {symbol} fiyatı bulunamadı")
                return False
            
            self.portfolio[symbol] -= quantity
            if self.portfolio[symbol] <= 0:
                del self.portfolio[symbol]
            
            self.current_capital += quantity * price
            
            logger.info(f"✅ {symbol} portföyden çıkarıldı: {quantity} @ {price}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Portföyden çıkarma hatası: {e}")
            return False
    
    def get_portfolio_value(self) -> Dict:
        """Portföy değerini hesapla"""
        try:
            cryptos = self.analyzer.data_provider.get_top_cryptos(1000)
            
            total_value = self.current_capital
            crypto_values = {}
            
            for symbol, quantity in self.portfolio.items():
                crypto = next((c for c in cryptos if c.symbol == symbol), None)
                if crypto:
                    value = quantity * crypto.price
                    crypto_values[symbol] = {
                        'quantity': quantity,
                        'price': crypto.price,
                        'value': value,
                        'change_24h': crypto.change_24h
                    }
                    total_value += value
            
            # Performans hesapla
            total_return = (total_value / self.initial_capital - 1) * 100
            
            return {
                'success': True,
                'total_value': total_value,
                'total_return': total_return,
                'current_capital': self.current_capital,
                'crypto_holdings': crypto_values,
                'holdings_count': len(self.portfolio),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Portföy değeri hesaplama hatası: {e}")
            return {'error': str(e)}

# Global instances
crypto_analyzer = CryptoAnalyzer()
crypto_portfolio_manager = CryptoPortfolioManager()
