'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Zap,
  BarChart3,
  Activity
} from 'lucide-react';

interface AISignal {
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD' | 'STRONG_BUY' | 'STRONG_SELL';
  confidence: number;
  comment: string;
  factors: string[];
  nextAction: string;
}

export default function CognitiveAI() {
  const [selectedSymbol, setSelectedSymbol] = useState('THYAO');

  const aiSignals: Record<string, AISignal> = {
    'THYAO': {
      symbol: 'THYAO',
      signal: 'STRONG_BUY',
      confidence: 87,
      comment: 'THYAO\'da güçlü momentum sinyali tespit edildi. RSI 71 seviyesinde - aşırı alım bölgesine yakın. Son 3 günde %12.5 yükseliş görülüyor. Hacim ortalamanın 1.8 katı. MACD kesişimi pozitif alan. Destek seviyesi 240₺ güçlü. Hedef: 255₺.',
      factors: ['RSI 71 - Güçlü momentum', 'Hacim artışı %180', 'MACD pozitif kesişim', 'Destek 240₺ güçlü'],
      nextAction: 'Kısa vadede 255₺ hedef. Stop-loss 240₺ altına indirmek gerekir. Pozitif trend devam ediyor.'
    },
    'AKBNK': {
      symbol: 'AKBNK',
      signal: 'BUY',
      confidence: 75,
      comment: 'AKBNK\'da dengeli bir yükseliş trendi başladı. Banking endeksi %3.2 pozitif. P/E oranı 8.5 - değer seviyesi. Temettü verimi %4.2 cazip. RSI 58 - henüz aşırı alım bölgesine gelmedi. Hacim normal seviyede. Destek 45₺, direnç 48₺.',
      factors: ['Banking endeksi +%3.2', 'P/E 8.5 (değer)', 'RSI 58 dengeli', 'Temettü verimi %4.2'],
      nextAction: 'Orta vadeli pozisyon açılabilir. 48₺ hedef, stop-loss 44₺. Bankacılık sektörü güçlü.'
    },
    'EREGL': {
      symbol: 'EREGL',
      signal: 'HOLD',
      confidence: 68,
      comment: 'EREGL\'de karışık sinyal var. Momentum kaybı görülüyor (RSI 45). Temel göstergeler güçlü - karlılık %15. Hacim düşüşü %18. Destek seviyesi 42₺ zayıf. Teknik olarak "Bekleme" modunda.',
      factors: ['Momentum kaybı (RSI 45)', 'Hacim düşüşü %18', 'Karlılık güçlü (%15)', 'Destek zayıf'],
      nextAction: 'Yeni pozisyon açmak için erken. Mevcut pozisyonları koruyun. Teknik iyileşme bekleyin.'
    },
    'TUPRS': {
      symbol: 'TUPRS',
      signal: 'SELL',
      confidence: 82,
      comment: 'TUPRS\'de satış sinyali güçlü. Direnç bölgesi 52₺\'de ciddi satış baskısı var. Hacim düşüşü %32. Ayı formasyonu (bearish pattern) tespit edildi. RSI 38 - aşırı satım yaklaşıyor. Genel piyasa stresi mevcut.',
      factors: ['Direnç 52₺ güçlü', 'Hacim düşüşü %32', 'Ayı formasyonu', 'Piyasa stresi'],
      nextAction: 'Kısa pozisyon veya hedging öneriliyor. Stop-loss 52₺ üstü. Yeni alım yerine riskten kaçın.'
    },
    'SISE': {
      symbol: 'SISE',
      signal: 'BUY',
      confidence: 72,
      comment: 'SISE\'de olumlu yükseliş başlıyor. RSI 52 seviyesinde - yukarı yönlü hareket. Hacim artışı %25. İnşaat endeksi %1.9 pozitif. Destek 38₺ güçlü. Kısa vade fırsat.',
      factors: ['RSI 52 yukarı', 'Hacim +%25', 'İnşaat endeksi +%1.9', 'Destek 38₺ güçlü'],
      nextAction: 'Kısa vadeli alım öneriliyor. Hedef 42₺, stop-loss 37₺. İnşaat sektörü canlanıyor.'
    }
  };

  const signal = aiSignals[selectedSymbol];

  const getSignalColor = (signalType: string) => {
    switch (signalType) {
      case 'STRONG_BUY': return 'bg-green-500';
      case 'BUY': return 'bg-emerald-500';
      case 'HOLD': return 'bg-amber-500';
      case 'SELL': return 'bg-red-500';
      case 'STRONG_SELL': return 'bg-red-700';
      default: return 'bg-gray-500';
    }
  };

  const getSignalIcon = (signalType: string) => {
    switch (signalType) {
      case 'STRONG_BUY':
      case 'BUY':
        return <TrendingUp className="w-6 h-6" />;
      case 'SELL':
      case 'STRONG_SELL':
        return <TrendingDown className="w-6 h-6" />;
      default:
        return <AlertCircle className="w-6 h-6" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-emerald-400';
    if (confidence >= 70) return 'text-cyan-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Symbol Selector */}
      <div className="grid grid-cols-3 gap-3">
        {Object.keys(aiSignals).map((symbol) => (
          <button
            key={symbol}
            onClick={() => setSelectedSymbol(symbol)}
            className={`p-4 rounded-lg font-bold transition-all border-2 ${
              selectedSymbol === symbol
                ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-transparent scale-105'
                : 'bg-slate-800 text-gray-400 border-slate-700 hover:border-slate-600'
            }`}
          >
            {symbol}
          </button>
        ))}
      </div>

      {/* Main Signal Card */}
      <div className="bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-xl p-6 border-2 border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white ${getSignalColor(signal.signal)}`}>
              {getSignalIcon(signal.signal)}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{signal.symbol}</h3>
              <p className="text-sm text-gray-400">AI Analiz Sinyali</p>
            </div>
          </div>
          <div className={`px-6 py-3 rounded-lg ${getSignalColor(signal.signal)} text-white font-bold text-lg`}>
            {signal.signal.replace('_', ' ')}
          </div>
        </div>

        {/* Confidence Score */}
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-400">AI Güven Skoru</span>
            <span className={`font-bold text-lg ${getConfidenceColor(signal.confidence)}`}>
              {signal.confidence}%
            </span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${signal.confidence}%` }}
              transition={{ duration: 1 }}
              className={`h-full ${
                signal.confidence >= 80 ? 'bg-emerald-500' :
                signal.confidence >= 70 ? 'bg-cyan-500' :
                'bg-yellow-500'
              } rounded-full`}
            />
          </div>
        </div>
      </div>

      {/* Cognitive AI Comment */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/30">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="w-6 h-6 text-cyan-400" />
          <h4 className="text-lg font-bold text-white">AI Yorumu</h4>
        </div>
        <p className="text-base text-gray-300 leading-relaxed">
          {signal.comment}
        </p>
      </div>

      {/* Key Factors */}
      <div>
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-purple-400" />
          Kritik Faktörler
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {signal.factors.map((factor, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm text-gray-300">{factor}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Next Action */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-lg p-6 border border-yellow-500/30">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-yellow-400 mb-2">Önerilen Aksiyon</h4>
            <p className="text-base text-gray-300 leading-relaxed">
              {signal.nextAction}
            </p>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/30">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-emerald-400" />
          <h4 className="text-lg font-bold text-white">Risk Değerlendirmesi</h4>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Yön Riski</span>
            <span className={signal.confidence >= 80 ? 'text-emerald-400 font-bold' : 'text-yellow-400 font-bold'}>
              {signal.confidence >= 80 ? 'Düşük' : signal.confidence >= 60 ? 'Orta' : 'Yüksek'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Volatilite</span>
            <span className="text-cyan-400 font-bold">
              {signal.symbol === 'THYAO' ? 'Yüksek (%2.8)' : signal.symbol === 'TUPRS' ? 'Orta (%1.5)' : 'Düşük (%0.9)'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Portföy Uyumu</span>
            <span className="text-purple-400 font-bold">
              {signal.signal.includes('BUY') ? 'Pozitif' : signal.signal.includes('SELL') ? 'Negatif' : 'Nötr'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

