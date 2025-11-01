'use client';

import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart
} from 'recharts';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

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

  const CustomTooltip = memo(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-gray-600">Fiyat: </span>
              <span className="font-medium">₺{data.price}</span>
            </p>
            {data.volume && (
              <p className="text-sm">
                <span className="text-gray-600">Hacim: </span>
                <span className="font-medium">{data.volume.toLocaleString()}</span>
              </p>
            )}
            {data.signal && (
              <p className="text-sm">
                <span className="text-gray-600">Sinyal: </span>
                <span 
                  className="font-medium"
                  style={{ color: getSignalColor(data.signal) }}
                >
                  {data.signal}
                </span>
              </p>
            )}
            {data.rsi && (
              <p className="text-sm">
                <span className="text-gray-600">RSI: </span>
                <span className="font-medium">{data.rsi}</span>
              </p>
            )}
            {data.sentiment && (
              <p className="text-sm">
                <span className="text-gray-600">Sentiment: </span>
                <span className="font-medium">{(data.sentiment * 100).toFixed(0)}%</span>
              </p>
            )}
          </div>
      </div>
    );
    }
    return null;
  });
  CustomTooltip.displayName = 'CustomTooltip';

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
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
                {showIndicators && showSignals && (
                  <Line 
                    type="monotone" 
                    dataKey="bollingerUpper" 
                    stroke="#10B981" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                )}
                {showIndicators && showSignals && (
                  <Line 
                    type="monotone" 
                    dataKey="bollingerLower" 
                    stroke="#EF4444" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                )}
              </LineChart>
            ) : chartType === 'area' ? (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3B82F6" 
                  fill="#3B82F6"
                  fillOpacity={0.1}
                />
              </AreaChart>
            ) : chartType === 'volume' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="volume" fill="#8B5CF6" />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
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
                    {chartData[chartData.length - 1]?.rsi && chartData[chartData.length - 1].rsi > 70 
                      ? 'Overbought' 
                      : chartData[chartData.length - 1]?.rsi && chartData[chartData.length - 1].rsi < 30 
                      ? 'Oversold' 
                      : 'Normal'}
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
