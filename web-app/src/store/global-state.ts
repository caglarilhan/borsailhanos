/**
 * Global State Store (SSOT - Single Source of Truth)
 * Zustand store for regime, risk_score, alpha, confidence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GlobalState {
  // Regime & Risk
  regime: 'risk-on' | 'risk-off' | 'neutral';
  riskScore: number; // 0-10 scale
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
  
  // Model Metrics
  accuracy: number; // 0-1 scale
  drift: number; // -1 to +1
  confidence: number; // 0-1 scale
  
  // Alpha & Performance
  alpha: number; // percentage points
  alphaTenor: '24s' | '1d' | '7d' | '30d'; // Time horizon for alpha calculation
  benchmark: 'XU030' | 'BIST30' | 'SPY' | 'QQQ'; // Benchmark for alpha
  
  // Actions
  setRegime: (regime: 'risk-on' | 'risk-off' | 'neutral') => void;
  setRiskScore: (score: number, level?: 'low' | 'medium' | 'high' | 'very_high') => void;
  setAccuracy: (accuracy: number) => void;
  setDrift: (drift: number) => void;
  setConfidence: (confidence: number) => void;
  setAlpha: (alpha: number, tenor?: '24s' | '1d' | '7d' | '30d', benchmark?: 'XU030' | 'BIST30' | 'SPY' | 'QQQ') => void;
  reset: () => void;
}

const initialState = {
  regime: 'neutral' as const,
  riskScore: 5,
  riskLevel: 'medium' as const,
  accuracy: 0.87,
  drift: 0,
  confidence: 0.85,
  alpha: 0,
  alphaTenor: '1d' as const,
  benchmark: 'XU030' as const,
};

export const useGlobalState = create<GlobalState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setRegime: (regime) => set({ regime }),
      
      setRiskScore: (score, level) => {
        const normalizedScore = Math.max(0, Math.min(10, score));
        const calculatedLevel = level || (
          normalizedScore <= 2 ? 'low' :
          normalizedScore <= 5 ? 'medium' :
          normalizedScore <= 7.5 ? 'high' : 'very_high'
        );
        set({ riskScore: normalizedScore, riskLevel: calculatedLevel });
      },
      
      setAccuracy: (accuracy) => set({ accuracy: Math.max(0, Math.min(1, accuracy)) }),
      
      setDrift: (drift) => set({ drift: Math.max(-1, Math.min(1, drift)) }),
      
      setConfidence: (confidence) => set({ confidence: Math.max(0, Math.min(1, confidence)) }),
      
      setAlpha: (alpha, tenor, benchmark) => set({
        alpha,
        alphaTenor: tenor || '1d',
        benchmark: benchmark || 'XU030',
      }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'bistai-global-state',
      partialize: (state) => ({
        regime: state.regime,
        riskScore: state.riskScore,
        riskLevel: state.riskLevel,
        alpha: state.alpha,
        alphaTenor: state.alphaTenor,
        benchmark: state.benchmark,
      }),
    }
  )
);

/**
 * Selectors for consistent access
 */
export const selectors = {
  regime: (state: GlobalState) => state.regime,
  riskScore: (state: GlobalState) => state.riskScore,
  riskLevel: (state: GlobalState) => state.riskLevel,
  accuracy: (state: GlobalState) => state.accuracy,
  drift: (state: GlobalState) => state.drift,
  confidence: (state: GlobalState) => state.confidence,
  alpha: (state: GlobalState) => state.alpha,
  alphaWithTenor: (state: GlobalState) => ({
    alpha: state.alpha,
    tenor: state.alphaTenor,
    benchmark: state.benchmark,
  }),
};



