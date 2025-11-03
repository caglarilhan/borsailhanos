/**
 * Institutional Footprint AI Component
 * v6.0 Profit Intelligence Suite
 */

'use client';

import React, { useMemo } from 'react';
import { detectInstitutionalFootprint, type InstitutionalInput } from '@/lib/institutional-footprint';
import { Skeleton } from '@/components/UI/Skeleton';

interface InstitutionalFootprintProps {
  symbol: string;
  prices?: number[];
  volumes?: number[];
  timestamps?: string[];
  averageVolume?: number;
  isLoading?: boolean;
}

export function InstitutionalFootprint({
  symbol,
  prices = [],
  volumes = [],
  timestamps = [],
  averageVolume = 1000000,
  isLoading,
}: InstitutionalFootprintProps) {
  const footprintResult = useMemo(() => {
    if (prices.length < 10 || volumes.length < 10) return null;

    const input: InstitutionalInput = {
      symbol,
      prices: prices.length > 0 ? prices : Array.from({ length: 30 }, (_, i) => 100 * (1 + (Math.random() - 0.5) * 0.1)),
      volumes: volumes.length > 0 ? volumes : Array.from({ length: 30 }, () => 1000000),
      timestamps: timestamps.length > 0 ? timestamps : Array.from({ length: 30 }, (_, i) => new Date(Date.now() - (30 - i) * 86400000).toISOString()),
      averageVolume,
    };

    return detectInstitutionalFootprint(input);
  }, [symbol, prices, volumes, timestamps, averageVolume]);

  if (isLoading || !footprintResult) {
    return (
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-sm font-semibold text-gray-900 mb-2">🐋 Institutional Footprint AI</div>
        <Skeleton className="h-24 w-full rounded" />
      </div>
    );
  }

  const isBuying = footprintResult.activityType === 'BUYING' || footprintResult.activityType === 'ACCUMULATING';
  const isSelling = footprintResult.activityType === 'SELLING' || footprintResult.activityType === 'DISTRIBUTING';

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-900">🐋 Institutional Footprint AI</div>
        {footprintResult.hasInstitutionalActivity && (
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            isBuying ? 'bg-green-100 text-green-700 border border-green-300' :
            'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {footprintResult.activityType}
          </span>
        )}
      </div>

      {footprintResult.hasInstitutionalActivity ? (
        <>
          <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-blue-700">Aktivite Gücü:</span>
              <span className="text-sm font-bold text-blue-700">
                {footprintResult.activityStrength.toFixed(0)}/100
              </span>
            </div>
            <div className="text-[10px] text-blue-600">
              Önerilen İşlem: <span className="font-semibold">{footprintResult.recommendedAction}</span>
            </div>
          </div>

          <div className="text-xs text-slate-600 italic border-t border-slate-200 pt-2">
            {footprintResult.explanation}
          </div>
        </>
      ) : (
        <div className="text-xs text-slate-600 italic">
          {footprintResult.explanation}
        </div>
      )}
    </div>
  );
}



