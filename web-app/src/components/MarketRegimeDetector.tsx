'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  ScaleIcon,
  BoltIcon,
  ShieldExclamationIcon,
  FireIcon,
  SunIcon
} from '@heroicons/react/24/outline';

interface MarketIndicators {
  vix: number;
  atr: number;
  bollinger_width: number;
  rsi: number;
  macd: number;
  adx: number;
  volume_ratio: number;
  price_momentum: number;
  timestamp: string;
}

interface RegimeAnalysis {
  current_regime: string;
  confidence: number;
  volatility_level: string;
  trend_strength: string;
  risk_mode: string;
  regime_probabilities: Record<string, number>;
  indicators: MarketIndicators;
  regime_duration: number;
  transition_probability: number;
  timestamp: string;
}

interface RegimeTransition {
  from_regime: string;
  to_regime: string;
  probability: number;
  trigger_indicators: string[];
  expected_duration: number;
  timestamp: string;
}

interface RegimeStatistics {
  total_analyses: number;
  regime_distribution: Record<string, number>;
  volatility_distribution: Record<string, number>;
  trend_strength_distribution: Record<string, number>;
  average_regime_duration: number;
  current_regime: string;
  last_update: string;
}

interface MarketRegimeDetectorProps {
  isLoading: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const MarketRegimeDetector: React.FC<MarketRegimeDetectorProps> = ({ isLoading }) => {
  const [regimeAnalysis, setRegimeAnalysis] = useState<RegimeAnalysis | null>(null);
  const [marketIndicators, setMarketIndicators] = useState<MarketIndicators | null>(null);
  const [regimeTransitions, setRegimeTransitions] = useState<RegimeTransition[]>([]);
  const [regimeHistory, setRegimeHistory] = useState<RegimeAnalysis[]>([]);
  const [statistics, setStatistics] = useState<RegimeStatistics | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'indicators' | 'transitions' | 'history' | 'statistics'>('overview');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BIST100');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  useEffect(() => {
    fetchRegimeAnalysis();
    fetchMarketIndicators();
    fetchRegimeStatistics();
  }, [selectedSymbol]);

  const fetchRegimeAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/regime/analysis?symbol=${selectedSymbol}`);
      const data = await response.json();
      if (data.regime_analysis) {
        setRegimeAnalysis(data.regime_analysis);
      }
    } catch (error) {
      console.error('Error fetching regime analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchMarketIndicators = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/regime/indicators?symbol=${selectedSymbol}`);
      const data = await response.json();
      if (data.market_indicators) {
        setMarketIndicators(data.market_indicators);
      }
    } catch (error) {
      console.error('Error fetching market indicators:', error);
    }
  };

  const fetchRegimeTransitions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/regime/transitions?symbol=${selectedSymbol}`);
      const data = await response.json();
      if (data.regime_transitions) {
        setRegimeTransitions(data.regime_transitions);
      }
    } catch (error) {
      console.error('Error fetching regime transitions:', error);
    }
  };

  const fetchRegimeHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/regime/history?days=30`);
      const data = await response.json();
      if (data.regime_history) {
        setRegimeHistory(data.regime_history);
      }
    } catch (error) {
      console.error('Error fetching regime history:', error);
    }
  };

  const fetchRegimeStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/regime/statistics`);
      const data = await response.json();
      if (data.regime_statistics) {
        setStatistics(data.regime_statistics);
      }
    } catch (error) {
      console.error('Error fetching regime statistics:', error);
    }
  };

  const getRegimeIcon = (regime: string) => {
    switch (regime) {
      case 'Bull Trending': return <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />;
      case 'Bear Trending': return <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />;
      case 'High Volatility': return <BoltIcon className="h-5 w-5 text-yellow-600" />;
      case 'Low Volatility': return <SunIcon className="h-5 w-5 text-blue-600" />;
      case 'Risk On': return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'Risk Off': return <ShieldExclamationIcon className="h-5 w-5 text-red-600" />;
      case 'Crisis': return <FireIcon className="h-5 w-5 text-red-600" />;
      case 'Recovery': return <ArrowPathIcon className="h-5 w-5 text-blue-600" />;
      default: return <ChartBarIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRegimeColor = (regime: string) => {
    switch (regime) {
      case 'Bull Trending': return 'text-green-600 bg-green-100';
      case 'Bear Trending': return 'text-red-600 bg-red-100';
      case 'High Volatility': return 'text-yellow-600 bg-yellow-100';
      case 'Low Volatility': return 'text-blue-600 bg-blue-100';
      case 'Risk On': return 'text-green-600 bg-green-100';
      case 'Risk Off': return 'text-red-600 bg-red-100';
      case 'Crisis': return 'text-red-600 bg-red-100';
      case 'Recovery': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getVolatilityColor = (level: string) => {
    switch (level) {
      case 'Very Low': return 'text-green-600';
      case 'Low': return 'text-green-500';
      case 'Medium': return 'text-yellow-600';
      case 'High': return 'text-orange-600';
      case 'Very High': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendColor = (strength: string) => {
    switch (strength) {
      case 'Very Weak': return 'text-gray-600';
      case 'Weak': return 'text-gray-500';
      case 'Moderate': return 'text-yellow-600';
      case 'Strong': return 'text-blue-600';
      case 'Very Strong': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const formatConfidence = (confidence: number) => {
    return `${(confidence * 100).toFixed(1)}%`;
  };

  const formatProbability = (probability: number) => {
    return `${(probability * 100).toFixed(1)}%`;
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
            <ScaleIcon className="h-8 w-8 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Piyasa Rejimi Algılama</h2>
              <p className="text-sm text-gray-600">Volatilite, trend ve risk modları analizi</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">8 Rejim Aktif</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-3 border-b border-gray-200">
        <nav className="flex space-x-8">
            {[
            { id: 'overview', label: 'Genel Bakış', icon: ChartBarIcon },
            { id: 'analysis', label: 'Rejim Analizi', icon: ScaleIcon },
              { id: 'indicators', label: 'Göstergeler', icon: ArrowTrendingUpIcon },
            { id: 'transitions', label: 'Geçişler', icon: ArrowPathIcon },
            { id: 'history', label: 'Geçmiş', icon: ClockIcon },
            { id: 'statistics', label: 'İstatistikler', icon: ExclamationTriangleIcon }
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
                    Analiz Edilecek Endeks
                  </label>
                  <select
                    value={selectedSymbol}
                    onChange={(e) => setSelectedSymbol(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="BIST100">BIST 100</option>
                    <option value="BIST30">BIST 30</option>
                    <option value="BIST50">BIST 50</option>
                    <option value="SP500">S&P 500</option>
                    <option value="NASDAQ">NASDAQ</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={fetchRegimeAnalysis}
                    disabled={isAnalyzing}
                    className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Analiz Ediliyor...</span>
                      </>
                    ) : (
                      <>
                        <ScaleIcon className="h-4 w-4" />
                        <span>Rejim Analizi Yap</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Current Regime */}
            {regimeAnalysis && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Mevcut Rejim</h3>
                    {getRegimeIcon(regimeAnalysis.current_regime)}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rejim:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRegimeColor(regimeAnalysis.current_regime)}`}>
                        {regimeAnalysis.current_regime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Güven:</span>
                      <span className="text-sm font-medium">{formatConfidence(regimeAnalysis.confidence)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Süre:</span>
                      <span className="text-sm font-medium">{regimeAnalysis.regime_duration} gün</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Volatilite</h3>
                    <BoltIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Seviye:</span>
                      <span className={`text-sm font-medium ${getVolatilityColor(regimeAnalysis.volatility_level)}`}>
                        {regimeAnalysis.volatility_level}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">VIX:</span>
                      <span className="text-sm font-medium">{regimeAnalysis.indicators.vix.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">ATR:</span>
                      <span className="text-sm font-medium">{(regimeAnalysis.indicators.atr * 100).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Trend</h3>
                    <ArrowTrendingUpIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Güç:</span>
                      <span className={`text-sm font-medium ${getTrendColor(regimeAnalysis.trend_strength)}`}>
                        {regimeAnalysis.trend_strength}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">MACD:</span>
                      <span className="text-sm font-medium">{(regimeAnalysis.indicators.macd * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">ADX:</span>
                      <span className="text-sm font-medium">{regimeAnalysis.indicators.adx.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analysis' && regimeAnalysis && (
          <div className="space-y-6">
            {/* Regime Probabilities */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rejim Olasılıkları</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(regimeAnalysis.regime_probabilities).map(([regime, probability]) => (
                  <div key={regime} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{regime}</span>
                      {getRegimeIcon(regime)}
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {formatProbability(probability)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${probability * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Mode */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Modu</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {regimeAnalysis.risk_mode === 'risk_on' ? (
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  ) : (
                    <ShieldExclamationIcon className="h-8 w-8 text-red-600" />
                  )}
                  <div>
                    <div className="text-lg font-semibold text-gray-900 capitalize">
                      {regimeAnalysis.risk_mode.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-gray-600">
                      {regimeAnalysis.risk_mode === 'risk_on' 
                        ? 'Yatırımcılar riskli varlıklara yöneliyor' 
                        : 'Yatırımcılar güvenli varlıklara kaçıyor'
                      }
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatConfidence(regimeAnalysis.confidence)}
                  </div>
                  <div className="text-sm text-gray-500">Güven Seviyesi</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'indicators' && marketIndicators && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">VIX</div>
                <div className="text-2xl font-bold text-purple-600">{marketIndicators.vix.toFixed(1)}</div>
                <div className="text-xs text-gray-500">Volatilite Endeksi</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">ATR</div>
                <div className="text-2xl font-bold text-purple-600">{(marketIndicators.atr * 100).toFixed(2)}%</div>
                <div className="text-xs text-gray-500">Ortalama Gerçek Aralık</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">RSI</div>
                <div className="text-2xl font-bold text-purple-600">{marketIndicators.rsi.toFixed(1)}</div>
                <div className="text-xs text-gray-500">Göreceli Güç Endeksi</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">MACD</div>
                <div className="text-2xl font-bold text-purple-600">{(marketIndicators.macd * 100).toFixed(2)}%</div>
                <div className="text-xs text-gray-500">Hareketli Ortalama</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transitions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Olası Rejim Geçişleri</h3>
              <button
                onClick={fetchRegimeTransitions}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center space-x-2"
              >
                <ArrowPathIcon className="h-4 w-4" />
                <span>Geçişleri Güncelle</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {regimeTransitions.map((transition, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getRegimeIcon(transition.from_regime)}
                      <span className="text-gray-400">→</span>
                      {getRegimeIcon(transition.to_regime)}
                      <div>
                        <div className="font-medium text-gray-900">
                          {transition.from_regime} → {transition.to_regime}
                        </div>
                        <div className="text-sm text-gray-600">
                          Beklenen süre: {transition.expected_duration} gün
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">
                        {formatProbability(transition.probability)}
                      </div>
                      <div className="text-sm text-gray-500">Olasılık</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Tetikleyici göstergeler:</strong> {transition.trigger_indicators.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Rejim Geçmişi</h3>
              <button
                onClick={fetchRegimeHistory}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center space-x-2"
              >
                <ClockIcon className="h-4 w-4" />
                <span>Geçmişi Güncelle</span>
              </button>
            </div>
            
            <div className="space-y-2">
              {regimeHistory.slice(0, 10).map((analysis, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getRegimeIcon(analysis.current_regime)}
                      <div>
                        <div className="font-medium text-gray-900">{analysis.current_regime}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(analysis.timestamp).toLocaleString('tr-TR')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatConfidence(analysis.confidence)}</div>
                      <div className="text-xs text-gray-500">Güven</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'statistics' && statistics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Genel İstatistikler</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toplam Analiz:</span>
                    <span className="font-medium">{statistics.total_analyses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ortalama Süre:</span>
                    <span className="font-medium">{statistics.average_regime_duration} gün</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mevcut Rejim:</span>
                    <span className="font-medium">{statistics.current_regime}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rejim Dağılımı</h3>
                <div className="space-y-2">
                  {Object.entries(statistics.regime_distribution).map(([regime, count]) => (
                    <div key={regime} className="flex justify-between">
                      <span className="text-gray-600">{regime}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Volatilite Dağılımı</h3>
                <div className="space-y-2">
                  {Object.entries(statistics.volatility_distribution).map(([level, count]) => (
                    <div key={level} className="flex justify-between">
                      <span className="text-gray-600">{level}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketRegimeDetector;
