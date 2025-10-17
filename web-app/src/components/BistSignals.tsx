'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '@/lib/config';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ClockIcon } from '@heroicons/react/24/outline';

type Horizon = '5m'|'15m'|'30m'|'1h'|'4h'|'1d';
type Universe = 'BIST30'|'BIST100'|'ALL';

interface Prediction {
  symbol: string;
  horizon: Horizon;
  prediction: number;   // -1..+1
  confidence: number;   // 0..1
  valid_until: string;
  generated_at: string;
}

const HORIZONS: Horizon[] = ['5m','15m','30m','1h','4h','1d'];

export default function BistSignals() {
  const [universe, setUniverse] = useState<Universe>('BIST30');
  const [activeHorizons, setActiveHorizons] = useState<Horizon[]>(['5m','15m','30m','1h']);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Prediction[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [filterWatch, setFilterWatch] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [view, setView] = useState<'table'|'cards'>('table');

  const endpoint = useMemo(() => {
    if (universe === 'ALL') return null;
    const base = universe === 'BIST30' ? 'bist30_predictions' : 'bist100_predictions';
    const qs = `horizons=${activeHorizons.join(',')}&all=1`;
    return `${API_BASE_URL}/api/ai/${base}?${qs}`;
  }, [universe, activeHorizons]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        let merged: Prediction[] = [];
        if (universe === 'ALL') {
          const qs = `horizons=${activeHorizons.join(',')}&all=1`;
          const [d30, d100] = await Promise.all([
            fetch(`${API_BASE_URL}/api/ai/bist30_predictions?${qs}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>({predictions:[]})),
            fetch(`${API_BASE_URL}/api/ai/bist100_predictions?${qs}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>({predictions:[]}))
          ]);
          const map = new Map<string, Prediction>();
          [...(d30?.predictions||[]), ...(d100?.predictions||[])].forEach((p: Prediction)=>{
            const key = `${p.symbol}-${p.horizon}`;
            if (!map.has(key)) map.set(key, p);
            else {
              const prev = map.get(key)!;
              if ((p.confidence||0) > (prev.confidence||0)) map.set(key, p);
            }
          });
          merged = Array.from(map.values());
          // sort by confidence desc
          merged.sort((a,b)=> (b.confidence||0) - (a.confidence||0));
        } else if (endpoint) {
          const res = await fetch(endpoint, { cache: 'no-store' });
          const data = await res.json();
          merged = Array.isArray(data?.predictions) ? data.predictions : [];
        }
        if (!mounted) return;
        setRows(merged);
        // watchlist fetch
        const wl = await fetch(`${API_BASE_URL}/api/watchlist/get`).then(r=>r.json()).catch(()=>({symbols:[]}));
        if (Array.isArray(wl?.symbols)) setWatchlist(wl.symbols);
      } catch {
        if (mounted) setRows([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [endpoint]);

  const toggleHorizon = (h: Horizon) => {
    setActiveHorizons(prev =>
      prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['BIST30','BIST100','ALL'] as Universe[]).map(u => (
            <button
              key={u}
              onClick={() => setUniverse(u)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${universe===u ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {u}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto items-center">
          {HORIZONS.map(h => (
            <button
              key={h}
              onClick={() => toggleHorizon(h)}
              className={`px-2 py-1 rounded-md text-xs whitespace-nowrap ${activeHorizons.includes(h) ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {h}
            </button>
          ))}
          <label className="flex items-center gap-1 text-xs text-gray-600 ml-2">
            <input type="checkbox" checked={filterWatch} onChange={(e)=>setFilterWatch(e.target.checked)} />
            Watchlist filtresi
          </label>
          <input
            value={search}
            onChange={(e)=>setSearch(e.target.value.toUpperCase())}
            placeholder="Sembol ara"
            className="ml-2 px-2 py-1 text-xs border rounded w-28"
          />
          <div className="ml-2 flex items-center gap-1 text-xs">
            <button
              onClick={()=>setView('table')}
              className={`px-2 py-1 rounded ${view==='table'?'bg-blue-600 text-white':'bg-gray-100 text-gray-700'}`}
            >Tablo</button>
            <button
              onClick={()=>setView('cards')}
              className={`px-2 py-1 rounded ${view==='cards'?'bg-blue-600 text-white':'bg-gray-100 text-gray-700'}`}
            >Kartlar</button>
          </div>
        </div>
      </div>

      {/* Filtered dataset */}
      {(()=>{ return null; })()}
      {/* Table */}
      {view==='table' && (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-900">
              <th className="py-2 pr-4">Sembol</th>
              <th className="py-2 pr-4">Ufuk</th>
              <th className="py-2 pr-4">Sinyal</th>
              <th className="py-2 pr-4">Güven</th>
              <th className="py-2 pr-4">Geçerlilik</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td className="py-4 text-gray-800" colSpan={5}>Yükleniyor…</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td className="py-4 text-gray-800" colSpan={5}>Kayıt yok</td></tr>
            )}
                {!loading && rows
                  .filter(r => (!filterWatch || watchlist.includes(r.symbol)) && (search==='' || r.symbol.includes(search)))
                  .map((r, i) => {
              const up = r.prediction >= 0;
              const confPct = Math.round(r.confidence * 100);
                  const inWatch = watchlist.includes(r.symbol);
              return (
                <tr key={`${r.symbol}-${r.horizon}-${i}`} className="border-t">
                  <td className="py-2 pr-4 font-medium">{r.symbol}</td>
                  <td className="py-2 pr-4">{r.horizon}</td>
                  <td className="py-2 pr-4 flex items-center gap-1">
                    {up ? <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" /> : <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />}
                    <span className={up ? 'text-green-700' : 'text-red-700'}>
                      {up ? 'Yükseliş' : 'Düşüş'} ({(r.prediction*100).toFixed(1)}%)
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-0.5 rounded ${confPct>=85 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {confPct}%
                    </span>
                  </td>
                  <td className="py-2 pr-4 flex items-center gap-1 text-gray-800">
                    <ClockIcon className="h-4 w-4" />
                    Geçerlilik: {new Date(r.valid_until).toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'})}
                  </td>
                      <td className="py-2 pr-4">
                        <button
                          onClick={async ()=>{
                            try {
                              const mode = inWatch ? 'remove':'add';
                              const qs = `symbols=${r.symbol}&mode=${mode}`;
                              const wl = await fetch(`${API_BASE_URL}/api/watchlist/update?${qs}`).then(r=>r.json());
                              if (Array.isArray(wl?.symbols)) setWatchlist(wl.symbols);
                            } catch {}
                          }}
                          className={`px-2 py-1 text-xs rounded ${inWatch?'bg-yellow-100 text-yellow-800':'bg-gray-100 text-gray-700'}`}
                        >{inWatch?'Takipte':'Takibe Al'}</button>
                      </td>
                      <td className="py-2 pr-4">
                        {confPct>=85 && (
                          <button
                            onClick={async ()=>{
                              try {
                                await fetch(`${API_BASE_URL}/api/alerts/test?title=Yüksek Güven Sinyali&body=${encodeURIComponent(r.symbol+' '+r.horizon)}`);
                              } catch {}
                            }}
                            className="px-2 py-1 text-xs rounded bg-blue-600 text-white"
                          >Bildirim</button>
                        )}
                      </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

      {/* Cards */}
      {view==='cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(() => {
            if (loading) return null;
            const groups = rows
              .filter(r => (!filterWatch || watchlist.includes(r.symbol)) && (search==='' || r.symbol.includes(search)))
              .reduce((acc: Record<string, Prediction[]>, p) => {
                (acc[p.symbol] = acc[p.symbol] || []).push(p);
                return acc;
              }, {} as Record<string, Prediction[]>);
            return Object.entries(groups).map(([sym, list]) => {
              const best = list.slice().sort((a,b)=> (b.confidence||0)-(a.confidence||0))[0];
              const up = best.prediction >= 0;
              const confPct = Math.round(best.confidence*100);
              const inWatch = watchlist.includes(sym);
              return (
                <div key={sym} className="border rounded-lg p-3 bg-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-900">{sym}</div>
                    <div className={`text-xs px-2 py-0.5 rounded ${up?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{up?'Yükseliş':'Düşüş'}</div>
                  </div>
                  <div className="mt-2 text-sm text-gray-800">En iyi güven: {confPct}% • Ufuk: {best.horizon}</div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-700">
                    <ClockIcon className="h-4 w-4" />
                    Geçerlilik: {new Date(best.valid_until).toLocaleTimeString('tr-TR', {hour:'2-digit',minute:'2-digit'})}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={async ()=>{
                        try { const mode = inWatch ? 'remove':'add'; const qs = `symbols=${sym}&mode=${mode}`; const wl = await fetch(`${API_BASE_URL}/api/watchlist/update?${qs}`).then(r=>r.json()); if (Array.isArray(wl?.symbols)) setWatchlist(wl.symbols);} catch {}
                      }}
                      className={`px-2 py-1 text-xs rounded ${inWatch?'bg-yellow-100 text-yellow-800':'bg-gray-100 text-gray-700'}`}
                    >{inWatch?'Takipte':'Takibe Al'}</button>
                    {confPct>=85 && (
                      <button
                        onClick={async ()=>{ try { await fetch(`${API_BASE_URL}/api/alerts/test?title=Yüksek Güven Sinyali&body=${encodeURIComponent(sym+' '+best.horizon)}`);} catch {} }}
                        className="px-2 py-1 text-xs rounded bg-blue-600 text-white"
                      >Bildirim</button>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
}


