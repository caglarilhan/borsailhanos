#!/bin/bash

# BIST AI Smart Trader - Production Deployment Script
echo "🚀 BIST AI Smart Trader Production Deployment Başlıyor..."

# Environment check
if [ ! -f .env ]; then
    echo "❌ .env dosyası bulunamadı!"
    echo "📝 .env.example dosyasını .env olarak kopyalayın ve gerekli değerleri doldurun"
    exit 1
fi

# Load environment variables
source .env

# Check required environment variables
required_vars=("TIMEGPT_API_KEY" "FINNHUB_API_KEY" "FMP_API_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Gerekli environment variable eksik: $var"
        exit 1
    fi
done

echo "✅ Environment variables kontrol edildi"

# Stop existing containers
echo "🛑 Mevcut container'lar durduruluyor..."
docker-compose down

# Build and start services
echo "🔨 Container'lar build ediliyor..."
docker-compose build --no-cache

echo "🚀 Servisler başlatılıyor..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Servislerin hazır olması bekleniyor..."
sleep 30

# Health check
echo "🏥 Health check yapılıyor..."
if curl -f http://localhost:8001/health > /dev/null 2>&1; then
    echo "✅ API sağlıklı!"
else
    echo "❌ API health check başarısız!"
    docker-compose logs bist-ai-trader
    exit 1
fi

# Check all services
echo "🔍 Tüm servisler kontrol ediliyor..."
docker-compose ps

echo "🎉 Deployment tamamlandı!"
echo ""
echo "📊 Servisler:"
echo "   - BIST AI Trader API: http://localhost:8001"
echo "   - Dashboard: http://localhost:8001/dashboard"
echo "   - Prometheus: http://localhost:9090"
echo "   - Grafana: http://localhost:3000 (admin/admin)"
echo ""
echo "📝 Logları görüntülemek için:"
echo "   docker-compose logs -f bist-ai-trader"
echo ""
echo "🛑 Servisleri durdurmak için:"
echo "   docker-compose down"
