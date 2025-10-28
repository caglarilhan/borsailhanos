/**
 * Sentiment normalization utilities
 * Ensures sentiment percentages sum to exactly 100%
 */

export interface NormalizedSentiment {
  p: number; // positive
  n: number; // negative
  u: number; // unclassified/neutral
}

/**
 * Normalize three sentiment values to sum to exactly 100%
 * Adjusts the largest component to account for any rounding errors
 */
export function normalize3(p: number, n: number, u: number): NormalizedSentiment {
  const total = p + n + u;
  
  if (total === 0) {
    return { p: 0, n: 0, u: 100 };
  }

  // Round to 1 decimal place
  const round = (x: number) => Math.round(x * 10) / 10;

  let normalizedP = round((p / total) * 100);
  let normalizedN = round((n / total) * 100);
  let normalizedU = round((u / total) * 100);

  // Calculate difference from 100
  const diff = 100 - (normalizedP + normalizedN + normalizedU);

  // Determine which is the largest component
  const max = normalizedP >= normalizedN && normalizedP >= normalizedU
    ? 'P'
    : normalizedN >= normalizedU
    ? 'N'
    : 'U';

  // Add the difference to the largest component
  if (max === 'P') {
    normalizedP = round(normalizedP + diff);
  } else if (max === 'N') {
    normalizedN = round(normalizedN + diff);
  } else {
    normalizedU = round(normalizedU + diff);
  }

  return { p: normalizedP, n: normalizedN, u: normalizedU };
}

/**
 * Normalize sentiment array
 */
export function normalizeSentimentArray<T extends { positive?: number; negative?: number; neutral?: number }>(
  items: T[]
): T[] {
  return items.map((item) => {
    const normalized = normalize3(
      item.positive || 0,
      item.negative || 0,
      item.neutral || 0
    );
    return {
      ...item,
      positive: normalized.p,
      negative: normalized.n,
      neutral: normalized.u,
    };
  });
}

