'use client';

import { useState, useEffect } from 'react';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
import { 
  XMarkIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface SelectedStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  timestamp: string;
}

interface AdvancedChartProps {
  stock: SelectedStock;
  onRemove: (symbol: string) => void;
}

function AdvancedChart({ stock, onRemove }: AdvancedChartProps) {
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock chart data - gerçek uygulamada API'den gelecek
    const mockData = {
      prices: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        open: stock.price * (0.95 + Math.random() * 0.1),
        high: stock.price * (1 + Math.random() * 0.05),
        low: stock.price * (0.9 + Math.random() * 0.05),
        close: stock.price * (0.95 + Math.random() * 0.1),
        volume: Math.floor(Math.random() * 1000000) + 100000
      })),
      technical: {
        rsi: 45 + Math.random() * 20,
        macd: (Math.random() - 0.5) * 2,
        bollingerUpper: stock.price * 1.05,
        bollingerLower: stock.price * 0.95,
        sma20: stock.price * (0.98 + Math.random() * 0.04),
        sma50: stock.price * (0.96 + Math.random() * 0.08)
      }
    };
    
    setTimeout(() => {
      setChartData(mockData);
      setIsLoading(false);
    }, 500);
  }, [stock]);

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'text-green-600 bg-green-100';
      case 'SELL': return 'text-red-600 bg-red-100';
      case 'HOLD': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY': return <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />;
      case 'SELL': return <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />;
      default: return <ChartBarIcon className="h-4 w-4 text-yellow-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 border-2 border-blue-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-2 border-blue-200 hover:border-blue-300 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg text-gray-900">{stock.symbol}</span>
            {getSignalIcon(stock.signal)}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSignalColor(stock.signal)}`}>
              {stock.signal}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-semibold">₺{stock.price.toFixed(2)}</span>
            <span className={`ml-2 ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(1)}%
            </span>
          </div>
        </div>
        <button
          onClick={() => onRemove(stock.symbol)}
          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
          title="Grafiği Kaldır"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Mini Chart */}
      <div className="mb-4">
        <div className="h-32 bg-gray-50 rounded-lg p-2">
          <div className="h-full flex items-end justify-between space-x-1">
            {chartData?.prices.slice(-20).map((price: any, index: number) => {
              const height = ((price.close - Math.min(...chartData.prices.slice(-20).map((p: any) => p.close))) / 
                             (Math.max(...chartData.prices.slice(-20).map((p: any) => p.close)) - 
                              Math.min(...chartData.prices.slice(-20).map((p: any) => p.close)))) * 100;
              return (
                <div
                  key={index}
                  className={`w-2 rounded-sm ${
                    price.close >= price.open ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ height: `${Math.max(height, 5)}%` }}
                  title={`₺${price.close.toFixed(2)}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Technical Indicators */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-gray-50 rounded p-2">
          <div className="text-gray-600">RSI</div>
          <div className="font-semibold">{chartData?.technical.rsi.toFixed(1)}</div>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <div className="text-gray-600">MACD</div>
          <div className="font-semibold">{chartData?.technical.macd.toFixed(2)}</div>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <div className="text-gray-600">SMA 20</div>
          <div className="font-semibold">₺{chartData?.technical.sma20.toFixed(2)}</div>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <div className="text-gray-600">Güven</div>
          <div className="font-semibold">{(stock.confidence * 100).toFixed(0)}%</div>
        </div>
      </div>

      {/* Volume */}
      <div className="mt-3 text-xs text-gray-600">
        <span className="font-medium">Hacim:</span> {chartData?.prices[chartData.prices.length - 1]?.volume.toLocaleString()}
      </div>
    </div>
  );
}

export default function AdvancedChartsPanel() {
  const [selectedStocks, setSelectedStocks] = useState<SelectedStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - gerçek uygulamada API'den gelecek
    const mockStocks: SelectedStock[] = [
      {
        symbol: 'THYAO',
        name: 'Türk Hava Yolları',
        price: 325.50,
        change: 2.3,
        signal: 'BUY',
        confidence: 0.85,
        timestamp: new Date().toISOString()
      },
      {
        symbol: 'TUPRS',
        name: 'Tüpraş',
        price: 145.20,
        change: 3.1,
        signal: 'BUY',
        confidence: 0.91,
        timestamp: new Date().toISOString()
      },
      {
        symbol: 'SISE',
        name: 'Şişe Cam',
        price: 45.80,
        change: 1.2,
        signal: 'BUY',
        confidence: 0.78,
        timestamp: new Date().toISOString()
      }
    ];

    setTimeout(() => {
      setSelectedStocks(mockStocks);
      setIsLoading(false);
    }, 1000);
  }, []);

  const removeStock = (symbol: string) => {
    setSelectedStocks(prev => prev.filter(stock => stock.symbol !== symbol));
  };

  const clearAllCharts = () => {
    setSelectedStocks([]);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Gelişmiş Grafikler</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Gelişmiş Grafikler</h2>
        {selectedStocks.length > 0 && (
          <button
            onClick={clearAllCharts}
            className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Tümünü Temizle</span>
          </button>
        )}
      </div>

      {selectedStocks.length === 0 ? (
        <div className="text-center py-12">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz Grafik Seçilmedi</h3>
          <p className="text-gray-500 mb-4">
            AI Trading Sinyalleri'nden hisse seçerek gelişmiş grafiklerini görüntüleyebilirsiniz.
          </p>
          <div className="text-sm text-gray-400">
            💡 İpucu: Hisse kartlarına tıklayarak grafik ekleyebilirsiniz
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {selectedStocks.map((stock) => (
            <AdvancedChart
              key={stock.symbol}
              stock={stock}
              onRemove={removeStock}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      {selectedStocks.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              <span className="font-medium">{selectedStocks.length}</span> grafik görüntüleniyor
            </span>
            <span>
              Ortalama güven: <span className="font-medium">
                {((selectedStocks.reduce((sum, stock) => sum + stock.confidence, 0) / selectedStocks.length) * 100).toFixed(0)}%
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
