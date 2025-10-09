"use client";

import * as React from "react";
import type { FormField, FormTemplate } from "@/types/forms";
import SignaturePad from "./signature-pad";

interface FormRunnerProps {
  template: FormTemplate;
  clientId?: string | null;
  kiosk?: boolean;
}

function isVisible(field: FormField, values: Record<string, unknown>) {
  if (!field.condition) return true;
  const { fieldId, operator, value } = field.condition;
  const v = values[fieldId];
  switch (operator) {
    case 'equals': return v === value;
    case 'not_equals': return v !== value;
    case 'exists': return v !== undefined && v !== null && v !== '';
    case 'not_exists': return v === undefined || v === null || v === '';
    case 'gt': return typeof v === 'number' && typeof value === 'number' && v > value;
    case 'lt': return typeof v === 'number' && typeof value === 'number' && v < value;
    case 'includes': return Array.isArray(v) && v.includes(value);
    default: return true;
  }
}

export default function FormRunner({ template, clientId = null, kiosk = false }: FormRunnerProps) {
  const [values, setValues] = React.useState<Record<string, unknown>>({});
  const [signature, setSignature] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const onChange = (id: string, v: unknown) => setValues(prev => ({ ...prev, [id]: v }));

  const submit = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/forms/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: template.id, client_id: clientId, submitted_by: null, data: values, signature_data_url: signature })
      });
      if (!res.ok) throw new Error('Gönderilemedi');
      setStatus('Gönderildi');
      setValues({});
      setSignature(null);
    } catch (e: unknown) {
      setStatus(e instanceof Error ? e.message : 'Hata');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={kiosk ? "p-6 bg-white h-screen" : "p-6 bg-white rounded-lg shadow"}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{template.name}</h2>
        {template.description && <p className="text-sm text-gray-500">{template.description}</p>}
      </div>
      {status && <div className="text-sm text-gray-600 mb-3">{status}</div>}
      <div className="space-y-4">
        {template.fields.map((f) => isVisible(f, values) && (
          <div key={f.id} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{f.label}{f.required && ' *'}</label>
            {f.type === 'text' && (
              <input className="w-full border rounded px-3 py-2" value={(values[f.id] as string) || ''} onChange={(e) => onChange(f.id, e.target.value)} />
            )}
            {f.type === 'textarea' && (
              <textarea className="w-full border rounded px-3 py-2" rows={3} value={(values[f.id] as string) || ''} onChange={(e) => onChange(f.id, e.target.value)} />
            )}
            {f.type === 'number' && (
              <input type="number" className="w-full border rounded px-3 py-2" value={(values[f.id] as number) || 0} onChange={(e) => onChange(f.id, Number(e.target.value))} />
            )}
            {f.type === 'date' && (
              <input type="date" className="w-full border rounded px-3 py-2" value={(values[f.id] as string) || ''} onChange={(e) => onChange(f.id, e.target.value)} />
            )}
            {f.type === 'select' && (
              <select className="w-full border rounded px-3 py-2" value={(values[f.id] as string) || ''} onChange={(e) => onChange(f.id, e.target.value)}>
                <option value="">Seçin</option>
                {(f.options || []).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            )}
            {f.type === 'checkbox' && (
              <input type="checkbox" checked={Boolean(values[f.id])} onChange={(e) => onChange(f.id, e.target.checked)} />
            )}
            {f.type === 'radio' && (
              <div className="flex items-center gap-4">
                {(f.options || []).map(opt => (
                  <label key={opt.value} className="flex items-center gap-2">
                    <input type="radio" name={f.id} value={opt.value} checked={values[f.id] === opt.value} onChange={(e) => onChange(f.id, e.target.value)} />
                    {opt.label}
                  </label>
                ))}
              </div>
            )}
            {f.type === 'signature' && (
              <SignaturePad value={signature} onChange={setSignature} />
            )}
          </div>
        ))}
      </div>
      <div className="pt-4">
        <button onClick={submit} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">Gönder</button>
      </div>
    </div>
  );
}


