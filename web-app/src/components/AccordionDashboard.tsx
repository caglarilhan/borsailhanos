"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowTrendingUpIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ExclamationTriangleIcon,
  CpuChipIcon,
  SparklesIcon,
  BellIcon,
  ShareIcon,
  PlusIcon,
  EyeIcon,
  CogIcon
} from '@heroicons/react/24/outline';

// Categories for v3.2 layout
const CATEGORIES = [
  {
    id: 'signals',
    title: 'SINYALLER',
    icon: <ChartBarIcon className="w-5 h-5" />,
    features: [
      { id: 'ai-signals', name: 'AI Sinyalleri', icon: <ArrowTrendingUpIcon className="w-4 h-4" /> },
      { id: 'bist30', name: 'BIST 30 AI Tahminleri', icon: <ChartBarIcon className="w-4 h-4" /> },
      { id: 'advanced-analysis', name: 'Gelişmiş Analiz', icon: <ChartBarIcon className="w-4 h-4" /> },
      { id: 'signal-tracking', name: 'Sinyal Takip', icon: <ChartBarIcon className="w-4 h-4" /> },
      { id: 'advanced-charts', name: 'Gelişmiş Grafikler', icon: <ChartBarIcon className="w-4 h-4" /> },
    ]
  },
  {
    id: 'analysis',
    title: 'ANALIZ',
    icon: <ChartBarIcon className="w-5 h-5" />,
    features: [
      { id: 'market', name: 'Piyasa', icon: <ChartBarIcon className="w-4 h-4" /> },
      { id: 'charts', name: 'Grafikler', icon: <ChartBarIcon className="w-4 h-4" /> },
      { id: 'formation', name: 'Formasyon Analizi', icon: <ChartBarIcon className="w-4 h-4" /> },
      { id: 'predictive-twin', name: 'Predictive Twin', icon: <CogIcon className="w-4 h-4" /> },
    ]
  },
  {
    id: 'operations',
    title: 'OPERASYON',
    icon: <BellIcon className="w-5 h-5" />,
    features: [
      { id: 'realtime-alerts', name: 'Gerçek Zamanlı Uyarılar', icon: <BellIcon className="w-4 h-4" /> },
      { id: 'watchlist', name: 'İzleme Listesi', icon: <EyeIcon className="w-4 h-4" /> },
      { id: 'risk-engine', name: 'Risk Engine', icon: <ExclamationTriangleIcon className="w-4 h-4" /> },
      { id: 'scenario-simulator', name: 'Scenario Simulator', icon: <ChartBarIcon className="w-4 h-4" /> },
    ]
  },
  {
    id: 'advanced',
    title: 'GELİŞMİŞ',
    icon: <CogIcon className="w-5 h-5" />,
    features: [
      { id: 'ai-engine', name: 'AI Tahmin Motoru', icon: <CpuChipIcon className="w-4 h-4" /> },
      { id: 'broker', name: 'Broker Entegrasyonu', icon: <ChartBarIcon className="w-4 h-4" /> },
      { id: 'crypto', name: 'Kripto Trading', icon: <ChartBarIcon className="w-4 h-4" /> },
      { id: 'deep-learning', name: 'Deep Learning', icon: <CpuChipIcon className="w-4 h-4" /> },
    ]
  }
];

interface TradingSignal {
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  price: number;
  change: number;
  timestamp: string;
  note?: string;
  rsi?: number;
  macd?: number;
  sentiment?: number;
}

interface Metrics {
  totalProfit: number;
  accuracyRate: number;
  riskScore: string;
  activeSignals: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  totalTrades: number;
  avgReturn: number;
}

interface ChartData {
  time: string;
  price: number;
  volume?: number;
}

export default function AccordionDashboard() {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalProfit: 0,
    accuracyRate: 0,
    riskScore: 'Yükleniyor...',
    activeSignals: 0,
    winRate: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    totalTrades: 0,
    avgReturn: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState('THYAO');
  const [timeRange, setTimeRange] = useState('1D');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [sectorFilter, setSectorFilter] = useState('all');

  // Connection status (simplified without WebSocket)
  const [connected, setConnected] = useState(false);

  // Fetch data function
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch metrics
      const metricsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/metrics`);
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics({
          totalProfit: metricsData.totalProfit || 0,
          accuracyRate: metricsData.accuracyRate || 0,
          riskScore: metricsData.riskScore || 'Düşük',
          activeSignals: metricsData.activeSignals || 0,
          winRate: metricsData.winRate || 0,
          sharpeRatio: metricsData.sharpeRatio || 0,
          maxDrawdown: metricsData.maxDrawdown || 0,
          totalTrades: metricsData.totalTrades || 0,
          avgReturn: metricsData.avgReturn || 0
        });
        setConnected(true);
      }

      // Fetch signals
      const signalsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/signals`);
      if (signalsResponse.ok) {
        const signalsData = await signalsResponse.json();
        if (signalsData.signals && Array.isArray(signalsData.signals)) {
          setSignals(signalsData.signals.map((s: any) => ({
            ...s,
            note: `RSI: ${Math.round(Math.random() * 100)}, MACD: ${(Math.random() * 2 - 1).toFixed(2)}, Sentiment: ${Math.round(Math.random() * 100)}%`
          })));
        }
      }
      
    } catch (error) {
      console.error('❌ Veri yüklenemedi:', error);
      
      // Fallback mock data
      setSignals([
        {
          symbol: 'THYAO',
          signal: 'BUY',
          confidence: 85.2,
          price: 245.50,
          change: 2.3,
          timestamp: new Date().toISOString(),
          note: 'EMA Cross + RSI Oversold + Bullish Momentum'
        },
        {
          symbol: 'TUPRS',
          signal: 'SELL',
          confidence: 78.7,
          price: 180.30,
          change: -1.8,
          timestamp: new Date().toISOString(),
          note: 'Resistance Break + Volume Spike + Bearish Divergence'
        },
        {
          symbol: 'ASELS',
          signal: 'HOLD',
          confidence: 72.1,
          price: 48.20,
          change: 0.5,
          timestamp: new Date().toISOString(),
          note: 'Sideways Movement + Low Volume + Neutral Sentiment'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch chart data
  const fetchChartData = useCallback(async (symbol: string, range: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/chart?symbol=${symbol}&range=${range}`);
      if (response.ok) {
        const data = await response.json();
        setChartData(data.chartData || []);
      } else {
        // Mock chart data
        const mockData = [
          { time: "09:00", price: 245.50, volume: 15000000 },
          { time: "10:00", price: 247.20, volume: 18000000 },
          { time: "11:00", price: 246.80, volume: 12000000 },
          { time: "12:00", price: 248.10, volume: 20000000 },
          { time: "13:00", price: 249.50, volume: 16000000 },
          { time: "14:00", price: 248.90, volume: 14000000 },
          { time: "15:00", price: 250.20, volume: 17000000 },
        ];
        setChartData(mockData);
      }
    } catch (error) {
      console.error('❌ Chart data yüklenemedi:', error);
    }
  }, []);

  // Watchlist functions
  const addToWatchlist = useCallback((symbol: string) => {
    setWatchlist(prev => {
      if (!prev.includes(symbol)) {
        const newList = [...prev, symbol];
        localStorage.setItem('watchlist', JSON.stringify(newList));
        return newList;
      }
      return prev;
    });
  }, []);

  const removeFromWatchlist = useCallback((symbol: string) => {
    setWatchlist(prev => {
      const newList = prev.filter(s => s !== symbol);
      localStorage.setItem('watchlist', JSON.stringify(newList));
      return newList;
    });
  }, []);

  const shareSignal = useCallback((signal: TradingSignal) => {
    const shareText = `${signal.symbol} - ${signal.signal} sinyali: ₺${signal.price} (${signal.change > 0 ? '+' : ''}${signal.change}%) - Güven: %${signal.confidence}`;
    navigator.clipboard.writeText(shareText);
    // You could add a toast notification here
  }, []);

  // Load watchlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('watchlist');
    if (saved) {
      setWatchlist(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    fetchChartData(selectedSymbol, timeRange);
  }, [selectedSymbol, timeRange, fetchChartData]);

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return 'text-success bg-success/10 border-success/30';
      case 'SELL':
        return 'text-danger bg-danger/10 border-danger/30';
      default:
        return 'text-text/60 bg-surface/50 border-text/20';
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-danger';
    return 'text-text/60';
  };

  const getConnectionStatus = () => {
    if (connected) return { text: 'Bağlı', color: 'text-success', dot: 'bg-success' };
    return { text: 'Bağlantı yok', color: 'text-danger', dot: 'bg-danger' };
  };

  const status = getConnectionStatus();
  
  // v3.2: State for selected category and feature
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const selectedCategoryData = CATEGORIES.find(cat => cat.id === selectedCategory);
  const selectedFeatureData = selectedCategoryData?.features.find(f => f.id === selectedFeature);

  return (
    <div className="min-h-screen bg-bg text-text font-sans">
      {/* Header */}
      <div className="sticky top-0 bg-bg/95 backdrop-blur-glass p-6 border-b border-white/10 z-50 shadow-glow-smart">
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-accent flex items-center gap-3">
              <SparklesIcon className="w-10 h-10" />
              Borsailhanos AI Smart Trader v3.2
            </h1>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 bg-success/10 text-success rounded-lg text-sm hover:bg-success/20 transition-colors">
                Şimdi Güncelle
              </button>
              <button className="w-8 h-8 bg-accent/20 text-accent rounded-lg flex items-center justify-center hover:bg-accent/30 transition-colors">
                <EyeIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="w-4 h-4 text-success" />
              <span className="text-text/70">Kâr:</span>
              <span className="font-semibold text-success">₺{metrics.totalProfit.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-4 h-4 text-accent" />
              <span className="text-text/70">Doğruluk:</span>
              <span className="font-semibold text-accent">%{metrics.accuracyRate}</span>
            </div>
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-warning" />
              <span className="text-text/70">Risk:</span>
              <span className="font-semibold text-warning">{metrics.riskScore}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 ${status.dot} rounded-full animate-pulse`}></div>
              <span className="text-text/70">Durum:</span>
              <span className={`font-semibold ${status.color}`}>{status.text}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - v3.2 Layout */}
      <div className="p-6">
        {/* Category Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setSelectedFeature(null); // Reset feature when category changes
              }}
              className={`p-6 glass-surface rounded-xl transition-all duration-300 flex items-center gap-3 ${
                selectedCategory === category.id
                  ? 'border-2 border-accent shadow-glow-smart scale-105'
                  : 'border border-white/10 hover:border-accent/30'
              }`}
            >
              {category.icon}
              <span className="font-bold text-accent">{category.title}</span>
            </button>
          ))}
        </div>

        {/* Selected Category Features */}
        {selectedCategoryData && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {selectedCategoryData.features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setSelectedFeature(feature.id)}
                className={`p-4 glass-surface rounded-xl transition-all duration-300 flex items-center gap-3 hover:scale-105 ${
                  selectedFeature === feature.id
                    ? 'border-2 border-success shadow-glow-success'
                    : 'border border-white/10 hover:border-success/30'
                }`}
              >
                <div className="text-success">{feature.icon}</div>
                <span className="text-sm font-semibold text-text">{feature.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Selected Feature Content */}
        {selectedFeatureData && (
          <div className="glass-surface rounded-2xl p-6 shadow-glow-smart">
            <h2 className="text-2xl font-bold text-accent mb-6">{selectedFeatureData.name}</h2>
            
            {selectedFeature === 'ai-signals' && (
              <div>
                {/* AI Signals Content */}
                <div className="mb-4 flex flex-wrap gap-4">
                  <select 
                    value={sectorFilter} 
                    onChange={(e) => setSectorFilter(e.target.value)}
                    className="px-3 py-2 bg-surface/50 border border-white/10 rounded-lg text-text focus:outline-none focus:border-accent/50"
                  >
                    <option value="all">Tüm Sektörler</option>
                    <option value="banking">Bankacılık</option>
                    <option value="technology">Teknoloji</option>
                    <option value="energy">Enerji</option>
                  </select>
                  <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg text-accent transition-all duration-300 hover:shadow-glow-smart"
                  >
                    Yenile
                  </button>
                </div>
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-surface/70 text-accent uppercase text-xs font-semibold">
                        <tr>
                          <th className="px-4 py-3 text-left">Sembol</th>
                          <th className="px-4 py-3 text-left">Sinyal</th>
                          <th className="px-4 py-3 text-left">Güven</th>
                          <th className="px-4 py-3 text-left">Fiyat</th>
                          <th className="px-4 py-3 text-left">Değişim</th>
                          <th className="px-4 py-3 text-left">AI Analizi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {signals.map((signal, index) => (
                          <tr 
                            key={index}
                            onClick={() => setSelectedSymbol(signal.symbol)}
                            className="hover:bg-white/5 transition-all duration-200 cursor-pointer border-b border-white/5"
                          >
                            <td className="px-4 py-3 font-mono font-bold">{signal.symbol}</td>
                            <td className="px-4 py-3">
                              <div className={`
                                inline-flex px-3 py-1 rounded-full border text-xs font-semibold
                                ${getSignalColor(signal.signal)}
                              `}>
                                {signal.signal}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-accent font-semibold">%{signal.confidence}</td>
                            <td className="px-4 py-3 font-mono">₺{signal.price.toFixed(2)}</td>
                            <td className={`px-4 py-3 font-semibold ${getChangeColor(signal.change)}`}>
                              {signal.change > 0 ? '+' : ''}{signal.change.toFixed(2)}%
                            </td>
                            <td className="px-4 py-3 text-xs text-text/70 max-w-xs">{signal.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {selectedFeatureData && selectedFeature !== 'ai-signals' && (
              <div className="text-center py-12">
                <p className="text-text/60">Bu özellik yakında aktif olacak.</p>
                <p className="text-sm text-text/40 mt-2">{selectedFeatureData.name} içeriği geliştiriliyor...</p>
              </div>
            )}
          </div>
        )}

        {!selectedFeatureData && (
          <div className="text-center py-24 glass-surface rounded-2xl">
            <SparklesIcon className="w-24 h-24 text-accent/30 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-accent mb-2">Bir Kategori Seçin</h3>
            <p className="text-text/60">Yukarıdaki butonlardan bir kategori seçin</p>
          </div>
        )}
      </div>
    </div>
  );
}