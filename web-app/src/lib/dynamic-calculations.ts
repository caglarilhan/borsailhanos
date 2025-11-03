/**
 * Dynamic Calculations
 * Sprint 1: Veri Güncelliği - Dinamik değer hesaplamaları
 * RSI, MACD, volatilite, fiyat değişim değerleri dinamik hesaplanır
 */

/**
 * Calculate RSI (Relative Strength Index) from price array
 * @param prices - Array of closing prices
 * @param period - RSI period (default: 14)
 * @returns RSI value (0-100)
 */
export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50; // Default neutral RSI
  
  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  
  const recentChanges = changes.slice(-period);
  const gains = recentChanges.filter(c => c > 0);
  const losses = recentChanges.filter(c => c < 0).map(c => -c);
  
  const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / period : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / period : 0;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  return Math.max(0, Math.min(100, rsi));
}

/**
 * Calculate MACD from price array
 * @param prices - Array of closing prices
 * @param fastPeriod - Fast EMA period (default: 12)
 * @param slowPeriod - Slow EMA period (default: 26)
 * @param signalPeriod - Signal EMA period (default: 9)
 * @returns MACD line, signal line, histogram
 */
export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number; signal: number; histogram: number } {
  if (prices.length < slowPeriod + signalPeriod) {
    return { macd: 0, signal: 0, histogram: 0 };
  }
  
  // Simple EMA calculation
  const ema = (data: number[], period: number): number => {
    if (data.length < period) return data[data.length - 1] || 0;
    const multiplier = 2 / (period + 1);
    let emaValue = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = period; i < data.length; i++) {
      emaValue = (data[i] - emaValue) * multiplier + emaValue;
    }
    
    return emaValue;
  };
  
  const fastEMA = ema(prices, fastPeriod);
  const slowEMA = ema(prices, slowPeriod);
  const macd = fastEMA - slowEMA;
  
  // For signal line, we need MACD history, but for simplicity use recent prices
  const macdHistory = prices.slice(-signalPeriod).map((_, i) => {
    const f = ema(prices.slice(0, prices.length - signalPeriod + i + 1), fastPeriod);
    const s = ema(prices.slice(0, prices.length - signalPeriod + i + 1), slowPeriod);
    return f - s;
  });
  
  const signal = ema(macdHistory, signalPeriod);
  const histogram = macd - signal;
  
  return { macd, signal, histogram };
}

/**
 * Calculate volatility (standard deviation of returns)
 * @param prices - Array of closing prices
 * @param period - Period for calculation (default: 20)
 * @returns Volatility as percentage
 */
export function calculateVolatility(prices: number[], period: number = 20): number {
  if (prices.length < period + 1) return 0;
  
  const recentPrices = prices.slice(-period - 1);
  const returns: number[] = [];
  
  for (let i = 1; i < recentPrices.length; i++) {
    returns.push((recentPrices[i] - recentPrices[i - 1]) / recentPrices[i - 1]);
  }
  
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  return stdDev * 100; // Return as percentage
}

/**
 * Calculate price change percentage
 * @param currentPrice - Current price
 * @param previousPrice - Previous price
 * @returns Change percentage
 */
export function calculatePriceChange(currentPrice: number, previousPrice: number): number {
  if (!previousPrice || previousPrice === 0) return 0;
  return ((currentPrice - previousPrice) / previousPrice) * 100;
}

/**
 * Calculate 7-day movement statistics
 * @param prices - Array of closing prices (last 7 days)
 * @returns Movement statistics
 */
export function calculate7DayMovement(prices: number[]): {
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volatility: number;
} {
  if (prices.length < 2) {
    return { change: 0, changePercent: 0, high: prices[0] || 0, low: prices[0] || 0, volatility: 0 };
  }
  
  const startPrice = prices[0];
  const endPrice = prices[prices.length - 1];
  const change = endPrice - startPrice;
  const changePercent = calculatePriceChange(endPrice, startPrice);
  const high = Math.max(...prices);
  const low = Math.min(...prices);
  const volatility = calculateVolatility(prices, prices.length);
  
  return { change, changePercent, high, low, volatility };
}

/**
 * Generate mock price array for testing
 * @param basePrice - Base price
 * @param days - Number of days
 * @returns Array of prices
 */
export function generateMockPrices(basePrice: number, days: number = 30): number[] {
  const prices: number[] = [basePrice];
  let currentPrice = basePrice;
  
  for (let i = 1; i < days; i++) {
    // Random walk with slight upward bias
    const change = (Math.random() - 0.45) * 0.02; // -0.02% to +0.02%
    currentPrice = currentPrice * (1 + change);
    prices.push(currentPrice);
  }
  
  return prices;
}

