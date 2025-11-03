'use client';
import React from 'react';

interface Props {
  data: number[]; // 0..1 scaled preferred
  width?: number;
  height?: number;
  color?: string;
}

export function Sparkline({ data, width = 120, height = 28, color = '#16a34a' }: Props) {
  if (!Array.isArray(data) || data.length < 2) {
    return <svg width={width} height={height}></svg>;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pad = 2;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const scaleX = (i: number) => pad + (i / (data.length - 1)) * w;
  const scaleY = (v: number) => pad + h - ((v - min) / (max - min || 1)) * h;
  const d = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(v)}`).join(' ');
  const last = data[data.length - 1];
  const first = data[0];
  const up = last >= first;
  const stroke = up ? color : '#ef4444';

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}


