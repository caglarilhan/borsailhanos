/**
 * Actions Map for Dashboard Buttons
 * Centralized action handlers for all buttons in the application
 */

import { useRouter } from 'next/navigation';

export const actions = {
  // === ÜST MENÜ ===
  gpt: () => alert('🤖 TraderGPT açılıyor...'),
  viz: () => alert('📊 Gelişmiş görselleştirme hub açılıyor...'),
  ai: () => alert('🧠 AI güven açıklama açılıyor...'),
  comment: () => alert('💬 Cognitive AI yorumlar açılıyor...'),
  risk: () => alert('📈 Volatilite modeli çalıştırılıyor...'),
  meta: () => alert('🧠 Meta-Model Engine açılıyor...'),
  plans: () => window.location.href = '/plans',
  strategy: () => alert('🎯 Strateji oluşturma ekranı açılıyor...'),
  investor: () => alert('🎯 AI Yatırımcı analizi açılıyor...'),
  watchlist: () => window.location.href = '/watchlist',
  admin: () => window.location.href = '/admin',
  enterprise: () => alert('🚀 V5.0 Enterprise modülü açılıyor...'),

  // === PAZAR SEÇİMİ ===
  bist: () => alert('🇹🇷 BIST sinyalleri yüklendi.'),
  nyse: () => alert('🇺🇸 NYSE sinyalleri yüklendi.'),
  nasdaq: () => alert('🇺🇸 NASDAQ sinyalleri yüklendi.'),

  // === FİLTRELER ===
  filter: () => alert('🔽 Filtre menüsü açıldı.'),
  filter80: () => alert('✅ %80+ doğruluk filtrelendi.'),

  // === TABLO SATIRLARI ===
  thyao: () => alert('🧠 AI açıklaması: THYAO'),
  tuprs: () => alert('🧠 AI açıklaması: TUPRS'),

  // === ANALİZ & RAPOR ===
  moreSignals: () => alert('➕ 2 sinyal daha yüklendi.'),
  rebalance: () => alert('🔄 Portföy rebalance hesaplandı (5 gün).'),
  detailedReport: () => alert('📊 Detaylı rapor görüntülendi.'),

  // === ALT BUTONLAR ===
  share: () => {
    navigator.clipboard.writeText(window.location.href).then(() =>
      alert('📤 Sayfa linki panoya kopyalandı!')
    );
  },
  closeNotification: () => alert('🔔 Bildirim kapatıldı.'),
  level: () => alert('🏆 Seviye bilgisi açıldı.'),
  feedback: () => alert('🔄 Feedback formu açıldı.'),
  logout: () => {
    alert('🚪 Çıkış yapılıyor...');
    window.location.href = '/login';
  },
  // Utility defaults (may be overridden by createActions counterparts)
  openV50Tab: (tab: string) => { console.log('openV50Tab:', tab); },
  scrollToSignals: (symbol?: string) => {
    if (symbol) console.log('Focus symbol:', symbol);
    const el = document.getElementById('signals-table');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },
  refreshData: () => alert('🔄 Veri yenileniyor...'),
  openLogs: () => alert('📋 Log ekranı açılıyor...'),
  featureCardOpen: (label: string) => {
    alert(`🚀 ${label} özelliği açılıyor...`);
  },
  // === GENEL ===
  closeModal: () => {
    try {
      const active = document.activeElement as HTMLElement | null;
      if (active) active.blur();
    } catch {}
  },
};

/**
 * Create action handlers map (legacy support)
 * All button actions are centralized here
 */
export function createActions({
  openPanel,
  setShowTraderGPT,
  setShowAdvancedViz,
  setOpenAIConfidence,
  setOpenCognitive,
  setOpenRisk,
  setOpenMetaModel,
  setOpenPlan,
  setShowSubscription,
  setOpenStrategy,
  setShowStrategyBuilder,
  setOpenInvestor,
  setShowInvestorPanel,
  setOpenWatchlist,
  setOpenAdmin,
  setOpenEnterprise,
  setShowV50Module,
  setShowGamification,
  setShowFeedbackLoop,
  setSelectedForXAI,
  setSelectedMarket,
  setVisibleSignals,
  openExplanation,
  // new for generic explain and alert handling
  
  loadMore,
  rebalance,
  openReport,
  shareAnalysis,
  closeNotification,
  openLevel,
  openFeedback,
  logout,
  closeModal,
  closePanel,
  isLoggedIn,
}: {
  openPanel?: (panel: string) => void;
  setShowTraderGPT?: (v: boolean) => void;
  setShowAdvancedViz?: (v: boolean) => void;
  setOpenAIConfidence?: (v: boolean) => void;
  setOpenCognitive?: (v: boolean) => void;
  setOpenRisk?: (v: boolean) => void;
  setOpenMetaModel?: (v: boolean) => void;
  setOpenPlan?: (v: boolean) => void;
  setShowSubscription?: (v: boolean) => void;
  setOpenStrategy?: (v: boolean) => void;
  setShowStrategyBuilder?: (v: boolean) => void;
  setOpenInvestor?: (v: boolean) => void;
  setShowInvestorPanel?: (v: boolean) => void;
  setOpenWatchlist?: (v: boolean) => void;
  setOpenAdmin?: (v: boolean) => void;
  setOpenEnterprise?: (v: boolean) => void;
  setShowV50Module?: (v: boolean) => void;
  setShowGamification?: (v: boolean) => void;
  setShowFeedbackLoop?: (v: boolean) => void;
  setSelectedForXAI?: (symbol: string | null) => void;
  setSelectedMarket?: (market: 'BIST' | 'NYSE' | 'NASDAQ') => void;
  setVisibleSignals?: (count: number) => void;
  openExplanation: (symbol: string) => void;
  
  loadMore: () => void;
  rebalance: () => void;
  openReport: () => void;
  shareAnalysis: () => void;
  closeNotification: (id: string) => void;
  openLevel: () => void;
  openFeedback: () => void;
  logout: () => void;
  closeModal: () => void;
  closePanel?: () => void;
  isLoggedIn?: boolean;
}): ActionHandlers {
  return {
    // ÜST MENÜ - Chat & Visualization
    gpt: () => {
      console.log('🤖 GPT clicked');
      if (openPanel) openPanel('tradergpt');
      if (setShowTraderGPT) setShowTraderGPT(true);
    },
    viz: () => {
      console.log('📊 Viz clicked');
      if (openPanel) openPanel('viz');
      if (setShowAdvancedViz) setShowAdvancedViz(true);
    },
    ai: () => {
      console.log('🧠 AI Confidence clicked');
      if (openPanel) openPanel('aiconf');
      if (setOpenAIConfidence) setOpenAIConfidence(true);
    },
    aiComment: () => {
      console.log('💬 AI Comment clicked');
      if (openPanel) openPanel('cognitive');
      if (setOpenCognitive) setOpenCognitive(true);
    },
    riskModel: () => {
      console.log('📈 Risk Model clicked');
      if (openPanel) openPanel('risk');
      if (setOpenRisk) setOpenRisk(true);
    },
    metaModel: () => {
      console.log('🧠 Meta-Model clicked');
      if (openPanel) openPanel('meta');
      if (setOpenMetaModel) setOpenMetaModel(true);
    },
    plans: () => {
      console.log('💎 Plans clicked');
      if (setOpenPlan) setOpenPlan(true);
      if (setShowSubscription) setShowSubscription(true);
    },
    strategy: () => {
      console.log('🎯 Strategy clicked');
      if (setOpenStrategy) setOpenStrategy(true);
      if (setShowStrategyBuilder) setShowStrategyBuilder(true);
    },
    investor: () => {
      console.log('🎯 Investor clicked');
      if (setOpenInvestor) setOpenInvestor(true);
      if (setShowInvestorPanel) setShowInvestorPanel(true);
    },
    watchlist: () => {
      console.log('📋 Watchlist clicked');
      if (setOpenWatchlist) setOpenWatchlist(true);
    },
    admin: () => {
      console.log('⚙️ Admin clicked');
      if (setOpenAdmin) setOpenAdmin(true);
    },
    enterprise: () => {
      console.log('V5.0 Enterprise clicked');
      if (setShowV50Module) setShowV50Module(true);
    },
    // PAZAR SEÇİMİ
    bist: () => {
      console.log('🇹🇷 BIST clicked');
      if (setSelectedMarket) setSelectedMarket('BIST');
    },
    nyse: () => {
      console.log('🇺🇸 NYSE clicked');
      if (setSelectedMarket) setSelectedMarket('NYSE');
    },
    nasdaq: () => {
      console.log('🇺🇸 NASDAQ clicked');
      if (setSelectedMarket) setSelectedMarket('NASDAQ');
    },
    // FİLTRELER
    filter: () => {
      console.log('🔽 Filter clicked');
      // Filter toggle logic
    },
    filter80: () => {
      console.log('✅ %80+ filter clicked');
      if (setFilterAccuracy) setFilterAccuracy(80);
    },
    
    // TABLO SATIRLARI - AI açıklamaları
    thyao: () => {
      console.log('🧠 THYAO explanation clicked');
      openExplanation('THYAO');
      if (setSelectedForXAI) setSelectedForXAI('THYAO');
      if (openPanel) openPanel('aiconf');
    },
    tuprs: () => {
      console.log('🧠 TUPRS explanation clicked');
      openExplanation('TUPRS');
      if (setSelectedForXAI) setSelectedForXAI('TUPRS');
      if (openPanel) openPanel('aiconf');
    },
    explainTHYAO: () => {
      console.log('🧠 THYAO explanation clicked');
      openExplanation('THYAO');
      if (setSelectedForXAI) setSelectedForXAI('THYAO');
      if (openPanel) openPanel('aiconf');
    },
    explainTUPRS: () => {
      console.log('🧠 TUPRS explanation clicked');
      openExplanation('TUPRS');
      if (setSelectedForXAI) setSelectedForXAI('TUPRS');
      if (openPanel) openPanel('aiconf');
    },
    explainAAPL: () => {
      console.log('🧠 AAPL explanation clicked');
      openExplanation('AAPL');
      if (setSelectedForXAI) setSelectedForXAI('AAPL');
      if (openPanel) openPanel('aiconf');
    },
    explainNVDA: () => {
      console.log('🧠 NVDA explanation clicked');
      openExplanation('NVDA');
      if (setSelectedForXAI) setSelectedForXAI('NVDA');
      if (openPanel) openPanel('aiconf');
    },
    // LİSTELEME / ANALİZ
    moreSignals: () => {
      console.log('➕ More signals clicked');
      if (setVisibleSignals) setVisibleSignals(100);
    },
    loadMore: () => {
      console.log('Load more clicked');
      if (setVisibleSignals) setVisibleSignals(100);
    },
    rebalance: () => {
      console.log('🔄 Rebalance clicked');
      rebalance();
    },
    detailedReport: () => {
      console.log('📊 Detailed report clicked');
      openReport();
    },
    // ALT BUTONLAR
    share: async () => {
      console.log('📤 Share clicked');
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('📤 Sayfa linki panoya kopyalandı!');
      } catch (e) {
        alert('Link kopyalanamadı');
      }
    },
    level: () => {
      console.log('🏆 Level clicked');
      if (setShowGamification) setShowGamification(true);
    },
    feedback: () => {
      console.log('🔄 Feedback clicked');
      alert('💬 Geri bildirim formu açılacak...');
    },
    logout: () => {
      console.log('🚪 Logout clicked');
      logout();
    },
    // Diğer
    closeNotif: (id: string) => {
      closeNotification(id);
    },
    closeModal: () => {
      closeModal();
      if (closePanel) closePanel();
    },
    report: () => openReport(),
    
    // NEW: Generic explain handler for any symbol
    explainSymbol: (symbol: string) => {
      openExplanation(symbol);
      if (setSelectedForXAI) setSelectedForXAI(symbol);
      if (openPanel) openPanel('aiconf');
    },
    
    // NEW: Alert click handler - parse symbol and focus signals
    openAlert: (alert: any) => {
      try {
        const message: string = alert?.message || '';
        const match = message.match(/[A-Z]{2,8}/);
        const symbol = match ? match[0] : undefined;
        if (symbol) {
          if (setSelectedForXAI) setSelectedForXAI(symbol);
          openExplanation(symbol);
          if (openPanel) openPanel('aiconf');
        }
        const el = document.getElementById('signals-table');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (e) {
        console.error('openAlert error', e);
      }
    },
  };
}
