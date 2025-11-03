/**
 * P5.2: Sentiment Sum Validator
 * Haber duygu analizi: % toplamı 100±2 olmalı
 */

export interface SentimentValues {
  positive: number;
  negative: number;
  neutral: number;
}

/**
 * Validate sentiment sum (should be 100±2)
 */
export function validateSentimentSum(values: SentimentValues): {
  isValid: boolean;
  sum: number;
  normalized: SentimentValues;
  warnings: string[];
} {
  const sum = values.positive + values.negative + values.neutral;
  const isValid = sum >= 98 && sum <= 102; // 100±2
  
  // Normalize to 100%
  const scale = 100 / (sum || 1); // Avoid division by zero
  const normalized: SentimentValues = {
    positive: Math.max(0, Math.min(100, values.positive * scale)),
    negative: Math.max(0, Math.min(100, values.negative * scale)),
    neutral: Math.max(0, Math.min(100, values.neutral * scale)),
  };
  
  // Re-normalize to ensure sum = 100
  const normalizedSum = normalized.positive + normalized.negative + normalized.neutral;
  if (normalizedSum > 0) {
    normalized.positive = (normalized.positive / normalizedSum) * 100;
    normalized.negative = (normalized.negative / normalizedSum) * 100;
    normalized.neutral = (normalized.neutral / normalizedSum) * 100;
  }
  
  const warnings: string[] = [];
  if (!isValid) {
    warnings.push(`Sentiment sum ${sum.toFixed(1)}% is outside 100±2% range. Normalized to 100%.`);
  }
  
  return {
    isValid,
    sum,
    normalized,
    warnings,
  };
}

/**
 * Normalize sentiment array (multiple symbols)
 */
export function normalizeSentimentArray(symbols: Record<string, SentimentValues>): Record<string, SentimentValues> {
  const normalized: Record<string, SentimentValues> = {};
  
  Object.entries(symbols).forEach(([symbol, values]) => {
    const validation = validateSentimentSum(values);
    normalized[symbol] = validation.normalized;
    
    if (validation.warnings.length > 0) {
      console.warn(`[${symbol}] ${validation.warnings.join(', ')}`);
    }
  });
  
  return normalized;
}


