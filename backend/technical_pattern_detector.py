#!/usr/bin/env python3
"""
📈 Technical Pattern Detection Engine
PRD v2.0 - EMA Cross, Candlestick, Harmonic Pattern Detection
"""

import numpy as np
import pandas as pd
import logging
from typing import Dict, List, Tuple, Optional, NamedTuple
from dataclasses import dataclass
from enum import Enum
import yfinance as yf
from datetime import datetime, timedelta
import talib

logger = logging.getLogger(__name__)

class PatternType(Enum):
    """Pattern türleri"""
    EMA_CROSS_BULLISH = "EMA_CROSS_BULLISH"
    EMA_CROSS_BEARISH = "EMA_CROSS_BEARISH"
    BULLISH_ENGULFING = "BULLISH_ENGULFING"
    BEARISH_ENGULFING = "BEARISH_ENGULFING"
    HAMMER = "HAMMER"
    DOJI = "DOJI"
    GARTLEY_BULLISH = "GARTLEY_BULLISH"
    GARTLEY_BEARISH = "GARTLEY_BEARISH"
    BUTTERFLY_BULLISH = "BUTTERFLY_BULLISH"
    BUTTERFLY_BEARISH = "BUTTERFLY_BEARISH"
    FRACTAL_BREAKOUT = "FRACTAL_BREAKOUT"
    SUPPORT_RESISTANCE = "SUPPORT_RESISTANCE"

@dataclass
class PatternSignal:
    """Pattern sinyali"""
    pattern_type: PatternType
    symbol: str
    timestamp: datetime
    confidence: float
    entry_price: float
    stop_loss: float
    take_profit: float
    risk_reward: float
    description: str
    timeframe: str

class TechnicalPatternDetector:
    """Teknik pattern tespit motoru"""
    
    def __init__(self):
        self.patterns_detected = []
        
    def detect_all_patterns(self, symbol: str, timeframe: str = "1d", 
                           period: str = "6mo") -> List[PatternSignal]:
        """Tüm pattern'leri tespit et"""
        logger.info(f"🔍 {symbol} için teknik pattern analizi başlıyor...")
        
        try:
            # Veri çek
            stock = yf.Ticker(symbol)
            data = stock.history(period=period, interval=timeframe)
            
            if data.empty:
                logger.error(f"❌ {symbol} için veri bulunamadı")
                return []
            
            # OHLCV verilerini hazırla
            opens = data['Open'].values
            highs = data['High'].values
            lows = data['Low'].values
            closes = data['Close'].values
            volumes = data['Volume'].values
            
            patterns = []
            
            # 1. EMA Cross Patterns
            patterns.extend(self._detect_ema_cross_patterns(symbol, closes, timeframe))
            
            # 2. Candlestick Patterns
            patterns.extend(self._detect_candlestick_patterns(symbol, opens, highs, lows, closes, timeframe))
            
            # 3. Harmonic Patterns
            patterns.extend(self._detect_harmonic_patterns(symbol, highs, lows, closes, timeframe))
            
            # 4. Fractal Breakout Patterns
            patterns.extend(self._detect_fractal_patterns(symbol, highs, lows, closes, timeframe))
            
            # 5. Support/Resistance Patterns
            patterns.extend(self._detect_support_resistance_patterns(symbol, highs, lows, closes, timeframe))
            
            logger.info(f"✅ {symbol}: {len(patterns)} pattern tespit edildi")
            return patterns
            
        except Exception as e:
            logger.error(f"❌ {symbol} pattern analizi hatası: {e}")
            return []
    
    def _detect_ema_cross_patterns(self, symbol: str, closes: np.ndarray, 
                                 timeframe: str) -> List[PatternSignal]:
        """EMA kesişim pattern'lerini tespit et"""
        patterns = []
        
        try:
            # EMA hesapla
            ema_20 = talib.EMA(closes, timeperiod=20)
            ema_50 = talib.EMA(closes, timeperiod=50)
            ema_200 = talib.EMA(closes, timeperiod=200)
            
            # Son 5 günü kontrol et
            for i in range(-5, 0):
                if i == -1:  # En son gün
                    continue
                    
                current_idx = len(closes) + i
                prev_idx = current_idx - 1
                
                if prev_idx < 0 or current_idx >= len(closes):
                    continue
                
                # EMA 20/50 Bullish Cross
                if (ema_20[prev_idx] <= ema_50[prev_idx] and 
                    ema_20[current_idx] > ema_50[current_idx]):
                    
                    confidence = self._calculate_ema_cross_confidence(
                        ema_20[current_idx], ema_50[current_idx], closes[current_idx]
                    )
                    
                    if confidence > 0.6:
                        entry_price = closes[current_idx]
                        stop_loss = entry_price * 0.95
                        take_profit = entry_price * 1.10
                        
                        pattern = PatternSignal(
                            pattern_type=PatternType.EMA_CROSS_BULLISH,
                            symbol=symbol,
                            timestamp=datetime.now(),
                            confidence=confidence,
                            entry_price=entry_price,
                            stop_loss=stop_loss,
                            take_profit=take_profit,
                            risk_reward=(take_profit - entry_price) / (entry_price - stop_loss),
                            description=f"EMA 20 ({ema_20[current_idx]:.2f}) EMA 50 ({ema_50[current_idx]:.2f}) üzerine çıktı",
                            timeframe=timeframe
                        )
                        patterns.append(pattern)
                
                # EMA 20/50 Bearish Cross
                elif (ema_20[prev_idx] >= ema_50[prev_idx] and 
                      ema_20[current_idx] < ema_50[current_idx]):
                    
                    confidence = self._calculate_ema_cross_confidence(
                        ema_50[current_idx], ema_20[current_idx], closes[current_idx]
                    )
                    
                    if confidence > 0.6:
                        entry_price = closes[current_idx]
                        stop_loss = entry_price * 1.05
                        take_profit = entry_price * 0.90
                        
                        pattern = PatternSignal(
                            pattern_type=PatternType.EMA_CROSS_BEARISH,
                            symbol=symbol,
                            timestamp=datetime.now(),
                            confidence=confidence,
                            entry_price=entry_price,
                            stop_loss=stop_loss,
                            take_profit=take_profit,
                            risk_reward=(entry_price - take_profit) / (stop_loss - entry_price),
                            description=f"EMA 20 ({ema_20[current_idx]:.2f}) EMA 50 ({ema_50[current_idx]:.2f}) altına düştü",
                            timeframe=timeframe
                        )
                        patterns.append(pattern)
            
        except Exception as e:
            logger.error(f"❌ EMA cross pattern hatası: {e}")
        
        return patterns
    
    def _detect_candlestick_patterns(self, symbol: str, opens: np.ndarray, 
                                   highs: np.ndarray, lows: np.ndarray, 
                                   closes: np.ndarray, timeframe: str) -> List[PatternSignal]:
        """Candlestick pattern'lerini tespit et"""
        patterns = []
        
        try:
            # Bullish Engulfing
            bullish_engulfing = talib.CDLENGULFING(opens, highs, lows, closes)
            for i in range(-3, 0):
                idx = len(closes) + i
                if idx >= 0 and bullish_engulfing[idx] > 0:
                    confidence = self._calculate_candlestick_confidence(
                        opens[idx], highs[idx], lows[idx], closes[idx], "bullish_engulfing"
                    )
                    
                    if confidence > 0.7:
                        entry_price = closes[idx]
                        stop_loss = lows[idx] * 0.98
                        take_profit = entry_price * 1.08
                        
                        pattern = PatternSignal(
                            pattern_type=PatternType.BULLISH_ENGULFING,
                            symbol=symbol,
                            timestamp=datetime.now(),
                            confidence=confidence,
                            entry_price=entry_price,
                            stop_loss=stop_loss,
                            take_profit=take_profit,
                            risk_reward=(take_profit - entry_price) / (entry_price - stop_loss),
                            description="Bullish Engulfing pattern tespit edildi",
                            timeframe=timeframe
                        )
                        patterns.append(pattern)
            
            # Bearish Engulfing
            bearish_engulfing = talib.CDLENGULFING(opens, highs, lows, closes)
            for i in range(-3, 0):
                idx = len(closes) + i
                if idx >= 0 and bearish_engulfing[idx] < 0:
                    confidence = self._calculate_candlestick_confidence(
                        opens[idx], highs[idx], lows[idx], closes[idx], "bearish_engulfing"
                    )
                    
                    if confidence > 0.7:
                        entry_price = closes[idx]
                        stop_loss = highs[idx] * 1.02
                        take_profit = entry_price * 0.92
                        
                        pattern = PatternSignal(
                            pattern_type=PatternType.BEARISH_ENGULFING,
                            symbol=symbol,
                            timestamp=datetime.now(),
                            confidence=confidence,
                            entry_price=entry_price,
                            stop_loss=stop_loss,
                            take_profit=take_profit,
                            risk_reward=(entry_price - take_profit) / (stop_loss - entry_price),
                            description="Bearish Engulfing pattern tespit edildi",
                            timeframe=timeframe
                        )
                        patterns.append(pattern)
            
            # Hammer
            hammer = talib.CDLHAMMER(opens, highs, lows, closes)
            for i in range(-2, 0):
                idx = len(closes) + i
                if idx >= 0 and hammer[idx] > 0:
                    confidence = self._calculate_candlestick_confidence(
                        opens[idx], highs[idx], lows[idx], closes[idx], "hammer"
                    )
                    
                    if confidence > 0.6:
                        entry_price = closes[idx]
                        stop_loss = lows[idx] * 0.95
                        take_profit = entry_price * 1.06
                        
                        pattern = PatternSignal(
                            pattern_type=PatternType.HAMMER,
                            symbol=symbol,
                            timestamp=datetime.now(),
                            confidence=confidence,
                            entry_price=entry_price,
                            stop_loss=stop_loss,
                            take_profit=take_profit,
                            risk_reward=(take_profit - entry_price) / (entry_price - stop_loss),
                            description="Hammer pattern tespit edildi",
                            timeframe=timeframe
                        )
                        patterns.append(pattern)
            
            # Doji
            doji = talib.CDLDOJI(opens, highs, lows, closes)
            for i in range(-2, 0):
                idx = len(closes) + i
                if idx >= 0 and doji[idx] > 0:
                    confidence = self._calculate_candlestick_confidence(
                        opens[idx], highs[idx], lows[idx], closes[idx], "doji"
                    )
                    
                    if confidence > 0.5:
                        entry_price = closes[idx]
                        stop_loss = entry_price * 0.97
                        take_profit = entry_price * 1.05
                        
                        pattern = PatternSignal(
                            pattern_type=PatternType.DOJI,
                            symbol=symbol,
                            timestamp=datetime.now(),
                            confidence=confidence,
                            entry_price=entry_price,
                            stop_loss=stop_loss,
                            take_profit=take_profit,
                            risk_reward=(take_profit - entry_price) / (entry_price - stop_loss),
                            description="Doji pattern tespit edildi - kararsızlık",
                            timeframe=timeframe
                        )
                        patterns.append(pattern)
        
        except Exception as e:
            logger.error(f"❌ Candlestick pattern hatası: {e}")
        
        return patterns
    
    def _detect_harmonic_patterns(self, symbol: str, highs: np.ndarray, 
                                lows: np.ndarray, closes: np.ndarray, 
                                timeframe: str) -> List[PatternSignal]:
        """Harmonic pattern'lerini tespit et"""
        patterns = []
        
        try:
            # Gartley Pattern (Basit implementasyon)
            for i in range(50, len(closes) - 10):
                # A, B, C, D noktalarını bul
                recent_highs = highs[i-50:i]
                recent_lows = lows[i-50:i]
                
                # Basit Gartley tespiti
                if self._is_gartley_pattern(recent_highs, recent_lows):
                    confidence = 0.7
                    entry_price = closes[i]
                    
                    if recent_lows[-1] < recent_highs[-1]:  # Bullish Gartley
                        stop_loss = recent_lows[-1] * 0.98
                        take_profit = entry_price * 1.12
                        
                        pattern = PatternSignal(
                            pattern_type=PatternType.GARTLEY_BULLISH,
                            symbol=symbol,
                            timestamp=datetime.now(),
                            confidence=confidence,
                            entry_price=entry_price,
                            stop_loss=stop_loss,
                            take_profit=take_profit,
                            risk_reward=(take_profit - entry_price) / (entry_price - stop_loss),
                            description="Gartley Bullish pattern tespit edildi",
                            timeframe=timeframe
                        )
                        patterns.append(pattern)
                    
                    else:  # Bearish Gartley
                        stop_loss = recent_highs[-1] * 1.02
                        take_profit = entry_price * 0.88
                        
                        pattern = PatternSignal(
                            pattern_type=PatternType.GARTLEY_BEARISH,
                            symbol=symbol,
                            timestamp=datetime.now(),
                            confidence=confidence,
                            entry_price=entry_price,
                            stop_loss=stop_loss,
                            take_profit=take_profit,
                            risk_reward=(entry_price - take_profit) / (stop_loss - entry_price),
                            description="Gartley Bearish pattern tespit edildi",
                            timeframe=timeframe
                        )
                        patterns.append(pattern)
        
        except Exception as e:
            logger.error(f"❌ Harmonic pattern hatası: {e}")
        
        return patterns
    
    def _detect_fractal_patterns(self, symbol: str, highs: np.ndarray, 
                               lows: np.ndarray, closes: np.ndarray, 
                               timeframe: str) -> List[PatternSignal]:
        """Fractal breakout pattern'lerini tespit et"""
        patterns = []
        
        try:
            # Fractal hesapla
            fractal_highs = talib.MAX(highs, timeperiod=5)
            fractal_lows = talib.MIN(lows, timeperiod=5)
            
            # Son fractal breakout'ları kontrol et
            for i in range(-10, -1):
                idx = len(closes) + i
                if idx < 5 or idx >= len(closes):
                    continue
                
                # Fractal breakout tespiti
                if closes[idx] > fractal_highs[idx-1] * 1.01:  # Yüksek fractal breakout
                    confidence = 0.6
                    entry_price = closes[idx]
                    stop_loss = fractal_lows[idx] * 0.98
                    take_profit = entry_price * 1.08
                    
                    pattern = PatternSignal(
                        pattern_type=PatternType.FRACTAL_BREAKOUT,
                        symbol=symbol,
                        timestamp=datetime.now(),
                        confidence=confidence,
                        entry_price=entry_price,
                        stop_loss=stop_loss,
                        take_profit=take_profit,
                        risk_reward=(take_profit - entry_price) / (entry_price - stop_loss),
                        description="Fractal breakout pattern tespit edildi",
                        timeframe=timeframe
                    )
                    patterns.append(pattern)
        
        except Exception as e:
            logger.error(f"❌ Fractal pattern hatası: {e}")
        
        return patterns
    
    def _detect_support_resistance_patterns(self, symbol: str, highs: np.ndarray, 
                                         lows: np.ndarray, closes: np.ndarray, 
                                         timeframe: str) -> List[PatternSignal]:
        """Support/Resistance pattern'lerini tespit et"""
        patterns = []
        
        try:
            # Basit support/resistance tespiti
            recent_highs = highs[-20:]
            recent_lows = lows[-20:]
            current_price = closes[-1]
            
            # Support seviyesi
            support_level = np.percentile(recent_lows, 20)
            if current_price <= support_level * 1.02:
                confidence = 0.6
                entry_price = current_price
                stop_loss = support_level * 0.95
                take_profit = entry_price * 1.08
                
                pattern = PatternSignal(
                    pattern_type=PatternType.SUPPORT_RESISTANCE,
                    symbol=symbol,
                    timestamp=datetime.now(),
                    confidence=confidence,
                    entry_price=entry_price,
                    stop_loss=stop_loss,
                    take_profit=take_profit,
                    risk_reward=(take_profit - entry_price) / (entry_price - stop_loss),
                    description=f"Support seviyesi ({support_level:.2f}) yakınında",
                    timeframe=timeframe
                )
                patterns.append(pattern)
            
            # Resistance seviyesi
            resistance_level = np.percentile(recent_highs, 80)
            if current_price >= resistance_level * 0.98:
                confidence = 0.6
                entry_price = current_price
                stop_loss = resistance_level * 1.05
                take_profit = entry_price * 0.92
                
                pattern = PatternSignal(
                    pattern_type=PatternType.SUPPORT_RESISTANCE,
                    symbol=symbol,
                    timestamp=datetime.now(),
                    confidence=confidence,
                    entry_price=entry_price,
                    stop_loss=stop_loss,
                    take_profit=take_profit,
                    risk_reward=(entry_price - take_profit) / (stop_loss - entry_price),
                    description=f"Resistance seviyesi ({resistance_level:.2f}) yakınında",
                    timeframe=timeframe
                )
                patterns.append(pattern)
        
        except Exception as e:
            logger.error(f"❌ Support/Resistance pattern hatası: {e}")
        
        return patterns
    
    def _calculate_ema_cross_confidence(self, ema_fast: float, ema_slow: float, 
                                     price: float) -> float:
        """EMA cross güven skoru hesapla"""
        try:
            # EMA'lar arasındaki mesafe
            ema_diff = abs(ema_fast - ema_slow) / price
            
            # Fiyatın EMA'lara göre konumu
            price_position = (price - ema_slow) / ema_slow
            
            # Güven skoru (0-1)
            confidence = min(ema_diff * 10 + abs(price_position) * 2, 1.0)
            return confidence
        except:
            return 0.5
    
    def _calculate_candlestick_confidence(self, open_price: float, high: float, 
                                       low: float, close: float, 
                                       pattern_type: str) -> float:
        """Candlestick pattern güven skoru hesapla"""
        try:
            body_size = abs(close - open_price)
            total_range = high - low
            
            if total_range == 0:
                return 0.5
            
            body_ratio = body_size / total_range
            
            if pattern_type == "bullish_engulfing":
                return min(body_ratio * 2, 1.0)
            elif pattern_type == "bearish_engulfing":
                return min(body_ratio * 2, 1.0)
            elif pattern_type == "hammer":
                return min(body_ratio * 1.5, 1.0)
            elif pattern_type == "doji":
                return min((1 - body_ratio) * 2, 1.0)
            
            return 0.5
        except:
            return 0.5
    
    def _is_gartley_pattern(self, highs: np.ndarray, lows: np.ndarray) -> bool:
        """Basit Gartley pattern tespiti"""
        try:
            if len(highs) < 10 or len(lows) < 10:
                return False
            
            # Basit fibonacci oranları kontrolü
            recent_high = np.max(highs[-5:])
            recent_low = np.min(lows[-5:])
            
            if recent_high > recent_low * 1.1:  # %10'dan fazla hareket
                return True
            
            return False
        except:
            return False

def test_pattern_detector():
    """Pattern detector test fonksiyonu"""
    logger.info("🧪 Technical Pattern Detector test başlıyor...")
    
    detector = TechnicalPatternDetector()
    test_symbols = ["GARAN.IS", "AKBNK.IS", "SISE.IS"]
    
    all_patterns = []
    
    for symbol in test_symbols:
        patterns = detector.detect_all_patterns(symbol)
        all_patterns.extend(patterns)
        
        logger.info(f"📈 {symbol}: {len(patterns)} pattern")
        for pattern in patterns:
            logger.info(f"   • {pattern.pattern_type.value}: {pattern.description}")
            logger.info(f"     Giriş: {pattern.entry_price:.2f}₺, TP: {pattern.take_profit:.2f}₺, SL: {pattern.stop_loss:.2f}₺")
    
    logger.info(f"✅ Toplam {len(all_patterns)} pattern tespit edildi")
    return all_patterns

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    test_pattern_detector()
