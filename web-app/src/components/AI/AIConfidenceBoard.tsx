'use client';

import React from 'react';
import { AIConfidenceGauge } from './AIConfidenceGauge';

interface AIConfidenceBoardProps {
  aiConfidence?: number;
  riskExposure?: number;
  signalStability?: number;
  trend7d?: number[];
}

export function AIConfidenceBoard({
  aiConfidence = 0.87,
  riskExposure = 0.65,
  signalStability = 0.82,
  trend7d = []
}: AIConfidenceBoardProps) {
  // Generate 7d trend if not provided
  const trend = trend7d.length > 0 ? trend7d : Array.from({ length: 7 }, (_, i) => {
    const base = 0.75;
    const trend = (i / 7) * 0.05;
    return Math.max(0.65, Math.min(0.95, base + trend));
  });

  const getGaugeColor = (value: number) => {
    if (value >= 0.85) return '#10b981'; // green
    if (value >= 0.70) return '#fbbf24'; // yellow
    return '#ef4444'; // red
  };

  const getRiskColor = (value: number) => {
    if (value >= 0.80) return '#ef4444'; // red (high risk)
    if (value >= 0.60) return '#fbbf24'; // yellow (medium risk)
    return '#10b981'; // green (low risk)
  };

  return (
    <div className="bg-white rounded-lg p-4 border shadow-sm">
      <div className="text-sm font-semibold text-gray-900 mb-4">AI Confidence Board</div>
      
      {/* 3 Gauge Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* AI Confidence Gauge */}
        <div className="flex flex-col items-center">
          <div className="text-xs text-slate-600 mb-2">AI Confidence</div>
          <AIConfidenceGauge confidence={aiConfidence} />
          <div className="text-xs text-slate-700 mt-2">{Math.round(aiConfidence * 100)}%</div>
        </div>
        
        {/* Risk Exposure Gauge */}
        <div className="flex flex-col items-center">
          <div className="text-xs text-slate-600 mb-2">Risk Exposure</div>
          <div className="relative w-24 h-24">
            <svg width="96" height="96" viewBox="0 0 96 96" className="transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke={getRiskColor(riskExposure)}
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - riskExposure)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-sm font-bold" style={{ color: getRiskColor(riskExposure) }}>
                {Math.round(riskExposure * 100)}%
              </div>
            </div>
          </div>
          <div className={`text-xs mt-2 font-semibold`} style={{ color: getRiskColor(riskExposure) }}>
            {riskExposure >= 0.80 ? 'Yüksek' : riskExposure >= 0.60 ? 'Orta' : 'Düşük'}
          </div>
        </div>
        
        {/* Signal Stability Gauge */}
        <div className="flex flex-col items-center">
          <div className="text-xs text-slate-600 mb-2">Signal Stability</div>
          <div className="relative w-24 h-24">
            <svg width="96" height="96" viewBox="0 0 96 96" className="transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke={getGaugeColor(signalStability)}
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - signalStability)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-sm font-bold" style={{ color: getGaugeColor(signalStability) }}>
                {Math.round(signalStability * 100)}%
              </div>
            </div>
          </div>
          <div className={`text-xs mt-2 font-semibold`} style={{ color: getGaugeColor(signalStability) }}>
            {signalStability >= 0.85 ? 'Yüksek' : signalStability >= 0.70 ? 'Orta' : 'Düşük'}
          </div>
        </div>
      </div>
      
      {/* 7g Confidence Trend Graph */}
      <div className="mb-3">
        <div className="text-xs text-slate-700 mb-2">7g Confidence Trend</div>
        <div className="h-16 w-full">
          <svg width="100%" height="64" viewBox="0 0 200 64" className="flex-shrink-0">
            <defs>
              <linearGradient id="confidenceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <path
              d={`M 0 ${64 - trend[0] * 64} ${trend.map((v, i) => `L ${(i / (trend.length - 1)) * 200} ${64 - v * 64}`).join(' ')} L 200 64 L 0 64 Z`}
              fill="url(#confidenceGradient)"
            />
            <path
              d={`M 0 ${64 - trend[0] * 64} ${trend.map((v, i) => `L ${(i / (trend.length - 1)) * 200} ${64 - v * 64}`).join(' ')}`}
              fill="none"
              stroke="#2563eb"
              strokeWidth={2}
            />
            {trend.map((v, i) => (
              <circle
                key={i}
                cx={(i / (trend.length - 1)) * 200}
                cy={64 - v * 64}
                r={2}
                fill="#2563eb"
              />
            ))}
          </svg>
        </div>
      </div>
      
      {/* P1 - Confidence Trend: 24s değişim etiketi */}
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="text-slate-700">24s değişim:</span>
        <span className={`font-semibold px-2 py-0.5 rounded ${
          trend.length > 1 && trend[trend.length - 1] > trend[0] 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : trend.length > 1 && trend[trend.length - 1] < trend[0]
            ? 'bg-red-100 text-red-700 border border-red-200'
            : 'bg-slate-100 text-slate-700 border border-slate-200'
        }`}>
          {trend.length > 1 
            ? `${trend[trend.length - 1] > trend[0] ? '+' : ''}${((trend[trend.length - 1] - trend[0]) * 100).toFixed(1)}%`
            : '—'}
        </span>
      </div>

      {/* Metin analizi */}
      <div className="bg-slate-50 rounded p-2 text-xs text-slate-700">
        <div className="font-semibold mb-1">📊 Analiz:</div>
        <div>
          Model güveni son 24 saatte {trend[trend.length - 1] > trend[0] ? '+' : ''}{Math.round((trend[trend.length - 1] - trend[0]) * 100)}% 
          {trend[trend.length - 1] > trend[0] ? ' arttı' : ' azaldı'}, kararlılık {signalStability >= 0.80 ? 'yüksek' : 'orta'}.
        </div>
      </div>
    </div>
  );
}

