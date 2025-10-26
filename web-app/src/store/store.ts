import { create } from 'zustand';

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

interface Signal {
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  price: number;
  change: number;
  timestamp: string;
  analysis?: string;
  technical?: {
    rsi: number;
    macd: number;
    volume_ratio: number;
  };
}

interface AppState {
  // Navigation
  activeTab: 'dashboard' | 'signals' | 'analysis' | 'operations' | 'advanced';
  setActiveTab: (tab: 'dashboard' | 'signals' | 'analysis' | 'operations' | 'advanced') => void;
  
  // Metrics
  metrics: Metrics | null;
  setMetrics: (metrics: Metrics) => void;
  
  // Signals
  signals: Signal[];
  setSignals: (signals: Signal[]) => void;
  
  // Chart
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  timeRange: '1D' | '1W' | '1M' | '3M';
  setTimeRange: (range: '1D' | '1W' | '1M' | '3M') => void;
  
  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Connection
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  // Metrics
  metrics: null,
  setMetrics: (metrics) => set({ metrics }),
  
  // Signals
  signals: [],
  setSignals: (signals) => set({ signals }),
  
  // Chart
  selectedSymbol: 'THYAO',
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  timeRange: '1D',
  setTimeRange: (range) => set({ timeRange: range }),
  
  // UI State
  isLoading: true,
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  // Connection
  isConnected: false,
  setIsConnected: (connected) => set({ isConnected: connected }),
}));


