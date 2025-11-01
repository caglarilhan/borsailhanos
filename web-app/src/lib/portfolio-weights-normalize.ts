/**
 * P2-15: Portföy Dağılımı Grafiği - normalizeWeights()
 * Portföy ağırlıklarını normalize eder (toplam = 100%)
 */

export interface PortfolioWeight {
  symbol: string;
  weight: number;
}

/**
 * Normalize portfolio weights to sum to exactly 100.0%
 * Fix: Ensures sum = 100.0 ± 0.1
 */
export function normalizeWeights(weights: PortfolioWeight[]): PortfolioWeight[] {
  if (!weights || weights.length === 0) return [];
  
  // Ensure non-negative weights
  const safeWeights = weights.map(w => ({
    symbol: w.symbol,
    weight: Math.max(0, w.weight)
  }));
  
  const sum = safeWeights.reduce((acc, w) => acc + w.weight, 0);
  
  if (sum === 0) {
    // If all weights are 0, distribute equally
    const equalWeight = 1 / safeWeights.length;
    return safeWeights.map(w => ({
      symbol: w.symbol,
      weight: equalWeight
    }));
  }
  
  // Round to 1 decimal place
  const round = (x: number) => Math.round(x * 10) / 10;
  
  // Normalize weights
  let normalized = safeWeights.map(w => ({
    symbol: w.symbol,
    weight: round((w.weight / sum) * 100)
  }));
  
  // Calculate difference from 100
  const totalWeight = normalized.reduce((acc, w) => acc + w.weight, 0);
  const diff = round(100 - totalWeight);
  
  // Add difference to largest component to ensure sum = 100.0
  if (diff !== 0 && normalized.length > 0) {
    const maxIndex = normalized.reduce((maxIdx, w, idx) => 
      w.weight > normalized[maxIdx].weight ? idx : maxIdx, 0
    );
    normalized[maxIndex].weight = round(normalized[maxIndex].weight + diff);
  }
  
  return normalized;
}

