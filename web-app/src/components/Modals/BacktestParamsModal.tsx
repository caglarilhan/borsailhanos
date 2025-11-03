'use client';
import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  params: {
    rebalanceDays: number;
    commissionBps: number;
    slippagePct: number;
    taxPct: number;
    maxWeightPct: number;
    minCashPct: number;
  };
  onChange: (p: Props['params']) => void;
}

export function BacktestParamsModal({ open, onClose, params, onChange }: Props) {
  if (!open) return null;
  const set = (k: keyof Props['params'], v: number) => onChange({ ...params, [k]: v });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-w-lg w-full bg-white rounded-lg border border-slate-200 shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Backtest Parametreleri</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="flex flex-col">Rebalance (gün)
            <input type="number" className="border rounded px-2 py-1" value={params.rebalanceDays} min={1} max={30} onChange={(e)=> set('rebalanceDays', Number(e.target.value)||5)} />
          </label>
          <label className="flex flex-col">Komisyon (bps)
            <input type="number" className="border rounded px-2 py-1" value={params.commissionBps} min={0} max={100} onChange={(e)=> set('commissionBps', Number(e.target.value)||8)} />
          </label>
          <label className="flex flex-col">Slippage (%)
            <input type="number" className="border rounded px-2 py-1" step={0.01} value={params.slippagePct} min={0} max={1} onChange={(e)=> set('slippagePct', Number(e.target.value)||0.05)} />
          </label>
          <label className="flex flex-col">Vergi (%)
            <input type="number" className="border rounded px-2 py-1" step={0.1} value={params.taxPct} min={0} max={30} onChange={(e)=> set('taxPct', Number(e.target.value)||0)} />
          </label>
          <label className="flex flex-col">Max Ağırlık (%)
            <input type="number" className="border rounded px-2 py-1" value={params.maxWeightPct} min={1} max={100} onChange={(e)=> set('maxWeightPct', Number(e.target.value)||20)} />
          </label>
          <label className="flex flex-col">Min Nakit (%)
            <input type="number" className="border rounded px-2 py-1" value={params.minCashPct} min={0} max={100} onChange={(e)=> set('minCashPct', Number(e.target.value)||5)} />
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-3 py-1.5 text-xs rounded bg-slate-100 border">Kapat</button>
        </div>
      </div>
    </div>
  );
}



