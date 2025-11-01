'use client';

import React from 'react';

interface SentimentImpactBarProps {
  positive?: number;
  negative?: number;
  neutral?: number;
  impactLevel?: 'High' | 'Medium' | 'Low';
}

export function SentimentImpactBar({
  positive = 0.65,
  negative = 0.25,
  neutral = 0.10,
  impactLevel = 'High'
}: SentimentImpactBarProps) {
  // Normalize to ensure total = 1
  const total = positive + negative + neutral;
  const posNorm = total > 0 ? positive / total : 0;
  const negNorm = total > 0 ? negative / total : 0;
  const neuNorm = total > 0 ? neutral / total : 0;

  const getImpactColor = (level: string) => {
    if (level === 'High') return '#10b981'; // green
    if (level === 'Medium') return '#fbbf24'; // yellow
    return '#6b7280'; // gray
  };

  const getImpactText = (level: string) => {
    if (level === 'High') return 'Yüksek Etki';
    if (level === 'Medium') return 'Orta Etki';
    return 'Düşük Etki';
  };

  return (
    <div className="bg-white rounded-lg p-3 border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-900">AI Impact Bar</div>
        <div 
          className="text-xs px-2 py-1 rounded-full font-semibold"
          style={{ 
            backgroundColor: getImpactColor(impactLevel) + '20',
            color: getImpactColor(impactLevel),
            border: `1px solid ${getImpactColor(impactLevel)}`
          }}
        >
          {getImpactText(impactLevel)}
        </div>
      </div>
      
      {/* Impact Bar */}
      <div className="mb-3">
        <div className="flex h-6 rounded-lg overflow-hidden border border-slate-200">
          <div 
            className="flex items-center justify-center text-xs font-semibold text-white"
            style={{ width: `${posNorm * 100}%`, backgroundColor: '#10b981' }}
          >
            {posNorm > 0.15 ? `+${Math.round(posNorm * 100)}%` : ''}
          </div>
          <div 
            className="flex items-center justify-center text-xs font-semibold text-white"
            style={{ width: `${neuNorm * 100}%`, backgroundColor: '#6b7280' }}
          >
            {neuNorm > 0.15 ? `${Math.round(neuNorm * 100)}%` : ''}
          </div>
          <div 
            className="flex items-center justify-center text-xs font-semibold text-white"
            style={{ width: `${negNorm * 100}%`, backgroundColor: '#ef4444' }}
          >
            {negNorm > 0.15 ? `-${Math.round(negNorm * 100)}%` : ''}
          </div>
        </div>
      </div>
      
      {/* Bar Chart (Pozitif/Negatif/Nötr) */}
      <div className="mb-3">
        <div className="flex h-8 rounded-lg overflow-hidden border border-slate-200">
          <div 
            className="flex items-center justify-center text-xs font-semibold text-white"
            style={{ width: `${posNorm * 100}%`, backgroundColor: '#10b981' }}
            title={`Pozitif: ${Math.round(posNorm * 100)}%`}
          >
            {posNorm > 0.15 ? `${Math.round(posNorm * 100)}%` : ''}
          </div>
          <div 
            className="flex items-center justify-center text-xs font-semibold text-white"
            style={{ width: `${neuNorm * 100}%`, backgroundColor: '#6b7280' }}
            title={`Nötr: ${Math.round(neuNorm * 100)}%`}
          >
            {neuNorm > 0.15 ? `${Math.round(neuNorm * 100)}%` : ''}
          </div>
          <div 
            className="flex items-center justify-center text-xs font-semibold text-white"
            style={{ width: `${negNorm * 100}%`, backgroundColor: '#ef4444' }}
            title={`Negatif: ${Math.round(negNorm * 100)}%`}
          >
            {negNorm > 0.15 ? `${Math.round(negNorm * 100)}%` : ''}
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
          <span className="text-green-700">Pozitif</span>
          <span className="font-semibold text-green-900">{Math.round(posNorm * 100)}%</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
          <span className="text-slate-700">Nötr</span>
          <span className="font-semibold text-slate-900">{Math.round(neuNorm * 100)}%</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
          <span className="text-red-700">Negatif</span>
          <span className="font-semibold text-red-900">{Math.round(negNorm * 100)}%</span>
        </div>
      </div>

      {/* Zaman Aralığı Filtresi */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-slate-600">Zaman aralığı:</span>
        <div className="flex gap-1">
          {['1g', '7g', '30g'].map((period) => (
            <button
              key={period}
              className="px-2 py-1 text-[10px] rounded bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
              title={`${period === '1g' ? '1 gün' : period === '7g' ? '7 gün' : '30 gün'} sentiment analizi`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Kaynak Logoları */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-slate-600">Kaynak:</span>
        <div className="flex gap-1">
          {['Bloomberg', 'KAP', 'Dünya', 'AA'].map((source) => (
            <span
              key={source}
              className="px-2 py-0.5 text-[9px] rounded bg-blue-50 text-blue-700 border border-blue-200"
              title={`${source} haber kaynağı`}
            >
              {source}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

