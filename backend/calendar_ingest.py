import logging
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List, Optional

logger = logging.getLogger(__name__)


@dataclass
class CalendarEvent:
    source: str  # ECON, KAP, POLITICS, COMPANY
    title: str
    when: datetime
    importance: str  # LOW, MEDIUM, HIGH
    symbols: Optional[List[str]] = None

    def to_dict(self) -> dict:
        return {
            "source": self.source,
            "title": self.title,
            "when": self.when.isoformat(),
            "importance": self.importance,
            "symbols": self.symbols or [],
        }


class CalendarIngest:
    """MVP: Statik/yerel kaynaklardan basit takvim üretir.
    Gelecekte gerçek kaynaklara (KAP, ekonomik takvim, şirket rehberi) bağlanılabilir.
    """

    def __init__(self) -> None:
        self._cache: List[CalendarEvent] = []

    def fetch_upcoming(self, days_ahead: int = 7) -> List[CalendarEvent]:
        now = datetime.now()
        end = now + timedelta(days=days_ahead)
        if self._cache and all(now <= ev.when <= end for ev in self._cache):
            return self._cache

        events: List[CalendarEvent] = [
            CalendarEvent(
                source="ECON",
                title="TCMB Faiz Kararı",
                when=now + timedelta(days=1, hours=15),
                importance="HIGH",
                symbols=["XU100", "XU030"],
            ),
            CalendarEvent(
                source="KAP",
                title="SISE Bilanço Açıklaması",
                when=now + timedelta(days=2, hours=18),
                importance="HIGH",
                symbols=["SISE.IS"],
            ),
            CalendarEvent(
                source="POLITICS",
                title="Kabine Toplantısı Basın Açıklaması",
                when=now + timedelta(days=3, hours=20),
                importance="MEDIUM",
                symbols=["XU100"],
            ),
        ]

        # Sadece istenen aralıkta kalanları döndür
        events = [ev for ev in events if now <= ev.when <= end]
        self._cache = events
        return events



