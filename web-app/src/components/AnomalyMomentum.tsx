'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface HybridSignal { symbol: string; anomaly: number; kama: number; hull: number; trigger: boolean; strength: number }
async function notify(symbol: string, strength: number) {
  try {
    await fetch(`${API_BASE_URL}/api/alerts/test?symbol=${symbol}&strength=${strength}`, { cache: 'no-store' });
  } catch {}
}

export default function AnomalyMomentum() {
  const [symbols, setSymbols] = useState('THYAO,ASELS,TUPRS,AAPL,MSFT');
  const [rows, setRows] = useState<HybridSignal[]>([]);
  const [loading, setLoading] = useState(false);
  const [onlyWatchlist, setOnlyWatchlist] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [threshold, setThreshold] = useState(0.7);
  const [sortBy, setSortBy] = useState<'strength'|'anomaly'|'kama'|'hull'>('strength');
  const [live, setLive] = useState(false);
  const timer = useRef<any>(null);
  const [detail, setDetail] = useState<HybridSignal|null>(null);
  const [history, setHistory] = useState<Record<string, number[]>>({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/signals/anomaly_momentum?symbols=${encodeURIComponent(symbols)}`, { cache: 'no-store' });
      const json = await res.json();
      setRows(Array.isArray(json?.signals) ? json.signals : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(()=>{
    // watchlist yükle
    (async ()=>{
      try {
        const r = await fetch(`${API_BASE_URL}/api/watchlist/get`, { cache: 'no-store' });
        const j = await r.json();
        if (Array.isArray(j?.symbols)) setWatchlist(j.symbols);
      } catch {}
    })();
  },[]);

  useEffect(()=>{
    if (live) {
      load();
      timer.current = setInterval(load, 10000);
    }
    return ()=>{ if (timer.current) clearInterval(timer.current); };
  }, [live, symbols]);

  useEffect(()=>{
    // dummy tetik geçmişi
    const symList = symbols.split(',').map(s=>s.trim().toUpperCase()).filter(Boolean);
    const next: Record<string, number[]> = {};
    symList.forEach(s=>{
      next[s] = Array.from({length:20},(_,i)=> Number((0.5 + Math.sin(i/2+Math.random()*0.3)*0.25).toFixed(2)));
    });
    setHistory(next);
  }, [symbols]);

  const filtered = useMemo(()=>{
    const wlSet = new Set(watchlist);
    let arr = rows.filter(r => (!onlyWatchlist || wlSet.has(r.symbol)) && r.strength >= threshold);
    arr.sort((a,b)=> (b[sortBy] as number) - (a[sortBy] as number));
    return arr;
  }, [rows, onlyWatchlist, watchlist, threshold, sortBy]);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900">Anomali + Üstel Momentum</div>
        <div className="flex items-center gap-2">
          <input value={symbols} onChange={(e)=>setSymbols(e.target.value)} className="px-2 py-1 border rounded text-sm w-80" />
          <button onClick={load} className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:opacity-50" disabled={loading}>{loading?'Yükleniyor…':'Hesapla'}</button>
          <label className="text-xs text-gray-600 flex items-center gap-1">
            <input type="checkbox" checked={live} onChange={(e)=>setLive(e.target.checked)} /> Auto
          </label>
          <label className="text-xs text-gray-600 flex items-center gap-1">
            <input type="checkbox" checked={onlyWatchlist} onChange={(e)=>setOnlyWatchlist(e.target.checked)} /> Watchlist
          </label>
          <label className="text-xs text-gray-600 flex items-center gap-1">
            Eşik
            <input type="number" step="0.01" min="0" max="1" value={threshold} onChange={(e)=>setThreshold(Number(e.target.value)||0)} className="px-2 py-1 border rounded text-xs w-20" />
          </label>
          <select value={sortBy} onChange={(e)=>setSortBy(e.target.value as any)} className="px-2 py-1 border rounded text-xs">
            <option value="strength">Güç</option>
            <option value="anomaly">Anomali</option>
            <option value="kama">KAMA</option>
            <option value="hull">Hull</option>
          </select>
          <button
            onClick={()=>{
              const headers = ['symbol','anomaly','kama','hull','trigger','strength'];
              const lines = [headers.join(',')].concat(filtered.map(r=>[
                r.symbol,r.anomaly,r.kama,r.hull,r.trigger,r.strength
              ].join(',')));
              const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = 'anomaly_momentum.csv'; a.click(); URL.revokeObjectURL(url);
            }}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded"
          >CSV</button>
        </div>
      </div>
      <div className="p-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2 pr-4">Sembol</th>
              <th className="py-2 pr-4">Anomali</th>
              <th className="py-2 pr-4">KAMA</th>
              <th className="py-2 pr-4">Hull</th>
              <th className="py-2 pr-4">Trigger</th>
              <th className="py-2 pr-4">Güç</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length===0 && (<tr><td className="py-4 text-gray-500" colSpan={6}>Kayıt yok</td></tr>)}
            {filtered.map((r,i)=>(
              <tr key={i} className="border-t hover:bg-gray-50 cursor-pointer" onClick={()=>setDetail(r)}>
                <td className="py-2 pr-4 font-medium">{r.symbol}</td>
                <td className="py-2 pr-4">{r.anomaly}</td>
                <td className="py-2 pr-4">{r.kama}</td>
                <td className="py-2 pr-4">{r.hull}</td>
                <td className="py-2 pr-4">{r.trigger ? 'Evet':'Hayır'}</td>
                <td className="py-2 pr-4 flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded">
                    <div className={`h-2 rounded ${r.strength>0.8?'bg-emerald-600':r.strength>0.6?'bg-yellow-500':'bg-gray-400'}`} style={{ width: `${Math.round(r.strength*100)}%` }} />
                  </div>
                  <span>{Math.round(r.strength*100)}</span>
                  {r.trigger && (
                    <button onClick={()=>notify(r.symbol, r.strength)} className="text-xs px-2 py-0.5 rounded bg-emerald-600 text-white">Bildirim</button>
                  )}
                  <button
                    onClick={async ()=>{
                      try { await fetch(`${API_BASE_URL}/api/watchlist/update?symbol=${r.symbol}&op=add`, { cache: 'no-store' }); } catch {}
                    }}
                    className="text-xs px-2 py-0.5 rounded bg-blue-600 text-white"
                  >Takibe Al</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {detail && (
        <div className="p-4 border-t">
          <div className="text-sm font-semibold text-gray-900 mb-2">Detay: {detail.symbol}</div>
          <div className="text-xs text-gray-600">
            <button
              onClick={async ()=>{
                try {
                  const r = await fetch(`${API_BASE_URL}/api/xai/reason?symbol=${detail.symbol}&horizon=1d`, { cache: 'no-store' });
                  const j = await r.json();
                  alert(j?.reason || 'XAI reason bulunamadı');
                } catch {}
              }}
              className="text-xs px-2 py-1 rounded bg-gray-100"
            >XAI Reason</button>
          </div>
          <div className="mt-2 h-20">
            <svg viewBox="0 0 100 20" className="w-full h-full text-emerald-600">
              <polyline fill="none" stroke="currentColor" strokeWidth="1" points={(history[detail.symbol]||[]).map((v,i)=>`${i*5},${20 - v*20}` ).join(' ')} />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}


