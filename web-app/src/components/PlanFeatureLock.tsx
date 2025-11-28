'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import type { FeatureFlag, PlanTier } from '@/types/plan';

interface PlanFeatureLockProps {
  feature: FeatureFlag;
  requiredPlan: PlanTier;
  currentPlan: PlanTier;
}

const featureLabels: Record<FeatureFlag, string> = {
  gamification: 'Gamification',
  investorPanel: 'Investor Panel',
  feedbackLoop: 'Feedback Loop',
  v5Suite: 'V5 Enterprise Suite',
  strategyBuilder: 'Strategy Builder',
};

export function PlanFeatureLock({ feature, requiredPlan, currentPlan }: PlanFeatureLockProps) {
  return (
    <div className="bg-white/70 border border-dashed border-slate-300 rounded-xl p-6 text-center flex flex-col items-center justify-center gap-3 h-full">
      <Lock className="w-8 h-8 text-slate-400" />
      <div className="text-sm font-semibold text-slate-700">{featureLabels[feature]} kilitli</div>
      <p className="text-xs text-slate-500">
        Bu özellik {requiredPlan.toUpperCase()} planında açılıyor. Mevcut planınız: {currentPlan.toUpperCase()}.
      </p>
    </div>
  );
}

