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
  const [calibrate, setCalibrate] = useState<boolean>(true);
  const [method, setMethod] = useState<'platt'|'isotonic'>('platt');
  const [useModelWeights, setUseModelWeights] = useState<boolean>(false);
  const [lotStep, setLotStep] = useState<number>(1);
  const [maxPositions, setMaxPositions] = useState<number>(5);
  const [profile, setProfile] = useState<'conservative'|'balanced'|'aggressive'>('balanced');

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
          let conf = typeof twinJson?.predictions?.[horizon]?.confidence === 'number' ? twinJson.predictions[horizon].confidence : 0.8;
          if (calibrate) {
            try {
              const cRes = await fetch(`${API_BASE_URL}/api/calibration/apply?prob=${conf}&method=${method}`, { cache: 'no-store' });
              const cJson = await cRes.json();
              if (typeof cJson?.calibrated === 'number') conf = cJson.calibrated;
            } catch {}
          }
          // basit: tüm ağırlıkları confidence ile ölçekleyip normalize et
          const totalW = base.suggestions.reduce((acc: number, s: Suggestion) => acc + s.weight, 0) || 1;
          // Confidence bandlarına göre SL/TP daraltma/genişletme
          const baseBand = conf >= 0.85 ? 1.1 : conf >= 0.7 ? 1.0 : 0.9;
          const profileBand = profile==='aggressive' ? 1.1 : profile==='conservative' ? 0.9 : 1.0;
          const confBand = baseBand * profileBand;
          let scaled = base.suggestions.map((s: Suggestion) => ({ 
            ...s, 
            weight: s.weight * conf,
            take_profit: s.take_profit * confBand,
            stop_loss: s.stop_loss / confBand
          }));
          const sumScaled = scaled.reduce((acc: number, s: Suggestion) => acc + s.weight, 0) || 1;
          scaled = scaled.map((s: Suggestion) => ({ ...s, weight: s.weight / sumScaled }));
          // lot/adet yuvarlama
          scaled = scaled.map((s: Suggestion) => ({ ...s, quantity: Math.max(0, Math.round(s.quantity/lotStep)*lotStep) }));
          // max pozisyon sınırı uygula (yüksek ağırlık öncelikli)
          scaled.sort((a: Suggestion, b: Suggestion)=> b.weight - a.weight);
          scaled = scaled.slice(0, Math.max(1, maxPositions));
          const sumAfter = scaled.reduce((acc:number,s: Suggestion)=> acc + s.weight, 0) || 1;
          scaled = scaled.map((s: Suggestion)=> ({ ...s, weight: s.weight / sumAfter }));
          base = { suggestions: scaled };
        } catch {
          // twin hatasında orijinal dağılımla devam et
        }
      }
      // Regime scaling (Markov regime-switching)
      try {
        const regimeRes = await fetch(`${API_BASE_URL}/api/regime/markov?symbol=BIST100`, { cache: 'no-store' });
        const regime = await regimeRes.json();
        const riskScale = Number(regime?.risk_scale || 1.0);
        const targetScale = Number(regime?.target_scale || 1.0);
        if (Array.isArray(base?.suggestions)) {
          // scale weights and take_profit, then renormalize weights
          let scaled = base.suggestions.map((s: Suggestion) => ({
            ...s,
            weight: s.weight * riskScale,
            take_profit: s.take_profit * targetScale
          }));
          const sumW = scaled.reduce((acc: number, s: Suggestion) => acc + s.weight, 0) || 1;
          scaled = scaled.map((s: Suggestion) => ({ ...s, weight: s.weight / sumW }));
          base = { suggestions: scaled };
        }
      } catch {}

      // Model weights ile yeniden ölçekleme (opsiyonel)
      if (useModelWeights && Array.isArray(base?.suggestions)) {
        try {
          const wRes = await fetch(`${API_BASE_URL}/api/model/weights/update`, { cache: 'no-store' });
          const wJson = await wRes.json();
          const weightBoost = typeof wJson?.weights?.ensemble === 'number' ? wJson.weights.ensemble : 1.0;
          let scaled = base.suggestions.map((s: Suggestion) => ({ ...s, weight: s.weight * weightBoost }));
          const sumW = scaled.reduce((acc: number, s: Suggestion) => acc + s.weight, 0) || 1;
          scaled = scaled.map((s: Suggestion) => ({ ...s, weight: s.weight / sumW }));
          base = { suggestions: scaled };
        } catch {}
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
          <select value={profile} onChange={(e)=>setProfile(e.target.value as any)} className="px-2 py-1 border rounded text-xs">
            <option value="conservative">Conservative</option>
            <option value="balanced">Balanced</option>
            <option value="aggressive">Aggressive</option>
          </select>
          <label className="text-xs text-gray-600 flex items-center gap-1">
            Lot
            <input type="number" min="1" step="1" value={lotStep} onChange={(e)=>setLotStep(Math.max(1, Number(e.target.value)||1))} className="px-2 py-1 border rounded text-xs w-20" />
          </label>
          <label className="text-xs text-gray-600 flex items-center gap-1">
            <input type="checkbox" checked={calibrate} onChange={(e)=>setCalibrate(e.target.checked)} />
            Kalibrasyon
          </label>
          <label className="text-xs text-gray-600 flex items-center gap-1">
            <input type="checkbox" checked={useModelWeights} onChange={(e)=>setUseModelWeights(e.target.checked)} />
            Model Weights
          </label>
          <select value={method} onChange={(e)=>setMethod(e.target.value as any)} className="px-2 py-1 border rounded text-xs">
            <option value="platt">Platt</option>
            <option value="isotonic">Isotonic</option>
          </select>
          <select value={horizon} onChange={(e)=>setHorizon(e.target.value as any)} className="px-2 py-1 border rounded text-xs">
            <option value="1h">1h</option>
            <option value="4h">4h</option>
            <option value="1d">1d</option>
          </select>
          <label className="text-xs text-gray-600 flex items-center gap-1">
            Max Pos
            <input type="number" min="1" step="1" value={maxPositions} onChange={(e)=>setMaxPositions(Math.max(1, Number(e.target.value)||1))} className="px-2 py-1 border rounded text-xs w-20" />
          </label>
          <label className="text-xs text-gray-600 flex items-center gap-1">
            Hedge
            <input type="number" min="0" max="1" step="0.05" value={hedge} onChange={(e)=>setHedge(Math.min(1,Math.max(0, Number(e.target.value)||0)))} className="px-2 py-1 border rounded text-xs w-20" />
          </label>
          <input type="number" value={equity} onChange={(e)=>setEquity(Number(e.target.value)||0)} className="px-2 py-1 border rounded text-sm w-32" />
          <input value={symbols} onChange={(e)=>setSymbols(e.target.value)} className="px-2 py-1 border rounded text-sm w-80" />
          <button onClick={run} className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:opacity-50" disabled={loading}>{loading?'Hesaplanıyor…':'Hesapla'}</button>
        </div>
      </div>
      <div className="p-4">
        {!results && <div className="text-sm text-gray-500">Sonuç yok</div>}
        {results && (
          <div className="overflow-x-auto">
            <div className="text-xs text-gray-500 mb-2">Toplam Ağırlık: {(
              results.suggestions.reduce((acc:number, s: Suggestion)=> acc + s.weight, 0)
            ).toFixed(4)}</div>
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
            <div className="mt-3 flex gap-2">
              <button onClick={()=>{
                const headers=['symbol','weight','price','quantity','stop_loss','take_profit'];
                const lines=[headers.join(',')].concat(results.suggestions.map(s=>headers.map(h=>(s as any)[h]).join(',')));
                const blob=new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8;'});
                const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='risk_engine.csv'; a.click(); URL.revokeObjectURL(url);
              }} className="text-xs px-2 py-1 rounded bg-gray-100">CSV</button>
              <button onClick={async ()=>{
                try { await fetch(`${API_BASE_URL}/api/paper/apply`, { method:'POST' as any }); alert('Mock uygula: Emirler gönderildi (paper).'); } catch {}
              }} className="text-xs px-2 py-1 rounded bg-emerald-600 text-white">Uygula</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


