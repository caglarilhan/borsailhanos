/**
 * Dynamic Sentiment Arbitrage Component
 * v6.0 Profit Intelligence Suite
 */

'use client';

import React, { useMemo } from 'react';
import { findSentimentArbitrage, getArbitrageColor, type SentimentArbitrageInput } from '@/lib/dynamic-sentiment-arbitrage';
import { Skeleton } from '@/components/UI/Skeleton';
import { formatPercent } from '@/lib/formatters';

interface DynamicSentimentArbitrageProps {
  sector: string;
  symbols?: Array<{
    symbol: string;
    sentiment: { positive: number; negative: number; neutral: number };
    price?: number;
    volatility?: number;
  }>;
  isLoading?: boolean;
}

export function DynamicSentimentArbitrage({
  sector,
  symbols = [],
  isLoading,
}: DynamicSentimentArbitrageProps) {
  const arbitrageResult = useMemo(() => {
    if (symbols.length < 2) return null;

    const input: SentimentArbitrageInput = {
      sector,
      symbols: symbols.map(s => ({
        symbol: s.symbol,
        sentiment: s.sentiment,
        price: s.price || 100,
        volatility: s.volatility || 0.25,
      })),
    };

    return findSentimentArbitrage(input);
  }, [sector, symbols]);

  if (isLoading || !arbitrageResult) {
    return (
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-sm font-semibold text-gray-900 mb-2">💱 Dynamic Sentiment Arbitrage</div>
        <Skeleton className="h-24 w-full rounded" />
      </div>
    );
  }

  const bestOpp = arbitrageResult.bestOpportunity;

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-900">💱 Dynamic Sentiment Arbitrage</div>
        <div className="text-xs text-slate-500">{sector}</div>
      </div>

      {bestOpp ? (
        <>
          <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-green-700">En İyi Fırsat:</span>
              <span className="text-xs font-bold text-green-700">
                {formatPercent(bestOpp.confidence, true, 0)} Güven
              </span>
            </div>
            <div className="text-[10px] text-green-600">
              Long {bestOpp.symbolLong} ↔ Short {bestOpp.symbolShort}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-slate-50 rounded p-2">
              <div className="text-[10px] text-slate-600 mb-1">Sentiment Spread</div>
              <div className="text-sm font-bold text-slate-900">%{bestOpp.sentimentSpread.toFixed(1)}</div>
            </div>
            <div className="bg-slate-50 rounded p-2">
              <div className="text-[10px] text-slate-600 mb-1">Beklenen Yakınsama</div>
              <div className="text-sm font-bold text-slate-900">%{bestOpp.expectedMeanReversion.toFixed(1)}</div>
            </div>
          </div>

          <div className="text-xs text-slate-600 italic border-t border-slate-200 pt-2">
            {bestOpp.explanation}
          </div>
        </>
      ) : (
        <div className="text-xs text-slate-600 italic">
          Bu sektörde sentiment arbitrage fırsatı bulunamadı.
        </div>
      )}
    </div>
  );
}



