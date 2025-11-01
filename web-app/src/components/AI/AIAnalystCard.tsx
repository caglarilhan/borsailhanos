'use client';

import React from 'react';

interface AIAnalystCardProps {
  version?: string;
  totalSignals?: number;
  accuracy?: number;
  topSymbol?: string;
}

export function AIAnalystCard({
  version = 'MetaLSTM v5.1',
  totalSignals = 180,
  accuracy = 0.873,
  topSymbol = 'THYAO'
}: AIAnalystCardProps) {
  return (
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-purple-200 shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
          🤖
        </div>
        <div>
          <div className="text-sm font-bold text-slate-900">AI Analyst</div>
          <div className="text-xs text-slate-600">{version}</div>
        </div>
      </div>
      
      <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-slate-200">
        <div className="text-xs text-slate-700 leading-relaxed">
          <p className="mb-2">
            <span className="font-semibold">Ben {version}</span> — son 30 günde <span className="font-bold text-blue-600">{totalSignals}</span> sinyal ürettim, 
            doğruluk oranım <span className="font-bold text-green-600">{Math.round(accuracy * 100)}%</span>.
          </p>
          <p>
            Bu sabah veri akışında <span className="font-bold text-purple-600">{topSymbol}</span> lider durumda.
          </p>
        </div>
      </div>
      
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="bg-white/80 backdrop-blur rounded p-2 border border-slate-200 text-center">
          <div className="text-slate-600">Sinyaller</div>
          <div className="font-bold text-slate-900">{totalSignals}</div>
        </div>
        <div className="bg-white/80 backdrop-blur rounded p-2 border border-slate-200 text-center">
          <div className="text-slate-600">Doğruluk</div>
          <div className="font-bold text-green-600">{Math.round(accuracy * 100)}%</div>
        </div>
        <div className="bg-white/80 backdrop-blur rounded p-2 border border-slate-200 text-center">
          <div className="text-slate-600">Lider</div>
          <div className="font-bold text-purple-600">{topSymbol}</div>
        </div>
      </div>
    </div>
  );
}

