#!/usr/bin/env python3
"""
Auto-Backtest System - vectorbt-pro ile gelişmiş backtesting
"""

import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import json
import warnings
warnings.filterwarnings('ignore')

try:
    import vectorbt as vbt
    VBT_AVAILABLE = True
except ImportError:
    VBT_AVAILABLE = False
    print("⚠️ vectorbt not available, using fallback backtesting")

try:
    from backtesting import Backtest, Strategy
    from backtesting.lib import crossover
    BACKTESTING_AVAILABLE = True
except ImportError:
    BACKTESTING_AVAILABLE = False
    print("⚠️ backtesting.py not available, using simple backtesting")

class AutoBacktestSystem:
    """Otomatik backtest sistemi - vectorbt-pro ve backtesting.py ile"""
    
    def __init__(self):
        self.vbt_available = VBT_AVAILABLE
        self.backtesting_available = BACKTESTING_AVAILABLE
        self.results_cache = {}
        self.strategies = {
            'ema_cross': self._ema_cross_strategy,
            'rsi_mean_reversion': self._rsi_mean_reversion_strategy,
            'bollinger_bands': self._bollinger_bands_strategy,
            'macd_momentum': self._macd_momentum_strategy,
            'multi_signal': self._multi_signal_strategy
        }
        
    def get_price_data(self, symbol: str, period: str = "2y") -> pd.DataFrame:
        """Hisse fiyat verilerini çek"""
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period=period)
            
            if data.empty:
                return pd.DataFrame()
                
            # Veri temizleme
            data = data.dropna()
            data.columns = [col.lower() for col in data.columns]
            
            return data
        except Exception as e:
            print(f"❌ {symbol} veri çekme hatası: {e}")
            return pd.DataFrame()
    
    def _calculate_indicators(self, data: pd.DataFrame) -> pd.DataFrame:
        """Teknik göstergeleri hesapla"""
        df = data.copy()
        
        # EMA'lar
        df['ema_20'] = df['close'].ewm(span=20).mean()
        df['ema_50'] = df['close'].ewm(span=50).mean()
        
        # RSI
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))
        
        # MACD
        ema_12 = df['close'].ewm(span=12).mean()
        ema_26 = df['close'].ewm(span=26).mean()
        df['macd'] = ema_12 - ema_26
        df['macd_signal'] = df['macd'].ewm(span=9).mean()
        
        # Bollinger Bands
        df['bb_middle'] = df['close'].rolling(window=20).mean()
        bb_std = df['close'].rolling(window=20).std()
        df['bb_upper'] = df['bb_middle'] + (bb_std * 2)
        df['bb_lower'] = df['bb_middle'] - (bb_std * 2)
        
        # Volatilite
        df['volatility'] = df['close'].pct_change().rolling(window=20).std() * np.sqrt(252)
        
        return df
    
    def _ema_cross_strategy(self, data: pd.DataFrame) -> pd.DataFrame:
        """EMA Cross stratejisi"""
        df = data.copy()
        
        # Sinyaller
        df['signal'] = 0
        df.loc[df['ema_20'] > df['ema_50'], 'signal'] = 1  # BUY
        df.loc[df['ema_20'] < df['ema_50'], 'signal'] = -1  # SELL
        
        # Pozisyon değişimleri
        df['position'] = df['signal'].diff()
        
        return df
    
    def _rsi_mean_reversion_strategy(self, data: pd.DataFrame) -> pd.DataFrame:
        """RSI Mean Reversion stratejisi"""
        df = data.copy()
        
        # Sinyaller
        df['signal'] = 0
        df.loc[df['rsi'] < 30, 'signal'] = 1   # Oversold - BUY
        df.loc[df['rsi'] > 70, 'signal'] = -1  # Overbought - SELL
        
        # Pozisyon değişimleri
        df['position'] = df['signal'].diff()
        
        return df
    
    def _bollinger_bands_strategy(self, data: pd.DataFrame) -> pd.DataFrame:
        """Bollinger Bands stratejisi"""
        df = data.copy()
        
        # Sinyaller
        df['signal'] = 0
        df.loc[df['close'] < df['bb_lower'], 'signal'] = 1   # BUY
        df.loc[df['close'] > df['bb_upper'], 'signal'] = -1  # SELL
        
        # Pozisyon değişimleri
        df['position'] = df['signal'].diff()
        
        return df
    
    def _macd_momentum_strategy(self, data: pd.DataFrame) -> pd.DataFrame:
        """MACD Momentum stratejisi"""
        df = data.copy()
        
        # Sinyaller
        df['signal'] = 0
        df.loc[df['macd'] > df['macd_signal'], 'signal'] = 1   # BUY
        df.loc[df['macd'] < df['macd_signal'], 'signal'] = -1  # SELL
        
        # Pozisyon değişimleri
        df['position'] = df['signal'].diff()
        
        return df
    
    def _multi_signal_strategy(self, data: pd.DataFrame) -> pd.DataFrame:
        """Çoklu sinyal stratejisi"""
        df = data.copy()
        
        # Her stratejiden sinyal al
        ema_df = self._ema_cross_strategy(df)
        rsi_df = self._rsi_mean_reversion_strategy(df)
        bb_df = self._bollinger_bands_strategy(df)
        macd_df = self._macd_momentum_strategy(df)
        
        # Sinyalleri birleştir
        df['ema_signal'] = ema_df['signal']
        df['rsi_signal'] = rsi_df['signal']
        df['bb_signal'] = bb_df['signal']
        df['macd_signal'] = macd_df['signal']
        
        # Ağırlıklı sinyal
        df['signal'] = (
            df['ema_signal'] * 0.3 +
            df['rsi_signal'] * 0.25 +
            df['bb_signal'] * 0.25 +
            df['macd_signal'] * 0.2
        )
        
        # Sinyali yuvarla
        df['signal'] = df['signal'].round()
        df['position'] = df['signal'].diff()
        
        return df
    
    def calculate_performance_metrics(self, df: pd.DataFrame, initial_capital: float = 10000) -> Dict[str, Any]:
        """Performans metriklerini hesapla"""
        if df.empty or 'signal' not in df.columns:
            return {}
        
        # Basit performans hesaplama
        df['returns'] = df['close'].pct_change()
        df['strategy_returns'] = df['signal'].shift(1) * df['returns']
        
        # Kümülatif getiri
        df['cumulative_returns'] = (1 + df['returns']).cumprod()
        df['cumulative_strategy_returns'] = (1 + df['strategy_returns']).cumprod()
        
        # Performans metrikleri
        total_return = df['cumulative_strategy_returns'].iloc[-1] - 1
        annual_return = (1 + total_return) ** (252 / len(df)) - 1
        
        # Volatilite
        volatility = df['strategy_returns'].std() * np.sqrt(252)
        
        # Sharpe Ratio
        risk_free_rate = 0.02  # %2 risk-free rate
        sharpe_ratio = (annual_return - risk_free_rate) / volatility if volatility > 0 else 0
        
        # Max Drawdown
        cumulative = df['cumulative_strategy_returns']
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max
        max_drawdown = drawdown.min()
        
        # Win Rate
        winning_trades = (df['strategy_returns'] > 0).sum()
        total_trades = (df['strategy_returns'] != 0).sum()
        win_rate = winning_trades / total_trades if total_trades > 0 else 0
        
        # Profit Factor
        gross_profit = df[df['strategy_returns'] > 0]['strategy_returns'].sum()
        gross_loss = abs(df[df['strategy_returns'] < 0]['strategy_returns'].sum())
        profit_factor = gross_profit / gross_loss if gross_loss > 0 else float('inf')
        
        return {
            'total_return': total_return,
            'annual_return': annual_return,
            'volatility': volatility,
            'sharpe_ratio': sharpe_ratio,
            'max_drawdown': max_drawdown,
            'win_rate': win_rate,
            'profit_factor': profit_factor,
            'total_trades': total_trades,
            'winning_trades': winning_trades,
            'losing_trades': total_trades - winning_trades,
            'final_value': initial_capital * (1 + total_return)
        }
    
    def run_backtest(self, symbol: str, strategy: str = 'multi_signal', 
                    period: str = "1y", initial_capital: float = 10000) -> Dict[str, Any]:
        """Backtest çalıştır"""
        try:
            # Veri çek
            data = self.get_price_data(symbol, period)
            if data.empty:
                return {'error': f'{symbol} için veri bulunamadı'}
            
            # Göstergeleri hesapla
            df = self._calculate_indicators(data)
            
            # Stratejiyi uygula
            if strategy not in self.strategies:
                return {'error': f'Bilinmeyen strateji: {strategy}'}
            
            df = self.strategies[strategy](df)
            
            # Performans metriklerini hesapla
            metrics = self.calculate_performance_metrics(df, initial_capital)
            
            # Sonuçları hazırla
            result = {
                'symbol': symbol,
                'strategy': strategy,
                'period': period,
                'initial_capital': initial_capital,
                'start_date': df.index[0].strftime('%Y-%m-%d'),
                'end_date': df.index[-1].strftime('%Y-%m-%d'),
                'total_days': len(df),
                'metrics': metrics,
                'data_points': len(df),
                'backtest_date': datetime.now().isoformat(),
                'success': True
            }
            
            # Cache'e kaydet
            cache_key = f"{symbol}_{strategy}_{period}"
            self.results_cache[cache_key] = result
            
            return result
            
        except Exception as e:
            return {
                'error': f'Backtest hatası: {str(e)}',
                'symbol': symbol,
                'strategy': strategy,
                'success': False
            }
    
    def run_walk_forward_analysis(self, symbol: str, strategy: str = 'multi_signal',
                                 period: str = "2y", window_size: int = 252, 
                                 step_size: int = 63) -> Dict[str, Any]:
        """Walk Forward Analysis"""
        try:
            # Veri çek
            data = self.get_price_data(symbol, period)
            if data.empty:
                return {'error': f'{symbol} için veri bulunamadı'}
            
            results = []
            total_days = len(data)
            
            for start_idx in range(0, total_days - window_size, step_size):
                end_idx = start_idx + window_size
                
                if end_idx >= total_days:
                    break
                
                # Pencere verisi
                window_data = data.iloc[start_idx:end_idx]
                
                # Göstergeleri hesapla
                df = self._calculate_indicators(window_data)
                
                # Stratejiyi uygula
                df = self.strategies[strategy](df)
                
                # Performans metriklerini hesapla
                metrics = self.calculate_performance_metrics(df, 10000)
                
                results.append({
                    'start_date': window_data.index[0].strftime('%Y-%m-%d'),
                    'end_date': window_data.index[-1].strftime('%Y-%m-%d'),
                    'metrics': metrics
                })
            
            # Ortalama performans
            if results:
                avg_metrics = {}
                for key in results[0]['metrics'].keys():
                    if isinstance(results[0]['metrics'][key], (int, float)):
                        avg_metrics[key] = np.mean([r['metrics'][key] for r in results])
                
                return {
                    'symbol': symbol,
                    'strategy': strategy,
                    'period': period,
                    'window_size': window_size,
                    'step_size': step_size,
                    'total_windows': len(results),
                    'results': results,
                    'average_metrics': avg_metrics,
                    'analysis_date': datetime.now().isoformat(),
                    'success': True
                }
            else:
                return {'error': 'Walk forward analysis için yeterli veri yok'}
                
        except Exception as e:
            return {
                'error': f'Walk forward analysis hatası: {str(e)}',
                'symbol': symbol,
                'strategy': strategy,
                'success': False
            }
    
    def compare_strategies(self, symbol: str, period: str = "1y") -> Dict[str, Any]:
        """Stratejileri karşılaştır"""
        try:
            results = {}
            
            for strategy_name in self.strategies.keys():
                result = self.run_backtest(symbol, strategy_name, period)
                if result.get('success'):
                    results[strategy_name] = result['metrics']
            
            if not results:
                return {'error': 'Hiçbir strateji başarılı olmadı'}
            
            # En iyi stratejiyi bul
            best_strategy = max(results.keys(), key=lambda x: results[x]['sharpe_ratio'])
            
            return {
                'symbol': symbol,
                'period': period,
                'strategies': results,
                'best_strategy': best_strategy,
                'best_metrics': results[best_strategy],
                'comparison_date': datetime.now().isoformat(),
                'success': True
            }
            
        except Exception as e:
            return {
                'error': f'Strateji karşılaştırma hatası: {str(e)}',
                'symbol': symbol,
                'success': False
            }
    
    def get_available_strategies(self) -> List[str]:
        """Mevcut stratejileri listele"""
        return list(self.strategies.keys())
    
    def get_backtest_history(self) -> Dict[str, Any]:
        """Backtest geçmişini getir"""
        return {
            'total_backtests': len(self.results_cache),
            'cache_keys': list(self.results_cache.keys()),
            'last_updated': datetime.now().isoformat()
        }
    
    def export_backtest_report(self, symbol: str, strategy: str, format: str = 'json') -> Dict[str, Any]:
        """Backtest raporunu export et"""
        try:
            cache_key = f"{symbol}_{strategy}_1y"
            if cache_key not in self.results_cache:
                # Backtest çalıştır
                result = self.run_backtest(symbol, strategy)
                if not result.get('success'):
                    return {'error': 'Backtest başarısız'}
            else:
                result = self.results_cache[cache_key]
            
            if format == 'json':
                return {
                    'success': True,
                    'format': 'json',
                    'data': result,
                    'export_date': datetime.now().isoformat()
                }
            elif format == 'csv':
                # CSV format için metrics'i düzleştir
                flat_data = {
                    'symbol': result['symbol'],
                    'strategy': result['strategy'],
                    'period': result['period'],
                    'start_date': result['start_date'],
                    'end_date': result['end_date'],
                    **result['metrics']
                }
                
                return {
                    'success': True,
                    'format': 'csv',
                    'data': flat_data,
                    'export_date': datetime.now().isoformat()
                }
            else:
                return {'error': 'Desteklenmeyen format'}
                
        except Exception as e:
            return {
                'error': f'Export hatası: {str(e)}',
                'success': False
            }
