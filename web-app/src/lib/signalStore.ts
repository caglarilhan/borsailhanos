/**
 * Signal Store - Single source of truth for AI signal decisions
 * Ensures consistency across all components (table, AI confidence cards, etc.)
 */

import { create } from 'zustand';

type FinalSignal = 'BUY' | 'HOLD' | 'SELL';

interface MultiTFSignal {
  h1: FinalSignal;
  h4: FinalSignal;
  d1: FinalSignal;
}

interface SignalState {
  finalSignal: Record<string, FinalSignal>;
  lastUpdateTick: number;
  setFromMultiTF: (symbol: string, tf: MultiTFSignal) => void;
  getFinalSignal: (symbol: string) => FinalSignal;
}

export const useSignalStore = create<SignalState>((set, get) => ({
  finalSignal: {},
  lastUpdateTick: 0,
  
  setFromMultiTF: (symbol: string, tf: MultiTFSignal) => {
    const votes = [tf.h1, tf.h4, tf.d1];
    
    // Voting system: BUY=+1, HOLD=0, SELL=-1
    const score = votes.reduce((acc, vote) => {
      return acc + ({ BUY: 1, HOLD: 0, SELL: -1 }[vote] || 0);
    }, 0);
    
    // Thresholds: >=2 = BUY, <=-1 = SELL, otherwise HOLD
    const final: FinalSignal = score >= 2 ? 'BUY' : score <= -1 ? 'SELL' : 'HOLD';
    
    set((state) => ({
      finalSignal: { ...state.finalSignal, [symbol]: final },
      lastUpdateTick: Date.now(),
    }));
  },
  
  getFinalSignal: (symbol: string) => {
    return get().finalSignal[symbol] || 'HOLD';
  },
}));

