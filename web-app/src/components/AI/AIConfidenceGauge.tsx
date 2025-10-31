'use client';

import React, { useMemo } from 'react';

interface GaugeProps {
  valuePct: number; // 0..100
  size?: number;
}

export function AIConfidenceGauge({ valuePct, size = 72 }: GaugeProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(valuePct)));
  const radius = size / 2;
  const stroke = 8;
  const r = radius - stroke / 2;
  const circumference = 2 * Math.PI * r;
  const offset = useMemo(() => circumference * (1 - clamped / 100), [circumference, clamped]);

  // color: red -> yellow -> green
  const color = clamped < 60 ? '#ef4444' : clamped < 80 ? '#f59e0b' : '#10b981';

  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={radius} cy={radius} r={r} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
        <circle
          cx={radius}
          cy={radius}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
        />
      </svg>
      <div>
        <div className="text-[10px] text-slate-600">AI Güven</div>
        <div className="text-sm font-bold text-[#111827]">%{clamped}</div>
      </div>
    </div>
  );
}


