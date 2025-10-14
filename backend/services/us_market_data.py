#!/usr/bin/env python3
"""
US Borsa Veri Servisi
- Yahoo Finance, Alpha Vantage, Polygon entegrasyonu
- S&P 500, NASDAQ, Dow Jones verileri
- US hisse senetleri analizi
"""

import asyncio
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging

# US market imports
try:
    import yfinance as yf
    import requests
except ImportError:
    print("⚠️ US market kütüphaneleri yüklenmedi: pip install yfinance requests")
    yf = None
    requests = None

# Local imports
try:
    from backend.services.ai_models import ai_ensemble
    from backend.services.enhanced_sentiment import enhanced_sentiment
except ImportError:
    from ..services.ai_models import ai_ensemble
    from ..services.enhanced_sentiment import enhanced_sentiment

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# US Market Symbols
US_MAJOR_INDICES = {
    'SPY': 'S&P 500',
    'QQQ': 'NASDAQ 100',
    'DIA': 'Dow Jones',
    'IWM': 'Russell 2000',
    'VTI': 'Total Stock Market'
}

US_TOP_STOCKS = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'TSLA': 'Tesla Inc.',
    'META': 'Meta Platforms Inc.',
    'NVDA': 'NVIDIA Corporation',
    'BRK-B': 'Berkshire Hathaway Inc.',
    'UNH': 'UnitedHealth Group Inc.',
    'JNJ': 'Johnson & Johnson'
}

class USMarketDataService:
    """US Borsa Veri Servisi"""
    
    def __init__(self):
        self.alpha_vantage_key = None  # API key gerekli
        self.polygon_key = None  # API key gerekli
        
    async def fetch_us_stock_data(self, symbol: str, period: str = "1y", interval: str = "1d") -> pd.DataFrame:
        """US hisse verisi çek"""
        try:
            if yf is None:
                logger.error("❌ yfinance yüklenmedi")
                return pd.DataFrame()
                
            ticker = yf.Ticker(symbol)
            df = ticker.history(period=period, interval=interval, auto_adjust=False)
            
            if df.empty:
                logger.warning(f"⚠️ {symbol} için veri bulunamadı")
                return pd.DataFrame()
                
            # Column names'i standardize et
            df = df.rename(columns={
                "Open": "open",
                "High": "high", 
                "Low": "low",
                "Close": "close",
                "Volume": "volume"
            })
            
            logger.info(f"✅ {symbol} verisi çekildi: {len(df)} kayıt")
            return df
            
        except Exception as e:
            logger.error(f"❌ {symbol} veri çekme hatası: {e}")
            return pd.DataFrame()
            
    async def fetch_us_fundamentals(self, symbol: str) -> Dict:
        """US hisse fundamental verileri"""
        try:
            if yf is None:
                return {}
                
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            # Temel finansal veriler
            fundamentals = {
                'symbol': symbol,
                'market_cap': info.get('marketCap', 0),
                'pe_ratio': info.get('trailingPE', 0),
                'pb_ratio': info.get('priceToBook', 0),
                'debt_to_equity': info.get('debtToEquity', 0),
                'roe': info.get('returnOnEquity', 0),
                'profit_margin': info.get('profitMargins', 0),
                'revenue_growth': info.get('revenueGrowth', 0),
                'earnings_growth': info.get('earningsGrowth', 0),
                'beta': info.get('beta', 1.0),
                'dividend_yield': info.get('dividendYield', 0),
                'sector': info.get('sector', ''),
                'industry': info.get('industry', '')
            }
            
            return fundamentals
            
        except Exception as e:
            logger.error(f"❌ {symbol} fundamental veri hatası: {e}")
            return {}
            
    async def analyze_us_stock(self, symbol: str) -> Dict:
        """US hisse kapsamlı analizi"""
        try:
            logger.info(f"🔍 {symbol} US analizi başlatılıyor...")
            
            # 1. Fiyat verisi
            df = await self.fetch_us_stock_data(symbol, period="2y", interval="1d")
            if df.empty:
                return {}
                
            # 2. Fundamental veriler
            fundamentals = await self.fetch_us_fundamentals(symbol)
            
            # 3. Teknik analiz
            technical_analysis = await self._analyze_us_technical(df)
            
            # 4. AI tahmin
            ai_prediction = await self._get_ai_prediction(symbol, df)
            
            # 5. Sentiment analizi (US haberler için)
            sentiment_analysis = await self._analyze_us_sentiment(symbol)
            
            # 6. Sektör karşılaştırması
            sector_analysis = await self._analyze_sector_performance(symbol, fundamentals.get('sector', ''))
            
            # 7. Final skor
            final_score = self._calculate_us_final_score(
                technical_analysis, fundamentals, ai_prediction, 
                sentiment_analysis, sector_analysis
            )
            
            return {
                'symbol': symbol,
                'timestamp': datetime.now(),
                'price_data': {
                    'current_price': df['close'].iloc[-1],
                    'price_change_1d': (df['close'].iloc[-1] - df['close'].iloc[-2]) / df['close'].iloc[-2] if len(df) > 1 else 0,
                    'price_change_1w': (df['close'].iloc[-1] - df['close'].iloc[-5]) / df['close'].iloc[-5] if len(df) >= 5 else 0,
                    'price_change_1m': (df['close'].iloc[-1] - df['close'].iloc[-20]) / df['close'].iloc[-20] if len(df) >= 20 else 0,
                },
                'fundamentals': fundamentals,
                'technical_analysis': technical_analysis,
                'ai_prediction': ai_prediction,
                'sentiment_analysis': sentiment_analysis,
                'sector_analysis': sector_analysis,
                'final_score': final_score,
                'recommendation': self._generate_us_recommendation(final_score)
            }
            
        except Exception as e:
            logger.error(f"❌ {symbol} US analiz hatası: {e}")
            return {}
            
    async def _analyze_us_technical(self, df: pd.DataFrame) -> Dict:
        """US hisse teknik analizi"""
        try:
            closes = df['close'].values
            volumes = df['volume'].values
            
            # RSI
            rsi = self._calculate_rsi(closes, 14)
            current_rsi = rsi[-1] if len(rsi) > 0 else 50
            
            # MACD
            macd, macd_signal = self._calculate_macd(closes)
            macd_histogram = macd - macd_signal
            
            # Bollinger Bands
            bb_upper, bb_middle, bb_lower = self._calculate_bollinger_bands(closes)
            bb_position = (closes[-1] - bb_lower[-1]) / (bb_upper[-1] - bb_lower[-1]) if bb_upper[-1] != bb_lower[-1] else 0.5
            
            # Volume analizi
            current_volume = volumes[-1]
            avg_volume = np.mean(volumes[-20:])
            volume_ratio = current_volume / avg_volume if avg_volume > 0 else 1
            
            # Trend analizi
            ema_20 = pd.Series(closes).ewm(span=20).mean().iloc[-1]
            ema_50 = pd.Series(closes).ewm(span=50).mean().iloc[-1]
            trend_bullish = ema_20 > ema_50
            
            return {
                'rsi': current_rsi,
                'macd_histogram': macd_histogram[-1] if len(macd_histogram) > 0 else 0,
                'bb_position': bb_position,
                'volume_ratio': volume_ratio,
                'trend_bullish': trend_bullish,
                'score': self._score_us_technical(current_rsi, macd_histogram[-1] if len(macd_histogram) > 0 else 0, 
                                                bb_position, volume_ratio, trend_bullish)
            }
            
        except Exception as e:
            logger.error(f"❌ US teknik analiz hatası: {e}")
            return {}
            
    async def _get_ai_prediction(self, symbol: str, df: pd.DataFrame) -> Dict:
        """AI tahmin"""
        try:
            # LSTM tahmin
            if ai_ensemble.lstm.is_trained:
                lstm_pred = ai_ensemble.lstm.predict_next_price(symbol)
            else:
                # Modeli eğit
                ai_ensemble.lstm.train_model(symbol, period="2y")
                lstm_pred = ai_ensemble.lstm.predict_next_price(symbol)
                
            return {
                'lstm_prediction': lstm_pred,
                'confidence': 0.7
            }
            
        except Exception as e:
            logger.error(f"❌ AI tahmin hatası: {e}")
            return {}
            
    async def _analyze_us_sentiment(self, symbol: str) -> Dict:
        """US hisse sentiment analizi"""
        try:
            # Simülasyon - gerçek implementasyon için US haber kaynakları gerekli
            sample_text = f"{symbol} shows strong performance in Q3 earnings"
            sentiment = await enhanced_sentiment.analyze_comprehensive_sentiment(sample_text, symbol)
            
            return sentiment
            
        except Exception as e:
            logger.error(f"❌ US sentiment analiz hatası: {e}")
            return {}
            
    async def _analyze_sector_performance(self, symbol: str, sector: str) -> Dict:
        """Sektör performans analizi"""
        try:
            if not sector:
                return {}
                
            # Sektör ETF'leri
            sector_etfs = {
                'Technology': 'XLK',
                'Healthcare': 'XLV', 
                'Financial Services': 'XLF',
                'Consumer Cyclical': 'XLY',
                'Communication Services': 'XLC',
                'Industrials': 'XLI',
                'Consumer Defensive': 'XLP',
                'Energy': 'XLE',
                'Utilities': 'XLU',
                'Real Estate': 'XLRE',
                'Basic Materials': 'XLB'
            }
            
            sector_etf = sector_etfs.get(sector, 'SPY')  # Default to S&P 500
            
            # Sektör performansı
            sector_df = await self.fetch_us_stock_data(sector_etf, period="3mo", interval="1d")
            if sector_df.empty:
                return {}
                
            sector_return = (sector_df['close'].iloc[-1] - sector_df['close'].iloc[-20]) / sector_df['close'].iloc[-20] if len(sector_df) >= 20 else 0
            
            return {
                'sector': sector,
                'sector_etf': sector_etf,
                'sector_return_1m': sector_return,
                'outperforming_sector': sector_return > 0.02  # %2+ outperformance
            }
            
        except Exception as e:
            logger.error(f"❌ Sektör analiz hatası: {e}")
            return {}
            
    def _calculate_us_final_score(self, technical: Dict, fundamentals: Dict, 
                                 ai_pred: Dict, sentiment: Dict, sector: Dict) -> float:
        """US hisse final skoru"""
        scores = []
        weights = []
        
        # Teknik skor
        if technical and 'score' in technical:
            scores.append(technical['score'])
            weights.append(0.3)
            
        # Fundamental skor
        if fundamentals:
            fund_score = self._score_us_fundamentals(fundamentals)
            scores.append(fund_score)
            weights.append(0.25)
            
        # AI tahmin skoru
        if ai_pred and 'lstm_prediction' in ai_pred:
            ai_score = 0.6  # Basit skor
            scores.append(ai_score)
            weights.append(0.2)
            
        # Sentiment skoru
        if sentiment and 'final_sentiment' in sentiment:
            sent_score = 0.5 + sentiment['final_sentiment'].get('score', 0) * 0.5
            scores.append(sent_score)
            weights.append(0.15)
            
        # Sektör skoru
        if sector and 'outperforming_sector' in sector:
            sector_score = 0.7 if sector['outperforming_sector'] else 0.3
            scores.append(sector_score)
            weights.append(0.1)
            
        if not scores:
            return 0.5
            
        # Weighted average
        final_score = sum(s * w for s, w in zip(scores, weights)) / sum(weights)
        return min(1.0, max(0.0, final_score))
        
    def _generate_us_recommendation(self, score: float) -> Dict:
        """US hisse önerisi"""
        if score >= 0.8:
            action = 'STRONG_BUY'
            size = 0.8
        elif score >= 0.7:
            action = 'BUY'
            size = 0.6
        elif score >= 0.6:
            action = 'WEAK_BUY'
            size = 0.4
        elif score >= 0.4:
            action = 'HOLD'
            size = 0.2
        else:
            action = 'SELL'
            size = 0.0
            
        return {
            'action': action,
            'position_size': size,
            'confidence': score,
            'stop_loss': 0.05,
            'take_profit': 0.15
        }
        
    # Yardımcı fonksiyonlar
    def _score_us_technical(self, rsi, macd_hist, bb_pos, volume_ratio, trend_bullish) -> float:
        score = 0.5
        if 30 < rsi < 70: score += 0.1
        if macd_hist > 0: score += 0.1
        if 0.2 < bb_pos < 0.8: score += 0.1
        if volume_ratio > 1.2: score += 0.1
        if trend_bullish: score += 0.1
        return min(1.0, score)
        
    def _score_us_fundamentals(self, fundamentals: Dict) -> float:
        score = 0.5
        
        # PE ratio
        pe = fundamentals.get('pe_ratio', 0)
        if 0 < pe < 25: score += 0.1
        
        # ROE
        roe = fundamentals.get('roe', 0)
        if roe > 0.15: score += 0.1
        
        # Profit margin
        profit_margin = fundamentals.get('profit_margin', 0)
        if profit_margin > 0.1: score += 0.1
        
        # Revenue growth
        revenue_growth = fundamentals.get('revenue_growth', 0)
        if revenue_growth > 0.05: score += 0.1
        
        return min(1.0, score)
        
    def _calculate_rsi(self, prices, period=14):
        delta = np.diff(prices)
        gain = np.where(delta > 0, delta, 0)
        loss = np.where(delta < 0, -delta, 0)
        
        avg_gain = np.convolve(gain, np.ones(period), 'valid') / period
        avg_loss = np.convolve(loss, np.ones(period), 'valid') / period
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        
        return rsi
        
    def _calculate_macd(self, prices, fast=12, slow=26, signal=9):
        ema_fast = pd.Series(prices).ewm(span=fast).mean()
        ema_slow = pd.Series(prices).ewm(span=slow).mean()
        macd = ema_fast - ema_slow
        macd_signal = macd.ewm(span=signal).mean()
        return macd.values, macd_signal.values
        
    def _calculate_bollinger_bands(self, prices, period=20, std_dev=2):
        sma = pd.Series(prices).rolling(window=period).mean()
        std = pd.Series(prices).rolling(window=period).std()
        upper = sma + (std * std_dev)
        lower = sma - (std * std_dev)
        return upper.values, sma.values, lower.values

# Global US market service
us_market_service = USMarketDataService()



