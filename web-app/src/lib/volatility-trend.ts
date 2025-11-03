/**
 * P5.2: Volatility Trend Calculator
 * Volatilite trendini σΔ% formatında sayısallaştır
 */

export interface VolatilityTrend {
  current: number; // Current volatility (standard deviation)
  previous: number; // Previous volatility
  changePercent: number; // Change in percentage
  trend: 'increasing' | 'decreasing' | 'stable';
  period: string; // e.g., "7g", "24h"
  message: string;
  color: string;
}

/**
 * Calculate volatility trend from historical data
 */
export function calculateVolatilityTrend(
  currentVolatility: number,
  previousVolatility: number,
  period: string = '7g'
): VolatilityTrend {
  if (previousVolatility === 0 || isNaN(previousVolatility) || isNaN(currentVolatility)) {
    return {
      current: currentVolatility,
      previous: previousVolatility,
      changePercent: 0,
      trend: 'stable',
      period,
      message: 'Volatilite verisi mevcut değil',
      color: 'text-slate-600',
    };
  }

  const changePercent = ((currentVolatility - previousVolatility) / previousVolatility) * 100;
  
  let trend: 'increasing' | 'decreasing' | 'stable';
  let message: string;
  let color: string;

  if (Math.abs(changePercent) < 2) {
    trend = 'stable';
    message = `Volatilite stabil (±${Math.abs(changePercent).toFixed(1)}%)`;
    color = 'text-slate-600';
  } else if (changePercent > 0) {
    trend = 'increasing';
    message = `Volatilite artışı: +${changePercent.toFixed(1)}% (${period})`;
    color = 'text-red-600';
  } else {
    trend = 'decreasing';
    message = `Volatilite azalışı: ${changePercent.toFixed(1)}% (${period})`;
    color = 'text-green-600';
  }

  return {
    current: currentVolatility,
    previous: previousVolatility,
    changePercent,
    trend,
    period,
    message,
    color,
  };
}

/**
 * Format volatility change as σΔ%
 */
export function formatVolatilityChange(changePercent: number): string {
  const sign = changePercent >= 0 ? '+' : '';
  return `${sign}${changePercent.toFixed(1)}%`;
}


