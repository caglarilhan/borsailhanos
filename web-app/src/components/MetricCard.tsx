import React from 'react';
import { clsx } from 'clsx';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  glowColor?: 'cyan' | 'neon' | 'gold' | 'success';
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend = 'neutral',
  trendValue,
  glowColor = 'cyan',
  className
}) => {
  const trendClasses = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-gray-400'
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→'
  };

  return (
    <div 
      className={clsx(
        'bg-[rgba(25,25,25,0.65)] backdrop-blur-xl',
        'border border-[rgba(255,255,255,0.05)]',
        'rounded-2xl p-6',
        'transition-all duration-300 ease-out',
        'hover:border-[rgba(0,224,255,0.3)] hover:scale-[1.02]',
        'hover:shadow-[0_0_30px_rgba(0,224,255,0.2)]',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-[#00FFC6] text-2xl">
          {icon}
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-[#00FFC6] animate-pulse"></div>
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm text-gray-400 font-medium">{title}</div>
        <div className="text-3xl font-bold text-white tracking-tight">
          {value}
        </div>
        {trendValue && (
          <div className={clsx('text-sm font-medium flex items-center space-x-1', trendClasses[trend])}>
            <span>{trendIcons[trend]}</span>
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;


