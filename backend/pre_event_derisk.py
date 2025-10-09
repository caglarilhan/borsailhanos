from dataclasses import dataclass
from typing import Dict


@dataclass
class DeRiskAdvice:
    action: str  # REDUCE_SIZE, HEDGE, HOLD
    position_multiplier: float  # 0.0-1.0
    notes: str

    def to_dict(self) -> Dict:
        return {
            "action": self.action,
            "position_multiplier": round(self.position_multiplier, 2),
            "notes": self.notes,
        }


class PreEventDeRisk:
    """Basit kural tabanlı pre-event risk azaltma önerileri."""

    def advise(self, risk_score: float, half_life_days: float) -> DeRiskAdvice:
        if risk_score >= 0.7:
            return DeRiskAdvice(
                action="REDUCE_SIZE",
                position_multiplier=0.4,
                notes=f"Yüksek olay riski (score={risk_score:.2f}), half-life ~{half_life_days:.1f}g. Pozisyonu %60 azalt.",
            )
        if risk_score >= 0.5:
            return DeRiskAdvice(
                action="REDUCE_SIZE",
                position_multiplier=0.6,
                notes=f"Orta-yüksek olay riski (score={risk_score:.2f}). Pozisyonu %40 azalt; hedge düşün.",
            )
        if risk_score >= 0.3:
            return DeRiskAdvice(
                action="HEDGE",
                position_multiplier=0.8,
                notes=f"Orta risk (score={risk_score:.2f}). Küçük hedge ve sıkı stop kullan.",
            )
        return DeRiskAdvice(
            action="HOLD",
            position_multiplier=1.0,
            notes="Düşük risk. Normal pozisyon."
        )



