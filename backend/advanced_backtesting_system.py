"""
Advanced Backtesting System
Geçmiş verilerle strateji testi, VaR analizi, Walk-forward validation
"""

import numpy as np
import pandas as pd
import logging
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
import json
from dataclasses import dataclass
from enum import Enum
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

class StrategyType(Enum):
    """Strateji türleri"""
    BUY_AND_HOLD = "buy_and_hold"
    MOVING_AVERAGE_CROSS = "moving_average_cross"
    RSI_MEAN_REVERSION = "rsi_mean_reversion"
    BOLLINGER_BANDS = "bollinger_bands"
    MOMENTUM = "momentum"
    MEAN_REVERSION = "mean_reversion"
    BREAKOUT = "breakout"
    SCALPING = "scalping"

@dataclass
class BacktestConfig:
    """Backtest konfigürasyonu"""
    initial_capital: float = 100000.0
    commission: float = 0.001  # %0.1 komisyon
    slippage: float = 0.0005  # %0.05 slippage
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    benchmark_symbol: str = "SPY"
    risk_free_rate: float = 0.02  # %2 risk-free rate

@dataclass
class Trade:
    """İşlem kaydı"""
    symbol: str
    entry_date: datetime
    exit_date: Optional[datetime]
    entry_price: float
    exit_price: Optional[float]
    quantity: int
    side: str  # 'long' or 'short'
    pnl: Optional[float] = None
    commission: float = 0.0
    slippage: float = 0.0
    strategy: str = ""

@dataclass
class BacktestResult:
    """Backtest sonucu"""
    total_return: float
    annualized_return: float
    volatility: float
    sharpe_ratio: float
    max_drawdown: float
    calmar_ratio: float
    win_rate: float
    profit_factor: float
    total_trades: int
    avg_trade_return: float
    var_95: float  # Value at Risk %95
    var_99: float  # Value at Risk %99
    cvar_95: float  # Conditional VaR %95
    trades: List[Trade]
    equity_curve: pd.Series
    benchmark_return: float
    alpha: float
    beta: float

class TechnicalIndicators:
    """Teknik indikatörler"""
    
    @staticmethod
    def sma(prices: pd.Series, window: int) -> pd.Series:
        """Simple Moving Average"""
        return prices.rolling(window=window).mean()
    
    @staticmethod
    def ema(prices: pd.Series, window: int) -> pd.Series:
        """Exponential Moving Average"""
        return prices.ewm(span=window).mean()
    
    @staticmethod
    def rsi(prices: pd.Series, window: int = 14) -> pd.Series:
        """Relative Strength Index"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi.fillna(50)
    
    @staticmethod
    def bollinger_bands(prices: pd.Series, window: int = 20, std_dev: float = 2) -> Tuple[pd.Series, pd.Series, pd.Series]:
        """Bollinger Bands"""
        sma = TechnicalIndicators.sma(prices, window)
        std = prices.rolling(window=window).std()
        upper = sma + (std * std_dev)
        lower = sma - (std * std_dev)
        return upper, sma, lower
    
    @staticmethod
    def macd(prices: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> Tuple[pd.Series, pd.Series, pd.Series]:
        """MACD"""
        ema_fast = TechnicalIndicators.ema(prices, fast)
        ema_slow = TechnicalIndicators.ema(prices, slow)
        macd_line = ema_fast - ema_slow
        signal_line = TechnicalIndicators.ema(macd_line, signal)
        histogram = macd_line - signal_line
        return macd_line, signal_line, histogram
    
    @staticmethod
    def stochastic(high: pd.Series, low: pd.Series, close: pd.Series, k_window: int = 14, d_window: int = 3) -> Tuple[pd.Series, pd.Series]:
        """Stochastic Oscillator"""
        lowest_low = low.rolling(window=k_window).min()
        highest_high = high.rolling(window=k_window).max()
        k_percent = 100 * ((close - lowest_low) / (highest_high - lowest_low))
        d_percent = k_percent.rolling(window=d_window).mean()
        return k_percent, d_percent

class StrategyEngine:
    """Strateji motoru"""
    
    def __init__(self, strategy_type: StrategyType):
        self.strategy_type = strategy_type
        self.indicators = TechnicalIndicators()
    
    def generate_signals(self, df: pd.DataFrame) -> pd.Series:
        """Sinyal üret"""
        signals = pd.Series(0, index=df.index)
        
        if self.strategy_type == StrategyType.MOVING_AVERAGE_CROSS:
            signals = self._ma_cross_strategy(df)
        elif self.strategy_type == StrategyType.RSI_MEAN_REVERSION:
            signals = self._rsi_mean_reversion_strategy(df)
        elif self.strategy_type == StrategyType.BOLLINGER_BANDS:
            signals = self._bollinger_bands_strategy(df)
        elif self.strategy_type == StrategyType.MOMENTUM:
            signals = self._momentum_strategy(df)
        elif self.strategy_type == StrategyType.MEAN_REVERSION:
            signals = self._mean_reversion_strategy(df)
        elif self.strategy_type == StrategyType.BREAKOUT:
            signals = self._breakout_strategy(df)
        elif self.strategy_type == StrategyType.SCALPING:
            signals = self._scalping_strategy(df)
        elif self.strategy_type == StrategyType.BUY_AND_HOLD:
            signals = self._buy_and_hold_strategy(df)
        
        return signals
    
    def _ma_cross_strategy(self, df: pd.DataFrame) -> pd.Series:
        """Moving Average Cross stratejisi"""
        signals = pd.Series(0, index=df.index)
        
        # Short ve long MA
        short_ma = self.indicators.sma(df['close'], 10)
        long_ma = self.indicators.sma(df['close'], 30)
        
        # Golden cross (alış sinyali)
        signals[(short_ma > long_ma) & (short_ma.shift(1) <= long_ma.shift(1))] = 1
        
        # Death cross (satış sinyali)
        signals[(short_ma < long_ma) & (short_ma.shift(1) >= long_ma.shift(1))] = -1
        
        return signals
    
    def _rsi_mean_reversion_strategy(self, df: pd.DataFrame) -> pd.Series:
        """RSI Mean Reversion stratejisi"""
        signals = pd.Series(0, index=df.index)
        
        rsi = self.indicators.rsi(df['close'], 14)
        
        # Oversold (alış sinyali)
        signals[(rsi < 30) & (rsi.shift(1) >= 30)] = 1
        
        # Overbought (satış sinyali)
        signals[(rsi > 70) & (rsi.shift(1) <= 70)] = -1
        
        return signals
    
    def _bollinger_bands_strategy(self, df: pd.DataFrame) -> pd.Series:
        """Bollinger Bands stratejisi"""
        signals = pd.Series(0, index=df.index)
        
        upper, middle, lower = self.indicators.bollinger_bands(df['close'], 20, 2)
        
        # Alt banddan yukarı çıkış (alış)
        signals[(df['close'] > lower) & (df['close'].shift(1) <= lower.shift(1))] = 1
        
        # Üst banddan aşağı çıkış (satış)
        signals[(df['close'] < upper) & (df['close'].shift(1) >= upper.shift(1))] = -1
        
        return signals
    
    def _momentum_strategy(self, df: pd.DataFrame) -> pd.Series:
        """Momentum stratejisi"""
        signals = pd.Series(0, index=df.index)
        
        # Price momentum
        momentum = df['close'].pct_change(10)
        
        # Güçlü momentum (alış)
        signals[momentum > 0.05] = 1
        
        # Zayıf momentum (satış)
        signals[momentum < -0.05] = -1
        
        return signals
    
    def _mean_reversion_strategy(self, df: pd.DataFrame) -> pd.Series:
        """Mean Reversion stratejisi"""
        signals = pd.Series(0, index=df.index)
        
        # Z-score hesapla
        sma_20 = self.indicators.sma(df['close'], 20)
        std_20 = df['close'].rolling(20).std()
        z_score = (df['close'] - sma_20) / std_20
        
        # Aşırı alım (satış)
        signals[z_score > 2] = -1
        
        # Aşırı satım (alış)
        signals[z_score < -2] = 1
        
        return signals
    
    def _breakout_strategy(self, df: pd.DataFrame) -> pd.Series:
        """Breakout stratejisi"""
        signals = pd.Series(0, index=df.index)
        
        # Resistance ve support
        high_20 = df['high'].rolling(20).max()
        low_20 = df['low'].rolling(20).min()
        
        # Resistance breakout (alış)
        signals[(df['close'] > high_20.shift(1)) & (df['close'].shift(1) <= high_20.shift(1))] = 1
        
        # Support breakdown (satış)
        signals[(df['close'] < low_20.shift(1)) & (df['close'].shift(1) >= low_20.shift(1))] = -1
        
        return signals
    
    def _scalping_strategy(self, df: pd.DataFrame) -> pd.Series:
        """Scalping stratejisi"""
        signals = pd.Series(0, index=df.index)
        
        # Hızlı MA cross
        fast_ma = self.indicators.ema(df['close'], 5)
        slow_ma = self.indicators.ema(df['close'], 15)
        
        # Hızlı alış/satış
        signals[fast_ma > slow_ma] = 1
        signals[fast_ma < slow_ma] = -1
        
        return signals
    
    def _buy_and_hold_strategy(self, df: pd.DataFrame) -> pd.Series:
        """Buy and Hold stratejisi"""
        signals = pd.Series(0, index=df.index)
        signals.iloc[0] = 1  # İlk gün alış
        return signals

class BacktestEngine:
    """Backtest motoru"""
    
    def __init__(self, config: BacktestConfig = None):
        self.config = config or BacktestConfig()
        self.trades: List[Trade] = []
        self.equity_curve: pd.Series = pd.Series()
        self.current_position = None
        self.cash = self.config.initial_capital
        
    def run_backtest(self, df: pd.DataFrame, strategy: StrategyEngine) -> BacktestResult:
        """Backtest çalıştır"""
        try:
            logger.info(f"🚀 Backtest başlıyor: {strategy.strategy_type.value}")
            
            # Sinyalleri üret
            signals = strategy.generate_signals(df)
            
            # Backtest çalıştır
            self._execute_backtest(df, signals, strategy.strategy_type.value)
            
            # Sonuçları hesapla
            result = self._calculate_metrics(df, signals)
            
            logger.info(f"✅ Backtest tamamlandı - Total Return: {result.total_return:.2%}")
            return result
            
        except Exception as e:
            logger.error(f"❌ Backtest hatası: {e}")
            raise
    
    def _execute_backtest(self, df: pd.DataFrame, signals: pd.Series, strategy_name: str):
        """Backtest işlemlerini çalıştır"""
        self.trades = []
        self.cash = self.config.initial_capital
        self.current_position = None
        
        for i, (date, row) in enumerate(df.iterrows()):
            signal = signals.iloc[i]
            price = row['close']
            
            # Mevcut pozisyonu kapat
            if self.current_position and signal != 0:
                self._close_position(date, price, strategy_name)
            
            # Yeni pozisyon aç
            if signal != 0 and not self.current_position:
                self._open_position(date, price, signal, strategy_name)
    
    def _open_position(self, date: datetime, price: float, signal: int, strategy_name: str):
        """Pozisyon aç"""
        if self.cash <= 0:
            return
        
        # Komisyon ve slippage hesapla
        commission_cost = self.cash * self.config.commission
        slippage_cost = self.cash * self.config.slippage
        total_cost = commission_cost + slippage_cost
        
        if total_cost >= self.cash:
            return
        
        # Pozisyon boyutu
        available_cash = self.cash - total_cost
        quantity = int(available_cash / price)
        
        if quantity <= 0:
            return
        
        # Pozisyon aç
        self.current_position = Trade(
            symbol="STOCK",
            entry_date=date,
            exit_date=None,
            entry_price=price,
            exit_price=None,
            quantity=quantity,
            side='long' if signal > 0 else 'short',
            commission=commission_cost,
            slippage=slippage_cost,
            strategy=strategy_name
        )
        
        # Nakit güncelle
        self.cash -= (quantity * price) + total_cost
    
    def _close_position(self, date: datetime, price: float, strategy_name: str):
        """Pozisyon kapat"""
        if not self.current_position:
            return
        
        # Komisyon ve slippage hesapla
        position_value = self.current_position.quantity * price
        commission_cost = position_value * self.config.commission
        slippage_cost = position_value * self.config.slippage
        total_cost = commission_cost + slippage_cost
        
        # Pozisyonu kapat
        self.current_position.exit_date = date
        self.current_position.exit_price = price
        
        # PnL hesapla
        if self.current_position.side == 'long':
            pnl = (price - self.current_position.entry_price) * self.current_position.quantity
        else:  # short
            pnl = (self.current_position.entry_price - price) * self.current_position.quantity
        
        self.current_position.pnl = pnl - total_cost
        
        # Nakit güncelle
        self.cash += position_value - total_cost
        
        # Trade'i kaydet
        self.trades.append(self.current_position)
        self.current_position = None
    
    def _calculate_metrics(self, df: pd.DataFrame, signals: pd.Series) -> BacktestResult:
        """Performans metriklerini hesapla"""
        
        # Equity curve oluştur
        equity_values = []
        current_equity = self.config.initial_capital
        
        for i, (date, row) in enumerate(df.iterrows()):
            if self.current_position:
                if self.current_position.side == 'long':
                    current_equity = self.cash + (self.current_position.quantity * row['close'])
                else:  # short
                    current_equity = self.cash + (self.current_position.quantity * (2 * self.current_position.entry_price - row['close']))
            else:
                current_equity = self.cash
            
            equity_values.append(current_equity)
        
        self.equity_curve = pd.Series(equity_values, index=df.index)
        
        # Returns hesapla
        returns = self.equity_curve.pct_change().dropna()
        
        # Temel metrikler
        total_return = (self.equity_curve.iloc[-1] / self.equity_curve.iloc[0]) - 1
        annualized_return = (1 + total_return) ** (252 / len(returns)) - 1
        volatility = returns.std() * np.sqrt(252)
        sharpe_ratio = (annualized_return - self.config.risk_free_rate) / volatility if volatility > 0 else 0
        
        # Drawdown hesapla
        peak = self.equity_curve.expanding().max()
        drawdown = (self.equity_curve - peak) / peak
        max_drawdown = drawdown.min()
        calmar_ratio = annualized_return / abs(max_drawdown) if max_drawdown != 0 else 0
        
        # Trade metrikleri
        if self.trades:
            winning_trades = [t for t in self.trades if t.pnl and t.pnl > 0]
            losing_trades = [t for t in self.trades if t.pnl and t.pnl < 0]
            
            win_rate = len(winning_trades) / len(self.trades) if self.trades else 0
            
            total_profit = sum(t.pnl for t in winning_trades if t.pnl)
            total_loss = abs(sum(t.pnl for t in losing_trades if t.pnl))
            profit_factor = total_profit / total_loss if total_loss > 0 else float('inf')
            
            avg_trade_return = sum(t.pnl for t in self.trades if t.pnl) / len(self.trades) if self.trades else 0
        else:
            win_rate = 0
            profit_factor = 0
            avg_trade_return = 0
        
        # VaR hesapla
        var_95 = np.percentile(returns, 5) if len(returns) > 0 else 0
        var_99 = np.percentile(returns, 1) if len(returns) > 0 else 0
        
        # CVaR hesapla
        cvar_95 = returns[returns <= var_95].mean() if len(returns[returns <= var_95]) > 0 else 0
        
        # Benchmark karşılaştırması
        try:
            import yfinance as yf
            benchmark = yf.download(self.config.benchmark_symbol, 
                                  start=df.index[0], 
                                  end=df.index[-1])['Close']
            benchmark_return = (benchmark.iloc[-1] / benchmark.iloc[0]) - 1
            
            # Alpha ve Beta hesapla
            benchmark_returns = benchmark.pct_change().dropna()
            aligned_returns, aligned_benchmark = returns.align(benchmark_returns, join='inner')
            
            if len(aligned_returns) > 1:
                covariance = np.cov(aligned_returns, aligned_benchmark)[0, 1]
                benchmark_variance = np.var(aligned_benchmark)
                beta = covariance / benchmark_variance if benchmark_variance > 0 else 0
                alpha = annualized_return - (self.config.risk_free_rate + beta * (benchmark_return - self.config.risk_free_rate))
            else:
                beta = 0
                alpha = 0
        except:
            benchmark_return = 0
            alpha = 0
            beta = 0
        
        return BacktestResult(
            total_return=total_return,
            annualized_return=annualized_return,
            volatility=volatility,
            sharpe_ratio=sharpe_ratio,
            max_drawdown=max_drawdown,
            calmar_ratio=calmar_ratio,
            win_rate=win_rate,
            profit_factor=profit_factor,
            total_trades=len(self.trades),
            avg_trade_return=avg_trade_return,
            var_95=var_95,
            var_99=var_99,
            cvar_95=cvar_95,
            trades=self.trades,
            equity_curve=self.equity_curve,
            benchmark_return=benchmark_return,
            alpha=alpha,
            beta=beta
        )

class WalkForwardValidator:
    """Walk-forward validation"""
    
    def __init__(self, train_period: int = 252, test_period: int = 63):
        self.train_period = train_period  # 1 yıl
        self.test_period = test_period    # 3 ay
    
    def validate(self, df: pd.DataFrame, strategy: StrategyEngine) -> Dict:
        """Walk-forward validation çalıştır"""
        try:
            logger.info(f"🚀 Walk-forward validation başlıyor")
            
            results = []
            start_idx = self.train_period
            
            while start_idx + self.test_period < len(df):
                # Train ve test dönemleri
                train_end = start_idx
                test_start = start_idx
                test_end = start_idx + self.test_period
                
                train_data = df.iloc[:train_end]
                test_data = df.iloc[test_start:test_end]
                
                # Stratejiyi train data ile eğit (sinyal üret)
                train_signals = strategy.generate_signals(train_data)
                
                # Test data ile backtest
                config = BacktestConfig()
                engine = BacktestEngine(config)
                
                # Test için strateji oluştur
                test_strategy = StrategyEngine(strategy.strategy_type)
                test_result = engine.run_backtest(test_data, test_strategy)
                
                results.append({
                    'period': f"{test_data.index[0].strftime('%Y-%m-%d')} to {test_data.index[-1].strftime('%Y-%m-%d')}",
                    'total_return': test_result.total_return,
                    'sharpe_ratio': test_result.sharpe_ratio,
                    'max_drawdown': test_result.max_drawdown,
                    'win_rate': test_result.win_rate,
                    'total_trades': test_result.total_trades
                })
                
                start_idx += self.test_period
            
            # Ortalama performans
            avg_return = np.mean([r['total_return'] for r in results])
            avg_sharpe = np.mean([r['sharpe_ratio'] for r in results])
            avg_drawdown = np.mean([r['max_drawdown'] for r in results])
            avg_win_rate = np.mean([r['win_rate'] for r in results])
            
            logger.info(f"✅ Walk-forward validation tamamlandı - {len(results)} dönem")
            
            return {
                'success': True,
                'periods': results,
                'average_metrics': {
                    'total_return': avg_return,
                    'sharpe_ratio': avg_sharpe,
                    'max_drawdown': avg_drawdown,
                    'win_rate': avg_win_rate
                },
                'total_periods': len(results)
            }
            
        except Exception as e:
            logger.error(f"❌ Walk-forward validation hatası: {e}")
            return {'error': str(e)}

# Global instances
backtest_engine = BacktestEngine()
walk_forward_validator = WalkForwardValidator()
