# 🚀 BIST AI Smart Trader - Quick Start

## 1. WebSocket Backend Başlat (Terminal 1)

```bash
cd backend/api
python -m uvicorn websocket_server:app --host 0.0.0.0 --port 8081 --reload
```

✅ Başarıyla başlarsa:
```
INFO:     Uvicorn running on http://0.0.0.0:8081
🔗 WebSocket endpoint: ws://localhost:8081/ws
```

## 2. Frontend Başlat (Terminal 2)

```bash
cd web-app
npm run dev
```

✅ Başarıyla başlarsa:
```
▲ Next.js 16.0.0 (Turbopack)
- Local: http://localhost:3000
```

## 3. Tarayıcıda Aç

```
http://localhost:3000
```

---

## 🔧 Sorun Giderme

### "No module named 'backend'"
```bash
# WebSocket paketini yükle
pip install websockets uvicorn[standard]
```

### WebSocket 404 hatası
Backend loglarda şunu kontrol et:
```
INFO: Application startup complete.
INFO: Uvicorn running on http://0.0.0.0:8081
```

### Frontend "Application error"
Tarayıcı console'da hatayı kontrol et (`F12 → Console`)

---

## ✅ Test

WebSocket çalışıyor mu test et:
```bash
curl http://localhost:8081/ws/stats
```

Response:
```json
{"active_connections": 0, "status": "operational"}
```

---

## 🎯 Başarılı Olursa

Header'da **"Canlı"** yazması gerekiyor (yeşil nokta)
- ❌ **"Offline"** = WebSocket bağlanamadı
- ✅ **"Canlı"** = Bağlantı kuruldu

