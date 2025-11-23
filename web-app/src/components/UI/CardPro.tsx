'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'glass';
}

export function CardPro({ children, className, variant = 'default' }: CardProProps) {
  const baseStyles = 'rounded-xl p-6 border';
  const variantStyles = {
    default: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800',
    gradient: 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 border-transparent',
    glass: 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-800/50',
  };

  return (
    <div className={cn(baseStyles, variantStyles[variant], className)}>
      {children}
    </div>
  );
}
