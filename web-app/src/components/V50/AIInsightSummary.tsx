'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Activity, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useSSRFixer } from '@/hooks/useSSRFixer';
import Link from 'next/link';

interface SummaryData {
  marketSentiment: number;
  strongestSector: string;
  sectorChange: number;
  topSignals: Array<{ symbol: string; signal: string; change: number; accuracy: number }>;
  portfolioReturn: number;
  riskScore: number;
  lastUpdate: Date;
}

export default function AIInsightSummary() {
  const ready = useSSRFixer();
  const [summary, setSummary] = useState<SummaryData>({
    marketSentiment: 71,
    strongestSector: 'Teknoloji',
    sectorChange: 3.8,
    topSignals: [
      { symbol: 'THYAO', signal: 'BUY', change: 9.3, accuracy: 89.2 },
      { symbol: 'EREGL', signal: 'BUY', change: 11.8, accuracy: 88.7 },
      { symbol: 'SISE', signal: 'BUY', change: 13.2, accuracy: 91.5 },
      { symbol: 'GARAN', signal: 'BUY', change: 23.1, accuracy: 92.3 },
      { symbol: 'AKBNK', signal: 'BUY', change: 22.0, accuracy: 91.8 },
    ],
    portfolioReturn: 8.2,
    riskScore: 3.1,
    lastUpdate: new Date()
  });
  
  const [mounted, setMounted] = useState<boolean>(false);
  const [timeString, setTimeString] = useState<string>('');
  
  useEffect(() => {
    if (!ready) return;
    setMounted(true);
    if (summary?.lastUpdate) {
      setTimeString(summary.lastUpdate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
    }
  }, [ready, summary?.lastUpdate]);
  
  if (!ready) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Piyasa Özeti */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-5 border-2 border-blue-500/30"
      >
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-bold text-white">🧠 AI Piyasa Analizi</h3>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-gray-200">
            Piyasa geneli <strong className="text-emerald-400">%{summary.marketSentiment} pozitif</strong>
          </p>
          <p className="text-gray-200">
            En güçlü sektör: <strong className="text-cyan-400">{summary.strongestSector}</strong>
            <span className="text-emerald-400 ml-1">+{summary.sectorChange}%</span>
          </p>
          <p className="text-gray-400 text-xs flex items-center gap-2 mt-3">
            <Activity className="w-3 h-3" />
            {mounted ? timeString : 'Yükleniyor...'}
          </p>
        </div>
      </motion.div>

      {/* 2. Top 5 AI Önerileri */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl p-5 border-2 border-emerald-500/30"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">📈 Günün 5 Önerisi</h3>
          </div>
          <Link href="/feature/bist30" className="text-xs text-emerald-300 hover:text-emerald-200 underline">
            Tümü →
          </Link>
        </div>
        <div className="space-y-2">
          {summary.topSignals.slice(0, 5).map((sig, i) => (
            <div key={i} className="flex items-center justify-between bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{sig.symbol}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded ${
                  sig.signal === 'BUY' ? 'bg-emerald-500/30 text-emerald-200' : 
                  sig.signal === 'SELL' ? 'bg-red-500/30 text-red-200' : 
                  'bg-gray-500/30 text-gray-200'
                }`}>
                  {sig.signal}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${sig.change >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                  {sig.change >= 0 ? '+' : ''}{sig.change.toFixed(1)}%
                </span>
                <span className="text-[10px] text-gray-300">({sig.accuracy.toFixed(0)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 3. Portföy Özeti */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl p-5 border-2 border-indigo-500/30"
      >
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-6 h-6 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">💼 Portföy Önerisi</h3>
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-gray-300 mb-1">Tahmini Getiri</div>
            <div className="text-2xl font-bold text-emerald-400">+{summary.portfolioReturn.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-xs text-gray-300 mb-1">Risk Skoru</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    summary.riskScore <= 2 ? 'bg-emerald-500' : 
                    summary.riskScore <= 4 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(summary.riskScore / 5) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold text-white">{summary.riskScore.toFixed(1)}</span>
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            THYAO 40% • EREGL 30% • SISE 30%
          </div>
        </div>
      </motion.div>
    </div>
  );
}

