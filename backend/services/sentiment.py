from __future__ import annotations

from typing import Dict


POSITIVE_WORDS = {"yükseliş", "güçlü", "pozitif", "artış", "rekor", "kâr"}
NEGATIVE_WORDS = {"düşüş", "zayıf", "negatif", "azalış", "zarar", "risk"}


def sentiment_tr(text: str) -> Dict:
    text_l = text.lower()
    pos = sum(word in text_l for word in POSITIVE_WORDS)
    neg = sum(word in text_l for word in NEGATIVE_WORDS)
    score = (pos - neg) / max(1, pos + neg) if (pos + neg) > 0 else 0.0
    label = "positive" if score > 0.2 else ("negative" if score < -0.2 else "neutral")
    return {"score": score, "label": label}





