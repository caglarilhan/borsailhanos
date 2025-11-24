'use client';

import { useState, useMemo } from 'react';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { buildPolylinePoints, buildBandPolygon } from '@/lib/svgChart';

interface ChartData {
  time: string;
  price: number;
  volume?: number;
  signal?: 'BUY' | 'SELL' | 'HOLD';
  rsi?: number;
  macd?: number;
  bollingerUpper?: number;
  bollingerLower?: number;
  sentiment?: number;
}

interface AdvancedChartsProps {
  symbol?: string;
  data?: ChartData[];
  isLoading?: boolean;
}

export default function AdvancedCharts({ symbol = 'THYAO', data, isLoading }: AdvancedChartsProps) {
  const [chartType, setChartType] = useState<'line' | 'area' | 'candlestick' | 'volume'>('line');
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M'>('1D');
  const [showIndicators, setShowIndicators] = useState(true);
  const [showSignals, setShowSignals] = useState(true);

  // Mock data for demonstration
  const mockData: ChartData[] = [
    { time: '09:00', price: 320, volume: 150000, signal: 'HOLD', rsi: 45, macd: 0.5, bollingerUpper: 325, bollingerLower: 315, sentiment: 0.6 },
    { time: '10:00', price: 322, volume: 180000, signal: 'HOLD', rsi: 48, macd: 0.8, bollingerUpper: 326, bollingerLower: 316, sentiment: 0.7 },
    { time: '11:00', price: 318, volume: 120000, signal: 'SELL', rsi: 42, macd: 0.2, bollingerUpper: 324, bollingerLower: 314, sentiment: 0.4 },
    { time: '12:00', price: 325, volume: 200000, signal: 'BUY', rsi: 55, macd: 1.2, bollingerUpper: 328, bollingerLower: 318, sentiment: 0.8 },
    { time: '13:00', price: 323, volume: 160000, signal: 'HOLD', rsi: 52, macd: 1.0, bollingerUpper: 327, bollingerLower: 317, sentiment: 0.7 },
    { time: '14:00', price: 327, volume: 220000, signal: 'BUY', rsi: 58, macd: 1.5, bollingerUpper: 330, bollingerLower: 320, sentiment: 0.9 },
    { time: '15:00', price: 325, volume: 190000, signal: 'HOLD', rsi: 56, macd: 1.3, bollingerUpper: 329, bollingerLower: 319, sentiment: 0.8 }
  ];

  const chartData = data || mockData;

  const getSignalColor = (signal?: string) => {
    switch (signal) {
      case 'BUY': return '#10B981';
      case 'SELL': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const chartDims = { width: 640, height: 280, padding: 28 };

  const priceLine = useMemo(
    () => buildPolylinePoints(chartData, (d) => d.price, chartDims),
    [chartData]
  );

  const bollingerBand = useMemo(() => {
    if (!showIndicators || !showSignals) return '';
    return buildBandPolygon(chartData, 'bollingerUpper', 'bollingerLower', chartDims);
  }, [chartData, showIndicators, showSignals]);

  const upperLine = useMemo(() => {
    if (!showIndicators || !showSignals) return '';
    return buildPolylinePoints(chartData, 'bollingerUpper', chartDims);
  }, [chartData, showIndicators, showSignals]);

  const lowerLine = useMemo(() => {
    if (!showIndicators || !showSignals) return '';
    return buildPolylinePoints(chartData, 'bollingerLower', chartDims);
  }, [chartData, showIndicators, showSignals]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Gelişmiş Grafikler</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-80 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Gelişmiş Grafikler - {symbol}
          </h2>
          <div className="flex items-center space-x-4">
            {/* Timeframe Selector */}
            <div className="flex items-center space-x-2">
              {['1D', '1W', '1M', '3M'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf as any)}
                  className={`px-3 py-1 text-sm rounded ${
                    timeframe === tf
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
            
            {/* Chart Type Selector */}
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="h-5 w-5 text-gray-400" />
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="line">Çizgi</option>
                <option value="area">Alan</option>
                <option value="candlestick">Mum</option>
                <option value="volume">Hacim</option>
              </select>
            </div>
            
            {/* Indicators Toggle */}
            <button
              onClick={() => setShowIndicators(!showIndicators)}
              className={`p-2 rounded ${
                showIndicators ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Göstergeleri Göster/Gizle"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="h-80">
          {chartType === 'volume' ? (
            <div className="flex items-end h-full gap-3 px-2">
              {chartData.map((item) => {
                const volume = item.volume || 0;
                const maxVolume = Math.max(...chartData.map((c) => c.volume || 0), 1);
                const height = `${(volume / maxVolume) * 100 || 5}%`;
                return (
                  <div key={item.time} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-purple-400 to-purple-600 transition-all"
                      style={{ height }}
                    />
                    <span className="text-[10px] text-slate-500 mt-1">{item.time}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${chartDims.width} ${chartDims.height}`}
              preserveAspectRatio="none"
              className="text-slate-500"
            >
              <defs>
                <linearGradient id="advancedArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={chartType === 'area' ? 0.25 : 0} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>

              {[0.25, 0.5, 0.75].map((ratio) => (
                <line
                  key={ratio}
                  x1={chartDims.padding}
                  x2={chartDims.width - chartDims.padding}
                  y1={chartDims.padding + ratio * (chartDims.height - chartDims.padding * 2)}
                  y2={chartDims.padding + ratio * (chartDims.height - chartDims.padding * 2)}
                  stroke="#e5e7eb"
                  strokeDasharray="4 4"
                />
              ))}

              {chartType === 'area' && priceLine && (
                <polygon
                  points={`${chartDims.padding},${chartDims.height - chartDims.padding} ${priceLine} ${
                    chartDims.width - chartDims.padding
                  },${chartDims.height - chartDims.padding}`}
                  fill="url(#advancedArea)"
                />
              )}

              {bollingerBand && (
                <polygon
                  points={bollingerBand}
                  fill="rgba(16,185,129,0.08)"
                />
              )}

              {upperLine && (
                <polyline
                  points={upperLine}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  strokeDasharray="6 6"
                  opacity={0.7}
                />
              )}

              {lowerLine && (
                <polyline
                  points={lowerLine}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  strokeDasharray="6 6"
                  opacity={0.7}
                />
              )}

              <polyline
                points={priceLine}
                fill="none"
                stroke="#3b82f6"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        
        {/* Technical Indicators */}
        {showIndicators && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">RSI</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">
                  {chartData[chartData.length - 1]?.rsi || 0}
                </span>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Son Değer</p>
                  <p className="text-xs text-gray-400">
                    {/* P0-01: RSI State Düzeltme - Use mapRSIToState */}
                    {(() => {
                      const rsi = chartData[chartData.length - 1]?.rsi;
                      if (!rsi) return 'N/A';
                      const { mapRSIToState, getRSIStateLabel } = require('@/lib/rsi');
                      const state = mapRSIToState(rsi);
                      return getRSIStateLabel(rsi);
                    })()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">MACD</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-purple-600">
                  {chartData[chartData.length - 1]?.macd?.toFixed(2) || '0.00'}
                </span>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Son Değer</p>
                  <p className="text-xs text-gray-400">
                    {chartData[chartData.length - 1]?.macd && chartData[chartData.length - 1].macd > 0 
                      ? 'Pozitif' 
                      : 'Negatif'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Sentiment</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">
                  {((chartData[chartData.length - 1]?.sentiment || 0) * 100).toFixed(0)}%
                </span>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Son Değer</p>
                  <p className="text-xs text-gray-400">
                    {chartData[chartData.length - 1]?.sentiment && chartData[chartData.length - 1].sentiment > 0.7 
                      ? 'Çok Pozitif' 
                      : chartData[chartData.length - 1]?.sentiment && chartData[chartData.length - 1].sentiment < 0.3 
                      ? 'Çok Negatif' 
                      : 'Nötr'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

AdvancedCharts.displayName = 'AdvancedCharts';

export default AdvancedCharts;
