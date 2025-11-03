/**
 * Metrics Harmonizer
 * Single endpoint for accuracy, drift, alpha consistency
 */

import { Api } from '@/services/api';

export interface MetricsSummary {
  accuracy: {
    value: number; // 0-1 scale
    source: 'daily' | '30d' | 'rolling';
    timestamp: string;
  };
  drift: {
    value: number; // -1 to +1
    trend: 'increasing' | 'decreasing' | 'stable';
    timestamp: string;
  };
  confidence: {
    value: number; // 0-1 scale
    change: number; // percentage points (e.g., 1.85 for +1.85pp)
    timestamp: string;
  };
  alpha: {
    value: number; // percentage points
    tenor: '24s' | '1d' | '7d' | '30d';
    benchmark: 'XU030' | 'BIST30' | 'SPY' | 'QQQ';
    definition: string; // e.g., "(strategy_return - benchmark_return) in pp"
    timestamp: string;
  };
}

/**
 * Fetch harmonized metrics summary from backend
 */
export async function fetchMetricsSummary(): Promise<MetricsSummary | null> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:18085';
    const response = await fetch(`${API_BASE_URL}/api/metrics/summary`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Metrics summary failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data as MetricsSummary;
  } catch (error) {
    console.warn('Metrics summary unavailable, using fallback:', error);
    return generateMockMetricsSummary();
  }
}

/**
 * Generate mock metrics summary (fallback)
 */
function generateMockMetricsSummary(): MetricsSummary {
  return {
    accuracy: {
      value: 0.873,
      source: '30d',
      timestamp: new Date().toISOString(),
    },
    drift: {
      value: -0.004,
      trend: 'stable',
      timestamp: new Date().toISOString(),
    },
    confidence: {
      value: 0.891,
      change: 1.85, // +1.85pp
      timestamp: new Date().toISOString(),
    },
    alpha: {
      value: -0.38, // -0.38pp
      tenor: '1d',
      benchmark: 'XU030',
      definition: '(strategy_return - benchmark_return) in pp',
      timestamp: new Date().toISOString(),
    },
  };
}



