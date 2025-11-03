'use client';

import { create } from 'zustand';

export type Regime = 'risk-on' | 'risk-off' | 'neutral';
export type Horizon = '5m' | '15m' | '30m' | '1h' | '4h' | '1d';

interface AppSSOTState {
  regime: Regime;
  horizon: Horizon;
  tz: 'UTC+3';
  accuracyWindow: '24h' | '7d' | '30d';
  dataVersion: string;
  setRegime: (r: Regime) => void;
  setHorizon: (h: Horizon) => void;
  syncFromUrl: (url: URL) => void;
}

export const useAppSSOT = create<AppSSOTState>((set, get) => ({
  regime: 'neutral',
  horizon: '1h',
  tz: 'UTC+3',
  accuracyWindow: '24h',
  dataVersion: 'Mock API v5.2',
  setRegime: (r) => set({ regime: r }),
  setHorizon: (h) => set({ horizon: h }),
  syncFromUrl: (url: URL) => {
    const r = (url.searchParams.get('regime') as Regime) || get().regime;
    const h = (url.searchParams.get('h') as Horizon) || get().horizon;
    set({ regime: r, horizon: h });
  },
}));


