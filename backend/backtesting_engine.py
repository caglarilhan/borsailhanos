#!/usr/bin/env python3
"""
📊 Backtesting Engine
PRD v2.0 Enhancement - Comprehensive backtesting system
"""

import numpy as np
import pandas as pd
import logging
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
import yfinance as yf
import matplotlib.pyplot as plt
import seaborn as sns
from enum import Enum

logger = logging.getLogger(__name__)

class TradeType(Enum):
    """İşlem türleri"""
    BUY = "BUY"
    SELL = "SELL"
    HOLD = "HOLD"

@dataclass
class Trade:
    """İşlem kaydı"""
    symbol: str
    trade_type: TradeType
    entry_price: float
    exit_price: float
    quantity: float
    entry_date: datetime
    exit_date: datetime
    pnl: float
    pnl_pct: float
    duration_days: int
    signal_strength: float

@dataclass
class BacktestResult:
    """Backtest sonucu"""
    symbol: str
    start_date: datetime
    end_date: datetime
    initial_capital: float
    final_capital: float
    total_return: float
    total_return_pct: float
    trades: List[Trade]
    win_rate: float
    avg_win: float
    avg_loss: float
    profit_factor: float
    sharpe_ratio: float
    max_drawdown: float
    max_drawdown_pct: float
    calmar_ratio: float
    equity_curve: pd.DataFrame
    monthly_returns: pd.Series
    timestamp: datetime

class BacktestingEngine:
    """Backtesting motoru"""
    
    def __init__(self, initial_capital: float = 100000.0):
        self.initial_capital = initial_capital
        self.commission_rate = 0.001  # %0.1 komisyon
        self.slippage_rate = 0.0005  # %0.05 slippage
        
    def run_backtest(self, symbol: str, strategy_func, start_date: str, 
                    end_date: str = None) -> BacktestResult:
        """Backtest çalıştır"""
        logger.info(f"📊 {symbol} backtest başlıyor...")
        
        try:
            if end_date is None:
                end_date = datetime.now().strftime('%Y-%m-%d')
            
            # Veri çek
            data = self._get_historical_data(symbol, start_date, end_date)
            
            if data.empty:
                logger.error(f"❌ {symbol} için veri bulunamadı")
                return self._default_result(symbol, start_date, end_date)
            
            # Strateji sinyalleri üret
            signals = strategy_func(data)
            
            if signals.empty:
                logger.error(f"❌ {symbol} için sinyal üretilemedi")
                return self._default_result(symbol, start_date, end_date)
            
            # İşlemleri simüle et
            trades = self._simulate_trades(data, signals, symbol)
            
            # Performans metrikleri hesapla
            result = self._calculate_performance_metrics(
                symbol, trades, data, start_date, end_date
            )
            
            logger.info(f"✅ {symbol} backtest tamamlandı")
            logger.info(f"   Toplam Getiri: {result.total_return_pct:.2f}%")
            logger.info(f"   Kazanma Oranı: {result.win_rate:.2f}%")
            logger.info(f"   Max Drawdown: {result.max_drawdown_pct:.2f}%")
            logger.info(f"   Sharpe Ratio: {result.sharpe_ratio:.2f}")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ {symbol} backtest hatası: {e}")
            return self._default_result(symbol, start_date, end_date)
    
    def _get_historical_data(self, symbol: str, start_date: str, end_date: str) -> pd.DataFrame:
        """Tarihsel veri çek"""
        try:
            stock = yf.Ticker(symbol)
            data = stock.history(start=start_date, end=end_date)
            
            if not data.empty:
                # Returns hesapla
                data['Returns'] = data['Close'].pct_change()
                data['Log_Returns'] = np.log(data['Close'] / data['Close'].shift(1))
                
                logger.info(f"📈 {symbol}: {len(data)} günlük veri")
            
            return data
            
        except Exception as e:
            logger.error(f"❌ {symbol} veri çekme hatası: {e}")
            return pd.DataFrame()
    
    def _simulate_trades(self, data: pd.DataFrame, signals: pd.Series, 
                        symbol: str) -> List[Trade]:
        """İşlemleri simüle et"""
        trades = []
        position = None
        capital = self.initial_capital
        
        for date, signal in signals.items():
            if date not in data.index:
                continue
            
            current_price = data.loc[date, 'Close']
            
            if position is None and signal == TradeType.BUY:
                # Pozisyon aç
                quantity = capital / current_price
                position = {
                    'entry_price': current_price,
                    'quantity': quantity,
                    'entry_date': date,
                    'signal_strength': 1.0  # Basit implementasyon
                }
                
            elif position is not None and signal == TradeType.SELL:
                # Pozisyon kapat
                exit_price = current_price
                quantity = position['quantity']
                
                # PnL hesapla
                gross_pnl = (exit_price - position['entry_price']) * quantity
                commission = (position['entry_price'] + exit_price) * quantity * self.commission_rate
                slippage = (position['entry_price'] + exit_price) * quantity * self.slippage_rate
                net_pnl = gross_pnl - commission - slippage
                
                pnl_pct = (exit_price - position['entry_price']) / position['entry_price']
                duration = (date - position['entry_date']).days
                
                trade = Trade(
                    symbol=symbol,
                    trade_type=TradeType.BUY,
                    entry_price=position['entry_price'],
                    exit_price=exit_price,
                    quantity=quantity,
                    entry_date=position['entry_date'],
                    exit_date=date,
                    pnl=net_pnl,
                    pnl_pct=pnl_pct,
                    duration_days=duration,
                    signal_strength=position['signal_strength']
                )
                
                trades.append(trade)
                capital += net_pnl
                position = None
        
        # Açık pozisyon varsa kapat
        if position is not None:
            last_date = data.index[-1]
            last_price = data.loc[last_date, 'Close']
            
            exit_price = last_price
            quantity = position['quantity']
            
            gross_pnl = (exit_price - position['entry_price']) * quantity
            commission = (position['entry_price'] + exit_price) * quantity * self.commission_rate
            slippage = (position['entry_price'] + exit_price) * quantity * self.slippage_rate
            net_pnl = gross_pnl - commission - slippage
            
            pnl_pct = (exit_price - position['entry_price']) / position['entry_price']
            duration = (last_date - position['entry_date']).days
            
            trade = Trade(
                symbol=symbol,
                trade_type=TradeType.BUY,
                entry_price=position['entry_price'],
                exit_price=exit_price,
                quantity=quantity,
                entry_date=position['entry_date'],
                exit_date=last_date,
                pnl=net_pnl,
                pnl_pct=pnl_pct,
                duration_days=duration,
                signal_strength=position['signal_strength']
            )
            
            trades.append(trade)
        
        logger.info(f"📊 {len(trades)} işlem simüle edildi")
        return trades
    
    def _calculate_performance_metrics(self, symbol: str, trades: List[Trade], 
                                     data: pd.DataFrame, start_date: str, 
                                     end_date: str) -> BacktestResult:
        """Performans metriklerini hesapla"""
        try:
            if not trades:
                return self._default_result(symbol, start_date, end_date)
            
            # Temel metrikler
            total_pnl = sum(trade.pnl for trade in trades)
            final_capital = self.initial_capital + total_pnl
            total_return_pct = (final_capital - self.initial_capital) / self.initial_capital * 100
            
            # Kazanma oranı
            winning_trades = [t for t in trades if t.pnl > 0]
            win_rate = len(winning_trades) / len(trades) * 100 if trades else 0
            
            # Ortalama kazanç/zarar
            avg_win = np.mean([t.pnl for t in winning_trades]) if winning_trades else 0
            losing_trades = [t for t in trades if t.pnl < 0]
            avg_loss = np.mean([t.pnl for t in losing_trades]) if losing_trades else 0
            
            # Profit factor
            total_wins = sum(t.pnl for t in winning_trades) if winning_trades else 0
            total_losses = abs(sum(t.pnl for t in losing_trades)) if losing_trades else 0
            profit_factor = total_wins / total_losses if total_losses > 0 else float('inf')
            
            # Equity curve
            equity_curve = self._calculate_equity_curve(trades, data)
            
            # Sharpe ratio
            returns = equity_curve['Returns'].dropna()
            sharpe_ratio = self._calculate_sharpe_ratio(returns)
            
            # Max drawdown
            max_drawdown, max_drawdown_pct = self._calculate_max_drawdown(equity_curve)
            
            # Calmar ratio
            calmar_ratio = self._calculate_calmar_ratio(returns, max_drawdown_pct)
            
            # Monthly returns
            monthly_returns = self._calculate_monthly_returns(equity_curve)
            
            result = BacktestResult(
                symbol=symbol,
                start_date=datetime.strptime(start_date, '%Y-%m-%d'),
                end_date=datetime.strptime(end_date, '%Y-%m-%d'),
                initial_capital=self.initial_capital,
                final_capital=final_capital,
                total_return=total_pnl,
                total_return_pct=total_return_pct,
                trades=trades,
                win_rate=win_rate,
                avg_win=avg_win,
                avg_loss=avg_loss,
                profit_factor=profit_factor,
                sharpe_ratio=sharpe_ratio,
                max_drawdown=max_drawdown,
                max_drawdown_pct=max_drawdown_pct,
                calmar_ratio=calmar_ratio,
                equity_curve=equity_curve,
                monthly_returns=monthly_returns,
                timestamp=datetime.now()
            )
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Performans metrikleri hesaplama hatası: {e}")
            return self._default_result(symbol, start_date, end_date)
    
    def _calculate_equity_curve(self, trades: List[Trade], data: pd.DataFrame) -> pd.DataFrame:
        """Equity curve hesapla"""
        try:
            equity_curve = pd.DataFrame(index=data.index)
            equity_curve['Price'] = data['Close']
            equity_curve['Equity'] = self.initial_capital
            equity_curve['Returns'] = 0.0
            
            cumulative_pnl = 0.0
            
            for trade in trades:
                # Trade tarihinden sonraki tüm günler için equity güncelle
                trade_end_idx = equity_curve.index.get_loc(trade.exit_date)
                cumulative_pnl += trade.pnl
                
                equity_curve.iloc[trade_end_idx:, equity_curve.columns.get_loc('Equity')] = \
                    self.initial_capital + cumulative_pnl
            
            # Returns hesapla
            equity_curve['Returns'] = equity_curve['Equity'].pct_change()
            
            return equity_curve
            
        except Exception as e:
            logger.error(f"❌ Equity curve hesaplama hatası: {e}")
            return pd.DataFrame()
    
    def _calculate_sharpe_ratio(self, returns: pd.Series, risk_free_rate: float = 0.05) -> float:
        """Sharpe ratio hesapla"""
        try:
            if len(returns) == 0 or returns.std() == 0:
                return 0.0
            
            excess_returns = returns.mean() * 252 - risk_free_rate
            volatility = returns.std() * np.sqrt(252)
            
            return excess_returns / volatility if volatility > 0 else 0.0
            
        except Exception as e:
            logger.error(f"❌ Sharpe ratio hesaplama hatası: {e}")
            return 0.0
    
    def _calculate_max_drawdown(self, equity_curve: pd.DataFrame) -> Tuple[float, float]:
        """Maximum drawdown hesapla"""
        try:
            if equity_curve.empty:
                return 0.0, 0.0
            
            equity = equity_curve['Equity']
            peak = equity.expanding().max()
            drawdown = (equity - peak) / peak
            
            max_dd = drawdown.min()
            max_dd_pct = abs(max_dd) * 100
            
            return abs(max_dd), max_dd_pct
            
        except Exception as e:
            logger.error(f"❌ Max drawdown hesaplama hatası: {e}")
            return 0.0, 0.0
    
    def _calculate_calmar_ratio(self, returns: pd.Series, max_drawdown_pct: float) -> float:
        """Calmar ratio hesapla"""
        try:
            if max_drawdown_pct == 0:
                return 0.0
            
            annual_return = returns.mean() * 252 * 100  # Yüzde olarak
            return annual_return / max_drawdown_pct
            
        except Exception as e:
            logger.error(f"❌ Calmar ratio hesaplama hatası: {e}")
            return 0.0
    
    def _calculate_monthly_returns(self, equity_curve: pd.DataFrame) -> pd.Series:
        """Aylık getirileri hesapla"""
        try:
            if equity_curve.empty:
                return pd.Series()
            
            monthly_equity = equity_curve['Equity'].resample('M').last()
            monthly_returns = monthly_equity.pct_change().dropna()
            
            return monthly_returns
            
        except Exception as e:
            logger.error(f"❌ Aylık getiriler hesaplama hatası: {e}")
            return pd.Series()
    
    def _default_result(self, symbol: str, start_date: str, end_date: str) -> BacktestResult:
        """Varsayılan sonuç"""
        return BacktestResult(
            symbol=symbol,
            start_date=datetime.strptime(start_date, '%Y-%m-%d'),
            end_date=datetime.strptime(end_date, '%Y-%m-%d'),
            initial_capital=self.initial_capital,
            final_capital=self.initial_capital,
            total_return=0.0,
            total_return_pct=0.0,
            trades=[],
            win_rate=0.0,
            avg_win=0.0,
            avg_loss=0.0,
            profit_factor=0.0,
            sharpe_ratio=0.0,
            max_drawdown=0.0,
            max_drawdown_pct=0.0,
            calmar_ratio=0.0,
            equity_curve=pd.DataFrame(),
            monthly_returns=pd.Series(),
            timestamp=datetime.now()
        )
    
    def plot_results(self, result: BacktestResult, save_path: str = None):
        """Sonuçları görselleştir"""
        try:
            fig, axes = plt.subplots(2, 2, figsize=(15, 10))
            fig.suptitle(f'{result.symbol} Backtest Results', fontsize=16)
            
            # Equity curve
            if not result.equity_curve.empty:
                axes[0, 0].plot(result.equity_curve.index, result.equity_curve['Equity'])
                axes[0, 0].set_title('Equity Curve')
                axes[0, 0].set_ylabel('Portfolio Value')
                axes[0, 0].grid(True)
            
            # Drawdown
            if not result.equity_curve.empty:
                equity = result.equity_curve['Equity']
                peak = equity.expanding().max()
                drawdown = (equity - peak) / peak * 100
                
                axes[0, 1].fill_between(drawdown.index, drawdown, 0, alpha=0.3, color='red')
                axes[0, 1].set_title('Drawdown')
                axes[0, 1].set_ylabel('Drawdown (%)')
                axes[0, 1].grid(True)
            
            # Monthly returns
            if not result.monthly_returns.empty:
                axes[1, 0].bar(range(len(result.monthly_returns)), result.monthly_returns * 100)
                axes[1, 0].set_title('Monthly Returns')
                axes[1, 0].set_ylabel('Return (%)')
                axes[1, 0].grid(True)
            
            # Performance metrics
            metrics_text = f"""
            Total Return: {result.total_return_pct:.2f}%
            Win Rate: {result.win_rate:.2f}%
            Sharpe Ratio: {result.sharpe_ratio:.2f}
            Max Drawdown: {result.max_drawdown_pct:.2f}%
            Profit Factor: {result.profit_factor:.2f}
            """
            
            axes[1, 1].text(0.1, 0.5, metrics_text, fontsize=12, verticalalignment='center')
            axes[1, 1].set_title('Performance Metrics')
            axes[1, 1].axis('off')
            
            plt.tight_layout()
            
            if save_path:
                plt.savefig(save_path, dpi=300, bbox_inches='tight')
                logger.info(f"📊 Grafik kaydedildi: {save_path}")
            
            plt.show()
            
        except Exception as e:
            logger.error(f"❌ Grafik oluşturma hatası: {e}")

# Sample strategy functions
def simple_ma_strategy(data: pd.DataFrame) -> pd.Series:
    """Basit moving average stratejisi"""
    try:
        signals = pd.Series(TradeType.HOLD, index=data.index)
        
        # SMA hesapla
        sma_20 = data['Close'].rolling(20).mean()
        sma_50 = data['Close'].rolling(50).mean()
        
        # Sinyaller
        buy_signal = (sma_20 > sma_50) & (sma_20.shift(1) <= sma_50.shift(1))
        sell_signal = (sma_20 < sma_50) & (sma_20.shift(1) >= sma_50.shift(1))
        
        signals[buy_signal] = TradeType.BUY
        signals[sell_signal] = TradeType.SELL
        
        return signals
        
    except Exception as e:
        logger.error(f"❌ MA stratejisi hatası: {e}")
        return pd.Series(TradeType.HOLD, index=data.index)

def rsi_strategy(data: pd.DataFrame) -> pd.Series:
    """RSI stratejisi"""
    try:
        signals = pd.Series(TradeType.HOLD, index=data.index)
        
        # RSI hesapla
        delta = data['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        
        # Sinyaller
        buy_signal = (rsi < 30) & (rsi.shift(1) >= 30)
        sell_signal = (rsi > 70) & (rsi.shift(1) <= 70)
        
        signals[buy_signal] = TradeType.BUY
        signals[sell_signal] = TradeType.SELL
        
        return signals
        
    except Exception as e:
        logger.error(f"❌ RSI stratejisi hatası: {e}")
        return pd.Series(TradeType.HOLD, index=data.index)

def test_backtesting_engine():
    """Backtesting engine test"""
    logger.info("🧪 Backtesting Engine test başlıyor...")
    
    engine = BacktestingEngine(initial_capital=100000)
    
    # Test stratejileri
    strategies = {
        'MA Strategy': simple_ma_strategy,
        'RSI Strategy': rsi_strategy
    }
    
    results = {}
    
    for strategy_name, strategy_func in strategies.items():
        logger.info(f"📊 {strategy_name} test ediliyor...")
        
        result = engine.run_backtest(
            symbol="GARAN.IS",
            strategy_func=strategy_func,
            start_date="2023-01-01",
            end_date="2024-01-01"
        )
        
        results[strategy_name] = result
        
        logger.info(f"✅ {strategy_name} tamamlandı:")
        logger.info(f"   Getiri: {result.total_return_pct:.2f}%")
        logger.info(f"   Kazanma Oranı: {result.win_rate:.2f}%")
        logger.info(f"   Sharpe: {result.sharpe_ratio:.2f}")
    
    return results

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    test_backtesting_engine()
