#!/bin/bash

echo "⏹️  BIST AI Smart Trader - Tüm Servisleri Durdur"
echo "================================================"
echo ""

echo "🔴 Servisleri durduruluyor..."
echo ""

# Kill all processes
pkill -f "comprehensive_backend.py" && echo "  ✅ Backend durduruldu"
pkill -f "realtime_server.py" && echo "  ✅ Realtime server durduruldu"
pkill -f "next dev" && echo "  ✅ Frontend durduruldu"

# Port temizliği
lsof -ti:8080 | xargs kill -9 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

sleep 2

echo ""
echo "✅ Tüm servisler durduruldu!"
echo ""
echo "📋 Log dosyalarını temizlemek için:"
echo "  rm /tmp/backend.log /tmp/realtime.log /tmp/frontend.log"
