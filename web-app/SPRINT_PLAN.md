# BIST AI Smart Trader - Sprint Planı (v4.6 → v5.0)

## 📋 Sprint Özeti

### ✅ Sprint 1: P0 Kritik Hatalar (TAMAMLANDI)
- ✅ FinBERT duygu normalize (168%→100%)
- ✅ Consensus badge eklendi
- ✅ Risk Dağılımı çift etiket düzeltildi
- ✅ Admin RBAC koruması

### 🚧 Sprint 2: UI/UX İyileştirmeleri (DEVAM EDİYOR)
- [ ] Header overflow düzeltmesi (buton gruplama)
- [ ] Tooltip'ler (RSI/MACD bilgi balonları)
- [ ] Dark mode toggle foundation
- [ ] Responsive mobile UX iyileştirme
- [ ] WCAG AA kontrast düzeltmeleri

### ⏳ Sprint 3: AI Modülleri Aktif Hale Getirme
- [ ] TraderGPT chat paneli (doğal dil girişi)
- [ ] Cognitive AI yorumlar dinamik
- [ ] Meta-Model gerçek zamanlı veri
- [ ] Model drift grafiği
- [ ] Ensemble güven aralığı (±σ)

### ⏳ Sprint 4: Risk Model & Backtest Dinamik
- [ ] Risk dinamikleri (VaR, Beta, Sharpe)
- [ ] Stress test özelliği
- [ ] Gerçek rebalance hesaplama
- [ ] Backtest gerçek hesaplama (statik → dinamik)
- [ ] Portföy performans raporu (CAGR, Sharpe, Max DD)

### ⏳ Sprint 5: Viz Hub İnteraktif
- [ ] Multi-timeframe overlay (1h/4h/1d)
- [ ] Duygu akışı grafiği (FinBERT trend)
- [ ] Residual chart (gerçek fiyat - AI tahmin)
- [ ] Time zoom/pan fonksiyonu
- [ ] Hover tooltip interaktif

### ⏳ Sprint 6: Performance & Accessibility
- [ ] Dark mode toggle tam implementasyon
- [ ] Lazy loading (react-window)
- [ ] WCAG AA kontrast iyileştirmeleri
- [ ] ARIA labels & keyboard navigation
- [ ] Mobile UX optimizasyonu

### ⏳ Sprint 7: Yeni Modüller
- [ ] Watchlist gerçek implementasyon
- [ ] Admin RBAC tam kontrolü
- [ ] Planlar sistemi (Free/Pro/Enterprise)
- [ ] Strateji Builder (kullanıcı kuralları)
- [ ] User Analytics Dashboard

## 🎯 Sprint 2 Detayları

### 1. Header Overflow Düzeltmesi
**Sorun:** Çok fazla buton → overflow ve kullanıcı yorgunluğu
**Çözüm:**
- Butonları gruplara ayır (Filtreler / Stratejiler / AI Araçları)
- Dropdown menüler ekle
- "Daha Fazla" butonu ile gizlenebilir butonlar

### 2. Tooltip'ler
**Eklenecek:**
- RSI üzerine: "RSI>70 → aşırı alım; RSI<30 → aşırı satım"
- MACD üzerine: "MACD sinyali trend yönünü teyit eder"
- Sharpe üzerine: "Sharpe oranı risk-ayarlı getiriyi gösterir"
- VaR üzerine: "Value at Risk: %95 güvenle max kayıp"

### 3. Dark Mode Foundation
**Adımlar:**
- next-themes entegrasyonu
- Tema toggle butonu
- CSS değişkenleri (dark mode renkleri)

### 4. Responsive Mobile
**İyileştirmeler:**
- Flex-wrap iyileştirmeleri
- Modül çökme kontrolü
- Touch-friendly buton boyutları

## 📊 İlerleme Takibi

| Sprint | Durum | Tamamlanma |
|--------|-------|------------|
| Sprint 1 | ✅ Tamamlandı | 100% |
| Sprint 2 | 🚧 Devam Ediyor | 20% |
| Sprint 3 | ⏳ Bekliyor | 0% |
| Sprint 4 | ⏳ Bekliyor | 0% |
| Sprint 5 | ⏳ Bekliyor | 0% |
| Sprint 6 | ⏳ Bekliyor | 0% |
| Sprint 7 | ⏳ Bekliyor | 0% |

