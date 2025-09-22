#!/usr/bin/env python3
"""
⏰ Multi-Timeframe Analysis System
PRD v2.0 Enhancement - Multiple timeframe analysis
"""

import numpy as np
import pandas as pd
import logging
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
import yfinance as yf
import talib
from enum import Enum

logger = logging.getLogger(__name__)

class TimeFrame(Enum):
    """Zaman dilimleri"""
    M1 = "1m"
    M5 = "5m"
    M15 = "15m"
    M30 = "30m"
    H1 = "1h"
    H4 = "4h"
    D1 = "1d"
    W1 = "1wk"
    MN1 = "1mo"

@dataclass
class TimeFrameSignal:
    """Zaman dilimi sinyali"""
    timeframe: TimeFrame
    signal: str  # 'BUY', 'SELL', 'HOLD'
    strength: float  # 0-1
    confidence: float  # 0-1
    price: float
    indicators: Dict[str, float]
    timestamp: datetime

@dataclass
class MultiTimeFrameAnalysis:
    """Çok zaman dilimi analizi"""
    symbol: str
    signals: Dict[str, TimeFrameSignal]
    consensus_signal: str
    consensus_strength: float
    timeframe_alignment: float
    trend_direction: str
    support_resistance: Dict[str, float]
    timestamp: datetime

class MultiTimeFrameAnalyzer:
    """Çok zaman dilimi analiz sistemi"""
    
    def __init__(self):
        self.timeframes = [
            TimeFrame.M15, TimeFrame.M30, TimeFrame.H1, 
            TimeFrame.H4, TimeFrame.D1, TimeFrame.W1
        ]
        self.signal_cache = {}
        
    def analyze_symbol(self, symbol: str) -> MultiTimeFrameAnalysis:
        """Sembol için çok zaman dilimi analizi"""
        logger.info(f"⏰ {symbol} çok zaman dilimi analizi başlıyor...")
        
        try:
            signals = {}
            
            # Her zaman dilimi için analiz
            for tf in self.timeframes:
                signal = self._analyze_timeframe(symbol, tf)
                if signal:
                    signals[tf.value] = signal
            
            if not signals:
                logger.error(f"❌ {symbol} için sinyal bulunamadı")
                return self._default_analysis(symbol)
            
            # Konsensüs sinyal
            consensus_signal, consensus_strength = self._calculate_consensus(signals)
            
            # Zaman dilimi uyumu
            alignment = self._calculate_timeframe_alignment(signals)
            
            # Trend yönü
            trend_direction = self._determine_trend_direction(signals)
            
            # Destek/direnç seviyeleri
            support_resistance = self._calculate_support_resistance(symbol)
            
            analysis = MultiTimeFrameAnalysis(
                symbol=symbol,
                signals=signals,
                consensus_signal=consensus_signal,
                consensus_strength=consensus_strength,
                timeframe_alignment=alignment,
                trend_direction=trend_direction,
                support_resistance=support_resistance,
                timestamp=datetime.now()
            )
            
            logger.info(f"✅ {symbol} çok zaman dilimi analizi tamamlandı")
            logger.info(f"   Konsensüs: {consensus_signal} (Güç: {consensus_strength:.2f})")
            logger.info(f"   Uyum: {alignment:.2f}, Trend: {trend_direction}")
            
            return analysis
            
        except Exception as e:
            logger.error(f"❌ {symbol} çok zaman dilimi analizi hatası: {e}")
            return self._default_analysis(symbol)
    
    def _analyze_timeframe(self, symbol: str, timeframe: TimeFrame) -> Optional[TimeFrameSignal]:
        """Tek zaman dilimi analizi"""
        try:
            # Veri çek
            stock = yf.Ticker(symbol)
            
            # Zaman dilimine göre period ayarla
            if timeframe in [TimeFrame.M1, TimeFrame.M5, TimeFrame.M15, TimeFrame.M30]:
                period = "7d"
            elif timeframe in [TimeFrame.H1, TimeFrame.H4]:
                period = "60d"
            elif timeframe == TimeFrame.D1:
                period = "1y"
            elif timeframe == TimeFrame.W1:
                period = "2y"
            else:
                period = "1y"
            
            data = stock.history(period=period, interval=timeframe.value)
            
            if data.empty or len(data) < 50:
                logger.warning(f"⚠️ {symbol} {timeframe.value} için yeterli veri yok")
                return None
            
            # Teknik indikatörler
            indicators = self._calculate_indicators(data)
            
            # Sinyal üret
            signal, strength, confidence = self._generate_signal(indicators, data)
            
            # Destek/direnç
            support_resistance = self._find_support_resistance(data)
            
            timeframe_signal = TimeFrameSignal(
                timeframe=timeframe,
                signal=signal,
                strength=strength,
                confidence=confidence,
                price=data['Close'].iloc[-1],
                indicators=indicators,
                timestamp=datetime.now()
            )
            
            return timeframe_signal
            
        except Exception as e:
            logger.error(f"❌ {symbol} {timeframe.value} analizi hatası: {e}")
            return None
    
    def _calculate_indicators(self, data: pd.DataFrame) -> Dict[str, float]:
        """Teknik indikatörleri hesapla"""
        try:
            closes = data['Close'].values
            highs = data['High'].values
            lows = data['Low'].values
            volumes = data['Volume'].values
            
            indicators = {}
            
            # Moving averages
            indicators['sma_20'] = talib.SMA(closes, timeperiod=20)[-1]
            indicators['sma_50'] = talib.SMA(closes, timeperiod=50)[-1]
            indicators['ema_12'] = talib.EMA(closes, timeperiod=12)[-1]
            indicators['ema_26'] = talib.EMA(closes, timeperiod=26)[-1]
            
            # MACD
            macd, macd_signal, macd_hist = talib.MACD(closes)
            indicators['macd'] = macd[-1]
            indicators['macd_signal'] = macd_signal[-1]
            indicators['macd_histogram'] = macd_hist[-1]
            
            # RSI
            rsi = talib.RSI(closes, timeperiod=14)
            indicators['rsi'] = rsi[-1]
            
            # Bollinger Bands
            bb_upper, bb_middle, bb_lower = talib.BBANDS(closes)
            indicators['bb_upper'] = bb_upper[-1]
            indicators['bb_middle'] = bb_middle[-1]
            indicators['bb_lower'] = bb_lower[-1]
            indicators['bb_position'] = (closes[-1] - bb_lower[-1]) / (bb_upper[-1] - bb_lower[-1])
            
            # Stochastic
            stoch_k, stoch_d = talib.STOCH(highs, lows, closes)
            indicators['stoch_k'] = stoch_k[-1]
            indicators['stoch_d'] = stoch_d[-1]
            
            # Volume indicators
            indicators['volume_sma'] = talib.SMA(volumes, timeperiod=20)[-1]
            indicators['volume_ratio'] = volumes[-1] / indicators['volume_sma']
            
            # ADX (trend strength)
            adx = talib.ADX(highs, lows, closes)
            indicators['adx'] = adx[-1]
            
            # Williams %R
            willr = talib.WILLR(highs, lows, closes)
            indicators['willr'] = willr[-1]
            
            return indicators
            
        except Exception as e:
            logger.error(f"❌ İndikatör hesaplama hatası: {e}")
            return {}
    
    def _generate_signal(self, indicators: Dict[str, float], data: pd.DataFrame) -> Tuple[str, float, float]:
        """Sinyal üret"""
        try:
            current_price = data['Close'].iloc[-1]
            signal_score = 0.0
            confidence_factors = []
            
            # Moving average signals
            if indicators.get('sma_20', 0) > indicators.get('sma_50', 0):
                signal_score += 0.2
                confidence_factors.append(0.8)
            else:
                signal_score -= 0.2
                confidence_factors.append(0.6)
            
            # EMA signals
            if indicators.get('ema_12', 0) > indicators.get('ema_26', 0):
                signal_score += 0.15
                confidence_factors.append(0.7)
            else:
                signal_score -= 0.15
                confidence_factors.append(0.5)
            
            # MACD signals
            if indicators.get('macd', 0) > indicators.get('macd_signal', 0):
                signal_score += 0.15
                confidence_factors.append(0.8)
            else:
                signal_score -= 0.15
                confidence_factors.append(0.6)
            
            # RSI signals
            rsi = indicators.get('rsi', 50)
            if 30 < rsi < 70:  # Neutral zone
                signal_score += 0.05
                confidence_factors.append(0.9)
            elif rsi > 70:  # Overbought
                signal_score -= 0.1
                confidence_factors.append(0.7)
            elif rsi < 30:  # Oversold
                signal_score += 0.1
                confidence_factors.append(0.7)
            
            # Bollinger Bands
            bb_pos = indicators.get('bb_position', 0.5)
            if bb_pos < 0.2:  # Near lower band
                signal_score += 0.1
                confidence_factors.append(0.8)
            elif bb_pos > 0.8:  # Near upper band
                signal_score -= 0.1
                confidence_factors.append(0.8)
            
            # Stochastic
            stoch_k = indicators.get('stoch_k', 50)
            if stoch_k < 20:  # Oversold
                signal_score += 0.1
                confidence_factors.append(0.7)
            elif stoch_k > 80:  # Overbought
                signal_score -= 0.1
                confidence_factors.append(0.7)
            
            # ADX trend strength
            adx = indicators.get('adx', 25)
            if adx > 25:  # Strong trend
                confidence_factors.append(0.9)
            else:
                confidence_factors.append(0.6)
            
            # Signal determination
            if signal_score > 0.2:
                signal = 'BUY'
                strength = min(1.0, signal_score)
            elif signal_score < -0.2:
                signal = 'SELL'
                strength = min(1.0, abs(signal_score))
            else:
                signal = 'HOLD'
                strength = 0.5
            
            # Confidence calculation
            confidence = np.mean(confidence_factors) if confidence_factors else 0.5
            
            return signal, strength, confidence
            
        except Exception as e:
            logger.error(f"❌ Sinyal üretme hatası: {e}")
            return 'HOLD', 0.5, 0.5
    
    def _find_support_resistance(self, data: pd.DataFrame) -> Dict[str, float]:
        """Destek/direnç seviyelerini bul"""
        try:
            highs = data['High'].values
            lows = data['Low'].values
            
            # Son 50 günün verilerini kullan
            recent_highs = highs[-50:]
            recent_lows = lows[-50:]
            
            # Resistance levels (yüksek seviyeler)
            resistance_1 = np.percentile(recent_highs, 80)
            resistance_2 = np.percentile(recent_highs, 90)
            resistance_3 = np.max(recent_highs)
            
            # Support levels (düşük seviyeler)
            support_1 = np.percentile(recent_lows, 20)
            support_2 = np.percentile(recent_lows, 10)
            support_3 = np.min(recent_lows)
            
            return {
                'resistance_1': resistance_1,
                'resistance_2': resistance_2,
                'resistance_3': resistance_3,
                'support_1': support_1,
                'support_2': support_2,
                'support_3': support_3
            }
            
        except Exception as e:
            logger.error(f"❌ Destek/direnç hesaplama hatası: {e}")
            return {}
    
    def _calculate_consensus(self, signals: Dict[str, TimeFrameSignal]) -> Tuple[str, float]:
        """Konsensüs sinyal hesapla"""
        try:
            buy_votes = 0
            sell_votes = 0
            hold_votes = 0
            
            total_strength = 0.0
            
            for signal in signals.values():
                if signal.signal == 'BUY':
                    buy_votes += signal.strength
                elif signal.signal == 'SELL':
                    sell_votes += signal.strength
                else:
                    hold_votes += signal.strength
                
                total_strength += signal.strength
            
            # Konsensüs belirle
            if buy_votes > sell_votes and buy_votes > hold_votes:
                consensus_signal = 'BUY'
                consensus_strength = buy_votes / total_strength if total_strength > 0 else 0.5
            elif sell_votes > buy_votes and sell_votes > hold_votes:
                consensus_signal = 'SELL'
                consensus_strength = sell_votes / total_strength if total_strength > 0 else 0.5
            else:
                consensus_signal = 'HOLD'
                consensus_strength = hold_votes / total_strength if total_strength > 0 else 0.5
            
            return consensus_signal, consensus_strength
            
        except Exception as e:
            logger.error(f"❌ Konsensüs hesaplama hatası: {e}")
            return 'HOLD', 0.5
    
    def _calculate_timeframe_alignment(self, signals: Dict[str, TimeFrameSignal]) -> float:
        """Zaman dilimi uyumu hesapla"""
        try:
            if len(signals) < 2:
                return 0.5
            
            # Trend yönlerini karşılaştır
            bullish_count = 0
            bearish_count = 0
            
            for signal in signals.values():
                if signal.signal == 'BUY':
                    bullish_count += 1
                elif signal.signal == 'SELL':
                    bearish_count += 1
            
            total_signals = len(signals)
            alignment = max(bullish_count, bearish_count) / total_signals
            
            return alignment
            
        except Exception as e:
            logger.error(f"❌ Uyum hesaplama hatası: {e}")
            return 0.5
    
    def _determine_trend_direction(self, signals: Dict[str, TimeFrameSignal]) -> str:
        """Trend yönünü belirle"""
        try:
            # Uzun vadeli trend (D1, W1)
            long_term_signals = []
            for tf, signal in signals.items():
                if tf in ['1d', '1wk']:
                    long_term_signals.append(signal.signal)
            
            # Kısa vadeli trend (M15, M30, H1)
            short_term_signals = []
            for tf, signal in signals.items():
                if tf in ['15m', '30m', '1h']:
                    short_term_signals.append(signal.signal)
            
            # Trend belirleme
            if len(long_term_signals) > 0:
                long_term_bullish = sum(1 for s in long_term_signals if s == 'BUY')
                long_term_bearish = sum(1 for s in long_term_signals if s == 'SELL')
                
                if long_term_bullish > long_term_bearish:
                    return 'BULLISH'
                elif long_term_bearish > long_term_bullish:
                    return 'BEARISH'
            
            return 'SIDEWAYS'
            
        except Exception as e:
            logger.error(f"❌ Trend belirleme hatası: {e}")
            return 'SIDEWAYS'
    
    def _calculate_support_resistance(self, symbol: str) -> Dict[str, float]:
        """Genel destek/direnç seviyeleri"""
        try:
            stock = yf.Ticker(symbol)
            data = stock.history(period="6mo")
            
            if data.empty:
                return {}
            
            highs = data['High'].values
            lows = data['Low'].values
            
            # Major levels
            major_resistance = np.percentile(highs, 95)
            major_support = np.percentile(lows, 5)
            
            # Psychological levels
            current_price = data['Close'].iloc[-1]
            psychological_resistance = round(current_price * 1.1, 2)
            psychological_support = round(current_price * 0.9, 2)
            
            return {
                'major_resistance': major_resistance,
                'major_support': major_support,
                'psychological_resistance': psychological_resistance,
                'psychological_support': psychological_support,
                'current_price': current_price
            }
            
        except Exception as e:
            logger.error(f"❌ Destek/direnç hesaplama hatası: {e}")
            return {}
    
    def _default_analysis(self, symbol: str) -> MultiTimeFrameAnalysis:
        """Varsayılan analiz"""
        return MultiTimeFrameAnalysis(
            symbol=symbol,
            signals={},
            consensus_signal='HOLD',
            consensus_strength=0.5,
            timeframe_alignment=0.5,
            trend_direction='SIDEWAYS',
            support_resistance={},
            timestamp=datetime.now()
        )

def test_multi_timeframe_analyzer():
    """Multi-timeframe analyzer test"""
    logger.info("🧪 Multi-Timeframe Analyzer test başlıyor...")
    
    analyzer = MultiTimeFrameAnalyzer()
    analysis = analyzer.analyze_symbol("GARAN.IS")
    
    logger.info(f"⏰ {analysis.symbol} Çok Zaman Dilimi Analizi:")
    logger.info(f"   Konsensüs: {analysis.consensus_signal} (Güç: {analysis.consensus_strength:.2f})")
    logger.info(f"   Uyum: {analysis.timeframe_alignment:.2f}")
    logger.info(f"   Trend: {analysis.trend_direction}")
    
    logger.info(f"📊 Zaman Dilimi Sinyalleri:")
    for tf, signal in analysis.signals.items():
        logger.info(f"   {tf}: {signal.signal} (Güç: {signal.strength:.2f}, Güven: {signal.confidence:.2f})")
    
    return analysis

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    test_multi_timeframe_analyzer()
