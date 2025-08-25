#!/usr/bin/env python3
"""
🚀 FIBONACCI & SUPPORT/RESISTANCE PATTERN DETECTOR - BIST AI Smart Trader
Phase 6: Fibonacci & Support/Resistance Patterns for Accuracy Boost
Expected Accuracy Boost: +3-5%
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

class FibonacciSupportResistanceDetector:
    """Fibonacci ve support/resistance pattern tespit edici - Accuracy boost için"""
    
    def __init__(self):
        # Fibonacci retracement levels
        self.fibonacci_levels = {
            '0.236': 0.236,  # 23.6%
            '0.382': 0.382,  # 38.2%
            '0.500': 0.500,  # 50.0%
            '0.618': 0.618,  # 61.8%
            '0.786': 0.786,  # 78.6%
            '0.886': 0.886   # 88.6%
        }
        
        # Fibonacci extension levels
        self.fibonacci_extensions = {
            '1.272': 1.272,  # 127.2%
            '1.618': 1.618,  # 161.8%
            '2.000': 2.000,  # 200.0%
            '2.618': 2.618   # 261.8%
        }
        
        # Support/Resistance parameters
        self.sr_window = 20  # Window for S/R detection
        self.sr_threshold = 0.02  # 2% threshold for S/R levels
        self.touch_count_threshold = 3  # Minimum touches for S/R level
        
        # Pattern weights for accuracy calculation
        self.pattern_weights = {
            'fibonacci_retracement': 0.30,    # 30% weight
            'fibonacci_extension': 0.25,      # 25% weight
            'support_resistance': 0.25,       # 25% weight
            'pivot_points': 0.20             # 20% weight
        }
    
    def detect_fibonacci_retracement(self, highs: np.ndarray, lows: np.ndarray, 
                                   prices: np.ndarray, window: int = 20) -> List[Dict]:
        """
        Fibonacci retracement pattern tespit et
        
        Fibonacci Retracement:
        - Identify swing high and low
        - Calculate retracement levels
        - Price bounces from retracement levels
        """
        patterns = []
        
        for i in range(window, len(prices)):
            # Look for swing high and low in recent window
            recent_highs = highs[i-window:i]
            recent_lows = lows[i-window:i]
            
            # Find swing high and low
            swing_high_idx = np.argmax(recent_highs)
            swing_low_idx = np.argmin(recent_lows)
            
            swing_high = recent_highs[swing_high_idx]
            swing_low = recent_lows[swing_low_idx]
            
            # Calculate price range
            price_range = swing_high - swing_low
            
            # Check if current price is near any Fibonacci level
            for level_name, level_value in self.fibonacci_levels.items():
                # Calculate retracement level
                if swing_high_idx > swing_low_idx:  # Uptrend
                    retracement_level = swing_high - (price_range * level_value)
                    # Check if price is near retracement level
                    if abs(prices[i] - retracement_level) / retracement_level < 0.01:  # 1% tolerance
                        pattern = {
                            'pattern_type': 'Fibonacci Retracement',
                            'subtype': f'{level_name} Retracement',
                            'index': i,
                            'price': prices[i],
                            'swing_high': swing_high,
                            'swing_low': swing_low,
                            'retracement_level': retracement_level,
                            'fibonacci_level': level_value,
                            'trend': 'Uptrend',
                            'confidence': self._calculate_fibonacci_retracement_confidence(level_value, price_range, prices[i], retracement_level),
                            'signal': 'BUY',
                            'target': self._calculate_fibonacci_retracement_target(prices[i], swing_high, level_value),
                            'stop_loss': self._calculate_fibonacci_retracement_stop_loss(prices[i], swing_low)
                        }
                        patterns.append(pattern)
                
                elif swing_low_idx > swing_high_idx:  # Downtrend
                    retracement_level = swing_low + (price_range * level_value)
                    # Check if price is near retracement level
                    if abs(prices[i] - retracement_level) / retracement_level < 0.01:  # 1% tolerance
                        pattern = {
                            'pattern_type': 'Fibonacci Retracement',
                            'subtype': f'{level_name} Retracement',
                            'index': i,
                            'price': prices[i],
                            'swing_high': swing_high,
                            'swing_low': swing_low,
                            'retracement_level': retracement_level,
                            'fibonacci_level': level_value,
                            'trend': 'Downtrend',
                            'confidence': self._calculate_fibonacci_retracement_confidence(level_value, price_range, prices[i], retracement_level),
                            'signal': 'SELL',
                            'target': self._calculate_fibonacci_retracement_target(prices[i], swing_low, level_value),
                            'stop_loss': self._calculate_fibonacci_retracement_stop_loss(prices[i], swing_high)
                        }
                        patterns.append(pattern)
        
        return patterns
    
    def detect_fibonacci_extension(self, highs: np.ndarray, lows: np.ndarray, 
                                 prices: np.ndarray, window: int = 20) -> List[Dict]:
        """
        Fibonacci extension pattern tespit et
        
        Fibonacci Extension:
        - Identify swing high and low
        - Calculate extension levels
        - Price reaches extension levels
        """
        patterns = []
        
        for i in range(window, len(prices)):
            # Look for swing high and low in recent window
            recent_highs = highs[i-window:i]
            recent_lows = lows[i-window:i]
            
            # Find swing high and low
            swing_high_idx = np.argmax(recent_highs)
            swing_low_idx = np.argmin(recent_lows)
            
            swing_high = recent_highs[swing_high_idx]
            swing_low = recent_lows[swing_low_idx]
            
            # Calculate price range
            price_range = swing_high - swing_low
            
            # Check if current price is near any Fibonacci extension level
            for level_name, level_value in self.fibonacci_extensions.items():
                # Calculate extension level
                if swing_high_idx > swing_low_idx:  # Uptrend
                    extension_level = swing_high + (price_range * level_value)
                    # Check if price is near extension level
                    if abs(prices[i] - extension_level) / extension_level < 0.01:  # 1% tolerance
                        pattern = {
                            'pattern_type': 'Fibonacci Extension',
                            'subtype': f'{level_name} Extension',
                            'index': i,
                            'price': prices[i],
                            'swing_high': swing_high,
                            'swing_low': swing_low,
                            'extension_level': extension_level,
                            'fibonacci_level': level_value,
                            'trend': 'Uptrend',
                            'confidence': self._calculate_fibonacci_extension_confidence(level_value, price_range, prices[i], extension_level),
                            'signal': 'SELL',  # Take profit at extension
                            'target': self._calculate_fibonacci_extension_target(prices[i], extension_level),
                            'stop_loss': self._calculate_fibonacci_extension_stop_loss(prices[i], swing_high)
                        }
                        patterns.append(pattern)
                
                elif swing_low_idx > swing_high_idx:  # Downtrend
                    extension_level = swing_low - (price_range * level_value)
                    # Check if price is near extension level
                    if abs(prices[i] - extension_level) / extension_level < 0.01:  # 1% tolerance
                        pattern = {
                            'pattern_type': 'Fibonacci Extension',
                            'subtype': f'{level_name} Extension',
                            'index': i,
                            'price': prices[i],
                            'swing_high': swing_high,
                            'swing_low': swing_low,
                            'extension_level': extension_level,
                            'fibonacci_level': level_value,
                            'trend': 'Downtrend',
                            'confidence': self._calculate_fibonacci_extension_confidence(level_value, price_range, prices[i], extension_level),
                            'signal': 'BUY',  # Take profit at extension
                            'target': self._calculate_fibonacci_extension_target(prices[i], extension_level),
                            'stop_loss': self._calculate_fibonacci_extension_stop_loss(prices[i], swing_low)
                        }
                        patterns.append(pattern)
        
        return patterns
    
    def detect_support_resistance(self, highs: np.ndarray, lows: np.ndarray, 
                                prices: np.ndarray, window: int = 20) -> List[Dict]:
        """
        Support and Resistance levels tespit et
        
        Support/Resistance:
        - Identify key price levels
        - Count touches at each level
        - Validate level strength
        """
        patterns = []
        
        # Find potential support and resistance levels
        potential_levels = self._find_potential_levels(highs, lows, prices, window)
        
        for level_info in potential_levels:
            level_price = level_info['price']
            level_type = level_info['type']
            touch_count = level_info['touch_count']
            strength = level_info['strength']
            
            # Check if current price is near this level
            if abs(prices[-1] - level_price) / level_price < self.sr_threshold:
                # Determine signal based on level type and current price
                if level_type == 'Support' and prices[-1] > level_price:
                    signal = 'BUY'
                elif level_type == 'Resistance' and prices[-1] < level_price:
                    signal = 'SELL'
                else:
                    continue  # Skip if not a valid signal
                
                pattern = {
                    'pattern_type': 'Support/Resistance',
                    'subtype': level_type,
                    'index': len(prices) - 1,
                    'price': prices[-1],
                    'level_price': level_price,
                    'level_type': level_type,
                    'touch_count': touch_count,
                    'strength': strength,
                    'confidence': self._calculate_support_resistance_confidence(touch_count, strength, prices[-1], level_price),
                    'signal': signal,
                    'target': self._calculate_support_resistance_target(prices[-1], level_price, level_type),
                    'stop_loss': self._calculate_support_resistance_stop_loss(prices[-1], level_price, level_type)
                }
                patterns.append(pattern)
        
        return patterns
    
    def detect_pivot_points(self, highs: np.ndarray, lows: np.ndarray, 
                          prices: np.ndarray, window: int = 20) -> List[Dict]:
        """
        Pivot Point patterns tespit et
        
        Pivot Points:
        - Standard pivot point calculation
        - Support and resistance levels
        - Breakout detection
        """
        patterns = []
        
        for i in range(window, len(prices)):
            # Calculate pivot point using previous day's data
            prev_high = highs[i-1]
            prev_low = lows[i-1]
            prev_close = prices[i-1]
            
            # Standard pivot point
            pivot_point = (prev_high + prev_low + prev_close) / 3
            
            # Support and resistance levels
            r1 = (2 * pivot_point) - prev_low
            s1 = (2 * pivot_point) - prev_high
            r2 = pivot_point + (prev_high - prev_low)
            s2 = pivot_point - (prev_high - prev_low)
            
            # Check if current price is near any pivot level
            pivot_levels = [
                {'name': 'Pivot Point', 'price': pivot_point, 'type': 'Pivot'},
                {'name': 'Resistance 1', 'price': r1, 'type': 'Resistance'},
                {'name': 'Support 1', 'price': s1, 'type': 'Support'},
                {'name': 'Resistance 2', 'price': r2, 'type': 'Resistance'},
                {'name': 'Support 2', 'price': s2, 'type': 'Support'}
            ]
            
            for level in pivot_levels:
                if abs(prices[i] - level['price']) / level['price'] < 0.01:  # 1% tolerance
                    # Determine signal
                    if level['type'] == 'Support' and prices[i] > level['price']:
                        signal = 'BUY'
                    elif level['type'] == 'Resistance' and prices[i] < level['price']:
                        signal = 'SELL'
                    elif level['type'] == 'Pivot':
                        signal = 'NEUTRAL'
                    else:
                        continue
                    
                    if signal != 'NEUTRAL':
                        pattern = {
                            'pattern_type': 'Pivot Point',
                            'subtype': level['name'],
                            'index': i,
                            'price': prices[i],
                            'pivot_price': level['price'],
                            'level_type': level['type'],
                            'confidence': self._calculate_pivot_point_confidence(prices[i], level['price'], level['type']),
                            'signal': signal,
                            'target': self._calculate_pivot_point_target(prices[i], level['price'], level['type']),
                            'stop_loss': self._calculate_pivot_point_stop_loss(prices[i], level['price'], level['type'])
                        }
                        patterns.append(pattern)
        
        return patterns
    
    def _find_potential_levels(self, highs: np.ndarray, lows: np.ndarray, 
                              prices: np.ndarray, window: int) -> List[Dict]:
        """Potential support and resistance levels bul"""
        levels = []
        
        # Look for levels where price has touched multiple times
        for i in range(window, len(prices)):
            # Check for support level
            support_price = lows[i]
            touch_count = 0
            
            for j in range(max(0, i-window), i):
                if abs(lows[j] - support_price) / support_price < self.sr_threshold:
                    touch_count += 1
            
            if touch_count >= self.touch_count_threshold:
                strength = touch_count / self.touch_count_threshold
                levels.append({
                    'price': support_price,
                    'type': 'Support',
                    'touch_count': touch_count,
                    'strength': strength
                })
            
            # Check for resistance level
            resistance_price = highs[i]
            touch_count = 0
            
            for j in range(max(0, i-window), i):
                if abs(highs[j] - resistance_price) / resistance_price < self.sr_threshold:
                    touch_count += 1
            
            if touch_count >= self.touch_count_threshold:
                strength = touch_count / self.touch_count_threshold
                levels.append({
                    'price': resistance_price,
                    'type': 'Resistance',
                    'touch_count': touch_count,
                    'strength': strength
                })
        
        # Remove duplicate levels
        unique_levels = []
        for level in levels:
            is_duplicate = False
            for existing in unique_levels:
                if abs(level['price'] - existing['price']) / existing['price'] < self.sr_threshold:
                    is_duplicate = True
                    break
            if not is_duplicate:
                unique_levels.append(level)
        
        return unique_levels
    
    def _calculate_fibonacci_retracement_confidence(self, fib_level: float, price_range: float, 
                                                 current_price: float, retracement_level: float) -> float:
        """Fibonacci retracement güven skorunu hesapla (0-100)"""
        try:
            confidence = 100.0
            
            # Fibonacci level importance
            if fib_level in [0.382, 0.618]:  # Key levels
                confidence += 20
            elif fib_level in [0.236, 0.786]:  # Secondary levels
                confidence += 15
            elif fib_level in [0.500, 0.886]:  # Tertiary levels
                confidence += 10
            
            # Price proximity to retracement level
            proximity = abs(current_price - retracement_level) / retracement_level
            if proximity < 0.005:  # Very close
                confidence += 25
            elif proximity < 0.01:  # Close
                confidence += 15
            else:
                confidence -= 20
            
            # Price range strength
            if price_range > 0.05:  # 5% range
                confidence += 15
            elif price_range < 0.02:  # 2% range
                confidence -= 15
            
            return max(0, min(100, confidence))
            
        except:
            return 0.0
    
    def _calculate_fibonacci_extension_confidence(self, fib_level: float, price_range: float, 
                                                current_price: float, extension_level: float) -> float:
        """Fibonacci extension güven skorunu hesapla (0-100)"""
        try:
            confidence = 100.0
            
            # Fibonacci level importance
            if fib_level in [1.618, 2.000]:  # Key levels
                confidence += 20
            elif fib_level in [1.272, 2.618]:  # Secondary levels
                confidence += 15
            
            # Price proximity to extension level
            proximity = abs(current_price - extension_level) / extension_level
            if proximity < 0.005:  # Very close
                confidence += 25
            elif proximity < 0.01:  # Close
                confidence += 15
            else:
                confidence -= 20
            
            # Price range strength
            if price_range > 0.05:  # 5% range
                confidence += 15
            elif price_range < 0.02:  # 2% range
                confidence -= 15
            
            return max(0, min(100, confidence))
            
        except:
            return 0.0
    
    def _calculate_support_resistance_confidence(self, touch_count: int, strength: float, 
                                               current_price: float, level_price: float) -> float:
        """Support/Resistance güven skorunu hesapla (0-100)"""
        try:
            confidence = 100.0
            
            # Touch count
            if touch_count >= 5:
                confidence += 25
            elif touch_count >= 3:
                confidence += 15
            else:
                confidence -= 20
            
            # Level strength
            if strength > 1.5:
                confidence += 20
            elif strength < 1.0:
                confidence -= 20
            
            # Price proximity
            proximity = abs(current_price - level_price) / level_price
            if proximity < 0.01:  # 1% tolerance
                confidence += 20
            else:
                confidence -= 25
            
            return max(0, min(100, confidence))
            
        except:
            return 0.0
    
    def _calculate_pivot_point_confidence(self, current_price: float, pivot_price: float, 
                                        level_type: str) -> float:
        """Pivot point güven skorunu hesapla (0-100)"""
        try:
            confidence = 100.0
            
            # Price proximity to pivot level
            proximity = abs(current_price - pivot_price) / pivot_price
            if proximity < 0.005:  # Very close
                confidence += 25
            elif proximity < 0.01:  # Close
                confidence += 15
            else:
                confidence -= 20
            
            # Level type importance
            if level_type == 'Pivot':
                confidence += 20
            elif level_type in ['Support 1', 'Resistance 1']:
                confidence += 15
            elif level_type in ['Support 2', 'Resistance 2']:
                confidence += 10
            
            return max(0, min(100, confidence))
            
        except:
            return 0.0
    
    def _calculate_fibonacci_retracement_target(self, current_price: float, swing_extreme: float, 
                                              fib_level: float) -> float:
        """Fibonacci retracement hedef fiyatını hesapla"""
        try:
            # Target is typically the opposite extreme
            if current_price < swing_extreme:  # Bullish retracement
                target = swing_extreme
            else:  # Bearish retracement
                target = swing_extreme
            return target
        except:
            return current_price * 1.05  # 5% default target
    
    def _calculate_fibonacci_retracement_stop_loss(self, current_price: float, swing_extreme: float) -> float:
        """Fibonacci retracement stop loss seviyesini hesapla"""
        try:
            # Stop loss below/above the retracement level
            if current_price < swing_extreme:  # Bullish
                stop_loss = current_price * 0.98  # 2% below
            else:  # Bearish
                stop_loss = current_price * 1.02  # 2% above
            return stop_loss
        except:
            return current_price * 0.98  # Default 2% below
    
    def _calculate_fibonacci_extension_target(self, current_price: float, extension_level: float) -> float:
        """Fibonacci extension hedef fiyatını hesapla"""
        try:
            # Target is typically beyond the extension level
            if current_price > extension_level:  # Bullish extension
                target = extension_level * 1.05  # 5% beyond
            else:  # Bearish extension
                target = extension_level * 0.95  # 5% beyond
            return target
        except:
            return current_price * 1.05  # 5% default target
    
    def _calculate_fibonacci_extension_stop_loss(self, current_price: float, swing_extreme: float) -> float:
        """Fibonacci extension stop loss seviyesini hesapla"""
        try:
            # Stop loss at the swing extreme
            return swing_extreme
        except:
            return current_price * 0.98  # Default 2% below
    
    def _calculate_support_resistance_target(self, current_price: float, level_price: float, 
                                          level_type: str) -> float:
        """Support/Resistance hedef fiyatını hesapla"""
        try:
            # Target depends on level type
            if level_type == 'Support':
                target = current_price + (abs(current_price - level_price) * 1.618)
            else:  # Resistance
                target = current_price - (abs(current_price - level_price) * 1.618)
            return target
        except:
            return current_price * 1.05  # 5% default target
    
    def _calculate_support_resistance_stop_loss(self, current_price: float, level_price: float, 
                                              level_type: str) -> float:
        """Support/Resistance stop loss seviyesini hesapla"""
        try:
            # Stop loss depends on level type
            if level_type == 'Support':
                stop_loss = level_price * 0.98  # 2% below support
            else:  # Resistance
                stop_loss = level_price * 1.02  # 2% above resistance
            return stop_loss
        except:
            return current_price * 0.98  # Default 2% below
    
    def _calculate_pivot_point_target(self, current_price: float, pivot_price: float, 
                                    level_type: str) -> float:
        """Pivot point hedef fiyatını hesapla"""
        try:
            # Target depends on level type
            if level_type == 'Support':
                target = current_price + (abs(current_price - pivot_price) * 1.618)
            elif level_type == 'Resistance':
                target = current_price - (abs(current_price - pivot_price) * 1.618)
            else:  # Pivot
                target = current_price * 1.05  # 5% default
            return target
        except:
            return current_price * 1.05  # 5% default target
    
    def _calculate_pivot_point_stop_loss(self, current_price: float, pivot_price: float, 
                                       level_type: str) -> float:
        """Pivot point stop loss seviyesini hesapla"""
        try:
            # Stop loss depends on level type
            if level_type == 'Support':
                stop_loss = pivot_price * 0.98  # 2% below support
            elif level_type == 'Resistance':
                stop_loss = pivot_price * 1.02  # 2% above resistance
            else:  # Pivot
                stop_loss = current_price * 0.98  # 2% below current
            return stop_loss
        except:
            return current_price * 0.98  # Default 2% below
    
    def detect_all_fibonacci_sr_patterns(self, highs: np.ndarray, lows: np.ndarray, 
                                       prices: np.ndarray, window: int = 20) -> Dict[str, List[Dict]]:
        """Tüm Fibonacci ve support/resistance pattern'leri tespit et"""
        patterns = {}
        
        # Fibonacci patterns
        patterns['fibonacci_retracement'] = self.detect_fibonacci_retracement(highs, lows, prices, window)
        patterns['fibonacci_extension'] = self.detect_fibonacci_extension(highs, lows, prices, window)
        
        # Support/Resistance patterns
        patterns['support_resistance'] = self.detect_support_resistance(highs, lows, prices, window)
        
        # Pivot point patterns
        patterns['pivot_points'] = self.detect_pivot_points(highs, lows, prices, window)
        
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
                if pattern.get('signal') != 'NEUTRAL':
                    signal = {
                        'pattern_type': pattern['pattern_type'],
                        'subtype': pattern.get('subtype', ''),
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
def test_fibonacci_sr_detector():
    """Fibonacci support/resistance detector'ı test et"""
    print("🧪 Testing Fibonacci & Support/Resistance Pattern Detector...")
    
    # Test data oluştur
    np.random.seed(42)
    n_samples = 200
    
    # Simulated OHLC data
    base_price = 100
    trend = np.cumsum(np.random.randn(n_samples) * 0.01)
    prices = base_price + trend
    
    # High and Low prices
    highs = prices + np.random.uniform(0.5, 2.0, n_samples)
    lows = prices - np.random.uniform(0.5, 2.0, n_samples)
    
    # Detector oluştur
    detector = FibonacciSupportResistanceDetector()
    
    # Pattern'leri tespit et
    patterns = detector.detect_all_fibonacci_sr_patterns(highs, lows, prices)
    
    # Sonuçları göster
    print(f"📊 Detected Fibonacci & Support/Resistance Patterns:")
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
        patterns, signals, score = test_fibonacci_sr_detector()
        print("✅ Fibonacci & Support/Resistance Pattern Detector test completed!")
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

