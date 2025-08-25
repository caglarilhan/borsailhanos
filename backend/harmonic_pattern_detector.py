#!/usr/bin/env python3
"""
🚀 HARMONIC PATTERN DETECTOR - BIST AI Smart Trader
Doğruluk artırma için harmonic pattern tespiti
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

class HarmonicPatternDetector:
    """Harmonic pattern tespit edici - Accuracy boost için"""
    
    def __init__(self):
        # Fibonacci ratios for harmonic patterns
        self.fib_ratios = {
            '0.236': 0.236, '0.382': 0.382, '0.500': 0.500,
            '0.618': 0.618, '0.786': 0.786, '0.886': 0.886,
            '1.272': 1.272, '1.618': 1.618, '2.000': 2.000,
            '2.618': 2.618, '3.618': 3.618
        }
        
        # Pattern tolerance (percentage)
        self.tolerance = 0.05  # 5% tolerance
        
        # Minimum swing size for pattern detection
        self.min_swing_size = 0.02  # 2% minimum price movement
        
    def find_swing_points(self, highs: np.ndarray, lows: np.ndarray, 
                          window: int = 5) -> Tuple[np.ndarray, np.ndarray]:
        """
        Swing high ve low noktalarını bul
        
        Args:
            highs: High prices array
            lows: Low prices array
            window: Swing detection window size
            
        Returns:
            Tuple of swing highs and lows indices
        """
        swing_highs = []
        swing_lows = []
        
        for i in range(window, len(highs) - window):
            # Swing high detection
            if all(highs[i] >= highs[j] for j in range(i-window, i+window+1)):
                swing_highs.append(i)
            
            # Swing low detection
            if all(lows[i] <= lows[j] for j in range(i-window, i+window+1)):
                swing_lows.append(i)
        
        return np.array(swing_highs), np.array(swing_lows)
    
    def calculate_fibonacci_retracement(self, start_price: float, end_price: float, 
                                      ratio: float) -> float:
        """Fibonacci retracement hesapla"""
        price_range = end_price - start_price
        return start_price + (price_range * ratio)
    
    def is_within_tolerance(self, actual: float, expected: float, 
                           tolerance: float = None) -> bool:
        """Değerin tolerance içinde olup olmadığını kontrol et"""
        if tolerance is None:
            tolerance = self.tolerance
            
        diff = abs(actual - expected) / expected
        return diff <= tolerance
    
    def detect_gartley_pattern(self, highs: np.ndarray, lows: np.ndarray, 
                              prices: np.ndarray) -> List[Dict]:
        """
        Gartley Pattern tespit et
        
        Gartley Pattern:
        - XA: Initial move
        - AB: 61.8% retracement of XA
        - BC: 38.2-88.6% retracement of AB
        - CD: 127.2-161.8% extension of BC
        - D: 78.6% retracement of XA
        """
        patterns = []
        swing_highs, swing_lows = self.find_swing_points(highs, lows)
        
        # Need at least 5 swing points for Gartley
        if len(swing_highs) < 3 or len(swing_lows) < 2:
            return patterns
        
        # Look for potential Gartley patterns
        for i in range(len(swing_highs) - 2):
            for j in range(len(swing_lows) - 1):
                # Point X (swing low)
                x_idx = swing_lows[j]
                x_price = lows[x_idx]
                
                # Point A (swing high)
                a_idx = swing_highs[i]
                a_price = highs[a_idx]
                
                # Point B (swing low after A)
                b_candidates = [idx for idx in swing_lows if idx > a_idx]
                if not b_candidates:
                    continue
                    
                b_idx = b_candidates[0]
                b_price = lows[b_idx]
                
                # Point C (swing high after B)
                c_candidates = [idx for idx in swing_highs if idx > b_idx]
                if not c_candidates:
                    continue
                    
                c_idx = c_candidates[0]
                c_price = highs[c_idx]
                
                # Point D (swing low after C)
                d_candidates = [idx for idx in swing_lows if idx > c_idx]
                if not d_candidates:
                    continue
                    
                d_idx = d_candidates[0]
                d_price = lows[d_idx]
                
                # Validate Gartley pattern ratios
                if self._validate_gartley_ratios(x_price, a_price, b_price, c_price, d_price):
                    pattern = {
                        'pattern_type': 'Gartley',
                        'points': {
                            'X': {'index': x_idx, 'price': x_price, 'type': 'low'},
                            'A': {'index': a_idx, 'price': a_price, 'type': 'high'},
                            'B': {'index': b_idx, 'price': b_price, 'type': 'low'},
                            'C': {'index': c_idx, 'price': c_price, 'type': 'high'},
                            'D': {'index': d_idx, 'price': d_price, 'type': 'low'}
                        },
                        'confidence': self._calculate_gartley_confidence(x_price, a_price, b_price, c_price, d_price),
                        'signal': 'BUY' if d_price < b_price else 'SELL',
                        'target': self._calculate_gartley_target(x_price, a_price, b_price, c_price, d_price),
                        'stop_loss': self._calculate_gartley_stop_loss(x_price, a_price, b_price, c_price, d_price)
                    }
                    patterns.append(pattern)
        
        return patterns
    
    def _validate_gartley_ratios(self, x_price: float, a_price: float, 
                                b_price: float, c_price: float, d_price: float) -> bool:
        """Gartley pattern oranlarını validate et"""
        try:
            # XA move
            xa_move = a_price - x_price
            
            # AB retracement (should be 61.8%)
            ab_move = a_price - b_price
            ab_ratio = ab_move / xa_move
            if not self.is_within_tolerance(ab_ratio, 0.618, 0.08):
                return False
            
            # BC retracement (should be 38.2-88.6%)
            bc_move = c_price - b_price
            bc_ratio = bc_move / ab_move
            if not (0.382 <= bc_ratio <= 0.886):
                return False
            
            # CD extension (should be 127.2-161.8%)
            cd_move = c_price - d_price
            cd_ratio = cd_move / bc_move
            if not (1.272 <= cd_ratio <= 1.618):
                return False
            
            # D retracement (should be 78.6%)
            d_retracement = (a_price - d_price) / xa_move
            if not self.is_within_tolerance(d_retracement, 0.786, 0.08):
                return False
            
            return True
            
        except ZeroDivisionError:
            return False
    
    def _calculate_gartley_confidence(self, x_price: float, a_price: float,
                                    b_price: float, c_price: float, d_price: float) -> float:
        """Gartley pattern güven skorunu hesapla (0-100)"""
        try:
            confidence = 100.0
            
            # XA move validation
            xa_move = a_price - x_price
            if xa_move <= 0:
                confidence -= 20
            
            # AB ratio accuracy
            ab_move = a_price - b_price
            ab_ratio = ab_move / xa_move
            ab_error = abs(ab_ratio - 0.618) / 0.618
            confidence -= ab_error * 50
            
            # BC ratio accuracy
            bc_move = c_price - b_price
            bc_ratio = bc_move / ab_move
            if 0.382 <= bc_ratio <= 0.886:
                confidence += 10
            else:
                confidence -= 20
            
            # CD ratio accuracy
            cd_move = c_price - d_price
            cd_ratio = cd_move / bc_move
            if 1.272 <= cd_ratio <= 1.618:
                confidence += 10
            else:
                confidence -= 20
            
            # D retracement accuracy
            d_retracement = (a_price - d_price) / xa_move
            d_error = abs(d_retracement - 0.786) / 0.786
            confidence -= d_error * 50
            
            return max(0, min(100, confidence))
            
        except ZeroDivisionError:
            return 0.0
    
    def _calculate_gartley_target(self, x_price: float, a_price: float,
                                 b_price: float, c_price: float, d_price: float) -> float:
        """Gartley pattern hedef fiyatını hesapla"""
        try:
            # Target is typically 61.8% retracement of CD move
            cd_move = c_price - d_price
            target = d_price + (cd_move * 0.618)
            return target
        except:
            return d_price * 1.05  # 5% default target
    
    def _calculate_gartley_stop_loss(self, x_price: float, a_price: float,
                                    b_price: float, c_price: float, d_price: float) -> float:
        """Gartley pattern stop loss seviyesini hesapla"""
        try:
            # Stop loss below point D for bullish pattern
            if d_price < b_price:  # Bullish
                stop_loss = d_price * 0.98  # 2% below D
            else:  # Bearish
                stop_loss = d_price * 1.02  # 2% above D
            return stop_loss
        except:
            return d_price * 0.98  # Default 2% below
    
    def detect_butterfly_pattern(self, highs: np.ndarray, lows: np.ndarray, 
                                prices: np.ndarray) -> List[Dict]:
        """
        Butterfly Pattern tespit et
        
        Butterfly Pattern:
        - XA: Initial move
        - AB: 78.6% retracement of XA
        - BC: 38.2-88.6% retracement of AB
        - CD: 161.8-224% extension of BC
        - D: 127.2% extension of XA
        """
        # Implementation similar to Gartley but with different ratios
        # TODO: Implement Butterfly pattern detection
        return []
    
    def detect_bat_pattern(self, highs: np.ndarray, lows: np.ndarray, 
                          prices: np.ndarray) -> List[Dict]:
        """
        Bat Pattern tespit et
        
        Bat Pattern:
        - XA: Initial move
        - AB: 38.2-50% retracement of XA
        - BC: 38.2-88.6% retracement of AB
        - CD: 161.8-261.8% extension of BC
        - D: 88.6% retracement of XA
        """
        # Implementation similar to Gartley but with different ratios
        # TODO: Implement Bat pattern detection
        return []
    
    def detect_all_harmonic_patterns(self, highs: np.ndarray, lows: np.ndarray, 
                                   prices: np.ndarray) -> Dict[str, List[Dict]]:
        """Tüm harmonic pattern'leri tespit et"""
        patterns = {}
        
        # Gartley patterns
        patterns['gartley'] = self.detect_gartley_pattern(highs, lows, prices)
        
        # Butterfly patterns (TODO)
        patterns['butterfly'] = self.detect_butterfly_pattern(highs, lows, prices)
        
        # Bat patterns (TODO)
        patterns['bat'] = self.detect_bat_pattern(highs, lows, prices)
        
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
                total_score += confidence
                total_patterns += 1
        
        if total_patterns == 0:
            return 0.0
            
        return total_score / total_patterns
    
    def get_trading_signals(self, patterns: Dict[str, List[Dict]]) -> List[Dict]:
        """Trading sinyallerini çıkar"""
        signals = []
        
        for pattern_type, pattern_list in patterns.items():
            for pattern in pattern_list:
                signal = {
                    'pattern_type': pattern['pattern_type'],
                    'signal': pattern['signal'],
                    'confidence': pattern['confidence'],
                    'entry_price': pattern['points']['D']['price'],
                    'target': pattern['target'],
                    'stop_loss': pattern['stop_loss'],
                    'risk_reward_ratio': abs(pattern['target'] - pattern['points']['D']['price']) / 
                                       abs(pattern['stop_loss'] - pattern['points']['D']['price'])
                }
                signals.append(signal)
        
        # Sort by confidence
        signals.sort(key=lambda x: x['confidence'], reverse=True)
        return signals

# Test fonksiyonu
def test_harmonic_detector():
    """Harmonic pattern detector'ı test et"""
    print("🧪 Testing Harmonic Pattern Detector...")
    
    # Test data oluştur
    np.random.seed(42)
    n_samples = 100
    
    # Simulated price data
    base_price = 100
    prices = base_price + np.cumsum(np.random.randn(n_samples) * 0.5)
    highs = prices + np.random.uniform(0.5, 2.0, n_samples)
    lows = prices - np.random.uniform(0.5, 2.0, n_samples)
    
    # Detector oluştur
    detector = HarmonicPatternDetector()
    
    # Pattern'leri tespit et
    patterns = detector.detect_all_harmonic_patterns(highs, lows, prices)
    
    # Sonuçları göster
    print(f"📊 Detected Patterns:")
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
        patterns, signals, score = test_harmonic_detector()
        print("✅ Harmonic Pattern Detector test completed!")
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
