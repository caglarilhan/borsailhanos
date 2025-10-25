"""
🚀 BIST AI Smart Trader - Strategy Selector
==========================================

O anki piyasa koşullarına göre en iyi stratejiyi seçen sistem.
Adaptif karar verme ile dinamik strateji seçimi.

Özellikler:
- Market regime detection
- Strategy selection logic
- Performance-based switching
- Risk-adjusted selection
- Dynamic rebalancing
"""

import asyncio
import json
import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
from enum import Enum

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MarketRegime(Enum):
    """Piyasa rejimi"""
    BULL_MARKET = "bull_market"
    BEAR_MARKET = "bear_market"
    SIDEWAYS = "sideways"
    HIGH_VOLATILITY = "high_volatility"
    LOW_VOLATILITY = "low_volatility"
    TRENDING = "trending"
    MEAN_REVERTING = "mean_reverting"

@dataclass
class MarketCondition:
    """Piyasa koşulu"""
    timestamp: datetime
    regime: MarketRegime
    volatility: float
    trend_strength: float
    momentum: float
    volume_profile: str  # 'high', 'normal', 'low'
    market_sentiment: float  # -1 to 1
    confidence: float
    
    def to_dict(self):
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        data['regime'] = self.regime.value
        return data

@dataclass
class StrategySelection:
    """Strateji seçimi"""
    timestamp: datetime
    selected_strategy: str
    confidence: float
    market_condition: MarketCondition
    selection_reason: str
    expected_performance: float
    risk_level: str
    
    def to_dict(self):
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        data['market_condition'] = self.market_condition.to_dict()
        return data

class StrategySelector:
    """Strategy Selector"""
    
    def __init__(self, data_dir: str = "backend/ai/data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Strategy performance history
        self.strategy_performance_history = []
        self.market_condition_history = []
        self.strategy_selections = []
        
        # Strategy-regime mapping
        self.strategy_regime_mapping = {
            MarketRegime.BULL_MARKET: ['momentum', 'trend_following'],
            MarketRegime.BEAR_MARKET: ['mean_reversion', 'volatility'],
            MarketRegime.SIDEWAYS: ['mean_reversion', 'volatility'],
            MarketRegime.HIGH_VOLATILITY: ['volatility', 'mean_reversion'],
            MarketRegime.LOW_VOLATILITY: ['momentum', 'trend_following'],
            MarketRegime.TRENDING: ['momentum', 'trend_following', 'breakout'],
            MarketRegime.MEAN_REVERTING: ['mean_reversion', 'volatility']
        }
        
        # Performance thresholds
        self.performance_thresholds = {
            'min_performance': 0.05,  # 5% minimum return
            'max_drawdown': 0.15,     # 15% maximum drawdown
            'min_sharpe': 0.5,        # Minimum Sharpe ratio
            'min_win_rate': 0.4       # 40% minimum win rate
        }
        
        logger.info("✅ Strategy Selector initialized")
    
    def detect_market_regime(self, data: pd.DataFrame) -> MarketCondition:
        """Piyasa rejimini tespit et"""
        try:
            # Son 20 günlük veri
            recent_data = data.tail(20)
            
            # Volatilite hesapla
            returns = recent_data['close'].pct_change().dropna()
            volatility = returns.std() * np.sqrt(252)  # Annualized
            
            # Trend gücü
            sma_20 = recent_data['close'].rolling(20).mean().iloc[-1]
            sma_50 = recent_data['close'].rolling(50).mean().iloc[-1] if len(data) >= 50 else sma_20
            trend_strength = (sma_20 - sma_50) / sma_50
            
            # Momentum
            momentum = (recent_data['close'].iloc[-1] - recent_data['close'].iloc[0]) / recent_data['close'].iloc[0]
            
            # Volume profile
            avg_volume = recent_data['volume'].mean()
            recent_volume = recent_data['volume'].iloc[-1]
            volume_ratio = recent_volume / avg_volume
            
            if volume_ratio > 1.5:
                volume_profile = 'high'
            elif volume_ratio < 0.7:
                volume_profile = 'low'
            else:
                volume_profile = 'normal'
            
            # Market sentiment (basit hesaplama)
            positive_days = (returns > 0).sum()
            total_days = len(returns)
            market_sentiment = (positive_days / total_days) * 2 - 1  # -1 to 1
            
            # Regime belirleme
            if volatility > 0.3:
                regime = MarketRegime.HIGH_VOLATILITY
            elif volatility < 0.15:
                regime = MarketRegime.LOW_VOLATILITY
            elif abs(trend_strength) > 0.05:
                regime = MarketRegime.TRENDING
            elif abs(momentum) < 0.02:
                regime = MarketRegime.SIDEWAYS
            elif trend_strength > 0.02:
                regime = MarketRegime.BULL_MARKET
            elif trend_strength < -0.02:
                regime = MarketRegime.BEAR_MARKET
            else:
                regime = MarketRegime.MEAN_REVERTING
            
            # Confidence hesapla
            confidence = min(abs(trend_strength) * 10 + abs(momentum) * 10, 1.0)
            
            market_condition = MarketCondition(
                timestamp=datetime.now(),
                regime=regime,
                volatility=volatility,
                trend_strength=trend_strength,
                momentum=momentum,
                volume_profile=volume_profile,
                market_sentiment=market_sentiment,
                confidence=confidence
            )
            
            self.market_condition_history.append(market_condition)
            
            logger.info(f"📊 Market regime detected: {regime.value} (confidence: {confidence:.2f})")
            
            return market_condition
            
        except Exception as e:
            logger.error(f"❌ Detect market regime error: {e}")
            return MarketCondition(
                timestamp=datetime.now(),
                regime=MarketRegime.SIDEWAYS,
                volatility=0.2,
                trend_strength=0.0,
                momentum=0.0,
                volume_profile='normal',
                market_sentiment=0.0,
                confidence=0.5
            )
    
    def select_strategy(self, 
                       market_condition: MarketCondition,
                       available_strategies: List[str],
                       strategy_performances: Dict[str, Any]) -> StrategySelection:
        """Strateji seç"""
        try:
            # Regime'e uygun stratejiler
            suitable_strategies = self.strategy_regime_mapping.get(
                market_condition.regime, 
                available_strategies
            )
            
            # Mevcut stratejilerle kesişim
            available_suitable = [s for s in suitable_strategies if s in available_strategies]
            
            if not available_suitable:
                available_suitable = available_strategies
            
            # Performans bazlı seçim
            best_strategy = None
            best_score = -np.inf
            selection_reason = ""
            
            for strategy in available_suitable:
                if strategy not in strategy_performances:
                    continue
                
                perf = strategy_performances[strategy]
                
                # Performans skoru hesapla
                score = self._calculate_strategy_score(perf, market_condition)
                
                if score > best_score:
                    best_score = score
                    best_strategy = strategy
                    selection_reason = f"Best performance for {market_condition.regime.value} regime"
            
            # Fallback
            if not best_strategy:
                best_strategy = available_strategies[0]
                selection_reason = "Fallback to first available strategy"
                best_score = 0.0
            
            # Risk seviyesi belirleme
            risk_level = self._determine_risk_level(market_condition, best_strategy)
            
            # Beklenen performans
            expected_performance = self._estimate_expected_performance(best_strategy, market_condition)
            
            # Strateji seçimi
            selection = StrategySelection(
                timestamp=datetime.now(),
                selected_strategy=best_strategy,
                confidence=min(best_score, 1.0),
                market_condition=market_condition,
                selection_reason=selection_reason,
                expected_performance=expected_performance,
                risk_level=risk_level
            )
            
            self.strategy_selections.append(selection)
            
            logger.info(f"🎯 Strategy selected: {best_strategy} (confidence: {selection.confidence:.2f})")
            
            return selection
            
        except Exception as e:
            logger.error(f"❌ Select strategy error: {e}")
            return StrategySelection(
                timestamp=datetime.now(),
                selected_strategy=available_strategies[0] if available_strategies else "momentum",
                confidence=0.5,
                market_condition=market_condition,
                selection_reason="Error fallback",
                expected_performance=0.0,
                risk_level="medium"
            )
    
    def _calculate_strategy_score(self, performance: Any, market_condition: MarketCondition) -> float:
        """Strateji skoru hesapla"""
        try:
            # Performance metrics
            total_return = getattr(performance, 'total_return', 0.0)
            sharpe_ratio = getattr(performance, 'sharpe_ratio', 0.0)
            max_drawdown = getattr(performance, 'max_drawdown', 0.0)
            win_rate = getattr(performance, 'win_rate', 0.0)
            
            # Base score
            score = 0.0
            
            # Return component
            score += total_return * 0.3
            
            # Risk-adjusted return
            score += sharpe_ratio * 0.2
            
            # Drawdown penalty
            score -= abs(max_drawdown) * 0.2
            
            # Win rate
            score += win_rate * 0.2
            
            # Market condition adjustment
            if market_condition.regime == MarketRegime.HIGH_VOLATILITY:
                # Volatility strategies get bonus
                if 'volatility' in performance.__class__.__name__.lower():
                    score += 0.1
            
            elif market_condition.regime == MarketRegime.TRENDING:
                # Momentum strategies get bonus
                if 'momentum' in performance.__class__.__name__.lower():
                    score += 0.1
            
            elif market_condition.regime == MarketRegime.SIDEWAYS:
                # Mean reversion strategies get bonus
                if 'mean_reversion' in performance.__class__.__name__.lower():
                    score += 0.1
            
            return score
            
        except Exception as e:
            logger.error(f"❌ Calculate strategy score error: {e}")
            return 0.0
    
    def _determine_risk_level(self, market_condition: MarketCondition, strategy: str) -> str:
        """Risk seviyesi belirle"""
        try:
            # Volatilite bazlı risk
            if market_condition.volatility > 0.3:
                base_risk = "high"
            elif market_condition.volatility < 0.15:
                base_risk = "low"
            else:
                base_risk = "medium"
            
            # Strateji bazlı risk
            if strategy in ['momentum', 'breakout']:
                strategy_risk = "high"
            elif strategy in ['mean_reversion', 'volatility']:
                strategy_risk = "medium"
            else:
                strategy_risk = "low"
            
            # Kombine risk
            if base_risk == "high" or strategy_risk == "high":
                return "high"
            elif base_risk == "low" and strategy_risk == "low":
                return "low"
            else:
                return "medium"
                
        except Exception as e:
            logger.error(f"❌ Determine risk level error: {e}")
            return "medium"
    
    def _estimate_expected_performance(self, strategy: str, market_condition: MarketCondition) -> float:
        """Beklenen performansı tahmin et"""
        try:
            # Base performance estimates
            base_performances = {
                'momentum': 0.12,
                'mean_reversion': 0.08,
                'breakout': 0.15,
                'trend_following': 0.10,
                'volatility': 0.06
            }
            
            base_perf = base_performances.get(strategy, 0.08)
            
            # Market condition adjustment
            if market_condition.regime == MarketRegime.BULL_MARKET:
                multiplier = 1.2
            elif market_condition.regime == MarketRegime.BEAR_MARKET:
                multiplier = 0.8
            elif market_condition.regime == MarketRegime.HIGH_VOLATILITY:
                multiplier = 1.1
            else:
                multiplier = 1.0
            
            expected_perf = base_perf * multiplier
            
            return expected_perf
            
        except Exception as e:
            logger.error(f"❌ Estimate expected performance error: {e}")
            return 0.08
    
    def get_strategy_recommendation(self, 
                                   data: pd.DataFrame,
                                   available_strategies: List[str],
                                   strategy_performances: Dict[str, Any]) -> StrategySelection:
        """Strateji önerisi getir"""
        try:
            # Market regime tespit et
            market_condition = self.detect_market_regime(data)
            
            # Strateji seç
            selection = self.select_strategy(market_condition, available_strategies, strategy_performances)
            
            return selection
            
        except Exception as e:
            logger.error(f"❌ Get strategy recommendation error: {e}")
            return None
    
    def get_selection_history(self, days: int = 30) -> List[StrategySelection]:
        """Seçim geçmişini getir"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days)
            
            recent_selections = [
                s for s in self.strategy_selections 
                if s.timestamp >= cutoff_date
            ]
            
            return recent_selections
            
        except Exception as e:
            logger.error(f"❌ Get selection history error: {e}")
            return []
    
    def get_statistics(self) -> Dict[str, Any]:
        """İstatistikleri getir"""
        try:
            stats = {
                'total_selections': len(self.strategy_selections),
                'total_market_conditions': len(self.market_condition_history),
                'strategy_frequency': {},
                'regime_frequency': {},
                'average_confidence': 0.0,
                'average_expected_performance': 0.0
            }
            
            if self.strategy_selections:
                # Strategy frequency
                strategy_counts = {}
                for selection in self.strategy_selections:
                    strategy_counts[selection.selected_strategy] = strategy_counts.get(selection.selected_strategy, 0) + 1
                stats['strategy_frequency'] = strategy_counts
                
                # Regime frequency
                regime_counts = {}
                for condition in self.market_condition_history:
                    regime_counts[condition.regime.value] = regime_counts.get(condition.regime.value, 0) + 1
                stats['regime_frequency'] = regime_counts
                
                # Averages
                stats['average_confidence'] = np.mean([s.confidence for s in self.strategy_selections])
                stats['average_expected_performance'] = np.mean([s.expected_performance for s in self.strategy_selections])
            
            return stats
            
        except Exception as e:
            logger.error(f"❌ Get statistics error: {e}")
            return {}

# Global instance
strategy_selector = StrategySelector()

if __name__ == "__main__":
    async def test_strategy_selector():
        """Test fonksiyonu"""
        logger.info("🧪 Testing Strategy Selector...")
        
        # Test verisi
        dates = pd.date_range(start='2023-01-01', end='2023-12-31', freq='D')
        test_data = pd.DataFrame({
            'date': dates,
            'open': np.random.randn(len(dates)).cumsum() + 100,
            'high': np.random.randn(len(dates)).cumsum() + 105,
            'low': np.random.randn(len(dates)).cumsum() + 95,
            'close': np.random.randn(len(dates)).cumsum() + 100,
            'volume': np.random.randint(1000, 10000, len(dates))
        })
        
        # Test strateji performansları
        test_performances = {
            'momentum': type('Performance', (), {'total_return': 0.15, 'sharpe_ratio': 1.2, 'max_drawdown': -0.08, 'win_rate': 0.6})(),
            'mean_reversion': type('Performance', (), {'total_return': 0.10, 'sharpe_ratio': 0.8, 'max_drawdown': -0.12, 'win_rate': 0.55})(),
            'breakout': type('Performance', (), {'total_return': 0.18, 'sharpe_ratio': 1.0, 'max_drawdown': -0.15, 'win_rate': 0.45})()
        }
        
        # Strateji önerisi al
        recommendation = strategy_selector.get_strategy_recommendation(
            data=test_data,
            available_strategies=['momentum', 'mean_reversion', 'breakout'],
            strategy_performances=test_performances
        )
        
        if recommendation:
            logger.info(f"🎯 Recommended strategy: {recommendation.selected_strategy}")
            logger.info(f"📊 Confidence: {recommendation.confidence:.2f}")
            logger.info(f"📈 Expected performance: {recommendation.expected_performance:.2%}")
            logger.info(f"⚠️ Risk level: {recommendation.risk_level}")
        
        # İstatistikler
        stats = strategy_selector.get_statistics()
        logger.info(f"📊 Statistics: {stats}")
        
        logger.info("✅ Strategy Selector test completed")
    
    # Test çalıştır
    asyncio.run(test_strategy_selector())
