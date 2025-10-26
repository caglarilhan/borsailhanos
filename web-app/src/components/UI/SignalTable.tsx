"use client";
import React from 'react';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  MinusIcon 
} from '@heroicons/react/24/outline';

interface Signal {
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  price: number;
  change: number;
  timestamp: string;
  note?: string;
  rsi?: number;
  macd?: number;
  sentiment?: number;
}

interface SignalTableProps {
  signals?: Signal[];
  isLoading?: boolean;
  onRowClick?: (signal: Signal) => void;
}

export function SignalTable({ 
  signals = [], 
  isLoading = false,
  onRowClick 
}: SignalTableProps) {
  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return <ArrowTrendingUpIcon className="w-4 h-4 text-success" />;
      case 'SELL':
        return <ArrowTrendingDownIcon className="w-4 h-4 text-danger" />;
      default:
        return <MinusIcon className="w-4 h-4 text-text/50" />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return 'text-success bg-success/10 border-success/20';
      case 'SELL':
        return 'text-danger bg-danger/10 border-danger/20';
      default:
        return 'text-text/50 bg-surface/50 border-text/20';
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-danger';
    return 'text-text/50';
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl overflow-hidden border border-white/10 backdrop-blur-glass bg-surface/50">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-text/60">Sinyaller yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 backdrop-blur-glass bg-surface/50 shadow-glow-smart">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface/70 text-accent uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Sembol</th>
              <th className="px-6 py-4">Sinyal</th>
              <th className="px-6 py-4">Güven</th>
              <th className="px-6 py-4">Fiyat</th>
              <th className="px-6 py-4">Değişim</th>
              <th className="px-6 py-4">AI Analizi</th>
            </tr>
          </thead>
          <tbody>
            {signals.map((signal, index) => (
              <tr 
                key={index}
                onClick={() => onRowClick?.(signal)}
                className="
                  hover:bg-white/5 transition-all duration-200 
                  cursor-pointer border-b border-white/5
                  group
                "
              >
                <td className="px-6 py-4">
                  <div className="font-mono font-bold text-text">
                    {signal.symbol}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className={`
                    inline-flex items-center gap-2 px-3 py-1 rounded-full
                    border text-xs font-semibold
                    ${getSignalColor(signal.signal)}
                  `}>
                    {getSignalIcon(signal.signal)}
                    {signal.signal}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="text-accent font-semibold">
                    %{signal.confidence}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="font-mono text-text">
                    ₺{signal.price.toFixed(2)}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className={`font-semibold ${getChangeColor(signal.change)}`}>
                    {signal.change > 0 ? '+' : ''}{signal.change.toFixed(2)}%
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="text-text/70 text-xs max-w-xs">
                    {signal.note || 'AI analizi yükleniyor...'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {signals.length === 0 && (
        <div className="p-8 text-center text-text/60">
          <p>Henüz sinyal bulunmuyor</p>
        </div>
      )}
    </div>
  );
}

export default SignalTable;


