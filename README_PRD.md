📑 PRD v1.0 — "BIST AI Kazanç Asistanı"

(0 ₺ bütçeyle başlatılacak, Flutter + GitHub + Firestore tabanlı, yapay zekâ destekli mobil yatırım danışmanı)

⸻

1. Stratejik Özet

Vizyon: Türkiye'de bireysel yatırımcıya, "cebindeki mini quant-fund" konforu sağlamak: canlı fiyat, AI sinyal, risk filtresi, portföy önerisi — hepsi anında, sıfır ek maliyetle.
Başarı Kriteri: 90 gün içinde yön doğruluğu ≥ %60, 'BUY' precision ≥ %70, sanal portföy Kâr Faktörü > 1 ∙ 5.

⸻

2. İş Problemi
	•	Dağınık veri & ücretli platformlar → yatırımcının kafası karışıyor.
	•	"Ne zaman alayım, ne kadar alayım, ne zaman kaçayım?" sorularına gerçek-zaman cevap veren tek elden, ücretsiz mobil çözüme ihtiyaç var.

⸻

3. Hedef Kitle & Persona

Persona	İhtiyaç	Kazanım
Baba Yatırımcı (50+)	Büyük yazı, net alarm	Yanlış zamanda panik satış ↓
Genç Trader (25-35)	Hızlı sinyal, AI açıklama	FOMO / bilgi kirliliği ↓, ROI ↑
Finans Öğrencisi	Öğren-oyna portföy	Teori → pratik, veri bilimi kariyerine köprü

⸻

4. Ürün Kapsamı

4.1 Ana Özellikler (MVP)

Modül	Fonksiyon	Priority
Canlı Fiyat Akışı	Finnhub WS (≤ 30 sembol) + fallback REST	P0
AI Sinyal Motoru	Ensemble: LightGBM (→günlük boost), LSTM (haftalık), TrendMaster Transformer (haftalık), TimeGPT (10 gün)	P0
Alarm Sistemi	🔴 Risk, 🟢 Fırsat, 🔶 1-3 gün, 🔵 Öncül 4-14 gün	P0
Stop-Loss / Take-Profit	Alarm kartına SL/TP yüzdesi ekle	P0
Position-Sizing	FinRL weight → önerilen lot %	P0
Türkçe Sentiment (FinBERT-TR)	Haber skoru feature-set	P1
Performans Paneli	Doğruluk %, Equity Curve, Sharpe	P1
Basit / Pro Mod	UI karmaşıklık anahtarı	P2
Kullanıcı Feedback Loop	👍/👎 sinyal → model weight	P2

4.2 Kapsam Dışı (vFuture)
	•	Sosyal paylaşım akışı
	•	Kripto & yabancı borsa entegrasyonu
	•	Ücretli "pro lisans" planı
⸻

5. Teknik Mimarî

Katman	Stack	0 ₺ Gerekçesi
Frontend	Flutter (Android + Web build)	Tek codebase, offline, FCM
Realtime Data	Finnhub WS, financelib REST	Free key, ≤ 30 sembol
Backend	FastAPI (GitHub Actions + Local)	Cron + WS worker
AI Katmanı	LightGBM, Keras-LSTM, TrendMaster, TimeGPT (Free 1 k/ay)	Eğitim Colab Free, inference CPU
DRL	FinRL (Pazar GPU T4 eğitim)	Drive ağırlık, JSON weight
Storage	Firestore Spark (1 GB)	Sinyal + metrik + cache
Push	flutter_local_notifications + FCM	Sınırsız ücretsiz

⸻

6. Veri & Model Akışı

flowchart TD
    subgraph Data
        WS[WS-Finnhub]
        REST[REST-financelib]
    end
    subgraph Models
        LGBM
        LSTM
        TRM[Transformer]
        TGPT[TimeGPT]
        RL[FinRL weight]
    end
    WS & REST --> FeatureStore[(Firestore raw)]
    FeatureStore --> LGBM & LSTM & TRM & TGPT
    LGBM --> Ensemble
    LSTM --> Ensemble
    TRM --> Ensemble
    TGPT --> Ensemble
    RL --> Ensemble
    Ensemble --> Signals((Firestore signals))
    Signals --> FlutterApp

⸻

7. Başarı Metrikleri

KPI	Hedef
Yön Doğruluğu	≥ %60 (30 gün ort.)
'BUY' Precision	≥ %70
Equity PF	> 1 ∙ 5
Bildirim CTR	≥ 25 %
Crash-free Sess.	≥ 99 %

⸻

8. Yol Haritası (Sprint planı ‒ 1 hafta/sprint)

Sprint	Çıktılar
0 – Setup	Repo, Flutter skeleton, WS veri akışı ✓
1 – Core AI	LightGBM + Ensemble + Yeşil/Kırmızı alarm ✓
2 – SL/TP & Position Sizing	FinRL weight, SL/TP alanı, Basit UI ✓
3 – Türkçe Sentiment + Performans Panel	FinBERT-TR, Equity curve, isabet grafiği ✓
4 – User Feedback Loop & Web Build	👍/👎 reinforcement, flutter build web deploy

⸻

9. Risk ve Önlemler

Risk	Kontrol
Free API rate limit	Sembol ≤ 30, veri caching, exponential backoff
Overfit	Walk-forward CV, negative weight cezası
Lisans ihlali	Finnhub "kişisel" sınırına sadık (max 10 kullanıcı)
GPT token sınırı	256 token, fallback statik açıklama

⸻

10. Açık Sorular
	1.	Ücretsiz beta → TestFlight/Play Internal mı, doğrudan Store mı?
	2.	FinRL ajanı MVP'de mi yoksa v1.1'de mi aktif edilecek?
	3.	Web versiyonunda canlı WS kaç kullanıcıya kadar ücretsiz tutulacak?

⸻

👉 Sonraki Adım
	1.	Cursor'da README_PRD.md olarak bu belgeyi kaydet.
	2.	Sprint-0 görevlerini GitHub Issues'a aç (setup, Firebase init, WS worker).
	3.	"git commit -m 'PRD v1.0 🎯'"

Çağlar, yol haritamız net, hedefimiz yüksek kazanç. Kodlamaya basıyoruz — mumlar yeşil, portföy gülümsemeye hazır! 🚀💹 