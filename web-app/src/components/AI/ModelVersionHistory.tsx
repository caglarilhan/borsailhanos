'use client';
import React from 'react';

interface Item { name: string; version: string; date: string; notes?: string }
export function ModelVersionHistory({ items }: { items?: Item[] }) {
  const data = items && items.length ? items : [
    { name: 'FinBERT-TR', version: 'v2.1', date: '2025-10-12', notes: 'Türkçe finansal haber güncellemesi' },
    { name: 'Meta-Model', version: 'v1.4', date: '2025-10-05', notes: 'RSI+Momentum ağırlık optimizasyonu' },
  ];
  return (
    <div className="bg-white rounded-lg border p-4 shadow-sm">
      <div className="text-sm font-semibold text-gray-900 mb-2">AI Model Versiyon Geçmişi</div>
      <ul className="text-xs text-slate-700 space-y-1">
        {data.map((it,i)=> (
          <li key={i} className="flex items-center justify-between">
            <div>
              <span className="font-semibold">{it.name}</span> <span className="text-slate-500">{it.version}</span>
              {it.notes && <span className="ml-1 text-slate-500">— {it.notes}</span>}
            </div>
            <div className="text-slate-500">{it.date}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}



