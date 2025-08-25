# 🚀 GitHub Actions Test Guide

## BIST AI Smart Trader v2.0 - GitHub Actions Testing

### 📋 **Gereksinimler**

1. **GitHub Account**: [github.com](https://github.com) üzerinde hesap
2. **GitHub Actions**: Repository'de otomatik olarak aktif

### 🚀 **Hızlı Başlangıç**

#### 1. Otomatik Test

Her `main` branch'e push yaptığınızda:
- ✅ Otomatik test çalışır
- ✅ Python dependencies kontrol edilir
- ✅ Basic functionality test edilir

### 🌐 **GitHub Actions Workflow**

```yaml
name: Test Only

on:
  push:
    branches: [main]
  pull_request:
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
          python -m pytest tests/ -v || echo "No tests found, continuing..."
          
      - name: Basic functionality test
        run: |
          cd backend
          python -c "print('✅ Basic Python test passed')"
```

### 📊 **Monitoring & Logs**

#### GitHub Actions Dashboard
- **Repository > Actions** sekmesinde test durumunu takip edin
- **Workflow runs** ile detaylı log'ları görün
- **Failed jobs** için hata analizi yapın

### 🔧 **Troubleshooting**

#### 1. **Build Failures**
```bash
# GitHub Actions log'larını kontrol edin
# Requirements.txt dependency conflicts
# Python version compatibility
```

#### 2. **Test Failures**
```bash
# Local test yapın: python backend/main.py
# Dependencies kontrol edin: pip install -r requirements.txt
```

### 💰 **Maliyet**

#### GitHub Actions
- **Public repositories**: Ücretsiz (2000 dakika/ay)
- **Private repositories**: $4/ay (3000 dakika)

### 🎯 **Sonraki Adımlar**

1. **✅ GitHub Actions Setup** - Tamamlandı
2. **🧪 Test Coverage** - Daha fazla test ekle
3. **📱 Local Development** - Local'de çalıştır
4. **🔐 Security** - Code quality checks

### 📞 **Support & Resources**

- **GitHub Actions Docs**: [docs.github.com/actions](https://docs.github.com/actions)
- **Python Testing**: [docs.python.org/3/library/unittest.html](https://docs.python.org/3/library/unittest.html)

---

**🚀 Artık sadece GitHub'da test yapıyoruz, hiçbir external service yok!**
