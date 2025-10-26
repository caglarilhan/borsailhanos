'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/store';
import { 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const DashboardModule: React.FC = () => {
  const { metrics, isLoading } = useAppStore();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const stats = [
    {
      title: 'Toplam Kâr',
      value: metrics?.totalProfit || 0,
      icon: CurrencyDollarIcon,
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/30',
      trend: metrics?.totalProfit ? (metrics.totalProfit > 0 ? 'up' : 'down') : 'neutral',
      change: '₺'
    },
    {
      title: 'Doğruluk Oranı',
      value: metrics?.accuracyRate || 0,
      icon: ChartBarIcon,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      borderColor: 'border-accent/30',
      trend: metrics?.accuracyRate ? (metrics.accuracyRate > 80 ? 'up' : 'neutral') : 'neutral',
      change: '%'
    },
    {
      title: 'Risk Skoru',
      value: metrics?.riskScore || 'Düşük',
      icon: ExclamationTriangleIcon,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/30',
      trend: 'neutral',
      change: ''
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-bold text-accent">Dashboard</h2>
        <div className="flex items-center gap-2 text-sm text-text/60">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span>Canlı veri</span>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      ) : (
        <>
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const displayValue = typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value;
              
              return (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredCard(stat.title)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`
                    glass-surface rounded-xl p-6 border transition-all duration-300
                    ${hoveredCard === stat.title ? 'shadow-glow-smart scale-105' : 'hover:shadow-glow-smart'}
                    ${stat.borderColor}
                  `}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                    {stat.trend === 'up' && (
                      <div className="flex items-center gap-1 text-success text-sm">
                        <ArrowTrendingUpIcon className="w-4 h-4" />
                        <span>Yukarı</span>
                      </div>
                    )}
                    {stat.trend === 'down' && (
                      <div className="flex items-center gap-1 text-danger text-sm">
                        <ArrowTrendingUpIcon className="w-4 h-4 rotate-180" />
                        <span>Aşağı</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-sm text-text/70 mb-2">{stat.title}</h3>
                  <p className={`text-4xl font-bold ${stat.color}`}>
                    {stat.change}{displayValue}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Additional Metrics */}
          {metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-surface rounded-lg p-4">
                <p className="text-xs text-text/70 mb-1">Aktif Sinyal</p>
                <p className="text-2xl font-bold text-accent">{metrics.activeSignals || 0}</p>
              </div>
              
              <div className="glass-surface rounded-lg p-4">
                <p className="text-xs text-text/70 mb-1">Kazanma Oranı</p>
                <p className="text-2xl font-bold text-success">%{metrics.winRate || 0}</p>
              </div>
              
              <div className="glass-surface rounded-lg p-4">
                <p className="text-xs text-text/70 mb-1">Sharpe Ratio</p>
                <p className="text-2xl font-bold text-accent">{metrics.sharpeRatio || 0}</p>
              </div>
              
              <div className="glass-surface rounded-lg p-4">
                <p className="text-xs text-text/70 mb-1">Max Drawdown</p>
                <p className="text-2xl font-bold text-danger">%{metrics.maxDrawdown || 0}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardModule;