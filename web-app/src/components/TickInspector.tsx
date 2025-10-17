'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '@/lib/config';

interface Tick {
  symbol: string;
  src: 'BIST'|'US';
  price: number;
  size: number;
  bid: number;
  ask: number;
  depth_bid: number;
  depth_ask: number;
  ts: number; // ms
}

export default function TickInspector() {
  const [symbol, setSymbol] = useState('THYAO');
  const [rows, setRows] = useState<Tick[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ingestion/ticks?symbol=${symbol}&limit=80`, { cache: 'no-store' });
      const json = await res.json();
      setRows(Array.isArray(json?.ticks) ? json.ticks : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [symbol]);

  const times = rows.map(r => new Date(r.ts));
  const prices = rows.map(r => r.price);

  const renderMiniChart = () => {
    if (rows.length === 0) return <div className="h-16 bg-gray-100 rounded"/>;
    const w = 300, h = 80;
    const minP = Math.min(...prices), maxP = Math.max(...prices);
    const step = rows.length>1 ? w/(rows.length-1) : w;
    const pts = rows.map((r,i)=>`${i*step},${h - (h*((r.price-minP)/Math.max(0.0001,(maxP-minP))))}`).join(' ');
    return (
      <svg width={w} height={h} className="bg-gray-50 rounded">
        <polyline fill="none" stroke="#2563eb" strokeWidth="2" points={pts} />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900">Tick Inspector</div>
        <div className="flex items-center gap-2">
          <input value={symbol} onChange={(e)=>setSymbol(e.target.value.toUpperCase())} className="px-2 py-1 border rounded text-sm" />
          <button onClick={load} className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:opacity-50" disabled={loading}>{loading?'Yükleniyor…':'Yenile'}</button>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {renderMiniChart()}
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-1 pr-3">Zaman</th>
                <th className="py-1 pr-3">Kaynak</th>
                <th className="py-1 pr-3">Fiyat</th>
                <th className="py-1 pr-3">Bid/Ask</th>
                <th className="py-1 pr-3">Derinlik</th>
                <th className="py-1 pr-3">Miktar</th>
              </tr>
            </thead>
            <tbody>
              {rows.length===0 && (
                <tr><td className="py-2 text-gray-500" colSpan={6}>Kayıt yok</td></tr>
              )}
              {rows.map((r,i)=> (
                <tr key={i} className="border-t">
                  <td className="py-1 pr-3">{new Date(r.ts).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</td>
                  <td className="py-1 pr-3">{r.src}</td>
                  <td className="py-1 pr-3">₺{r.price.toFixed(2)}</td>
                  <td className="py-1 pr-3">{r.bid.toFixed(2)} / {r.ask.toFixed(2)}</td>
                  <td className="py-1 pr-3">{r.depth_bid} / {r.depth_ask}</td>
                  <td className="py-1 pr-3">{r.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


