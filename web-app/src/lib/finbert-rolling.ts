/**
 * FinBERT Rolling Update
 * 7-day sliding window for sentiment analysis
 */

import { Api } from '@/services/api';

export interface FinBERTSentimentData {
  symbol: string;
  timestamp: string;
  positive: number;
  negative: number;
  neutral: number;
  impact: 'high' | 'medium' | 'low';
  source: string;
}

export interface FinBERTRollingResult {
  symbol: string;
  windowStart: string;
  windowEnd: string;
  sentiments: FinBERTSentimentData[];
  aggregated: {
    avgPositive: number;
    avgNegative: number;
    avgNeutral: number;
    trend: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
  };
}

/**
 * Get rolling FinBERT sentiment for a symbol
 */
export async function getRollingFinBERT(
  symbol: string,
  windowDays: number = 7
): Promise<FinBERTRollingResult | null> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:18085';
    const response = await fetch(
      `${API_BASE_URL}/api/sentiment/finbert/rolling?symbol=${symbol}&window_days=${windowDays}`,
      {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`FinBERT rolling failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data as FinBERTRollingResult;
  } catch (error) {
    console.warn('FinBERT rolling update unavailable, using fallback:', error);
    return generateMockRollingFinBERT(symbol, windowDays);
  }
}

/**
 * Generate mock rolling FinBERT result (fallback)
 */
function generateMockRollingFinBERT(symbol: string, windowDays: number): FinBERTRollingResult {
  const sentiments: FinBERTSentimentData[] = [];
  const now = new Date();
  
  for (let i = 0; i < windowDays; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    
    // Mock sentiment with trend
    const basePositive = 0.4 + Math.random() * 0.3; // 40-70%
    const baseNegative = 0.1 + Math.random() * 0.2; // 10-30%
    const baseNeutral = 1 - basePositive - baseNegative;
    
    // Normalize
    const sum = basePositive + baseNegative + baseNeutral;
    const positive = basePositive / sum;
    const negative = baseNegative / sum;
    const neutral = baseNeutral / sum;
    
    sentiments.push({
      symbol,
      timestamp: date.toISOString(),
      positive: Math.round(positive * 100) / 100,
      negative: Math.round(negative * 100) / 100,
      neutral: Math.round(neutral * 100) / 100,
      impact: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
      source: ['KAP', 'Twitter', 'Bloomberg', 'Dünya'][Math.floor(Math.random() * 4)],
    });
  }
  
  const avgPositive = sentiments.reduce((sum, s) => sum + s.positive, 0) / sentiments.length;
  const avgNegative = sentiments.reduce((sum, s) => sum + s.negative, 0) / sentiments.length;
  const avgNeutral = sentiments.reduce((sum, s) => sum + s.neutral, 0) / sentiments.length;
  
  // Determine trend
  const earlyPositive = sentiments.slice(-3).reduce((sum, s) => sum + s.positive, 0) / 3;
  const latePositive = sentiments.slice(0, 3).reduce((sum, s) => sum + s.positive, 0) / 3;
  const trend = latePositive > earlyPositive + 0.1 ? 'bullish' : latePositive < earlyPositive - 0.1 ? 'bearish' : 'neutral';
  
  // Confidence based on consistency
  const variance = sentiments.reduce((sum, s) => sum + Math.pow(s.positive - avgPositive, 2), 0) / sentiments.length;
  const confidence = Math.max(0, Math.min(1, 1 - Math.sqrt(variance) / 0.3));
  
  return {
    symbol,
    windowStart: new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000).toISOString(),
    windowEnd: now.toISOString(),
    sentiments,
    aggregated: {
      avgPositive,
      avgNegative,
      avgNeutral,
      trend,
      confidence,
    },
  };
}

/**
 * Update FinBERT rolling window cache
 */
export function updateFinBERTCache(symbol: string, result: FinBERTRollingResult): void {
  if (typeof window !== 'undefined') {
    try {
      const cacheKey = `finbert_rolling_${symbol}`;
      const cacheData = {
        ...result,
        cachedAt: new Date().toISOString(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache FinBERT rolling result:', error);
    }
  }
}



