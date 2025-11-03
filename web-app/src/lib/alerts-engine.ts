/**
 * Alerts Engine
 * Backend trigger for price/confidence thresholds
 */

import { Api } from '@/services/api';

export interface AlertTrigger {
  symbol: string;
  threshold: {
    priceChange?: number; // Percentage (e.g., 5 for 5%)
    confidence?: number; // Percentage (e.g., 70 for 70%)
    rsi?: number; // RSI threshold (e.g., 75)
  };
  alertType: 'price' | 'confidence' | 'rsi' | 'combined';
}

export interface AlertEvent {
  id: string;
  symbol: string;
  timestamp: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  type: 'price' | 'confidence' | 'rsi' | 'combined';
  metadata: {
    currentValue: number;
    threshold: number;
    change?: number;
  };
}

/**
 * Create alert trigger
 */
export async function createAlertTrigger(trigger: AlertTrigger): Promise<boolean> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:18085';
    const response = await fetch(`${API_BASE_URL}/api/alerts/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trigger),
    });

    if (!response.ok) {
      throw new Error(`Alert creation failed: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Failed to create alert trigger:', error);
    return false;
  }
}

/**
 * Get alert events (timeline)
 */
export async function getAlertEvents(limit: number = 50): Promise<AlertEvent[]> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:18085';
    const response = await fetch(`${API_BASE_URL}/api/alerts/events?limit=${limit}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Alert events fetch failed: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data.events) ? data.events : [];
  } catch (error) {
    console.warn('Failed to fetch alert events:', error);
    return [];
  }
}

/**
 * Check if alert should trigger (frontend validation)
 */
export function shouldTriggerAlert(
  symbol: string,
  currentPrice: number,
  previousPrice: number,
  currentConfidence: number,
  currentRSI: number,
  threshold: AlertTrigger['threshold']
): boolean {
  // Price change threshold
  if (threshold.priceChange !== undefined) {
    const priceChange = Math.abs((currentPrice - previousPrice) / previousPrice) * 100;
    if (priceChange >= threshold.priceChange) {
      return true;
    }
  }
  
  // Confidence threshold
  if (threshold.confidence !== undefined) {
    if (currentConfidence >= threshold.confidence) {
      return true;
    }
  }
  
  // RSI threshold
  if (threshold.rsi !== undefined) {
    if (currentRSI >= threshold.rsi) {
      return true;
    }
  }
  
  return false;
}



