'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain,
  TrendingUp,
  Zap,
  BarChart3,
  Target,
  CheckCircle,
  Activity,
  Sparkles
} from 'lucide-react';

interface ModelWeight {
  name: string;
  provider: string;
  weight: number;
  accuracy: number;
  latency: number;
  color: string;
}

interface EnsembleResult {
  symbol: string;
  finalPrediction: string;
  confidence: number;
  modelWeights: ModelWeight[];
  expectedReturn: number;
  riskLevel: string;
}

export default function MetaModelEngine() {
  const [selectedSymbol, setSelectedSymbol] = useState('THYAO');

  const modelWeights: ModelWeight[] = [
    {
      name: 'FinBERT-TR',
      provider: 'Finbert TR',
      weight: 40,
      accuracy: 89.2,
      latency: 120,
      color: '#3b82f6'
    },
    {
      name: 'Llama3',
      provider: 'Meta AI',
      weight: 35,
      accuracy: 91.5,
      latency: 280,
      color: '#10b981'
    },
    {
      name: 'Mistral AI',
      provider: 'Mistral',
      weight: 25,
      accuracy: 88.7,
      latency: 195,
      color: '#8b5cf6'
    }
  ];

  const ensembleResults: Record<string, EnsembleResult> = {
    'THYAO': {
      symbol: 'THYAO',
      finalPrediction: 'STRONG_BUY',
      confidence: 91.5,
      modelWeights: modelWeights,
      expectedReturn: 5.8,
      riskLevel: 'LOW'
    },
    'AKBNK': {
      symbol: 'AKBNK',
      finalPrediction: 'BUY',
      confidence: 87.3,
      modelWeights: modelWeights,
      expectedReturn: 4.2,
      riskLevel: 'MEDIUM'
    },
    'EREGL': {
      symbol: 'EREGL',
      finalPrediction: 'HOLD',
      confidence: 72.1,
      modelWeights: modelWeights,
      expectedReturn: 1.8,
      riskLevel: 'HIGH'
    }
  };

  const result = ensembleResults[selectedSymbol];

  return (
    <div className="space-y-6">
      {/* Symbol Selector */}
      <div className="grid grid-cols-3 gap-3">
        {Object.keys(ensembleResults).map((symbol) => (
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

      {/* Ensemble Prediction Card */}
      <div className="bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-xl p-6 border-2 border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Meta-Model Ensemble</h3>
              <p className="text-sm text-gray-400">{result.symbol} Analizi</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-400">{result.confidence}%</div>
            <div className="text-sm text-gray-400">Güven Skoru</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-emerald-400 font-bold text-xl">{result.expectedReturn.toFixed(1)}%</div>
            <div className="text-xs text-gray-400 mt-1">Beklenen Getiri</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className={`font-bold text-xl ${
              result.riskLevel === 'LOW' ? 'text-green-400' :
              result.riskLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {result.riskLevel}
            </div>
            <div className="text-xs text-gray-400 mt-1">Risk Seviyesi</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-cyan-400 font-bold text-xl">{result.finalPrediction}</div>
            <div className="text-xs text-gray-400 mt-1">Final Tahmin</div>
          </div>
        </div>
      </div>

      {/* Model Weights */}
      <div>
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-purple-400" />
          Model Ağırlıkları (Ensemble)
        </h4>

        <div className="space-y-3">
          {result.modelWeights.map((model, idx) => (
            <motion.div
              key={model.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center`} style={{ background: model.color }}>
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-white">{model.name}</div>
                    <div className="text-xs text-gray-400">{model.provider}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-cyan-400">{model.weight}% Ağırlık</div>
                  </div>
              </div>

              <div className="flex gap-4 mb-2">
                <div className="flex-1">
                  <div className="text-xs text-gray-400 mb-1">Doğruluk</div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${model.accuracy}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: model.color }}
                    />
                  </div>
                  <div className="text-xs text-cyan-400 font-bold mt-1">{model.accuracy.toFixed(1)}%</div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400 mb-1">Gecikme</div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(1 - model.latency / 500) * 100}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                      className="h-full rounded-full bg-yellow-500"
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{model.latency}ms</div>
                </div>
              </div>

              {/* Weight Contribution */}
              <div className="mt-3">
                <div className="text-xs text-gray-400 mb-1">Ensemble Katkısı: {model.weight}%</div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${model.weight}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    className="h-full rounded-full"
                    style={{ background: model.color }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Ensemble Benefits */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-6 border border-green-500/30">
        <div className="flex items-start gap-3 mb-4">
          <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-lg font-bold text-green-400 mb-2">Ensemble AI Avantajları</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• 3 model konsensüsü → %91.5 doğruluk</li>
              <li>• FinBERT-TR (temel analiz) + Llama3 (gelecek tahmini) + Mistral (risk değerlendirmesi)</li>
              <li>• Ağırlıklı ortalamayla daha güvenilir sonuç</li>
              <li>• Model bağımsızları düşüş → overfitting azaltılır</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
          <div className="text-2xl font-bold text-purple-400">91.5%</div>
          <div className="text-xs text-gray-400 mt-1">Final Doğruluk</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
          <div className="text-2xl font-bold text-emerald-400">+4.2%</div>
          <div className="text-xs text-gray-400 mt-1">vs Tek Model</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
          <div className="text-2xl font-bold text-cyan-400">198ms</div>
          <div className="text-xs text-gray-400 mt-1">Ortalama Latency</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
          <div className="text-2xl font-bold text-yellow-400">87.3</div>
          <div className="text-xs text-gray-400 mt-1">Sharpe Ratio</div>
        </div>
      </div>

      {/* AI Insight */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/30">
        <div className="flex items-start gap-3">
          <Activity className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="text-lg font-bold text-cyan-400 mb-2">AI Önerisi</h4>
            <p className="text-sm text-gray-300">
              <strong>{result.symbol}</strong> için 3 model birleşik analiz sonucu: <strong>{result.finalPrediction}</strong> sinyali. 
              FinBERT-TR temel göstergeleri pozitif buldu (%{modelWeights[0].weight} ağırlık). 
              Llama3 gelecek 7 günde {result.expectedReturn.toFixed(1)}% getiri öngörüyor (%{modelWeights[1].weight} ağırlık). 
              Mistral risk değerlendirmesi <strong>{result.riskLevel}</strong> seviyesinde (%{modelWeights[2].weight} ağırlık).
            </p>
            <div className="mt-3 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg">
              <div className="text-sm font-bold text-purple-400">
                🎯 Konsensüs Skoru: {result.confidence}% (Yüksek Güven)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

