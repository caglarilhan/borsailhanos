"use client";
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  color: 'green' | 'blue' | 'orange' | 'red';
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export function MetricCard({ 
  title, 
  value, 
  color, 
  icon, 
  trend = 'neutral', 
  trendValue 
}: MetricCardProps) {
  const colorMap = {
    green: {
      text: 'text-success',
      border: 'border-success/40',
      glow: 'shadow-glow-success',
      bg: 'bg-success/5'
    },
    blue: {
      text: 'text-accent',
      border: 'border-accent/40',
      glow: 'shadow-glow-smart',
      bg: 'bg-accent/5'
    },
    orange: {
      text: 'text-warning',
      border: 'border-warning/40',
      glow: 'shadow-glow-warning',
      bg: 'bg-warning/5'
    },
    red: {
      text: 'text-danger',
      border: 'border-danger/40',
      glow: 'shadow-glow-danger',
      bg: 'bg-danger/5'
    }
  };

  const trendIcon = {
    up: '↗',
    down: '↘',
    neutral: '→'
  };

  const colors = colorMap[color];

  return (
    <div className={`
      p-6 rounded-2xl border ${colors.border} 
      ${colors.bg} backdrop-blur-glass 
      ${colors.glow} transition-all duration-300
      hover:scale-[1.02] hover:shadow-lg
      group
    `}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-text/70 uppercase tracking-wide">
          {title}
        </h3>
        {icon && (
          <div className="text-text/50 group-hover:text-accent transition-colors">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-2">
        <div className={`
          text-3xl font-bold ${colors.text}
          animate-pulse-slow
        `}>
          {value}
        </div>
        
        {trendValue && (
          <div className={`
            text-sm font-medium flex items-center gap-1
            ${trend === 'up' ? 'text-success' : 
              trend === 'down' ? 'text-danger' : 
              'text-text/50'}
          `}>
            <span>{trendIcon[trend]}</span>
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default MetricCard;


