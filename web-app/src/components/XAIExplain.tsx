'use client';

import React, { useState } from 'react';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface ExplainResp {
  symbol: string;
  explainability: {
    method: string;
    shap_values: Record<string, number>;
    lime_values: Record<string, number>;
  };
  timestamp: string;
}

export default function XAIExplain() {
  const [symbol, setSymbol] = useState('THYAO');
  const [resp, setResp] = useState<ExplainResp | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/xai/explain?symbol=${symbol}`, { cache: 'no-store' });
      const json = await res.json();
      setResp(json);
    } finally {
      setLoading(false);
    }
  };

  const renderBars = (values: Record<string, number>, color: string) => {
    const entries = Object.entries(values).sort((a,b)=>Math.abs(b[1]) - Math.abs(a[1])).slice(0,10);
    return (
      <div className="space-y-2">
        {entries.map(([feat, val]) => (
          <div key={feat}>
            <div className="flex justify-between text-xs text-gray-600">
              <span>{feat}</span>
              <span className="font-medium" style={{color}}>{val.toFixed(3)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded h-2">
              <div className="h-2 rounded" style={{ width: `${Math.min(100, Math.abs(val)*100)}%`, backgroundColor: color }}></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900">XAI Explainability</div>
        <div className="flex gap-2">
          <input value={symbol} onChange={(e)=>setSymbol(e.target.value.toUpperCase())} className="px-2 py-1 border rounded text-sm" />
          <button onClick={load} className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:opacity-50" disabled={loading}>{loading?'Yükleniyor…':'Açıkla'}</button>
          {resp && (
            <button
              onClick={()=>{
                try {
                  const rows: string[] = [];
                  rows.push('feature,shap,lime');
                  const feats = new Set([...Object.keys(resp.explainability.shap_values), ...Object.keys(resp.explainability.lime_values)]);
                  feats.forEach(f => {
                    const shap = resp.explainability.shap_values[f] ?? '';
                    const lime = resp.explainability.lime_values[f] ?? '';
                    rows.push(`${f},${shap},${lime}`);
                  });
                  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${symbol}_xai.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                } catch {}
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded"
            >CSV</button>
          )}
        </div>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {!resp && (<div className="text-sm text-gray-500">Veri yok</div>)}
        {resp && (
          <>
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">SHAP (Top 10)</div>
              {renderBars(resp.explainability.shap_values, '#16a34a')}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">LIME (Top 10)</div>
              {renderBars(resp.explainability.lime_values, '#2563eb')}
            </div>
          </>
        )}
      </div>
    </div>
  );
}


