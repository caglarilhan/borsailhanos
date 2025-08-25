#!/usr/bin/env python3
"""
🚀 Advanced Feature Engineering - SPRINT 2
BIST AI Smart Trader v2.0 - %80+ Doğruluk Hedefi

Gelişmiş özellik mühendisliği ile doğruluğu artırma:
- Market Microstructure Features
- Volatility Clustering Features
- Sector & Market Features
- Advanced Technical Indicators
"""

import asyncio
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
import pandas as pd
import numpy as np
import yfinance as yf
from dataclasses import dataclass

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class AdvancedFeatures:
    """Gelişmiş özellikler"""
    symbol: str
    timestamp: datetime
    
    # Market Microstructure
    order_flow_imbalance: float = 0.0
    volume_profile: float = 0.0
    bid_ask_spread: float = 0.0
    price_impact: float = 0.0
    
    # Volatility Features
    garch_volatility: float = 0.0
    implied_volatility: float = 0.0
    volatility_clustering: float = 0.0
    realized_volatility: float = 0.0
    
    # Sector & Market Features
    sector_rotation: float = 0.0
    market_breadth: float = 0.0
    correlation_matrix: float = 0.0
    beta: float = 0.0
    
    # Advanced Technical Indicators
    supertrend: float = 0.0
    ichimoku: Dict = None
    fibonacci_retracement: float = 0.0
    pivot_points: Dict = None

class MarketMicrostructureFeatures:
    """Market microstructure özellikleri"""
    
    def __init__(self):
        self.feature_cache = {}
    
    def calculate_order_flow_imbalance(self, data: pd.DataFrame) -> float:
        """Order flow dengesizliği"""
        try:
            if len(data) < 20:
                return 0.0
            
            # Volume-weighted price change
            data['vwap'] = (data['Close'] * data['Volume']).cumsum() / data['Volume'].cumsum()
            data['price_change'] = data['Close'].pct_change()
            
            # Order flow imbalance (simplified)
            volume_ma = data['Volume'].rolling(20).mean()
            price_ma = data['Close'].rolling(20).mean()
            
            # Volume-price relationship
            volume_price_corr = data['Volume'].rolling(20).corr(data['Close'])
            
            # Order flow imbalance score
            imbalance = (
                (data['Volume'].iloc[-1] / volume_ma.iloc[-1] - 1) * 0.4 +
                (data['Close'].iloc[-1] / price_ma.iloc[-1] - 1) * 0.3 +
                (volume_price_corr.iloc[-1] if not pd.isna(volume_price_corr.iloc[-1]) else 0) * 0.3
            )
            
            return np.clip(imbalance, -1, 1)
            
        except Exception as e:
            logger.warning(f"Order flow imbalance hatası: {e}")
            return 0.0
    
    def calculate_volume_profile(self, data: pd.DataFrame) -> float:
        """Volume profile analizi"""
        try:
            if len(data) < 20:
                return 0.0
            
            # Volume distribution analysis
            recent_volume = data['Volume'].tail(20)
            volume_quantiles = recent_volume.quantile([0.25, 0.5, 0.75])
            
            current_volume = data['Volume'].iloc[-1]
            
            # Volume profile score
            if current_volume > volume_quantiles[0.75]:
                profile_score = 1.0  # High volume
            elif current_volume > volume_quantiles[0.5]:
                profile_score = 0.5  # Medium volume
            elif current_volume > volume_quantiles[0.25]:
                profile_score = 0.0  # Low volume
            else:
                profile_score = -0.5  # Very low volume
            
            return profile_score
            
        except Exception as e:
            logger.warning(f"Volume profile hatası: {e}")
            return 0.0
    
    def calculate_price_impact(self, data: pd.DataFrame) -> float:
        """Fiyat etkisi hesaplama"""
        try:
            if len(data) < 20:
                return 0.0
            
            # Price impact based on volume and price change
            recent_data = data.tail(20)
            
            # Volume-weighted price change
            volume_weighted_change = (
                (recent_data['Close'] * recent_data['Volume']).sum() / 
                recent_data['Volume'].sum()
            ) / recent_data['Close'].iloc[0] - 1
            
            # Price impact score
            impact_score = np.clip(volume_weighted_change * 10, -1, 1)
            
            return impact_score
            
        except Exception as e:
            logger.warning(f"Price impact hatası: {e}")
            return 0.0

class VolatilityFeatures:
    """Volatilite özellikleri"""
    
    def __init__(self):
        self.feature_cache = {}
    
    def calculate_garch_volatility(self, data: pd.DataFrame) -> float:
        """GARCH volatilite modeli (simplified)"""
        try:
            if len(data) < 30:
                return 0.0
            
            # Simplified GARCH-like volatility
            returns = data['Close'].pct_change().dropna()
            
            # EWMA volatility
            lambda_param = 0.94
            volatility = np.sqrt(
                (1 - lambda_param) * returns.rolling(30).var() + 
                lambda_param * returns.rolling(30).var().shift(1)
            )
            
            current_vol = volatility.iloc[-1]
            if pd.isna(current_vol):
                return 0.0
            
            # Normalize volatility
            vol_score = np.clip((current_vol - volatility.mean()) / volatility.std(), -1, 1)
            
            return vol_score
            
        except Exception as e:
            logger.warning(f"GARCH volatility hatası: {e}")
            return 0.0
    
    def calculate_volatility_clustering(self, data: pd.DataFrame) -> float:
        """Volatilite clustering analizi"""
        try:
            if len(data) < 30:
                return 0.0
            
            returns = data['Close'].pct_change().dropna()
            
            # Volatility clustering using squared returns
            squared_returns = returns ** 2
            
            # Autocorrelation of squared returns
            autocorr = squared_returns.autocorr(lag=1)
            
            if pd.isna(autocorr):
                return 0.0
            
            # Clustering score (higher autocorr = more clustering)
            clustering_score = np.clip(autocorr, 0, 1)
            
            return clustering_score
            
        except Exception as e:
            logger.warning(f"Volatility clustering hatası: {e}")
            return 0.0
    
    def calculate_realized_volatility(self, data: pd.DataFrame) -> float:
        """Realized volatility"""
        try:
            if len(data) < 20:
                return 0.0
            
            # High-frequency realized volatility (simplified)
            returns = data['Close'].pct_change().dropna()
            
            # Realized volatility as sum of squared returns
            realized_vol = np.sqrt((returns ** 2).rolling(20).sum())
            
            current_vol = realized_vol.iloc[-1]
            if pd.isna(current_vol):
                return 0.0
            
            # Normalize
            vol_score = np.clip((current_vol - realized_vol.mean()) / realized_vol.std(), -1, 1)
            
            return vol_score
            
        except Exception as e:
            logger.warning(f"Realized volatility hatası: {e}")
            return 0.0

class SectorMarketFeatures:
    """Sektör ve piyasa özellikleri"""
    
    def __init__(self):
        self.feature_cache = {}
        self.sector_data = {}
    
    def calculate_sector_rotation(self, symbol: str, data: pd.DataFrame) -> float:
        """Sektör rotasyon analizi"""
        try:
            # Simplified sector rotation based on price momentum
            if len(data) < 20:
                return 0.0
            
            # Price momentum
            short_momentum = data['Close'].pct_change(5).iloc[-1]
            long_momentum = data['Close'].pct_change(20).iloc[-1]
            
            # Sector rotation score
            if short_momentum > long_momentum:
                rotation_score = min(short_momentum - long_momentum, 1.0)
            else:
                rotation_score = max(short_momentum - long_momentum, -1.0)
            
            return np.clip(rotation_score, -1, 1)
            
        except Exception as e:
            logger.warning(f"Sector rotation hatası: {e}")
            return 0.0
    
    def calculate_market_breadth(self, data: pd.DataFrame) -> float:
        """Piyasa genişliği"""
        try:
            if len(data) < 20:
                return 0.0
            
            # Simplified market breadth using price levels
            recent_data = data.tail(20)
            
            # Price above/below moving average
            ma_20 = recent_data['Close'].rolling(20).mean()
            above_ma = (recent_data['Close'] > ma_20).sum()
            
            # Market breadth score
            breadth_score = (above_ma / len(recent_data) - 0.5) * 2  # -1 to 1
            
            return np.clip(breadth_score, -1, 1)
            
        except Exception as e:
            logger.warning(f"Market breadth hatası: {e}")
            return 0.0
    
    def calculate_beta(self, symbol_data: pd.DataFrame, market_data: pd.DataFrame) -> float:
        """Beta hesaplama"""
        try:
            if len(symbol_data) < 30 or len(market_data) < 30:
                return 1.0
            
            # Calculate returns
            symbol_returns = symbol_data['Close'].pct_change().dropna()
            market_returns = market_data['Close'].pct_change().dropna()
            
            # Align data
            common_dates = symbol_returns.index.intersection(market_returns.index)
            if len(common_dates) < 20:
                return 1.0
            
            symbol_returns = symbol_returns.loc[common_dates]
            market_returns = market_returns.loc[common_dates]
            
            # Calculate beta
            covariance = np.cov(symbol_returns, market_returns)[0, 1]
            market_variance = np.var(market_returns)
            
            if market_variance == 0:
                return 1.0
            
            beta = covariance / market_variance
            
            return np.clip(beta, 0.1, 3.0)  # Reasonable beta range
            
        except Exception as e:
            logger.warning(f"Beta hesaplama hatası: {e}")
            return 1.0

class AdvancedTechnicalIndicators:
    """Gelişmiş teknik indikatörler"""
    
    def __init__(self):
        self.feature_cache = {}
    
    def calculate_supertrend(self, data: pd.DataFrame, period: int = 10, multiplier: float = 3.0) -> float:
        """Supertrend indikatörü"""
        try:
            if len(data) < period:
                return 0.0
            
            # Calculate ATR
            high_low = data['High'] - data['Low']
            high_close = np.abs(data['High'] - data['Close'].shift())
            low_close = np.abs(data['Low'] - data['Close'].shift())
            
            ranges = pd.concat([high_low, high_close, low_close], axis=1)
            true_range = np.max(ranges, axis=1)
            atr = true_range.rolling(period).mean()
            
            # Calculate Supertrend
            upperband = (data['High'] + data['Low']) / 2 + multiplier * atr
            lowerband = (data['High'] + data['Low']) / 2 - multiplier * atr
            
            # Supertrend line
            supertrend = pd.Series(index=data.index, dtype=float)
            supertrend.iloc[0] = upperband.iloc[0]
            
            for i in range(1, len(data)):
                if data['Close'].iloc[i] > supertrend.iloc[i-1]:
                    supertrend.iloc[i] = max(lowerband.iloc[i], supertrend.iloc[i-1])
                else:
                    supertrend.iloc[i] = min(upperband.iloc[i], supertrend.iloc[i-1])
            
            # Supertrend signal
            current_price = data['Close'].iloc[-1]
            current_supertrend = supertrend.iloc[-1]
            
            if current_price > current_supertrend:
                signal = 1.0  # Bullish
            else:
                signal = -1.0  # Bearish
            
            return signal
            
        except Exception as e:
            logger.warning(f"Supertrend hatası: {e}")
            return 0.0
    
    def calculate_fibonacci_retracement(self, data: pd.DataFrame) -> float:
        """Fibonacci retracement seviyeleri"""
        try:
            if len(data) < 20:
                return 0.0
            
            # Find swing high and low
            recent_data = data.tail(20)
            swing_high = recent_data['High'].max()
            swing_low = recent_data['Low'].min()
            
            current_price = data['Close'].iloc[-1]
            
            # Fibonacci levels
            diff = swing_high - swing_low
            fib_23_6 = swing_high - 0.236 * diff
            fib_38_2 = swing_high - 0.382 * diff
            fib_50_0 = swing_high - 0.500 * diff
            fib_61_8 = swing_high - 0.618 * diff
            
            # Position relative to Fibonacci levels
            if current_price > swing_high:
                position = 1.0  # Above swing high
            elif current_price > fib_23_6:
                position = 0.8  # Near swing high
            elif current_price > fib_38_2:
                position = 0.6  # Above 38.2%
            elif current_price > fib_50_0:
                position = 0.4  # Above 50%
            elif current_price > fib_61_8:
                position = 0.2  # Above 61.8%
            else:
                position = 0.0  # Below 61.8%
            
            return position
            
        except Exception as e:
            logger.warning(f"Fibonacci retracement hatası: {e}")
            return 0.5
    
    def calculate_pivot_points(self, data: pd.DataFrame) -> Dict[str, float]:
        """Pivot point seviyeleri"""
        try:
            if len(data) < 1:
                return {}
            
            # Get previous day's high, low, close
            prev_high = data['High'].iloc[-2] if len(data) > 1 else data['High'].iloc[-1]
            prev_low = data['Low'].iloc[-2] if len(data) > 1 else data['Low'].iloc[-1]
            prev_close = data['Close'].iloc[-2] if len(data) > 1 else data['Close'].iloc[-1]
            
            # Calculate pivot point
            pivot = (prev_high + prev_low + prev_close) / 3
            
            # Support and resistance levels
            r1 = 2 * pivot - prev_low
            s1 = 2 * pivot - prev_high
            r2 = pivot + (prev_high - prev_low)
            s2 = pivot - (prev_high - prev_low)
            
            current_price = data['Close'].iloc[-1]
            
            # Position relative to pivot levels
            if current_price > r2:
                position = 1.0  # Above R2
            elif current_price > r1:
                position = 0.8  # Between R1 and R2
            elif current_price > pivot:
                position = 0.6  # Between pivot and R1
            elif current_price > s1:
                position = 0.4  # Between S1 and pivot
            elif current_price > s2:
                position = 0.2  # Between S2 and S1
            else:
                position = 0.0  # Below S2
            
            return {
                'pivot': pivot,
                'r1': r1,
                'r2': r2,
                's1': s1,
                's2': s2,
                'position': position
            }
            
        except Exception as e:
            logger.warning(f"Pivot points hatası: {e}")
            return {'position': 0.5}

class AdvancedFeatureEngineer:
    """Gelişmiş özellik mühendisi - Ana sınıf"""
    
    def __init__(self):
        self.microstructure = MarketMicrostructureFeatures()
        self.volatility = VolatilityFeatures()
        self.sector_market = SectorMarketFeatures()
        self.technical = AdvancedTechnicalIndicators()
        
        logger.info("✅ Advanced Feature Engineer başlatıldı")
    
    async def create_advanced_features(self, symbol: str, data: pd.DataFrame, 
                                     market_data: pd.DataFrame = None) -> AdvancedFeatures:
        """Gelişmiş özellikleri oluştur"""
        try:
            logger.info(f"🔧 {symbol} için gelişmiş özellikler oluşturuluyor...")
            
            # Market microstructure features
            order_flow = self.microstructure.calculate_order_flow_imbalance(data)
            volume_profile = self.microstructure.calculate_volume_profile(data)
            price_impact = self.microstructure.calculate_price_impact(data)
            
            # Volatility features
            garch_vol = self.volatility.calculate_garch_volatility(data)
            vol_clustering = self.volatility.calculate_volatility_clustering(data)
            realized_vol = self.volatility.calculate_realized_volatility(data)
            
            # Sector & market features
            sector_rotation = self.sector_market.calculate_sector_rotation(symbol, data)
            market_breadth = self.sector_market.calculate_market_breadth(data)
            
            # Beta calculation (if market data available)
            if market_data is not None:
                beta = self.sector_market.calculate_beta(data, market_data)
            else:
                beta = 1.0
            
            # Advanced technical indicators
            supertrend = self.technical.calculate_supertrend(data)
            fibonacci = self.technical.calculate_fibonacci_retracement(data)
            pivot_points = self.technical.calculate_pivot_points(data)
            
            # Create advanced features object
            advanced_features = AdvancedFeatures(
                symbol=symbol,
                timestamp=datetime.now(),
                
                # Market microstructure
                order_flow_imbalance=order_flow,
                volume_profile=volume_profile,
                bid_ask_spread=0.0,  # TODO: Implement
                price_impact=price_impact,
                
                # Volatility features
                garch_volatility=garch_vol,
                implied_volatility=0.0,  # TODO: Implement
                volatility_clustering=vol_clustering,
                realized_volatility=realized_vol,
                
                # Sector & market features
                sector_rotation=sector_rotation,
                market_breadth=market_breadth,
                correlation_matrix=0.0,  # TODO: Implement
                beta=beta,
                
                # Advanced technical indicators
                supertrend=supertrend,
                ichimoku=None,  # TODO: Implement
                fibonacci_retracement=fibonacci,
                pivot_points=pivot_points
            )
            
            logger.info(f"✅ {symbol} için gelişmiş özellikler oluşturuldu")
            return advanced_features
            
        except Exception as e:
            logger.error(f"❌ Gelişmiş özellik oluşturma hatası {symbol}: {e}")
            return None
    
    def get_feature_summary(self, features: AdvancedFeatures) -> Dict[str, float]:
        """Özellik özeti"""
        if features is None:
            return {}
        
        return {
            'order_flow_imbalance': features.order_flow_imbalance,
            'volume_profile': features.volume_profile,
            'price_impact': features.price_impact,
            'garch_volatility': features.garch_volatility,
            'volatility_clustering': features.volatility_clustering,
            'realized_volatility': features.realized_volatility,
            'sector_rotation': features.sector_rotation,
            'market_breadth': features.market_breadth,
            'beta': features.beta,
            'supertrend': features.supertrend,
            'fibonacci_retracement': features.fibonacci_retracement,
            'pivot_position': features.pivot_points.get('position', 0.5) if features.pivot_points else 0.5
        }

# Test fonksiyonu
async def test_advanced_feature_engineering():
    """Advanced Feature Engineering'i test et"""
    logger.info("🧪 Advanced Feature Engineering Test Başlıyor...")
    
    # Test data oluştur
    symbol = "GARAN.IS"
    
    try:
        # Yahoo Finance'den test verisi çek
        ticker = yf.Ticker(symbol)
        data = ticker.history(period="60d")
        
        if data.empty:
            logger.error("❌ Test verisi çekilemedi")
            return None
        
        logger.info(f"✅ Test verisi çekildi: {len(data)} gün")
        
        # Advanced Feature Engineer oluştur
        feature_engineer = AdvancedFeatureEngineer()
        
        # Gelişmiş özellikleri oluştur
        advanced_features = await feature_engineer.create_advanced_features(symbol, data)
        
        if advanced_features:
            # Özellik özeti
            feature_summary = feature_engineer.get_feature_summary(advanced_features)
            
            logger.info(f"📊 {symbol} Gelişmiş Özellikler:")
            for feature, value in feature_summary.items():
                logger.info(f"   {feature}: {value:.4f}")
            
            return advanced_features
        else:
            logger.error("❌ Gelişmiş özellikler oluşturulamadı")
            return None
            
    except Exception as e:
        logger.error(f"❌ Test hatası: {e}")
        return None

if __name__ == "__main__":
    # Test çalıştır
    asyncio.run(test_advanced_feature_engineering())
