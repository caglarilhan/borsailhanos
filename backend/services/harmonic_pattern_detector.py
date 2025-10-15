#!/usr/bin/env python3
"""
🎯 Harmonic Pattern Detector
Gartley, Butterfly, Bat, Crab, Shark pattern detection
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import logging
from dataclasses import dataclass
from enum import Enum

class PatternType(Enum):
    GARTLEY = "Gartley"
    BUTTERFLY = "Butterfly"
    BAT = "Bat"
    CRAB = "Crab"
    SHARK = "Shark"
    CYPHER = "Cypher"
    AB_CD = "AB=CD"

class PatternDirection(Enum):
    BULLISH = "Bullish"
    BEARISH = "Bearish"

@dataclass
class HarmonicPattern:
    pattern_type: PatternType
    direction: PatternDirection
    confidence: float
    points: Dict[str, Tuple[float, float]]  # X, Y coordinates
    fibonacci_ratios: Dict[str, float]
    risk_reward_ratio: float
    target_price: float
    stop_loss: float
    completion_percentage: float
    timestamp: str

class HarmonicPatternDetector:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Fibonacci ratios for different patterns
        self.pattern_ratios = {
            PatternType.GARTLEY: {
                'AB': 0.618,  # 61.8%
                'BC': 0.382,  # 38.2% or 88.6%
                'CD': 0.786,  # 78.6%
                'AD': 0.618   # 61.8%
            },
            PatternType.BUTTERFLY: {
                'AB': 0.786,  # 78.6%
                'BC': 0.382,  # 38.2% or 88.6%
                'CD': 1.618,  # 161.8% or 224%
                'AD': 1.272   # 127.2%
            },
            PatternType.BAT: {
                'AB': 0.382,  # 38.2% or 50%
                'BC': 0.382,  # 38.2% or 88.6%
                'CD': 1.618,  # 161.8% or 261.8%
                'AD': 0.886   # 88.6%
            },
            PatternType.CRAB: {
                'AB': 0.382,  # 38.2% or 50%
                'BC': 0.382,  # 38.2% or 88.6%
                'CD': 2.618,  # 261.8% or 361.8%
                'AD': 1.618   # 161.8%
            },
            PatternType.SHARK: {
                'AB': 0.382,  # 38.2% or 50%
                'BC': 0.382,  # 38.2% or 88.6%
                'CD': 1.618,  # 161.8% or 261.8%
                'AD': 0.886   # 88.6%
            }
        }
        
        # Tolerance for ratio matching
        self.ratio_tolerance = 0.1

    def detect_patterns(self, price_data: pd.DataFrame) -> List[HarmonicPattern]:
        """Detect all harmonic patterns in price data"""
        patterns = []
        
        # Find swing points (highs and lows)
        swing_points = self._find_swing_points(price_data)
        
        if len(swing_points) < 4:
            return patterns
        
        # Check for each pattern type
        for pattern_type in PatternType:
            detected_patterns = self._detect_specific_pattern(swing_points, pattern_type)
            patterns.extend(detected_patterns)
        
        # Sort by confidence
        patterns.sort(key=lambda x: x.confidence, reverse=True)
        
        return patterns

    def _find_swing_points(self, price_data: pd.DataFrame, lookback: int = 5) -> List[Tuple[float, float]]:
        """Find swing highs and lows in price data"""
        swing_points = []
        highs = price_data['High'].values
        lows = price_data['Low'].values
        
        for i in range(lookback, len(price_data) - lookback):
            # Check for swing high
            is_swing_high = True
            for j in range(i - lookback, i + lookback + 1):
                if j != i and highs[j] >= highs[i]:
                    is_swing_high = False
                    break
            
            if is_swing_high:
                swing_points.append((i, highs[i]))
            
            # Check for swing low
            is_swing_low = True
            for j in range(i - lookback, i + lookback + 1):
                if j != i and lows[j] <= lows[i]:
                    is_swing_low = False
                    break
            
            if is_swing_low:
                swing_points.append((i, lows[i]))
        
        # Sort by time
        swing_points.sort(key=lambda x: x[0])
        
        return swing_points

    def _detect_specific_pattern(self, swing_points: List[Tuple[float, float]], pattern_type: PatternType) -> List[HarmonicPattern]:
        """Detect specific harmonic pattern"""
        patterns = []
        
        if len(swing_points) < 4:
            return patterns
        
        # Try all possible 4-point combinations
        for i in range(len(swing_points) - 3):
            for j in range(i + 1, len(swing_points) - 2):
                for k in range(j + 1, len(swing_points) - 1):
                    for l in range(k + 1, len(swing_points)):
                        points = {
                            'X': swing_points[i],
                            'A': swing_points[j],
                            'B': swing_points[k],
                            'C': swing_points[l]
                        }
                        
                        # Check if this forms the pattern
                        pattern = self._validate_pattern(points, pattern_type)
                        if pattern:
                            patterns.append(pattern)
        
        return patterns

    def _validate_pattern(self, points: Dict[str, Tuple[float, float]], pattern_type: PatternType) -> Optional[HarmonicPattern]:
        """Validate if points form a specific harmonic pattern"""
        X, A, B, C = points['X'], points['A'], points['B'], points['C']
        
        # Calculate price movements
        AB = abs(A[1] - B[1])
        BC = abs(B[1] - C[1])
        XA = abs(X[1] - A[1])
        
        # Calculate ratios
        AB_ratio = AB / XA if XA != 0 else 0
        BC_ratio = BC / AB if AB != 0 else 0
        
        # Get expected ratios for this pattern
        expected_ratios = self.pattern_ratios[pattern_type]
        
        # Check if ratios match (within tolerance)
        AB_match = abs(AB_ratio - expected_ratios['AB']) <= self.ratio_tolerance
        BC_match = abs(BC_ratio - expected_ratios['BC']) <= self.ratio_tolerance
        
        if not (AB_match and BC_match):
            return None
        
        # Determine direction
        direction = self._determine_direction(points)
        
        # Calculate confidence based on ratio accuracy
        AB_accuracy = 1 - abs(AB_ratio - expected_ratios['AB']) / expected_ratios['AB']
        BC_accuracy = 1 - abs(BC_ratio - expected_ratios['BC']) / expected_ratios['BC']
        confidence = (AB_accuracy + BC_accuracy) / 2
        
        # Calculate D point (completion point)
        D_point = self._calculate_D_point(points, pattern_type, direction)
        
        # Calculate risk/reward
        risk_reward = self._calculate_risk_reward(points, D_point, direction)
        
        # Calculate completion percentage
        completion = self._calculate_completion(points, D_point)
        
        return HarmonicPattern(
            pattern_type=pattern_type,
            direction=direction,
            confidence=confidence,
            points=points,
            fibonacci_ratios={
                'AB': AB_ratio,
                'BC': BC_ratio,
                'CD': 0.0,  # Will be calculated when D is reached
                'AD': 0.0   # Will be calculated when D is reached
            },
            risk_reward_ratio=risk_reward,
            target_price=D_point[1],
            stop_loss=self._calculate_stop_loss(points, direction),
            completion_percentage=completion,
            timestamp=datetime.now().isoformat()
        )

    def _determine_direction(self, points: Dict[str, Tuple[float, float]]) -> PatternDirection:
        """Determine if pattern is bullish or bearish"""
        X, A, B, C = points['X'], points['A'], points['B'], points['C']
        
        # Simple direction logic based on price movement
        if A[1] > X[1] and B[1] < A[1] and C[1] > B[1]:
            return PatternDirection.BULLISH
        elif A[1] < X[1] and B[1] > A[1] and C[1] < B[1]:
            return PatternDirection.BEARISH
        else:
            # Default based on overall trend
            return PatternDirection.BULLISH if C[1] > X[1] else PatternDirection.BEARISH

    def _calculate_D_point(self, points: Dict[str, Tuple[float, float]], pattern_type: PatternType, direction: PatternDirection) -> Tuple[float, float]:
        """Calculate the D point (completion point) of the pattern"""
        X, A, B, C = points['X'], points['A'], points['B'], points['C']
        
        # Get expected CD ratio
        expected_ratios = self.pattern_ratios[pattern_type]
        CD_ratio = expected_ratios['CD']
        
        # Calculate D point
        BC = abs(B[1] - C[1])
        D_price = C[1] + (BC * CD_ratio) if direction == PatternDirection.BULLISH else C[1] - (BC * CD_ratio)
        
        # Estimate D time (simplified)
        time_span = C[0] - B[0]
        D_time = C[0] + time_span
        
        return (D_time, D_price)

    def _calculate_risk_reward(self, points: Dict[str, Tuple[float, float]], D_point: Tuple[float, float], direction: PatternDirection) -> float:
        """Calculate risk/reward ratio"""
        C = points['C']
        D_price = D_point[1]
        
        # Potential profit
        if direction == PatternDirection.BULLISH:
            profit = D_price - C[1]
        else:
            profit = C[1] - D_price
        
        # Risk (stop loss)
        risk = abs(C[1] - points['B'][1]) * 0.5  # Simplified risk calculation
        
        return profit / risk if risk > 0 else 0

    def _calculate_stop_loss(self, points: Dict[str, Tuple[float, float]], direction: PatternDirection) -> float:
        """Calculate stop loss level"""
        C = points['C']
        B = points['B']
        
        if direction == PatternDirection.BULLISH:
            return B[1] - (abs(C[1] - B[1]) * 0.1)  # 10% below B
        else:
            return B[1] + (abs(C[1] - B[1]) * 0.1)  # 10% above B

    def _calculate_completion(self, points: Dict[str, Tuple[float, float]], D_point: Tuple[float, float]) -> float:
        """Calculate pattern completion percentage"""
        # Simplified completion calculation
        # In real implementation, this would track current price vs D point
        return np.random.uniform(0.3, 0.9)  # Mock completion

    async def analyze_symbol(self, symbol: str, timeframe: str = '1d') -> List[HarmonicPattern]:
        """Analyze a symbol for harmonic patterns"""
        try:
            # Generate mock price data
            price_data = self._generate_mock_data(symbol, timeframe)
            
            # Detect patterns
            patterns = self.detect_patterns(price_data)
            
            # Filter high-confidence patterns
            high_confidence_patterns = [p for p in patterns if p.confidence > 0.7]
            
            return high_confidence_patterns
            
        except Exception as e:
            self.logger.error(f"Error analyzing {symbol}: {e}")
            return []

    def _generate_mock_data(self, symbol: str, timeframe: str) -> pd.DataFrame:
        """Generate mock price data for demonstration"""
        dates = pd.date_range(start='2024-01-01', end='2024-12-31', freq='D')
        
        # Generate realistic price data with some patterns
        base_price = np.random.uniform(50, 200)
        prices = []
        
        for i, date in enumerate(dates):
            # Add some trend and noise
            trend = np.sin(i / 50) * 10
            noise = np.random.normal(0, 2)
            price = base_price + trend + noise
            
            # Add high/low
            high = price + np.random.uniform(0, 5)
            low = price - np.random.uniform(0, 5)
            
            prices.append({
                'Date': date,
                'Open': price,
                'High': high,
                'Low': low,
                'Close': price + np.random.uniform(-2, 2),
                'Volume': np.random.randint(1000000, 10000000)
            })
        
        return pd.DataFrame(prices)

    async def get_pattern_signals(self, symbols: List[str], timeframe: str = '1d') -> Dict[str, List[HarmonicPattern]]:
        """Get harmonic pattern signals for multiple symbols"""
        signals = {}
        
        for symbol in symbols:
            patterns = await self.analyze_symbol(symbol, timeframe)
            if patterns:
                signals[symbol] = patterns
        
        return signals

# Global instance
harmonic_detector = HarmonicPatternDetector()
