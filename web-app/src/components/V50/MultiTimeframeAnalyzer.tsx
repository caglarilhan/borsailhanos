'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp } from 'lucide-react';

export default function MultiTimeframeAnalyzer() {
  const timeframes = [
    { period: '1 Saatlik', trend: 'Yükseliş', accuracy: 83 },
    { period: '4 Saatlik', trend: 'Yükseliş', accuracy: 85 },
    { period: '1 Günlük', trend: 'Yükseliş', accuracy: 88 }
  ];

  const getTrendColor = (trend: string) => {
    return trend === 'Yükseliş' ? 'text-green-400' : 
           trend === 'Düşüş' ? 'text-red-400' : 
           'text-amber-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30"
    >
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-8 h-8 text-purple-400" />
        <h3 className="text-xl font-bold text-white">🔮 Multi-Timeframe Analiz</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/30">
              <th className="text-left py-3 px-4 text-gray-400 font-bold">Zaman</th>
              <th className="text-left py-3 px-4 text-gray-400 font-bold">Trend</th>
              <th className="text-right py-3 px-4 text-gray-400 font-bold">Doğruluk</th>
            </tr>
          </thead>
          <tbody>
            {timeframes.map((tf, idx) => (
              <motion.tr
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="border-b border-slate-700/20"
              >
                <td className="py-3 px-4 text-gray-300 font-medium">{tf.period}</td>
                <td className={`py-3 px-4 font-bold ${getTrendColor(tf.trend)}`}>
                  {tf.trend === 'Yükseliş' && '↑ '}{tf.trend}
                </td>
                <td className="text-right py-3 px-4 text-cyan-400 font-bold">{tf.accuracy}%</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
        <p className="text-sm text-emerald-400 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Tüm timeframe'lerde tutarlı yükseliş trendi → Güçlü sinyal
        </p>
      </div>
    </motion.div>
  );
}

