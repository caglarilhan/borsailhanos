"""
Snapshot + ranking verisini birleştirip StackTuner dataset'i üretir.
Çıktı: data/datasets/stack_dataset.csv
"""
import json
import logging
from pathlib import Path
from typing import List

import pandas as pd

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("dataset")

SNAPSHOT_ROOT = Path("data/snapshots")
DATASET_ROOT = Path("data/datasets")
DATASET_ROOT.mkdir(parents=True, exist_ok=True)


def load_latest_snapshot() -> pd.DataFrame:
    files = sorted(SNAPSHOT_ROOT.glob("snapshot_*.json"))
    if not files:
        raise FileNotFoundError("No snapshot files found")
    latest = files[-1]
    payload = json.loads(latest.read_text())
    records = []
    for market_key in ["bist", "us"]:
        block = payload.get(market_key, {})
        for row in block.get("symbols", []):
            row_copy = row.copy()
            row_copy["market"] = block.get("market", market_key.upper())
            records.append(row_copy)
    df = pd.DataFrame(records)
    logger.info("Snapshot loaded: %s rows from %s", len(df), latest)
    return df


def load_ranking_csv() -> pd.DataFrame:
    ranking_files = sorted(Path("backend").glob("BIST_ranking_*.csv"))
    frames: List[pd.DataFrame] = []
    for path in ranking_files:
        try:
            df = pd.read_csv(path)
            df["source_file"] = path.name
            frames.append(df)
        except Exception as exc:
            logger.warning("Ranking read failed %s: %s", path, exc)
    if not frames:
        logger.warning("No ranking files found")
        return pd.DataFrame()
    merged = pd.concat(frames, ignore_index=True)
    logger.info("Ranking dataset: %s rows", len(merged))
    return merged


def build_dataset() -> pd.DataFrame:
    snap_df = load_latest_snapshot()
    ranking_df = load_ranking_csv()

    df = snap_df.copy()
    df["symbol_clean"] = df["symbol"].str.replace(".IS", "", regex=False)
    if not ranking_df.empty:
        ranking_df["symbol_clean"] = ranking_df["symbol"].str.replace(".IS", "", regex=False)
        df = df.merge(
            ranking_df,
            on="symbol_clean",
            how="left",
            suffixes=("", "_ranking")
        )

    df["target"] = df["change_pct"].apply(lambda x: 2 if x > 0.5 else (0 if x < -0.5 else 1))
    df.fillna(0, inplace=True)
    return df


def main():
    df = build_dataset()
    out_path = DATASET_ROOT / "stack_dataset.csv"
    df.to_csv(out_path, index=False)
    logger.info("Dataset saved to %s", out_path)


if __name__ == "__main__":
    main()
