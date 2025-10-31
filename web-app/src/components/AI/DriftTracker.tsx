'use client';

import React from 'react';
import { Sparkline } from './Sparkline';

interface DriftTrackerProps {
  series: number[]; // 0..1 confidence history
}

export function DriftTracker({ series }: DriftTrackerProps) {
  if (!series || series.length === 0) return null;

  // Map to percentage and prepare color: falling = red, rising = green
  const pct = series.map((v) => Math.round((v || 0) * 100));
  const delta = (pct[pct.length - 1] || 0) - (pct[0] || 0);
  const color = delta >= 0 ? '#10b981' : '#ef4444';

  return (
    <div className="bg-slate-50 rounded p-3">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs text-slate-600 font-semibold">Confidence Drift Tracker</div>
        <div className={`text-xs ${delta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{delta >= 0 ? '↑' : '↓'} {Math.abs(delta)} puan</div>
      </div>
      <div className="h-12">
        <Sparkline series={pct} width={300} height={48} color={color} />
      </div>
    </div>
  );
}


