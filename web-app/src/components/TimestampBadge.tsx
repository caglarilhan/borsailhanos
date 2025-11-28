'use client';

import React, { useMemo } from 'react';
import type { TimestampLabel } from '@/types/timestamp';
import { useMarketData } from '@/contexts/MarketDataContext';

interface TimestampBadgeProps {
  label: TimestampLabel;
  prefix?: string;
  variant?: 'solid' | 'subtle';
  fallbackText?: string;
}

export function TimestampBadge({
  label,
  prefix = 'Son güncelleme',
  variant = 'subtle',
  fallbackText = 'Veri bekleniyor',
}: TimestampBadgeProps) {
  const { getTimestamp, formatTimestamp } = useMarketData();
  const timestamp = getTimestamp(label);

  const freshness = useMemo(() => {
    if (!timestamp) return { color: '#94a3b8', text: fallbackText };
    const diffMs = Date.now() - timestamp;
    const diffMinutes = diffMs / 60000;
    if (diffMinutes < 2) return { color: '#10b981', text: 'canlı' };
    if (diffMinutes < 15) return { color: '#f97316', text: `${Math.round(diffMinutes)} dk önce` };
    return { color: '#ef4444', text: `${Math.round(diffMinutes)} dk önce` };
  }, [timestamp, fallbackText]);

  const baseClasses =
    variant === 'solid'
      ? 'px-3 py-1 rounded-full text-xs font-semibold'
      : 'px-2.5 py-1 rounded-md text-xs font-medium border';

  return (
    <span
      className={baseClasses}
      style={{
        color: freshness.color,
        borderColor: variant === 'subtle' ? `${freshness.color}33` : 'transparent',
        backgroundColor: variant === 'subtle' ? `${freshness.color}1a` : freshness.color,
      }}
      title={timestamp ? formatTimestamp(label, { locale: 'tr-TR' }) : fallbackText}
    >
      {prefix}: {timestamp ? formatTimestamp(label, { relative: true }) : fallbackText}
    </span>
  );
}

