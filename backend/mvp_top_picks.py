#!/usr/bin/env python3
import argparse
import logging
from typing import List, Tuple, Any

from datetime import datetime

try:
    from backend.nobel_mathematical_system import NobelMathematicalSystem
except Exception:
    from nobel_mathematical_system import NobelMathematicalSystem

try:
    from backend.ultimate_accuracy_booster import UltimateAccuracyBooster
except Exception:
    from ultimate_accuracy_booster import UltimateAccuracyBooster


logger = logging.getLogger("mvp_top_picks")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s — %(message)s")


DEFAULT_BIST = [
    "SISE.IS", "ASELS.IS", "YKBNK.IS", "THYAO.IS", "TUPRS.IS",
    "EREGL.IS", "BIMAS.IS", "KRDMD.IS", "HEKTS.IS", "SAHOL.IS",
    "PGSUS.IS", "FROTO.IS", "KCHOL.IS", "ISCTR.IS", "TOASO.IS"
]


def _extract_signal(obj: Any) -> Tuple[str, float]:
    """Farklı sınıflar için ortak (signal, confidence) çıkarımı yap."""
    if obj is None:
        return "HOLD", 0.0
    # Öncelikle standart arayüz
    sig = getattr(obj, "signal", None)
    conf = getattr(obj, "confidence", None)
    if sig is not None and conf is not None:
        return str(sig), float(conf)
    # Alternatif alan adları
    candidates_signal = [
        "ensemble_signal", "ultimate_signal", "final_signal",
        "prediction", "label"
    ]
    candidates_conf = [
        "mathematical_confidence", "ensemble_probability",
        "ultimate_confidence", "probability", "score", "confidence_score"
    ]
    for s_name in candidates_signal:
        if hasattr(obj, s_name):
            sig = getattr(obj, s_name)
            break
    else:
        sig = "HOLD"
    for c_name in candidates_conf:
        if hasattr(obj, c_name):
            conf = getattr(obj, c_name)
            break
    else:
        conf = 0.0
    try:
        conf = float(conf)
    except Exception:
        conf = 0.0
    return str(sig).upper(), conf


def score_symbol(symbol: str, nobel: NobelMathematicalSystem, booster: UltimateAccuracyBooster) -> Tuple[str, float, str]:
    """Sembol için birleşik güven skorunu hesapla ve öneri üret."""
    try:
        nobel_sig = nobel.analyze_stock(symbol)
    except Exception as e:
        logger.warning(f"Nobel analiz hatası {symbol}: {e}")
        nobel_sig = None

    try:
        boost_sig = booster.boost_accuracy(symbol)
    except Exception as e:
        logger.warning(f"Booster analiz hatası {symbol}: {e}")
        boost_sig = None

    combined_score = 0.0
    label = "HOLD"

    if nobel_sig:
        nobel_label, nobel_conf = _extract_signal(nobel_sig)
        if nobel_label == "BUY":
            combined_score += nobel_conf
        elif nobel_label == "SELL":
            combined_score -= nobel_conf

    if boost_sig:
        # MVP: booster SELL → short-term reversal BUY olarak değerlendirilebilir
        booster_signal, booster_conf = _extract_signal(boost_sig)
        if booster_signal == "BUY":
            combined_score += booster_conf
        elif booster_signal == "SELL":
            combined_score += booster_conf * 0.5

    if combined_score >= 0.6:
        label = "BUY"
    elif combined_score <= -0.4:
        label = "SELL"

    return symbol, combined_score, label


def main():
    parser = argparse.ArgumentParser(description="MVP Top Picks — En güçlü 10 hisse")
    parser.add_argument("--symbols", type=str, default=",".join(DEFAULT_BIST), help="Virgül ayrılmış semboller")
    parser.add_argument("-n", "--top", type=int, default=10, help="Kaç hisse döndürülsün")
    args = parser.parse_args()

    symbols: List[str] = [s.strip().upper() for s in args.symbols.split(',') if s.strip()]
    nobel = NobelMathematicalSystem()
    booster = UltimateAccuracyBooster()

    scored: List[Tuple[str, float, str]] = []
    for s in symbols:
        sym, score, label = score_symbol(s, nobel, booster)
        scored.append((sym, score, label))

    scored.sort(key=lambda x: x[1], reverse=True)
    topn = scored[: args.top]

    print(f"Top Picks ({datetime.now().strftime('%Y-%m-%d %H:%M')}):")
    for rank, (sym, score, label) in enumerate(topn, start=1):
        print(f"{rank:>2}. {sym:<10}  score={score:5.2f}  label={label}")


if __name__ == "__main__":
    main()


