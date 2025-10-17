'use client';

import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/config';

interface SectorRow { sector: string; strength: number; top_symbols: string[] }

export default function SectorStrength() {
  const [market, setMarket] = useState<'BIST'|'US'|'BOTH'>('BIST');
  const [rows, setRows] = useState<SectorRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/sector/relative_strength?market=${market}`, { cache: 'no-store' });
      const json = await res.json();
      setRows(Array.isArray(json?.sectors) ? json.sectors : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [market]);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900">Sektör Göreceli Güç</div>
        <div className="flex items-center gap-2">
          <select value={market} onChange={(e)=>setMarket(e.target.value as any)} className="px-2 py-1 border rounded text-xs">
            <option value="BIST">BIST</option>
            <option value="US">US</option>
            <option value="BOTH">BOTH</option>
          </select>
          <button onClick={load} className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:opacity-50" disabled={loading}>{loading?'Yükleniyor…':'Yenile'}</button>
        </div>
      </div>
      <div className="p-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2 pr-4">Sektör</th>
              <th className="py-2 pr-4">Güç</th>
              <th className="py-2 pr-4">Top Semboller</th>
            </tr>
          </thead>
          <tbody>
            {rows.length===0 && (<tr><td className="py-4 text-gray-500" colSpan={3}>Kayıt yok</td></tr>)}
            {rows.map((r,i)=>(
              <tr key={i} className="border-t">
                <td className="py-2 pr-4 font-medium">{r.sector}</td>
                <td className="py-2 pr-4">
                  <span className={`px-2 py-0.5 rounded ${r.strength>=0?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>
                    {Math.round(r.strength*100)}
                  </span>
                </td>
                <td className="py-2 pr-4 text-gray-700">{r.top_symbols.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


