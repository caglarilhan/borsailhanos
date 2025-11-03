'use client';
import { create } from 'zustand';

interface FeedbackState {
  negatives: Record<string, number>;
  addNegative: (symbol: string) => void;
  getNegativeCount: (symbol: string) => number;
}

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
  negatives: {},
  addNegative: (symbol: string) => set(state => ({
    negatives: { ...state.negatives, [symbol]: (state.negatives[symbol] || 0) + 1 }
  })),
  getNegativeCount: (symbol: string) => get().negatives[symbol] || 0,
}));



