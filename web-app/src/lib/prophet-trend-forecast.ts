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

  // Volatility normalization: use log-returns + MinMax scaling for robustness
  const logReturns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const r = Math.log(Math.max(1e-9, prices[i])) - Math.log(Math.max(1e-9, prices[i - 1]));
    logReturns.push(r);
  }
  const minR = Math.min(...logReturns);
  const maxR = Math.max(...logReturns);
  const scaled: number[] = logReturns.map(r => {
    if (!isFinite(r) || !isFinite(minR) || !isFinite(maxR) || maxR === minR) return 0;
    return (r - minR) / (maxR - minR); // 0..1
  });
  // Reconstruct a normalized price-like series for regression
  const normSeries: number[] = [0.5];
  for (let i = 0; i < scaled.length; i++) {
    normSeries.push(Math.max(0, Math.min(1, normSeries[normSeries.length - 1] + (scaled[i] - 0.5) * 0.1)));
  }

  // Simple trend calculation (linear regression) over normalized series
  const n = prices.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    const y = i < normSeries.length ? normSeries[i] : normSeries[normSeries.length - 1];
    sumY += y;
    sumXY += i * y;
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate forecast
  const forecast7d: number[] = [];
  for (let i = 0; i < days; i++) {
    const futureIndex = n + i;
    const forecast = intercept + slope * futureIndex;
    // Map back to price scale by applying normalized delta on last price
    const lastPrice = prices[prices.length - 1];
    const normDelta = Math.max(-0.2, Math.min(0.2, forecast - (normSeries[normSeries.length - 1] || 0.5)));
    const mapped = lastPrice * (1 + normDelta);
    forecast7d.push(Math.max(0, mapped));
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
  const meanNorm = sumY / n;
  const variance = normSeries.reduce((sum, v) => sum + Math.pow(v - meanNorm, 2), 0) / Math.max(1, normSeries.length);
  
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

