"use client";

import Link from 'next/link';

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '₺0',
      period: '',
      description: 'Temel özelliklerle başlayın',
      features: [
        'Temel AI sinyalleri',
        'Gecikmeli veri (15 dk)',
        '5 hisse takibi',
        'Temel grafikler',
        'Email desteği'
      ],
      highlight: false,
      cta: 'Ücretsiz Başla',
      ctaLink: '/dashboard'
    },
    {
      name: 'Pro',
      price: '₺199',
      period: '/ay',
      description: 'Profesyonel traderlar için',
      features: [
        'Gerçek zamanlı sinyaller',
        'Sınırsız hisse takibi',
        'Portföy optimizasyonu',
        'Gelişmiş grafikler & analiz',
        'Push bildirimleri',
        'Öncelikli email desteği',
        'Backtest araçları'
      ],
      highlight: true,
      cta: 'Pro\'ya Geç',
      ctaLink: '/dashboard'
    },
    {
      name: 'Elite',
      price: '₺499',
      period: '/ay',
      description: 'Kurumsal seviye özellikler',
      features: [
        'Pro özelliklerinin hepsi',
        'RL Portföy Ajanı',
        'Gelişmiş AI raporları',
        'API erişimi',
        'Özel model eğitimi',
        '7/24 öncelikli destek',
        'Özel danışmanlık'
      ],
      highlight: false,
      cta: 'Elite\'e Geç',
      ctaLink: '/dashboard'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-slate-900">
              Borsailhanos AI Smart Trader
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">Ana Sayfa</Link>
              <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Abonelik Planları
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            İhtiyacınıza göre plan seçin. Tüm planlarda 14 gün ücretsiz deneme.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative rounded-2xl border-2 p-8 shadow-lg transition-all hover:shadow-xl ${
                  plan.highlight
                    ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-white scale-105'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Popüler
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-sm text-slate-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-extrabold text-slate-900">{plan.price}</span>
                    <span className="text-xl text-slate-600">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <svg
                        className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaLink}
                  className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
                    plan.highlight
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Sık Sorulan Sorular</h2>
          <div className="space-y-6">
            {[
              {
                q: '14 günlük ücretsiz deneme nedir?',
                a: 'Tüm planlarda 14 gün boyunca ücretsiz deneme yapabilirsiniz. İstediğiniz zaman iptal edebilirsiniz.'
              },
              {
                q: 'Plan değiştirebilir miyim?',
                a: 'Evet, istediğiniz zaman planınızı yükseltebilir veya düşürebilirsiniz. Değişiklik anında geçerli olur.'
              },
              {
                q: 'Ödeme nasıl yapılır?',
                a: 'Stripe ile güvenli ödeme. Kredi kartı, banka kartı ve diğer ödeme yöntemleri desteklenir.'
              },
              {
                q: 'İptal edebilir miyim?',
                a: 'Evet, istediğiniz zaman iptal edebilirsiniz. İptal sonrası planınız dönem sonuna kadar aktif kalır.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400 text-sm">
            © 2025 Borsailhanos AI Smart Trader. Tüm hakları saklıdır.
          </p>
          <p className="text-slate-500 text-xs mt-2">
            ⚠️ Yatırım Tavsiyesi Değildir • Analiz ve eğitim amaçlıdır
          </p>
        </div>
      </footer>
    </div>
  );
}
