/**
 * Alpha Pulse Radar Component
 * v6.0 Profit Intelligence Suite
 * 
 * Displays pre-momentum pulse detection (1-3 minutes ahead)
 */

'use client';

import React, { useMemo } from 'react';
import { detectAlphaPulse, getPulseColor, getPulseLabel, type AlphaPulseInput } from '@/lib/alpha-pulse-engine';
import { Skeleton } from '@/components/UI/Skeleton';
import { formatPercent } from '@/lib/formatters';

interface AlphaPulseRadarProps {
  symbol: string;
  prices?: number[]; // Son 60 dakika fiyatları
  volumes?: number[]; // Son 60 dakika hacimleri
  timestamps?: string[];
  isLoading?: boolean;
}

export function AlphaPulseRadar({ symbol, prices, volumes, timestamps, isLoading }: AlphaPulseRadarProps) {
  const pulseResult = useMemo(() => {
    if (!prices || prices.length < 10) return null;

    const input: AlphaPulseInput = {
      symbol,
      prices,
      volumes: volumes || prices.map(() => 1), // Default volume if not provided
      timestamps: timestamps || prices.map((_, i) => new Date(Date.now() - (prices.length - i) * 60000).toISOString()),
    };

    return detectAlphaPulse(input);
  }, [symbol, prices, volumes, timestamps]);

  if (isLoading || !pulseResult) {
    return (
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-sm font-semibold text-gray-900 mb-2">⚡ Alpha Pulse Engine</div>
        <Skeleton className="h-24 w-full rounded" />
      </div>
    );
  }

  const color = getPulseColor(pulseResult.pulseStrength, pulseResult.direction);
  const label = getPulseLabel(pulseResult.pulseStrength);

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-900">⚡ Alpha Pulse Engine</div>
        <div className="text-xs text-slate-500">{symbol}</div>
      </div>

      {/* Pulse Strength */}
      <div className="mb-4">
        <div className="flex items-end gap-2 mb-2">
          <div className="text-3xl font-bold" style={{ color }}>
            {pulseResult.pulseStrength.toFixed(1)}
          </div>
          <div className="text-sm text-slate-600 mb-1">/100</div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-1 rounded text-xs font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            {label}
          </span>
          {pulseResult.timeToPulse > 0 && (
            <span className="text-xs text-slate-600">
              ⏱️ ~{pulseResult.timeToPulse.toFixed(1)} dk
            </span>
          )}
        </div>
      </div>

      {/* Direction & Action */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-slate-50 rounded p-2">
          <div className="text-xs text-slate-600 mb-1">Yön</div>
          <div className={`text-sm font-bold ${
            pulseResult.direction === 'UP' ? 'text-green-600' :
            pulseResult.direction === 'DOWN' ? 'text-red-600' :
            'text-amber-600'
          }`}>
            {pulseResult.direction === 'UP' ? '↑ Yükseliş' :
             pulseResult.direction === 'DOWN' ? '↓ Düşüş' :
             '→ Nötr'}
          </div>
        </div>
        <div className="bg-slate-50 rounded p-2">
          <div className="text-xs text-slate-600 mb-1">Aksiyon</div>
          <div className={`text-sm font-bold ${
            pulseResult.recommendedAction === 'BUY' ? 'text-green-600' :
            pulseResult.recommendedAction === 'SELL' ? 'text-red-600' :
            'text-slate-600'
          }`}>
            {pulseResult.recommendedAction}
          </div>
        </div>
      </div>

      {/* Potential Alpha */}
      {pulseResult.potentialAlpha > 0 && (
        <div className="mb-3 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-700 font-semibold">Potansiyel Alpha Avantajı:</span>
            <span className="text-sm font-bold text-emerald-700">
              +{formatPercent(pulseResult.potentialAlpha / 100, true, 2)}
            </span>
          </div>
          <div className="text-[10px] text-emerald-600 mt-1">
            Erken giriş için tahmini kazanç avantajı
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${pulseResult.pulseStrength}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>

      {/* Explanation */}
      <div className="text-xs text-slate-600 italic border-t border-slate-200 pt-2">
        {pulseResult.explanation}
      </div>

      {/* Confidence */}
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-slate-500">Güven:</span>
        <span className="font-semibold text-slate-700">
          %{(pulseResult.confidence * 100).toFixed(0)}
        </span>
      </div>
    </div>
  );
}



