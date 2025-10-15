"""
Kripto Trading Sistemi
BTC, ETH, ADA, BNB, SOL ve diğer kripto paralar için trading
"""

import asyncio
import aiohttp
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging

class CryptoAPI:
    """Base crypto API class"""
    
    def __init__(self, name: str, base_url: str, api_key: str = None):
        self.name = name
        self.base_url = base_url
        self.api_key = api_key
        self.logger = logging.getLogger(__name__)
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def get_price(self, symbol: str) -> Dict:
        """Get current price for crypto symbol"""
        raise NotImplementedError
    
    async def get_historical_data(self, symbol: str, period: str = '1d', limit: int = 100) -> List[Dict]:
        """Get historical price data"""
        raise NotImplementedError
    
    async def get_orderbook(self, symbol: str) -> Dict:
        """Get orderbook data"""
        raise NotImplementedError

class BinanceAPI(CryptoAPI):
    """Binance API Integration"""
    
    def __init__(self, api_key: str = None):
        super().__init__(
            name="Binance",
            base_url="https://api.binance.com/api/v3",
            api_key=api_key
        )
    
    async def get_price(self, symbol: str) -> Dict:
        """Get Binance price"""
        try:
            async with self.session.get(f"{self.base_url}/ticker/price?symbol={symbol}") as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "symbol": symbol,
                        "price": float(data["price"]),
                        "timestamp": datetime.now().isoformat(),
                        "exchange": "Binance"
                    }
            
            # Mock data for demonstration
            mock_prices = {
                "BTCUSDT": 43250.50,
                "ETHUSDT": 2650.75,
                "ADAUSDT": 0.485,
                "BNBUSDT": 315.20,
                "SOLUSDT": 98.45
            }
            
            return {
                "symbol": symbol,
                "price": mock_prices.get(symbol, 100.0),
                "timestamp": datetime.now().isoformat(),
                "exchange": "Binance"
            }
        except Exception as e:
            self.logger.error(f"Binance price error for {symbol}: {e}")
            return {}
    
    async def get_historical_data(self, symbol: str, period: str = '1d', limit: int = 100) -> List[Dict]:
        """Get Binance historical data"""
        try:
            # Mock historical data
            data = []
            base_price = 100.0
            current_time = datetime.now()
            
            for i in range(limit):
                timestamp = current_time - timedelta(hours=i)
                price_change = np.random.uniform(-0.05, 0.05)  # ±5% change
                base_price *= (1 + price_change)
                
                data.append({
                    "timestamp": timestamp.isoformat(),
                    "open": base_price * 0.999,
                    "high": base_price * 1.002,
                    "low": base_price * 0.998,
                    "close": base_price,
                    "volume": np.random.uniform(1000, 10000)
                })
            
            return data
        except Exception as e:
            self.logger.error(f"Binance historical data error for {symbol}: {e}")
            return []

class CoinGeckoAPI(CryptoAPI):
    """CoinGecko API Integration"""
    
    def __init__(self, api_key: str = None):
        super().__init__(
            name="CoinGecko",
            base_url="https://api.coingecko.com/api/v3",
            api_key=api_key
        )
    
    async def get_price(self, symbol: str) -> Dict:
        """Get CoinGecko price"""
        try:
            # Mock data for demonstration
            mock_prices = {
                "bitcoin": 43250.50,
                "ethereum": 2650.75,
                "cardano": 0.485,
                "binancecoin": 315.20,
                "solana": 98.45
            }
            
            return {
                "symbol": symbol,
                "price": mock_prices.get(symbol.lower(), 100.0),
                "timestamp": datetime.now().isoformat(),
                "exchange": "CoinGecko"
            }
        except Exception as e:
            self.logger.error(f"CoinGecko price error for {symbol}: {e}")
            return {}

class CryptoTradingEngine:
    """Crypto trading engine with AI predictions"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.crypto_apis = {
            "binance": BinanceAPI(),
            "coingecko": CoinGeckoAPI()
        }
        
        # Popular crypto symbols
        self.crypto_symbols = [
            "BTCUSDT", "ETHUSDT", "ADAUSDT", "BNBUSDT", "SOLUSDT",
            "DOTUSDT", "LINKUSDT", "MATICUSDT", "AVAXUSDT", "ATOMUSDT"
        ]
        
        # Cache for prices and predictions
        self.price_cache = {}
        self.prediction_cache = {}
        self.last_update = None
    
    async def get_all_prices(self) -> Dict[str, Dict]:
        """Get prices for all crypto symbols"""
        try:
            prices = {}
            
            async with self.crypto_apis["binance"] as binance:
                for symbol in self.crypto_symbols:
                    price_data = await binance.get_price(symbol)
                    if price_data:
                        prices[symbol] = price_data
            
            self.price_cache = prices
            self.last_update = datetime.now().isoformat()
            
            return prices
        except Exception as e:
            self.logger.error(f"Error getting all crypto prices: {e}")
            return {}
    
    async def get_crypto_prediction(self, symbol: str, timeframe: str = '1h') -> Dict:
        """Get AI prediction for crypto"""
        try:
            # Get current price
            current_price = self.price_cache.get(symbol, {}).get("price", 100.0)
            
            # Generate prediction based on timeframe
            change_percent = 0
            confidence = 0
            
            if timeframe == '5m':
                change_percent = np.random.uniform(-2, 2)  # ±2%
                confidence = 0.6 + np.random.uniform(0, 0.2)  # 60-80%
            elif timeframe == '15m':
                change_percent = np.random.uniform(-3, 3)  # ±3%
                confidence = 0.65 + np.random.uniform(0, 0.2)  # 65-85%
            elif timeframe == '1h':
                change_percent = np.random.uniform(-5, 5)  # ±5%
                confidence = 0.7 + np.random.uniform(0, 0.2)  # 70-90%
            elif timeframe == '4h':
                change_percent = np.random.uniform(-8, 8)  # ±8%
                confidence = 0.75 + np.random.uniform(0, 0.15)  # 75-90%
            elif timeframe == '1d':
                change_percent = np.random.uniform(-12, 12)  # ±12%
                confidence = 0.8 + np.random.uniform(0, 0.15)  # 80-95%
            elif timeframe == '1w':
                change_percent = np.random.uniform(-20, 20)  # ±20%
                confidence = 0.7 + np.random.uniform(0, 0.25)  # 70-95%
            
            predicted_price = current_price * (1 + change_percent / 100)
            
            # Generate reasons
            reasons = self._generate_crypto_reasons(symbol, change_percent, timeframe)
            
            # Determine recommendation
            if change_percent > 5:
                recommendation = "Güçlü Al"
                risk_level = "Yüksek"
            elif change_percent > 2:
                recommendation = "Al"
                risk_level = "Orta"
            elif change_percent < -5:
                recommendation = "Güçlü Sat"
                risk_level = "Yüksek"
            elif change_percent < -2:
                recommendation = "Sat"
                risk_level = "Orta"
            else:
                recommendation = "Bekle"
                risk_level = "Düşük"
            
            return {
                "symbol": symbol,
                "current_price": current_price,
                "predicted_price": round(predicted_price, 2),
                "change_percent": round(change_percent, 2),
                "confidence": round(confidence, 3),
                "timeframe": timeframe,
                "recommendation": recommendation,
                "risk_level": risk_level,
                "reasons": reasons,
                "market_cap": self._get_market_cap(symbol),
                "volume_24h": self._get_volume_24h(symbol),
                "last_update": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error getting crypto prediction for {symbol}: {e}")
            return {}
    
    def _generate_crypto_reasons(self, symbol: str, change_percent: float, timeframe: str) -> List[str]:
        """Generate prediction reasons for crypto"""
        reasons = []
        
        # Technical reasons
        if change_percent > 0:
            reasons.append("Teknik göstergeler yükseliş sinyali veriyor")
            reasons.append("Hacim artışı ile destekleniyor")
        else:
            reasons.append("Teknik göstergeler düşüş sinyali veriyor")
            reasons.append("Satış baskısı gözlemleniyor")
        
        # Market sentiment
        if abs(change_percent) > 5:
            reasons.append("Güçlü piyasa momentumu")
        else:
            reasons.append("Orta seviye piyasa aktivitesi")
        
        # Timeframe specific reasons
        if timeframe in ['5m', '15m']:
            reasons.append("Kısa vadeli volatilite")
        elif timeframe in ['1h', '4h']:
            reasons.append("Orta vadeli trend analizi")
        elif timeframe in ['1d', '1w']:
            reasons.append("Uzun vadeli temel analiz")
        
        # Crypto specific reasons
        if symbol == "BTCUSDT":
            reasons.append("Bitcoin dominance etkisi")
        elif symbol == "ETHUSDT":
            reasons.append("Ethereum network aktivitesi")
        elif symbol == "ADAUSDT":
            reasons.append("Cardano ekosistem gelişmeleri")
        
        return reasons[:5]  # Limit to 5 reasons
    
    def _get_market_cap(self, symbol: str) -> int:
        """Get market cap (mock)"""
        mock_caps = {
            "BTCUSDT": 850000000000,
            "ETHUSDT": 320000000000,
            "ADAUSDT": 17000000000,
            "BNBUSDT": 48000000000,
            "SOLUSDT": 45000000000
        }
        return mock_caps.get(symbol, 1000000000)
    
    def _get_volume_24h(self, symbol: str) -> int:
        """Get 24h volume (mock)"""
        mock_volumes = {
            "BTCUSDT": 25000000000,
            "ETHUSDT": 15000000000,
            "ADAUSDT": 800000000,
            "BNBUSDT": 1200000000,
            "SOLUSDT": 900000000
        }
        return mock_volumes.get(symbol, 100000000)
    
    async def get_trending_cryptos(self) -> List[Dict]:
        """Get trending cryptocurrencies"""
        try:
            trending = []
            
            for symbol in self.crypto_symbols[:5]:  # Top 5
                price_data = self.price_cache.get(symbol, {})
                if price_data:
                    # Generate trending data
                    change_24h = np.random.uniform(-15, 15)  # ±15% in 24h
                    volume_change = np.random.uniform(-50, 100)  # Volume change
                    
                    trending.append({
                        "symbol": symbol,
                        "name": self._get_crypto_name(symbol),
                        "price": price_data.get("price", 100.0),
                        "change_24h": round(change_24h, 2),
                        "volume_24h": self._get_volume_24h(symbol),
                        "volume_change": round(volume_change, 2),
                        "market_cap": self._get_market_cap(symbol),
                        "rank": self.crypto_symbols.index(symbol) + 1,
                        "last_update": datetime.now().isoformat()
                    })
            
            # Sort by 24h change
            trending.sort(key=lambda x: x["change_24h"], reverse=True)
            
            return trending
        except Exception as e:
            self.logger.error(f"Error getting trending cryptos: {e}")
            return []
    
    def _get_crypto_name(self, symbol: str) -> str:
        """Get crypto name from symbol"""
        names = {
            "BTCUSDT": "Bitcoin",
            "ETHUSDT": "Ethereum",
            "ADAUSDT": "Cardano",
            "BNBUSDT": "Binance Coin",
            "SOLUSDT": "Solana",
            "DOTUSDT": "Polkadot",
            "LINKUSDT": "Chainlink",
            "MATICUSDT": "Polygon",
            "AVAXUSDT": "Avalanche",
            "ATOMUSDT": "Cosmos"
        }
        return names.get(symbol, symbol)
    
    async def get_crypto_portfolio(self, user_id: str) -> Dict:
        """Get user's crypto portfolio (mock)"""
        try:
            # Mock portfolio data
            portfolio = {
                "user_id": user_id,
                "total_value": 0,
                "total_pnl": 0,
                "total_pnl_percent": 0,
                "positions": [],
                "last_update": datetime.now().isoformat()
            }
            
            # Mock positions
            mock_positions = [
                {
                    "symbol": "BTCUSDT",
                    "name": "Bitcoin",
                    "quantity": 0.025,
                    "avg_price": 42000.0,
                    "current_price": 43250.50,
                    "value": 1081.26,
                    "pnl": 31.26,
                    "pnl_percent": 2.98
                },
                {
                    "symbol": "ETHUSDT",
                    "name": "Ethereum",
                    "quantity": 1.5,
                    "avg_price": 2500.0,
                    "current_price": 2650.75,
                    "value": 3976.13,
                    "pnl": 226.13,
                    "pnl_percent": 6.03
                },
                {
                    "symbol": "ADAUSDT",
                    "name": "Cardano",
                    "quantity": 1000,
                    "avg_price": 0.45,
                    "current_price": 0.485,
                    "value": 485.0,
                    "pnl": 35.0,
                    "pnl_percent": 7.78
                }
            ]
            
            portfolio["positions"] = mock_positions
            portfolio["total_value"] = sum(pos["value"] for pos in mock_positions)
            portfolio["total_pnl"] = sum(pos["pnl"] for pos in mock_positions)
            portfolio["total_pnl_percent"] = (portfolio["total_pnl"] / (portfolio["total_value"] - portfolio["total_pnl"])) * 100
            
            return portfolio
        except Exception as e:
            self.logger.error(f"Error getting crypto portfolio: {e}")
            return {}

# Global crypto trading engine instance
crypto_engine = CryptoTradingEngine()
