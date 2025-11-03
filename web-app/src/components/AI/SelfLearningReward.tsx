/**
 * Self-Learning Reward Engine Component
 * v6.0 Profit Intelligence Suite
 */

'use client';

import React, { useMemo } from 'react';
import { updateRewardBasedLearning, type TradeResult } from '@/lib/self-learning-reward';
import { Skeleton } from '@/components/UI/Skeleton';
import { formatPercent } from '@/lib/formatters';

interface SelfLearningRewardProps {
  trades?: TradeResult[];
  isLoading?: boolean;
}

export function SelfLearningReward({
  trades = [],
  isLoading,
}: SelfLearningRewardProps) {
  const learningResult = useMemo(() => {
    if (trades.length < 5) return null;
    return updateRewardBasedLearning(trades);
  }, [trades]);

  if (isLoading || !learningResult) {
    return (
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-sm font-semibold text-gray-900 mb-2">🧠 Self-Learning Reward Engine</div>
        <Skeleton className="h-32 w-full rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-900">🧠 Self-Learning Reward Engine</div>
        <div className="text-xs text-slate-500">
          Başarı: %{(learningResult.overallPerformance * 100).toFixed(1)}
        </div>
      </div>

      <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-blue-700">Güncellenmiş Ağırlıklar:</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="text-[10px] text-blue-600">
            RSI: %{(learningResult.updatedWeights.rsi * 100).toFixed(1)}
          </div>
          <div className="text-[10px] text-blue-600">
            MACD: %{(learningResult.updatedWeights.macd * 100).toFixed(1)}
          </div>
          <div className="text-[10px] text-blue-600">
            Sentiment: %{(learningResult.updatedWeights.sentiment * 100).toFixed(1)}
          </div>
          <div className="text-[10px] text-blue-600">
            Volume: %{(learningResult.updatedWeights.volume * 100).toFixed(1)}
          </div>
        </div>
        <div className="text-[10px] text-blue-600 mt-2">
          Güven Eşiği: %{(learningResult.confidenceThreshold * 100).toFixed(0)}
        </div>
      </div>

      {learningResult.adjustments.length > 0 && (
        <div className="mb-3 space-y-1">
          {learningResult.adjustments.map((adj, idx) => (
            <div key={idx} className="text-xs text-slate-600 bg-slate-50 rounded p-2">
              <span className="font-semibold">{adj.factor}:</span> {adj.adjustment >= 0 ? '+' : ''}{adj.adjustment.toFixed(3)}
              <div className="text-[10px] text-slate-500 mt-1">{adj.reason}</div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-slate-600 italic border-t border-slate-200 pt-2">
        {learningResult.explanation}
      </div>
    </div>
  );
}



