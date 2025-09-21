# 🚀 BIST AI Smart Trader - Railway Deployment Guide

## 📋 Deployment Adımları

### 1. Railway Hesabı Oluştur
- [Railway.app](https://railway.app) sitesine git
- GitHub ile giriş yap
- "New Project" butonuna tıkla

### 2. GitHub Repository Bağla
- "Deploy from GitHub repo" seç
- `borsailhanos` repository'sini seç
- Branch: `main`

### 3. Railway Konfigürasyonu
Railway otomatik olarak şu dosyaları algılayacak:
- `railway.toml` - Deployment konfigürasyonu
- `requirements-railway.txt` - Python bağımlılıkları
- `railway_server.py` - Ana server dosyası

### 4. Environment Variables
Railway dashboard'da şu environment variables'ları ekle:
```
PYTHON_VERSION=3.11
PORT=8000
RAILWAY_ENVIRONMENT=production
```

### 5. Deployment
- Railway otomatik olarak deploy edecek
- Build loglarını takip et
- URL: `https://your-app-name.railway.app`

## 🔧 Local Test

```bash
# Railway server'ı local'de test et
python3 railway_server.py

# Test endpoints
curl http://localhost:8000/
curl http://localhost:8000/health
curl http://localhost:8000/patterns/test
```

## 📊 Production Features

✅ **Health Monitoring** - `/health` endpoint
✅ **CORS Support** - Cross-origin requests
✅ **Error Handling** - Comprehensive error management
✅ **Logging** - Production-ready logging
✅ **Environment Detection** - Railway environment support
✅ **Auto-scaling** - Railway otomatik scaling

## 🚀 API Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health check
- `POST /signals` - AI signal analysis
- `GET /patterns/test` - Pattern detection test
- `GET /api/info` - API information

## 📱 Mobile App Integration

Flutter uygulaması bu API'yi kullanacak:
```dart
final response = await http.post(
  Uri.parse('https://your-app-name.railway.app/signals'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode({
    'symbol': 'SISE.IS',
    'timeframe': '1d',
    'mode': 'normal'
  }),
);
```

## 🎯 Next Steps

1. Railway'a deploy et
2. Flutter app'i API'ye bağla
3. Real-time data entegrasyonu
4. Performance monitoring
5. User authentication

---

**Status**: ✅ Ready for Railway Deployment
**Estimated Time**: 15-30 minutes
**Cost**: Free tier available
