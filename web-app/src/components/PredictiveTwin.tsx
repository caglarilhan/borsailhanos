'use client';

import React, { useEffect, useState } from 'react';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

type Horizon = '5m'|'15m'|'30m'|'1h'|'4h'|'1d';

interface TwinResponse {
  symbol: string;
  predictions: Record<string, {
    up_prob: number;
    down_prob: number;
    expected_return: number;
    confidence: number;
  }>;
  calibration: { brier_score: number; ece: number };
  drift: { population_stability_index: number; feature_drift_flags: string[] };
  timestamp: string;
}

export default function PredictiveTwin() {
  const [symbol, setSymbol] = useState('THYAO');
  const [horizons, setHorizons] = useState<Horizon[]>(['5m','1h','1d']);
  const [data, setData] = useState<TwinResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/twin?symbol=${symbol}&horizons=${horizons.join(',')}`, { cache: 'no-store' });
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleH = (h: Horizon) => {
    setHorizons((prev) => prev.includes(h) ? prev.filter(x => x!==h) : [...prev, h]);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900">Predictive Twin</div>
        <div className="flex gap-2">
          <input value={symbol} onChange={(e)=>setSymbol(e.target.value.toUpperCase())} className="px-2 py-1 border rounded text-sm" placeholder="Sembol" />
          <div className="flex gap-1">
            {(['5m','15m','30m','1h','4h','1d'] as Horizon[]).map(h => (
              <button key={h} onClick={()=>toggleH(h)} className={`px-2 py-1 text-xs rounded ${horizons.includes(h)?'bg-purple-600 text-white':'bg-gray-100 text-gray-700'}`}>{h}</button>
            ))}
          </div>
          <button onClick={load} className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:opacity-50" disabled={loading}>{loading?'Yükleniyor…':'Getir'}</button>
        </div>
      </div>
      <div className="p-4 space-y-4">
        {!data && <div className="text-sm text-gray-500">Veri yok</div>}
        {data && (
          <>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Kalibrasyon:</span>
              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">Brier {data.calibration.brier_score}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">ECE {data.calibration.ece}</span>
              {data.drift.feature_drift_flags.length>0 ? (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800"><ExclamationTriangleIcon className="h-4 w-4"/>Drift: {data.drift.feature_drift_flags.join(', ')}</span>
              ):(
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-green-100 text-green-700"><CheckCircleIcon className="h-4 w-4"/>Drift yok</span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2 pr-4">Ufuk</th>
                    <th className="py-2 pr-4">Yükseliş Olası.</th>
                    <th className="py-2 pr-4">Düşüş Olası.</th>
                    <th className="py-2 pr-4">Beklenen Getiri</th>
                    <th className="py-2 pr-4">Güven</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.predictions).map(([h, v]) => (
                    <tr key={h} className="border-t">
                      <td className="py-2 pr-4 font-medium">{h}</td>
                      <td className="py-2 pr-4">{(v.up_prob*100).toFixed(1)}%</td>
                      <td className="py-2 pr-4">{(v.down_prob*100).toFixed(1)}%</td>
                      <td className="py-2 pr-4">{(v.expected_return*100).toFixed(2)}%</td>
                      <td className="py-2 pr-4">{(v.confidence*100).toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


