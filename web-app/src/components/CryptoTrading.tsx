'use client';

import { useState, useEffect } from 'react';
import { 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  FireIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface CryptoPrice {
  symbol: string;
  price: number;
  timestamp: string;
  exchange: string;
}

interface CryptoPrediction {
  symbol: string;
  current_price: number;
  predicted_price: number;
  change_percent: number;
  confidence: number;
  timeframe: string;
  recommendation: string;
  risk_level: string;
  reasons: string[];
  market_cap: number;
  volume_24h: number;
  last_update: string;
}

interface TrendingCrypto {
  symbol: string;
  name: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  volume_change: number;
  market_cap: number;
  rank: number;
  last_update: string;
}

interface CryptoTradingProps {
  isLoading?: boolean;
}

export default function CryptoTrading({ isLoading }: CryptoTradingProps) {
  const [prices, setPrices] = useState<{ [key: string]: CryptoPrice }>({});
  const [predictions, setPredictions] = useState<CryptoPrediction[]>([]);
  const [trending, setTrending] = useState<TrendingCrypto[]>([]);
  const [timeframe, setTimeframe] = useState<'5m' | '15m' | '1h' | '4h' | '1d' | '1w'>('1h');
  const [activeTab, setActiveTab] = useState<'prices' | 'predictions' | 'trending' | 'portfolio'>('prices');
  const [selectedCrypto, setSelectedCrypto] = useState<string>('');

  useEffect(() => {
    loadCryptoData();
  }, []);

  useEffect(() => {
    if (activeTab === 'predictions') {
      loadPredictions();
    }
  }, [timeframe, activeTab]);

  const loadCryptoData = async () => {
    try {
      // Load prices
      const pricesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/api/crypto/prices`);
      const pricesData = await pricesResponse.json();
      setPrices(pricesData.prices || {});

      // Load trending
      const trendingResponse = await fetch('http://localhost:8081/api/crypto/trending');
      const trendingData = await trendingResponse.json();
      setTrending(trendingData.trending || []);
    } catch (error) {
      console.error('Error loading crypto data:', error);
    }
  };

  const loadPredictions = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/crypto/predictions?timeframe=${timeframe}&limit=10`);
      const data = await response.json();
      setPredictions(data.predictions || []);
    } catch (error) {
      console.error('Error loading predictions:', error);
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Güçlü Al': return 'bg-green-100 text-green-800 border-green-200';
      case 'Al': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Bekle': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Sat': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Güçlü Sat': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Düşük': return 'text-green-600';
      case 'Orta': return 'text-yellow-600';
      case 'Yüksek': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toFixed(4)}`;
    }
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000000000) {
      return `$${(marketCap / 1000000000000).toFixed(2)}T`;
    } else if (marketCap >= 1000000000) {
      return `$${(marketCap / 1000000000).toFixed(2)}B`;
    } else if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(2)}M`;
    } else {
      return `$${marketCap.toLocaleString()}`;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Kripto Trading</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-300 rounded"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
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
            <CurrencyDollarIcon className="h-6 w-6 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">Kripto Trading</h2>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              Canlı
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {activeTab === 'predictions' && (
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-4 w-4 text-gray-400" />
                {[
                  { key: '5m', label: '5dk' },
                  { key: '15m', label: '15dk' },
                  { key: '1h', label: '1sa' },
                  { key: '4h', label: '4sa' },
                  { key: '1d', label: '1gün' },
                  { key: '1w', label: '1hafta' }
                ].map((tf) => (
                  <button
                    key={tf.key}
                    onClick={() => setTimeframe(tf.key as any)}
                    className={`px-2 py-1 text-xs rounded ${
                      timeframe === tf.key
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'prices', name: 'Fiyatlar', icon: CurrencyDollarIcon },
                { id: 'predictions', name: 'AI Tahminleri', icon: ChartBarIcon },
                { id: 'trending', name: 'Trending', icon: FireIcon },
                { id: 'portfolio', name: 'Portföy', icon: ChartBarIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Prices Tab */}
        {activeTab === 'prices' && (
          <div className="space-y-4">
            {Object.entries(prices).map(([symbol, priceData]) => (
              <div key={symbol} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{symbol}</p>
                      <p className="text-sm text-gray-500">{priceData.exchange}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      {formatPrice(priceData.price)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(priceData.timestamp).toLocaleTimeString('tr-TR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Predictions Tab */}
        {activeTab === 'predictions' && (
          <div className="space-y-4">
            {predictions.map((prediction, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {prediction.change_percent > 0 ? (
                        <ArrowTrendingUpIcon className="h-6 w-6 text-green-500" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-6 w-6 text-red-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-gray-900">{prediction.symbol}</p>
                        <span className="text-xs text-gray-400">({prediction.timeframe})</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">
                          Piyasa Değeri: {formatMarketCap(prediction.market_cap)}
                        </span>
                        <span className="text-sm text-gray-500">
                          24s Hacim: {formatMarketCap(prediction.volume_24h)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(prediction.current_price)}
                    </p>
                    <p className="text-sm text-gray-500">
                      → {formatPrice(prediction.predicted_price)}
                    </p>
                    <p className={`text-sm font-medium ${
                      prediction.change_percent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {prediction.change_percent >= 0 ? '+' : ''}{prediction.change_percent}%
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Güven</p>
                    <p className="font-semibold text-blue-600">
                      {(prediction.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRecommendationColor(prediction.recommendation)}`}>
                      {prediction.recommendation}
                    </span>
                    <p className={`text-xs mt-1 ${getRiskColor(prediction.risk_level)}`}>
                      Risk: {prediction.risk_level}
                    </p>
                  </div>
                </div>
                
                {/* Reasons */}
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Tahmin Nedenleri:</p>
                  <div className="flex flex-wrap gap-2">
                    {prediction.reasons.map((reason, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trending Tab */}
        {activeTab === 'trending' && (
          <div className="space-y-4">
            {trending.map((crypto, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <FireIcon className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-gray-900">{crypto.name}</p>
                        <span className="text-sm text-gray-500">({crypto.symbol})</span>
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          #{crypto.rank}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">
                          Piyasa Değeri: {formatMarketCap(crypto.market_cap)}
                        </span>
                        <span className="text-sm text-gray-500">
                          24s Hacim: {formatMarketCap(crypto.volume_24h)}
                        </span>
                        <span className={`text-sm font-medium ${
                          crypto.volume_change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          Hacim: {crypto.volume_change >= 0 ? '+' : ''}{crypto.volume_change.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      {formatPrice(crypto.price)}
                    </p>
                    <p className={`text-sm font-medium ${
                      crypto.change_24h >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {crypto.change_24h >= 0 ? '+' : ''}{crypto.change_24h}% (24s)
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            {/* Portfolio Summary */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kripto Portföy Özeti</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">$5,542.39</p>
                  <p className="text-sm text-gray-500">Toplam Değer</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">+$292.39</p>
                  <p className="text-sm text-gray-500">Toplam Kar/Zarar</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">+5.57%</p>
                  <p className="text-sm text-gray-500">Kar/Zarar %</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">3</p>
                  <p className="text-sm text-gray-500">Aktif Pozisyon</p>
                </div>
              </div>
            </div>

            {/* Portfolio Positions */}
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-4">Pozisyonlar</h3>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <CurrencyDollarIcon className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Bitcoin (BTC)</p>
                        <p className="text-sm text-gray-500">Miktar: 0.025 BTC</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">$1,081.26</p>
                      <p className="text-sm text-green-600 font-medium">+$31.26 (+2.98%)</p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Ethereum (ETH)</p>
                        <p className="text-sm text-gray-500">Miktar: 1.5 ETH</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">$3,976.13</p>
                      <p className="text-sm text-green-600 font-medium">+$226.13 (+6.03%)</p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Cardano (ADA)</p>
                        <p className="text-sm text-gray-500">Miktar: 1,000 ADA</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">$485.00</p>
                      <p className="text-sm text-green-600 font-medium">+$35.00 (+7.78%)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
