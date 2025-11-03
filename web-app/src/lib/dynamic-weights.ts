/**
 * Dynamic Weights System
 * Sprint 3: AI Motoru - Dinamik ağırlık optimizasyonu
 * RSI, MACD, sentiment, volume ağırlıklarını runtime'da normalize eder ve optimize eder
 */

export interface FactorWeights {
  RSI: number;
  MACD: number;
  Sentiment: number;
  Volume: number;
}

export interface FactorValues {
  RSI?: number;
  MACD?: number;
  Sentiment?: number;
  Volume?: number;
}

/**
 * Default weights (from xai-weights-ssot.ts)
 */
export const DEFAULT_WEIGHTS: FactorWeights = {
  RSI: 0.22,
  MACD: 0.25,
  Sentiment: 0.33,
  Volume: 0.20,
};

/**
 * Normalize weights to sum to 1.0
 */
export function normalizeWeights(weights: Partial<FactorWeights>): FactorWeights {
  const w = { ...DEFAULT_WEIGHTS, ...weights };
  const total = w.RSI + w.MACD + w.Sentiment + w.Volume;
  
  if (total === 0) return DEFAULT_WEIGHTS;
  
  return {
    RSI: w.RSI / total,
    MACD: w.MACD / total,
    Sentiment: w.Sentiment / total,
    Volume: w.Volume / total,
  };
}

/**
 * Calculate adaptive weights based on factor performance
 * @param performance - Historical performance of each factor (higher = better)
 * @returns Optimized weights
 */
export function calculateAdaptiveWeights(performance: Partial<FactorValues>): FactorWeights {
  // Convert performance to 0-1 scale if needed
  const normalizedPerf: FactorValues = {
    RSI: Math.max(0, Math.min(1, (performance.RSI || 0.5) / 100)),
    MACD: Math.max(0, Math.min(1, (performance.MACD || 0.5) / 100)),
    Sentiment: Math.max(0, Math.min(1, (performance.Sentiment || 0.5) / 100)),
    Volume: Math.max(0, Math.min(1, (performance.Volume || 0.5) / 100)),
  };

  // Calculate sum for normalization
  const sum = (normalizedPerf.RSI || 0) + (normalizedPerf.MACD || 0) + 
              (normalizedPerf.Sentiment || 0) + (normalizedPerf.Volume || 0);
  
  if (sum === 0) return DEFAULT_WEIGHTS;

  // Performance-based weights (higher performance = higher weight)
  const rawWeights: FactorWeights = {
    RSI: normalizedPerf.RSI || DEFAULT_WEIGHTS.RSI,
    MACD: normalizedPerf.MACD || DEFAULT_WEIGHTS.MACD,
    Sentiment: normalizedPerf.Sentiment || DEFAULT_WEIGHTS.Sentiment,
    Volume: normalizedPerf.Volume || DEFAULT_WEIGHTS.Volume,
  };

  // Normalize to sum to 1.0
  return normalizeWeights(rawWeights);
}

/**
 * Blend default and adaptive weights
 * @param adaptiveWeights - Calculated adaptive weights
 * @param blendFactor - How much to use adaptive (0 = all default, 1 = all adaptive)
 * @returns Blended weights
 */
export function blendWeights(
  adaptiveWeights: FactorWeights,
  blendFactor: number = 0.3
): FactorWeights {
  const factor = Math.max(0, Math.min(1, blendFactor));
  
  return {
    RSI: DEFAULT_WEIGHTS.RSI * (1 - factor) + adaptiveWeights.RSI * factor,
    MACD: DEFAULT_WEIGHTS.MACD * (1 - factor) + adaptiveWeights.MACD * factor,
    Sentiment: DEFAULT_WEIGHTS.Sentiment * (1 - factor) + adaptiveWeights.Sentiment * factor,
    Volume: DEFAULT_WEIGHTS.Volume * (1 - factor) + adaptiveWeights.Volume * factor,
  };
}

/**
 * Get optimal weights based on current market conditions
 * @param currentFactors - Current factor values
 * @param historicalPerformance - Historical performance data
 * @returns Optimized weights
 */
export function getOptimalWeights(
  currentFactors: FactorValues,
  historicalPerformance?: Partial<FactorValues>
): FactorWeights {
  if (historicalPerformance) {
    const adaptive = calculateAdaptiveWeights(historicalPerformance);
    // Blend 30% adaptive with 70% default
    return normalizeWeights(blendWeights(adaptive, 0.3));
  }
  
  // Fallback to default
  return DEFAULT_WEIGHTS;
}

/**
 * Calculate weighted score from factors
 */
export function calculateWeightedScore(
  factors: FactorValues,
  weights: FactorWeights = DEFAULT_WEIGHTS
): number {
  let score = 0;
  
  if (factors.RSI !== undefined) score += weights.RSI * (factors.RSI / 100);
  if (factors.MACD !== undefined) {
    // MACD is typically -1 to +1, normalize to 0-1
    score += weights.MACD * ((factors.MACD + 1) / 2);
  }
  if (factors.Sentiment !== undefined) score += weights.Sentiment * (factors.Sentiment / 100);
  if (factors.Volume !== undefined) {
    // Volume ratio: 1.0 = average, normalize to 0-1
    score += weights.Volume * Math.min(1, factors.Volume / 2);
  }
  
  return Math.max(0, Math.min(1, score));
}

