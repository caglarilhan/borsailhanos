'use client';

import React from 'react';

interface SparklineProps {
  series: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function Sparkline({ series, width = 80, height = 24, color = '#10b981' }: SparklineProps) {
  if (!series || series.length === 0) return null;
  
  const min = Math.min(...series);
  const max = Math.max(...series);
  const scaleX = (i: number) => (i / Math.max(1, series.length - 1)) * width;
  const scaleY = (v: number) => height - ((v - min) / Math.max(1, max - min)) * height;
  
  let d = '';
  series.forEach((v, i) => {
    const x = scaleX(i);
    const y = scaleY(v);
    d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2) + ' ';
  });
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

