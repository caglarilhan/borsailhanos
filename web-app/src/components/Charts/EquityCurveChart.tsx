'use client';

import React, { useMemo } from 'react';

interface EquityCurveChartProps {
  data: Array<{
    month: string;
    value: number;
    benchmark: number;
  }>;
}

const CHART_WIDTH = 600;
const CHART_HEIGHT = 260;
const PADDING = 24;

export default function EquityCurveChart({ data }: EquityCurveChartProps) {
  const { valuePoints, benchmarkPoints, minVal, maxVal } = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        valuePoints: '',
        benchmarkPoints: '',
        minVal: 0,
        maxVal: 1,
      };
    }

    const values = data.flatMap((d) => [d.value, d.benchmark]);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;
    const usableWidth = CHART_WIDTH - PADDING * 2;
    const usableHeight = CHART_HEIGHT - PADDING * 2;

    const buildPoints = (key: 'value' | 'benchmark') =>
      data
        .map((entry, idx) => {
          const x =
            PADDING +
            (data.length === 1 ? usableWidth / 2 : (idx / (data.length - 1)) * usableWidth);
          const y =
            CHART_HEIGHT -
            PADDING -
            ((entry[key] - minVal) / range) * usableHeight;
          return `${x},${y}`;
        })
        .join(' ');

    return {
      valuePoints: buildPoints('value'),
      benchmarkPoints: buildPoints('benchmark'),
      minVal,
      maxVal,
    };
  }, [data]);

  const months = data.map((d) => d.month);

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-500 mb-2 px-1">
        <div>Benchmark</div>
        <div>AI Model</div>
      </div>
      <div
        className="relative w-full border border-slate-200 rounded-lg bg-white"
        style={{ height: CHART_HEIGHT }}
      >
        <svg width="100%" height="100%" viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
          <defs>
            <linearGradient id="aiAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = PADDING + ratio * (CHART_HEIGHT - PADDING * 2);
            return (
              <line
                key={ratio}
                x1={PADDING}
                x2={CHART_WIDTH - PADDING}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
              />
            );
          })}

          <polyline
            points={benchmarkPoints}
            fill="none"
            stroke="#94a3b8"
            strokeWidth={2}
          />

          <polyline
            points={valuePoints}
            fill="none"
            stroke="#0f9d74"
            strokeWidth={2.5}
          />
          <polygon
            points={`${PADDING},${CHART_HEIGHT - PADDING} ${valuePoints} ${
              CHART_WIDTH - PADDING
            },${CHART_HEIGHT - PADDING}`}
            fill="url(#aiAreaGradient)"
          />
        </svg>

        <div className="absolute bottom-1 left-0 right-0 flex justify-between text-[10px] text-slate-500 px-3">
          {months.map((month) => (
            <span key={month}>{month}</span>
          ))}
        </div>
        <div className="absolute top-2 right-3 text-xs text-slate-500">
          {minVal.toFixed(0)} - {maxVal.toFixed(0)}
        </div>
      </div>
    </div>
  );
}
