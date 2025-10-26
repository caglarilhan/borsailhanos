'use client';

import React, { useState, useEffect } from 'react';
import { 
  CpuChipIcon, 
  ChartBarIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BeakerIcon,
  Cog6ToothIcon,
  LightBulbIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

interface EnsembleResult {
  strategy: string;
  final_prediction: number;
  confidence: number;
  uncertainty: number;
  model_weights: Record<string, number>;
  base_predictions: Record<string, number>;
  meta_features: number[];
  timestamp: string;
}

interface BaseModel {
  name: string;
  accuracy: number;
  confidence: number;
  last_updated: string;
}

interface EnsemblePerformance {
  base_models: Record<string, BaseModel>;
  ensemble_configs: Record<string, any>;
  market_regime: string;
  timestamp: string;
}

interface AdvancedEnsembleStrategiesProps {
  isLoading: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const AdvancedEnsembleStrategies: React.FC<AdvancedEnsembleStrategiesProps> = ({ isLoading }) => {
  const [ensembleResults, setEnsembleResults] = useState<Record<string, EnsembleResult> | null>(null);
  const [performance, setPerformance] = useState<EnsemblePerformance | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'strategies' | 'comparison' | 'performance' | 'config'>('overview');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('THYAO');
  const [isRunningEnsembles, setIsRunningEnsembles] = useState<boolean>(false);

  useEffect(() => {
    fetchEnsemblePerformance();
  }, []);

  const fetchEnsemblePerformance = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ensemble/performance`);
      const data = await response.json();
      if (data.ensemble_performance) {
        setPerformance(data.ensemble_performance);
      }
    } catch (error) {
      console.error('Error fetching ensemble performance:', error);
    }
  };

  const runAllEnsembles = async () => {
    setIsRunningEnsembles(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ensemble/all?symbol=${selectedSymbol}`);
      const data = await response.json();
      if (data.ensemble_results) {
        setEnsembleResults(data.ensemble_results);
      }
    } catch (error) {
      console.error('Error running ensembles:', error);
    } finally {
      setIsRunningEnsembles(false);
    }
  };

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'Stacking': return <CpuChipIcon className="h-5 w-5" />;
      case 'Bayesian Averaging': return <ScaleIcon className="h-5 w-5" />;
      case 'Dynamic Weighting': return <Cog6ToothIcon className="h-5 w-5" />;
      case 'Uncertainty Quantification': return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'Adaptive Ensemble': return <LightBulbIcon className="h-5 w-5" />;
      default: return <BeakerIcon className="h-5 w-5" />;
    }
  };

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'Stacking': return 'text-blue-600 bg-blue-100';
      case 'Bayesian Averaging': return 'text-purple-600 bg-purple-100';
      case 'Dynamic Weighting': return 'text-green-600 bg-green-100';
      case 'Uncertainty Quantification': return 'text-orange-600 bg-orange-100';
      case 'Adaptive Ensemble': return 'text-pink-600 bg-pink-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatPrediction = (prediction: number) => {
    const percentage = (prediction * 100).toFixed(2);
    return prediction > 0 ? `+${percentage}%` : `${percentage}%`;
  };

  const getPredictionColor = (prediction: number) => {
    if (prediction > 0.02) return 'text-green-600';
    if (prediction < -0.02) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatAccuracy = (accuracy: number) => {
    return `${(accuracy * 100).toFixed(1)}%`;
  };

  const getUncertaintyLevel = (uncertainty: number) => {
    if (uncertainty < 0.05) return { level: 'Düşük', color: 'text-green-600' };
    if (uncertainty < 0.1) return { level: 'Orta', color: 'text-yellow-600' };
    return { level: 'Yüksek', color: 'text-red-600' };
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BeakerIcon className="h-8 w-8 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Gelişmiş Ensemble Stratejileri</h2>
              <p className="text-sm text-gray-600">Stacking, Bayesian Averaging, Dynamic Weighting ile gelişmiş AI</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CpuChipIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">5 Strateji Aktif</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-3 border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Genel Bakış', icon: ChartBarIcon },
            { id: 'strategies', label: 'Stratejiler', icon: BeakerIcon },
            { id: 'comparison', label: 'Karşılaştırma', icon: ScaleIcon },
            { id: 'performance', label: 'Performans', icon: ArrowTrendingUpIcon },
            { id: 'config', label: 'Konfigürasyon', icon: Cog6ToothIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Analiz Edilecek Hisse
                  </label>
                  <select
                    value={selectedSymbol}
                    onChange={(e) => setSelectedSymbol(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="THYAO">THYAO</option>
                    <option value="ASELS">ASELS</option>
                    <option value="TUPRS">TUPRS</option>
                    <option value="SISE">SISE</option>
                    <option value="EREGL">EREGL</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={runAllEnsembles}
                    disabled={isRunningEnsembles}
                    className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isRunningEnsembles ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Çalıştırılıyor...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-4 w-4" />
                        <span>Tüm Stratejileri Çalıştır</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Base Models Overview */}
            {performance && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(performance.base_models).map(([name, model]) => (
                  <div key={name} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{name}</h3>
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Doğruluk:</span>
                        <span className="font-medium">{formatAccuracy(model.accuracy)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Güven:</span>
                        <span className="font-medium">{formatAccuracy(model.confidence)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'strategies' && ensembleResults && (
          <div className="space-y-6">
            {Object.entries(ensembleResults).map(([strategyKey, result]) => (
              <div key={strategyKey} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className={`p-2 rounded-lg ${getStrategyColor(result.strategy)}`}>
                      {getStrategyIcon(result.strategy)}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{result.strategy}</h3>
                      <p className="text-sm text-gray-600">Ensemble Stratejisi</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getPredictionColor(result.final_prediction)}`}>
                      {formatPrediction(result.final_prediction)}
                    </div>
                    <div className="text-sm text-gray-500">Tahmin</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Güven</div>
                    <div className="text-sm font-medium text-gray-900">{formatAccuracy(result.confidence)}</div>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Belirsizlik</div>
                    <div className={`text-sm font-medium ${getUncertaintyLevel(result.uncertainty).color}`}>
                      {getUncertaintyLevel(result.uncertainty).level}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Model Sayısı</div>
                    <div className="text-sm font-medium text-gray-900">{Object.keys(result.model_weights).length}</div>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Meta Özellik</div>
                    <div className="text-sm font-medium text-gray-900">{result.meta_features.length}</div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  Son Güncelleme: {new Date(result.timestamp).toLocaleString('tr-TR')}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'comparison' && ensembleResults && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Strateji Karşılaştırması</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Strateji</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Tahmin</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Güven</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Belirsizlik</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">En İyi Model</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(ensembleResults).map(([strategyKey, result]) => {
                      const bestModel = Object.entries(result.model_weights).reduce((a, b) => 
                        result.model_weights[a[0]] > result.model_weights[b[0]] ? a : b
                      );
                      
                      return (
                        <tr key={strategyKey}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`p-1 rounded ${getStrategyColor(result.strategy)}`}>
                                {getStrategyIcon(result.strategy)}
                              </span>
                              <span className="ml-2 text-sm font-medium text-gray-900">{result.strategy}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${getPredictionColor(result.final_prediction)}`}>
                              {formatPrediction(result.final_prediction)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatAccuracy(result.confidence)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${getUncertaintyLevel(result.uncertainty).color}`}>
                              {getUncertaintyLevel(result.uncertainty).level}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {bestModel[0]} ({formatAccuracy(bestModel[1])})
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && performance && (
          <div className="space-y-6">
            {/* Market Regime */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Piyasa Rejimi</h3>
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-purple-600 capitalize">{performance.market_regime}</div>
                <div className="text-sm text-gray-600">
                  Mevcut piyasa koşullarına göre dinamik ağırlıklandırma aktif
                </div>
              </div>
            </div>

            {/* Base Models Performance */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Base Model Performansı</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(performance.base_models).map(([name, model]) => (
                  <div key={name} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{name}</h4>
                      <div className="text-lg font-bold text-purple-600">
                        {formatAccuracy(model.accuracy)}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Güven:</span>
                        <span className="font-medium">{formatAccuracy(model.confidence)}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(model.last_updated).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ensemble Configurations */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ensemble Konfigürasyonları</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(performance.ensemble_configs).map(([configName, config]) => (
                  <div key={configName} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 capitalize">{configName}</h4>
                    <div className="space-y-2 text-sm">
                      {Object.entries(config).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ensemble Konfigürasyonu</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Learner
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="LinearRegression">Linear Regression</option>
                      <option value="RandomForest">Random Forest</option>
                      <option value="XGBoost">XGBoost</option>
                      <option value="NeuralNetwork">Neural Network</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CV Folds
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="10"
                      defaultValue="5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                    <span className="ml-2 text-sm text-gray-700">Probability kullan</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                    <span className="ml-2 text-sm text-gray-700">Feature selection</span>
                  </label>
                </div>
                
                <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
                  Konfigürasyonu Kaydet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedEnsembleStrategies;
