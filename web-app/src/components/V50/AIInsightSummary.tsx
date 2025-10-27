'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Activity, AlertCircle } from 'lucide-react';
import { useSSRFixer } from '@/hooks/useSSRFixer';

interface SummaryData {
  marketSentiment: number;
  strongestSector: string;
  sectorChange: number;
  topSignals: string[];
  lastUpdate: Date;
}

export default function AIInsightSummary() {
  const ready = useSSRFixer(); // Hydration koruması
  const [summary, setSummary] = useState<SummaryData>({
    marketSentiment: 71,
    strongestSector: 'Teknoloji',
    sectorChange: 3.8,
    topSignals: ['THYAO', 'SISE'],
    lastUpdate: new Date()
  });
  
  const [mounted, setMounted] = useState<boolean>(false);
  const [timeString, setTimeString] = useState<string>('');
  
  useEffect(() => {
    if (!ready) return;
    setMounted(true);
    if (summary?.lastUpdate) {
      setTimeString(summary.lastUpdate.toLocaleTimeString('tr-TR'));
    }
  }, [ready, summary?.lastUpdate]);
  
  // SSR'de hiçbir şey render etme
  if (!ready) return null;

  return (
    <motion.div
      initial={false}
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
          AI,{' '}
          {summary?.topSignals?.map((sig, i) => (
            <React.Fragment key={i}>
              <strong className="text-purple-400">{sig}</strong>
              {i < summary.topSignals.length - 1 ? ' ve ' : ''}
            </React.Fragment>
          ))}{' '}
          için yükseliş sinyali tespit etti.
        </p>
        <p className="text-gray-400 text-xs flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Son güncelleme: {mounted ? timeString : 'Yükleniyor...'}
        </p>
      </div>
    </motion.div>
  );
}

