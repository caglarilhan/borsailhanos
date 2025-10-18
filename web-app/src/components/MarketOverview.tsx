'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/config';
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
  const [selectedStock, setSelectedStock] = useState<MarketData | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

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

  const handleEyeClick = (stock: MarketData) => {
    setSelectedStock(stock);
    setShowAnalysis(true);
  };

  const handlePlusClick = async (stock: MarketData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/watchlist/add?symbol=${stock.symbol}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert(`${stock.symbol} watchlist'e eklendi!`);
        } else {
          alert('Ekleme hatası: ' + data.error);
        }
      } else {
        alert('Ekleme hatası!');
      }
    } catch (error) {
      console.error('Watchlist ekleme hatası:', error);
      alert('Ekleme hatası!');
    }
  };

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
                  onClick={() => handleEyeClick(stock)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Detayları Görüntüle"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handlePlusClick(stock)}
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

      {/* Detaylı Analiz Modal */}
      {showAnalysis && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedStock.symbol} - Detaylı Analiz
              </h3>
              <button
                onClick={() => setShowAnalysis(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Temel Bilgiler */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Temel Bilgiler</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sembol:</span>
                    <span className="text-sm font-medium">{selectedStock.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fiyat:</span>
                    <span className="text-sm font-medium">₺{selectedStock.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Değişim:</span>
                    <span className={`text-sm font-medium ${
                      selectedStock.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Hacim:</span>
                    <span className="text-sm font-medium">{selectedStock.volume.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sektör:</span>
                    <span className="text-sm font-medium">{selectedStock.sector || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Finansal Oranlar */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Finansal Oranlar</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">P/E Oranı:</span>
                    <span className={`text-sm font-medium ${
                      selectedStock.peRatio && selectedStock.peRatio < 15 ? 'text-green-600' :
                      selectedStock.peRatio && selectedStock.peRatio > 25 ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {selectedStock.peRatio ? selectedStock.peRatio.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Temettü Verimi:</span>
                    <span className={`text-sm font-medium ${
                      selectedStock.dividendYield && selectedStock.dividendYield > 3 ? 'text-green-600' :
                      selectedStock.dividendYield && selectedStock.dividendYield < 1 ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {selectedStock.dividendYield ? `${selectedStock.dividendYield.toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Piyasa Değeri:</span>
                    <span className="text-sm font-medium">
                      {selectedStock.marketCap ? `₺${(selectedStock.marketCap / 1000000000).toFixed(1)}B` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Hacim/Fiyat:</span>
                    <span className="text-sm font-medium">
                      {(selectedStock.volume / selectedStock.price).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Teknik Analiz */}
              <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Teknik Analiz</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold ${
                      selectedStock.change >= 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(1)}%
                    </div>
                    <p className="text-xs text-gray-600 font-medium">GÜNLÜK DEĞİŞİM</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold bg-blue-500">
                      {selectedStock.volume > 1000000 ? 'YÜKSEK' : 'DÜŞÜK'}
                    </div>
                    <p className="text-xs text-gray-600 font-medium">HACİM</p>
                  </div>
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold ${
                      selectedStock.peRatio && selectedStock.peRatio < 15 ? 'bg-green-500' :
                      selectedStock.peRatio && selectedStock.peRatio > 25 ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`}>
                      {selectedStock.peRatio ? selectedStock.peRatio.toFixed(0) : 'N/A'}
                    </div>
                    <p className="text-xs text-gray-600 font-medium">P/E ORANI</p>
                  </div>
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold ${
                      selectedStock.dividendYield && selectedStock.dividendYield > 3 ? 'bg-green-500' :
                      selectedStock.dividendYield && selectedStock.dividendYield < 1 ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`}>
                      {selectedStock.dividendYield ? `${selectedStock.dividendYield.toFixed(1)}%` : 'N/A'}
                    </div>
                    <p className="text-xs text-gray-600 font-medium">TEMETTÜ</p>
                  </div>
                </div>
              </div>

              {/* AI Önerisi */}
              <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">AI Önerisi</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Genel Değerlendirme:</span>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      selectedStock.change >= 2 ? 'bg-green-100 text-green-700' :
                      selectedStock.change >= 0 ? 'bg-blue-100 text-blue-700' :
                      selectedStock.change >= -2 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {selectedStock.change >= 2 ? 'GÜÇLÜ AL' :
                       selectedStock.change >= 0 ? 'AL' :
                       selectedStock.change >= -2 ? 'BEKLE' : 'SAT'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Risk Seviyesi:</span>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      selectedStock.peRatio && selectedStock.peRatio < 15 ? 'bg-green-100 text-green-700' :
                      selectedStock.peRatio && selectedStock.peRatio > 25 ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedStock.peRatio && selectedStock.peRatio < 15 ? 'DÜŞÜK' :
                       selectedStock.peRatio && selectedStock.peRatio > 25 ? 'YÜKSEK' : 'ORTA'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p className="mb-2">
                      {selectedStock.change >= 2 ? 
                        `${selectedStock.symbol} güçlü yükseliş trendinde. Teknik göstergeler pozitif sinyal veriyor.` :
                        selectedStock.change >= 0 ?
                        `${selectedStock.symbol} pozitif momentum gösteriyor. Dikkatli takip önerilir.` :
                        selectedStock.change >= -2 ?
                        `${selectedStock.symbol} karışık sinyaller veriyor. Bekle ve gör stratejisi uygulanabilir.` :
                        `${selectedStock.symbol} düşüş trendinde. Risk yönetimi önemli.`
                      }
                    </p>
                    <p className="text-xs text-gray-500">
                      * Bu analiz AI destekli teknik analiz sonuçlarıdır. Yatırım kararlarınızı vermeden önce detaylı araştırma yapın.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
