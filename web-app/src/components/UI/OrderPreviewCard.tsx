'use client';

import React from 'react';

interface OrderPreviewCardProps {
  symbol: string;
  entryPrice: number;
  takeProfit: number;
  stopLoss: number;
  hitRate?: number; // 0..1
  var95?: number; // daily VaR %
  positionSize?: number; // ₺
}

export function OrderPreviewCard({ symbol, entryPrice, takeProfit, stopLoss, hitRate = 0.62, var95 = 0.9, positionSize = 10000 }: OrderPreviewCardProps) {
  const expectedReturnPct = ((takeProfit - entryPrice) / entryPrice) * 100;
  const riskPct = ((entryPrice - stopLoss) / entryPrice) * 100;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm text-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-slate-900">Order Preview</div>
        <div className="text-slate-500">{symbol}</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
          <div className="text-[10px] text-emerald-700">Hedef</div>
          <div className="font-semibold text-emerald-800">{takeProfit.toFixed(2)} ₺</div>
          <div className="text-[10px] text-emerald-700">+{expectedReturnPct.toFixed(1)}%</div>
        </div>
        <div className="p-2 rounded bg-red-50 border border-red-200">
          <div className="text-[10px] text-red-700">Stop</div>
          <div className="font-semibold text-red-800">{stopLoss.toFixed(2)} ₺</div>
          <div className="text-[10px] text-red-700">-{riskPct.toFixed(1)}%</div>
        </div>
        <div className="p-2 rounded bg-blue-50 border border-blue-200">
          <div className="text-[10px] text-blue-700">Hit-rate</div>
          <div className="font-semibold text-blue-800">{Math.round(hitRate*100)}%</div>
        </div>
        <div className="p-2 rounded bg-purple-50 border border-purple-200">
          <div className="text-[10px] text-purple-700">VaR@95 (günlük)</div>
          <div className="font-semibold text-purple-800">{var95.toFixed(2)}%</div>
        </div>
      </div>
      <div className="mt-2 text-slate-700">
        Pozisyon: <span className="font-semibold">{positionSize.toLocaleString('tr-TR')} ₺</span>
      </div>
    </div>
  );
}


