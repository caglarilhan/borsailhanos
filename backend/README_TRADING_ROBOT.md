# 🤖 BIST AI Smart Trader - 3 Modlu Trading Robot

## 📋 Proje Özeti

BIST AI Smart Trader, Türkiye borsası için geliştirilmiş 3 modlu yapay zeka destekli trading robotudur. Agresif, Normal ve Güvenli modlarla farklı risk toleranslarına uygun otomatik alım-satım stratejileri sunar.

## 🎯 Özellikler

### 🤖 3 Trading Modu
- **AGRESİF MOD**: Yüksek frekans, yüksek risk (%30 pozisyon, %2 SL, %5 TP)
- **NORMAL MOD**: Orta frekans, orta risk (%20 pozisyon, %5 SL, %12 TP)  
- **GÜVENLİ MOD**: Düşük frekans, düşük risk (%10 pozisyon, %8 SL, %25 TP)

### 🧠 AI Ensemble Sistemi
- **LightGBM**: Günlük fiyat yönü tahmini
- **Prophet**: 4 saatlik zaman serisi tahmini
- **TimeGPT**: 10 günlük makro tahmin
- **Ensemble Combiner**: Ağırlıklı sinyal birleştirme

### 📊 Risk Yönetimi
- Otomatik Stop-Loss ve Take-Profit
- Position Sizing (confidence bazlı)
- Maksimum drawdown koruması
- Portföy çeşitlendirme

### 🔗 Broker Entegrasyonu
- Paper Trading (test modu)
- Mock Broker (simülasyon)
- Gerçek broker entegrasyonu (gelecek)

## 🚀 Kurulum

### 1. Gereksinimler
```bash
# Python 3.8+ gerekli
python3 --version

# Virtual environment oluştur
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows
```

### 2. Bağımlılıkları Yükle
```bash
pip install -r requirements.txt
```

### 3. Environment Variables
```bash
# .env dosyası oluştur
cp .env.example .env

# API anahtarlarını ekle (opsiyonel)
FINNHUB_API_KEY=your_finnhub_key
FMP_API_KEY=your_fmp_key
```

## 🎮 Kullanım

### 1. Hızlı Demo
```bash
# 3 modun kısa demo'su
python3 trading_robot_demo.py
```

### 2. Kapsamlı Test
```bash
# 30 günlük paper trading testi
python3 trading_robot_test.py
```

### 3. API Server
```bash
# FastAPI server başlat
python3 fastapi_app.py

# API dokümantasyonu: http://localhost:8000/docs
```

## 📡 API Endpoint'leri

### Temel Endpoint'ler
- `GET /` - Health check
- `POST /signals` - Sinyal analizi
- `POST /trade` - İşlem yapma
- `GET /status/{mode}` - Robot durumu
- `GET /positions/{mode}` - Açık pozisyonlar

### Kontrol Endpoint'leri
- `POST /mode/{new_mode}` - Mod değiştirme
- `POST /auto-trade/{mode}` - Otomatik trading
- `GET /broker/info` - Broker bilgileri
- `POST /broker/{broker_name}` - Broker değiştirme
- `GET /performance/{mode}` - Performans raporu

### Örnek API Kullanımı

#### Sinyal Analizi
```bash
curl -X POST "http://localhost:8000/signals" \
  -H "Content-Type: application/json" \
  -d '{"symbol": "SISE.IS", "mode": "normal"}'
```

#### İşlem Yapma
```bash
curl -X POST "http://localhost:8000/trade" \
  -H "Content-Type: application/json" \
  -d '{"symbol": "SISE.IS", "action": "BUY", "quantity": 1000, "price": 45.50, "mode": "normal"}'
```

#### Robot Durumu
```bash
curl "http://localhost:8000/status/normal"
```

## 📁 Dosya Yapısı

```
backend/
├── trading_robot_core.py      # Ana robot mimarisi
├── trading_robot_demo.py      # Hızlı demo
├── trading_robot_test.py      # Kapsamlı test
├── broker_integration.py      # Broker entegrasyonu
├── fastapi_app.py            # API server
├── lightgbm_pipeline.py      # LightGBM model
├── prophet_model.py          # Prophet model
├── timegpt_mock.py           # TimeGPT mock
├── ensemble_combiner.py      # Sinyal birleştirici
├── finnhub_websocket_layer.py # Veri katmanı
├── fundamental_data_layer.py # Fundamental veri
├── grey_topsis_entropy_ranking.py # Finansal sıralama
├── requirements.txt          # Bağımlılıklar
└── README_TRADING_ROBOT.md   # Bu dosya
```

## 🔧 Modüller

### 1. Trading Robot Core (`trading_robot_core.py`)
- 3 modlu robot mimarisi
- Risk parametreleri yönetimi
- Position sizing algoritması
- Stop-loss/Take-profit kontrolü
- Performans metrikleri

### 2. Broker Integration (`broker_integration.py`)
- Paper trading simülasyonu
- Mock broker (test)
- Gerçek broker entegrasyonu hazırlığı
- Order management
- Position tracking

### 3. AI Ensemble (`ensemble_combiner.py`)
- LightGBM + Prophet + TimeGPT
- Ağırlıklı sinyal birleştirme
- Confidence scoring
- Mod bazlı filtreleme

### 4. FastAPI App (`fastapi_app.py`)
- RESTful API endpoints
- Real-time trading
- Background tasks
- CORS support
- Auto-generated docs

## 📊 Risk Parametreleri

| Mod | Pozisyon | Stop-Loss | Take-Profit | Max Pozisyon | Min Güven |
|-----|----------|-----------|-------------|--------------|-----------|
| Agresif | %30 | %2 | %5 | 5 | %70 |
| Normal | %20 | %5 | %12 | 3 | %60 |
| Güvenli | %10 | %8 | %25 | 2 | %80 |

## 🎯 Performans Hedefleri

- **Signal Precision (BUY)**: ≥ 75%
- **Win Rate**: ≥ 60%
- **Max Drawdown**: ≤ 15% (Agresif), ≤ 10% (Normal), ≤ 5% (Güvenli)
- **Sharpe Ratio**: > 1.2
- **Total Return**: Hedef %20-50 yıllık

## 🔒 Güvenlik

- Paper trading ile test edilmiş
- Risk limitleri otomatik kontrol
- Stop-loss koruması
- Drawdown limitleri
- Position size kontrolü

## 🚧 Gelecek Özellikler

### v2.1 Planlanan
- [ ] Gerçek broker API entegrasyonu
- [ ] Sentiment analizi (FinBERT-TR)
- [ ] Makro rejim algılayıcı (HMM)
- [ ] RL tabanlı portföy ajanı
- [ ] XAI açıklamaları (SHAP/LIME)

### v2.2 Planlanan
- [ ] ABD borsası desteği
- [ ] Kripto para desteği
- [ ] Options trading
- [ ] Portfolio optimization
- [ ] Real-time alerts

## 🐛 Sorun Giderme

### Yaygın Sorunlar

1. **Import Error**: Virtual environment aktif değil
```bash
source venv/bin/activate
```

2. **API Key Error**: Mock mode otomatik aktif
```python
# trading_robot_core.py'de use_mock=True
```

3. **Memory Error**: Test süresini kısalt
```python
# trading_robot_test.py'de
self.test_duration_days = 7  # 30 yerine
```

4. **Performance Issues**: Daha az sembol kullan
```python
self.test_symbols = ["SISE.IS", "EREGL.IS"]  # 2 sembol
```

## 📞 Destek

- **GitHub Issues**: Hata bildirimi
- **Documentation**: `/docs` endpoint'i
- **Logs**: Detaylı logging sistemi

## 📄 Lisans

Bu proje eğitim ve araştırma amaçlıdır. Gerçek para ile kullanmadan önce kapsamlı test yapılması önerilir.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

**⚠️ Uyarı**: Bu sistem eğitim amaçlıdır. Gerçek trading için profesyonel danışmanlık alın.

