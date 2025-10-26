import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  glowColor: 'cyan' | 'neon' | 'gold' | 'electric';
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue, 
  glowColor,
  delay = 0 
}) => {
  const valueColorClass = {
    'up': 'text-neon-500',
    'down': 'text-red-400',
    'neutral': 'text-gray-300',
  }[trend];

  const trendColorClass = {
    'up': 'text-neon-500',
    'down': 'text-red-400', 
    'neutral': 'text-gray-400',
  }[trend];

  const glowClass = {
    'cyan': 'shadow-glow-cyan',
    'neon': 'shadow-glow-neon',
    'gold': 'shadow-glow-gold',
    'electric': 'shadow-glow-electric',
  }[glowColor];

  return (
    <div
      className={clsx(
        "card-graphite p-6 relative overflow-hidden group",
        glowClass,
        "hover:scale-[1.02] transition-all duration-300"
      )}
    >
      {/* Background Glow Effect */}
      <div className={clsx(
        "absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300",
        glowColor === 'cyan' && "bg-gradient-to-br from-cyan-500/20 to-transparent",
        glowColor === 'neon' && "bg-gradient-to-br from-neon-500/20 to-transparent",
        glowColor === 'gold' && "bg-gradient-to-br from-yellow-500/20 to-transparent",
        glowColor === 'electric' && "bg-gradient-to-br from-electric-500/20 to-transparent"
      )} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={clsx("h-8 w-8", valueColorClass)}>
            {icon}
          </div>
          <div className={clsx("h-2 w-2 rounded-full", {
            'bg-neon-500 animate-pulse-electric': trend === 'up',
            'bg-red-500 animate-pulse-electric': trend === 'down',
            'bg-gray-500': trend === 'neutral',
          })}></div>
        </div>
        
        <div className="text-sm text-gray-400 mb-2 font-medium">{title}</div>
        <div className={clsx("text-3xl font-bold mb-2", valueColorClass)}>
          {typeof value === 'number' ? value.toLocaleString('tr-TR') : value}
        </div>
        
        <div className={clsx("flex items-center text-sm", trendColorClass)}>
          {trend === 'up' && <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />}
          {trend === 'down' && <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />}
          <span className="font-medium">{trendValue}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
