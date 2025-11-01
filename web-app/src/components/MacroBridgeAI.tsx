'use client';

import React, { useEffect, useState } from 'react';
import { useMacro } from '@/hooks/queries';
import { Skeleton } from './UI/Skeleton';

export function MacroBridgeAI() {
  const { data: macroData, isLoading } = useMacro();

  if (isLoading || !macroData) {
    return (
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-sm font-semibold text-[#111827] mb-3">🌍 MacroBridge AI</div>
        <Skeleton className="h-20 w-full rounded" />
      </div>
    );
  }

  const macro = macroData || {};
  const usdTry = macro.usd_try || macro.usdtry || 34.5;
  const cds5y = macro.cds_5y || macro.cds5y || 280;
  const vix = macro.vix || 18.5;
  const policyRate = macro.policy_rate || macro.policyRate || 45.0;
  const sectorImpacts = macro.sector_impacts || [];
  const recentEvents = macro.recent_events || [];
  const marketRegime = macro.market_regime || macro.marketRegime || 'neutral';

  // Trend indicators
  const trend = {
    usd_try: usdTry > 35 ? 'up' : usdTry < 34 ? 'down' : 'neutral',
    cds_5y: cds5y > 300 ? 'up' : cds5y < 250 ? 'down' : 'neutral',
    vix: vix > 20 ? 'up' : vix < 15 ? 'down' : 'neutral',
    policy_rate: policyRate > 46 ? 'up' : policyRate < 44 ? 'down' : 'neutral',
  };

  // Fallback sector impacts if not provided
  const defaultSectorImpacts = [
    { sector: 'Bankacılık', impact: 'pozitif', reason: 'Faiz artışı kâr marjını artırır', confidence: 75 },
    { sector: 'Teknoloji', impact: 'negatif', reason: 'USD/TRY yükselişi ithalat maliyetlerini artırır', confidence: 68 },
    { sector: 'Enerji', impact: 'nötr', reason: 'Fiyatlar dolar bazlı, etkisi dengelenir', confidence: 55 },
    { sector: 'İnşaat', impact: 'negatif', reason: 'Yüksek faiz borçlanmayı zorlaştırır', confidence: 72 },
  ];
  
  const finalSectorImpacts = sectorImpacts.length > 0 ? sectorImpacts : defaultSectorImpacts;

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-[#111827]">🌍 MacroBridge AI</div>
        <div className="text-xs text-slate-500">Son güncelleme: {macro.generated_at ? new Date(macro.generated_at).toLocaleTimeString('tr-TR') : '—'}</div>
      </div>

      {/* Macro Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-slate-50 rounded p-2 border border-slate-200">
          <div className="text-[10px] text-slate-600 mb-1">USD/TRY</div>
          <div className={`text-sm font-bold ${trend.usd_try === 'up' ? 'text-red-600' : trend.usd_try === 'down' ? 'text-green-600' : 'text-[#111827]'}`}>
            {usdTry.toFixed(2)}
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">
            {trend.usd_try === 'up' ? '↑ Yükseliş' : trend.usd_try === 'down' ? '↓ Düşüş' : '→ Stabil'}
          </div>
        </div>

        <div className="bg-slate-50 rounded p-2 border border-slate-200">
          <div className="text-[10px] text-slate-600 mb-1">CDS 5Y (bps)</div>
          <div className={`text-sm font-bold ${trend.cds_5y === 'up' ? 'text-red-600' : trend.cds_5y === 'down' ? 'text-green-600' : 'text-[#111827]'}`}>
            {cds5y}
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">
            {trend.cds_5y === 'up' ? '↑ Risk artıyor' : trend.cds_5y === 'down' ? '↓ Risk azalıyor' : '→ Stabil'}
          </div>
        </div>

        <div className="bg-slate-50 rounded p-2 border border-slate-200">
          <div className="text-[10px] text-slate-600 mb-1">VIX</div>
          <div className={`text-sm font-bold ${trend.vix === 'up' ? 'text-red-600' : trend.vix === 'down' ? 'text-green-600' : 'text-[#111827]'}`}>
            {vix.toFixed(1)}
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">
            {trend.vix === 'up' ? '↑ Volatilite artıyor' : trend.vix === 'down' ? '↓ Volatilite azalıyor' : '→ Stabil'}
          </div>
        </div>

        <div className="bg-slate-50 rounded p-2 border border-slate-200">
          <div className="text-[10px] text-slate-600 mb-1">TCMB Faiz (%)</div>
          <div className={`text-sm font-bold ${trend.policy_rate === 'up' ? 'text-red-600' : trend.policy_rate === 'down' ? 'text-green-600' : 'text-[#111827]'}`}>
            {policyRate.toFixed(1)}%
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">
            {trend.policy_rate === 'up' ? '↑ Artış' : trend.policy_rate === 'down' ? '↓ Azalış' : '→ Değişmedi'}
          </div>
        </div>
      </div>

      {/* Market Regime */}
      {marketRegime && (
        <div className="mb-4 p-2 rounded bg-slate-50 border border-slate-200">
          <div className="text-xs font-semibold text-[#111827] mb-1">Piyasa Rejimi</div>
          <div className={`text-sm font-bold ${
            marketRegime === 'risk_on' ? 'text-green-600' :
            marketRegime === 'risk_off' ? 'text-red-600' :
            'text-amber-600'
          }`}>
            {marketRegime === 'risk_on' ? '🟢 Risk-On (Riske Açık)' :
             marketRegime === 'risk_off' ? '🔴 Risk-Off (Riske Kapalı)' :
             '🟡 Nötr'}
          </div>
          {macro.ai_summary && (
            <div className="text-[10px] text-slate-600 mt-1">{macro.ai_summary}</div>
          )}
        </div>
      )}

      {/* Sector Impact Analysis */}
      <div className="mt-4">
        <div className="text-xs font-semibold text-[#111827] mb-2">📊 Sektör Etkisi Analizi</div>
        <div className="space-y-2">
          {finalSectorImpacts.map((impact, i) => (
            <div key={i} className="bg-slate-50 rounded p-2 border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-[#111827]">{impact.sector}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  impact.impact === 'pozitif' ? 'bg-green-100 text-green-700' :
                  impact.impact === 'negatif' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {impact.impact === 'pozitif' ? '↑ Pozitif' : impact.impact === 'negatif' ? '↓ Negatif' : '→ Nötr'}
                </span>
              </div>
              <div className="text-[10px] text-slate-600 mb-1">{impact.reason}</div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-500">AI Güven:</span>
                <span className="text-[10px] font-semibold text-slate-700">{impact.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Macro Events */}
      <div className="mt-4">
        <div className="text-xs font-semibold text-[#111827] mb-2">📅 Son Makro Olaylar</div>
        <div className="space-y-1 text-xs text-slate-600">
          {recentEvents.length > 0 ? (
            recentEvents.map((event, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  event.impact === 'pozitif' ? 'bg-green-600' :
                  event.impact === 'negatif' ? 'bg-red-600' :
                  'bg-blue-600'
                }`}></span>
                <span>{event.event}: {event.value}</span>
              </div>
            ))
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>TCMB faiz kararı: %{policyRate.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-600"></span>
                <span>FED faiz beklentisi: %5.25</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                <span>CDS 5Y: {cds5y} bps</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

