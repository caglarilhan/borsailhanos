'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/config';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  MinusIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon
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
  const [selectedCharts, setSelectedCharts] = useState<TradingSignal[]>([]);

  // Backend'den gerçek veri çek
  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/real/trading_signals`);
        const data = await response.json();
        
        if (data.signals && Array.isArray(data.signals)) {
          // Backend'den gelen veriyi component formatına çevir
          const backendSignals: TradingSignal[] = data.signals.map((signal: any) => ({
            symbol: signal.symbol,
            signal: signal.action as 'BUY' | 'SELL' | 'HOLD',
            confidence: signal.confidence,
            price: signal.price,
            change: signal.change || 0,
            timestamp: signal.timestamp || data.timestamp,
            xaiExplanation: signal.reason,
            shapValues: {
              'Technical': 0.4,
              'Fundamental': 0.3,
              'Sentiment': 0.2,
              'Macro': 0.1
            },
            confluenceScore: signal.confidence,
            marketRegime: signal.confidence > 0.8 ? 'Bullish' : 'Bearish',
            sentimentScore: signal.confidence,
            expectedReturn: signal.target ? signal.target - signal.price : 0,
            stopLoss: signal.stop_loss,
            takeProfit: signal.target
          }));
          
          setAllSignals(backendSignals);
          console.log('✅ Backend sinyalleri yüklendi:', backendSignals.length);
        }
      } catch (error) {
        console.error('❌ Backend bağlantı hatası, mock data kullanılıyor:', error);
        
        // Fallback mock data
        const mockSignals: TradingSignal[] = [
          {
            symbol: "THYAO",
            signal: "BUY",
            confidence: 0.87,
            price: 245.50,
            change: 2.3,
            timestamp: new Date().toISOString(),
            xaiExplanation: "EMA Cross + RSI Oversold",
            shapValues: {'Technical': 0.4, 'Fundamental': 0.3, 'Sentiment': 0.2, 'Macro': 0.1},
            confluenceScore: 0.87,
            marketRegime: 'Bullish',
            sentimentScore: 0.7,
            expectedReturn: 14.5,
            stopLoss: 235.0,
            takeProfit: 260.0
          },
          {
            symbol: "ASELS",
            signal: "SELL",
            confidence: 0.74,
            price: 48.20,
            change: -1.8,
            timestamp: new Date().toISOString(),
            xaiExplanation: "Resistance Break + Volume Spike",
            shapValues: {'Technical': 0.5, 'Fundamental': 0.2, 'Sentiment': 0.2, 'Macro': 0.1},
            confluenceScore: 0.74,
            marketRegime: 'Bearish',
            sentimentScore: 0.4,
            expectedReturn: -6.2,
            stopLoss: 52.0,
            takeProfit: 42.0
          },
          {
            symbol: "TUPRS",
            signal: "BUY",
            confidence: 0.91,
            price: 180.30,
            change: 3.1,
            timestamp: new Date().toISOString(),
            xaiExplanation: "Bullish Engulfing + MACD Cross",
            shapValues: {'Technical': 0.6, 'Fundamental': 0.2, 'Sentiment': 0.1, 'Macro': 0.1},
            confluenceScore: 0.91,
            marketRegime: 'Bullish',
            sentimentScore: 0.8,
            expectedReturn: 14.7,
            stopLoss: 170.0,
            takeProfit: 195.0
          }
        ];
        setAllSignals(mockSignals);
      }
    };

    fetchSignals();
    
    // 30 saniyede bir güncelle
    const interval = setInterval(fetchSignals, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />;
      case 'SELL':
        return <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />;
      default:
        return <MinusIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return 'text-green-500 bg-green-50 border-green-200';
      case 'SELL':
        return 'text-red-500 bg-red-50 border-red-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ChartBarIcon className="w-6 h-6 text-blue-600" />
          AI Trading Sinyalleri
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAnalysisTable(!showAnalysisTable)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showAnalysisTable ? 'Grafik Görünümü' : 'Analiz Tablosu'}
          </button>
          <button
            onClick={() => setShowXAI(!showXAI)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {showXAI ? 'Sinyalleri Gizle' : 'XAI Açıklamaları'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {allSignals.map((signal, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${getSignalColor(signal.signal)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getSignalIcon(signal.signal)}
                  <div>
                    <h3 className="font-semibold text-lg">{signal.symbol}</h3>
                    <p className="text-sm text-gray-600">
                      {signal.price.toFixed(2)} TL ({signal.change > 0 ? '+' : ''}{signal.change.toFixed(2)}%)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${getConfidenceColor(signal.confidence)}`}>
                    %{(signal.confidence * 100).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Güven</div>
                </div>
              </div>
              
              {showXAI && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <InformationCircleIcon className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">AI Açıklaması:</span>
                  </div>
                  <p className="text-sm text-gray-600">{signal.xaiExplanation}</p>
                  
                  {signal.shapValues && (
                    <div className="mt-3">
                      <div className="text-sm font-medium text-gray-700 mb-2">Etki Faktörleri:</div>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(signal.shapValues).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span className="text-gray-600">{key}:</span>
                            <span className="font-medium">{(value * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAnalysisTable && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Detaylı Analiz</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sembol</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sinyal</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Güven</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fiyat</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Değişim</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Beklenen Getiri</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allSignals.map((signal, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{signal.symbol}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getSignalColor(signal.signal)}`}>
                        {getSignalIcon(signal.signal)}
                        {signal.signal}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span className={getConfidenceColor(signal.confidence)}>
                        %{(signal.confidence * 100).toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{signal.price.toFixed(2)} TL</td>
                    <td className={`px-4 py-2 text-sm ${signal.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {signal.change > 0 ? '+' : ''}{signal.change.toFixed(2)}%
                    </td>
                    <td className={`px-4 py-2 text-sm ${signal.expectedReturn && signal.expectedReturn > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {signal.expectedReturn ? `${signal.expectedReturn > 0 ? '+' : ''}${signal.expectedReturn.toFixed(2)}%` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}