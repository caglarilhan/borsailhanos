/**
 * Liquidity Flow Tracker Component
 * v6.0 Profit Intelligence Suite
 */

'use client';

import React, { useMemo } from 'react';
import { trackLiquidityFlow, type LiquidityFlowInput } from '@/lib/liquidity-flow-tracker';
import { Skeleton } from '@/components/UI/Skeleton';

interface LiquidityFlowTrackerProps {
  symbol: string;
  volumes?: number[];
  prices?: number[];
  averageVolume?: number;
  isLoading?: boolean;
}

export function LiquidityFlowTracker({
  symbol,
  volumes = [],
  prices = [],
  averageVolume = 1000000,
  isLoading,
}: LiquidityFlowTrackerProps) {
  const flowResult = useMemo(() => {
    if (volumes.length < 10 || prices.length < 10) return null;

    const input: LiquidityFlowInput = {
      symbol,
      volumes,
      prices,
      averageVolume,
    };

    return trackLiquidityFlow(input);
  }, [symbol, volumes, prices, averageVolume]);

  if (isLoading || !flowResult) {
    return (
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-sm font-semibold text-gray-900 mb-2">💧 Liquidity Flow Tracker</div>
        <Skeleton className="h-24 w-full rounded" />
      </div>
    );
  }

  const isInflow = flowResult.flowDirection === 'INFLOW';
  const isOutflow = flowResult.flowDirection === 'OUTFLOW';

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-900">💧 Liquidity Flow Tracker</div>
        {flowResult.hasSmartMoney && (
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            isInflow ? 'bg-green-100 text-green-700 border border-green-300' :
            isOutflow ? 'bg-red-100 text-red-700 border border-red-300' :
            'bg-slate-100 text-slate-700 border border-slate-300'
          }`}>
            {flowResult.flowDirection}
          </span>
        )}
      </div>

      {flowResult.hasSmartMoney ? (
        <>
          <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-blue-700">Akış Gücü:</span>
              <span className="text-sm font-bold text-blue-700">
                {flowResult.flowStrength.toFixed(0)}/100
              </span>
            </div>
            <div className="text-[10px] text-blue-600">
              {flowResult.spikeCount} hacim spike'ı | Güven: %{(flowResult.confidence * 100).toFixed(0)}
            </div>
          </div>

          <div className="text-xs text-slate-600 italic border-t border-slate-200 pt-2">
            {flowResult.explanation}
          </div>
        </>
      ) : (
        <div className="text-xs text-slate-600 italic">
          {flowResult.explanation}
        </div>
      )}
    </div>
  );
}



