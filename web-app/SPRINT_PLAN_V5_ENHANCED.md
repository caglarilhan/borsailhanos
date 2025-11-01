# 🚀 Sprint Plan - v5.0 Enhanced Özellikler

## 📋 Genel Bakış

16 farklı modül iyileştirmesi sprintlere bölündü. Her sprint kod gösterimi ile tamamlanacak.

---

## 🎯 Sprint 1: ÜST NAVBAR Restructure

### Sorunlar
- Buton fazlalığı (11 farklı ikon), hiyerarşi yok
- "AI", "Meta-Model" ve "AI Yorum" fonksiyonları karışık
- Tooltips yok → neyin ne işe yaradığını anlamak zor
- "Canlı • 09:43" statik, gerçek zamanlı veri feed'i yok

### Çözümler
1. **Menü grupları**:
   - **AI Merkezi**: 🧠 AI, 💬 Yorum, 📈 Risk Model, 🧮 Meta-Model
   - **Strateji Merkezi**: 🎯 Strateji, 💎 Planlar, ⚡ Gelişmiş
   - **Kullanıcı Merkezi**: 📋 Watchlist, ⚙️ Admin, 🚪 Çıkış

2. **HoverCard tooltip kartları**
3. **WebSocket bağlantı göstergesi** → "Veri akışı: 38ms" dinamik

### Dosyalar
- `web-app/src/components/BistSignals.tsx` - Navbar restructure
- `web-app/src/components/UI/HoverCard.tsx` - Yeni component (Radix UI veya custom)

---

## 🎯 Sprint 2: ÜST ÖZET PANELİ Realtime

### Sorunlar
- "Toplam Kâr ₺125.000 %12.5" mock sabit
- Yüzde artış okları statik
- Risk "3.2 ▼ Düşük" ama 3.2 = 64/100, aslında orta risk
- "+3 yeni sinyal" → ne zaman geldiği belirsiz

### Çözümler
1. **Gerçek zamanlı veri feed** (WebSocket veya cron job)
2. **Risk normalizasyonu**: 0-5 → 1-10 ölçeği
   - 0-2 = düşük, 3-6 = orta, 7+ = yüksek
3. **24s değişim etiketleri**:
   - "Son 24s kâr değişimi: +0.8%"
   - "Model drift: +0.6pp"
   - "Yeni sinyal: +3 (son 1 saat)"

### Dosyalar
- `web-app/src/components/BistSignals.tsx` - Top panel güncelleme
- `web-app/src/hooks/useRealtimeMetrics.ts` - Yeni hook

---

## 🎯 Sprint 3: AI GÜNLÜK ÖZETİ+ Enhanced

### Sorunlar
- Tek cümlelik, yüzeysel özet
- Neden pozitif, hangi veriyle açıklanmıyor
- Saat güncelleniyor ama içeriği sabit

### Çözümler
1. **Çok katmanlı özet**:
   - 📈 Piyasa Rejimi: Risk-on (Volatilite düşüyor, CDS -2%)
   - 💡 Sektör Liderleri: Teknoloji +3.8%, Sanayi +2.1%
   - 🔍 AI Snapshot: 15 aktif sinyal, ortalama güven %84
   - ⚠️ Uyarı: Bankacılık RSI 69 (aşırı alım riski)
   - 🧠 Model Drift: +0.6pp (stabil)

2. **Mini sentiment trend grafiği** (24 saat)

### Dosyalar
- `web-app/src/components/AI/AIDailySummaryPlus.tsx` - Enhanced version
- `web-app/src/components/AI/SentimentTrendMini.tsx` - Yeni component

---

## 🎯 Sprint 4: SEKTÖR ISI HARİTASI

### Sorunlar
- Statik liste, renklendirme sadece emoji
- "Yeşil/Kırmızı" yazıyor ama gerçek renk yok
- Sektör tıklanınca filtre çalışmıyor

### Çözümler
1. **Recharts Heatmap** (CellHeatmap veya custom)
2. **Dinamik filtreleme** → Sinyal tablosunu süz
3. **Gerçek renklendirme**: Hücre büyüklüğü = sektör ağırlığı, Renk = momentum/performans

### Dosyalar
- `web-app/src/components/AI/SectorHeatmap.tsx` - Yeni component
- `web-app/src/components/BistSignals.tsx` - Sector filter integration

---

## 🎯 Sprint 5: KORELASYON HEATMAP Enhanced

### Sorunlar
- Gösterim yanlış: "ISCTR – ISCTR —" yazıyor
- Negatif-pozitif karışık (% vs ρ)
- Korelasyon eşiği yok

### Çözümler
1. **Normalize gösterim**: ρ ∈ [-1,+1] → -1.00 ile +1.00 arası
2. **Hover tooltip**: Detaylı açıklama
3. **Pair Trade Finder**: |ρ| > 0.8 için otomatik öneri

### Dosyalar
- `web-app/src/components/AI/CorrelationHeatmap.tsx` - Enhanced (zaten var, güncelle)
- `web-app/src/components/AI/PairTradeFinder.tsx` - Yeni component

---

## 🎯 Sprint 6: SINYALLER PANELİ Enhanced

### Sorunlar
- Tek tablo, scrollbar yok
- "Volatilite stable" jargon
- FinBERT skoru %83 pozitif ama toplam %100 değil
- Tek satırda RSI, volatilite, korelasyon, sentiment karışık

### Çözümler
1. **Tablo sütunları**:
   | Sembol | Trend | RSI | Momentum | Sentiment | Confidence | Tahmin |
2. **Hover detay kartı**: Detaylı açıklama
3. **Normalize sentiment**: poz+neg+nötr=100 (zaten yapıldı)
4. **"%80+ doğruluk" rozeti**: Yüksek Güven rozeti

### Dosyalar
- `web-app/src/components/BistSignals.tsx` - Table enhancement
- `web-app/src/components/UI/SignalDetailCard.tsx` - Yeni component

---

## 🎯 Sprint 7: AI GÜVEN GÖSTERGESİ Gauge

### Sorunlar
- "THYAO BUY %89" vs "TUPRS SELL %72" karışık, renk kod yok
- Trend değişimi bilgisi eksik

### Çözümler
1. **Recharts Gauge Chart** (Pie + progress)
2. **24s drift etiketi**: "+2.1pp" / "-0.8pp"
3. **Model versiyon tooltip**: "Model: Meta-LSTM v4.6, drift stable"

### Dosyalar
- `web-app/src/components/AI/AIConfidenceGauge.tsx` - Enhanced (zaten var, güncelle)
- `web-app/src/components/AI/ConfidenceDriftBadge.tsx` - Yeni component

---

## 🎯 Sprint 8: GERÇEK ZAMANLI UYARILAR WebSocket

### Sorunlar
- Güzel yapı ama statik text
- Zaman damgası doğru ama kaynaksız

### Çözümler
1. **WebSocket event handler**:
   ```json
   { "type":"signal_update", "symbol":"TUPRS", "confidence":0.68, "time":"09:43" }
   ```
2. **Kullanıcı ayarları**: "Yalnızca güven <70% olanları göster"

### Dosyalar
- `web-app/src/hooks/useWebSocket.ts` - Enhanced
- `web-app/src/components/RealtimeAlerts.tsx` - WebSocket integration

---

## 🎯 Sprint 9: PORTFÖY SİMÜLATÖRÜ Real Optimizer

### Sorunlar
- Mock çizgi (100K → 110.5K)
- "Rebalance (5 gün)" butonu işlevsiz
- Seçilen risk profili hesaplamaya etki etmiyor

### Çözümler
1. **Gerçek optimizasyon** (Markowitz veya Black–Litterman)
2. **Rebalance animasyonu**: "%5 THYAO sat, %5 AKBNK al"
3. **Risk profili entegrasyonu**: risk_level → volatilite hedefi

### Dosyalar
- `web-app/src/components/V50/PortfolioOptimizer.tsx` - Enhanced
- `web-app/src/lib/portfolio-optimizer.ts` - Markowitz algoritması

---

## 🎯 Sprint 10: AI LEARNING MODE

### Sorunlar
- "Feedback" butonu işlevsiz
- Seviye sistemi ("Seviye 5") sadece görsel
- "Son 7 gün +12.5% kâr" sabit

### Çözümler
1. **Feedback gönderimi**: Firestore veya log file
   ```json
   feedback: {symbol:"THYAO", action:"good_signal", time:now()}
   ```
2. **Seviye ilerlemesi**: AI doğru tahmin oranı % artırdıkça level yükselsin
3. **Model Drift Trend grafiği**: 30 gün drift trendi

### Dosyalar
- `web-app/src/components/V60/FeedbackLoop.tsx` - Enhanced
- `web-app/src/components/AI/ModelDriftChart.tsx` - Yeni component

---

## 🎯 Sprint 11: MULTI-TIMEFRAME Consistency Enhanced

### Sorunlar
- Her zaman dilimi "Yükseliş" → gerçekçi değil
- Tutarlılık metriği yok

### Çözümler
1. **Consistency skoru**: 1H ↑ | 4H ↓ | 1D ↑ → Karışık (Tutarlılık %66)
2. **Renk çubuğu**: Yeşil/sarı/kırmızı
3. **Karışık sinyal uyarısı**: "Karma (HOLD)" rozeti

### Dosyalar
- `web-app/src/components/AI/MTFHeatmap.tsx` - Enhanced (zaten var, güncelle)
- `web-app/src/components/AI/ConsistencyBar.tsx` - Yeni component

---

## 🎯 Sprint 12: ALTYAPI VE PERFORMANS

### Sorunlar
- Re-render yükü yüksek
- setInterval yerine react-query + cache
- Lazy-load eksik
- Unit testler yok

### Çözümler
1. **React Query cache**: useQuery hook'ları
2. **Lazy-load routes**: Portföy & Backtest ayrı route
3. **Unit testler**: RSI state, sentiment normalize

### Dosyalar
- `web-app/src/hooks/queries.ts` - React Query migration
- `web-app/src/app/portfolio/page.tsx` - Lazy route
- `web-app/src/__tests__/` - Unit tests

---

## 📊 Sprint Öncelik Sırası

### Yüksek Öncelik (P0)
1. ✅ Sprint 1: ÜST NAVBAR Restructure
2. ✅ Sprint 2: ÜST ÖZET PANELİ Realtime
3. ✅ Sprint 3: AI GÜNLÜK ÖZETİ+ Enhanced

### Orta Öncelik (P1)
4. ✅ Sprint 6: SINYALLER PANELİ Enhanced
5. ✅ Sprint 7: AI GÜVEN GÖSTERGESİ Gauge
6. ✅ Sprint 8: GERÇEK ZAMANLI UYARILAR WebSocket

### Düşük Öncelik (P2)
7. ✅ Sprint 4: SEKTÖR ISI HARİTASI
8. ✅ Sprint 5: KORELASYON HEATMAP Enhanced
9. ✅ Sprint 11: MULTI-TIMEFRAME Consistency Enhanced

### Gelecek Versiyon (v5.1+)
10. ⏸️ Sprint 9: PORTFÖY SİMÜLATÖRÜ Real Optimizer
11. ⏸️ Sprint 10: AI LEARNING MODE
12. ⏸️ Sprint 12: ALTYAPI VE PERFORMANS

---

## 🚀 Başlangıç

**Sprint 1'den başlıyoruz**: ÜST NAVBAR Restructure

