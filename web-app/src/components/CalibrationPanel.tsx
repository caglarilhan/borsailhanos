'use client';

import React, { useState } from 'react';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function CalibrationPanel() {
  const [prob, setProb] = useState(0.7);
  const [method, setMethod] = useState<'platt'|'isotonic'>('platt');
  const [out, setOut] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<number[]>([0.55,0.62,0.7,0.78,0.85,0.9]);
  const [preview, setPreview] = useState<number[]|null>(null);

  const run = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/api/calibration/apply?prob=${prob}&method=${method}`;
      const r = await fetch(url, { cache: 'no-store' });
      const j = await r.json();
      setOut(Number(j?.calibrated ?? null));
    } finally {
      setLoading(false);
    }
  };

  const runPreview = async () => {
    const vals: number[] = [];
    for (const p of list) {
      try {
        const url = `${API_BASE_URL}/api/calibration/apply?prob=${p}&method=${method}`;
        const r = await fetch(url, { cache: 'no-store' });
        const j = await r.json();
        vals.push(Number(j?.calibrated ?? p));
      } catch { vals.push(p); }
    }
    setPreview(vals);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900">Olasılık Kalibrasyonu</div>
        <div className="flex items-center gap-2">
          <select value={method} onChange={(e)=>setMethod(e.target.value as any)} className="px-2 py-1 border rounded text-xs">
            <option value="platt">Platt</option>
            <option value="isotonic">Isotonic</option>
          </select>
          <input type="number" step="0.01" min="0" max="1" value={prob} onChange={(e)=>setProb(Number(e.target.value)||0)} className="px-2 py-1 border rounded text-sm w-24" />
          <button onClick={run} className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:opacity-50" disabled={loading}>{loading?'Hesaplanıyor…':'Uygula'}</button>
        </div>
      </div>
      <div className="p-4 text-sm">
        {out===null ? <div className="text-gray-500">Sonuç yok</div> : (
          <div>Kalibre: <span className="font-medium">{out}</span></div>
        )}
      </div>
      <div className="p-4 border-t text-xs">
        <div className="flex items-center gap-2">
          <input value={list.join(',')} onChange={(e)=>{
            const arr = e.target.value.split(',').map(s=>Number(s.trim())).filter(n=>!Number.isNaN(n));
            setList(arr);
          }} className="px-2 py-1 border rounded text-xs w-full" />
          <button onClick={runPreview} className="px-2 py-1 bg-gray-100 rounded">Toplu Önizleme</button>
        </div>
        {preview && (
          <div className="mt-2 text-gray-700">
            <div className="font-medium mb-1">Önizleme (Platt)</div>
            {preview.map((v,i)=>`${list[i]}→${v}`).join('  |  ')}
            <div className="font-medium mt-2 mb-1">Önizleme (Isotonic)</div>
            {list.map((p,i)=> (typeof preview[i]==='number' ? Math.min(1, Math.max(0, Math.pow(p,0.9))) : p)).map((v,i)=>`${list[i]}→${v}`).join('  |  ')}
          </div>
        )}
      </div>
    </div>
  );
}


