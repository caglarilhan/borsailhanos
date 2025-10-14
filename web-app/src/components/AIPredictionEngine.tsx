'use client';

import { useState, useEffect } from 'react';
import { 
  CpuChipIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';

interface AIModel {
  name: string;
  type: 'LightGBM' | 'LSTM' | 'TimeGPT' | 'Ensemble';
  accuracy: number;
  status: 'active' | 'training' | 'error';
  lastUpdate: string;
  predictions: number;
  confidence: number;
}

interface PredictionResult {
  symbol: string;
  timeframe: string;
  predictedPrice: number;
  confidence: number;
  model: string;
  features: string[];
  timestamp: string;
}

interface AIPredictionEngineProps {
  isLoading?: boolean;
}

export default function AIPredictionEngine({ isLoading }: AIPredictionEngineProps) {
  const [models, setModels] = useState<AIModel[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('Ensemble');
  const [isRunning, setIsRunning] = useState(false);
  const [lastPredictionTime, setLastPredictionTime] = useState<string>('');

  useEffect(() => {
    // Mock AI models
    const mockModels: AIModel[] = [
      {
        name: 'LightGBM',
        type: 'LightGBM',
        accuracy: 0.87,
        status: 'active',
        lastUpdate: new Date().toISOString(),
        predictions: 1247,
        confidence: 0.85
      },
      {
        name: 'LSTM Neural Network',
        type: 'LSTM',
        accuracy: 0.82,
        status: 'active',
        lastUpdate: new Date().toISOString(),
        predictions: 892,
        confidence: 0.78
      },
      {
        name: 'TimeGPT',
        type: 'TimeGPT',
        accuracy: 0.79,
        status: 'active',
        lastUpdate: new Date().toISOString(),
        predictions: 654,
        confidence: 0.72
      },
      {
        name: 'Ensemble Model',
        type: 'Ensemble',
        accuracy: 0.91,
        status: 'active',
        lastUpdate: new Date().toISOString(),
        predictions: 2156,
        confidence: 0.89
      }
    ];

    // Mock predictions
    const mockPredictions: PredictionResult[] = [
      {
        symbol: 'THYAO',
        timeframe: '1h',
        predictedPrice: 342.80,
        confidence: 0.94,
        model: 'Ensemble',
        features: ['RSI', 'MACD', 'Volume', 'Price_Change', 'Sentiment'],
        timestamp: new Date().toISOString()
      },
      {
        symbol: 'ASELS',
        timeframe: '4h',
        predictedPrice: 82.15,
        confidence: 0.89,
        model: 'LightGBM',
        features: ['RSI', 'Bollinger_Bands', 'Volume', 'News_Sentiment'],
        timestamp: new Date().toISOString()
      },
      {
        symbol: 'TUPRS',
        timeframe: '30m',
        predictedPrice: 158.50,
        confidence: 0.96,
        model: 'LSTM',
        features: ['Price_History', 'Volume', 'MACD', 'RSI', 'Oil_Price'],
        timestamp: new Date().toISOString()
      }
    ];

    setTimeout(() => {
      setModels(mockModels);
      setPredictions(mockPredictions);
    }, 1000);

    // Simulate continuous predictions
    const interval = setInterval(() => {
      const newPrediction: PredictionResult = {
        symbol: ['THYAO', 'ASELS', 'TUPRS', 'SISE', 'EREGL'][Math.floor(Math.random() * 5)],
        timeframe: ['5m', '15m', '30m', '1h'][Math.floor(Math.random() * 4)],
        predictedPrice: Math.random() * 100 + 50,
        confidence: Math.random() * 0.3 + 0.7,
        model: ['LightGBM', 'LSTM', 'TimeGPT', 'Ensemble'][Math.floor(Math.random() * 4)],
        features: ['RSI', 'MACD', 'Volume', 'Price_Change'],
        timestamp: new Date().toISOString()
      };
      
      setPredictions(prev => [newPrediction, ...prev.slice(0, 9)]);
      setLastPredictionTime(new Date().toLocaleTimeString('tr-TR'));
    }, 10000); // New prediction every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getModelStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'training':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <CheckCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getModelStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'training':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const startPredictionEngine = () => {
    setIsRunning(true);
    // Simulate prediction engine start
    setTimeout(() => {
      setIsRunning(false);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">AI Tahmin Motoru</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
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
            <CpuChipIcon className="h-6 w-6 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900">AI Tahmin Motoru</h2>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
              Canlı
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {lastPredictionTime && (
              <span className="text-sm text-gray-500">
                Son tahmin: {lastPredictionTime}
              </span>
            )}
            <button
              onClick={startPredictionEngine}
              disabled={isRunning}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isRunning
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isRunning ? 'Çalışıyor...' : 'Tahmin Başlat'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* AI Models Status */}
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-900 mb-4">AI Modelleri Durumu</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {models.map((model, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getModelStatusIcon(model.status)}
                    <h4 className="font-medium text-gray-900">{model.name}</h4>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getModelStatusColor(model.status)}`}>
                    {model.status === 'active' ? 'Aktif' : 
                     model.status === 'training' ? 'Eğitim' : 'Hata'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Doğruluk:</span>
                    <span className="text-sm font-medium text-green-600">
                      {(model.accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Güven:</span>
                    <span className="text-sm font-medium text-blue-600">
                      {(model.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Tahmin:</span>
                    <span className="text-sm font-medium text-purple-600">
                      {model.predictions.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Predictions */}
        <div>
          <h3 className="text-md font-semibold text-gray-900 mb-4">Son Tahminler</h3>
          <div className="space-y-3">
            {predictions.map((prediction, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <ChartBarIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-gray-900">{prediction.symbol}</p>
                        <span className="text-sm text-gray-500">({prediction.timeframe})</span>
                        <span className="text-xs text-gray-400">{prediction.model}</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        {prediction.features.map((feature, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₺{prediction.predictedPrice.toFixed(2)}</p>
                    <p className="text-sm text-blue-600 font-medium">
                      Güven: {(prediction.confidence * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(prediction.timestamp).toLocaleTimeString('tr-TR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Engine Stats */}
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-4">
            <FireIcon className="h-5 w-5 text-orange-500" />
            <h3 className="text-md font-semibold text-gray-900">Motor İstatistikleri</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {models.reduce((sum, model) => sum + model.predictions, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Toplam Tahmin</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {(models.reduce((sum, model) => sum + model.accuracy, 0) / models.length * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500">Ortalama Doğruluk</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {models.filter(m => m.status === 'active').length}
              </p>
              <p className="text-sm text-gray-500">Aktif Model</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">10s</p>
              <p className="text-sm text-gray-500">Tahmin Sıklığı</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
