'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Sparkles } from 'lucide-react';

export default function AINewsTrigger() {
  const newsTriggers = [
    {
      id: '1',
      type: 'macro',
      title: 'TCMB Faiz Kararı',
      message: 'Beklenenden yüksek faiz kararı geldi — Bankacılık hisselerinde kısa vadeli baskı bekleniyor.',
      impact: 'High',
      timestamp: new Date(Date.now() - 30 * 60000)
    },
    {
      id: '2',
      type: 'sector',
      title: 'Teknoloji Sektörü',
      message: 'THYAO ve BIST Teknoloji endeksi pozitif sentiment — Güçlü alım sinyali.',
      impact: 'Medium',
      timestamp: new Date(Date.now() - 45 * 60000)
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'Medium': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      case 'Low': return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      default: return 'bg-slate-700/30 border-slate-600 text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 mb-4">
        <Newspaper className="w-8 h-8 text-cyan-400" />
        <h3 className="text-xl font-bold text-white">🗞️ AI Haber Uyarıları</h3>
      </div>

      <div className="space-y-3">
        {newsTriggers.map((news, idx) => (
          <motion.div
            key={news.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-white">{news.title}</span>
              </div>
              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getImpactColor(news.impact)}`}>
                {news.impact} Impact
              </span>
            </div>
            <p className="text-sm text-gray-300 mb-2">{news.message}</p>
            <p className="text-xs text-gray-500">
              {Math.floor((Date.now() - news.timestamp.getTime()) / 60000)} dakika önce
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

