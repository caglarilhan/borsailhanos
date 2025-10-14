'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  RocketLaunchIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface GodModePanelProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
}

export default function GodModePanel({ isActive, onToggle }: GodModePanelProps) {
  const [features, setFeatures] = useState([
    { id: 'ai_models', name: 'AI Modelleri', status: 'active', description: 'LightGBM + LSTM + TimeGPT' },
    { id: 'real_time', name: 'Gerçek Zamanlı Veri', status: 'active', description: 'WebSocket + Finnhub' },
    { id: 'xai', name: 'XAI Açıklamaları', status: 'active', description: 'SHAP + LIME' },
    { id: 'sentiment', name: 'Sentiment Analizi', status: 'active', description: 'FinBERT-TR + Twitter' },
    { id: 'backtesting', name: 'Auto-Backtest', status: 'active', description: 'vectorbt-pro' },
    { id: 'macro_regime', name: 'Makro Rejim', status: 'active', description: 'HMM + CDS + USDTRY' },
    { id: 'topsis', name: 'TOPSIS Analizi', status: 'active', description: 'Grey TOPSIS + Entropi' },
    { id: 'formation', name: 'Formasyon Motoru', status: 'active', description: 'EMA + Candlestick + Harmonic' },
    { id: 'rl_agent', name: 'RL Portföy Ajanı', status: 'active', description: 'FinRL + DDPG' },
    { id: 'crypto', name: 'Kripto Trading', status: 'active', description: 'BTC, ETH, ADA' },
    { id: 'options', name: 'Opsiyon Analizi', status: 'active', description: 'Greeks + Volatility' },
    { id: 'social_trading', name: 'Sosyal Trading', status: 'active', description: 'Copy Trade + Leaderboard' }
  ]);

  const [systemStats, setSystemStats] = useState({
    accuracy: 87.3,
    totalSignals: 1247,
    activeUsers: 156,
    uptime: '99.9%',
    latency: '45ms'
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <CheckCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-purple-200">
      <div className="px-6 py-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-purple-900">God Mode Panel</h2>
              <p className="text-sm text-purple-600">Tüm Premium Özellikler Aktif</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-600">AKTİF</span>
            </div>
            <button
              onClick={() => onToggle(!isActive)}
              className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
              title="God Mode'u Kapat"
            >
              <Cog6ToothIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* System Stats */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{systemStats.accuracy}%</p>
            <p className="text-xs text-gray-500">Doğruluk</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{systemStats.totalSignals}</p>
            <p className="text-xs text-gray-500">Toplam Sinyal</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{systemStats.activeUsers}</p>
            <p className="text-xs text-gray-500">Aktif Kullanıcı</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{systemStats.uptime}</p>
            <p className="text-xs text-gray-500">Uptime</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{systemStats.latency}</p>
            <p className="text-xs text-gray-500">Latency</p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <RocketLaunchIcon className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Aktif Özellikler</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div key={feature.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(feature.status)}
                    <h4 className="font-medium text-gray-900">{feature.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(feature.status)}`}>
                  {feature.status === 'active' ? 'Aktif' : 
                   feature.status === 'warning' ? 'Uyarı' : 
                   feature.status === 'error' ? 'Hata' : 'Bilinmiyor'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warning Message */}
      <div className="px-6 py-4 border-t bg-yellow-50">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">God Mode Uyarısı</p>
            <p className="text-sm text-yellow-700">
              Bu mod tüm premium özellikleri aktif eder. Gerçek trading için dikkatli kullanın.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
