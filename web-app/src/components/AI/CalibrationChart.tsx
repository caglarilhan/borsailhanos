/**
 * P5.2: Calibration Chart - ECE ve Brier Score görselleştirmesi
 * VictoryChart / Recharts ile kalibrasyon grafiği
 */

'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

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
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="bin" 
            label={{ value: 'Confidence (Expected)', position: 'insideBottom', offset: -5 }}
            tickFormatter={(value) => (value * 100).toFixed(0) + '%'}
          />
          <YAxis 
            label={{ value: 'Frequency (Observed)', angle: -90, position: 'insideLeft' }}
            tickFormatter={(value) => (value * 100).toFixed(0) + '%'}
            domain={[0, 1]}
          />
          <Tooltip 
            formatter={(value: number) => [(value * 100).toFixed(1) + '%', '']}
            labelFormatter={(label) => `Confidence: ${(label * 100).toFixed(0)}%`}
          />
          <Legend />
          {/* Perfect calibration line (diagonal) */}
          <Line 
            type="monotone" 
            dataKey="expected" 
            stroke="#94a3b8" 
            strokeWidth={2} 
            strokeDasharray="5 5"
            name="Perfect Calibration"
            dot={false}
          />
          {/* Observed frequency */}
          <Line 
            type="monotone" 
            dataKey="observed" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Observed"
            dot={{ r: 4, fill: '#3b82f6' }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-3 text-xs text-gray-600">
        <p>Grafik: X ekseni = Model güven oranı (beklenen), Y ekseni = Gerçekleşen frekans (gözlemlenen)</p>
        <p className="mt-1">ECE (Expected Calibration Error): {ece !== undefined ? ece.toFixed(4) : 'N/A'} | Brier Score: {brierScore !== undefined ? brierScore.toFixed(4) : 'N/A'}</p>
      </div>
    </div>
  );
}


