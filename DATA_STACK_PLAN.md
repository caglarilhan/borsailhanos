# Data Pipeline + Stacking Optimization Plan

## Amaçlar
1. **Veri kapsamını genişletmek** – BIST + US hisseleri için günlük snapshot.
2. **Tek tip feature store** – teknik, finansal, sentiment ve RL feature'larının aynı tabloda tutulması.
3. **StackTuner iyileştirmesi** – Optuna + zaman serisi CV + daha zengin veri ile %3-5 doğruluk artışı.

---

## A. Veri Pipeline

### 1. Kaynaklar
- `yfinance` üzerinden günlük OHLCV (BIST + NYSE/NASDAQ)
- Finansal oranlar: mevcut `BIST_ranking_*.csv` + US için `polygon/alpha` fallback
- Sentiment: FinBERT-TR, FinBERT-EN, Twitter/Reddit pipeline (mock → gerçek)
- Makro: USDTRY, VIX, CDS, US10Y

### 2. Mimari
```
cron → fetch_prices.py → parquet/feature_store.db → stack datasets
cron → fetch_fundamentals.py
cron → sentiment_ingest.py
```
- Her job, `data/snapshots/{date}` klasörüne JSON/CSV yazacak
- Feature store: `feature_values` tablosuna her feature için version + timestamp

### 3. Yapılacaklar
- [ ] `backend/scripts/fetch_market_snapshot.py`
- [ ] `backend/scripts/feature_store_writer.py`
- [ ] `feature_store.db` şema güncellemesi (US ticker + source)
- [ ] Veri kalite raporu (missing, z-score outlier)

---

## B. Stacking Optimizer

1. Dataset Builder
   - BIST + US snapshot’larını tek dataframe’de birleştir
   - Target = 7g/14g getiri sinyali (buy/sell/neutral)
   - Train/validation split: zaman tabanlı (rolling window)

2. Optuna
   - Trials: 100 (LGBM, XGB, CatBoost opsiyonel)
   - Metric: balanced accuracy + calibration loss
   - Regime-aware weighting

3. Aksiyonlar
- [ ] `stack_tuner.py` → zaman serisi CV
- [ ] `run_stacktuner.py` → dataset builder refactor
- [ ] Model sonuçlarını `stack_tuner_results.jsonl` olarak logla

---

## KPI
- Veri kapsamı: 10 BIST + 10 US hisse (ilk sprint)
- Stacking accuracy: +3pp artış (0.0 → 0.03+)
- Snapshot latency: < 5 dk

---

## Sonraki Adımlar
1. Bu plan doğrultusunda veri fetch scriptlerini yaz.
2. Feature store’a yazıp dataset builder’ı güncelle.
3. Optuna tuning’i gerçek veride koş.
