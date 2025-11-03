'use client';

import React from 'react';

interface CalibrationModalProps {
  open: boolean;
  onClose: () => void;
  ece24h?: number;
  brier24h?: number;
}

export function CalibrationModal({ open, onClose, ece24h = 0.065, brier24h = 0.12 }: CalibrationModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-xl w-full p-4" onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold text-slate-900">Kalibrasyon Metrikleri</div>
          <button className="text-slate-500 hover:text-slate-700" onClick={onClose}>Kapat</button>
        </div>
        <div className="text-xs text-slate-700">ECE (24s): {ece24h.toFixed(3)} • Brier (24s): {brier24h.toFixed(3)}</div>
        <div className="mt-3 text-[10px] text-slate-500">7g / 30g toggle ve reliability diagram burada gösterilecek.</div>
      </div>
    </div>
  );
}


