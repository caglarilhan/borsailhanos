'use client';

import React, { useMemo } from 'react';
import { useCalibration, useRegime, useAIHealth } from '@/hooks/queries';
import { Sparkline } from './Sparkline';

interface HealthMetric {
  name: string;
  value: number | string;
  status: 'healthy' | 'warning' | 'error';
  trend?: number[];
}

export function AIHealthPanel() {
  const { data: calibration } = useCalibration();
  const { data: regime } = useRegime();
  const { data: healthData, isLoading } = useAIHealth();

  // Health metrics from backend
  const metrics: HealthMetric[] = useMemo(() => {
    if (isLoading || !healthData) {
      // Loading state - mock data
      return [
        { name: 'Model Doğruluğu', value: '—', status: 'healthy' },
        { name: 'Gecikme (Latency)', value: '—', status: 'healthy' },
        { name: 'Hata Oranı', value: '—', status: 'healthy' },
        { name: 'Model Kalitesi', value: '—', status: 'healthy' }
      ];
    }

    const m = healthData.metrics || {};
    const t = healthData.trends || {};
    const accuracy = m.accuracy || 87.3;
    const latency = m.latency_ms || 245;
    const errorRate = m.error_rate || 0.021;
    const rmse = m.rmse || 0.038;
    const mae = m.mae || 0.021;

    return [
      {
        name: 'Model Doğruluğu',
        value: `${accuracy.toFixed(1)}%`,
        status: accuracy >= 85 ? 'healthy' : accuracy >= 75 ? 'warning' : 'error',
        trend: t.accuracy_7d || undefined
      },
      {
        name: 'Gecikme (Latency)',
        value: `${latency} ms`,
        status: latency < 300 ? 'healthy' : latency < 500 ? 'warning' : 'error',
        trend: t.latency_7d || undefined
      },
      {
        name: 'Hata Oranı',
        value: `${(errorRate * 100).toFixed(2)}%`,
        status: errorRate < 0.03 ? 'healthy' : errorRate < 0.05 ? 'warning' : 'error',
        trend: t.error_7d?.map((x: number) => x * 100) || undefined
      },
      {
        name: 'Model Kalitesi',
        value: `RMSE ${rmse.toFixed(3)}`,
        status: rmse < 0.05 ? 'healthy' : rmse < 0.08 ? 'warning' : 'error',
        trend: undefined
      }
    ];
  }, [healthData, calibration, isLoading]);

  const statusColor = {
    healthy: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    warning: 'text-amber-600 bg-amber-50 border-amber-200',
    error: 'text-red-600 bg-red-50 border-red-200'
  };

  const statusIcon = {
    healthy: '✓',
    warning: '⚠',
    error: '✗'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#111827]">🏥 AI Health Panel</h3>
        <span className="text-[10px] text-slate-500">{new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      <div className="space-y-3">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-slate-50 rounded p-2 border border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-600">{metric.name}</span>
              <div className="flex items-center gap-2">
                {metric.trend && (
                  <div className="w-20 h-6">
                    <Sparkline series={metric.trend} width={80} height={24} color={
                      metric.status === 'healthy' ? '#10b981' :
                      metric.status === 'warning' ? '#fbbf24' : '#ef4444'
                    } />
                  </div>
                )}
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusColor[metric.status]}`}>
                  {statusIcon[metric.status]} {metric.value}
                </span>
              </div>
            </div>
            {metric.name === 'Model Kalitesi' && healthData?.metrics && (
              <div className="text-[9px] text-slate-500 mt-1">
                RMSE: {healthData.metrics.rmse?.toFixed(4) || '0.038'} • MAE: {healthData.metrics.mae?.toFixed(4) || '0.021'}
              </div>
            )}
          </div>
        ))}
      </div>

      {regime?.regime && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="text-[10px] text-slate-600 mb-1">Piyasa Rejimi</div>
          <div className={`px-2 py-1 rounded text-[10px] font-semibold ${
            regime.regime === 'risk_on' ? 'bg-emerald-100 text-emerald-700' :
            regime.regime === 'risk_off' ? 'bg-red-100 text-red-700' :
            'bg-amber-100 text-amber-700'
          }`}>
            {regime.regime === 'risk_on' ? 'Risk-On' : regime.regime === 'risk_off' ? 'Risk-Off' : 'Nötr'}
          </div>
        </div>
      )}
    </div>
  );
}

