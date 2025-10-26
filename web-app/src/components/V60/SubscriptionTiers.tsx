'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check,
  Zap,
  Crown,
  Building2,
  Star,
  TrendingUp
} from 'lucide-react';

interface Tier {
  id: string;
  name: string;
  price: string;
  priceYearly: string;
  icon: React.ReactNode;
  features: string[];
  popular?: boolean;
  color: string;
}

export default function SubscriptionTiers() {
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const tiers: Tier[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: '99 ₺/ay',
      priceYearly: '990 ₺/yıl',
      icon: <Zap className="w-8 h-8" />,
      color: '#3b82f6',
      features: [
        '5 aktif sinyal',
        'Günlük AI yorumu',
        'Temel risk analizi',
        'Watchlist (10 hisse)',
        'Email bildirimleri',
        'Temel görselleştirme'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Trader',
      price: '299 ₺/ay',
      priceYearly: '2990 ₺/yıl',
      icon: <Star className="w-8 h-8" />,
      color: '#10b981',
      popular: true,
      features: [
        '25 aktif sinyal',
        'AI Chat Assistant',
        'Gelişmiş risk yönetimi',
        'Watchlist (100 hisse)',
        'Push + Email bildirimler',
        'Gelişmiş görselleştirme hub',
        'SHAP açıklamaları',
        'Backtesting API',
        'Trader seviye sistemi'
      ]
    },
    {
      id: 'institutional',
      name: 'Institutional',
      price: '999 ₺/ay',
      priceYearly: '9990 ₺/yıl',
      icon: <Crown className="w-8 h-8" />,
      color: '#8b5cf6',
      features: [
        'Sınırsız sinyal',
        'Priority AI Chat',
        'Meta-Model Engine erişimi',
        'Sınırsız watchlist',
        'Tüm bildirim kanalları',
        'Full görselleştirme paketi',
        'XAI + Cognitive AI',
        'Backtesting + Monte Carlo',
        'Özel broker entegrasyonu',
        'API erişimi',
        'Aylık PDF rapor',
        '7/24 destek'
      ]
    }
  ];

  const getCurrentPrice = (tier: Tier) => {
    return selectedPeriod === 'monthly' ? tier.price : tier.priceYearly;
  };

  const getSavings = () => {
    return selectedPeriod === 'yearly' ? '2 ay ücretsiz' : null;
  };

  return (
    <div className="space-y-8">
      {/* Period Toggle */}
      <div className="flex justify-center">
        <div className="bg-slate-800 rounded-lg p-2 flex gap-2 inline-flex">
          <button
            onClick={() => setSelectedPeriod('monthly')}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              selectedPeriod === 'monthly'
                ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Aylık
          </button>
          <button
            onClick={() => setSelectedPeriod('yearly')}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              selectedPeriod === 'yearly'
                ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Yıllık <span className="text-xs text-yellow-400">2 ay ücretsiz</span>
          </button>
        </div>
      </div>

      {/* Tiers Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((tier, idx) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-slate-800 rounded-2xl p-8 border-2 transition-all cursor-pointer hover:scale-105 ${
              tier.popular
                ? `${tier.color.replace('#', 'border-')}/30 shadow-lg`
                : 'border-slate-700 hover:border-slate-600'
            } ${selectedTier === tier.id ? 'ring-4 ring-purple-500/50' : ''}`}
            onClick={() => setSelectedTier(tier.id)}
          >
            {/* Header */}
            <div className="text-center mb-6">
              {tier.popular && (
                <div className="inline-block px-4 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-white text-xs font-bold mb-4">
                  En Popüler
                </div>
              )}
              <div className={`inline-flex w-16 h-16 rounded-full items-center justify-center mb-4`} style={{ background: `${tier.color}20`, color: tier.color }}>
                {tier.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
              <div className="text-3xl font-bold mb-2" style={{ color: tier.color }}>
                {getCurrentPrice(tier)}
              </div>
              {selectedPeriod === 'yearly' && (
                <div className="text-sm text-yellow-400 font-bold">
                  💰 2 ay ücretsiz
                </div>
              )}
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              {tier.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Check className="w-5 h-5 flex-shrink-0" style={{ color: tier.color }} />
                  <span className="text-sm text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              className={`w-full py-4 rounded-lg font-bold text-white transition-all ${
                tier.popular
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600'
                  : selectedTier === tier.id
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              {selectedTier === tier.id ? '✓ Seçildi' : 'Planı Seç'}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/30">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-cyan-400" />
          Özellik Karşılaştırması
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/30">
                <th className="text-left py-4 px-4 text-gray-400 font-bold">Özellik</th>
                <th className="text-center py-4 px-4 text-blue-400 font-bold">Basic</th>
                <th className="text-center py-4 px-4 text-green-400 font-bold">Pro Trader</th>
                <th className="text-center py-4 px-4 text-purple-400 font-bold">Institutional</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Aktif Sinyal', basic: '5', pro: '25', inst: '∞' },
                { feature: 'AI Chat', basic: '❌', pro: '✅', inst: '✅ Priority' },
                { feature: 'Risk Yönetimi', basic: 'Temel', pro: 'Gelişmiş', inst: 'Expert' },
                { feature: 'Watchlist', basic: '10', pro: '100', inst: '∞' },
                { feature: 'Meta-Model', basic: '❌', pro: '❌', inst: '✅' },
                { feature: 'SHAP Açıklama', basic: '❌', pro: '✅', inst: '✅' },
                { feature: 'Backtesting', basic: '❌', pro: 'API', inst: 'Full + MC' },
                { feature: 'API Erişimi', basic: '❌', pro: '❌', inst: '✅' },
                { feature: 'PDF Rapor', basic: '❌', pro: '❌', inst: '✅' }
              ].map((row, i) => (
                <tr key={i} className="border-b border-slate-700/20">
                  <td className="py-4 px-4 text-gray-300 font-medium">{row.feature}</td>
                  <td className="text-center py-4 px-4 text-gray-400">{row.basic}</td>
                  <td className="text-center py-4 px-4 text-emerald-400 font-bold">{row.pro}</td>
                  <td className="text-center py-4 px-4 text-purple-400 font-bold">{row.inst}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Money Back Guarantee */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30">
        <div className="flex items-center gap-4">
          <Check className="w-12 h-12 text-green-400 flex-shrink-0" />
          <div>
            <h4 className="text-lg font-bold text-green-400 mb-1">30 Gün Para İade Garantisi</h4>
            <p className="text-sm text-gray-300">
              Memnun kalmazsanız 30 gün içinde tam para iadesi alırsınız. Risk yok!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

