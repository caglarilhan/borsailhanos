#!/bin/bash

echo "🚀 BIST AI Smart Trader - Full Stack Başlatma"
echo "=============================================="
echo ""

# Port temizliği
echo "📌 Port temizliği yapılıyor..."
lsof -ti:8080 | xargs kill -9 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null
sleep 2
echo "✅ Portlar temizlendi"
echo ""

# Backend API başlat (Port 8080)
echo "🔥 Backend API başlatılıyor (Port 8080)..."
cd backend
python3 comprehensive_backend.py > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "  ✅ Backend PID: $BACKEND_PID"
cd ..
sleep 3

# Realtime Server başlat (Port 8081)
echo "🔌 Realtime Server başlatılıyor (Port 8081)..."
cd backend
python3 realtime_server.py > /tmp/realtime.log 2>&1 &
REALTIME_PID=$!
echo "  ✅ Realtime PID: $REALTIME_PID"
cd ..
sleep 2

# Frontend başlat (Port 3001)
echo "💻 Frontend başlatılıyor (Port 3001)..."
cd web-app
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "  ✅ Frontend PID: $FRONTEND_PID"
cd ..
sleep 5

echo ""
echo "✅✅✅ TÜM SERVİSLER BAŞLATILDI! ✅✅✅"
echo ""
echo "🌐 AÇILACAK URL'LER:"
echo "  • Frontend:        http://localhost:3001"
echo "  • Backend API:     http://localhost:8080"
echo "  • Realtime Stream: http://localhost:8081"
echo ""
echo "📊 SERVİS PID'LERİ:"
echo "  • Backend:  $BACKEND_PID"
echo "  • Realtime: $REALTIME_PID"
echo "  • Frontend: $FRONTEND_PID"
echo ""
echo "📝 LOG DOSYALARI:"
echo "  • Backend:  /tmp/backend.log"
echo "  • Realtime: /tmp/realtime.log"
echo "  • Frontend: /tmp/frontend.log"
echo ""
echo "🔥 Logları görmek için:"
echo "  tail -f /tmp/backend.log"
echo ""
echo "⏹️  Durdurmak için:"
echo "  kill $BACKEND_PID $REALTIME_PID $FRONTEND_PID"
echo ""
echo "🎉 Sistem hazır! Tarayıcıda http://localhost:3001 adresini aç!"
