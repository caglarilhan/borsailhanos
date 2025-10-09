from __future__ import annotations

import os
from typing import Dict, Optional


class _NoOpFCM:
    def send(self, title: str, body: str, topic: Optional[str] = None) -> None:
        return None


class FCMClient:
    def __init__(self) -> None:
        self.enabled = os.getenv("FCM_ENABLED", "0") in {"1", "true", "TRUE"}
        if not self.enabled:
            self._client = _NoOpFCM()
            return
        try:
            from firebase_admin import messaging, credentials, initialize_app  # type: ignore

            if not os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
                # If creds not provided, disable gracefully
                self.enabled = False
                self._client = _NoOpFCM()
                return
            if not _is_initialized():
                initialize_app()
            self._messaging = messaging
            self._client = None
        except Exception:  # pragma: no cover
            self.enabled = False
            self._client = _NoOpFCM()

    def send(self, title: str, body: str, topic: Optional[str] = None) -> None:
        if not self.enabled:
            return self._client.send(title, body, topic)
        message = self._messaging.Message(
            notification=self._messaging.Notification(title=title, body=body),
            topic=topic or "signals",
        )
        self._messaging.send(message)


_singleton: Optional[FCMClient] = None


def _is_initialized() -> bool:
    try:
        import firebase_admin  # type: ignore

        return firebase_admin._apps is not None and len(firebase_admin._apps) > 0
    except Exception:
        return False


def get_fcm() -> FCMClient:
    global _singleton
    if _singleton is None:
        _singleton = FCMClient()
    return _singleton


def should_notify(signal_tags: list[str], topsis: Optional[float]) -> bool:
    if not signal_tags:
        return False
    if "ema_cross_up" in signal_tags or "bullish_engulf" in signal_tags:
        return True if topsis is None else topsis >= 0.55
    return False


