/**
 * Guard functions for data validation and filtering
 */

/**
 * Check if a date is stale (older than maxAgeDays)
 */
export function isStale(dateString: string | Date, maxAgeDays: number): boolean {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > maxAgeDays;
  } catch {
    return false;
  }
}

/**
 * Filter out stale items
 */
export function filterStale<T extends { date?: string; timestamp?: string }>(items: T[], maxAgeDays: number): T[] {
  return items.filter(item => {
    const date = item.date || item.timestamp;
    return date && !isStale(date, maxAgeDays);
  });
}

/**
 * Check if symbol is within market scope
 */
export function isWithinMarketScope(symbol: string, market: 'BIST' | 'NYSE' | 'NASDAQ'): boolean {
  const bistSymbols = ['THYAO', 'TUPRS', 'ASELS', 'EREGL', 'SISE', 'GARAN', 'AKBNK', 'AKBN', 'ISCTR', 'SAHOL', 'KRDMD'];
  const nyseSymbols = ['AAPL', 'MSFT', 'JPM', 'BAC', 'WMT', 'DIS', 'CVX'];
  const nasdaqSymbols = ['GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'ADBE', 'NFLX'];
  
  if (market === 'BIST') return bistSymbols.includes(symbol);
  if (market === 'NYSE') return nyseSymbols.includes(symbol);
  if (market === 'NASDAQ') return nasdaqSymbols.includes(symbol);
  return false;
}

/**
 * Check if accuracy meets threshold
 */
export function meetsAccuracyThreshold(accuracy: number, minAccuracy: number): boolean {
  return accuracy >= minAccuracy;
}

/**
 * Deduplicate array by symbol
 */
export function deduplicateBySymbol<T extends { symbol: string }>(arr: T[]): T[] {
  return Array.from(new Map(arr.map(x => [x.symbol, x])).values());
}

/**
 * Filter by market scope
 */
export function filterByMarketScope<T extends { symbol: string }>(items: T[], market: 'BIST' | 'NYSE' | 'NASDAQ'): T[] {
  return items.filter(item => isWithinMarketScope(item.symbol, market));
}
