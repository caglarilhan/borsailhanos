"""
RL Portföy Ajanı (Stub)
- FinRL/Stable-Baselines DDPG yerine hafif bir mock ajan
- Position sizing ve SL/TP önerisi üretir
- Paper trading metrikleri tutar
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Dict, List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

@dataclass
class RLDecision:
    symbol: str
    position_size: float  # 0-1 arası
    direction: str  # LONG/SHORT/FLAT
    stop_loss: float
    take_profit: float
    risk_reward: float
    confidence: float
    timestamp: str

class SimpleRLRiskManager:
    def __init__(self, max_risk_per_trade: float = 0.01, rr_min: float = 1.5):
        self.max_risk_per_trade = max_risk_per_trade
        self.rr_min = rr_min

    def suggest_sl_tp(self, price: float, direction: str, volatility: float) -> (float, float, float):
        risk = max(price * volatility * 0.5, price * 0.005)
        if direction == 'LONG':
            sl = price - risk
            tp = price + risk * 2
            rr = (tp - price) / (price - sl)
        elif direction == 'SHORT':
            sl = price + risk
            tp = price - risk * 2
            rr = (price - tp) / (sl - price)
        else:
            sl = price * 0.99
            tp = price * 1.01
            rr = 1.0
        return sl, tp, rr

class RLPortfolioAgent:
    def __init__(self):
        self.risk_manager = SimpleRLRiskManager()
        self.trading_capital = 100000.0
        self.paper_positions: Dict[str, Dict] = {}

    def decide(self, symbol: str, df: pd.DataFrame, ensemble_signal: Optional[Dict] = None) -> RLDecision:
        close = df['Close'].iloc[-1]
        vol = df['Close'].pct_change().rolling(20).std().iloc[-1] or 0.02

        # Ensemble yönüne göre karar
        direction = 'FLAT'
        confidence = 0.5
        if ensemble_signal:
            direction = {
                'BULLISH': 'LONG',
                'BEARISH': 'SHORT',
                'NEUTRAL': 'FLAT'
            }.get(ensemble_signal.get('ensemble_direction', 'NEUTRAL'), 'FLAT')
            confidence = float(ensemble_signal.get('ensemble_confidence', 0.5))

        # Pozisyon boyutu (Kelly-light)
        edge = max(confidence - 0.5, 0)
        position_size = round(min(0.2, edge * 2), 3)

        sl, tp, rr = self.risk_manager.suggest_sl_tp(close, direction, vol)

        return RLDecision(
            symbol=symbol,
            position_size=position_size,
            direction=direction,
            stop_loss=sl,
            take_profit=tp,
            risk_reward=rr,
            confidence=confidence,
            timestamp=datetime.now().isoformat()
        )

# Test
def test_rl_agent():
    dates = pd.date_range('2024-01-01', periods=120, freq='D')
    prices = np.linspace(100, 120, 120) + np.random.normal(0, 1.5, 120)
    df = pd.DataFrame({
        'Date': dates,
        'Open': prices*0.99,
        'High': prices*1.01,
        'Low': prices*0.99,
        'Close': prices,
        'Volume': np.random.randint(100000, 500000, 120)
    })
    agent = RLPortfolioAgent()
    decision = agent.decide('SISE.IS', df, {'ensemble_direction': 'BULLISH', 'ensemble_confidence': 0.72})
    print(decision)
    return decision

if __name__ == '__main__':
    test_rl_agent()
