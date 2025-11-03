/**
 * Sentiment-Momentum Fusion Index (SMF) Component
 * v6.0 Profit Intelligence Suite
 * 
 * Displays unified 0-100 score combining sentiment and momentum
 */

'use client';

import React, { useMemo } from 'react';
import { calculateSMFIndex, getSMFColor, getSMFLabel, type SMFInput } from '@/lib/smf-index';
import { Skeleton } from '@/components/UI/Skeleton';
import { formatPercent } from '@/lib/formatters';

interface SMFIndexProps {
  symbol: string;
  sentiment?: {
    positive: number;
    negative: number;
    neutral: number;
  };
  momentum?: {
    rsi: number;
    macd: number;
    volume: number;
    priceChange: number;
  };
  isLoading?: boolean;
}

export function SMFIndex({ symbol, sentiment, momentum, isLoading }: SMFIndexProps) {
  const smfResult = useMemo(() => {
    if (!sentiment || !momentum) return null;

    const input: SMFInput = {
      symbol,
      sentiment: {
        positive: sentiment.positive,
        negative: sentiment.negative,
        neutral: sentiment.neutral,
      },
      momentum: {
        rsi: momentum.rsi,
        macd: momentum.macd || 0,
        volume: momentum.volume || 1,
        priceChange: momentum.priceChange || 0,
      },
    };

    return calculateSMFIndex(input);
  }, [symbol, sentiment, momentum]);

  if (isLoading || !smfResult) {
    return (
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-sm font-semibold text-gray-900 mb-2">📊 SMF Index</div>
        <Skeleton className="h-20 w-full rounded" />
      </div>
    );
  }

  const color = getSMFColor(smfResult.smfScore);
  const label = getSMFLabel(smfResult.smfScore);

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-900">📊 SMF Index</div>
        <div className="text-xs text-slate-500">{symbol}</div>
      </div>

      {/* Main SMF Score */}
      <div className="mb-4">
        <div className="flex items-end gap-2 mb-2">
          <div className="text-3xl font-bold" style={{ color }}>
            {smfResult.smfScore.toFixed(1)}
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
          <span className="text-xs text-slate-600">
            %{(smfResult.confidence * 100).toFixed(0)} güven
          </span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-slate-50 rounded p-2">
          <div className="text-xs text-slate-600 mb-1">Sentiment</div>
          <div className="text-lg font-bold text-blue-600">
            {smfResult.breakdown.sentimentScore.toFixed(1)}/50
          </div>
        </div>
        <div className="bg-slate-50 rounded p-2">
          <div className="text-xs text-slate-600 mb-1">Momentum</div>
          <div className="text-lg font-bold text-purple-600">
            {smfResult.breakdown.momentumScore.toFixed(1)}/50
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${smfResult.smfScore}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>

      {/* Explanation */}
      <div className="text-xs text-slate-600 italic border-t border-slate-200 pt-2">
        {smfResult.explanation}
      </div>

      {/* Detailed Breakdown */}
      <details className="mt-2 text-xs">
        <summary className="text-slate-500 cursor-pointer">Detaylı Dağılım</summary>
        <div className="mt-2 space-y-1 text-slate-600">
          {sentiment && (
            <div className="flex justify-between">
              <span>Sentiment:</span>
              <span>
                +{formatPercent(sentiment.positive, true, 1)} / 
                -{formatPercent(sentiment.negative, true, 1)} / 
                ~{formatPercent(sentiment.neutral, true, 1)}
              </span>
            </div>
          )}
          {momentum && (
            <>
              <div className="flex justify-between">
                <span>RSI:</span>
                <span>{momentum.rsi.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>MACD:</span>
                <span>{momentum.macd?.toFixed(3) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Hacim Oranı:</span>
                <span>{(momentum.volume || 1).toFixed(2)}x</span>
              </div>
              <div className="flex justify-between">
                <span>Fiyat Değişimi (24s):</span>
                <span>{formatPercent(momentum.priceChange / 100, true, 2)}</span>
              </div>
            </>
          )}
        </div>
      </details>
    </div>
  );
}



