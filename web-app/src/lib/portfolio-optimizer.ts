/**
 * P1-10: Portföy Optimizasyon Modülü (Frontend Mock)
 * Basit Markowitz-style optimizasyon (mock veri ile)
 */

export interface PortfolioWeight {
  symbol: string;
  weight: number;
}

export interface OptimizeParams {
  symbols: string[];
  riskLevel: 'low' | 'medium' | 'high';
  targetReturn?: number;
}

/**
 * Mock portfolio optimizer - Basit eşit ağırlık dağılımı
 * Gerçek implementasyon için backend endpoint gerekiyor
 */
export function optimizePortfolio(params: OptimizeParams): PortfolioWeight[] {
  const { symbols, riskLevel } = params;
  const n = symbols.length;
  
  if (n === 0) return [];
  
  // Basit eşit ağırlık + risk seviyesine göre varyans
  let baseWeight = 1 / n;
  
  // Risk seviyesine göre ağırlık ayarı (mock)
  const riskAdjustment = {
    low: 0.95,    // Daha konservatif
    medium: 1.0,  // Dengeli
    high: 1.05    // Daha agresif
  };
  
  baseWeight *= riskAdjustment[riskLevel];
  
  // Normalize et
  const weights = symbols.map(symbol => ({
    symbol,
    weight: baseWeight
  }));
  
  const total = weights.reduce((sum, w) => sum + w.weight, 0);
  
  return weights.map(w => ({
    symbol: w.symbol,
    weight: w.weight / total
  }));
}

/**
 * Rebalance portföy - Varolan ağırlıkları yeni sembollere göre güncelle
 */
export function rebalancePortfolio(
  currentWeights: PortfolioWeight[],
  newSymbols: string[],
  riskLevel: 'low' | 'medium' | 'high'
): PortfolioWeight[] {
  // Yeni sembollere göre optimize et
  const optimized = optimizePortfolio({
    symbols: newSymbols,
    riskLevel
  });
  
  // Varolan sembollerin ağırlıklarını koru (eğer yeni listede varsa)
  const existingMap = new Map(currentWeights.map(w => [w.symbol, w.weight]));
  
  return optimized.map(opt => {
    const existing = existingMap.get(opt.symbol);
    return {
      symbol: opt.symbol,
      weight: existing !== undefined ? existing * 0.7 + opt.weight * 0.3 : opt.weight // Smooth transition
    };
  });
}

