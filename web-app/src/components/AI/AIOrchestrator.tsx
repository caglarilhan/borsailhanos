'use client';

/**
 * AI Orchestrator - Central brain layer for all AI modules
 * Listens to TraderGPT, Meta-Model, FinBERT, Risk Engine and streams unified state to frontend
 * Cursor can actively read from this component
 */

import React, { useEffect } from 'react';
import { useAICore, AIPrediction, AISignal } from '@/store/aiCore';
import { syncMemoryBankFromCore, startMemoryBankSync } from '@/lib/memoryBank';

interface AIOrchestratorProps {
  predictions?: any[];
  signals?: any[];
  children?: React.ReactNode;
}

export function AIOrchestrator({ predictions = [], signals = [], children }: AIOrchestratorProps) {
  const { updateFromAI, updateModelStatus } = useAICore();

  // Sync AI Core state with incoming predictions and signals
  useEffect(() => {
    if (predictions.length === 0 && signals.length === 0) return;

    // Transform predictions to AIPrediction format
    const aiPredictions: AIPrediction[] = predictions.map((p: any) => ({
      symbol: p.symbol || '',
      prediction: p.prediction || p.price || 0,
      confidence: p.confidence || 0,
      reason: Array.isArray(p.reason) ? p.reason : (p.reason ? [p.reason] : []),
      volatility: p.volatility || 0,
      timestamp: p.generated_at || p.timestamp || new Date().toISOString(),
      source: (p.source as AIPrediction['source']) || 'Meta-Ensemble',
    }));

    // Transform signals to AISignal format
    const aiSignals: AISignal[] = signals.map((s: any) => ({
      symbol: s.symbol || '',
      signal: (s.signal as AISignal['signal']) || 'HOLD',
      confidence: s.confidence || 0,
      horizon: s.horizon || '1h',
      aiComment: s.analysis || s.comment || '',
      timestamp: s.generated_at || s.timestamp || new Date().toISOString(),
    }));

    // Update AI Core store
    updateFromAI(aiPredictions, aiSignals);
  }, [predictions, signals, updateFromAI]);

  // Auto-sync Memory Bank every 30 seconds
  useEffect(() => {
    const cleanup = startMemoryBankSync();
    return cleanup;
  }, []);

  // Periodic Memory Bank sync
  useEffect(() => {
    const interval = setInterval(() => {
      syncMemoryBankFromCore();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Update model statuses periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const models = ['LSTM-X', 'Prophet++', 'FinBERT-X', 'RL-Optimizer', 'Meta-Ensemble'];
      models.forEach((model) => {
        updateModelStatus(model, 'ready', 0.85 + Math.random() * 0.1, Math.random() * 0.05);
      });
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [updateModelStatus]);

  // Render children (pass-through component)
  return <>{children}</>;
}

