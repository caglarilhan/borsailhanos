'use client';

import React, { useMemo } from 'react';

interface CorrelationPair {
  symbol1: string;
  symbol2: string;
  correlation: number; // -1.0 to +1.0
}

interface CorrelationHeatmapProps {
  pairs?: CorrelationPair[];
  threshold?: number; // Default 0.8 for pair trading
}

export function CorrelationHeatmap({ 
  pairs = [],
  threshold = 0.8
}: CorrelationHeatmapProps) {
  // Generate demo pairs if not provided
  const defaultPairs: CorrelationPair[] = useMemo(() => {
    if (pairs.length > 0) return pairs;
    const symbols = ['THYAO', 'AKBNK', 'GARAN', 'EREGL', 'ISCTR', 'TUPRS'];
    const out: CorrelationPair[] = [];
    for (let i = 0; i < symbols.length; i++) {
      for (let j = i + 1; j < symbols.length; j++) {
        // Seeded correlation (SSR-safe)
        const seed = (symbols[i].charCodeAt(0) + symbols[j].charCodeAt(0)) % 100;
        const r = seed < 50 ? (seed / 100) - 0.5 : (seed / 100) + 0.3;
        const normalized = Math.max(-1, Math.min(1, r));
        out.push({ symbol1: symbols[i], symbol2: symbols[j], correlation: normalized });
      }
    }
    return out;
  }, [pairs]);

  // Find pair trading opportunities
  const pairTrades = useMemo(() => {
    return defaultPairs.filter(p => Math.abs(p.correlation) >= threshold);
  }, [defaultPairs, threshold]);

  const getCorrelationColor = (corr: number) => {
    const abs = Math.abs(corr);
    if (abs >= threshold) {
      return corr >= 0 
        ? { bg: '#10b981', text: '#ffffff', intensity: abs }
        : { bg: '#ef4444', text: '#ffffff', intensity: abs };
    }
    return { bg: '#e5e7eb', text: '#6b7280', intensity: abs };
  };

  const getCorrelationLabel = (corr: number) => {
    if (Math.abs(corr) >= threshold) {
      return corr >= 0 ? 'Güçlü Pozitif' : 'Güçlü Negatif';
    }
    if (Math.abs(corr) >= 0.5) {
      return 'Orta';
    }
    return 'Zayıf';
  };

  return (
    <div className="bg-white rounded-lg p-4 border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-900">Korelasyon Heatmap</div>
        <div className="text-xs text-slate-600">Eşik: |r| ≥ {threshold}</div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3 max-h-60 overflow-auto">
        {defaultPairs.map((pair, idx) => {
          const color = getCorrelationColor(pair.correlation);
          const label = getCorrelationLabel(pair.correlation);
          const isPairTrade = Math.abs(pair.correlation) >= threshold;
          return (
            <div
              key={idx}
              className={`p-2 rounded border-2 transition-all ${
                isPairTrade ? 'border-purple-300 bg-purple-50' : 'border-slate-200'
              }`}
              style={{
                backgroundColor: isPairTrade ? color.bg + '20' : color.bg + '10',
                borderColor: color.bg
              }}
              title={`${pair.symbol1} ↔ ${pair.symbol2}, 7g korelasyon: ${pair.correlation.toFixed(2)} (${pair.correlation >= 0 ? '+' : ''}${(pair.correlation * 100).toFixed(0)}%) — normalize edilmiş: -1.00 ile +1.00 arası`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-semibold text-slate-900">
                  {pair.symbol1} ↔ {pair.symbol2}
                </div>
                {isPairTrade && (
                  <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-purple-600 text-white font-bold">
                    Pair Trade
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div 
                  className="text-sm font-bold"
                  style={{ color: color.bg }}
                  title={`Korelasyon değeri: ${pair.correlation.toFixed(2)} (normalize edilmiş: -1.00 ile +1.00 arası)`}
                >
                  {pair.correlation.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-600">{label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pair Trading Opportunities */}
      {pairTrades.length > 0 && (
        <div className="mt-3 bg-purple-50 rounded p-3 border border-purple-200">
          <div className="text-xs font-semibold text-purple-900 mb-2">
            🎯 Pair Trade Adayları (|r| ≥ {threshold})
          </div>
          <div className="space-y-1">
            {pairTrades.slice(0, 3).map((pair, idx) => (
              <div key={idx} className="text-xs text-purple-800">
                • {pair.symbol1} ↔ {pair.symbol2}: {pair.correlation.toFixed(2)} ({pair.correlation >= 0 ? '+' : ''}{(pair.correlation * 100).toFixed(0)}%)
                {pair.correlation >= 0 ? ' (pozitif)' : ' (negatif)'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

