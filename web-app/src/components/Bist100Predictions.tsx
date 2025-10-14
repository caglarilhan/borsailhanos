'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  FireIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface Bist100Prediction {
  symbol: string;
  company: string;
  sector: string;
  currentPrice: number;
  predictedPrice: number;
  change: number;
  confidence: number;
  timeframe: string;
  aiScore: number;
  technicalScore: number;
  fundamentalScore: number;
  sentimentScore: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  reasons: string[];
  riskLevel: 'Düşük' | 'Orta' | 'Yüksek';
  recommendation: 'Güçlü Al' | 'Al' | 'Bekle' | 'Sat' | 'Güçlü Sat';
  lastUpdate: string;
}

interface Bist100PredictionsProps {
  isLoading?: boolean;
}

export default function Bist100Predictions({ isLoading }: Bist100PredictionsProps) {
  const [predictions, setPredictions] = useState<Bist100Prediction[]>([]);
  const [timeframe, setTimeframe] = useState<'5m' | '15m' | '30m' | '1h' | '4h' | '1d'>('1h');
  const [sortBy, setSortBy] = useState<'confidence' | 'change' | 'aiScore'>('confidence');
  const [filter, setFilter] = useState<'all' | 'rising' | 'falling'>('all');
  const [selectedPrediction, setSelectedPrediction] = useState<Bist100Prediction | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Mock BIST 100 predictions with AI analysis
    const mockPredictions: Bist100Prediction[] = [
      {
        symbol: 'THYAO',
        company: 'Türk Hava Yolları',
        sector: 'Havacılık',
        currentPrice: 325.50,
        predictedPrice: 342.80,
        change: 5.3,
        confidence: 0.94,
        timeframe: '1h',
        aiScore: 0.92,
        technicalScore: 0.88,
        fundamentalScore: 0.85,
        sentimentScore: 0.91,
        volume: 2500000,
        marketCap: 45000000000,
        peRatio: 12.5,
        reasons: [
          'RSI oversold seviyede (28)',
          'MACD pozitif kesişim yaptı',
          'Hacim 3 günlük ortalamanın %150 üzerinde',
          'Pozitif haber: Yeni uçak siparişi',
          'Teknik destek seviyesinde güçlü alım'
        ],
        riskLevel: 'Düşük',
        recommendation: 'Güçlü Al',
        lastUpdate: new Date().toISOString()
      },
      {
        symbol: 'ASELS',
        company: 'Aselsan',
        sector: 'Savunma',
        currentPrice: 88.40,
        predictedPrice: 82.15,
        change: -7.1,
        confidence: 0.89,
        timeframe: '4h',
        aiScore: 0.87,
        technicalScore: 0.82,
        fundamentalScore: 0.79,
        sentimentScore: 0.45,
        volume: 1800000,
        marketCap: 18000000000,
        peRatio: 18.2,
        reasons: [
          'RSI overbought seviyede (78)',
          'Çifte tepe formasyonu tamamlandı',
          'Hacim düşüş trendinde',
          'Negatif haber: Proje gecikmesi',
          'Teknik direnç seviyesinde satış baskısı'
        ],
        riskLevel: 'Orta',
        recommendation: 'Sat',
        lastUpdate: new Date().toISOString()
      },
      {
        symbol: 'TUPRS',
        company: 'Tüpraş',
        sector: 'Enerji',
        currentPrice: 145.20,
        predictedPrice: 158.50,
        change: 9.2,
        confidence: 0.96,
        timeframe: '30m',
        aiScore: 0.95,
        technicalScore: 0.93,
        fundamentalScore: 0.91,
        sentimentScore: 0.89,
        volume: 3200000,
        marketCap: 25000000000,
        peRatio: 8.9,
        reasons: [
          'Üçgen formasyonu kırılımı',
          'Petrol fiyatları yükselişte',
          'Güçlü temel analiz skoru',
          'Pozitif sentiment (%89)',
          'Yüksek hacim ile destekleniyor'
        ],
        riskLevel: 'Düşük',
        recommendation: 'Güçlü Al',
        lastUpdate: new Date().toISOString()
      },
      {
        symbol: 'SISE',
        company: 'Şişecam',
        sector: 'İnşaat',
        currentPrice: 45.80,
        predictedPrice: 48.20,
        change: 5.2,
        confidence: 0.82,
        timeframe: '1h',
        aiScore: 0.79,
        technicalScore: 0.76,
        fundamentalScore: 0.84,
        sentimentScore: 0.72,
        volume: 950000,
        marketCap: 12000000000,
        peRatio: 15.3,
        reasons: [
          'EMA 20/50 pozitif kesişim',
          'İnşaat sektörü toparlanma',
          'Düşük P/E oranı',
          'Orta seviye sentiment',
          'Teknik destek seviyesinde'
        ],
        riskLevel: 'Orta',
        recommendation: 'Al',
        lastUpdate: new Date().toISOString()
      },
      {
        symbol: 'EREGL',
        company: 'Ereğli Demir Çelik',
        sector: 'Çelik',
        currentPrice: 67.30,
        predictedPrice: 64.15,
        change: -4.7,
        confidence: 0.85,
        timeframe: '2h',
        aiScore: 0.83,
        technicalScore: 0.81,
        fundamentalScore: 0.77,
        sentimentScore: 0.38,
        volume: 1100000,
        marketCap: 20000000000,
        peRatio: 11.7,
        reasons: [
          'Bollinger Bands üst bandından geri dönüş',
          'Çelik fiyatları düşüşte',
          'Negatif sentiment (%38)',
          'Hacim artışı ile satış',
          'Teknik direnç seviyesi'
        ],
        riskLevel: 'Yüksek',
        recommendation: 'Sat',
        lastUpdate: new Date().toISOString()
      }
    ];

    setTimeout(() => {
      setPredictions(mockPredictions);
    }, 1000);
  }, []);

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Güçlü Al': return 'bg-green-100 text-green-800 border-green-200';
      case 'Al': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Bekle': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Sat': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Güçlü Sat': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Düşük': return 'text-green-600';
      case 'Orta': return 'text-yellow-600';
      case 'Yüksek': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.8) return 'text-blue-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const sortedPredictions = [...predictions].sort((a, b) => {
    switch (sortBy) {
      case 'confidence':
        return b.confidence - a.confidence;
      case 'change':
        return b.change - a.change;
      case 'aiScore':
        return b.aiScore - a.aiScore;
      default:
        return 0;
    }
  });

  const filteredPredictions = sortedPredictions.filter(prediction => {
    if (filter === 'rising') return prediction.change > 0;
    if (filter === 'falling') return prediction.change < 0;
    return true;
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">BIST 100 AI Tahminleri</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
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
            <FireIcon className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">BIST 100 AI Tahminleri</h2>
            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
              Canlı
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {/* Timeframe Selector */}
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-4 w-4 text-gray-400" />
              {['5m', '15m', '30m', '1h', '4h', '1d'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf as any)}
                  className={`px-2 py-1 text-xs rounded ${
                    timeframe === tf
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
            
            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">Tümü</option>
              <option value="rising">Yükseliş</option>
              <option value="falling">Düşüş</option>
            </select>
            
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="confidence">Güven</option>
              <option value="change">Değişim</option>
              <option value="aiScore">AI Skoru</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {filteredPredictions.map((prediction, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {prediction.change > 0 ? (
                      <ArrowTrendingUpIcon className="h-6 w-6 text-green-500" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-gray-900">{prediction.symbol}</p>
                      <span className="text-sm text-gray-500">{prediction.company}</span>
                      <span className="text-xs text-gray-400">({prediction.sector})</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-500">
                        Piyasa Değeri: {prediction.marketCap >= 1000000000 
                          ? `₺${(prediction.marketCap / 1000000000).toFixed(1)}B`
                          : `₺${(prediction.marketCap / 1000000).toFixed(0)}M`
                        }
                      </span>
                      <span className="text-sm text-gray-500">P/E: {prediction.peRatio}</span>
                      <span className="text-sm text-gray-500">
                        Hacim: {prediction.volume.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₺{prediction.currentPrice.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">→ ₺{prediction.predictedPrice.toFixed(2)}</p>
                  <p className={`text-sm font-medium ${
                    prediction.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {prediction.change >= 0 ? '+' : ''}{prediction.change}%
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500">Güven</p>
                  <p className={`font-semibold ${getConfidenceColor(prediction.confidence)}`}>
                    {(prediction.confidence * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-400">{prediction.timeframe}</p>
                </div>
                
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRecommendationColor(prediction.recommendation)}`}>
                    {prediction.recommendation}
                  </span>
                  <p className={`text-xs mt-1 ${getRiskColor(prediction.riskLevel)}`}>
                    Risk: {prediction.riskLevel}
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
                  <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                    Takip Et
                  </button>
                </div>
              </div>
              
              {/* AI Scores */}
              <div className="mt-4 grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500">AI Skoru</p>
                  <p className="text-sm font-semibold text-purple-600">
                    {(prediction.aiScore * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Teknik</p>
                  <p className="text-sm font-semibold text-blue-600">
                    {(prediction.technicalScore * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Temel</p>
                  <p className="text-sm font-semibold text-green-600">
                    {(prediction.fundamentalScore * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Sentiment</p>
                  <p className="text-sm font-semibold text-orange-600">
                    {(prediction.sentimentScore * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prediction Details Modal */}
      {showDetails && selectedPrediction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedPrediction.symbol} - {selectedPrediction.company}
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Price Prediction */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Mevcut Fiyat</p>
                  <p className="text-2xl font-bold text-gray-900">₺{selectedPrediction.currentPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tahmin Edilen Fiyat</p>
                  <p className="text-2xl font-bold text-green-600">₺{selectedPrediction.predictedPrice.toFixed(2)}</p>
                </div>
              </div>

              {/* AI Analysis Scores */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">AI Analiz Skorları</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">AI Skoru</p>
                    <p className="text-xl font-bold text-purple-600">
                      {(selectedPrediction.aiScore * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Teknik Analiz</p>
                    <p className="text-xl font-bold text-blue-600">
                      {(selectedPrediction.technicalScore * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Temel Analiz</p>
                    <p className="text-xl font-bold text-green-600">
                      {(selectedPrediction.fundamentalScore * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Sentiment</p>
                    <p className="text-xl font-bold text-orange-600">
                      {(selectedPrediction.sentimentScore * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Reasons */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Tahmin Nedenleri</h4>
                <div className="space-y-2">
                  {selectedPrediction.reasons.map((reason, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <StarIcon className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <p className="text-sm text-gray-700">{reason}</p>
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
                      Risk seviyesi: <span className={`font-medium ${getRiskColor(selectedPrediction.riskLevel)}`}>
                        {selectedPrediction.riskLevel}
                      </span>
                    </p>
                    <p className="text-sm text-yellow-700">
                      Öneri: <span className={`font-medium ${getRecommendationColor(selectedPrediction.recommendation)}`}>
                        {selectedPrediction.recommendation}
                      </span>
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
}
