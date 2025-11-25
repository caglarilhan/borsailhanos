'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/hooks/useWebSocket';
import { normalizeSentiment } from '@/lib/format';
import { formatPercent, formatCurrency, formatDate, formatTime } from '@/lib/format';
import { filterStale, isWithinMarketScope, deduplicateBySymbol } from '@/lib/guards';
import { getSectorForSymbol } from '@/lib/sectorMap';
import { createActions, actions } from '@/lib/actions';
import { buildPolylinePoints, buildBandPolygon, DEFAULT_CHART_DIMENSIONS } from '@/lib/svgChart';

export type DashboardTab = 'signals' | 'analysis' | 'operations' | 'advanced' | 'ai-analysis';
const DASHBOARD_TABS: DashboardTab[] = ['signals', 'analysis', 'operations', 'advanced', 'ai-analysis'];
const DASHBOARD_TAB_SET = new Set<DashboardTab>(DASHBOARD_TABS);
export function isDashboardTab(value: string | null): value is DashboardTab {
  return !!value && DASHBOARD_TAB_SET.has(value as DashboardTab);
}

// Type definitions for data structures
interface ChartDataPoint {
  day: string;
  actual?: number;
  predicted: number;
  predicted_upper: number;
  predicted_lower: number;
  confidence: number;
}

interface PortfolioDataPoint {
  day: string;
  value: number;
  profit: number;
}

interface Signal {
  symbol: string;
  signal?: string;
  confidence?: number;
  accuracy?: number;
  currentPrice?: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  price?: number;
  target?: number;
  comment?: string;
  [key: string]: unknown;
}

interface SentimentItem {
  symbol: string;
  sentiment?: number;
  positive?: number;
  negative?: number;
  neutral?: number;
  total?: number;
  sources?: string[];
  [key: string]: unknown;
}

interface SectorItem {
  name: string;
  change?: number;
  [key: string]: unknown;
}

interface AlertItem {
  id: string;
  message: string;
  type: 'success' | 'info';
  timestamp: Date;
  [key: string]: unknown;
}

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
import { LegalDisclaimer } from '@/components/LegalDisclaimer';
import ErrorBoundary from '@/components/ErrorBoundary';

// Inner component rendering main dashboard content
function DashboardV33Content({ initialTab }: { initialTab?: DashboardTab }) {
  // URL sync for tab navigation
  const router = useRouter();
  
  // Get initial tab from URL or default to 'signals'
  const [activeFeaturesTab, setActiveFeaturesTab] = useState<DashboardTab>(
    initialTab && DASHBOARD_TAB_SET.has(initialTab) ? initialTab : 'signals'
  );

  useEffect(() => {
    if (initialTab && DASHBOARD_TAB_SET.has(initialTab)) {
      setActiveFeaturesTab(initialTab);
    }
  }, [initialTab]);

  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  const [visibleSignals, setVisibleSignals] = useState(5);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [portfolioData, setPortfolioData] = useState<PortfolioDataPoint[]>([]);
  
  // Sync tab with URL
  const handleTabChange = (tab: DashboardTab) => {
    console.log('📑 Tab changing to:', tab);
    setActiveFeaturesTab(tab);
    // URL güncellemesini devre dışı bırak: bazı ortamlarda gereksiz fetch tetikliyor
    // router.push('?tab=' + tab, { scroll: false });
  };

  // Actions for opening tabs via centralized actions.ts
  const { openSignals, openAnalysis, openOperations, openAdvanced, openAIAnalysis } = (function(){
    try {
      // dynamic import types already handled via static import at top
      const actionsObj = require('@/lib/actions');
      if (actionsObj && actionsObj.createTabActions) {
        const result = actionsObj.createTabActions({ setActiveFeaturesTab, router });
        return {
          ...result,
          openAIAnalysis: result.openAIAnalysis || (() => handleTabChange('ai-analysis' as const)),
        };
      }
    } catch (e) {
      // fallback to local handler
    }
    return {
      openSignals: () => handleTabChange('signals' as const),
      openAnalysis: () => handleTabChange('analysis' as const),
      openOperations: () => handleTabChange('operations' as const),
      openAdvanced: () => handleTabChange('advanced' as const),
      openAIAnalysis: () => handleTabChange('ai-analysis' as const),
    };
  })();
  
  // Memoize initial chart data to prevent unnecessary re-renders
  const initialChartData = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => {
      const basePred = 242 + i * 0.8 + Math.random() * 15 - 7;
      const sigma = basePred * 0.02; // ±2% güven aralığı (±1σ)
      return {
        day: 'Gün ' + (i + 1),
      actual: 240 + Math.random() * 20 - 10,
        predicted: basePred,
        predicted_upper: basePred + sigma,
        predicted_lower: basePred - sigma,
      confidence: 85 + Math.random() * 10
      };
    })
  , []);

  const initialPortfolioData = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      day: 'Gün ' + (i + 1),
      value: 100000 + i * 350 + Math.random() * 200 - 100,
      profit: i * 350
    }))
  , []);

  useEffect(() => {
    console.log('🎯 Component mounting...');
    setMounted(true);
    // Initialize chart data after mount (prevents hydration error)
    setChartData(initialChartData);
    setPortfolioData(initialPortfolioData);
    console.log('✅ Component mounted successfully');
  }, []); // Only run once on mount
  const [watchlist, setWatchlist] = useState<string[]>(['THYAO', 'AKBNK']);
  const [selectedForXAI, setSelectedForXAI] = useState<string | null>(null);
  const [portfolioValue, setPortfolioValue] = useState(100000); // Start with 100k
  const [portfolioStocks, setPortfolioStocks] = useState<{symbol: string, count: number}[]>([]);
  const [sentimentData, setSentimentData] = useState<SentimentItem[] | null>(null);
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<{id: string, message: string, type: 'success' | 'info', timestamp: Date}[]>([]);
  const [portfolioRebalance, setPortfolioRebalance] = useState(false);
  const [aiLearning, setAiLearning] = useState({ accuracy: 87.3, recommendations: ['Portföy yoğunluğu: %40 THYAO', 'Risk düzeyi: Düşük', 'Son 7 gün: +12.5% kâr'] });
  const [selectedMarket, setSelectedMarket] = useState<'BIST' | 'NYSE' | 'NASDAQ'>('BIST');
  const [realtimeUpdates, setRealtimeUpdates] = useState({ signals: 0, risk: 0 });
  const [timeString, setTimeString] = useState<string>('');
  const [dynamicSignals, setDynamicSignals] = useState<Signal[]>([]); // WebSocket'ten gelen dinamik sinyaller
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null); // Bildirim tıklama için
  const [dynamicSummary, setDynamicSummary] = useState<string>(''); // AI Summary
  const [sectorStats, setSectorStats] = useState<any>(null); // Sektör İstatistikleri
  
  // Time update effect - hydration-safe
  useEffect(() => {
    if (mounted) {
      setTimeString(lastUpdate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
    }
  }, [mounted, lastUpdate]);
  const AI_MODULE_IDS = [
    'tradergpt',
    'gamification',
    'viz',
    'aiconf',
    'cognitive',
    'riskguard',
    'meta',
    'enterprise',
    'subscription',
    'strategy',
    'investor',
    'feedback',
  ] as const;
  type AiModuleId = typeof AI_MODULE_IDS[number];
  const AI_MODULE_DEFAULT_STATE: Record<AiModuleId, boolean> = {
    tradergpt: true,
    gamification: false,
    viz: true,
    aiconf: true,
    cognitive: false,
    riskguard: true,
    meta: false,
    enterprise: false,
    subscription: false,
    strategy: false,
    investor: false,
    feedback: false,
  };
  const [aiModules, setAiModules] = useState<Record<AiModuleId, boolean>>(AI_MODULE_DEFAULT_STATE);
  const [v50ActiveTab, setV50ActiveTab] = useState<'risk' | 'portfolio' | 'backtest'>('risk');
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const isAiModuleId = useCallback(
    (value: string): value is AiModuleId => (AI_MODULE_IDS as readonly string[]).includes(value as AiModuleId),
    []
  );
  const setModuleEnabled = useCallback((id: AiModuleId, value: boolean) => {
    setAiModules((prev) => ({ ...prev, [id]: value }));
  }, []);
  const toggleModule = useCallback((id: AiModuleId) => {
    setAiModules((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);
  const enableAllModules = useCallback(() => {
    setAiModules((prev) => {
      const next = { ...prev };
      AI_MODULE_IDS.forEach((id) => {
        next[id] = true;
      });
      return next;
    });
  }, []);
  const disableAllModules = useCallback(() => {
    setAiModules((prev) => {
      const next = { ...prev };
      AI_MODULE_IDS.forEach((id) => {
        next[id] = false;
      });
      return next;
    });
    setActivePanel(null);
  }, []);
  const handleModuleToggleUI = useCallback((id: AiModuleId) => {
    setAiModules((prev) => {
      const nextValue = !prev[id];
      const next = { ...prev, [id]: nextValue };
      if (nextValue) {
        setActivePanel(id);
        setTimeout(() => {
          const panelEl = document.getElementById('panel-' + id);
          panelEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      } else if (activePanel === id) {
        setActivePanel(null);
      }
      return next;
    });
  }, [activePanel]);
  const moduleControls = useMemo(() => {
    const base: Array<{ id: AiModuleId; title: string; description: string; icon: string; gradient: string }> = [
      { id: 'tradergpt', title: 'TraderGPT Asistanı', description: 'LLM tabanlı doğal dil trade danışmanı', icon: '🤖', gradient: 'linear-gradient(135deg, #f97316, #f59e0b)' },
      { id: 'viz', title: 'Viz Hub', description: 'Gelişmiş korelasyon ve heatmap görselleri', icon: '📊', gradient: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' },
      { id: 'aiconf', title: 'AI Confidence', description: 'SHAP benzeri açıklanabilirlik paneli', icon: '🧠', gradient: 'linear-gradient(135deg, #ec4899, #a855f7)' },
      { id: 'cognitive', title: 'Cognitive Insights', description: 'Doğal dil AI yorumları', icon: '💬', gradient: 'linear-gradient(135deg, #06b6d4, #0ea5e9)' },
      { id: 'riskguard', title: 'Risk Guard', description: 'Volatilite ve ATR bazlı risk laboratuvarı', icon: '⚠️', gradient: 'linear-gradient(135deg, #f97316, #ef4444)' },
      { id: 'meta', title: 'Meta-Model Engine', description: 'FinBERT + Llama3 ensemble çıktıları', icon: '🧬', gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)' },
      { id: 'enterprise', title: 'V5 Enterprise', description: 'Risk, portföy ve backtest süitini aç', icon: '🚀', gradient: 'linear-gradient(135deg, #3b82f6, #9333ea)' },
      { id: 'gamification', title: 'Gamification', description: 'Trader seviye ve ödül sistemi', icon: '🏆', gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
      { id: 'subscription', title: 'Planlar', description: 'Abonelik paketleri ve fiyatlama', icon: '💎', gradient: 'linear-gradient(135deg, #fde047, #f97316)' },
      { id: 'strategy', title: 'Strategy Builder', description: '5 adımda AI destekli strateji kurgusu', icon: '🎯', gradient: 'linear-gradient(135deg, #10b981, #14b8a6)' },
      { id: 'investor', title: 'Investor Panel', description: 'Kurumsal raporlar ve KPI özeti', icon: '📈', gradient: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' },
      { id: 'feedback', title: 'Feedback Loop', description: 'Model geri besleme ve öğrenim döngüsü', icon: '🔄', gradient: 'linear-gradient(135deg, #a855f7, #6366f1)' },
    ];
    return base.map((item) => ({ ...item, enabled: aiModules[item.id] }));
  }, [aiModules]);
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterAccuracy, setFilterAccuracy] = useState<number | null>(null);
  const [riskProfileLevel, setRiskProfileLevel] = useState<'low' | 'medium' | 'high' | 'aggressive'>('medium');
  // Portföy kişiselleştirme state'leri
  const [portfolioRiskLevel, setPortfolioRiskLevel] = useState<'low' | 'medium' | 'high' | 'aggressive'>('medium');
  const [portfolioHorizon, setPortfolioHorizon] = useState<'1m' | '6m' | '1y' | '5y'>('6m');
  const [portfolioSectorPreference, setPortfolioSectorPreference] = useState<'all' | 'technology' | 'banking' | 'energy' | 'industry'>('all');
  // Removed: showFeatureDetail and selectedFeatureDetail states
  // Artık direkt route yönlendirmesi yapıyoruz (/feature/[slug])
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(!isLoggedIn);
  const [currentUser, setCurrentUser] = useState<string>('');
  // RBAC / Plan basit guard
  const userRole = isLoggedIn && currentUser === 'admin' ? 'admin' : 'user';
  const userPlan: 'basic' | 'pro' | 'enterprise' = 'basic';
  
  const openPanel = (panel: string) => {
    console.log('📂 Panel açılıyor: ' + panel);
    console.log('🔍 Önceki activePanel: ' + activePanel);
    setActivePanel(panel);
    if (isAiModuleId(panel)) {
      setModuleEnabled(panel, true);
    }
    console.log('🔍 Yeni activePanel: ' + panel);
    
    // Scroll to panel after state update
    setTimeout(() => {
      const panelEl = document.getElementById('panel-' + panel);
      if (panelEl) {
        console.log('📍 Scrolling to panel:', panel);
        panelEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        console.warn('⚠️ Panel element not found: panel-' + panel);
      }
    }, 100);
  };
  
  const closePanel = () => {
    console.log('📂 Panel kapatılıyor');
    setActivePanel(null);
  };
  
  // Modal içinde seçilen karta göre canlı içerik render'ı
  const renderFeatureDetail = (detail: { section: string; name: string }) => {
    const lower = detail.name.toLowerCase();
    // V60 / V50 bileşenlerinden eşleştirme
    if (lower.includes('gelişmiş analiz') || lower.includes('gelişmiş grafik')) {
      return (
        <div style={{ height: '420px', background: '#fff', borderRadius: '12px', padding: '12px', border: '1px solid #e5e7eb' }}>
          <AdvancedVisualizationHub />
        </div>
      );
    }
    if (lower.includes('xai') || lower.includes('explain') || lower.includes('ai tahmin')) {
      return (
        <div style={{ height: '420px', background: '#fff', borderRadius: '12px', padding: '12px', border: '1px solid #e5e7eb' }}>
          <AIConfidenceBreakdown />
        </div>
      );
    }
    if (lower.includes('risk')) {
      return (
        <div style={{ height: '420px', background: '#fff', borderRadius: '12px', padding: '12px', border: '1px solid #e5e7eb' }}>
          <VolatilityModel />
        </div>
      );
    }
    if (lower.includes('portföy') || lower.includes('optimizer')) {
      return (
        <div style={{ height: '420px', background: '#fff', borderRadius: '12px', padding: '12px', border: '1px solid #e5e7eb' }}>
          <PortfolioOptimizer />
        </div>
      );
    }
    if (lower.includes('gpt')) {
      return (
        <div style={{ height: '420px', background: '#fff', borderRadius: '12px', padding: '12px', border: '1px solid #e5e7eb' }}>
          <TraderGPT />
        </div>
      );
    }
    if (lower.includes('izleme')) {
      return (
        <div style={{ height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ color: '#475569' }}>İzleme listesi bileşeni yakında burada canlı gösterilecek.</div>
        </div>
      );
    }
    // Varsayılan placeholder
    return (
      <div style={{ height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <div style={{ color: '#475569' }}>Bu özellik için canlı önizleme henüz tanımlanmadı.</div>
      </div>
    );
  };
  
  // ✅ DYNAMIC WATCHLIST: Gelen sinyallere göre dinamik güncelleme
  useEffect(() => {
    if (dynamicSignals.length > 0) {
      const topSymbols = dynamicSignals.slice(0, 5).map((s: Signal) => s.symbol).filter(Boolean);
      if (topSymbols.length > 0) {
        setWatchlist(topSymbols);
      }
    }
  }, [dynamicSignals]);
  
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
  
  // ✅ AI Explanation Handler
  const openExplanation = (symbol: string) => {
    console.log('🧠 Opening AI explanation for ' + symbol);
    setSelectedForXAI(symbol);
    openPanel('aiconf');
  };
  
  // Actions map (optional - mevcut handler'ları koruyor)
  // Tüm butonlar zaten onClick handler'ları ile çalışıyor
  
  const handleLoadMore = () => {
    setVisibleSignals(signals.length);
  };
  
  const handleOpenReport = () => {
    alert('📊 Detaylı rapor açılıyor...');
  };
  
  const handleOpenLevel = () => {
    setModuleEnabled('gamification', true);
    setActivePanel('gamification');
  };
  
  const handleCloseNotification = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowLogin(true);
    setCurrentUser('');
    localStorage.removeItem('bistai_user');
  };
  
  const handleShare = async () => {
    const data = {
      title: 'Borsailhanos AI Smart Trader',
      text: 'AI doğruluk: ' + metrics[0].value,
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

  // Global close handler for all panels/modals
  const handleCloseAll = () => {
    setActivePanel(null);
    disableAllModules();
    setShowWatchlist(false);
    setShowAdmin(false);
    setShowFilter(false);
    setSelectedForXAI(null);
  };


  // Feature cards click handler for "Tüm Özellikler"
  const handleFeatureCardClick = (section: 'signals' | 'analysis' | 'operations' | 'advanced', name: string) => {
    try {
      console.log('🎯 Feature card clicked:', section, name);
      // Tam sayfa route'a yönlendir (slug)
      const lower = name.toLowerCase();
      const toSlug = () => {
        if (lower.includes('sinyal takip')) return 'signals';
        if (lower.includes('ai sinyalleri') || lower.includes('ai sinyali')) return 'signals';
        if (lower.includes('bist 30')) return 'bist30';
        if (lower.includes('bist 100')) return 'bist100';
        if (lower.includes('bist 300')) return 'bist300';
        if (lower.includes('gelişmiş analiz')) return 'advanced';
        if (lower.includes('gelişmiş grafik')) return 'viz';
        if (lower.includes('bist veri paneli') || lower.includes('veri paneli') || lower.includes('panel')) return 'data';
        if (lower.includes('anomali') || lower.includes('momentum')) return 'anomaly';
        if (lower.includes('arbitraj')) return 'arbitrage';
        if (lower.includes('xai') || lower.includes('explain') || lower.includes('tahmin')) return 'xai';
        if (lower.includes('risk')) return 'risk';
        if (lower.includes('portföy') || lower.includes('optimizer')) return 'portfolio';
        if (lower.includes('gpt')) return 'gpt';
        if (lower.includes('opsiyon')) return 'options';
        if (lower.includes('formasyon')) return 'patterns';
        if (lower.includes('yatırım')) return 'investor';
        if (lower.includes('sinyal')) return 'bist30';
        return 'advanced';
      };
      router.push('/feature/' + toSlug());
    } catch (error) {
      console.error('❌ Error in handleFeatureCardClick:', error);
      alert('Özellik açılırken bir hata oluştu: ' + name);
    }
  };
  
  // ✅ NOTIFICATION CLICK HANDLER: Bildirim tıklandığında sembol seç, detay göster, tabloya scroll yap
  const handleNotificationClick = (alert: AlertItem) => {
    // Bildirim mesajından sembolü çıkar (örn: "🔔 THYAO: BUY sinyali...")
    const symbolMatch = alert.message.match(/([A-Z]{2,6}):/);
    if (symbolMatch && symbolMatch[1]) {
      const symbol = symbolMatch[1];
      setSelectedSymbol(symbol);
      // İlgili satırı bul ve highlight yap
      const signal = signals.find((s: Signal) => s.symbol === symbol);
      if (signal) {
        console.log('📊 ' + symbol + ' detay analizi açılıyor...', signal);
        
        // ✅ SMART SCROLL: Sembol satırına scroll yap
        setTimeout(() => {
          const element = document.getElementById('signal-row-' + symbol);
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
      // Fix WebSocket URL - backend expects /ws path
      const url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8081';
      console.log('🔗 WebSocket URL:', url);
      setWsUrl(url);
      setShouldConnectWS(true);
    }
  }, []);
  
  const { connected, error, lastMessage } = useWebSocket({
    url: shouldConnectWS ? wsUrl : '', // Empty URL prevents connection
    maxReconnectAttempts: 5, // Limit retry attempts to 5
    onMessage: (data: { signals?: Signal[]; [key: string]: unknown }) => {
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
          data.signals.forEach((signal: Signal) => {
            if (signal && typeof signal === 'object' && signal.symbol && typeof signal.symbol === 'string') {
              setAlerts(prev => [...prev, {
                id: 'signal-' + Date.now() + '-' + signal.symbol,
                message: '🔔 ' + signal.symbol + ': ' + (signal.signal || 'UPDATE') + ' sinyali (Güven: ' + (signal.confidence ? (signal.confidence * 100).toFixed(0) : '--') + '%)',
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
        
        // 4. ✅ Portfolio chart live update
        if (data.type === 'portfolio_update' && typeof data.value === 'number') {
          const newData = [...portfolioData, {
            day: 'Gün ' + (portfolioData.length + 1),
            value: data.value,
            profit: (data.value - 100000)
          }];
          setPortfolioData(newData.slice(-30)); // Keep last 30 points
          setPortfolioValue(data.value);
          console.log('📈 Portfolio chart updated:', data.value);
        }
      }
    },
    onConnect: () => {
      console.log('✅ WebSocket connected successfully');
    },
    onDisconnect: () => {
      console.warn('⚠️ WebSocket disconnected');
    }
  });
  
  // Initialize sentiment data with normalized percentages
  useEffect(() => {
    // Raw sentiment values (will be normalized)
    const rawSentiment = [
      { symbol: 'THYAO', sentiment: 82, positive: 68, negative: 18, neutral: 14, sources: ['Bloomberg HT', 'Anadolu Ajansı', 'Hürriyet'] },
      { symbol: 'AKBNK', sentiment: 75, positive: 56, negative: 24, neutral: 20, sources: ['Şebnem Turhan', 'Para Dergisi'] },
      { symbol: 'EREGL', sentiment: 88, positive: 72, negative: 10, neutral: 18, sources: ['KAP', 'Dünya'] },
      { symbol: 'TUPRS', sentiment: 45, positive: 28, negative: 52, neutral: 20, sources: ['Bloomberg', 'Haberler.com'] },
    ];
    
    // Normalize sentiment percentages to ensure sum = 100%
    const normalized = rawSentiment.map(s => {
      const [p, n, u] = normalizeSentiment(s.positive, s.negative, s.neutral);
      return {
        ...s,
        positive: p,
        negative: n,
        neutral: u,
        total: 100.0 // Ensure explicit total
      };
    });
    
    setSentimentData(normalized);
  }, []);
  
  // ✅ Check localStorage for saved user
  useEffect(() => {
    const savedUser = localStorage.getItem('bistai_user');
    console.log('🔍 LocalStorage kontrol:', savedUser);
    if (savedUser) {
      console.log('✅ Kayıtlı kullanıcı bulundu:', savedUser);
      setIsLoggedIn(true);
      setShowLogin(false);
      setCurrentUser(savedUser);
    } else {
      console.log('❌ Kayıtlı kullanıcı yok, login göster');
      setShowLogin(true);
    }
  }, []);

  // ✅ WINDOW-LEVEL WS MESSAGE LISTENER: window.dispatchEvent ile yayılan mesajları yakala
  useEffect(() => {
    const handleWsMessage = (event: CustomEvent) => {
      const data = event.detail;
      if (data && typeof data === 'object' && data.type === 'market_update') {
        console.log('📊 Window-level market update received:', data);
        // Chart data update
        if (typeof data.ai_confidence === 'number') {
          setChartData(prev => [...prev.slice(-29), {
            day: 'Gün ' + (prev.length + 1),
            actual: data.ai_confidence,
            predicted: data.ai_confidence,
            predicted_upper: data.ai_confidence * 1.02,
            predicted_lower: data.ai_confidence * 0.98,
            confidence: 85
          }]);
        }
      }
    };
    
    window.addEventListener('ws_message', handleWsMessage as EventListener);
    return () => window.removeEventListener('ws_message', handleWsMessage as EventListener);
  }, []);
  
  // 🔄 Fetch Top30 Analysis periodically to populate dynamic signals (prevents static fallback)
  useEffect(() => {
    let isMounted = true;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:18085';

    const fetchTop30 = async () => {
      try {
        const res = await fetch(API_BASE_URL + '/api/ai/top30_analysis', { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        if (!json || !Array.isArray(json.top30)) return;
        // Map to dashboard signal shape
        const mapped = json.top30.slice(0, 15).map((x: { symbol: string; signal: string; currentPrice?: number; predictedChange?: number; [key: string]: unknown }) => {
          const price = typeof x.currentPrice === 'number' ? x.currentPrice : 0;
          const change = typeof x.predictedChange === 'number' ? x.predictedChange : 0;
          return {
            symbol: x.symbol,
            signal: x.signal,
            price: price,
            target: price * (1 + change / 100),
            change: change,
            comment: (typeof x.aiSummaryText === 'string' ? x.aiSummaryText : 'AI güncel analiz'),
            accuracy: (typeof x.accuracy === 'number' ? x.accuracy : undefined),
            confidence: (typeof x.confidence === 'number' ? x.confidence / 100 : 0.8)
          };
        }));
        if (isMounted && mapped.length > 0) {
          setDynamicSignals(mapped);
        }
      } catch (e) {
        // silent
      }
    };

    fetchTop30();
    const interval = setInterval(fetchTop30, 30000); // 30s
    return () => { isMounted = false; clearInterval(interval); };
  }, []);
  
  // Realtime Data Fetch Simulation (15s interval)
  useEffect(() => {
    const realtimeInterval = setInterval(() => {
      // Simulate realtime updates
      setRealtimeUpdates(prev => ({
        signals: prev.signals + Math.floor(Math.random() * 2),
        risk: Math.random() * 0.5 - 0.25 // -0.25 to +0.25 change
      }));
      
      // Add alert for new signal using dynamic pool instead of fixed symbols
      if (Math.random() > 0.7) {
        const pool = (dynamicSignals && dynamicSignals.length > 0)
          ? dynamicSignals.map((s: Signal) => s.symbol).filter(Boolean)
          : ['ASELS','ENKAI','LOGO','KAREL','NETAS','TKNSA','BIMAS','MIGRS','TOASO','KOZAL','PGSUS','TRKCM','AEFES','GUBRF','KORDS','FROTO','GESAN','GLYHO','VRGYO','ZOREN'];
        if (pool.length > 0) {
          const randSymbol = pool[Math.floor(Math.random() * pool.length)];
          if (isWithinMarketScope(randSymbol, selectedMarket)) {
        setAlerts(prev => [...prev, {
              id: 'realtime-' + Date.now() + '-' + randSymbol,
              message: '🔔 Yeni sinyal: ' + randSymbol + ' - AI analizi güncellendi',
          type: 'success',
          timestamp: new Date()
        }]);
          }
        }
      }
    }, 15000); // 15 seconds
    
    return () => clearInterval(realtimeInterval);
  }, [dynamicSignals, selectedMarket]);
  
  // ✅ Portfolio Chart Dynamic Update: Yeni sinyaller geldiğinde grafiği güncelle
  // Portfolio updates are now handled in the onMessage callback above (line 267-277)
  // This useEffect is disabled to prevent infinite render loop
  
  // Event-Driven AI - Bilanço takvimi
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    
    // Her saat başı kontrol et (simülasyon)
    if (hour % 6 === 0) {
      const upcomingEvents = [
        { symbol: 'THYAO', event: 'Bilanço', date: new Date().toISOString().split('T')[0], type: 'positive', impact: 'Yüksek' }, // Use current date
        { symbol: 'TUPRS', event: 'GMK', date: new Date().toISOString().split('T')[0], type: 'neutral', impact: 'Orta' }, // Use current date
        { symbol: 'AKBNK', event: 'Faiz Kararı', date: new Date().toISOString().split('T')[0], type: 'positive', impact: 'Çok Yüksek' }, // Use current date
      ];
      
      // Filter out stale events (>90 days)
      const recentEvents = filterStale(upcomingEvents, 90);
      
      recentEvents.forEach(event => {
        const alertId = 'event-' + event.symbol + '-' + Date.now();
        if (!alerts.find(a => a.id.includes('event-' + event.symbol))) {
          setAlerts(prev => [...prev, { 
            id: alertId,
            message: '📅 ' + event.symbol + ': ' + event.event + ' (' + event.date + ') - ' + event.impact + ' etkisi',
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
  // ✅ FIXED: EREGL consistency (matches table BUY signal)
  const aiConfidence: Record<string, { factors: { name: string, contribution: number, positive: boolean }[], finalSignal?: string }> = {
    'THYAO': { factors: [{ name: 'RSI Momentum', contribution: 35, positive: true }, { name: 'Volume Surge', contribution: 30, positive: true }, { name: 'MACD Cross', contribution: 25, positive: true }, { name: 'Support Level', contribution: 10, positive: true }], finalSignal: 'BUY' },
    'TUPRS': { factors: [{ name: 'Resistance Zone', contribution: -40, positive: false }, { name: 'Volume Decrease', contribution: -30, positive: false }, { name: 'Bearish Pattern', contribution: -20, positive: false }, { name: 'Market Stress', contribution: -10, positive: false }], finalSignal: 'SELL' },
    'EREGL': { factors: [{ name: 'Breakout Pattern', contribution: 35, positive: true }, { name: 'Volume Surge', contribution: 30, positive: true }, { name: 'MACD Bullish', contribution: 25, positive: true }, { name: 'Support Break', contribution: 10, positive: true }], finalSignal: 'BUY' },
    'AAPL': { factors: [{ name: 'AI Chip Demand', contribution: 40, positive: true }, { name: 'iPhone Sales', contribution: 25, positive: true }, { name: 'Services Growth', contribution: 20, positive: true }, { name: 'Market Cap', contribution: 15, positive: true }], finalSignal: 'BUY' },
    'NVDA': { factors: [{ name: 'GPU Demand', contribution: 45, positive: true }, { name: 'AI Infrastructure', contribution: 30, positive: true }, { name: 'Data Center', contribution: 15, positive: true }, { name: 'Automotive', contribution: 10, positive: true }], finalSignal: 'BUY' },
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
  const sentimentChartData = sentimentAnalysis.map((s: SentimentItem, i: number) => ({
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
      'Doğruluk Optimizasyonu', 'Deep Learning', 'Ensemble Stratejileri', 'Piyasa Rejimi'
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
  // 🚀 SPRINT 3: Memoize signals calculation
  const signals = useMemo(() => {
    const rawSignals = dynamicSignals.length > 0 ? dynamicSignals : marketSignals[selectedMarket];
    const marketFiltered = rawSignals.filter(s => isWithinMarketScope(s.symbol, selectedMarket));
    return deduplicateBySymbol(marketFiltered);
  }, [dynamicSignals, selectedMarket]);

  // 🚀 SPRINT 3: Memoize metrics calculation
  const metrics = useMemo(() => [
    { label: 'Toplam Kâr', value: formatCurrency(125000), change: formatPercent(12.5), color: '#10b981', icon: '💰', pulse: true, percent: 72 },
    { label: 'Aktif Sinyaller', value: String(signals.length), change: '+3 yeni', color: '#3b82f6', icon: '🎯', pulse: true, percent: 60 },
    { label: 'Doğruluk Oranı', value: formatPercent(87.3), change: formatPercent(2.1), color: '#10b981', icon: '📊', pulse: false, percent: 87 },
    { label: 'Risk Skoru', value: '3.2', change: '▼ Düşük', color: '#10b981', icon: '⚠️', pulse: false, percent: 32 },
  ], [signals.length]);

  // 🚀 SPRINT 3: Memoize signal click handler
  const handleSignalClick = useCallback((symbol: string) => {
    console.log('Signal clicked:', symbol);
    router.push(`/feature/bist30?symbol=${symbol}`);
  }, [router]);

  return (
    <div>
      <style>{[
        '@keyframes pulse {',
        '  0%, 100% { opacity: 1; }',
        '  50% { opacity: 0.6; }',
        '}',
        '@keyframes slideInRight {',
        '  from { transform: translateX(100%); opacity: 0; }',
        '  to { transform: translateX(0); opacity: 1; }',
        '}',
      ].join('\n')}</style>
      
      {/* Login Check - Giriş yapılmadıysa sadece login göster */}
      {(!isLoggedIn || showLogin) ? (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            padding: '40px',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
              💹 Borsailhanos AI Smart Trader
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', textAlign: 'center', marginBottom: '32px' }}>
              Giriş Yap
            </p>
            
            <input 
              type="text" 
              placeholder="Kullanıcı Adı" 
              id="login-username"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '12px',
                fontSize: '14px',
                marginBottom: '16px'
              }}
            />
            <input 
              type="password" 
              placeholder="Şifre" 
              id="login-password"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const btn = document.getElementById('login-btn') as HTMLButtonElement;
                  btn?.click();
                }
              }}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '12px',
                fontSize: '14px',
                marginBottom: '24px'
              }}
            />
            
            <button 
              id="login-btn"
              onClick={async () => {
                const username = (document.getElementById('login-username') as HTMLInputElement)?.value;
                const password = (document.getElementById('login-password') as HTMLInputElement)?.value;
                console.log('🔐 Login attempt:', username);
                if (username && password) {
                  try {
                    console.log('📡 Login istegi gonderiliyor...');
                    
                    // 1. CSRF token al
                    const csrfRes = await fetch('/api/auth/csrf');
                    if (!csrfRes.ok) {
                      throw new Error('CSRF token alınamadı');
                    }
                    const csrfData = await csrfRes.json();
                    const csrfToken = csrfData.token;
                    
                    if (!csrfToken) {
                      throw new Error('CSRF token alınamadı');
                    }
                    
                    // 2. Login isteği gönder
                    const res = await fetch('/api/auth/login', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': csrfToken
                      },
                      body: JSON.stringify({username, password, remember: false})
                    });
                    
                    console.log('📥 Login response status:', res.status);
                    
                    if (!res.ok) {
                      const errorData = await res.json().catch(() => ({ error: 'Bilinmeyen hata' }));
                      throw new Error(errorData.error || `HTTP ${res.status}`);
                    }
                    
                    const data = await res.json();
                    console.log('📥 Login response data:', data);
                    
                    if (data.status === 'success' || res.status === 200) {
                      console.log('✅ Login basarili!');
                      setIsLoggedIn(true);
                      setShowLogin(false);
                      setCurrentUser(username);
                      localStorage.setItem('bistai_user', username);
                      alert('Giris basarili!');
                      // Sayfayı yenile
                      window.location.reload();
                    } else {
                      console.error('❌ Login failed:', data.error || data.message);
                      alert(data.error || data.message || 'Giris basarisiz');
                    }
                  } catch (e: any) {
                    console.error('❌ Login error:', e);
                    const errorMsg = e?.message || String(e) || 'Baglanti hatasi';
                    alert('Giris hatasi: ' + errorMsg);
                  }
                } else {
                  alert('Lutfen kullanici adi ve sifre girin');
                }
              }}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Giriş Yap
            </button>
          </div>
        </div>
      ) : (
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
                Borsailhanos AI Smart Trader <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>v4.6 Pro</span>
              </h1>
              <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                {isRefreshing ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#06b6d4' }}>
                    <div style={{ width: '6px', height: '6px', background: '#06b6d4', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
                    Güncelleniyor...
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: connected ? '#10b981' : '#ef4444' }} suppressHydrationWarning>
                    <div style={{ width: '6px', height: '6px', background: connected ? '#10b981' : '#ef4444', borderRadius: '50%', animation: connected ? 'pulse 2s infinite' : 'none' }}></div>
                    {connected ? 'Canlı' : 'Offline'} • {mounted ? formatTime(lastUpdate) : '--:--'} • İzleme: {watchlist.join(', ')}
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
              onClick={() => openPanel('tradergpt')}
              style={{ 
                padding: '8px 16px', 
                background: aiModules.tradergpt ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f59e0b, #f97316)', 
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
              onClick={() => openPanel('viz')}
              style={{ 
                padding: '8px 16px', 
                background: aiModules.viz ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)' : 'linear-gradient(135deg, #8b5cf6, #a855f7)', 
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
              onClick={() => openPanel('aiconf')}
              style={{ 
                padding: '8px 14px', 
                background: aiModules.aiconf ? 'linear-gradient(135deg, #ec4899, #06b6d4)' : 'linear-gradient(135deg, #ec4899, #a855f7)', 
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
              onClick={() => openPanel('cognitive')}
              style={{ 
                padding: '8px 14px', 
                background: aiModules.cognitive ? 'linear-gradient(135deg, #06b6d4, #ec4899)' : 'linear-gradient(135deg, #10b981, #059669)', 
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
              onClick={() => openPanel('riskguard')}
              style={{ 
                padding: '8px 14px', 
                background: aiModules.riskguard ? 'linear-gradient(135deg, #f97316, #ef4444)' : 'linear-gradient(135deg, #f97316, #f59e0b)', 
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
              onClick={() => openPanel('meta')}
              style={{ 
                padding: '8px 14px', 
                background: aiModules.meta ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : 'linear-gradient(135deg, #ec4899, #a855f7)', 
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
              onClick={() => {
                setModuleEnabled('subscription', true);
                setActivePanel('subscription');
              }}
              style={{ 
                padding: '8px 14px', 
                background: aiModules.subscription ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'linear-gradient(135deg, #fbbf24, #d97706)', 
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
              onClick={() => {
                setModuleEnabled('strategy', true);
                setActivePanel('strategy');
              }}
              style={{ 
                padding: '8px 14px', 
                background: aiModules.strategy ? 'linear-gradient(135deg, #10b981, #06b6d4)' : 'linear-gradient(135deg, #10b981, #059669)', 
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
              onClick={() => {
                setModuleEnabled('investor', true);
                setActivePanel('investor');
              }}
              style={{ 
                padding: '8px 14px', 
                background: aiModules.investor ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)' : 'linear-gradient(135deg, #8b5cf6, #a855f7)', 
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
              onClick={() => setShowWatchlist(true)}
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
            {userRole === 'admin' && (
            <button 
                onClick={() => setShowAdmin(true)}
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
            )}
            {String(userPlan) === 'enterprise' && (
            <button 
              style={{ 
                padding: '8px 14px', 
                background: aiModules.enterprise ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)', 
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
                onClick={() => {
                  setModuleEnabled('enterprise', true);
                  setActivePanel('enterprise');
                }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} 
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              aria-label="V5.0 Enterprise modülünü aç"
            >
              {aiModules.enterprise ? 'V5.0 ✨' : 'V5.0 Enterprise'}
            </button>
            )}
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
        
        {/* AI Module Control Center */}
        <section style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>AI Modül Kontrol Merkezi</h2>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
                Hangi AI bileşenlerinin görünür olacağını seç, deneyimi kişiselleştir.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={enableAllModules}
                style={{
                  padding: '8px 14px',
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '11px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(59,130,246,0.3)'
                }}
              >
                Hepsini Aç
              </button>
              <button
                onClick={disableAllModules}
                style={{
                  padding: '8px 14px',
                  background: 'rgba(15,23,42,0.85)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '11px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(15,23,42,0.3)'
                }}
              >
                Hepsini Kapat
              </button>
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '12px' 
          }}>
            {moduleControls.map((module) => (
              <button
                key={module.id}
                onClick={() => handleModuleToggleUI(module.id)}
                style={{
                  border: module.enabled ? 'none' : '1px solid rgba(148,163,184,0.4)',
                  borderRadius: '16px',
                  padding: '16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  background: module.enabled ? module.gradient : 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                  color: module.enabled ? '#fff' : '#0f172a',
                  boxShadow: module.enabled ? '0 12px 35px rgba(15,23,42,0.18)' : '0 2px 12px rgba(15,23,42,0.08)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  minHeight: '140px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = module.enabled 
                    ? '0 16px 40px rgba(15,23,42,0.22)'
                    : '0 4px 18px rgba(15,23,42,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = module.enabled 
                    ? '0 12px 35px rgba(15,23,42,0.18)'
                    : '0 2px 12px rgba(15,23,42,0.08)';
                }}
              >
                <span style={{ fontSize: '24px' }}>{module.icon}</span>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>
                    {module.title}
                  </div>
                  <p style={{ fontSize: '12px', margin: 0, opacity: module.enabled ? 0.95 : 0.7 }}>
                    {module.description}
                  </p>
                </div>
                <span style={{
                  marginTop: 'auto',
                  padding: '6px 10px',
                  borderRadius: '999px',
                  fontSize: '10px',
                  fontWeight: '700',
                  alignSelf: 'flex-start',
                  background: module.enabled ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.1)',
                  color: module.enabled ? '#fff' : '#0f172a'
                }}>
                  {module.enabled ? 'AKTİF' : 'KAPALI'}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* 🎯 SPRINT 1: AI TAHMİNLERİ - EN ÜSTE (Öncelik 1) */}
        <div style={{ 
          marginBottom: '16px',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          border: '2px solid rgba(6,182,212,0.3)',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(6,182,212,0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0, marginBottom: '4px' }}>
                🤖 AI Tahminleri & Sinyaller
              </h2>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Gerçek zamanlı AI analizi • {signals.length} aktif sinyal • {selectedMarket} piyasası
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#ffffff', cursor: 'pointer' }}
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value as 'BIST' | 'NYSE' | 'NASDAQ')}
              >
                <option value="BIST">BIST</option>
                <option value="NYSE">NYSE</option>
                <option value="NASDAQ">NASDAQ</option>
              </select>
            </div>
          </div>
          
          {/* Signals Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Sembol</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Sinyal</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Fiyat</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Hedef</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Değişim</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Doğruluk</th>
                </tr>
              </thead>
              <tbody>
                {signals.slice(0, 10).map((s: Signal, idx: number) => {
                  const isBuy = s.signal === 'BUY';
                  const signalColor = isBuy ? '#10b981' : s.signal === 'SELL' ? '#ef4444' : '#64748b';
                  const changeColor = (s.change || 0) >= 0 ? '#10b981' : '#ef4444';
                  return (
                    <tr 
                      key={idx} 
                      style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => handleSignalClick(s.symbol)}
                    >
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{s.symbol}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{ 
                          padding: '4px 12px', 
                          borderRadius: '6px', 
                          fontSize: '11px', 
                          fontWeight: '700',
                          background: signalColor + '15',
                          color: signalColor,
                          border: '1px solid ' + signalColor + '40'
                        }}>
                          {s.signal}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                        {formatCurrency(s.price || 0)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                        {formatCurrency(s.target || 0)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '700', color: changeColor }}>
                        {(s.change || 0) >= 0 ? '+' : ''}{formatPercent(s.change || 0)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ 
                          display: 'inline-block',
                          padding: '4px 8px', 
                          borderRadius: '6px', 
                          fontSize: '11px', 
                          fontWeight: '700',
                          background: s.accuracy >= 85 ? '#10b98115' : s.accuracy >= 75 ? '#f59e0b15' : '#ef444415',
                          color: s.accuracy >= 85 ? '#10b981' : s.accuracy >= 75 ? '#f59e0b' : '#ef4444'
                        }}>
                          {s.accuracy?.toFixed(1) || '--'}%
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {signals.length > 10 && (
            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <button
                onClick={() => router.push('/feature/bist30')}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(6,182,212,0.3)'
                }}
              >
                Tüm Sinyalleri Gör ({signals.length} toplam) →
              </button>
            </div>
          )}
        </div>

        {/* AI Insight Summary - Öncelik 2 */}
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
        
        {/* Sektör Isı Haritası (Basit Heatmap) - Öncelik 3 */}
        <div style={{ 
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>🏭 Sektör Isı Haritası</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Yeşil: Pozitif · Kırmızı: Negatif</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
            {sectors.map((sec: SectorItem, idx: number) => {
              const isUp = sec.change >= 0;
              const bg = isUp ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)';
              const border = isUp ? '1px solid #10b98155' : '1px solid #ef444455';
              const text = isUp ? '#065f46' : '#7f1d1d';
              return (
              <div key={idx} style={{ 
                  background: bg,
                  border,
                  borderRadius: '10px',
                padding: '12px',
                  display: 'grid',
                  gap: '6px'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{sec.name}</div>
                  <div style={{ fontSize: '12px', color: text, fontWeight: 800 }}>{isUp ? '↑ ' : '↓ '}{sec.change}%</div>
                  {/* Mini bar to visualize magnitude */}
                  <div style={{ height: '6px', width: '100%', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{
                      width: Math.min(100, Math.abs(sec.change) * 10) + '%',
                      height: '100%',
                      background: isUp ? '#10b981' : '#ef4444'
                    }} />
                </div>
                </div>
              );
            })}
      </div>
        </div>

      {/* Risk Dağılımı (Kullanıcı Profili Bazlı) */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>⚖️ Risk Dağılımı</div>
          <select
            style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#ffffff' }}
            value={riskProfileLevel}
            onChange={(e) => {
              const lvl = e.target.value as 'low' | 'medium' | 'high' | 'aggressive';
              setRiskProfileLevel(lvl);
              console.log('Risk seviyesi:', lvl);
            }}
          >
            <option value="low">Düşük Risk</option>
            <option value="medium">Orta Risk</option>
            <option value="high">Yüksek Risk</option>
            <option value="aggressive">Agresif</option>
          </select>
        </div>
        {(() => {
          const riskProfile = (() => {
            const base = signals && signals.length > 0 ? signals.map((s: Signal)=>s.symbol).slice(0,3) : ['THYAO','AKBNK','EREGL'];
            return {
              low: base.map((s,i) => ({ symbol: s, pct: [35,33,32][i] || 33 })),
              medium: base.map((s,i) => ({ symbol: s, pct: [42,31,27][i] || 33 })),
              high: base.map((s,i) => ({ symbol: s, pct: [30,35,35][i] || 33 })),
              aggressive: base.map((s,i) => ({ symbol: s, pct: [25,25,25][i] || 33 }))
            };
          })();
          const current = riskProfileLevel;
          const alloc = riskProfile[current];
          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {alloc.map((a, idx) => (
                <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>{a.symbol}</div>
                  <div style={{ height: '8px', width: '100%', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', marginBottom: '6px' }}>
                    <div style={{ width: a.pct + '%', height: '100%', background: '#10b981', transition: 'width 300ms ease' }} />
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{a.pct}%</div>
                </div>
              ))}
            </div>
          );
        })()}
        </div>

        {/* ALL FEATURES BY CATEGORY */}
        <div style={{ marginBottom: '16px' }}>
          <h2 id="all-features" style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#0f172a', letterSpacing: '-0.5px' }}>Tüm Özellikler</h2>
          
          {/* TAB MENÜSÜ */}
          <div role="tablist" style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button 
              role="tab"
              aria-selected={activeFeaturesTab === 'signals'}
              onClick={openSignals} 
              style={{ 
                padding: '8px 16px', 
                background: activeFeaturesTab === 'signals' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'rgba(255,255,255,0.8)', 
                color: activeFeaturesTab === 'signals' ? '#fff' : '#0f172a',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: activeFeaturesTab === 'signals' ? '0 4px 12px rgba(6,182,212,0.3)' : 'none',
                transition: 'all 0.2s'
              }}>
              📊 SINYALLER
            </button>
            <button 
              role="tab"
              aria-selected={activeFeaturesTab === 'analysis'}
              onClick={openAnalysis} 
              style={{ 
                padding: '8px 16px', 
                background: activeFeaturesTab === 'analysis' ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'rgba(255,255,255,0.8)', 
                color: activeFeaturesTab === 'analysis' ? '#fff' : '#0f172a',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: activeFeaturesTab === 'analysis' ? '0 4px 12px rgba(59,130,246,0.3)' : 'none',
                transition: 'all 0.2s'
              }}>
              📈 ANALİZ
            </button>
            <button 
              role="tab"
              aria-selected={activeFeaturesTab === 'operations'}
              onClick={openOperations} 
              style={{ 
                padding: '8px 16px', 
                background: activeFeaturesTab === 'operations' ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.8)', 
                color: activeFeaturesTab === 'operations' ? '#fff' : '#0f172a',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: activeFeaturesTab === 'operations' ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
                transition: 'all 0.2s'
              }}>
              🔧 OPERASYON
            </button>
            <button 
              role="tab"
              aria-selected={activeFeaturesTab === 'advanced'}
              onClick={openAdvanced} 
              style={{ 
                padding: '8px 16px', 
                background: activeFeaturesTab === 'advanced' ? 'linear-gradient(135deg, #8b5cf6, #a855f7)' : 'rgba(255,255,255,0.8)', 
                color: activeFeaturesTab === 'advanced' ? '#fff' : '#0f172a',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: activeFeaturesTab === 'advanced' ? '0 4px 12px rgba(139,92,246,0.3)' : 'none',
                transition: 'all 0.2s'
              }}>
              ⚡ GELİŞMİŞ
            </button>
            <button 
              role="tab"
              aria-selected={activeFeaturesTab === 'ai-analysis'}
              onClick={() => handleTabChange('ai-analysis')} 
              style={{ 
                padding: '8px 16px', 
                background: activeFeaturesTab === 'ai-analysis' ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'rgba(255,255,255,0.8)', 
                color: activeFeaturesTab === 'ai-analysis' ? '#fff' : '#0f172a',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: activeFeaturesTab === 'ai-analysis' ? '0 4px 12px rgba(245,158,11,0.3)' : 'none',
                transition: 'all 0.2s'
              }}>
              🤖 AI ANALİZLERİ
            </button>
          </div>
          
          {/* SINYALLER */}
          {activeFeaturesTab === 'signals' && <div role="tabpanel" style={{ marginBottom: '16px' }}>
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
                }} onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🖱️ Card clicked:', f);
                  handleFeatureCardClick('signals', f);
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
          </div>}

          {/* ANALIZ */}
          {activeFeaturesTab === 'analysis' && <div role="tabpanel" style={{ marginBottom: '16px' }}>
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
                }} onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🖱️ Card clicked:', f);
                  handleFeatureCardClick('analysis', f);
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
          </div>}

          {/* OPERASYON */}
          {activeFeaturesTab === 'operations' && <div role="tabpanel" style={{ marginBottom: '16px' }}>
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
                }} onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🖱️ Card clicked:', f);
                  handleFeatureCardClick('operations', f);
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
          </div>}

          {/* GELIŞMİŞ */}
          {activeFeaturesTab === 'advanced' && <div role="tabpanel" style={{ marginBottom: '16px' }}>
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
                }} onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🖱️ Card clicked:', f);
                  handleFeatureCardClick('advanced', f);
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
          </div>}

          {/* 🤖 AI ANALİZLERİ - YENİ SEKME */}
          {activeFeaturesTab === 'ai-analysis' && <div role="tabpanel" style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: '900', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #f59e0b', color: '#0f172a', letterSpacing: '-0.3px' }}>
              🤖 AI ANALİZLERİ <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '600' }}>Derin analiz araçları</span>
            </div>

            {/* 1. Backtest (3/6/12 Ay) */}
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>📈 Backtest (3/6/12 Ay)</div>
              </div>
              {(() => {
                const makeSeries = (len:number, drift:number)=> Array.from({length: len}, (_,i)=> ({ day: 'Gün ' + (i+1), value: Math.round(100 + i*drift + Math.sin(i/3)*3 + Math.random()*2) }));
                const [s3, s6, s12] = [makeSeries(60, 0.3), makeSeries(120, 0.25), makeSeries(240, 0.2)];
                const blocks = [
                  { label: '3 Ay', data: s3, color: '#10b981' },
                  { label: '6 Ay', data: s6, color: '#3b82f6' },
                  { label: '12 Ay', data: s12, color: '#8b5cf6' },
                ];
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {blocks.map((blk, idx)=> (
                      <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>{blk.label}</div>
                        <div style={{ width: '100%', height: 140 }}>
                          {(() => {
                            const width = 220;
                            const height = 120;
                            const points = buildPolylinePoints(blk.data, 'value', { width, height, padding: 12 });
                            if (!points) {
                              return (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px' }}>
                                  Veri yok
                                </div>
                              );
                            }
                            return (
                              <svg
                                width="100%"
                                height="100%"
                                viewBox={`0 0 ${width} ${height}`}
                                preserveAspectRatio="none"
                              >
                                <rect
                                  x="0"
                                  y="0"
                                  width={width}
                                  height={height}
                                  fill="transparent"
                                  stroke="none"
                                />
                                <polyline
                                  points={points}
                                  fill="none"
                                  stroke={blk.color}
                                  strokeWidth={3}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            );
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* 2. Detaylı Backtest - Günlük P&L, Drawdown, Sharpe */}
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>📉 Detaylı Backtest Analizi</div>
              {(() => {
                const makePnL = (len: number) => Array.from({length: len}, (_,i)=> ({ day: (i+1), pnl: Math.round(100 + i*0.3 + Math.sin(i/5)*10 + (Math.random()*5-2.5)), drawdown: Math.max(0, 5 - Math.sin(i/7)*3) }));
                const daily = makePnL(60);
                const sharpe = Array.from({length: 10}, (_,i)=> ({ period: (i+1) + 'H', value: 1.2 + (i*0.05) + (Math.random()*0.2-0.1) }));
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Günlük P&L (60 Gün)</div>
                      <div style={{ width: '100%', height: 200 }}>
                        {(() => {
                          const width = 360;
                          const height = 200;
                          const pnlPoints = buildPolylinePoints(daily, 'pnl', { width, height, padding: 18 });
                          const ddPoints = buildPolylinePoints(daily, 'drawdown', { width, height, padding: 18 });
                          if (!pnlPoints) {
                            return (
                              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px' }}>
                                Veri yok
                              </div>
                            );
                          }
                          return (
                            <svg
                              width="100%"
                              height="100%"
                              viewBox={`0 0 ${width} ${height}`}
                              preserveAspectRatio="none"
                            >
                              {[0.25, 0.5, 0.75].map((ratio) => (
                                <line
                                  key={ratio}
                                  x1={18}
                                  x2={width - 18}
                                  y1={ratio * height}
                                  y2={ratio * height}
                                  stroke="#e2e8f0"
                                  strokeDasharray="4 4"
                                />
                              ))}
                              <polyline
                                points={pnlPoints}
                                fill="none"
                                stroke="#10b981"
                                strokeWidth={3}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              {ddPoints && (
                                <polyline
                                  points={ddPoints}
                                  fill="none"
                                  stroke="#ef4444"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  opacity={0.8}
                                />
                              )}
                            </svg>
                          );
                        })()}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Sharpe Dağılımı</div>
                      <div style={{ width: '100%', height: 140 }}>
                        {(() => {
                          const width = 220;
                          const height = 140;
                          const points = buildPolylinePoints(sharpe, 'value', { width, height, padding: 14 });
                          return (
                            <svg
                              width="100%"
                              height="100%"
                              viewBox={`0 0 ${width} ${height}`}
                              preserveAspectRatio="none"
                            >
                              <polyline
                                points={points}
                                fill="none"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          );
                        })()}
                      </div>
                      </div>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Ortalama Getiri</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>%8.6</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px', marginBottom: '4px' }}>Kazanma Oranı</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#3b82f6' }}>%72.5</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px', marginBottom: '4px' }}>Sharpe Ratio</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#8b5cf6' }}>1.85</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 3. AI Fiyat Tahmin Grafiği */}
            <div style={{ 
              background: 'rgba(255,255,255,0.8)', 
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(6,182,212,0.3)', 
              borderRadius: '20px', 
              overflow: 'hidden',
              boxShadow: '0 10px 50px rgba(6,182,212,0.15)',
              marginBottom: '16px'
            }}>
              <div style={{ padding: '16px', borderBottom: '1px solid rgba(6,182,212,0.1)', background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(255,255,255,0.8))' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#0f172a', letterSpacing: '-0.5px' }}>📊 AI Fiyat Tahmin Grafiği</h2>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span>Gerçek zamanlı teknik analiz ve trend tahmini</span>
                  <span style={{ padding: '6px 14px', background: 'rgba(6,182,212,0.15)', borderRadius: '20px', fontSize: '11px', fontWeight: '700', color: '#06b6d4' }}>THYAO - 30 Günlük Trend</span>
                </div>
              </div>
              <div style={{ padding: '16px', aspectRatio: '16/9' }}>
                {chartData && chartData.length > 0 ? (
                  (() => {
                    const width = 640;
                    const height = 320;
                    const dims = { width, height, padding: 30 };
                    const predictedPoints = buildPolylinePoints(chartData, 'predicted', dims);
                    const actualPoints = buildPolylinePoints(chartData, 'actual', dims);
                    const areaPolygon = buildBandPolygon(chartData, 'predicted_upper', 'predicted_lower', dims);
                    return (
                      <svg
                        width="100%"
                        height="100%"
                        viewBox={`0 0 ${width} ${height}`}
                        preserveAspectRatio="none"
                      >
                        <rect
                          x="0"
                          y="0"
                          width={width}
                          height={height}
                          fill="transparent"
                          stroke="none"
                        />
                        {areaPolygon && (
                          <polygon
                            points={areaPolygon}
                            fill="#06b6d4"
                            opacity={0.15}
                          />
                        )}
                        {predictedPoints && (
                          <polyline
                            points={predictedPoints}
                            fill="none"
                            stroke="#06b6d4"
                            strokeWidth={3}
                            strokeDasharray="8 6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}
                        {actualPoints && (
                          <polyline
                            points={actualPoints}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}
                      </svg>
                    );
                  })()
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '13px' }}>📊 Grafik yükleniyor...</div>
                )}
              </div>
            </div>

            {/* 4. Korelasyon Heatmap */}
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>🔗 Korelasyon Heatmap</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Yeşil: + korelasyon · Kırmızı: - korelasyon</div>
              </div>
              {(() => {
                const symbols = (signals && signals.length > 0 ? signals.map((s: Signal)=>s.symbol) : ['THYAO','AKBNK','EREGL','SISE','TUPRS','GARAN','BIMAS','TOASO']).slice(0,8);
                const n = symbols.length;
                const corr: number[][] = [];
                for (let i=0;i<n;i++){ 
                  corr[i]=[]; 
                  for(let j=0;j<n;j++){ 
                    if(i===j){
                      corr[i][j]=1;
                    } else if(i<j){
                      const key = symbols[i] + '-' + symbols[j];
                      let h=0; for (let k=0;k<key.length;k++) h=(h*31+key.charCodeAt(k))>>>0;
                      const v = ((h % 161) - 80) / 100;
                      const normalized = parseFloat(v.toFixed(2));
                      corr[i][j]=normalized;
                    } else {
                      corr[i][j]=corr[j][i];
                    }
                  } 
                }
                return (
                  <div style={{ overflowX: 'auto' }}>
                    <div style={{ display: 'inline-grid', gridTemplateColumns: '80px repeat(' + n + ', 40px)' }}>
                      <div />
                      {symbols.map((s:string)=>(<div key={'col-'+s} style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '10px', color: '#475569', textAlign: 'center' }}>{s}</div>))}
                      {symbols.map((row:string, i:number)=> (
                        <React.Fragment key={'row-'+row}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', padding: '6px 8px' }}>{row}</div>
                          {symbols.map((col:string, j:number)=>{
                            const val = corr[i][j];
                            const isPos = val >= 0;
                            const alpha = Math.min(1, Math.abs(val));
                            const bg = isPos ? 'rgba(16,185,129,' + (0.1 + alpha*0.6) + ')' : 'rgba(239,68,68,' + (0.1 + alpha*0.6) + ')';
                            return (
                              <div key={'cell-'+i+'-'+j} style={{ width: 40, height: 28, background: bg, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#0f172a' }}>
                                {i===j ? '—' : Math.round(val*100)}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 5. Multi-Timeframe Analyzer */}
            <div style={{ 
              padding: '12px',
              background: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(6,182,212,0.3)',
              borderRadius: '20px',
              boxShadow: '0 10px 50px rgba(6,182,212,0.15)',
              marginBottom: '16px'
            }}>
              <MultiTimeframeAnalyzer />
            </div>

            {/* 6. Volatilite Modeli */}
        {aiModules.riskguard && (
              <div style={{ 
                padding: '12px',
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(6,182,212,0.3)',
                borderRadius: '20px',
                boxShadow: '0 10px 50px rgba(6,182,212,0.15)',
                marginBottom: '16px'
              }}>
                <VolatilityModel />
              </div>
            )}
          </div>}
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
                    aria-label={market + ' borsası sinyalleri'}
                  >
                    {market === 'BIST' ? '🇹🇷' : market === 'NYSE' ? '🇺🇸' : '🇺🇸'} {market}
            </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setShowFilter(true)}
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
                onClick={() => setFilterAccuracy(80)}
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
                  <tr key={idx} id={'signal-row-' + s.symbol} style={{ borderBottom: '1px solid rgba(6,182,212,0.08)', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(6,182,212,0.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }} aria-label={s.symbol + ' - ' + s.signal + ' sinyali, Fiyat: ' + (s.price ? (selectedMarket === 'BIST' ? '₺' : '$') + s.price.toFixed(2) : 'N/A') + ', Beklenen: ' + (s.target ? (selectedMarket === 'BIST' ? '₺' : '$') + s.target.toFixed(2) : 'N/A')}>
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
                      }} aria-label={'Sinyal tipi: ' + s.signal}>
                        <span>{s.signal === 'BUY' ? '🟢' : s.signal === 'SELL' ? '🔴' : '🟡'}</span>
                        {s.signal}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '16px', color: '#0f172a', fontWeight: '600' }} aria-label={'Mevcut fiyat: ' + (s.price ? (selectedMarket === 'BIST' ? '₺' : '$') + s.price.toFixed(2) : 'Veri bekleniyor')}>
                      {s.price ? (selectedMarket === 'BIST' ? '₺' : '$') + s.price.toFixed(2) : <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '14px' }}>⏳ Veri bekleniyor</span>}
                    </td>
                    <td style={{ padding: '12px', fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }} aria-label={'Beklenen fiyat: ' + (s.target ? (selectedMarket === 'BIST' ? '₺' : '$') + s.target.toFixed(2) : 'Veri bekleniyor')}>
                      {s.target ? (selectedMarket === 'BIST' ? '₺' : '$') + s.target.toFixed(2) : <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '14px' }}>⏳ Veri bekleniyor</span>}
                    </td>
                    <td style={{ padding: '12px', fontSize: '16px', fontWeight: 'bold', color: (s.change || 0) > 0 ? '#10b981' : '#ef4444' }} aria-label={'Fiyat değişimi: ' + ((s.change || 0) > 0 ? 'artış' : 'düşüş') + ' %' + Math.abs(s.change || 0)}>
                      {(s.change || 0) > 0 ? '↑' : '↓'} {Math.abs(s.change || 0)}%
                    </td>
                    <td style={{ padding: '12px', fontSize: '15px', color: '#64748b', fontStyle: 'italic', maxWidth: '300px' }}>{s.comment}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '100px', height: '8px', background: '#e0e0e0', borderRadius: '10px', overflow: 'hidden' }} role="progressbar" aria-valuenow={s.accuracy} aria-valuemin={0} aria-valuemax={100}>
                          <div style={{ height: '100%', background: 'linear-gradient(90deg, #06b6d4, #3b82f6)', width: s.accuracy + '%', transition: 'width 0.5s' }}></div>
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', minWidth: '45px' }} aria-label={'Doğruluk oranı: ' + s.accuracy + ' yüzde'}>{s.accuracy}%</span>
                        {((selectedMarket === 'BIST' && (s.symbol === 'THYAO' || s.symbol === 'TUPRS')) || (selectedMarket === 'NYSE' && s.symbol === 'AAPL') || (selectedMarket === 'NASDAQ' && s.symbol === 'NVDA')) && (
                          <button 
                            onClick={() => {
                              if ('explainSymbol' in actions && typeof actions.explainSymbol === 'function') {
                                actions.explainSymbol(s.symbol);
                              } else {
                                openExplanation(s.symbol);
                              }
                            }}
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
                            aria-label={'AI açıklamasını göster: ' + s.symbol}
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
                onClick={handleLoadMore}
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
                aria-label={(signals.length - visibleSignals) + ' sinyal daha göster'}
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

        {/* Realtime Alerts - Only show when connected */}
        {connected && (
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
        )}
        
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
                <button onClick={handleCloseAll} style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>✕ Kapat</button>
              </div>
            </div>
            <div style={{ padding: '16px' }}>
              {aiConfidence[selectedForXAI as keyof typeof aiConfidence].factors.map((factor, idx) => (
                <div key={idx} style={{ marginBottom: '20px', padding: '16px', background: factor.positive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: '12px', border: '2px solid ' + (factor.positive ? '#10b981' : '#ef4444') + '40' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>{factor.name}</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: factor.positive ? '#10b981' : '#ef4444' }}>
                      {factor.contribution > 0 ? '+' : ''}{factor.contribution}%
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: (factor.positive ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #ef4444, #f87171)'), width: Math.abs(factor.contribution) + '%', transition: 'width 0.5s' }}></div>
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
            {correlationMatrix.filter((corr) => corr.stock1 !== corr.stock2).map((corr, idx) => (
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
                  <div style={{ width: (Math.abs(corr.correlation) * 100) + '%', height: '100%', background: corr.correlation > 0.7 ? 'linear-gradient(90deg, #10b981, #34d399)' : corr.correlation > 0.5 ? 'linear-gradient(90deg, #3b82f6, #60a5fa)' : 'linear-gradient(90deg, #eab308, #fbbf24)', transition: 'width 0.5s' }}></div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, marginBottom: '8px', color: '#0f172a', letterSpacing: '-0.5px' }}>💹 Portföy Simulatörü</h2>
                <div style={{ fontSize: '11px', color: '#64748b' }}>AI sinyalleriyle 30 günlük portföy performansı simülasyonu</div>
              </div>
              <button
                onClick={() => {
                  setModuleEnabled('enterprise', true);
                  setV50ActiveTab('portfolio');
                  setActivePanel('enterprise');
                }}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(16,185,129,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.3)';
                }}
              >
                🎯 Kişisel Portföy Optimizer
              </button>
            </div>
            {/* Kişiselleştirme Hızlı Kontroller */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
              <select
                style={{ padding: '8px 12px', fontSize: '12px', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '8px', background: '#fff', cursor: 'pointer' }}
                value={portfolioRiskLevel}
                onChange={(e) => {
                  const lvl = e.target.value as 'low' | 'medium' | 'high' | 'aggressive';
                  setPortfolioRiskLevel(lvl);
                  localStorage.setItem('portfolioRiskLevel', lvl);
                }}
              >
                <option value="low">⚖️ Düşük Risk</option>
                <option value="medium">⚖️ Orta Risk</option>
                <option value="high">⚖️ Yüksek Risk</option>
                <option value="aggressive">⚖️ Agresif</option>
              </select>
              <select
                style={{ padding: '8px 12px', fontSize: '12px', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '8px', background: '#fff', cursor: 'pointer' }}
                value={portfolioHorizon}
                onChange={(e) => {
                  const hz = e.target.value as '1m' | '6m' | '1y' | '5y';
                  setPortfolioHorizon(hz);
                  localStorage.setItem('portfolioHorizon', hz);
                }}
              >
                <option value="1m">📅 1 Ay</option>
                <option value="6m">📅 6 Ay</option>
                <option value="1y">📅 1 Yıl</option>
                <option value="5y">📅 5 Yıl</option>
              </select>
              <select
                style={{ padding: '8px 12px', fontSize: '12px', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '8px', background: '#fff', cursor: 'pointer' }}
                value={portfolioSectorPreference}
                onChange={(e) => {
                  const sec = e.target.value as 'all' | 'technology' | 'banking' | 'energy' | 'industry';
                  setPortfolioSectorPreference(sec);
                  localStorage.setItem('portfolioSectorPreference', sec);
                }}
              >
                <option value="all">🏭 Tüm Sektörler</option>
                <option value="technology">💻 Teknoloji</option>
                <option value="banking">🏦 Bankacılık</option>
                <option value="energy">⚡ Enerji</option>
                <option value="industry">🏭 Sanayi</option>
              </select>
            </div>
          </div>
          <div style={{ padding: '16px', aspectRatio: '16/9' }}>
          {portfolioData && portfolioData.length > 0 ? (
            (() => {
              const width = 640;
              const height = 320;
              const points = buildPolylinePoints(portfolioData, 'value', { width, height, padding: 28 });
              return (
                <svg
                  width="100%"
                  height="100%"
                  viewBox={`0 0 ${width} ${height}`}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="portfolioLineFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {points && (
                    <>
                      <polyline
                        points={points}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <polygon
                        points={`28,${height - 28} ${points} ${width - 28},${height - 28}`}
                        fill="url(#portfolioLineFill)"
                      />
                    </>
                  )}
                </svg>
              );
            })()
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
            {sentimentAnalysis.map((s: SentimentItem, idx: number) => (
              <div key={idx} style={{ marginBottom: '16px', padding: '12px', background: s.sentiment > 70 ? 'rgba(16,185,129,0.1)' : s.sentiment < 50 ? 'rgba(239,68,68,0.1)' : 'rgba(251,191,36,0.1)', borderRadius: '16px', border: '2px solid ' + (s.sentiment > 70 ? '#10b981' : s.sentiment < 50 ? '#ef4444' : '#eab308') + '40' }}>
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
                    width: s.sentiment + '%', 
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
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>3.2 / 5 — Düşük Risk</div>
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
              onClick={() => {
                if ('openAlert' in actions && typeof actions.openAlert === 'function') {
                  actions.openAlert(alert);
                }
              }}
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
        {aiModules.tradergpt && (
          <div id="panel-tradergpt" style={{ 
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
                onClick={handleCloseAll}
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
        {aiModules.gamification && (
          <div id="panel-gamification" style={{ 
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
                onClick={handleCloseAll}
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
        {aiModules.viz && (
          <div id="panel-viz" style={{ 
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
                onClick={handleCloseAll}
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
        {aiModules.aiconf && (
          <div id="panel-aiconf" style={{ 
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
                onClick={handleCloseAll}
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
        {aiModules.cognitive && (
          <div id="panel-cognitive" style={{ 
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
                onClick={handleCloseAll}
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
        {aiModules.feedback && (
          <div id="panel-feedback" style={{ 
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
                onClick={handleCloseAll}
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
        {aiModules.riskguard && (
          <div id="panel-riskguard" style={{ 
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
                onClick={handleCloseAll}
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
        {aiModules.meta && (
          <div id="panel-meta" style={{ 
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
                onClick={handleCloseAll}
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
        {aiModules.subscription && (
          <div id="panel-subscription" style={{ 
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
                onClick={actions.closeModal}
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
        {aiModules.investor && (
          <div id="panel-investor" style={{ 
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
        {aiModules.strategy && (
          <div id="panel-strategy" style={{ 
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
                onClick={actions.closeModal}
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
                onClick={handleOpenLevel}
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
                onClick={() => {
                  setModuleEnabled('feedback', true);
                  setActivePanel('feedback');
                }}
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
                Borsailhanos AI Smart Trader v4.6 Professional Edition {isLoggedIn && ('| ' + currentUser)}
              </div>
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '8px 16px',
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  🚪 Çıkış
                </button>
              )}
            </div>
          </div>
        </div>

        {/* V5.0 Enterprise Module */}
        {aiModules.enterprise && (
          <div id="panel-enterprise" style={{ 
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
                onClick={handleCloseAll}
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
                  onClick={() => {
                    if ('openV50Tab' in actions && typeof actions.openV50Tab === 'function') {
                      actions.openV50Tab(tab);
                    } else if (openPanel) {
                      openPanel(tab);
                    }
                  }}
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

        {/* Watchlist Panel */}
        {showWatchlist && (
          <div style={{ 
            margin: '48px 0',
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(147,51,234,0.1))',
            borderRadius: '24px',
            border: '2px solid rgba(59,130,246,0.3)',
            boxShadow: '0 20px 60px rgba(59,130,246,0.2)'
          }}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>
                  📋 İzleme Listesi
                </h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  {watchlist.length} hisse izleniyor
                </p>
              </div>
              <button 
                onClick={handleCloseAll}
                style={{
                  padding: '8px 16px',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '12px',
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
              padding: '20px',
              border: '1px solid rgba(0,0,0,0.1)'
            }}>
              {watchlist.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                  {watchlist.map((symbol) => (
                    <div 
                      key={symbol}
                      style={{
                        padding: '12px',
                        background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => {
                        if ('scrollToSignals' in actions && typeof actions.scrollToSignals === 'function') {
                          actions.scrollToSignals(symbol);
                        } else {
                          document.getElementById('signals-table')?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{symbol}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#64748b' }}>İzleme listesi boş</p>
              )}
            </div>
          </div>
        )}

        {/* Admin Panel */}
        {showAdmin && (
          <div style={{ 
            margin: '48px 0',
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(0,0,0,0.1), rgba(255,255,255,0.1))',
            borderRadius: '24px',
            border: '2px solid rgba(139,92,246,0.3)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>
                  ⚙️ Admin Paneli
                </h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  Sistem yönetimi ve ayarlar
                </p>
              </div>
              <button 
                onClick={handleCloseAll}
                style={{
                  padding: '8px 16px',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '12px',
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
              padding: '20px',
              border: '1px solid rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div style={{ padding: '16px', background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>📊 Sistem Durumu</h3>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>Backend: Aktif</p>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>WebSocket: Aktif</p>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>Database: Connected</p>
                </div>

                <div style={{ padding: '16px', background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>🔧 Ayarlar</h3>
                  <button onClick={() => {
                    if ('refreshData' in actions && typeof actions.refreshData === 'function') {
                      actions.refreshData();
                    }
                  }} style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', marginRight: '8px' }}>
                    Veri Yenile
                  </button>
                  <button onClick={() => {
                    if ('openLogs' in actions && typeof actions.openLogs === 'function') {
                      actions.openLogs();
                    }
                  }} style={{ padding: '8px 16px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                    Log İzle
                  </button>
                </div>

                <div style={{ padding: '16px', background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>📈 İstatistikler</h3>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>Toplam Sinyal: 500+</p>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>AI Accuracy: 85%</p>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>Aktif Hisse: 25</p>
                </div>
              </div>

              <div style={{ marginTop: '24px', padding: '20px', background: 'rgba(255,255,255,0.95)', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>👥 Kullanıcı Yönetimi</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <input 
                    type="text" 
                    placeholder="Kullanıcı Adı" 
                    id="new-username"
                    style={{
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <input 
                    type="password" 
                    placeholder="Şifre" 
                    id="new-password"
                    style={{
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <button 
                  onClick={async () => {
                    const username = (document.getElementById('new-username') as HTMLInputElement)?.value;
                    const password = (document.getElementById('new-password') as HTMLInputElement)?.value;
                    if (username && password) {
                      try {
                        // CSRF token al
                        const csrfRes = await fetch('/api/auth/csrf');
                        if (!csrfRes.ok) {
                          throw new Error('CSRF token alınamadı');
                        }
                        const csrfData = await csrfRes.json();
                        const csrfToken = csrfData.token;
                        
                        const res = await fetch('/api/auth/register', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-Token': csrfToken || ''
                          },
                          body: JSON.stringify({username, password})
                        });
                        
                        if (!res.ok) {
                          const errorData = await res.json().catch(() => ({ error: 'Bilinmeyen hata' }));
                          throw new Error(errorData.error || `HTTP ${res.status}`);
                        }
                        
                        const data = await res.json();
                        if (data.status === 'success' || res.status === 200) {
                          alert('Kullanıcı eklendi: ' + username);
                          (document.getElementById('new-username') as HTMLInputElement).value = '';
                          (document.getElementById('new-password') as HTMLInputElement).value = '';
                        } else {
                          alert(data.error || data.message || 'Kullanıcı eklenemedi');
                        }
                      } catch (e: any) {
                        console.error('❌ Register error:', e);
                        const errorMsg = e?.message || String(e) || 'Kullanıcı eklenemedi';
                        alert('Kayıt hatası: ' + errorMsg);
                      }
                    }
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    width: '100%'
                  }}
                >
                  ➕ Kullanıcı Ekle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal kaldırıldı - Artık direkt /feature/[slug] route'una yönlendirme yapıyoruz */}

        {/* AI Güven Göstergesi (Gauge/Bullet) */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '16px',
          marginBottom: '16px'
        }}>
          {(() => {
            // Ortalama güveni signals/dynamicSignals üzerinden tahmin et
            const pool = signals && signals.length > 0 ? signals : [];
            const avg = pool.length > 0 ? Math.round(pool.map((s: Signal)=> (typeof s.confidence==='number' ? s.confidence*100 : (s.accuracy||80))).reduce((a:number,b:number)=>a+b,0)/pool.length) : 78;
            const level = avg >= 85 ? 'Yüksek' : avg >= 70 ? 'Orta' : 'Düşük';
            const color = avg >= 85 ? '#10b981' : avg >= 70 ? '#f59e0b' : '#ef4444';
            return (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>🧭 AI Güven Göstergesi</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color }}>{level} ({avg}%)</div>
                </div>
                <div style={{ height: '12px', width: '100%', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                  <div style={{ width: avg + '%', height: '100%', background: color, transition: 'width 300ms ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Düşük</span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Orta</span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Yüksek</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Sektörel Sentiment Agregasyonu */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '16px',
          marginBottom: '16px'
        }}>
          {(() => {
            // sentimentAnalysis'i sektör bazında grupla
            const rows: SentimentItem[] = Array.isArray(sentimentAnalysis) ? sentimentAnalysis : [];
            const bySector: Record<string, { pos:number; neg:number; neu:number; n:number }> = {};
            rows.forEach((r: SentimentItem)=>{
              const sector = (getSectorForSymbol && typeof getSectorForSymbol==='function') ? (getSectorForSymbol(r.symbol) || 'Genel') : 'Genel';
              const g = bySector[sector] || { pos:0, neg:0, neu:0, n:0 };
              g.pos += r.positive || 0; g.neg += r.negative || 0; g.neu += r.neutral || 0; g.n += 1; bySector[sector]=g;
            });
            const items = Object.entries(bySector).map(([k,v])=>{
              const total = Math.max(1, v.pos+v.neg+v.neu);
              return { sector:k, pos: Math.round((v.pos/total)*100), neg: Math.round((v.neg/total)*100), neu: Math.round((v.neu/total)*100) };
            }).sort((a,b)=> b.pos-a.pos);
            if (items.length === 0) return (
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>📰 Sektörel Sentiment: Veri yok</div>
            );
            return (
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>📰 Sektörel Sentiment Özeti</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                  {items.map((it)=> (
                    <div key={it.sector} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>{it.sector}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', fontSize: '12px' }}>
                        <div style={{ color: '#065f46', fontWeight: 700 }}>+{it.pos}%</div>
                        <div style={{ color: '#1f2937', fontWeight: 700 }}>{it.neu}%</div>
                        <div style={{ color: '#7f1d1d', fontWeight: 700 }}>-{it.neg}%</div>
                      </div>
                      <div style={{ height: '6px', width: '100%', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', marginTop: '6px' }}>
                        <div style={{ width: it.pos + '%', height: '100%', background: '#10b981', float: 'left' }} />
                        <div style={{ width: it.neu + '%', height: '100%', background: '#94a3b8', float: 'left' }} />
                        <div style={{ width: it.neg + '%', height: '100%', background: '#ef4444', float: 'left' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* AI Haber Uyarıları (Kaynak Linkli) */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '16px',
          marginBottom: '16px'
        }}>
          {(() => {
            const news = [
              { title: 'TCMB faiz kararı sonrası bankacılıkta dalgalanma', source: 'BloombergHT', url: 'https://www.bloomberght.com/' },
              { title: 'Teknoloji hisselerinde pozitif momentum', source: 'Dünya', url: 'https://www.dunya.com/' },
              { title: 'Petrokimya sektöründe talep artışı', source: 'AA', url: 'https://www.aa.com.tr/' },
            ];
            return (
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>🗞️ AI Haber Uyarıları</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
                  {news.map((n, idx)=> (
                    <a key={idx} href={n.url} target="_blank" rel="noopener noreferrer" style={{
                      background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px', textDecoration: 'none'
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>{n.title}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{n.source}</div>
                    </a>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Multi-Timeframe (Çoklu Sembol) */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>🕒 Multi-Timeframe (Çoklu Sembol)</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>1H • 4H • 1D</div>
          </div>
          {(() => {
            // Derive top symbols from signals
            const syms = (signals && signals.length > 0 ? Array.from(new Set(signals.map((s: Signal)=>s.symbol))) : ['THYAO','AKBNK','EREGL','SISE','TUPRS','GARAN']).slice(0, 6);
            const horizons = ['1h','4h','1d'];
            function mtfScore(symbol: string, horizon: string) {
              // hashed pseudo score -1..+1
              const key = symbol + '-' + horizon;
              let h = 0; for (let i=0;i<key.length;i++) h = (h*31 + key.charCodeAt(i)) >>> 0;
              const val = ((h % 201) - 100) / 100; // -1..+1
              return val;
            }
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                {syms.map((sym) => (
                  <div key={sym} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>{sym}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>MTF</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {horizons.map((hz) => {
                        const v = mtfScore(sym, hz);
                        const up = v >= 0.05; const down = v <= -0.05; const neutral = !up && !down;
                        const bg = up ? '#10b98120' : down ? '#ef444420' : '#64748b20';
                        const fg = up ? '#10b981' : down ? '#ef4444' : '#64748b';
                        const label = hz.toUpperCase();
                        return (
                          <span key={hz} style={{ padding: '6px 10px', fontSize: '11px', fontWeight: 700, background: bg, color: fg, border: '1px solid ' + fg + '40', borderRadius: '999px' }}>{label}</span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

      </main>
    </div>
    )}
  </div>
  );
}

function DashboardV33Inner({ initialTab }: { initialTab?: DashboardTab }) {
  return (
    <ErrorBoundary>
      <LegalDisclaimer />
      <DashboardV33Content initialTab={initialTab} />
    </ErrorBoundary>
  );
}

export default DashboardV33Inner;
