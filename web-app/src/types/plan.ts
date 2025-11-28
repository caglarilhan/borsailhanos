export type PlanTier = 'free' | 'pro' | 'enterprise';

export type FeatureFlag =
  | 'gamification'
  | 'investorPanel'
  | 'feedbackLoop'
  | 'v5Suite'
  | 'strategyBuilder';

export type PlanFeatureMatrix = Record<PlanTier, Record<FeatureFlag, boolean>>;

export const PLAN_FEATURES: PlanFeatureMatrix = {
  free: {
    gamification: false,
    investorPanel: false,
    feedbackLoop: false,
    v5Suite: false,
    strategyBuilder: true,
  },
  pro: {
    gamification: true,
    investorPanel: false,
    feedbackLoop: true,
    v5Suite: false,
    strategyBuilder: true,
  },
  enterprise: {
    gamification: true,
    investorPanel: true,
    feedbackLoop: true,
    v5Suite: true,
    strategyBuilder: true,
  },
};

