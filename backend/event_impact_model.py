import math
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Dict, Optional


@dataclass
class EventImpact:
    event_title: str
    event_time: datetime
    risk_score: float  # 0-1
    expected_move_bp: float  # baz puan (bp) cinsinden beklenen hareket
    half_life_days: float
    regime_hint: str  # Risk-On / Risk-Off / Neutral

    def to_dict(self) -> Dict:
        return {
            "event_title": self.event_title,
            "event_time": self.event_time.isoformat(),
            "risk_score": round(self.risk_score, 3),
            "expected_move_bp": round(self.expected_move_bp, 1),
            "half_life_days": round(self.half_life_days, 2),
            "regime_hint": self.regime_hint,
        }


class EventImpactModel:
    """MVP: Olay tipine göre basit risk ve half-life tahmini.
    Gerçekte HMM+(E)GARCH ile kalibrasyon yapılabilir.
    """

    BASE_MOVE_BP = {
        "ECON": 120.0,  # faiz/enflasyon günleri
        "KAP": 80.0,    # bilanço, temettü
        "POLITICS": 100.0,
        "COMPANY": 60.0,
    }

    BASE_HALFLIFE = {
        "ECON": 3.0,
        "KAP": 2.0,
        "POLITICS": 4.0,
        "COMPANY": 1.5,
    }

    def __init__(self, vix_level: float = 15.0, usdtry_vol: float = 0.02, cds_level: float = 300.0) -> None:
        self.vix_level = vix_level
        self.usdtry_vol = usdtry_vol
        self.cds_level = cds_level

    def _macro_risk_multiplier(self) -> float:
        vix_m = max(0.8, min(1.8, self.vix_level / 15.0))
        fx_m = max(0.8, min(1.6, 1.0 + 10 * self.usdtry_vol))
        cds_m = max(0.8, min(1.7, self.cds_level / 300.0))
        return vix_m * fx_m * cds_m

    def estimate(self, source: str, importance: str, event_time: datetime) -> EventImpact:
        imp_weight = {"LOW": 0.6, "MEDIUM": 0.9, "HIGH": 1.2}.get(importance, 0.9)
        base = self.BASE_MOVE_BP.get(source, 50.0)
        move_bp = base * imp_weight * self._macro_risk_multiplier()

        base_h = self.BASE_HALFLIFE.get(source, 2.0)
        half_life = base_h * max(0.7, min(1.5, self._macro_risk_multiplier()))

        # risk skoru 0-1 arası normalize
        risk_score = max(0.0, min(1.0, move_bp / 250.0))

        # rejim ipucu
        regime_hint = "Risk-Off" if risk_score > 0.6 else ("Neutral" if risk_score > 0.3 else "Risk-On")

        return EventImpact(
            event_title=f"{source} — {importance}",
            event_time=event_time,
            risk_score=risk_score,
            expected_move_bp=move_bp,
            half_life_days=half_life,
            regime_hint=regime_hint,
        )



