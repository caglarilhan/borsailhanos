#!/bin/bash
# BIST Piyasa Açılış Takip Sistemi
# Piyasa açılışında (09:30) otomatik başlatma

echo "🚀 BIST Canlı Takip Sistemi Hazır!"
echo "📊 Takip edilecek hisseler:"
echo "   • ASELS.IS - Giriş: 214.00₺, TP: 227.03₺, SL: 205.31₺"
echo "   • YKBNK.IS - Giriş: 35.60₺, TP: 36.94₺, SL: 34.71₺"
echo ""
echo "⏰ Piyasa açılışı: 09:30"
echo "🏁 Piyasa kapanışı: 17:00"
echo ""
echo "📱 Piyasa açılışında otomatik başlayacak..."
echo "💾 Sonuçlar: data/live_tracking_results.json"
echo ""

# Piyasa açılış kontrolü
while true; do
    current_hour=$(date +%H)
    current_min=$(date +%M)
    
    # 09:30'da başlat
    if [ "$current_hour" = "09" ] && [ "$current_min" = "30" ]; then
        echo "🎯 Piyasa açıldı! Takip başlatılıyor..."
        cd /Users/caglarilhan/borsailhanos
        source venv/bin/activate
        python backend/live_tracker.py
        break
    fi
    
    # Her dakika kontrol et
    sleep 60
done
