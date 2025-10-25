# BIST AI Smart Trader - API Endpoint Dokümantasyonu

**Backend:** `comprehensive_backend.py`  
**Port:** 8080  
**CORS:** Aktif (*)  
**Toplam Endpoint:** 60+

---

## 📊 **1. TRADING SIGNALS**

### `GET /api/real/trading_signals`
**Açıklama:** Gerçek zamanlı AI trading sinyalleri  
**Response:**
```json
{
  "timestamp": "2025-10-25T01:30:00",
  "signals": [
    {
      "symbol": "THYAO",
      "action": "BUY",
      "confidence": 0.87,
      "price": 245.50,
      "target": 260.0,
      "stop_loss": 235.0,
      "reason": "EMA Cross + RSI Oversold"
    }
  ]
}
```

---

## 🏢 **2. MARKET DATA**

### `GET /api/market/overview`
**Açıklama:** Piyasa genel bakış  
**Response:** 5 hisse özeti (fiyat, hacim, P/E, temettü)

### `GET /api/bist/data?symbols=AKBNK,ARCLK`
**Açıklama:** BIST hisse verileri  
**Response:** Sembol bazlı fiyat, hacim, değişim

### `GET /api/bist/signals?symbols=AKBNK,ARCLK`
**Açıklama:** BIST AI sinyalleri  
**Response:** BUY/SELL/HOLD sinyalleri

---

## 🧠 **3. AI PREDICTIONS**

### `GET /api/ai/predictions`
**Açıklama:** Ana tahmin endpoint'i  
**Response:** 1 günlük ve 7 günlük tahminler

### `GET /api/ai/bist30_predictions?timeframe=1d`
**Açıklama:** BIST 30 tahminleri  
**Response:** 30 hisse için tahmin

### `GET /api/ai/bist100_predictions`
**Açıklama:** BIST 100 tahminleri  
**Response:** 100 hisse için tahmin

### `GET /api/ai/ensemble/predictions?symbols=THYAO,ASELS`
**Açıklama:** Ensemble model tahminleri  
**Response:** Çoklu model kararı (LSTM, Prophet, CatBoost, LightGBM)

### `GET /api/ai/predictive_twin?symbol=THYAO`
**Açıklama:** Predictive twin tahmini  
**Response:** 1h, 4h, 1d tahminleri

### `GET /api/twin?symbol=THYAO&horizons=1h,4h,1d`
**Açıklama:** Twin alternatif endpoint  
**Response:** Aynı predictive_twin

---

## ⚠️ **4. RISK & REGIME ANALYSIS**

### `GET /api/risk/analysis`
**Açıklama:** Portföy risk analizi  
**Response:** VaR, Sharpe, Max Drawdown, Volatilite, Beta, Alpha

### `GET /api/regime/analysis?symbol=BIST100`
**Açıklama:** Piyasa rejim analizi  
**Response:** BULLISH/BEARISH/SIDEWAYS

### `GET /api/regime/history?days=30`
**Açıklama:** Rejim geçmişi  
**Response:** 30 günlük rejim değişimleri

### `GET /api/regime/indicators?symbol=BIST100`
**Açıklama:** Rejim indikatörleri  
**Response:** RSI, MACD, ADX, Volatilite

### `GET /api/regime/markov?symbol=BIST100`
**Açıklama:** Markov rejim modeli  
**Response:** State transition probabilities

### `GET /api/regime/statistics`
**Açıklama:** Rejim istatistikleri  
**Response:** Ortalama süre, değişim sayısı

### `GET /api/regime/transitions?symbol=BIST100`
**Açıklama:** Rejim geçişleri  
**Response:** Son 10 rejim değişimi

---

## 📈 **5. SECTOR & PATTERN ANALYSIS**

### `GET /api/sector/strength`
**Açıklama:** Sektör gücü analizi  
**Response:** 5 sektör (Bankacılık, Teknoloji, Sanayi, Turizm, Enerji)

### `GET /api/sector/relative_strength?market=BIST`
**Açıklama:** Relatif sektör gücü  
**Response:** RS score ve ranking

### `GET /api/patterns/elliott/bulk?symbols=THYAO,ASELS&timeframe=1d`
**Açıklama:** Elliott Wave pattern tespiti  
**Response:** Wave patterns ve hedefler

### `GET /api/patterns/harmonic/bulk?symbols=TUPRS,SISE&timeframe=1d`
**Açıklama:** Harmonic pattern tespiti  
**Response:** Gartley, Bat, Butterfly patterns

---

## 📋 **6. WATCHLIST**

### `GET /api/watchlist/get/`
**Açıklama:** Kullanıcı watchlist'i getir  
**Response:** Sembol listesi

### `GET /api/watchlist/add?symbol=GARAN`
**Açıklama:** Watchlist'e ekle  
**Response:** Success mesajı

### `GET /api/watchlist/update?symbols=THYAO,ASELS&mode=add`
**Açıklama:** Watchlist güncelle  
**Response:** Success mesajı

---

## 💱 **7. ARBITRAGE**

### `GET /api/arbitrage/pairs`
**Açıklama:** Arbitraj çiftleri  
**Response:** Spread ve korelasyon

### `GET /api/arbitrage/top`
**Açıklama:** En iyi arbitraj fırsatları  
**Response:** Kar potansiyeli yüksek olanlar

### `GET /api/arbitrage/cross_market?pair=THYAO-GARAN`
**Açıklama:** Çapraz piyasa analizi  
**Response:** Fiyat farkı, hacim oranı

### `GET /api/arbitrage/history?pair=THYAO-GARAN`
**Açıklama:** Arbitraj geçmişi  
**Response:** Son 10 spread değeri

### `GET /api/arbitrage/watchlist/get`
**Açıklama:** Arbitraj watchlist  
**Response:** İzlenen çiftler

### `GET /api/arbitrage/auto_alert?enable=1&threshold=2.0`
**Açıklama:** Otomatik arbitraj uyarısı  
**Response:** Ayar onayı

---

## 🤖 **8. ENSEMBLE & DEEP LEARNING MODELS**

### `GET /api/ensemble/performance`
**Açıklama:** Model performans karşılaştırması  
**Response:** LSTM, Prophet, CatBoost, LightGBM metrikleri

### `GET /api/ensemble/all?symbol=THYAO`
**Açıklama:** Tüm modellerin kararı  
**Response:** Model bazlı tahminler + ensemble

### `GET /api/deep_learning/model_status`
**Açıklama:** DL model durumu  
**Response:** Aktif modeller, eğitim durumu

### `GET /api/deep_learning/market_report?symbols=THYAO,ASELS`
**Açıklama:** AI piyasa raporu  
**Response:** Özet, top picks, güven ortalaması

### `GET /api/deep_learning/sentiment?text=THYAO&symbol=THYAO`
**Açıklama:** Sentiment analizi  
**Response:** Pozitif/Negatif/Nötr + skor

---

## 📡 **9. TRACKING & MONITORING**

### `GET /api/tracking/statistics`
**Açıklama:** Sinyal takip istatistikleri  
**Response:** Toplam sinyal, başarı oranı, ortalama kâr

### `GET /api/tracking/pending`
**Açıklama:** Bekleyen sinyaller  
**Response:** Aktif pozisyonlar

### `GET /api/tracking/report`
**Açıklama:** Performans raporu  
**Response:** Win rate, avg return, Sharpe, max drawdown

### `GET /api/tracking/update?signal_id=1&actual_price=250.0`
**Açıklama:** Sinyal güncelle  
**Response:** Success mesajı

### `GET /api/ingestion/status`
**Açıklama:** Veri akışı durumu  
**Response:** Finnhub, Yahoo Finance latency

### `GET /api/ingestion/lag`
**Açıklama:** Veri gecikmesi  
**Response:** Lag saniye

### `GET /api/ingestion/latency`
**Açıklama:** API latency  
**Response:** Milisaniye

### `GET /api/ingestion/ticks?symbol=THYAO&limit=80`
**Açıklama:** Tick verisi  
**Response:** Son 80 tick (fiyat, hacim, zaman)

---

## 💡 **10. XAI EXPLAINABILITY**

### `GET /api/xai/explain?symbol=THYAO`
**Açıklama:** SHAP açıklama  
**Response:** Feature importance, SHAP values

### `GET /api/xai/reason?symbol=THYAO&horizon=1d`
**Açıklama:** Karar gerekçesi  
**Response:** Ana faktörler ve etki oranları

---

## ⚡ **11. ANOMALY & NEWS**

### `GET /api/signals/anomaly_momentum?symbols=THYAO,ASELS`
**Açıklama:** Anomali ve momentum tespiti  
**Response:** Volume spike, price gap, momentum sinyalleri

### `GET /api/events/news_stream?symbols=THYAO&limit=20`
**Açıklama:** Haber akışı  
**Response:** Son haberler + sentiment

### `GET /api/events/sentiment_ote`
**Açıklama:** Genel sentiment  
**Response:** Twitter, News, KAP skorları

---

## 📊 **12. LIQUIDITY & SCENARIOS**

### `GET /api/liquidity/heatmap?symbol=THYAO`
**Açıklama:** Likidite heatmap  
**Response:** Bid/ask volume seviyeler

### `GET /api/scenario/presets`
**Açıklama:** Senaryo şablonları  
**Response:** Bull, Bear, Sideways presets

### `GET /api/paper/apply`
**Açıklama:** Paper trading uygula  
**Response:** Balance ve durum

---

## 🎯 **13. CALIBRATION & ACCURACY**

### `GET /api/calibration/apply?prob=0.85&method=platt`
**Açıklama:** Olasılık kalibrasyonu  
**Response:** Calibrated probability

### `GET /api/accuracy/optimize?symbols=THYAO&strategy=comprehensive`
**Açıklama:** Doğruluk optimizasyonu  
**Response:** Mevcut vs optimize edilmiş accuracy

### `GET /api/accuracy/improvement_plan`
**Açıklama:** İyileştirme planı  
**Response:** Adım adım geliştirme önerileri

---

## 🔔 **14. NOTIFICATIONS & ALERTS**

### `GET /api/notifications/smart?user_id=default&type=signal`
**Açıklama:** Akıllı bildirimler  
**Response:** Aktif bildirimler

### `GET /api/notifications/email?email=user@example.com&type=daily_summary`
**Açıklama:** Email gönder  
**Response:** Success

### `GET /api/notifications/sms?phone=+90xxx&type=urgent_signal`
**Açıklama:** SMS gönder  
**Response:** Success

### `GET /api/alerts/register_push`
**Açıklama:** Push notification kaydet  
**Response:** Success

### `GET /api/alerts/test?symbol=THYAO&strength=0.9`
**Açıklama:** Test alert  
**Response:** Success

---

## 🔧 **15. MODEL MANAGEMENT**

### `GET /api/model/weights/update`
**Açıklama:** Model ağırlıkları güncelle  
**Response:** Success

### `GET /api/ui/telemetry`
**Açıklama:** UI kullanım telemetrisi  
**Response:** Received

---

## ✅ **16. HEALTH & INFO**

### `GET /health`
**Açıklama:** Sağlık kontrolü  
**Response:** Status, uptime, version

### `GET /api/test`
**Açıklama:** Test endpoint  
**Response:** API çalışıyor mesajı

### `GET /`
**Açıklama:** Ana sayfa  
**Response:** API bilgileri, endpoint kategorileri

---

## 🚀 **KULLANIM ÖRNEKLERİ**

```bash
# Trading sinyalleri
curl http://localhost:8080/api/real/trading_signals | python3 -m json.tool

# Piyasa özeti
curl http://localhost:8080/api/market/overview | python3 -m json.tool

# AI tahminleri
curl http://localhost:8080/api/ai/predictions | python3 -m json.tool

# Risk analizi
curl http://localhost:8080/api/risk/analysis | python3 -m json.tool

# Sektör gücü
curl http://localhost:8080/api/sector/strength | python3 -m json.tool

# XAI açıklama
curl "http://localhost:8080/api/xai/explain?symbol=THYAO" | python3 -m json.tool

# Ensemble performans
curl http://localhost:8080/api/ensemble/performance | python3 -m json.tool
```

---

## 📝 **NOTLAR**

- ✅ Tüm endpoint'ler **CORS aktif**
- ✅ **Query parametreleri** destekleniyor
- ✅ **JSON response** formatı
- ⚠️ Şu anda **mock data** kullanılıyor
- 🔧 Gerçek ML modelleri eklendiğinde backend güncellenecek

---

**Son Güncelleme:** 25 Ekim 2025
