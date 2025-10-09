import logging
from dataclasses import dataclass
from datetime import datetime
from typing import List, Dict

import yfinance as yf

logger = logging.getLogger(__name__)


@dataclass
class NewsItem:
    symbol: str
    title: str
    publisher: str
    link: str
    published: datetime

    def to_dict(self) -> Dict:
        return {
            "symbol": self.symbol,
            "title": self.title,
            "publisher": self.publisher,
            "link": self.link,
            "published": self.published.isoformat(),
        }


POS_WORDS = {"rekor", "artış", "kâr", "büyüme", "pozitif", "iyi", "yüksek"}
NEG_WORDS = {"düşüş", "zarar", "olumsuz", "negatif", "istifa", "skandal", "düşük"}


def naive_sentiment(text: str) -> float:
    t = (text or "").lower()
    score = 0
    for w in POS_WORDS:
        if w in t:
            score += 1
    for w in NEG_WORDS:
        if w in t:
            score -= 1
    # normalize to [-1,1]
    return max(-1.0, min(1.0, score / 3.0))


def fetch_news(symbol: str, count: int = 10) -> List[NewsItem]:
    tk = yf.Ticker(symbol)
    items = []
    try:
        news = tk.news or []
    except Exception:
        news = []
    for n in (news[:count] if news else []):
        published = datetime.fromtimestamp(n.get("providerPublishTime", 0))
        items.append(
            NewsItem(
                symbol=symbol,
                title=n.get("title", ""),
                publisher=n.get("publisher", ""),
                link=n.get("link", ""),
                published=published,
            )
        )
    return items


def summarize_sentiment(symbol: str, count: int = 10) -> Dict:
    items = fetch_news(symbol, count=count)
    if not items:
        return {"symbol": symbol, "avg_sentiment": 0.0, "n": 0, "details": []}
    scored = []
    for it in items:
        s = naive_sentiment(it.title)
        scored.append((it, s))
    avg = sum(s for _, s in scored) / max(1, len(scored))
    return {
        "symbol": symbol,
        "avg_sentiment": round(avg, 3),
        "n": len(scored),
        "details": [
            {**it.to_dict(), "sentiment": round(s, 3)} for it, s in scored
        ],
    }






