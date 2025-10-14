from __future__ import annotations

import time
from typing import Any, Dict, Tuple


class TTLCache:
    def __init__(self, ttl_seconds: float = 15.0, max_entries: int = 256) -> None:
        self.ttl = ttl_seconds
        self.max_entries = max_entries
        self._store: Dict[str, Tuple[float, Any]] = {}

    def get(self, key: str) -> Any | None:
        item = self._store.get(key)
        if not item:
            return None
        ts, val = item
        if time.time() - ts > self.ttl:
            self._store.pop(key, None)
            return None
        return val

    def set(self, key: str, value: Any) -> None:
        if len(self._store) >= self.max_entries:
            # drop oldest
            oldest_key = min(self._store.items(), key=lambda kv: kv[1][0])[0]
            self._store.pop(oldest_key, None)
        self._store[key] = (time.time(), value)


_signals_cache = TTLCache(ttl_seconds=20.0)


def get_signals_cache() -> TTLCache:
    return _signals_cache





