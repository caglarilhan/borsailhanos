import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ChartData {
  timestamp: string;
  price: number;
  volume: number;
  change: number;
  changePercent: number;
}

interface DynamicChartProps {
  symbol?: string;
  className?: string;
}

const DynamicChart: React.FC<DynamicChartProps> = ({ 
  symbol = 'THYAO',
  className 
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState(symbol);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiExplanation, setAiExplanation] = useState<string>('');

  // Mock data generation
  useEffect(() => {
    const generateMockData = () => {
      const data: ChartData[] = [];
      const basePrice = Math.random() * 100 + 50;
      let currentPrice = basePrice;

      for (let i = 0; i < 30; i++) {
        const change = (Math.random() - 0.5) * 2;
        currentPrice += change;
        
        data.push({
          timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
          price: Math.round(currentPrice * 100) / 100,
          volume: Math.floor(Math.random() * 1000000) + 100000,
          change: change,
          changePercent: (change / (currentPrice - change)) * 100
        });
      }

      setChartData(data);
      setIsLoading(false);
    };

    generateMockData();
  }, [selectedSymbol]);

  // Generate AI explanation based on data
  useEffect(() => {
    if (chartData.length > 0) {
      const latestData = chartData[chartData.length - 1];
      const trend = latestData.change > 0 ? 'yükseliş' : 'düşüş';
      const confidence = Math.random() * 30 + 70; // 70-100% confidence
      
      setAiExplanation(
        `AI analizi: ${selectedSymbol} için ${trend} trendi tespit edildi. ` +
        `Son fiyat ${latestData.price} TL, günlük değişim %${latestData.changePercent.toFixed(2)}. ` +
        `Güven skoru: %${confidence.toFixed(1)}`
      );
    }
  }, [chartData, selectedSymbol]);

  const symbols = ['THYAO', 'TUPRS', 'ASELS', 'SISE', 'EREGL', 'KRDMD', 'BIMAS', 'AKBNK'];

  return (
    <div className={clsx(
      'card-graphite p-6 space-y-6',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-white">Gelişmiş Grafikler</h2>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-neon-500 animate-pulse-electric"></div>
            <span className="text-sm text-gray-400">Canlı Veri</span>
          </div>
        </div>

        {/* Symbol Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-300">Sembol:</label>
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="input-graphite w-32 text-sm"
          >
            {symbols.map((sym) => (
              <option key={sym} value={sym} className="bg-graphite-800">
                {sym}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative">
        {isLoading ? (
          <div className="h-96 bg-graphite-900/50 rounded-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-electric-500"></div>
          </div>
        ) : (
          <div className="h-96 bg-graphite-900/50 rounded-lg p-4">
            {/* Mock Chart Visualization */}
            <div className="h-full flex items-end justify-between space-x-1">
              {chartData.map((data, index) => {
                const height = (data.price / Math.max(...chartData.map(d => d.price))) * 100;
                const isPositive = data.change >= 0;
                
                return (
                  <div
                    key={index}
                    className={clsx(
                      'flex-1 rounded-t transition-all duration-300 hover:opacity-80',
                      isPositive ? 'bg-neon-500' : 'bg-red-500'
                    )}
                    style={{ height: `${height}%` }}
                    title={`${data.timestamp}: ${data.price} TL`}
                  />
                );
              })}
            </div>
            
            {/* Chart Grid Lines */}
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
        )}
      </div>

      {/* Chart Info */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {chartData[chartData.length - 1].price} TL
            </div>
            <div className="text-sm text-gray-400">Son Fiyat</div>
          </div>
          <div className="text-center">
            <div className={clsx(
              'text-2xl font-bold',
              chartData[chartData.length - 1].change >= 0 ? 'text-neon-500' : 'text-red-500'
            )}>
              {chartData[chartData.length - 1].change >= 0 ? '+' : ''}
              {chartData[chartData.length - 1].changePercent.toFixed(2)}%
            </div>
            <div className="text-sm text-gray-400">Günlük Değişim</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {chartData[chartData.length - 1].volume.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Hacim</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-electric-500">
              {Math.max(...chartData.map(d => d.price)).toFixed(2)} TL
            </div>
            <div className="text-sm text-gray-400">30 Günlük Yüksek</div>
          </div>
        </div>
      )}

      {/* AI Explanation */}
      {aiExplanation && (
        <div className="card-glass p-4">
          <div className="flex items-start space-x-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-electric flex items-center justify-center flex-shrink-0">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-electric-100 mb-1">AI Analizi</h3>
              <p className="text-sm text-gray-300">{aiExplanation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicChart;