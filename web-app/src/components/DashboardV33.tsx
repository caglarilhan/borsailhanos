"use client";

import React, { useState, useEffect, useMemo } from 'react';

// Force dynamic rendering - disables SSR to prevent hydration mismatches
export const dynamic = 'force-dynamic';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useWebSocket } from '@/hooks/useWebSocket';

// V5.0 Enterprise Components
import RiskManagementPanel from './V50/RiskManagementPanel';
import PortfolioOptimizer from './V50/PortfolioOptimizer';
import BacktestViewer from './V50/BacktestViewer';
import AIInsightSummary from './V50/AIInsightSummary';
import RealtimeAlerts from './V50/RealtimeAlerts';
import AIConfidenceMeter from './V50/AIConfidenceMeter';
import BacktestingPreview from './V50/BacktestingPreview';
import MultiTimeframeAnalyzer from './V50/MultiTimeframeAnalyzer';
import RiskAttribution from './V50/RiskAttribution';
import AINewsTrigger from './V50/AINewsTrigger';
import TraderGPTSidebar from './V50/TraderGPTSidebar';

// V6.0 Advanced Components
import TraderGPT from './V60/TraderGPT';
import GamificationSystem from './V60/GamificationSystem';
import AdvancedVisualizationHub from './V60/AdvancedVisualizationHub';
import AIConfidenceBreakdown from './V60/AIConfidenceBreakdown';
import CognitiveAI from './V60/CognitiveAI';
import FeedbackLoop from './V60/FeedbackLoop';
import VolatilityModel from './V60/VolatilityModel';
import MetaModelEngine from './V60/MetaModelEngine';
import SubscriptionTiers from './V60/SubscriptionTiers';
import StrategyBuilder from './V60/StrategyBuilder';
import InvestorPanel from './V60/InvestorPanel';

export default function DashboardV33() {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  const [visibleSignals, setVisibleSignals] = useState(5);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [portfolioData, setPortfolioData] = useState<any[]>([]);
  
  // Memoize initial chart data to prevent unnecessary re-renders
  const initialChartData = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      day: `Gün ${i + 1}`,
      actual: 240 + Math.random() * 20 - 10,
      predicted: 242 + i * 0.8 + Math.random() * 15 - 7,
      confidence: 85 + Math.random() * 10
    }))
  , []);

  const initialPortfolioData = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      day: `Gün ${i + 1}`,
      value: 100000 + i * 350 + Math.random() * 200 - 100,
      profit: i * 350
    }))
  , []);

  useEffect(() => {
    setMounted(true);
    // Initialize chart data after mount (prevents hydration error)
    setChartData(initialChartData);
    setPortfolioData(initialPortfolioData);
  }, [initialChartData, initialPortfolioData]);
  const [watchlist, setWatchlist] = useState<string[]>(['THYAO', 'AKBNK']);
  const [selectedForXAI, setSelectedForXAI] = useState<string | null>(null);
  const [portfolioValue, setPortfolioValue] = useState(100000); // Start with 100k
  const [portfolioStocks, setPortfolioStocks] = useState<{symbol: string, count: number}[]>([]);
  const [sentimentData, setSentimentData] = useState<any>(null);
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<{id: string, message: string, type: 'success' | 'info', timestamp: Date}[]>([]);
  const [portfolioRebalance, setPortfolioRebalance] = useState(false);
  const [aiLearning, setAiLearning] = useState({ accuracy: 87.3, recommendations: ['Portföy yoğunluğu: %40 THYAO', 'Risk düzeyi: Düşük', 'Son 7 gün: +12.5% kâr'] });
  const [selectedMarket, setSelectedMarket] = useState<'BIST' | 'NYSE' | 'NASDAQ'>('BIST');
  const [realtimeUpdates, setRealtimeUpdates] = useState({ signals: 0, risk: 0 });
  const [timeString, setTimeString] = useState<string>('');
  const [dynamicSignals, setDynamicSignals] = useState<any[]>([]); // WebSocket'ten gelen dinamik sinyaller
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null); // Bildirim tıklama için
  const [dynamicSummary, setDynamicSummary] = useState<string>(''); // AI Summary
  const [sectorStats, setSectorStats] = useState<any>(null); // Sektör İstatistikleri
  
  // Time update effect - hydration-safe
  useEffect(() => {
    if (mounted) {
      setTimeString(lastUpdate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
    }
  }, [mounted, lastUpdate]);
  const [showV50Module, setShowV50Module] = useState(false);
  const [v50ActiveTab, setV50ActiveTab] = useState<'risk' | 'portfolio' | 'backtest'>('risk');
  const [showTraderGPT, setShowTraderGPT] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [showAdvancedViz, setShowAdvancedViz] = useState(false);
  const [showAIConfidence, setShowAIConfidence] = useState(false);
  const [showCognitiveAI, setShowCognitiveAI] = useState(false);
  const [showFeedbackLoop, setShowFeedbackLoop] = useState(false);
  const [showVolatilityModel, setShowVolatilityModel] = useState(false);
  const [showMetaModel, setShowMetaModel] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showStrategyBuilder, setShowStrategyBuilder] = useState(false);
  const [showInvestorPanel, setShowInvestorPanel] = useState(false);
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterAccuracy, setFilterAccuracy] = useState<number | null>(null);
  
  // Button Handlers
  const handleWatchlistClick = () => {
    setShowWatchlist(!showWatchlist);
    console.log('📋 Watchlist toggled');
  };
  
  const handleAdminClick = () => {
    setShowAdmin(!showAdmin);
    console.log('⚙️ Admin panel toggled');
  };
  
  const handleFilterClick = () => {
    setShowFilter(!showFilter);
    console.log('🔍 Filter toggled');
  };
  
  const handleHighAccuracyFilter = () => {
    setFilterAccuracy(80);
    console.log('✅ High accuracy filter applied');
  };
  
  const handlePortfolioRebalance = async () => {
    setPortfolioRebalance(true);
    console.log('🔄 Portfolio rebalancing...');
    // Simulate API call
    setTimeout(() => {
      setPortfolioRebalance(false);
      console.log('✅ Portfolio rebalanced');
    }, 2000);
  };
  
  const handleShare = async () => {
    const data = {
      title: 'BIST AI Smart Trader',
      text: `AI doğruluk: ${metrics[0].value}`,
      url: window.location.href
    };
    
    if (navigator.share) {
      await navigator.share(data);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link kopyalandı!');
    }
  };
  
  const handleFeedback = () => {
    alert('💬 Geri bildirim formu açılacak...');
  };
  
  // ✅ NOTIFICATION CLICK HANDLER: Bildirim tıklandığında sembol seç, detay göster, tabloya scroll yap
  const handleNotificationClick = (alert: any) => {
    // Bildirim mesajından sembolü çıkar (örn: "🔔 THYAO: BUY sinyali...")
    const symbolMatch = alert.message.match(/([A-Z]{2,6}):/);
    if (symbolMatch && symbolMatch[1]) {
      const symbol = symbolMatch[1];
      setSelectedSymbol(symbol);
      // İlgili satırı bul ve highlight yap
      const signal = signals.find((s: any) => s.symbol === symbol);
      if (signal) {
        console.log(`📊 ${symbol} detay analizi açılıyor...`, signal);
        
        // ✅ SMART SCROLL: Sembol satırına scroll yap
        setTimeout(() => {
          const element = document.getElementById(`signal-row-${symbol}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight efekti
            element.style.backgroundColor = 'rgba(245,158,11,0.2)';
            setTimeout(() => {
              element.style.backgroundColor = '';
            }, 2000);
          }
        }, 100);
      }
    }
  };
  
  // WebSocket connection for realtime data - SAFE
  const [wsUrl, setWsUrl] = useState<string>('');
  const [shouldConnectWS, setShouldConnectWS] = useState(false);
  
  useEffect(() => {
    // Set WebSocket URL after mount to prevent SSR issues
    if (typeof window !== 'undefined') {
      const url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws';
      console.log('🔗 WebSocket URL:', url);
      setWsUrl(url);
      setShouldConnectWS(true);
    }
  }, []);
  
  const { connected, error, lastMessage } = useWebSocket({
    url: shouldConnectWS ? wsUrl : '', // Empty URL prevents connection
    maxReconnectAttempts: 5, // Limit retry attempts to 5
    onMessage: (data) => {
      if (!data) return;
      console.log('📊 Realtime data received:', data);
      
      // ✅ COMPREHENSIVE UPDATE: signals + summary + sectors + portfolio
      if (data && typeof data === 'object') {
        // 1. Signals update
        if (data.signals && Array.isArray(data.signals) && data.signals.length > 0) {
          setDynamicSignals(data.signals);
          setRealtimeUpdates(prev => ({
            signals: prev.signals + 1,
            risk: prev.risk
          }));
          
          // Add alerts for new signals
          data.signals.forEach((signal: any) => {
            if (signal && typeof signal === 'object' && signal.symbol && typeof signal.symbol === 'string') {
              setAlerts(prev => [...prev, {
                id: `signal-${Date.now()}-${signal.symbol}`,
                message: `🔔 ${signal.symbol}: ${signal.signal || 'UPDATE'} sinyali (Güven: ${signal.confidence ? (signal.confidence * 100).toFixed(0) : '--'}%)`,
                type: 'success',
                timestamp: new Date()
              }]);
            }
          });
        }
        
        // 2. AI Summary update
        if (data.summary && typeof data.summary === 'string') {
          setDynamicSummary(data.summary);
          console.log('📝 AI Summary update:', data.summary);
        }
        
        // 3. Sector stats update
        if (data.sectorStats && typeof data.sectorStats === 'object') {
          setSectorStats(data.sectorStats);
          console.log('📊 Sector stats update:', data.sectorStats);
        }
      }
    }
  });
  
  // Initialize sentiment data
  useEffect(() => {
    setSentimentData([
      { symbol: 'THYAO', sentiment: 82, positive: 68, negative: 18, neutral: 14, sources: ['Bloomberg HT', 'Anadolu Ajansı', 'Hürriyet'] },
      { symbol: 'AKBNK', sentiment: 75, positive: 56, negative: 24, neutral: 20, sources: ['Şebnem Turhan', 'Para Dergisi'] },
      { symbol: 'EREGL', sentiment: 88, positive: 72, negative: 10, neutral: 18, sources: ['KAP', 'Dünya'] },
      { symbol: 'TUPRS', sentiment: 45, positive: 28, negative: 52, neutral: 20, sources: ['Bloomberg', 'Haberler.com'] },
    ]);
  }, []);
  
  // Realtime Data Fetch Simulation (15s interval)
  useEffect(() => {
    const realtimeInterval = setInterval(() => {
      // Simulate realtime updates
      setRealtimeUpdates(prev => ({
        signals: prev.signals + Math.floor(Math.random() * 2),
        risk: Math.random() * 0.5 - 0.25 // -0.25 to +0.25 change
      }));
      
      // Add alert for new signal
      if (Math.random() > 0.7) {
        const newSymbol = ['AAPL', 'THYAO', 'NVDA', 'MSFT'][Math.floor(Math.random() * 4)];
        setAlerts(prev => [...prev, {
          id: `realtime-${Date.now()}`,
          message: `🔔 Yeni sinyal: ${newSymbol} - AI analizi güncellendi`,
          type: 'success',
          timestamp: new Date()
        }]);
      }
    }, 15000); // 15 seconds
    
    return () => clearInterval(realtimeInterval);
  }, []);
  
  // ✅ Portfolio Chart Dynamic Update: Yeni sinyaller geldiğinde grafiği güncelle
  useEffect(() => {
    if (dynamicSignals.length > 0 && signals.length > 0) {
      // Gelen sinyallerden portfolio değerini hesapla
      const newValue = portfolioValue + Math.random() * 1000 - 500;
      const newData = [...portfolioData, {
        day: `Gün ${portfolioData.length + 1}`,
        value: newValue,
        profit: (newValue - 100000)
      }];
      
      // Son 30 noktayı tut
      setPortfolioData(newData.slice(-30));
      setPortfolioValue(newValue);
    }
  }, [dynamicSignals]);
  
  // Event-Driven AI - Bilanço takvimi
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    
    // Her saat başı kontrol et (simülasyon)
    if (hour % 6 === 0) {
      const upcomingEvents = [
        { symbol: 'THYAO', event: 'Bilanço', date: '2024-02-15', type: 'positive', impact: 'Yüksek' },
        { symbol: 'TUPRS', event: 'GMK', date: '2024-02-12', type: 'neutral', impact: 'Orta' },
        { symbol: 'AKBNK', event: 'Faiz Kararı', date: '2024-02-20', type: 'positive', impact: 'Çok Yüksek' },
      ];
      
      upcomingEvents.forEach(event => {
        const alertId = `event-${event.symbol}-${Date.now()}`;
        if (!alerts.find(a => a.id.includes(`event-${event.symbol}`))) {
          setAlerts(prev => [...prev, { 
            id: alertId,
            message: `📅 ${event.symbol}: ${event.event} (${event.date}) - ${event.impact} etkisi`,
            type: 'info',
            timestamp: new Date()
          }]);
        }
      });
    }
  }, []);
  
  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      setTimeout(() => {
        setLastUpdate(new Date());
        setIsRefreshing(false);
      }, 1000);
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Risk Engine Update Cron (10 min)
  // Risk engine update simulation removed - not used
  
  // FinBERT Sentiment Update Cron (10 min) - DISABLED to prevent infinite loop
  // Sentiment data is now static to avoid re-render loops
  useEffect(() => {
    // Disabled: setSentimentData updates were causing infinite render loop
    // Sentiment data is initialized once and remains static
  }, []);
  
  // Sector Heatmap Data with sub-sectors
  const sectors = [
    { name: 'Sanayi', change: 2.3, color: '#10b981', subSectors: [{ name: 'Makine', change: 3.2 }, { name: 'Enerji', change: 1.5 }] },
    { name: 'Bankacılık', change: -1.4, color: '#ef4444', subSectors: [{ name: 'Mevduat', change: -0.8 }, { name: 'Yatırım', change: -2.1 }] },
    { name: 'Teknoloji', change: 3.8, color: '#10b981', subSectors: [{ name: 'Yazılım', change: 4.5 }, { name: 'Donanım', change: 2.8 }] },
    { name: 'İnşaat', change: 1.2, color: '#10b981', subSectors: [{ name: 'Rezidans', change: 0.8 }, { name: 'Ticari', change: 1.9 }] },
    { name: 'Gıda', change: -0.8, color: '#ef4444', subSectors: [{ name: 'Perakende', change: 0.5 }, { name: 'Üretim', change: -1.8 }] },
    { name: 'Otomotiv', change: 2.1, color: '#10b981', subSectors: [{ name: 'Otomobil', change: 2.8 }, { name: 'Yedek Parça', change: 1.2 }] },
  ];
  
  // AI Confidence Breakdown (SHAP-like explanation) - Multi-market
  const aiConfidence: Record<string, { factors: { name: string, contribution: number, positive: boolean }[] }> = {
    'THYAO': { factors: [{ name: 'RSI Momentum', contribution: 35, positive: true }, { name: 'Volume Surge', contribution: 30, positive: true }, { name: 'MACD Cross', contribution: 25, positive: true }, { name: 'Support Level', contribution: 10, positive: true }] },
    'TUPRS': { factors: [{ name: 'Resistance Zone', contribution: -40, positive: false }, { name: 'Volume Decrease', contribution: -30, positive: false }, { name: 'Bearish Pattern', contribution: -20, positive: false }, { name: 'Market Stress', contribution: -10, positive: false }] },
    'AAPL': { factors: [{ name: 'AI Chip Demand', contribution: 40, positive: true }, { name: 'iPhone Sales', contribution: 25, positive: true }, { name: 'Services Growth', contribution: 20, positive: true }, { name: 'Market Cap', contribution: 15, positive: true }] },
    'NVDA': { factors: [{ name: 'GPU Demand', contribution: 45, positive: true }, { name: 'AI Infrastructure', contribution: 30, positive: true }, { name: 'Data Center', contribution: 15, positive: true }, { name: 'Automotive', contribution: 10, positive: true }] },
  };
  
  // Correlation Matrix
  const correlationMatrix = [
    { stock1: 'THYAO', stock2: 'AKBNK', correlation: 0.72 },
    { stock1: 'THYAO', stock2: 'EREGL', correlation: 0.68 },
    { stock1: 'AKBNK', stock2: 'GARAN', correlation: 0.85 },
    { stock1: 'EREGL', stock2: 'SISE', correlation: 0.86 },
  ];
  
  // FinBERT Türkçe Sentiment Data (from state)
  const sentimentAnalysis = sentimentData || [];
  
  // @ts-ignore
  const sentimentChartData = sentimentAnalysis.map((s: any, i: number) => ({
    symbol: s.symbol,
    positive: s.positive,
    negative: s.negative,
    neutral: s.neutral,
  }));

  const allFeatures = {
    signals: [
      'AI Sinyalleri', 'BIST 30 AI Tahminleri', 'BIST 100 AI Tahminleri', 
      'Gelişmiş Analiz', 'Sinyal Takip', 'Gelişmiş Grafikler', 
      'BIST Veri Paneli', 'Anomali+Momentum', 'Arbitraj İpuçları'
    ],
    analysis: [
      'Piyasa Analizi', 'Grafikler', 'Formasyon Analizi', 'Predictive Twin',
      'XAI Explain', 'Sektör Güç', 'Likidite Heatmap', 'Event-Driven AI',
      'Makro Ekonomik', 'Temel Analiz'
    ],
    operations: [
      'Gerçek Zamanlı Uyarılar', 'İzleme Listesi', 'Risk Engine', 'Scenario Simulator',
      'Portföy Optimizasyonu', 'Tick Inspector', 'Smart Notifications', 'Adaptive UI'
    ],
    advanced: [
      'AI Tahmin Motoru', 'Broker Entegrasyonu', 'Kripto Trading', 'Opsiyon Analizi',
      'Algo Trading', 'Gelişmiş AI', 'Kalibrasyon', 'Eğitim & Sosyal',
      'Doğruluk Optimizasyonu', 'Deep Learning', 'Ensemble Stratejileri', 'Piyasa Rejimi', 'God Mode'
    ],
  };

  // Multi-market signals data
  const marketSignals = {
    'BIST': [
      { symbol: 'THYAO', signal: 'BUY', price: 245.50, target: 268.30, change: 9.3, comment: 'Güçlü teknik formasyon ve pozitif momentum', accuracy: 89.2 },
      { symbol: 'TUPRS', signal: 'SELL', price: 180.30, target: 165.20, change: -8.4, comment: 'Direnç seviyesinde satış baskısı', accuracy: 76.5 },
      { symbol: 'ASELS', signal: 'HOLD', price: 48.20, target: 49.10, change: 1.9, comment: 'Piyasa belirsizliği - bekleme', accuracy: 81.3 },
      { symbol: 'EREGL', signal: 'BUY', price: 55.80, target: 62.40, change: 11.8, comment: 'Yükseliş formasyonu tespit edildi', accuracy: 88.7 },
      { symbol: 'SISE', signal: 'BUY', price: 32.50, target: 36.80, change: 13.2, comment: 'Ters başlı omuz formasyonu', accuracy: 91.5 },
      { symbol: 'GARAN', signal: 'BUY', price: 185.40, target: 228.20, change: 23.1, comment: 'Güçlü kırılım ve yukarı trend', accuracy: 92.3 },
      { symbol: 'AKBNK', signal: 'BUY', price: 162.80, target: 198.60, change: 22.0, comment: 'Pozitif hacim sinyalleri', accuracy: 91.8 },
    ],
    'NYSE': [
      { symbol: 'AAPL', signal: 'BUY', price: 185.20, target: 195.80, change: 5.7, comment: 'Strong technical breakout, high volume', accuracy: 89.5 },
      { symbol: 'MSFT', signal: 'BUY', price: 420.50, target: 438.30, change: 4.2, comment: 'AI infrastructure momentum', accuracy: 92.1 },
      { symbol: 'JPM', signal: 'HOLD', price: 178.40, target: 180.10, change: 1.0, comment: 'Rate decision pending', accuracy: 78.3 },
      { symbol: 'BAC', signal: 'BUY', price: 38.60, target: 41.80, change: 8.3, comment: 'Banking sector recovery', accuracy: 85.2 },
      { symbol: 'WMT', signal: 'SELL', price: 165.30, target: 155.20, change: -6.1, comment: 'Resistance level rejection', accuracy: 82.7 },
      { symbol: 'DIS', signal: 'BUY', price: 112.80, target: 122.40, change: 8.5, comment: 'Content monetization growth', accuracy: 88.9 },
      { symbol: 'CVX', signal: 'BUY', price: 152.60, target: 165.20, change: 8.3, comment: 'Energy sector bullish trend', accuracy: 86.4 },
    ],
    'NASDAQ': [
      { symbol: 'GOOGL', signal: 'BUY', price: 145.80, target: 155.30, change: 6.5, comment: 'Search dominance + AI integration', accuracy: 91.2 },
      { symbol: 'AMZN', signal: 'BUY', price: 178.40, target: 192.80, change: 8.1, comment: 'AWS growth and retail recovery', accuracy: 93.5 },
      { symbol: 'META', signal: 'BUY', price: 485.20, target: 520.40, change: 7.3, comment: 'Reels monetization + Metaverse', accuracy: 90.8 },
      { symbol: 'NVDA', signal: 'BUY', price: 895.50, target: 950.30, change: 6.1, comment: 'AI chip demand surge', accuracy: 94.2 },
      { symbol: 'TSLA', signal: 'HOLD', price: 248.60, target: 252.40, change: 1.5, comment: 'Elon factor + production delays', accuracy: 75.8 },
      { symbol: 'ADBE', signal: 'BUY', price: 612.80, target: 650.20, change: 6.1, comment: 'Creative Cloud expansion', accuracy: 88.7 },
      { symbol: 'NFLX', signal: 'BUY', price: 485.30, target: 515.60, change: 6.2, comment: 'Subscriber growth + price hikes', accuracy: 87.3 },
    ],
  };
  
  // ✅ DYNAMIC SIGNALS: WebSocket'ten gelirse kullan, yoksa fallback
  const signals = dynamicSignals.length > 0 ? dynamicSignals : marketSignals[selectedMarket];

  const metrics = [
    { label: 'Toplam Kâr', value: '₺125.000', change: '+12.5%', color: '#10b981', icon: '💰', pulse: true },
    { label: 'Aktif Sinyaller', value: '15', change: '+3 yeni', color: '#3b82f6', icon: '🎯', pulse: true },
    { label: 'Doğruluk Oranı', value: '87.3%', change: '+2.1%', color: '#10b981', icon: '📊', pulse: false },
    { label: 'Risk Skoru', value: '3.2', change: '▼ Düşük', color: '#10b981', icon: '⚠️', pulse: false },
  ];

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(to bottom, #ffffff, #f0f9ff, #e0f2fe)', 
        color: '#0f172a',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}>
      {/* Header - Compact */}
      <header style={{ 
        background: 'rgba(255,255,255,0.95)', 
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(6,182,212,0.2)', 
        padding: '12px 32px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 20px rgba(0,0,0,0.08)'
      }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 20px rgba(6,182,212,0.3)' }}>AI</div>
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: '#0f172a', letterSpacing: '-0.3px', lineHeight: '1.2' }}>
                BIST AI Smart Trader <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>v4.6 Pro</span>
              </h1>
              <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                {isRefreshing ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#06b6d4' }}>
                    <div style={{ width: '6px', height: '6px', background: '#06b6d4', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
                    Güncelleniyor...
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }} suppressHydrationWarning>
                    <div style={{ width: '6px', height: '6px', background: connected ? '#10b981' : '#ef4444', borderRadius: '50%', animation: connected ? 'pulse 2s infinite' : 'none' }}></div>
                    {connected ? 'Canlı' : 'Offline'} • {mounted ? timeString : '--:--'} • İzleme: {watchlist.join(', ')}
                    {realtimeUpdates.signals > 0 && (
                      <span style={{ fontSize: '10px', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: '6px', fontWeight: '600', color: '#10b981' }}>
                        +{realtimeUpdates.signals}
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setShowTraderGPT(!showTraderGPT)}
              style={{ 
                padding: '8px 16px', 
                background: showTraderGPT ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f59e0b, #f97316)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '11px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
                transition: 'all 0.2s',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }} 
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} 
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              aria-label="TraderGPT ile konuş"
            >
              <span aria-hidden="true">🤖</span> GPT
            </button>
            <button 
              onClick={() => setShowAdvancedViz(!showAdvancedViz)}
              style={{ 
                padding: '8px 16px', 
                background: showAdvancedViz ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)' : 'linear-gradient(135deg, #8b5cf6, #a855f7)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '11px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(139,92,246,0.3)',
                transition: 'all 0.2s',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} 
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              aria-label="Gelişmiş görselleştirme hub"
            >
              <span aria-hidden="true">📊</span> Viz
            </button>
            <button 
              onClick={() => setShowAIConfidence(!showAIConfidence)}
              style={{ 
                padding: '8px 14px', 
                background: showAIConfidence ? 'linear-gradient(135deg, #ec4899, #06b6d4)' : 'linear-gradient(135deg, #ec4899, #a855f7)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '11px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(236,72,153,0.3)',
                transition: 'all 0.2s',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} 
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              aria-label="AI güven açıklama"
            >
              <span aria-hidden="true">🧠</span> AI
            </button>
            <button 
              onClick={() => setShowCognitiveAI(!showCognitiveAI)}
              style={{ 
                padding: '8px 14px', 
                background: showCognitiveAI ? 'linear-gradient(135deg, #06b6d4, #ec4899)' : 'linear-gradient(135deg, #10b981, #059669)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '11px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(16,185,129,0.4)',
                transition: 'all 0.2s',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} 
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              aria-label="Cognitive AI yorumlar"
            >
              💬 AI Yorum
            </button>
            <button 
              onClick={() => setShowVolatilityModel(!showVolatilityModel)}
              style={{ 
                padding: '8px 14px', 
                background: showVolatilityModel ? 'linear-gradient(135deg, #f97316, #ef4444)' : 'linear-gradient(135deg, #f97316, #f59e0b)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '11px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(249,115,22,0.4)',
                transition: 'all 0.2s',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} 
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              aria-label="Volatilite modeli"
            >
              📈 Risk Model
            </button>
            <button 
              onClick={() => setShowMetaModel(!showMetaModel)}
              style={{ 
                padding: '8px 14px', 
                background: showMetaModel ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : 'linear-gradient(135deg, #ec4899, #a855f7)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '11px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(236,72,153,0.4)',
                transition: 'all 0.2s',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} 
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              aria-label="Meta-Model Engine"
            >
              🧠 Meta-Model
            </button>
            <button 
              onClick={() => setShowSubscription(!showSubscription)}
              style={{ 
                padding: '8px 14px', 
                background: showSubscription ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'linear-gradient(135deg, #fbbf24, #d97706)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '11px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(251,191,36,0.4)',
                transition: 'all 0.2s',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} 
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              aria-label="Abonelik planları"
            >
              💎 Planlar
            </button>
            <button 
              onClick={() => setShowStrategyBuilder(!showStrategyBuilder)}
              style={{ 
                padding: '8px 14px', 
                background: showStrategyBuilder ? 'linear-gradient(135deg, #10b981, #06b6d4)' : 'linear-gradient(135deg, #10b981, #059669)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '11px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(16,185,129,0.4)',
                transition: 'all 0.2s',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} 
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              aria-label="Strateji oluştur"
            >
              🎯 Strateji Oluştur
            </button>
            <button 
              onClick={() => setShowInvestorPanel(!showInvestorPanel)}
              style={{ 
                padding: '8px 14px', 
                background: showInvestorPanel ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)' : 'linear-gradient(135deg, #8b5cf6, #a855f7)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '11px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(139,92,246,0.4)',
                transition: 'all 0.2s',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} 
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              aria-label="AI Yatırımcı Analizi"
            >
              🎯 AI Yatırımcı
            </button>
            <button 
              onClick={handleWatchlistClick}
              style={{ 
                padding: '8px 14px', 
                background: showWatchlist ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #06b6d4, #3b82f6)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '11px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(6,182,212,0.3)',
                transition: 'all 0.2s',
                outline: 'none'
              }} 
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} 
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              aria-label="İzleme listesini aç"
            >
              <span aria-hidden="true">📋</span> Watchlist
            </button>
            <button 
              onClick={handleAdminClick}
              style={{ 
                padding: '8px 14px', 
                background: showAdmin ? '#333' : '#000', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none'
              }} 
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} 
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              aria-label="Admin paneline git"
            >
              <span aria-hidden="true">⚙️</span> Admin
            </button>
            <button 
              style={{ 
                padding: '8px 14px', 
                background: showV50Module ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(139,92,246,0.4)',
              }} 
              onClick={() => setShowV50Module(!showV50Module)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} 
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              aria-label="V5.0 Enterprise modülünü aç"
            >
              {showV50Module ? 'V5.0 ✨' : 'V5.0 Enterprise'}
            </button>
        </div>
        </div>
      </header>

      <main style={{ padding: '12px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* Metrics - Compact */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
          {metrics.map((m, idx) => (
            <div key={m.label} style={{ 
              background: 'rgba(255,255,255,0.75)', 
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(6,182,212,0.25)', 
              borderRadius: '12px', 
              padding: '14px',
              boxShadow: '0 3px 12px rgba(6,182,212,0.12)',
              transition: 'all 0.3s ease',
              position: 'relative'
            }} onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(6,182,212,0.15)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 3px 12px rgba(6,182,212,0.12)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.75)';
            }}>
              <div style={{ fontSize: '16px', marginBottom: '4px', lineHeight: '1' }}>{m.icon}</div>
              <div style={{ fontSize: '9px', color: '#475569', marginBottom: '6px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{m.label}</div>
              <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px', color: '#0f172a', lineHeight: '1.1', animation: m.pulse ? 'pulse 2s ease-in-out infinite' : 'none', letterSpacing: '-0.3px' }}>{m.value}</div>
              <div style={{ fontSize: '10px', color: m.color, fontWeight: '800' }}>{m.change}</div>
            </div>
          ))}
        </div>

        {/* AI Insight Summary - Metrics altına eklendi */}
        <div style={{ 
          marginBottom: '16px',
          padding: '12px',
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(6,182,212,0.3)',
          borderRadius: '20px',
          boxShadow: '0 10px 50px rgba(6,182,212,0.15)'
        }}>
          <AIInsightSummary />
        </div>
        
        {/* Sector Heatmap */}
        <div style={{ 
          marginBottom: '16px',
          background: 'rgba(255,255,255,0.8)', 
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(6,182,212,0.3)', 
          borderRadius: '20px', 
          overflow: 'hidden',
          boxShadow: '0 10px 50px rgba(6,182,212,0.15)'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(6,182,212,0.1)', background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(255,255,255,0.8))' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, marginBottom: '12px', color: '#0f172a', letterSpacing: '-0.5px' }}>📊 Sektör Isı Haritası</h2>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>Piyasa geneli sektörel performans analizi</div>
          </div>
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {sectors.map((sector, idx) => (
              <div key={idx} style={{ 
                background: sector.change > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `2px solid ${sector.color}40`,
                borderRadius: '16px', 
                padding: '12px',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }} onMouseEnter={(e) => {
                setHoveredSector(sector.name);
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = `0 12px 40px ${sector.color}40`;
              }} onMouseLeave={(e) => {
                setHoveredSector(null);
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '14px', color: '#0f172a', letterSpacing: '-0.3px' }}>{sector.name}</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: sector.color, lineHeight: '1', textShadow: `0 2px 8px ${sector.color}30` }}>
                  {sector.change > 0 ? '↑' : '↓'} {Math.abs(sector.change)}%
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '10px', fontWeight: '600' }}>
                  {sector.change > 0 ? 'Yükseliş trendi ↗' : 'Düşüş trendi ↘'}
                </div>
                {hoveredSector === sector.name && sector.subSectors && (
                  <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.8)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px' }}>Alt Sektörler:</div>
                    {sector.subSectors.map((sub, subIdx) => (
                      <div key={subIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '6px' }}>
                        <span style={{ color: '#0f172a' }}>{sub.name}</span>
                        <span style={{ fontWeight: 'bold', color: sub.change > 0 ? '#10b981' : '#ef4444' }}>
                          {sub.change > 0 ? '+' : ''}{sub.change}%
        </span>
      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ALL FEATURES BY CATEGORY */}
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#0f172a', letterSpacing: '-0.5px' }}>Tüm Özellikler</h2>
          
          {/* SINYALLER */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: '900', marginBottom: '12px', paddingBottom: '8px', borderBottom: '2px solid #06b6d4', color: '#0f172a', letterSpacing: '-0.3px' }}>
              📊 SINYALLER <span style={{ fontSize: '11px', color: '#06b6d4', fontWeight: '600' }}>(9 özellik)</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {allFeatures.signals.map((f, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(255,255,255,0.8)', 
                  backdropFilter: 'blur(12px)',
                  border: '2px solid rgba(6,182,212,0.25)', 
                  borderRadius: '12px', 
                  padding: '16px', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 8px rgba(6,182,212,0.08)'
                }} onClick={() => {
                  alert(`🚀 ${f} özelliği açılıyor...`);
                  // İlgili panel state'ini aç
                  if (f.includes('AI Sinyaller')) setShowTraderGPT(true);
                  else if (f.includes('Portföy')) setShowV50Module(true);
                  else if (f.includes('Görselleştirme')) setShowAdvancedViz(true);
                }} onMouseEnter={(e) => { 
                  setHoveredFeature(f);
                  e.currentTarget.style.borderColor = '#06b6d4'; 
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(6,182,212,0.25)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }} onMouseLeave={(e) => { 
                  setHoveredFeature(null);
                  e.currentTarget.style.borderColor = 'rgba(6,182,212,0.25)'; 
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(6,182,212,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0f172a', letterSpacing: '-0.2px' }}>{f}</div>
                </div>
        ))}
      </div>
          </div>

          {/* ANALIZ */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: '900', marginBottom: '12px', paddingBottom: '8px', borderBottom: '2px solid #3b82f6', color: '#0f172a', letterSpacing: '-0.3px' }}>
              📈 ANALIZ <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '600' }}>(10 özellik)</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
              {allFeatures.analysis.map((f, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(255,255,255,0.8)', 
                  backdropFilter: 'blur(12px)',
                  border: '2px solid rgba(59,130,246,0.25)', 
                  borderRadius: '16px', 
                  padding: '16px', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.08)'
                }} onMouseEnter={(e) => { 
                  setHoveredFeature(f);
                  e.currentTarget.style.borderColor = '#3b82f6'; 
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(59,130,246,0.25)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }} onMouseLeave={(e) => { 
                  setHoveredFeature(null);
                  e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'; 
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(59,130,246,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0f172a', letterSpacing: '-0.2px' }}>{f}</div>
                </div>
              ))}
            </div>
          </div>

          {/* OPERASYON */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: '900', marginBottom: '12px', paddingBottom: '8px', borderBottom: '2px solid #10b981', color: '#0f172a', letterSpacing: '-0.3px' }}>
              🔧 OPERASYON <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '600' }}>(8 özellik)</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
              {allFeatures.operations.map((f, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(255,255,255,0.8)', 
                  backdropFilter: 'blur(12px)',
                  border: '2px solid rgba(16,185,129,0.25)', 
                  borderRadius: '16px', 
                  padding: '16px', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 8px rgba(16,185,129,0.08)'
                }} onMouseEnter={(e) => { 
                  setHoveredFeature(f);
                  e.currentTarget.style.borderColor = '#10b981'; 
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(16,185,129,0.25)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }} onMouseLeave={(e) => { 
                  setHoveredFeature(null);
                  e.currentTarget.style.borderColor = 'rgba(16,185,129,0.25)'; 
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(16,185,129,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0f172a', letterSpacing: '-0.2px' }}>{f}</div>
                </div>
              ))}
            </div>
          </div>

          {/* GELIŞMİŞ */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: '900', marginBottom: '12px', paddingBottom: '8px', borderBottom: '2px solid #8b5cf6', color: '#0f172a', letterSpacing: '-0.3px' }}>
              ⚡ GELIŞMİŞ <span style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: '600' }}>(13 özellik)</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
              {allFeatures.advanced.map((f, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(255,255,255,0.8)', 
                  backdropFilter: 'blur(12px)',
                  border: '2px solid rgba(139,92,246,0.25)', 
                  borderRadius: '16px', 
                  padding: '16px', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 8px rgba(139,92,246,0.08)'
                }} onMouseEnter={(e) => { 
                  setHoveredFeature(f);
                  e.currentTarget.style.borderColor = '#8b5cf6'; 
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(139,92,246,0.25)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }} onMouseLeave={(e) => { 
                  setHoveredFeature(null);
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'; 
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(139,92,246,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0f172a', letterSpacing: '-0.2px' }}>{f}</div>
                </div>
              ))}
            </div>
          </div>
          </div>

        {/* AI Signals Table */}
        <div style={{ 
          background: 'rgba(255,255,255,0.8)', 
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(6,182,212,0.3)', 
          borderRadius: '20px', 
          overflow: 'hidden',
          boxShadow: '0 10px 50px rgba(6,182,212,0.15)'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(6,182,212,0.1)', background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(255,255,255,0.8))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#0f172a', letterSpacing: '-0.5px' }}>AI Sinyalleri</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                {(['BIST', 'NYSE', 'NASDAQ'] as const).map((market) => (
                  <button
                    key={market}
                    onClick={() => setSelectedMarket(market)}
                    style={{
                      padding: '10px 20px',
                      background: selectedMarket === market ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'rgba(255,255,255,0.8)',
                      color: selectedMarket === market ? '#fff' : '#0f172a',
                      border: selectedMarket === market ? 'none' : '2px solid rgba(6,182,212,0.3)',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      outline: 'none',
                      boxShadow: selectedMarket === market ? '0 6px 20px rgba(6,182,212,0.4)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedMarket !== market) {
                        e.currentTarget.style.borderColor = '#06b6d4';
                        e.currentTarget.style.background = 'rgba(6,182,212,0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedMarket !== market) {
                        e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.8)';
                      }
                    }}
                    aria-label={`${market} borsası sinyalleri`}
                  >
                    {market === 'BIST' ? '🇹🇷' : market === 'NYSE' ? '🇺🇸' : '🇺🇸'} {market}
            </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setShowFilter(!showFilter)}
                style={{ 
                  padding: '8px 16px', 
                  background: showFilter ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #06b6d4, #3b82f6)', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontSize: '11px', 
                  fontWeight: '700', 
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(6,182,212,0.3)',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                aria-label="Sinyal filtrelerini aç"
              >
                <span aria-hidden="true">🔽</span> Filtrele
            </button>
              <button 
                onClick={handleHighAccuracyFilter}
                style={{ 
                  padding: '8px 16px', 
                  background: filterAccuracy === 80 ? '#06b6d4' : '#fff', 
                  color: filterAccuracy === 80 ? '#fff' : '#000', 
                  border: '2px solid rgba(6,182,212,0.3)', 
                  borderRadius: '8px', 
                  fontSize: '11px', 
                  fontWeight: '700', 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none'
                }} 
                onMouseEnter={(e) => { if (filterAccuracy !== 80) { e.currentTarget.style.borderColor = '#06b6d4'; e.currentTarget.style.background = 'rgba(6,182,212,0.05)'; }}} 
                onMouseLeave={(e) => { if (filterAccuracy !== 80) { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'; e.currentTarget.style.background = '#fff'; } }}
                aria-label="Yüzde 80 üstü doğruluk filtrele"
              >
                %80+ Doğruluk
            </button>
          </div>
        </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'rgba(240,249,255,0.8)' }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '800', color: '#475569', borderBottom: '3px solid rgba(6,182,212,0.3)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Sembol</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '800', color: '#475569', borderBottom: '3px solid rgba(6,182,212,0.3)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Sinyal</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '800', color: '#475569', borderBottom: '3px solid rgba(6,182,212,0.3)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Mevcut Fiyat</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '800', color: '#475569', borderBottom: '3px solid rgba(6,182,212,0.3)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Beklenen Fiyat</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '800', color: '#475569', borderBottom: '3px solid rgba(6,182,212,0.3)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Değişim</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '800', color: '#475569', borderBottom: '3px solid rgba(6,182,212,0.3)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>AI Yorumu</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '800', color: '#475569', borderBottom: '3px solid rgba(6,182,212,0.3)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Doğruluk</th>
                </tr>
              </thead>
              <tbody>
                {signals.slice(0, visibleSignals).map((s, idx) => (
                  <tr key={idx} id={`signal-row-${s.symbol}`} style={{ borderBottom: '1px solid rgba(6,182,212,0.08)', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(6,182,212,0.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }} aria-label={`${s.symbol} - ${s.signal} sinyali, Fiyat: ${s.price ? (selectedMarket === 'BIST' ? '₺' : '$') + s.price.toFixed(2) : 'N/A'}, Beklenen: ${s.target ? (selectedMarket === 'BIST' ? '₺' : '$') + s.target.toFixed(2) : 'N/A'}`}>
                    <td style={{ padding: '12px', fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>{s.symbol}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        background: s.signal === 'BUY' ? 'linear-gradient(135deg, #dcfce7, #86efac)' : s.signal === 'SELL' ? 'linear-gradient(135deg, #fee2e2, #fca5a5)' : '#f3f4f6',
                        color: s.signal === 'BUY' ? '#16a34a' : s.signal === 'SELL' ? '#dc2626' : '#6b7280',
                        boxShadow: s.signal === 'BUY' ? '0 4px 12px rgba(22,163,74,0.3)' : s.signal === 'SELL' ? '0 4px 12px rgba(220,38,38,0.3)' : 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }} aria-label={`Sinyal tipi: ${s.signal}`}>
                        <span>{s.signal === 'BUY' ? '🟢' : s.signal === 'SELL' ? '🔴' : '🟡'}</span>
                        {s.signal}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '16px', color: '#0f172a', fontWeight: '600' }} aria-label={`Mevcut fiyat: ${s.price ? (selectedMarket === 'BIST' ? '₺' : '$') + s.price.toFixed(2) : 'Veri bekleniyor'}`}>
                      {s.price ? `${selectedMarket === 'BIST' ? '₺' : '$'}${s.price.toFixed(2)}` : <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '14px' }}>⏳ Veri bekleniyor</span>}
                    </td>
                    <td style={{ padding: '12px', fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }} aria-label={`Beklenen fiyat: ${s.target ? (selectedMarket === 'BIST' ? '₺' : '$') + s.target.toFixed(2) : 'Veri bekleniyor'}`}>
                      {s.target ? `${selectedMarket === 'BIST' ? '₺' : '$'}${s.target.toFixed(2)}` : <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '14px' }}>⏳ Veri bekleniyor</span>}
                    </td>
                    <td style={{ padding: '12px', fontSize: '16px', fontWeight: 'bold', color: (s.change || 0) > 0 ? '#10b981' : '#ef4444' }} aria-label={`Fiyat değişimi: ${(s.change || 0) > 0 ? 'artış' : 'düşüş'} %${Math.abs(s.change || 0)}`}>
                      {(s.change || 0) > 0 ? '↑' : '↓'} {Math.abs(s.change || 0)}%
                    </td>
                    <td style={{ padding: '12px', fontSize: '15px', color: '#64748b', fontStyle: 'italic', maxWidth: '300px' }}>{s.comment}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '100px', height: '8px', background: '#e0e0e0', borderRadius: '10px', overflow: 'hidden' }} role="progressbar" aria-valuenow={s.accuracy} aria-valuemin={0} aria-valuemax={100}>
                          <div style={{ height: '100%', background: `linear-gradient(90deg, #06b6d4, #3b82f6)`, width: `${s.accuracy}%`, transition: 'width 0.5s' }}></div>
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', minWidth: '45px' }} aria-label={`Doğruluk oranı: ${s.accuracy} yüzde`}>{s.accuracy}%</span>
                        {((selectedMarket === 'BIST' && (s.symbol === 'THYAO' || s.symbol === 'TUPRS')) || (selectedMarket === 'NYSE' && s.symbol === 'AAPL') || (selectedMarket === 'NASDAQ' && s.symbol === 'NVDA')) && (
                          <button 
                            onClick={() => setSelectedForXAI(s.symbol)}
                            style={{ 
                              padding: '8px 12px', 
                              background: 'rgba(139,92,246,0.1)', 
                              color: '#8b5cf6', 
                              border: '1px solid rgba(139,92,246,0.3)', 
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '700',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139,92,246,0.2)'; e.currentTarget.style.borderColor = '#8b5cf6'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; }}
                            aria-label={`AI açıklamasını göster: ${s.symbol}`}
                          >
                            🧠
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {signals.length > visibleSignals && (
            <div style={{ padding: '12px', borderTop: '1px solid rgba(6,182,212,0.1)', background: 'rgba(255,255,255,0.5)', display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={() => setVisibleSignals(signals.length)}
                style={{ 
                  padding: '12px 32px', 
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '10px',
                  fontSize: '11px', 
                  fontWeight: '700', 
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(6,182,212,0.4)',
                  transition: 'all 0.2s',
                  outline: 'none'
                }} 
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(6,182,212,0.5)'; }} 
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(6,182,212,0.4)'; }}
                aria-label={`${signals.length - visibleSignals} sinyal daha göster`}
              >
                {signals.length - visibleSignals} Daha Fazla Sinyal Göster
              </button>
            </div>
          )}
        </div>

        {/* AI Confidence Meter - Signals tablosunun altına eklendi */}
        <div style={{ 
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(6,182,212,0.3)',
          borderRadius: '20px',
          boxShadow: '0 10px 50px rgba(6,182,212,0.15)'
        }}>
          <AIConfidenceMeter />
        </div>

        {/* Realtime Alerts - Signals tablosunun altına eklendi */}
        <div style={{ 
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(6,182,212,0.3)',
          borderRadius: '20px',
          boxShadow: '0 10px 50px rgba(6,182,212,0.15)'
        }}>
          <RealtimeAlerts />
        </div>
        
        {/* AI Prediction Chart */}
        <div style={{ 
          marginTop: '60px',
          background: 'rgba(255,255,255,0.8)', 
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(6,182,212,0.3)', 
          borderRadius: '20px', 
          overflow: 'hidden',
          boxShadow: '0 10px 50px rgba(6,182,212,0.15)'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(6,182,212,0.1)', background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(255,255,255,0.8))' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#0f172a', letterSpacing: '-0.5px' }}>AI Prediction Chart</h2>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>Gerçek zamanlı teknik analiz ve trend tahmini</span>
              <span style={{ padding: '6px 14px', background: 'rgba(6,182,212,0.15)', borderRadius: '20px', fontSize: '11px', fontWeight: '700', color: '#06b6d4' }}>THYAO - 30 Günlük Trend</span>
            </div>
            <div style={{ fontSize: '10px', color: '#f59e0b', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️</span>
              <span>Bu grafik gerçek zamanlı verilerle oluşturulmuştur</span>
            </div>
          </div>
          <div style={{ padding: '16px', aspectRatio: '16/9' }}>
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="day" 
                  stroke="#64748b" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#64748b" 
                  tick={{ fontSize: 10 }}
                  domain={['auto', 'auto']}
                  label={{ value: 'Fiyat (₺)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#64748b', fontSize: '11px', fontWeight: '600' } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(255,255,255,0.95)', 
                    border: '1px solid rgba(6,182,212,0.3)', 
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 10px 40px rgba(6,182,212,0.2)'
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}
                  itemStyle={{ fontSize: '11px', color: '#64748b' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }}
                  iconType="line"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                  name="Gerçek Fiyat"
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ fill: '#06b6d4', strokeWidth: 2, r: 5 }}
                  name="AI Tahmini"
                />
              </LineChart>
            </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '13px' }}>
                📊 Grafik yükleniyor...
              </div>
            )}
          </div>
          <div style={{ padding: '20px 40px', borderTop: '1px solid rgba(6,182,212,0.1)', background: 'rgba(6,182,212,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              <span style={{ fontWeight: '700', color: '#06b6d4' }}>Ortalama Doğruluk:</span> 87.3%
            </div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              <span style={{ fontWeight: '700', color: '#10b981' }}>Son Tahmin:</span> ₺268.30 <span style={{ color: '#10b981' }}>(+9.3%)</span>
            </div>
          </div>
        </div>

        {/* Multi-Timeframe Analyzer - AI Chart altına eklendi */}
        <div style={{ 
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(6,182,212,0.3)',
          borderRadius: '20px',
          boxShadow: '0 10px 50px rgba(6,182,212,0.15)'
        }}>
          <MultiTimeframeAnalyzer />
        </div>
        
        {/* XAI Explainability Panel */}
        {selectedForXAI && aiConfidence[selectedForXAI as keyof typeof aiConfidence] && (
          <div style={{ 
            marginTop: '16px',
            background: 'rgba(255,255,255,0.8)', 
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(6,182,212,0.3)', 
            borderRadius: '20px', 
            overflow: 'hidden',
            boxShadow: '0 10px 50px rgba(6,182,212,0.15)'
          }}>
            <div style={{ padding: '16px', borderBottom: '1px solid rgba(6,182,212,0.1)', background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(255,255,255,0.8))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, marginBottom: '8px', color: '#0f172a', letterSpacing: '-0.5px' }}>🧠 AI Güven Analizi</h2>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{selectedForXAI} - AI sinyalinin detaylı açıklaması</div>
                </div>
                <button onClick={() => setSelectedForXAI(null)} style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>✕ Kapat</button>
              </div>
            </div>
            <div style={{ padding: '16px' }}>
              {aiConfidence[selectedForXAI as keyof typeof aiConfidence].factors.map((factor, idx) => (
                <div key={idx} style={{ marginBottom: '20px', padding: '16px', background: factor.positive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: '12px', border: `2px solid ${factor.positive ? '#10b981' : '#ef4444'}40` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>{factor.name}</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: factor.positive ? '#10b981' : '#ef4444' }}>
                      {factor.contribution > 0 ? '+' : ''}{factor.contribution}%
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: `linear-gradient(90deg, ${factor.positive ? '#10b981' : '#ef4444'}, ${factor.positive ? '#34d399' : '#f87171'})`, width: `${Math.abs(factor.contribution)}%`, transition: 'width 0.5s' }}></div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(6,182,212,0.1)', borderRadius: '12px' }}>
                <div style={{ fontSize: '11px', color: '#0f172a', fontWeight: '600' }}>💡 Açıklama:</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
                  Bu sinyal, yukarıdaki faktörlerin kombinasyonuna dayanmaktadır. Her faktörün AI tahminine katkısı yüzde olarak gösterilmiştir.
      </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Correlation Matrix */}
        <div style={{ 
          marginTop: '60px',
          background: 'rgba(255,255,255,0.8)', 
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(6,182,212,0.3)', 
          borderRadius: '20px', 
          overflow: 'hidden',
          boxShadow: '0 10px 50px rgba(6,182,212,0.15)'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(6,182,212,0.1)', background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(255,255,255,0.8))' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#0f172a', letterSpacing: '-0.5px' }}>🔗 Hisse Korelasyonu</h2>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>Pair trading ve korelasyon analizi</div>
          </div>
          <div style={{ padding: '16px', display: 'grid', gap: '16px' }}>
            {correlationMatrix.map((corr, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                padding: '12px', 
                background: 'rgba(6,182,212,0.05)', 
                borderRadius: '12px',
                border: '1px solid rgba(6,182,212,0.2)'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#0f172a', minWidth: '80px' }}>{corr.stock1}</div>
                <div style={{ flex: 1, height: '8px', background: '#e0e0e0', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ width: `${Math.abs(corr.correlation) * 100}%`, height: '100%', background: corr.correlation > 0.7 ? 'linear-gradient(90deg, #10b981, #34d399)' : corr.correlation > 0.5 ? 'linear-gradient(90deg, #3b82f6, #60a5fa)' : 'linear-gradient(90deg, #eab308, #fbbf24)', transition: 'width 0.5s' }}></div>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#0f172a', minWidth: '80px' }}>{corr.stock2}</div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: corr.correlation > 0.7 ? '#10b981' : corr.correlation > 0.5 ? '#3b82f6' : '#eab308', minWidth: '50px', textAlign: 'right' }}>
                  {(corr.correlation * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Portfolio Simulator */}
        <div style={{ 
          marginTop: '60px',
          background: 'rgba(255,255,255,0.8)', 
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(6,182,212,0.3)', 
          borderRadius: '20px', 
          overflow: 'hidden',
          boxShadow: '0 10px 50px rgba(6,182,212,0.15)'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(6,182,212,0.1)', background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(255,255,255,0.8))' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, marginBottom: '12px', color: '#0f172a', letterSpacing: '-0.5px' }}>💹 Portföy Simulatörü</h2>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>AI sinyalleriyle 30 günlük portföy performansı simülasyonu</div>
          </div>
          <div style={{ padding: '16px', aspectRatio: '16/9' }}>
            {portfolioData && portfolioData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={portfolioData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="day" 
                  stroke="#64748b" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#64748b" 
                  tick={{ fontSize: 10 }}
                  domain={['auto', 'auto']}
                  label={{ value: 'Portföy Değeri (₺)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#64748b', fontSize: '11px', fontWeight: '600' } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(255,255,255,0.95)', 
                    border: '1px solid rgba(6,182,212,0.3)', 
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 10px 40px rgba(6,182,212,0.2)'
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}
                  formatter={(value: any) => [`₺${value.toLocaleString('tr-TR')}`, 'Portföy Değeri']}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }}
                  iconType="line"
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  name="Portföy Değeri"
                />
              </LineChart>
            </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '13px' }}>
                📊 Grafik yükleniyor...
              </div>
            )}
          </div>
          <div style={{ padding: '20px 40px', borderTop: '1px solid rgba(6,182,212,0.1)', background: 'rgba(6,182,212,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                <span style={{ fontWeight: '700', color: '#10b981' }}>Başlangıç:</span> ₺100.000
              </div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                <span style={{ fontWeight: '700', color: '#10b981' }}>Tahmini Kâr:</span> ₺10.500 <span style={{ color: '#10b981' }}>(+10.5%)</span>
              </div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                <span style={{ fontWeight: '700', color: '#10b981' }}>Son Değer:</span> ₺110.500
              </div>
            </div>
            <button 
              onClick={handlePortfolioRebalance}
              style={{ 
                padding: '10px 20px', 
                background: portfolioRebalance ? 'rgba(139,92,246,0.2)' : 'linear-gradient(135deg, #8b5cf6, #a78bfa)', 
                color: portfolioRebalance ? '#8b5cf6' : '#fff', 
                border: '1px solid rgba(139,92,246,0.3)', 
                borderRadius: '10px', 
                fontSize: '13px', 
                fontWeight: '700', 
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                if (!portfolioRebalance) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(139,92,246,0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              aria-label="Portföy rebalance'ını yeniden hesapla"
            >
              {portfolioRebalance ? '✓ Yeniden Hesaplandı' : '🔄 Rebalance (5 gün)'}
            </button>
          </div>
        </div>

        {/* Backtesting Preview - Portföy altına eklendi */}
        <div style={{ 
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(6,182,212,0.3)',
          borderRadius: '20px',
          boxShadow: '0 10px 50px rgba(6,182,212,0.15)'
        }}>
          <BacktestingPreview />
        </div>

        {/* Risk Attribution - Portföy altına eklendi */}
        <div style={{ 
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(6,182,212,0.3)',
          borderRadius: '20px',
          boxShadow: '0 10px 50px rgba(6,182,212,0.15)'
        }}>
          <RiskAttribution />
        </div>
        
        {/* FinBERT Sentiment Tracker */}
        <div style={{ 
          marginTop: '60px',
          background: 'rgba(255,255,255,0.8)', 
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(6,182,212,0.3)', 
          borderRadius: '20px', 
          overflow: 'hidden',
          boxShadow: '0 10px 50px rgba(6,182,212,0.15)'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(6,182,212,0.1)', background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(255,255,255,0.8))' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, marginBottom: '12px', color: '#0f172a', letterSpacing: '-0.5px' }}>📰 FinBERT Sentiment Tracker</h2>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>Türkçe haber ve duygu analizi (pozitif/negatif/nötr)</div>
          </div>
          <div style={{ padding: '16px' }}>
            {/* @ts-ignore */}
            {sentimentAnalysis.map((s: any, idx: number) => (
              <div key={idx} style={{ marginBottom: '16px', padding: '12px', background: s.sentiment > 70 ? 'rgba(16,185,129,0.1)' : s.sentiment < 50 ? 'rgba(239,68,68,0.1)' : 'rgba(251,191,36,0.1)', borderRadius: '16px', border: `2px solid ${s.sentiment > 70 ? '#10b981' : s.sentiment < 50 ? '#ef4444' : '#eab308'}40` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>{s.symbol}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Kaynaklar: {s.sources.join(', ')}</div>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: s.sentiment > 70 ? '#10b981' : s.sentiment < 50 ? '#ef4444' : '#eab308' }}>{s.sentiment}%</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ flex: 1, padding: '12px', background: 'rgba(16,185,129,0.2)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Pozitif</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>{s.positive}%</div>
                  </div>
                  <div style={{ flex: 1, padding: '12px', background: 'rgba(239,68,68,0.2)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Negatif</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>{s.negative}%</div>
                  </div>
                  <div style={{ flex: 1, padding: '12px', background: 'rgba(203,213,225,0.2)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Nötr</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#64748b' }}>{s.neutral}%</div>
                  </div>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    background: s.sentiment > 70 ? 'linear-gradient(90deg, #10b981, #34d399)' : s.sentiment < 50 ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #eab308, #fbbf24)', 
                    width: `${s.sentiment}%`, 
                    transition: 'width 0.5s' 
                  }}></div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '20px 40px', borderTop: '1px solid rgba(6,182,212,0.1)', background: 'rgba(6,182,212,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              <span style={{ fontWeight: '700', color: '#8b5cf6' }}>AI Model:</span> FinBERT-TR (Türkçe NLP)
            </div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              <span style={{ fontWeight: '700', color: '#10b981' }}>Ortalama Duygu:</span> 72.5% Pozitif
            </div>
          </div>
        </div>

        {/* AI News Trigger - Sentiment altına eklendi */}
        <div style={{ 
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(6,182,212,0.3)',
          borderRadius: '20px',
          boxShadow: '0 10px 50px rgba(6,182,212,0.15)'
        }}>
          <AINewsTrigger />
        </div>
        
        {/* AI Learning Mode */}
        <div style={{ 
          marginTop: '60px',
          background: 'rgba(255,255,255,0.8)', 
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(6,182,212,0.3)', 
          borderRadius: '20px', 
          overflow: 'hidden',
          boxShadow: '0 10px 50px rgba(6,182,212,0.15)'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(6,182,212,0.1)', background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(255,255,255,0.8))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, marginBottom: '8px', color: '#0f172a', letterSpacing: '-0.5px' }}>🧠 AI Learning Mode</h2>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>Performans geri bildirimi ve öneriler</div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={handleShare}
                  style={{ 
                    padding: '10px 16px', 
                    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '10px', 
                    fontSize: '13px', 
                    fontWeight: '700', 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  aria-label="Analizi paylaş"
                >
                  📤 Paylaş
                </button>
              </div>
            </div>
          </div>
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '12px', background: 'rgba(16,185,129,0.1)', borderRadius: '16px', border: '2px solid rgba(16,185,129,0.3)' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', fontWeight: '700' }}>Doğruluk Oranı</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{aiLearning.accuracy}%</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>Son 30 gün ortalaması</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(59,130,246,0.1)', borderRadius: '16px', border: '2px solid rgba(59,130,246,0.3)' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', fontWeight: '700' }}>Önerilen Portföy</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6' }}>THYAO %40</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>AKBNK %30, EREGL %30</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(251,191,36,0.1)', borderRadius: '16px', border: '2px solid rgba(251,191,36,0.3)' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', fontWeight: '700' }}>Risk Skoru</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#eab308' }}>3.2</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>▼ Düşük risk seviyesi</div>
              </div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(139,92,246,0.1)', borderRadius: '16px', border: '2px solid rgba(139,92,246,0.3)' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '16px' }}>💡 AI Önerileri:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {aiLearning.recommendations.map((rec, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '12px', 
                    background: 'rgba(255,255,255,0.5)', 
                    borderRadius: '10px',
                    fontSize: '11px',
                    color: '#0f172a'
                  }}>
                    <span style={{ fontSize: '16px' }}>✓</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>

        {/* Realtime Alerts */}
        {alerts.length > 0 && (
          <div style={{ 
            position: 'fixed',
            top: '120px',
            right: '20px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '400px'
          }}>
            {alerts.slice(-3).map((alert) => (
              <div key={alert.id} 
                onClick={() => handleNotificationClick(alert)}
                style={{ 
                background: alert.type === 'success' ? 'rgba(16,185,129,0.95)' : 'rgba(59,130,246,0.95)',
                backdropFilter: 'blur(20px)',
                padding: '16px 20px',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                color: '#fff',
                animation: 'slideInRight 0.4s ease-out',
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '18px' }}>{alert.type === 'success' ? '🔔' : 'ℹ️'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>{alert.message}</div>
                    <div style={{ fontSize: '11px', opacity: 0.9 }}>{mounted ? alert.timestamp.toLocaleTimeString('tr-TR') : '--:--:--'}</div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Bubble'ı durdur
                      setAlerts(alerts.filter(a => a.id !== alert.id));
                    }}
                    style={{ fontSize: '16px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px', lineHeight: '1' }}
                    aria-label="Bildirimi kapat"
                  >
                    ✕
            </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TraderGPT Chat Assistant */}
        {showTraderGPT && (
          <div style={{ 
            margin: '48px 0',
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(249,115,22,0.1))',
            borderRadius: '24px',
            border: '2px solid rgba(245,158,11,0.3)',
            boxShadow: '0 20px 60px rgba(245,158,11,0.2)'
          }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>
                  🤖 TraderGPT - AI Yatırım Asistanı
                </h2>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                  Sorularınızı sorun, size bugün hangi hisseleri izlemeniz gerektiğini söyleyeyim
            </p>
          </div>
              <button 
                onClick={() => setShowTraderGPT(false)}
                style={{
                  padding: '8px 14px',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ✕ Kapat
            </button>
          </div>

            {/* TraderGPT Content */}
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '20px',
              padding: '12px',
              border: '1px solid rgba(245,158,11,0.2)'
            }}>
              <TraderGPT />
          </div>
          </div>
        )}

        {/* Gamification System */}
        {showGamification && (
          <div style={{ 
            margin: '48px 0',
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(249,115,22,0.1))',
            borderRadius: '24px',
            border: '2px solid rgba(251,191,36,0.3)',
            boxShadow: '0 20px 60px rgba(251,191,36,0.2)'
          }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>
                  🏆 Trader Seviye Sistemi
                </h2>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                  Puanlar kazan, seviye atla, başarımları topla
            </p>
          </div>
              <button 
                onClick={() => setShowGamification(false)}
                style={{
                  padding: '8px 14px',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ✕ Kapat
            </button>
          </div>

            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '20px',
              padding: '12px',
              border: '1px solid rgba(251,191,36,0.2)'
            }}>
              <GamificationSystem />
        </div>
          </div>
        )}

        {/* Advanced Visualization Hub */}
        {showAdvancedViz && (
          <div style={{ 
            margin: '48px 0',
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(6,182,212,0.1))',
            borderRadius: '24px',
            border: '2px solid rgba(139,92,246,0.3)',
            boxShadow: '0 20px 60px rgba(139,92,246,0.2)'
          }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>
                  📊 Gelişmiş Görselleştirme Hub
                </h2>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                  Sinyal doğruluğu • Sektör haritası • AI tahminleri
                </p>
              </div>
              <button 
                onClick={() => setShowAdvancedViz(false)}
                style={{
                  padding: '8px 14px',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ✕ Kapat
            </button>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '20px',
              padding: '12px',
              border: '1px solid rgba(139,92,246,0.2)'
            }}>
              <AdvancedVisualizationHub />
            </div>
          </div>
        )}

        {/* AI Confidence Breakdown */}
        {showAIConfidence && (
          <div style={{ 
            margin: '48px 0',
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(139,92,246,0.1))',
            borderRadius: '24px',
            border: '2px solid rgba(236,72,153,0.3)',
            boxShadow: '0 20px 60px rgba(236,72,153,0.2)'
          }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>
                  🧠 AI Güven Açıklama (SHAP)
                </h2>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                  AI sinyallerinin kaynağı • Faktör analizi • SHAP değerleri
                </p>
              </div>
              <button 
                onClick={() => setShowAIConfidence(false)}
                style={{
                  padding: '8px 14px',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ✕ Kapat
            </button>
          </div>

            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '20px',
              padding: '12px',
              border: '1px solid rgba(236,72,153,0.2)'
            }}>
              <AIConfidenceBreakdown />
        </div>
          </div>
        )}

        {/* Cognitive AI Comments */}
        {showCognitiveAI && (
          <div style={{ 
            margin: '48px 0',
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.1))',
            borderRadius: '24px',
            border: '2px solid rgba(16,185,129,0.3)',
            boxShadow: '0 20px 60px rgba(16,185,129,0.2)'
          }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>
                  💬 Cognitive AI Yorumlar
                </h2>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                  AI sinyal açıklamaları • Doğal dil analizi • Aksiyon önerileri
                </p>
              </div>
              <button 
                onClick={() => setShowCognitiveAI(false)}
                style={{
                  padding: '8px 14px',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ✕ Kapat
              </button>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '20px',
              padding: '12px',
              border: '1px solid rgba(16,185,129,0.2)'
            }}>
              <CognitiveAI />
            </div>
          </div>
        )}

        {/* Feedback Loop */}
        {showFeedbackLoop && (
          <div style={{ 
            margin: '48px 0',
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1))',
            borderRadius: '24px',
            border: '2px solid rgba(139,92,246,0.3)',
            boxShadow: '0 20px 60px rgba(139,92,246,0.2)'
          }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>
                  🔄 AI Geri Bildirim Sistemi
                </h2>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                  AI'ya feedback ver • Doğruluk skorunu artır • Ödüller kazan
            </p>
          </div>
              <button 
                onClick={() => setShowFeedbackLoop(false)}
                style={{
                  padding: '8px 14px',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ✕ Kapat
              </button>
          </div>

            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '20px',
              padding: '12px',
              border: '1px solid rgba(139,92,246,0.2)'
            }}>
              <FeedbackLoop />
          </div>
          </div>
        )}

        {/* Adaptive Volatility Model */}
        {showVolatilityModel && (
          <div style={{ 
            margin: '48px 0',
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(239,68,68,0.1))',
            borderRadius: '24px',
            border: '2px solid rgba(249,115,22,0.3)',
            boxShadow: '0 20px 60px rgba(249,115,22,0.2)'
          }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>
                  📈 Adaptive Volatility Model
                </h2>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                  ATR + GARCH risk bantları • Dinamik stop-loss • Volatilite tahminleri
                </p>
              </div>
              <button 
                onClick={() => setShowVolatilityModel(false)}
                style={{
                  padding: '8px 14px',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ✕ Kapat
              </button>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '20px',
              padding: '12px',
              border: '1px solid rgba(249,115,22,0.2)'
            }}>
              <VolatilityModel />
            </div>
          </div>
        )}

        {/* Meta-Model Engine */}
        {showMetaModel && (
          <div style={{ 
            margin: '48px 0',
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(139,92,246,0.1))',
            borderRadius: '24px',
            border: '2px solid rgba(236,72,153,0.3)',
            boxShadow: '0 20px 60px rgba(236,72,153,0.2)'
          }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>
                  🧠 Meta-Model Engine
                </h2>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                  FinBERT + Llama3 + Mistral Ensemble • Ağırlıklı ortalama • %91.5 doğruluk
            </p>
          </div>
              <button 
                onClick={() => setShowMetaModel(false)}
                style={{
                  padding: '8px 14px',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ✕ Kapat
              </button>
          </div>

            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '20px',
              padding: '12px',
              border: '1px solid rgba(236,72,153,0.2)'
            }}>
              <MetaModelEngine />
          </div>
          </div>
        )}

        {/* Subscription Tiers */}
        {showSubscription && (
          <div style={{ 
            margin: '48px 0',
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(245,158,11,0.1))',
            borderRadius: '24px',
            border: '2px solid rgba(251,191,36,0.3)',
            boxShadow: '0 20px 60px rgba(251,191,36,0.2)'
          }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>
                  💎 Abonelik Planları
                </h2>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                  Basic / Pro Trader / Institutional • Yıllık planlarda 2 ay ücretsiz
                </p>
              </div>
              <button 
                onClick={() => setShowSubscription(false)}
                style={{
                  padding: '8px 14px',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ✕ Kapat
              </button>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '20px',
              padding: '12px',
              border: '1px solid rgba(251,191,36,0.2)'
            }}>
              <SubscriptionTiers />
            </div>
          </div>
        )}

        {/* Investor Panel - V6.0 */}
        {showInvestorPanel && (
          <div style={{ 
            margin: '16px 0',
            padding: '16px',
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <InvestorPanel />
          </div>
        )}

        {/* Strategy Builder */}
        {showStrategyBuilder && (
          <div style={{ 
            margin: '48px 0',
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.1))',
            borderRadius: '24px',
            border: '2px solid rgba(16,185,129,0.3)',
            boxShadow: '0 20px 60px rgba(16,185,129,0.2)'
          }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>
                  🎯 Strateji Oluşturucu
                </h2>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                  5 adımda özel yatırım stratejisi oluştur
                </p>
              </div>
              <button 
                onClick={() => setShowStrategyBuilder(false)}
                style={{
                  padding: '8px 14px',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ✕ Kapat
              </button>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '20px',
              padding: '12px',
              border: '1px solid rgba(16,185,129,0.2)'
            }}>
              <StrategyBuilder />
            </div>
          </div>
        )}

        {/* Footer Stats */}
        <div style={{ 
          marginTop: '24px',
          marginBottom: '16px',
          padding: '12px 20px',
          background: 'rgba(255,255,255,0.9)', 
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(6,182,212,0.3)', 
          borderRadius: '20px', 
          boxShadow: '0 10px 50px rgba(6,182,212,0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '11px', color: '#64748b' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontWeight: '700', color: '#3b82f6' }}>AI:</span> 15 aktif sinyal
              </div>
              <div>
                <span style={{ fontWeight: '700', color: '#10b981' }}>Ortalama Doğruluk:</span> 87.3%
              </div>
              <div>
                <span style={{ fontWeight: '700', color: '#ef4444' }}>Ortalama Risk:</span> Düşük
              </div>
              <div>
                <span style={{ fontWeight: '700', color: '#06b6d4' }}>Son Güncelleme:</span> {mounted ? timeString : '--:--'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={() => setShowGamification(true)}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🏆 Seviye 5
              </button>
              <button
                onClick={handleFeedback}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🔄 Feedback
              </button>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                BIST AI Smart Trader v4.6 Professional Edition
              </div>
            </div>
          </div>
        </div>

        {/* V5.0 Enterprise Module */}
        {showV50Module && (
          <div style={{ 
            margin: '48px 0',
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1))',
            borderRadius: '24px',
            border: '2px solid rgba(139,92,246,0.3)',
            boxShadow: '0 20px 60px rgba(139,92,246,0.2)'
          }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>
                  🚀 V5.0 Enterprise Intelligence
                </h2>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                  Risk Management • Portfolio Optimization • Backtesting
            </p>
          </div>
              <button 
                onClick={() => setShowV50Module(false)}
                style={{
                  padding: '8px 14px',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ✕ Kapat
              </button>
            </div>

            {/* V5.0 Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {(['risk', 'portfolio', 'backtest'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setV50ActiveTab(tab)}
                  style={{
                    padding: '8px 14px',
                    background: v50ActiveTab === tab 
                      ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' 
                      : 'rgba(255,255,255,0.7)',
                    color: v50ActiveTab === tab ? '#fff' : '#0f172a',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '11px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textTransform: 'capitalize'
                  }}
                >
                  {tab === 'risk' && '🛡️ Risk Management'}
                  {tab === 'portfolio' && '💎 Portfolio Optimizer'}
                  {tab === 'backtest' && '🧪 Backtesting'}
                </button>
              ))}
            </div>

            {/* V5.0 Content */}
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '20px',
              padding: '12px',
              border: '1px solid rgba(139,92,246,0.2)'
            }}>
              {v50ActiveTab === 'risk' && <RiskManagementPanel />}
              {v50ActiveTab === 'portfolio' && <PortfolioOptimizer />}
              {v50ActiveTab === 'backtest' && <BacktestViewer />}
            </div>
          </div>
        )}

        {/* TraderGPT Sidebar */}
        <TraderGPTSidebar />
      </main>
    </div>
    </>
  );
}
