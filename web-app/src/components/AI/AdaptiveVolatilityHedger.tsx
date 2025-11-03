/**
 * Adaptive Volatility Hedger Component
 * v6.0 Profit Intelligence Suite
 */

'use client';

import React, { useMemo } from 'react';
import { calculateAdaptiveHedge, getHedgeColor, type PortfolioHedgeInput } from '@/lib/adaptive-volatility-hedger';
import { Skeleton } from '@/components/UI/Skeleton';
import { formatCurrencyTRY, formatPercent } from '@/lib/formatters';

interface AdaptiveVolatilityHedgerProps {
  portfolio?: Array<{
    symbol: string;
    weight: number;
    beta?: number;
    volatility?: number;
    sector?: string;
  }>;
  marketVolatility?: number;
  totalEquity?: number;
  riskTolerance?: 'low' | 'medium' | 'high';
  isLoading?: boolean;
}

export function AdaptiveVolatilityHedger({
  portfolio = [],
  marketVolatility = 0.25,
  totalEquity = 100000,
  riskTolerance = 'medium',
  isLoading,
}: AdaptiveVolatilityHedgerProps) {
  const hedgeResult = useMemo(() => {
    if (portfolio.length === 0) return null;

    const input: PortfolioHedgeInput = {
      portfolio: portfolio.map(p => ({
        symbol: p.symbol,
        weight: p.weight,
        beta: p.beta || 1.0,
        volatility: p.volatility || 0.25,
        sector: p.sector || 'Genel',
      })),
      marketVolatility,
      totalEquity,
      riskTolerance,
    };

    return calculateAdaptiveHedge(input);
  }, [portfolio, marketVolatility, totalEquity, riskTolerance]);

  if (isLoading || !hedgeResult) {
    return (
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-sm font-semibold text-gray-900 mb-2">🛡️ Adaptive Volatility Hedger</div>
        <Skeleton className="h-24 w-full rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-900">🛡️ Adaptive Volatility Hedger</div>
        {hedgeResult.hedgeNeeded && (
          <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
            HEDGE GEREKLİ
          </span>
        )}
      </div>

      {/* Portfolio Metrics */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-50 rounded p-2">
          <div className="text-xs text-slate-600 mb-1">Portföy Beta</div>
          <div className="text-sm font-bold text-slate-900">{hedgeResult.portfolioBeta.toFixed(2)}</div>
        </div>
        <div className="bg-slate-50 rounded p-2">
          <div className="text-xs text-slate-600 mb-1">Delta Risk</div>
          <div className={`text-sm font-bold ${hedgeResult.portfolioDelta > 0.25 ? 'text-red-600' : 'text-green-600'}`}>
            {formatPercent(hedgeResult.portfolioDelta, true, 1)}
          </div>
        </div>
      </div>

      {/* Hedge Coverage */}
      {hedgeResult.hedgeNeeded && (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-red-700">Toplam Hedge Kapsamı:</span>
            <span className="text-sm font-bold text-red-700">
              {formatPercent(hedgeResult.hedgeCoverage / 100, true, 1)}
            </span>
          </div>
          <div className="text-[10px] text-red-600">
            {formatCurrencyTRY(hedgeResult.totalHedgeAmount)}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="space-y-2 mb-3">
        {hedgeResult.recommendations.map((rec, idx) => {
          if (rec.type === 'NONE') return null;
          
          const color = getHedgeColor(rec.type);
          return (
            <div key={idx} className="border rounded p-2" style={{ borderColor: color }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold" style={{ color }}>
                  {rec.instrument}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  rec.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                  rec.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {rec.priority}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Tutar:</span>
                <span className="font-bold text-slate-900">{formatCurrencyTRY(rec.amount)}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">{rec.explanation}</div>
            </div>
          );
        })}
      </div>

      {!hedgeResult.hedgeNeeded && (
        <div className="text-xs text-slate-600 italic border-t border-slate-200 pt-2">
          {hedgeResult.recommendations[0]?.explanation}
        </div>
      )}
    </div>
  );
}



