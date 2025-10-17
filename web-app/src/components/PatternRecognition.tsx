'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/config';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  ClockIcon,
  TargetIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface CandlestickPattern {
  name: string;
  description: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reliability: number;
  color: string;
  detected_at: string;
  timeframe: string;
}

interface HarmonicPattern {
  name: string;
  description: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  bullish_probability: number;
  color: string;
  fibonacci_levels: Record<string, number>;
  detected_at: string;
  timeframe: string;
}

interface TechnicalPattern {
  name: string;
  description: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reliability: number;
  color: string;
  target_price: number;
  volume_confirmation: boolean;
  detected_at: string;
  timeframe: string;
}

export default function PatternRecognition() {
  const [symbol, setSymbol] = useState<string>('THYAO');
  const [timeframe, setTimeframe] = useState<string>('1h');
  const [activeTab, setActiveTab] = useState<'candlestick' | 'harmonic' | 'technical'>('candlestick');
  const [loading, setLoading] = useState<boolean>(false);
  const [candlestickData, setCandlestickData] = useState<any>(null);
  const [harmonicData, setHarmonicData] = useState<any>(null);
  const [technicalData, setTechnicalData] = useState<any>(null);

  const timeframes = [
    { value: '5m', label: '5 Dakika' },
    { value: '15m', label: '15 Dakika' },
    { value: '30m', label: '30 Dakika' },
    { value: '1h', label: '1 Saat' },
    { value: '4h', label: '4 Saat' },
    { value: '1d', label: '1 Gün' }
  ];

  const fetchCandlestickPatterns = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/patterns/candlestick?symbol=${symbol}&timeframe=${timeframe}`);
      const data = await response.json();
      setCandlestickData(data);
    } catch (error) {
      console.error('Candlestick patterns fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHarmonicPatterns = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/patterns/harmonic?symbol=${symbol}&timeframe=${timeframe}`);
      const data = await response.json();
      setHarmonicData(data);
    } catch (error) {
      console.error('Harmonic patterns fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicalPatterns = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/patterns/technical?symbol=${symbol}&timeframe=${timeframe}`);
      const data = await response.json();
      setTechnicalData(data);
    } catch (error) {
      console.error('Technical patterns fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'candlestick') fetchCandlestickPatterns();
    else if (activeTab === 'harmonic') fetchHarmonicPatterns();
    else if (activeTab === 'technical') fetchTechnicalPatterns();
  }, [symbol, timeframe, activeTab]);

  const getSignalIcon = (signal: string) => {
    if (signal === 'BUY') return <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />;
    if (signal === 'SELL') return <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />;
    return <MinusIcon className="h-5 w-5 text-gray-600" />;
  };

  const getSignalColor = (signal: string) => {
    if (signal === 'BUY') return 'text-green-700 bg-green-50 border-green-200';
    if (signal === 'SELL') return 'text-red-700 bg-red-50 border-red-200';
    return 'text-gray-700 bg-gray-50 border-gray-200';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Pattern Recognition</h2>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Sembol (örn: THYAO)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {timeframes.map(tf => (
              <option key={tf.value} value={tf.value}>{tf.label}</option>
            ))}
          </select>
          <button
            onClick={() => {
              if (activeTab === 'candlestick') fetchCandlestickPatterns();
              else if (activeTab === 'harmonic') fetchHarmonicPatterns();
              else if (activeTab === 'technical') fetchTechnicalPatterns();
            }}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Yükleniyor...' : 'Yenile'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'candlestick', name: 'Candlestick Patterns', icon: ChartBarIcon },
            { id: 'harmonic', name: 'Harmonic Patterns', icon: TargetIcon },
            { id: 'technical', name: 'Technical Patterns', icon: ChartBarIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Candlestick Patterns Tab */}
      {activeTab === 'candlestick' && candlestickData && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Candlestick Pattern Özeti</h3>
              <div className="text-sm text-gray-600">
                {candlestickData.patterns_detected} formasyon tespit edildi
              </div>
            </div>
          </div>

          {candlestickData.patterns.length > 0 ? (
            <div className="space-y-3">
              {candlestickData.patterns.map((pattern: CandlestickPattern, index: number) => (
                <div key={index} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{pattern.name}</h4>
                        {getSignalIcon(pattern.signal)}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSignalColor(pattern.signal)}`}>
                          {pattern.signal}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{pattern.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          {pattern.timeframe}
                        </span>
                        <span className="flex items-center gap-1">
                          <span>Güvenilirlik: {(pattern.reliability * 100).toFixed(0)}%</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className={`text-lg font-bold ${getConfidenceColor(pattern.confidence)}`}>
                        {(pattern.confidence * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">Güven</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Formasyon Bulunamadı</h3>
              <p className="text-gray-600">Bu zaman diliminde candlestick formasyonu tespit edilmedi.</p>
            </div>
          )}
        </div>
      )}

      {/* Harmonic Patterns Tab */}
      {activeTab === 'harmonic' && harmonicData && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Harmonic Pattern Özeti</h3>
              <div className="text-sm text-gray-600">
                {harmonicData.harmonics_detected} harmonik formasyon tespit edildi
              </div>
            </div>
          </div>

          {harmonicData.harmonics.length > 0 ? (
            <div className="space-y-3">
              {harmonicData.harmonics.map((pattern: HarmonicPattern, index: number) => (
                <div key={index} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{pattern.name}</h4>
                        {getSignalIcon(pattern.signal)}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSignalColor(pattern.signal)}`}>
                          {pattern.signal}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{pattern.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Boğa Olasılığı</div>
                          <div className="text-sm font-medium text-green-600">
                            {(pattern.bullish_probability * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Zaman Dilimi</div>
                          <div className="text-sm font-medium">{pattern.timeframe}</div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 mb-1">Fibonacci Seviyeleri</div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        {Object.entries(pattern.fibonacci_levels).map(([level, value]) => (
                          <div key={level} className="bg-gray-50 rounded px-2 py-1">
                            <div className="font-medium">{level}</div>
                            <div className="text-gray-600">{value.toFixed(3)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className={`text-lg font-bold ${getConfidenceColor(pattern.confidence)}`}>
                        {(pattern.confidence * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">Güven</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <TargetIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Harmonik Formasyon Bulunamadı</h3>
              <p className="text-gray-600">Bu zaman diliminde harmonik formasyon tespit edilmedi.</p>
            </div>
          )}
        </div>
      )}

      {/* Technical Patterns Tab */}
      {activeTab === 'technical' && technicalData && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Technical Pattern Özeti</h3>
              <div className="text-sm text-gray-600">
                {technicalData.technical_patterns_detected} teknik formasyon tespit edildi
              </div>
            </div>
          </div>

          {technicalData.technical_patterns.length > 0 ? (
            <div className="space-y-3">
              {technicalData.technical_patterns.map((pattern: TechnicalPattern, index: number) => (
                <div key={index} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{pattern.name}</h4>
                        {getSignalIcon(pattern.signal)}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSignalColor(pattern.signal)}`}>
                          {pattern.signal}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{pattern.description}</p>
                      
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Hedef Fiyat</div>
                          <div className="text-sm font-medium text-blue-600">
                            {(pattern.target_price * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Güvenilirlik</div>
                          <div className="text-sm font-medium">
                            {(pattern.reliability * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Hacim Onayı</div>
                          <div className="flex items-center gap-1">
                            {pattern.volume_confirmation ? (
                              <CheckCircleIcon className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircleIcon className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-sm font-medium">
                              {pattern.volume_confirmation ? 'Evet' : 'Hayır'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className={`text-lg font-bold ${getConfidenceColor(pattern.confidence)}`}>
                        {(pattern.confidence * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">Güven</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Teknik Formasyon Bulunamadı</h3>
              <p className="text-gray-600">Bu zaman diliminde teknik formasyon tespit edilmedi.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
