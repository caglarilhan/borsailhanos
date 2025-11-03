/**
 * Smart Cluster Trading Component
 * v6.0 Profit Intelligence Suite
 */

'use client';

import React, { useMemo } from 'react';
import { generateSmartClusters, type ClusterInput } from '@/lib/smart-cluster-trading';
import { Skeleton } from '@/components/UI/Skeleton';
import { formatPercent } from '@/lib/formatters';

interface SmartClusterTradingProps {
  symbols?: Array<{
    symbol: string;
    momentum?: number;
    sentiment?: number;
    price?: number;
    volatility?: number;
  }>;
  clusterSize?: number;
  isLoading?: boolean;
}

export function SmartClusterTrading({
  symbols = [],
  clusterSize = 5,
  isLoading,
}: SmartClusterTradingProps) {
  const clusterResult = useMemo(() => {
    if (symbols.length < clusterSize) return null;

    const input: ClusterInput = {
      symbols: symbols.map(s => ({
        symbol: s.symbol,
        momentum: s.momentum || 50,
        sentiment: s.sentiment || 50,
        price: s.price || 100,
        volatility: s.volatility || 0.25,
      })),
      clusterSize,
    };

    return generateSmartClusters(input);
  }, [symbols, clusterSize]);

  if (isLoading || !clusterResult) {
    return (
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-sm font-semibold text-gray-900 mb-2">📦 Smart Cluster Trading</div>
        <Skeleton className="h-32 w-full rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-900">📦 Smart Cluster Trading</div>
        <div className="text-xs text-slate-500">
          {clusterResult.clusters.length} sepet bulundu
        </div>
      </div>

      {clusterResult.bestCluster ? (
        <>
          <div className="mb-3 px-3 py-2 bg-purple-50 border border-purple-200 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-purple-700">En İyi Sepet:</span>
              <span className="text-xs font-bold text-purple-700">
                Benzerlik: %{clusterResult.bestCluster.similarity.toFixed(1)}
              </span>
            </div>
            <div className="text-[10px] text-purple-600 mb-1">
              {clusterResult.bestCluster.symbols.join(', ')}
            </div>
            <div className="text-[10px] text-purple-600">
              Önerilen Ağırlık: {formatPercent(clusterResult.bestCluster.recommendedWeight, true, 1)}
            </div>
          </div>

          {clusterResult.clusters.length > 1 && (
            <div className="mb-3 space-y-2">
              {clusterResult.clusters.slice(1, 4).map((cluster, idx) => (
                <div key={idx} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600">
                  <span className="font-semibold">{cluster.symbols.join(', ')}</span> - Benzerlik: %{cluster.similarity.toFixed(1)}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-xs text-slate-600 italic">
          {clusterResult.explanation}
        </div>
      )}
    </div>
  );
}



