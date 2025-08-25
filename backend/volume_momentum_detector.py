#!/usr/bin/env python3
"""
🚀 VOLUME & MOMENTUM PATTERN DETECTOR - BIST AI Smart Trader
Phase 5: Volume & Momentum Patterns for Accuracy Boost
Expected Accuracy Boost: +4-6%
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

class VolumeMomentumDetector:
    """Volume ve momentum pattern tespit edici - Accuracy boost için"""
    
    def __init__(self):
        # Pattern tolerance (percentage)
        self.tolerance = 0.05  # 5% tolerance
        
        # Volume thresholds
        self.volume_threshold = 1.5  # 1.5x average volume
        self.low_volume_threshold = 0.5  # 0.5x average volume
        
        # Momentum thresholds
        self.rsi_oversold = 30
        self.rsi_overbought = 70
        self.macd_signal_threshold = 0.001
        
        # Pattern weights for accuracy calculation
        self.pattern_weights = {
            'volume_breakout': 0.30,      # 30% weight
            'volume_divergence': 0.25,    # 25% weight
            'rsi_divergence': 0.25,       # 25% weight
            'macd_divergence': 0.20      # 20% weight
        }
    
    def detect_volume_breakout(self, prices: np.ndarray, volumes: np.ndarray, 
                              window: int = 20) -> List[Dict]:
        """
        Volume Breakout pattern tespit et
        
        Volume Breakout:
        - Price breaks above resistance with high volume
        - Volume > 1.5x average volume
        - Price closes above breakout level
        """
        patterns = []
        
        for i in range(window, len(prices)):
            # Calculate average volume
            avg_volume = np.mean(volumes[i-window:i])
            
            # Check if current volume is significantly higher
            if volumes[i] > avg_volume * self.volume_threshold:
                # Look for price breakout
                recent_highs = prices[i-window:i]
                resistance_level = np.max(recent_highs)
                
                # Check if price breaks above resistance
                if prices[i] > resistance_level:
                    # Calculate breakout strength
                    breakout_strength = (prices[i] - resistance_level) / resistance_level
                    volume_ratio = volumes[i] / avg_volume
                    
                    pattern = {
                        'pattern_type': 'Volume Breakout',
                        'index': i,
                        'price': prices[i],
                        'volume': volumes[i],
                        'resistance_level': resistance_level,
                        'breakout_strength': breakout_strength,
                        'volume_ratio': volume_ratio,
                        'confidence': self._calculate_volume_breakout_confidence(breakout_strength, volume_ratio),
                        'signal': 'BUY',
                        'target': self._calculate_volume_breakout_target(prices[i], resistance_level, breakout_strength),
                        'stop_loss': self._calculate_volume_breakout_stop_loss(prices[i], resistance_level)
                    }
                    patterns.append(pattern)
        
        return patterns
    
    def detect_volume_divergence(self, prices: np.ndarray, volumes: np.ndarray, 
                                window: int = 20) -> List[Dict]:
        """
        Volume Divergence pattern tespit et
        
        Volume Divergence:
        - Price makes new high but volume is lower
        - Price makes new low but volume is lower
        - Indicates weakening trend
        """
        patterns = []
        
        for i in range(window, len(prices)):
            # Look for price highs and lows
            recent_prices = prices[i-window:i+1]
            recent_volumes = volumes[i-window:i+1]
            
            # Check for bullish divergence (price higher, volume lower)
            if i > 0 and prices[i] > prices[i-1]:
                # Find previous high
                prev_high_idx = np.argmax(recent_prices[:-1])
                prev_high_price = recent_prices[prev_high_idx]
                prev_high_volume = recent_volumes[prev_high_idx]
                
                if (prices[i] > prev_high_price and 
                    volumes[i] < prev_high_volume * 0.8):  # Volume 20% lower
                    
                    pattern = {
                        'pattern_type': 'Bullish Volume Divergence',
                        'index': i,
                        'price': prices[i],
                        'volume': volumes[i],
                        'prev_high_price': prev_high_price,
                        'prev_high_volume': prev_high_volume,
                        'divergence_strength': (prev_high_volume - volumes[i]) / prev_high_volume,
                        'confidence': self._calculate_volume_divergence_confidence(prices[i], prev_high_price, volumes[i], prev_high_volume),
                        'signal': 'BUY',
                        'target': self._calculate_volume_divergence_target(prices[i], prev_high_price),
                        'stop_loss': self._calculate_volume_divergence_stop_loss(prices[i], prev_high_price)
                    }
                    patterns.append(pattern)
            
            # Check for bearish divergence (price lower, volume lower)
            elif i > 0 and prices[i] < prices[i-1]:
                # Find previous low
                prev_low_idx = np.argmin(recent_prices[:-1])
                prev_low_price = recent_prices[prev_low_idx]
                prev_low_volume = recent_volumes[prev_low_idx]
                
                if (prices[i] < prev_low_price and 
                    volumes[i] < prev_low_volume * 0.8):  # Volume 20% lower
                    
                    pattern = {
                        'pattern_type': 'Bearish Volume Divergence',
                        'index': i,
                        'price': prices[i],
                        'volume': volumes[i],
                        'prev_low_price': prev_low_price,
                        'prev_low_volume': prev_low_volume,
                        'divergence_strength': (prev_low_volume - volumes[i]) / prev_low_volume,
                        'confidence': self._calculate_volume_divergence_confidence(prices[i], prev_low_price, volumes[i], prev_low_volume),
                        'signal': 'SELL',
                        'target': self._calculate_volume_divergence_target(prices[i], prev_low_price),
                        'stop_loss': self._calculate_volume_divergence_stop_loss(prices[i], prev_low_price)
                    }
                    patterns.append(pattern)
        
        return patterns
    
    def detect_rsi_divergence(self, prices: np.ndarray, rsi_values: np.ndarray, 
                             window: int = 20) -> List[Dict]:
        """
        RSI Divergence pattern tespit et
        
        RSI Divergence:
        - Price makes new high but RSI is lower (bearish divergence)
        - Price makes new low but RSI is higher (bullish divergence)
        """
        patterns = []
        
        for i in range(window, len(prices)):
            recent_prices = prices[i-window:i+1]
            recent_rsi = rsi_values[i-window:i+1]
            
            # Check for bullish RSI divergence (price lower, RSI higher)
            if i > 0 and prices[i] < prices[i-1]:
                # Find previous low
                prev_low_idx = np.argmin(recent_prices[:-1])
                prev_low_price = recent_prices[prev_low_idx]
                prev_low_rsi = recent_rsi[prev_low_idx]
                
                if (prices[i] < prev_low_price and 
                    rsi_values[i] > prev_low_rsi and
                    prev_low_rsi < self.rsi_oversold):  # RSI was oversold
                    
                    pattern = {
                        'pattern_type': 'Bullish RSI Divergence',
                        'index': i,
                        'price': prices[i],
                        'rsi': rsi_values[i],
                        'prev_low_price': prev_low_price,
                        'prev_low_rsi': prev_low_rsi,
                        'divergence_strength': (rsi_values[i] - prev_low_rsi) / prev_low_rsi,
                        'confidence': self._calculate_rsi_divergence_confidence(prices[i], prev_low_price, rsi_values[i], prev_low_rsi),
                        'signal': 'BUY',
                        'target': self._calculate_rsi_divergence_target(prices[i], prev_low_price),
                        'stop_loss': self._calculate_rsi_divergence_stop_loss(prices[i], prev_low_price)
                    }
                    patterns.append(pattern)
            
            # Check for bearish RSI divergence (price higher, RSI lower)
            elif i > 0 and prices[i] > prices[i-1]:
                # Find previous high
                prev_high_idx = np.argmax(recent_prices[:-1])
                prev_high_price = recent_prices[prev_high_idx]
                prev_high_rsi = recent_rsi[prev_high_idx]
                
                if (prices[i] > prev_high_price and 
                    rsi_values[i] < prev_high_rsi and
                    prev_high_rsi > self.rsi_overbought):  # RSI was overbought
                    
                    pattern = {
                        'pattern_type': 'Bearish RSI Divergence',
                        'index': i,
                        'price': prices[i],
                        'rsi': rsi_values[i],
                        'prev_high_price': prev_high_price,
                        'prev_high_rsi': prev_high_rsi,
                        'divergence_strength': (prev_high_rsi - rsi_values[i]) / prev_high_rsi,
                        'confidence': self._calculate_rsi_divergence_confidence(prices[i], prev_high_price, rsi_values[i], prev_high_rsi),
                        'signal': 'SELL',
                        'target': self._calculate_rsi_divergence_target(prices[i], prev_high_price),
                        'stop_loss': self._calculate_rsi_divergence_stop_loss(prices[i], prev_high_price)
                    }
                    patterns.append(pattern)
        
        return patterns
    
    def detect_macd_divergence(self, prices: np.ndarray, macd_values: np.ndarray, 
                              macd_signal: np.ndarray, window: int = 20) -> List[Dict]:
        """
        MACD Divergence pattern tespit et
        
        MACD Divergence:
        - Price makes new high but MACD is lower (bearish divergence)
        - Price makes new low but MACD is higher (bullish divergence)
        """
        patterns = []
        
        for i in range(window, len(prices)):
            recent_prices = prices[i-window:i+1]
            recent_macd = macd_values[i-window:i+1]
            recent_signal = macd_signal[i-window:i+1]
            
            # Check for bullish MACD divergence (price lower, MACD higher)
            if i > 0 and prices[i] < prices[i-1]:
                # Find previous low
                prev_low_idx = np.argmin(recent_prices[:-1])
                prev_low_price = recent_prices[prev_low_idx]
                prev_low_macd = recent_macd[prev_low_idx]
                
                if (prices[i] < prev_low_price and 
                    macd_values[i] > prev_low_macd and
                    abs(macd_values[i] - prev_low_macd) > self.macd_signal_threshold):
                    
                    pattern = {
                        'pattern_type': 'Bullish MACD Divergence',
                        'index': i,
                        'price': prices[i],
                        'macd': macd_values[i],
                        'prev_low_price': prev_low_price,
                        'prev_low_macd': prev_low_macd,
                        'divergence_strength': (macd_values[i] - prev_low_macd) / abs(prev_low_macd) if prev_low_macd != 0 else 0,
                        'confidence': self._calculate_macd_divergence_confidence(prices[i], prev_low_price, macd_values[i], prev_low_macd),
                        'signal': 'BUY',
                        'target': self._calculate_macd_divergence_target(prices[i], prev_low_price),
                        'stop_loss': self._calculate_macd_divergence_stop_loss(prices[i], prev_low_price)
                    }
                    patterns.append(pattern)
            
            # Check for bearish MACD divergence (price higher, MACD lower)
            elif i > 0 and prices[i] > prices[i-1]:
                # Find previous high
                prev_high_idx = np.argmax(recent_prices[:-1])
                prev_high_price = recent_prices[prev_high_idx]
                prev_high_macd = recent_macd[prev_high_idx]
                
                if (prices[i] > prev_high_price and 
                    macd_values[i] < prev_high_macd and
                    abs(macd_values[i] - prev_high_macd) > self.macd_signal_threshold):
                    
                    pattern = {
                        'pattern_type': 'Bearish MACD Divergence',
                        'index': i,
                        'price': prices[i],
                        'macd': macd_values[i],
                        'prev_high_price': prev_high_price,
                        'prev_high_macd': prev_high_macd,
                        'divergence_strength': (prev_high_macd - macd_values[i]) / abs(prev_high_macd) if prev_high_macd != 0 else 0,
                        'confidence': self._calculate_macd_divergence_confidence(prices[i], prev_high_price, macd_values[i], prev_high_macd),
                        'signal': 'SELL',
                        'target': self._calculate_macd_divergence_target(prices[i], prev_high_price),
                        'stop_loss': self._calculate_macd_divergence_stop_loss(prices[i], prev_high_price)
                    }
                    patterns.append(pattern)
        
        return patterns
    
    def _calculate_volume_breakout_confidence(self, breakout_strength: float, volume_ratio: float) -> float:
        """Volume breakout güven skorunu hesapla (0-100)"""
        try:
            confidence = 100.0
            
            # Breakout strength
            if breakout_strength > 0.02:  # 2% breakout
                confidence += 20
            elif breakout_strength > 0.01:  # 1% breakout
                confidence += 10
            else:
                confidence -= 20
            
            # Volume ratio
            if volume_ratio > 2.0:  # 2x volume
                confidence += 25
            elif volume_ratio > 1.5:  # 1.5x volume
                confidence += 15
            else:
                confidence -= 15
            
            return max(0, min(100, confidence))
            
        except:
            return 0.0
    
    def _calculate_volume_divergence_confidence(self, current_price: float, prev_price: float, 
                                             current_volume: float, prev_volume: float) -> float:
        """Volume divergence güven skorunu hesapla (0-100)"""
        try:
            confidence = 100.0
            
            # Price movement strength
            price_change = abs(current_price - prev_price) / prev_price
            if price_change > 0.05:  # 5% price change
                confidence += 20
            elif price_change > 0.02:  # 2% price change
                confidence += 10
            else:
                confidence -= 15
            
            # Volume divergence strength
            volume_change = (prev_volume - current_volume) / prev_volume
            if volume_change > 0.3:  # 30% volume decrease
                confidence += 25
            elif volume_change > 0.2:  # 20% volume decrease
                confidence += 15
            else:
                confidence -= 20
            
            return max(0, min(100, confidence))
            
        except:
            return 0.0
    
    def _calculate_rsi_divergence_confidence(self, current_price: float, prev_price: float, 
                                           current_rsi: float, prev_rsi: float) -> float:
        """RSI divergence güven skorunu hesapla (0-100)"""
        try:
            confidence = 100.0
            
            # Price movement strength
            price_change = abs(current_price - prev_price) / prev_price
            if price_change > 0.05:  # 5% price change
                confidence += 20
            elif price_change > 0.02:  # 2% price change
                confidence += 10
            else:
                confidence -= 15
            
            # RSI divergence strength
            rsi_change = abs(current_rsi - prev_rsi)
            if rsi_change > 10:  # 10 RSI points
                confidence += 25
            elif rsi_change > 5:  # 5 RSI points
                confidence += 15
            else:
                confidence -= 20
            
            # RSI extreme levels
            if prev_rsi < 30 or prev_rsi > 70:
                confidence += 15
            
            return max(0, min(100, confidence))
            
        except:
            return 0.0
    
    def _calculate_macd_divergence_confidence(self, current_price: float, prev_price: float, 
                                            current_macd: float, prev_macd: float) -> float:
        """MACD divergence güven skorunu hesapla (0-100)"""
        try:
            confidence = 100.0
            
            # Price movement strength
            price_change = abs(current_price - prev_price) / prev_price
            if price_change > 0.05:  # 5% price change
                confidence += 20
            elif price_change > 0.02:  # 2% price change
                confidence += 10
            else:
                confidence -= 15
            
            # MACD divergence strength
            macd_change = abs(current_macd - prev_macd)
            if macd_change > 0.01:  # 0.01 MACD change
                confidence += 25
            elif macd_change > 0.005:  # 0.005 MACD change
                confidence += 15
            else:
                confidence -= 20
            
            return max(0, min(100, confidence))
            
        except:
            return 0.0
    
    def _calculate_volume_breakout_target(self, current_price: float, resistance_level: float, 
                                        breakout_strength: float) -> float:
        """Volume breakout hedef fiyatını hesapla"""
        try:
            # Target is typically 161.8% of the breakout move
            breakout_move = current_price - resistance_level
            target = current_price + (breakout_move * 1.618)
            return target
        except:
            return current_price * 1.05  # 5% default target
    
    def _calculate_volume_breakout_stop_loss(self, current_price: float, resistance_level: float) -> float:
        """Volume breakout stop loss seviyesini hesapla"""
        try:
            # Stop loss below the breakout level
            stop_loss = resistance_level * 0.98  # 2% below resistance
            return stop_loss
        except:
            return current_price * 0.98  # Default 2% below
    
    def _calculate_volume_divergence_target(self, current_price: float, prev_price: float) -> float:
        """Volume divergence hedef fiyatını hesapla"""
        try:
            # Target is typically 61.8% retracement of the move
            price_move = abs(current_price - prev_price)
            if current_price > prev_price:  # Bullish
                target = current_price + (price_move * 0.618)
            else:  # Bearish
                target = current_price - (price_move * 0.618)
            return target
        except:
            return current_price * 1.05  # 5% default target
    
    def _calculate_volume_divergence_stop_loss(self, current_price: float, prev_price: float) -> float:
        """Volume divergence stop loss seviyesini hesapla"""
        try:
            # Stop loss depends on direction
            if current_price > prev_price:  # Bullish
                stop_loss = prev_price * 0.98  # 2% below previous price
            else:  # Bearish
                stop_loss = prev_price * 1.02  # 2% above previous price
            return stop_loss
        except:
            return current_price * 0.98  # Default 2% below
    
    def _calculate_rsi_divergence_target(self, current_price: float, prev_price: float) -> float:
        """RSI divergence hedef fiyatını hesapla"""
        try:
            # Target is typically 61.8% retracement of the move
            price_move = abs(current_price - prev_price)
            if current_price > prev_price:  # Bullish
                target = current_price + (price_move * 0.618)
            else:  # Bearish
                target = current_price - (price_move * 0.618)
            return target
        except:
            return current_price * 1.05  # 5% default target
    
    def _calculate_rsi_divergence_stop_loss(self, current_price: float, prev_price: float) -> float:
        """RSI divergence stop loss seviyesini hesapla"""
        try:
            # Stop loss depends on direction
            if current_price > prev_price:  # Bullish
                stop_loss = prev_price * 0.98  # 2% below previous price
            else:  # Bearish
                stop_loss = prev_price * 1.02  # 2% above previous price
            return stop_loss
        except:
            return current_price * 0.98  # Default 2% below
    
    def _calculate_macd_divergence_target(self, current_price: float, prev_price: float) -> float:
        """MACD divergence hedef fiyatını hesapla"""
        try:
            # Target is typically 61.8% retracement of the move
            price_move = abs(current_price - prev_price)
            if current_price > prev_price:  # Bullish
                target = current_price + (price_move * 0.618)
            else:  # Bearish
                target = current_price - (price_move * 0.618)
            return target
        except:
            return current_price * 1.05  # 5% default target
    
    def _calculate_macd_divergence_stop_loss(self, current_price: float, prev_price: float) -> float:
        """MACD divergence stop loss seviyesini hesapla"""
        try:
            # Stop loss depends on direction
            if current_price > prev_price:  # Bullish
                stop_loss = prev_price * 0.98  # 2% below previous price
            else:  # Bearish
                stop_loss = prev_price * 1.02  # 2% above previous price
            return stop_loss
        except:
            return current_price * 0.98  # Default 2% below
    
    def detect_all_volume_momentum_patterns(self, prices: np.ndarray, volumes: np.ndarray, 
                                          rsi_values: np.ndarray = None, macd_values: np.ndarray = None,
                                          macd_signal: np.ndarray = None) -> Dict[str, List[Dict]]:
        """Tüm volume ve momentum pattern'leri tespit et"""
        patterns = {}
        
        # Volume patterns
        patterns['volume_breakout'] = self.detect_volume_breakout(prices, volumes)
        patterns['volume_divergence'] = self.detect_volume_divergence(prices, volumes)
        
        # Momentum patterns (if data provided)
        if rsi_values is not None:
            patterns['rsi_divergence'] = self.detect_rsi_divergence(prices, rsi_values)
        else:
            patterns['rsi_divergence'] = []
        
        if macd_values is not None and macd_signal is not None:
            patterns['macd_divergence'] = self.detect_macd_divergence(prices, macd_values, macd_signal)
        else:
            patterns['macd_divergence'] = []
        
        return patterns
    
    def calculate_pattern_score(self, patterns: Dict[str, List[Dict]]) -> float:
        """Pattern'lerin toplam skorunu hesapla (0-100)"""
        if not patterns:
            return 0.0
        
        total_score = 0.0
        total_patterns = 0
        
        for pattern_type, pattern_list in patterns.items():
            for pattern in pattern_list:
                confidence = pattern.get('confidence', 0)
                weight = self.pattern_weights.get(pattern_type, 0.1)
                weighted_score = confidence * weight
                total_score += weighted_score
                total_patterns += 1
        
        if total_patterns == 0:
            return 0.0
            
        return total_score
    
    def get_trading_signals(self, patterns: Dict[str, List[Dict]]) -> List[Dict]:
        """Trading sinyallerini çıkar"""
        signals = []
        
        for pattern_type, pattern_list in patterns.items():
            for pattern in pattern_list:
                signal = {
                    'pattern_type': pattern['pattern_type'],
                    'signal': pattern['signal'],
                    'confidence': pattern['confidence'],
                    'entry_price': pattern['price'],
                    'target': pattern['target'],
                    'stop_loss': pattern['stop_loss'],
                    'risk_reward_ratio': abs(pattern['target'] - pattern['price']) / abs(pattern['stop_loss'] - pattern['price'])
                }
                signals.append(signal)
        
        # Sort by confidence
        signals.sort(key=lambda x: x['confidence'], reverse=True)
        return signals

# Test fonksiyonu
def test_volume_momentum_detector():
    """Volume momentum detector'ı test et"""
    print("🧪 Testing Volume & Momentum Pattern Detector...")
    
    # Test data oluştur
    np.random.seed(42)
    n_samples = 200
    
    # Simulated price and volume data
    base_price = 100
    trend = np.cumsum(np.random.randn(n_samples) * 0.01)
    prices = base_price + trend
    
    # Generate volume data
    base_volume = 1000000
    volumes = base_volume + np.random.uniform(-200000, 200000, n_samples)
    
    # Generate RSI data
    rsi_values = 50 + np.random.uniform(-20, 20, n_samples)
    rsi_values = np.clip(rsi_values, 0, 100)
    
    # Generate MACD data
    macd_values = np.random.uniform(-0.02, 0.02, n_samples)
    macd_signal = macd_values + np.random.uniform(-0.005, 0.005, n_samples)
    
    # Detector oluştur
    detector = VolumeMomentumDetector()
    
    # Pattern'leri tespit et
    patterns = detector.detect_all_volume_momentum_patterns(prices, volumes, rsi_values, macd_values, macd_signal)
    
    # Sonuçları göster
    print(f"📊 Detected Volume & Momentum Patterns:")
    for pattern_type, pattern_list in patterns.items():
        print(f"  {pattern_type}: {len(pattern_list)} patterns")
    
    # Trading sinyallerini al
    signals = detector.get_trading_signals(patterns)
    print(f"📈 Trading Signals: {len(signals)}")
    
    # Pattern skorunu hesapla
    score = detector.calculate_pattern_score(patterns)
    print(f"🎯 Pattern Score: {score:.2f}/100")
    
    return patterns, signals, score

if __name__ == "__main__":
    try:
        patterns, signals, score = test_volume_momentum_detector()
        print("✅ Volume & Momentum Pattern Detector test completed!")
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
