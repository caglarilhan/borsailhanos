import React, { useEffect, useState } from 'react';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface Recommendation {
  type: 'shortcut' | 'insight' | 'tip';
  label: string;
  target: string;
}

export default function AdaptiveUI() {
  const [recentTabs, setRecentTabs] = useState<string[]>(['signals','market']);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const sendTelemetry = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/ui/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recentTabs, ts: Date.now() })
      });
    } catch {}
  };

  const fetchRecs = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/api/ui/recommendations?recent=${encodeURIComponent(recentTabs.join(','))}`;
      const res = await fetch(url, { cache: 'no-store' });
      const json = await res.json();
      setRecs(Array.isArray(json?.recommendations) ? json.recommendations : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    sendTelemetry();
    fetchRecs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900">Adaptive UI Öneriler</div>
        <button onClick={fetchRecs} className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:opacity-50" disabled={loading}>{loading ? 'Yükleniyor…' : 'Yenile'}</button>
      </div>
      <div className="p-4 space-y-2">
        {recs.length === 0 && <div className="text-sm text-gray-500">Öneri yok</div>}
        {recs.map((r, i) => (
          <div key={i} className="flex items-center justify-between border rounded p-3">
            <div>
              <div className="text-sm font-medium text-gray-900">{r.label}</div>
              <div className="text-xs text-gray-500">{r.type.toUpperCase()} • hedef: {r.target}</div>
            </div>
            <a href="#" className="text-blue-600 text-sm">Git</a>
          </div>
        ))}
      </div>
    </div>
  );
}
