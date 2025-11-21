'use client';
import React, { useMemo } from 'react';
import { Sparkline } from '@/components/charts/Sparkline';

interface Row {
  label: string; // 1H / 4H / 1D
  series: number[]; // relative values
  confidence: number; // 0..1
}

interface Props {
  rows?: Row[];
}

export function MTFConsistency({ rows }: Props) {
  const data = useMemo<Row[]>(() => {
    if (rows && rows.length) return rows;
    return [
      { label: '1H', series: [0.5,0.52,0.54,0.55,0.57,0.58,0.6], confidence: 0.82 },
      { label: '4H', series: [0.48,0.5,0.5,0.51,0.5,0.49,0.5], confidence: 0.61 },
      { label: '1D', series: [0.45,0.47,0.5,0.52,0.55,0.58,0.6], confidence: 0.88 },
    ];
  }, [rows]);

  return (
    <div className="rounded-lg border p-3 bg-white">
      <div className="text-xs font-semibold text-slate-800 mb-2">Multi-Timeframe Tutarlılık</div>
      <div className="space-y-2">
        {data.map((r, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="w-10 text-[11px] text-slate-700 font-semibold">{r.label}</div>
            <div className="flex-1">
              <Sparkline data={r.series} />
            </div>
            <div className="w-28" title={`Güven: ${(r.confidence*100).toFixed(0)}%`}>
              <div className="h-2 rounded bg-slate-200 overflow-hidden">
                <div className="h-2 bg-emerald-500" style={{ width: `${Math.max(0, Math.min(100, r.confidence*100))}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-[10px] text-slate-500 mt-2">Model: MetaModel-v2.2 • Data window: 14g</div>
    </div>
  );
}


