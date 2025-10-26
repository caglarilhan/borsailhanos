import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface TrendData {
  date: string;
  pnl: number;
  confidence: number;
  trades: number;
  winRate: number;
}

interface PnLTrendlineProps {
  className?: string;
}

const PnLTrendline: React.FC<PnLTrendlineProps> = ({ className }) => {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('7d');

  // Generate mock trend data
  useEffect(() => {
    const generateTrendData = () => {
      const data: TrendData[] = [];
      const periods = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
      let cumulativePnl = 0;
      let baseConfidence = 75;

      for (let i = periods - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const dailyPnl = (Math.random() - 0.4) * 5000; // Slight positive bias
        cumulativePnl += dailyPnl;
        
        const confidence = baseConfidence + (Math.random() - 0.5) * 10;
        const trades = Math.floor(Math.random() * 20) + 5;
        const winRate = Math.random() * 20 + 60; // 60-80%

        data.push({
          date: date.toISOString().split('T')[0],
          pnl: Math.round(cumulativePnl),
          confidence: Math.round(confidence * 10) / 10,
          trades,
          winRate: Math.round(winRate * 10) / 10
        });
      }

      setTrendData(data);
      setIsLoading(false);
    };

    generateTrendData();
  }, [selectedPeriod]);

  const maxPnl = Math.max(...trendData.map(d => d.pnl));
  const minPnl = Math.min(...trendData.map(d => d.pnl));
  const maxConfidence = Math.max(...trendData.map(d => d.confidence));
  const minConfidence = Math.min(...trendData.map(d => d.confidence));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className={clsx('card-graphite p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('card-graphite p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">PnL & Confidence Trendline</h2>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d')}
            className="input-graphite w-20 text-sm"
          >
            <option value="7d" className="bg-graphite-800">7 Gün</option>
            <option value="30d" className="bg-graphite-800">30 Gün</option>
            <option value="90d" className="bg-graphite-800">90 Gün</option>
          </select>
          <div className="h-2 w-2 rounded-full bg-neon-500 animate-pulse-electric"></div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-neon-500 mb-1">
            {formatCurrency(trendData[trendData.length - 1]?.pnl || 0)}
          </div>
          <div className="text-sm text-gray-400">Toplam PnL</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-electric-500 mb-1">
            %{trendData[trendData.length - 1]?.confidence.toFixed(1) || 0}
          </div>
          <div className="text-sm text-gray-400">Ortalama Güven</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-1">
            {trendData.reduce((sum, d) => sum + d.trades, 0)}
          </div>
          <div className="text-sm text-gray-400">Toplam İşlem</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-500 mb-1">
            %{trendData.reduce((sum, d) => sum + d.winRate, 0) / trendData.length || 0}
          </div>
          <div className="text-sm text-gray-400">Ortalama Kazanma</div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="space-y-6">
        {/* PnL Chart */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">Günlük PnL Trendi</h3>
          <div className="h-32 bg-graphite-900/50 rounded-lg p-4 relative">
            <div className="h-full flex items-end justify-between space-x-1">
              {trendData.map((data, index) => {
                const height = ((data.pnl - minPnl) / (maxPnl - minPnl)) * 100;
                const isPositive = data.pnl >= 0;
                
                return (
                  <div
                    key={index}
                    className={clsx(
                      'flex-1 rounded-t transition-all duration-300 hover:opacity-80 relative group',
                      isPositive ? 'bg-neon-500' : 'bg-red-500'
                    )}
                    style={{ height: `${Math.max(height, 5)}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-graphite-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {formatDate(data.date)}: {formatCurrency(data.pnl)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Grid Lines */}
            <div className="absolute inset-4 pointer-events-none">
              {[0, 25, 50, 75, 100].map((percent) => (
                <div
                  key={percent}
                  className="absolute w-full border-t border-white/10"
                  style={{ top: `${percent}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Confidence Chart */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">AI Güven Skoru Trendi</h3>
          <div className="h-32 bg-graphite-900/50 rounded-lg p-4 relative">
            <div className="h-full flex items-end justify-between space-x-1">
              {trendData.map((data, index) => {
                const height = ((data.confidence - minConfidence) / (maxConfidence - minConfidence)) * 100;
                
                return (
                  <div
                    key={index}
                    className="flex-1 rounded-t transition-all duration-300 hover:opacity-80 relative group bg-electric-500"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-graphite-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {formatDate(data.date)}: %{data.confidence.toFixed(1)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Grid Lines */}
            <div className="absolute inset-4 pointer-events-none">
              {[0, 25, 50, 75, 100].map((percent) => (
                <div
                  key={percent}
                  className="absolute w-full border-t border-white/10"
                  style={{ top: `${percent}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-glass p-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-neon flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-white">Trend Analizi</div>
              <div className="text-xs text-gray-400">
                {trendData.length > 1 && trendData[trendData.length - 1].pnl > trendData[0].pnl 
                  ? 'Pozitif trend devam ediyor' 
                  : 'Trend değişimi gözleniyor'}
              </div>
            </div>
          </div>
        </div>

        <div className="card-glass p-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-electric flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-white">Güven Skoru</div>
              <div className="text-xs text-gray-400">
                {trendData.length > 0 && trendData[trendData.length - 1].confidence > 80 
                  ? 'Yüksek güven seviyesi' 
                  : 'Orta güven seviyesi'}
              </div>
            </div>
          </div>
        </div>

        <div className="card-glass p-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-neon-500 to-electric-500 flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-white">Performans</div>
              <div className="text-xs text-gray-400">
                {trendData.length > 0 && trendData[trendData.length - 1].pnl > 0 
                  ? 'Kârlı dönem' 
                  : 'Zorlu dönem'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PnLTrendline;