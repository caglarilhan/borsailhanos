/**
 * Event-Driven Alpha Alerts Component
 * v6.0 Profit Intelligence Suite
 */

'use client';

import React, { useMemo } from 'react';
import { generateEventAlerts, type EventAlertInput } from '@/lib/event-driven-alerts';
import { Skeleton } from '@/components/UI/Skeleton';

interface EventDrivenAlertsProps {
  events?: Array<{
    type: 'TCMB_FAIZ' | 'FED_FAIZ' | 'BILANCO' | 'SECIM' | 'MAKRO_VERI' | 'OTHER';
    name: string;
    date: string;
    symbol?: string;
    sector?: string;
  }>;
  currentPortfolio?: Array<{
    symbol: string;
    weight: number;
    sector: string;
  }>;
  isLoading?: boolean;
}

export function EventDrivenAlerts({
  events = [],
  currentPortfolio = [],
  isLoading,
}: EventDrivenAlertsProps) {
  const alerts = useMemo(() => {
    if (events.length === 0) return [];

    const input: EventAlertInput = {
      events,
      currentPortfolio,
    };

    return generateEventAlerts(input);
  }, [events, currentPortfolio]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-sm font-semibold text-gray-900 mb-2">📅 Event-Driven Alpha Alerts</div>
        <Skeleton className="h-32 w-full rounded" />
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
        <div className="text-sm font-semibold text-gray-900 mb-2">📅 Event-Driven Alpha Alerts</div>
        <div className="text-xs text-slate-600 italic">
          Yaklaşan etkinlik uyarısı yok.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-900">📅 Event-Driven Alpha Alerts</div>
        <div className="text-xs text-slate-500">{alerts.length} uyarı</div>
      </div>

      <div className="space-y-2">
        {alerts.slice(0, 5).map((alert, idx) => {
          const isHigh = alert.priority === 'HIGH';
          const isPositive = alert.expectedImpact === 'POSITIVE';
          const isNegative = alert.expectedImpact === 'NEGATIVE';

          return (
            <div key={idx} className={`px-3 py-2 rounded border ${
              isHigh ? 'bg-red-50 border-red-200' :
              alert.priority === 'MEDIUM' ? 'bg-amber-50 border-amber-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-900">{alert.eventName}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  isHigh ? 'bg-red-100 text-red-700' :
                  alert.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {alert.priority}
                </span>
              </div>
              <div className="text-[10px] text-slate-600 mb-1">
                {new Date(alert.scheduledDate).toLocaleString('tr-TR')} | {alert.timeframe}
              </div>
              <div className={`text-[10px] font-semibold mb-1 ${
                isPositive ? 'text-green-700' : isNegative ? 'text-red-700' : 'text-slate-700'
              }`}>
                {alert.expectedImpact} Etki (%{alert.impactMagnitude.toFixed(1)})
              </div>
              <div className="text-[10px] text-slate-600 mb-1">
                Önerilen: {alert.actionRequired}
              </div>
              <div className="text-[10px] text-slate-500 italic">
                {alert.recommendation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



