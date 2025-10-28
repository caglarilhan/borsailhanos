# 🎯 **Sprint Planı - Veri Hijyeni Düzeltmeleri**

**Toplam Sprint:** 6  
**Toplam Sorun:** 23  
**Tahmini Süre:** 2-3 saat

---

## 📊 **Sprint Özeti**

| Sprint | Odak Alanı | Sorun Sayısı | Süre | Durum |
|--------|------------|--------------|------|-------|
| 1 | Sentiment + AI Tutarlılık | 2 | 25dk | ✅ Tamamlandı |
| 2 | Filter + API Params | 3 | 30dk | ⏸️ Beklemede |
| 3 | Backtest + Meta | 3 | 25dk | ⏸️ Beklemede |
| 4 | UI/UX Düzeltmeleri | 8 | 40dk | ⏸️ Beklemede |
| 5 | Feature Flags + Security | 4 | 30dk | ⏸️ Beklemede |
| 6 | Optimizasyon + Test | 3 | 20dk | ⏸️ Beklemede |

---

## ✅ **SPRINT 1: Sentiment + AI Confidence**

**Hedef:** Sentiment normalization tamamlandı ✅  
**Şimdi:** AI confidence ile signal tutarlılığı

### Yapılacaklar:
1. ✅ Sentiment normalize edildi (satır 310-319)
2. ⏳ State management kurulumu (tek otorite için)
3. ⏳ Signal aggregation kuralları dokümantasyonu

---

## ⏸️ **SPRINT 2: Filter + API Params**

**Hedef:** %80+ accuracy filtre backend'de çalışsın

### Yapılacaklar:
1. Backend'e query param: `?minAccuracy=0.8&market=BIST`
2. Frontend'de filter state senkronizasyonu
3. Test: Filter on → TUPRS %76.5 görünmemeli

---

## ⏸️ **SPRINT 3: Backtest + Meta**

**Hedef:** Backtest metodoloji netleştir, korelasyon meta ekle

### Yapılacaklar:
1. Backtest varsayımları modalı
2. Korelasyon metod/tarih tooltip
3. Risk skoru ölçeği ekle

---

## ⏸️ **SPRINT 4: UI/UX**

**Hedef:** i18n, legend, stray text temizliği

### Yapılacaklar:
1. i18n integration (react-i18next)
2. Chart legend ekle
3. Stray "99000" text'i kaldır
4. AI açıklama butonu her satırda
5. Typography spacing düzelt

---

## ⏸️ **SPRINT 5: Flags + Security**

**Hedef:** God Mode/Admin prod'da gizle, RBAC ekle

### Yapılacaklar:
1. God Mode → sadece dev'de
2. Admin butonu → sadece admin rolü
3. Feature flag infrastructure
4. RBAC guard

---

## ⏸️ **SPRINT 6: Optimize + Test**

**Hedef:** Render optimization, final test

### Yapılacaklar:
1. WebSocket throttle/debounce
2. Memo + requestAnimationFrame
3. Final integration test
4. Lint kontrolü

---

**İlerleme Takibi:** Bu dosya gerçek zamanlı güncellenir.

