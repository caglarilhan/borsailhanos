"use client";

import * as React from "react";

interface ClientBillingProps {
  clientId: string;
  clientName: string;
  clientEmail: string;
}

export default function ClientBilling({ clientId, clientName, clientEmail }: ClientBillingProps) {
  const [enabled, setEnabled] = React.useState(false);
  const [fee, setFee] = React.useState(5000); // cents
  const [cutoff, setCutoff] = React.useState(24);
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/billing/no-show-policy?clientId=${clientId}`);
      const json = await res.json();
      if (json?.policy) {
        setEnabled(Boolean(json.policy.enabled));
        setFee(json.policy.fee_cents ?? 5000);
        setCutoff(json.policy.cutoff_hours ?? 24);
      }
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  React.useEffect(() => { load(); }, [load]);

  const savePolicy = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/billing/no-show-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, enabled, feeCents: fee, cutoffHours: cutoff })
      });
      if (!res.ok) throw new Error('Kaydedilemedi');
      setStatus('Kaydedildi');
    } catch (e: unknown) {
      setStatus(e instanceof Error ? e.message : 'Hata');
    } finally {
      setLoading(false);
    }
  };

  const addCard = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/stripe/save-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, clientEmail, clientName })
      });
      const json = await res.json();
      if (!res.ok || !json?.url) throw new Error(json?.error || 'Başlatılamadı');
      window.location.href = json.url as string;
    } catch (e: unknown) {
      setStatus(e instanceof Error ? e.message : 'Hata');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">No‑show / Geç İptal Politikası</h3>
        <button onClick={load} className="px-3 py-1.5 text-sm bg-gray-100 rounded hover:bg-gray-200">Yenile</button>
      </div>

      {status && <div className="text-sm text-gray-600">{status}</div>}

      <div className="flex items-center gap-3">
        <label className="text-sm">Etkin</label>
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Ücret (USD)</label>
          <input type="number" min={0} step={1} value={Math.round(fee / 100)} onChange={(e) => setFee(Number(e.target.value) * 100)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Kesim Süresi (saat)</label>
          <input type="number" min={0} step={1} value={cutoff} onChange={(e) => setCutoff(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="flex items-end">
          <button onClick={savePolicy} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">Kaydet</button>
        </div>
      </div>

      <div className="pt-4 border-t">
        <h4 className="text-sm font-medium mb-2">Kart Saklama</h4>
        <p className="text-xs text-gray-500 mb-3">Danışanın kartını güvenli şekilde saklamak için karta ekleme akışını başlatın.</p>
        <button onClick={addCard} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">Kart Ekle</button>
      </div>
    </div>
  );
}


