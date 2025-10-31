/**
 * AI Core Store - Central orchestration layer for all AI modules
 * TraderGPT, Meta-Model, FinBERT, Risk Engine → unified state stream
 * Cursor can actively read from this store
 */

import { create } from 'zustand';

export interface AIPrediction {
  symbol: string;
  prediction: number; // price or percentage change
  confidence: number; // 0..1
  reason: string[];
  volatility: number;
  timestamp: string;
  source: 'LSTM' | 'Prophet' | 'FinBERT' | 'Meta-Ensemble' | 'RL-Optimizer';
}

export interface AISignal {
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  horizon: string;
  aiComment: string;
  timestamp: string;
}

export interface AIModelStatus {
  model: string;
  status: 'idle' | 'updating' | 'ready' | 'error';
  lastUpdate: string;
  accuracy?: number;
  drift?: number;
}

export interface AIFeedback {
  symbol: string;
  signalId: string;
  wasCorrect: boolean;
  actualOutcome: number;
  timestamp: string;
}

export interface AICoreState {
  // Predictions from all AI models
  predictions: AIPrediction[];
  
  // Unified signals
  signals: AISignal[];
  
  // Model statuses
  modelStatuses: AIModelStatus[];
  
  // Feedback loop
  feedback: AIFeedback[];
  feedbackScore: number; // 0..1 aggregate score
  
  // System status
  status: 'idle' | 'processing' | 'updating' | 'error';
  lastUpdate: string;
  
  // Actions
  updateFromAI: (predictions: AIPrediction[], signals: AISignal[]) => void;
  updateModelStatus: (model: string, status: AIModelStatus['status'], accuracy?: number, drift?: number) => void;
  addFeedback: (feedback: AIFeedback) => void;
  reset: () => void;
}

export const useAICore = create<AICoreState>((set, get) => ({
  predictions: [],
  signals: [],
  modelStatuses: [
    { model: 'LSTM-X', status: 'idle', lastUpdate: new Date().toISOString() },
    { model: 'Prophet++', status: 'idle', lastUpdate: new Date().toISOString() },
    { model: 'FinBERT-X', status: 'idle', lastUpdate: new Date().toISOString() },
    { model: 'RL-Optimizer', status: 'idle', lastUpdate: new Date().toISOString() },
    { model: 'Meta-Ensemble', status: 'idle', lastUpdate: new Date().toISOString() },
  ],
  feedback: [],
  feedbackScore: 0.91, // default high score
  status: 'idle',
  lastUpdate: new Date().toISOString(),
  
  updateFromAI: (predictions, signals) => {
    const now = new Date().toISOString();
    set({
      predictions,
      signals,
      status: 'ready',
      lastUpdate: now,
    });
  },
  
  updateModelStatus: (model, status, accuracy, drift) => {
    set((state) => ({
      modelStatuses: state.modelStatuses.map((m) =>
        m.model === model
          ? {
              ...m,
              status,
              lastUpdate: new Date().toISOString(),
              ...(accuracy !== undefined && { accuracy }),
              ...(drift !== undefined && { drift }),
            }
          : m
      ),
    }));
  },
  
  addFeedback: (feedback) => {
    set((state) => {
      const newFeedback = [...state.feedback, feedback];
      // Calculate aggregate feedback score
      const correctCount = newFeedback.filter((f) => f.wasCorrect).length;
      const score = newFeedback.length > 0 ? correctCount / newFeedback.length : 0.91;
      
      return {
        feedback: newFeedback.slice(-100), // Keep last 100 feedbacks
        feedbackScore: score,
      };
    });
  },
  
  reset: () => {
    set({
      predictions: [],
      signals: [],
      feedback: [],
      status: 'idle',
      lastUpdate: new Date().toISOString(),
    });
  },
}));

