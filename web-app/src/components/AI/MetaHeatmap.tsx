'use client';

import React, { useMemo } from 'react';
import { useAICore } from '@/store/aiCore';

interface MetaHeatmapProps {
  limit?: number;
}

export function MetaHeatmap({ limit = 10 }: MetaHeatmapProps) {
  const { signals } = useAICore();

  const top = useMemo(() => {
    const bySymbol = new Map<string, { symbol: string; confidence: number }>();
    signals.forEach((s) => {
      const prev = bySymbol.get(s.symbol);
      if (!prev || s.confidence > prev.confidence) bySymbol.set(s.symbol, { symbol: s.symbol, confidence: s.confidence });
    });
    const arr = Array.from(bySymbol.values());
    arr.sort((a, b) => b.confidence - a.confidence);
    return arr.slice(0, limit);
  }, [signals, limit]);

  if (top.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-3">
      <div className="text-sm font-semibold text-[#111827] mb-2">Meta-Model Heatmap (Top {limit})</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {top.map((item, idx) => {
          const pct = Math.round((item.confidence || 0) * 100);
          // Green shade scaling with confidence
          const bg = pct >= 85 ? 'bg-emerald-500' : pct >= 70 ? 'bg-emerald-400' : 'bg-emerald-300';
          return (
            <div key={idx} className="rounded overflow-hidden border border-slate-100">
              <div className={`h-8 ${bg}`} title={`Güven ${pct}%`} />
              <div className="px-2 py-1 text-xs flex items-center justify-between">
                <span className="font-semibold text-[#111827]">{item.symbol}</span>
                <span className="text-[#111827]">%{pct}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


