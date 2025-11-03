/**
 * P5.2: SignalCard Komponenti - Standart prop interface
 * Her kart aynı sırada olacak: Trend ↑↓, Ufuk, Güven, AI Hedef, Stop, Yorum, Geçerlilik
 */

'use client';

import React from 'react';
import { formatCurrencyTRY, formatPercent, formatUTC3Time } from '@/lib/formatters';
import { ForecastMetric, Signal } from '@/lib/metrics-schema';
import { validateStopTarget } from '@/lib/stop-target-validation';
import { InlineDemoBadge } from './DemoWatermark';
// P5.2: AI Trade Plan integration
import { generateTradePlan } from '@/data/core/ai-trade-plan';
// P5.2: Enhanced stop validation
import { validateStopTargetEnhanced } from '@/lib/stop-validation-enhanced';

export interface SignalCardProps {
  symbol: string;
  forecast: ForecastMetric;
  confidence: number; // 0-1 scale
  currentPrice: number;
  comment?: string; // AI yorum
  validUntil?: string; // ISO timestamp
  className?: string;
  onSelect?: (symbol: string) => void;
}

export function SignalCard({
  symbol,
  forecast,
  confidence,
  currentPrice,
  comment,
  validUntil,
  className = '',
  onSelect,
}: SignalCardProps) {
  const isUp = forecast.value >= 0;
  const signal: Signal = forecast.value >= 0.02 ? 'BUY' : forecast.value <= -0.02 ? 'SELL' : 'HOLD';
  const confPct = Math.round(confidence * 100);
  const diffPct = Math.round(forecast.value * 1000) / 10; // % (fallback)
  const targetPrice = forecast.target || Math.round(currentPrice * (1 + forecast.value) * 100) / 100;
  const stopPrice = forecast.stop || (signal === 'BUY' ? currentPrice * 0.9 : currentPrice * 1.1);
  
  // P5.2: Stop/Target Validation
  const stopTargetValidation = validateStopTarget(signal, currentPrice, stopPrice, targetPrice);
  
  // P5.2: PI90 band = aynı window kontrolü
  const hasPI90 = forecast.pi90_lower !== undefined && forecast.pi90_upper !== undefined;
  const pi90Valid = hasPI90 && forecast.window === forecast.window; // Same window check
  
  // P5.2: AI Trade Plan - Entry/SL/TP otomatik hesapla
  const tradePlan = generateTradePlan(
    symbol,
    signal,
    currentPrice,
    targetPrice,
    confidence,
    forecast.window
  );
  
  return (
    <div
      className={`border-2 rounded-xl p-4 shadow-md hover:shadow-xl transition-all cursor-pointer ${isUp ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 hover:border-green-400' : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-300 hover:border-red-400'} ${className}`}
      onClick={() => onSelect?.(symbol)}
    >
      {/* Başlık - Sembol + Yön Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-[18px] font-extrabold text-[#111827]">{symbol}</div>
        <div className="flex items-center gap-2">
          {/* P5.2: Demo watermark */}
          <InlineDemoBadge />
          {/* P5.2: Renk tutarlılığı - Tailwind green-500/red-500 standart renkler */}
          <div className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 ${isUp?'bg-green-500 text-white border-green-600 shadow-md':'bg-red-500 text-white border-red-600 shadow-md'}`}>
            {isUp ? '▲ YÜKSELİŞ' : '▼ DÜŞÜŞ'}
          </div>
        </div>
      </div>
      
      {/* Ana Metrikler - Standart sıra */}
      <div className="space-y-2 mb-3">
        {/* 1. Trend ↑↓ */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600 font-medium">Trend:</span>
          <div className={`text-base font-black ${isUp ? 'text-green-700' : 'text-red-700'}`}>
            {isUp ? '▲' : '▼'} {diffPct >= 0 ? '+' : ''}{formatPercent(diffPct, false, 1)}
          </div>
        </div>
        
        {/* 2. Ufuk */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600 font-medium">Ufuk:</span>
          <span className="text-sm font-bold text-[#111827] bg-slate-100 px-2 py-0.5 rounded">{forecast.window}</span>
        </div>
        
        {/* 3. Güven */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600 font-medium">Güven:</span>
          <span className={`text-sm font-bold px-2 py-0.5 rounded ${confPct >= 85 ? 'bg-emerald-100 text-emerald-800' : confPct >= 70 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
            {confPct}%
          </span>
        </div>
        
        {/* 4. AI Hedef */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600 font-medium">AI Hedef:</span>
          <span className={`text-base font-extrabold ${isUp?'text-green-700':'text-red-700'}`}>
            {formatCurrencyTRY(targetPrice)}
            {/* P5.2: Stop/Target Validation - ihlalde sarı uyarı */}
            {(!stopTargetValidation.isValid || !stopTargetValidationEnhanced.isValid) && (stopTargetValidation.warning || stopTargetValidationEnhanced.warning) && (
              <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300" title={stopTargetValidationEnhanced.warning || stopTargetValidationEnhanced.recommendation || stopTargetValidation.message}>
                ⚠️
              </span>
            )}
          </span>
        </div>
        
        {/* 5. Stop */}
        {stopPrice && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">Stop:</span>
            <span className="text-sm font-bold text-slate-700">{formatCurrencyTRY(stopPrice)} <span className="text-xs text-slate-500">({tradePlan ? formatPercent(tradePlan.riskPercent, false, 1) : '—'})</span></span>
          </div>
        )}
        
        {/* P5.2: AI Trade Plan - TP1/TP2 ve R:R */}
        {tradePlan && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">TP1:</span>
              <span className="text-sm font-bold text-green-700">
                {formatCurrencyTRY(tradePlan.targetPrice1)} <span className="text-xs text-slate-500">({formatPercent(tradePlan.targetPercent1, false, 1)})</span>
              </span>
            </div>
            {tradePlan.targetPrice2 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">TP2:</span>
                <span className="text-sm font-bold text-green-700">
                  {formatCurrencyTRY(tradePlan.targetPrice2)} <span className="text-xs text-slate-500">({formatPercent(tradePlan.targetPercent2!, false, 1)})</span>
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">R:R:</span>
              <span className="text-sm font-bold text-blue-700">{tradePlan.riskRewardRatio.toFixed(1)}:1</span>
            </div>
          </>
        )}
        
        {/* 6. PI90 Band (aynı window kontrolü) */}
        {hasPI90 && pi90Valid && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">PI90:</span>
            <span className="text-xs text-slate-500">
              {formatCurrencyTRY(forecast.pi90_lower!)} - {formatCurrencyTRY(forecast.pi90_upper!)}
            </span>
          </div>
        )}
      </div>
      
      {/* 7. Neden? (AI Trade Plan explanation) */}
      {tradePlan && tradePlan.explanation && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="text-xs text-slate-600 font-medium mb-1">Neden?</div>
          <div className="text-sm text-slate-700">{tradePlan.explanation}</div>
        </div>
      )}
      
      {/* 8. Yorum */}
      {comment && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="text-xs text-slate-600 font-medium mb-1">Yorum:</div>
          <div className="text-sm text-slate-700">{comment}</div>
        </div>
      )}
      
      {/* 9. Geçerlilik */}
      {validUntil && (
        <div className="mt-2 pt-2 border-t border-slate-200">
          <div className="text-[10px] text-slate-500">
            Geçerlilik: {formatUTC3Time(validUntil)} (UTC+3)
          </div>
        </div>
      )}
    </div>
  );
}

