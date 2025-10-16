'use client';

import React, { useState } from 'react';
import { API_BASE_URL } from '@/lib/config';

interface Suggestion {
  symbol: string;
  weight: number;
  price: number;
  quantity: number;
  stop_loss: number;
  take_profit: number;
}

export default function RiskEngine() {
  const [equity, setEquity] = useState<number>(100000);
  const [symbols, setSymbols] = useState<string>('THYAO,ASELS,TUPRS');
  const [results, setResults] = useState<{ suggestions: Suggestion[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [useTwin, setUseTwin] = useState<boolean>(true);
  const [horizon, setHorizon] = useState<'1d'|'4h'|'1h'>('1d');

  const run = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/api/risk/position_size?equity=${equity}&symbols=${encodeURIComponent(symbols)}`;
      const res = await fetch(url, { cache: 'no-store' });
      const json = await res.json();
      let base = json as { suggestions: Suggestion[] };
      if (useTwin && Array.isArray(base?.suggestions)) {
        const syms = base.suggestions.map(s => s.symbol).join(',');
        try {
          const twinRes = await fetch(`${API_BASE_URL}/api/twin?symbol=${base.suggestions[0]?.symbol || 'THYAO'}&horizons=${horizon}`, { cache: 'no-store' });
          const twinJson = await twinRes.json();
          const conf = typeof twinJson?.predictions?.[horizon]?.confidence === 'number' ? twinJson.predictions[horizon].confidence : 0.8;
          // basit: tüm ağırlıkları confidence ile ölçekleyip normalize et
          const totalW = base.suggestions.reduce((acc: number, s: Suggestion) => acc + s.weight, 0) || 1;
          let scaled = base.suggestions.map((s: Suggestion) => ({ ...s, weight: s.weight * conf }));
          const sumScaled = scaled.reduce((acc: number, s: Suggestion) => acc + s.weight, 0) || 1;
          scaled = scaled.map((s: Suggestion) => ({ ...s, weight: s.weight / sumScaled }));
          base = { suggestions: scaled };
        } catch {
          // twin hatasında orijinal dağılımla devam et
        }
      }
      setResults(base);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900">Risk Engine (Volatility Parity)</div>
        <div className="flex gap-2 items-center">
          <label className="text-xs text-gray-600 flex items-center gap-1">
            <input type="checkbox" checked={useTwin} onChange={(e)=>setUseTwin(e.target.checked)} />
            Twin ile ayarla
          </label>
          <select value={horizon} onChange={(e)=>setHorizon(e.target.value as any)} className="px-2 py-1 border rounded text-xs">
            <option value="1h">1h</option>
            <option value="4h">4h</option>
            <option value="1d">1d</option>
          </select>
          <input type="number" value={equity} onChange={(e)=>setEquity(Number(e.target.value)||0)} className="px-2 py-1 border rounded text-sm w-32" />
          <input value={symbols} onChange={(e)=>setSymbols(e.target.value)} className="px-2 py-1 border rounded text-sm w-80" />
          <button onClick={run} className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:opacity-50" disabled={loading}>{loading?'Hesaplanıyor…':'Hesapla'}</button>
        </div>
      </div>
      <div className="p-4">
        {!results && <div className="text-sm text-gray-500">Sonuç yok</div>}
        {results && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-4">Sembol</th>
                  <th className="py-2 pr-4">Ağırlık</th>
                  <th className="py-2 pr-4">Fiyat</th>
                  <th className="py-2 pr-4">Adet</th>
                  <th className="py-2 pr-4">SL</th>
                  <th className="py-2 pr-4">TP</th>
                </tr>
              </thead>
              <tbody>
                {results.suggestions.map((s) => (
                  <tr key={s.symbol} className="border-t">
                    <td className="py-2 pr-4 font-medium">{s.symbol}</td>
                    <td className="py-2 pr-4">{(s.weight*100).toFixed(2)}%</td>
                    <td className="py-2 pr-4">₺{s.price.toFixed(2)}</td>
                    <td className="py-2 pr-4">{s.quantity}</td>
                    <td className="py-2 pr-4 text-red-600">₺{s.stop_loss.toFixed(2)}</td>
                    <td className="py-2 pr-4 text-green-600">₺{s.take_profit.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


