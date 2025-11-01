'use client';

import React from 'react';

interface MetaModelRadarProps {
  factors?: {
    rsi?: number;
    macd?: number;
    sentiment?: number;
    volume?: number;
  };
  version?: string;
}

export function MetaModelRadar({ 
  factors = { rsi: 0.22, macd: 0.25, sentiment: 0.31, volume: 0.20 },
  version = 'v5.1 Ensemble LSTM + Prophet Hybrid'
}: MetaModelRadarProps) {
  const { rsi = 0.22, macd = 0.25, sentiment = 0.31, volume = 0.20 } = factors;
  
  // Normalize to 0-1 range for radar chart
  const normalize = (v: number) => Math.min(1, Math.max(0, v));
  const rsiNorm = normalize(rsi);
  const macdNorm = normalize(macd);
  const sentimentNorm = normalize(sentiment);
  const volumeNorm = normalize(volume);
  
  // Radar chart dimensions
  const size = 200;
  const center = size / 2;
  const radius = 80;
  
  // Calculate points for 4 factors
  const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]; // 0, 90, 180, 270 degrees
  const values = [rsiNorm, macdNorm, sentimentNorm, volumeNorm];
  const labels = ['RSI', 'MACD', 'Sentiment', 'Volume'];
  
  const points = values.map((val, i) => {
    const angle = angles[i];
    const r = radius * val;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, value: val, label: labels[i], angle };
  });
  
  // Create path for polygon
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  
  // Grid circles (0.25, 0.5, 0.75, 1.0)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  
  return (
    <div className="bg-white rounded-lg p-4 border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-900">Meta-Model Engine</div>
        <div className="text-xs text-slate-600">{version}</div>
      </div>
      
      <div className="flex items-center justify-center mb-3">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
          {/* Grid circles */}
          {gridLevels.map((level) => (
            <circle
              key={level}
              cx={center}
              cy={center}
              r={radius * level}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={0.5}
            />
          ))}
          
          {/* Axis lines */}
          {angles.map((angle, i) => {
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={0.5}
              />
            );
          })}
          
          {/* Radar polygon */}
          <path
            d={pathD}
            fill="#2563eb"
            fillOpacity={0.2}
            stroke="#2563eb"
            strokeWidth={2}
          />
          
          {/* Value points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={4}
                fill="#2563eb"
                stroke="#fff"
                strokeWidth={2}
              />
              {/* Label */}
              <text
                x={center + (radius + 20) * Math.cos(p.angle)}
                y={center + (radius + 20) * Math.sin(p.angle)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fill="#374151"
                fontWeight="600"
              >
                {p.label}
              </text>
              {/* Value percentage */}
              <text
                x={center + (radius + 35) * Math.cos(p.angle)}
                y={center + (radius + 35) * Math.sin(p.angle)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8"
                fill="#6b7280"
              >
                {Math.round(p.value * 100)}%
              </text>
            </g>
          ))}
        </svg>
      </div>
      
      {/* Factor breakdown */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
          <span className="text-slate-700">RSI</span>
          <span className="font-semibold text-slate-900">{Math.round(rsi * 100)}%</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
          <span className="text-slate-700">MACD</span>
          <span className="font-semibold text-slate-900">{Math.round(macd * 100)}%</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
          <span className="text-slate-700">Sentiment</span>
          <span className="font-semibold text-slate-900">{Math.round(sentiment * 100)}%</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
          <span className="text-slate-700">Volume</span>
          <span className="font-semibold text-slate-900">{Math.round(volume * 100)}%</span>
        </div>
      </div>
    </div>
  );
}

