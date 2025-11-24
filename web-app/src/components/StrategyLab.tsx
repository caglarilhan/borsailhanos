'use client';

import React, { useState, useMemo } from 'react';
import { buildPolylinePoints } from '@/lib/svgChart';

interface StrategyResult {
  strategy: string;
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  trades: number;
}

export function StrategyLab() {
  const [selectedStrategy, setSelectedStrategy] = useState<'momentum' | 'meanreversion' | 'mixed'>('momentum');
  const [period, setPeriod] = useState<'30d' | '90d' | '180d'>('90d');

  // Mock strategy comparison results
  const strategyResults: StrategyResult[] = useMemo(() => [
    {
      strategy: 'Momentum',
      totalReturn: 12.5,
      sharpeRatio: 1.45,
      maxDrawdown: -8.2,
      winRate: 68.5,
      trades: 24,
    },
    {
      strategy: 'Mean Reversion',
      totalReturn: 9.3,
      sharpeRatio: 1.28,
      maxDrawdown: -5.1,
      winRate: 72.3,
      trades: 18,
    },
    {
      strategy: 'Mixed AI',
      totalReturn: 14.8,
      sharpeRatio: 1.62,
      maxDrawdown: -6.5,
      winRate: 71.2,
      trades: 31,
    },
  ], []);

  // Mock equity curve
  const equityCurve = useMemo(() => {
    const days = period === '30d' ? 30 : period === '90d' ? 90 : 180;
    return Array.from({ length: days }, (_, i) => {
      const base = selectedStrategy === 'momentum' ? 1.125 : selectedStrategy === 'meanreversion' ? 1.093 : 1.148;
      const noise = (Math.random() - 0.5) * 0.05;
      const trend = (i / days) * (base - 1);
      return {
        day: i + 1,
        equity: 100000 * (1 + trend + noise),
      };
    });
  }, [selectedStrategy, period]);

  const equityPoints = useMemo(
    () => buildPolylinePoints(equityCurve, 'equity', { width: 520, height: 140, padding: 18 }),
    [equityCurve]
  );

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">🧪 Strategy Lab</h3>
        <div className="flex gap-2 mb-3">
          <select
            value={selectedStrategy}
            onChange={(e) => setSelectedStrategy(e.target.value as any)}
            className="px-3 py-1 text-xs border rounded text-slate-700 bg-white"
          >
            <option value="momentum">Momentum</option>
            <option value="meanreversion">Mean Reversion</option>
            <option value="mixed">Mixed AI</option>
          </select>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3 py-1 text-xs border rounded text-slate-700 bg-white"
          >
            <option value="30d">30 Gün</option>
            <option value="90d">90 Gün</option>
            <option value="180d">180 Gün</option>
          </select>
        </div>
      </div>

      {/* Strategy Comparison */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-slate-700 mb-2">Strateji Karşılaştırması</h4>
        <div className="space-y-3">
          {strategyResults.map((result) => (
            <div key={result.strategy} className="bg-slate-50 rounded-lg p-3">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>{result.strategy}</span>
                <span>{result.totalReturn.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded mt-2">
                <div
                  className="h-full rounded bg-gradient-to-r from-emerald-400 to-emerald-600"
                  style={{ width: `${Math.min(Math.max(result.totalReturn, 0), 20) * 5}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-slate-500">
                <span>Sharpe {result.sharpeRatio.toFixed(2)}</span>
                <span>Win Rate {result.winRate.toFixed(1)}%</span>
                <span>Max DD {result.maxDrawdown.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Equity Curve */}
      <div>
        <h4 className="text-xs font-semibold text-slate-700 mb-2">
          Equity Curve ({selectedStrategy} - {period})
        </h4>
        <div className="h-40 bg-slate-50 rounded-lg p-2">
          {equityPoints ? (
            <svg width="100%" height="100%" viewBox="0 0 520 140" preserveAspectRatio="none">
              <polyline
                points={equityPoints}
                fill="none"
                stroke="#10b981"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Veri yok
            </div>
          )}
        </div>
      </div>

      {/* Metrics Table */}
      <div className="mt-3 text-xs">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1">Strateji</th>
              <th className="text-right py-1">Getiri (%)</th>
              <th className="text-right py-1">Sharpe</th>
              <th className="text-right py-1">Max DD (%)</th>
              <th className="text-right py-1">Win Rate (%)</th>
            </tr>
          </thead>
          <tbody>
            {strategyResults.map((s) => (
              <tr key={s.strategy} className={selectedStrategy === s.strategy.toLowerCase().replace(' ', '') ? 'bg-blue-50' : ''}>
                <td className="py-1 font-medium">{s.strategy}</td>
                <td className="text-right py-1">{s.totalReturn.toFixed(1)}</td>
                <td className="text-right py-1">{s.sharpeRatio.toFixed(2)}</td>
                <td className="text-right py-1 text-red-600">{s.maxDrawdown.toFixed(1)}</td>
                <td className="text-right py-1">{s.winRate.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}



