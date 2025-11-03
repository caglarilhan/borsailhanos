# 📊 PRD v6.0 Profit Intelligence Suite - Kod Analizi & Durum Raporu

**Analiz Tarihi:** 2025-11-02  
**Kaynak:** `web-app/src/components/5,2.md`  
**Hedef:** v6.0 Profit Intelligence Suite - 20 yeni özellik

---

## 🔍 MEVCUT DURUM ANALİZİ

### ✅ Mevcut Özellikler (Kısmen veya Tamamen)

| # | Özellik | Durum | Mevcut Implementasyon |
|---|---------|-------|----------------------|
| 2️⃣ | **Smart Position Scaling** | 🟡 Kısmen | `RiskEngine.tsx` - Confidence ve profil bazlı pozisyon ölçekleme mevcut |
| 8️⃣ | **Smart Stop-Loss Predictor** | 🟡 Kısmen | `RiskEngine.tsx` - Volatilite bazlı SL/TP hesaplama var |
| 10️⃣ | **Regime Auto-Shift** | 🟢 Mevcut | `global-state.ts` - Risk-on/off rejim takibi, CDS/VIX entegrasyonu kısmen |
| 20️⃣ | **Profit Integrity Analyzer** | 🟡 Kısmen | Backtest sonuçları mevcut, ancak 90 günlük otomatik rapor eksik |

---

### ❌ Eksik Özellikler (Yeni Implementasyon Gereken)

| # | Özellik | Teknoloji | Öncelik | Tahmini İş Yükü |
|---|---------|-----------|---------|-----------------|
| 1️⃣ | **Alpha Pulse Engine** | Fourier + FastGRU | 🔴 Yüksek | ~3-5 gün |
| 3️⃣ | **News Impact Scorer** | FinBERT + Volume correlation | 🟠 Orta | ~2-3 gün |
| 4️⃣ | **Micro-Alpha Extractor** | CNN+LSTM hybrid | 🔴 Yüksek | ~4-6 gün |
| 5️⃣ | **Liquidity Flow Tracker** | Volume spike detection | 🟡 Düşük | ~2 gün |
| 6️⃣ | **Dynamic Sentiment Arbitrage** | Sentiment spread analysis | 🟠 Orta | ~3-4 gün |
| 7️⃣ | **Adaptive Volatility Hedger** | Delta-risk hedging | 🟠 Orta | ~3-4 gün |
| 9️⃣ | **Behavior-Linked Trade Filter** | User behavior pattern | 🟡 Düşük | ~2-3 gün |
| 11️⃣ | **Predictive Capital Rotation** | Sector flow prediction | 🔴 Yüksek | ~4-5 gün |
| 12️⃣ | **Smart Mean-Reversion Detector** | Price anomaly + reversal | 🟠 Orta | ~3-4 gün |
| 13️⃣ | **Event-Driven Alpha Alerts** | TCMB/FED calendar | 🟡 Düşük | ~2-3 gün |
| 14️⃣ | **Cross-Market Divergence Radar** | BIST-NASDAQ-S&P comparison | 🟠 Orta | ~3-4 gün |
| 15️⃣ | **Institutional Footprint AI** | Volume+pattern analysis | 🟠 Orta | ~3-4 gün |
| 16️⃣ | **Self-Learning Reward Engine** | Reward-based RL | 🔴 Yüksek | ~5-7 gün |
| 17️⃣ | **Hidden Liquidity Scanner** | Order book analysis | 🟡 Düşük | ~2-3 gün |
| 18️⃣ | **Smart Cluster Trading** | Momentum-sentiment clustering | 🟠 Orta | ~3-4 gün |
| 19️⃣ | **Sentiment-Momentum Fusion Index (SMF)** | 0-100 unified score | 🟠 Orta | ~2-3 gün |

---

## 📋 DETAYLI ANALİZ

### 1️⃣ Alpha Pulse Engine ❌
**Durum:** Tamamen eksik  
**Teknoloji:** Fourier Transform + FastGRU sequence detector  
**Özellik:** 1-3 dakika ön-momentum nabzı yakalama  
**Fayda:** %0.3-0.8 erken giriş avantajı  

**Gerekli Dosyalar:**
- `web-app/src/lib/alpha-pulse-engine.ts` (yeni)
- `web-app/src/components/AI/AlphaPulseRadar.tsx` (yeni)
- Backend: FastGRU model eğitimi

---

### 3️⃣ News Impact Scorer ❌
**Durum:** FinBERT mevcut, ancak fiyat etkisi çevirisi eksik  
**Teknoloji:** FinBERT sentiment + Volume correlation  
**Özellik:** Haber sentiment → gerçek fiyat etkisi dönüştürme  
**Fayda:** Sadece işe yarayan haberlere işlem  

**Mevcut:**
- `web-app/src/lib/finbert-rolling.ts` ✅
- `web-app/src/components/AI/SentimentImpactBar.tsx` ✅

**Eksik:**
- Volume-haber korelasyonu analizi
- Fiyat etkisi tahmin modeli
- Impact score hesaplama

**Gerekli Dosyalar:**
- `web-app/src/lib/news-impact-scorer.ts` (yeni)

---

### 7️⃣ Adaptive Volatility Hedger ❌
**Durum:** Risk yönetimi var, ancak otomatik hedge eksik  
**Teknoloji:** Delta-risk hesaplama + VIOP entegrasyonu  
**Özellik:** Portföy delta-riskini gerçek zamanlı hedge  
**Fayda:** Dalgalanma kaybı %40 azalır  

**Mevcut:**
- `web-app/src/lib/risk-score-dynamic.ts` ✅
- `web-app/src/components/RiskEngine.tsx` ✅

**Eksik:**
- Delta-risk hesaplama
- VIOP long/short önerileri
- Otomatik hedge tetikleme

**Gerekli Dosyalar:**
- `web-app/src/lib/volatility-hedger.ts` (yeni)
- `web-app/src/components/AI/AdaptiveHedger.tsx` (yeni)

---

### 10️⃣ Regime Auto-Shift 🟡
**Durum:** Kısmen mevcut  
**Teknoloji:** CDS/VIX/USDTRY bazlı rejim algılama  
**Özellik:** Risk-on/off otomatik geçiş  
**Fayda:** Volatil dönemlerde portföy koruma  

**Mevcut:**
- `web-app/src/store/global-state.ts` - Regime state ✅
- `web-app/src/components/AI/AIDailySummaryPlus.tsx` - CDS/VIX göstergeler ✅

**Eksik:**
- CDS/VIX/USDTRY otomatik takibi
- Rejim değişim tetikleme
- Portföy otomatik rebalance

**Gerekli Dosyalar:**
- `web-app/src/lib/regime-autoshift.ts` (geliştirme)
- Backend: CDS/VIX/USDTRY data feed

---

### 19️⃣ Sentiment-Momentum Fusion Index (SMF) ❌
**Durum:** Eksik  
**Teknoloji:** FinBERT sentiment + Price momentum birleşik skor  
**Özellik:** 0-100 tek metrik  
**Fayda:** Tüm sinyalleri tek skorda özetleme  

**Mevcut:**
- FinBERT sentiment ✅
- Momentum hesaplama ✅ (kısmen)

**Eksik:**
- SMF hesaplama formülü
- 0-100 normalize edilmiş skor
- UI gösterimi

**Gerekli Dosyalar:**
- `web-app/src/lib/smf-index.ts` (yeni)
- `web-app/src/components/AI/SMFIndex.tsx` (yeni)

---

## 🎯 ÖNCELİKLENDİRİLMİŞ SPRINT PLANI

### Sprint 1: Kritik Alpha Motorları (P0)
- ✅ Alpha Pulse Engine (1-3 dk ön-momentum)
- ✅ Micro-Alpha Extractor (15m/30m mikro trend)
- ✅ News Impact Scorer (FinBERT → fiyat etkisi)

**Tahmini Süre:** 10-14 gün

---

### Sprint 2: Risk & Hedging (P1)
- ✅ Smart Position Scaling (geliştirme)
- ✅ Adaptive Volatility Hedger
- ✅ Smart Stop-Loss Predictor (geliştirme)

**Tahmini Süre:** 8-10 gün

---

### Sprint 3: Akıllı Sinyal Sistemleri (P1)
- ✅ Dynamic Sentiment Arbitrage
- ✅ Smart Mean-Reversion Detector
- ✅ Sentiment-Momentum Fusion Index (SMF)

**Tahmini Süre:** 8-10 gün

---

### Sprint 4: Piyasa İstihbaratı (P2)
- ✅ Cross-Market Divergence Radar
- ✅ Institutional Footprint AI
- ✅ Predictive Capital Rotation

**Tahmini Süre:** 10-12 gün

---

### Sprint 5: Öğrenme & Optimizasyon (P2)
- ✅ Self-Learning Reward Engine
- ✅ Behavior-Linked Trade Filter
- ✅ Profit Integrity Analyzer (geliştirme)

**Tahmini Süre:** 8-10 gün

---

### Sprint 6: Yardımcı Özellikler (P3)
- ✅ Liquidity Flow Tracker
- ✅ Hidden Liquidity Scanner
- ✅ Smart Cluster Trading
- ✅ Event-Driven Alpha Alerts
- ✅ Regime Auto-Shift (geliştirme)

**Tahmini Süre:** 10-12 gün

---

## 📊 TOPLAM İŞ YÜKÜ TAHMİNİ

| Kategori | Özellik Sayısı | Tahmini Gün |
|----------|----------------|-------------|
| **P0 (Kritik)** | 3 | 10-14 |
| **P1 (Yüksek)** | 6 | 16-20 |
| **P2 (Orta)** | 5 | 18-22 |
| **P3 (Düşük)** | 6 | 12-15 |
| **TOPLAM** | **20** | **56-71 gün** |

---

## ✅ SONUÇ & ÖNERİLER

### Öncelik 1: Hızlı Kazanım (Quick Wins)
1. **SMF Index** - Hızlı implement, görünür etki
2. **Regime Auto-Shift** - Mevcut altyapıyı geliştir
3. **Smart Stop-Loss Predictor** - Mevcut RiskEngine'i genişlet

### Öncelik 2: Kritik Altyapı
1. **Alpha Pulse Engine** - En yüksek etki
2. **News Impact Scorer** - Mevcut FinBERT'i geliştir
3. **Adaptive Volatility Hedger** - Risk yönetimi kritik

### Öncelik 3: Uzun Vadeli Değer
1. **Self-Learning Reward Engine** - AI öğrenme çekirdeği
2. **Predictive Capital Rotation** - Sektör analizi
3. **Institutional Footprint AI** - Smart money takibi

---

## 🔧 TEKNİK NOTLAR

### Backend Gereksinimleri
- FastGRU model eğitimi (Alpha Pulse)
- CNN+LSTM hybrid model (Micro-Alpha)
- RL reward engine backend
- CDS/VIX/USDTRY real-time feed
- Volume pattern detection API

### Frontend Gereksinimleri
- Yeni UI component'ler (20+)
- Real-time WebSocket entegrasyonları
- Gelişmiş grafikler (Recharts/Plotly)
- Alert/Notification sistemi genişletme

---

**Not:** Bu analiz, mevcut kod tabanını ve PRD v6.0 gereksinimlerini karşılaştırarak hazırlanmıştır. Her özellik için detaylı teknik spesifikasyonlar ilgili sprint başlangıcında hazırlanacaktır.



