# BIST AI Smart Trader - Backend API

## 🚀 Hızlı Başlangıç

### Minimal API (Önerilen - Dependency Yok)

```bash
cd backend
python3 minimal_api.py
```

**Özellikler:**
- ✅ Hiçbir external dependency gerekmez
- ✅ Sadece Python standard library
- ✅ CORS desteği
- ✅ Tüm endpoint'ler çalışıyor

**Endpoint'ler:**
- `http://localhost:8080/` - Ana sayfa
- `http://localhost:8080/api/real/trading_signals` - Trading sinyalleri
- `http://localhost:8080/api/test` - Test endpoint
- `http://localhost:8080/health` - Health check

---

### FastAPI (Gelişmiş - Venv Gerekli)

```bash
cd backend
source venv/bin/activate
python -m uvicorn fastapi_main:app --host 0.0.0.0 --port 8080 --reload
```

**Not:** FastAPI için venv aktif olmalı!

---

## 🔧 Sorun Giderme

### Port 8080 Meşgul

```bash
lsof -ti:8080 | xargs kill -9
```

### Venv Kurulum

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## 📊 Test

```bash
# Trading signals
curl http://localhost:8080/api/real/trading_signals | python3 -m json.tool

# Health check
curl http://localhost:8080/health
```

---

## ✅ Başarılı Çalışma Göstergeleri

- ✅ Backend başlatıldı mesajı göründü
- ✅ `http://localhost:8080` açıldı
- ✅ `/api/real/trading_signals` JSON döndü
- ✅ CORS hataları yok
- ✅ Frontend backend'e bağlandı

---

**NOT:** Minimal API üretim için hazır değil, sadece development amaçlıdır!
