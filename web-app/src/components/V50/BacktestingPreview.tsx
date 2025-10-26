'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';

export default function BacktestingPreview() {
  const stats = {
    period: '30 Gün',
    avgReturn: 8.6,
    winRate: 72.5,
    sharpeRatio: 1.85,
    bestDay: '+12.3%',
    worstDay: '-3.2%'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-6 border-2 border-green-500/30"
    >
      <div className="flex items-center gap-3 mb-4">
        <BarChart3 className="w-8 h-8 text-green-400" />
        <h3 className="text-xl font-bold text-white">📈 Backtest Sonuçları ({stats.period})</h3>
      </div>

      <p className="text-base text-gray-300 mb-4">
        AI stratejileri son 30 günde <strong className="text-green-400 text-lg">{stats.avgReturn}%</strong> ortalama getiri sağladı.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-2xl font-bold text-cyan-400">{stats.winRate}%</div>
          <div className="text-xs text-gray-400">Kazanma Oranı</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-2xl font-bold text-purple-400">{stats.sharpeRatio}</div>
          <div className="text-xs text-gray-400">Sharpe Ratio</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-2xl font-bold text-emerald-400">{stats.bestDay}</div>
          <div className="text-xs text-gray-400">En İyi Gün</div>
        </div>
      </div>

      <button className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-bold text-white hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2">
        📊 Detaylı Raporu Görüntüle
      </button>
    </motion.div>
  );
}

