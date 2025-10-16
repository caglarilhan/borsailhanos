'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  SparklesIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface HarmonicPattern {
  pattern_type: string;
  direction: string;
  confidence: number;
  points: { [key: string]: [number, number] };
  fibonacci_ratios: { [key: string]: number };
  risk_reward_ratio: number;
  target_price: number;
  stop_loss: number;
  completion_percentage: number;
  timestamp: string;
}

interface ElliottWave {
  wave_type: string;
  direction: string;
  confidence: number;
  waves: { [key: string]: [number, number] };
  fibonacci_ratios: { [key: string]: number };
  wave_strength: number;
  target_price: number;
  stop_loss: number;
  completion_percentage: number;
  timestamp: string;
}

interface PatternAnalysisProps {
  isLoading?: boolean;
}

const API_BASE_URL = 'http://127.0.0.1:8081';

const PatternAnalysis: React.FC<PatternAnalysisProps> = ({ isLoading }) => {
  const [harmonicPatterns, setHarmonicPatterns] = useState<{ [key: string]: HarmonicPattern[] }>({});
  const [elliottWaves, setElliottWaves] = useState<{ [key: string]: ElliottWave[] }>({});
  const [selectedSymbol, setSelectedSymbol] = useState('THYAO');
  const TIMEFRAMES = ['1h','4h','1d','1w'] as const;
  type Timeframe = typeof TIMEFRAMES[number];
  const [timeframe, setTimeframe] = useState<Timeframe>('1d');
  const [activeTab, setActiveTab] = useState<'harmonic' | 'elliott'>('harmonic');
  const [selectedPattern, setSelectedPattern] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const symbols = ['THYAO', 'ASELS', 'TUPRS', 'SISE', 'EREGL', 'AKBNK', 'GARAN', 'ISCTR'];

  const fetchPatterns = async () => {
    try {
      if (activeTab === 'harmonic') {
        const response = await fetch(`${API_BASE_URL}/api/patterns/harmonic/bulk?symbols=${symbols.join(',')}&timeframe=${timeframe}`);
        const data = await response.json();
        
        if (data.signals) {
          setHarmonicPatterns(data.signals);
        } else {
          generateMockHarmonicPatterns();
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/api/patterns/elliott/bulk?symbols=${symbols.join(',')}&timeframe=${timeframe}`);
        const data = await response.json();
        
        if (data.signals) {
          setElliottWaves(data.signals);
        } else {
          generateMockElliottWaves();
        }
      }
    } catch (error) {
      console.error('Error fetching patterns:', error);
      if (activeTab === 'harmonic') {
        generateMockHarmonicPatterns();
      } else {
        generateMockElliottWaves();
      }
    }
  };

  const generateMockHarmonicPatterns = () => {
    const mockPatterns: { [key: string]: HarmonicPattern[] } = {
      'THYAO': [
        {
          pattern_type: 'Gartley',
          direction: 'Bullish',
          confidence: 0.87,
          points: {
            'X': [0, 300],
            'A': [20, 340],
            'B': [40, 320],
            'C': [60, 360]
          },
          fibonacci_ratios: {
            'AB': 0.618,
            'BC': 0.382,
            'CD': 0.786
          },
          risk_reward_ratio: 2.5,
          target_price: 380.0,
          stop_loss: 310.0,
          completion_percentage: 0.75,
          timestamp: new Date().toISOString()
        }
      ],
      'ASELS': [
        {
          pattern_type: 'Butterfly',
          direction: 'Bearish',
          confidence: 0.82,
          points: {
            'X': [0, 90],
            'A': [15, 85],
            'B': [30, 95],
            'C': [45, 80]
          },
          fibonacci_ratios: {
            'AB': 0.786,
            'BC': 0.382,
            'CD': 1.618
          },
          risk_reward_ratio: 3.2,
          target_price: 75.0,
          stop_loss: 95.0,
          completion_percentage: 0.60,
          timestamp: new Date().toISOString()
        }
      ]
    };
    
    setHarmonicPatterns(mockPatterns);
  };

  const generateMockElliottWaves = () => {
    const mockWaves: { [key: string]: ElliottWave[] } = {
      'THYAO': [
        {
          wave_type: 'Impulse',
          direction: 'Bullish',
          confidence: 0.89,
          waves: {
            'wave_0': [0, 300],
            'wave_1': [20, 340],
            'wave_2': [40, 320],
            'wave_3': [60, 380],
            'wave_4': [80, 360]
          },
          fibonacci_ratios: {
            'wave_2': 0.618,
            'wave_3': 1.618,
            'wave_4': 0.382
          },
          wave_strength: 0.85,
          target_price: 400.0,
          stop_loss: 350.0,
          completion_percentage: 0.80,
          timestamp: new Date().toISOString()
        }
      ],
      'TUPRS': [
        {
          wave_type: 'Corrective',
          direction: 'Bearish',
          confidence: 0.76,
          waves: {
            'wave_a': [0, 150],
            'wave_b': [15, 140],
            'wave_c': [30, 130]
          },
          fibonacci_ratios: {
            'wave_c': 1.618
          },
          wave_strength: 0.70,
          target_price: 125.0,
          stop_loss: 145.0,
          completion_percentage: 1.0,
          timestamp: new Date().toISOString()
        }
      ]
    };
    
    setElliottWaves(mockWaves);
  };

  useEffect(() => {
    fetchPatterns();
  }, [activeTab, timeframe]);

  const getPatternColor = (patternType: string) => {
    switch (patternType.toLowerCase()) {
      case 'gartley': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'butterfly': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'bat': return 'bg-green-100 text-green-800 border-green-200';
      case 'crab': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'shark': return 'bg-red-100 text-red-800 border-red-200';
      case 'impulse': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'corrective': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDirectionIcon = (direction: string) => {
    return direction === 'Bullish' ? 
      <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" /> : 
      <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.8) return 'text-blue-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Formasyon Analizi</h2>
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

  const currentPatterns = activeTab === 'harmonic' ? harmonicPatterns : elliottWaves;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="h-6 w-6 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Formasyon Analizi</h2>
            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
              {activeTab === 'harmonic' ? 'Harmonik' : 'Elliott Wave'}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {/* Tab Selector */}
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('harmonic')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'harmonic'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Harmonik Formasyonlar
              </button>
              <button
                onClick={() => setActiveTab('elliott')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'elliott'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Elliott Wave
              </button>
            </div>
            
            {/* Timeframe Selector */}
            <div className="flex space-x-1">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 py-1 text-xs rounded ${
                    timeframe === tf
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {Object.keys(currentPatterns).length === 0 ? (
          <div className="text-center py-12">
            <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Formasyon bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">
              Seçilen zaman diliminde {activeTab === 'harmonic' ? 'harmonik formasyon' : 'Elliott Wave'} tespit edilemedi.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(currentPatterns).map(([symbol, patterns]) => (
              <div key={symbol} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{symbol}</h3>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                    {patterns.length} formasyon
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {patterns.map((pattern, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getDirectionIcon(pattern.direction)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPatternColor(pattern.pattern_type)}`}>
                            {pattern.pattern_type}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPattern(pattern);
                            setShowDetails(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <InformationCircleIcon className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Güven:</span>
                          <span className={`text-sm font-medium ${getConfidenceColor(pattern.confidence)}`}>
                            {(pattern.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Hedef:</span>
                          <span className="text-sm font-medium text-green-600">
                            ₺{pattern.target_price.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Stop Loss:</span>
                          <span className="text-sm font-medium text-red-600">
                            ₺{pattern.stop_loss.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Risk/Reward:</span>
                          <span className="text-sm font-medium text-blue-600">
                            {pattern.risk_reward_ratio.toFixed(1)}:1
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Tamamlanma:</span>
                          <span className="text-sm font-medium text-purple-600">
                            {(pattern.completion_percentage * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pattern Details Modal */}
      {showDetails && selectedPattern && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedPattern.pattern_type} Formasyonu - Detaylı Analiz
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Pattern Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Formasyon Tipi</p>
                  <p className={`text-xl font-bold ${getPatternColor(selectedPattern.pattern_type)}`}>
                    {selectedPattern.pattern_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Yön</p>
                  <div className="flex items-center space-x-2">
                    {getDirectionIcon(selectedPattern.direction)}
                    <p className="text-xl font-bold text-gray-900">{selectedPattern.direction}</p>
                  </div>
                </div>
              </div>

              {/* Price Targets */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Fiyat Hedefleri</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Hedef Fiyat</p>
                    <p className="text-xl font-bold text-green-600">₺{selectedPattern.target_price.toFixed(2)}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Stop Loss</p>
                    <p className="text-xl font-bold text-red-600">₺{selectedPattern.stop_loss.toFixed(2)}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Risk/Reward</p>
                    <p className="text-xl font-bold text-blue-600">{selectedPattern.risk_reward_ratio.toFixed(1)}:1</p>
                  </div>
                </div>
              </div>

              {/* Fibonacci Ratios */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Fibonacci Oranları</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(selectedPattern.fibonacci_ratios).map(([ratio, value]) => (
                    <div key={ratio} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">{ratio}</p>
                        <p className="text-lg font-bold text-purple-600">{(value * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pattern Points */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Formasyon Noktaları</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(selectedPattern.points).map(([point, [time, price]]) => (
                    <div key={point} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">Nokta {point}</p>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Zaman: {time}</p>
                          <p className="text-sm font-bold text-gray-900">₺{price.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analysis Info */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Analiz Bilgileri</p>
                    <p className="text-sm text-yellow-700">
                      Güven Skoru: <span className={`font-medium ${getConfidenceColor(selectedPattern.confidence)}`}>
                        {(selectedPattern.confidence * 100).toFixed(1)}%
                      </span>
                    </p>
                    <p className="text-sm text-yellow-700">
                      Tamamlanma: {(selectedPattern.completion_percentage * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm text-yellow-700">
                      Zaman Dilimi: {timeframe}
                    </p>
                    <p className="text-sm text-yellow-700">
                      Son Güncelleme: {new Date(selectedPattern.timestamp).toLocaleString()}
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

export default PatternAnalysis;
