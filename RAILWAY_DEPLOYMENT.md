# 🚀 Railway Deployment Guide

## BIST AI Smart Trader v2.0 - Railway Deployment

### 📋 Ön Gereksinimler

1. **Railway Account**: [railway.app](https://railway.app) üzerinde hesap oluşturun
2. **Railway CLI**: `npm install -g @railway/cli`
3. **Git Repository**: Kodunuz GitHub'da olmalı

### 🔧 Deployment Adımları

#### 1. Railway CLI Login
```bash
railway login
```

#### 2. Proje Oluştur
```bash
railway init
```

#### 3. Environment Variables Ayarla
```bash
railway variables set DATABASE_URL="your_postgres_url"
railway variables set REDIS_URL="your_redis_url"
railway variables set FINNHUB_API_KEY="your_api_key"
railway variables set SECRET_KEY="your_secret_key"
```

#### 4. Deploy Et
```bash
railway up
```

### 🌐 Railway Dashboard

Deployment sonrası Railway dashboard'da:
- **Domains**: Otomatik URL
- **Logs**: Uygulama logları
- **Metrics**: CPU, Memory, Network
- **Variables**: Environment variables

### 📊 Health Check

Uygulama deploy edildikten sonra:
```bash
curl https://your-app.railway.app/health
```

### 🔍 Monitoring

- **Prometheus**: `/metrics` endpoint
- **Health**: `/health` endpoint
- **Dashboard**: `/dashboard` endpoint

### 🚨 Troubleshooting

#### Common Issues:
1. **Build Fail**: Dockerfile.railway kontrol et
2. **Runtime Error**: Logs kontrol et
3. **Environment Variables**: Railway dashboard'da kontrol et

### 📈 Performance

- **Cold Start**: ~10-15 saniye
- **Response Time**: <200ms
- **Memory Usage**: <100MB
- **CPU**: Efficient

### 🔐 Security

- HTTPS otomatik
- Environment variables encrypted
- Health check endpoints
- Rate limiting

### 📞 Support

Railway deployment sorunları için:
- Railway docs: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
