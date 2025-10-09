from __future__ import annotations

from typing import Dict, List, Optional


def explain_signal(latest_tags: List[str], topsis: Optional[float]) -> Dict[str, float]:
    """Lightweight explanation: distribute weights over available factors.

    Returns dict of factor->contribution (sums to ~1.0).
    """
    weights: Dict[str, float] = {}
    if topsis is not None:
        weights["financial_health"] = max(0.0, min(1.0, topsis))
    if "ema_cross_up" in latest_tags:
        weights["trend"] = weights.get("trend", 0.0) + 0.3
    if "bullish_engulf" in latest_tags:
        weights["candlestick"] = weights.get("candlestick", 0.0) + 0.3
    if not weights:
        weights["other"] = 1.0
        return weights
    s = sum(weights.values()) or 1.0
    for k in list(weights.keys()):
        weights[k] = weights[k] / s
    return weights


