'use client';

import React from 'react';

interface XAIWaterfallMiniProps {
  deltasBp: { label: string; bp: number; color?: string }[]; // e.g., [{label:'Momentum', bp:-4.5}]
}

export function XAIWaterfallMini({ deltasBp }: XAIWaterfallMiniProps) {
  return (
    <div className="flex items-center gap-2 text-[10px]">
      {deltasBp.map((d,i)=> (
        <span key={i} className={`px-1.5 py-0.5 rounded border ${d.bp>=0?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-red-50 text-red-700 border-red-200'}`}
          title={`${d.label}: ${d.bp>=0?'+':''}${d.bp.toFixed(1)}bp`}>
          {d.label} {d.bp>=0?'+':''}{d.bp.toFixed(1)}bp
        </span>
      ))}
    </div>
  );
}


