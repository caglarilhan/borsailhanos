from __future__ import annotations

import os
from typing import Dict, Iterable, List

import pandas as pd

try:
    import requests
except Exception:  # pragma: no cover
    requests = None  # type: ignore


FMP_BASE = "https://financialmodelingprep.com/api/v3"


def _get_fmp_key() -> str | None:
    return os.getenv("FMP_API_KEY")


def _fmp_get(path: str, params: Dict[str, str]) -> List[dict]:
    if requests is None:
        return []
    url = f"{FMP_BASE}/{path}"
    resp = requests.get(url, params=params, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    if isinstance(data, dict) and "symbol" in data:
        return [data]
    if isinstance(data, list):
        return data
    return []


def fetch_basic_fundamentals(symbols: Iterable[str]) -> pd.DataFrame:
    """Fetch a minimal set of ratios from FMP if available.

    Returns columns: NetProfitMargin, ROE, DebtEquity (where available).
    Falls back to empty values if API key or network missing.
    """
    api_key = _get_fmp_key()
    records: List[dict] = []
    for sym in symbols:
        row: Dict[str, float | str | None] = {"symbol": sym}
        if api_key:
            try:
                prof = _fmp_get("ratios/{}".format(sym), {"apikey": api_key})
                if prof:
                    latest = prof[0]
                    row["NetProfitMargin"] = float(latest.get("netProfitMargin", float("nan")))
                    row["ROE"] = float(latest.get("returnOnEquity", float("nan")))
                    row["DebtEquity"] = float(latest.get("debtEquityRatio", float("nan")))
            except Exception:
                # if any error, leave NaNs and continue
                pass
        records.append(row)
    df = pd.DataFrame.from_records(records).set_index("symbol")
    # Ensure expected columns exist
    for col in ["NetProfitMargin", "ROE", "DebtEquity"]:
        if col not in df.columns:
            df[col] = float("nan")
    return df[["NetProfitMargin", "ROE", "DebtEquity"]]


