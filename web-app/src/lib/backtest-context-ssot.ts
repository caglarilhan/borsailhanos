/**
 * P0-C3: Backtest Context Single Source of Truth (SSOT)
 * Backtest parametreleri (tarih aralığı, Tcost, rebalance periyodu) tek context'ten gelir
 */

import { create } from 'zustand';

export interface BacktestConfig {
  dateRange: {
    start: string; // ISO date
    end: string; // ISO date
  };
  transactionCost: number; // Percentage (e.g., 0.05 for 0.05%)
  rebalanceDays: number; // Days between rebalances
  slippage: number; // Percentage (e.g., 0.01 for 0.01%)
  benchmark: string; // e.g., 'BIST30', 'XU030'
  asOf: string; // ISO timestamp when config was set
  configHash: string; // Hash of config for validation
}

const defaultConfig: BacktestConfig = {
  dateRange: {
    start: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 180 days ago
    end: new Date().toISOString().split('T')[0], // Today
  },
  transactionCost: 0.0015, // P5.2: Tcost default 15bps (0.15%)
  rebalanceDays: 5,
  slippage: 0.01, // 0.01%
  benchmark: 'BIST30',
  asOf: new Date().toISOString(),
  configHash: '',
};

/**
 * Generate config hash
 */
function generateConfigHash(config: Omit<BacktestConfig, 'configHash' | 'asOf'>): string {
  const str = JSON.stringify(config);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * SSOT: Backtest Context Store
 */
export const useBacktestContextStore = create<{
  config: BacktestConfig;
  setConfig: (partial: Partial<Omit<BacktestConfig, 'configHash' | 'asOf'>>) => void;
  getConfigDisplay: () => string;
}>((set, get) => ({
  config: {
    ...defaultConfig,
    configHash: generateConfigHash(defaultConfig),
  },
  setConfig: (partial) => {
    const current = get().config;
    const newConfig: BacktestConfig = {
      ...current,
      ...partial,
      asOf: new Date().toISOString(),
    };
    // Regenerate hash
    const { configHash, asOf, ...configForHash } = newConfig;
    newConfig.configHash = generateConfigHash(configForHash);
    
    set({ config: newConfig });
    
    // Persist to localStorage (client-side only)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('backtestConfig', JSON.stringify(newConfig));
      } catch (e) {
        console.warn('Failed to persist backtest config to localStorage:', e);
      }
    }
  },
  getConfigDisplay: () => {
    const { config } = get();
    return `Window: ${config.dateRange.start} → ${config.dateRange.end} | Tcost: ${(config.transactionCost * 100).toFixed(2)}% | Rebalance: ${config.rebalanceDays}g | Slippage: ${(config.slippage * 100).toFixed(2)}% | Benchmark: ${config.benchmark}`;
  },
}));

// Initialize from localStorage (client-side only)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    try {
      const stored = localStorage.getItem('backtestConfig');
      if (stored) {
        const parsed = JSON.parse(stored) as BacktestConfig;
        useBacktestContextStore.getState().setConfig({
          dateRange: parsed.dateRange,
          transactionCost: parsed.transactionCost,
          rebalanceDays: parsed.rebalanceDays,
          slippage: parsed.slippage,
          benchmark: parsed.benchmark,
        });
      }
    } catch (e) {
      console.warn('Failed to initialize backtest config from localStorage:', e);
    }
  }, 0);
}

