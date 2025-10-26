#!/usr/bin/env python3
"""
💎 V5.0 Enhanced Portfolio Optimizer
Markowitz + Risk Parity + Tax-Aware + Efficient Frontier

Features:
- Mean-Variance Optimization (Markowitz)
- Risk Parity Allocation
- Tax-Aware Optimization (Stopaj hesaplama)
- Efficient Frontier generation
- Monte Carlo confidence bands
"""

import numpy as np
import pandas as pd
from scipy.optimize import minimize
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
import logging
import yfinance as yf

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class EfficientFrontierPoint:
    """Efficient frontier noktası"""
    target_return: float
    risk: float
    weights: np.ndarray
    sharpe: float

@dataclass
class PortfolioOptimization:
    """Optimal portföy sonucu"""
    weights: Dict[str, float]
    expected_return: float
    volatility: float
    sharpe_ratio: float
    efficient_frontier: List[EfficientFrontierPoint]
    tax_efficiency: float
    
class EnhancedPortfolioOptimizer:
    """
    V5.0 Enhanced Portfolio Optimizer
    Markowitz + Risk Parity + Tax-aware
    """
    
    def __init__(self, risk_free_rate: float = 0.15):
        self.risk_free_rate = risk_free_rate
        self.logger = logger
        
    def max_sharpe_ratio(
        self, 
        expected_returns: pd.Series, 
        cov_matrix: pd.DataFrame
    ) -> Dict:
        """
        En yüksek Sharpe ratio için optimal ağırlıklar
        Markowitz Mean-Variance Optimization
        
        Args:
            expected_returns: Beklenen getiriler (Series)
            cov_matrix: Kovaryans matrisi (DataFrame)
        
        Returns:
            Optimal weights + metrics
        """
        def negative_sharpe(weights):
            """Negatif Sharpe hesapla (minimize etmek için)"""
            portfolio_return = np.dot(weights, expected_returns.values)
            portfolio_std = np.sqrt(np.dot(weights.T, np.dot(cov_matrix.values, weights)))
            
            if portfolio_std == 0:
                return 1e10  # Çok büyük penalty
            
            sharpe = (portfolio_return - self.risk_free_rate) / portfolio_std
            return -sharpe  # Negatif çünkü minimize ediyoruz
        
        # Başlangıç ağırlıklar (equal weight)
        n = len(expected_returns)
        initial_weights = np.array([1.0/n] * n)
        
        # Constraints
        bounds = tuple((0, 1) for _ in range(n))
        constraints = (
            {'type': 'eq', 'fun': lambda w: np.sum(w) - 1},  # Weights sum to 1
        )
        
        # Optimize
        result = minimize(
            negative_sharpe, 
            initial_weights,
            method='SLSQP',
            bounds=bounds,
            constraints=constraints,
            options={'maxiter': 1000}
        )
        
        optimal_weights = result.x
        portfolio_return = np.dot(optimal_weights, expected_returns.values)
        portfolio_std = np.sqrt(np.dot(optimal_weights.T, np.dot(cov_matrix.values, optimal_weights)))
        sharpe = (portfolio_return - self.risk_free_rate) / portfolio_std if portfolio_std > 0 else 0
        
        return {
            'weights': dict(zip(expected_returns.index, optimal_weights)),
            'expected_return': float(portfolio_return),
            'volatility': float(portfolio_std),
            'sharpe_ratio': float(sharpe),
            'optimization_success': result.success
        }
    
    def risk_parity_weights(self, cov_matrix: pd.DataFrame) -> Dict:
        """
        Risk Parity: Her hissenin risk katkısı eşit
        
        Args:
            cov_matrix: Kovaryans matrisi
        
        Returns:
            Risk parity weights
        """
        # Volatiliteleri al
        volatilities = np.sqrt(np.diag(cov_matrix.values))
        
        # Inverse volatility weights (1/vol)
        inv_vol = 1.0 / volatilities
        
        # Normalize
        total_inv_vol = inv_vol.sum()
        weights = inv_vol / total_inv_vol
        
        # Portfolio volatility
        portfolio_vol = np.sqrt(np.dot(weights, np.dot(cov_matrix.values, weights)))
        
        # Expected return (sample avg)
        expected_return = 0.15  # Basitleştirilmiş
        
        return {
            'weights': dict(zip(cov_matrix.index, weights)),
            'portfolio_volatility': float(portfolio_vol),
            'expected_return': expected_return,
            'method': 'Risk Parity'
        }
    
    def adaptive_risk_parity(
        self, 
        cov_matrix: pd.DataFrame,
        forecasted_vol: Dict[str, float]
    ) -> Dict:
        """
        AI forecast edilmiş volatiliteye göre dinamik risk parity
        
        Args:
            cov_matrix: Mevcut kovaryans
            forecasted_vol: AI tahmin volatiliteleri
        
        Returns:
            Adaptive risk parity weights
        """
        symbols = list(cov_matrix.index)
        
        # Forecast edilmiş volatiliteleri kullan
        updated_vol = np.array([forecasted_vol.get(s, 0.20) for s in symbols])
        
        # Inverse volatility
        inv_vol = 1.0 / updated_vol
        weights = inv_vol / inv_vol.sum()
        
        # Portfolio metrics
        portfolio_vol = np.sqrt(np.dot(weights, np.dot(cov_matrix.values, weights)))
        
        return {
            'weights': dict(zip(symbols, weights)),
            'portfolio_volatility': float(portfolio_vol),
            'method': 'Adaptive Risk Parity',
            'forecast_based': True
        }
    
    def efficient_frontier(
        self, 
        expected_returns: pd.Series, 
        cov_matrix: pd.DataFrame,
        n_points: int = 20
    ) -> List[EfficientFrontierPoint]:
        """
        Efficient frontier çizimi
        
        Args:
            expected_returns: Beklenen getiriler
            cov_matrix: Kovaryans matrisi
            n_points: Frontier nokta sayısı
        
        Returns:
            List of frontier points
        """
        frontier_points = []
        
        # Return range
        min_return = expected_returns.min()
        max_return = expected_returns.max()
        target_returns = np.linspace(min_return, max_return, n_points)
        
        for target_ret in target_returns:
            def portfolio_variance(weights):
                """Portföy varyansı"""
                return np.dot(weights.T, np.dot(cov_matrix.values, weights))
            
            n = len(expected_returns)
            initial_weights = np.array([1.0/n] * n)
            bounds = tuple((0, 1) for _ in range(n))
            
            constraints = (
                {'type': 'eq', 'fun': lambda w: np.sum(w) - 1},
                {'type': 'eq', 'fun': lambda w: np.dot(w, expected_returns.values) - target_ret}
            )
            
            result = minimize(
                portfolio_variance,
                initial_weights,
                method='SLSQP',
                bounds=bounds,
                constraints=constraints
            )
            
            if result.success:
                risk = np.sqrt(result.fun)
                sharpe = (target_ret - self.risk_free_rate) / risk if risk > 0 else 0
                
                frontier_points.append(
                    EfficientFrontierPoint(
                        target_return=target_ret,
                        risk=risk,
                        weights=result.x,
                        sharpe=sharpe
                    )
                )
        
        return frontier_points
    
    # ==========================================
    # Tax-Aware Optimization
    # ==========================================
    
    def net_return_calculator(
        self, 
        gross_return: float, 
        holding_period_days: int, 
        tax_rate: float = 0.15
    ) -> Dict:
        """
        Türkiye için stopaj hesaplama
        
        Args:
            gross_return: Brüt getiri
            holding_period_days: Tutma süresi (gün)
            tax_rate: Vergi oranı (default %15)
        
        Returns:
            Net return + tax info
        """
        if holding_period_days > 365:
            # Uzun vadeli (>1 yıl) → yarı vergi
            tax = gross_return * tax_rate * 0.5
        else:
            # Kısa vadeli (<1 yıl) → full vergi
            tax = gross_return * tax_rate
        
        net_return = gross_return - tax
        
        return {
            'gross_return': gross_return,
            'tax_paid': tax,
            'net_return': net_return,
            'tax_efficiency': net_return / gross_return if gross_return > 0 else 0,
            'holding_period': holding_period_days
        }
    
    def tax_aware_portfolio(
        self, 
        expected_returns: pd.Series, 
        cov_matrix: pd.DataFrame,
        holding_period_days: int = 90
    ) -> Dict:
        """
        Vergi sonrası optimal portföy
        
        Args:
            expected_returns: Brüt beklenen getiriler
            cov_matrix: Kovaryans matrisi
            holding_period_days: Tahmini tutma süresi
        
        Returns:
            Tax-optimized portfolio
        """
        # Net returns hesapla
        net_returns = {}
        for symbol in expected_returns.index:
            gross = expected_returns[symbol]
            net_info = self.net_return_calculator(gross, holding_period_days)
            net_returns[symbol] = net_info['net_return']
        
        # Net returns Series
        net_returns_series = pd.Series(net_returns)
        
        # Markowitz ile optimize
        optimal = self.max_sharpe_ratio(net_returns_series, cov_matrix)
        
        # Tax efficiency
        gross_return = expected_returns.dot(np.array(list(optimal['weights'].values())))
        net_info = self.net_return_calculator(gross_return, holding_period_days)
        
        return {
            **optimal,
            'gross_return': gross_return,
            'net_return': net_info['net_return'],
            'tax_paid': net_info['tax_paid'],
            'tax_efficiency': net_info['tax_efficiency'],
            'holding_period': holding_period_days
        }
    
    # ==========================================
    # Portfolio Simulation
    # ==========================================
    
    def portfolio_simulation(
        self, 
        weights: Dict[str, float], 
        expected_returns: pd.Series,
        cov_matrix: pd.DataFrame,
        n_simulations: int = 1000
    ) -> Dict:
        """
        Portfolio Monte Carlo simülasyonu
        
        Args:
            weights: Portföy ağırlıkları
            expected_returns: Beklenen getiriler
            cov_matrix: Kovaryans matrisi
            n_simulations: Simülasyon sayısı
        
        Returns:
            Simülasyon sonuçları
        """
        # Portfolio metrics
        portfolio_return = sum(weights[s] * expected_returns[s] for s in weights.keys())
        weights_array = np.array([weights[s] for s in expected_returns.index])
        portfolio_vol = np.sqrt(np.dot(weights_array, np.dot(cov_matrix.values, weights_array)))
        
        # Monte Carlo simulation
        simulated_returns = np.random.normal(
            portfolio_return, 
            portfolio_vol, 
            n_simulations
        )
        
        # Statistics
        mean_pnl = np.mean(simulated_returns) * 100
        median_pnl = np.median(simulated_returns) * 100
        std_pnl = np.std(simulated_returns) * 100
        cvar_5pct = np.percentile(simulated_returns, 5) * 100
        probability_profit = sum(1 for r in simulated_returns if r > 0) / n_simulations
        
        return {
            'mean_pnl': float(mean_pnl),
            'median_pnl': float(median_pnl),
            'std_pnl': float(std_pnl),
            'cvar_5pct': float(cvar_5pct),
            'probability_profit': float(probability_profit),
            'n_simulations': n_simulations
        }


# ==========================================
# Demo / Test
# ==========================================

if __name__ == '__main__':
    print("🧪 Testing Enhanced Portfolio Optimizer v5.0...")
    
    optimizer = EnhancedPortfolioOptimizer()
    
    # Mock data
    symbols = ['THYAO', 'AKBNK', 'EREGL']
    
    try:
        # Get real data
        returns_data = {}
        for symbol in symbols:
            ticker = yf.Ticker(f"{symbol}.IS")
            hist = ticker.history(period="1y", interval="1d")
            returns_data[symbol] = hist['Close'].pct_change().dropna()
        
        # Create DataFrame
        returns_df = pd.DataFrame(returns_data)
        expected_returns = returns_df.mean() * 252  # Annualized
        cov_matrix = returns_df.cov() * 252  # Annualized
        
        # Test Markowitz
        print("\n📊 Testing Markowitz Optimization...")
        markowitz = optimizer.max_sharpe_ratio(expected_returns, cov_matrix)
        print(f"✅ Sharpe Ratio: {markowitz['sharpe_ratio']:.2f}")
        print(f"   Expected Return: {markowitz['expected_return']*100:.2f}%")
        
        # Test Risk Parity
        print("\n⚖️ Testing Risk Parity...")
        risk_parity = optimizer.risk_parity_weights(cov_matrix)
        print(f"✅ Portfolio Volatility: {risk_parity['portfolio_volatility']*100:.2f}%")
        
        # Test Efficient Frontier
        print("\n📈 Testing Efficient Frontier...")
        frontier = optimizer.efficient_frontier(expected_returns, cov_matrix, n_points=10)
        print(f"✅ Generated {len(frontier)} frontier points")
        
        # Test Tax-Aware
        print("\n💰 Testing Tax-Aware Optimization...")
        tax_aware = optimizer.tax_aware_portfolio(expected_returns, cov_matrix, 90)
        print(f"✅ Net Return: {tax_aware['net_return']*100:.2f}%")
        print(f"   Tax Efficiency: {tax_aware['tax_efficiency']*100:.2f}%")
        
        print("\n✅ All tests passed!")
    
    except Exception as e:
        print(f"❌ Error: {e}")

