import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';

interface RealtimeTickerProps {
  className?: string;
}

const RealtimeTicker: React.FC<RealtimeTickerProps> = ({ className }) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };
    
    updateTime(); // Initial update
    const interval = setInterval(updateTime, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, []);

  const tickers = [
    { symbol: 'THYAO', price: '₺125.50', change: '+2.3%', trend: 'up' },
    { symbol: 'ASELS', price: '₺89.20', change: '+1.8%', trend: 'up' },
    { symbol: 'SISE', price: '₺45.60', change: '-0.5%', trend: 'down' },
    { symbol: 'TUPRS', price: '₺78.90', change: '+3.1%', trend: 'up' },
    { symbol: 'EREGL', price: '₺156.30', change: '+0.9%', trend: 'up' },
    { symbol: 'KRDMD', price: '₺23.40', change: '-1.2%', trend: 'down' }
  ];

  return (
    <div className={clsx('bg-[rgba(25,25,25,0.65)] backdrop-blur-xl border border-[rgba(255,255,255,0.05)] rounded-xl p-4', className)}>
      <div className="flex items-center space-x-2 mb-4">
        <div className="h-2 w-2 rounded-full bg-[#00FFC6] animate-pulse"></div>
        <span className="text-sm font-semibold text-[#00FFC6]">Live Ticker</span>
        <span className="text-xs text-gray-400">Real-time prices</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {tickers.map((ticker, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-3 bg-[rgba(255,255,255,0.02)] rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-all duration-200"
          >
            <div className="space-y-1">
              <div className="text-sm font-semibold text-white">{ticker.symbol}</div>
              <div className="text-xs text-gray-400">{ticker.price}</div>
            </div>
            <div className={clsx(
              'text-sm font-semibold',
              ticker.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
            )}>
              {ticker.change}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.05)]">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Last update: {currentTime || '--:--:--'}</span>
          <span className="flex items-center space-x-1">
            <div className="h-1.5 w-1.5 rounded-full bg-[#00FFC6] animate-pulse"></div>
            <span>Live</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default RealtimeTicker;
