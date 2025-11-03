/**
 * P5.2: Sentiment Normalization Fix
 * Duygu yüzdeleri 100%'ü aşıyor - normalize et
 * Tek kaynaktan gelen sınıf olasılıklarını z=1 olacak şekilde yeniden ölçekle
 */

import { normalizeSentiment } from './formatters';

export interface SentimentComponents {
  positive?: number;
  negative?: number;
  neutral?: number;
}

/**
 * Normalize sentiment components to sum to 100%
 * Uses softmax-like normalization: divide by sum, then scale to 100%
 * @param components - Sentiment components (0-1 or percentage scale)
 * @param isDecimal - If true, values are 0-1 scale; if false, already percentages
 * @returns Normalized components summing to exactly 100%
 */
export function normalizeSentimentComponents(
  components: SentimentComponents,
  isDecimal: boolean = true
): SentimentComponents {
  const { positive = 0, negative = 0, neutral = 0 } = components;
  
  // Normalize using existing formatter utility
  const normalized = normalizeSentiment(positive, negative, neutral, isDecimal);
  
  return {
    positive: normalized.positive,
    negative: normalized.negative,
    neutral: normalized.neutral,
  };
}

/**
 * Round sentiment components using round-half-away-from-zero
 * Ensures sum is exactly 100% after rounding
 * @param components - Normalized sentiment components (should sum to 100%)
 * @returns Rounded components with sum = 100%
 */
export function roundSentimentComponents(
  components: SentimentComponents
): SentimentComponents {
  const { positive = 0, negative = 0, neutral = 0 } = components;
  
  // Round half away from zero (standard Math.round behavior)
  const roundedPositive = Math.round(positive);
  const roundedNegative = Math.round(negative);
  const roundedNeutral = Math.round(neutral);
  
  const sum = roundedPositive + roundedNegative + roundedNeutral;
  
  // Adjust to ensure sum = 100
  if (sum !== 100) {
    const diff = 100 - sum;
    // Adjust the largest component
    if (Math.abs(diff) === 1) {
      if (roundedPositive >= roundedNegative && roundedPositive >= roundedNeutral) {
        return {
          positive: roundedPositive + diff,
          negative: roundedNegative,
          neutral: roundedNeutral,
        };
      } else if (roundedNegative >= roundedNeutral) {
        return {
          positive: roundedPositive,
          negative: roundedNegative + diff,
          neutral: roundedNeutral,
        };
      } else {
        return {
          positive: roundedPositive,
          negative: roundedNegative,
          neutral: roundedNeutral + diff,
        };
      }
    }
  }
  
  return {
    positive: roundedPositive,
    negative: roundedNegative,
    neutral: roundedNeutral,
  };
}

/**
 * Normalize and round sentiment components
 * Main utility function for fixing sentiment > 100% issue
 */
export function fixSentimentSum(
  components: SentimentComponents,
  isDecimal: boolean = true
): SentimentComponents {
  const normalized = normalizeSentimentComponents(components, isDecimal);
  return roundSentimentComponents(normalized);
}


