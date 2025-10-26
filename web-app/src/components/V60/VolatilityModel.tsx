'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  BarChart3,
  Target,
  Zap,
  Activity
} from 'lucide-react';

interface VolatilityData {
  symbol: string;
  current: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  atr: number;
  stopLoss: number;
  target: number;
  riskReward: number;
  volatilityPercent: number;
}

export default function VolatilityModel() {
  const [selectedSymbol, setSelectedSymbol] = useState('THYAO');

  const volatilityData: Record<string, VolatilityData> = {
    'THYAO': {
      symbol: 'THYAO',
      current: 248.50,
      level: 'HIGH',
      atr: 7.2,
      stopLoss: 241.50,
      target: 260.00,
      riskReward: 1.58,
      volatilityPercent: 2.9
    },
    'AKBNK': {
      symbol: 'AKBNK',
      current: 46.80,
      level: 'MEDIUM',
      atr: 1.5,
      stopLoss: 45.00,
      target: 49.50,
      riskReward: 1.80,
      volatilityPercent: 1.2
    },
    'EREGL': {
      symbol: 'EREGL',
      current: 44.20,
      level: 'LOW',
      atr: 0.8,
      stopLoss: 43.00,
      target: 46.00,
      riskReward: 1.50,
      volatilityPercent: 0.6
    },
    'TUPRS': {
      symbol: 'TUPRS',
      current: 51.30,
      level: 'HIGH',
      atr: 2.1,
      stopLoss: 49.00,
      target: 54.00,
      riskReward: 1.30,
      volatilityPercent: 2.2
    }
  };

  const data = volatilityData[selectedSymbol];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'bg-green-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'HIGH': return 'bg-orange-500';
      case 'EXTREME': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'LOW': return 'Düşük Volatilite';
      case 'MEDIUM': return 'Orta Volatilite';
      case 'HIGH': return 'Yüksek Volatilite';
      case 'EXTREME': return 'Aşırı Volatilite';
      default: return 'Bilinmeyen';
    }
  };

  return (
    <div className="space-y-6">
      {/* Symbol Selector */}
      <div className="grid grid-cols-4 gap-3">
        {Object.keys(volatilityData).map((symbol) => (
          <button
            key={symbol}
            onClick={() => setSelectedSymbol(symbol)}
            className={`p-3 rounded-lg font-bold transition-all border-2 ${
              selectedSymbol === symbol
                ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-transparent scale-105'
                : 'bg-slate-800 text-gray-400 border-slate-700 hover:border-slate-600'
            }`}
          >
            {symbol}
          </button>
        ))}
      </div>

      {/* Volatility Level Card */}
      <div className={`rounded-xl p-6 border-2 ${getLevelColor(data.level)}/20 border-${getLevelColor(data.level).replace('bg-', '')}/30`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-400 mb-1">Mevcut Volatilite</div>
            <div className="text-3xl font-bold text-white">{data.symbol}</div>
          </div>
          <div className={`px-6 py-3 rounded-lg ${getLevelColor(data.level)} text-white font-bold`}>
            {getLevelText(data.level)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-cyan-400">{data.volatilityPercent.toFixed(2)}%</div>
            <div className="text-xs text-gray-400 mt-1">ATR Yüzdesi</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400">{data.atr.toFixed(2)}</div>
            <div className="text-xs text-gray-400 mt-1">ATR Değeri</div>
          </div>
        </div>
      </div>

      {/* Risk Management */}
      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg p-6 border border-orange-500/30">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-orange-400" />
          <h4 className="text-lg font-bold text-white">Dinamik Risk Yönetimi</h4>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <div className="text-xs text-gray-400">Hedef</div>
            </div>
            <div className="text-2xl font-bold text-cyan-400">{data.target.toFixed(2)} ₺</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              <div className="text-xs text-gray-400">Stop-Loss</div>
            </div>
            <div className="text-2xl font-bold text-red-400">{data.stopLoss.toFixed(2)} ₺</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-purple-400" />
              <div className="text-xs text-gray-400">R/R Oranı</div>
            </div>
            <div className="text-2xl font-bold text-purple-400">{data.riskReward.toFixed(2)}</div>
          </div>
        </div>

        {/* Risk/Reward Bar */}
        <div className="mt-4 flex gap-4">
          <div className="flex-1">
            <div className="text-xs text-red-400 mb-1">Risk: {(data.current - data.stopLoss).toFixed(2)} ₺</div>
            <div className="h-3 bg-red-500/30 rounded-full overflow-hidden">
              <div className="h-full bg-red-500" style={{ width: '60%' }} />
            </div>
          </div>
          <div className="flex-1">
            <div className="text-xs text-green-400 mb-1">Ödül: {(data.target - data.current).toFixed(2)} ₺</div>
            <div className="h-3 bg-green-500/30 rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* GARCH Volatility Forecast */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/30">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-cyan-400" />
          GARCH Volatilite Tahmini
        </h4>

        <div className="space-y-3">
          {[
            { period: '1 Gün', volatility: data.volatilityPercent.toFixed(2), color: 'text-cyan-400' },
            { period: '3 Gün', volatility: (data.volatilityPercent * 1.2).toFixed(2), color: 'text-yellow-400' },
            { period: '7 Gün', volatility: (data.volatilityPercent * 1.5).toFixed(2), color: 'text-orange-400' },
            { period: '14 Gün', volatility: (data.volatilityPercent * 1.8).toFixed(2), color: 'text-red-400' }
          ].map((forecast, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <span className="text-gray-300">{forecast.period}</span>
              <span className={`font-bold ${forecast.color}`}>{forecast.volatility}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* ATR-Based Recommendations */}
      <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-6 border border-blue-500/30">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          ATR Tabanlı Öneriler
        </h4>

        <div className="space-y-3">
          {data.volatilityPercent > 2 ? (
            <>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-orange-400 mb-1">Yüksek Volatilite Uyarısı</div>
                  <p className="text-sm text-gray-300">
                    {data.symbol} için yüksek volatilite (%{data.volatilityPercent.toFixed(2)}) tespit edildi. 
                    Pozisyon boyutunu azaltın ve stop-loss seviyesini daraltın.
                  </p>
                </div>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
                <div className="text-sm text-gray-300">
                  <strong className="text-cyan-400">Önerilen Stop-Loss:</strong> {data.stopLoss.toFixed(2)} ₺ (Mevcut fiyattan {((data.current - data.stopLoss) / data.current * 100).toFixed(2)}% aşağı)
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-green-400 mb-1">Düşük Volatilite - Güvenli Bölge</div>
                  <p className="text-sm text-gray-300">
                    {data.symbol} için düşük volatilite görülüyor. Normal pozisyon boyutu ve standart stop-loss uygulanabilir.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Current Price Display */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400 mb-1">Mevcut Fiyat</div>
            <div className="text-3xl font-bold text-white">{data.current.toFixed(2)} ₺</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">Potansiyel Kar</div>
            <div className="text-2xl font-bold text-green-400">
              +{((data.target - data.current) / data.current * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
