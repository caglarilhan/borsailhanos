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
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="text-lg font-semibold">Borsailhanos AI Smart Trader</div>
          <div className="flex gap-4 text-sm">
            <button
              onClick={() => router.push('/pricing')}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Planlar
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              Dashboard&apos;a Git
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-20 space-y-16">
        <section className="text-center space-y-6">
          <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
            AI Destekli Yatırım Asistanı
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            BIST ve ABD borsaları için akıllı sinyaller, portföy önerileri ve gerçek zamanlı AI yorumları
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Ensemble modeller, RL tabanlı lot optimizasyonu ve sentiment analizi sayesinde tek ekranda kapsamlı
            görünürlük sağlayan hafif bir deneyim.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              Dashboard&apos;a Git
            </button>
            <button
              onClick={() => router.push('/pricing')}
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:border-slate-300 transition-colors"
            >
              Planları İncele
            </button>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6">
          {VALUE_PROPS.map((item) => (
            <div key={item.title} className="p-6 border border-slate-200 rounded-2xl shadow-sm">
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
