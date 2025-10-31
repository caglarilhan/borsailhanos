'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  hover?: boolean;
  glow?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  glow = false
}) => {
  const baseClasses = "backdrop-blur-md bg-white/5 border border-white/10 rounded-xl";
  
  const variantClasses = {
    default: "bg-gray-900/20 border-gray-700/30",
    success: "bg-green-900/20 border-green-700/30",
    warning: "bg-yellow-900/20 border-yellow-700/30", 
    danger: "bg-red-900/20 border-red-700/30",
    info: "bg-blue-900/20 border-blue-700/30"
  };

  const hoverClasses = hover ? "hover:bg-white/10 hover:border-white/20 transition-all duration-300" : "";
  const glowClasses = glow ? "shadow-lg shadow-cyan-500/20" : "";

  return (
    <div className={cn(
      baseClasses,
      variantClasses[variant],
      hoverClasses,
      glowClasses,
      className
    )}>
      {children}
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  variant = 'default',
  trend = 'neutral',
  subtitle
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getVariantColor = () => {
    switch (variant) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'danger': return 'text-red-400';
      case 'info': return 'text-blue-400';
      default: return 'text-cyan-400';
    }
  };

  return (
    <GlassCard variant={variant} hover className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {icon && <div className={getVariantColor()}>{icon}</div>}
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">{title}</h3>
          </div>
          
          <div className="space-y-1">
            <p className={`text-2xl font-bold font-mono ${getVariantColor()}`}>
              {typeof value === 'number' ? value.toLocaleString('tr-TR') : value}
            </p>
            
            {change !== undefined && (
              <div className={`flex items-center space-x-1 text-sm font-mono ${getTrendColor()}`}>
                {trend === 'up' && <ArrowTrendingUpIcon className="h-4 w-4" />}
                {trend === 'down' && <ArrowTrendingDownIcon className="h-4 w-4" />}
                <span>{change > 0 ? '+' : ''}{change.toFixed(2)}%</span>
              </div>
            )}
            
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ 
  title, 
  children, 
  className = '',
  actions 
}) => {
  return (
    <GlassCard className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-200 font-mono">{title}</h2>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
      <div className="h-full">
        {children}
      </div>
    </GlassCard>
  );
};

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'warning' | 'error';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  label,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3', 
    lg: 'w-4 h-4'
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'warning': return 'bg-yellow-400';
      case 'error': return 'bg-red-400';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusTextColor = () => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'offline': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`${sizeClasses[size]} rounded-full ${getStatusColor()} animate-pulse`}></div>
      {label && <span className={`text-sm font-mono ${getStatusTextColor()}`}>{label}</span>}
    </div>
  );
};

export { GlassCard, MetricCard, ChartCard, StatusIndicator };

