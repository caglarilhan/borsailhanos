/**
 * Prophet Trend Forecast
 * Sprint 8: AI Motoru - Prophet ek modülü (haftalık trend tahmini)
 * Facebook Prophet tarzı trend tahmini
 */

export interface ProphetForecast {
  symbol: string;
  forecast7d: number[]; // 7 günlük tahmin
  trend: 'bullish' | 'bearish' | 'neutral';
  confidence: number; // 0-1
  changepoints: number[]; // Trend değişim noktaları
}

/**
 * Prophet-style trend forecast (simplified)
 * @param prices - Historical prices array
 * @param days - Forecast horizon (default: 7)
 * @returns ProphetForecast
 */
export function forecastProphetTrend(
  prices: number[],
  days: number = 7
): ProphetForecast {
  if (prices.length < 7) {
    // Not enough data, return neutral forecast
    return {
      symbol: '',
      forecast7d: Array(days).fill(prices[prices.length - 1] || 100),
      trend: 'neutral',
      confidence: 0.5,
      changepoints: [],
    };
  }

  // Simple trend calculation (linear regression)
  const n = prices.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += prices[i];
    sumXY += i * prices[i];
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate forecast
  const forecast7d: number[] = [];
  for (let i = 0; i < days; i++) {
    const futureIndex = n + i;
    const forecast = intercept + slope * futureIndex;
    forecast7d.push(Math.max(0, forecast)); // Ensure non-negative
  }

  // Determine trend
  let trend: 'bullish' | 'bearish' | 'neutral';
  if (slope > 0.01) {
    trend = 'bullish';
  } else if (slope < -0.01) {
    trend = 'bearish';
  } else {
    trend = 'neutral';
  }

  // Calculate confidence (based on trend strength and data variance)
  const variance = prices.reduce((sum, price, i) => {
    const mean = sumY / n;
    return sum + Math.pow(price - mean, 2);
  }, 0) / n;
  
  const trendStrength = Math.abs(slope);
  const confidence = Math.min(0.95, 0.5 + (trendStrength * 10) - (variance / 100));

  // Detect changepoints (simplified: where trend changes significantly)
  const changepoints: number[] = [];
  let prevSlope = (prices[1] - prices[0]);
  for (let i = 1; i < prices.length - 1; i++) {
    const currSlope = (prices[i + 1] - prices[i]);
    if (Math.sign(currSlope) !== Math.sign(prevSlope) && Math.abs(currSlope - prevSlope) > 0.05) {
      changepoints.push(i);
    }
    prevSlope = currSlope;
  }

  return {
    symbol: '',
    forecast7d,
    trend,
    confidence: Math.max(0.3, Math.min(0.95, confidence)),
    changepoints,
  };
}

/**
 * Get trend forecast for multiple symbols
 */
export function forecastMultipleSymbols(
  symbolPrices: Record<string, number[]>,
  days: number = 7
): Record<string, ProphetForecast> {
  const forecasts: Record<string, ProphetForecast> = {};
  
  for (const [symbol, prices] of Object.entries(symbolPrices)) {
    forecasts[symbol] = {
      ...forecastProphetTrend(prices, days),
      symbol,
    };
  }
  
  return forecasts;
}

