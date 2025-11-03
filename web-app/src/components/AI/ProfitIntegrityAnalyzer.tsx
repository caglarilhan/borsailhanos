/**
 * Profit Integrity Analyzer Component
 * v6.0 Profit Intelligence Suite
 */

'use client';

import React, { useMemo } from 'react';
import { analyzeProfitIntegrity, type TradeAnalysis } from '@/lib/profit-integrity-analyzer';
import { Skeleton } from '@/components/UI/Skeleton';
import { formatCurrencyTRY, formatPercent } from '@/lib/formatters';

interface ProfitIntegrityAnalyzerProps {
  trades?: TradeAnalysis[];
  isLoading?: boolean;
}

export function ProfitIntegrityAnalyzer({
  trades = [],
  isLoading,
}: ProfitIntegrityAnalyzerProps) {
  const analysisResult = useMemo(() => {
    if (trades.length === 0) return null;
    return analyzeProfitIntegrity(trades);
  }, [trades]);

  if (isLoading || !analysisResult) {
    return (
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-sm font-semibold text-gray-900 mb-2">📊 Profit Integrity Analyzer</div>
        <Skeleton className="h-40 w-full rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-900">📊 Profit Integrity Analyzer</div>
        <div className="text-xs text-slate-500">{analysisResult.period}</div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-50 rounded p-2">
          <div className="text-[10px] text-slate-600 mb-1">Toplam İşlem</div>
          <div className="text-sm font-bold text-slate-900">{analysisResult.totalTrades}</div>
        </div>
        <div className="bg-slate-50 rounded p-2">
          <div className="text-[10px] text-slate-600 mb-1">Başarı Oranı</div>
          <div className="text-sm font-bold text-green-600">
            {formatPercent(analysisResult.winRate / 100, true, 1)}
          </div>
        </div>
        <div className="bg-slate-50 rounded p-2">
          <div className="text-[10px] text-slate-600 mb-1">Toplam Kâr</div>
          <div className="text-sm font-bold text-blue-600">
            {formatCurrencyTRY(analysisResult.totalProfit)}
          </div>
        </div>
        <div className="bg-slate-50 rounded p-2">
          <div className="text-[10px] text-slate-600 mb-1">Kârlı İşlem</div>
          <div className="text-sm font-bold text-green-600">{analysisResult.profitableTrades}</div>
        </div>
      </div>

      <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded">
        <div className="text-xs font-semibold text-blue-700 mb-1">En İyi Strateji:</div>
        <div className="text-[10px] text-blue-600">
          {analysisResult.bestStrategy.strategy} - {formatCurrencyTRY(analysisResult.bestStrategy.profit)} (%{(analysisResult.bestStrategy.winRate * 100).toFixed(1)} başarı)
        </div>
      </div>

      <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 rounded">
        <div className="text-xs font-semibold text-green-700 mb-1">En İyi Hisse:</div>
        <div className="text-[10px] text-green-600">
          {analysisResult.bestSymbol.symbol} - {formatCurrencyTRY(analysisResult.bestSymbol.profit)} ({analysisResult.bestSymbol.tradeCount} işlem)
        </div>
      </div>

      {analysisResult.recommendations.length > 0 && (
        <div className="mb-3 space-y-1">
          <div className="text-xs font-semibold text-slate-700 mb-1">Öneriler:</div>
          {analysisResult.recommendations.map((rec, idx) => (
            <div key={idx} className="text-xs text-slate-600 bg-slate-50 rounded p-2">
              • {rec}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



