/*
  🚀 BIST AI Smart Trader - XAI Explain Panel
  Her hisse için "AI neden böyle dedi?" açıklamasını gösteren React komponenti.
  SHAP ve LIME açıklamalarını görselleştirir.
*/

import React, { useState, useEffect, useCallback } from 'react';
import { 
  LightBulbIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

interface FeatureExplanation {
  feature_name: string;
  feature_value: number;
  importance_score: number;
  contribution: number;
  explanation: string;
}

interface ExplanationResult {
  symbol: string;
  prediction: string;
  confidence: number;
  shap_values: Record<string, number>;
  lime_explanation: Record<string, any>;
  feature_importance: Record<string, number>;
  decision_factors: string[];
  timestamp: string;
}

interface XAIExplainPanelProps {
  symbol: string;
  prediction: string;
  confidence: number;
  onExplanationComplete?: (result: ExplanationResult) => void;
}

const XAIExplainPanel: React.FC<XAIExplainPanelProps> = ({
  symbol,
  prediction,
  confidence,
  onExplanationComplete
}) => {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null);
  const [featureExplanations, setFeatureExplanations] = useState<FeatureExplanation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'shap' | 'lime' | 'factors'>('shap');

  // Feature açıklamaları
  const featureDescriptions: Record<string, string> = {
    'close_price': 'Güncel fiyat',
    'sma_20': '20 günlük basit hareketli ortalama',
    'sma_50': '50 günlük basit hareketli ortalama',
    'ema_12': '12 günlük üstel hareketli ortalama',
    'ema_26': '26 günlük üstel hareketli ortalama',
    'macd': 'MACD değeri',
    'macd_signal': 'MACD sinyal çizgisi',
    'rsi': 'RSI (Relative Strength Index)',
    'bb_upper': 'Bollinger Bantları üst çizgisi',
    'bb_middle': 'Bollinger Bantları orta çizgisi',
    'bb_lower': 'Bollinger Bantları alt çizgisi',
    'volume_ratio': 'Hacim oranı',
    'price_change': 'Fiyat değişimi',
    'volume_change': 'Hacim değişimi',
    'volatility': 'Volatilite'
  };

  // XAI açıklaması getir
  const fetchExplanation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/ai/explain-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol,
          prediction,
          confidence
        })
      });

      if (!response.ok) {
        throw new Error(`Explanation failed: ${response.statusText}`);
      }

      const result: ExplanationResult = await response.json();
      setExplanation(result);

      // Feature açıklamalarını oluştur
      const features: FeatureExplanation[] = Object.entries(result.feature_importance)
        .filter(([_, importance]) => importance > 0.05)
        .map(([featureName, importance]) => ({
          feature_name: featureName,
          feature_value: 0, // Bu değer gerçek veriden alınmalı
          importance_score: importance,
          contribution: importance * 100,
          explanation: featureDescriptions[featureName] || featureName
        }))
        .sort((a, b) => b.importance_score - a.importance_score);

      setFeatureExplanations(features);

      if (onExplanationComplete) {
        onExplanationComplete(result);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Explanation failed');
      console.error('Explanation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [symbol, prediction, confidence, onExplanationComplete]);

  // Component mount olduğunda açıklama getir
  useEffect(() => {
    fetchExplanation();
  }, [fetchExplanation]);

  // Prediction rengi
  const getPredictionColor = (pred: string) => {
    switch (pred.toUpperCase()) {
      case 'BUY':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'SELL':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    }
  };

  // Prediction icon'u
  const getPredictionIcon = (pred: string) => {
    switch (pred.toUpperCase()) {
      case 'BUY':
        return <ArrowUpIcon className="w-5 h-5" />;
      case 'SELL':
        return <ArrowDownIcon className="w-5 h-5" />;
      default:
        return <MinusIcon className="w-5 h-5" />;
    }
  };

  // Importance bar rengi
  const getImportanceColor = (importance: number) => {
    if (importance > 0.3) return 'bg-red-500';
    if (importance > 0.2) return 'bg-orange-500';
    if (importance > 0.1) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          🧠 AI Açıklama Motoru
        </h3>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPredictionColor(prediction)}`}>
            <div className="flex items-center space-x-1">
              {getPredictionIcon(prediction)}
              <span>{prediction}</span>
            </div>
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            %{confidence.toFixed(1)} güven
          </span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            AI açıklaması oluşturuluyor...
          </span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-400">{error}</span>
          </div>
        </div>
      )}

      {/* Explanation Content */}
      {explanation && !isLoading && (
        <div className="space-y-6">
          {/* Özet Açıklama */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              📊 Özet Açıklama
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>{symbol}</strong> için <strong>{prediction}</strong> sinyali (%{confidence.toFixed(1)} güven) 
              aşağıdaki faktörlere dayanmaktadır:
            </p>
            <ul className="mt-3 space-y-1">
              {explanation.decision_factors.slice(0, 3).map((factor, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-600">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('shap')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'shap'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <ChartBarIcon className="w-4 h-4 inline mr-1" />
                SHAP Analizi
              </button>
              <button
                onClick={() => setActiveTab('lime')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'lime'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <LightBulbIcon className="w-4 h-4 inline mr-1" />
                LIME Açıklama
              </button>
              <button
                onClick={() => setActiveTab('factors')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'factors'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <InformationCircleIcon className="w-4 h-4 inline mr-1" />
                Karar Faktörleri
              </button>
            </nav>
          </div>

          {/* SHAP Tab */}
          {activeTab === 'shap' && (
            <div className="space-y-4">
              <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                📈 Feature Importance (SHAP)
              </h5>
              <div className="space-y-3">
                {featureExplanations.map((feature, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {feature.explanation}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        %{feature.contribution.toFixed(1)} katkı
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getImportanceColor(feature.importance_score)}`}
                        style={{ width: `${Math.min(feature.contribution, 100)}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      SHAP Değeri: {feature.importance_score.toFixed(4)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LIME Tab */}
          {activeTab === 'lime' && (
            <div className="space-y-4">
              <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                🔍 LIME Açıklaması
              </h5>
              {explanation.lime_explanation && explanation.lime_explanation.explanation ? (
                <div className="space-y-3">
                  {explanation.lime_explanation.explanation.map((item: any, index: number) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item[0]}
                        </span>
                        <span className={`text-sm font-medium ${
                          item[1] > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item[1] > 0 ? '+' : ''}{item[1].toFixed(3)}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {featureDescriptions[item[0]] || item[0]}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  LIME açıklaması mevcut değil
                </div>
              )}
            </div>
          )}

          {/* Factors Tab */}
          {activeTab === 'factors' && (
            <div className="space-y-4">
              <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                🎯 Karar Faktörleri
              </h5>
              <div className="space-y-3">
                {explanation.decision_factors.map((factor, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            {index + 1}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {factor}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Teknik Detaylar */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              🔧 Teknik Detaylar
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Açıklama Tarihi:</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  {new Date(explanation.timestamp).toLocaleString('tr-TR')}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Analiz Edilen Feature:</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  {Object.keys(explanation.feature_importance).length} adet
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">En Etkili Feature:</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  {featureExplanations[0]?.explanation || 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Toplam Katkı:</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  %{featureExplanations.reduce((sum, f) => sum + f.contribution, 0).toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      {explanation && (
        <div className="mt-6 text-center">
          <button
            onClick={fetchExplanation}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isLoading ? 'Yenileniyor...' : 'Açıklamayı Yenile'}
          </button>
        </div>
      )}
    </div>
  );
};

export default XAIExplainPanel;
