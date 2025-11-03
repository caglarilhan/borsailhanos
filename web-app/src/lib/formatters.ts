/**
 * Formatter Layer
 * Single source of truth for number, currency, and percentage formatting
 * Locale: tr-TR (Turkish)
 */

const LOCALE = 'tr-TR';
const CURRENCY = 'TRY';

/**
 * Format percentage with Turkish locale
 * @param value - Value (0-1 scale or already percentage)
 * @param isDecimal - If true, value is 0-1 scale (e.g., 0.87 → 87%); if false, value is already percentage (e.g., 87 → 87%)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string (e.g., "87,3%")
 */
export function formatPercent(value: number, isDecimal: boolean = true, decimals: number = 1): string {
  const percentage = isDecimal ? value * 100 : value;
  return new Intl.NumberFormat(LOCALE, {
    style: 'decimal',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(percentage) + '%';
}

/**
 * Format currency (Turkish Lira)
 * @param value - Value in TRY
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "₺195,40")
 */
export function formatCurrencyTRY(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format currency (USD)
 * @param value - Value in USD
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "$195.40")
 */
export function formatCurrencyUSD(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format number with Turkish locale
 * @param value - Number value
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "1.234,56")
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'decimal',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format percentage change with sign
 * @param value - Change value (e.g., 0.124 for +12.4%)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with sign (e.g., "+12,4%" or "-5,2%")
 */
export function formatPercentChange(value: number, decimals: number = 1): string {
  const sign = value >= 0 ? '+' : '';
  return sign + formatPercent(Math.abs(value), true, decimals);
}

/**
 * Format percentage points (pp)
 * @param value - Value in percentage points (e.g., 1.85 for +1.85pp)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "+1,85pp" or "-0,40pp")
 */
export function formatPercentagePoints(value: number, decimals: number = 2): string {
  const sign = value >= 0 ? '+' : '';
  return sign + formatNumber(value, decimals) + 'pp';
}

/**
 * Format large numbers with abbreviation (K, M, B)
 * @param value - Number value
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string (e.g., "1,2M" for 1,200,000)
 */
export function formatAbbreviated(value: number, decimals: number = 1): string {
  if (Math.abs(value) >= 1_000_000_000) {
    return formatNumber(value / 1_000_000_000, decimals) + 'B';
  } else if (Math.abs(value) >= 1_000_000) {
    return formatNumber(value / 1_000_000, decimals) + 'M';
  } else if (Math.abs(value) >= 1_000) {
    return formatNumber(value / 1_000, decimals) + 'K';
  }
  return formatNumber(value, 0);
}

/**
 * Clamp sentiment value to 0-100% range
 * @param value - Sentiment value (may be unnormalized)
 * @returns Clamped value (0-100)
 */
export function clampSentiment(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * P0: UTC+3 timezone normalization
 * Convert date to Istanbul timezone (UTC+3) and format consistently
 */
export function formatUTC3Time(date: Date | string | null | undefined, includeSeconds: boolean = false): string {
  if (!date) return '—';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  
  // Format with Istanbul timezone
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds && { second: '2-digit' }),
  };
  
  return d.toLocaleTimeString('tr-TR', options) + ' (UTC+3)';
}

export function formatUTC3DateTime(date: Date | string | null | undefined): string {
  if (!date) return '—';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  
  // Format with Istanbul timezone
  return d.toLocaleString('tr-TR', {
    timeZone: 'Europe/Istanbul',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' UTC+3';
}

/**
 * Get current UTC+3 time
 */
export function getUTC3Now(): Date {
  const now = new Date();
  // Return current time (browser already handles timezone)
  return now;
}

/**
 * P1: Format relative time (e.g., "5 dakika önce", "2 saat önce")
 * @param date - Date to compare
 * @returns Formatted relative time string
 */
export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return '—';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;
  
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Normalize sentiment values (positive, negative, neutral) to sum to 100%
 * @param positive - Positive sentiment (0-1 or percentage)
 * @param negative - Negative sentiment (0-1 or percentage)
 * @param neutral - Neutral sentiment (0-1 or percentage)
 * @param isDecimal - If true, values are 0-1 scale; if false, already percentages
 * @returns Normalized values summing to 100%
 */
export function normalizeSentiment(
  positive: number,
  negative: number,
  neutral: number,
  isDecimal: boolean = true
): { positive: number; negative: number; neutral: number } {
  const scale = isDecimal ? 100 : 1;
  const sum = (positive + negative + neutral) * scale || 1; // Avoid division by zero
  return {
    positive: clampSentiment((positive * scale / sum) * 100),
    negative: clampSentiment((negative * scale / sum) * 100),
    neutral: clampSentiment((neutral * scale / sum) * 100),
  };
}



