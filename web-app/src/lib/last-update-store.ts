'use client';
import { create } from 'zustand';

interface LastUpdateState {
  lastUpdatedAt?: number; // epoch ms
  setLastUpdatedAt: (ts: number) => void;
}

export const useLastUpdateStore = create<LastUpdateState>((set) => ({
  lastUpdatedAt: undefined,
  setLastUpdatedAt: (ts) => set({ lastUpdatedAt: ts }),
}));


