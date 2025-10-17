'use client';

import React, { useEffect, useRef, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { API_BASE_URL } from '@/lib/config';

export default function CrossMarketArbitrage() {
  const [pair, setPair] = useState('THYAO/ADR');
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [live, setLive] = useState(false);
  const timer = useRef<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [history, setHistory] = useState<{t:number; corr:number}[]>([]);
  const [top, setTop] = useState<any[]>([]);
  const [oppThreshold, setOppThreshold] = useState(0.7);
  const [pairWatchlist, setPairWatchlist] = useState<string[]>([]);
  const [autoAlert, setAutoAlert] = useState<{enabled:boolean; threshold:number}>({enabled:false, threshold:0.7});

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE_URL}/api/arbitrage/cross_market?pair=${encodeURIComponent(pair)}`, { cache: 'no-store' });
      const j = await r.json();
      setRes(j);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/api/arbitrage/history?pair=${encodeURIComponent(pair)}`, { cache: 'no-store' });
      const j = await r.json();
      setHistory(Array.isArray(j?.history)? j.history : []);
    } catch {}
  };

  useEffect(()=>{
    if (live) {
      load();
      loadHistory();
      timer.current = setInterval(load, 5000);
    }
    return ()=>{ if (timer.current) clearInterval(timer.current); };
  }, [live, pair]);

  useEffect(()=>{
    (async ()=>{
      try {
        const r = await fetch(`${API_BASE_URL}/api/arbitrage/pairs`, { cache: 'no-store' });
        const j = await r.json();
        if (Array.isArray(j?.pairs)) setSuggestions(j.pairs);
      } catch {}
      try {
        const t = await fetch(`${API_BASE_URL}/api/arbitrage/top`, { cache: 'no-store' });
        const tj = await t.json();
        if (Array.isArray(tj?.top)) setTop(tj.top);
      } catch {}
      try {
        const w = await fetch(`${API_BASE_URL}/api/arbitrage/watchlist/get`, { cache: 'no-store' });
        const wj = await w.json();
        if (Array.isArray(wj?.pairs)) setPairWatchlist(wj.pairs);
      } catch {}
      try {
        const a = await fetch(`${API_BASE_URL}/api/arbitrage/auto_alert`, { cache: 'no-store' });
        const aj = await a.json();
        if (aj && typeof aj.enabled==='boolean') setAutoAlert({enabled: aj.enabled, threshold: Number(aj.threshold)||0.7});
      } catch {}
    })();
  },[]);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900">Cross-Market Arbitraj İpuçları</div>
        <div className="flex items-center gap-2">
          <input value={pair} onChange={(e)=>setPair(e.target.value)} className="px-2 py-1 border rounded text-sm w-56" />
          <select onChange={(e)=>setPair(e.target.value)} className="px-2 py-1 border rounded text-xs">
            <option>Önerilen Çiftler</option>
            {suggestions.map((p)=>(<option key={p} value={p}>{p}</option>))}
          </select>
          <button onClick={load} className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:opacity-50" disabled={loading}>{loading?'Hesaplanıyor…':'Hesapla'}</button>
          <label className="text-xs text-gray-600 flex items-center gap-1">
            <input type="checkbox" checked={live} onChange={(e)=>setLive(e.target.checked)} /> Canlı
          </label>
          <label className="text-xs text-gray-600 flex items-center gap-1">
            Eşik
            <input type="number" min="0" max="1" step="0.01" value={oppThreshold} onChange={(e)=>setOppThreshold(Number(e.target.value)||0)} className="px-2 py-1 border rounded w-20" />
          </label>
          <label className="text-xs text-gray-600 flex items-center gap-1">
            Auto
            <input type="checkbox" checked={autoAlert.enabled} onChange={async (e)=>{
              const en = e.target.checked;
              setAutoAlert(prev=>({...prev, enabled: en}));
              try { await fetch(`${API_BASE_URL}/api/arbitrage/auto_alert?enable=${en?'1':'0'}&threshold=${autoAlert.threshold}`); } catch {}
            }} />
          </label>
        </div>
      </div>
      {top.length>0 && (
        <div className="px-4 pb-3 border-t">
          <div className="text-sm font-semibold text-gray-900 mb-2">Top 5 Fırsat</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-4">Çift</th>
                  <th className="py-2 pr-4">Corr</th>
                  <th className="py-2 pr-4">p</th>
                  <th className="py-2 pr-4">Spread</th>
                  <th className="py-2 pr-4">Skor</th>
                </tr>
              </thead>
              <tbody>
                {top.map((r,i)=>(
                  <tr key={i} className={`border-t ${r.opportunity>=oppThreshold?'bg-emerald-50':''}`}>
                    <td className="py-2 pr-4">{r.pair}</td>
                    <td className="py-2 pr-4">{r.correlation}</td>
                    <td className="py-2 pr-4">{r.cointegration_p}</td>
                    <td className="py-2 pr-4">{r.spread_bps}</td>
                    <td className="py-2 pr-4">{Math.round(r.opportunity*100)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2">
            <button onClick={()=>{
              const headers=['pair','correlation','cointegration_p','spread_bps','opportunity'];
              const lines=[headers.join(',')].concat(top.map(r=>headers.map(h=>r[h]).join(',')));
              const blob=new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8;'});
              const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='arbitrage_top.csv'; a.click(); URL.revokeObjectURL(url);
            }} className="text-xs px-2 py-1 rounded bg-gray-100">CSV</button>
            <button onClick={async ()=>{
              try { await fetch(`${API_BASE_URL}/api/arbitrage/watchlist/update?pair=${encodeURIComponent(pair)}&op=add`, { cache: 'no-store' }); alert('Çift watchlist’e eklendi'); } catch {}
            }} className="ml-2 text-xs px-2 py-1 rounded bg-blue-600 text-white">Çifti Takibe Al</button>
          </div>
        </div>
      )}
      <div className="p-4 text-sm">
        {res ? (
          <div className="space-y-1">
            <div>Çift: <span className="font-medium">{res.pair}</span></div>
            <div>Korelasyon: <span className={`font-medium ${res.correlation>0.8?'text-green-600':res.correlation>0.6?'text-yellow-600':'text-gray-700'}`}>{res.correlation}</span></div>
            <div>Kointegrasyon p: <span className="font-medium">{res.cointegration_p}</span></div>
            <div>Lead/Lag (sn): <span className="font-medium">{res.lead_lag_seconds}</span> → <span className={`font-medium ${res.hint==='lead_US'?'text-blue-600':'text-emerald-600'}`}>{res.hint}</span></div>
            <div>Spread (bps): <span className="font-medium">{res.spread_bps}</span></div>
            <div>Fırsat Skoru: <span className={`font-medium ${res.opportunity>0.75?'text-emerald-600':res.opportunity>0.5?'text-yellow-600':'text-gray-700'}`}>{Math.round((res.opportunity||0)*100)}</span></div>
            <div className="pt-2">
              <button
                onClick={async ()=>{
                  try { await fetch(`${API_BASE_URL}/api/alerts/test?symbol=${encodeURIComponent(res.pair)}&strength=${res.correlation}`, { cache: 'no-store' }); } catch {}
                }}
                className="text-xs px-2 py-1 rounded bg-indigo-600 text-white"
              >Hızlı Uyarı</button>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">Sonuç yok</div>
        )}
        <div className="mt-4 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
              <XAxis dataKey="t" hide />
              <YAxis domain={[0,1]} hide />
              <Tooltip formatter={(v)=>String(v)} labelFormatter={(l)=>`t=${l}`} />
              <Line type="monotone" dataKey="corr" stroke="#2563eb" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}


