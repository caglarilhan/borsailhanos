"""FinBERT-EN tabanlı ABD haber sentiment analizi (mock fallback ile)."""
from __future__ import annotations

import json
import logging
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Iterable, List, Optional

try:
    from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline  # type: ignore

    HF_AVAILABLE = True
except ImportError:  # pragma: no cover
    HF_AVAILABLE = False

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

MODEL_NAME = "ProsusAI/finbert"
ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUTPUT = ROOT / "data" / "snapshots" / "us_sentiment_sample.json"
DEFAULT_OUTPUT.parent.mkdir(parents=True, exist_ok=True)


@dataclass
class SentimentArticle:
    symbol: str
    headline: str
    summary: str
    source_url: Optional[str] = None


@dataclass
class SentimentResult:
    symbol: str
    headline: str
    sentiment: str
    score: float
    confidence: float
    summary: str
    topics: List[str]
    model: str = MODEL_NAME
    sourceUrl: Optional[str] = None


class SentimentENAnalyzer:
    """Basit FinBERT-EN sarmalayıcısı."""

    def __init__(self, model_name: str = MODEL_NAME) -> None:
        self.model_name = model_name
        self._pipeline = None

    def _load_pipeline(self) -> None:
        if self._pipeline or not HF_AVAILABLE:
            return
        logger.info("Loading FinBERT-EN model (%s)...", self.model_name)
        tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        model = AutoModelForSequenceClassification.from_pretrained(self.model_name)
        self._pipeline = pipeline("text-classification", model=model, tokenizer=tokenizer, return_all_scores=True)

    def analyze(self, articles: Iterable[SentimentArticle]) -> List[SentimentResult]:
        articles_list = list(articles)
        if not articles_list:
            return []

        if HF_AVAILABLE:
            self._load_pipeline()

        results: List[SentimentResult] = []
        for article in articles_list:
            text = f"{article.headline} {article.summary}".strip()
            if not text:
                continue
            if HF_AVAILABLE and self._pipeline:
                model_scores = self._pipeline(text)[0]
                positives = next((score["score"] for score in model_scores if score["label"].lower().startswith("positive")), 0)
                negatives = next((score["score"] for score in model_scores if score["label"].lower().startswith("negative")), 0)
                sentiment_score = positives - negatives
                label = "positive" if sentiment_score > 0.05 else "negative" if sentiment_score < -0.05 else "neutral"
                confidence = max(positives, negatives, 1 - positives - negatives)
            else:  # pragma: no cover - deterministic fallback
                sentiment_score = (len(article.headline) % 7 - 3) / 10
                label = "positive" if sentiment_score > 0.05 else "negative" if sentiment_score < -0.05 else "neutral"
                confidence = 0.65 + abs(sentiment_score) / 2

            topics = _infer_topics(article.summary)
            results.append(
                SentimentResult(
                    symbol=article.symbol,
                    headline=article.headline,
                    sentiment=label,
                    score=round(sentiment_score, 2),
                    confidence=round(confidence, 2),
                    summary=article.summary,
                    topics=topics,
                    sourceUrl=article.source_url,
                )
            )
        return results

    def export(self, results: List[SentimentResult], output_path: Path = DEFAULT_OUTPUT) -> Path:
        payload = {
            "generatedAt": datetime.utcnow().isoformat() + "Z",
            "source": self.model_name if HF_AVAILABLE else "mock",
            "items": [asdict(r) for r in results],
        }
        output_path.write_text(json.dumps(payload, indent=2))
        logger.info("Saved %s sentiment rows to %s", len(results), output_path)
        return output_path


def _infer_topics(summary: str) -> List[str]:
    summary_lower = summary.lower()
    topics = []
    if any(keyword in summary_lower for keyword in ("ai", "artificial", "model")):
        topics.append("AI")
    if any(keyword in summary_lower for keyword in ("cloud", "aws", "azure")):
        topics.append("Cloud")
    if any(keyword in summary_lower for keyword in ("autopilot", "ev", "battery")):
        topics.append("EV")
    if "regulation" in summary_lower or "probe" in summary_lower:
        topics.append("Regulation")
    if not topics:
        topics.append("General")
    return topics


if __name__ == "__main__":  # pragma: no cover
    sample_articles = [
        SentimentArticle(
            symbol="AAPL",
            headline="Apple unveils on-device AI co-pilot",
            summary="Yeni kuşak Neural Engine gelir büyümesini hızlandıracak.",
            source_url="https://news.example.com/aapl"
        ),
        SentimentArticle(
            symbol="TSLA",
            headline="Tesla faces renewed FSD probe",
            summary="Regülasyon baskısı kısa vadede volatilite yaratıyor.",
            source_url="https://news.example.com/tsla"
        ),
    ]
    analyzer = SentimentENAnalyzer()
    results = analyzer.analyze(sample_articles)
    analyzer.export(results)
