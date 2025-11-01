# P0 - Kritik Hatalar Sprint Planı

## 🚨 P0-01: RSI State Düzeltme

**Problem**: RSI 72.9 → "oversold" gösteriliyor, "overbought" olmalı.

**Fix**: 
- Backend: `mapRSIToState(rsi)` fonksiyonu
- Frontend: RSI durumu gösteriminde düzeltme
- QA: 72→overbought, 25→oversold testi

**Kabul Kriterleri**:
- Tüm tablolarda RSI durumları doğru
- 70+ = overbought, 30- = oversold, arası = neutral

---

## 🚨 P0-02: Sentiment Normalize

**Problem**: THYAO 82/68/18 = 168% (100%'ü aşıyor)

**Fix**:
- `normalizeSentiment()` fonksiyonu
- Pipeline'da normalize
- Unit test: sum = 100.0 ± 0.1

**Kabul Kriterleri**:
- Her sembolde Pozitif+Negatif+Nötr = 100.0 ± 0.1
- Tüm sentiment gösterimlerinde normalize edilmiş değerler

---

## 🚨 P0-03: Risk Dağılımı Çift Satır

**Problem**: "Risk payı 42% 42%" tekrarı

**Fix**:
- Tek kaynaklı RiskPie component
- Label formatı: `{symbol} {pct}%`

**Kabul Kriterleri**:
- Tek satır, tek yüzde gösterimi
- Çift gösterim yok

---

## 🚨 P0-04: Admin RBAC

**Problem**: Admin butonu herkese açık

**Fix**:
- `role==='admin'` koşullu render
- Server-side guard (JWT claim)
- Route koruması 401/403

**Kabul Kriterleri**:
- Non-admin hesapta Admin görünmez
- Route korumalı 401/403

---

## 🚨 P0-05: Zaman/Gerçek Zamanlı Tutarsızlık

**Problem**: "Gerçek zamanlı" yazıyor ama veri mock

**Fix**:
- WebSocket varsa "Canlı"
- Yoksa "Son senkron: hh:mm:ss"

**Kabul Kriterleri**:
- UI etiketi veri kaynağına göre otomatik değişir

