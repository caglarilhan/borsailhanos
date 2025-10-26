'use client';

import React, { useState, useEffect } from 'react';
import { 
  CpuChipIcon, 
  ChartBarIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  LinkIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface ModelConfig {
  model_type: string;
  model_name: string;
  parameters: Record<string, any>;
  accuracy: number;
  training_status: string;
  last_updated: string;
}

interface PredictionResult {
  symbol: string;
  prediction: number;
  confidence: number;
  model_used: string;
  features: string[];
  timestamp: string;
}

interface SentimentAnalysis {
  text: string;
  sentiment_score: number;
  confidence: number;
  model_used: string;
  timestamp: string;
}

interface RelationshipAnalysis {
  source_symbol: string;
  target_symbol: string;
  relationship_strength: number;
  relationship_type: string;
  confidence: number;
  timestamp: string;
}

interface MarketReport {
  timestamp: string;
  timeframe: string;
  symbols: string[];
  predictions: PredictionResult[];
  sentiment_analysis: SentimentAnalysis[];
  relationships: RelationshipAnalysis[];
  market_summary: {
    bullish_signals: number;
    bearish_signals: number;
    neutral_signals: number;
    average_confidence: number;
    strongest_relationship: RelationshipAnalysis | null;
  };
  model_performance: Record<string, any>;
}

interface DeepLearningModelsProps {
  isLoading: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const DeepLearningModels: React.FC<DeepLearningModelsProps> = ({ isLoading }) => {
  const [modelStatus, setModelStatus] = useState<Record<string, ModelConfig> | null>(null);
  const [marketReport, setMarketReport] = useState<MarketReport | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'predictions' | 'sentiment' | 'relationships' | 'report'>('overview');
  const [selectedSymbols, setSelectedSymbols] = useState<string>('THYAO,ASELS,TUPRS,SISE,EREGL');
  const [sentimentText, setSentimentText] = useState<string>('THYAO güçlü finansal performans gösteriyor ve yatırımcılar için cazip bir seçenek sunuyor.');
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);

  useEffect(() => {
    fetchModelStatus();
  }, []);

  const fetchModelStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/deep_learning/model_status`);
      const data = await response.json();
      if (data.model_status?.models) {
        setModelStatus(data.model_status.models);
      }
    } catch (error) {
      console.error('Error fetching model status:', error);
    }
  };

  const generateMarketReport = async () => {
    setIsGeneratingReport(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/deep_learning/market_report?symbols=${selectedSymbols}&timeframe=1d`);
      const data = await response.json();
      if (data.market_report) {
        setMarketReport(data.market_report);
      }
    } catch (error) {
      console.error('Error generating market report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const analyzeSentiment = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/deep_learning/sentiment?text=${encodeURIComponent(sentimentText)}&symbol=THYAO`);
      const data = await response.json();
      console.log('Sentiment analysis:', data);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'trained': return 'text-green-600 bg-green-100';
      case 'fine_tuned': return 'text-blue-600 bg-blue-100';
      case 'training': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'trained': return <CheckCircleIcon className="h-4 w-4" />;
      case 'fine_tuned': return <SparklesIcon className="h-4 w-4" />;
      case 'training': return <ClockIcon className="h-4 w-4" />;
      default: return <ExclamationTriangleIcon className="h-4 w-4" />;
    }
  };

  const formatAccuracy = (accuracy: number) => {
    return `${(accuracy * 100).toFixed(1)}%`;
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

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'text-green-600';
    if (score < -0.3) return 'text-red-600';
    return 'text-gray-600';
  };

  const getSentimentLabel = (score: number) => {
    if (score > 0.5) return 'Çok Pozitif';
    if (score > 0.1) return 'Pozitif';
    if (score > -0.1) return 'Nötr';
    if (score > -0.5) return 'Negatif';
    return 'Çok Negatif';
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
            <CpuChipIcon className="h-8 w-8 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Deep Learning Modelleri</h2>
              <p className="text-sm text-gray-600">BERT, GPT, Graph Neural Networks ile gelişmiş AI analizi</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Cog6ToothIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">5 Model Aktif</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-3 border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Genel Bakış', icon: ChartBarIcon },
            { id: 'models', label: 'Modeller', icon: CpuChipIcon },
            { id: 'predictions', label: 'Tahminler', icon: ArrowTrendingUpIcon },
            { id: 'sentiment', label: 'Sentiment', icon: DocumentTextIcon },
            { id: 'relationships', label: 'İlişkiler', icon: LinkIcon },
            { id: 'report', label: 'Rapor', icon: SparklesIcon }
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
            {/* Model Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {modelStatus && Object.entries(modelStatus).map(([key, model]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{model.model_name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(model.training_status)}`}>
                      {getStatusIcon(model.training_status)}
                      <span>{model.training_status}</span>
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Doğruluk:</span>
                      <span className="font-medium">{formatAccuracy(model.accuracy)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Güncelleme:</span>
                      <span className="text-gray-500">{new Date(model.last_updated).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Analiz Edilecek Hisseler
                  </label>
                  <input
                    type="text"
                    value={selectedSymbols}
                    onChange={(e) => setSelectedSymbols(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="THYAO,ASELS,TUPRS"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={generateMarketReport}
                    disabled={isGeneratingReport}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isGeneratingReport ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Rapor Oluşturuluyor...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-4 w-4" />
                        <span>Kapsamlı Rapor Oluştur</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'models' && modelStatus && (
          <div className="space-y-6">
            {Object.entries(modelStatus).map(([key, model]) => (
              <div key={key} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{model.model_name}</h3>
                    <p className="text-sm text-gray-600">{model.model_type}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">{formatAccuracy(model.accuracy)}</div>
                    <div className="text-sm text-gray-500">Doğruluk Oranı</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {Object.entries(model.parameters).map(([param, value]) => (
                    <div key={param} className="bg-gray-50 rounded p-3">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">{param}</div>
                      <div className="text-sm font-medium text-gray-900">{String(value)}</div>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Son Güncelleme: {new Date(model.last_updated).toLocaleString('tr-TR')}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(model.training_status)}`}>
                    {getStatusIcon(model.training_status)}
                    <span>{model.training_status}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'predictions' && marketReport && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketReport.predictions.map((prediction, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{prediction.symbol}</h3>
                    <span className={`text-lg font-bold ${getPredictionColor(prediction.prediction)}`}>
                      {formatPrediction(prediction.prediction)}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Güven:</span>
                      <span className="font-medium">{formatAccuracy(prediction.confidence)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span className="text-gray-500">{prediction.model_used}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(prediction.timestamp).toLocaleString('tr-TR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sentiment' && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Finansal Metin Sentiment Analizi</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Analiz Edilecek Metin
                  </label>
                  <textarea
                    value={sentimentText}
                    onChange={(e) => setSentimentText(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Finansal haber metnini buraya yazın..."
                  />
                </div>
                <button
                  onClick={analyzeSentiment}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center space-x-2"
                >
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>Sentiment Analizi Yap</span>
                </button>
              </div>
            </div>

            {marketReport && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Haber Sentiment Analizi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {marketReport.sentiment_analysis.map((sentiment, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Haber Analizi</h4>
                        <span className={`text-lg font-bold ${getSentimentColor(sentiment.sentiment_score)}`}>
                          {getSentimentLabel(sentiment.sentiment_score)}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Skor:</span>
                          <span className="font-medium">{sentiment.sentiment_score.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Güven:</span>
                          <span className="font-medium">{formatAccuracy(sentiment.confidence)}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(sentiment.timestamp).toLocaleString('tr-TR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'relationships' && marketReport && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Hisse İlişkileri Analizi</h3>
              <span className="text-sm text-gray-600">{marketReport.relationships.length} ilişki tespit edildi</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketReport.relationships.slice(0, 12).map((relationship, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{relationship.source_symbol}</span>
                      <ArrowTrendingUpIcon className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{relationship.target_symbol}</span>
                    </div>
                    <span className="text-sm font-medium text-purple-600">
                      {(relationship.relationship_strength * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tür:</span>
                      <span className="text-gray-500 capitalize">{relationship.relationship_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Güven:</span>
                      <span className="font-medium">{formatAccuracy(relationship.confidence)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'report' && marketReport && (
          <div className="space-y-6">
            {/* Market Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Piyasa Özeti</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{marketReport.market_summary.bullish_signals}</div>
                  <div className="text-sm text-gray-600">Yükseliş Sinyali</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{marketReport.market_summary.bearish_signals}</div>
                  <div className="text-sm text-gray-600">Düşüş Sinyali</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{marketReport.market_summary.neutral_signals}</div>
                  <div className="text-sm text-gray-600">Nötr Sinyal</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{formatAccuracy(marketReport.market_summary.average_confidence)}</div>
                  <div className="text-sm text-gray-600">Ortalama Güven</div>
                </div>
              </div>
            </div>

            {/* Model Performance */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Performansı</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(marketReport.model_performance).map(([model, performance]) => (
                  <div key={model} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{model}</h4>
                      <span className="text-lg font-bold text-purple-600">
                        {formatAccuracy(performance.accuracy)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Durum: <span className="font-medium">{performance.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Report Metadata */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Rapor Zamanı: {new Date(marketReport.timestamp).toLocaleString('tr-TR')}</span>
                <span>Zaman Dilimi: {marketReport.timeframe}</span>
                <span>Analiz Edilen Hisseler: {marketReport.symbols.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeepLearningModels;
