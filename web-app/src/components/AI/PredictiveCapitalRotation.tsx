/**
 * Predictive Capital Rotation Component
 * v6.0 Profit Intelligence Suite
 */

'use client';

import React, { useMemo } from 'react';
import { predictCapitalRotation, type SectorRotationInput } from '@/lib/predictive-capital-rotation';
import { Skeleton } from '@/components/UI/Skeleton';
import { formatPercent } from '@/lib/formatters';

interface PredictiveCapitalRotationProps {
  sectors?: Array<{
    sector: string;
    momentum?: number;
    volume?: number;
    priceChange?: number;
    marketCap?: number;
  }>;
  isLoading?: boolean;
}

export function PredictiveCapitalRotation({
  sectors = [],
  isLoading,
}: PredictiveCapitalRotationProps) {
  const rotationResult = useMemo(() => {
    if (sectors.length < 2) return null;

    const input: SectorRotationInput = {
      sectors: sectors.map(s => ({
        sector: s.sector,
        momentum: s.momentum || 50,
        volume: s.volume || 1000000,
        priceChange: s.priceChange || 0,
        marketCap: s.marketCap || 1000000000,
      })),
    };

    return predictCapitalRotation(input);
  }, [sectors]);

  if (isLoading || !rotationResult) {
    return (
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-sm font-semibold text-gray-900 mb-2">🔄 Predictive Capital Rotation</div>
        <Skeleton className="h-24 w-full rounded" />
      </div>
    );
  }

  const hasRotation = rotationResult.opportunities.length > 0;

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-900">🔄 Predictive Capital Rotation</div>
        {hasRotation && (
          <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-300">
            ROTASYON TESPİT
          </span>
        )}
      </div>

      {hasRotation ? (
        <>
          <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-green-700">Rotasyon Gücü:</span>
              <span className="text-sm font-bold text-green-700">
                %{rotationResult.currentTrend.rotationStrength.toFixed(1)}
              </span>
            </div>
            <div className="text-[10px] text-green-600">
              {rotationResult.currentTrend.laggingSector} → {rotationResult.currentTrend.leadingSector}
            </div>
          </div>

          {rotationResult.opportunities.map((opp, idx) => (
            <div key={idx} className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded">
              <div className="text-xs font-semibold text-blue-700 mb-1">Rotasyon Fırsatı:</div>
              <div className="text-[10px] text-blue-600 mb-1">
                {opp.fromSector} → {opp.toSector}
              </div>
              <div className="text-[10px] text-blue-600">
                Güven: %{(opp.confidence * 100).toFixed(0)} | Beklenen: {opp.expectedTimeframe}
              </div>
            </div>
          ))}

          <div className="text-xs text-slate-600 italic border-t border-slate-200 pt-2">
            {rotationResult.explanation}
          </div>
        </>
      ) : (
        <div className="text-xs text-slate-600 italic">
          {rotationResult.explanation}
        </div>
      )}
    </div>
  );
}



