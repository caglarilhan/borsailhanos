'use client';

import React, { useState } from 'react';
import { API_BASE_URL } from '@/lib/config';

export default function ScenarioSimulator() {
  const [scenarios, setScenarios] = useState<number>(500);
  const [rate, setRate] = useState<number>(0.25);
  const [fx, setFx] = useState<number>(35);
  const [vix, setVix] = useState<number>(18);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<'conservative'|'balanced'|'aggressive'>('balanced');

  const run = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/api/simulate?scenarios=${scenarios}&rate=${rate}&fx=${fx}&vix=${vix}`;
      const res = await fetch(url, { cache: 'no-store' });
      const json = await res.json();
      // profil bazlı beklenen getiri ayarlaması (gösterim amaçlı): agresif +%20, konservatif -%20
      const mult = profile==='aggressive' ? 1.2 : profile==='conservative' ? 0.8 : 1.0;
      if (json?.summary) {
        json.summary.avg_return = Number(json.summary.avg_return) * mult;
      }
      setResult(json);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900">Scenario Simulator</div>
        <div className="flex items-center gap-3">
          <select value={profile} onChange={(e)=>setProfile(e.target.value as any)} className="px-2 py-1 border rounded text-xs">
            <option value="conservative">Konservatif</option>
            <option value="balanced">Dengeli</option>
            <option value="aggressive">Agresif</option>
          </select>
          <label className="text-xs text-gray-600">Faiz: {rate}
            <input type="range" min="0" max="1" step="0.01" value={rate} onChange={(e)=>setRate(Number(e.target.value))} className="ml-2" />
          </label>
          <label className="text-xs text-gray-600">Kur: {fx}
            <input type="range" min="10" max="60" step="1" value={fx} onChange={(e)=>setFx(Number(e.target.value))} className="ml-2" />
          </label>
          <label className="text-xs text-gray-600">VIX: {vix}
            <input type="range" min="10" max="40" step="1" value={vix} onChange={(e)=>setVix(Number(e.target.value))} className="ml-2" />
          </label>
          <button onClick={run} className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:opacity-50" disabled={loading}>{loading?'Çalışıyor…':'Simüle Et'}</button>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {!result && <div className="text-sm text-gray-500">Sonuç yok</div>}
        {result && (
          <>
            <div className="text-sm text-gray-700">Ortalama Getiri: <span className="font-medium">{(result.summary?.avg_return*100).toFixed(2)}%</span></div>
            <div className="text-sm text-gray-700">VaR 95: <span className="font-medium">{(result.summary?.var_95*100).toFixed(2)}%</span> | VaR 99: <span className="font-medium">{(result.summary?.var_99*100).toFixed(2)}%</span></div>
            <div className="text-xs text-gray-500">Örnek PnL (100 örnek): {Array.isArray(result.pnl_samples) ? result.pnl_samples.slice(0,10).map((v:number)=> (v*100).toFixed(1)+'%').join(', ') : '-'}</div>
          </>
        )}
      </div>
    </div>
  );
}


