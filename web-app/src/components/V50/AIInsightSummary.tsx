'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Activity, AlertCircle } from 'lucide-react';

export default function AIInsightSummary() {
  const [summary, setSummary] = useState({
    marketSentiment: 71,
    strongestSector: 'Teknoloji',
    sectorChange: 3.8,
    topSignals: ['THYAO', 'SISE'],
    lastUpdate: new Date()
  });
  
  const [mounted, setMounted] = useState(false);
  const [timeString, setTimeString] = useState('');
  
  useEffect(() => {
    setMounted(true);
    setTimeString(summary.lastUpdate.toLocaleTimeString('tr-TR'));
  }, [summary.lastUpdate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-xl p-6 border-2 border-purple-500/30"
    >
      <div className="flex items-center gap-3 mb-4">
        <Brain className="w-8 h-8 text-purple-400" />
        <h3 className="text-xl font-bold text-white">🧠 AI Günlük Özeti</h3>
      </div>
      
      <div className="space-y-3 text-sm">
        <p className="text-gray-300">
          Bugün piyasa geneli <strong className="text-emerald-400">%{summary.marketSentiment} pozitif</strong>. 
          En güçlü sektör: <strong className="text-cyan-400">{summary.strongestSector}</strong> (+{summary.sectorChange}%).
        </p>
        <p className="text-gray-300">
          AI, <strong className="text-purple-400">{summary.topSignals.join(', ')}</strong> için yükseliş sinyali tespit etti.
        </p>
        <p className="text-gray-400 text-xs flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Son güncelleme: {mounted ? timeString : 'Yükleniyor...'}
        </p>
      </div>
    </motion.div>
  );
}

