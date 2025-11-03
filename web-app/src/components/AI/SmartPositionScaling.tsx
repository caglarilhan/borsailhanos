/**
 * Smart Position Scaling Component
 * v6.0 Profit Intelligence Suite
 */

'use client';

import React, { useMemo } from 'react';
import { calculateSmartPositionScaling, type PositionScalingInput } from '@/lib/smart-position-scaling';
import { Skeleton } from '@/components/UI/Skeleton';
import { formatPercent, formatCurrencyTRY } from '@/lib/formatters';

interface SmartPositionScalingProps {
  symbol: string;
  basePosition?: number; // Base position %
  currentVolatility?: number;
  averageVolatility?: number;
  aiConfidence?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'aggressive';
  portfolioEquity?: number;
  isLoading?: boolean;
}

export function SmartPositionScaling({
  symbol,
  basePosition = 5.0,
  currentVolatility = 0.25,
  averageVolatility = 0.20,
  aiConfidence = 0.85,
  riskLevel = 'medium',
  portfolioEquity = 100000,
  isLoading,
}: SmartPositionScalingProps) {
  const scalingResult = useMemo(() => {
    const input: PositionScalingInput = {
      symbol,
      basePosition,
      currentVolatility,
      averageVolatility,
      aiConfidence,
      riskLevel,
      portfolioEquity,
    };

    return calculateSmartPositionScaling(input);
  }, [symbol, basePosition, currentVolatility, averageVolatility, aiConfidence, riskLevel, portfolioEquity]);

  if (isLoading || !scalingResult) {
    return (
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-sm font-semibold text-gray-900 mb-2">📏 Smart Position Scaling</div>
        <Skeleton className="h-20 w-full rounded" />
      </div>
    );
  }

  const isIncreased = scalingResult.scaleFactor > 1;
  const isDecreased = scalingResult.scaleFactor < 1;

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-900">📏 Smart Position Scaling</div>
        <div className="text-xs text-slate-500">{symbol}</div>
      </div>

      {/* Position Comparison */}
      <div className="mb-4">
        <div className="flex items-end gap-2 mb-2">
          <div className="text-xs text-slate-600">Orijinal:</div>
          <div className="text-lg font-bold text-slate-700">{formatPercent(scalingResult.originalPosition / 100, true, 1)}</div>
          <div className="text-xs text-slate-500 mb-1">→</div>
          <div className={`text-lg font-bold ${isIncreased ? 'text-green-600' : isDecreased ? 'text-red-600' : 'text-slate-700'}`}>
            {formatPercent(scalingResult.scaledPosition / 100, true, 1)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            isIncreased ? 'bg-green-100 text-green-700' :
            isDecreased ? 'bg-red-100 text-red-700' :
            'bg-slate-100 text-slate-700'
          }`}>
            {scalingResult.scaleFactor >= 1 ? '+' : ''}{((scalingResult.scaleFactor - 1) * 100).toFixed(0)}%
          </span>
          <span className="text-xs text-slate-600">
            Ölçeklenmiş
          </span>
        </div>
      </div>

      {/* Adjustments */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-50 rounded p-2">
          <div className="text-xs text-slate-600 mb-1">Volatilite Ayarı</div>
          <div className={`text-sm font-bold ${scalingResult.volatilityAdjustment < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {scalingResult.volatilityAdjustment >= 0 ? '+' : ''}{scalingResult.volatilityAdjustment.toFixed(1)}%
          </div>
        </div>
        <div className="bg-slate-50 rounded p-2">
          <div className="text-xs text-slate-600 mb-1">Güven Ayarı</div>
          <div className={`text-sm font-bold ${scalingResult.confidenceAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {scalingResult.confidenceAdjustment >= 0 ? '+' : ''}{scalingResult.confidenceAdjustment.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Recommended Allocation */}
      <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-700">Önerilen Tahsis:</span>
          <span className="text-sm font-bold text-blue-700">
            {formatCurrencyTRY(scalingResult.recommendedAllocation)}
          </span>
        </div>
        <div className="text-[10px] text-blue-600 mt-1">
          Portföyün %{scalingResult.scaledPosition.toFixed(1)}'i
        </div>
      </div>

      {/* Warning */}
      {scalingResult.warning && (
        <div className="mb-3 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
          ⚠️ {scalingResult.warning}
        </div>
      )}

      {/* Explanation */}
      <div className="text-xs text-slate-600 italic border-t border-slate-200 pt-2">
        {scalingResult.explanation}
      </div>
    </div>
  );
}



