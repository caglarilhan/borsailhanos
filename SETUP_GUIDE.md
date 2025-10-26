# 🚀 BIST AI Smart Trader - Crash-Free Setup Guide

## ✅ Adım 1: Backend Paketleri Yükle

```bash
cd /Users/caglarilhan/borsailhanos
source .venv/bin/activate

pip install websockets uvicorn[standard] fastapi
pip list | grep -E "websockets|uvicorn|fastapi"
```

**Beklenen:**
```
websockets     xxx.x
uvicorn        x.x.x
fastapi        x.x.x
```

---

## ✅ Adım 2: WebSocket Server Başlat

**Terminal 1:**
```bash
cd /Users/caglarilhan/borsailhanos/backend/api
python3 -m uvicorn websocket_server:app --host 0.0.0.0 --port 8081 --reload
```

**Beklenen log:**
```
INFO:     Uvicorn running on http://0.0.0.0:8081
INFO:     Application startup complete.
```

---

## ✅ Adım 3: Frontend Başlat

**Terminal 2:**
```bash
cd /Users/caglarilhan/borsailhanos/web-app
npm run dev
```

**Beklenen:**
```
▲ Next.js 16.0.0 (Turbopack)
- Local: http://localhost:3000
```

---

## ✅ Adım 4: Tarayıcıda Test

```
http://localhost:3000
```

**Beklenen:**
- ✅ Header'da "Canlı" (yeşil nokta)
- ✅ Charts render ediliyor
- ✅ Butonlar çalışıyor
- ✅ Console'da hata yok

---

## 🔧 Sorun Giderme

### ❌ "Application error: client-side exception"

**Sebep:** Backend kapalı veya paket eksik

**Çözüm:**
```bash
# 1. Paket kontrolü
pip list | grep uvicorn

# 2. Backend başlat
cd backend/api && python3 -m uvicorn websocket_server:app --port 8081

# 3. Frontend yeniden başlat
cd web-app && npm run dev
```

### ❌ "WebSocket connection failed"

**Sebep:** Backend kapalı veya URL yanlış

**Çözüm:**
```bash
# Terminal 1'de backend çalışıyor mu kontrol et
curl http://localhost:8081/ws/stats

# Beklenen:
{"active_connections": 0, "status": "operational"}
```

### ❌ "Module not found: useWebSocket"

**Sebep:** Hook import edilmemiş

**Çözüm:**
```bash
# Dosya var mı kontrol et
ls web-app/src/hooks/useWebSocket.ts

# Varsa:
cd web-app && npm run dev
```

### ❌ Chart render olmuyor

**Sebep:** Data boş

**Çözüm:**
- Chart'lar mount sonrası yüklenir (normal)
- Console'da "📊 Grafik yükleniyor..." yazması normal
- 1-2 saniye sonra grafikler görünür

---

## ✅ Final Kontrol

**1. Console kontrolü (F12 → Console):**
```
✅ 🔗 WebSocket connected
✅ 📊 Realtime data received
✅ ❌ Yoksa → hatayı bana gönder
```

**2. Network kontrolü (F12 → Network):**
```
✅ WS request: ws://localhost:8081/ws
✅ Status: 101 Switching Protocols
```

**3. Backend log kontrolü:**
```
✅ 🔗 New WebSocket connection (1 active)
✅ Market data sent
```

---

## 🎯 Başarı Durumu

```
✅ WebSocket: Connected (yeşil nokta)
✅ Charts: Render ediliyor
✅ Butonlar: Çalışıyor
✅ Alerts: Geliyor
✅ Console: Hata yok
```

Bu 5 madde ✅ ise sistem **CRASH-FREE** çalışıyor!

---

## 📊 Sonraki Adım

Eğer hala "Application error" alıyorsan:
1. Terminal 1: Backend log'larını kontrol et
2. Terminal 2: Frontend log'larını kontrol et  
3. Browser Console: İlk 2 kırmızı hatayı bana gönder

Senin için **tam teşhis** yapabilirim.

