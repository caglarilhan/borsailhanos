/**
 * Dynamic Risk Score Algorithm
 * Calculate risk score based on volatility and Sharpe ratio
 */

export interface RiskScoreInput {
  symbol: string;
  volatility: number; // Annualized volatility (e.g., 0.25 = 25%)
  sharpeRatio: number; // Sharpe ratio
  maxDrawdown?: number; // Maximum drawdown (e.g., 0.15 = 15%)
  beta?: number; // Beta vs benchmark
  debtEquity?: number; // Debt-to-equity ratio
}

export interface RiskScoreOutput {
  score: number; // 0-10 scale
  level: 'low' | 'medium' | 'high' | 'very_high';
  components: {
    volatilityScore: number;
    sharpeScore: number;
    drawdownScore?: number;
    betaScore?: number;
    leverageScore?: number;
  };
  color: string;
  label: string;
}

/**
 * Calculate dynamic risk score
 */
export function calculateRiskScore(input: RiskScoreInput): RiskScoreOutput {
  // Component 1: Volatility (0-4 points)
  // Lower volatility = lower risk
  const volatilityScore = Math.min(4, Math.max(0, input.volatility * 16)); // 0.25 vol = 4 points
  
  // Component 2: Sharpe Ratio (0-3 points)
  // Higher Sharpe = lower risk
  const sharpeScore = Math.min(3, Math.max(0, (2 - input.sharpeRatio) * 1.5)); // Sharpe 2 = 0 points, Sharpe 0 = 3 points
  
  // Component 3: Max Drawdown (0-2 points) - optional
  let drawdownScore = 0;
  if (input.maxDrawdown !== undefined) {
    drawdownScore = Math.min(2, Math.max(0, input.maxDrawdown * 10)); // 20% drawdown = 2 points
  }
  
  // Component 4: Beta (0-1 point) - optional
  let betaScore = 0;
  if (input.beta !== undefined) {
    // Beta > 1.5 = high risk (1 point), Beta < 0.8 = low risk (0 points)
    betaScore = Math.min(1, Math.max(0, (input.beta - 0.8) * 1.43)); // 0.8 -> 0, 1.5 -> 1
  }
  
  // Component 5: Leverage (0-1 point) - optional
  let leverageScore = 0;
  if (input.debtEquity !== undefined) {
    // D/E > 1 = high risk (1 point), D/E < 0.3 = low risk (0 points)
    leverageScore = Math.min(1, Math.max(0, (input.debtEquity - 0.3) * 1.43)); // 0.3 -> 0, 1.0 -> 1
  }
  
  // Total score (0-10, higher = more risky)
  const totalScore = volatilityScore + sharpeScore + drawdownScore + betaScore + leverageScore;
  const normalizedScore = Math.min(10, Math.max(0, totalScore));
  
  // Determine risk level
  let level: 'low' | 'medium' | 'high' | 'very_high';
  let color: string;
  let label: string;
  
  if (normalizedScore <= 2) {
    level = 'low';
    color = '#10b981'; // green
    label = 'Düşük';
  } else if (normalizedScore <= 5) {
    level = 'medium';
    color = '#f59e0b'; // amber
    label = 'Orta';
  } else if (normalizedScore <= 7.5) {
    level = 'high';
    color = '#ef4444'; // red
    label = 'Yüksek';
  } else {
    level = 'very_high';
    color = '#dc2626'; // dark red
    label = 'Çok Yüksek';
  }
  
  return {
    score: Math.round(normalizedScore * 10) / 10, // Round to 1 decimal
    level,
    components: {
      volatilityScore: Math.round(volatilityScore * 10) / 10,
      sharpeScore: Math.round(sharpeScore * 10) / 10,
      drawdownScore: drawdownScore > 0 ? Math.round(drawdownScore * 10) / 10 : undefined,
      betaScore: betaScore > 0 ? Math.round(betaScore * 10) / 10 : undefined,
      leverageScore: leverageScore > 0 ? Math.round(leverageScore * 10) / 10 : undefined,
    },
    color,
    label,
  };
}

/**
 * Calculate risk score from price data
 */
export function calculateRiskScoreFromPrices(
  symbol: string,
  prices: number[],
  returns?: number[]
): RiskScoreInput {
  if (prices.length < 2) {
    return {
      symbol,
      volatility: 0.25, // Default
      sharpeRatio: 1.0, // Default
    };
  }
  
  // Calculate returns if not provided
  const calcReturns = returns || [];
  for (let i = 1; i < prices.length; i++) {
    calcReturns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  
  // Calculate volatility (annualized, assuming daily returns)
  const meanReturn = calcReturns.reduce((sum, r) => sum + r, 0) / calcReturns.length;
  const variance = calcReturns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / calcReturns.length;
  const volatility = Math.sqrt(variance * 252); // Annualize (252 trading days)
  
  // Calculate Sharpe ratio (assuming risk-free rate = 0.1 = 10% annual)
  const riskFreeRate = 0.1 / 252; // Daily risk-free rate
  const excessReturn = meanReturn * 252 - 0.1; // Annual excess return
  const sharpeRatio = volatility > 0 ? excessReturn / volatility : 0;
  
  // Calculate max drawdown
  let maxDrawdown = 0;
  let peak = prices[0];
  for (const price of prices) {
    if (price > peak) peak = price;
    const drawdown = (peak - price) / peak;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }
  
  return {
    symbol,
    volatility: Math.max(0, Math.min(1, volatility)), // Clamp 0-1
    sharpeRatio: Math.max(-2, Math.min(5, sharpeRatio)), // Clamp -2 to 5
    maxDrawdown: Math.max(0, Math.min(1, maxDrawdown)), // Clamp 0-1
  };
}



