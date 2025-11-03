/**
 * Portfolio Optimizer Backend API Integration
 * Real backend call for portfolio rebalancing
 */

import { Api } from '@/services/api';

export interface PortfolioOptimizeRequest {
  symbols: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'aggressive';
  method?: 'markowitz' | 'black-litterman' | 'risk-parity';
  constraints?: {
    maxWeight?: number;
    minWeight?: number;
    maxPositions?: number;
  };
}

export interface PortfolioOptimizeResponse {
  weights: Array<{ symbol: string; weight: number; allocation: number }>;
  metrics: {
    expectedReturn: number;
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
  recommendations: string[];
}

/**
 * Call backend API for portfolio optimization
 */
export async function optimizePortfolioBackend(
  request: PortfolioOptimizeRequest
): Promise<PortfolioOptimizeResponse> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:18085';
    const response = await fetch(`${API_BASE_URL}/api/portfolio/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Portfolio optimization failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data as PortfolioOptimizeResponse;
  } catch (error) {
    console.error('Portfolio optimization API error:', error);
    // Fallback to frontend mock if backend unavailable
    throw error;
  }
}



