"""
Türkçe Sentiment (FinBERT-TR benzeri)
- transformers varsa pipeline kullanır (savasy/bert-base-turkish-sentiment-cased)
- yoksa nötr (0.0) döner
- Sembol haberleri için yfinance Ticker.news üzerinden başlıkları tarar
"""

import logging
from typing import List, Tuple

logger = logging.getLogger(__name__)

class TurkishSentiment:
    def __init__(self):
        self.available = False
        self.pipeline = None
        try:
            from transformers import pipeline
            # Türkçe sentiment modeli (yakın alternatif)
            self.pipeline = pipeline("sentiment-analysis", model="savasy/bert-base-turkish-sentiment-cased")
            self.available = True
            logger.info("Türkçe sentiment modeli yüklendi")
        except Exception as e:
            logger.warning(f"Transformers sentiment yüklenemedi: {e}")
            self.available = False

    def score_texts(self, texts: List[str]) -> float:
        if not texts:
            return 0.0
        try:
            if self.available and self.pipeline:
                res = self.pipeline(texts, truncation=True)
                # Label to score: POSITIVE -> +1, NEGATIVE -> -1, NEUTRAL -> 0
                def ls(label):
                    label = (label or '').upper()
                    if 'POS' in label:
                        return 1
                    if 'NEG' in label:
                        return -1
                    return 0
                scores = [ls(r.get('label')) * float(r.get('score', 0.5)) for r in res]
                return float(sum(scores) / len(scores))
            else:
                return 0.0
        except Exception as e:
            logger.warning(f"Sentiment skor hata: {e}")
            return 0.0

    def score_symbol_news(self, symbol: str, limit: int = 10) -> Tuple[float, int]:
        try:
            import yfinance as yf
            news = getattr(yf.Ticker(symbol), 'news', []) or []
            titles = [n.get('title') for n in news if n.get('title')] [:limit]
            return self.score_texts(titles), len(titles)
        except Exception as e:
            logger.warning(f"Haber sentiment hata {symbol}: {e}")
            return 0.0, 0

if __name__ == "__main__":
    s = TurkishSentiment()
    sc = s.score_texts(["Borsa İstanbul yükselişte.", "Şirket zarar açıkladı."])
    print(sc)
