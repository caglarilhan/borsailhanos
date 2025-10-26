'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface ConfidenceData {
  symbol: string;
  accuracy: number;
  type: string;
}

export default function AIConfidenceMeter() {
  const data: ConfidenceData[] = [
    { symbol: 'THYAO', accuracy: 89, type: 'BUY' },
    { symbol: 'AKBNK', accuracy: 78, type: 'BUY' },
    { symbol: 'EREGL', accuracy: 85, type: 'HOLD' },
    { symbol: 'TUPRS', accuracy: 72, type: 'SELL' }
  ];

  const getColor = (accuracy: number) => {
    if (accuracy >= 85) return 'bg-emerald-500';
    if (accuracy >= 70) return 'bg-cyan-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-bold text-white">🎯 AI Güven Göstergesi</h3>
      </div>

      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-white">{item.symbol}</span>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  item.type === 'BUY' ? 'bg-green-500 text-white' :
                  item.type === 'SELL' ? 'bg-red-500 text-white' :
                  'bg-amber-500 text-white'
                }`}>
                  {item.type}
                </span>
              </div>
              <span className="text-cyan-400 font-bold">{item.accuracy}%</span>
            </div>
            
            <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.accuracy}%` }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className={`h-full ${getColor(item.accuracy)} rounded-full`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

