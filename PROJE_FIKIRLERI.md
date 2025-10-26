# 💡 BIST AI Smart Trader - Proje Fikirleri ve Roadmap

## 🎯 Şu Anki Durum
V4.6 - Frontend tamam, backend entegrasyonu bekleniyor.

## 💡 Eklemek İstediğim Fikirler

### 1. 🔥 ACİL: Backend Entegrasyonu (Sprint 1)
**Neden:** Şu an mock data ile çalışıyor. Gerçek veriler şart!

**Yapılacaklar:**
- [ ] FastAPI backend'i uçtan uca test et
- [ ] /api/signals endpoint ile dashboard'u besle
- [ ] yfinance ile gerçek fiyat verisi çek
- [ ] WebSocket ile real-time updates

**Kod Örneği:**
```python
# backend/api/main.py
from fastapi import FastAPI
app = FastAPI()

@app.get("/api/signals")
async def get_signals():
    # Gerçek AI sinyalleri
    return {
        "signals": [...],
        "timestamp": datetime.now()
    }
```

```typescript
// web-app/src/hooks/useSignals.ts
export function useSignals() {
  const [signals, setSignals] = useState([]);
  
  useEffect(() => {
    fetch('http://localhost:8000/api/signals')
      .then(res => res.json())
      .then(data => setSignals(data.signals));
  }, []);
  
  return signals;
}
```

### 2. 📊 Real Data Akışı (Sprint 2)
**Neden:** Yfinance + Finnhub kombinasyonu ile güçlü veri akışı.

**Yapılacaklar:**
- [ ] yfinance entegrasyonu (ücretsiz)
- [ ] Finnhub WebSocket (30 sembol limit)
- [ ] Fallback mekanizması
- [ ] Cache layer (Redis)

### 3. 🤖 AI Model Eğitimi (Sprint 3)
**Neden:** Şu an mock data, gerçek tahmin için model lazım.

**Yapılacaklar:**
- [ ] LightGBM ile sinyal tahmin
- [ ] Walk-forward validation
- [ ] SHAP explanations
- [ ] Model versioning

### 4. 🔐 Authentication (Sprint 4)
**Neden:** Kullanıcı bazlı portföy takibi için.

**Yapılacaklar:**
- [ ] Firebase Auth
- [ ] JWT tokens
- [ ] User sessions
- [ ] Role-based access

### 5. 📱 Mobile App (Sprint 5)
**Neden:** Flutter app mevcut, entegre et.

**Yapılacaklar:**
- [ ] Backend API entegrasyonu
- [ ] Push notifications
- [ ] Portfolio tracking
- [ ] Offline mode

---

## 🚀 Hızlı Başlangıç

### Backend'i Başlat:
```bash
cd backend
uvicorn api.main:app --reload
```

### Frontend'i Başlat:
```bash
cd web-app
npm run dev
```

### Test:
```bash
curl http://localhost:8000/api/signals
curl http://localhost:3000
```

---

## 📋 Öncelik Sırası

1. **BACKEND ENTEGRASYONU** ← En acil!
2. Real data akışı
3. Authentication
4. Mobile app
5. Advanced AI

---

**Not:** Şu anki frontend production-ready. Tek eksik backend entegrasyonu!
