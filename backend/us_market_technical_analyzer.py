#!/usr/bin/env python3
"""
📈 US Market Technical Analysis Engine
US marketlerin teknik analizi için gelişmiş araçlar
"""

import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Optional, Tuple, Any
import asyncio
import json
from dataclasses import dataclass
from enum import Enum

# Mock TA-Lib implementasyonu
class MockTalib:
    @staticmethod
    def RSI(close, timeperiod=14):
        """Mock RSI hesaplama"""
        delta = close.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=timeperiod).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=timeperiod).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi.fillna(50)
    
    @staticmethod
    def MACD(close, fastperiod=12, slowperiod=26, signalperiod=9):
        """Mock MACD hesaplama"""
        ema_fast = close.ewm(span=fastperiod).mean()
        ema_slow = close.ewm(span=slowperiod).mean()
        macd = ema_fast - ema_slow
        macd_signal = macd.ewm(span=signalperiod).mean()
        macd_hist = macd - macd_signal
        return macd, macd_signal, macd_hist
    
    @staticmethod
    def BBANDS(close, timeperiod=20, nbdevup=2, nbdevdn=2):
        """Mock Bollinger Bands hesaplama"""
        sma = close.rolling(window=timeperiod).mean()
        std = close.rolling(window=timeperiod).std()
        upper = sma + (std * nbdevup)
        lower = sma - (std * nbdevdn)
        return upper, sma, lower
    
    @staticmethod
    def SMA(close, timeperiod=20):
        """Mock SMA hesaplama"""
        return close.rolling(window=timeperiod).mean()
    
    @staticmethod
    def EMA(close, timeperiod=12):
        """Mock EMA hesaplama"""
        return close.ewm(span=timeperiod).mean()
    
    @staticmethod
    def STOCH(high, low, close):
        """Mock Stochastic hesaplama"""
        lowest_low = low.rolling(window=14).min()
        highest_high = high.rolling(window=14).max()
        k_percent = 100 * ((close - lowest_low) / (highest_high - lowest_low))
        d_percent = k_percent.rolling(window=3).mean()
        return k_percent.fillna(50), d_percent.fillna(50)
    
    @staticmethod
    def WILLR(high, low, close):
        """Mock Williams %R hesaplama"""
        highest_high = high.rolling(window=14).max()
        lowest_low = low.rolling(window=14).min()
        willr = -100 * ((highest_high - close) / (highest_high - lowest_low))
        return willr.fillna(-50)
    
    @staticmethod
    def CCI(high, low, close):
        """Mock CCI hesaplama"""
        tp = (high + low + close) / 3
        sma_tp = tp.rolling(window=20).mean()
        mad = tp.rolling(window=20).apply(lambda x: np.mean(np.abs(x - x.mean())))
        cci = (tp - sma_tp) / (0.015 * mad)
        return cci.fillna(0)
    
    @staticmethod
    def CDLENGULFING(open_price, high, low, close):
        """Mock Engulfing pattern"""
        result = pd.Series(0, index=close.index)
        for i in range(1, len(close)):
            if (close.iloc[i] > open_price.iloc[i] and 
                close.iloc[i-1] < open_price.iloc[i-1] and
                close.iloc[i] > open_price.iloc[i-1] and
                open_price.iloc[i] < close.iloc[i-1]):
                result.iloc[i] = 100  # Bullish engulfing
            elif (close.iloc[i] < open_price.iloc[i] and 
                  close.iloc[i-1] > open_price.iloc[i-1] and
                  close.iloc[i] < open_price.iloc[i-1] and
                  open_price.iloc[i] > close.iloc[i-1]):
                result.iloc[i] = -100  # Bearish engulfing
        return result
    
    @staticmethod
    def CDLHAMMER(open_price, high, low, close):
        """Mock Hammer pattern"""
        result = pd.Series(0, index=close.index)
        for i in range(len(close)):
            body = abs(close.iloc[i] - open_price.iloc[i])
            lower_shadow = min(open_price.iloc[i], close.iloc[i]) - low.iloc[i]
            upper_shadow = high.iloc[i] - max(open_price.iloc[i], close.iloc[i])
            
            if (lower_shadow > 2 * body and upper_shadow < body):
                result.iloc[i] = 100
        return result
    
    @staticmethod
    def CDLDOJI(open_price, high, low, close):
        """Mock Doji pattern"""
        result = pd.Series(0, index=close.index)
        for i in range(len(close)):
            body = abs(close.iloc[i] - open_price.iloc[i])
            total_range = high.iloc[i] - low.iloc[i]
            
            if body < total_range * 0.1:  # Body < 10% of total range
                result.iloc[i] = 100
        return result
    
    @staticmethod
    def CDLSHOOTINGSTAR(open_price, high, low, close):
        """Mock Shooting Star pattern"""
        result = pd.Series(0, index=close.index)
        for i in range(len(close)):
            body = abs(close.iloc[i] - open_price.iloc[i])
            lower_shadow = min(open_price.iloc[i], close.iloc[i]) - low.iloc[i]
            upper_shadow = high.iloc[i] - max(open_price.iloc[i], close.iloc[i])
            
            if (upper_shadow > 2 * body and lower_shadow < body):
                result.iloc[i] = 100
        return result

# TA-Lib'i mock ile değiştir
try:
    import talib
except ImportError:
    talib = MockTalib()

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TechnicalSignalType(Enum):
    """Teknik analiz sinyal türleri"""
    STRONG_BUY = "STRONG_BUY"
    BUY = "BUY"
    WEAK_BUY = "WEAK_BUY"
    HOLD = "HOLD"
    WEAK_SELL = "WEAK_SELL"
    SELL = "SELL"
    STRONG_SELL = "STRONG_SELL"

class TechnicalPattern(Enum):
    """Teknik formasyonlar"""
    BULLISH_ENGULFING = "BULLISH_ENGULFING"
    BEARISH_ENGULFING = "BEARISH_ENGULFING"
    HAMMER = "HAMMER"
    DOJI = "DOJI"
    SHOOTING_STAR = "SHOOTING_STAR"
    DOUBLE_TOP = "DOUBLE_TOP"
    DOUBLE_BOTTOM = "DOUBLE_BOTTOM"
    HEAD_AND_SHOULDERS = "HEAD_AND_SHOULDERS"
    TRIANGLE = "TRIANGLE"
    FLAG = "FLAG"
    PENNANT = "PENNANT"
    CUP_AND_HANDLE = "CUP_AND_HANDLE"

@dataclass
class TechnicalSignal:
    """Teknik analiz sinyali"""
    symbol: str
    action: TechnicalSignalType
    confidence: float
    timeframe: str
    patterns: List[TechnicalPattern]
    support_levels: List[float]
    resistance_levels: List[float]
    trend_direction: str  # "UP", "DOWN", "SIDEWAYS"
    trend_strength: float  # 0.0 to 1.0
    momentum_score: float  # -1.0 to 1.0
    volatility_score: float  # 0.0 to 1.0
    volume_score: float  # 0.0 to 1.0
    rsi: float
    macd_signal: str  # "BULLISH", "BEARISH", "NEUTRAL"
    bollinger_position: str  # "UPPER", "MIDDLE", "LOWER"
    timestamp: datetime
    reasons: List[str]

class USMarketTechnicalAnalyzer:
    """US Market Technical Analysis Engine"""
    
    def __init__(self):
        self.us_symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "NFLX"]
        
        self.technical_config = {
            "rsi_oversold": 30,
            "rsi_overbought": 70,
            "macd_fast": 12,
            "macd_slow": 26,
            "macd_signal": 9,
            "bollinger_period": 20,
            "bollinger_std": 2,
            "volume_ma_period": 20,
            "trend_period": 50,
            "min_confidence": 0.6,
            "pattern_lookback": 20
        }
        
        self.technical_history = []
        self.performance_metrics = {
            "total_analyses": 0,
            "accurate_signals": 0,
            "accuracy_rate": 0.0,
            "avg_confidence": 0.0,
            "strong_signals": 0,
            "weak_signals": 0,
            "pattern_detections": 0
        }
        
    def analyze_technical_signals(self) -> List[TechnicalSignal]:
        """Teknik analiz sinyalleri üret"""
        try:
            logger.info("📈 US Market teknik analiz başlatılıyor...")
            
            signals = []
            for symbol in self.us_symbols:
                try:
                    # Mock veri oluştur
                    data = self._get_mock_price_data(symbol)
                    if data.empty:
                        continue
                    
                    # Teknik analiz yap
                    signal = self._analyze_symbol_technical(symbol, data)
                    if signal:
                        signals.append(signal)
                        logger.info(f"📊 {symbol}: {signal.action.value} - Güven: {signal.confidence:.2f}")
                    
                except Exception as e:
                    logger.error(f"❌ {symbol} teknik analiz hatası: {e}")
                    continue
            
            # Sinyalleri güven skoruna göre sırala
            signals.sort(key=lambda x: x.confidence, reverse=True)
            
            logger.info(f"✅ {len(signals)} teknik sinyal bulundu")
            return signals
            
        except Exception as e:
            logger.error(f"❌ Teknik analiz hatası: {e}")
            return []
    
    def _get_mock_price_data(self, symbol: str) -> pd.DataFrame:
        """Mock fiyat verisi oluştur"""
        try:
            # 100 günlük mock data
            dates = pd.date_range(start=datetime.now() - timedelta(days=100), periods=100, freq='D')
            
            # Gerçekçi mock data
            np.random.seed(42)  # Tutarlılık için
            base_price = 150.0 if symbol == "AAPL" else 300.0
            
            prices = []
            volumes = []
            current_price = base_price
            
            for i in range(len(dates)):
                # Trend ekle
                trend = 0.001 if i > 50 else -0.0005  # İlk 50 gün düşüş, sonra yükseliş
                
                # Fiyat hareketi
                change = np.random.normal(trend, 0.02)  # %2 volatilite
                current_price *= (1 + change)
                prices.append(current_price)
                
                # Hacim
                volume = np.random.randint(1000000, 5000000)
                volumes.append(volume)
            
            data = pd.DataFrame({
                'Open': prices,
                'High': [p * (1 + abs(np.random.normal(0, 0.01))) for p in prices],
                'Low': [p * (1 - abs(np.random.normal(0, 0.01))) for p in prices],
                'Close': prices,
                'Volume': volumes
            }, index=dates)
            
            # Teknik indikatörler ekle
            data = self._add_technical_indicators(data)
            return data
            
        except Exception as e:
            logger.error(f"❌ {symbol} mock veri hatası: {e}")
            return pd.DataFrame()
    
    def _add_technical_indicators(self, data: pd.DataFrame) -> pd.DataFrame:
        """Teknik indikatörler ekle"""
        try:
            # RSI
            data['rsi'] = talib.RSI(data['Close'], timeperiod=14)
            
            # MACD
            data['macd'], data['macd_signal'], data['macd_hist'] = talib.MACD(
                data['Close'], 
                fastperiod=self.technical_config['macd_fast'],
                slowperiod=self.technical_config['macd_slow'],
                signalperiod=self.technical_config['macd_signal']
            )
            
            # Bollinger Bands
            data['bb_upper'], data['bb_middle'], data['bb_lower'] = talib.BBANDS(
                data['Close'],
                timeperiod=self.technical_config['bollinger_period'],
                nbdevup=self.technical_config['bollinger_std'],
                nbdevdn=self.technical_config['bollinger_std']
            )
            
            # Moving Averages
            data['sma_20'] = talib.SMA(data['Close'], timeperiod=20)
            data['sma_50'] = talib.SMA(data['Close'], timeperiod=50)
            data['ema_12'] = talib.EMA(data['Close'], timeperiod=12)
            data['ema_26'] = talib.EMA(data['Close'], timeperiod=26)
            
            # Volume indicators
            data['volume_ma'] = talib.SMA(data['Volume'], timeperiod=self.technical_config['volume_ma_period'])
            data['volume_ratio'] = data['Volume'] / data['volume_ma']
            
            # Stochastic
            data['stoch_k'], data['stoch_d'] = talib.STOCH(data['High'], data['Low'], data['Close'])
            
            # Williams %R
            data['williams_r'] = talib.WILLR(data['High'], data['Low'], data['Close'])
            
            # CCI
            data['cci'] = talib.CCI(data['High'], data['Low'], data['Close'])
            
            return data
            
        except Exception as e:
            logger.error(f"❌ İndikatör ekleme hatası: {e}")
            return data
    
    def _analyze_symbol_technical(self, symbol: str, data: pd.DataFrame) -> Optional[TechnicalSignal]:
        """Sembol teknik analizi"""
        try:
            if len(data) < 50:
                return None
            
            latest = data.iloc[-1]
            
            # Teknik formasyonları tespit et
            patterns = self._detect_patterns(data)
            
            # Destek ve direnç seviyelerini bul
            support_levels = self._find_support_levels(data)
            resistance_levels = self._find_resistance_levels(data)
            
            # Trend analizi
            trend_direction, trend_strength = self._analyze_trend(data)
            
            # Momentum analizi
            momentum_score = self._analyze_momentum(data)
            
            # Volatilite analizi
            volatility_score = self._analyze_volatility(data)
            
            # Hacim analizi
            volume_score = self._analyze_volume(data)
            
            # RSI analizi
            rsi = latest['rsi']
            
            # MACD analizi
            macd_signal = self._analyze_macd(data)
            
            # Bollinger Bands analizi
            bollinger_position = self._analyze_bollinger_bands(data)
            
            # Sinyal türünü belirle
            action = self._determine_technical_signal(
                patterns, trend_direction, momentum_score, rsi, macd_signal, bollinger_position
            )
            
            # Güven skoru hesapla
            confidence = self._calculate_technical_confidence(
                patterns, trend_strength, momentum_score, volume_score, volatility_score
            )
            
            # Nedenleri oluştur
            reasons = self._get_technical_reasons(
                patterns, trend_direction, momentum_score, rsi, macd_signal, bollinger_position
            )
            
            # Teknik sinyal oluştur
            signal = TechnicalSignal(
                symbol=symbol,
                action=action,
                confidence=confidence,
                timeframe="1D",
                patterns=patterns,
                support_levels=support_levels,
                resistance_levels=resistance_levels,
                trend_direction=trend_direction,
                trend_strength=trend_strength,
                momentum_score=momentum_score,
                volatility_score=volatility_score,
                volume_score=volume_score,
                rsi=rsi,
                macd_signal=macd_signal,
                bollinger_position=bollinger_position,
                timestamp=datetime.now(),
                reasons=reasons
            )
            
            return signal
            
        except Exception as e:
            logger.error(f"❌ {symbol} teknik analiz hatası: {e}")
            return None
    
    def _detect_patterns(self, data: pd.DataFrame) -> List[TechnicalPattern]:
        """Teknik formasyonları tespit et"""
        try:
            patterns = []
            
            # Candlestick patterns
            if talib.CDLENGULFING(data['Open'], data['High'], data['Low'], data['Close']).iloc[-1] > 0:
                patterns.append(TechnicalPattern.BULLISH_ENGULFING)
            elif talib.CDLENGULFING(data['Open'], data['High'], data['Low'], data['Close']).iloc[-1] < 0:
                patterns.append(TechnicalPattern.BEARISH_ENGULFING)
            
            if talib.CDLHAMMER(data['Open'], data['High'], data['Low'], data['Close']).iloc[-1] > 0:
                patterns.append(TechnicalPattern.HAMMER)
            
            if talib.CDLDOJI(data['Open'], data['High'], data['Low'], data['Close']).iloc[-1] > 0:
                patterns.append(TechnicalPattern.DOJI)
            
            if talib.CDLSHOOTINGSTAR(data['Open'], data['High'], data['Low'], data['Close']).iloc[-1] > 0:
                patterns.append(TechnicalPattern.SHOOTING_STAR)
            
            # Price patterns (basit implementasyon)
            if self._detect_double_top(data):
                patterns.append(TechnicalPattern.DOUBLE_TOP)
            elif self._detect_double_bottom(data):
                patterns.append(TechnicalPattern.DOUBLE_BOTTOM)
            
            return patterns
            
        except Exception as e:
            logger.error(f"❌ Formasyon tespit hatası: {e}")
            return []
    
    def _detect_double_top(self, data: pd.DataFrame) -> bool:
        """Double top formasyonu tespit et"""
        try:
            if len(data) < 20:
                return False
            
            # Son 20 günün en yüksek fiyatlarını bul
            recent_highs = data['High'].tail(20)
            peaks = recent_highs.nlargest(2)
            
            # İki tepe arasındaki fark %2'den az mı?
            if len(peaks) >= 2:
                diff = abs(peaks.iloc[0] - peaks.iloc[1]) / peaks.iloc[0]
                return diff < 0.02
            
            return False
            
        except Exception as e:
            logger.error(f"❌ Double top tespit hatası: {e}")
            return False
    
    def _detect_double_bottom(self, data: pd.DataFrame) -> bool:
        """Double bottom formasyonu tespit et"""
        try:
            if len(data) < 20:
                return False
            
            # Son 20 günün en düşük fiyatlarını bul
            recent_lows = data['Low'].tail(20)
            troughs = recent_lows.nsmallest(2)
            
            # İki dip arasındaki fark %2'den az mı?
            if len(troughs) >= 2:
                diff = abs(troughs.iloc[0] - troughs.iloc[1]) / troughs.iloc[0]
                return diff < 0.02
            
            return False
            
        except Exception as e:
            logger.error(f"❌ Double bottom tespit hatası: {e}")
            return False
    
    def _find_support_levels(self, data: pd.DataFrame) -> List[float]:
        """Destek seviyelerini bul"""
        try:
            # Son 50 günün en düşük fiyatlarını al
            recent_lows = data['Low'].tail(50)
            
            # En düşük 3 seviyeyi destek olarak kabul et
            support_levels = recent_lows.nsmallest(3).tolist()
            
            return support_levels
            
        except Exception as e:
            logger.error(f"❌ Destek seviyesi bulma hatası: {e}")
            return []
    
    def _find_resistance_levels(self, data: pd.DataFrame) -> List[float]:
        """Direnç seviyelerini bul"""
        try:
            # Son 50 günün en yüksek fiyatlarını al
            recent_highs = data['High'].tail(50)
            
            # En yüksek 3 seviyeyi direnç olarak kabul et
            resistance_levels = recent_highs.nlargest(3).tolist()
            
            return resistance_levels
            
        except Exception as e:
            logger.error(f"❌ Direnç seviyesi bulma hatası: {e}")
            return []
    
    def _analyze_trend(self, data: pd.DataFrame) -> Tuple[str, float]:
        """Trend analizi"""
        try:
            # SMA 20 ve 50 karşılaştırması
            sma_20 = data['sma_20'].iloc[-1]
            sma_50 = data['sma_50'].iloc[-1]
            current_price = data['Close'].iloc[-1]
            
            # Trend yönü
            if sma_20 > sma_50 and current_price > sma_20:
                trend_direction = "UP"
                trend_strength = min(1.0, (current_price - sma_50) / sma_50)
            elif sma_20 < sma_50 and current_price < sma_20:
                trend_direction = "DOWN"
                trend_strength = min(1.0, (sma_50 - current_price) / sma_50)
            else:
                trend_direction = "SIDEWAYS"
                trend_strength = 0.5
            
            return trend_direction, trend_strength
            
        except Exception as e:
            logger.error(f"❌ Trend analiz hatası: {e}")
            return "SIDEWAYS", 0.5
    
    def _analyze_momentum(self, data: pd.DataFrame) -> float:
        """Momentum analizi"""
        try:
            # MACD histogram
            macd_hist = data['macd_hist'].iloc[-1]
            
            # RSI momentum
            rsi = data['rsi'].iloc[-1]
            rsi_momentum = (rsi - 50) / 50
            
            # Stochastic momentum
            stoch_k = data['stoch_k'].iloc[-1]
            stoch_momentum = (stoch_k - 50) / 50
            
            # Ortalama momentum
            momentum = (macd_hist + rsi_momentum + stoch_momentum) / 3
            
            return max(-1.0, min(1.0, momentum))
            
        except Exception as e:
            logger.error(f"❌ Momentum analiz hatası: {e}")
            return 0.0
    
    def _analyze_volatility(self, data: pd.DataFrame) -> float:
        """Volatilite analizi"""
        try:
            # Bollinger Bands genişliği
            bb_upper = data['bb_upper'].iloc[-1]
            bb_lower = data['bb_lower'].iloc[-1]
            bb_middle = data['bb_middle'].iloc[-1]
            
            bb_width = (bb_upper - bb_lower) / bb_middle
            
            # Normalize et (0-1 arası)
            volatility_score = min(1.0, bb_width * 10)
            
            return volatility_score
            
        except Exception as e:
            logger.error(f"❌ Volatilite analiz hatası: {e}")
            return 0.5
    
    def _analyze_volume(self, data: pd.DataFrame) -> float:
        """Hacim analizi"""
        try:
            # Hacim oranı
            volume_ratio = data['volume_ratio'].iloc[-1]
            
            # Normalize et (0-1 arası)
            volume_score = min(1.0, volume_ratio / 2.0)
            
            return volume_score
            
        except Exception as e:
            logger.error(f"❌ Hacim analiz hatası: {e}")
            return 0.5
    
    def _analyze_macd(self, data: pd.DataFrame) -> str:
        """MACD analizi"""
        try:
            macd = data['macd'].iloc[-1]
            macd_signal = data['macd_signal'].iloc[-1]
            macd_hist = data['macd_hist'].iloc[-1]
            
            if macd > macd_signal and macd_hist > 0:
                return "BULLISH"
            elif macd < macd_signal and macd_hist < 0:
                return "BEARISH"
            else:
                return "NEUTRAL"
                
        except Exception as e:
            logger.error(f"❌ MACD analiz hatası: {e}")
            return "NEUTRAL"
    
    def _analyze_bollinger_bands(self, data: pd.DataFrame) -> str:
        """Bollinger Bands analizi"""
        try:
            current_price = data['Close'].iloc[-1]
            bb_upper = data['bb_upper'].iloc[-1]
            bb_middle = data['bb_middle'].iloc[-1]
            bb_lower = data['bb_lower'].iloc[-1]
            
            if current_price > bb_upper:
                return "UPPER"
            elif current_price < bb_lower:
                return "LOWER"
            else:
                return "MIDDLE"
                
        except Exception as e:
            logger.error(f"❌ Bollinger Bands analiz hatası: {e}")
            return "MIDDLE"
    
    def _determine_technical_signal(self, patterns: List[TechnicalPattern], trend_direction: str, 
                                  momentum_score: float, rsi: float, macd_signal: str, 
                                  bollinger_position: str) -> TechnicalSignalType:
        """Teknik sinyal türünü belirle"""
        try:
            signal_score = 0.0
            
            # Trend skoru
            if trend_direction == "UP":
                signal_score += 0.3
            elif trend_direction == "DOWN":
                signal_score -= 0.3
            
            # Momentum skoru
            signal_score += momentum_score * 0.3
            
            # RSI skoru
            if rsi < 30:
                signal_score += 0.2  # Oversold
            elif rsi > 70:
                signal_score -= 0.2  # Overbought
            elif 40 <= rsi <= 60:
                signal_score += 0.1  # Neutral zone
            
            # MACD skoru
            if macd_signal == "BULLISH":
                signal_score += 0.2
            elif macd_signal == "BEARISH":
                signal_score -= 0.2
            
            # Bollinger Bands skoru
            if bollinger_position == "LOWER":
                signal_score += 0.1  # Oversold
            elif bollinger_position == "UPPER":
                signal_score -= 0.1  # Overbought
            
            # Pattern skoru
            for pattern in patterns:
                if pattern in [TechnicalPattern.BULLISH_ENGULFING, TechnicalPattern.HAMMER]:
                    signal_score += 0.1
                elif pattern in [TechnicalPattern.BEARISH_ENGULFING, TechnicalPattern.SHOOTING_STAR]:
                    signal_score -= 0.1
            
            # Sinyal türünü belirle
            if signal_score >= 0.6:
                return TechnicalSignalType.STRONG_BUY
            elif signal_score >= 0.3:
                return TechnicalSignalType.BUY
            elif signal_score >= 0.1:
                return TechnicalSignalType.WEAK_BUY
            elif signal_score >= -0.1:
                return TechnicalSignalType.HOLD
            elif signal_score >= -0.3:
                return TechnicalSignalType.WEAK_SELL
            elif signal_score >= -0.6:
                return TechnicalSignalType.SELL
            else:
                return TechnicalSignalType.STRONG_SELL
                
        except Exception as e:
            logger.error(f"❌ Teknik sinyal belirleme hatası: {e}")
            return TechnicalSignalType.HOLD
    
    def _calculate_technical_confidence(self, patterns: List[TechnicalPattern], trend_strength: float,
                                      momentum_score: float, volume_score: float, volatility_score: float) -> float:
        """Teknik güven skoru hesapla"""
        try:
            confidence = 0.0
            
            # Trend gücü
            confidence += trend_strength * 0.3
            
            # Momentum gücü
            confidence += abs(momentum_score) * 0.2
            
            # Hacim gücü
            confidence += volume_score * 0.2
            
            # Volatilite gücü (orta volatilite iyi)
            if 0.3 <= volatility_score <= 0.7:
                confidence += 0.2
            elif 0.2 <= volatility_score <= 0.8:
                confidence += 0.1
            
            # Pattern gücü
            if patterns:
                confidence += 0.1
            
            return min(confidence, 1.0)
            
        except Exception as e:
            logger.error(f"❌ Teknik güven skoru hesaplama hatası: {e}")
            return 0.0
    
    def _get_technical_reasons(self, patterns: List[TechnicalPattern], trend_direction: str,
                             momentum_score: float, rsi: float, macd_signal: str, 
                             bollinger_position: str) -> List[str]:
        """Teknik nedenleri oluştur"""
        reasons = []
        
        try:
            # Trend nedenleri
            if trend_direction == "UP":
                reasons.append("Yükseliş trendi")
            elif trend_direction == "DOWN":
                reasons.append("Düşüş trendi")
            else:
                reasons.append("Yatay trend")
            
            # Momentum nedenleri
            if momentum_score > 0.3:
                reasons.append("Güçlü yükseliş momentumu")
            elif momentum_score < -0.3:
                reasons.append("Güçlü düşüş momentumu")
            elif abs(momentum_score) < 0.1:
                reasons.append("Zayıf momentum")
            
            # RSI nedenleri
            if rsi < 30:
                reasons.append("Oversold (RSI < 30)")
            elif rsi > 70:
                reasons.append("Overbought (RSI > 70)")
            elif 40 <= rsi <= 60:
                reasons.append("Nötr RSI")
            
            # MACD nedenleri
            if macd_signal == "BULLISH":
                reasons.append("MACD bullish")
            elif macd_signal == "BEARISH":
                reasons.append("MACD bearish")
            
            # Bollinger Bands nedenleri
            if bollinger_position == "LOWER":
                reasons.append("Bollinger alt bandında")
            elif bollinger_position == "UPPER":
                reasons.append("Bollinger üst bandında")
            else:
                reasons.append("Bollinger orta bandında")
            
            # Pattern nedenleri
            for pattern in patterns:
                reasons.append(f"{pattern.value} formasyonu")
            
            return reasons
            
        except Exception as e:
            logger.error(f"❌ Teknik nedenler oluşturma hatası: {e}")
            return ["Teknik analiz"]
    
    def get_technical_summary(self, signals: List[TechnicalSignal]) -> Dict:
        """Teknik analiz özeti al"""
        try:
            if not signals:
                return {"error": "Sinyal bulunamadı"}
            
            # Genel sinyal dağılımı
            signal_counts = {}
            for signal in signals:
                signal_type = signal.action.value
                signal_counts[signal_type] = signal_counts.get(signal_type, 0) + 1
            
            # Ortalama güven skoru
            avg_confidence = sum(signal.confidence for signal in signals) / len(signals)
            
            # Trend dağılımı
            trend_counts = {}
            for signal in signals:
                trend = signal.trend_direction
                trend_counts[trend] = trend_counts.get(trend, 0) + 1
            
            # Pattern dağılımı
            all_patterns = []
            for signal in signals:
                all_patterns.extend(signal.patterns)
            pattern_counts = {}
            for pattern in all_patterns:
                pattern_counts[pattern.value] = pattern_counts.get(pattern.value, 0) + 1
            
            return {
                "total_signals": len(signals),
                "average_confidence": avg_confidence,
                "signal_distribution": signal_counts,
                "trend_distribution": trend_counts,
                "pattern_distribution": pattern_counts,
                "most_confident": max(signals, key=lambda x: x.confidence).symbol if signals else None,
                "strongest_trend": max(signals, key=lambda x: x.trend_strength).symbol if signals else None,
                "highest_momentum": max(signals, key=lambda x: x.momentum_score).symbol if signals else None
            }
            
        except Exception as e:
            logger.error(f"❌ Teknik özet hatası: {e}")
            return {"error": str(e)}
    
    def get_performance_report(self) -> Dict:
        """Performans raporu al"""
        try:
            return {
                "performance_metrics": self.performance_metrics,
                "total_history": len(self.technical_history),
                "last_10_analyses": self.technical_history[-10:] if self.technical_history else []
            }
            
        except Exception as e:
            logger.error(f"❌ Performans raporu hatası: {e}")
            return {"error": str(e)}

# Demo fonksiyonu
async def demo_technical_analyzer():
    """Technical analyzer demo"""
    try:
        logger.info("🚀 US Market Technical Analyzer Demo Başlatılıyor...")
        
        analyzer = USMarketTechnicalAnalyzer()
        
        # Teknik analiz yap
        signals = analyzer.analyze_technical_signals()
        
        if signals:
            logger.info(f"📊 {len(signals)} teknik sinyal bulundu!")
            
            # Teknik özet
            summary = analyzer.get_technical_summary(signals)
            logger.info(f"📈 Teknik Özet:")
            logger.info(f"   Ortalama Güven: {summary['average_confidence']:.2f}")
            logger.info(f"   En Güvenli: {summary['most_confident']}")
            logger.info(f"   En Güçlü Trend: {summary['strongest_trend']}")
            logger.info(f"   En Yüksek Momentum: {summary['highest_momentum']}")
            logger.info(f"   Trend Dağılımı: {summary['trend_distribution']}")
            
        else:
            logger.info("⏸️ Şu an teknik sinyal yok")
        
        # Performans raporu
        performance = analyzer.get_performance_report()
        logger.info(f"📊 Performans: {performance}")
        
    except Exception as e:
        logger.error(f"❌ Demo hatası: {e}")

if __name__ == "__main__":
    asyncio.run(demo_technical_analyzer())
