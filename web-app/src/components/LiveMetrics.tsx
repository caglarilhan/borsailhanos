import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface PerformanceMetrics {
  totalProfit: number;
  accuracyRate: number;
  riskScore: number;
  totalTrades: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  lastUpdated: string;
}

interface LiveMetricsProps {
  className?: string;
}

const LiveMetrics: React.FC<LiveMetricsProps> = ({ className }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalProfit: 0,
    accuracyRate: 0,
    riskScore: 0,
    totalTrades: 0,
    winRate: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    lastUpdated: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(true);

  // Simulate API call to fetch performance metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock data
      const mockMetrics: PerformanceMetrics = {
        totalProfit: Math.random() * 50000 + 10000, // 10k-60k TL
        accuracyRate: Math.random() * 20 + 75, // 75-95%
        riskScore: Math.random() * 30 + 20, // 20-50 (lower is better)
        totalTrades: Math.floor(Math.random() * 500) + 100, // 100-600 trades
        winRate: Math.random() * 15 + 60, // 60-75%
        sharpeRatio: Math.random() * 1.5 + 0.5, // 0.5-2.0
        maxDrawdown: Math.random() * 10 + 5, // 5-15%
        lastUpdated: new Date().toISOString()
      };
      
      setMetrics(mockMetrics);
      setIsLoading(false);
    };

    fetchMetrics();
    
    // Update metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore < 30) return 'text-neon-500';
    if (riskScore < 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRiskLabel = (riskScore: number) => {
    if (riskScore < 30) return 'Düşük Risk';
    if (riskScore < 40) return 'Orta Risk';
    return 'Yüksek Risk';
  };

  if (isLoading) {
    return (
      <div className={clsx('card-graphite p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('card-graphite p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Canlı Performans Metrikleri</h2>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-neon-500 animate-pulse-electric"></div>
          <span className="text-sm text-gray-400">
            Son güncelleme: {new Date(metrics.lastUpdated).toLocaleTimeString('tr-TR')}
          </span>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Profit */}
        <div className="card-glass p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-300">Toplam Kar</h3>
            <div className="h-2 w-2 rounded-full bg-neon-500 animate-pulse-electric"></div>
          </div>
          <div className="text-3xl font-bold text-neon-500 mb-1">
            {formatCurrency(metrics.totalProfit)}
          </div>
          <div className="text-sm text-gray-400">
            {metrics.totalTrades} işlemden
          </div>
        </div>

        {/* Accuracy Rate */}
        <div className="card-glass p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-300">Doğruluk Oranı</h3>
            <div className="h-2 w-2 rounded-full bg-electric-500 animate-pulse-electric"></div>
          </div>
          <div className="text-3xl font-bold text-electric-500 mb-1">
            {formatPercentage(metrics.accuracyRate)}
          </div>
          <div className="text-sm text-gray-400">
            AI tahmin doğruluğu
          </div>
        </div>

        {/* Risk Score */}
        <div className="card-glass p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-300">Risk Skoru</h3>
            <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse-electric"></div>
          </div>
          <div className={clsx('text-3xl font-bold mb-1', getRiskColor(metrics.riskScore))}>
            {metrics.riskScore.toFixed(1)}
          </div>
          <div className="text-sm text-gray-400">
            {getRiskLabel(metrics.riskScore)}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-1">
            {formatPercentage(metrics.winRate)}
          </div>
          <div className="text-sm text-gray-400">Kazanma Oranı</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-electric-500 mb-1">
            {metrics.sharpeRatio.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">Sharpe Oranı</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-red-500 mb-1">
            {formatPercentage(metrics.maxDrawdown)}
          </div>
          <div className="text-sm text-gray-400">Max Düşüş</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-1">
            {metrics.totalTrades}
          </div>
          <div className="text-sm text-gray-400">Toplam İşlem</div>
        </div>
      </div>

      {/* Performance Indicator */}
      <div className="mt-6 p-4 bg-gradient-electric/10 rounded-lg border border-electric-500/20">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-electric flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-electric-100">Performans Durumu</h3>
            <p className="text-sm text-gray-300">
              AI sisteminiz {metrics.accuracyRate > 80 ? 'yüksek' : 'orta'} performans gösteriyor. 
              Risk seviyesi {getRiskLabel(metrics.riskScore).toLowerCase()}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMetrics;

