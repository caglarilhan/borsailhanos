'use client';
import React from 'react';

export function TTLBadge({ createdAtMs, ttlMs }: { createdAtMs: number; ttlMs: number }) {
  const remaining = Math.max(0, createdAtMs + ttlMs - Date.now());
  const mins = Math.ceil(remaining / 60000);
  const color = mins > 60 ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : mins > 15 ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-red-100 text-red-700 border-red-300';
  return <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${color}`} title={`TTL: ${mins} dk`}>TTL {mins}dk</span>;
}


