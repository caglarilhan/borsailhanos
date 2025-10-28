/**
 * Format utilities for consistent number, currency, and date/time formatting
 */

/**
 * Normalize sentiment percentages to sum to 100%
 */
export function normalizeSentiment(p: number, n: number, u: number): [number, number, number] {
  const sum = p + n + u || 1;
  const np = +(p * 100 / sum).toFixed(1);
  const nn = +(n * 100 / sum).toFixed(1);
  const nu = +(u * 100 / sum).toFixed(1);
  const diff = +(100 - (np + nn + nu)).toFixed(1);
  if (diff !== 0) return [np + diff, nn, nu];
  return [np, nn, nu];
}

/**
 * Format percentage with Turkish locale (handles both 0-1 and 0-100 ranges)
 */
export const formatPercent = (value: number) => new Intl.NumberFormat('tr-TR', { 
  style: 'percent', 
  minimumFractionDigits: 1, 
  maximumFractionDigits: 1 
}).format(value / 100);

export const formatPercentTR = (value: number) => {
  // If value > 1, assume it's already a percentage (e.g., 87.5)
  const normalized = value > 1 ? value / 100 : value;
  return new Intl.NumberFormat('tr-TR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(normalized);
};

/**
 * Format currency with Turkish locale
 */
export const formatCurrency = (value: number) => new Intl.NumberFormat('tr-TR', { 
  style: 'currency', 
  currency: 'TRY', 
  minimumFractionDigits: 0, 
  maximumFractionDigits: 0 
}).format(value);

/**
 * Format currency with TRY symbol and decimals
 */
export const formatTRY = (value: number, decimals: number = 2) => new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  minimumFractionDigits: decimals,
  maximumFractionDigits: decimals
}).format(value);

/**
 * Format date with Turkish locale
 */
export const formatDate = (date: Date, style: 'short' | 'long' | 'relative' = 'short') => {
  if (style === 'relative') {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Az önce';
    if (hours < 24) return `${hours} saat önce`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} gün önce`;
    return date.toLocaleDateString('tr-TR');
  }
  return date.toLocaleDateString('tr-TR', { 
    day: 'numeric', 
    month: 'short', 
    year: style === 'long' ? 'numeric' : undefined 
  });
};

/**
 * Format time with Turkish locale
 */
export const formatTime = (date: Date) => date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
