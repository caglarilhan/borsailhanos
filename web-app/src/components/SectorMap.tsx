import React from 'react';
import { clsx } from 'clsx';

interface SectorMapProps {
  className?: string;
}

const SectorMap: React.FC<SectorMapProps> = ({ className }) => {
  const sectors = [
    { name: 'Teknoloji', strength: 85, momentum: 'up', color: 'cyan' },
    { name: 'Finans', strength: 72, momentum: 'up', color: 'neon' },
    { name: 'Sanayi', strength: 68, momentum: 'neutral', color: 'gold' },
    { name: 'Enerji', strength: 45, momentum: 'down', color: 'red' },
    { name: 'Sağlık', strength: 78, momentum: 'up', color: 'cyan' },
    { name: 'Tüketim', strength: 62, momentum: 'neutral', color: 'neon' },
    { name: 'İletişim', strength: 71, momentum: 'up', color: 'gold' },
    { name: 'Malzeme', strength: 58, momentum: 'down', color: 'red' },
    { name: 'Ulaştırma', strength: 64, momentum: 'neutral', color: 'cyan' }
  ];

  const getColorClass = (color: string) => {
    const colors = {
      cyan: 'bg-[#00E0FF]',
      neon: 'bg-[#00FFC6]',
      gold: 'bg-[#FFB600]',
      red: 'bg-[#FF5757]'
    };
    return colors[color as keyof typeof colors] || colors.cyan;
  };

  const getMomentumIcon = (momentum: string) => {
    const icons = {
      up: '↗',
      down: '↘',
      neutral: '→'
    };
    return icons[momentum as keyof typeof icons] || icons.neutral;
  };

  return (
    <div className={clsx('space-y-6', className)}>
      <div className="flex items-center space-x-2 mb-6">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-[#00FFC6] to-[#00A8FF] flex items-center justify-center">
          <span className="text-sm font-bold text-white">📊</span>
        </div>
        <h2 className="text-xl font-semibold text-white">Sector Heatmap</h2>
        <div className="h-2 w-2 rounded-full bg-[#00FFC6] animate-pulse"></div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {sectors.map((sector, index) => (
          <div 
            key={index}
            className="bg-[rgba(25,25,25,0.65)] backdrop-blur-xl border border-[rgba(255,255,255,0.05)] rounded-xl p-4 hover:border-[rgba(0,224,255,0.3)] hover:scale-105 transition-all duration-300 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{sector.name}</h3>
                <span className="text-xs text-gray-400">{getMomentumIcon(sector.momentum)}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Strength</span>
                  <span className="text-sm font-semibold text-white">{sector.strength}%</span>
                </div>
                
                <div className="bg-gray-700 rounded-full h-2">
                  <div 
                    className={clsx('h-2 rounded-full transition-all duration-1000', getColorClass(sector.color))}
                    style={{ width: `${sector.strength}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={clsx('h-2 w-2 rounded-full', getColorClass(sector.color))}></div>
                <span className="text-xs text-gray-400 capitalize">{sector.momentum}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-[rgba(0,224,255,0.05)] border border-[rgba(0,224,255,0.2)] rounded-xl">
        <div className="flex items-center space-x-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-[#00FFC6] animate-pulse"></div>
          <span className="text-sm font-semibold text-[#00FFC6]">Market Overview</span>
        </div>
        <p className="text-gray-300 text-sm">
          Teknoloji ve Finans sektörleri liderlik ediyor. 
          Enerji sektöründe düşüş trendi devam ediyor.
        </p>
      </div>
    </div>
  );
};

export default SectorMap;

