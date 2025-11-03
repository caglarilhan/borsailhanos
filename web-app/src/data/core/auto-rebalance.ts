/**
 * P5.2: Auto-Rebalance (AI)
 * 5 günde bir yeniden optimize et
 */

export interface RebalanceConfig {
  enabled: boolean;
  interval: number; // Days (default: 5)
  minRebalanceThreshold: number; // Minimum drift to trigger rebalance (default: 5%)
  riskTolerance: 'low' | 'medium' | 'high';
  maxPositionSize: number; // Maximum position size as % of portfolio (default: 20%)
  minPositionSize: number; // Minimum position size as % of portfolio (default: 1%)
}

export interface RebalanceDecision {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD' | 'CLOSE';
  currentWeight: number; // Current weight in portfolio (%)
  targetWeight: number; // Target weight in portfolio (%)
  sharesToTrade: number; // Number of shares to trade
  expectedReturn: number; // Expected return (%)
  risk: number; // Risk score (0-5)
  reason: string;
}

export interface RebalancePlan {
  timestamp: string;
  lastRebalance: string;
  nextRebalance: string;
  decisions: RebalanceDecision[];
  totalTrades: number;
  expectedPortfolioReturn: number;
  expectedPortfolioRisk: number;
  explanation: string;
}

/**
 * Auto-Rebalance Engine
 */
export class AutoRebalanceEngine {
  private config: RebalanceConfig = {
    enabled: true,
    interval: 5, // 5 days
    minRebalanceThreshold: 5, // 5% drift threshold
    riskTolerance: 'medium',
    maxPositionSize: 20, // 20% max position
    minPositionSize: 1, // 1% min position
  };

  private lastRebalance: string | null = null;

  /**
   * Update rebalance configuration
   */
  updateConfig(config: Partial<RebalanceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get rebalance configuration
   */
  getConfig(): RebalanceConfig {
    return { ...this.config };
  }

  /**
   * Check if rebalance is needed
   */
  shouldRebalance(
    currentWeights: Record<string, number>, // symbol -> weight %
    targetWeights: Record<string, number>, // symbol -> weight %
    lastRebalanceDate: string
  ): {
    shouldRebalance: boolean;
    reason: string;
    daysSinceLastRebalance: number;
  } {
    if (!this.config.enabled) {
      return {
        shouldRebalance: false,
        reason: 'Auto-rebalance kapalı',
        daysSinceLastRebalance: 0,
      };
    }

    // Check interval
    const now = new Date();
    const lastRebalance = new Date(lastRebalanceDate);
    const daysSinceLastRebalance = Math.floor((now.getTime() - lastRebalance.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLastRebalance < this.config.interval) {
      return {
        shouldRebalance: false,
        reason: `${this.config.interval} günlük interval henüz dolmadı (${daysSinceLastRebalance}/${this.config.interval} gün)`,
        daysSinceLastRebalance,
      };
    }

    // Check drift threshold
    let maxDrift = 0;
    for (const symbol in currentWeights) {
      const current = currentWeights[symbol] || 0;
      const target = targetWeights[symbol] || 0;
      const drift = Math.abs(current - target);
      if (drift > maxDrift) {
        maxDrift = drift;
      }
    }

    if (maxDrift < this.config.minRebalanceThreshold) {
      return {
        shouldRebalance: false,
        reason: `Drift eşiği (${this.config.minRebalanceThreshold}%) aşılmadı (maksimum drift: ${maxDrift.toFixed(1)}%)`,
        daysSinceLastRebalance,
      };
    }

    return {
      shouldRebalance: true,
      reason: `${daysSinceLastRebalance} gün geçti ve drift eşiği (${maxDrift.toFixed(1)}%) aşıldı`,
      daysSinceLastRebalance,
    };
  }

  /**
   * Generate rebalance plan
   */
  generateRebalancePlan(
    currentPortfolio: Record<string, { shares: number; price: number; weight: number }>,
    targetWeights: Record<string, number>,
    expectedReturns: Record<string, number>,
    riskScores: Record<string, number>,
    totalPortfolioValue: number
  ): RebalancePlan {
    const decisions: RebalanceDecision[] = [];
    let totalTrades = 0;

    // Calculate current weights
    const currentWeights: Record<string, number> = {};
    for (const symbol in currentPortfolio) {
      currentWeights[symbol] = currentPortfolio[symbol].weight;
    }

    // Generate decisions
    for (const symbol in targetWeights) {
      const currentWeight = currentWeights[symbol] || 0;
      const targetWeight = targetWeights[symbol] || 0;
      const drift = targetWeight - currentWeight;

      // Skip if drift is small (< 0.5%)
      if (Math.abs(drift) < 0.5) {
        decisions.push({
          symbol,
          action: 'HOLD',
          currentWeight,
          targetWeight,
          sharesToTrade: 0,
          expectedReturn: expectedReturns[symbol] || 0,
          risk: riskScores[symbol] || 0,
          reason: `Ağırlık farkı küçük (${drift.toFixed(2)}%), rebalance gerekmiyor`,
        });
        continue;
      }

      // Determine action
      let action: 'BUY' | 'SELL' | 'HOLD' | 'CLOSE' = 'HOLD';
      if (drift > 0.5) {
        action = 'BUY';
      } else if (drift < -0.5 && currentWeight > this.config.minPositionSize) {
        action = 'SELL';
      } else if (currentWeight > 0 && targetWeight < this.config.minPositionSize) {
        action = 'CLOSE';
      }

      // Calculate shares to trade
      const targetValue = totalPortfolioValue * (targetWeight / 100);
      const currentValue = currentPortfolio[symbol]?.price
        ? currentPortfolio[symbol].price * (currentPortfolio[symbol].shares || 0)
        : 0;
      const tradeValue = targetValue - currentValue;
      const price = currentPortfolio[symbol]?.price || 0;
      const sharesToTrade = price > 0 ? Math.round(tradeValue / price) : 0;

      if (sharesToTrade !== 0) {
        totalTrades++;
      }

      // Generate reason
      const reason = this.generateReason(symbol, action, currentWeight, targetWeight, drift);

      decisions.push({
        symbol,
        action,
        currentWeight,
        targetWeight,
        sharesToTrade: Math.abs(sharesToTrade),
        expectedReturn: expectedReturns[symbol] || 0,
        risk: riskScores[symbol] || 0,
        reason,
      });
    }

    // Calculate expected portfolio metrics
    const expectedPortfolioReturn = decisions.reduce((sum, d) => sum + (d.expectedReturn * d.targetWeight / 100), 0);
    const expectedPortfolioRisk = decisions.reduce((sum, d) => sum + (d.risk * d.targetWeight / 100), 0);

    // Generate explanation
    const explanation = this.generateExplanation(decisions, totalTrades, expectedPortfolioReturn, expectedPortfolioRisk);

    const now = new Date();
    const nextRebalance = new Date();
    nextRebalance.setDate(now.getDate() + this.config.interval);

    return {
      timestamp: now.toISOString(),
      lastRebalance: this.lastRebalance || now.toISOString(),
      nextRebalance: nextRebalance.toISOString(),
      decisions,
      totalTrades,
      expectedPortfolioReturn,
      expectedPortfolioRisk,
      explanation,
    };
  }

  /**
   * Generate reason for rebalance decision
   */
  private generateReason(
    symbol: string,
    action: 'BUY' | 'SELL' | 'HOLD' | 'CLOSE',
    currentWeight: number,
    targetWeight: number,
    drift: number
  ): string {
    if (action === 'HOLD') {
      return `Ağırlık farkı küçük (${drift.toFixed(2)}%), rebalance gerekmiyor`;
    }

    if (action === 'BUY') {
      return `${symbol}: Ağırlık ${currentWeight.toFixed(1)}% → ${targetWeight.toFixed(1)}% (hedef: +${drift.toFixed(1)}%)`;
    }

    if (action === 'SELL') {
      return `${symbol}: Ağırlık ${currentWeight.toFixed(1)}% → ${targetWeight.toFixed(1)}% (hedef: ${drift.toFixed(1)}%)`;
    }

    if (action === 'CLOSE') {
      return `${symbol}: Pozisyon kapatılacak (mevcut: ${currentWeight.toFixed(1)}%, hedef: ${targetWeight.toFixed(1)}%)`;
    }

    return '';
  }

  /**
   * Generate explanation
   */
  private generateExplanation(
    decisions: RebalanceDecision[],
    totalTrades: number,
    expectedReturn: number,
    expectedRisk: number
  ): string {
    const buyCount = decisions.filter((d) => d.action === 'BUY').length;
    const sellCount = decisions.filter((d) => d.action === 'SELL').length;
    const closeCount = decisions.filter((d) => d.action === 'CLOSE').length;

    return `Rebalance planı: ${totalTrades} işlem (${buyCount} alım, ${sellCount} satım, ${closeCount} kapatma). Beklenen portföy getirisi: %${expectedReturn.toFixed(2)}, Risk: ${expectedRisk.toFixed(1)}/5.`;
  }

  /**
   * Execute rebalance (mark as executed)
   */
  executeRebalance(): void {
    this.lastRebalance = new Date().toISOString();
  }

  /**
   * Get last rebalance date
   */
  getLastRebalance(): string | null {
    return this.lastRebalance;
  }
}

// Singleton instance
export const autoRebalanceEngine = new AutoRebalanceEngine();

/**
 * Check if rebalance is needed
 */
export function shouldRebalance(
  currentWeights: Record<string, number>,
  targetWeights: Record<string, number>,
  lastRebalanceDate: string
): {
  shouldRebalance: boolean;
  reason: string;
  daysSinceLastRebalance: number;
} {
  return autoRebalanceEngine.shouldRebalance(currentWeights, targetWeights, lastRebalanceDate);
}

/**
 * Generate rebalance plan
 */
export function generateRebalancePlan(
  currentPortfolio: Record<string, { shares: number; price: number; weight: number }>,
  targetWeights: Record<string, number>,
  expectedReturns: Record<string, number>,
  riskScores: Record<string, number>,
  totalPortfolioValue: number
): RebalancePlan {
  return autoRebalanceEngine.generateRebalancePlan(
    currentPortfolio,
    targetWeights,
    expectedReturns,
    riskScores,
    totalPortfolioValue
  );
}


