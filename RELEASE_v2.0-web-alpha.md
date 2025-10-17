# BIST AI Smart Trader v2.0 Web Alpha

## 🚀 Yeni Özellikler

### AI Sinyalleri
- BIST30/BIST100 çoklu ufuk tahminleri (5m, 15m, 30m, 1h, 4h, 1d)
- Güven skorları ve geçerlilik süreleri
- Watchlist filtresi ve takip sistemi
- 85%+ güven sinyallerinde bildirim

### Canlı Fiyatlar
- Gerçek zamanlı fiyat akışı (SSE)
- Sembol ekleme/çıkarma
- Watchlist senkronizasyonu
- Periyodik yenileme (2s-5s)

### Predictive Twin
- Çoklu ufuk olasılık analizi
- Kalibrasyon metrikleri (Brier Score, ECE)
- Model drift takibi
- Beklenen getiri hesaplama

### Risk Engine
- Volatility parity ağırlık dağılımı
- Otomatik lot hesaplama
- SL/TP önerileri
- Predictive Twin entegrasyonu

### Scenario Simulator
- Monte Carlo simülasyon (2000+ senaryo)
- Makro parametre slider'ları (faiz, kur, VIX)
- Portföy profili seçimi (konservatif/dengeli/agresif)
- VaR 95/99 metrikleri

### XAI Explainability
- SHAP/LIME katkı analizi
- Top-10 özellik sıralaması
- CSV export
- Görsel çubuk grafikleri

### Ingestion Monitor
- Kafka/Redpanda durum takibi
- Consumer lag grafikleri
- E2E latency monitoring
- Gerçek zamanlı metrikler

### Adaptive UI
- Kullanıcı davranış telemetrisi
- Akıllı öneri sistemi
- Kısayol ve insight kartları

### Watchlist Sistemi
- Header dropdown yönetimi
- Takip listesi senkronizasyonu
- Filtreleme ve bildirimler

## 🛠 Teknik Altyapı

### Backend
- HTTP Server (Python)
- Mock ML servisleri
- Kafka/Redpanda connector stub
- Web Push bildirim sistemi

### Frontend
- Next.js 15.5.5 (Turbopack)
- TypeScript + Tailwind CSS
- Service Worker (PWA)
- Real-time SSE

### API Endpoints
- `/api/ai/bist30_predictions` - BIST30 tahminleri
- `/api/ai/bist100_predictions` - BIST100 tahminleri
- `/api/prices/bulk` - Toplu fiyat sorgusu
- `/api/prices/stream` - SSE fiyat akışı
- `/api/twin` - Predictive Twin analizi
- `/api/risk/position_size` - Risk hesaplama
- `/api/xai/explain` - XAI açıklama
- `/api/simulate` - Senaryo simülasyonu
- `/api/ingestion/*` - Kafka monitoring
- `/api/ui/*` - Adaptive UI
- `/api/watchlist/*` - Takip listesi
- `/api/alerts/*` - Bildirim sistemi

## 📱 Kullanım

### Başlatma
```bash
# Backend
export HOST=127.0.0.1 PORT=9011
python3 simple_http_server.py

# Frontend
cd web-app
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:9011" > .env.local
npm run dev
# http://localhost:3006
```

### Ana Paneller
1. **AI Sinyalleri** - BIST tahminleri ve watchlist
2. **Piyasa** - Market overview + canlı fiyatlar
3. **Predictive Twin** - Çoklu ufuk analizi
4. **Risk Engine** - Portföy optimizasyonu
5. **Scenario Simulator** - Makro simülasyon
6. **XAI Explain** - Sinyal açıklama
7. **Ingestion Monitor** - Sistem durumu
8. **Adaptive UI** - Akıllı öneriler

## 🔮 Sonraki Adımlar

### v2.1 Planlanan
- Gerçek Kafka/Redpanda entegrasyonu
- FCM Web Push (Firebase)
- Gerçek broker API bağlantıları
- Gelişmiş grafikler (TradingView)
- Mobil uygulama (Flutter)

### v2.2 Planlanan
- Gerçek ML model eğitimi
- Sentiment analizi (FinBERT-TR)
- Makro rejim algılama
- RL portföy ajanı
- Sosyal trading

## 📊 Performans

- **Build Size**: 151 kB (First Load JS: 264 kB)
- **API Response**: < 300ms
- **SSE Latency**: < 250ms
- **Build Time**: ~4s

## 🏷 Release Info

- **Version**: v2.0-web-alpha
- **Date**: 2024-10-15
- **Commit**: c4ca50a5
- **Branch**: main

---

**BIST AI Smart Trader** - Türkiye'nin ilk AI destekli yatırım danışmanı 🚀📈
