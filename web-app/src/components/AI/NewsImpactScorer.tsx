/**
 * News Impact Scorer Component
 * v6.0 Profit Intelligence Suite
 * 
 * Displays FinBERT sentiment → gerçek fiyat etkisi analizi
 */

'use client';

import React, { useMemo } from 'react';
import { scoreNewsImpact, getImpactColor, getImpactLabel, type NewsArticle } from '@/lib/news-impact-scorer';
import { Skeleton } from '@/components/UI/Skeleton';
import { formatPercent, formatCurrencyTRY } from '@/lib/formatters';

interface NewsImpactScorerProps {
  symbol: string;
  article?: NewsArticle;
  currentPrice?: number;
  recentVolume?: number;
  averageVolume?: number;
  isLoading?: boolean;
}

export function NewsImpactScorer({
  symbol,
  article,
  currentPrice = 100,
  recentVolume = 1000000,
  averageVolume = 1000000,
  isLoading,
}: NewsImpactScorerProps) {
  const impactResult = useMemo(() => {
    if (!article) return null;

    return scoreNewsImpact({
      symbol,
      article,
      currentPrice,
      recentVolume,
      averageVolume,
    });
  }, [symbol, article, currentPrice, recentVolume, averageVolume]);

  if (isLoading || !impactResult || !article) {
    return (
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-sm font-semibold text-gray-900 mb-2">📰 News Impact Scorer</div>
        <Skeleton className="h-28 w-full rounded" />
      </div>
    );
  }

  const color = getImpactColor(impactResult.impactScore);
  const label = getImpactLabel(impactResult.impactScore);

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-900">📰 News Impact Scorer</div>
        <div className="text-xs text-slate-500">{symbol}</div>
      </div>

      {/* Article Info */}
      {article.title && (
        <div className="mb-3 p-2 bg-slate-50 rounded text-xs">
          <div className="font-semibold text-slate-900 mb-1">{article.title}</div>
          <div className="text-slate-600">
            {article.source} • {new Date(article.timestamp).toLocaleTimeString('tr-TR')}
          </div>
        </div>
      )}

      {/* Impact Score */}
      <div className="mb-4">
        <div className="flex items-end gap-2 mb-2">
          <div className="text-3xl font-bold" style={{ color }}>
            {impactResult.impactScore.toFixed(1)}
          </div>
          <div className="text-sm text-slate-600 mb-1">/100</div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-1 rounded text-xs font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            {label}
          </span>
          <span className="text-xs text-slate-600 capitalize">
            {impactResult.volumeReaction} hacim
          </span>
        </div>
      </div>

      {/* Expected Impact */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-slate-50 rounded p-2">
          <div className="text-xs text-slate-600 mb-1">Tahmini Fiyat Değişimi</div>
          <div className={`text-sm font-bold ${
            impactResult.expectedPriceChange >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {impactResult.expectedPriceChange >= 0 ? '+' : ''}
            {formatPercent(impactResult.expectedPriceChange / 100, true, 2)}
          </div>
        </div>
        <div className="bg-slate-50 rounded p-2">
          <div className="text-xs text-slate-600 mb-1">Etki Zaman Aralığı</div>
          <div className="text-sm font-bold text-slate-900 capitalize">
            {impactResult.timeframe === 'immediate' ? 'Anında' :
             impactResult.timeframe === '1h' ? '1 Saat' :
             impactResult.timeframe === '4h' ? '4 Saat' :
             '24 Saat'}
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="mb-3 px-3 py-2 rounded border"
        style={{
          backgroundColor: impactResult.recommendedAction === 'BUY' ? '#ecfdf5' :
                          impactResult.recommendedAction === 'SELL' ? '#fef2f2' :
                          impactResult.recommendedAction === 'WAIT' ? '#fffbeb' :
                          '#f1f5f9',
          borderColor: impactResult.recommendedAction === 'BUY' ? '#10b981' :
                      impactResult.recommendedAction === 'SELL' ? '#ef4444' :
                      impactResult.recommendedAction === 'WAIT' ? '#fbbf24' :
                      '#94a3b8',
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold"
            style={{
              color: impactResult.recommendedAction === 'BUY' ? '#059669' :
                     impactResult.recommendedAction === 'SELL' ? '#dc2626' :
                     impactResult.recommendedAction === 'WAIT' ? '#d97706' :
                     '#64748b',
            }}
          >
            Öneri:
          </span>
          <span className="text-sm font-bold"
            style={{
              color: impactResult.recommendedAction === 'BUY' ? '#059669' :
                     impactResult.recommendedAction === 'SELL' ? '#dc2626' :
                     impactResult.recommendedAction === 'WAIT' ? '#d97706' :
                     '#64748b',
            }}
          >
            {impactResult.recommendedAction === 'BUY' ? '🟢 AL' :
             impactResult.recommendedAction === 'SELL' ? '🔴 SAT' :
             impactResult.recommendedAction === 'WAIT' ? '🟡 BEKLE' :
             '⚪ GÖZARDI ET'}
          </span>
        </div>
        {impactResult.expectedPriceChange !== 0 && (
          <div className="text-[10px] text-slate-600 mt-1">
            Tahmini hedef fiyat: {formatCurrencyTRY(currentPrice * (1 + impactResult.expectedPriceChange / 100))}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${impactResult.impactScore}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>

      {/* Explanation */}
      <div className="text-xs text-slate-600 italic border-t border-slate-200 pt-2 mb-2">
        {impactResult.explanation}
      </div>

      {/* Confidence */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">Güven:</span>
        <span className="font-semibold text-slate-700">
          %{(impactResult.confidence * 100).toFixed(0)}
        </span>
      </div>
    </div>
  );
}



