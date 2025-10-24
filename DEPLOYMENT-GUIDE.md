# 🚀 BIST AI Smart Trader - Full-Stack Deployment Guide

## 📋 Özet
Bu rehber ile **tek YAML dosyası** ile full-stack sistemi Render'da deploy edeceğiz.

## 🎯 Hedef URL'ler
- **Frontend:** `https://www.borsailhanos.com`
- **Backend API:** `https://api.borsailhanos.com`
- **Root Redirect:** `https://borsailhanos.com` → `www.borsailhanos.com`

## ⚙️ Deployment Adımları

### 1️⃣ Render Dashboard'a Git
- [https://dashboard.render.com](https://dashboard.render.com)
- **"New"** → **"Blueprint"**

### 2️⃣ YAML Dosyasını Yapıştır
`borsailhanos-fullstack-blueprint.yaml` dosyasının içeriğini kopyala ve Render'a yapıştır.

### 3️⃣ Deploy Başlat
**"Deploy Blueprint"** butonuna bas.

### 4️⃣ Domain Ayarları
Render sana DNS kayıtlarını gösterecek:
```
CNAME api.borsailhanos.com → borsailhanos-backend.onrender.com
CNAME app.borsailhanos.com → borsailhanos-frontend.onrender.com
CNAME www.borsailhanos.com → borsailhanos-frontend.onrender.com
A borsailhanos.com → [IP_ADDRESS]
```

## 🔧 Environment Variables

### Backend (borsailhanos-backend)
```env
NODE_ENV=production
PORT=10000
CORS_ORIGIN=https://www.borsailhanos.com
PYTHONUNBUFFERED=1
UVICORN_WORKERS=2
REDIS_URL=
DATABASE_URL=
FINNHUB_API_KEY=your_key_here
FIREBASE_API_KEY=your_key_here
JWT_SECRET=your_secret_here
```

### Frontend (borsailhanos-frontend)
```env
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://api.borsailhanos.com
NEXT_PUBLIC_APP_NAME=BIST AI Smart Trader
NEXT_PUBLIC_APP_VERSION=2.0
```

## ✅ Başarı Kontrolü

Deploy tamamlandıktan sonra:

1. **Backend Health Check:**
   ```bash
   curl https://api.borsailhanos.com/api/health
   ```

2. **Frontend Test:**
   ```bash
   curl https://www.borsailhanos.com
   ```

3. **API Integration Test:**
   ```bash
   curl https://api.borsailhanos.com/api/signals
   ```

## 🚨 Sorun Giderme

### Build Hatası
- `npm run build:render` komutunu kontrol et
- `web-app/package.json`'da script'in var olduğunu doğrula

### Domain Hatası
- DNS kayıtlarının 24 saat içinde propagate olduğunu bekle
- `nslookup api.borsailhanos.com` ile kontrol et

### CORS Hatası
- Backend'de `CORS_ORIGIN` environment variable'ını kontrol et
- Frontend URL'inin doğru olduğunu doğrula

## 🎉 Sonuç

Deploy başarılı olduğunda:
- ✅ Full-stack sistem canlı
- ✅ SSL sertifikaları aktif
- ✅ Domain yönlendirmeleri çalışıyor
- ✅ Backend-Frontend entegrasyonu tamam

**BIST AI Smart Trader artık production'da! 🚀📈**
