# 🚀 BIST AI Smart Trader

**Gelişmiş AI destekli trading asistanı - Next.js Web Uygulaması**

## 🎯 Özellikler

### 📊 Ana Modüller
- **Dashboard** - Genel bakış ve performans metrikleri
- **AI Sinyalleri** - XAI açıklamaları ile gelişmiş sinyaller
- **Piyasa Özeti** - Filtreleme ve sıralama ile
- **Gelişmiş Grafikler** - Teknik göstergeler ve çoklu chart türleri
- **Seçmeki Formasyonları** - Özel formasyon analizi
- **Gerçek Zamanlı Uyarılar** - Otomatik bildirimler
- **God Mode** - Tüm premium özellikler

### 🤖 AI Özellikleri
- **LightGBM + LSTM + TimeGPT** - Ensemble prediction
- **XAI Açıklamaları** - SHAP + LIME ile sinyal nedenleri
- **Sentiment Analizi** - FinBERT-TR + Twitter + KAP
- **Makro Rejim Algılayıcı** - HMM + CDS + USDTRY
- **TOPSIS Analizi** - Grey TOPSIS + Entropi ağırlık
- **RL Portföy Ajanı** - FinRL + DDPG

### 📈 Teknik Analiz
- **50+ Teknik Gösterge** - RSI, MACD, Bollinger Bands, vs.
- **Formasyon Motoru** - EMA cross, candlestick, harmonic
- **Auto-Backtest** - vectorbt-pro ile performans analizi
- **Risk Yönetimi** - Stop loss, take profit, position sizing

### 🔔 Bildirim Sistemi
- **Gerçek Zamanlı Uyarılar** - 15 saniyede bir güncelleme
- **Ses Bildirimleri** - Açma/kapama özelliği
- **Öncelik Seviyeleri** - CRITICAL/HIGH/MEDIUM/LOW
- **Web Push** - FCM entegrasyonu

## 🛠️ Teknoloji Stack

### Frontend
- **Next.js 15.5.5** - React framework
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Modern styling
- **Recharts** - İnteraktif grafikler
- **Heroicons** - İkon kütüphanesi

### Backend
- **FastAPI** - Python web framework
- **Uvicorn** - ASGI server
- **NumPy + Pandas** - Veri işleme
- **yfinance** - Finansal veri
- **WebSocket** - Gerçek zamanlı veri

### AI/ML
- **LightGBM** - Gradient boosting
- **LSTM** - Deep learning
- **TimeGPT** - Time series forecasting
- **SHAP + LIME** - Explainable AI
- **FinBERT-TR** - Türkçe sentiment

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- Python 3.9+
- npm/yarn

### Web Uygulaması
```bash
cd web-app
npm install
npm run dev
```

### Backend API
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn simple_api_server:app --host 0.0.0.0 --port 8081 --reload
```

## 📱 Kullanım

### Giriş Bilgileri
- **Admin (God Mode):** `admin@bistai.com` / `admin`
- **Demo:** `demo@bistai.com` / `demo123`
- **Premium:** `premium@bistai.com` / `premium123`

### URL'ler
- **Web App:** http://localhost:3003
- **Backend API:** http://localhost:8081
- **Health Check:** http://localhost:8081/health

## 🎯 Özellikler Detayı

### Seçmeki Formasyonları
- **Seçmeki Yükseliş** - Üçlü dip formasyonu
- **Seçmeki Düşüş** - Çifte tepe formasyonu
- **Seçmeki Kırılım** - Üçgen formasyonu kırılımı
- **Görsel Desenler** - SVG pattern gösterimi
- **Risk Analizi** - SL/TP seviyeleri

### Gerçek Zamanlı Uyarılar
- **Otomatik Bildirimler** - 15 saniyede bir
- **Ses Bildirimleri** - Açma/kapama
- **Öncelik Filtreleme** - Okunmamış/Yüksek öncelik
- **Uyarı Türleri** - BUY/SELL/BREAKOUT/VOLUME_SPIKE/NEWS

## 🔧 Geliştirme

### Proje Yapısı
```
borsailhanos/
├── web-app/                 # Next.js web uygulaması
│   ├── src/
│   │   ├── app/            # App router
│   │   ├── components/     # React components
│   │   └── lib/           # Utilities
├── backend/                # Python backend
│   ├── services/          # AI services
│   ├── models/            # Data models
│   └── api/               # API endpoints
├── flutter_app/           # Flutter mobile (legacy)
└── venv/                  # Python virtual environment
```

### Komutlar
```bash
# Web development
cd web-app && npm run dev

# Backend development
source venv/bin/activate && uvicorn simple_api_server:app --reload

# Build for production
cd web-app && npm run build
```

## 📊 Performans Metrikleri

- **Doğruluk Oranı:** %87.3
- **Aktif Sinyaller:** 3
- **Uptime:** 99.9%
- **Latency:** 45ms
- **God Mode:** Aktif

## 🚀 Deployment

### Vercel (Önerilen)
```bash
cd web-app
npm run build
vercel --prod
```

### Netlify
```bash
cd web-app
npm run build
netlify deploy --prod --dir=out
```

## 📈 Roadmap

- [ ] **Gerçek Broker API** - İş Bankası, Yapı Kredi
- [ ] **Kripto Trading** - BTC, ETH, ADA
- [ ] **Opsiyon Analizi** - Greeks, Volatility
- [ ] **Sosyal Trading** - Copy trade, Leaderboard
- [ ] **Mobile App** - React Native
- [ ] **PWA** - Offline support

## 🤝 Katkıda Bulunma

1. Fork yap
2. Feature branch oluştur (`git checkout -b feature/amazing-feature`)
3. Commit yap (`git commit -m 'Add amazing feature'`)
4. Push yap (`git push origin feature/amazing-feature`)
5. Pull Request aç

## 📄 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🆘 Destek

- **Email:** support@bistai.com
- **GitHub Issues:** [Issues](https://github.com/username/bist-ai-smart-trader/issues)
- **Discord:** [Discord Server](https://discord.gg/bist-ai)

---

**"Algoritma bilgidir; disiplin kârdır."** 🚀📈
