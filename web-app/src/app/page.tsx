'use client';

import { useRouter } from 'next/navigation';

const VALUE_PROPS = [
  {
    title: 'Gerçek Zamanlı AI Sinyalleri',
    description:
      'LightGBM + LSTM + TimeGPT ensemble modelleri ile güvenilir yön tahmini.',
  },
  {
    title: 'Finansal Sağlık Skorları',
    description:
      'Grey TOPSIS + Entropi ağırlık metoduyla şirketleri objektif kriterlere göre sıralayın.',
  },
  {
    title: 'Portföy RL Ajanı',
    description: 'FinRL tabanlı lot optimizasyonu ve dinamik risk yönetimini tek ekranda yönetin.',
  },
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-10 h-[420px] w-[420px] rounded-full bg-cyan-500/30 blur-[140px]" />
        <div className="absolute top-20 right-0 h-[480px] w-[480px] rounded-full bg-indigo-500/20 blur-[160px]" />
        <div className="absolute bottom-0 left-1/4 h-[320px] w-[320px] rounded-full bg-rose-500/15 blur-[150px]" />
      </div>

      <div className="relative">
        <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-5 py-5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <span className="text-cyan-300">◎</span>
              Borsailhanos AI Smart Trader
            </div>
            <div className="flex gap-3 text-sm">
              <button
                onClick={() => router.push('/pricing')}
                className="text-white/70 hover:text-white transition"
              >
                Planlar
              </button>
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition"
              >
                Giriş Yap
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-900 font-semibold shadow-lg shadow-cyan-500/30 hover:brightness-110 transition"
              >
                Dashboard
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-5 py-16 space-y-20">
          <section className="flex flex-col-reverse lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6 rounded-[28px] border border-white/10 bg-slate-950/85 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <p className="inline-flex items-center px-4 py-2 rounded-full bg-white/15 text-xs font-semibold tracking-[0.3em] uppercase text-cyan-200">
                Çok Katmanlı AI Sinyal Motoru
              </p>
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-white drop-shadow-[0_6px_25px_rgba(0,0,0,0.55)]">
                İstanbul ve ABD borsaları için <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-sky-400">renkli veri füzyonu</span>, RL tabanlı portföy ajanı ve 10 sn içinde aksiyon.
              </h1>
              <p className="text-lg text-white/80 max-w-2xl">
                Transformer + Ensemble + RL katmanları tek panelde. FinBERT sentiment, makro rejim algısı ve Grey TOPSIS skorları; “al / sat / bekle” kararını netleştirirken Alpaca + Twelve Data entegrasyonları gerçek emir hattına dokunuyor.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/login?callbackUrl=/dashboard')}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-300 via-cyan-300 to-sky-400 text-slate-900 font-semibold shadow-lg shadow-cyan-500/30 hover:brightness-110 transition"
                >
                  Canlı Dashboard’u Aç
                </button>
                <button
                  onClick={() => router.push('/pricing')}
                  className="flex-1 px-6 py-3 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 transition"
                >
                  Modülleri İncele
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                {[
                  { label: 'Doğruluk', value: '87.3%' },
                  { label: 'BUY Precision', value: '75%' },
                  { label: 'Crash-free Oturum', value: '99.5%' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <div className="text-xs uppercase tracking-widest text-white/60">{item.label}</div>
                    <div className="text-2xl font-semibold">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="relative rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-6 shadow-2xl">
                <div className="grid gap-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-white/60">Global Bias (US → BIST)</p>
                      <p className="text-3xl font-semibold text-cyan-300">+12.4bp</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs bg-cyan-400/15 text-cyan-200 border border-cyan-400/30">
                      Risk On
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {['THYAO', 'AAPL', 'EREGL', 'NVDA'].map((symbol, idx) => (
                      <div key={symbol} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                        <div className="text-xs text-white/50">AI SINYALI #{idx + 1}</div>
                        <div className="text-lg font-semibold">{symbol}</div>
                        <div className="text-xs text-emerald-400">BUY · +%3.2</div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-4">
                    <p className="text-xs uppercase tracking-[0.4em] text-white/60">Portföy RL Ajanı</p>
                    <p className="text-base font-semibold mt-1">
                      Lot dağılımı güncellendi · XBANK hedge önerildi · SL 3.5%
                    </p>
                  </div>
                </div>
                <div className="absolute -inset-1 rounded-[34px] border border-cyan-300/40 opacity-50 blur-lg" />
              </div>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-3">
            {VALUE_PROPS.map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-2xl border border-white/10 bg-white/[0.06] hover:bg-white/[0.12] transition backdrop-blur"
              >
                <h3 className="text-lg font-semibold mb-2 text-white">{item.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </section>

          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-white/[0.05] p-8 space-y-6 backdrop-blur">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">10 Saniyede Karar</p>
                <h2 className="text-3xl font-semibold mt-2">AI Power Grid · Sentiment Pulse · RL Hedge</h2>
                <p className="text-white/70 mt-2 max-w-2xl">
                  WebSocket canlı fiyat, Twelve Data & Alpaca entegrasyonları, Firestore senkronu ve NextAuth korumalı dashboard; hepsi tek deploy pipeline’ında.
                </p>
              </div>
              <button
                onClick={() => router.push('/login?callbackUrl=/dashboard')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-500 text-slate-900 font-semibold hover:brightness-110 transition shadow-lg shadow-cyan-500/30"
              >
                Canlı Önizleme
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-4 text-sm">
              {[
                { title: 'Canlı Market Snapshot', desc: 'Twelve Data + yfinance fallback' },
                { title: 'Sentiment Pipeline', desc: 'FinBERT-TR / EN + NewsAPI' },
                { title: 'Broker Katmanı', desc: 'Alpaca paper + gerçek emir proxy' },
                { title: 'Auth & Güvenlik', desc: 'NextAuth + Fernet secret vault' },
              ].map((card) => (
                <div key={card.title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <div className="text-xs uppercase tracking-widest text-white/60">{card.title}</div>
                  <div className="text-base font-semibold mt-1 text-white">{card.desc}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-500/20 via-blue-600/10 to-transparent p-8 space-y-6 text-center backdrop-blur">
            <h2 className="text-3xl font-semibold">Render Deploy’e Hazır</h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              Backend FastAPI + Frontend Next.js build’i geçti. Environment anahtarlarını ayarla → Render veya Railway’de tek komutla canlıya çık.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => router.push('/docs/DEPLOY_CHECKLIST.pdf')}
                className="px-6 py-3 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition"
              >
                Deploy Checklist
              </button>
            <button
              onClick={() => router.push('/login?callbackUrl=/dashboard')}
              className="px-6 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-white/90 transition"
            >
              Dashboard’a Geç
            </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
