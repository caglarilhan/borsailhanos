/**
 * P5.2: Trader Type Selector
 * Trader tipi seçimi → risk & hız parametresine bağla
 */

export type TraderType = 'passive' | 'balanced' | 'aggressive';

export interface TraderProfile {
  type: TraderType;
  riskTolerance: number; // 0-1 (0 = risk-averse, 1 = risk-seeking)
  tradeFrequency: number; // Trades per day
  holdingPeriod: number; // Average holding period in hours
  positionSize: number; // Position size multiplier (0-1)
  stopLossPercent: number; // Stop loss as percentage
  takeProfitPercent: number; // Take profit as percentage
  confidenceThreshold: number; // Minimum confidence to enter trade (0-1)
  maxDrawdown: number; // Maximum drawdown tolerance (0-1)
}

/**
 * Trader Type Selector
 */
export class TraderTypeSelector {
  /**
   * Get trader profile for type
   */
  getProfile(type: TraderType): TraderProfile {
    const profiles: Record<TraderType, TraderProfile> = {
      passive: {
        type: 'passive',
        riskTolerance: 0.2,
        tradeFrequency: 0.5, // ~1 trade per 2 days
        holdingPeriod: 168, // 1 week average
        positionSize: 0.5, // Half position size
        stopLossPercent: -2.0, // 2% stop loss
        takeProfitPercent: 5.0, // 5% take profit
        confidenceThreshold: 0.85, // High confidence required
        maxDrawdown: 0.10, // 10% max drawdown
      },
      balanced: {
        type: 'balanced',
        riskTolerance: 0.5,
        tradeFrequency: 2, // 2 trades per day
        holdingPeriod: 24, // 1 day average
        positionSize: 0.75, // 75% position size
        stopLossPercent: -3.0, // 3% stop loss
        takeProfitPercent: 6.0, // 6% take profit
        confidenceThreshold: 0.75, // Medium confidence required
        maxDrawdown: 0.15, // 15% max drawdown
      },
      aggressive: {
        type: 'aggressive',
        riskTolerance: 0.8,
        tradeFrequency: 5, // 5 trades per day
        holdingPeriod: 4, // 4 hours average
        positionSize: 1.0, // Full position size
        stopLossPercent: -5.0, // 5% stop loss
        takeProfitPercent: 10.0, // 10% take profit
        confidenceThreshold: 0.65, // Lower confidence acceptable
        maxDrawdown: 0.25, // 25% max drawdown
      },
    };

    return profiles[type];
  }

  /**
   * Adjust signal for trader type
   */
  adjustSignalForType(
    signal: 'BUY' | 'SELL' | 'HOLD',
    confidence: number,
    profile: TraderProfile
  ): {
    adjustedSignal: 'BUY' | 'SELL' | 'HOLD';
    adjustedConfidence: number;
    recommendation: string;
  } {
    let adjustedSignal = signal;
    let adjustedConfidence = confidence;
    let recommendation = '';

    // If confidence below threshold, downgrade to HOLD
    if (confidence < profile.confidenceThreshold && signal !== 'HOLD') {
      adjustedSignal = 'HOLD';
      adjustedConfidence = confidence;
      recommendation = `Güven %${(confidence * 100).toFixed(1)} eşik değerinin (%${(profile.confidenceThreshold * 100)}) altında → HOLD pozisyonu önerilir.`;
    } else if (signal === 'BUY') {
      // Adjust confidence based on risk tolerance
      adjustedConfidence = confidence * profile.riskTolerance;
      
      if (profile.type === 'passive') {
        recommendation = `Pasif trader profili: Pozisyon küçük tutulabilir (%${(profile.positionSize * 100).toFixed(0)}), stop-loss %${Math.abs(profile.stopLossPercent)} seviyesi önerilir.`;
      } else if (profile.type === 'aggressive') {
        recommendation = `Agresif trader profili: Tam pozisyon alınabilir, stop-loss %${Math.abs(profile.stopLossPercent)} seviyesi önerilir.`;
      }
    } else if (signal === 'SELL') {
      recommendation = `SELL sinyali: Risk yönetimi önemli. Stop-loss %${Math.abs(profile.stopLossPercent)} seviyesi önerilir.`;
    }

    return {
      adjustedSignal,
      adjustedConfidence,
      recommendation,
    };
  }

  /**
   * Calculate position size for trader type
   */
  calculatePositionSize(
    baseSize: number,
    profile: TraderProfile
  ): number {
    return baseSize * profile.positionSize;
  }

  /**
   * Get stop loss price for trader type
   */
  getStopLossPrice(
    entryPrice: number,
    signal: 'BUY' | 'SELL',
    profile: TraderProfile
  ): number {
    const stopPercent = profile.stopLossPercent;
    
    if (signal === 'BUY') {
      return entryPrice * (1 + stopPercent / 100); // Negative stopPercent
    } else {
      return entryPrice * (1 - stopPercent / 100); // Positive stopPercent
    }
  }

  /**
   * Get take profit price for trader type
   */
  getTakeProfitPrice(
    entryPrice: number,
    signal: 'BUY' | 'SELL',
    profile: TraderProfile
  ): number {
    const profitPercent = profile.takeProfitPercent;
    
    if (signal === 'BUY') {
      return entryPrice * (1 + profitPercent / 100);
    } else {
      return entryPrice * (1 - profitPercent / 100);
    }
  }
}

// Singleton instance
export const traderTypeSelector = new TraderTypeSelector();

/**
 * Get trader profile
 */
export function getTraderProfile(type: TraderType): TraderProfile {
  return traderTypeSelector.getProfile(type);
}

/**
 * Adjust signal for trader type
 */
export function adjustSignalForTraderType(
  signal: 'BUY' | 'SELL' | 'HOLD',
  confidence: number,
  type: TraderType
): {
  adjustedSignal: 'BUY' | 'SELL' | 'HOLD';
  adjustedConfidence: number;
  recommendation: string;
} {
  const profile = traderTypeSelector.getProfile(type);
  return traderTypeSelector.adjustSignalForType(signal, confidence, profile);
}


