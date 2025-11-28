'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { FeatureFlag, PlanFeatureMatrix, PlanTier } from '@/types/plan';
import { PLAN_FEATURES } from '@/types/plan';

interface PlanFeatureContextValue {
  plan: PlanTier;
  features: Record<FeatureFlag, boolean>;
  setPlan: (plan: PlanTier) => void;
  hasFeature: (feature: FeatureFlag) => boolean;
}

const STORAGE_KEY = 'borsa_plan_tier';

const PlanFeatureContext = createContext<PlanFeatureContextValue | undefined>(undefined);

export function PlanFeatureProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlanState] = useState<PlanTier>('pro');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY) as PlanTier | null;
    if (stored && ['free', 'pro', 'enterprise'].includes(stored)) {
      setPlanState(stored);
    }
  }, []);

  const setPlan = useCallback((next: PlanTier) => {
    setPlanState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const hasFeature = useCallback(
    (feature: FeatureFlag) => {
      return PLAN_FEATURES[plan][feature];
    },
    [plan],
  );

  const value = useMemo<PlanFeatureContextValue>(
    () => ({
      plan,
      features: PLAN_FEATURES[plan],
      setPlan,
      hasFeature,
    }),
    [plan, setPlan, hasFeature],
  );

  return <PlanFeatureContext.Provider value={value}>{children}</PlanFeatureContext.Provider>;
}

export function usePlanFeatures() {
  const context = useContext(PlanFeatureContext);
  if (!context) {
    throw new Error('usePlanFeatures must be used within PlanFeatureProvider');
  }
  return context;
}

