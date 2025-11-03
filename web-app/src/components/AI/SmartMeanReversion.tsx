/**
 * Smart Mean-Reversion Detector Component
 * v6.0 Profit Intelligence Suite
 */

'use client';

import React, { useMemo } from 'react';
import { detectMeanReversion, type MeanReversionInput } from '@/lib/mean-reversion-detector';
import { Skeleton } from '@/components/UI/Skeleton';
import { formatCurrencyTRY } from '@/lib/formatters';

interface SmartMeanReversionProps {
  symbol: string;
  prices?: number[];
  volumes?: number[];
  currentPrice?: number;
  isLoading?: boolean;
}

export function SmartMeanReversion({
  symbol,
  prices = [],
  volumes = [],
  currentPrice = 100,
  isLoading,
}: SmartMeanReversionProps) {
  const reversionResult = useMemo(() => {
    const input: MeanReversionInput = {
      symbol,
      prices: prices.length > 0 ? prices : Array.from({ length: 30 }, (_, i) => currentPrice * (1 + (Math.random() - 0.5) * 0.1)),
      volumes: volumes.length > 0 ? volumes : Array.from({ length: 30 }, () => 1000000),
      currentPrice,
    };

    return detectMeanReversion(input);
  }, [symbol, prices, volumes, currentPrice]);

  if (isLoading || !reversionResult) {
    return (
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-sm font-semibold text-gray-900 mb-2">🔄 Smart Mean-Reversion Detector</div>
        <Skeleton className="h-24 w-full rounded" />
      </div>
    );
  }

  const isAnomaly = reversionResult.isAnomaly;
  const isOversold = reversionResult.anomalyType === 'OVERSOLD';
  const isOverbought = reversionResult.anomalyType === 'OVERBOUGHT';

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-900">🔄 Smart Mean-Reversion Detector</div>
        {isAnomaly && (
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            isOversold ? 'bg-green-100 text-green-700 border border-green-300' :
            'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {isOversold ? 'OVERSOLD' : 'OVERBOUGHT'}
          </span>
        )}
      </div>

      {isAnomaly ? (
        <>
          <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-blue-700">Önerilen İşlem:</span>
              <span className={`text-xs font-bold ${
                isOversold ? 'text-green-700' : 'text-red-700'
              }`}>
                {reversionResult.recommendedAction}
              </span>
            </div>
            <div className="text-[10px] text-blue-600">
              Hedef Fiyat: {formatCurrencyTRY(reversionResult.targetPrice)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-slate-50 rounded p-2">
              <div className="text-[10px] text-slate-600 mb-1">Sapma</div>
              <div className="text-sm font-bold text-slate-900">%{reversionResult.deviationPercent.toFixed(1)}</div>
            </div>
            <div className="bg-slate-50 rounded p-2">
              <div className="text-[10px] text-slate-600 mb-1">Dönüş Olasılığı</div>
              <div className="text-sm font-bold text-slate-900">%{(reversionResult.meanReversionProbability * 100).toFixed(0)}</div>
            </div>
          </div>

          <div className="text-xs text-slate-600 italic border-t border-slate-200 pt-2">
            {reversionResult.explanation}
          </div>
        </>
      ) : (
        <div className="text-xs text-slate-600 italic">
          {reversionResult.explanation}
        </div>
      )}
    </div>
  );
}



