from __future__ import annotations

from typing import Dict


try:
    from market_regime_detector import MarketRegimeDetector
except Exception:  # pragma: no cover
    from ..market_regime_detector import MarketRegimeDetector


def get_market_regime_summary() -> Dict:
    detector = MarketRegimeDetector()
    rs = detector.get_regime_signal()
    return {
        "regime": rs.regime.value,
        "confidence": rs.confidence,
        "risk_multiplier": rs.risk_multiplier,
        "recommendation": rs.recommendation,
    }


