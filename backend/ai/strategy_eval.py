"""
🚀 BIST AI Smart Trader - Strategy Evaluator
============================================

Farklı stratejiler (momentum, mean reversion, breakout) test eden sistem.
Strateji performansını karşılaştırır ve en iyisini seçer.

Özellikler:
- Multiple strategy testing
- Performance comparison
- Risk-adjusted returns
- Strategy ranking
- Backtesting framework
- Strategy combination
"""

import asyncio
import json
import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple, Callable
from dataclasses import dataclass, asdict
from pathlib import Path
import talib
from enum import Enum

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class StrategyType(Enum):
    """Strateji türleri"""
    MOMENTUM = "momentum"
    MEAN_REVERSION = "mean_reversion"
    BREAKOUT = "breakout"
    TREND_FOLLOWING = "trend_following"
    VOLATILITY = "volatility"
    HYBRID = "hybrid"

@dataclass
class StrategySignal:
    """Strateji sinyali"""
    timestamp: datetime
    symbol: str
    signal: str  # 'BUY', 'SELL', 'HOLD'
    confidence: float
    strategy_type: StrategyType
    entry_price: float
    stop_loss: Optional[float]
    take_profit: Optional[float]
    metadata: Dict[str, Any]
    
    def to_dict(self):
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        data['strategy_type'] = self.strategy_type.value
        return data

@dataclass
class StrategyPerformance:
    """Strateji performansı"""
    strategy_name: str
    strategy_type: StrategyType
    total_return: float
    sharpe_ratio: float
    max_drawdown: float
    win_rate: float
    total_trades: int
    avg_trade_return: float
    volatility: float
    calmar_ratio: float
    sortino_ratio: float
    evaluation_period: Tuple[datetime, datetime]
    
    def to_dict(self):
        data = asdict(self)
        data['strategy_type'] = self.strategy_type.value
        data['evaluation_period'] = [self.evaluation_period[0].isoformat(), 
                                   self.evaluation_period[1].isoformat()]
        return data

@dataclass
class StrategyRanking:
    """Strateji sıralaması"""
    ranking_date: datetime
    strategy_rankings: List[Tuple[str, float, StrategyPerformance]]
    best_strategy: str
    worst_strategy: str
    ranking_criteria: str
    
    def to_dict(self):
        data = asdict(self)
        data['ranking_date'] = self.ranking_date.isoformat()
        data['strategy_rankings'] = [(name, score, perf.to_dict()) for name, score, perf in self.strategy_rankings]
        return data

class BaseStrategy:
    """Base strategy class"""
    
    def __init__(self, name: str, strategy_type: StrategyType):
        self.name = name
        self.strategy_type = strategy_type
        self.parameters = {}
        self.signals = []
        self.performance = None
    
    def set_parameters(self, parameters: Dict[str, Any]):
        """Parametreleri ayarla"""
        self.parameters.update(parameters)
    
    def generate_signals(self, data: pd.DataFrame) -> List[StrategySignal]:
        """Sinyal üret (subclass'lar implement edecek)"""
        raise NotImplementedError
    
    def calculate_performance(self, data: pd.DataFrame, signals: List[StrategySignal]) -> StrategyPerformance:
        """Performans hesapla"""
        try:
            if not signals:
                return StrategyPerformance(
                    strategy_name=self.name,
                    strategy_type=self.strategy_type,
                    total_return=0.0,
                    sharpe_ratio=0.0,
                    max_drawdown=0.0,
                    win_rate=0.0,
                    total_trades=0,
                    avg_trade_return=0.0,
                    volatility=0.0,
                    calmar_ratio=0.0,
                    sortino_ratio=0.0,
                    evaluation_period=(data.index[0], data.index[-1])
                )
            
            # Portfolio simulation
            portfolio_value = 100000.0  # Initial capital
            position = 0.0
            entry_price = 0.0
            trades = []
            
            for signal in signals:
                if signal.signal == 'BUY' and position == 0:
                    position = 1.0
                    entry_price = signal.entry_price
                elif signal.signal == 'SELL' and position > 0:
                    exit_price = signal.entry_price
                    trade_return = (exit_price - entry_price) / entry_price
                    trades.append(trade_return)
                    portfolio_value *= (1 + trade_return)
                    position = 0.0
            
            # Performance metrics
            total_return = (portfolio_value - 100000.0) / 100000.0
            total_trades = len(trades)
            
            if total_trades == 0:
                return StrategyPerformance(
                    strategy_name=self.name,
                    strategy_type=self.strategy_type,
                    total_return=0.0,
                    sharpe_ratio=0.0,
                    max_drawdown=0.0,
                    win_rate=0.0,
                    total_trades=0,
                    avg_trade_return=0.0,
                    volatility=0.0,
                    calmar_ratio=0.0,
                    sortino_ratio=0.0,
                    evaluation_period=(data.index[0], data.index[-1])
                )
            
            # Risk metrics
            returns = np.array(trades)
            avg_trade_return = np.mean(returns)
            volatility = np.std(returns)
            sharpe_ratio = avg_trade_return / volatility if volatility > 0 else 0.0
            
            # Drawdown calculation
            cumulative_returns = np.cumprod(1 + returns)
            running_max = np.maximum.accumulate(cumulative_returns)
            drawdowns = (cumulative_returns - running_max) / running_max
            max_drawdown = np.min(drawdowns)
            
            # Win rate
            winning_trades = np.sum(returns > 0)
            win_rate = winning_trades / total_trades
            
            # Calmar ratio
            calmar_ratio = total_return / abs(max_drawdown) if max_drawdown != 0 else 0.0
            
            # Sortino ratio
            downside_returns = returns[returns < 0]
            downside_volatility = np.std(downside_returns) if len(downside_returns) > 0 else 0.0
            sortino_ratio = avg_trade_return / downside_volatility if downside_volatility > 0 else 0.0
            
            performance = StrategyPerformance(
                strategy_name=self.name,
                strategy_type=self.strategy_type,
                total_return=total_return,
                sharpe_ratio=sharpe_ratio,
                max_drawdown=max_drawdown,
                win_rate=win_rate,
                total_trades=total_trades,
                avg_trade_return=avg_trade_return,
                volatility=volatility,
                calmar_ratio=calmar_ratio,
                sortino_ratio=sortino_ratio,
                evaluation_period=(data.index[0], data.index[-1])
            )
            
            return performance
            
        except Exception as e:
            logger.error(f"❌ Calculate performance error: {e}")
            return StrategyPerformance(
                strategy_name=self.name,
                strategy_type=self.strategy_type,
                total_return=0.0,
                sharpe_ratio=0.0,
                max_drawdown=0.0,
                win_rate=0.0,
                total_trades=0,
                avg_trade_return=0.0,
                volatility=0.0,
                calmar_ratio=0.0,
                sortino_ratio=0.0,
                evaluation_period=(data.index[0], data.index[-1])
            )

class MomentumStrategy(BaseStrategy):
    """Momentum stratejisi"""
    
    def __init__(self):
        super().__init__("Momentum Strategy", StrategyType.MOMENTUM)
        self.parameters = {
            'rsi_period': 14,
            'rsi_oversold': 30,
            'rsi_overbought': 70,
            'macd_fast': 12,
            'macd_slow': 26,
            'macd_signal': 9
        }
    
    def generate_signals(self, data: pd.DataFrame) -> List[StrategySignal]:
        """Momentum sinyalleri üret"""
        try:
            signals = []
            
            # Technical indicators
            rsi = talib.RSI(data['close'], timeperiod=self.parameters['rsi_period'])
            macd, macd_signal, macd_hist = talib.MACD(
                data['close'],
                fastperiod=self.parameters['macd_fast'],
                slowperiod=self.parameters['macd_slow'],
                signalperiod=self.parameters['macd_signal']
            )
            
            for i in range(1, len(data)):
                current_price = data['close'].iloc[i]
                current_rsi = rsi.iloc[i]
                current_macd = macd.iloc[i]
                current_macd_signal = macd_signal.iloc[i]
                
                # Momentum signals
                if (current_rsi > self.parameters['rsi_oversold'] and 
                    current_macd > current_macd_signal and
                    macd_hist.iloc[i] > macd_hist.iloc[i-1]):
                    
                    signal = StrategySignal(
                        timestamp=data.index[i],
                        symbol='BIST',
                        signal='BUY',
                        confidence=min(current_rsi / 100, 1.0),
                        strategy_type=self.strategy_type,
                        entry_price=current_price,
                        stop_loss=current_price * 0.95,
                        take_profit=current_price * 1.10,
                        metadata={'rsi': current_rsi, 'macd': current_macd}
                    )
                    signals.append(signal)
                
                elif (current_rsi < self.parameters['rsi_overbought'] and 
                      current_macd < current_macd_signal and
                      macd_hist.iloc[i] < macd_hist.iloc[i-1]):
                    
                    signal = StrategySignal(
                        timestamp=data.index[i],
                        symbol='BIST',
                        signal='SELL',
                        confidence=min((100 - current_rsi) / 100, 1.0),
                        strategy_type=self.strategy_type,
                        entry_price=current_price,
                        stop_loss=current_price * 1.05,
                        take_profit=current_price * 0.90,
                        metadata={'rsi': current_rsi, 'macd': current_macd}
                    )
                    signals.append(signal)
            
            return signals
            
        except Exception as e:
            logger.error(f"❌ Generate momentum signals error: {e}")
            return []

class MeanReversionStrategy(BaseStrategy):
    """Mean reversion stratejisi"""
    
    def __init__(self):
        super().__init__("Mean Reversion Strategy", StrategyType.MEAN_REVERSION)
        self.parameters = {
            'bb_period': 20,
            'bb_std': 2.0,
            'rsi_period': 14,
            'rsi_oversold': 30,
            'rsi_overbought': 70
        }
    
    def generate_signals(self, data: pd.DataFrame) -> List[StrategySignal]:
        """Mean reversion sinyalleri üret"""
        try:
            signals = []
            
            # Bollinger Bands
            bb_upper, bb_middle, bb_lower = talib.BBANDS(
                data['close'],
                timeperiod=self.parameters['bb_period'],
                nbdevup=self.parameters['bb_std'],
                nbdevdn=self.parameters['bb_std']
            )
            
            # RSI
            rsi = talib.RSI(data['close'], timeperiod=self.parameters['rsi_period'])
            
            for i in range(1, len(data)):
                current_price = data['close'].iloc[i]
                current_bb_upper = bb_upper.iloc[i]
                current_bb_lower = bb_lower.iloc[i]
                current_rsi = rsi.iloc[i]
                
                # Mean reversion signals
                if (current_price <= current_bb_lower and 
                    current_rsi < self.parameters['rsi_oversold']):
                    
                    signal = StrategySignal(
                        timestamp=data.index[i],
                        symbol='BIST',
                        signal='BUY',
                        confidence=min((self.parameters['rsi_oversold'] - current_rsi) / 30, 1.0),
                        strategy_type=self.strategy_type,
                        entry_price=current_price,
                        stop_loss=current_price * 0.95,
                        take_profit=current_price * 1.05,
                        metadata={'rsi': current_rsi, 'bb_position': (current_price - current_bb_lower) / (current_bb_upper - current_bb_lower)}
                    )
                    signals.append(signal)
                
                elif (current_price >= current_bb_upper and 
                      current_rsi > self.parameters['rsi_overbought']):
                    
                    signal = StrategySignal(
                        timestamp=data.index[i],
                        symbol='BIST',
                        signal='SELL',
                        confidence=min((current_rsi - self.parameters['rsi_overbought']) / 30, 1.0),
                        strategy_type=self.strategy_type,
                        entry_price=current_price,
                        stop_loss=current_price * 1.05,
                        take_profit=current_price * 0.95,
                        metadata={'rsi': current_rsi, 'bb_position': (current_price - current_bb_lower) / (current_bb_upper - current_bb_lower)}
                    )
                    signals.append(signal)
            
            return signals
            
        except Exception as e:
            logger.error(f"❌ Generate mean reversion signals error: {e}")
            return []

class BreakoutStrategy(BaseStrategy):
    """Breakout stratejisi"""
    
    def __init__(self):
        super().__init__("Breakout Strategy", StrategyType.BREAKOUT)
        self.parameters = {
            'lookback_period': 20,
            'volume_threshold': 1.5,
            'atr_period': 14,
            'atr_multiplier': 2.0
        }
    
    def generate_signals(self, data: pd.DataFrame) -> List[StrategySignal]:
        """Breakout sinyalleri üret"""
        try:
            signals = []
            
            # ATR
            atr = talib.ATR(data['high'], data['low'], data['close'], timeperiod=self.parameters['atr_period'])
            
            # Volume SMA
            volume_sma = talib.SMA(data['volume'], timeperiod=self.parameters['lookback_period'])
            
            for i in range(self.parameters['lookback_period'], len(data)):
                current_price = data['close'].iloc[i]
                current_high = data['high'].iloc[i]
                current_low = data['low'].iloc[i]
                current_volume = data['volume'].iloc[i]
                current_atr = atr.iloc[i]
                
                # Lookback period high/low
                lookback_high = data['high'].iloc[i-self.parameters['lookback_period']:i].max()
                lookback_low = data['low'].iloc[i-self.parameters['lookback_period']:i].min()
                
                # Volume check
                volume_ratio = current_volume / volume_sma.iloc[i]
                
                # Breakout signals
                if (current_high > lookback_high and 
                    volume_ratio > self.parameters['volume_threshold']):
                    
                    signal = StrategySignal(
                        timestamp=data.index[i],
                        symbol='BIST',
                        signal='BUY',
                        confidence=min(volume_ratio / 2.0, 1.0),
                        strategy_type=self.strategy_type,
                        entry_price=current_price,
                        stop_loss=current_price - (current_atr * self.parameters['atr_multiplier']),
                        take_profit=current_price + (current_atr * self.parameters['atr_multiplier'] * 2),
                        metadata={'volume_ratio': volume_ratio, 'atr': current_atr}
                    )
                    signals.append(signal)
                
                elif (current_low < lookback_low and 
                      volume_ratio > self.parameters['volume_threshold']):
                    
                    signal = StrategySignal(
                        timestamp=data.index[i],
                        symbol='BIST',
                        signal='SELL',
                        confidence=min(volume_ratio / 2.0, 1.0),
                        strategy_type=self.strategy_type,
                        entry_price=current_price,
                        stop_loss=current_price + (current_atr * self.parameters['atr_multiplier']),
                        take_profit=current_price - (current_atr * self.parameters['atr_multiplier'] * 2),
                        metadata={'volume_ratio': volume_ratio, 'atr': current_atr}
                    )
                    signals.append(signal)
            
            return signals
            
        except Exception as e:
            logger.error(f"❌ Generate breakout signals error: {e}")
            return []

class StrategyEvaluator:
    """Strategy Evaluator"""
    
    def __init__(self, data_dir: str = "backend/ai/data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Available strategies
        self.strategies = {
            'momentum': MomentumStrategy(),
            'mean_reversion': MeanReversionStrategy(),
            'breakout': BreakoutStrategy()
        }
        
        # Evaluation results
        self.evaluation_results = []
        self.strategy_rankings = []
        
        logger.info("✅ Strategy Evaluator initialized")
    
    def add_strategy(self, name: str, strategy: BaseStrategy):
        """Strateji ekle"""
        try:
            self.strategies[name] = strategy
            logger.info(f"✅ Strategy added: {name}")
            
        except Exception as e:
            logger.error(f"❌ Add strategy error: {e}")
    
    def evaluate_strategy(self, strategy_name: str, data: pd.DataFrame) -> StrategyPerformance:
        """Stratejiyi değerlendir"""
        try:
            if strategy_name not in self.strategies:
                raise ValueError(f"Strategy not found: {strategy_name}")
            
            strategy = self.strategies[strategy_name]
            
            # Sinyalleri üret
            signals = strategy.generate_signals(data)
            
            # Performansı hesapla
            performance = strategy.calculate_performance(data, signals)
            
            # Sonucu kaydet
            self.evaluation_results.append({
                'strategy_name': strategy_name,
                'performance': performance,
                'evaluation_date': datetime.now(),
                'data_period': (data.index[0], data.index[-1])
            })
            
            logger.info(f"✅ Strategy evaluated: {strategy_name} - Return: {performance.total_return:.2%}")
            
            return performance
            
        except Exception as e:
            logger.error(f"❌ Evaluate strategy error: {e}")
            return None
    
    def evaluate_all_strategies(self, data: pd.DataFrame) -> Dict[str, StrategyPerformance]:
        """Tüm stratejileri değerlendir"""
        try:
            results = {}
            
            for strategy_name in self.strategies.keys():
                performance = self.evaluate_strategy(strategy_name, data)
                if performance:
                    results[strategy_name] = performance
            
            logger.info(f"✅ All strategies evaluated: {len(results)} strategies")
            
            return results
            
        except Exception as e:
            logger.error(f"❌ Evaluate all strategies error: {e}")
            return {}
    
    def rank_strategies(self, 
                       evaluation_results: Dict[str, StrategyPerformance],
                       ranking_criteria: str = 'sharpe_ratio') -> StrategyRanking:
        """Stratejileri sırala"""
        try:
            # Ranking criteria weights
            criteria_weights = {
                'sharpe_ratio': {'sharpe_ratio': 0.4, 'total_return': 0.3, 'win_rate': 0.2, 'calmar_ratio': 0.1},
                'total_return': {'total_return': 0.5, 'sharpe_ratio': 0.3, 'win_rate': 0.2},
                'risk_adjusted': {'sharpe_ratio': 0.3, 'calmar_ratio': 0.3, 'sortino_ratio': 0.2, 'max_drawdown': 0.2}
            }
            
            weights = criteria_weights.get(ranking_criteria, criteria_weights['sharpe_ratio'])
            
            # Strategy scores
            strategy_scores = []
            
            for strategy_name, performance in evaluation_results.items():
                score = 0.0
                
                # Normalize metrics
                sharpe_norm = max(0, performance.sharpe_ratio) / 2.0  # Normalize to 0-1
                return_norm = max(0, performance.total_return) / 0.5   # Normalize to 0-1
                win_rate_norm = performance.win_rate
                calmar_norm = max(0, performance.calmar_ratio) / 2.0
                sortino_norm = max(0, performance.sortino_ratio) / 2.0
                drawdown_norm = 1.0 - abs(performance.max_drawdown)  # Lower drawdown is better
                
                # Calculate weighted score
                score = (
                    weights.get('sharpe_ratio', 0) * sharpe_norm +
                    weights.get('total_return', 0) * return_norm +
                    weights.get('win_rate', 0) * win_rate_norm +
                    weights.get('calmar_ratio', 0) * calmar_norm +
                    weights.get('sortino_ratio', 0) * sortino_norm +
                    weights.get('max_drawdown', 0) * drawdown_norm
                )
                
                strategy_scores.append((strategy_name, score, performance))
            
            # Sort by score
            strategy_scores.sort(key=lambda x: x[1], reverse=True)
            
            # Create ranking
            ranking = StrategyRanking(
                ranking_date=datetime.now(),
                strategy_rankings=strategy_scores,
                best_strategy=strategy_scores[0][0] if strategy_scores else "",
                worst_strategy=strategy_scores[-1][0] if strategy_scores else "",
                ranking_criteria=ranking_criteria
            )
            
            self.strategy_rankings.append(ranking)
            
            logger.info(f"✅ Strategies ranked: {ranking.best_strategy} is best")
            
            return ranking
            
        except Exception as e:
            logger.error(f"❌ Rank strategies error: {e}")
            return None
    
    def get_best_strategy(self, ranking_criteria: str = 'sharpe_ratio') -> Optional[str]:
        """En iyi stratejiyi getir"""
        try:
            if not self.strategy_rankings:
                return None
            
            # Son ranking'i al
            latest_ranking = self.strategy_rankings[-1]
            
            if latest_ranking.ranking_criteria == ranking_criteria:
                return latest_ranking.best_strategy
            
            # Yeni ranking yap
            if self.evaluation_results:
                latest_results = {}
                for result in self.evaluation_results[-len(self.strategies):]:
                    latest_results[result['strategy_name']] = result['performance']
                
                ranking = self.rank_strategies(latest_results, ranking_criteria)
                return ranking.best_strategy if ranking else None
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Get best strategy error: {e}")
            return None
    
    def get_strategy_statistics(self) -> Dict[str, Any]:
        """Strateji istatistiklerini getir"""
        try:
            stats = {
                'total_strategies': len(self.strategies),
                'total_evaluations': len(self.evaluation_results),
                'total_rankings': len(self.strategy_rankings),
                'strategy_types': list(set(s.strategy_type.value for s in self.strategies.values())),
                'available_strategies': list(self.strategies.keys())
            }
            
            # Son değerlendirme sonuçları
            if self.evaluation_results:
                latest_results = self.evaluation_results[-len(self.strategies):]
                stats['latest_evaluation'] = {
                    result['strategy_name']: {
                        'total_return': result['performance'].total_return,
                        'sharpe_ratio': result['performance'].sharpe_ratio,
                        'max_drawdown': result['performance'].max_drawdown,
                        'win_rate': result['performance'].win_rate
                    }
                    for result in latest_results
                }
            
            return stats
            
        except Exception as e:
            logger.error(f"❌ Get strategy statistics error: {e}")
            return {}

# Global instance
strategy_evaluator = StrategyEvaluator()

if __name__ == "__main__":
    async def test_strategy_evaluator():
        """Test fonksiyonu"""
        logger.info("🧪 Testing Strategy Evaluator...")
        
        # Test verisi oluştur
        dates = pd.date_range(start='2023-01-01', end='2023-12-31', freq='D')
        test_data = pd.DataFrame({
            'date': dates,
            'open': np.random.randn(len(dates)).cumsum() + 100,
            'high': np.random.randn(len(dates)).cumsum() + 105,
            'low': np.random.randn(len(dates)).cumsum() + 95,
            'close': np.random.randn(len(dates)).cumsum() + 100,
            'volume': np.random.randint(1000, 10000, len(dates))
        })
        test_data.set_index('date', inplace=True)
        
        # Tüm stratejileri değerlendir
        results = strategy_evaluator.evaluate_all_strategies(test_data)
        
        # Stratejileri sırala
        ranking = strategy_evaluator.rank_strategies(results)
        
        if ranking:
            logger.info(f"🏆 Best strategy: {ranking.best_strategy}")
            logger.info(f"📊 Strategy rankings:")
            for i, (name, score, perf) in enumerate(ranking.strategy_rankings):
                logger.info(f"  {i+1}. {name}: {score:.3f} (Return: {perf.total_return:.2%})")
        
        # İstatistikler
        stats = strategy_evaluator.get_strategy_statistics()
        logger.info(f"📈 Statistics: {stats}")
        
        logger.info("✅ Strategy Evaluator test completed")
    
    # Test çalıştır
    asyncio.run(test_strategy_evaluator())
