#!/usr/bin/env python3
"""Fetch US news (NewsAPI fallback) and run FinBERT-EN sentiment export."""
from __future__ import annotations

import json
import logging
import os
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
import sys
from typing import Dict, Iterable, List

try:
    import httpx
except ImportError:  # pragma: no cover
    httpx = None

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("us-news")

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.services.sentiment_en_analyzer import (  # noqa: E402
    SentimentArticle,
    SentimentENAnalyzer,
    SentimentResult,
)

OUTPUT_PATH = ROOT / "data" / "snapshots" / "us_sentiment_sample.json"
OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

SYMBOLS = ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "JPM", "NFLX", "AMD"]
NEWS_ENDPOINT = "https://newsapi.org/v2/everything"
MAX_ARTICLES_PER_SYMBOL = 3
API_KEY = os.getenv("NEWSAPI_KEY")

FALLBACK_HEADLINES: Dict[str, Dict[str, str]] = {
    "AAPL": {
        "headline": "Apple expands on-device AI hub",
        "summary": "Yeni Neural Engine, iPhone satışlarını yukarı taşıyacak.",
    },
    "MSFT": {
        "headline": "Microsoft Azure FinOps AI bundle",
        "summary": "Bankalar için özel AI cluster kiralama modeli duyuruldu.",
    },
    "NVDA": {
        "headline": "NVIDIA locks in Gulf giga-order",
        "summary": "3B$'lık hızlandırıcı siparişi kapasiteyi %18 artıracak.",
    },
    "AMZN": {
        "headline": "AWS launches finetune fabric",
        "summary": "Finans kurumlarına özel LLM pipeline servisleri.",
    },
    "GOOGL": {
        "headline": "Google Cloud brings Gemini Quant",
        "summary": "Portföy simülasyonuna özel modeller açılıyor.",
    },
    "META": {
        "headline": "Meta Threads AI sponsorships",
        "summary": "Markalar AI konu başlıklarına sponsorluk satabilecek.",
    },
    "TSLA": {
        "headline": "Tesla faces new FSD review",
        "summary": "Regülasyon baskısı kısa vadede volatiliteyi artırıyor.",
    },
    "JPM": {
        "headline": "JPMorgan deploys LLM risk desk",
        "summary": "Anlık kredi spread tahmini için yeni model devrede.",
    },
    "NFLX": {
        "headline": "Netflix bundles interactive AI sports",
        "summary": "Canlı spor yayınlarına AI kameralar geliyor.",
    },
    "AMD": {
        "headline": "AMD Instinct roadmap pulled forward",
        "summary": "MI400 serisi beklenenden önce hacme giriyor.",
    },
}


def _fetch_news(symbol: str) -> List[SentimentArticle]:
    if not API_KEY or httpx is None:
        return _fallback_articles(symbol)

    params = {
        "q": f"{symbol} stock",
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": MAX_ARTICLES_PER_SYMBOL,
        "apiKey": API_KEY,
    }
    try:
        with httpx.Client(timeout=10) as client:
            response = client.get(NEWS_ENDPOINT, params=params)
            response.raise_for_status()
            payload = response.json()
    except Exception as exc:  # pragma: no cover
        logger.warning("NewsAPI error for %s: %s", symbol, exc)
        return _fallback_articles(symbol)

    articles = []
    for item in payload.get("articles", [])[:MAX_ARTICLES_PER_SYMBOL]:
        title = (item.get("title") or "").strip()
        description = (item.get("description") or item.get("content") or "").strip()
        if not title:
            continue
        articles.append(
            SentimentArticle(
                symbol=symbol,
                headline=title,
                summary=description or "News summary pending.",
                source_url=item.get("url"),
            )
        )
    return articles or _fallback_articles(symbol)


def _fallback_articles(symbol: str) -> List[SentimentArticle]:
    meta = FALLBACK_HEADLINES.get(symbol, {
        "headline": f"{symbol} market update",
        "summary": "AI pipeline fallback verisi.",
    })
    return [
        SentimentArticle(
            symbol=symbol,
            headline=meta["headline"],
            summary=meta["summary"],
            source_url="https://news.example.com/mock",
        )
    ]


def _build_aggregate(results: Iterable[SentimentResult]) -> Dict:
    results = list(results)
    total = max(len(results), 1)
    counts = Counter(r.sentiment for r in results)
    topic_counter = Counter(topic for r in results for topic in (r.topics or []))
    top_sectors = [
        {"name": name, "weight": round(count / total, 2)}
        for name, count in topic_counter.most_common(3)
    ]
    return {
        "bullish": round(counts.get("positive", 0) / total, 2),
        "bearish": round(counts.get("negative", 0) / total, 2),
        "neutral": round(counts.get("neutral", 0) / total, 2),
        "topSectors": top_sectors,
    }


def main() -> None:
    analyzer = SentimentENAnalyzer()
    articles: List[SentimentArticle] = []
    for symbol in SYMBOLS:
        articles.extend(_fetch_news(symbol))

    if not articles:
        logger.warning("No articles fetched; using fallback headlines")
        for symbol in SYMBOLS:
            articles.extend(_fallback_articles(symbol))

    results = analyzer.analyze(articles)
    aggregate = _build_aggregate(results)
    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": analyzer.model_name,
        "items": [
            {
                "symbol": r.symbol,
                "headline": r.headline,
                "sentiment": r.sentiment,
                "score": r.score,
                "confidence": r.confidence,
                "summary": r.summary,
                "topics": r.topics,
                "model": r.model,
                "sourceUrl": r.sourceUrl,
            }
            for r in results
        ],
        "aggregate": aggregate,
    }
    OUTPUT_PATH.write_text(json.dumps(payload, indent=2))
    logger.info("Saved %s sentiment rows to %s", len(results), OUTPUT_PATH.relative_to(ROOT))


if __name__ == "__main__":
    main()
