# ABD Veri Borusu + FinBERT-EN Entegrasyon Planı

## 1. Veri Kaynakları
- **US Market Snapshot**: yfinance (AAPL, MSFT, NVDA, AMZN, GOOGL, META, TSLA, JPM, NFLX, AMD) 
- **Haber Enjeksiyonu**: NewsAPI/Polygon (örn. `NEWSAPI_KEY`), SEC 8-K/Finviz RSS 
- **Sentiment**: FinBERT-EN (`ProsusAI/finbert`), FinBERT-TR fallback

## 2. Pipeline
```
cron → fetch_us_market.py → data/snapshots/us_market_snapshot.json
cron → ingest_us_news.py → data/snapshots/us_sentiment_sample.json
cron → sentiment_en_analyzer.py (service) → aynı dosya (FinBERT skorları)
stack_tuner → dataset builder (BIST+US)
```

## 3. API Yüzeyleri
- `/api/ai/power-grid` (mevcut) → stacking/RL metrikleri
- **Yeni** `/api/ai/us-sentiment` → FinBERT-EN çıktılarını frontend'e servis

## 4. Yapılacaklar
- [x] Plan dokümanı
- [x] `backend/scripts/fetch_us_market.py` (yfinance + mock fallback)
- [x] `backend/services/sentiment_en_analyzer.py` (FinBERT-EN pipeline + rule-based fallback)
- [x] `web-app/src/app/api/ai/us-sentiment/route.ts` (data/us_sentiment_sample.json okuyacak)
- [x] `.gitignore` → `data/us_market_snapshot.json`, `data/us_sentiment_sample.json`
- [x] `backend/scripts/ingest_us_news.py` (NewsAPI + FinBERT export)
- [ ] Dataset builder'a US kolonları ekleme + dashboard entegrasyonu

## 5. KPI
- İlk sprintte 10 US ticker snapshot 
- FinBERT-EN ile günlük en az 20 haberin sentiment'i
- UI entegrasyonu: AI sekmesinde US/Global sentiment kartı (sonraki sprint)
