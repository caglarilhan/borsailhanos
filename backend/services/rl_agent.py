from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Optional


@dataclass
class PositionAdvice:
    side: str  # BUY/SELL/HOLD
    size_pct: float  # 0-1
    stop_loss_pct: float  # e.g., 0.03 means -3%
    take_profit_pct: float  # e.g., 0.06 means +6%


class SimpleRLAagent:
    """Placeholder RL agent with rule-based sizing for Sprint-1/2.

    Uses topsis and recent signal tags to produce a simple advice.
    """

    def advise(self, topsis: Optional[float], latest_tags: list[str]) -> PositionAdvice:
        topsis = topsis if topsis is not None else 0.5
        bullish = any(t in {"ema_cross_up", "bullish_engulf"} for t in latest_tags)
        if bullish and topsis >= 0.6:
            return PositionAdvice(side="BUY", size_pct=min(0.3 + (topsis - 0.6) * 0.7, 0.7), stop_loss_pct=0.03, take_profit_pct=0.07)
        if bullish and topsis >= 0.5:
            return PositionAdvice(side="BUY", size_pct=0.2, stop_loss_pct=0.03, take_profit_pct=0.06)
        if not bullish and topsis <= 0.4:
            return PositionAdvice(side="SELL", size_pct=0.2, stop_loss_pct=0.03, take_profit_pct=0.05)
        return PositionAdvice(side="HOLD", size_pct=0.0, stop_loss_pct=0.0, take_profit_pct=0.0)





