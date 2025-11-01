'use client';

import React from 'react';

interface MTFHeatmapProps {
  signals?: Array<{
    horizon: string;
    signal: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
  }>;
}

export function MTFHeatmap({ signals = [] }: MTFHeatmapProps) {
  // Default signals if not provided
  const defaultSignals = signals.length > 0 ? signals : [
    { horizon: '1H', signal: 'BUY' as const, confidence: 0.83 },
    { horizon: '4H', signal: 'BUY' as const, confidence: 0.85 },
    { horizon: '1D', signal: 'BUY' as const, confidence: 0.88 }
  ];

  const horizons = ['1H', '4H', '1D'];
  const horizonMap = new Map(defaultSignals.map(s => [s.horizon, s]));

  // Calculate consistency
  const signalsForHorizons = horizons.map(h => horizonMap.get(h)).filter(Boolean);
  const buyCount = signalsForHorizons.filter(s => s?.signal === 'BUY').length;
  const sellCount = signalsForHorizons.filter(s => s?.signal === 'SELL').length;
  const holdCount = signalsForHorizons.filter(s => s?.signal === 'HOLD').length;
  const consistency = signalsForHorizons.length > 0 
    ? Math.round((Math.max(buyCount, sellCount, holdCount) / signalsForHorizons.length) * 100)
    : 0;
  const isConsistent = consistency >= 67; // 2/3 or more

  const getSignalColor = (signal: string) => {
    if (signal === 'BUY') return { bg: '#10b981', text: '#ffffff' };
    if (signal === 'SELL') return { bg: '#ef4444', text: '#ffffff' };
    return { bg: '#fbbf24', text: '#ffffff' };
  };

  const getTrendIcon = (signal: string) => {
    if (signal === 'BUY') return '↑';
    if (signal === 'SELL') return '↓';
    return '→';
  };

  return (
    <div className="bg-white rounded-lg p-4 border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-900">Multi-Timeframe Analiz</div>
        <div className={`text-xs px-2 py-1 rounded font-semibold ${
          isConsistent ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
        }`}>
          Tutarlılık: {consistency}%
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {horizons.map((horizon) => {
          const signal = horizonMap.get(horizon);
          const color = signal ? getSignalColor(signal.signal) : { bg: '#e5e7eb', text: '#6b7280' };
          const icon = signal ? getTrendIcon(signal.signal) : '—';
          const conf = signal ? Math.round(signal.confidence * 100) : 0;
          return (
            <div
              key={horizon}
              className="p-3 rounded-lg text-center border-2"
              style={{ backgroundColor: color.bg + '20', borderColor: color.bg, color: color.bg }}
            >
              <div className="text-xs font-semibold mb-1">{horizon}</div>
              <div className="text-lg font-bold">{icon}</div>
              <div className="text-xs font-semibold mt-1">{signal?.signal || '—'}</div>
              <div className="text-[10px] mt-1 opacity-80">{conf}%</div>
            </div>
          );
        })}
      </div>

      {/* Consistency Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-700">Tutarlılık Barı</span>
          <span className="font-semibold text-slate-900">{Math.max(buyCount, sellCount, holdCount)}/{signalsForHorizons.length}</span>
        </div>
        <div className="h-2 bg-slate-200 rounded overflow-hidden">
          <div
            className="h-2 rounded transition-all"
            style={{
              width: `${consistency}%`,
              backgroundColor: isConsistent ? '#10b981' : '#fbbf24'
            }}
          />
        </div>
      </div>

      {/* Yön Değişimi Simgesi */}
      {!isConsistent && (
        <div className="bg-amber-50 rounded p-2 border border-amber-200 text-xs text-amber-800">
          ⚠️ Yön değişimi uyarısı: Farklı timeframe'lerde tutarsız sinyaller
        </div>
      )}

      {/* Trend Reversal Indicator */}
      {buyCount > 0 && sellCount > 0 && (
        <div className="mt-2 bg-red-50 rounded p-2 border border-red-200 text-xs text-red-800">
          🔄 Trend reversal potansiyeli: Hem BUY hem SELL sinyalleri mevcut
        </div>
      )}
    </div>
  );
}

