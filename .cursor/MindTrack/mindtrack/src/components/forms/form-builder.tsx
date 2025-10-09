"use client";

import * as React from "react";
import type { FormField, FormTemplate, FormFieldType } from "@/types/forms";

function uid() { return Math.random().toString(36).slice(2); }

const FIELD_TYPES: { type: FormFieldType; label: string }[] = [
  { type: 'text', label: 'Metin' },
  { type: 'textarea', label: 'Paragraf' },
  { type: 'number', label: 'Sayı' },
  { type: 'date', label: 'Tarih' },
  { type: 'select', label: 'Seçim (Dropdown)' },
  { type: 'checkbox', label: 'Onay Kutusu' },
  { type: 'radio', label: 'Seçenek (Radio)' },
  { type: 'signature', label: 'E‑imza' },
];

interface FormBuilderProps {
  clinicId: string;
}

export default function FormBuilder({ clinicId }: FormBuilderProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [fields, setFields] = React.useState<FormField[]>([]);
  const [version, setVersion] = React.useState(1);
  const [status, setStatus] = React.useState<string | null>(null);

  const addField = (type: FormFieldType) => {
    const base: FormField = { id: uid(), type, label: `${type} alanı`, required: false } as FormField;
    if (type === 'select' || type === 'radio') {
      base.options = [ { value: 'a', label: 'Seçenek A' }, { value: 'b', label: 'Seçenek B' } ];
    }
    setFields(prev => [...prev, base]);
  };

  const updateField = (id: string, patch: Partial<FormField>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));
  };

  const removeField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
  };

  const save = async () => {
    setStatus(null);
    try {
      const res = await fetch('/api/forms/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinic_id: clinicId, name, description, version, fields })
      });
      if (!res.ok) throw new Error('Kaydedilemedi');
      setStatus('Kaydedildi');
    } catch (e: unknown) {
      setStatus(e instanceof Error ? e.message : 'Hata');
    }
  };

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-1 space-y-3">
        <h3 className="text-sm font-semibold">Alanlar</h3>
        {FIELD_TYPES.map(ft => (
          <button key={ft.type} onClick={() => addField(ft.type)} className="w-full text-left px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">
            {ft.label}
          </button>
        ))}
      </div>
      <div className="col-span-3 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Form adı" className="border rounded px-3 py-2" />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Açıklama" className="border rounded px-3 py-2" />
          <input type="number" min={1} value={version} onChange={(e) => setVersion(Number(e.target.value))} className="border rounded px-3 py-2" />
        </div>
        {status && <div className="text-sm text-gray-600">{status}</div>}
        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.id} className="border rounded p-3 space-y-2">
              <div className="flex items-center gap-3">
                <input value={f.label} onChange={(e) => updateField(f.id, { label: e.target.value })} className="border rounded px-2 py-1 flex-1" />
                <label className="text-sm flex items-center gap-1">
                  <input type="checkbox" checked={!!f.required} onChange={(e) => updateField(f.id, { required: e.target.checked })} />
                  Zorunlu
                </label>
                <button onClick={() => removeField(f.id)} className="px-2 py-1 text-sm bg-red-50 text-red-700 rounded">Sil</button>
              </div>
              {(f.type === 'select' || f.type === 'radio') && (
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">Seçenekler</div>
                  {(f.options || []).map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input value={opt.label} onChange={(e) => {
                        const next = (f.options || []).slice();
                        next[idx] = { ...opt, label: e.target.value };
                        updateField(f.id, { options: next });
                      }} className="border rounded px-2 py-1" />
                      <button onClick={() => {
                        const next = (f.options || []).filter((_, i) => i !== idx);
                        updateField(f.id, { options: next });
                      }} className="px-2 py-1 text-xs bg-gray-100 rounded">Kaldır</button>
                    </div>
                  ))}
                  <button onClick={() => updateField(f.id, { options: [ ...(f.options || []), { value: uid(), label: 'Yeni seçenek' } ] })} className="px-2 py-1 text-xs bg-gray-100 rounded">Seçenek ekle</button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="pt-2">
          <button onClick={save} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Kaydet</button>
        </div>
      </div>
    </div>
  );
}


