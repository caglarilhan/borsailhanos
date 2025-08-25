# 🚀 GitHub Actions Deployment Guide

## BIST AI Smart Trader v2.0 - GitHub Actions Deployment

### 📋 **Gereksinimler**

1. **GitHub Account**: [github.com](https://github.com) üzerinde hesap
2. **Vercel Account**: [vercel.com](https://vercel.com) üzerinde hesap (ücretsiz)
3. **GitHub Actions**: Repository'de otomatik olarak aktif

### 🚀 **Hızlı Başlangıç**

#### 1. GitHub Secrets Ayarla

Repository'de **Settings > Secrets and variables > Actions** bölümüne gidin:

```bash
# Gerekli secrets'ları ekleyin:
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

#### 2. Vercel CLI Kurulum

```bash
npm install -g vercel
vercel login
```

#### 3. Otomatik Deployment

Her `main` branch'e push yaptığınızda:
- ✅ Otomatik test çalışır
- ✅ Backend Vercel'e deploy edilir
- ✅ Flutter web app Vercel'e deploy edilir

### 🌐 **GitHub Actions Workflow**

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd backend
          python -m pytest tests/ -v

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'
      - name: Build Flutter Web
        run: |
          cd mobile_app
          flutter build web
      - name: Deploy to Vercel
        run: |
          cd mobile_app/build/web
          npm install -g vercel
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

### 📊 **Monitoring & Logs**

#### GitHub Actions Dashboard
- **Repository > Actions** sekmesinde deployment durumunu takip edin
- **Workflow runs** ile detaylı log'ları görün
- **Failed jobs** için hata analizi yapın

#### Vercel Dashboard
- **Deployments** sekmesinde canlı URL'leri görün
- **Functions** sekmesinde backend API log'larını takip edin
- **Analytics** ile performans metriklerini izleyin

### 🔧 **Troubleshooting**

#### 1. **Build Failures**
```bash
# GitHub Actions log'larını kontrol edin
# Requirements.txt dependency conflicts
# Python version compatibility
```

#### 2. **Deployment Failures**
```bash
# Vercel token'ı kontrol edin
# Project ID ve Org ID doğru mu?
# Environment variables eksik mi?
```

#### 3. **Runtime Errors**
```bash
# Vercel Functions log'larını kontrol edin
# Local test yapın: python backend/main.py
# Health check endpoint'i test edin
```

### 💰 **Maliyet**

#### GitHub Actions
- **Public repositories**: Ücretsiz (2000 dakika/ay)
- **Private repositories**: $4/ay (3000 dakika)

#### Vercel
- **Hobby Plan**: Ücretsiz
  - 100 GB bandwidth/ay
  - 100 serverless function executions/ay
  - Custom domains
  - SSL certificates

### 🎯 **Sonraki Adımlar**

1. **✅ GitHub Actions Setup** - Tamamlandı
2. **🌐 Vercel Integration** - Vercel token ekle
3. **📱 Mobile App Store** - App Store + Play Store
4. **🔐 Advanced Security** - OAuth2 + RBAC

### 📞 **Support & Resources**

- **GitHub Actions Docs**: [docs.github.com/actions](https://docs.github.com/actions)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Flutter Web**: [flutter.dev/web](https://flutter.dev/web)

---

**🚀 Artık Railway'e para harcamadan, GitHub Actions ile ücretsiz deployment yapabilirsiniz!**
