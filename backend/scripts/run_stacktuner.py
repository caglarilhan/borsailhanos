"""
Run StackTuner on BIST ranking csv datasets.
Generates dataset, defines target (buy/hold/sell) from score_change_7d, runs tuning.
"""
import json
import logging
from pathlib import Path

import numpy as np
import pandas as pd

from services.stack_tuner import StackTuner, StackTunerConfig

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("run_stacktuner")

DATA_PATHS = sorted(Path("backend").glob("BIST_ranking_*.csv"))


def build_dataset(threshold: float = 0.01) -> pd.DataFrame:
    frames = []
    for path in DATA_PATHS:
        try:
            df = pd.read_csv(path)
            df["source_file"] = path.name
            frames.append(df)
        except Exception as exc:
            logger.warning("Failed to read %s: %s", path, exc)
    if not frames:
        raise RuntimeError("No ranking files found")
    data = pd.concat(frames, ignore_index=True)

    numeric_cols = [
        col for col in data.columns
        if col not in {"symbol", "market", "metric_symbol", "source_file"}
        and data[col].dtype != object
    ]

    dataset = data[numeric_cols].copy()
    score_delta = dataset.get("score_change_7d", pd.Series(np.zeros(len(dataset))))
    def label(row_value: float) -> int:
        if row_value > threshold:
            return 2  # BUY
        if row_value < -threshold:
            return 0  # SELL
        return 1  # HOLD
    dataset["target"] = score_delta.apply(label)
    dataset = dataset.dropna()
    return dataset


def main():
    dataset = build_dataset()
    tuner = StackTuner(StackTunerConfig(n_trials=10))
    tuner.tune(dataset)
    tuner.export_results("stack_tuner_results.json")


if __name__ == "__main__":
    main()
