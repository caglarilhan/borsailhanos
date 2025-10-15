#!/usr/bin/env python3
"""
💼 Portfolio Optimizer
Modern Portfolio Theory, Risk Parity, Performance Tracking
"""

import asyncio
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import logging
from dataclasses import dataclass
from enum import Enum
import json

class OptimizationMethod(Enum):
    MEAN_VARIANCE = "Mean Variance"
    RISK_PARITY = "Risk Parity"
    BLACK_LITTERMAN = "Black Litterman"
    MINIMUM_VOLATILITY = "Minimum Volatility"
    MAXIMUM_SHARPE = "Maximum Sharpe"

class RiskModel(Enum):
    HISTORICAL = "Historical"
    FACTOR = "Factor"
    GARCH = "GARCH"
    MONTE_CARLO = "Monte Carlo"

@dataclass
class PortfolioAllocation:
    symbol: str
    weight: float
    expected_return: float
    volatility: float
    sharpe_ratio: float
    beta: float
    alpha: float
    value_at_risk: float
    expected_shortfall: float

@dataclass
class PortfolioMetrics:
    total_return: float
    annualized_return: float
    volatility: float
    sharpe_ratio: float
    sortino_ratio: float
    max_drawdown: float
    calmar_ratio: float
    information_ratio: float
    tracking_error: float
    beta: float
    alpha: float
    value_at_risk_95: float
    expected_shortfall_95: float
    win_rate: float
    profit_factor: float
    ulcer_index: float

@dataclass
class RiskMetrics:
    portfolio_var: float
    component_var: Dict[str, float]
    marginal_var: Dict[str, float]
    incremental_var: Dict[str, float]
    correlation_matrix: Dict[str, Dict[str, float]]
    beta_exposure: Dict[str, float]
    sector_exposure: Dict[str, float]
    factor_exposure: Dict[str, float]

class PortfolioOptimizer:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.risk_free_rate = 0.15  # 15% annual risk-free rate (Turkey)
        self.rebalance_frequency = 'monthly'
        self.lookback_period = 252  # 1 year of trading days
        
        # Market data cache
        self.price_data: Dict[str, pd.DataFrame] = {}
        self.returns_data: Dict[str, pd.Series] = {}
        self.correlation_matrix: Optional[pd.DataFrame] = None
        
        # Portfolio history
        self.portfolio_history: List[Dict[str, Any]] = []

    async def optimize_portfolio(self, symbols: List[str], method: OptimizationMethod = OptimizationMethod.MAXIMUM_SHARPE,
                               constraints: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Optimize portfolio allocation"""
        try:
            # Get historical data
            await self._fetch_historical_data(symbols)
            
            # Calculate returns and correlations
            returns_matrix = self._calculate_returns_matrix(symbols)
            correlation_matrix = returns_matrix.corr()
            covariance_matrix = returns_matrix.cov()
            
            # Calculate expected returns and volatilities
            expected_returns = returns_matrix.mean() * 252  # Annualized
            volatilities = returns_matrix.std() * np.sqrt(252)  # Annualized
            
            # Optimize based on method
            if method == OptimizationMethod.MAXIMUM_SHARPE:
                weights = self._maximize_sharpe_ratio(expected_returns, covariance_matrix)
            elif method == OptimizationMethod.MINIMUM_VOLATILITY:
                weights = self._minimize_volatility(covariance_matrix)
            elif method == OptimizationMethod.RISK_PARITY:
                weights = self._risk_parity_allocation(covariance_matrix)
            else:
                weights = self._equal_weight_allocation(symbols)
            
            # Apply constraints
            if constraints:
                weights = self._apply_constraints(weights, constraints)
            
            # Calculate portfolio metrics
            portfolio_metrics = self._calculate_portfolio_metrics(weights, expected_returns, covariance_matrix)
            
            # Create allocation objects
            allocations = []
            for i, symbol in enumerate(symbols):
                allocation = PortfolioAllocation(
                    symbol=symbol,
                    weight=weights[i],
                    expected_return=expected_returns[symbol],
                    volatility=volatilities[symbol],
                    sharpe_ratio=(expected_returns[symbol] - self.risk_free_rate) / volatilities[symbol],
                    beta=self._calculate_beta(symbol, returns_matrix),
                    alpha=self._calculate_alpha(symbol, returns_matrix),
                    value_at_risk=self._calculate_var(symbol, returns_matrix),
                    expected_shortfall=self._calculate_expected_shortfall(symbol, returns_matrix)
                )
                allocations.append(allocation)
            
            return {
                'method': method.value,
                'allocations': [allocation.__dict__ for allocation in allocations],
                'portfolio_metrics': portfolio_metrics.__dict__,
                'correlation_matrix': correlation_matrix.to_dict(),
                'optimization_date': datetime.now().isoformat(),
                'constraints_applied': constraints or {}
            }
            
        except Exception as e:
            self.logger.error(f"Error optimizing portfolio: {e}")
            return {}

    async def _fetch_historical_data(self, symbols: List[str]):
        """Fetch historical price data for symbols"""
        for symbol in symbols:
            if symbol not in self.price_data:
                # Generate mock historical data
                dates = pd.date_range(start='2023-01-01', end='2024-12-31', freq='D')
                base_price = 100.0 + (hash(symbol) % 200)
                
                prices = []
                for date in dates:
                    # Generate price with trend and noise
                    days_diff = (date - dates[0]).days
                    trend = days_diff * 0.001
                    noise = np.random.normal(0, 0.02)
                    price = base_price * (1 + trend + noise)
                    prices.append(price)
                
                self.price_data[symbol] = pd.DataFrame({
                    'date': dates,
                    'close': prices
                }).set_index('date')
                
                # Calculate returns
                self.returns_data[symbol] = self.price_data[symbol]['close'].pct_change().dropna()

    def _calculate_returns_matrix(self, symbols: List[str]) -> pd.DataFrame:
        """Calculate returns matrix for all symbols"""
        returns_data = {}
        
        for symbol in symbols:
            if symbol in self.returns_data:
                returns_data[symbol] = self.returns_data[symbol]
        
        # Align all series to same dates
        returns_df = pd.DataFrame(returns_data)
        returns_df = returns_df.dropna()
        
        return returns_df

    def _maximize_sharpe_ratio(self, expected_returns: pd.Series, covariance_matrix: pd.DataFrame) -> np.ndarray:
        """Maximize Sharpe ratio using quadratic programming"""
        n_assets = len(expected_returns)
        
        # Simple equal weight for demonstration
        # In real implementation, use scipy.optimize.minimize
        weights = np.ones(n_assets) / n_assets
        
        # Add some optimization logic (simplified)
        for i in range(n_assets):
            if expected_returns.iloc[i] > expected_returns.mean():
                weights[i] *= 1.2
            else:
                weights[i] *= 0.8
        
        # Normalize weights
        weights = weights / weights.sum()
        
        return weights

    def _minimize_volatility(self, covariance_matrix: pd.DataFrame) -> np.ndarray:
        """Minimize portfolio volatility"""
        n_assets = len(covariance_matrix)
        
        # Simple inverse volatility weighting
        volatilities = np.sqrt(np.diag(covariance_matrix))
        inv_vol = 1 / volatilities
        weights = inv_vol / inv_vol.sum()
        
        return weights

    def _risk_parity_allocation(self, covariance_matrix: pd.DataFrame) -> np.ndarray:
        """Risk parity allocation"""
        n_assets = len(covariance_matrix)
        
        # Equal risk contribution
        weights = np.ones(n_assets) / n_assets
        
        # Adjust for volatility
        volatilities = np.sqrt(np.diag(covariance_matrix))
        inv_vol = 1 / volatilities
        weights = inv_vol / inv_vol.sum()
        
        return weights

    def _equal_weight_allocation(self, symbols: List[str]) -> np.ndarray:
        """Equal weight allocation"""
        n_assets = len(symbols)
        return np.ones(n_assets) / n_assets

    def _apply_constraints(self, weights: np.ndarray, constraints: Dict[str, Any]) -> np.ndarray:
        """Apply portfolio constraints"""
        # Max weight constraint
        max_weight = constraints.get('max_weight', 0.4)
        weights = np.minimum(weights, max_weight)
        
        # Min weight constraint
        min_weight = constraints.get('min_weight', 0.0)
        weights = np.maximum(weights, min_weight)
        
        # Normalize
        weights = weights / weights.sum()
        
        return weights

    def _calculate_portfolio_metrics(self, weights: np.ndarray, expected_returns: pd.Series, 
                                   covariance_matrix: pd.DataFrame) -> PortfolioMetrics:
        """Calculate portfolio performance metrics"""
        # Portfolio expected return
        portfolio_return = np.dot(weights, expected_returns)
        
        # Portfolio volatility
        portfolio_variance = np.dot(weights, np.dot(covariance_matrix, weights))
        portfolio_volatility = np.sqrt(portfolio_variance)
        
        # Sharpe ratio
        sharpe_ratio = (portfolio_return - self.risk_free_rate) / portfolio_volatility
        
        # Mock other metrics
        return PortfolioMetrics(
            total_return=portfolio_return,
            annualized_return=portfolio_return,
            volatility=portfolio_volatility,
            sharpe_ratio=sharpe_ratio,
            sortino_ratio=sharpe_ratio * 1.1,  # Mock
            max_drawdown=0.15,  # Mock
            calmar_ratio=portfolio_return / 0.15,  # Mock
            information_ratio=0.5,  # Mock
            tracking_error=0.1,  # Mock
            beta=1.0,  # Mock
            alpha=0.02,  # Mock
            value_at_risk_95=portfolio_volatility * 1.645,  # 95% VaR
            expected_shortfall_95=portfolio_volatility * 2.0,  # Mock
            win_rate=0.65,  # Mock
            profit_factor=1.5,  # Mock
            ulcer_index=0.05  # Mock
        )

    def _calculate_beta(self, symbol: str, returns_matrix: pd.DataFrame) -> float:
        """Calculate beta for symbol"""
        if symbol not in returns_matrix.columns:
            return 1.0
        
        # Mock beta calculation
        return 0.8 + (hash(symbol) % 40) / 100  # Random beta between 0.8-1.2

    def _calculate_alpha(self, symbol: str, returns_matrix: pd.DataFrame) -> float:
        """Calculate alpha for symbol"""
        if symbol not in returns_matrix.columns:
            return 0.0
        
        # Mock alpha calculation
        return (hash(symbol) % 20 - 10) / 1000  # Random alpha between -1% and 1%

    def _calculate_var(self, symbol: str, returns_matrix: pd.DataFrame, confidence: float = 0.95) -> float:
        """Calculate Value at Risk"""
        if symbol not in returns_matrix.columns:
            return 0.05
        
        returns = returns_matrix[symbol].dropna()
        var_percentile = (1 - confidence) * 100
        var = np.percentile(returns, var_percentile)
        
        return abs(var)

    def _calculate_expected_shortfall(self, symbol: str, returns_matrix: pd.DataFrame, confidence: float = 0.95) -> float:
        """Calculate Expected Shortfall (Conditional VaR)"""
        if symbol not in returns_matrix.columns:
            return 0.05
        
        returns = returns_matrix[symbol].dropna()
        var = self._calculate_var(symbol, returns_matrix, confidence)
        
        # Expected shortfall is average of returns below VaR
        tail_returns = returns[returns <= -var]
        expected_shortfall = tail_returns.mean() if len(tail_returns) > 0 else var
        
        return abs(expected_shortfall)

    async def backtest_portfolio(self, symbols: List[str], start_date: str, end_date: str,
                               rebalance_frequency: str = 'monthly') -> Dict[str, Any]:
        """Backtest portfolio strategy"""
        try:
            # Generate mock backtest results
            start = datetime.fromisoformat(start_date)
            end = datetime.fromisoformat(end_date)
            
            # Mock portfolio performance
            total_days = (end - start).days
            daily_returns = np.random.normal(0.0008, 0.02, total_days)  # ~20% annual return, 2% daily vol
            
            # Calculate cumulative returns
            cumulative_returns = np.cumprod(1 + daily_returns)
            portfolio_values = 100000 * cumulative_returns  # Start with 100K
            
            # Calculate metrics
            total_return = (portfolio_values[-1] / portfolio_values[0]) - 1
            annualized_return = (1 + total_return) ** (365 / total_days) - 1
            volatility = np.std(daily_returns) * np.sqrt(252)
            sharpe_ratio = (annualized_return - self.risk_free_rate) / volatility
            
            # Calculate drawdown
            peak = np.maximum.accumulate(portfolio_values)
            drawdown = (portfolio_values - peak) / peak
            max_drawdown = abs(drawdown.min())
            
            return {
                'start_date': start_date,
                'end_date': end_date,
                'initial_value': 100000,
                'final_value': portfolio_values[-1],
                'total_return': total_return,
                'annualized_return': annualized_return,
                'volatility': volatility,
                'sharpe_ratio': sharpe_ratio,
                'max_drawdown': max_drawdown,
                'win_rate': 0.65,  # Mock
                'profit_factor': 1.5,  # Mock
                'daily_returns': daily_returns.tolist(),
                'portfolio_values': portfolio_values.tolist(),
                'drawdown': drawdown.tolist(),
                'rebalance_frequency': rebalance_frequency,
                'symbols': symbols
            }
            
        except Exception as e:
            self.logger.error(f"Error backtesting portfolio: {e}")
            return {}

    async def calculate_risk_metrics(self, symbols: List[str], weights: Optional[np.ndarray] = None) -> RiskMetrics:
        """Calculate comprehensive risk metrics"""
        try:
            if weights is None:
                weights = np.ones(len(symbols)) / len(symbols)
            
            # Get returns data
            returns_matrix = self._calculate_returns_matrix(symbols)
            covariance_matrix = returns_matrix.cov()
            
            # Portfolio variance
            portfolio_var = np.dot(weights, np.dot(covariance_matrix, weights))
            
            # Component VaR
            component_var = {}
            for i, symbol in enumerate(symbols):
                component_var[symbol] = weights[i] * np.sqrt(covariance_matrix.iloc[i, i])
            
            # Marginal VaR
            marginal_var = {}
            for i, symbol in enumerate(symbols):
                marginal_var[symbol] = np.dot(covariance_matrix.iloc[i, :], weights) / np.sqrt(portfolio_var)
            
            # Incremental VaR
            incremental_var = {}
            for i, symbol in enumerate(symbols):
                # VaR without this asset
                weights_without = weights.copy()
                weights_without[i] = 0
                weights_without = weights_without / weights_without.sum()
                var_without = np.dot(weights_without, np.dot(covariance_matrix, weights_without))
                incremental_var[symbol] = np.sqrt(portfolio_var) - np.sqrt(var_without)
            
            # Correlation matrix
            correlation_matrix = returns_matrix.corr().to_dict()
            
            # Beta exposure
            beta_exposure = {}
            for symbol in symbols:
                beta_exposure[symbol] = self._calculate_beta(symbol, returns_matrix)
            
            # Mock sector and factor exposures
            sector_exposure = {symbol: 'Technology' for symbol in symbols}
            factor_exposure = {symbol: {'market': 1.0, 'size': 0.5, 'value': 0.3} for symbol in symbols}
            
            return RiskMetrics(
                portfolio_var=portfolio_var,
                component_var=component_var,
                marginal_var=marginal_var,
                incremental_var=incremental_var,
                correlation_matrix=correlation_matrix,
                beta_exposure=beta_exposure,
                sector_exposure=sector_exposure,
                factor_exposure=factor_exposure
            )
            
        except Exception as e:
            self.logger.error(f"Error calculating risk metrics: {e}")
            return RiskMetrics(
                portfolio_var=0.0,
                component_var={},
                marginal_var={},
                incremental_var={},
                correlation_matrix={},
                beta_exposure={},
                sector_exposure={},
                factor_exposure={}
            )

    async def get_efficient_frontier(self, symbols: List[str], num_portfolios: int = 50) -> Dict[str, Any]:
        """Generate efficient frontier"""
        try:
            # Get returns data
            returns_matrix = self._calculate_returns_matrix(symbols)
            expected_returns = returns_matrix.mean() * 252
            covariance_matrix = returns_matrix.cov() * 252
            
            # Generate random portfolios
            portfolios = []
            for _ in range(num_portfolios):
                weights = np.random.random(len(symbols))
                weights = weights / weights.sum()
                
                portfolio_return = np.dot(weights, expected_returns)
                portfolio_variance = np.dot(weights, np.dot(covariance_matrix, weights))
                portfolio_volatility = np.sqrt(portfolio_variance)
                sharpe_ratio = (portfolio_return - self.risk_free_rate) / portfolio_volatility
                
                portfolios.append({
                    'weights': weights.tolist(),
                    'expected_return': portfolio_return,
                    'volatility': portfolio_volatility,
                    'sharpe_ratio': sharpe_ratio
                })
            
            # Sort by volatility
            portfolios.sort(key=lambda x: x['volatility'])
            
            return {
                'portfolios': portfolios,
                'symbols': symbols,
                'risk_free_rate': self.risk_free_rate,
                'generated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error generating efficient frontier: {e}")
            return {}

    async def rebalance_portfolio(self, current_weights: Dict[str, float], 
                                target_weights: Dict[str, float], 
                                portfolio_value: float) -> List[Dict[str, Any]]:
        """Generate rebalancing trades"""
        try:
            trades = []
            
            for symbol in set(current_weights.keys()) | set(target_weights.keys()):
                current_weight = current_weights.get(symbol, 0.0)
                target_weight = target_weights.get(symbol, 0.0)
                
                if abs(current_weight - target_weight) > 0.01:  # 1% threshold
                    current_value = current_weight * portfolio_value
                    target_value = target_weight * portfolio_value
                    trade_value = target_value - current_value
                    
                    if abs(trade_value) > 1000:  # Minimum trade size
                        trades.append({
                            'symbol': symbol,
                            'action': 'BUY' if trade_value > 0 else 'SELL',
                            'value': abs(trade_value),
                            'current_weight': current_weight,
                            'target_weight': target_weight,
                            'weight_change': target_weight - current_weight
                        })
            
            return trades
            
        except Exception as e:
            self.logger.error(f"Error generating rebalancing trades: {e}")
            return []

    async def get_performance_attribution(self, portfolio_returns: List[float], 
                                        benchmark_returns: List[float]) -> Dict[str, Any]:
        """Analyze performance attribution"""
        try:
            portfolio_returns = np.array(portfolio_returns)
            benchmark_returns = np.array(benchmark_returns)
            
            # Calculate excess returns
            excess_returns = portfolio_returns - benchmark_returns
            
            # Performance metrics
            total_excess_return = np.sum(excess_returns)
            tracking_error = np.std(excess_returns) * np.sqrt(252)
            information_ratio = np.mean(excess_returns) / np.std(excess_returns) * np.sqrt(252)
            
            # Attribution analysis
            active_return = np.mean(excess_returns) * 252
            selection_effect = active_return * 0.6  # Mock
            allocation_effect = active_return * 0.4  # Mock
            
            return {
                'total_excess_return': total_excess_return,
                'active_return': active_return,
                'tracking_error': tracking_error,
                'information_ratio': information_ratio,
                'selection_effect': selection_effect,
                'allocation_effect': allocation_effect,
                'interaction_effect': active_return - selection_effect - allocation_effect
            }
            
        except Exception as e:
            self.logger.error(f"Error calculating performance attribution: {e}")
            return {}

# Global instance
portfolio_optimizer = PortfolioOptimizer()
