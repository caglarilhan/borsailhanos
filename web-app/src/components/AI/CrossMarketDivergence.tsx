/**
 * Cross-Market Divergence Radar Component
 * v6.0 Profit Intelligence Suite
 */

'use client';

import React, { useMemo } from 'react';
import { detectCrossMarketDivergence, type CrossMarketInput } from '@/lib/cross-market-divergence';
import { Skeleton } from '@/components/UI/Skeleton';
import { formatPercent } from '@/lib/formatters';

interface CrossMarketDivergenceProps {
  bistIndex?: number;
  nasdaqIndex?: number;
  sp500Index?: number;
  bistChange?: number;
  nasdaqChange?: number;
  sp500Change?: number;
  isLoading?: boolean;
}

export function CrossMarketDivergence({
  bistIndex = 8500,
  nasdaqIndex = 15000,
  sp500Index = 4500,
  bistChange = 0.5,
  nasdaqChange = 1.2,
  sp500Change = 0.8,
  isLoading,
}: CrossMarketDivergenceProps) {
  const divergenceResult = useMemo(() => {
    const input: CrossMarketInput = {
      bistIndex,
      nasdaqIndex,
      sp500Index,
      bistChange,
      nasdaqChange,
      sp500Change,
      timestamp: new Date().toISOString(),
    };

    return detectCrossMarketDivergence(input);
  }, [bistIndex, nasdaqIndex, sp500Index, bistChange, nasdaqChange, sp500Change]);

  if (isLoading || !divergenceResult) {
    return (
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-sm font-semibold text-gray-900 mb-2">🌍 Cross-Market Divergence Radar</div>
        <Skeleton className="h-32 w-full rounded" />
      </div>
    );
  }

  const div = divergenceResult.divergence;
  const isBullish = div.type === 'BULLISH_DIVERGENCE';
  const isBearish = div.type === 'BEARISH_DIVERGENCE';

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-900">🌍 Cross-Market Divergence Radar</div>
        {div.type !== 'NONE' && (
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            isBullish ? 'bg-green-100 text-green-700 border border-green-300' :
            'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {isBullish ? 'BULLISH' : 'BEARISH'}
          </span>
        )}
      </div>

      {div.type !== 'NONE' ? (
        <>
          <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-blue-700">Divergence Gücü:</span>
              <span className="text-sm font-bold text-blue-700">%{div.strength.toFixed(1)}</span>
            </div>
            <div className="text-[10px] text-blue-600">
              Güven: %{(div.confidence * 100).toFixed(0)}
            </div>
          </div>

          <div className="mb-3">
            <div className="text-xs text-slate-600 mb-1">Önde Gidenler:</div>
            <div className="text-xs font-semibold text-green-700">
              {div.markets.outperforming.join(', ')}
            </div>
            <div className="text-xs text-slate-600 mb-1 mt-2">Geri Kalanlar:</div>
            <div className="text-xs font-semibold text-red-700">
              {div.markets.underperforming.join(', ')}
            </div>
          </div>

          <div className="text-xs text-slate-600 italic border-t border-slate-200 pt-2">
            {div.recommendation}
          </div>
        </>
      ) : (
        <div className="text-xs text-slate-600 italic">
          {divergenceResult.explanation}
        </div>
      )}
    </div>
  );
}



