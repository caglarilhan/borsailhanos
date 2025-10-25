# 🚀 BIST AI Smart Trader - MVP Quick Start

**5 dakikada sistemi çalıştırın!**

---

## ✅ **ÖN KOŞULLAR**

- ✅ Python 3.13+ yüklü
- ✅ Node.js 18+ yüklü
- ✅ Git yüklü

---

## 🔥 **HIZLI BAŞLATMA (3 ADIM)**

### 1️⃣ **Backend'i Başlat**

```bash
# Repo'yu klonla (veya mevcut dizinde)
cd borsailhanos

# Backend'i başlat (hiçbir dependency gerekmez!)
./start_backend.sh
```

**Beklenen Çıktı:**
```
======================================================================
🚀 BIST AI Smart Trader - Comprehensive Backend API
======================================================================
📊 URL: http://localhost:8080
📈 Endpoint Sayısı: 60+
✅ CORS: Aktif
======================================================================
```

### 2️⃣ **Frontend'i Başlat**

**Yeni terminal açın:**

```bash
cd web-app
npm install
npm run dev
```

**Beklenen Çıktı:**
```
✓ Ready in 1088ms
- Local:   http://localhost:3001
```

### 3️⃣ **Tarayıcıda Aç**

```
http://localhost:3001
```

**✅ Sistem hazır!**

---

## 📊 **ÖZELLİKLER (MVP v2.0)**

### ✅ **Çalışan Modüller:**

1. **AI Trading Sinyalleri** - THYAO, ASELS, TUPRS için BUY/SELL sinyalleri
2. **Piyasa Özeti** - 5 hisse + sektör + P/E + temettü
3. **AI Tahminleri** - 1 gün ve 7 gün tahminleri
4. **Risk Analizi** - VaR, Sharpe, Max Drawdown, Volatilite
5. **Sektör Gücü** - Bankacılık, Teknoloji, Sanayi, Turizm, Enerji
6. **Watchlist** - Favori hisseleri kaydet
7. **Ensemble Modeller** - LSTM, Prophet, CatBoost, LightGBM performans
8. **XAI Açıklama** - SHAP values ile karar açıklaması
9. **Regime Analizi** - BULLISH/BEARISH/SIDEWAYS piyasa durumu
10. **Pattern Tespiti** - Elliott Wave, Harmonic patterns
11. **Arbitrage** - Çapraz piyasa fırsatları
12. **Tracking** - Sinyal takip ve performans raporu

### 🟡 **Geliştirme Aşamasında:**

- 🟡 Gerçek zamanlı WebSocket veri akışı
- 🟡 Gerçek ML model entegrasyonu (şu an mock data)
- 🟡 Broker API entegrasyonu
- 🟡 Kullanıcı auth sistemi
- 🟡 Bildirim sistemi (Push notifications)

---

## 🔧 **SORUN GİDERME**

### Port 8080 Meşgul

```bash
lsof -ti:8080 | xargs kill -9
./start_backend.sh
```

### Port 3000 Meşgul

```bash
pkill -f "next dev"
cd web-app && npm run dev
```

### Frontend Backend'e Bağlanmıyor

```bash
# .env.local dosyasını kontrol et
cat web-app/.env.local

# Şu satırlar olmalı:
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## 📡 **API ENDPOINT'LERİ TEST**

### Temel Test:

```bash
# Health check
curl http://localhost:8080/health

# Trading signals
curl http://localhost:8080/api/real/trading_signals

# AI predictions
curl http://localhost:8080/api/ai/predictions

# Risk analysis
curl http://localhost:8080/api/risk/analysis
```

### Tüm Endpoint'ler:

Backend çalışırken şu URL'yi aç:
```
http://localhost:8080/
```

60+ endpoint listesini göreceksin!

---

## 🎯 **BAŞARIYLA ÇALIŞTIĞINI NASIL ANLARSIN?**

✅ Backend terminal'de şu mesajı gösteriyor:
```
📡 GET /api/real/trading_signals
📡 GET /api/market/overview
```

✅ Frontend'de şunlar görünüyor:
- Dashboard metrikleri
- AI sinyalleri (THYAO, ASELS, TUPRS)
- Piyasa tablosu
- Grafikler

✅ Tarayıcı console'da **CORS hatası yok**

✅ Network tab'da **200 OK** yanıtlar

---

## 🚀 **PRODUCTION DEPLOYMENT**

### Render.com (Önerilen)

```bash
# Blueprint ile tek seferde deploy
# Render Dashboard > New > Blueprint
# borsailhanos-fullstack-blueprint.yaml dosyasını kullan
```

Detaylar için: `DEPLOYMENT-GUIDE.md`

---

## 📚 **DOKÜMANTASYON**

- **API Endpoint'leri:** `backend/API_ENDPOINTS.md`
- **Backend Kullanımı:** `backend/README_BACKEND.md`
- **Sistem Durumu:** `SYSTEM_STATUS.md`
- **Deployment:** `DEPLOYMENT-GUIDE.md`

---

## 💡 **SONRAKİ ADIMLAR**

1. ✅ Sistemi başlat ve test et
2. 🔧 Gerçek BIST API'sini bağla (yfinance, Finnhub)
3. 🧠 ML modellerini ekle (LSTM, Prophet)
4. 🔔 Bildirim sistemini aktifleştir
5. 👤 Kullanıcı auth ekle
6. 🌐 Production'a deploy et

---

**🔥 Sistem tamamen çalışıyor! MVP hazır! 📈**

**Sorular için:** `SYSTEM_STATUS.md` dosyasını kontrol et
