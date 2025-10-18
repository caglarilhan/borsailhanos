'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  MinusIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface TradingSignal {
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  price: number;
  change: number;
  timestamp: string;
  xaiExplanation?: string;
  shapValues?: Record<string, number>;
  confluenceScore?: number;
  marketRegime?: string;
  sentimentScore?: number;
  expectedReturn?: number;
  stopLoss?: number;
  takeProfit?: number;
}

interface TradingSignalsProps {
  signals: TradingSignal[];
  isLoading?: boolean;
}

export default function TradingSignals({ signals, isLoading }: TradingSignalsProps) {
  const [selectedSignal, setSelectedSignal] = useState<TradingSignal | null>(null);
  const [showXAI, setShowXAI] = useState(false);
  const [allSignals, setAllSignals] = useState<TradingSignal[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    const mockSignals: TradingSignal[] = [
      {
        symbol: 'THYAO',
        signal: 'BUY',
        confidence: 0.85,
        price: 325.50,
        change: 2.3,
        timestamp: new Date().toISOString(),
        xaiExplanation: 'RSI oversold durumda ve MACD pozitif kesişim yapıyor',
        shapValues: { rsi: 0.25, macd: 0.18, volume: 0.12, price_change: 0.15 },
        confluenceScore: 0.87,
        marketRegime: 'Risk-On',
        sentimentScore: 0.78,
        expectedReturn: 0.045,
        stopLoss: 310.25,
        takeProfit: 340.75
      },
      {
        symbol: 'ASELS',
        signal: 'SELL',
        confidence: 0.72,
        price: 88.40,
        change: -1.8,
        timestamp: new Date().toISOString(),
        xaiExplanation: 'RSI overbought seviyede ve hacim düşüş trendinde',
        shapValues: { rsi: -0.20, macd: -0.15, volume: -0.08, price_change: -0.12 },
        confluenceScore: 0.73,
        marketRegime: 'Risk-Off',
        sentimentScore: 0.42,
        expectedReturn: -0.028,
        stopLoss: 92.15,
        takeProfit: 84.65
      },
      {
        symbol: 'TUPRS',
        signal: 'BUY',
        confidence: 0.91,
        price: 145.20,
        change: 3.1,
        timestamp: new Date().toISOString(),
        xaiExplanation: 'Güçlü momentum ve pozitif sentiment birleşimi',
        shapValues: { rsi: 0.35, macd: 0.28, volume: 0.22, price_change: 0.18 },
        confluenceScore: 0.94,
        marketRegime: 'Risk-On',
        sentimentScore: 0.89,
        expectedReturn: 0.067,
        stopLoss: 138.50,
        takeProfit: 152.30
      },
      {
        symbol: 'SISE',
        signal: 'BUY',
        confidence: 0.78,
        price: 45.80,
        change: 1.2,
        timestamp: new Date().toISOString(),
        xaiExplanation: 'Teknik destek seviyesinde güçlü alım',
        shapValues: { rsi: 0.22, macd: 0.16, volume: 0.14, price_change: 0.11 },
        confluenceScore: 0.81,
        marketRegime: 'Risk-On',
        sentimentScore: 0.65,
        expectedReturn: 0.032,
        stopLoss: 43.50,
        takeProfit: 48.10
      },
      {
        symbol: 'EREGL',
        signal: 'HOLD',
        confidence: 0.65,
        price: 67.30,
        change: -0.5,
        timestamp: new Date().toISOString(),
        xaiExplanation: 'Karışık sinyaller, bekle ve gör stratejisi',
        shapValues: { rsi: 0.05, macd: -0.02, volume: 0.08, price_change: -0.03 },
        confluenceScore: 0.68,
        marketRegime: 'Neutral',
        sentimentScore: 0.55,
        expectedReturn: 0.008,
        stopLoss: 64.20,
        takeProfit: 70.40
      }
    ];
    
    setAllSignals(mockSignals);
  }, []);

  const displaySignals = signals.length > 0 ? signals : allSignals;

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'SELL':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <MinusIcon className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return 'bg-green-500';
      case 'SELL':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">AI Trading Sinyalleri</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-12"></div>
                  </div>
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
          <h2 className="text-lg font-semibold text-gray-900">AI Trading Sinyalleri</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">God Mode</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {displaySignals.map((signal, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${getSignalColor(signal.signal)}`}></div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-gray-900">{signal.symbol}</p>
                      {getSignalIcon(signal.signal)}
                      <span className={`text-sm font-medium ${
                        signal.signal === 'BUY' ? 'text-green-600' : 
                        signal.signal === 'SELL' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {signal.signal}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(signal.timestamp).toLocaleTimeString('tr-TR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₺{signal.price.toFixed(2)}</p>
                  <p className={`text-sm ${
                    signal.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {signal.change >= 0 ? '+' : ''}{signal.change}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Güven</p>
                  <p className={`font-semibold ${getConfidenceColor(signal.confidence)}`}>
                    {(signal.confidence * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedSignal(signal);
                      setShowXAI(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="XAI Açıklama"
                  >
                    <InformationCircleIcon className="h-5 w-5" />
                  </button>
                  {signal.confluenceScore && signal.confluenceScore >= 0.8 && (
                    <div className="flex items-center space-x-1">
                      <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />
                      <span className="text-xs text-orange-600 font-medium">
                        Yüksek Uyum
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* XAI Açıklama Modal */}
              {showXAI && selectedSignal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedSignal.symbol} - XAI Açıklama
                      </h3>
                      <button
                        onClick={() => setShowXAI(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Sinyal Açıklaması:</p>
                        <p className="text-sm text-gray-900">
                          {selectedSignal.xaiExplanation || 'RSI oversold durumda ve MACD pozitif kesişim yapıyor'}
                        </p>
                      </div>
                      
                      {selectedSignal.shapValues && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Özellik Katkıları:</p>
                          <div className="space-y-2">
                            {Object.entries(selectedSignal.shapValues).map(([feature, value]) => (
                              <div key={feature} className="flex justify-between items-center">
                                <span className="text-sm text-gray-700 capitalize">{feature}:</span>
                                <span className={`text-sm font-medium ${
                                  value > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {value > 0 ? '+' : ''}{(value * 100).toFixed(1)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedSignal.stopLoss && selectedSignal.takeProfit && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Stop Loss</p>
                            <p className="text-sm font-semibold text-red-600">
                              ₺{selectedSignal.stopLoss.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Take Profit</p>
                            <p className="text-sm font-semibold text-green-600">
                              ₺{selectedSignal.takeProfit.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
