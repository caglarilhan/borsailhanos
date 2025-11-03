/**
 * P5.2: Enhanced Stop Validation
 * Min stop gap ve R:R kontrolü
 */

export interface StopValidationResult {
  isValid: boolean;
  minStopGap: number; // Minimum stop gap in percentage
  riskRewardRatio: number; // Risk:Reward ratio
  warning?: string;
  recommendation?: string;
}

/**
 * Validate stop loss and target price
 */
export function validateStopTargetEnhanced(
  signal: 'BUY' | 'SELL' | 'HOLD',
  currentPrice: number,
  stopPrice: number | null,
  targetPrice: number,
  atr?: number // Average True Range (optional)
): StopValidationResult {
  if (signal === 'HOLD' || !stopPrice) {
    return {
      isValid: true,
      minStopGap: 0,
      riskRewardRatio: 0,
    };
  }

  // Calculate minimum stop gap
  // Use ATR-based gap if available, otherwise use fixed percentage (1.5%)
  const atrBasedGap = atr ? Math.max(atr / currentPrice, 0.015) : 0.015; // 1.5% minimum
  const minStopGap = Math.max(atrBasedGap, 0.015); // At least 1.5%

  // Calculate risk and reward
  let risk: number;
  let reward: number;

  if (signal === 'BUY') {
    risk = currentPrice - stopPrice; // Downside risk
    reward = targetPrice - currentPrice; // Upside reward
  } else {
    risk = stopPrice - currentPrice; // Upside risk (for SELL)
    reward = currentPrice - targetPrice; // Downside reward
  }

  // Calculate percentages
  const riskPercent = (risk / currentPrice) * 100;
  const rewardPercent = (reward / currentPrice) * 100;

  // Check minimum stop gap
  if (riskPercent < minStopGap * 100) {
    return {
      isValid: false,
      minStopGap: minStopGap * 100,
      riskRewardRatio: rewardPercent / riskPercent,
      warning: `Stop loss çok yakın (${riskPercent.toFixed(1)}%). Minimum: ${(minStopGap * 100).toFixed(1)}%`,
      recommendation: `Stop loss'u ${(minStopGap * 100).toFixed(1)}% seviyesinden uzaklaştırın.`,
    };
  }

  // Calculate Risk:Reward ratio
  const riskRewardRatio = riskPercent > 0 ? rewardPercent / riskPercent : 0;

  // Check R:R threshold (minimum 1.2:1)
  if (riskRewardRatio < 1.2) {
    return {
      isValid: false,
      minStopGap: minStopGap * 100,
      riskRewardRatio,
      warning: `Risk/Ödül oranı düşük (${riskRewardRatio.toFixed(2)}:1). Minimum: 1.2:1`,
      recommendation: `Hedef fiyatı artırın veya stop loss'u yakınlaştırın.`,
    };
  }

  return {
    isValid: true,
    minStopGap: minStopGap * 100,
    riskRewardRatio,
  };
}


