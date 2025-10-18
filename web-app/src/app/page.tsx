'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  BellIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  CpuChipIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  CalculatorIcon,
  StarIcon,
  BeakerIcon,
  ScaleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import TradingSignals from '@/components/TradingSignals';
import MarketOverview from '@/components/MarketOverview';
import LivePrices from '@/components/LivePrices';
import AdvancedCharts from '@/components/AdvancedCharts';
import GodModePanel from '@/components/GodModePanel';
import SeckmeFormations from '@/components/SeckmeFormations';
import RealTimeAlerts from '@/components/RealTimeAlerts';
import Bist100Predictions from '@/components/Bist100Predictions';
import AIPredictionEngine from '@/components/AIPredictionEngine';
import BrokerIntegration from '@/components/BrokerIntegration';
import CryptoTrading from '@/components/CryptoTrading';
import OptionsAnalysis from '@/components/OptionsAnalysis';
import WatchlistManager from '@/components/WatchlistManager';
import AdvancedAIPredictions from '@/components/AdvancedAIPredictions';
import PatternAnalysis from '@/components/PatternAnalysis';
import SmartNotifications from '@/components/SmartNotifications';
import EducationSystem from '@/components/EducationSystem';
import UltraAccuracyOptimizer from '@/components/UltraAccuracyOptimizer';
import DeepLearningModels from '@/components/DeepLearningModels';
import AdvancedEnsembleStrategies from '@/components/AdvancedEnsembleStrategies';
import MarketRegimeDetector from '@/components/MarketRegimeDetector';
import BistSignals from '@/components/BistSignals';
import Bist30Predictions from '@/components/Bist30Predictions';
import PredictiveTwin from '@/components/PredictiveTwin';
import RiskEngine from '@/components/RiskEngine';
import ScenarioSimulator from '@/components/ScenarioSimulator';
import XAIExplain from '@/components/XAIExplain';
import IngestionMonitor from '@/components/IngestionMonitor';
import AdaptiveUI from '@/components/AdaptiveUI';
import WatchlistDropdown from '@/components/WatchlistDropdown';
import TickInspector from '@/components/TickInspector';
import SectorStrength from '@/components/SectorStrength';
import LiquidityHeatmap from '@/components/LiquidityHeatmap';
import EventDrivenAI from '@/components/EventDrivenAI';
import AnomalyMomentum from '@/components/AnomalyMomentum';
import CrossMarketArbitrage from '@/components/CrossMarketArbitrage';
import CalibrationPanel from '@/components/CalibrationPanel';

interface TradingSignal {
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  price: number;
  change: number;
  timestamp: string;
}

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  volume: number;
}

type TabId = 'dashboard' | 'signals' | 'bist30' | 'market' | 'charts' | 'seckme' | 'alerts' | 'bist100' | 'aiengine' | 'brokers' | 'crypto' | 'options' | 'watchlist' | 'advancedai' | 'patterns' | 'notifications' | 'education' | 'accuracy' | 'godmode' | 'deeplearning' | 'ensemble' | 'regime';

const tabs = [
  { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
  { id: 'signals', name: 'AI Sinyalleri', icon: ArrowTrendingUpIcon },
  { id: 'bist30', name: 'BIST 30 AI Tahminleri', icon: ArrowTrendingUpIcon },
  { id: 'market', name: 'Piyasa', icon: ChartBarIcon },
  { id: 'charts', name: 'Grafikler', icon: ChartBarIcon },
  { id: 'seckme', name: 'Seçmeki Formasyonları', icon: ArrowTrendingUpIcon },
  { id: 'alerts', name: 'Gerçek Zamanlı Uyarılar', icon: BellIcon },
  { id: 'bist100', name: 'BIST 100 AI Tahminleri', icon: ArrowTrendingUpIcon },
  { id: 'aiengine', name: 'AI Tahmin Motoru', icon: CpuChipIcon },
  { id: 'brokers', name: 'Broker Entegrasyonu', icon: BuildingOfficeIcon },
  { id: 'crypto', name: 'Kripto Trading', icon: CurrencyDollarIcon },
  { id: 'options', name: 'Opsiyon Analizi', icon: CalculatorIcon },
  { id: 'watchlist', name: 'İzleme Listesi', icon: StarIcon },
  { id: 'advancedai', name: 'Gelişmiş AI', icon: CpuChipIcon },
  { id: 'patterns', name: 'Formasyon Analizi', icon: ChartBarIcon },
  { id: 'twin', name: 'Predictive Twin', icon: CpuChipIcon },
  { id: 'risk', name: 'Risk Engine', icon: ShieldCheckIcon },
  { id: 'sim', name: 'Scenario Simulator', icon: BeakerIcon },
  { id: 'xai', name: 'XAI Explain', icon: SparklesIcon },
  { id: 'ingest', name: 'Ingestion Monitor', icon: BeakerIcon },
  { id: 'adaptive', name: 'Adaptive UI', icon: SparklesIcon },
  { id: 'ticks', name: 'Tick Inspector', icon: ChartBarIcon },
  { id: 'sector', name: 'Sektör Güç', icon: ChartBarIcon },
  { id: 'liquidity', name: 'Likidite Heatmap', icon: ChartBarIcon },
  { id: 'events', name: 'Event-Driven AI', icon: SparklesIcon },
  { id: 'anomaly', name: 'Anomali+Momentum', icon: ChartBarIcon },
  { id: 'arbitrage', name: 'Arbitraj İpuçları', icon: ChartBarIcon },
  { id: 'calibration', name: 'Kalibrasyon', icon: ScaleIcon },
  { id: 'smart_notifications', name: 'Smart Notifications', icon: BellIcon },
  { id: 'notifications', name: 'Akıllı Bildirimler', icon: BellIcon },
  { id: 'education', name: 'Eğitim & Sosyal', icon: AcademicCapIcon },
  { id: 'accuracy', name: 'Doğruluk Optimizasyonu', icon: RocketLaunchIcon },
  { id: 'deeplearning', name: 'Deep Learning', icon: CpuChipIcon },
  { id: 'ensemble', name: 'Ensemble Stratejileri', icon: BeakerIcon },
  { id: 'regime', name: 'Piyasa Rejimi', icon: ScaleIcon },
  { id: 'godmode', name: 'God Mode', icon: ShieldCheckIcon }
] as const;

const groupedTabs = [
  { group: 'Sinyaller', items: ['signals','bist30','bist100','anomaly','arbitrage'] as const },
  { group: 'Analiz', items: ['market','charts','patterns','sector','liquidity','events','twin','xai','sentiment'] as const },
  { group: 'Operasyon', items: ['risk','sim','watchlist','alerts','ticks','ingest','adaptive','streaming','risk_mgmt','smart_notifications'] as const },
  { group: 'Gelişmiş', items: ['aiengine','advancedai','calibration','feedback','accuracy','deeplearning','ensemble','regime','godmode','brokers','crypto','options','education'] as const }
] as const;

export default function Dashboard() {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({ name: 'Admin', email: 'admin@bistai.com' });
  const [godMode, setGodMode] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  // Mock data for demonstration
  useEffect(() => {
    const mockSignals: TradingSignal[] = [
      {
        symbol: 'THYAO',
        signal: 'BUY',
        confidence: 0.85,
        price: 325.50,
        change: 2.3,
        timestamp: new Date().toISOString(),
        xaiExplanation: 'RSI oversold durumda ve MACD pozitif kesişim yapıyor',
        shapValues: { rsi: 0.25, macd: 0.18, volume: 0.12, price_change: 0.15 },
        confluenceScore: 0.87,
        marketRegime: 'Risk-On',
        sentimentScore: 0.78,
        expectedReturn: 0.045,
        stopLoss: 310.25,
        takeProfit: 340.75
      },
      {
        symbol: 'ASELS',
        signal: 'SELL',
        confidence: 0.72,
        price: 88.40,
        change: -1.8,
        timestamp: new Date().toISOString(),
        xaiExplanation: 'RSI overbought seviyede ve hacim düşüş trendinde',
        shapValues: { rsi: -0.20, macd: -0.15, volume: -0.08, price_change: -0.12 },
        confluenceScore: 0.73,
        marketRegime: 'Risk-Off',
        sentimentScore: 0.42,
        expectedReturn: -0.028,
        stopLoss: 92.15,
        takeProfit: 84.65
      },
      {
        symbol: 'TUPRS',
        signal: 'BUY',
        confidence: 0.91,
        price: 145.20,
        change: 3.1,
        timestamp: new Date().toISOString(),
        xaiExplanation: 'Güçlü momentum ve pozitif sentiment birleşimi',
        shapValues: { rsi: 0.35, macd: 0.28, volume: 0.22, price_change: 0.18 },
        confluenceScore: 0.94,
        marketRegime: 'Risk-On',
        sentimentScore: 0.89,
        expectedReturn: 0.067,
        stopLoss: 138.50,
        takeProfit: 152.30
      }
    ];

    const mockMarketData: MarketData[] = [
      { symbol: 'THYAO', price: 325.50, change: 2.3, volume: 1500000, marketCap: 45000000000, sector: 'Havacılık', peRatio: 12.5, dividendYield: 2.8 },
      { symbol: 'ASELS', price: 88.40, change: -1.8, volume: 800000, marketCap: 18000000000, sector: 'Teknoloji', peRatio: 18.2, dividendYield: 1.5 },
      { symbol: 'TUPRS', price: 145.20, change: 3.1, volume: 1200000, marketCap: 25000000000, sector: 'Enerji', peRatio: 8.9, dividendYield: 4.2 },
      { symbol: 'SISE', price: 45.80, change: 1.2, volume: 900000, marketCap: 12000000000, sector: 'İnşaat', peRatio: 15.3, dividendYield: 3.1 },
      { symbol: 'EREGL', price: 67.30, change: -0.5, volume: 1100000, marketCap: 20000000000, sector: 'Enerji', peRatio: 11.7, dividendYield: 2.9 }
    ];

    setTimeout(() => {
      setSignals(mockSignals);
      setMarketData(mockMarketData);
      setIsLoading(false);
    }, 1000);
  }, []);

  const chartData = [
    { time: '09:00', price: 320 },
    { time: '10:00', price: 322 },
    { time: '11:00', price: 318 },
    { time: '12:00', price: 325 },
    { time: '13:00', price: 323 },
    { time: '14:00', price: 327 },
    { time: '15:00', price: 325 }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">BIST AI Smart Trader</h1>
            </div>
            <div className="flex items-center space-x-4">
              <BellIcon className="h-6 w-6 text-gray-400" />
              <Cog6ToothIcon className="h-6 w-6 text-gray-400" />
              <WatchlistDropdown />
              <div className="flex items-center space-x-2">
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              <ArrowRightOnRectangleIcon className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="space-y-4">
            {groupedTabs.map(section => (
              <div key={section.group}>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{section.group}</div>
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex flex-wrap gap-3">
                    {tabs.filter(t => (section.items as readonly string[]).includes(t.id)).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabId)}
                        className={`flex items-center space-x-2 py-2 px-2 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <tab.icon className="h-5 w-5" />
                        <span>{tab.name}</span>
                        {tab.id === 'godmode' && godMode && (
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        )}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Toplam Kar</p>
                    <p className="text-2xl font-bold text-green-600">+₺12,450</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Aktif Sinyaller</p>
                    <p className="text-2xl font-bold text-blue-600">{signals.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <ArrowTrendingUpIcon className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Doğruluk Oranı</p>
                    <p className="text-2xl font-bold text-purple-600">87.3%</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <ArrowTrendingDownIcon className="h-8 w-8 text-red-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Risk Skoru</p>
                    <p className="text-2xl font-bold text-red-600">Düşük</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <TradingSignals signals={signals} isLoading={isLoading} />
              <MarketOverview marketData={marketData} isLoading={isLoading} />
            </div>

            {/* Chart */}
            <div className="mt-8">
              <AdvancedCharts symbol="THYAO" isLoading={isLoading} />
            </div>
          </>
        )}

        {/* AI Sinyalleri Tab */}
        {activeTab === 'signals' && (
          <BistSignals />
        )}

        {/* Piyasa Tab */}
        {activeTab === 'market' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <MarketOverview marketData={marketData} isLoading={isLoading} />
            <LivePrices />
          </div>
        )}

        {/* Grafikler Tab */}
        {activeTab === 'charts' && (
          <AdvancedCharts symbol="THYAO" isLoading={isLoading} />
        )}

        {/* Seçmeki Formasyonları Tab */}
        {activeTab === 'seckme' && (
          <SeckmeFormations isLoading={isLoading} />
        )}

        {/* Gerçek Zamanlı Uyarılar Tab */}
        {activeTab === 'alerts' && (
          <RealTimeAlerts isLoading={isLoading} />
        )}

        {/* BIST 30 AI Tahminleri Tab */}
        {activeTab === 'bist30' && (
          <Bist30Predictions />
        )}

        {/* BIST 100 AI Tahminleri Tab */}
        {activeTab === 'bist100' && (
          <Bist100Predictions isLoading={isLoading} />
        )}

        {/* AI Tahmin Motoru Tab */}
        {activeTab === 'aiengine' && (
          <AIPredictionEngine isLoading={isLoading} />
        )}

        {/* Broker Entegrasyonu Tab */}
        {activeTab === 'brokers' && (
          <BrokerIntegration isLoading={isLoading} />
        )}

        {/* Kripto Trading Tab */}
        {activeTab === 'crypto' && (
          <CryptoTrading isLoading={isLoading} />
        )}

            {/* Opsiyon Analizi Tab */}
            {activeTab === 'options' && (
              <OptionsAnalysis isLoading={isLoading} />
            )}

            {/* İzleme Listesi Tab */}
            {activeTab === 'watchlist' && (
              <WatchlistManager isLoading={isLoading} />
            )}

            {/* Gelişmiş AI Tab */}
            {activeTab === 'advancedai' && (
              <AdvancedAIPredictions isLoading={isLoading} />
            )}

            {/* Formasyon Analizi Tab */}
            {activeTab === 'patterns' && (
              <PatternAnalysis isLoading={isLoading} />
            )}

        {activeTab === 'twin' && (
          <PredictiveTwin />
        )}

        {activeTab === 'risk' && (
          <RiskEngine />
        )}

        {activeTab === 'sim' && (
          <ScenarioSimulator />
        )}

        {activeTab === 'xai' && (
          <XAIExplain />
        )}

        {activeTab === 'ingest' && (
          <IngestionMonitor />
        )}

        {activeTab === 'adaptive' && (
          <AdaptiveUI />
        )}

        {activeTab === 'ticks' && (
          <TickInspector />
        )}

        {activeTab === 'sector' && (
          <SectorStrength />
        )}

        {activeTab === 'liquidity' && (
          <LiquidityHeatmap />
        )}

        {activeTab === 'events' && (
          <EventDrivenAI />
        )}

        {activeTab === 'anomaly' && (
          <AnomalyMomentum />
        )}

        {activeTab === 'arbitrage' && (
          <CrossMarketArbitrage />
        )}

        {activeTab === 'calibration' && (
          <CalibrationPanel />
        )}

        {activeTab === 'smart_notifications' && (
          <SmartNotifications />
        )}

        {activeTab === 'risk_mgmt' && (
          <RiskManagement />
        )}

        {activeTab === 'streaming' && (
          <LiveStreaming />
        )}

        {activeTab === 'patterns' && (
          <PatternRecognition />
        )}

        {activeTab === 'sentiment' && (
          <SentimentAnalysis />
        )}

        {activeTab === 'feedback' && (
          <FeedbackPanel />
        )}

            {/* Akıllı Bildirimler Tab */}
            {activeTab === 'notifications' && (
              <SmartNotifications isLoading={isLoading} />
            )}

            {/* Eğitim & Sosyal Tab */}
            {activeTab === 'education' && (
              <EducationSystem isLoading={isLoading} />
            )}

            {/* Doğruluk Optimizasyonu Tab */}
            {activeTab === 'accuracy' && (
              <UltraAccuracyOptimizer isLoading={isLoading} />
            )}

            {/* Deep Learning Tab */}
            {activeTab === 'deeplearning' && (
              <DeepLearningModels isLoading={isLoading} />
            )}

            {/* Ensemble Stratejileri Tab */}
            {activeTab === 'ensemble' && (
              <AdvancedEnsembleStrategies isLoading={isLoading} />
            )}

            {/* Piyasa Rejimi Tab */}
            {activeTab === 'regime' && (
              <MarketRegimeDetector isLoading={isLoading} />
            )}

            {/* God Mode Tab */}
            {activeTab === 'godmode' && (
              <GodModePanel isActive={godMode} onToggle={setGodMode} />
            )}
      </main>
    </div>
  );
}