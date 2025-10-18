'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/config';
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
  const [showAnalysisTable, setShowAnalysisTable] = useState(false);

  // Gerçek veri çekme
  useEffect(() => {
    const fetchRealSignals = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/real/trading_signals`);
        const data = await response.json();
        
        if (data.signals && data.signals.length > 0) {
          // Gerçek veriyi TradingSignal formatına çevir
          const realSignals: TradingSignal[] = data.signals.map((signal: any) => ({
            symbol: signal.symbol,
            signal: signal.signal as 'BUY' | 'SELL' | 'HOLD',
            confidence: signal.confidence,
            price: signal.price,
            change: signal.change,
            timestamp: signal.timestamp,
            xaiExplanation: signal.xai_explanation,
            shapValues: {
              rsi: signal.rsi || 0,
              macd: signal.macd || 0,
              volume: signal.volume / 1000000, // Milyon cinsinden
              price_change: signal.change / 100
            },
            confluenceScore: signal.confidence,
            marketRegime: signal.change > 0 ? 'Risk-On' : 'Risk-Off',
            sentimentScore: signal.confidence,
            expectedReturn: signal.expected_return,
            stopLoss: signal.stop_loss,
            takeProfit: signal.take_profit
          }));
          
          setAllSignals(realSignals);
        }
      } catch (error) {
        console.error('Gerçek veri çekme hatası:', error);
        // Hata durumunda mock veriyi kullan
        loadMockSignals();
      }
    };

    const loadMockSignals = () => {
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
        },
        {
          symbol: 'BIMAS',
          signal: 'BUY',
          confidence: 0.82,
          price: 125.80,
          change: 2.8,
          timestamp: new Date().toISOString(),
          xaiExplanation: 'Güçlü temel analiz ve pozitif momentum',
          shapValues: { rsi: 0.28, macd: 0.21, volume: 0.19, price_change: 0.16 },
          confluenceScore: 0.85,
          marketRegime: 'Risk-On',
          sentimentScore: 0.72,
          expectedReturn: 0.052,
          stopLoss: 119.50,
          takeProfit: 132.10
        },
        {
          symbol: 'KCHOL',
          signal: 'BUY',
          confidence: 0.76,
          price: 155.30,
          change: 1.9,
          timestamp: new Date().toISOString(),
          xaiExplanation: 'Sektör lideri ve güçlü temel analiz',
          shapValues: { rsi: 0.18, macd: 0.16, volume: 0.14, price_change: 0.16 },
          confluenceScore: 0.78,
          marketRegime: 'Risk-On',
          sentimentScore: 0.75,
          expectedReturn: 0.042,
          stopLoss: 147.80,
          takeProfit: 162.80
        },
        {
          symbol: 'SAHOL',
          signal: 'HOLD',
          confidence: 0.65,
          price: 72.10,
          change: 0.3,
          timestamp: new Date().toISOString(),
          xaiExplanation: 'Nötr pozisyon, teknik göstergeler karışık',
          shapValues: { rsi: 0.10, macd: 0.12, volume: 0.08, price_change: 0.05 },
          confluenceScore: 0.67,
          marketRegime: 'Risk-On',
          sentimentScore: 0.68,
          expectedReturn: 0.008,
          stopLoss: 68.50,
          takeProfit: 75.70
        }
      ];
      
      setAllSignals(mockSignals);
    };

    // Önce gerçek veriyi dene, başarısız olursa mock veriyi kullan
    fetchRealSignals();
  }, []);

  const displaySignals = signals.length > 0 ? signals : allSignals;

  const handleSignalClick = (signal: TradingSignal) => {
    setSelectedSignal(signal);
    setShowAnalysisTable(true);
  };

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
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleSignalClick(signal)}>
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

      {/* Detaylı Analiz Tablosu */}
      {showAnalysisTable && selectedSignal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedSignal.symbol} - Detaylı Analiz Tablosu
              </h3>
              <button
                onClick={() => setShowAnalysisTable(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Teknik Analiz */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Teknik Analiz</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sinyal:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedSignal.signal === 'BUY' ? 'bg-green-100 text-green-700' :
                      selectedSignal.signal === 'SELL' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedSignal.signal}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fiyat:</span>
                    <span className="text-sm font-medium">₺{selectedSignal.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Değişim:</span>
                    <span className={`text-sm font-medium ${
                      selectedSignal.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedSignal.change >= 0 ? '+' : ''}{selectedSignal.change.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Güven:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedSignal.confidence >= 0.8 ? 'bg-green-100 text-green-700' :
                      selectedSignal.confidence >= 0.6 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {(selectedSignal.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Confluence Skoru:</span>
                    <span className="text-sm font-medium">{(selectedSignal.confluenceScore * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Risk Analizi */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Risk Analizi</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Beklenen Getiri:</span>
                    <span className={`text-sm font-medium ${
                      selectedSignal.expectedReturn >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(selectedSignal.expectedReturn * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Stop Loss:</span>
                    <span className="text-sm font-medium">₺{selectedSignal.stopLoss?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Take Profit:</span>
                    <span className="text-sm font-medium">₺{selectedSignal.takeProfit?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Piyasa Rejimi:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedSignal.marketRegime === 'Risk-On' ? 'bg-green-100 text-green-700' :
                      selectedSignal.marketRegime === 'Risk-Off' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedSignal.marketRegime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sentiment Skoru:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedSignal.sentimentScore >= 0.7 ? 'bg-green-100 text-green-700' :
                      selectedSignal.sentimentScore >= 0.4 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {(selectedSignal.sentimentScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* SHAP Değerleri */}
              <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">SHAP Değerleri (Özellik Önemliliği)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedSignal.shapValues && Object.entries(selectedSignal.shapValues).map(([feature, value]) => (
                    <div key={feature} className="text-center">
                      <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold ${
                        value >= 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {value >= 0 ? '+' : ''}{value.toFixed(2)}
                      </div>
                      <p className="text-xs text-gray-600 font-medium">{feature.toUpperCase()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* XAI Açıklama */}
              <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">AI Açıklaması</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selectedSignal.xaiExplanation || 'RSI oversold durumda ve MACD pozitif kesişim yapıyor. Hacim artışı ile birlikte güçlü alım sinyali oluşuyor.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
