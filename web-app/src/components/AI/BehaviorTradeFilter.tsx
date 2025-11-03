/**
 * Behavior-Linked Trade Filter Component
 * v6.0 Profit Intelligence Suite
 */

'use client';

import React, { useMemo } from 'react';
import { generateBehaviorFilter, type UserBehavior } from '@/lib/behavior-trade-filter';
import { Skeleton } from '@/components/UI/Skeleton';

interface BehaviorTradeFilterProps {
  userId?: string;
  recentTrades?: Array<{
    symbol: string;
    action: 'BUY' | 'SELL';
    entryTime: string;
    exitTime: string;
    profit: number;
    holdingPeriod?: number;
    confidence?: number;
  }>;
  isLoading?: boolean;
}

export function BehaviorTradeFilter({
  userId = 'user-1',
  recentTrades = [],
  isLoading,
}: BehaviorTradeFilterProps) {
  const filterResult = useMemo(() => {
    if (recentTrades.length < 3) return null;

    const behavior: UserBehavior = {
      userId,
      recentTrades: recentTrades.map(t => ({
        symbol: t.symbol,
        action: t.action,
        entryTime: t.entryTime,
        exitTime: t.exitTime,
        profit: t.profit,
        holdingPeriod: t.holdingPeriod || 60,
        confidence: t.confidence || 0.85,
      })),
    };

    return generateBehaviorFilter(behavior);
  }, [userId, recentTrades]);

  if (isLoading || !filterResult) {
    return (
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-sm font-semibold text-gray-900 mb-2">🎭 Behavior-Linked Trade Filter</div>
        <Skeleton className="h-24 w-full rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-900">🎭 Behavior-Linked Trade Filter</div>
        {filterResult.detectedPatterns.length > 0 && (
          <span className="px-2 py-1 rounded text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300">
            PATTERN TESPİT
          </span>
        )}
      </div>

      {filterResult.detectedPatterns.length > 0 ? (
        <>
          <div className="mb-3 space-y-2">
            {filterResult.detectedPatterns.map((pattern, idx) => (
              <div key={idx} className="px-3 py-2 bg-amber-50 border border-amber-200 rounded">
                <div className="text-xs font-semibold text-amber-700 mb-1">{pattern.type}</div>
                <div className="text-[10px] text-amber-600">{pattern.recommendation}</div>
              </div>
            ))}
          </div>

          <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded">
            <div className="text-xs font-semibold text-blue-700 mb-2">Aktif Filtreler:</div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-blue-600">
              <div>Çıkış Gecikme: {filterResult.filters.delayExit}s</div>
              <div>Giriş Gecikme: {filterResult.filters.delayEntry}s</div>
              <div>Güven Artışı: %{(filterResult.filters.confidenceBoost * 100).toFixed(0)}</div>
              <div>Max İşlem/Gün: {filterResult.filters.maxTradesPerDay}</div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-xs text-slate-600 italic">
          Belirgin davranış paterni tespit edilmedi. Normal filtreleme uygulanıyor.
        </div>
      )}

      <div className="text-xs text-slate-600 italic border-t border-slate-200 pt-2">
        {filterResult.explanation}
      </div>
    </div>
  );
}



