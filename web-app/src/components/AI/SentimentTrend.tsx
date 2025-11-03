'use client';
import React, { useMemo } from 'react';

interface Props { positive?: number[]; negative?: number[]; neutral?: number[] }
export function SentimentTrend({ positive = [], negative = [], neutral = [] }: Props) {
  const series = positive.length ? positive : Array.from({ length: 24 }, (_, i) => 50 + Math.sin(i/4)*20);
  const max = Math.max(...series, 100);
  const min = Math.min(...series, 0);
  const points = useMemo(() => series.map((v, i) => {
    const x = (i / Math.max(1, series.length - 1)) * 100;
    const y = 100 - ((v - min) / Math.max(1, (max - min))) * 100;
    return `${x},${y}`;
  }).join(' '), [series, max, min]);
  return (
    <div className="bg-white rounded-lg border p-4 shadow-sm">
      <div className="text-sm font-semibold text-gray-900 mb-2">Sentiment Trend (24s)</div>
      <svg viewBox="0 0 100 100" className="w-full h-20">
        <polyline fill="none" stroke="#16a34a" strokeWidth="2" points={points} />
      </svg>
      <div className="text-[11px] text-slate-600">Pozitif duygu oranı zaman içinde</div>
    </div>
  );
}



