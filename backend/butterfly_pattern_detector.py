#!/usr/bin/env python3
"""
🚀 BUTTERFLY PATTERN DETECTOR - BIST AI Smart Trader
Harmonic pattern sequence: Gartley → Butterfly → Bat → Elliott Waves
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

class ButterflyPatternDetector:
    """Butterfly pattern tespit edici - Accuracy boost için"""
    
    def __init__(self):
        # Fibonacci ratios for Butterfly pattern
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
        
        # Butterfly specific ratios
        self.butterfly_ratios = {
            'AB_retracement': 0.786,  # AB should be 78.6% of XA
            'BC_retracement_min': 0.382,  # BC should be 38.2-88.6% of AB
            'BC_retracement_max': 0.886,
            'CD_extension_min': 1.618,  # CD should be 161.8-224% of BC
            'CD_extension_max': 2.240,
            'D_extension': 1.272  # D should be 127.2% extension of XA
        }
    
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
        patterns = []
        swing_highs, swing_lows = self.find_swing_points(highs, lows)
        
        # Need at least 5 swing points for Butterfly
        if len(swing_highs) < 3 or len(swing_lows) < 2:
            return patterns
        
        # Look for potential Butterfly patterns
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
                
                # Validate Butterfly pattern ratios
                if self._validate_butterfly_ratios(x_price, a_price, b_price, c_price, d_price):
                    pattern = {
                        'pattern_type': 'Butterfly',
                        'points': {
                            'X': {'index': x_idx, 'price': x_price, 'type': 'low'},
                            'A': {'index': a_idx, 'price': a_price, 'type': 'high'},
                            'B': {'index': b_idx, 'price': b_price, 'type': 'low'},
                            'C': {'index': c_idx, 'price': c_price, 'type': 'high'},
                            'D': {'index': d_idx, 'price': d_price, 'type': 'low'}
                        },
                        'confidence': self._calculate_butterfly_confidence(x_price, a_price, b_price, c_price, d_price),
                        'signal': 'BUY' if d_price < b_price else 'SELL',
                        'target': self._calculate_butterfly_target(x_price, a_price, b_price, c_price, d_price),
                        'stop_loss': self._calculate_butterfly_stop_loss(x_price, a_price, b_price, c_price, d_price),
                        'pattern_subtype': self._determine_butterfly_subtype(x_price, a_price, b_price, c_price, d_price)
                    }
                    patterns.append(pattern)
        
        return patterns
    
    def _validate_butterfly_ratios(self, x_price: float, a_price: float, 
                                  b_price: float, c_price: float, d_price: float) -> bool:
        """Butterfly pattern oranlarını validate et"""
        try:
            # XA move
            xa_move = a_price - x_price
            
            # AB retracement (should be 78.6%)
            ab_move = a_price - b_price
            ab_ratio = ab_move / xa_move
            if not self.is_within_tolerance(ab_ratio, self.butterfly_ratios['AB_retracement'], 0.08):
                return False
            
            # BC retracement (should be 38.2-88.6%)
            bc_move = c_price - b_price
            bc_ratio = bc_move / ab_move
            if not (self.butterfly_ratios['BC_retracement_min'] <= bc_ratio <= self.butterfly_ratios['BC_retracement_max']):
                return False
            
            # CD extension (should be 161.8-224%)
            cd_move = c_price - d_price
            cd_ratio = cd_move / bc_move
            if not (self.butterfly_ratios['CD_extension_min'] <= cd_ratio <= self.butterfly_ratios['CD_extension_max']):
                return False
            
            # D extension (should be 127.2% of XA)
            d_extension = (a_price - d_price) / xa_move
            if not self.is_within_tolerance(d_extension, self.butterfly_ratios['D_extension'], 0.08):
                return False
            
            return True
            
        except ZeroDivisionError:
            return False
    
    def _calculate_butterfly_confidence(self, x_price: float, a_price: float,
                                      b_price: float, c_price: float, d_price: float) -> float:
        """Butterfly pattern güven skorunu hesapla (0-100)"""
        try:
            confidence = 100.0
            
            # XA move validation
            xa_move = a_price - x_price
            if xa_move <= 0:
                confidence -= 20
            
            # AB ratio accuracy (78.6%)
            ab_move = a_price - b_price
            ab_ratio = ab_move / xa_move
            ab_error = abs(ab_ratio - self.butterfly_ratios['AB_retracement']) / self.butterfly_ratios['AB_retracement']
            confidence -= ab_error * 50
            
            # BC ratio accuracy (38.2-88.6%)
            bc_move = c_price - b_price
            bc_ratio = bc_move / ab_move
            if (self.butterfly_ratios['BC_retracement_min'] <= bc_ratio <= self.butterfly_ratios['BC_retracement_max']):
                confidence += 15
            else:
                confidence -= 25
            
            # CD ratio accuracy (161.8-224%)
            cd_move = c_price - d_price
            cd_ratio = cd_move / bc_move
            if (self.butterfly_ratios['CD_extension_min'] <= cd_ratio <= self.butterfly_ratios['CD_extension_max']):
                confidence += 15
            else:
                confidence -= 25
            
            # D extension accuracy (127.2%)
            d_extension = (a_price - d_price) / xa_move
            d_error = abs(d_extension - self.butterfly_ratios['D_extension']) / self.butterfly_ratios['D_extension']
            confidence -= d_error * 50
            
            return max(0, min(100, confidence))
            
        except ZeroDivisionError:
            return 0.0
    
    def _determine_butterfly_subtype(self, x_price: float, a_price: float,
                                   b_price: float, c_price: float, d_price: float) -> str:
        """Butterfly pattern alt tipini belirle"""
        try:
            # Bullish vs Bearish
            if d_price < b_price:
                return "Bullish Butterfly"
            else:
                return "Bearish Butterfly"
        except:
            return "Unknown Butterfly"
    
    def _calculate_butterfly_target(self, x_price: float, a_price: float,
                                  b_price: float, c_price: float, d_price: float) -> float:
        """Butterfly pattern hedef fiyatını hesapla"""
        try:
            # Target is typically 61.8% retracement of CD move
            cd_move = c_price - d_price
            target = d_price + (cd_move * 0.618)
            return target
        except:
            return d_price * 1.05  # 5% default target
    
    def _calculate_butterfly_stop_loss(self, x_price: float, a_price: float,
                                      b_price: float, c_price: float, d_price: float) -> float:
        """Butterfly pattern stop loss seviyesini hesapla"""
        try:
            # Stop loss below point D for bullish pattern
            if d_price < b_price:  # Bullish
                stop_loss = d_price * 0.98  # 2% below D
            else:  # Bearish
                stop_loss = d_price * 1.02  # 2% above D
            return stop_loss
        except:
            return d_price * 0.98  # Default 2% below
    
    def detect_all_butterfly_patterns(self, highs: np.ndarray, lows: np.ndarray, 
                                    prices: np.ndarray) -> Dict[str, List[Dict]]:
        """Tüm butterfly pattern'leri tespit et"""
        patterns = {}
        
        # Standard Butterfly patterns
        patterns['butterfly'] = self.detect_butterfly_pattern(highs, lows, prices)
        
        # Extended Butterfly patterns (with different ratios)
        patterns['extended_butterfly'] = self._detect_extended_butterfly_patterns(highs, lows, prices)
        
        return patterns
    
    def _detect_extended_butterfly_patterns(self, highs: np.ndarray, lows: np.ndarray, 
                                          prices: np.ndarray) -> List[Dict]:
        """Extended butterfly pattern'leri tespit et (farklı ratio'larla)"""
        # TODO: Implement extended butterfly patterns
        return []
    
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
                    'pattern_subtype': pattern.get('pattern_subtype', 'Unknown'),
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
def test_butterfly_detector():
    """Butterfly pattern detector'ı test et"""
    print("🧪 Testing Butterfly Pattern Detector...")
    
    # Test data oluştur
    np.random.seed(42)
    n_samples = 150
    
    # Simulated price data with Butterfly pattern characteristics
    base_price = 100
    trend = np.cumsum(np.random.randn(n_samples) * 0.01)
    prices = base_price + trend
    
    # High and Low prices
    highs = prices + np.random.uniform(0.5, 2.0, n_samples)
    lows = prices - np.random.uniform(0.5, 2.0, n_samples)
    
    # Detector oluştur
    detector = ButterflyPatternDetector()
    
    # Pattern'leri tespit et
    patterns = detector.detect_all_butterfly_patterns(highs, lows, prices)
    
    # Sonuçları göster
    print(f"📊 Detected Butterfly Patterns:")
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
        patterns, signals, score = test_butterfly_detector()
        print("✅ Butterfly Pattern Detector test completed!")
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
