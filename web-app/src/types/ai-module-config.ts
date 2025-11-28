/**
 * AI Modül Config Types
 * Feature flags ile modül açma/kapama için type tanımları
 */

export type AiModuleId =
  | 'traderGpt'
  | 'vizHub'
  | 'aiConfidence'
  | 'cognitiveInsights'
  | 'riskGuard'
  | 'metaModel'
  | 'v5Suite'
  | 'gamification'
  | 'planlar'
  | 'strategyBuilder'
  | 'investorPanel'
  | 'feedbackLoop';

export interface AiModuleConfig {
  traderGpt: boolean;
  vizHub: boolean;
  aiConfidence: boolean;
  cognitiveInsights: boolean;
  riskGuard: boolean;
  metaModel: boolean;
  v5Suite: boolean;
  gamification: boolean;
  planlar: boolean;
  strategyBuilder: boolean;
  investorPanel: boolean;
  feedbackLoop: boolean;
}

export interface AiModuleConfigContextValue {
  config: AiModuleConfig;
  isEnabled: (moduleId: AiModuleId) => boolean;
  enable: (moduleId: AiModuleId) => void;
  disable: (moduleId: AiModuleId) => void;
  toggle: (moduleId: AiModuleId) => void;
  enableAll: () => void;
  disableAll: () => void;
  reset: () => void;
}

// Default config (MVP için aktif modüller)
export const DEFAULT_AI_MODULE_CONFIG: AiModuleConfig = {
  traderGpt: true,
  vizHub: true,
  aiConfidence: true,
  cognitiveInsights: false,
  riskGuard: true,
  metaModel: false,
  v5Suite: false,
  gamification: false,
  planlar: false,
  strategyBuilder: true,
  investorPanel: false,
  feedbackLoop: false,
};

