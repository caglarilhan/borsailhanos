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

  // P1-07: Dinamik renk geçişleri (yeşil/sarı/kırmızı) - Smooth transition
  const getColorWithTransition = (value: number): string => {
    if (value < 60) {
      // Red zone: 0-60 (full red at 0, transitioning to yellow at 60)
      const ratio = value / 60;
      const r = Math.round(239 - (239 - 245) * ratio); // #ef4444 -> #f59e0b
      const g = Math.round(68 - (68 - 158) * ratio);
      const b = Math.round(68 - (68 - 11) * ratio);
      return `rgb(${r}, ${g}, ${b})`;
    } else if (value < 80) {
      // Yellow zone: 60-80 (yellow at 60, transitioning to green at 80)
      const ratio = (value - 60) / 20;
      const r = Math.round(245 - (245 - 16) * ratio); // #f59e0b -> #10b981
      const g = Math.round(158 + (163 - 158) * ratio);
      const b = Math.round(11 + (185 - 11) * ratio);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Green zone: 80-100
      return '#10b981';
    }
  };
  const color = getColorWithTransition(clamped);

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


