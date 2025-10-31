/**
 * Memory Bank - Sync with Cursor's memory system
 * Stores AI's last predictions and trends for optimization
 */

import { useAICore, AIPrediction, AISignal } from '@/store/aiCore';

export interface AIMemoryBank {
  lastPrediction: string; // e.g., "THYAO ₺268.3"
  confidence: number;
  riskLevel: number;
  finbertSentiment: number;
  metaModels: string[];
  feedbackScore: number;
  lastUpdate: string;
  trends?: {
    accuracy: number[];
    confidence: number[];
    volatility: number[];
  };
}

const MEMORY_KEY = 'ai_trader_bank';

/**
 * Load memory bank from localStorage (syncs with Cursor)
 */
export function loadMemoryBank(): AIMemoryBank | null {
  try {
    const stored = localStorage.getItem(MEMORY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load memory bank:', e);
  }
  return null;
}

/**
 * Save memory bank to localStorage (syncs with Cursor)
 */
export function saveMemoryBank(memory: AIMemoryBank): void {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
  } catch (e) {
    console.error('Failed to save memory bank:', e);
  }
}

/**
 * Update memory bank from AI Core state
 */
export function syncMemoryBankFromCore(): void {
  const state = useAICore.getState();
  
  if (state.signals.length === 0 && state.predictions.length === 0) {
    return;
  }
  
  // Get top signal
  const topSignal = state.signals.sort((a, b) => b.confidence - a.confidence)[0];
  const topPrediction = state.predictions.sort((a, b) => b.confidence - a.confidence)[0];
  
  const memory: AIMemoryBank = {
    lastPrediction: topPrediction
      ? `${topPrediction.symbol} ₺${topPrediction.prediction.toFixed(2)}`
      : topSignal
      ? `${topSignal.symbol} ${topSignal.signal}`
      : 'N/A',
    confidence: topPrediction?.confidence || topSignal?.confidence || 0,
    riskLevel: topPrediction?.volatility || 0,
    finbertSentiment: 0.75, // TODO: get from FinBERT module
    metaModels: state.modelStatuses.map((m) => m.model),
    feedbackScore: state.feedbackScore,
    lastUpdate: new Date().toISOString(),
    trends: {
      accuracy: state.feedback.map((f) => (f.wasCorrect ? 1 : 0)),
      confidence: state.predictions.slice(-10).map((p) => p.confidence),
      volatility: state.predictions.slice(-10).map((p) => p.volatility),
    },
  };
  
  saveMemoryBank(memory);
}

/**
 * Auto-sync every 30 seconds
 */
export function startMemoryBankSync(): () => void {
  const interval = setInterval(() => {
    syncMemoryBankFromCore();
  }, 30000);
  
  return () => clearInterval(interval);
}

