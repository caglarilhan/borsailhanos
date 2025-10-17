'use client';

import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/config';

export default function FeedbackPanel() {
  const [symbol, setSymbol] = useState('THYAO');
  const [outcome, setOutcome] = useState(0.03);
  const [model, setModel] = useState('ensemble');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE_URL}/api/feedback/submit?symbol=${symbol}&outcome=${outcome}&model=${model}`);
      await r.json();
      await loadStats();
    } finally { setLoading(false); }
  };

  const loadStats = async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/api/feedback/stats`, { cache: 'no-store' });
      const j = await r.json();
      setStats(j);
    } catch {}
  };

  useEffect(()=>{ loadStats(); },[]);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900">Feedback Döngüsü</div>
        <div className="flex items-center gap-2">
          <input value={symbol} onChange={(e)=>setSymbol(e.target.value.toUpperCase())} className="px-2 py-1 border rounded text-sm w-24" />
          <input type="number" step="0.001" value={outcome} onChange={(e)=>setOutcome(Number(e.target.value)||0)} className="px-2 py-1 border rounded text-sm w-24" />
          <select value={model} onChange={(e)=>setModel(e.target.value)} className="px-2 py-1 border rounded text-xs">
            <option value="ensemble">ensemble</option>
            <option value="lgbm">lgbm</option>
            <option value="lstm">lstm</option>
          </select>
          <button onClick={submit} className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:opacity-50" disabled={loading}>{loading?'Gönderiliyor…':'Gönder'}</button>
          <button
            onClick={async ()=>{
              try {
                const r = await fetch(`${API_BASE_URL}/api/model/weights/update`, { cache: 'no-store' });
                const j = await r.json();
                alert('Yeni Ağırlıklar: '+ JSON.stringify(j.weights));
              } catch {}
            }}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded"
          >Ağırlıkları Güncelle</button>
        </div>
      </div>
      <div className="p-4 text-sm">
        {stats ? (
          <div>
            <div>Toplam: <span className="font-medium">{stats.count}</span></div>
            <div className="mt-2">
              {stats.by_model && Object.entries(stats.by_model).map(([m, s]: any)=> (
                <div key={m}>{m}: {s.count} kayıt, ort. outcome {s.avg_outcome}</div>
              ))}
            </div>
          </div>
        ) : (<div className="text-gray-500">İstatistik yok</div>)}
      </div>
    </div>
  );
}


