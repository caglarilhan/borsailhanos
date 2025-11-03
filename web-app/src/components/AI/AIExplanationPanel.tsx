'use client';
import React from 'react';

interface Props {
  symbol: string;
  confidence: number; // 0..1
  factors?: Array<{ name: string; weight: number; contributionBp: number }>;
  comment?: string;
}

export function AIExplanationPanel({ symbol, confidence, factors = [], comment }: Props) {
  const confPct = Math.round((confidence || 0) * 100);
  return (
    <div className="bg-white rounded-lg border p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold text-gray-900">AI Açıklaması</div>
        <div className="text-xs text-slate-600">{symbol}</div>
      </div>
      <div className="text-xs text-slate-700 mb-2">
        Güven: <span className="font-semibold">%{confPct}</span>
      </div>
      {comment && (
        <div className="text-xs text-slate-700 mb-3 text-wrap break-words">{comment}</div>
      )}
      <div className="text-[11px] text-slate-600 mb-2">Faktör Katkıları</div>
      <div className="flex flex-wrap gap-2">
        {factors.slice(0,6).map((f,i) => (
          <span key={i} className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${f.contributionBp>=0?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-rose-50 text-rose-700 border-rose-200'}`}>
            {f.name} {f.contributionBp>=0?'+':''}{f.contributionBp.toFixed(1)}bp
          </span>
        ))}
      </div>
    </div>
  );
}



