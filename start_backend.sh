#!/bin/bash

echo "🔧 BIST AI Smart Trader - Comprehensive Backend"
echo "================================================"
echo ""

# Port 8080'i temizle
echo "📌 Port 8080 kontrol ediliyor..."
lsof -ti:8080 | xargs kill -9 2>/dev/null
sleep 1
echo "✅ Port temizlendi"
echo ""

# Backend'i başlat
echo "🚀 Comprehensive Backend başlatılıyor (60+ endpoint)..."
cd backend
python3 comprehensive_backend.py
