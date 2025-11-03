/**
 * P5.2: AI Trade Plan
 * Entry/SL/TP otomatik hesapla ve göster
 * Entry: ₺195,40 → SL: ₺175,80 (%-3.1)
 * TP1 ₺207 | TP2 ₺221 | R:R 2.1:1
 */

export interface TradePlan {
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  entry: number; // Entry price
  stopLoss: number; // Stop loss price
  targetPrice1: number; // First target (TP1)
  targetPrice2?: number; // Second target (TP2) - optional
  riskRewardRatio: number; // R:R ratio (e.g., 2.1:1)
  riskPercent: number; // Risk as percentage (e.g., -3.1%)
  targetPercent1: number; // TP1 as percentage (e.g., +5.9%)
  targetPercent2?: number; // TP2 as percentage (e.g., +13.1%) - optional
  confidence: number; // 0-1
  explanation: string;
  timestamp: string;
}

export interface PositionSize {
  symbol: string;
  riskPercent: number; // Risk as percentage of portfolio (e.g., 1%)
  entryPrice: number;
  stopLossPrice: number;
  portfolioValue: number; // Total portfolio value
  positionSize: number; // Calculated position size in TRY
  shares: number; // Number of shares (if applicable)
  riskAmount: number; // Risk amount in TRY
  maxLoss: number; // Maximum loss in TRY
}

/**
 * AI Trade Plan Generator
 */
export class AITradePlanGenerator {
  /**
   * Generate trade plan for a signal
   */
  generateTradePlan(
    symbol: string,
    signal: 'BUY' | 'SELL' | 'HOLD',
    currentPrice: number,
    targetPrice: number,
    confidence: number,
    horizon: string
  ): TradePlan | null {
    if (signal === 'HOLD') {
      return null;
    }

    // Calculate entry price (use current price as entry)
    const entry = currentPrice;

    // Calculate stop loss based on signal
    // BUY: Stop below entry (e.g., -3%)
    // SELL: Stop above entry (e.g., +3%)
    const stopLossPercent = signal === 'BUY' ? -0.03 : 0.03; // Default 3% stop
    const stopLoss = entry * (1 + stopLossPercent);

    // Calculate risk percentage
    const riskPercent = stopLossPercent * 100; // -3.1% or +3.1%

    // Calculate target prices
    const targetPrice1 = targetPrice;
    const targetPrice1Percent = ((targetPrice1 - entry) / entry) * 100;

    // Calculate TP2 (if confidence is high, add a second target)
    let targetPrice2: number | undefined;
    let targetPrice2Percent: number | undefined;
    
    if (confidence >= 0.75 && Math.abs(targetPrice1Percent) > 5) {
      // TP2 = 1.5x TP1 distance
      targetPrice2 = entry + (targetPrice1 - entry) * 1.5;
      targetPrice2Percent = ((targetPrice2 - entry) / entry) * 100;
    }

    // Calculate Risk:Reward ratio
    const reward = Math.abs(targetPrice1 - entry);
    const risk = Math.abs(entry - stopLoss);
    const riskRewardRatio = risk > 0 ? reward / risk : 0;

    // Generate explanation
    const explanation = this.generateExplanation(
      signal,
      riskPercent,
      targetPrice1Percent,
      targetPrice2Percent,
      riskRewardRatio,
      horizon
    );

    return {
      symbol,
      signal,
      entry,
      stopLoss,
      targetPrice1: targetPrice1,
      targetPrice2,
      riskRewardRatio,
      riskPercent,
      targetPercent1: targetPrice1Percent,
      targetPercent2: targetPrice2Percent,
      confidence,
      explanation,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Calculate position size based on risk percentage
   */
  calculatePositionSize(
    symbol: string,
    entryPrice: number,
    stopLossPrice: number,
    riskPercent: number, // Risk as % of portfolio (e.g., 1%)
    portfolioValue: number
  ): PositionSize {
    // Calculate risk per share
    const riskPerShare = Math.abs(entryPrice - stopLossPrice);

    if (riskPerShare === 0) {
      // Cannot calculate position size if no risk
      return {
        symbol,
        riskPercent,
        entryPrice,
        stopLossPrice,
        portfolioValue,
        positionSize: 0,
        shares: 0,
        riskAmount: 0,
        maxLoss: 0,
      };
    }

    // Calculate risk amount (e.g., 1% of portfolio)
    const riskAmount = portfolioValue * (riskPercent / 100);

    // Calculate number of shares
    const shares = Math.floor(riskAmount / riskPerShare);

    // Calculate position size
    const positionSize = shares * entryPrice;

    // Calculate maximum loss
    const maxLoss = shares * riskPerShare;

    return {
      symbol,
      riskPercent,
      entryPrice,
      stopLossPrice,
      portfolioValue,
      positionSize,
      shares,
      riskAmount,
      maxLoss,
    };
  }

  /**
   * Generate explanation text
   */
  private generateExplanation(
    signal: 'BUY' | 'SELL',
    riskPercent: number,
    targetPercent1: number,
    targetPercent2: number | undefined,
    riskRewardRatio: number,
    horizon: string
  ): string {
    const signalText = signal === 'BUY' ? 'alım' : 'satım';
    const riskText = `${Math.abs(riskPercent).toFixed(1)}%`;
    const targetText = `+${Math.abs(targetPercent1).toFixed(1)}%`;
    const tp2Text = targetPercent2 ? ` veya +${Math.abs(targetPercent2).toFixed(1)}%` : '';
    const rrText = riskRewardRatio.toFixed(1);

    return `${horizon} için ${signalText} sinyali. Giriş: Mevcut fiyat, Stop: -${riskText}, Hedef: ${targetText}${tp2Text}. Risk/Ödül: ${rrText}:1.`;
  }
}

// Singleton instance
export const aiTradePlanGenerator = new AITradePlanGenerator();

/**
 * Generate trade plan
 */
export function generateTradePlan(
  symbol: string,
  signal: 'BUY' | 'SELL' | 'HOLD',
  currentPrice: number,
  targetPrice: number,
  confidence: number,
  horizon: string
): TradePlan | null {
  return aiTradePlanGenerator.generateTradePlan(symbol, signal, currentPrice, targetPrice, confidence, horizon);
}

/**
 * Calculate position size
 */
export function calculatePositionSize(
  symbol: string,
  entryPrice: number,
  stopLossPrice: number,
  riskPercent: number,
  portfolioValue: number
): PositionSize {
  return aiTradePlanGenerator.calculatePositionSize(symbol, entryPrice, stopLossPrice, riskPercent, portfolioValue);
}


