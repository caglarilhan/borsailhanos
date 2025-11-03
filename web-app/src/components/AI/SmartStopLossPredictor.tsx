/**
 * Smart Stop-Loss Predictor Component
 * v6.0 Profit Intelligence Suite
 */

'use client';

import React, { useMemo } from 'react';
import { predictSmartStopLoss, type StopLossInput } from '@/lib/smart-stop-loss-predictor';
import { Skeleton } from '@/components/UI/Skeleton';
import { formatCurrencyTRY, formatPercent } from '@/lib/formatters';

interface SmartStopLossPredictorProps {
  symbol: string;
  currentPrice?: number;
  entryPrice?: number;
  volatility?: number;
  historicalVolatility?: number[];
  aiConfidence?: number;
  timeframe?: '5m' | '15m' | '30m' | '1h' | '4h' | '1d';
  riskTolerance?: 'low' | 'medium' | 'high';
  isLoading?: boolean;
}

export function SmartStopLossPredictor({
  symbol,
  currentPrice = 100,
  entryPrice = 100,
  volatility = 0.25,
  historicalVolatility = [],
  aiConfidence = 0.85,
  timeframe = '1h',
  riskTolerance = 'medium',
  isLoading,
}: SmartStopLossPredictorProps) {
  const stopLossResult = useMemo(() => {
    const input: StopLossInput = {
      symbol,
      currentPrice,
      entryPrice,
      volatility,
      historicalVolatility: historicalVolatility.length > 0 ? historicalVolatility : [volatility],
      aiConfidence,
      timeframe,
      riskTolerance,
    };

    return predictSmartStopLoss(input);
  }, [symbol, currentPrice, entryPrice, volatility, historicalVolatility, aiConfidence, timeframe, riskTolerance]);

  if (isLoading || !stopLossResult) {
    return (
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-sm font-semibold text-gray-900 mb-2">🧮 Smart Stop-Loss Predictor</div>
        <Skeleton className="h-28 w-full rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-900">🧮 Smart Stop-Loss Predictor</div>
        <div className="text-xs text-slate-500">{symbol}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-red-50 border border-red-200 rounded p-2">
          <div className="text-xs text-red-600 mb-1">Stop-Loss</div>
          <div className="text-sm font-bold text-red-700">{formatCurrencyTRY(stopLossResult.recommendedStopLoss)}</div>
          <div className="text-[10px] text-red-600">-{formatPercent(stopLossResult.stopLossPercentage / 100, true, 2)}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded p-2">
          <div className="text-xs text-green-600 mb-1">Take-Profit</div>
          <div className="text-sm font-bold text-green-700">{formatCurrencyTRY(stopLossResult.takeProfit)}</div>
          <div className="text-[10px] text-green-600">+{formatPercent(stopLossResult.takeProfitPercentage / 100, true, 2)}</div>
        </div>
      </div>

      <div className="mb-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600">Risk/Getiri:</span>
          <span className="text-sm font-bold text-slate-900">1:{stopLossResult.riskRewardRatio.toFixed(1)}</span>
        </div>
      </div>

      {stopLossResult.warning && (
        <div className="mb-3 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
          ⚠️ {stopLossResult.warning}
        </div>
      )}

      <div className="text-xs text-slate-600 italic border-t border-slate-200 pt-2">
        {stopLossResult.explanation}
      </div>
    </div>
  );
}
