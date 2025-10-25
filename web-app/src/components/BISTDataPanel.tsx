'use client';

import { useState, useEffect } from 'react';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  MinusIcon,
  ChartBarIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface BISTStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  timestamp: string;
  technical: {
    rsi: number;
    macd: number;
    signal: number;
    bb_upper: number;
    bb_lower: number;
    sma20: number;
    volume_avg: number;
  };
}

interface BISTSignal {
  symbol: string;
  name: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  price: number;
  change: number;
  volume: number;
  timestamp: string;
  technical: any;
  xai_explanation: string;
  expected_return: number;
  stop_loss: number;
  take_profit: number;
}

export default function BISTDataPanel() {
  const [activeTab, setActiveTab] = useState<'data' | 'signals'>('data');
  const [bistData, setBistData] = useState<BISTStock[]>([]);
  const [bistSignals, setBistSignals] = useState<BISTSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [selectedStock, setSelectedStock] = useState<BISTStock | null>(null);

  useEffect(() => {
    loadBISTData();
  }, []);

  const loadBISTData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/bist/data?symbols=AKBNK,ARCLK,ASELS,BIMAS,EREGL`);
      const data = await response.json();
      
      if (data.success) {
        setBistData(data.data);
      } else {
        console.error('BIST veri hatası:', data.error);
      }
    } catch (error) {
      console.error('BIST veri çekme hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBISTSignals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/bist/signals?symbols=AKBNK,ARCLK,ASELS,BIMAS,EREGL`);
      const data = await response.json();
      
      if (data.success) {
        setBistSignals(data.signals);
      } else {
        console.error('BIST sinyal hatası:', data.error);
      }
    } catch (error) {
      console.error('BIST sinyal çekme hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: 'data' | 'signals') => {
    setActiveTab(tab);
    if (tab === 'signals' && bistSignals.length === 0) {
      loadBISTSignals();
    }
  };

  const handleEyeClick = (stock: BISTStock) => {
    setSelectedStock(stock);
    setShowAnalysis(true);
  };

  const handlePlusClick = async (stock: BISTStock) => {
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
      default: return <MinusIcon className="h-4 w-4 text-yellow-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">BIST Veri Paneli</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">BIST Veri Paneli</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => handleTabChange('data')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'data' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Veri
          </button>
          <button
            onClick={() => handleTabChange('signals')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'signals' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            AI Sinyalleri
          </button>
        </div>
      </div>

      {/* BIST Veri Tab */}
      {activeTab === 'data' && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            Gerçek BIST hisse verileri (yfinance)
          </div>
          
          {bistData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">BIST verisi yüklenemedi</p>
              <button
                onClick={loadBISTData}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Tekrar Dene
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bistData.map((stock) => (
                <div key={stock.symbol} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{stock.symbol}</h3>
                      <p className="text-sm text-gray-600">{stock.name}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEyeClick(stock)}
                        className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                        title="Analiz"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePlusClick(stock)}
                        className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                        title="Watchlist'e Ekle"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fiyat:</span>
                      <span className="font-semibold">₺{stock.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Değişim:</span>
                      <span className={`font-semibold ${
                        stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Hacim:</span>
                      <span className="text-sm">{stock.volume.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">RSI:</span>
                      <span className="text-sm">{stock.technical.rsi.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BIST Sinyalleri Tab */}
      {activeTab === 'signals' && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            AI destekli BIST sinyalleri
          </div>
          
          {bistSignals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Sinyal verisi yüklenemedi</p>
              <button
                onClick={loadBISTSignals}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Tekrar Dene
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bistSignals.map((signal) => (
                <div key={signal.symbol} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{signal.symbol}</h3>
                      {getSignalIcon(signal.signal)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSignalColor(signal.signal)}`}>
                        {signal.signal}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {(signal.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fiyat:</span>
                      <span className="font-semibold">₺{signal.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Değişim:</span>
                      <span className={`font-semibold ${
                        signal.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {signal.change >= 0 ? '+' : ''}{signal.change.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Beklenen:</span>
                      <span className={`text-sm ${
                        signal.expected_return >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(signal.expected_return * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {signal.xai_explanation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Analiz Modal */}
      {showAnalysis && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedStock.symbol} Analizi</h3>
              <button
                onClick={() => setShowAnalysis(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-sm text-gray-600">Fiyat</div>
                  <div className="font-semibold">₺{selectedStock.price.toFixed(2)}</div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-sm text-gray-600">Değişim</div>
                  <div className={`font-semibold ${
                    selectedStock.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)}%
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-sm text-gray-600">RSI</div>
                  <div className="font-semibold">{selectedStock.technical.rsi.toFixed(1)}</div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-sm text-gray-600">MACD</div>
                  <div className="font-semibold">{selectedStock.technical.macd.toFixed(3)}</div>
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <div className="text-sm text-gray-600">Teknik Analiz</div>
                <div className="text-sm text-gray-800 mt-1">
                  RSI: {selectedStock.technical.rsi.toFixed(1)} | 
                  MACD: {selectedStock.technical.macd.toFixed(3)} | 
                  SMA20: ₺{selectedStock.technical.sma20.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
