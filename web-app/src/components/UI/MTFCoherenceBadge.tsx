'use client';

import React from 'react';

interface MTFCoherenceBadgeProps {
  horizons: Array<'5m'|'15m'|'30m'|'1h'|'4h'|'1d'>;
  signals: Record<string, number>; // horizon -> signed strength (-1..1)
}

export function MTFCoherenceBadge({ horizons, signals }: MTFCoherenceBadgeProps) {
  const values = horizons.map(h => Math.sign(signals[h] ?? 0));
  const agreePairs = values.slice(1).map((v,i) => (v !== 0 && v === values[i] ? 1 : 0));
  const coherence = Math.round(100 * (agreePairs.reduce((a,b)=>a+b,0) / Math.max(1, agreePairs.length)));

  const color = coherence >= 75 ? 'bg-green-100 text-green-700 border-green-300'
    : coherence >= 50 ? 'bg-amber-100 text-amber-700 border-amber-300'
    : 'bg-red-100 text-red-700 border-red-300';

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${color}`} title={`MTF Tutarlılık: ${coherence}%`}>
      MTF {coherence}%
    </span>
  );
}


