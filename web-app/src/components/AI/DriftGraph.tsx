/**
 * Drift Graph Component
 * Sprint 3: AI Motoru - Model drift grafiği (24s / 7g trend gösterimi)
 * Confidence % değişimini zaman içinde gösterir
 */

'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

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
    confidence: (d.confidence * 100).toFixed(1),
    accuracy: (d.accuracy * 100).toFixed(1),
    drift: (d.drift * 100).toFixed(2),
  }));

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
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={driftColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={driftColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10, fill: '#64748b' }}
              interval={period === '24h' ? Math.ceil(data.length / 6) : 'preserveStartEnd'}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#64748b' }}
              label={{ value: 'Confidence %', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11 } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: any, name: string) => {
                if (name === 'confidence') return [`${value}%`, 'Confidence'];
                if (name === 'accuracy') return [`${value}%`, 'Accuracy'];
                if (name === 'drift') return [`${value}pp`, 'Drift'];
                return [value, name];
              }}
            />
            <Area
              type="monotone"
              dataKey="confidence"
              stroke={driftColor}
              strokeWidth={2}
              fill="url(#confidenceGradient)"
              dot={{ r: 3, fill: driftColor }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="#8b5cf6"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
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

