"""
PRD v2.0 - Advanced Feature Engineering
Gelişmiş teknik indikatörler, makro veri ve sentiment özellikleri
"""

import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Optional, Tuple
import requests
import json
from scipy import stats
from scipy.signal import find_peaks
# TA-Lib yerine ta kütüphanesi kullan
import ta

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AdvancedFeatureEngine:
    """Gelişmiş özellik mühendisliği için kapsamlı modül"""
    
    def __init__(self):
        self.feature_cache = {}
        self.macro_data = {}
        self.sentiment_data = {}
        
        # Gelişmiş teknik indikatörler
        self.technical_features = {
            "trend": ["ADX", "CCI", "DMI", "AROON", "STOCH"],
            "momentum": ["RSI", "STOCH", "WILLR", "ROC", "MOM"],
            "volatility": ["ATR", "BBANDS", "KC", "TRANGE"],
            "volume": ["OBV", "AD", "CMF", "MFI", "VWAP"],
            "support_resistance": ["PIVOT", "FIBONACCI", "PSAR"]
        }
        
        # Makro veri kaynakları
        self.macro_sources = {
            "tcmb": "https://evds2.tcmb.gov.tr/service/evds",
            "investing": "https://tr.investing.com/economic-calendar",
            "fred": "https://api.stlouisfed.org/fred/series"
        }
        
    def get_advanced_technical_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Gelişmiş teknik özellikler oluştur"""
        try:
            df = data.copy()
            
            # 1. TREND INDICATORS
            # ADX (Average Directional Index)
            df['ADX'] = talib.ADX(df['High'], df['Low'], df['Close'], timeperiod=14)
            
            # CCI (Commodity Channel Index)
            df['CCI'] = talib.CCI(df['High'], df['Low'], df['Close'], timeperiod=14)
            
            # DMI (Directional Movement Index)
            df['DI_plus'] = talib.PLUS_DI(df['High'], df['Low'], df['Close'], timeperiod=14)
            df['DI_minus'] = talib.MINUS_DI(df['High'], df['Low'], df['Close'], timeperiod=14)
            
            # Aroon Oscillator
            df['AROON_OSC'] = talib.AROONOSC(df['High'], df['Low'], timeperiod=14)
            
            # 2. MOMENTUM INDICATORS
            # Stochastic
            df['STOCH_K'], df['STOCH_D'] = talib.STOCH(df['High'], df['Low'], df['Close'])
            
            # Williams %R
            df['WILLR'] = talib.WILLR(df['High'], df['Low'], df['Close'], timeperiod=14)
            
            # Rate of Change
            df['ROC'] = talib.ROC(df['Close'], timeperiod=10)
            
            # Momentum
            df['MOM'] = talib.MOM(df['Close'], timeperiod=10)
            
            # 3. VOLATILITY INDICATORS
            # ATR (Average True Range)
            df['ATR'] = talib.ATR(df['High'], df['Low'], df['Close'], timeperiod=14)
            
            # Keltner Channel
            df['KC_UPPER'] = df['SMA_20'] + (df['ATR'] * 2)
            df['KC_LOWER'] = df['SMA_20'] - (df['ATR'] * 2)
            df['KC_WIDTH'] = (df['KC_UPPER'] - df['KC_LOWER']) / df['SMA_20']
            
            # True Range
            df['TRANGE'] = talib.TRANGE(df['High'], df['Low'], df['Close'])
            
            # 4. VOLUME INDICATORS
            # On Balance Volume
            df['OBV'] = talib.OBV(df['Close'], df['Volume'])
            
            # Accumulation/Distribution
            df['AD'] = talib.AD(df['High'], df['Low'], df['Close'], df['Volume'])
            
            # Chaikin Money Flow
            df['CMF'] = self._calculate_cmf(df)
            
            # Money Flow Index
            df['MFI'] = talib.MFI(df['High'], df['Low'], df['Close'], df['Volume'], timeperiod=14)
            
            # VWAP
            df['VWAP'] = self._calculate_vwap(df)
            
            # 5. SUPPORT/RESISTANCE
            # Pivot Points
            df['PIVOT'] = self._calculate_pivot_points(df)
            
            # Fibonacci Retracements
            df['FIB_23.6'], df['FIB_38.2'], df['FIB_50.0'], df['FIB_61.8'] = self._calculate_fibonacci(df)
            
            # Parabolic SAR
            df['PSAR'] = talib.SAR(df['High'], df['Low'])
            
            # 6. ADVANCED PATTERNS
            # Price Channels
            df['UPPER_CHANNEL'] = df['High'].rolling(20).max()
            df['LOWER_CHANNEL'] = df['Low'].rolling(20).min()
            df['CHANNEL_POSITION'] = (df['Close'] - df['LOWER_CHANNEL']) / (df['UPPER_CHANNEL'] - df['LOWER_CHANNEL'])
            
            # Volatility Ratio
            df['VOL_RATIO'] = df['ATR'] / df['Close']
            
            # Price Efficiency
            df['PRICE_EFFICIENCY'] = self._calculate_price_efficiency(df)
            
            # 7. CROSSOVER SIGNALS
            # Multiple EMA Crossovers
            df['EMA_5'] = talib.EMA(df['Close'], timeperiod=5)
            df['EMA_8'] = talib.EMA(df['Close'], timeperiod=8)
            df['EMA_13'] = talib.EMA(df['Close'], timeperiod=13)
            df['EMA_21'] = talib.EMA(df['Close'], timeperiod=21)
            df['EMA_34'] = talib.EMA(df['Close'], timeperiod=34)
            df['EMA_55'] = talib.EMA(df['Close'], timeperiod=55)
            
            # Crossover signals
            df['EMA_5_8_CROSS'] = (df['EMA_5'] > df['EMA_8']).astype(int)
            df['EMA_8_13_CROSS'] = (df['EMA_8'] > df['EMA_13']).astype(int)
            df['EMA_13_21_CROSS'] = (df['EMA_13'] > df['EMA_21']).astype(int)
            df['EMA_21_34_CROSS'] = (df['EMA_21'] > df['EMA_34']).astype(int)
            df['EMA_34_55_CROSS'] = (df['EMA_34'] > df['EMA_55']).astype(int)
            
            # 8. DIVERGENCE DETECTION
            # RSI Divergence
            df['RSI_DIVERGENCE'] = self._detect_rsi_divergence(df)
            
            # MACD Divergence
            df['MACD_DIVERGENCE'] = self._detect_macd_divergence(df)
            
            # 9. MARKET STRUCTURE
            # Higher Highs/Lower Lows
            df['HIGHER_HIGH'] = self._detect_higher_highs(df)
            df['LOWER_LOW'] = self._detect_lower_lows(df)
            
            # Breakout Detection
            df['BREAKOUT_UP'] = self._detect_breakout_up(df)
            df['BREAKOUT_DOWN'] = self._detect_breakout_down(df)
            
            # 10. ADVANCED STATISTICS
            # Z-Score
            df['Z_SCORE'] = stats.zscore(df['Close'].pct_change().fillna(0))
            
            # Skewness
            df['SKEWNESS'] = df['Close'].rolling(20).skew()
            
            # Kurtosis
            df['KURTOSIS'] = df['Close'].rolling(20).kurt()
            
            # Hurst Exponent
            df['HURST'] = self._calculate_hurst_exponent(df)
            
            return df
            
        except Exception as e:
            logger.error(f"❌ Gelişmiş teknik özellik hatası: {e}")
            return data
    
    def _calculate_cmf(self, df: pd.DataFrame) -> pd.Series:
        """Chaikin Money Flow hesapla"""
        try:
            mfm = ((df['Close'] - df['Low']) - (df['High'] - df['Close'])) / (df['High'] - df['Low'])
            mfm = mfm.replace([np.inf, -np.inf], 0)
            mfv = mfm * df['Volume']
            cmf = mfv.rolling(20).sum() / df['Volume'].rolling(20).sum()
            return cmf
        except:
            return pd.Series(0, index=df.index)
    
    def _calculate_vwap(self, df: pd.DataFrame) -> pd.Series:
        """VWAP hesapla"""
        try:
            typical_price = (df['High'] + df['Low'] + df['Close']) / 3
            vwap = (typical_price * df['Volume']).rolling(20).sum() / df['Volume'].rolling(20).sum()
            return vwap
        except:
            return pd.Series(0, index=df.index)
    
    def _calculate_pivot_points(self, df: pd.DataFrame) -> pd.Series:
        """Pivot points hesapla"""
        try:
            pivot = (df['High'] + df['Low'] + df['Close']) / 3
            return pivot
        except:
            return pd.Series(0, index=df.index)
    
    def _calculate_fibonacci(self, df: pd.DataFrame) -> Tuple[pd.Series, pd.Series, pd.Series, pd.Series]:
        """Fibonacci retracement seviyeleri"""
        try:
            high = df['High'].rolling(20).max()
            low = df['Low'].rolling(20).min()
            diff = high - low
            
            fib_23_6 = high - (diff * 0.236)
            fib_38_2 = high - (diff * 0.382)
            fib_50_0 = high - (diff * 0.500)
            fib_61_8 = high - (diff * 0.618)
            
            return fib_23_6, fib_38_2, fib_50_0, fib_61_8
        except:
            return (pd.Series(0, index=df.index), pd.Series(0, index=df.index),
                   pd.Series(0, index=df.index), pd.Series(0, index=df.index))
    
    def _calculate_price_efficiency(self, df: pd.DataFrame) -> pd.Series:
        """Price efficiency hesapla"""
        try:
            returns = df['Close'].pct_change()
            cumulative_return = (1 + returns).cumprod()
            price_efficiency = cumulative_return / (1 + returns.rolling(20).mean() * 20)
            return price_efficiency
        except:
            return pd.Series(0, index=df.index)
    
    def _detect_rsi_divergence(self, df: pd.DataFrame) -> pd.Series:
        """RSI divergence tespit et"""
        try:
            # Basit divergence detection
            price_peaks, _ = find_peaks(df['Close'], distance=5)
            rsi_peaks, _ = find_peaks(df['RSI'], distance=5)
            
            divergence = pd.Series(0, index=df.index)
            
            if len(price_peaks) > 1 and len(rsi_peaks) > 1:
                # Bearish divergence: price higher, RSI lower
                if (df['Close'].iloc[price_peaks[-1]] > df['Close'].iloc[price_peaks[-2]] and
                    df['RSI'].iloc[rsi_peaks[-1]] < df['RSI'].iloc[rsi_peaks[-2]]):
                    divergence.iloc[price_peaks[-1]] = -1
                
                # Bullish divergence: price lower, RSI higher
                elif (df['Close'].iloc[price_peaks[-1]] < df['Close'].iloc[price_peaks[-2]] and
                      df['RSI'].iloc[rsi_peaks[-1]] > df['RSI'].iloc[rsi_peaks[-2]]):
                    divergence.iloc[price_peaks[-1]] = 1
            
            return divergence
        except:
            return pd.Series(0, index=df.index)
    
    def _detect_macd_divergence(self, df: pd.DataFrame) -> pd.Series:
        """MACD divergence tespit et"""
        try:
            # Basit MACD divergence
            macd_peaks, _ = find_peaks(df['MACD'], distance=5)
            price_peaks, _ = find_peaks(df['Close'], distance=5)
            
            divergence = pd.Series(0, index=df.index)
            
            if len(macd_peaks) > 1 and len(price_peaks) > 1:
                # Bearish divergence
                if (df['Close'].iloc[price_peaks[-1]] > df['Close'].iloc[price_peaks[-2]] and
                    df['MACD'].iloc[macd_peaks[-1]] < df['MACD'].iloc[macd_peaks[-2]]):
                    divergence.iloc[price_peaks[-1]] = -1
                
                # Bullish divergence
                elif (df['Close'].iloc[price_peaks[-1]] < df['Close'].iloc[price_peaks[-2]] and
                      df['MACD'].iloc[macd_peaks[-1]] > df['MACD'].iloc[macd_peaks[-2]]):
                    divergence.iloc[price_peaks[-1]] = 1
            
            return divergence
        except:
            return pd.Series(0, index=df.index)
    
    def _detect_higher_highs(self, df: pd.DataFrame) -> pd.Series:
        """Higher highs tespit et"""
        try:
            higher_highs = pd.Series(0, index=df.index)
            
            for i in range(20, len(df)):
                if (df['High'].iloc[i] > df['High'].iloc[i-20:i].max()):
                    higher_highs.iloc[i] = 1
            
            return higher_highs
        except:
            return pd.Series(0, index=df.index)
    
    def _detect_lower_lows(self, df: pd.DataFrame) -> pd.Series:
        """Lower lows tespit et"""
        try:
            lower_lows = pd.Series(0, index=df.index)
            
            for i in range(20, len(df)):
                if (df['Low'].iloc[i] < df['Low'].iloc[i-20:i].min()):
                    lower_lows.iloc[i] = 1
            
            return lower_lows
        except:
            return pd.Series(0, index=df.index)
    
    def _detect_breakout_up(self, df: pd.DataFrame) -> pd.Series:
        """Yukarı breakout tespit et"""
        try:
            breakout_up = pd.Series(0, index=df.index)
            
            for i in range(20, len(df)):
                if (df['Close'].iloc[i] > df['High'].iloc[i-20:i].max()):
                    breakout_up.iloc[i] = 1
            
            return breakout_up
        except:
            return pd.Series(0, index=df.index)
    
    def _detect_breakout_down(self, df: pd.DataFrame) -> pd.Series:
        """Aşağı breakout tespit et"""
        try:
            breakout_down = pd.Series(0, index=df.index)
            
            for i in range(20, len(df)):
                if (df['Close'].iloc[i] < df['Low'].iloc[i-20:i].min()):
                    breakout_down.iloc[i] = 1
            
            return breakout_down
        except:
            return pd.Series(0, index=df.index)
    
    def _calculate_hurst_exponent(self, df: pd.DataFrame) -> pd.Series:
        """Hurst exponent hesapla"""
        try:
            def hurst(ts):
                try:
                    lags = range(2, min(20, len(ts)//2))
                    tau = [np.sqrt(np.std(np.subtract(ts[lag:], ts[:-lag]))) for lag in lags]
                    reg = np.polyfit(np.log(lags), np.log(tau), 1)
                    return reg[0]
                except:
                    return 0
            
            hurst_values = df['Close'].rolling(50).apply(hurst)
            return hurst_values
        except:
            return pd.Series(0, index=df.index)
    
    def get_macro_features(self, symbol: str) -> Dict:
        """Makro ekonomik özellikler"""
        try:
            # TCMB verileri (örnek)
            macro_features = {
                "usd_try": 0.0,
                "eur_try": 0.0,
                "gold_price": 0.0,
                "oil_price": 0.0,
                "interest_rate": 0.0,
                "inflation_rate": 0.0,
                "gdp_growth": 0.0,
                "unemployment": 0.0
            }
            
            # Gerçek API entegrasyonu burada yapılacak
            # Şimdilik placeholder değerler
            
            return macro_features
            
        except Exception as e:
            logger.error(f"❌ Makro özellik hatası: {e}")
            return {}
    
    def get_sentiment_features(self, symbol: str) -> Dict:
        """Sentiment özellikleri"""
        try:
            # Haber sentiment analizi
            sentiment_features = {
                "news_sentiment": 0.0,
                "social_sentiment": 0.0,
                "analyst_rating": 0.0,
                "insider_trading": 0.0,
                "institutional_flow": 0.0,
                "short_interest": 0.0,
                "options_flow": 0.0
            }
            
            # Gerçek sentiment API entegrasyonu burada yapılacak
            
            return sentiment_features
            
        except Exception as e:
            logger.error(f"❌ Sentiment özellik hatası: {e}")
            return {}
    
    def create_composite_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Kompozit özellikler oluştur"""
        try:
            # 1. Trend Strength Composite
            df['TREND_STRENGTH_COMPOSITE'] = (
                df['ADX'] * 0.3 +
                df['DI_plus'] * 0.2 +
                df['DI_minus'] * 0.2 +
                df['AROON_OSC'] * 0.3
            ) / 100
            
            # 2. Momentum Composite
            df['MOMENTUM_COMPOSITE'] = (
                df['RSI'] * 0.25 +
                df['STOCH_K'] * 0.25 +
                df['ROC'] * 0.25 +
                df['MOM'] * 0.25
            ) / 100
            
            # 3. Volatility Composite
            df['VOLATILITY_COMPOSITE'] = (
                df['ATR'] * 0.4 +
                df['BB_Width'] * 0.3 +
                df['KC_WIDTH'] * 0.3
            )
            
            # 4. Volume Composite
            df['VOLUME_COMPOSITE'] = (
                df['OBV'] * 0.3 +
                df['AD'] * 0.3 +
                df['CMF'] * 0.4
            )
            
            # 5. Support/Resistance Composite
            df['SR_COMPOSITE'] = (
                df['Price_Position'] * 0.4 +
                df['CHANNEL_POSITION'] * 0.3 +
                df['FIB_50.0'] * 0.3
            )
            
            # 6. Market Structure Composite
            df['STRUCTURE_COMPOSITE'] = (
                df['HIGHER_HIGH'] * 0.3 +
                df['LOWER_LOW'] * 0.3 +
                df['BREAKOUT_UP'] * 0.2 +
                df['BREAKOUT_DOWN'] * 0.2
            )
            
            # 7. Overall Technical Score
            df['TECHNICAL_SCORE'] = (
                df['TREND_STRENGTH_COMPOSITE'] * 0.25 +
                df['MOMENTUM_COMPOSITE'] * 0.25 +
                df['VOLATILITY_COMPOSITE'] * 0.15 +
                df['VOLUME_COMPOSITE'] * 0.15 +
                df['SR_COMPOSITE'] * 0.1 +
                df['STRUCTURE_COMPOSITE'] * 0.1
            )
            
            return df
            
        except Exception as e:
            logger.error(f"❌ Kompozit özellik hatası: {e}")
            return df
    
    def get_all_features(self, symbol: str, period: str = "2y") -> pd.DataFrame:
        """Tüm özellikleri birleştir"""
        try:
            # Temel veri
            stock = yf.Ticker(symbol)
            data = stock.history(period=period)
            
            if data.empty:
                return pd.DataFrame()
            
            # Temel teknik özellikler
            data = self.get_enhanced_features(data)
            
            # Gelişmiş teknik özellikler
            data = self.get_advanced_technical_features(data)
            
            # Kompozit özellikler
            data = self.get_composite_features(data)
            
            # Makro özellikler
            macro_features = self.get_macro_features(symbol)
            for key, value in macro_features.items():
                data[key] = value
            
            # Sentiment özellikler
            sentiment_features = self.get_sentiment_features(symbol)
            for key, value in sentiment_features.items():
                data[key] = value
            
            # NaN değerleri temizle
            data = data.dropna()
            
            return data
            
        except Exception as e:
            logger.error(f"❌ Tüm özellik hatası: {e}")
            return pd.DataFrame()

# Test fonksiyonu
if __name__ == "__main__":
    engine = AdvancedFeatureEngine()
    
    # Test hissesi
    symbol = "GARAN.IS"
    logger.info(f"🧪 {symbol} için gelişmiş özellikler test ediliyor...")
    
    # Tüm özellikleri al
    features = engine.get_all_features(symbol)
    
    if not features.empty:
        logger.info(f"✅ {len(features.columns)} özellik oluşturuldu")
        logger.info(f"📊 Özellik listesi: {list(features.columns)}")
        logger.info(f"📈 Veri boyutu: {features.shape}")
    else:
        logger.error("❌ Özellik oluşturulamadı")
