'use client';

import React, { useMemo } from 'react';

interface SentimentData {
  name: string;
  value: number;
  color: string;
}

interface SentimentPieChartProps {
  data: SentimentData[];
}

export default function SentimentPieChart({ data }: SentimentPieChartProps) {
  const { gradient, total } = useMemo(() => {
    if (!data || data.length === 0) {
      return { gradient: '#e2e8f0', total: 0 };
    }

    const sum = data.reduce((acc, cur) => acc + cur.value, 0) || 1;
    let cumulative = 0;
    const gradientString = data
      .map((entry) => {
        const start = (cumulative / sum) * 360;
        cumulative += entry.value;
        const end = (cumulative / sum) * 360;
        return `${entry.color} ${start}deg ${end}deg`;
      })
      .join(', ');

    return { gradient: gradientString, total: sum };
  }, [data]);

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center">
      <div
        className="relative w-48 h-48 rounded-full shadow-inner"
        style={{
          background: `conic-gradient(${gradient})`,
        }}
      >
        <div className="absolute inset-6 rounded-full bg-white flex flex-col items-center justify-center text-center">
          <div className="text-xs text-slate-500 uppercase tracking-wide">
            Toplam
          </div>
          <div className="text-2xl font-bold text-slate-900">{total}</div>
          <div className="text-xs text-slate-400">haber / sinyal</div>
        </div>
      </div>

      <div className="flex-1 space-y-2 w-full">
        {data.map((entry) => (
          <div
            key={entry.name}
            className="flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2 text-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-flex w-3 h-3 rounded-full"
                style={{ background: entry.color }}
              />
              <span className="font-semibold text-slate-800">{entry.name}</span>
            </div>
            <div className="text-slate-600 font-medium">
              {entry.value.toFixed ? entry.value.toFixed(0) : entry.value}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
