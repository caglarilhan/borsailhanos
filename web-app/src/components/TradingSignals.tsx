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
          {signals.map((signal, index) => (
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
