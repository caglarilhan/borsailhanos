#!/usr/bin/env python3
"""
🚀 ADVANCED CANDLESTICK PATTERN DETECTOR - BIST AI Smart Trader
Phase 4: Advanced Patterns for Accuracy Boost
Expected Accuracy Boost: +5-8%
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

class AdvancedCandlestickDetector:
    """Advanced candlestick pattern tespit edici - Accuracy boost için"""
    
    def __init__(self):
        # Pattern tolerance (percentage)
        self.tolerance = 0.05  # 5% tolerance
        
        # Minimum body size for pattern detection
        self.min_body_size = 0.01  # 1% minimum body size
        
        # Pattern weights for accuracy calculation
        self.pattern_weights = {
            'morning_star': 0.25,      # 25% weight
            'evening_star': 0.25,      # 25% weight
            'three_white_soldiers': 0.20,  # 20% weight
            'three_black_crows': 0.20,     # 20% weight
            'harami': 0.10              # 10% weight
        }
    
    def detect_morning_star(self, opens: np.ndarray, highs: np.ndarray, 
                           lows: np.ndarray, closes: np.ndarray) -> List[Dict]:
        """
        Morning Star pattern tespit et
        
        Morning Star:
        - Day 1: Long bearish candle
        - Day 2: Small body (doji-like) with gap down
        - Day 3: Long bullish candle closing above midpoint of Day 1
        """
        patterns = []
        
        for i in range(2, len(opens)):
            # Day 1: Long bearish candle
            day1_body = abs(closes[i-2] - opens[i-2])
            day1_high = highs[i-2]
            day1_low = lows[i-2]
            day1_midpoint = (day1_high + day1_low) / 2
            
            # Check if Day 1 is bearish and long
            if (closes[i-2] < opens[i-2] and 
                day1_body > self.min_body_size * opens[i-2]):
                
                # Day 2: Small body with gap down
                day2_body = abs(closes[i-1] - opens[i-1])
                day2_high = highs[i-1]
                day2_low = lows[i-1]
                
                # Check if Day 2 has small body and gaps down
                if (day2_body < day1_body * 0.3 and  # Small body
                    day2_high < opens[i-2]):  # Gap down
                    
                    # Day 3: Long bullish candle
                    day3_body = abs(closes[i] - opens[i])
                    day3_high = highs[i]
                    day3_low = lows[i]
                    
                    # Check if Day 3 is bullish and closes above Day 1 midpoint
                    if (closes[i] > opens[i] and  # Bullish
                        day3_body > self.min_body_size * opens[i] and  # Long body
                        closes[i] > day1_midpoint):  # Above midpoint
                        
                        pattern = {
                            'pattern_type': 'Morning Star',
                            'days': {
                                'day1': {'index': i-2, 'open': opens[i-2], 'close': closes[i-2], 'high': highs[i-2], 'low': lows[i-2]},
                                'day2': {'index': i-1, 'open': opens[i-1], 'close': closes[i-1], 'high': highs[i-1], 'low': lows[i-1]},
                                'day3': {'index': i, 'open': opens[i], 'close': closes[i], 'high': highs[i], 'low': lows[i]}
                            },
                            'confidence': self._calculate_morning_star_confidence(opens[i-2:i+1], highs[i-2:i+1], lows[i-2:i+1], closes[i-2:i+1]),
                            'signal': 'BUY',
                            'target': self._calculate_morning_star_target(opens[i-2], highs[i-2], lows[i-2], closes[i]),
                            'stop_loss': self._calculate_morning_star_stop_loss(opens[i-2], highs[i-2], lows[i-2], closes[i])
                        }
                        patterns.append(pattern)
        
        return patterns
    
    def detect_evening_star(self, opens: np.ndarray, highs: np.ndarray, 
                           lows: np.ndarray, closes: np.ndarray) -> List[Dict]:
        """
        Evening Star pattern tespit et
        
        Evening Star:
        - Day 1: Long bullish candle
        - Day 2: Small body (doji-like) with gap up
        - Day 3: Long bearish candle closing below midpoint of Day 1
        """
        patterns = []
        
        for i in range(2, len(opens)):
            # Day 1: Long bullish candle
            day1_body = abs(closes[i-2] - opens[i-2])
            day1_high = highs[i-2]
            day1_low = lows[i-2]
            day1_midpoint = (day1_high + day1_low) / 2
            
            # Check if Day 1 is bullish and long
            if (closes[i-2] > opens[i-2] and 
                day1_body > self.min_body_size * opens[i-2]):
                
                # Day 2: Small body with gap up
                day2_body = abs(closes[i-1] - opens[i-1])
                day2_high = highs[i-1]
                day2_low = lows[i-1]
                
                # Check if Day 2 has small body and gaps up
                if (day2_body < day1_body * 0.3 and  # Small body
                    day2_low > closes[i-2]):  # Gap up
                    
                    # Day 3: Long bearish candle
                    day3_body = abs(closes[i] - opens[i])
                    day3_high = highs[i]
                    day3_low = lows[i]
                    
                    # Check if Day 3 is bearish and closes below Day 1 midpoint
                    if (closes[i] < opens[i] and  # Bearish
                        day3_body > self.min_body_size * opens[i] and  # Long body
                        closes[i] < day1_midpoint):  # Below midpoint
                        
                        pattern = {
                            'pattern_type': 'Evening Star',
                            'days': {
                                'day1': {'index': i-2, 'open': opens[i-2], 'close': closes[i-2], 'high': highs[i-2], 'low': lows[i-2]},
                                'day2': {'index': i-1, 'open': opens[i-1], 'close': closes[i-1], 'high': highs[i-1], 'low': lows[i-1]},
                                'day3': {'index': i, 'open': opens[i], 'close': closes[i], 'high': highs[i], 'low': lows[i]}
                            },
                            'confidence': self._calculate_evening_star_confidence(opens[i-2:i+1], highs[i-2:i+1], lows[i-2:i+1], closes[i-2:i+1]),
                            'signal': 'SELL',
                            'target': self._calculate_evening_star_target(opens[i-2], highs[i-2], lows[i-2], closes[i]),
                            'stop_loss': self._calculate_evening_star_stop_loss(opens[i-2], highs[i-2], lows[i-2], closes[i])
                        }
                        patterns.append(pattern)
        
        return patterns
    
    def detect_three_white_soldiers(self, opens: np.ndarray, highs: np.ndarray, 
                                   lows: np.ndarray, closes: np.ndarray) -> List[Dict]:
        """
        Three White Soldiers pattern tespit et
        
        Three White Soldiers:
        - Three consecutive long bullish candles
        - Each opens within previous candle's body
        - Each closes near its high
        """
        patterns = []
        
        for i in range(2, len(opens)):
            # Check three consecutive days
            days = [i-2, i-1, i]
            
            # Check if all three days are bullish
            all_bullish = all(closes[j] > opens[j] for j in days)
            if not all_bullish:
                continue
            
            # Check if each opens within previous candle's body
            opens_within_body = True
            for j in range(1, len(days)):
                prev_open = opens[days[j-1]]
                prev_close = closes[days[j-1]]
                curr_open = opens[days[j]]
                
                if not (min(prev_open, prev_close) <= curr_open <= max(prev_open, prev_close)):
                    opens_within_body = False
                    break
            
            if not opens_within_body:
                continue
            
            # Check if each closes near its high
            closes_near_high = True
            for j in days:
                body_size = closes[j] - opens[j]
                high_distance = highs[j] - closes[j]
                
                if high_distance > body_size * 0.3:  # Should close within 30% of high
                    closes_near_high = False
                    break
            
            if closes_near_high:
                pattern = {
                    'pattern_type': 'Three White Soldiers',
                    'days': {
                        'day1': {'index': i-2, 'open': opens[i-2], 'close': closes[i-2], 'high': highs[i-2], 'low': lows[i-2]},
                        'day2': {'index': i-1, 'open': opens[i-1], 'close': closes[i-1], 'high': highs[i-1], 'low': lows[i-1]},
                        'day3': {'index': i, 'open': opens[i], 'close': closes[i], 'high': highs[i], 'low': lows[i]}
                    },
                    'confidence': self._calculate_three_white_soldiers_confidence(opens[i-2:i+1], highs[i-2:i+1], lows[i-2:i+1], closes[i-2:i+1]),
                    'signal': 'BUY',
                    'target': self._calculate_three_white_soldiers_target(opens[i-2:i+1], highs[i-2:i+1], lows[i-2:i+1], closes[i-2:i+1]),
                    'stop_loss': self._calculate_three_white_soldiers_stop_loss(opens[i-2:i+1], highs[i-2:i+1], lows[i-2:i+1], closes[i-2:i+1])
                }
                patterns.append(pattern)
        
        return patterns
    
    def detect_three_black_crows(self, opens: np.ndarray, highs: np.ndarray, 
                                lows: np.ndarray, closes: np.ndarray) -> List[Dict]:
        """
        Three Black Crows pattern tespit et
        
        Three Black Crows:
        - Three consecutive long bearish candles
        - Each opens near previous candle's open
        - Each closes near its low
        """
        patterns = []
        
        for i in range(2, len(opens)):
            # Check three consecutive days
            days = [i-2, i-1, i]
            
            # Check if all three days are bearish
            all_bearish = all(closes[j] < opens[j] for j in days)
            if not all_bearish:
                continue
            
            # Check if each opens near previous candle's open
            opens_near_previous = True
            for j in range(1, len(days)):
                prev_open = opens[days[j-1]]
                curr_open = opens[days[j]]
                open_diff = abs(curr_open - prev_open) / prev_open
                
                if open_diff > 0.02:  # Should open within 2% of previous open
                    opens_near_previous = False
                    break
            
            if not opens_near_previous:
                continue
            
            # Check if each closes near its low
            closes_near_low = True
            for j in days:
                body_size = opens[j] - closes[j]
                low_distance = closes[j] - lows[j]
                
                if low_distance > body_size * 0.3:  # Should close within 30% of low
                    closes_near_low = False
                    break
            
            if closes_near_low:
                pattern = {
                    'pattern_type': 'Three Black Crows',
                    'days': {
                        'day1': {'index': i-2, 'open': opens[i-2], 'close': closes[i-2], 'high': highs[i-2], 'low': lows[i-2]},
                        'day2': {'index': i-1, 'open': opens[i-1], 'close': closes[i-1], 'high': highs[i-1], 'low': lows[i-1]},
                        'day3': {'index': i, 'open': opens[i], 'close': closes[i], 'high': highs[i], 'low': lows[i]}
                    },
                    'confidence': self._calculate_three_black_crows_confidence(opens[i-2:i+1], highs[i-2:i+1], lows[i-2:i+1], closes[i-2:i+1]),
                    'signal': 'SELL',
                    'target': self._calculate_three_black_crows_target(opens[i-2:i+1], highs[i-2:i+1], lows[i-2:i+1], closes[i-2:i+1]),
                    'stop_loss': self._calculate_three_black_crows_stop_loss(opens[i-2:i+1], highs[i-2:i+1], lows[i-2:i+1], closes[i-2:i+1])
                }
                patterns.append(pattern)
        
        return patterns
    
    def detect_harami_patterns(self, opens: np.ndarray, highs: np.ndarray, 
                              lows: np.ndarray, closes: np.ndarray) -> List[Dict]:
        """
        Harami pattern tespit et
        
        Harami:
        - Day 1: Long candle (parent)
        - Day 2: Small candle (child) completely within Day 1's body
        """
        patterns = []
        
        for i in range(1, len(opens)):
            # Day 1: Long candle
            day1_body = abs(closes[i-1] - opens[i-1])
            day1_high = max(opens[i-1], closes[i-1])
            day1_low = min(opens[i-1], closes[i-1])
            
            # Check if Day 1 is long enough
            if day1_body < self.min_body_size * opens[i-1]:
                continue
            
            # Day 2: Small candle
            day2_body = abs(closes[i] - opens[i])
            day2_high = max(opens[i], closes[i])
            day2_low = min(opens[i], closes[i])
            
            # Check if Day 2 is small enough
            if day2_body > day1_body * 0.5:  # Should be less than 50% of Day 1
                continue
            
            # Check if Day 2 is completely within Day 1's body
            if (day2_high <= day1_high and day2_low >= day1_low):
                # Determine pattern type
                if closes[i-1] > opens[i-1]:  # Day 1 bullish
                    if closes[i] > opens[i]:  # Day 2 also bullish
                        pattern_type = 'Bullish Harami'
                        signal = 'BUY'
                    else:  # Day 2 bearish
                        pattern_type = 'Bearish Harami'
                        signal = 'SELL'
                else:  # Day 1 bearish
                    if closes[i] < opens[i]:  # Day 2 also bearish
                        pattern_type = 'Bearish Harami'
                        signal = 'SELL'
                    else:  # Day 2 bullish
                        pattern_type = 'Bullish Harami'
                        signal = 'BUY'
                
                pattern = {
                    'pattern_type': pattern_type,
                    'days': {
                        'day1': {'index': i-1, 'open': opens[i-1], 'close': closes[i-1], 'high': highs[i-1], 'low': lows[i-1]},
                        'day2': {'index': i, 'open': opens[i], 'close': closes[i], 'high': highs[i], 'low': lows[i]}
                    },
                    'confidence': self._calculate_harami_confidence(opens[i-1:i+1], highs[i-1:i+1], lows[i-1:i+1], closes[i-1:i+1]),
                    'signal': signal,
                    'target': self._calculate_harami_target(opens[i-1], highs[i-1], lows[i-1], closes[i-1], opens[i], closes[i]),
                    'stop_loss': self._calculate_harami_stop_loss(opens[i-1], highs[i-1], lows[i-1], closes[i-1], opens[i], closes[i])
                }
                patterns.append(pattern)
        
        return patterns
    
    def _calculate_morning_star_confidence(self, opens: np.ndarray, highs: np.ndarray, 
                                         lows: np.ndarray, closes: np.ndarray) -> float:
        """Morning Star pattern güven skorunu hesapla (0-100)"""
        try:
            confidence = 100.0
            
            # Day 1 bearish strength
            day1_body = abs(closes[0] - opens[0])
            day1_range = highs[0] - lows[0]
            day1_strength = day1_body / day1_range if day1_range > 0 else 0
            
            if day1_strength > 0.7:
                confidence += 10
            elif day1_strength < 0.5:
                confidence -= 20
            
            # Day 2 gap size
            day2_gap = opens[0] - highs[1]
            day2_gap_ratio = day2_gap / day1_body if day1_body > 0 else 0
            
            if 0.1 <= day2_gap_ratio <= 0.3:
                confidence += 15
            else:
                confidence -= 15
            
            # Day 3 bullish strength
            day3_body = abs(closes[2] - opens[2])
            day3_range = highs[2] - lows[2]
            day3_strength = day3_body / day3_range if day3_range > 0 else 0
            
            if day3_strength > 0.7:
                confidence += 15
            elif day3_strength < 0.5:
                confidence -= 20
            
            # Day 3 close position relative to Day 1
            day1_midpoint = (highs[0] + lows[0]) / 2
            if closes[2] > day1_midpoint:
                confidence += 20
            else:
                confidence -= 30
            
            return max(0, min(100, confidence))
            
        except:
            return 0.0
    
    def _calculate_evening_star_confidence(self, opens: np.ndarray, highs: np.ndarray, 
                                         lows: np.ndarray, closes: np.ndarray) -> float:
        """Evening Star pattern güven skorunu hesapla (0-100)"""
        try:
            confidence = 100.0
            
            # Day 1 bullish strength
            day1_body = abs(closes[0] - opens[0])
            day1_range = highs[0] - lows[0]
            day1_strength = day1_body / day1_range if day1_range > 0 else 0
            
            if day1_strength > 0.7:
                confidence += 10
            elif day1_strength < 0.5:
                confidence -= 20
            
            # Day 2 gap size
            day2_gap = lows[1] - closes[0]
            day2_gap_ratio = day2_gap / day1_body if day1_body > 0 else 0
            
            if 0.1 <= day2_gap_ratio <= 0.3:
                confidence += 15
            else:
                confidence -= 15
            
            # Day 3 bearish strength
            day3_body = abs(closes[2] - opens[2])
            day3_range = highs[2] - lows[2]
            day3_strength = day3_body / day3_range if day3_range > 0 else 0
            
            if day3_strength > 0.7:
                confidence += 15
            elif day3_strength < 0.5:
                confidence -= 20
            
            # Day 3 close position relative to Day 1
            day1_midpoint = (highs[0] + lows[0]) / 2
            if closes[2] < day1_midpoint:
                confidence += 20
            else:
                confidence -= 30
            
            return max(0, min(100, confidence))
            
        except:
            return 0.0
    
    def _calculate_three_white_soldiers_confidence(self, opens: np.ndarray, highs: np.ndarray, 
                                                 lows: np.ndarray, closes: np.ndarray) -> float:
        """Three White Soldiers pattern güven skorunu hesapla (0-100)"""
        try:
            confidence = 100.0
            
            # Check body sizes
            for j in range(3):
                body_size = closes[j] - opens[j]
                range_size = highs[j] - lows[j]
                body_ratio = body_size / range_size if range_size > 0 else 0
                
                if body_ratio > 0.7:
                    confidence += 10
                elif body_ratio < 0.5:
                    confidence -= 15
            
            # Check gap consistency
            for j in range(1, 3):
                prev_close = closes[j-1]
                curr_open = opens[j]
                gap_ratio = abs(curr_open - prev_close) / prev_close
                
                if gap_ratio < 0.02:
                    confidence += 10
                else:
                    confidence -= 10
            
            # Check close positions
            for j in range(3):
                body_size = closes[j] - opens[j]
                high_distance = highs[j] - closes[j]
                close_ratio = high_distance / body_size if body_size > 0 else 1
                
                if close_ratio < 0.3:
                    confidence += 10
                else:
                    confidence -= 15
            
            return max(0, min(100, confidence))
            
        except:
            return 0.0
    
    def _calculate_three_black_crows_confidence(self, opens: np.ndarray, highs: np.ndarray, 
                                              lows: np.ndarray, closes: np.ndarray) -> float:
        """Three Black Crows pattern güven skorunu hesapla (0-100)"""
        try:
            confidence = 100.0
            
            # Check body sizes
            for j in range(3):
                body_size = opens[j] - closes[j]
                range_size = highs[j] - lows[j]
                body_ratio = body_size / range_size if range_size > 0 else 0
                
                if body_ratio > 0.7:
                    confidence += 10
                elif body_ratio < 0.5:
                    confidence -= 15
            
            # Check open consistency
            for j in range(1, 3):
                prev_open = opens[j-1]
                curr_open = opens[j]
                open_diff = abs(curr_open - prev_open) / prev_open
                
                if open_diff < 0.02:
                    confidence += 10
                else:
                    confidence -= 10
            
            # Check close positions
            for j in range(3):
                body_size = opens[j] - closes[j]
                low_distance = closes[j] - lows[j]
                close_ratio = low_distance / body_size if body_size > 0 else 1
                
                if close_ratio < 0.3:
                    confidence += 10
                else:
                    confidence -= 15
            
            return max(0, min(100, confidence))
            
        except:
            return 0.0
    
    def _calculate_harami_confidence(self, opens: np.ndarray, highs: np.ndarray, 
                                   lows: np.ndarray, closes: np.ndarray) -> float:
        """Harami pattern güven skorunu hesapla (0-100)"""
        try:
            confidence = 100.0
            
            # Day 1 body size
            day1_body = abs(closes[0] - opens[0])
            day1_range = highs[0] - lows[0]
            day1_ratio = day1_body / day1_range if day1_range > 0 else 0
            
            if day1_ratio > 0.7:
                confidence += 15
            elif day1_ratio < 0.5:
                confidence -= 20
            
            # Day 2 body size relative to Day 1
            day2_body = abs(closes[1] - opens[1])
            day2_ratio = day2_body / day1_body if day1_body > 0 else 1
            
            if day2_ratio < 0.3:
                confidence += 20
            elif day2_ratio > 0.5:
                confidence -= 25
            
            # Containment check
            day1_high = max(opens[0], closes[0])
            day1_low = min(opens[0], closes[0])
            day2_high = max(opens[1], closes[1])
            day2_low = min(opens[1], closes[1])
            
            if day2_high <= day1_high and day2_low >= day1_low:
                confidence += 25
            else:
                confidence -= 50
            
            return max(0, min(100, confidence))
            
        except:
            return 0.0
    
    def _calculate_morning_star_target(self, day1_open: float, day1_high: float, 
                                     day1_low: float, day3_close: float) -> float:
        """Morning Star pattern hedef fiyatını hesapla"""
        try:
            # Target is typically 161.8% of the pattern height
            pattern_height = day1_high - day1_low
            target = day3_close + (pattern_height * 1.618)
            return target
        except:
            return day3_close * 1.05  # 5% default target
    
    def _calculate_morning_star_stop_loss(self, day1_open: float, day1_high: float, 
                                        day1_low: float, day3_close: float) -> float:
        """Morning Star pattern stop loss seviyesini hesapla"""
        try:
            # Stop loss below Day 2 low
            stop_loss = day1_low * 0.98  # 2% below Day 1 low
            return stop_loss
        except:
            return day3_close * 0.98  # Default 2% below
    
    def _calculate_evening_star_target(self, day1_open: float, day1_high: float, 
                                     day1_low: float, day3_close: float) -> float:
        """Evening Star pattern hedef fiyatını hesapla"""
        try:
            # Target is typically 161.8% of the pattern height
            pattern_height = day1_high - day1_low
            target = day3_close - (pattern_height * 1.618)
            return target
        except:
            return day3_close * 0.95  # 5% default target
    
    def _calculate_evening_star_stop_loss(self, day1_open: float, day1_high: float, 
                                        day1_low: float, day3_close: float) -> float:
        """Evening Star pattern stop loss seviyesini hesapla"""
        try:
            # Stop loss above Day 2 high
            stop_loss = day1_high * 1.02  # 2% above Day 1 high
            return stop_loss
        except:
            return day3_close * 1.02  # Default 2% above
    
    def _calculate_three_white_soldiers_target(self, opens: np.ndarray, highs: np.ndarray, 
                                             lows: np.ndarray, closes: np.ndarray) -> float:
        """Three White Soldiers pattern hedef fiyatını hesapla"""
        try:
            # Target is typically 161.8% of the total move
            total_move = closes[2] - opens[0]
            target = closes[2] + (total_move * 1.618)
            return target
        except:
            return closes[2] * 1.05  # 5% default target
    
    def _calculate_three_white_soldiers_stop_loss(self, opens: np.ndarray, highs: np.ndarray, 
                                                lows: np.ndarray, closes: np.ndarray) -> float:
        """Three White Soldiers pattern stop loss seviyesini hesapla"""
        try:
            # Stop loss below the lowest low of the three days
            lowest_low = min(lows)
            stop_loss = lowest_low * 0.98  # 2% below lowest low
            return stop_loss
        except:
            return closes[2] * 0.98  # Default 2% below
    
    def _calculate_three_black_crows_target(self, opens: np.ndarray, highs: np.ndarray, 
                                          lows: np.ndarray, closes: np.ndarray) -> float:
        """Three Black Crows pattern hedef fiyatını hesapla"""
        try:
            # Target is typically 161.8% of the total move
            total_move = opens[0] - closes[2]
            target = closes[2] - (total_move * 1.618)
            return target
        except:
            return closes[2] * 0.95  # 5% default target
    
    def _calculate_three_black_crows_stop_loss(self, opens: np.ndarray, highs: np.ndarray, 
                                             lows: np.ndarray, closes: np.ndarray) -> float:
        """Three Black Crows pattern stop loss seviyesini hesapla"""
        try:
            # Stop loss above the highest high of the three days
            highest_high = max(highs)
            stop_loss = highest_high * 1.02  # 2% above highest high
            return stop_loss
        except:
            return closes[2] * 1.02  # Default 2% above
    
    def _calculate_harami_target(self, day1_open: float, day1_high: float, day1_low: float, 
                               day1_close: float, day2_open: float, day2_close: float) -> float:
        """Harami pattern hedef fiyatını hesapla"""
        try:
            # Target depends on pattern direction
            if day2_close > day2_open:  # Bullish harami
                pattern_height = day1_high - day1_low
                target = day2_close + (pattern_height * 0.618)
            else:  # Bearish harami
                pattern_height = day1_high - day1_low
                target = day2_close - (pattern_height * 0.618)
            return target
        except:
            return day2_close * 1.05  # 5% default target
    
    def _calculate_harami_stop_loss(self, day1_open: float, day1_high: float, day1_low: float, 
                                  day1_close: float, day2_open: float, day2_close: float) -> float:
        """Harami pattern stop loss seviyesini hesapla"""
        try:
            # Stop loss depends on pattern direction
            if day2_close > day2_open:  # Bullish harami
                stop_loss = day1_low * 0.98  # 2% below Day 1 low
            else:  # Bearish harami
                stop_loss = day1_high * 1.02  # 2% above Day 1 high
            return stop_loss
        except:
            return day2_close * 0.98  # Default 2% below
    
    def detect_all_advanced_candlestick_patterns(self, opens: np.ndarray, highs: np.ndarray, 
                                               lows: np.ndarray, closes: np.ndarray) -> Dict[str, List[Dict]]:
        """Tüm advanced candlestick pattern'leri tespit et"""
        patterns = {}
        
        # Morning Star patterns
        patterns['morning_star'] = self.detect_morning_star(opens, highs, lows, closes)
        
        # Evening Star patterns
        patterns['evening_star'] = self.detect_evening_star(opens, highs, lows, closes)
        
        # Three White Soldiers patterns
        patterns['three_white_soldiers'] = self.detect_three_white_soldiers(opens, highs, lows, closes)
        
        # Three Black Crows patterns
        patterns['three_black_crows'] = self.detect_three_black_crows(opens, highs, lows, closes)
        
        # Harami patterns
        patterns['harami'] = self.detect_harami_patterns(opens, highs, lows, closes)
        
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
                    'entry_price': pattern['days']['day3']['close'] if 'day3' in pattern['days'] else pattern['days']['day2']['close'],
                    'target': pattern['target'],
                    'stop_loss': pattern['stop_loss'],
                    'risk_reward_ratio': abs(pattern['target'] - pattern['days']['day3']['close'] if 'day3' in pattern['days'] else pattern['days']['day2']['close']) / 
                                       abs(pattern['stop_loss'] - pattern['days']['day3']['close'] if 'day3' in pattern['days'] else pattern['days']['day2']['close'])
                }
                signals.append(signal)
        
        # Sort by confidence
        signals.sort(key=lambda x: x['confidence'], reverse=True)
        return signals

# Test fonksiyonu
def test_advanced_candlestick_detector():
    """Advanced candlestick detector'ı test et"""
    print("🧪 Testing Advanced Candlestick Pattern Detector...")
    
    # Test data oluştur
    np.random.seed(42)
    n_samples = 200
    
    # Simulated OHLC data
    base_price = 100
    trend = np.cumsum(np.random.randn(n_samples) * 0.01)
    prices = base_price + trend
    
    # Generate OHLC data
    opens = prices + np.random.uniform(-1, 1, n_samples)
    highs = np.maximum(opens, prices) + np.random.uniform(0.5, 2.0, n_samples)
    lows = np.minimum(opens, prices) - np.random.uniform(0.5, 2.0, n_samples)
    closes = prices + np.random.uniform(-1, 1, n_samples)
    
    # Detector oluştur
    detector = AdvancedCandlestickDetector()
    
    # Pattern'leri tespit et
    patterns = detector.detect_all_advanced_candlestick_patterns(opens, highs, lows, closes)
    
    # Sonuçları göster
    print(f"📊 Detected Advanced Candlestick Patterns:")
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
        patterns, signals, score = test_advanced_candlestick_detector()
        print("✅ Advanced Candlestick Pattern Detector test completed!")
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
