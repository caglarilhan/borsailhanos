'use client';

import React, { useState, useEffect } from 'react';
import { 
  CpuChipIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

interface EnsemblePrediction {
  symbol: string;
  prediction: string;
  confidence: number;
  price_target: number;
  stop_loss: number;
  take_profit: number;
  timeframe: string;
  model_scores: { [key: string]: number };
  feature_importance: { [key: string]: number };
  risk_score: number;
  timestamp: string;
}

interface AdvancedAIPredictionsProps {
  isLoading?: boolean;
}

const API_BASE_URL = 'http://127.0.0.1:8081';

const AdvancedAIPredictions: React.FC<AdvancedAIPredictionsProps> = ({ isLoading }) => {
  const [predictions, setPredictions] = useState<EnsemblePrediction[]>([]);
  const TIMEFRAMES = ['5m','15m','30m','1h','4h','1d','2d','3d','5d','1w'] as const;
  type Timeframe = typeof TIMEFRAMES[number];
  const [timeframe, setTimeframe] = useState<Timeframe>('1d');
  const [selectedPrediction, setSelectedPrediction] = useState<EnsemblePrediction | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchPredictions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/ensemble/predictions?timeframe=${timeframe}&symbols=THYAO,ASELS,TUPRS,SISE,EREGL,AKBNK,GARAN,ISCTR,YKBNK,HALKB`);
      const data = await response.json();
      
      if (data.predictions && data.predictions.length > 0) {
        setPredictions(data.predictions);
      } else {
        // Fallback to mock data
        generateMockPredictions();
      }
    } catch (error) {
      console.error('Error fetching ensemble predictions:', error);
      generateMockPredictions();
    }
  };

  const generateMockPredictions = () => {
    const mockPredictions: EnsemblePrediction[] = [
      {
        symbol: 'THYAO',
        prediction: 'BUY',
        confidence: 0.91,
        price_target: 340.75,
        stop_loss: 310.25,
        take_profit: 365.20,
        timeframe: timeframe,
        model_scores: {
          'lightgbm': 0.87,
          'transformer': 0.91,
          'lstm': 0.89,
          'random_forest': 0.84,
          'gradient_boosting': 0.82
        },
        feature_importance: {
          'rsi': 0.25,
          'macd': 0.18,
          'volume_ratio': 0.15,
          'news_sentiment': 0.12,
          'pe_ratio': 0.10,
          'usd_try': 0.08,
          'volatility': 0.07,
          'momentum': 0.05
        },
        risk_score: 0.25,
        timestamp: new Date().toISOString()
      },
      {
        symbol: 'ASELS',
        prediction: 'SELL',
        confidence: 0.78,
        price_target: 82.15,
        stop_loss: 92.40,
        take_profit: 75.30,
        timeframe: timeframe,
        model_scores: {
          'lightgbm': 0.75,
          'transformer': 0.78,
          'lstm': 0.76,
          'random_forest': 0.72,
          'gradient_boosting': 0.70
        },
        feature_importance: {
          'rsi': 0.30,
          'macd': 0.20,
          'volume_ratio': 0.12,
          'news_sentiment': 0.10,
          'pe_ratio': 0.08,
          'usd_try': 0.07,
          'volatility': 0.06,
          'momentum': 0.07
        },
        risk_score: 0.35,
        timestamp: new Date().toISOString()
      },
      {
        symbol: 'TUPRS',
        prediction: 'BUY',
        confidence: 0.85,
        price_target: 152.30,
        stop_loss: 138.50,
        take_profit: 165.80,
        timeframe: timeframe,
        model_scores: {
          'lightgbm': 0.83,
          'transformer': 0.85,
          'lstm': 0.84,
          'random_forest': 0.81,
          'gradient_boosting': 0.79
        },
        feature_importance: {
          'rsi': 0.22,
          'macd': 0.18,
          'volume_ratio': 0.16,
          'news_sentiment': 0.14,
          'pe_ratio': 0.12,
          'usd_try': 0.09,
          'volatility': 0.05,
          'momentum': 0.04
        },
        risk_score: 0.30,
        timestamp: new Date().toISOString()
      }
    ];
    
    setPredictions(mockPredictions);
  };

  useEffect(() => {
    fetchPredictions();
  }, [timeframe]);

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case 'BUY': return 'text-green-600 bg-green-100 border-green-200';
      case 'SELL': return 'text-red-600 bg-red-100 border-red-200';
      case 'HOLD': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getPredictionIcon = (prediction: string) => {
    switch (prediction) {
      case 'BUY': return <ArrowTrendingUpIcon className="h-5 w-5" />;
      case 'SELL': return <ArrowTrendingDownIcon className="h-5 w-5" />;
      case 'HOLD': return <MinusIcon className="h-5 w-5" />;
      default: return <MinusIcon className="h-5 w-5" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.8) return 'text-blue-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (risk: number) => {
    if (risk <= 0.3) return 'text-green-600';
    if (risk <= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Gelişmiş AI Ensemble Tahminleri</h2>
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
            <CpuChipIcon className="h-6 w-6 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Gelişmiş AI Ensemble Tahminleri</h2>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
              Ensemble
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 text-xs rounded ${
                  timeframe === tf
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {predictions.map((prediction, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${getPredictionColor(prediction.prediction)}`}>
                    {getPredictionIcon(prediction.prediction)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-gray-900">{prediction.symbol}</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPredictionColor(prediction.prediction)}`}>
                        {prediction.prediction}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-500">
                        Hedef: ₺{prediction.price_target.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        SL: ₺{prediction.stop_loss.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        TP: ₺{prediction.take_profit.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500">Güven</p>
                  <p className={`font-semibold ${getConfidenceColor(prediction.confidence)}`}>
                    {(prediction.confidence * 100).toFixed(0)}%
                  </p>
                  <p className={`text-xs ${getRiskColor(prediction.risk_score)}`}>
                    Risk: {(prediction.risk_score * 100).toFixed(0)}%
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedPrediction(prediction);
                      setShowDetails(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Detayları Görüntüle"
                  >
                    <InformationCircleIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Model Scores */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Model Skorları</h4>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(prediction.model_scores).map(([model, score]) => (
                    <div key={model} className="text-center">
                      <p className="text-xs text-gray-500">{model}</p>
                      <p className="text-sm font-semibold text-blue-600">
                        {(score * 100).toFixed(0)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prediction Details Modal */}
      {showDetails && selectedPrediction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedPrediction.symbol} - Gelişmiş AI Analizi
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Prediction Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tahmin</p>
                  <p className={`text-2xl font-bold ${getPredictionColor(selectedPrediction.prediction)}`}>
                    {selectedPrediction.prediction}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Güven Skoru</p>
                  <p className={`text-2xl font-bold ${getConfidenceColor(selectedPrediction.confidence)}`}>
                    {(selectedPrediction.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Price Targets */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Fiyat Hedefleri</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Hedef Fiyat</p>
                    <p className="text-xl font-bold text-green-600">₺{selectedPrediction.price_target.toFixed(2)}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Stop Loss</p>
                    <p className="text-xl font-bold text-red-600">₺{selectedPrediction.stop_loss.toFixed(2)}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Take Profit</p>
                    <p className="text-xl font-bold text-blue-600">₺{selectedPrediction.take_profit.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Model Scores */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Model Performansları</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(selectedPrediction.model_scores).map(([model, score]) => (
                    <div key={model} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">{model}</p>
                        <p className="text-lg font-bold text-blue-600">{(score * 100).toFixed(1)}%</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${score * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Importance */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Özellik Önem Skorları</h4>
                <div className="space-y-2">
                  {Object.entries(selectedPrediction.feature_importance)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 8)
                    .map(([feature, importance]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <p className="text-sm text-gray-700">{feature}</p>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${importance * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-sm font-medium text-purple-600">{(importance * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Analysis */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Risk Analizi</p>
                    <p className="text-sm text-yellow-700">
                      Risk Skoru: <span className={`font-medium ${getRiskColor(selectedPrediction.risk_score)}`}>
                        {(selectedPrediction.risk_score * 100).toFixed(1)}%
                      </span>
                    </p>
                    <p className="text-sm text-yellow-700">
                      Zaman Dilimi: {selectedPrediction.timeframe}
                    </p>
                    <p className="text-sm text-yellow-700">
                      Son Güncelleme: {new Date(selectedPrediction.timestamp).toLocaleString()}
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
};

export default AdvancedAIPredictions;
