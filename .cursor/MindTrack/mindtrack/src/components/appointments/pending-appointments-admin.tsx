"use client";

import * as React from "react";

interface PendingItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  date: string;
  time: string;
  notes?: string | null;
  status: string;
}

export default function PendingAppointmentsAdmin() {
  const [items, setItems] = React.useState<PendingItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments/pending?status=pending`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'load failed');
      setItems(json.items || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'failed');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const onApprove = async (id: string) => {
    try {
      const res = await fetch('/api/appointments/pending/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error('approve failed');
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'failed');
    }
  };

  const onCancel = async (id: string) => {
    try {
      const res = await fetch('/api/appointments/pending/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error('cancel failed');
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'failed');
    }
  };

  return (
    <div className="p-6 space-y-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Bekleyen Randevu Talepleri</h2>
        <button onClick={load} className="px-3 py-1.5 text-sm bg-gray-100 rounded hover:bg-gray-200">Yenile</button>
      </div>
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
      {loading ? (
        <div className="text-sm text-gray-500">Yükleniyor...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2 pr-4">Ad</th>
                <th className="py-2 pr-4">E‑posta</th>
                <th className="py-2 pr-4">Tarih</th>
                <th className="py-2 pr-4">Saat</th>
                <th className="py-2 pr-4">Not</th>
                <th className="py-2 pr-4">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td className="py-4 text-gray-500" colSpan={6}>Bekleyen talep yok</td>
                </tr>
              ) : items.map((it) => (
                <tr key={it.id} className="border-t">
                  <td className="py-2 pr-4">{it.name}</td>
                  <td className="py-2 pr-4">{it.email}</td>
                  <td className="py-2 pr-4">{it.date}</td>
                  <td className="py-2 pr-4">{it.time}</td>
                  <td className="py-2 pr-4 max-w-[280px] truncate" title={it.notes || ''}>{it.notes || '-'}</td>
                  <td className="py-2 pr-4 space-x-2">
                    <button onClick={() => onApprove(it.id)} className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">Onayla</button>
                    <button onClick={() => onCancel(it.id)} className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">İptal</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


