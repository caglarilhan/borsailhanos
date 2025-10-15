#!/usr/bin/env python3
"""
🌍 Global Markets Integration
NASDAQ, NYSE, Crypto, Forex, Commodities
"""

import asyncio
import aiohttp
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging
from dataclasses import dataclass
from enum import Enum
import random

class MarketType(Enum):
    STOCK = "Stock"
    CRYPTO = "Crypto"
    FOREX = "Forex"
    COMMODITY = "Commodity"
    INDEX = "Index"
    ETF = "ETF"
    OPTION = "Option"
    FUTURE = "Future"

class Exchange(Enum):
    NASDAQ = "NASDAQ"
    NYSE = "NYSE"
    LSE = "LSE"
    TSE = "TSE"
    BINANCE = "Binance"
    COINBASE = "Coinbase"
    KRAKEN = "Kraken"
    BIST = "BIST"

@dataclass
class GlobalMarketData:
    symbol: str
    name: str
    market_type: MarketType
    exchange: Exchange
    currency: str
    price: float
    change: float
    change_percent: float
    volume: float
    market_cap: Optional[float]
    high_52w: Optional[float]
    low_52w: Optional[float]
    pe_ratio: Optional[float]
    dividend_yield: Optional[float]
    beta: Optional[float]
    sector: Optional[str]
    country: str
    timestamp: str

@dataclass
class MarketSector:
    name: str
    performance: float
    top_gainers: List[str]
    top_losers: List[str]
    market_cap: float
    pe_ratio: float
    dividend_yield: float

class GlobalMarkets:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Market symbols by type
        self.nasdaq_symbols = [
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
            'ADBE', 'CRM', 'PYPL', 'UBER', 'SHOP', 'SQ', 'ROKU', 'ZM'
        ]
        
        self.nyse_symbols = [
            'JPM', 'JNJ', 'V', 'PG', 'UNH', 'HD', 'MA', 'BAC', 'ABBV', 'PFE',
            'KO', 'AVGO', 'PEP', 'TMO', 'COST', 'WMT', 'MRK', 'ABT'
        ]
        
        self.crypto_symbols = [
            'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 'XRPUSDT',
            'DOTUSDT', 'DOGEUSDT', 'AVAXUSDT', 'MATICUSDT', 'LTCUSDT', 'LINKUSDT'
        ]
        
        self.forex_pairs = [
            'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD',
            'EURJPY', 'GBPJPY', 'EURGBP', 'AUDCAD', 'NZDUSD', 'USDSGD'
        ]
        
        self.commodity_symbols = [
            'GOLD', 'SILVER', 'OIL', 'NATURAL_GAS', 'COPPER', 'WHEAT',
            'CORN', 'SUGAR', 'COFFEE', 'COTTON'
        ]
        
        self.global_indices = [
            'SPX', 'DJI', 'IXIC', 'RUT', 'VIX', 'FTSE', 'DAX', 'CAC',
            'NIKKEI', 'HSI', 'ASX', 'BSE', 'RTSI', 'IBEX', 'AEX'
        ]
        
        # Market data cache
        self.market_data: Dict[str, GlobalMarketData] = {}
        self.sector_data: Dict[str, MarketSector] = {}
        
        # Initialize with mock data
        self._initialize_mock_data()

    def _initialize_mock_data(self):
        """Initialize with mock market data"""
        # NASDAQ stocks
        for symbol in self.nasdaq_symbols:
            base_price = 50 + (hash(symbol) % 500)
            self.market_data[symbol] = GlobalMarketData(
                symbol=symbol,
                name=f"{symbol} Inc.",
                market_type=MarketType.STOCK,
                exchange=Exchange.NASDAQ,
                currency='USD',
                price=base_price + random.uniform(-10, 10),
                change=random.uniform(-5, 5),
                change_percent=random.uniform(-3, 3),
                volume=random.uniform(1000000, 10000000),
                market_cap=base_price * random.uniform(1000000, 100000000),
                high_52w=base_price * 1.2,
                low_52w=base_price * 0.8,
                pe_ratio=random.uniform(10, 30),
                dividend_yield=random.uniform(0, 0.05),
                beta=random.uniform(0.8, 1.5),
                sector='Technology',
                country='USA',
                timestamp=datetime.now().isoformat()
            )
        
        # NYSE stocks
        for symbol in self.nyse_symbols:
            base_price = 30 + (hash(symbol) % 200)
            self.market_data[symbol] = GlobalMarketData(
                symbol=symbol,
                name=f"{symbol} Corp.",
                market_type=MarketType.STOCK,
                exchange=Exchange.NYSE,
                currency='USD',
                price=base_price + random.uniform(-5, 5),
                change=random.uniform(-3, 3),
                change_percent=random.uniform(-2, 2),
                volume=random.uniform(500000, 5000000),
                market_cap=base_price * random.uniform(500000, 50000000),
                high_52w=base_price * 1.15,
                low_52w=base_price * 0.85,
                pe_ratio=random.uniform(8, 25),
                dividend_yield=random.uniform(0.01, 0.08),
                beta=random.uniform(0.7, 1.3),
                sector='Finance',
                country='USA',
                timestamp=datetime.now().isoformat()
            )
        
        # Crypto
        crypto_prices = {
            'BTCUSDT': 65000, 'ETHUSDT': 3200, 'BNBUSDT': 600, 'ADAUSDT': 0.75,
            'SOLUSDT': 140, 'XRPUSDT': 0.6, 'DOTUSDT': 7.5, 'DOGEUSDT': 0.08
        }
        
        for symbol in self.crypto_symbols:
            base_price = crypto_prices.get(symbol, 100)
            self.market_data[symbol] = GlobalMarketData(
                symbol=symbol,
                name=symbol.replace('USDT', ''),
                market_type=MarketType.CRYPTO,
                exchange=Exchange.BINANCE,
                currency='USDT',
                price=base_price + random.uniform(-base_price*0.05, base_price*0.05),
                change=random.uniform(-base_price*0.03, base_price*0.03),
                change_percent=random.uniform(-5, 5),
                volume=random.uniform(100000, 10000000),
                market_cap=base_price * random.uniform(1000000, 1000000000),
                high_52w=base_price * 1.5,
                low_52w=base_price * 0.5,
                pe_ratio=None,
                dividend_yield=None,
                beta=random.uniform(1.5, 3.0),
                sector='Cryptocurrency',
                country='Global',
                timestamp=datetime.now().isoformat()
            )

    async def get_market_data(self, symbols: List[str]) -> List[GlobalMarketData]:
        """Get market data for symbols"""
        try:
            results = []
            
            for symbol in symbols:
                if symbol in self.market_data:
                    # Update with fresh data
                    data = self.market_data[symbol]
                    data.price += random.uniform(-data.price*0.01, data.price*0.01)
                    data.change = random.uniform(-data.price*0.03, data.price*0.03)
                    data.change_percent = (data.change / data.price) * 100
                    data.timestamp = datetime.now().isoformat()
                    
                    results.append(data)
                else:
                    # Generate new data for unknown symbols
                    new_data = self._generate_mock_data_for_symbol(symbol)
                    if new_data:
                        self.market_data[symbol] = new_data
                        results.append(new_data)
            
            return results
            
        except Exception as e:
            self.logger.error(f"Error getting market data: {e}")
            return []

    def _generate_mock_data_for_symbol(self, symbol: str) -> Optional[GlobalMarketData]:
        """Generate mock data for unknown symbol"""
        try:
            # Determine market type and exchange based on symbol
            if symbol.endswith('USDT'):
                market_type = MarketType.CRYPTO
                exchange = Exchange.BINANCE
                currency = 'USDT'
                base_price = random.uniform(0.1, 1000)
            elif symbol in ['EURUSD', 'GBPUSD', 'USDJPY']:
                market_type = MarketType.FOREX
                exchange = Exchange.NASDAQ  # Mock
                currency = 'USD'
                base_price = random.uniform(0.8, 1.5)
            elif symbol in ['GOLD', 'SILVER', 'OIL']:
                market_type = MarketType.COMMODITY
                exchange = Exchange.NYSE  # Mock
                currency = 'USD'
                base_price = random.uniform(50, 2000)
            else:
                market_type = MarketType.STOCK
                exchange = Exchange.NASDAQ
                currency = 'USD'
                base_price = random.uniform(10, 500)
            
            return GlobalMarketData(
                symbol=symbol,
                name=symbol,
                market_type=market_type,
                exchange=exchange,
                currency=currency,
                price=base_price,
                change=random.uniform(-base_price*0.05, base_price*0.05),
                change_percent=random.uniform(-5, 5),
                volume=random.uniform(100000, 10000000),
                market_cap=base_price * random.uniform(1000000, 100000000) if market_type == MarketType.STOCK else None,
                high_52w=base_price * 1.2,
                low_52w=base_price * 0.8,
                pe_ratio=random.uniform(10, 30) if market_type == MarketType.STOCK else None,
                dividend_yield=random.uniform(0, 0.05) if market_type == MarketType.STOCK else None,
                beta=random.uniform(0.8, 2.0),
                sector='General',
                country='USA',
                timestamp=datetime.now().isoformat()
            )
            
        except Exception as e:
            self.logger.error(f"Error generating mock data for {symbol}: {e}")
            return None

    async def get_market_overview(self, market_type: Optional[MarketType] = None) -> Dict[str, Any]:
        """Get market overview"""
        try:
            if market_type:
                filtered_data = [data for data in self.market_data.values() if data.market_type == market_type]
            else:
                filtered_data = list(self.market_data.values())
            
            # Calculate market metrics
            total_volume = sum(data.volume for data in filtered_data)
            gainers = len([data for data in filtered_data if data.change > 0])
            losers = len([data for data in filtered_data if data.change < 0])
            unchanged = len([data for data in filtered_data if data.change == 0])
            
            # Top performers
            top_gainers = sorted(filtered_data, key=lambda x: x.change_percent, reverse=True)[:5]
            top_losers = sorted(filtered_data, key=lambda x: x.change_percent)[:5]
            
            return {
                'market_type': market_type.value if market_type else 'All',
                'total_symbols': len(filtered_data),
                'total_volume': total_volume,
                'gainers': gainers,
                'losers': losers,
                'unchanged': unchanged,
                'top_gainers': [data.__dict__ for data in top_gainers],
                'top_losers': [data.__dict__ for data in top_losers],
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error getting market overview: {e}")
            return {}

    async def get_sector_performance(self) -> List[MarketSector]:
        """Get sector performance analysis"""
        try:
            sectors = {}
            
            # Group by sector
            for data in self.market_data.values():
                if data.sector and data.market_type == MarketType.STOCK:
                    if data.sector not in sectors:
                        sectors[data.sector] = []
                    sectors[data.sector].append(data)
            
            # Calculate sector metrics
            sector_performance = []
            for sector_name, sector_data in sectors.items():
                total_market_cap = sum(data.market_cap or 0 for data in sector_data)
                avg_pe = np.mean([data.pe_ratio or 0 for data in sector_data if data.pe_ratio])
                avg_dividend = np.mean([data.dividend_yield or 0 for data in sector_data if data.dividend_yield])
                
                # Performance calculation
                performance = np.mean([data.change_percent for data in sector_data])
                
                # Top gainers and losers in sector
                sector_sorted = sorted(sector_data, key=lambda x: x.change_percent, reverse=True)
                top_gainers = [data.symbol for data in sector_sorted[:3]]
                top_losers = [data.symbol for data in sector_sorted[-3:]]
                
                sector_performance.append(MarketSector(
                    name=sector_name,
                    performance=performance,
                    top_gainers=top_gainers,
                    top_losers=top_losers,
                    market_cap=total_market_cap,
                    pe_ratio=avg_pe,
                    dividend_yield=avg_dividend
                ))
            
            # Sort by performance
            sector_performance.sort(key=lambda x: x.performance, reverse=True)
            
            return sector_performance
            
        except Exception as e:
            self.logger.error(f"Error getting sector performance: {e}")
            return []

    async def get_global_indices(self) -> List[GlobalMarketData]:
        """Get global market indices"""
        try:
            indices_data = []
            
            for symbol in self.global_indices:
                base_price = 1000 + (hash(symbol) % 10000)
                
                index_data = GlobalMarketData(
                    symbol=symbol,
                    name=f"{symbol} Index",
                    market_type=MarketType.INDEX,
                    exchange=Exchange.NASDAQ,  # Mock
                    currency='USD',
                    price=base_price + random.uniform(-50, 50),
                    change=random.uniform(-20, 20),
                    change_percent=random.uniform(-2, 2),
                    volume=random.uniform(1000000, 10000000),
                    market_cap=None,
                    high_52w=base_price * 1.15,
                    low_52w=base_price * 0.85,
                    pe_ratio=None,
                    dividend_yield=None,
                    beta=1.0,
                    sector='Index',
                    country='Global',
                    timestamp=datetime.now().isoformat()
                )
                
                indices_data.append(index_data)
            
            return indices_data
            
        except Exception as e:
            self.logger.error(f"Error getting global indices: {e}")
            return []

    async def get_currency_rates(self) -> Dict[str, float]:
        """Get currency exchange rates"""
        try:
            # Mock currency rates
            rates = {
                'USDTRY': 32.50 + random.uniform(-0.5, 0.5),
                'EURTRY': 35.20 + random.uniform(-0.3, 0.3),
                'GBPTRY': 40.80 + random.uniform(-0.4, 0.4),
                'USDJPY': 150.25 + random.uniform(-1, 1),
                'EURUSD': 1.0850 + random.uniform(-0.01, 0.01),
                'GBPUSD': 1.2550 + random.uniform(-0.01, 0.01),
                'USDCHF': 0.8750 + random.uniform(-0.005, 0.005),
                'AUDUSD': 0.6650 + random.uniform(-0.005, 0.005),
            }
            
            return rates
            
        except Exception as e:
            self.logger.error(f"Error getting currency rates: {e}")
            return {}

    async def get_commodity_prices(self) -> List[GlobalMarketData]:
        """Get commodity prices"""
        try:
            commodities = []
            
            commodity_data = {
                'GOLD': {'price': 2050, 'unit': 'USD/oz'},
                'SILVER': {'price': 24.5, 'unit': 'USD/oz'},
                'OIL': {'price': 75.2, 'unit': 'USD/barrel'},
                'NATURAL_GAS': {'price': 3.2, 'unit': 'USD/MMBtu'},
                'COPPER': {'price': 4.1, 'unit': 'USD/lb'},
                'WHEAT': {'price': 6.8, 'unit': 'USD/bushel'},
                'CORN': {'price': 5.2, 'unit': 'USD/bushel'},
                'SUGAR': {'price': 0.18, 'unit': 'USD/lb'},
                'COFFEE': {'price': 1.85, 'unit': 'USD/lb'},
                'COTTON': {'price': 0.75, 'unit': 'USD/lb'}
            }
            
            for symbol, data in commodity_data.items():
                base_price = data['price']
                
                commodity = GlobalMarketData(
                    symbol=symbol,
                    name=symbol.replace('_', ' ').title(),
                    market_type=MarketType.COMMODITY,
                    exchange=Exchange.NYSE,  # Mock
                    currency='USD',
                    price=base_price + random.uniform(-base_price*0.05, base_price*0.05),
                    change=random.uniform(-base_price*0.03, base_price*0.03),
                    change_percent=random.uniform(-3, 3),
                    volume=random.uniform(10000, 1000000),
                    market_cap=None,
                    high_52w=base_price * 1.3,
                    low_52w=base_price * 0.7,
                    pe_ratio=None,
                    dividend_yield=None,
                    beta=random.uniform(0.5, 2.0),
                    sector='Commodity',
                    country='Global',
                    timestamp=datetime.now().isoformat()
                )
                
                commodities.append(commodity)
            
            return commodities
            
        except Exception as e:
            self.logger.error(f"Error getting commodity prices: {e}")
            return []

    async def get_market_sentiment(self, symbols: List[str]) -> Dict[str, Dict[str, Any]]:
        """Get market sentiment analysis"""
        try:
            sentiment_data = {}
            
            for symbol in symbols:
                # Mock sentiment analysis
                sentiment_score = random.uniform(-1, 1)
                
                if sentiment_score > 0.3:
                    sentiment = 'Bullish'
                elif sentiment_score < -0.3:
                    sentiment = 'Bearish'
                else:
                    sentiment = 'Neutral'
                
                sentiment_data[symbol] = {
                    'sentiment_score': sentiment_score,
                    'sentiment': sentiment,
                    'confidence': random.uniform(0.6, 0.95),
                    'news_sentiment': random.uniform(-0.5, 0.5),
                    'social_sentiment': random.uniform(-0.3, 0.3),
                    'technical_sentiment': random.uniform(-0.4, 0.4),
                    'analyst_rating': random.choice(['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell']),
                    'price_target': random.uniform(50, 500),
                    'timestamp': datetime.now().isoformat()
                }
            
            return sentiment_data
            
        except Exception as e:
            self.logger.error(f"Error getting market sentiment: {e}")
            return {}

    async def get_economic_calendar(self, days: int = 7) -> List[Dict[str, Any]]:
        """Get economic calendar events"""
        try:
            events = []
            
            # Mock economic events
            event_types = ['GDP', 'Inflation', 'Interest Rate', 'Employment', 'Manufacturing', 'Consumer Confidence']
            countries = ['USA', 'EU', 'UK', 'Japan', 'China', 'Turkey']
            impacts = ['High', 'Medium', 'Low']
            
            for i in range(days * 3):  # 3 events per day
                event_date = datetime.now() + timedelta(days=i//3, hours=(i%3)*8)
                
                events.append({
                    'date': event_date.isoformat(),
                    'time': event_date.strftime('%H:%M'),
                    'country': random.choice(countries),
                    'event': f"{random.choice(event_types)} Release",
                    'impact': random.choice(impacts),
                    'previous': random.uniform(-2, 2),
                    'forecast': random.uniform(-2, 2),
                    'actual': random.uniform(-2, 2) if event_date < datetime.now() else None,
                    'currency': 'USD' if random.choice(countries) == 'USA' else 'EUR'
                })
            
            # Sort by date
            events.sort(key=lambda x: x['date'])
            
            return events
            
        except Exception as e:
            self.logger.error(f"Error getting economic calendar: {e}")
            return []

    async def get_market_news(self, symbols: Optional[List[str]] = None, limit: int = 20) -> List[Dict[str, Any]]:
        """Get market news"""
        try:
            news_items = []
            
            # Mock news items
            news_sources = ['Reuters', 'Bloomberg', 'CNBC', 'MarketWatch', 'Yahoo Finance']
            news_types = ['Earnings', 'Merger', 'IPO', 'Regulation', 'Market Analysis', 'Company News']
            
            for i in range(limit):
                news_items.append({
                    'id': f"news_{i}",
                    'title': f"Market Update: {random.choice(news_types)} News",
                    'summary': f"Important market development affecting {random.choice(symbols or ['AAPL', 'MSFT', 'GOOGL'])}",
                    'content': f"Detailed analysis of market conditions and their impact on trading strategies...",
                    'source': random.choice(news_sources),
                    'author': f"Analyst {random.randint(1, 100)}",
                    'published_at': (datetime.now() - timedelta(hours=random.randint(1, 24))).isoformat(),
                    'symbols': random.sample(symbols or ['AAPL', 'MSFT', 'GOOGL'], k=random.randint(1, 3)),
                    'sentiment': random.choice(['Positive', 'Negative', 'Neutral']),
                    'impact': random.choice(['High', 'Medium', 'Low']),
                    'url': f"https://example.com/news/{i}",
                    'image_url': f"https://example.com/images/news_{i}.jpg"
                })
            
            # Sort by publication date
            news_items.sort(key=lambda x: x['published_at'], reverse=True)
            
            return news_items
            
        except Exception as e:
            self.logger.error(f"Error getting market news: {e}")
            return []

    async def get_correlation_matrix(self, symbols: List[str], period: str = '1y') -> Dict[str, Dict[str, float]]:
        """Get correlation matrix for symbols"""
        try:
            # Generate mock correlation matrix
            n = len(symbols)
            correlation_matrix = {}
            
            for i, symbol1 in enumerate(symbols):
                correlation_matrix[symbol1] = {}
                for j, symbol2 in enumerate(symbols):
                    if i == j:
                        correlation_matrix[symbol1][symbol2] = 1.0
                    else:
                        # Generate realistic correlations
                        base_correlation = 0.3 + (hash(f"{symbol1}_{symbol2}") % 40) / 100
                        correlation_matrix[symbol1][symbol2] = round(base_correlation, 3)
            
            return correlation_matrix
            
        except Exception as e:
            self.logger.error(f"Error getting correlation matrix: {e}")
            return {}

    async def get_volatility_surface(self, symbol: str) -> Dict[str, Any]:
        """Get options volatility surface"""
        try:
            # Mock volatility surface
            expirations = ['1W', '2W', '1M', '2M', '3M', '6M', '1Y']
            strikes = [0.8, 0.9, 1.0, 1.1, 1.2]  # Relative to current price
            
            surface_data = []
            base_vol = 0.25 + (hash(symbol) % 20) / 100  # 25-45% base volatility
            
            for exp in expirations:
                for strike in strikes:
                    # Volatility smile/smirk
                    vol = base_vol * (1 + (strike - 1.0) * 0.1 + random.uniform(-0.05, 0.05))
                    surface_data.append({
                        'expiration': exp,
                        'strike_ratio': strike,
                        'implied_volatility': round(vol, 4)
                    })
            
            return {
                'symbol': symbol,
                'surface_data': surface_data,
                'current_price': self.market_data.get(symbol, GlobalMarketData('', '', MarketType.STOCK, Exchange.NASDAQ, 'USD', 100, 0, 0, 0, None, None, None, None, None, None, None, '', '', '')).price,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error getting volatility surface: {e}")
            return {}

# Global instance
global_markets = GlobalMarkets()
