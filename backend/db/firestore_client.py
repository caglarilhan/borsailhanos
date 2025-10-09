from __future__ import annotations

import os
from typing import Any, Dict, List, Optional


class _NoOpFirestore:
    def __init__(self) -> None:
        self.enabled = False

    def write_signals(self, symbol: str, signals: List[Dict[str, Any]]) -> None:
        return None

    def write_prices(self, symbol: str, records: List[Dict[str, Any]]) -> None:
        return None


class FirestoreClient:
    def __init__(self) -> None:
        self.enabled = os.getenv("FIRESTORE_ENABLED", "0") in {"1", "true", "TRUE"}
        if not self.enabled:
            self._backend: Any = _NoOpFirestore()
            return
        try:
            from google.cloud import firestore  # type: ignore

            project = os.getenv("GOOGLE_CLOUD_PROJECT")
            self._client = firestore.Client(project=project)
            self._backend = None
        except Exception:  # pragma: no cover
            # Fallback to no-op if credentials or package not available
            self.enabled = False
            self._backend = _NoOpFirestore()

    def write_signals(self, symbol: str, signals: List[Dict[str, Any]]) -> None:
        if not signals:
            return
        if not self.enabled:
            return self._backend.write_signals(symbol, signals)
        coll = self._client.collection("signals").document(symbol).collection("events")
        for item in signals:
            ts = str(item.get("timestamp"))
            coll.document(ts).set(item, merge=True)

    def write_prices(self, symbol: str, records: List[Dict[str, Any]]) -> None:
        if not records:
            return
        if not self.enabled:
            return self._backend.write_prices(symbol, records)
        coll = self._client.collection("prices").document(symbol).collection("ohlcv")
        for item in records:
            ts = str(item.get("timestamp"))
            coll.document(ts).set(item, merge=True)


_singleton: Optional[FirestoreClient] = None


def get_firestore() -> FirestoreClient:
    global _singleton
    if _singleton is None:
        _singleton = FirestoreClient()
    return _singleton


