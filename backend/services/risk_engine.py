#!/usr/bin/env python3
"""
Risk Engine - VaR, Sharpe, Drawdown, Beta, Alpha
Portföy risk hesaplama motoru
"""

import json
import random
from datetime import datetime
import math

class RiskEngine:
    """
    Gelişmiş risk hesaplama motoru
    """
    
    def __init__(self):
        self.risk_free_rate = 0.15  # %15 (Türkiye için)
        self.market_return = 0.25   # %25 (BIST 100 ortalama)
    
    def calculate_portfolio_risk(self, positions: list, prices: dict):
        """
        Portföy risk analizi
        
        Args:
            positions: [{'symbol': 'THYAO', 'quantity': 100, 'avg_price': 245}]
            prices: {'THYAO': 250.0, 'ASELS': 48.5}
        
        Returns:
            dict: Risk metrikleri
        """
        
        # Portfolio value
        total_value = sum(p['quantity'] * prices.get(p['symbol'], p['avg_price']) for p in positions)
        
        # Returns (mock - gerçek historik veri kullanılacak)
        returns = [random.gauss(0.001, 0.02) for _ in range(252)]  # 1 yıllık günlük return
        
        # VaR (Value at Risk) - %95 confidence
        returns_sorted = sorted(returns)
        var_95 = returns_sorted[int(len(returns) * 0.05)] * total_value
        
        # Sharpe Ratio
        mean_return = sum(returns) / len(returns)
        std_return = math.sqrt(sum((r - mean_return)**2 for r in returns) / len(returns))
        sharpe = (mean_return * 252 - self.risk_free_rate) / (std_return * math.sqrt(252)) if std_return > 0 else 0
        
        # Max Drawdown
        cumulative = [1]
        for r in returns:
            cumulative.append(cumulative[-1] * (1 + r))
        
        running_max = cumulative[0]
        max_dd = 0
        for val in cumulative:
            if val > running_max:
                running_max = val
            dd = (val - running_max) / running_max
            if dd < max_dd:
                max_dd = dd
        
        # Volatility (annualized)
        volatility = std_return * math.sqrt(252) * 100
        
        # Beta (şu an mock)
        beta = 1.0 + random.uniform(-0.2, 0.2)
        
        # Alpha
        alpha = (mean_return * 252) - (self.risk_free_rate + beta * (self.market_return - self.risk_free_rate))
        
        # Risk score (0-100)
        risk_score = self._calculate_risk_score(volatility, abs(max_dd), sharpe)
        
        return {
            'portfolio_value': round(total_value, 2),
            'var_95': round(var_95, 2),
            'sharpe_ratio': round(sharpe, 2),
            'max_drawdown': round(max_dd * 100, 2),  # percentage
            'volatility': round(volatility, 2),
            'beta': round(beta, 2),
            'alpha': round(alpha * 100, 2),  # percentage
            'risk_score': round(risk_score, 1),
            'risk_level': self._get_risk_level(risk_score),
            'timestamp': datetime.now().isoformat()
        }
    
    def _calculate_risk_score(self, volatility: float, max_dd: float, sharpe: float):
        """
        Risk skoru hesaplama (0-100)
        Düşük risk = Yüksek skor
        """
        # Volatility penalty
        vol_score = max(0, 100 - volatility * 2)
        
        # Drawdown penalty
        dd_score = max(0, 100 - abs(max_dd) * 5)
        
        # Sharpe bonus
        sharpe_score = min(100, sharpe * 40)
        
        # Weighted average
        total_score = (vol_score * 0.3 + dd_score * 0.4 + sharpe_score * 0.3)
        
        return total_score
    
    def _get_risk_level(self, score: float):
        """Risk seviyesi (DÜŞÜK, ORTA, YÜKSEK)"""
        if score >= 70:
            return 'DÜŞÜK'
        elif score >= 40:
            return 'ORTA'
        else:
            return 'YÜKSEK'
    
    def calculate_position_risk(self, symbol: str, quantity: int, avg_price: float, current_price: float):
        """
        Tek pozisyon risk analizi
        """
        value = quantity * current_price
        cost = quantity * avg_price
        pnl = value - cost
        pnl_percent = (pnl / cost) * 100 if cost > 0 else 0
        
        # Stop loss suggestion (ATR bazlı - şimdilik %5)
        stop_loss = current_price * 0.95
        risk_amount = quantity * (current_price - stop_loss)
        risk_percent = (risk_amount / value) * 100
        
        return {
            'symbol': symbol,
            'quantity': quantity,
            'avg_price': avg_price,
            'current_price': current_price,
            'value': round(value, 2),
            'cost': round(cost, 2),
            'pnl': round(pnl, 2),
            'pnl_percent': round(pnl_percent, 2),
            'stop_loss': round(stop_loss, 2),
            'risk_amount': round(risk_amount, 2),
            'risk_percent': round(risk_percent, 2),
            'timestamp': datetime.now().isoformat()
        }

# Global instance
risk_engine = RiskEngine()

if __name__ == '__main__':
    # Test
    print("⚠️  Risk Engine Test")
    print("=" * 50)
    
    # Mock portfolio
    positions = [
        {'symbol': 'THYAO', 'quantity': 100, 'avg_price': 240},
        {'symbol': 'ASELS', 'quantity': 200, 'avg_price': 50}
    ]
    
    prices = {'THYAO': 245.50, 'ASELS': 48.20}
    
    risk = risk_engine.calculate_portfolio_risk(positions, prices)
    print(json.dumps(risk, indent=2))
    
    print("\n📊 Position Risk (THYAO):")
    pos_risk = risk_engine.calculate_position_risk('THYAO', 100, 240, 245.50)
    print(json.dumps(pos_risk, indent=2))
