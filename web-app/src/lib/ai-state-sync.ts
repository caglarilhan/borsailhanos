/**
 * AI Engine State Sync
 * Firestore/FastAPI persistence for AI Core Panel state
 */

import { Api } from '@/services/api';

export interface AIEngineState {
  risk_on: boolean;
  drift: number;
  latency: number;
  modelVersion: string;
  lastSync: string;
  config: {
    riskLevel: 'low' | 'medium' | 'high';
    strategyMode: 'scalper' | 'swing' | 'auto';
    alertThresholds: {
      minPriceChange: number;
      minConfidence: number;
      enabled: boolean;
    };
  };
}

/**
 * Load AI Engine state from backend
 */
export async function loadAIEngineState(userId?: string): Promise<AIEngineState | null> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:18085';
    const response = await fetch(`${API_BASE_URL}/api/ai/state${userId ? `?user_id=${userId}` : ''}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('AI Engine state not available, using defaults');
      return null;
    }

    const data = await response.json();
    return data as AIEngineState;
  } catch (error) {
    console.warn('Failed to load AI Engine state:', error);
    return null;
  }
}

/**
 * Save AI Engine state to backend
 */
export async function saveAIEngineState(state: Partial<AIEngineState>, userId?: string): Promise<boolean> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:18085';
    const response = await fetch(`${API_BASE_URL}/api/ai/state${userId ? `?user_id=${userId}` : ''}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...state,
        lastSync: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save AI Engine state: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Failed to save AI Engine state:', error);
    return false;
  }
}

/**
 * Sync AI Engine state with localStorage as fallback
 */
export function syncAIEngineStateLocal(state: AIEngineState): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('bistai_engine_state', JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save AI Engine state to localStorage:', error);
    }
  }
}

/**
 * Load AI Engine state from localStorage as fallback
 */
export function loadAIEngineStateLocal(): AIEngineState | null {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('bistai_engine_state');
      if (saved) {
        return JSON.parse(saved) as AIEngineState;
      }
    } catch (error) {
      console.warn('Failed to load AI Engine state from localStorage:', error);
    }
  }
  return null;
}



