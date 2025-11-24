/**
 * P5.2: Calibration Chart - ECE ve Brier Score görselleştirmesi
 * VictoryChart / Recharts ile kalibrasyon grafiği
 */

'use client';

import React, { useMemo } from 'react';
import { buildPolylinePoints } from '@/lib/svgChart';

export interface CalibrationData {
  bin: number; // Confidence bin (0-1)
  observed: number; // Observed frequency
  expected: number; // Expected frequency (calibrated)
  count: number; // Number of predictions in this bin
}

export interface CalibrationChartProps {
  data?: CalibrationData[];
  ece?: number; // Expected Calibration Error
  brierScore?: number; // Brier Score
  className?: string;
}

export function CalibrationChart({
  data = [],
  ece,
  brierScore,
  className = '',
}: CalibrationChartProps) {
  // Mock data if not provided
  const chartData = data.length > 0 ? data : Array.from({ length: 10 }, (_, i) => ({
    bin: (i + 1) / 10,
    observed: 0.5 + (i / 10) * 0.3 + Math.random() * 0.1,
    expected: (i + 1) / 10,
    count: Math.floor(Math.random() * 100) + 20,
  }));

  const dims = { width: 520, height: 260, padding: 30 };
  const expectedPath = useMemo(() => buildPolylinePoints(chartData, 'expected', dims), [chartData]);
  const observedPath = useMemo(() => buildPolylinePoints(chartData, 'observed', dims), [chartData]);

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 border border-slate-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Kalibrasyon Grafiği</h3>
          <p className="text-xs text-gray-600">Expected vs Observed Frequency</p>
        </div>
        <div className="flex gap-3 text-xs">
          {ece !== undefined && (
            <div className="px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
              ECE: {ece.toFixed(3)}
            </div>
          )}
          {brierScore !== undefined && (
            <div className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Brier: {brierScore.toFixed(3)}
            </div>
          )}
        </div>
      </div>
      
      <svg width="100%" height="260" viewBox={`0 0 ${dims.width} ${dims.height}`} preserveAspectRatio="none">
        <polyline
          points={expectedPath}
          fill="none"
          stroke="#94a3b8"
          strokeDasharray="6 6"
          strokeWidth={3}
        />
        <polyline
          points={observedPath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      
      <div className="mt-3 text-xs text-gray-600">
        <p>Grafik: X ekseni = Model güven oranı (beklenen), Y ekseni = Gerçekleşen frekans (gözlemlenen)</p>
        <p className="mt-1">ECE (Expected Calibration Error): {ece !== undefined ? ece.toFixed(4) : 'N/A'} | Brier Score: {brierScore !== undefined ? brierScore.toFixed(4) : 'N/A'}</p>
      </div>
    </div>
  );
}


