import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SectorData {
  name: string;
  symbol: string;
  momentum: number; // -100 to 100
  strength: number; // 0 to 100
  change: number;
  volume: number;
  trend: 'up' | 'down' | 'sideways';
}

interface MomentumMapProps {
  className?: string;
}

const MomentumMap: React.FC<MomentumMapProps> = ({ className }) => {
  const [sectorData, setSectorData] = useState<SectorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState<SectorData | null>(null);

  // Generate mock sector data
  useEffect(() => {
    const generateSectorData = () => {
      const sectors = [
        { name: 'Teknoloji', symbol: 'THYAO', baseMomentum: 15 },
        { name: 'Petrokimya', symbol: 'TUPRS', baseMomentum: -5 },
        { name: 'Savunma', symbol: 'ASELS', baseMomentum: 25 },
        { name: 'Cam', symbol: 'SISE', baseMomentum: 8 },
        { name: 'Demir Çelik', symbol: 'EREGL', baseMomentum: -12 },
        { name: 'Gıda', symbol: 'KRDMD', baseMomentum: 5 },
        { name: 'Perakende', symbol: 'BIMAS', baseMomentum: 18 },
        { name: 'Bankacılık', symbol: 'AKBNK', baseMomentum: -8 },
        { name: 'Enerji', symbol: 'ENJSA', baseMomentum: 12 },
        { name: 'İnşaat', symbol: 'ENKAI', baseMomentum: -15 },
        { name: 'Turizm', symbol: 'THYAO', baseMomentum: 22 },
        { name: 'Sağlık', symbol: 'LOKMAN', baseMomentum: 6 }
      ];

      const mockData: SectorData[] = sectors.map(sector => {
        const momentum = sector.baseMomentum + (Math.random() - 0.5) * 20;
        const strength = Math.random() * 40 + 60; // 60-100%
        const change = (Math.random() - 0.5) * 10;
        const volume = Math.random() * 1000000 + 100000;
        
        let trend: 'up' | 'down' | 'sideways' = 'sideways';
        if (momentum > 10) trend = 'up';
        else if (momentum < -10) trend = 'down';

        return {
          name: sector.name,
          symbol: sector.symbol,
          momentum: Math.round(momentum * 10) / 10,
          strength: Math.round(strength * 10) / 10,
          change: Math.round(change * 100) / 100,
          volume,
          trend
        };
      });

      setSectorData(mockData);
      setIsLoading(false);
    };

    generateSectorData();
    
    // Update every 30 seconds
    const interval = setInterval(generateSectorData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getMomentumColor = (momentum: number) => {
    if (momentum > 20) return 'bg-neon-500';
    if (momentum > 10) return 'bg-green-400';
    if (momentum > 0) return 'bg-green-300';
    if (momentum > -10) return 'bg-yellow-400';
    if (momentum > -20) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const getMomentumTextColor = (momentum: number) => {
    if (momentum > 10) return 'text-neon-500';
    if (momentum > 0) return 'text-green-400';
    if (momentum > -10) return 'text-yellow-400';
    return 'text-red-500';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return (
          <svg className="h-4 w-4 text-neon-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
        );
      case 'down':
        return (
          <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
          </svg>
        );
      case 'sideways':
        return (
          <svg className="h-4 w-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className={clsx('card-graphite p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
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
        <h2 className="text-xl font-semibold text-white">Momentum Map & Sektör Gücü</h2>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-neon-500 animate-pulse-electric"></div>
          <span className="text-sm text-gray-400">Canlı Analiz</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {sectorData.map((sector, index) => (
          <div
            key={index}
            className={clsx(
              'card-glass p-4 cursor-pointer transition-all duration-200 hover:scale-105',
              'hover:bg-electric-500/20',
              selectedSector?.symbol === sector.symbol && 'ring-2 ring-electric-500/50'
            )}
            onClick={() => setSelectedSector(sector)}
          >
            {/* Sector Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-medium text-white">{sector.name}</div>
                <div className="text-xs text-gray-400">{sector.symbol}</div>
              </div>
              {getTrendIcon(sector.trend)}
            </div>

            {/* Momentum Indicator */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Momentum</span>
                <span className={clsx('text-sm font-medium', getMomentumTextColor(sector.momentum))}>
                  {sector.momentum > 0 ? '+' : ''}{sector.momentum.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={clsx('h-full transition-all duration-500', getMomentumColor(sector.momentum))}
                  style={{ width: `${Math.abs(sector.momentum) * 2}%` }}
                />
              </div>
            </div>

            {/* Strength Indicator */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Güç</span>
                <span className="text-sm font-medium text-electric-500">
                  %{sector.strength.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-electric transition-all duration-500"
                  style={{ width: `${sector.strength}%` }}
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{sector.change > 0 ? '+' : ''}{sector.change.toFixed(2)}%</span>
              <span>{Math.round(sector.volume / 1000)}K</span>
            </div>
          </div>
        ))}
      </div>

      {/* Sector Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card-glass p-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-neon flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-white">Güçlü Sektörler</div>
              <div className="text-xs text-gray-400">
                {sectorData.filter(s => s.momentum > 15).length} sektör
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
              <div className="text-sm font-medium text-white">Ortalama Momentum</div>
              <div className="text-xs text-gray-400">
                {sectorData.length > 0 
                  ? (sectorData.reduce((sum, s) => sum + s.momentum, 0) / sectorData.length).toFixed(1)
                  : '0.0'
                }
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
              <div className="text-sm font-medium text-white">Piyasa Durumu</div>
              <div className="text-xs text-gray-400">
                {sectorData.filter(s => s.momentum > 0).length > sectorData.length / 2 
                  ? 'Pozitif' 
                  : 'Karışık'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Sector View Modal */}
      {selectedSector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="card-graphite p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {selectedSector.name} Detayları
              </h3>
              <button
                onClick={() => setSelectedSector(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Sembol</span>
                <span className="text-white font-medium">{selectedSector.symbol}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Momentum</span>
                <span className={clsx('font-medium', getMomentumTextColor(selectedSector.momentum))}>
                  {selectedSector.momentum > 0 ? '+' : ''}{selectedSector.momentum.toFixed(1)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Güç Skoru</span>
                <span className="text-electric-500 font-medium">
                  %{selectedSector.strength.toFixed(1)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Günlük Değişim</span>
                <span className={clsx('font-medium', selectedSector.change > 0 ? 'text-neon-500' : 'text-red-500')}>
                  {selectedSector.change > 0 ? '+' : ''}{selectedSector.change.toFixed(2)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Hacim</span>
                <span className="text-white font-medium">
                  {Math.round(selectedSector.volume / 1000).toLocaleString()}K
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Trend</span>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(selectedSector.trend)}
                  <span className="text-white font-medium capitalize">{selectedSector.trend}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MomentumMap;


