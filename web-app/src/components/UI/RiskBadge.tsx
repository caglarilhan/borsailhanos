'use client';
import React from 'react';
import { t } from '@/lib/i18n';

interface RiskBadgeProps { score: number; windowLabel?: string; source?: string; }
function level(score: number): 'low'|'medium'|'high' { if (score <= 2.5) return 'low'; if (score <= 4) return 'medium'; return 'high'; }
export function RiskBadge({ score, windowLabel='24s', source='Vol Index' }: RiskBadgeProps) {
  const lvl = level(score);
  const cls = lvl==='low' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : lvl==='medium' ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-red-100 text-red-700 border-red-300';
  const label = lvl==='low' ? t('risk.low') : lvl==='medium' ? t('risk.medium') : t('risk.high');
  return (<span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${cls}`} title={`${t('risk.score')} (${windowLabel}, ${source})`}>{t('risk.score')} ({windowLabel}, {source}): {score.toFixed(1)} • {label}</span>);
}


