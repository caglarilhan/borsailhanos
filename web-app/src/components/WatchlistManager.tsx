'use client';

import React, { useState, useEffect } from 'react';
import { 
  StarIcon, 
  PlusIcon, 
  TrashIcon, 
  EyeIcon,
  BellIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface WatchlistItem {
  symbol: string;
  company: string;
  sector: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  addedAt: string;
  alerts: {
    priceTarget: number;
    alertType: 'above' | 'below';
    isActive: boolean;
  }[];
}

interface WatchlistManagerProps {
  isLoading?: boolean;
}

const WatchlistManager: React.FC<WatchlistManagerProps> = ({ isLoading }) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WatchlistItem | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [newAlert, setNewAlert] = useState({ priceTarget: 0, alertType: 'above' as 'above' | 'below' });

  // Load watchlist from localStorage on component mount
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('bist_watchlist');
    if (savedWatchlist) {
      try {
        setWatchlist(JSON.parse(savedWatchlist));
      } catch (error) {
        console.error('Error loading watchlist from localStorage:', error);
      }
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    if (watchlist.length > 0) {
      localStorage.setItem('bist_watchlist', JSON.stringify(watchlist));
    }
  }, [watchlist]);

  const searchStocks = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Mock search results - in real app, this would call an API
      const mockResults = [
        { symbol: 'THYAO', company: 'Türk Hava Yolları', sector: 'Havacılık', currentPrice: 325.50 },
        { symbol: 'ASELS', company: 'Aselsan', sector: 'Savunma', currentPrice: 88.40 },
        { symbol: 'TUPRS', company: 'Tüpraş', sector: 'Enerji', currentPrice: 145.20 },
        { symbol: 'SISE', company: 'Şişecam', sector: 'İnşaat', currentPrice: 45.80 },
        { symbol: 'EREGL', company: 'Ereğli Demir Çelik', sector: 'Çelik', currentPrice: 67.30 },
        { symbol: 'AKBNK', company: 'Akbank', sector: 'Bankacılık', currentPrice: 95.20 },
        { symbol: 'GARAN', company: 'Garanti BBVA', sector: 'Bankacılık', currentPrice: 85.40 },
        { symbol: 'ISCTR', company: 'İş Bankası', sector: 'Bankacılık', currentPrice: 12.80 },
        { symbol: 'YKBNK', company: 'Yapı Kredi', sector: 'Bankacılık', currentPrice: 8.45 },
        { symbol: 'HALKB', company: 'Halkbank', sector: 'Bankacılık', currentPrice: 15.20 }
      ].filter(stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.company.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(mockResults);
    } catch (error) {
      console.error('Error searching stocks:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addToWatchlist = (stock: any) => {
    const newItem: WatchlistItem = {
      symbol: stock.symbol,
      company: stock.company,
      sector: stock.sector,
      currentPrice: stock.currentPrice,
      change: Math.random() * 10 - 5, // Mock change
      changePercent: Math.random() * 6 - 3, // Mock change percent
      volume: Math.floor(Math.random() * 5000000) + 1000000,
      marketCap: Math.floor(Math.random() * 50000000000) + 10000000000,
      peRatio: Math.random() * 20 + 5,
      addedAt: new Date().toISOString(),
      alerts: []
    };

    setWatchlist(prev => {
      const exists = prev.find(item => item.symbol === stock.symbol);
      if (exists) {
        return prev; // Don't add if already exists
      }
      return [...prev, newItem];
    });

    setNewSymbol('');
    setSearchResults([]);
    setShowAddModal(false);
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
  };

  const addAlert = (symbol: string) => {
    const item = watchlist.find(item => item.symbol === symbol);
    if (item) {
      setSelectedItem(item);
      setNewAlert({ priceTarget: item.currentPrice, alertType: 'above' });
      setShowAlertModal(true);
    }
  };

  const saveAlert = () => {
    if (!selectedItem) return;

    const updatedWatchlist = watchlist.map(item => {
      if (item.symbol === selectedItem.symbol) {
        return {
          ...item,
          alerts: [...item.alerts, { ...newAlert, isActive: true }]
        };
      }
      return item;
    });

    setWatchlist(updatedWatchlist);
    setShowAlertModal(false);
    setSelectedItem(null);
  };

  const removeAlert = (symbol: string, alertIndex: number) => {
    const updatedWatchlist = watchlist.map(item => {
      if (item.symbol === symbol) {
        return {
          ...item,
          alerts: item.alerts.filter((_, index) => index !== alertIndex)
        };
      }
      return item;
    });

    setWatchlist(updatedWatchlist);
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">İzleme Listesi</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-300 rounded"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-12"></div>
                  </div>
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
          <div className="flex items-center space-x-3">
            <StarIconSolid className="h-6 w-6 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">İzleme Listesi</h2>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              {watchlist.length} hisse
            </span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Hisse Ekle
          </button>
        </div>
      </div>

      <div className="p-6">
        {watchlist.length === 0 ? (
          <div className="text-center py-12">
            <StarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">İzleme listesi boş</h3>
            <p className="mt-1 text-sm text-gray-500">
              Takip etmek istediğiniz hisseleri ekleyerek başlayın.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                İlk Hissenizi Ekleyin
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {watchlist.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <ChartBarIcon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-gray-900">{item.symbol}</p>
                        <span className="text-sm text-gray-500">{item.company}</span>
                        <span className="text-xs text-gray-400">({item.sector})</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">
                          Piyasa Değeri: {item.marketCap >= 1000000000 
                            ? `₺${(item.marketCap / 1000000000).toFixed(1)}B`
                            : `₺${(item.marketCap / 1000000).toFixed(0)}M`
                          }
                        </span>
                        <span className="text-sm text-gray-500">P/E: {item.peRatio.toFixed(1)}</span>
                        <span className="text-sm text-gray-500">
                          Hacim: {item.volume.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₺{item.currentPrice.toFixed(2)}</p>
                    <p className={`text-sm font-medium ${getChangeColor(item.change)}`}>
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} 
                      ({item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => addAlert(item.symbol)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Uyarı Ekle"
                    >
                      <BellIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => removeFromWatchlist(item.symbol)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Listeden Çıkar"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {/* Alerts */}
                {item.alerts.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Aktif Uyarılar</h4>
                    <div className="space-y-2">
                      {item.alerts.map((alert, alertIndex) => (
                        <div key={alertIndex} className="flex items-center justify-between bg-yellow-50 p-2 rounded">
                          <div className="flex items-center space-x-2">
                            <BellIcon className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm text-gray-700">
                              Fiyat {alert.alertType === 'above' ? 'üzerinde' : 'altında'} ₺{alert.priceTarget.toFixed(2)}
                            </span>
                          </div>
                          <button
                            onClick={() => removeAlert(item.symbol, alertIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Hisse Ekle</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="symbol" className="block text-sm font-medium text-gray-700">
                  Hisse Senedi Sembolü
                </label>
                <input
                  type="text"
                  id="symbol"
                  value={newSymbol}
                  onChange={(e) => {
                    setNewSymbol(e.target.value);
                    searchStocks(e.target.value);
                  }}
                  placeholder="Örn: THYAO, ASELS..."
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              {isSearching && (
                <div className="text-center py-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              )}
              
              {searchResults.length > 0 && (
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                  {searchResults.map((stock, index) => (
                    <div
                      key={index}
                      onClick={() => addToWatchlist(stock)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{stock.symbol}</p>
                          <p className="text-sm text-gray-500">{stock.company}</p>
                          <p className="text-xs text-gray-400">{stock.sector}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₺{stock.currentPrice.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {showAlertModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedItem.symbol} için Uyarı Ekle
              </h3>
              <button
                onClick={() => setShowAlertModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="priceTarget" className="block text-sm font-medium text-gray-700">
                  Hedef Fiyat
                </label>
                <input
                  type="number"
                  id="priceTarget"
                  value={newAlert.priceTarget}
                  onChange={(e) => setNewAlert({ ...newAlert, priceTarget: parseFloat(e.target.value) })}
                  step="0.01"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="alertType" className="block text-sm font-medium text-gray-700">
                  Uyarı Tipi
                </label>
                <select
                  id="alertType"
                  value={newAlert.alertType}
                  onChange={(e) => setNewAlert({ ...newAlert, alertType: e.target.value as 'above' | 'below' })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="above">Fiyat üzerinde</option>
                  <option value="below">Fiyat altında</option>
                </select>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={saveAlert}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Uyarı Ekle
                </button>
                <button
                  onClick={() => setShowAlertModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchlistManager;
