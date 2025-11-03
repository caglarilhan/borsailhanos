'use client';
import React, { useMemo } from 'react';

interface Props { history?: number[]; }
export function LearningModePanel({ history = [] }: Props) {
  const data = history.length ? history : Array.from({ length: 30 }, (_, i) => 0.7 + Math.sin(i/6)*0.05 + (i/60));
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = useMemo(() => data.map((v, i) => {
    const x = (i / Math.max(1, data.length - 1)) * 100;
    const y = 100 - ((v - min) / Math.max(0.0001, (max - min))) * 100;
    return `${x},${y}`;
  }).join(' '), [data, max, min]);

  return (
    <div className="bg-white rounded-lg border p-4 shadow-sm">
      <div className="text-sm font-semibold text-gray-900 mb-2">AI Learning Mode</div>
      <svg viewBox="0 0 100 100" className="w-full h-20">
        <polyline fill="none" stroke="#2563eb" strokeWidth="2" points={points} />
      </svg>
      <div className="text-[11px] text-slate-600">Accuracy progression (30g)</div>
    </div>
  );
}



