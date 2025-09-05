Süper, Çağlar 👌 Senin istediğin şey net: elimizdeki tüm parçaları (önceki PRD + genişletilmiş özellikler + deployment/bütçe detayları) tek, harmanlanmış ve eksiksiz PRD haline getirmek. Aşağıda tam birleşmiş versiyonu veriyorum. Bu haliyle Cursor’da sprint sprint kodlarken tek kaynak dökümanın olacak.

⸻

📑 PRD – Part-time Practice SaaS (ABD & Avrupa)

⸻

1. 🎯 Amaç

Part-time ve küçük ölçekli çalışan terapist/psikologların (ABD + Avrupa) klinik iş yükünü kolaylaştıran, ucuz, sade, güvenli SaaS platformu.
	•	ABD farkı: Superbill & CPT code desteği, insurance entegrasyonu.
	•	Avrupa farkı: GDPR uyumlu fatura, multi-language.
	•	Fark yaratıcı: AI destekli not yazımı, reminder sistemi, outcome tracking, minimal UX.

⸻

2. 👥 Hedef Kitle
	•	ABD’de part-time terapistler, private practice çalışanlar (~300K provider).
	•	Avrupa’da küçük klinikler, bağımsız psikologlar.
	•	Uzun vadede: 5–20 terapistlik klinikler (white-label).

⸻

3. 🛑 Kullanıcı Acı Noktaları
	1.	Mevcut SaaS’ler (SimplePractice, TherapyNotes) pahalı ($60–100/ay) ve karmaşık.
	2.	Dokümantasyon (SOAP, BIRP, DAP) çok vakit alıyor.
	3.	Superbill oluşturmak zahmetli (Excel/Word).
	4.	Takvim yönetimi dağınık (Google/Outlook/Zoom ayrı).
	5.	No-show oranı yüksek (reminder eksikliği).
	6.	Veri güvenliği (HIPAA/GDPR) belirsiz → stres.
	7.	UX kötü: çok fazla tık, dağınık ekranlar.

⸻

4. 📌 Ürün Kapsamı (Feature Set)

✅ MVP (Sprint 1 – Hafta 1)
	•	Clients: CRUD, sigorta bilgisi, dosya alanı.
	•	Appointments: CRUD, basit takvim.
	•	Notes: SOAP format, PDF export.
	•	Invoices: CPT code seçimi, Superbill PDF export.
	•	Reminders: E-mail reminder (24h önce).
	•	Dashboard: 4 sekme (Clients, Appointments, Notes, Billing).
	•	Auth: E-mail login (Supabase).
	•	UI/UX: Quick Add butonu, dark mode.

⸻

🚀 Sprint 2 (Ay 2)
	•	Takvim Entegrasyonu: Google/Outlook sync, Zoom/Meet link üretimi.
	•	Notes: BIRP, DAP, Progress Notes + özelleştirilebilir alanlar.
	•	Dosya Yönetimi: Consent formu, ölçek upload.
	•	Reminders: SMS (Twilio), özelleştirilebilir şablon.
	•	Ödeme: Stripe entegrasyonu, online ödeme linki.
	•	Export/Import: CSV + toplu PDF export.
	•	Multi-language: EN, TR, DE/FR/ES.

⸻

⚡ Sprint 3–4 (Ay 3–4)
	•	AI Not Asistanı: Voice-to-text (Whisper), AI draft (SOAP/BIRP).
	•	Security: Field-level encryption (AES), Audit log, Role-based access.
	•	Group Sessions: Çok danışanlı randevu.
	•	Client Portal (lite): Danışan → randevusunu ve ödeme geçmişini görür.
	•	Analytics (lite): Randevu sayısı, gelir toplamı, no-show oranı.

⸻

🔮 Sprint 5+ (6. Ay ve sonrası)
	•	Outcome Tracking: PHQ-9, GAD-7, BDI gönderimi + grafik trend.
	•	Insurance Claim (ABD): Superbill → otomatik sigorta claim submission.
	•	White-label Klinik Modu: Multi-user admin panel, klinik dashboard.
	•	Client Portal (full): Danışan → test doldurur, tele-seans linki alır, ödeme yapar.
	•	AI Risk Flagging: Notlarda intihar/self-harm tespiti → flag.
	•	3rd Party Entegrasyonlar: QuickBooks, EHR sync.

⸻

5. 🏗️ Teknik Mimarî

Frontend
	•	Next.js (App Router) + Tailwind.
	•	Component library: shadcn/ui.
	•	PWA desteği (offline not alma).

Backend / DB
	•	Supabase (Postgres + Auth + Storage).
	•	Tablo şeması:
	•	clients: id, name, contact, insurance, status.
	•	appointments: id, client_id, date, time, status, tele_link.
	•	notes: id, client_id, type, content_encrypted, created_by.
	•	invoices: id, client_id, amount, cpt_code, pdf_url, status.
	•	files: id, client_id, file_url, type.
	•	audit_logs: id, user_id, action, entity, timestamp.

Integrations
	•	Google Calendar / Outlook API.
	•	Zoom / Meet link generator.
	•	Stripe Checkout.
	•	Resend (email), Twilio (SMS).
	•	OpenAI Whisper + GPT-turbo (AI not asistanı).

Deployment
	•	Repo: GitHub.
	•	Frontend: Vercel (CI/CD → auto deploy).
	•	Backend: Supabase.
	•	Opsiyonel serverless: Vercel Functions / Cloudflare Workers.

⸻

6. 🔒 Güvenlik & Uyumluluk
	•	Row-Level Security (Supabase).
	•	Field-level encryption (AES-GCM).
	•	TLS in transit.
	•	Audit log (kim, neye erişti).
	•	GDPR: data export/delete.
	•	HIPAA: PHI minimal → uzun vadede BAA partner ile uyum.

⸻

7. 💰 Fiyatlandırma (Optimized)
	•	STARTER (Ücretsiz): 3 danışan, 10 randevu/ay, basic notes
	•	PROFESSIONAL ($29/ay): Sınırsız danışan, AI notes, reminders, analytics
	•	PRACTICE ($79/ay): Multi-user, advanced analytics, insurance billing, API
	•	ENTERPRISE ($199/ay): White-label, custom integrations, priority support
	•	Annual plan: %25 indirim (2 ay bedava)
	•	Add-ons: AI Premium (+$15/ay), Telehealth (+$10/ay), Advanced Reports (+$20/ay)

⸻

8. 📊 Başarı Ölçütleri
	•	3 ay → 50 aktif terapist.
	•	Terapist başına haftada 5+ fatura.
	•	%30 no-show azaltma (reminders).
	•	Not yazma süresi 10 dk → 3 dk (AI draft).

⸻

9. 📅 Yol Haritası
	•	Sprint 0 (Bu hafta): Supabase şema + Next.js dashboard iskeleti.
	•	Sprint 1 (Hafta 1): Clients, Appointments, SOAP, Invoices, Email reminder.
	•	Sprint 2 (Hafta 2–4): Calendar sync, BIRP/DAP notes, Files, SMS reminder, Stripe, Multi-language.
	•	Sprint 3–4 (Ay 3–4): AI notes, Encryption, Audit log, Group sessions, Client portal lite, Analytics.
	•	Sprint 5+ (6. Ay): Outcome tracking, Insurance claim, White-label, Client portal full, AI risk flagging.

⸻

10. 💸 Altyapı Bütçesi (Başlangıç)

Kalem	Seçenek	Aylık
Repo/CI/CD	GitHub + Vercel (free)	$0
DB/Auth/Storage	Supabase (free → Pro $25–49)	$0–49
E-mail	Resend free tier	$0
SMS	Twilio (usage-based)	$5–20
Domain	.com	$10–15 / yıl
Toplam (başlangıç)		$5–20/ay


⸻

🎯 Özet
	•	MVP → 1 haftada çıkar.
	•	Ay 2 → rakiplerle kafa kafaya.
	•	Ay 6 → rakipleri geçen, tam kapsamlı SaaS.
	•	ABD’de killer feature: Superbill + AI notes.
	•	Avrupa’da killer feature: GDPR uyumu + multi-language.
	•	Başlangıç maliyeti: $5–20/ay, trafik artınca bile <$200/ay.

kullanıcı psikiyatristler uygulamayı çok kolay anlayıp kullanabilmeli. direk çözüm odaklı kullanıcı dostu işi kolaylaştıran yaklaşımlar uygulamalıyız.
⸻

