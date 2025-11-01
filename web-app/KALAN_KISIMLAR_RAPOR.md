# Kalan Kısımlar Raporu - v5.0 Pro Decision Flow

## 📊 Özet

**Genel Tamamlanma**: %75  
**Kalan İşler**: %25  
**Öncelikli Kalan İşler**: 8 ana başlık

---

## 🔴 Kritik (P0) - Yüksek Öncelik

### 1. Sprint 2: Realtime Data Feed (Gerçek API) ⏸️ %20

**Durum**: Mock veri kullanılıyor, gerçek API entegrasyonu yok

**Eksikler**:
- ⏸️ **Finnet / BIST API entegrasyonu**: Foundation mevcut ama gerçek API bağlantısı yok
- ⏸️ **Gerçek zamanlı fiyat akışı**: WebSocket hook var ama gerçek BIST fiyatları yok
- ⏸️ **Cron job yerine live stream**: WebSocket mevcut ama gerçek veri kaynağı yok

**Öneriler**:
- Finnet API token'ı ile gerçek fiyat çekme
- yfinance veya alternatif ücretsiz API entegrasyonu
- WebSocket üzerinden canlı fiyat akışı

**Etki**: 🔴 Yüksek - Veri güvenilirliği kritik

---

## 🟠 Yüksek Öncelik (P1)

### 2. Sprint 3: TraderGPT - AI Explanation ⏸️ %90

**Durum**: TraderGPT mevcut ama detaylı açıklama eksik

**Eksikler**:
- ⏸️ **"AI Explanation" detaylı açıklama**: Kısa açıklama var ama "neden-sonuç" detayı yok
- Örnek: "RSI ağırlığı %31 → teknik momentum yüksek" gibi faktör bazlı açıklama

**Öneriler**:
- SHAP değerlerini kullanarak faktör katkısı gösterimi
- "Bu sinyalin %30'u kâr marjından, %25'i RSI'dan geliyor" formatı

**Etki**: 🟠 Orta - Kullanıcı anlayışı için önemli

### 3. Sprint 4: Portföy Rebalancer - Gerçek Hesaplama ⏸️ %80

**Durum**: UI butonları var ama gerçek hesaplama eksik

**Eksikler**:
- ⏸️ **Gerçek formül**: AI sinyaller + risk katsayısı (hook hazır ama gerçek hesaplama yok)
- ⏸️ **Realtime simülasyon grafiği**: Grafik var ama canlı veri ile güncellenmiyor
- ⏸️ **Portföy optimizasyonu**: Rebalance butonu mock, gerçek optimizasyon yapılmıyor

**Öneriler**:
- Portföy optimizasyon algoritması (Markowitz, risk parity)
- Gerçek zamanlı portföy değeri hesaplama
- Sharpe/Sortino/VaR gerçek zamanlı hesaplama

**Etki**: 🟠 Yüksek - Kullanıcı için kritik özellik

---

## 🟡 Orta Öncelik (P2)

### 4. Sprint 6: Meta-Model - AI Explanation ⏸️ %75

**Durum**: Radar chart var ama detaylı açıklama eksik

**Eksikler**:
- ⏸️ **"AI Explanation" detaylı açıklama**: Radar chart var ama faktör bazlı açıklama yok
- Örnek: "RSI ağırlığı %31 → teknik momentum yüksek, Sentiment ağırlığı %28 → haberler pozitif"

**Öneriler**:
- Faktör katkı açıklaması tooltip'leri
- Meta-model karar ağacı görselleştirmesi

**Etki**: 🟡 Orta - İyi olurdu ama kritik değil

### 5. Sprint 9: Confidence Dashboard - Geliştirmeler ⏸️ %85

**Durum**: Gauge ve trend var ama ek grafikler eksik

**Eksikler**:
- ⏸️ **"24s değişim" etiketi**: Son 24 saatteki güven değişimi gösterimi
- ⏸️ **"AI Alpha vs Benchmark" grafiği**: AI performansı vs BIST30 karşılaştırma grafiği

**Öneriler**:
- Mini sparkline ile 24s değişim
- Line chart ile AI vs Benchmark karşılaştırması

**Etki**: 🟡 Düşük - İyi olurdu

---

## 🟢 Düşük Öncelik (P3) - İyileştirmeler

### 6. Sprint 10: Performance Tab - Backtest Alt Sekmeye ⏸️ %50

**Durum**: Backtest üstte, alt sekmeye taşınması gerekiyor

**Eksikler**:
- ⏸️ **Backtest alt sekmeye taşıma**: Şu anda üstte, tab/section içine taşınmalı
- ⏸️ **P&L eğrisi**: Günlük P&L grafiği eksik
- ⏸️ **Alpha katkısı grafiği**: AI'nın benchmark'a göre katkısı gösterimi
- ⏸️ **Eğitsel içerik**: Tooltip'ler var ama daha fazla açıklama eklenebilir

**Öneriler**:
- Tab component oluştur (Performance sekmesi)
- Recharts ile P&L line chart
- Alpha contribution bar chart

**Etki**: 🟢 Düşük - UX iyileştirmesi

### 7. Sprint 11: Header Tooltip - Custom Hover Card ⏸️ %70

**Durum**: RBAC ve watchlist var ama custom tooltip eksik

**Eksikler**:
- ⏸️ **Custom hover card**: title attribute var ama custom styled tooltip yok
- ⏸️ **"AI Auto Mode" toggle görseli**: Strateji modu state var ama görsel toggle butonu yok
- ⏸️ **"Canlı" metni dinamik**: lastUpdated state var ama gerçek zamanlı güncelleme yok

**Öneriler**:
- Radix UI Tooltip veya custom tooltip component
- Toggle switch component (on/off görsel)
- setInterval ile canlı zaman güncelleme

**Etki**: 🟢 Düşük - UX iyileştirmesi

### 8. Sprint 12: AI Learning Mode - Feedback Aktif ⏸️ %40

**Durum**: Feedback hooks var ama aktif sistem yok

**Eksikler**:
- ⏸️ **Feedback sistemi → reinforcement feedback queue**: Hook var ama aktif değil
- ⏸️ **"AI hata yaptı mı?" prompt**: Kullanıcı feedback butonu yok
- ⏸️ **"Model drift index" grafiği**: DriftTracker var ama drift index grafiği eksik
- ⏸️ **Versiyonlama**: FinBERT-TR v3.2, MetaModel v2.1 gösterimi eksik

**Öneriler**:
- Feedback modal/popup component
- Kullanıcı feedback formu (doğru/yanlış işaretleme)
- Model versiyonu badge'leri
- Drift index line chart

**Etki**: 🟢 Düşük - Gelecek için önemli

---

## 📋 Öncelik Sırasına Göre Kalan İşler

### 🔴 Kritik (Hemen Yapılmalı)

1. **Sprint 2: Gerçek API Entegrasyonu** - Veri güvenilirliği için kritik
   - Finnet/yfinance API entegrasyonu
   - Gerçek zamanlı fiyat akışı

### 🟠 Yüksek (Yakın Zamanda Yapılmalı)

2. **Sprint 4: Portföy Gerçek Hesaplama** - Kullanıcı için önemli
   - Gerçek formül implementasyonu
   - Realtime simülasyon

3. **Sprint 3: AI Explanation Detaylı** - Anlayış için önemli
   - SHAP değerleri gösterimi
   - Faktör katkı açıklaması

### 🟡 Orta (İyileştirme)

4. **Sprint 6: Meta-Model Explanation** - İyi olurdu
5. **Sprint 9: Confidence Dashboard Grafikler** - İyi olurdu

### 🟢 Düşük (Gelecekte)

6. **Sprint 10: Backtest Tab** - UX iyileştirmesi
7. **Sprint 11: Header Tooltips** - UX iyileştirmesi
8. **Sprint 12: Learning Mode** - Gelecek için

---

## 💡 Hızlı Kazanımlar (Quick Wins)

### 1 Saat İçinde Yapılabilecekler

1. ✅ **24s değişim etiketi** (Sprint 9) - Basit hesaplama
2. ✅ **Custom tooltip component** (Sprint 11) - Radix UI ile
3. ✅ **Model versiyonu badge'leri** (Sprint 12) - Static text ekleme
4. ✅ **AI Auto Mode toggle görseli** (Sprint 11) - Toggle switch component

### 2-4 Saat İçinde Yapılabilecekler

1. ✅ **P&L eğrisi** (Sprint 10) - Recharts line chart
2. ✅ **Alpha vs Benchmark grafiği** (Sprint 9) - Recharts comparison
3. ✅ **Drift index grafiği** (Sprint 12) - Line chart

### 1 Gün İçinde Yapılabilecekler

1. ✅ **Gerçek API entegrasyonu** (Sprint 2) - yfinance/Finnet
2. ✅ **Portföy gerçek hesaplama** (Sprint 4) - Optimizasyon algoritması
3. ✅ **Backtest tab** (Sprint 10) - Tab component + taşıma

---

## 🎯 Önerilen Yol Haritası

### Faz 1: Kritik Düzeltmeler (1 hafta)
- Sprint 2: Gerçek API entegrasyonu
- Sprint 4: Portföy gerçek hesaplama

### Faz 2: Önemli Özellikler (1 hafta)
- Sprint 3: AI Explanation detaylı
- Sprint 6: Meta-Model Explanation

### Faz 3: İyileştirmeler (1 hafta)
- Sprint 9: Dashboard grafikler
- Sprint 10: Backtest tab
- Sprint 11: Header tooltips

### Faz 4: Gelecek Özellikler (İsteğe bağlı)
- Sprint 12: Learning Mode aktif

---

## 📊 Sonuç

**Toplam Kalan İş**: ~25%  
**Kritik Kalan İş**: ~5% (Gerçek API)  
**Önemli Kalan İş**: ~10% (Portföy + Explanation)  
**İyileştirme Kalan İş**: ~10% (UX iyileştirmeleri)

**Mevcut Durum**: %75 Production Ready ✅  
**Hedef**: %100 Production Ready 🎯

**Öneri**: Önce kritik ve yüksek öncelikli işler (Sprint 2, 4, 3) tamamlanmalı, sonra iyileştirmeler yapılabilir.

