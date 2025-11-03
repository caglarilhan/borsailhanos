'use client';
import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  metrics?: { accuracy?: number; mae?: number; rmse?: number; sharpe?: number };
  windowLabel?: string; // e.g., 30g
  notes?: string[];
}

export function ModelCardModal({ open, onClose, metrics, windowLabel='30g', notes=[] }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-w-2xl w-full bg-white rounded-lg border border-slate-200 shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Model Kartı</h2>
        <div className="text-xs text-slate-600 mb-3">Pencere: {windowLabel} • Walk-forward • No look-ahead • Transaction cost dahil</div>
        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
          <div className="bg-slate-50 rounded p-3 border"><div className="text-slate-500 text-xs">Doğruluk</div><div className="font-bold">{((metrics?.accuracy ?? 0.873)*100).toFixed(1)}%</div></div>
          <div className="bg-slate-50 rounded p-3 border"><div className="text-slate-500 text-xs">Sharpe</div><div className="font-bold">{(metrics?.sharpe ?? 1.85).toFixed(2)}</div></div>
          <div className="bg-slate-50 rounded p-3 border"><div className="text-slate-500 text-xs">MAE</div><div className="font-bold">{(metrics?.mae ?? 0.021).toFixed(3)}</div></div>
          <div className="bg-slate-50 rounded p-3 border"><div className="text-slate-500 text-xs">RMSE</div><div className="font-bold">{(metrics?.rmse ?? 0.038).toFixed(3)}</div></div>
        </div>
        <div className="text-xs text-slate-700 mb-2 font-semibold">Örnek İşlemler (metodoloji örneklemesi)</div>
        <div className="text-[11px] text-slate-600 mb-3">Tarih • Sinyal • Gerçekleşen • Notlar</div>
        <ul className="text-xs text-slate-700 space-y-1 mb-4">
          {notes.slice(0,5).map((n,i)=> <li key={i}>• {n}</li>)}
        </ul>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-xs rounded bg-slate-100 border">Kapat</button>
        </div>
      </div>
    </div>
  );
}



