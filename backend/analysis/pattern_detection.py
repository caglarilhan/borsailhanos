"""
Teknik Formasyon Tespit Motoru
- EMA Cross (20/50 kesişim)
- Candlestick Patterns (Bullish/Bearish)
- Harmonic Patterns (Gartley, AB=CD)
- Support/Resistance (Fractal Break)
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
import logging
# TA-Lib yerine ta kütüphanesi kullan
import ta
from dataclasses import dataclass
from datetime import datetime, timedelta
import ta

logger = logging.getLogger(__name__)

@dataclass
class PatternSignal:
    """Formasyon sinyal yapısı"""
    symbol: str
    pattern_type: str
    pattern_name: str
    confidence: float  # 0-1 arası
    direction: str  # 'BULLISH', 'BEARISH', 'NEUTRAL'
    entry_price: float
    stop_loss: float
    take_profit: float
    risk_reward: float
    timestamp: datetime
    description: str

class TechnicalPatternEngine:
    def __init__(self):
        self.min_confidence = 0.6
        self.risk_reward_min = 1.5
        
    def detect_ema_cross(self, df: pd.DataFrame, fast_period: int = 20, slow_period: int = 50) -> Optional[PatternSignal]:
        """EMA kesişim sinyali tespit et"""
        try:
            if len(df) < slow_period:
                return None
                
            # EMA hesapla
            ema_fast = ta.trend.ema_indicator(df['Close'], window=fast_period)
            ema_slow = ta.trend.ema_indicator(df['Close'], window=slow_period)
            
            # Son 2 mum için kesişim kontrol
            current_fast = ema_fast.iloc[-1]
            current_slow = ema_slow.iloc[-1]
            prev_fast = ema_fast.iloc[-2]
            prev_slow = ema_slow.iloc[-2]
            
            # Bullish cross: fast EMA slow EMA'yı yukarı kesiyor
            if prev_fast <= prev_slow and current_fast > current_slow:
                # Güven skoru: EMA arasındaki mesafe
                ema_distance = abs(current_fast - current_slow) / current_slow
                confidence = min(0.8 + ema_distance * 10, 0.95)
                
                # Fiyat seviyeleri
                entry_price = df['Close'].iloc[-1]
                stop_loss = entry_price * 0.95  # %5 alt
                take_profit = entry_price * 1.15  # %15 üst
                risk_reward = (take_profit - entry_price) / (entry_price - stop_loss)
                
                if risk_reward >= self.risk_reward_min:
                    return PatternSignal(
                        symbol=df.get('symbol', 'UNKNOWN'),
                        pattern_type='EMA_CROSS',
                        pattern_name=f'EMA{fast_period}/{slow_period} Bullish Cross',
                        confidence=confidence,
                        direction='BULLISH',
                        entry_price=entry_price,
                        stop_loss=stop_loss,
                        take_profit=take_profit,
                        risk_reward=risk_reward,
                        timestamp=datetime.now(),
                        description=f'EMA{fast_period} yukarı kesiyor EMA{slow_period}'
                    )
                    
            # Bearish cross: fast EMA slow EMA'yı aşağı kesiyor
            elif prev_fast >= prev_slow and current_fast < current_slow:
                ema_distance = abs(current_fast - current_slow) / current_slow
                confidence = min(0.8 + ema_distance * 10, 0.95)
                
                entry_price = df['Close'].iloc[-1]
                stop_loss = entry_price * 1.05  # %5 üst
                take_profit = entry_price * 0.85  # %15 alt
                risk_reward = (entry_price - take_profit) / (stop_loss - entry_price)
                
                if risk_reward >= self.risk_reward_min:
                    return PatternSignal(
                        symbol=df.get('symbol', 'UNKNOWN'),
                        pattern_type='EMA_CROSS',
                        pattern_name=f'EMA{fast_period}/{slow_period} Bearish Cross',
                        confidence=confidence,
                        direction='BEARISH',
                        entry_price=entry_price,
                        stop_loss=stop_loss,
                        take_profit=take_profit,
                        risk_reward=risk_reward,
                        timestamp=datetime.now(),
                        description=f'EMA{fast_period} aşağı kesiyor EMA{slow_period}'
                    )
            
            return None
            
        except Exception as e:
            logger.error(f"EMA cross tespit hatası: {e}")
            return None
    
    def detect_candlestick_patterns(self, df: pd.DataFrame) -> List[PatternSignal]:
        """Candlestick formasyonları tespit et"""
        try:
            patterns = []
            
            if len(df) < 3:
                return patterns
            
            print(f"DEBUG: Candlestick tespit - son 2 mum:")
            print(f"  Mum -2: O={df['Open'].iloc[-2]:.2f}, H={df['High'].iloc[-2]:.2f}, L={df['Low'].iloc[-2]:.2f}, C={df['Close'].iloc[-2]:.2f}")
            print(f"  Mum -1: O={df['Open'].iloc[-1]:.2f}, H={df['High'].iloc[-1]:.2f}, L={df['Low'].iloc[-1]:.2f}, C={df['Close'].iloc[-1]:.2f}")
            
            # Bullish Engulfing - manuel kontrol
            prev_open = df['Open'].iloc[-2]
            prev_close = df['Close'].iloc[-2]
            curr_open = df['Open'].iloc[-1]
            curr_close = df['Close'].iloc[-1]
            
            # Önceki mum kırmızı (close < open) ve şimdiki mum yeşil (close > open)
            if (prev_close < prev_open and curr_close > curr_open and
                curr_open < prev_close and curr_close > prev_open):
                
                print("DEBUG: Bullish Engulfing tespit edildi!")
                
                entry_price = curr_close
                stop_loss = df['Low'].iloc[-1] * 0.98
                take_profit = entry_price + (entry_price - stop_loss) * 2
                risk_reward = (take_profit - entry_price) / (entry_price - stop_loss)
                
                if risk_reward >= self.risk_reward_min:
                    patterns.append(PatternSignal(
                        symbol=df.get('symbol', 'UNKNOWN'),
                        pattern_type='CANDLESTICK',
                        pattern_name='Bullish Engulfing',
                        confidence=0.75,
                        direction='BULLISH',
                        entry_price=entry_price,
                        stop_loss=stop_loss,
                        take_profit=take_profit,
                        risk_reward=risk_reward,
                        timestamp=datetime.now(),
                        description='Yeşil mum önceki kırmızı mumu yutuyor'
                    ))
            
            # TA-Lib ile de kontrol et
            bullish_engulf = ta.candlestick.CDLENGULFING(df['Open'], df['High'], df['Low'], df['Close'])
            if bullish_engulf.iloc[-1] > 0:
                print("DEBUG: TA-Lib Bullish Engulfing tespit edildi!")
                
                entry_price = df['Close'].iloc[-1]
                stop_loss = df['Low'].iloc[-1] * 0.98
                take_profit = entry_price + (entry_price - stop_loss) * 2
                risk_reward = (take_profit - entry_price) / (entry_price - stop_loss)
                
                if risk_reward >= self.risk_reward_min:
                    patterns.append(PatternSignal(
                        symbol=df.get('symbol', 'UNKNOWN'),
                        pattern_type='CANDLESTICK',
                        pattern_name='Bullish Engulfing (TA-Lib)',
                        confidence=0.75,
                        direction='BULLISH',
                        entry_price=entry_price,
                        stop_loss=stop_loss,
                        take_profit=take_profit,
                        risk_reward=risk_reward,
                        timestamp=datetime.now(),
                        description='TA-Lib: Yeşil mum önceki kırmızı mumu yutuyor'
                    ))
            
            return patterns
            
        except Exception as e:
            logger.error(f"Candlestick pattern tespit hatası: {e}")
            return []
    
    def detect_harmonic_patterns(self, df: pd.DataFrame) -> List[PatternSignal]:
        """Harmonik formasyonları tespit et (Gartley, AB=CD)"""
        try:
            patterns = []
            
            if len(df) < 20:
                return patterns
            
            # Gartley Pattern tespiti (basit versiyon)
            # X -> A -> B -> C -> D noktaları
            highs = df['High'].rolling(window=5).max()
            lows = df['Low'].rolling(window=5).min()
            
            # Son 20 mum içinde swing noktaları bul
            swing_points = []
            for i in range(5, len(df) - 5):
                if df['High'].iloc[i] == highs.iloc[i]:
                    swing_points.append(('H', i, df['High'].iloc[i]))
                elif df['Low'].iloc[i] == lows.iloc[i]:
                    swing_points.append(('L', i, df['Low'].iloc[i]))
            
            if len(swing_points) >= 4:
                # Son 4 swing noktası
                recent_swings = swing_points[-4:]
                
                if len(recent_swings) == 4:
                    # Gartley Bullish Pattern
                    if (recent_swings[0][0] == 'H' and  # X (High)
                        recent_swings[1][0] == 'L' and   # A (Low)
                        recent_swings[2][0] == 'H' and   # B (High)
                        recent_swings[3][0] == 'L'):     # D (Low)
                        
                        # Fibonacci oranları kontrol
                        xa = abs(recent_swings[0][2] - recent_swings[1][2])
                        ab = abs(recent_swings[1][2] - recent_swings[2][2])
                        bc = abs(recent_swings[2][2] - recent_swings[3][2])
                        
                        # AB/CD oranı yaklaşık 1.0 olmalı
                        if 0.8 <= (ab / bc) <= 1.2:
                            entry_price = recent_swings[3][2]  # D noktası
                            stop_loss = entry_price * 0.95
                            take_profit = entry_price + (entry_price - stop_loss) * 2
                            risk_reward = (take_profit - entry_price) / (entry_price - stop_loss)
                            
                            if risk_reward >= self.risk_reward_min:
                                patterns.append(PatternSignal(
                                    symbol=df.get('symbol', 'UNKNOWN'),
                                    pattern_type='HARMONIC',
                                    pattern_name='Gartley Bullish',
                                    confidence=0.70,
                                    direction='BULLISH',
                                    entry_price=entry_price,
                                    stop_loss=stop_loss,
                                    take_profit=take_profit,
                                    risk_reward=risk_reward,
                                    timestamp=datetime.now(),
                                    description='Gartley Bullish pattern D noktasında'
                                ))
            
            return patterns
            
        except Exception as e:
            logger.error(f"Harmonic pattern tespit hatası: {e}")
            return []
    
    def detect_support_resistance(self, df: pd.DataFrame) -> List[PatternSignal]:
        """Support/Resistance kırılımı tespit et"""
        try:
            patterns = []
            
            if len(df) < 20:
                return patterns
            
            # Son 20 mum için support/resistance seviyeleri
            recent_highs = df['High'].iloc[-20:].nlargest(3)
            recent_lows = df['Low'].iloc[-20:].nsmallest(3)
            
            current_price = df['Close'].iloc[-1]
            current_volume = df['Volume'].iloc[-1] if 'Volume' in df.columns else 1000000
            
            # Resistance kırılımı (yukarı break)
            for resistance in recent_highs:
                if (current_price > resistance * 1.02 and  # %2 üstünde
                    df['Volume'].iloc[-1] > df['Volume'].iloc[-5:].mean() * 1.5):  # Hacim artışı
                    
                    entry_price = current_price
                    stop_loss = resistance  # Eski resistance seviyesi
                    take_profit = entry_price + (entry_price - stop_loss) * 2
                    risk_reward = (take_profit - entry_price) / (entry_price - stop_loss)
                    
                    if risk_reward >= self.risk_reward_min:
                        patterns.append(PatternSignal(
                            symbol=df.get('symbol', 'UNKNOWN'),
                            pattern_type='BREAKOUT',
                            pattern_name='Resistance Breakout',
                            confidence=0.80,
                            direction='BULLISH',
                            entry_price=entry_price,
                            stop_loss=stop_loss,
                            take_profit=take_profit,
                            risk_reward=risk_reward,
                            timestamp=datetime.now(),
                            description=f'Resistance {resistance:.2f} kırıldı, yukarı trend'
                        ))
            
            # Support kırılımı (aşağı break)
            for support in recent_lows:
                if (current_price < support * 0.98 and  # %2 altında
                    df['Volume'].iloc[-1] > df['Volume'].iloc[-5:].mean() * 1.5):  # Hacim artışı
                    
                    entry_price = current_price
                    stop_loss = support  # Eski support seviyesi
                    take_profit = entry_price - (stop_loss - entry_price) * 2
                    risk_reward = (entry_price - take_profit) / (stop_loss - entry_price)
                    
                    if risk_reward >= self.risk_reward_min:
                        patterns.append(PatternSignal(
                            symbol=df.get('symbol', 'UNKNOWN'),
                            pattern_type='BREAKOUT',
                            pattern_name='Support Breakdown',
                            confidence=0.80,
                            direction='BEARISH',
                            entry_price=entry_price,
                            stop_loss=stop_loss,
                            take_profit=take_profit,
                            risk_reward=risk_reward,
                            timestamp=datetime.now(),
                            description=f'Support {support:.2f} kırıldı, aşağı trend'
                        ))
            
            return patterns
            
        except Exception as e:
            logger.error(f"Support/Resistance tespit hatası: {e}")
            return []
    
    def scan_all_patterns(self, df: pd.DataFrame, symbol: str = None) -> List[PatternSignal]:
        """Tüm formasyonları tara"""
        try:
            if symbol:
                df = df.copy()
                df['symbol'] = symbol
            
            all_patterns = []
            
            print(f"DEBUG: {symbol} için pattern tarama başladı")
            print(f"DEBUG: Veri boyutu: {len(df)}")
            print(f"DEBUG: Son 5 fiyat: {df['Close'].iloc[-5:].tolist()}")
            
            # 1. EMA Cross
            ema_signal = self.detect_ema_cross(df)
            if ema_signal:
                print(f"DEBUG: EMA cross bulundu: {ema_signal.pattern_name}")
                all_patterns.append(ema_signal)
            else:
                print("DEBUG: EMA cross bulunamadı")
            
            # 2. Candlestick Patterns
            candlestick_patterns = self.detect_candlestick_patterns(df)
            print(f"DEBUG: Candlestick patterns bulundu: {len(candlestick_patterns)}")
            all_patterns.extend(candlestick_patterns)
            
            # 3. Harmonic Patterns
            harmonic_patterns = self.detect_harmonic_patterns(df)
            print(f"DEBUG: Harmonic patterns bulundu: {len(harmonic_patterns)}")
            all_patterns.extend(harmonic_patterns)
            
            # 4. Support/Resistance Breakouts
            breakout_patterns = self.detect_support_resistance(df)
            print(f"DEBUG: Breakout patterns bulundu: {len(breakout_patterns)}")
            all_patterns.extend(breakout_patterns)
            
            # Güven skoruna göre sırala
            all_patterns.sort(key=lambda x: x.confidence, reverse=True)
            
            # Minimum güven skorunu geçenleri filtrele
            filtered_patterns = [p for p in all_patterns if p.confidence >= self.min_confidence]
            
            print(f"DEBUG: Toplam {len(all_patterns)} pattern, filtrelenmiş: {len(filtered_patterns)}")
            
            return filtered_patterns
            
        except Exception as e:
            logger.error(f"Pattern tarama hatası: {e}")
            return []

# Test fonksiyonu
def test_pattern_detection():
    """Teknik formasyon tespitini test et"""
    # Örnek veri oluştur
    dates = pd.date_range('2024-01-01', periods=50, freq='D')
    np.random.seed(42)
    
    # Trend yukarı + noise
    trend = np.linspace(100, 120, 50)
    noise = np.random.normal(0, 2, 50)
    prices = trend + noise
    
    # OHLC veri
    df = pd.DataFrame({
        'Date': dates,
        'Open': prices * 0.99,
        'High': prices * 1.02,
        'Low': prices * 0.98,
        'Close': prices,
        'Volume': np.random.randint(1000000, 5000000, 50)
    })
    
    # Bullish Engulfing pattern ekle
    df.loc[df.index[-2], 'Open'] = 115.0
    df.loc[df.index[-2], 'High'] = 116.0
    df.loc[df.index[-2], 'Low'] = 114.0
    df.loc[df.index[-2], 'Close'] = 114.5  # Kırmızı mum
    
    df.loc[df.index[-1], 'Open'] = 114.0
    df.loc[df.index[-1], 'High'] = 117.0
    df.loc[df.index[-1], 'Low'] = 113.5
    df.loc[df.index[-1], 'Close'] = 116.5  # Yeşil mum (engulfing)
    
    # Support/Resistance break için
    df.loc[df.index[-5:], 'Close'] = [118, 119, 120, 121, 122]  # Yukarı trend
    
    # EMA cross için daha belirgin kesişim
    df.loc[df.index[-15:], 'Close'] = np.linspace(105, 125, 15)  # Hızlı yükseliş
    
    # Son 2 mumu bullish engulfing için sabitle
    df.loc[df.index[-2], 'Close'] = 114.5  # Kırmızı mum
    df.loc[df.index[-1], 'Close'] = 116.5  # Yeşil mum
    
    print("=== Teknik Formasyon Test ===")
    print(f"Veri boyutu: {len(df)}")
    print(f"Son fiyat: {df['Close'].iloc[-1]:.2f}")
    print(f"Son 5 mum: {df['Close'].iloc[-5:].tolist()}")
    
    # Pattern engine test
    engine = TechnicalPatternEngine()
    patterns = engine.scan_all_patterns(df, 'SISE.IS')
    
    print(f"\nBulunan formasyon sayısı: {len(patterns)}")
    
    for i, pattern in enumerate(patterns, 1):
        print(f"\n{i}. {pattern.pattern_name}")
        print(f"   Yön: {pattern.direction}")
        print(f"   Güven: {pattern.confidence:.2f}")
        print(f"   Giriş: {pattern.entry_price:.2f}")
        print(f"   SL: {pattern.stop_loss:.2f}")
        print(f"   TP: {pattern.take_profit:.2f}")
        print(f"   R/R: {pattern.risk_reward:.2f}")
        print(f"   Açıklama: {pattern.description}")
    
    return patterns

if __name__ == "__main__":
    test_pattern_detection()
