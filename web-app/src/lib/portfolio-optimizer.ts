/**
 * P2: Portföy Optimizasyon Modülü (Mean-Variance Optimizasyonu)
 * Markowitz-style optimizasyon (mock veri ile gerçekçi simülasyon)
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

export interface PortfolioMetrics {
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

/**
 * Mean-Variance Portfolio Optimizer
 * Simulated Markowitz-style optimization with covariance matrix
 */
export function optimizePortfolio(params: OptimizeParams): PortfolioWeight[] {
  const { symbols, riskLevel } = params;
  const n = symbols.length;
  
  if (n === 0) return [];
  
  // Mock expected returns (% yıllık getiri)
  const getExpectedReturn = (symbol: string): number => {
    const seed = symbol.charCodeAt(0);
    let r = seed;
    const seededRandom = () => {
      r = (r * 1103515245 + 12345) >>> 0;
      return (r / 0xFFFFFFFF);
    };
    // Base return: 8-15% annual range
    return 0.08 + seededRandom() * 0.07;
  };
  
  // Mock volatility (standart sapma)
  const getVolatility = (symbol: string): number => {
    const seed = symbol.charCodeAt(0) * 2;
    let r = seed;
    const seededRandom = () => {
      r = (r * 1103515245 + 12345) >>> 0;
      return (r / 0xFFFFFFFF);
    };
    // Base volatility: 12-25% annual range
    return 0.12 + seededRandom() * 0.13;
  };
  
  // Mock correlation matrix (simulated covariance)
  const getCorrelation = (sym1: string, sym2: string): number => {
    if (sym1 === sym2) return 1.0;
    const seed = (sym1.charCodeAt(0) + sym2.charCodeAt(0)) * 3;
    let r = seed;
    const seededRandom = () => {
      r = (r * 1103515245 + 12345) >>> 0;
      return (r / 0xFFFFFFFF);
    };
    // Correlation range: 0.3-0.7 (realistic for BIST stocks)
    return 0.3 + seededRandom() * 0.4;
  };
  
  // Calculate expected returns and volatilities
  const returns = symbols.map(s => getExpectedReturn(s));
  const volatilities = symbols.map(s => getVolatility(s));
  
  // Risk-adjusted target volatility based on risk level
  const targetVolatility = {
    low: 0.12,      // 12% annual volatility
    medium: 0.18,   // 18% annual volatility
    high: 0.25      // 25% annual volatility
  }[riskLevel];
  
  // Mean-Variance Optimization (simplified)
  // Objective: Maximize Sharpe Ratio = (Return - RiskFreeRate) / Volatility
  // Constraint: Portfolio volatility <= targetVolatility
  const riskFreeRate = 0.02; // 2% risk-free rate
  
  // Initialize weights (equal-weighted starting point)
  let weights = symbols.map(() => 1 / n);
  
  // Optimize using gradient descent (simplified)
  // In production, use scipy.optimize or similar
  for (let iter = 0; iter < 50; iter++) {
    // Calculate portfolio return
    let portfolioReturn = 0;
    for (let i = 0; i < n; i++) {
      portfolioReturn += weights[i] * returns[i];
    }
    
    // Calculate portfolio volatility (using correlation matrix)
    let portfolioVariance = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const corr = getCorrelation(symbols[i], symbols[j]);
        portfolioVariance += weights[i] * weights[j] * volatilities[i] * volatilities[j] * corr;
      }
    }
    const portfolioVolatility = Math.sqrt(portfolioVariance);
    
    // Sharpe ratio
    const sharpe = (portfolioReturn - riskFreeRate) / portfolioVolatility;
    
    // Adjust weights to target volatility and maximize Sharpe
    const targetAdjustment = targetVolatility / portfolioVolatility;
    
    // Rebalance towards higher Sharpe (simplified gradient)
    const newWeights: number[] = [];
    for (let i = 0; i < n; i++) {
      const returnContribution = returns[i];
      const volatilityContribution = volatilities[i];
      const adjustedWeight = weights[i] * (1 + (returnContribution - riskFreeRate) * 0.1);
      newWeights.push(Math.max(0, adjustedWeight));
    }
    
    // Normalize
    const total = newWeights.reduce((sum, w) => sum + w, 0);
    if (total > 0) {
      weights = newWeights.map(w => w / total);
    }
    
    // Apply target volatility constraint
    let currentVol = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const corr = getCorrelation(symbols[i], symbols[j]);
        currentVol += weights[i] * weights[j] * volatilities[i] * volatilities[j] * corr;
      }
    }
    currentVol = Math.sqrt(currentVol);
    
    if (currentVol > targetVolatility) {
      // Scale down weights to meet volatility constraint
      const scale = targetVolatility / currentVol;
      weights = weights.map(w => w * scale);
    }
    
    // Normalize again
    const finalTotal = weights.reduce((sum, w) => sum + w, 0);
    if (finalTotal > 0) {
      weights = weights.map(w => w / finalTotal);
    }
  }
  
  // Return portfolio weights
  return symbols.map((symbol, i) => ({
    symbol,
    weight: Math.max(0, Math.min(1, weights[i] || 0)) // Clamp to [0, 1]
  })).filter(w => w.weight > 0.01); // Remove weights < 1%
}

/**
 * Calculate portfolio metrics after optimization
 */
export function calculatePortfolioMetrics(
  weights: PortfolioWeight[],
  symbols: string[]
): PortfolioMetrics {
  const getExpectedReturn = (symbol: string): number => {
    const seed = symbol.charCodeAt(0);
    let r = seed;
    const seededRandom = () => {
      r = (r * 1103515245 + 12345) >>> 0;
      return (r / 0xFFFFFFFF);
    };
    return 0.08 + seededRandom() * 0.07;
  };
  
  const getVolatility = (symbol: string): number => {
    const seed = symbol.charCodeAt(0) * 2;
    let r = seed;
    const seededRandom = () => {
      r = (r * 1103515245 + 12345) >>> 0;
      return (r / 0xFFFFFFFF);
    };
    return 0.12 + seededRandom() * 0.13;
  };
  
  const getCorrelation = (sym1: string, sym2: string): number => {
    if (sym1 === sym2) return 1.0;
    const seed = (sym1.charCodeAt(0) + sym2.charCodeAt(0)) * 3;
    let r = seed;
    const seededRandom = () => {
      r = (r * 1103515245 + 12345) >>> 0;
      return (r / 0xFFFFFFFF);
    };
    return 0.3 + seededRandom() * 0.4;
  };
  
  const weightMap = new Map(weights.map(w => [w.symbol, w.weight]));
  
  let portfolioReturn = 0;
  for (const symbol of symbols) {
    const weight = weightMap.get(symbol) || 0;
    portfolioReturn += weight * getExpectedReturn(symbol);
  }
  
  let portfolioVariance = 0;
  for (let i = 0; i < symbols.length; i++) {
    for (let j = 0; j < symbols.length; j++) {
      const w1 = weightMap.get(symbols[i]) || 0;
      const w2 = weightMap.get(symbols[j]) || 0;
      const corr = getCorrelation(symbols[i], symbols[j]);
      portfolioVariance += w1 * w2 * getVolatility(symbols[i]) * getVolatility(symbols[j]) * corr;
    }
  }
  const portfolioVolatility = Math.sqrt(portfolioVariance);
  
  const riskFreeRate = 0.02;
  const sharpeRatio = portfolioVolatility > 0 ? (portfolioReturn - riskFreeRate) / portfolioVolatility : 0;
  
  // Max drawdown estimate (simplified: 2 * volatility)
  const maxDrawdown = portfolioVolatility * 2;
  
  return {
    expectedReturn: portfolioReturn,
    volatility: portfolioVolatility,
    sharpeRatio,
    maxDrawdown
  };
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

