/**
 * Drift Graph Component
 * Sprint 3: AI Motoru - Model drift grafiği (24s / 7g trend gösterimi)
 * Confidence % değişimini zaman içinde gösterir
 */

'use client';

import React, { useMemo } from 'react';
import { buildPolylinePoints } from '@/lib/svgChart';

interface DriftDataPoint {
  date: string;
  confidence: number;
  accuracy: number;
  drift: number;
}

interface DriftGraphProps {
  data: DriftDataPoint[];
  period: '24h' | '7d';
  className?: string;
}

export function DriftGraph({ data, period, className = '' }: DriftGraphProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`bg-slate-50 rounded-lg p-4 border border-slate-200 ${className}`}>
        <div className="text-xs text-slate-600 text-center">Veri yok</div>
      </div>
    );
  }

  // Calculate statistics
  const latestConfidence = data[data.length - 1]?.confidence || 0;
  const firstConfidence = data[0]?.confidence || 0;
  const drift = latestConfidence - firstConfidence;
  const driftPercent = (drift * 100).toFixed(2);
  const avgAccuracy = data.reduce((sum, d) => sum + (d.accuracy || 0), 0) / data.length;

  // Format data for chart
  const chartData = data.map((d, i) => ({
    name: period === '24h' 
      ? new Date(d.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      : new Date(d.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
    confidence: d.confidence * 100,
    accuracy: d.accuracy * 100,
    drift: d.drift * 100,
  }));

  const dims = { width: 520, height: 180, padding: 24 };
  const confidencePath = useMemo(
    () => buildPolylinePoints(chartData, 'confidence', dims),
    [chartData]
  );
  const accuracyPath = useMemo(
    () => buildPolylinePoints(chartData, 'accuracy', dims),
    [chartData]
  );

  const driftColor = drift >= 0 ? '#10b981' : '#ef4444';
  const driftIcon = drift >= 0 ? '↑' : drift < 0 ? '↓' : '→';

  return (
    <div className={`bg-white rounded-lg p-4 border border-slate-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">
            Model Drift Graph ({period === '24h' ? '24 Saat' : '7 Gün'})
          </div>
          <div className="text-xs text-slate-600">
            Confidence değişim trendi ve doğruluk metrikleri
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-bold ${drift >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {driftIcon} {driftPercent}pp
          </div>
          <div className="text-xs text-slate-600">
            Son: {(latestConfidence * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 w-full">
        <svg width="100%" height="100%" viewBox={`0 0 ${dims.width} ${dims.height}`} preserveAspectRatio="none">
          <polygon
            points={`${dims.padding},${dims.height - dims.padding} ${confidencePath} ${dims.width - dims.padding},${dims.height - dims.padding}`}
            fill={driftColor === '#10b981' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}
          />
          <polyline
            points={confidencePath}
            fill="none"
            stroke={driftColor}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={accuracyPath}
            fill="none"
            stroke="#8b5cf6"
            strokeDasharray="6 6"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Statistics */}
      <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-slate-200">
        <div className="text-center">
          <div className="text-xs text-slate-600 mb-1">Başlangıç</div>
          <div className="text-sm font-bold text-slate-900">
            {(firstConfidence * 100).toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-600 mb-1">Ortalama</div>
          <div className="text-sm font-bold text-slate-900">
            {(avgAccuracy * 100).toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-600 mb-1">Değişim</div>
          <div className={`text-sm font-bold ${drift >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {driftPercent}pp
          </div>
        </div>
      </div>
    </div>
  );
}

