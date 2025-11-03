'use client';
import React from 'react';

interface Sector { name: string; changePct: number }
export function SectorHeatmap({ sectors = [] as Sector[] }: { sectors?: Sector[] }) {
  const items = (sectors.length ? sectors : [
    { name: 'Teknoloji', changePct: 0.038 },
    { name: 'Bankacılık', changePct: -0.014 },
    { name: 'Sanayi', changePct: 0.012 },
    { name: 'Enerji', changePct: -0.009 },
    { name: 'Ulaştırma', changePct: 0.021 },
    { name: 'Perakende', changePct: 0.008 },
  ]).slice(0, 9);

  const bg = (v: number) => v > 0 ? 'bg-green-600/20 text-green-800 border-green-300' : v < 0 ? 'bg-red-600/20 text-red-800 border-red-300' : 'bg-slate-200 text-slate-700 border-slate-300';

  return (
    <div className="rounded-lg border p-3 bg-white" title="Veri: BIST sektör endeksleri, son 24 saat.">
      <div className="text-xs font-semibold text-slate-800 mb-2">Sektör Isı Haritası</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((s, i) => (
          <div key={i} className={`rounded-lg border px-3 py-2 ${bg(s.changePct)}`}>
            <div className="text-xs font-semibold">{s.name}</div>
            <div className="text-sm">{(s.changePct*100).toFixed(1)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}


