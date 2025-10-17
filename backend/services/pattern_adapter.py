from __future__ import annotations

from typing import Dict, List

import numpy as np
import pandas as pd


try:
    # Absolute import when running package
    from backend.master_pattern_detector import MasterPatternDetector
except Exception:  # pragma: no cover
    # Relative import fallback
    from ..master_pattern_detector import MasterPatternDetector


def detect_patterns_from_ohlcv(df: pd.DataFrame) -> List[Dict]:
    """Run MasterPatternDetector on OHLCV DataFrame and return simplified tags.

    Returns a list of dicts with keys: pattern_category, pattern_type, confidence, signal.
    """
    if df is None or df.empty:
        return []

    # Normalize column names
    cols = {c.lower(): c for c in df.columns}
    open_col = cols.get("open", "Open" if "Open" in df.columns else None)
    high_col = cols.get("high", "High" if "High" in df.columns else None)
    low_col = cols.get("low", "Low" if "Low" in df.columns else None)
    close_col = cols.get("close", "Close" if "Close" in df.columns else None)
    vol_col = cols.get("volume", "Volume" if "Volume" in df.columns else None)

    if not all([open_col, high_col, low_col, close_col]):
        return []

    opens = df[open_col].astype(float).values
    highs = df[high_col].astype(float).values
    lows = df[low_col].astype(float).values
    closes = df[close_col].astype(float).values
    volumes = df[vol_col].astype(float).values if vol_col in df.columns else None

    detector = MasterPatternDetector()
    all_patterns = detector.detect_all_patterns(
        highs=np.asarray(highs),
        lows=np.asarray(lows),
        prices=np.asarray(closes),
        opens=np.asarray(opens),
        closes=np.asarray(closes),
        volumes=np.asarray(volumes) if volumes is not None else None,
        rsi_values=None,
        macd_values=None,
        macd_signal=None,
    )

    simplified: List[Dict] = []
    for category, patterns in all_patterns.items():
        if not isinstance(patterns, dict):
            continue
        for pattern_type, pattern_list in patterns.items():
            if not isinstance(pattern_list, list):
                continue
            for pat in pattern_list[-3:]:  # limit
                simplified.append({
                    "pattern_category": str(category),
                    "pattern_type": str(pattern_type),
                    "confidence": float(pat.get("confidence", 0) or 0),
                    "signal": str(pat.get("signal", "UNKNOWN")),
                })

    # keep top-N by confidence
    simplified.sort(key=lambda x: x.get("confidence", 0.0), reverse=True)
    return simplified[:10]







