# Sprint Plan: AI Tahmin Gücü + UI Yenilemesi

## Odak 1: Tahmin Gücü (AI Upgrades)
1. StackTuner Pipeline
   - Optuna ile LightGBM/XGBoost/CatBoost + Meta-learner hiperparam optimizasyonu
   - Regime-aware weighting: risk_on/risk_off durumuna göre ağırlık tablosu
   - AutoML raporu: her run için doğruluk/Sharpe/log loss loglanacak
2. Transformer Fusion
   - Multi-timeframe veri + haber/sentiment embedding birleşimi
   - Attention weight görselleştirme API çıkışı
3. RL Position Sizing
   - Ensemble çıktısı → RL ajanına state olarak (confidence, volatility, trend)
   - Çıktı: lot size, SL/TP, hedge önerisi

## Odak 2: Tasarım & UX
1. AI Power Grid
   - Kartlar: “Tahmin Gücü”, “Regime İnfluence”, “Risk vs Alfa”
   - Animated gradients + micro-interactions
2. Hisse Kartları 2.0
   - 3D stack görünümü, AI yorumu, hedef fiyat, güven yüzdesi
   - Buy/Sell aksiyon butonları + BrokerIntegration hook
3. Grafik Revizyonu
   - Custom SVG/Cavas chart, sentiment overlay, neon glow
   - Attention timeline + regime heat strip

## Sprint Akışı
1. Gün 1-2: StackTuner + planlama
2. Gün 3-4: Transformer fusion + API çıkışı
3. Gün 5: RL entegrasyon POC
4. Gün 6-7: AI Power UI + Hisse kart redesign
5. Gün 8: Grafik revizyonu
6. Gün 9: E2E bağlantılar, test
7. Gün 10: Demo ve ölçüm

KPI: Doğruluk +%3, Sharpe +0.2, UI engagement +%25
