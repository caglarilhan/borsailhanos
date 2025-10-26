'use client';

import React, { useEffect, useMemo, useState } from 'react';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Quote {
  symbol: string;
  price: number;
  change_pct: number;
  timestamp: string;
}

interface LivePricesProps {
  symbols?: string[];
  refreshMs?: number;
}

const DEFAULT_SYMBOLS = ['THYAO','ASELS','TUPRS','SISE','EREGL','AKBNK','GARAN','ISCTR'];

const LivePrices: React.FC<LivePricesProps> = ({ symbols = DEFAULT_SYMBOLS, refreshMs = 15000 }) => {
  const [watch, setWatch] = useState<string[]>(symbols);
  const [rows, setRows] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [realtime, setRealtime] = useState<boolean>(false);
  const [useWatchlist, setUseWatchlist] = useState<boolean>(true);
  const [watchFromBackend, setWatchFromBackend] = useState<string[]>([]);

  const activeSymbols = useMemo(() => (useWatchlist && watchFromBackend.length>0) ? watchFromBackend : watch, [useWatchlist, watchFromBackend, watch]);

  const endpoint = useMemo(() => {
    const qs = `symbols=${activeSymbols.join(',')}`;
    return `${API_BASE_URL}/api/prices/bulk?${qs}`;
  }, [activeSymbols]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(endpoint, { cache: 'no-store' });
      const data = await res.json();
      const list = Array.isArray(data?.quotes) ? data.quotes as Quote[] : [];
      setRows(list);
      setLastUpdated(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer: any;
    let es: EventSource | null = null;
    // fetch backend watchlist once per tick
    (async ()=>{
      try {
        const wl = await fetch(`${API_BASE_URL}/api/watchlist/get`).then(r=>r.json());
        if (Array.isArray(wl?.symbols)) setWatchFromBackend(wl.symbols);
      } catch {}
    })();
    if (realtime) {
      const url = `${API_BASE_URL}/api/prices/stream?symbols=${activeSymbols.join(',')}`;
      es = new EventSource(url);
      es.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data) as { quotes: Quote[] };
          if (Array.isArray(data.quotes)) {
            setRows(data.quotes);
            setLastUpdated(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          }
        } catch {}
      };
      es.onerror = () => {
        es?.close();
      };
    } else {
      load();
      timer = setInterval(load, refreshMs);
    }
    return () => {
      if (timer) clearInterval(timer);
      if (es) es.close();
    };
  }, [endpoint, refreshMs, realtime, activeSymbols]);

  const addSymbol = () => {
    const sym = input.trim().toUpperCase();
    if (!sym) return;
    if (!watch.includes(sym)) setWatch(prev => [...prev, sym]);
    setInput('');
  };

  const removeSymbol = (sym: string) => {
    setWatch(prev => prev.filter(s => s !== sym));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin text-blue-600' : 'text-gray-400'}`} />
          <h3 className="text-sm font-semibold text-gray-900">Canlı Fiyatlar</h3>
          <span className="text-xs text-gray-500">Güncellendi: {lastUpdated || '-'}</span>
          <label className="flex items-center gap-1 text-xs text-gray-600">
            <input type="checkbox" checked={realtime} onChange={(e) => setRealtime(e.target.checked)} />
            Gerçek zamanlı (SSE)
          </label>
          <label className="flex items-center gap-1 text-xs text-gray-600">
            <input type="checkbox" checked={useWatchlist} onChange={(e) => setUseWatchlist(e.target.checked)} />
            Watchlist
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addSymbol(); }}
            placeholder="Sembol ekle (örn: TUPRS)"
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={addSymbol} className="px-2 py-1 text-sm bg-blue-600 text-white rounded">Ekle</button>
        </div>
      </div>
      <div className="px-4 pt-3 flex flex-wrap gap-2">
        {watch.map(sym => (
          <span key={sym} className="inline-flex items-center gap-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
            {sym}
            <button onClick={() => removeSymbol(sym)} className="text-gray-500 hover:text-gray-700">✕</button>
          </span>
        ))}
      </div>
      <div className="p-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2 pr-4">Sembol</th>
              <th className="py-2 pr-4">Fiyat</th>
              <th className="py-2 pr-4">Değişim</th>
              <th className="py-2 pr-4">Zaman</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td className="py-4 text-gray-500" colSpan={4}>{loading ? 'Yükleniyor…' : 'Kayıt yok'}</td></tr>
            )}
            {rows.map((q) => {
              const up = q.change_pct >= 0;
              return (
                <tr key={`${q.symbol}`} className="border-t">
                  <td className="py-2 pr-4 font-medium">{q.symbol}</td>
                  <td className="py-2 pr-4">₺{q.price.toFixed(2)}</td>
                  <td className="py-2 pr-4 flex items-center gap-1">
                    {up ? <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" /> : <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />}
                    <span className={up ? 'text-green-700' : 'text-red-700'}>
                      {q.change_pct.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-gray-600">{new Date(q.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LivePrices;


