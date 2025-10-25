#!/usr/bin/env python3
"""
Backtesting Engine - Strategy Testing
Kullanıcının geçmiş sinyallerini test etme motoru
"""

import json
from datetime import datetime, timedelta
import random

class BacktestEngine:
    """
    Backtest motoru - stratejileri geçmiş veri ile test et
    """
    
    def __init__(self):
        self.initial_capital = 100000
        self.commission_rate = 0.001  # %0.1
    
    def run_backtest(self, symbol: str, strategy: str, start_date: str, end_date: str):
        """
        Backtest çalıştır
        
        Args:
            symbol: Test edilecek hisse
            strategy: 'momentum', 'mean_reversion', 'breakout'
            start_date: Başlangıç tarihi
            end_date: Bitiş tarihi
        
        Returns:
            dict: Backtest sonuçları
        """
        print(f"🧪 Backtesting {symbol} with {strategy} strategy")
        print("=" * 60)
        
        # Mock historical data
        trades = self._simulate_trades(symbol, strategy, 252)  # 1 yıl
        
        # Calculate metrics
        total_trades = len(trades)
        winning_trades = len([t for t in trades if t['pnl'] > 0])
        losing_trades = len([t for t in trades if t['pnl'] < 0])
        
        total_pnl = sum(t['pnl'] for t in trades)
        total_return = (total_pnl / self.initial_capital) * 100
        
        win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
        
        avg_win = sum(t['pnl'] for t in trades if t['pnl'] > 0) / winning_trades if winning_trades > 0 else 0
        avg_loss = sum(t['pnl'] for t in trades if t['pnl'] < 0) / losing_trades if losing_trades > 0 else 0
        
        profit_factor = abs(avg_win / avg_loss) if avg_loss != 0 else 0
        
        # Sharpe Ratio (simplified)
        returns = [t['return'] for t in trades]
        avg_return = sum(returns) / len(returns) if returns else 0
        std_return = (sum((r - avg_return)**2 for r in returns) / len(returns))**0.5 if returns else 0
        sharpe = (avg_return / std_return) if std_return > 0 else 0
        
        # Max Drawdown
        max_dd = self._calculate_max_drawdown(trades)
        
        return {
            'symbol': symbol,
            'strategy': strategy,
            'period': f'{start_date} to {end_date}',
            'summary': {
                'total_trades': total_trades,
                'winning_trades': winning_trades,
                'losing_trades': losing_trades,
                'win_rate': round(win_rate, 2),
                'total_return': round(total_return, 2),
                'profit_factor': round(profit_factor, 2),
                'sharpe_ratio': round(sharpe, 2),
                'max_drawdown': round(max_dd, 2)
            },
            'trades': trades[:10],  # İlk 10 trade
            'equity_curve': self._generate_equity_curve(trades),
            'timestamp': datetime.now().isoformat()
        }
    
    def _simulate_trades(self, symbol: str, strategy: str, days: int):
        """
        Trade simulasyonu
        """
        trades = []
        capital = self.initial_capital
        
        for i in range(days // 5):  # Her 5 günde 1 trade
            entry_price = 245 + random.uniform(-10, 10)
            exit_price = entry_price * (1 + random.gauss(0.01, 0.03))
            
            quantity = int(capital * 0.1 / entry_price)  # %10 risk
            
            pnl = (exit_price - entry_price) * quantity
            pnl -= abs(pnl) * self.commission_rate  # Komisyon
            
            capital += pnl
            
            trades.append({
                'entry_date': (datetime.now() - timedelta(days=days-i*5)).strftime('%Y-%m-%d'),
                'exit_date': (datetime.now() - timedelta(days=days-i*5-3)).strftime('%Y-%m-%d'),
                'entry_price': round(entry_price, 2),
                'exit_price': round(exit_price, 2),
                'quantity': quantity,
                'pnl': round(pnl, 2),
                'return': round((exit_price - entry_price) / entry_price * 100, 2),
                'capital': round(capital, 2)
            })
        
        return trades
    
    def _calculate_max_drawdown(self, trades: list):
        """
        Maximum drawdown hesapla
        """
        equity = [self.initial_capital]
        for trade in trades:
            equity.append(equity[-1] + trade['pnl'])
        
        peak = equity[0]
        max_dd = 0
        
        for value in equity:
            if value > peak:
                peak = value
            dd = (value - peak) / peak * 100
            if dd < max_dd:
                max_dd = dd
        
        return max_dd
    
    def _generate_equity_curve(self, trades: list):
        """
        Equity curve data
        """
        curve = []
        equity = self.initial_capital
        
        for trade in trades:
            equity += trade['pnl']
            curve.append({
                'date': trade['exit_date'],
                'equity': round(equity, 2)
            })
        
        return curve

# Global instance
backtest_engine = BacktestEngine()

if __name__ == '__main__':
    # Test
    print("🧪 Backtest Engine Test")
    print("=" * 60)
    
    result = backtest_engine.run_backtest(
        'THYAO',
        'momentum',
        '2024-01-01',
        '2025-01-01'
    )
    
    print("\n📊 Backtest Results:")
    print(json.dumps(result['summary'], indent=2))
    
    print(f"\n💰 Final Capital: ₺{result['trades'][-1]['capital'] if result['trades'] else 0:,.2f}")
