/**
 * P5.2: Metrics Store - Global veri kaynağı (Zustand)
 * Tüm panellerde aynı selector → tek kaynak
 */

import { create } from 'zustand';
import { Metric, ForecastMetric, RiskMetric, AlphaMetric, SentimentMetric, DriftMetric } from '@/lib/metrics-schema';

export interface MetricsState {
  // Metrics by symbol and type
  forecasts: Record<string, ForecastMetric[]>; // symbol -> forecasts
  risks: Record<string, RiskMetric[]>; // symbol -> risks
  alphas: Record<string, AlphaMetric[]>; // symbol -> alphas
  sentiments: Record<string, SentimentMetric[]>; // symbol -> sentiments
  drifts: Record<string, DriftMetric[]>; // symbol -> drifts
  
  // Global state
  isDemo: boolean; // P5.2: Demo/Live splitter
  lastUpdate: string; // ISO timestamp
}

const initialState: MetricsState = {
  forecasts: {},
  risks: {},
  alphas: {},
  sentiments: {},
  drifts: {},
  isDemo: true, // Default to demo mode
  lastUpdate: new Date().toISOString(),
};

/**
 * Metrics Store
 */
export const useMetricsStore = create<MetricsState & {
  // Actions
  setForecast: (symbol: string, forecast: ForecastMetric) => void;
  setRisk: (symbol: string, risk: RiskMetric) => void;
  setAlpha: (symbol: string, alpha: AlphaMetric) => void;
  setSentiment: (symbol: string, sentiment: SentimentMetric) => void;
  setDrift: (symbol: string, drift: DriftMetric) => void;
  setIsDemo: (isDemo: boolean) => void;
  clearMetrics: (symbol?: string) => void;
  
  // Selectors (P5.2: Tek kaynak selectors)
  getForecast: (symbol: string, window: string) => ForecastMetric | undefined;
  getRisk24h: (symbol: string) => RiskMetric | undefined; // P5.2: Risk score tek kaynak
  getAlpha24h: (symbol: string) => AlphaMetric | undefined; // P5.2: Alpha tek benchmark
  getSentiment: (symbol: string, window?: string) => SentimentMetric | undefined;
  getDrift24s: (symbol: string) => DriftMetric | undefined; // P5.2: Drift format pp
}>((set, get) => ({
  ...initialState,
  
  // Actions
  setForecast: (symbol, forecast) => {
    set((state) => {
      const forecasts = state.forecasts[symbol] || [];
      // Replace existing forecast for same window
      const filtered = forecasts.filter(f => f.window !== forecast.window);
      return {
        forecasts: {
          ...state.forecasts,
          [symbol]: [...filtered, forecast],
        },
        lastUpdate: new Date().toISOString(),
      };
    });
  },
  
  setRisk: (symbol, risk) => {
    set((state) => {
      const risks = state.risks[symbol] || [];
      // Replace existing risk for same window
      const filtered = risks.filter(r => r.window !== risk.window);
      return {
        risks: {
          ...state.risks,
          [symbol]: [...filtered, risk],
        },
        lastUpdate: new Date().toISOString(),
      };
    });
  },
  
  setAlpha: (symbol, alpha) => {
    set((state) => {
      const alphas = state.alphas[symbol] || [];
      // Replace existing alpha for same window
      const filtered = alphas.filter(a => a.window !== alpha.window);
      return {
        alphas: {
          ...state.alphas,
          [symbol]: [...filtered, alpha],
        },
        lastUpdate: new Date().toISOString(),
      };
    });
  },
  
  setSentiment: (symbol, sentiment) => {
    set((state) => {
      const sentiments = state.sentiments[symbol] || [];
      // Replace existing sentiment for same window
      const filtered = sentiments.filter(s => s.window !== sentiment.window);
      return {
        sentiments: {
          ...state.sentiments,
          [symbol]: [...filtered, sentiment],
        },
        lastUpdate: new Date().toISOString(),
      };
    });
  },
  
  setDrift: (symbol, drift) => {
    set((state) => {
      const drifts = state.drifts[symbol] || [];
      // Replace existing drift for same window
      const filtered = drifts.filter(d => d.window !== drift.window);
      return {
        drifts: {
          ...state.drifts,
          [symbol]: [...filtered, drift],
        },
        lastUpdate: new Date().toISOString(),
      };
    });
  },
  
  setIsDemo: (isDemo) => {
    set({ isDemo, lastUpdate: new Date().toISOString() });
  },
  
  clearMetrics: (symbol) => {
    if (symbol) {
      set((state) => {
        const forecasts = { ...state.forecasts };
        const risks = { ...state.risks };
        const alphas = { ...state.alphas };
        const sentiments = { ...state.sentiments };
        const drifts = { ...state.drifts };
        delete forecasts[symbol];
        delete risks[symbol];
        delete alphas[symbol];
        delete sentiments[symbol];
        delete drifts[symbol];
        return {
          forecasts,
          risks,
          alphas,
          sentiments,
          drifts,
          lastUpdate: new Date().toISOString(),
        };
      });
    } else {
      set(initialState);
    }
  },
  
  // Selectors (P5.2: Tek kaynak)
  getForecast: (symbol, window) => {
    const forecasts = get().forecasts[symbol] || [];
    return forecasts.find(f => f.window === window);
  },
  
  getRisk24h: (symbol) => {
    // P5.2: Risk score tek kaynak → riskScore_24h
    const risks = get().risks[symbol] || [];
    return risks.find(r => r.window === '24s') || risks.find(r => r.window === '1d');
  },
  
  getAlpha24h: (symbol) => {
    // P5.2: Alpha tek benchmark → XU030_24h
    const alphas = get().alphas[symbol] || [];
    return alphas.find(a => a.window === '24s' && a.benchmark === 'XU030_24h') || 
           alphas.find(a => a.benchmark === 'XU030_24h');
  },
  
  getSentiment: (symbol, window = '1d') => {
    const sentiments = get().sentiments[symbol] || [];
    return sentiments.find(s => s.window === window) || sentiments[0];
  },
  
  getDrift24s: (symbol) => {
    // P5.2: Drift format → pp
    const drifts = get().drifts[symbol] || [];
    return drifts.find(d => d.window === '24s');
  },
}));

// Initialize from localStorage (client-side only)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    try {
      const stored = localStorage.getItem('metricsStore');
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<MetricsState>;
        // Validate and set stored state
        if (parsed.isDemo !== undefined) {
          useMetricsStore.getState().setIsDemo(parsed.isDemo);
        }
      }
    } catch (e) {
      console.warn('Failed to initialize metricsStore from localStorage:', e);
    }
  }, 0);
}

// Persist isDemo to localStorage
useMetricsStore.subscribe(
  (state) => state.isDemo,
  (isDemo) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('metricsStore', JSON.stringify({ isDemo }));
      } catch (e) {
        console.warn('Failed to persist metricsStore to localStorage:', e);
      }
    }
  }
);


