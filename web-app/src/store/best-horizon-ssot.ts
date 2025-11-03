/**
 * P5.2: Best Horizon Single Source of Truth (SSOT)
 * best_horizon tek kaynaktan gelsin (server → store)
 * UI hiçbir yerde yerelde hesaplamasın
 */

import { create } from 'zustand';

export type Horizon = '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '7d' | '30d';

export interface BestHorizonState {
  bestHorizons: Record<string, Horizon>; // symbol -> best horizon
  lastUpdated: string; // ISO timestamp
}

const defaultState: BestHorizonState = {
  bestHorizons: {},
  lastUpdated: new Date().toISOString(),
};

/**
 * SSOT: Best Horizon Store
 */
export const useBestHorizonStore = create<{
  state: BestHorizonState;
  setBestHorizon: (symbol: string, horizon: Horizon) => void;
  setBestHorizons: (horizons: Record<string, Horizon>) => void;
  getBestHorizon: (symbol: string) => Horizon | null;
}>((set, get) => ({
  state: defaultState,
  setBestHorizon: (symbol, horizon) => {
    set({
      state: {
        ...get().state,
        bestHorizons: {
          ...get().state.bestHorizons,
          [symbol]: horizon,
        },
        lastUpdated: new Date().toISOString(),
      },
    });
  },
  setBestHorizons: (horizons) => {
    set({
      state: {
        bestHorizons: horizons,
        lastUpdated: new Date().toISOString(),
      },
    });
  },
  getBestHorizon: (symbol) => {
    return get().state.bestHorizons[symbol] || null;
  },
}));

/**
 * Sync best horizons from server response
 */
export function syncBestHorizonsFromServer(data: Array<{
  symbol: string;
  best_horizon?: string;
  horizons?: Record<string, any>;
}>): void {
  const bestHorizons: Record<string, Horizon> = {};
  
  data.forEach(item => {
    if (item.best_horizon) {
      const horizon = item.best_horizon as Horizon;
      if (['5m', '15m', '30m', '1h', '4h', '1d', '7d', '30d'].includes(horizon)) {
        bestHorizons[item.symbol] = horizon;
      }
    } else if (item.horizons) {
      // Find best horizon from horizons object (highest confidence)
      let bestHorizon: Horizon | null = null;
      let bestConfidence = -1;
      
      Object.entries(item.horizons).forEach(([horizon, data]: [string, any]) => {
        if (['5m', '15m', '30m', '1h', '4h', '1d', '7d', '30d'].includes(horizon)) {
          const confidence = data.confidence || data.conf || 0;
          if (confidence > bestConfidence) {
            bestConfidence = confidence;
            bestHorizon = horizon as Horizon;
          }
        }
      });
      
      if (bestHorizon) {
        bestHorizons[item.symbol] = bestHorizon;
      }
    }
  });
  
  useBestHorizonStore.getState().setBestHorizons(bestHorizons);
}


