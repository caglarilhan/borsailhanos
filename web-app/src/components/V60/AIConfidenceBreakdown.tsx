'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp,
  TrendingDown,
  Percent,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';

interface ConfidenceFactor {
  name: string;
  contribution: number;
  positive: boolean;
  description?: string;
}

interface SymbolConfidence {
  symbol: string;
  overall: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  factors: ConfidenceFactor[];
}

export default function AIConfidenceBreakdown() {
  const [selectedSymbol, setSelectedSymbol] = useState('THYAO');

  const symbolData: Record<string, SymbolConfidence> = {
    'THYAO': {
      symbol: 'THYAO',
      overall: 87,
      signal: 'BUY',
      factors: [
        { name: 'RSI Momentum', contribution: 35, positive: true, description: 'RSI 71 - Güçlü momentum sinyali' },
        { name: 'Volume Surge', contribution: 30, positive: true, description: 'Hacim artışı %25 - Alıcı talebi yüksek' },
        { name: 'MACD Cross', contribution: 25, positive: true, description: 'MACD eksi alanda pozitif kesişim' },
        { name: 'Support Level', contribution: 10, positive: true, description: 'Destek seviyesi 240₺ - Güçlü alan' }
      ]
    },
    'AKBNK': {
      symbol: 'AKBNK',
      overall: 75,
      signal: 'BUY',
      factors: [
        { name: 'Banking Index', contribution: 40, positive: true, description: 'Sektör performansı %3.2 pozitif' },
        { name: 'P/E Ratio', contribution: 25, positive: true, description: 'P/E 8.5 - Değer seviyesi' },
        { name: 'Dividend Yield', contribution: 20, positive: true, description: 'Temettü verimi %4.2' },
        { name: 'Volatility', contribution: -15, positive: false, description: 'Volatilite yüksek - risk artışı' }
      ]
    },
    'EREGL': {
      symbol: 'EREGL',
      overall: 82,
      signal: 'HOLD',
      factors: [
        { name: 'Momentum Loss', contribution: -30, positive: false, description: 'Momentum düşüşü - RSI 45' },
        { name: 'Support Break', contribution: -25, positive: false, description: 'Destek kırılması riski' },
        { name: 'Volume Drop', contribution: -20, positive: false, description: 'Hacim düşüşü %18' },
        { name: 'Fundamental Strong', contribution: 35, positive: true, description: 'Temel göstergeler güçlü - Karlılık %15' }
      ]
    },
    'TUPRS': {
      symbol: 'TUPRS',
      overall: 65,
      signal: 'SELL',
      factors: [
        { name: 'Resistance Zone', contribution: -40, positive: false, description: 'Direnç bölgesi 52₺ - Güçlü satış baskısı' },
        { name: 'Volume Decrease', contribution: -30, positive: false, description: 'Hacim azalması %32' },
        { name: 'Bearish Pattern', contribution: -20, positive: false, description: 'Ayı formasyonu - Kanatlı işaret' },
        { name: 'Market Stress', contribution: -10, positive: false, description: 'Genel piyasa stresi' }
      ]
    }
  };

  const data = symbolData[selectedSymbol];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-emerald-400';
    if (confidence >= 70) return 'text-cyan-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 80) return 'bg-emerald-500/20 border-emerald-500/30';
    if (confidence >= 70) return 'bg-cyan-500/20 border-cyan-500/30';
    if (confidence >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getSignalColor = (signal: string) => {
    if (signal === 'BUY') return 'bg-green-500';
    if (signal === 'SELL') return 'bg-red-500';
    return 'bg-amber-500';
  };

  return (
    <div className="space-y-6">
      {/* Symbol Selector */}
      <div className="flex gap-3 flex-wrap">
        {Object.keys(symbolData).map((symbol) => (
          <button
            key={symbol}
            onClick={() => setSelectedSymbol(symbol)}
            className={`px-6 py-3 rounded-lg font-bold transition-all border ${
              selectedSymbol === symbol
                ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg scale-105 border-transparent'
                : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
            }`}
          >
            {symbol}
          </button>
        ))}
      </div>

      {/* Overall Confidence */}
      <div className={`rounded-2xl p-6 border ${getConfidenceBg(data.overall)} bg-white shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${getConfidenceColor(data.overall)} bg-slate-100`}>
              {data.overall}%
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{data.symbol}</h3>
              <p className="text-sm text-slate-500">AI Güven Skoru</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg ${getSignalColor(data.signal)} text-white font-bold shadow`}>
            {data.signal}
          </div>
        </div>

        {/* Confidence Progress */}
        <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.overall}%` }}
            transition={{ duration: 1 }}
            className={`h-full ${getConfidenceBg(data.overall).replace('/20', '').replace('border-', 'bg-')}`}
          />
        </div>
      </div>

      {/* Factor Breakdown */}
      <div className="space-y-3">
        <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-purple-500" />
          Faktör Katkı Analizi (SHAP)
        </h4>

        {data.factors.map((factor, idx) => {
          const isPositive = factor.contribution > 0;
          const absContribution = Math.abs(factor.contribution);

          return (
            <motion.div
              key={factor.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {isPositive ? (
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <div className="font-bold text-slate-900">{factor.name}</div>
                    {factor.description && (
                      <div className="text-xs text-slate-500">{factor.description}</div>
                    )}
                  </div>
                </div>
                <div className={`font-bold ${
                  isPositive ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {isPositive ? '+' : ''}{factor.contribution}%
                </div>
              </div>

              {/* Contribution Bar */}
              <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden mt-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${absContribution}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className={`h-full ${
                    isPositive ? 'bg-emerald-500' : 'bg-red-500'
                  } rounded-full`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-cyan-50 rounded-2xl p-6 border border-purple-100">
        <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-amber-500" />
          AI Özet Yorumu
        </h4>
        
        {data.signal === 'BUY' && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
              <div>
                <div className="font-bold text-emerald-700 mb-2">Alım Önerisi (AI Güven: {data.overall}%)</div>
                <p className="text-sm text-slate-600">
                  {data.symbol} için AI algoritmaları güçlü alım sinyali tespit etti. 
                  En önemli faktörler: {data.factors.filter(f => f.positive).map(f => f.name).join(', ')}. 
                  Risk düzeyi düşük, momentum güçlü.
                </p>
              </div>
            </div>
          </div>
        )}

        {data.signal === 'HOLD' && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <div className="font-bold text-amber-700 mb-2">Bekleme Önerisi</div>
                <p className="text-sm text-slate-600">
                  {data.symbol} için mevcut durum belirsiz. Teknik göstergeler karışık sinyal veriyor. 
                  Temel göstergeler güçlü ancak momentum zayıf. Yeni pozisyon açmak yerine mevcut pozisyonları izleyin.
                </p>
              </div>
            </div>
          </div>
        )}

        {data.signal === 'SELL' && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <TrendingDown className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <div className="font-bold text-red-600 mb-2">Satış Önerisi (AI Güven: {data.overall}%)</div>
                <p className="text-sm text-slate-600">
                  {data.symbol} için AI algoritmaları satış sinyali tespit etti. 
                  Risk faktörleri: {data.factors.filter(f => !f.positive).map(f => f.name).join(', ')}. 
                  Direnç seviyelerine yaklaşım var. Stop-loss ayarlayın.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Recommendations */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 mb-1">Hedef</div>
            <div className="text-lg font-bold text-slate-900">
              {data.signal === 'BUY' && '255 ₺'}
              {data.signal === 'HOLD' && 'Konsolide'}
              {data.signal === 'SELL' && '48 ₺'}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 mb-1">Stop-Loss</div>
            <div className="text-lg font-bold text-slate-900">
              {data.signal === 'BUY' && '240 ₺'}
              {data.signal === 'HOLD' && 'N/A'}
              {data.signal === 'SELL' && '52 ₺'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

