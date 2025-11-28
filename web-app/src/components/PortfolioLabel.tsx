'use client';

import React from 'react';
import type { PortfolioType } from '@/types/portfolio';

interface PortfolioLabelProps {
  type: PortfolioType;
  className?: string;
}

const LABELS: Record<PortfolioType, { label: string; description: string; color: string; bgColor: string }> = {
  suggested: {
    label: 'Önerilen Portföy (AI Suggestion)',
    description: 'AI tarafından önerilen optimal portföy dağılımı',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
  },
  simulator: {
    label: 'Portföy Simülatörü (What-if)',
    description: 'Farklı senaryoları test etmek için simülasyon portföyü',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
  },
  current: {
    label: 'Mevcut Portföy (Gerçek)',
    description: 'Broker entegrasyonu ile gerçek portföy durumu',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
  },
};

export function PortfolioLabel({ type, className = '' }: PortfolioLabelProps) {
  const config = LABELS[type];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border ${config.bgColor} ${className}`}>
      <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
      <span
        className="text-xs text-slate-500 cursor-help"
        title={config.description}
      >
        ℹ️
      </span>
    </div>
  );
}

