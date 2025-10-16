'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '@/lib/config';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ClockIcon } from '@heroicons/react/24/outline';

type Horizon = '5m'|'15m'|'30m'|'1h'|'4h'|'1d';
type Universe = 'BIST30'|'BIST100';

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

  const endpoint = useMemo(() => {
    const base = universe === 'BIST30' ? 'bist30_predictions' : 'bist100_predictions';
    const qs = `horizons=${activeHorizons.join(',')}`;
    return `${API_BASE_URL}/api/ai/${base}?${qs}`;
  }, [universe, activeHorizons]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(endpoint, { cache: 'no-store' });
        const data = await res.json();
        if (!mounted) return;
        setRows(Array.isArray(data?.predictions) ? data.predictions : []);
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
          {(['BIST30','BIST100'] as Universe[]).map(u => (
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
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2 pr-4">Sembol</th>
              <th className="py-2 pr-4">Ufuk</th>
              <th className="py-2 pr-4">Sinyal</th>
              <th className="py-2 pr-4">Güven</th>
              <th className="py-2 pr-4">Geçerlilik</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td className="py-4 text-gray-500" colSpan={5}>Yükleniyor…</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td className="py-4 text-gray-500" colSpan={5}>Kayıt yok</td></tr>
            )}
                {!loading && rows
                  .filter(r => !filterWatch || watchlist.includes(r.symbol))
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
                  <td className="py-2 pr-4 flex items-center gap-1 text-gray-600">
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
    </div>
  );
}


