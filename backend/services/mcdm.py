from __future__ import annotations

import numpy as np
import pandas as pd


def entropy_weights(criteria_values: np.ndarray) -> np.ndarray:
    """Compute entropy weights for criteria matrix (rows=items, cols=criteria)."""
    X = np.array(criteria_values, dtype=float)
    # Normalize to probabilities per column
    col_sums = X.sum(axis=0)
    with np.errstate(divide='ignore', invalid='ignore'):
        P = np.where(col_sums > 0, X / col_sums, 0.0)
        # Replace zeros to avoid log(0)
        P_safe = np.where(P > 0, P, 1e-12)
        k = 1.0 / np.log(X.shape[0] if X.shape[0] > 1 else 2)
        E = -k * (P_safe * np.log(P_safe)).sum(axis=0)
        d = 1 - E
    # Normalize weights
    w = d / (d.sum() if d.sum() > 0 else 1.0)
    return w


def topsis_score(criteria_values: np.ndarray, weights: np.ndarray, criteria_types: np.ndarray) -> np.ndarray:
    """Classic TOPSIS with vector normalization.

    criteria_types: 1 for benefit (larger-better), 0 for cost (smaller-better).
    """
    X = np.array(criteria_values, dtype=float)
    # Vector normalization
    norm = np.sqrt((X ** 2).sum(axis=0))
    V = np.divide(X, norm, out=np.zeros_like(X), where=norm > 0)
    # Weighted
    W = V * weights
    # Ideal and anti-ideal
    benefit = criteria_types.astype(bool)
    ideal = np.where(benefit, W.max(axis=0), W.min(axis=0))
    anti = np.where(benefit, W.min(axis=0), W.max(axis=0))
    # Distances
    S_pos = np.sqrt(((W - ideal) ** 2).sum(axis=1))
    S_neg = np.sqrt(((W - anti) ** 2).sum(axis=1))
    # Scores
    with np.errstate(divide='ignore', invalid='ignore'):
        C = S_neg / (S_pos + S_neg)
    return C


def compute_entropy_topsis(df: pd.DataFrame, benefit_flags: list[int]) -> pd.Series:
    cols = list(df.columns)
    X = df.values.astype(float)
    w = entropy_weights(X)
    c_types = np.array(benefit_flags, dtype=int)
    score = topsis_score(X, w, c_types)
    return pd.Series(score, index=df.index, name="topsis")


