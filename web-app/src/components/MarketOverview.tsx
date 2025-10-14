'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ChartBarIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  marketCap?: number;
  sector?: string;
  peRatio?: number;
  dividendYield?: number;
}

interface MarketOverviewProps {
  marketData: MarketData[];
  isLoading?: boolean;
}

export default function MarketOverview({ marketData, isLoading }: MarketOverviewProps) {
  const [sortBy, setSortBy] = useState<'price' | 'change' | 'volume'>('change');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterSector, setFilterSector] = useState<string>('all');

  const sortedData = [...marketData].sort((a, b) => {
    let aValue = 0;
    let bValue = 0;
    
    switch (sortBy) {
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'change':
        aValue = a.change;
        bValue = b.change;
        break;
      case 'volume':
        aValue = a.volume;
        bValue = b.volume;
        break;
    }
    
    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
  });

  const sectors = ['all', ...new Set(marketData.map(stock => stock.sector).filter(Boolean))];

  const filteredData = filterSector === 'all' 
    ? sortedData 
    : sortedData.filter(stock => stock.sector === filterSector);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Piyasa Özeti</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-24"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Piyasa Özeti</h2>
          <div className="flex items-center space-x-2">
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              {sectors.map(sector => (
                <option key={sector} value={sector}>
                  {sector === 'all' ? 'Tüm Sektörler' : sector}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Sorting Controls */}
      <div className="px-6 py-3 border-b bg-gray-50">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Sırala:</span>
          {['price', 'change', 'volume'].map((option) => (
            <button
              key={option}
              onClick={() => {
                if (sortBy === option) {
                  setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                } else {
                  setSortBy(option as any);
                  setSortOrder('desc');
                }
              }}
              className={`text-sm px-3 py-1 rounded ${
                sortBy === option
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {option === 'price' ? 'Fiyat' : 
               option === 'change' ? 'Değişim' : 'Hacim'}
              {sortBy === option && (
                <span className="ml-1">
                  {sortOrder === 'desc' ? '↓' : '↑'}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {filteredData.map((stock, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-semibold text-gray-900">{stock.symbol}</p>
                    {stock.sector && (
                      <p className="text-xs text-gray-500">{stock.sector}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {stock.change >= 0 ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-sm text-gray-500">
                    Hacim: {stock.volume.toLocaleString()}
                  </p>
                  {stock.peRatio && (
                    <p className="text-sm text-gray-500">
                      P/E: {stock.peRatio.toFixed(1)}
                    </p>
                  )}
                  {stock.dividendYield && (
                    <p className="text-sm text-gray-500">
                      Temettü: %{stock.dividendYield.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-gray-900">₺{stock.price.toFixed(2)}</p>
                {stock.marketCap && (
                  <p className="text-sm text-gray-500">
                    {stock.marketCap >= 1000000000 
                      ? `₺${(stock.marketCap / 1000000000).toFixed(1)}B`
                      : `₺${(stock.marketCap / 1000000).toFixed(0)}M`
                    }
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Detayları Görüntüle"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Watchlist'e Ekle"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
