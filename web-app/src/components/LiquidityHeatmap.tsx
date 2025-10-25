'use client';

import React, { useEffect, useMemo, useState } from 'react';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface Cell { price: number; bid: number; ask: number; cancel: number; vwap_dev: number }

export default function LiquidityHeatmap() {
  const [symbol, setSymbol] = useState('THYAO');
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/liquidity/heatmap?symbol=${symbol}`, { cache: 'no-store' });
      const json = await res.json();
      setGrid(Array.isArray(json?.grid) ? json.grid : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [symbol]);

  const color = (cell: Cell) => {
    const bid = cell.bid || 0; const ask = cell.ask || 0;
    const pressure = (bid - ask) / 100; // -1..+1
    const r = Math.max(0, Math.min(255, Math.round(128 - 128*pressure)));
    const g = Math.max(0, Math.min(255, Math.round(128 + 64*pressure)));
    const b = 160;
    const alpha = 0.4 + 0.6*Math.min(1, cell.cancel);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900">Refleksif Likidite Heatmap</div>
        <div className="flex items-center gap-2">
          <input value={symbol} onChange={(e)=>setSymbol(e.target.value.toUpperCase())} className="px-2 py-1 border rounded text-sm" />
          <button onClick={load} className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:opacity-50" disabled={loading}>{loading?'Yükleniyor…':'Yenile'}</button>
        </div>
      </div>
      <div className="p-4">
        <div className="overflow-auto">
          <table className="text-[10px]">
            <tbody>
              {grid.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} title={`P:${cell.price} bid:${cell.bid} ask:${cell.ask} cancel:${cell.cancel} vwap:${cell.vwap_dev}`} style={{ background: color(cell), width: 16, height: 12 }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {grid.length===0 && <div className="text-sm text-gray-500 mt-2">Kayıt yok</div>}
      </div>
    </div>
  );
}


