'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
  icon?: React.ReactNode;
}

export function KPICard({ title, value, change, trend = 'neutral', className, icon }: KPICardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <div className={cn('rounded-lg p-4 bg-white border border-gray-200', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {change !== undefined && (
        <div className={cn('text-sm mt-1', trendColors[trend])}>
          {change > 0 ? '+' : ''}{change}%
        </div>
      )}
    </div>
  );
}

