#!/usr/bin/env python3
"""
Market Regime Detector - Volatilite, Trend, Risk Modları
BIST AI Smart Trader için piyasa rejimi algılama sistemi
"""

import asyncio
import json
import random
import math
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import logging
from dataclasses import dataclass
from enum import Enum

# Mock numpy for demonstration
class MockNumpy:
    @staticmethod
    def random(size):
        if isinstance(size, tuple):
            return [[random.random() for _ in range(size[1])] for _ in range(size[0])]
        return [random.random() for _ in range(size)]
    
    @staticmethod
    def array(data):
        return data
    
    @staticmethod
    def mean(data):
        return sum(data) / len(data) if data else 0
    
    @staticmethod
    def std(data):
        if not data:
            return 0
        mean_val = MockNumpy.mean(data)
        variance = sum((x - mean_val) ** 2 for x in data) / len(data)
        return math.sqrt(variance)
    
    @staticmethod
    def exp(x):
        return math.exp(x)
    
    @staticmethod
    def log(x):
        return math.log(x) if x > 0 else 0

try:
    import numpy as np
except ImportError:
    np = MockNumpy()
    print("⚠️ numpy not available, using mock implementation")

class MarketRegime(Enum):
    BULL_TRENDING = "Bull Trending"
    BEAR_TRENDING = "Bear Trending"
    SIDEWAYS = "Sideways"
    HIGH_VOLATILITY = "High Volatility"
    LOW_VOLATILITY = "Low Volatility"
    RISK_ON = "Risk On"
    RISK_OFF = "Risk Off"
    CRISIS = "Crisis"
    RECOVERY = "Recovery"

class VolatilityLevel(Enum):
    VERY_LOW = "Very Low"
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    VERY_HIGH = "Very High"

class TrendStrength(Enum):
    VERY_WEAK = "Very Weak"
    WEAK = "Weak"
    MODERATE = "Moderate"
    STRONG = "Strong"
    VERY_STRONG = "Very Strong"

@dataclass
class MarketIndicators:
    vix: float
    atr: float
    bollinger_width: float
    rsi: float
    macd: float
    adx: float
    volume_ratio: float
    price_momentum: float
    timestamp: str

@dataclass
class RegimeAnalysis:
    current_regime: MarketRegime
    confidence: float
    volatility_level: VolatilityLevel
    trend_strength: TrendStrength
    risk_mode: str  # "risk_on" or "risk_off"
    regime_probabilities: Dict[str, float]
    indicators: MarketIndicators
    regime_duration: int  # days
    transition_probability: float
    timestamp: str

@dataclass
class RegimeTransition:
    from_regime: MarketRegime
    to_regime: MarketRegime
    probability: float
    trigger_indicators: List[str]
    expected_duration: int
    timestamp: str

class MarketRegimeDetector:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.current_regime = MarketRegime.SIDEWAYS
        self.regime_history = []
        self.transition_matrix = self._initialize_transition_matrix()
        self.volatility_thresholds = {
            "very_low": 0.1,
            "low": 0.2,
            "medium": 0.3,
            "high": 0.5,
            "very_high": 0.8
        }
        self.trend_thresholds = {
            "very_weak": 0.1,
            "weak": 0.2,
            "moderate": 0.4,
            "strong": 0.6,
            "very_strong": 0.8
        }

    def _initialize_transition_matrix(self) -> Dict[MarketRegime, Dict[MarketRegime, float]]:
        """Initialize Markov transition matrix for regime changes"""
        regimes = list(MarketRegime)
        matrix = {}
        
        for from_regime in regimes:
            matrix[from_regime] = {}
            for to_regime in regimes:
                if from_regime == to_regime:
                    # High probability of staying in same regime
                    matrix[from_regime][to_regime] = random.uniform(0.7, 0.9)
                else:
                    # Lower probability of transition
                    matrix[from_regime][to_regime] = random.uniform(0.01, 0.1)
        
        # Normalize probabilities
        for from_regime in regimes:
            total = sum(matrix[from_regime].values())
            for to_regime in regimes:
                matrix[from_regime][to_regime] /= total
        
        return matrix

    async def calculate_market_indicators(self, symbol: str = "BIST100") -> MarketIndicators:
        """Calculate comprehensive market indicators"""
        self.logger.info(f"Calculating market indicators for {symbol}")
        
        try:
            # Mock market data
            indicators = MarketIndicators(
                vix=random.uniform(15, 35),  # Volatility Index
                atr=random.uniform(0.02, 0.08),  # Average True Range
                bollinger_width=random.uniform(0.1, 0.4),  # Bollinger Bands width
                rsi=random.uniform(30, 70),  # Relative Strength Index
                macd=random.uniform(-0.05, 0.05),  # MACD
                adx=random.uniform(20, 60),  # Average Directional Index
                volume_ratio=random.uniform(0.8, 1.5),  # Volume ratio to average
                price_momentum=random.uniform(-0.1, 0.1),  # Price momentum
                timestamp=datetime.now().isoformat()
            )
            
            return indicators
            
        except Exception as e:
            self.logger.error(f"Error calculating market indicators: {e}")
            return MarketIndicators(
                vix=20.0, atr=0.03, bollinger_width=0.2, rsi=50.0,
                macd=0.0, adx=30.0, volume_ratio=1.0, price_momentum=0.0,
                timestamp=datetime.now().isoformat()
            )

    async def detect_volatility_regime(self, indicators: MarketIndicators) -> VolatilityLevel:
        """Detect current volatility regime"""
        # Combine multiple volatility measures
        volatility_score = (
            indicators.vix / 30.0 +  # Normalize VIX
            indicators.atr * 10 +    # Scale ATR
            indicators.bollinger_width * 2  # Scale Bollinger width
        ) / 3
        
        if volatility_score < self.volatility_thresholds["very_low"]:
            return VolatilityLevel.VERY_LOW
        elif volatility_score < self.volatility_thresholds["low"]:
            return VolatilityLevel.LOW
        elif volatility_score < self.volatility_thresholds["medium"]:
            return VolatilityLevel.MEDIUM
        elif volatility_score < self.volatility_thresholds["high"]:
            return VolatilityLevel.HIGH
        else:
            return VolatilityLevel.VERY_HIGH

    async def detect_trend_strength(self, indicators: MarketIndicators) -> TrendStrength:
        """Detect current trend strength"""
        # Combine trend indicators
        trend_score = (
            abs(indicators.macd) * 20 +  # MACD strength
            indicators.adx / 50.0 +      # ADX normalized
            abs(indicators.price_momentum) * 10  # Price momentum
        ) / 3
        
        if trend_score < self.trend_thresholds["very_weak"]:
            return TrendStrength.VERY_WEAK
        elif trend_score < self.trend_thresholds["weak"]:
            return TrendStrength.WEAK
        elif trend_score < self.trend_thresholds["moderate"]:
            return TrendStrength.MODERATE
        elif trend_score < self.trend_thresholds["strong"]:
            return TrendStrength.STRONG
        else:
            return TrendStrength.VERY_STRONG

    async def detect_risk_mode(self, indicators: MarketIndicators) -> str:
        """Detect risk-on or risk-off mode"""
        # Risk indicators
        risk_score = (
            (indicators.vix - 20) / 20 +  # VIX above/below 20
            (indicators.rsi - 50) / 50 +  # RSI momentum
            indicators.price_momentum * 5  # Price momentum
        ) / 3
        
        return "risk_on" if risk_score > 0 else "risk_off"

    async def analyze_market_regime(self, symbol: str = "BIST100") -> RegimeAnalysis:
        """Comprehensive market regime analysis"""
        self.logger.info(f"Analyzing market regime for {symbol}")
        
        try:
            # Get market indicators
            indicators = await self.calculate_market_indicators(symbol)
            
            # Detect volatility and trend
            volatility_level = await self.detect_volatility_regime(indicators)
            trend_strength = await self.detect_trend_strength(indicators)
            risk_mode = await self.detect_risk_mode(indicators)
            
            # Determine primary regime
            current_regime = self._determine_primary_regime(
                volatility_level, trend_strength, risk_mode, indicators
            )
            
            # Calculate regime probabilities
            regime_probabilities = await self._calculate_regime_probabilities(indicators)
            
            # Calculate transition probability
            transition_probability = self._calculate_transition_probability(current_regime)
            
            # Calculate confidence
            confidence = self._calculate_confidence(regime_probabilities)
            
            analysis = RegimeAnalysis(
                current_regime=current_regime,
                confidence=confidence,
                volatility_level=volatility_level,
                trend_strength=trend_strength,
                risk_mode=risk_mode,
                regime_probabilities=regime_probabilities,
                indicators=indicators,
                regime_duration=random.randint(5, 30),  # Mock duration
                transition_probability=transition_probability,
                timestamp=datetime.now().isoformat()
            )
            
            # Update regime history
            self.regime_history.append(analysis)
            if len(self.regime_history) > 100:  # Keep last 100 analyses
                self.regime_history.pop(0)
            
            return analysis
            
        except Exception as e:
            self.logger.error(f"Error analyzing market regime: {e}")
            return self._create_error_analysis()

    def _determine_primary_regime(self, volatility_level: VolatilityLevel, 
                                trend_strength: TrendStrength, risk_mode: str,
                                indicators: MarketIndicators) -> MarketRegime:
        """Determine primary market regime based on indicators"""
        
        # High volatility scenarios
        if volatility_level in [VolatilityLevel.HIGH, VolatilityLevel.VERY_HIGH]:
            if indicators.vix > 30:
                return MarketRegime.CRISIS
            else:
                return MarketRegime.HIGH_VOLATILITY
        
        # Low volatility scenarios
        if volatility_level in [VolatilityLevel.VERY_LOW, VolatilityLevel.LOW]:
            return MarketRegime.LOW_VOLATILITY
        
        # Trend-based scenarios
        if trend_strength in [TrendStrength.STRONG, TrendStrength.VERY_STRONG]:
            if indicators.price_momentum > 0.02:
                return MarketRegime.BULL_TRENDING
            elif indicators.price_momentum < -0.02:
                return MarketRegime.BEAR_TRENDING
        
        # Risk-based scenarios
        if risk_mode == "risk_on":
            return MarketRegime.RISK_ON
        elif risk_mode == "risk_off":
            return MarketRegime.RISK_OFF
        
        # Default to sideways
        return MarketRegime.SIDEWAYS

    async def _calculate_regime_probabilities(self, indicators: MarketIndicators) -> Dict[str, float]:
        """Calculate probabilities for each regime"""
        probabilities = {}
        
        # Mock probability calculation based on indicators
        base_prob = 1.0 / len(MarketRegime)
        
        for regime in MarketRegime:
            # Adjust probability based on indicators
            prob = base_prob
            
            if regime == MarketRegime.HIGH_VOLATILITY and indicators.vix > 25:
                prob *= 2.0
            elif regime == MarketRegime.BULL_TRENDING and indicators.macd > 0.01:
                prob *= 1.5
            elif regime == MarketRegime.BEAR_TRENDING and indicators.macd < -0.01:
                prob *= 1.5
            elif regime == MarketRegime.RISK_OFF and indicators.vix > 25:
                prob *= 1.3
            
            probabilities[regime.value] = round(prob, 4)
        
        # Normalize probabilities
        total = sum(probabilities.values())
        for regime in probabilities:
            probabilities[regime] = round(probabilities[regime] / total, 4)
        
        return probabilities

    def _calculate_transition_probability(self, current_regime: MarketRegime) -> float:
        """Calculate probability of regime transition"""
        if not self.regime_history:
            return 0.1
        
        # Count recent regime changes
        recent_analyses = self.regime_history[-10:]  # Last 10 analyses
        regime_changes = 0
        
        for i in range(1, len(recent_analyses)):
            if recent_analyses[i].current_regime != recent_analyses[i-1].current_regime:
                regime_changes += 1
        
        transition_rate = regime_changes / len(recent_analyses) if recent_analyses else 0
        return round(transition_rate, 4)

    def _calculate_confidence(self, regime_probabilities: Dict[str, float]) -> float:
        """Calculate confidence in regime detection"""
        if not regime_probabilities:
            return 0.0
        
        max_prob = max(regime_probabilities.values())
        # Higher confidence when one regime has much higher probability
        confidence = min(0.95, max_prob * 1.2)
        return round(confidence, 4)

    def _create_error_analysis(self) -> RegimeAnalysis:
        """Create error analysis when detection fails"""
        return RegimeAnalysis(
            current_regime=MarketRegime.SIDEWAYS,
            confidence=0.0,
            volatility_level=VolatilityLevel.MEDIUM,
            trend_strength=TrendStrength.MODERATE,
            risk_mode="risk_off",
            regime_probabilities={},
            indicators=MarketIndicators(
                vix=20.0, atr=0.03, bollinger_width=0.2, rsi=50.0,
                macd=0.0, adx=30.0, volume_ratio=1.0, price_momentum=0.0,
                timestamp=datetime.now().isoformat()
            ),
            regime_duration=0,
            transition_probability=0.0,
            timestamp=datetime.now().isoformat()
        )

    async def predict_regime_transitions(self, current_analysis: RegimeAnalysis) -> List[RegimeTransition]:
        """Predict likely regime transitions"""
        self.logger.info("Predicting regime transitions")
        
        transitions = []
        current_regime = current_analysis.current_regime
        
        # Get transition probabilities from matrix
        if current_regime in self.transition_matrix:
            for target_regime, probability in self.transition_matrix[current_regime].items():
                if target_regime != current_regime and probability > 0.05:  # Only significant transitions
                    transitions.append(RegimeTransition(
                        from_regime=current_regime,
                        to_regime=target_regime,
                        probability=round(probability, 4),
                        trigger_indicators=self._get_trigger_indicators(target_regime),
                        expected_duration=random.randint(5, 20),
                        timestamp=datetime.now().isoformat()
                    ))
        
        # Sort by probability
        transitions.sort(key=lambda x: x.probability, reverse=True)
        return transitions[:5]  # Return top 5 most likely transitions

    def _get_trigger_indicators(self, target_regime: MarketRegime) -> List[str]:
        """Get indicators that could trigger a specific regime"""
        triggers = {
            MarketRegime.BULL_TRENDING: ["MACD > 0", "RSI > 50", "Price momentum > 0"],
            MarketRegime.BEAR_TRENDING: ["MACD < 0", "RSI < 50", "Price momentum < 0"],
            MarketRegime.HIGH_VOLATILITY: ["VIX > 25", "ATR > 0.05", "Bollinger width > 0.3"],
            MarketRegime.LOW_VOLATILITY: ["VIX < 15", "ATR < 0.02", "Bollinger width < 0.15"],
            MarketRegime.RISK_ON: ["VIX < 20", "RSI > 60", "Positive momentum"],
            MarketRegime.RISK_OFF: ["VIX > 25", "RSI < 40", "Negative momentum"],
            MarketRegime.CRISIS: ["VIX > 35", "High ATR", "Strong negative momentum"],
            MarketRegime.RECOVERY: ["VIX decreasing", "Positive momentum", "RSI recovering"]
        }
        
        return triggers.get(target_regime, ["General market conditions"])

    async def get_regime_history(self, days: int = 30) -> List[RegimeAnalysis]:
        """Get regime history for specified days"""
        if not self.regime_history:
            return []
        
        # Return recent analyses
        return self.regime_history[-days:] if days <= len(self.regime_history) else self.regime_history

    async def get_regime_statistics(self) -> Dict[str, Any]:
        """Get comprehensive regime statistics"""
        if not self.regime_history:
            return {"error": "No regime history available"}
        
        # Calculate statistics
        regime_counts = {}
        total_duration = 0
        volatility_levels = {}
        trend_strengths = {}
        
        for analysis in self.regime_history:
            # Count regimes
            regime_name = analysis.current_regime.value
            regime_counts[regime_name] = regime_counts.get(regime_name, 0) + 1
            
            # Count volatility levels
            vol_name = analysis.volatility_level.value
            volatility_levels[vol_name] = volatility_levels.get(vol_name, 0) + 1
            
            # Count trend strengths
            trend_name = analysis.trend_strength.value
            trend_strengths[trend_name] = trend_strengths.get(trend_name, 0) + 1
            
            total_duration += analysis.regime_duration
        
        return {
            "total_analyses": len(self.regime_history),
            "regime_distribution": regime_counts,
            "volatility_distribution": volatility_levels,
            "trend_strength_distribution": trend_strengths,
            "average_regime_duration": round(total_duration / len(self.regime_history), 2),
            "current_regime": self.regime_history[-1].current_regime.value if self.regime_history else "Unknown",
            "last_update": datetime.now().isoformat()
        }

# Global instance
market_regime_detector = MarketRegimeDetector()
