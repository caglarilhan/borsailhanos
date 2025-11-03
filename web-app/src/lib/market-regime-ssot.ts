/**
 * P0-C1: Market Regime Single Source of Truth (SSOT)
 * globalMarketRegime tek kaynaktan gelir; tüm UI panelleri bunu tüketir
 */

import { create } from 'zustand';

export type MarketRegime = 'risk_on' | 'risk_off' | 'neutral';

export interface MarketRegimeState {
  regime: MarketRegime;
  confidence: number; // 0-1 arası
  lastUpdated: string; // ISO timestamp
  indicators: {
    vix?: number;
    cds?: number;
    usdTry?: number;
    xu030?: number;
  };
}

const defaultRegime: MarketRegimeState = {
  regime: 'neutral',
  confidence: 0.5,
  lastUpdated: new Date().toISOString(),
  indicators: {},
};

/**
 * SSOT: Market Regime Store
 */
export const useMarketRegimeStore = create<{
  state: MarketRegimeState;
  setRegime: (regime: MarketRegime, confidence?: number, indicators?: MarketRegimeState['indicators']) => void;
  getRegimeLabel: () => string;
  getRegimeColor: () => string;
  getToggleLabel: () => string; // P5.2: Toggle button label (explicit action)
  toggleRegime: () => void; // P5.2: Toggle regime (risk_on ↔ risk_off)
}>((set, get) => ({
  state: defaultRegime,
  setRegime: (regime, confidence = 0.5, indicators = {}) => {
    set({
      state: {
        regime,
        confidence: Math.max(0, Math.min(1, confidence)), // Clamp 0-1
        lastUpdated: new Date().toISOString(),
        indicators,
      },
    });
    
    // Persist to localStorage (client-side only)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('marketRegime', JSON.stringify(get().state));
      } catch (e) {
        console.warn('Failed to persist market regime to localStorage:', e);
      }
    }
  },
  getRegimeLabel: () => {
    const { regime } = get().state;
    const labels: Record<MarketRegime, string> = {
      risk_on: 'Risk-On',
      risk_off: 'Risk-Off',
      neutral: 'Nötr',
    };
    return labels[regime];
  },
  getRegimeColor: () => {
    const { regime } = get().state;
    const colors: Record<MarketRegime, string> = {
      risk_on: 'bg-green-500/20 text-green-400 border-green-400/30',
      risk_off: 'bg-red-500/20 text-red-400 border-red-400/30',
      neutral: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
    };
    return colors[regime];
  },
  // P5.2: Toggle button label (explicit action)
  getToggleLabel: () => {
    const { regime } = get().state;
    const labels: Record<MarketRegime, string> = {
      risk_on: 'Switch to Risk-Off',
      risk_off: 'Switch to Risk-On',
      neutral: 'Switch to Risk-On',
    };
    return labels[regime];
  },
  // P5.2: Toggle regime
  toggleRegime: () => {
    const { regime } = get().state;
    const newRegime: MarketRegime = regime === 'risk_on' ? 'risk_off' : regime === 'risk_off' ? 'risk_on' : 'risk_on';
    get().setRegime(newRegime);
  },
}));

// Initialize from localStorage (client-side only)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    try {
      const stored = localStorage.getItem('marketRegime');
      if (stored) {
        const parsed = JSON.parse(stored) as MarketRegimeState;
        useMarketRegimeStore.getState().setRegime(
          parsed.regime,
          parsed.confidence,
          parsed.indicators
        );
      }
    } catch (e) {
      console.warn('Failed to initialize market regime from localStorage:', e);
    }
  }, 0);
}

/**
 * Calculate regime from indicators (helper function)
 */
export function calculateRegimeFromIndicators(indicators: {
  vix?: number;
  cds?: number;
  usdTry?: number;
  xu030?: number;
}): { regime: MarketRegime; confidence: number } {
  let riskScore = 0.5; // Neutral baseline
  
  // VIX: High VIX = risk-off
  if (indicators.vix !== undefined) {
    if (indicators.vix > 30) riskScore -= 0.3; // Risk-off
    else if (indicators.vix < 15) riskScore += 0.2; // Risk-on
  }
  
  // CDS: High CDS = risk-off
  if (indicators.cds !== undefined) {
    if (indicators.cds > 500) riskScore -= 0.2; // Risk-off
    else if (indicators.cds < 200) riskScore += 0.1; // Risk-on
  }
  
  // USD/TRY: High = risk-off (for Turkey)
  if (indicators.usdTry !== undefined) {
    if (indicators.usdTry > 35) riskScore -= 0.2; // Risk-off
    else if (indicators.usdTry < 32) riskScore += 0.1; // Risk-on
  }
  
  // XU030: Negative momentum = risk-off
  if (indicators.xu030 !== undefined && indicators.xu030 < 0) {
    riskScore -= 0.1; // Risk-off
  }
  
  // Clamp and determine regime
  const confidence = Math.max(0.3, Math.min(0.9, Math.abs(riskScore - 0.5) * 2));
  
  if (riskScore < 0.4) {
    return { regime: 'risk_off', confidence };
  } else if (riskScore > 0.6) {
    return { regime: 'risk_on', confidence };
  }
  
  return { regime: 'neutral', confidence };
}

