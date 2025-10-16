'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '@/lib/config';

export default function IngestionMonitor() {
  const [status, setStatus] = useState<any>(null);
  const [lag, setLag] = useState<any>(null);
  const [latency, setLatency] = useState<{ ts: number; e2e: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [tickMs, setTickMs] = useState(3000);

  const load = async () => {
    setLoading(true);
    try {
      const [s, l] = await Promise.all([
        fetch(`${API_BASE_URL}/api/ingestion/status`).then(r=>r.json()),
        fetch(`${API_BASE_URL}/api/ingestion/lag`).then(r=>r.json())
      ]);
      setStatus(s);
      setLag(l);
    } finally {
      setLoading(false);
    }
  };

  const pollLatency = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ingestion/latency`, { cache: 'no-store' });
      const json = await res.json();
      const point = { ts: Date.now(), e2e: Number(json?.e2e_latency_ms || 0) };
      setLatency((prev) => [...prev.slice(-60), point]);
    } catch {}
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const t = setInterval(pollLatency, tickMs);
    return () => clearInterval(t);
  }, [tickMs]);

  const lagSeries = useMemo(() => {
    const parts = Array.isArray(lag?.partitions) ? lag.partitions : [];
    return parts.map((p:any) => p.lag);
  }, [lag]);

  const renderLine = (series: number[], color: string, maxY?: number) => {
    if (!series || series.length === 0) return <></>;
    const w = 240, h = 60;
    const maxVal = maxY || Math.max(...series, 1);
    const step = series.length > 1 ? (w / (series.length - 1)) : w;
    const pts = series.map((v, i) => `${i*step},${h - (h * (v / (maxVal||1)))}`).join(' ');
    return (
      <svg width={w} height={h} className="bg-gray-100 rounded">
        <polyline fill="none" stroke={color} strokeWidth="2" points={pts} />
      </svg>
    );
  };

  const renderLatency = () => {
    const series = latency.map(p => p.e2e);
    return renderLine(series, '#2563eb', 500);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900">Ingestion Monitor</div>
        <div className="flex items-center gap-2">
          <select value={tickMs} onChange={(e)=>setTickMs(Number(e.target.value)||3000)} className="px-2 py-1 border rounded text-xs">
            <option value={2000}>2s</option>
            <option value={3000}>3s</option>
            <option value={5000}>5s</option>
          </select>
          <button onClick={load} className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:opacity-50" disabled={loading}>{loading?'Yükleniyor…':'Yenile'}</button>
          <button
            onClick={async ()=>{
              try {
                // register service worker and subscribe push (demo stub)
                if ('serviceWorker' in navigator) {
                  await navigator.serviceWorker.register('/sw.js');
                }
                const token = 'stub-webpush-token-'+Date.now();
                await fetch(`${API_BASE_URL}/api/alerts/register_push`, {
                  method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ token })
                });
                alert('Push bildirimi kaydedildi (stub).');
              } catch {}
            }}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded"
          >Push Kaydı</button>
        </div>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Durum</div>
          <div className="text-sm text-gray-700">Brokers: <span className="font-medium">{status?.brokers || '-'}</span></div>
          <div className="text-sm text-gray-700">Topics: <span className="font-medium">{Array.isArray(status?.topics)? status.topics.join(', '): '-'}</span></div>
          <div className="text-sm text-gray-700">State: <span className={`font-medium ${status?.status==='running'?'text-green-600':'text-red-600'}`}>{status?.status || '-'}</span></div>
          <div className="mt-2">
            <div className="text-xs text-gray-500 mb-1">Consumers</div>
            <div className="space-y-1">
              {Array.isArray(status?.consumers) ? status.consumers.map((c:any, i:number)=> (
                <div key={i} className="flex justify-between text-xs bg-gray-50 rounded p-2">
                  <span>{c.group}</span>
                  <span>lag: {c.lag}</span>
                </div>
              )): <div className="text-xs text-gray-500">-</div>}
            </div>
          </div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Lag & Latency</div>
          <div className="text-xs text-gray-500 mb-1">Partition Lag (son okuma)</div>
          {renderLine(lagSeries, '#16a34a')}
          <div className="text-xs text-gray-500 mt-3 mb-1">E2E Latency (ms) – canlı</div>
          {renderLatency()}
        </div>
      </div>
    </div>
  );
}


