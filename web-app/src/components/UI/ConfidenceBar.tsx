'use client';
import React from 'react';

export function ConfidenceBar({ value, color = 'emerald' }: { value: number; color?: 'emerald'|'yellow'|'red' }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const bg = color === 'emerald' ? 'bg-emerald-500' : color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="w-full h-1.5 rounded bg-slate-200 overflow-hidden" aria-label="confidence">
      <div className={`h-1.5 ${bg}`} style={{ width: `${pct}%` }} />
    </div>
  );
}


