'use client';

import React, { useState, useEffect } from 'react';
import { 
  FireIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { GlassCard } from '@/components/UI/GlassCard';

interface SectorData {
  name: string;
  strength: number; // -100 to 100
  change: number;
  topStocks: string[];
  volume: number;
  marketCap: number;
}

interface SectorHeatmapProps {
  isLoading?: boolean;
}

const SectorHeatmap: React.FC<SectorHeatmapProps> = ({ isLoading = false }) => {
  const [sectorData, setSectorData] = useState<SectorData[]>([]);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  // Mock sector data
  useEffect(() => {
    const mockSectors: SectorData[] = [
      {
        name: 'Bankacılık',
        strength: 85,
        change: 2.3,
        topStocks: ['GARAN', 'AKBNK', 'ISCTR'],
        volume: 1250000000,
        marketCap: 450000000000
      },
      {
        name: 'Teknoloji',
        strength: 72,
        change: 1.8,
        topStocks: ['ASELS', 'THYAO', 'LOGO'],
        volume: 890000000,
        marketCap: 180000000000
      },
      {
        name: 'Enerji',
        strength: 45,
        change: -1.2,
        topStocks: ['TUPRS', 'EREGL', 'PETKM'],
        volume: 1520000000,
        marketCap: 320000000000
      },
      {
        name: 'İnşaat',
        strength: 38,
        change: -2.1,
        topStocks: ['SISE', 'ENKAI', 'KRDMD'],
        volume: 980000000,
        marketCap: 120000000000
      },
      {
        name: 'Gıda',
        strength: 65,
        change: 0.8,
        topStocks: ['ULKER', 'PGSUS', 'TATGD'],
        volume: 760000000,
        marketCap: 95000000000
      },
      {
        name: 'Tekstil',
        strength: 28,
        change: -3.2,
        topStocks: ['KRDMD', 'MAVI', 'BRKO'],
        volume: 450000000,
        marketCap: 65000000000
      },
      {
        name: 'Kimya',
        strength: 58,
        change: 1.5,
        topStocks: ['PETKM', 'KCHOL', 'TUPRS'],
        volume: 680000000,
        marketCap: 85000000000
      },
      {
        name: 'Turizm',
        strength: 42,
        change: -0.9,
        topStocks: ['THYAO', 'PGSUS', 'MAVI'],
        volume: 320000000,
        marketCap: 45000000000
      }
    ];

    setSectorData(mockSectors);
    
    const interval = setInterval(() => {
      setSectorData(prev => prev.map(sector => ({
        ...sector,
        strength: Math.max(-100, Math.min(100, sector.strength + (Math.random() - 0.5) * 10)),
        change: sector.change + (Math.random() - 0.5) * 2
      })));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStrengthColor = (strength: number) => {
    if (strength >= 70) return 'bg-green-500';
    if (strength >= 40) return 'bg-yellow-500';
    if (strength >= 10) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStrengthTextColor = (strength: number) => {
    if (strength >= 70) return 'text-green-400';
    if (strength >= 40) return 'text-yellow-400';
    if (strength >= 10) return 'text-orange-400';
    return 'text-red-400';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? 
      <ArrowTrendingUpIcon className="h-4 w-4" /> : 
      <ArrowTrendingDownIcon className="h-4 w-4" />;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sector Heatmap Grid */}
      <GlassCard className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <FireIcon className="h-6 w-6 text-orange-400" />
          <h3 className="text-lg font-semibold text-gray-200 font-mono">Sector Momentum Map</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sectorData.map((sector) => (
            <div
              key={sector.name}
              onClick={() => setSelectedSector(selectedSector === sector.name ? null : sector.name)}
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                selectedSector === sector.name 
                  ? 'border-cyan-400 bg-cyan-900/20' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {/* Heatmap Color Overlay */}
              <div className={`absolute inset-0 rounded-lg opacity-20 ${getStrengthColor(sector.strength)}`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-200 font-mono">{sector.name}</h4>
                  <div className={`text-xs font-mono ${getStrengthTextColor(sector.strength)}`}>
                    {sector.strength > 0 ? '+' : ''}{sector.strength}
                  </div>
                </div>
                
                <div className={`flex items-center space-x-1 text-xs font-mono ${getChangeColor(sector.change)}`}>
                  {getChangeIcon(sector.change)}
                  <span>{sector.change > 0 ? '+' : ''}{sector.change.toFixed(1)}%</span>
                </div>
                
                <div className="mt-2 text-xs text-gray-400">
                  Vol: {(sector.volume / 1000000).toFixed(0)}M
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-400">Strong (70+)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-gray-400">Moderate (40-69)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-gray-400">Weak (10-39)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-400">Poor (<10)</span>
          </div>
        </div>
      </GlassCard>

      {/* Selected Sector Details */}
      {selectedSector && (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-200 font-mono">
              {selectedSector} - Detailed Analysis
            </h3>
            <button
              onClick={() => setSelectedSector(null)}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              ×
            </button>
          </div>

          {(() => {
            const sector = sectorData.find(s => s.name === selectedSector);
            if (!sector) return null;

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Top Stocks */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Top Performers</h4>
                  <div className="space-y-2">
                    {sector.topStocks.map((stock, index) => (
                      <div key={stock} className="flex items-center justify-between p-2 bg-gray-900/30 rounded-lg">
                        <span className="text-sm font-mono text-gray-200">{stock}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">#{index + 1}</span>
                          <div className={`w-2 h-2 rounded-full ${getStrengthColor(sector.strength)}`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Sector Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Strength Score</span>
                      <span className={`text-sm font-mono ${getStrengthTextColor(sector.strength)}`}>
                        {sector.strength > 0 ? '+' : ''}{sector.strength}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Daily Change</span>
                      <div className={`flex items-center space-x-1 text-sm font-mono ${getChangeColor(sector.change)}`}>
                        {getChangeIcon(sector.change)}
                        <span>{sector.change > 0 ? '+' : ''}{sector.change.toFixed(2)}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Volume</span>
                      <span className="text-sm font-mono text-gray-200">
                        {(sector.volume / 1000000).toFixed(0)}M
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Market Cap</span>
                      <span className="text-sm font-mono text-gray-200">
                        ₺{(sector.marketCap / 1000000000).toFixed(0)}B
                      </span>
                    </div>
                  </div>
                </div>

                {/* Strength Bar */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Momentum Strength</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-400">Current Level</span>
                        <span className={`text-xs font-mono ${getStrengthTextColor(sector.strength)}`}>
                          {sector.strength > 0 ? '+' : ''}{sector.strength}
                        </span>
                      </div>
                      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${getStrengthColor(sector.strength)}`}
                          style={{ width: `${Math.abs(sector.strength)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400 space-y-1">
                      <div>• Strong sectors show consistent upward momentum</div>
                      <div>• Weak sectors may present contrarian opportunities</div>
                      <div>• Monitor sector rotation patterns</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </GlassCard>
      )}
    </div>
  );
};

export default SectorHeatmap;

