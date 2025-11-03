/**
 * Micro-Alpha Extractor Component
 * v6.0 Profit Intelligence Suite
 */

'use client';

import React, { useMemo } from 'react';
import { extractMicroAlpha, type MicroAlphaInput } from '@/lib/micro-alpha-extractor';
import { Skeleton } from '@/components/UI/Skeleton';
import { formatPercent } from '@/lib/formatters';

interface MicroAlphaExtractorProps {
  symbol: string;
  prices15m?: number[];
  prices30m?: number[];
  volumes15m?: number[];
  volumes30m?: number[];
  isLoading?: boolean;
}

export function MicroAlphaExtractor({
  symbol,
  prices15m = [],
  prices30m = [],
  volumes15m = [],
  volumes30m = [],
  isLoading,
}: MicroAlphaExtractorProps) {
  const alphaResult = useMemo(() => {
    if (prices15m.length === 0 && prices30m.length === 0) return null;

    const input: MicroAlphaInput = {
      symbol,
      prices15m: prices15m.length > 0 ? prices15m : [],
      prices30m: prices30m.length > 0 ? prices30m : [],
      volumes15m: volumes15m.length > 0 ? volumes15m : [],
      volumes30m: volumes30m.length > 0 ? volumes30m : [],
    };

    return extractMicroAlpha(input);
  }, [symbol, prices15m, prices30m, volumes15m, volumes30m]);

  if (isLoading || !alphaResult) {
    return (
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-sm font-semibold text-gray-900 mb-2">📊 Micro-Alpha Extractor</div>
        <Skeleton className="h-24 w-full rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-900">📊 Micro-Alpha Extractor</div>
        <div className="text-xs text-slate-500">{symbol}</div>
      </div>

      <div className="mb-3 px-3 py-2 bg-purple-50 border border-purple-200 rounded">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-purple-700">Günlük Alpha Tahmini:</span>
          <span className={`text-sm font-bold ${
            alphaResult.dailyAlpha > 0 ? 'text-green-700' : 'text-red-700'
          }`}>
            {formatPercent(alphaResult.dailyAlpha / 100, true, 2)}
          </span>
        </div>
        <div className="text-[10px] text-purple-600">
          Güven: %{(alphaResult.confidence * 100).toFixed(0)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-50 rounded p-2">
          <div className="text-[10px] text-slate-600 mb-1">15m Trend</div>
          <div className="text-xs font-bold text-slate-900">
            {alphaResult.trend15m === 'UP' ? '↑' : alphaResult.trend15m === 'DOWN' ? '↓' : '→'} {alphaResult.strength15m.toFixed(0)}%
          </div>
        </div>
        <div className="bg-slate-50 rounded p-2">
          <div className="text-[10px] text-slate-600 mb-1">30m Trend</div>
          <div className="text-xs font-bold text-slate-900">
            {alphaResult.trend30m === 'UP' ? '↑' : alphaResult.trend30m === 'DOWN' ? '↓' : '→'} {alphaResult.strength30m.toFixed(0)}%
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-600 italic border-t border-slate-200 pt-2">
        {alphaResult.explanation}
      </div>
    </div>
  );
}



