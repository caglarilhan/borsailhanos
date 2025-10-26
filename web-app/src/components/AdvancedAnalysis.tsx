'use client';

import React, { useState, useEffect } from 'react';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CpuChipIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

interface AnalysisData {
  symbol: string;
  technicalAnalysis: {
    rsi: number;
    macd: number;
    bollingerBands: { upper: number; middle: number; lower: number };
    support: number;
    resistance: number;
    trend: 'Bullish' | 'Bearish' | 'Neutral';
  };
  fundamentalAnalysis: {
    peRatio: number;
    pbRatio: number;
    roe: number;
    debtRatio: number;
    revenueGrowth: number;
    profitMargin: number;
  };
  sentimentAnalysis: {
    newsSentiment: number;
    socialSentiment: number;
    analystRating: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
    targetPrice: number;
  };
  riskAnalysis: {
    volatility: number;
    beta: number;
    sharpeRatio: number;
    maxDrawdown: number;
    var95: number;
  };
  aiInsights: {
    mlScore: number;
    ensemblePrediction: number;
    featureImportance: Record<string, number>;
    modelConfidence: number;
  };
}

export default function AdvancedAnalysis() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('THYAO');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);

  const symbols = ['THYAO', 'ASELS', 'TUPRS', 'SISE', 'EREGL', 'BIMAS', 'KCHOL', 'SAHOL'];

  useEffect(() => {
    loadAnalysis(selectedSymbol);
  }, [selectedSymbol]);

  const loadAnalysis = async (symbol: string) => {
    setLoading(true);
    try {
      // Mock gelişmiş analiz verisi
      const mockData: AnalysisData = {
        symbol,
        technicalAnalysis: {
          rsi: Math.random() * 100,
          macd: (Math.random() - 0.5) * 2,
          bollingerBands: {
            upper: 100 + Math.random() * 20,
            middle: 100,
            lower: 100 - Math.random() * 20
          },
          support: 90 + Math.random() * 10,
          resistance: 110 + Math.random() * 10,
          trend: Math.random() > 0.5 ? 'Bullish' : 'Bearish'
        },
        fundamentalAnalysis: {
          peRatio: 8 + Math.random() * 20,
          pbRatio: 1 + Math.random() * 3,
          roe: 10 + Math.random() * 20,
          debtRatio: Math.random() * 0.8,
          revenueGrowth: -10 + Math.random() * 30,
          profitMargin: 5 + Math.random() * 15
        },
        sentimentAnalysis: {
          newsSentiment: Math.random() * 100,
          socialSentiment: Math.random() * 100,
          analystRating: ['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell'][Math.floor(Math.random() * 5)] as any,
          targetPrice: 100 + (Math.random() - 0.5) * 50
        },
        riskAnalysis: {
          volatility: 15 + Math.random() * 20,
          beta: 0.5 + Math.random() * 1.5,
          sharpeRatio: 0.5 + Math.random() * 1.5,
          maxDrawdown: 5 + Math.random() * 15,
          var95: 2 + Math.random() * 8
        },
        aiInsights: {
          mlScore: 60 + Math.random() * 40,
          ensemblePrediction: (Math.random() - 0.5) * 10,
          featureImportance: {
            'RSI': Math.random(),
            'MACD': Math.random(),
            'Volume': Math.random(),
            'Price_Momentum': Math.random(),
            'Sentiment': Math.random()
          },
          modelConfidence: 70 + Math.random() * 30
        }
      };
      
      setAnalysisData(mockData);
    } catch (error) {
      console.error('Analiz yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'Bullish': return 'text-green-600 bg-green-100';
      case 'Bearish': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Strong Buy': return 'text-green-600 bg-green-100';
      case 'Buy': return 'text-blue-600 bg-blue-100';
      case 'Hold': return 'text-yellow-600 bg-yellow-100';
      case 'Sell': return 'text-orange-600 bg-orange-100';
      case 'Strong Sell': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gelişmiş Analiz Paneli</h2>
        <div className="flex gap-2">
          {symbols.map(symbol => (
            <button
              key={symbol}
              onClick={() => setSelectedSymbol(symbol)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                selectedSymbol === symbol 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Analiz yükleniyor...</p>
        </div>
      ) : analysisData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teknik Analiz */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Teknik Analiz
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">RSI:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  analysisData.technicalAnalysis.rsi > 70 ? 'bg-red-100 text-red-700' :
                  analysisData.technicalAnalysis.rsi < 30 ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {analysisData.technicalAnalysis.rsi.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">MACD:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  analysisData.technicalAnalysis.macd > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {analysisData.technicalAnalysis.macd.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Trend:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getTrendColor(analysisData.technicalAnalysis.trend)}`}>
                  {analysisData.technicalAnalysis.trend}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Destek:</span>
                <span className="text-sm font-medium">{analysisData.technicalAnalysis.support.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Direnç:</span>
                <span className="text-sm font-medium">{analysisData.technicalAnalysis.resistance.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Temel Analiz */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ScaleIcon className="h-5 w-5 mr-2" />
              Temel Analiz
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">P/E Oranı:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  analysisData.fundamentalAnalysis.peRatio < 15 ? 'bg-green-100 text-green-700' :
                  analysisData.fundamentalAnalysis.peRatio > 25 ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {analysisData.fundamentalAnalysis.peRatio.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">ROE:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  analysisData.fundamentalAnalysis.roe > 15 ? 'bg-green-100 text-green-700' :
                  analysisData.fundamentalAnalysis.roe < 10 ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {analysisData.fundamentalAnalysis.roe.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Borç Oranı:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  analysisData.fundamentalAnalysis.debtRatio < 0.3 ? 'bg-green-100 text-green-700' :
                  analysisData.fundamentalAnalysis.debtRatio > 0.6 ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {(analysisData.fundamentalAnalysis.debtRatio * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Gelir Büyümesi:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  analysisData.fundamentalAnalysis.revenueGrowth > 10 ? 'bg-green-100 text-green-700' :
                  analysisData.fundamentalAnalysis.revenueGrowth < 0 ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {analysisData.fundamentalAnalysis.revenueGrowth.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Kâr Marjı:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  analysisData.fundamentalAnalysis.profitMargin > 10 ? 'bg-green-100 text-green-700' :
                  analysisData.fundamentalAnalysis.profitMargin < 5 ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {analysisData.fundamentalAnalysis.profitMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Sentiment Analizi */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <InformationCircleIcon className="h-5 w-5 mr-2" />
              Sentiment Analizi
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Haber Sentiment:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  analysisData.sentimentAnalysis.newsSentiment > 70 ? 'bg-green-100 text-green-700' :
                  analysisData.sentimentAnalysis.newsSentiment < 30 ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {analysisData.sentimentAnalysis.newsSentiment.toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sosyal Sentiment:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  analysisData.sentimentAnalysis.socialSentiment > 70 ? 'bg-green-100 text-green-700' :
                  analysisData.sentimentAnalysis.socialSentiment < 30 ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {analysisData.sentimentAnalysis.socialSentiment.toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Analist Değerlendirme:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getRatingColor(analysisData.sentimentAnalysis.analystRating)}`}>
                  {analysisData.sentimentAnalysis.analystRating}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Hedef Fiyat:</span>
                <span className="text-sm font-medium">{analysisData.sentimentAnalysis.targetPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Risk Analizi */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              Risk Analizi
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Volatilite:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  analysisData.riskAnalysis.volatility < 20 ? 'bg-green-100 text-green-700' :
                  analysisData.riskAnalysis.volatility > 35 ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {analysisData.riskAnalysis.volatility.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Beta:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  analysisData.riskAnalysis.beta < 1 ? 'bg-green-100 text-green-700' :
                  analysisData.riskAnalysis.beta > 1.5 ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {analysisData.riskAnalysis.beta.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sharpe Oranı:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  analysisData.riskAnalysis.sharpeRatio > 1 ? 'bg-green-100 text-green-700' :
                  analysisData.riskAnalysis.sharpeRatio < 0.5 ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {analysisData.riskAnalysis.sharpeRatio.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Max Drawdown:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  analysisData.riskAnalysis.maxDrawdown < 10 ? 'bg-green-100 text-green-700' :
                  analysisData.riskAnalysis.maxDrawdown > 20 ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {analysisData.riskAnalysis.maxDrawdown.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">VaR (95%):</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  analysisData.riskAnalysis.var95 < 5 ? 'bg-green-100 text-green-700' :
                  analysisData.riskAnalysis.var95 > 8 ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {analysisData.riskAnalysis.var95.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-gray-50 rounded-lg p-4 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CpuChipIcon className="h-5 w-5 mr-2" />
              AI Insights & Makine Öğrenmesi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ML Skoru:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    analysisData.aiInsights.mlScore > 80 ? 'bg-green-100 text-green-700' :
                    analysisData.aiInsights.mlScore < 60 ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {analysisData.aiInsights.mlScore.toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ensemble Tahmin:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    analysisData.aiInsights.ensemblePrediction > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {analysisData.aiInsights.ensemblePrediction > 0 ? '+' : ''}{analysisData.aiInsights.ensemblePrediction.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Model Güveni:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    analysisData.aiInsights.modelConfidence > 80 ? 'bg-green-100 text-green-700' :
                    analysisData.aiInsights.modelConfidence < 60 ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {analysisData.aiInsights.modelConfidence.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Özellik Önemliliği</h4>
                <div className="space-y-2">
                  {Object.entries(analysisData.aiInsights.featureImportance).map(([feature, importance]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">{feature}:</span>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${importance * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">{(importance * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Analiz verisi yüklenemedi</p>
        </div>
      )}
    </div>
  );
}
