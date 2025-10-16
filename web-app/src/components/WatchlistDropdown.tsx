'use client';

import React, { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '@/lib/config';

export default function WatchlistDropdown() {
  const [open, setOpen] = useState(false);
  const [symbols, setSymbols] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const wl = await fetch(`${API_BASE_URL}/api/watchlist/get`).then(r=>r.json());
      if (Array.isArray(wl?.symbols)) setSymbols(wl.symbols);
    } catch {}
  };

  const add = async () => {
    const sym = input.trim().toUpperCase();
    if (!sym) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/watchlist/update?symbols=${sym}&mode=add`).then(r=>r.json());
      if (Array.isArray(res?.symbols)) setSymbols(res.symbols);
      setInput('');
    } catch {}
  };

  const remove = async (sym: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/watchlist/update?symbols=${sym}&mode=remove`).then(r=>r.json());
      if (Array.isArray(res?.symbols)) setSymbols(res.symbols);
    } catch {}
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={(e)=>{e.preventDefault(); setOpen(v=>!v);}} className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">Watchlist</button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow-lg z-50 p-3">
          <div className="flex gap-2 mb-2">
            <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') add(); }} placeholder="Sembol ekle" className="flex-1 px-2 py-1 border rounded text-sm" />
            <button onClick={add} className="px-2 py-1 text-xs bg-blue-600 text-white rounded">Ekle</button>
          </div>
          <div className="max-h-48 overflow-auto space-y-1">
            {symbols.length===0 && <div className="text-xs text-gray-500">Liste boş</div>}
            {symbols.map((s)=> (
              <div key={s} className="flex items-center justify-between text-sm border rounded px-2 py-1">
                <span className="font-medium">{s}</span>
                <button onClick={()=>remove(s)} className="text-xs text-red-600">Kaldır</button>
              </div>
            ))}
          </div>
          <div className="mt-2 text-right">
            <button onClick={()=>setOpen(false)} className="text-xs text-gray-600">Kapat</button>
          </div>
        </div>
      )}
    </div>
  );
}


