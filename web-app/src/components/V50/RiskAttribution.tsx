'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingDown } from 'lucide-react';

export default function RiskAttribution() {
  const riskData = [
    { symbol: 'THYAO', riskShare: 42, color: '#ef4444' },
    { symbol: 'AKBNK', riskShare: 31, color: '#f59e0b' },
    { symbol: 'EREGL', riskShare: 27, color: '#10b981' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30"
    >
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-8 h-8 text-orange-400" />
        <h3 className="text-xl font-bold text-white">📊 Risk Dağılımı</h3>
      </div>

      <div className="space-y-3">
        {riskData.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="space-y-2"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white"
                     style={{ background: item.color }}>
                  {item.symbol}
                </div>
                <div>
                  <div className="font-bold text-white">Risk payı</div>
                  <div className="text-xs text-gray-400">{item.riskShare}%</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-orange-400">{item.riskShare}%</div>
              </div>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.riskShare}%` }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className="h-full rounded-full"
                style={{ background: item.color }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
        <p className="text-sm text-orange-400 flex items-center gap-2">
          <TrendingDown className="w-4 h-4" />
          THYAO en yüksek risk taşıyor. Portfolio dengesini gözden geçirin.
        </p>
      </div>
    </motion.div>
  );
}

