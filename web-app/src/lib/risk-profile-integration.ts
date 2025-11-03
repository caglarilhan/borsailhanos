/**
 * Risk Profile Integration
 * Sprint 4: Portföy Optimizasyonu - Risk profili entegrasyonu
 * Risk profili AI motorunu etkiler ve sinyal filtreleme yapar
 */

export type RiskProfile = 'conservative' | 'balanced' | 'aggressive';

export interface RiskProfileConfig {
  minConfidence: number;
  maxPositions: number;
  rebalanceFrequency: number; // days
  stopLossPercent: number;
  takeProfitPercent: number;
  maxPositionSize: number; // % of portfolio
  signalHorizon: '1h' | '4h' | '1d' | '7d'; // Preferred horizon
}

/**
 * Risk profili konfigürasyonları
 */
export const RISK_PROFILE_CONFIGS: Record<RiskProfile, RiskProfileConfig> = {
  conservative: {
    minConfidence: 0.85, // Only high confidence signals
    maxPositions: 5,
    rebalanceFrequency: 7, // Weekly
    stopLossPercent: 0.05, // 5% stop loss
    takeProfitPercent: 0.15, // 15% take profit
    maxPositionSize: 0.20, // Max 20% per position
    signalHorizon: '7d', // Long-term signals
  },
  balanced: {
    minConfidence: 0.75,
    maxPositions: 8,
    rebalanceFrequency: 5, // 5 days
    stopLossPercent: 0.07, // 7% stop loss
    takeProfitPercent: 0.20, // 20% take profit
    maxPositionSize: 0.15, // Max 15% per position
    signalHorizon: '4h', // Medium-term signals
  },
  aggressive: {
    minConfidence: 0.70,
    maxPositions: 12,
    rebalanceFrequency: 3, // 3 days
    stopLossPercent: 0.10, // 10% stop loss (wider)
    takeProfitPercent: 0.25, // 25% take profit
    maxPositionSize: 0.12, // Max 12% per position (more positions)
    signalHorizon: '1h', // Short-term signals
  },
};

/**
 * Get risk profile config
 */
export function getRiskProfileConfig(profile: RiskProfile): RiskProfileConfig {
  return RISK_PROFILE_CONFIGS[profile] || RISK_PROFILE_CONFIGS.balanced;
}

/**
 * Filter signals based on risk profile
 */
export function filterSignalsByRiskProfile<T extends { confidence?: number; prediction?: number; horizon?: string }>(
  signals: T[],
  profile: RiskProfile
): T[] {
  const config = getRiskProfileConfig(profile);
  
  return signals
    .filter(signal => {
      // Confidence filter
      if ((signal.confidence || 0) < config.minConfidence) return false;
      
      // Horizon filter (prefer signals matching preferred horizon)
      if (signal.horizon && config.signalHorizon !== signal.horizon) {
        // Allow but prioritize preferred horizon
        return true;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Prioritize preferred horizon
      if (a.horizon === config.signalHorizon && b.horizon !== config.signalHorizon) return -1;
      if (b.horizon === config.signalHorizon && a.horizon !== config.signalHorizon) return 1;
      
      // Then sort by confidence
      return (b.confidence || 0) - (a.confidence || 0);
    })
    .slice(0, config.maxPositions); // Limit positions
}

/**
 * Calculate net return (gross - tax - fee - slippage)
 */
export function calculateNetReturn(
  grossReturn: number,
  taxRate: number = 0.15, // 15% capital gains tax
  transactionFee: number = 0.0015, // 0.15% per transaction (buy + sell = 0.3%)
  slippage: number = 0.001 // 0.1% slippage
): number {
  // Total transaction cost (buy + sell)
  const totalTransactionCost = transactionFee * 2 + slippage;
  
  // Net return after transaction costs
  const afterTransactionCosts = grossReturn - totalTransactionCost;
  
  // Net return after tax (only on positive returns)
  const netReturn = afterTransactionCosts > 0 
    ? afterTransactionCosts * (1 - taxRate)
    : afterTransactionCosts;
  
  return netReturn;
}

/**
 * Calculate position size based on risk profile
 */
export function calculatePositionSize(
  symbol: string,
  confidence: number,
  totalEquity: number,
  profile: RiskProfile
): number {
  const config = getRiskProfileConfig(profile);
  
  // Base position size from config
  let positionSize = totalEquity * config.maxPositionSize;
  
  // Adjust based on confidence
  // Higher confidence = slightly larger position
  const confidenceMultiplier = Math.min(1.2, 0.8 + (confidence * 0.4));
  positionSize *= confidenceMultiplier;
  
  // Cap at max position size
  positionSize = Math.min(positionSize, totalEquity * config.maxPositionSize);
  
  return Math.round(positionSize * 100) / 100; // Round to 2 decimals
}

/**
 * Get stop loss and take profit levels based on risk profile
 */
export function getStopLossTakeProfit(
  entryPrice: number,
  profile: RiskProfile
): { stopLoss: number; takeProfit: number } {
  const config = getRiskProfileConfig(profile);
  
  return {
    stopLoss: entryPrice * (1 - config.stopLossPercent),
    takeProfit: entryPrice * (1 + config.takeProfitPercent),
  };
}

