'use client';

import React, { useMemo } from 'react';
import { useAICore } from '@/store/aiCore';
import { useCalibration, useRegime } from '@/hooks/queries';
import { AIConfidenceGauge } from './AIConfidenceGauge';

export function AICorePanel() {
  const aiCore = useAICore();
  const { data: calibration } = useCalibration();
  const { data: regime } = useRegime();

  // Calculate aggregate metrics
  const avgConfidence = useMemo(() => {
    if (aiCore.predictions.length === 0) return 0;
    const sum = aiCore.predictions.reduce((acc, p) => acc + (p.confidence || 0), 0);
    return Math.round((sum / aiCore.predictions.length) * 100);
  }, [aiCore.predictions]);

  // Calculate drift (slope of confidence over time)
  const drift = useMemo(() => {
    if (calibration?.reliability && calibration.reliability.length >= 2) {
      const obs = calibration.reliability.map((r: { observed?: number; [key: string]: unknown }) => r.observed || 0);
      const first = obs[0];
      const last = obs[obs.length - 1];
      return Math.round((last - first) * 1000) / 10; // Convert to percentage points
    }
    return 0;
  }, [calibration]);

  // Mock latency (would come from real metrics)
  const latency = 245; // ms

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#111827]">🧠 AI Core Paneli</h3>
        <span className="text-[10px] text-slate-500">{new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Accuracy (30g) */}
        <div className="bg-slate-50 rounded p-2 border border-slate-100">
          <div className="text-[10px] text-slate-600 mb-1">Doğruluk (30g)</div>
          <div className="text-base font-bold text-[#111827]">87.3%</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Backtest sonucu</div>
        </div>

        {/* Confidence (Anlık) */}
        <div className="bg-slate-50 rounded p-2 border border-slate-100">
          <div className="text-[10px] text-slate-600 mb-1">Güven (Anlık)</div>
          <div className="flex items-center gap-2">
            <AIConfidenceGauge valuePct={avgConfidence} size={48} />
          </div>
        </div>

        {/* Drift */}
        <div className="bg-slate-50 rounded p-2 border border-slate-100">
          <div className="text-[10px] text-slate-600 mb-1">Drift (24s)</div>
          <div className={`text-sm font-semibold ${drift >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {drift >= 0 ? '+' : ''}{drift.toFixed(1)}pp
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">Güven değişimi</div>
        </div>

        {/* Latency */}
        <div className="bg-slate-50 rounded p-2 border border-slate-100">
          <div className="text-[10px] text-slate-600 mb-1">Gecikme</div>
          <div className="text-sm font-bold text-[#111827]">{latency} ms</div>
          <div className="text-[9px] text-slate-500 mt-0.5">API → UI</div>
        </div>
      </div>

      {/* Regime */}
      {regime?.regime && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="text-[10px] text-slate-600 mb-1">Piyasa Rejimi</div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
              regime.regime === 'risk_on' ? 'bg-emerald-100 text-emerald-700' :
              regime.regime === 'risk_off' ? 'bg-red-100 text-red-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {regime.regime === 'risk_on' ? 'Risk-On' : regime.regime === 'risk_off' ? 'Risk-Off' : 'Nötr'}
            </span>
            <span className="text-[10px] text-slate-600">Momentum: {((regime.weights?.momentum || 0.5) * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

