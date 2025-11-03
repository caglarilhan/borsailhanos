/**
 * P5.2: Dynamic Risk & Rebalance System
 * AI, volatilite artarsa kendi kendine "erken rebalance" tetiklesin
 * if (volatility > 5.0) trigger("rebalance_now");
 */

export interface PortfolioMetrics {
  volatility: number; // Annualized volatility (0-1 scale, e.g., 0.05 = 5%)
  sharpeRatio: number;
  maxDrawdown: number; // Maximum drawdown (0-1 scale)
  currentRisk: number; // Current risk score (0-1)
  targetRisk: number; // Target risk score (0-1)
}

export interface RebalanceTrigger {
  shouldRebalance: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  suggestedActions: string[];
  volatilityThreshold: number;
  currentVolatility: number;
}

export interface PositionSize {
  symbol: string;
  currentWeight: number; // 0-1
  targetWeight: number; // 0-1
  adjustment: number; // Target - Current
  reason: string;
}

/**
 * Dynamic Risk & Rebalance Engine
 */
export class DynamicRiskRebalancer {
  private volatilityThreshold: number = 0.05; // 5% volatility threshold
  private maxDrawdownThreshold: number = 0.10; // 10% max drawdown threshold
  private rebalanceHistory: Array<{ timestamp: string; reason: string }> = [];

  /**
   * Check if rebalance is needed based on volatility
   */
  checkRebalanceNeeded(metrics: PortfolioMetrics): RebalanceTrigger {
    const { volatility, maxDrawdown, currentRisk, targetRisk } = metrics;
    
    let shouldRebalance = false;
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const reasons: string[] = [];
    const actions: string[] = [];

    // Volatility check: if (volatility > 5.0) trigger("rebalance_now")
    if (volatility > this.volatilityThreshold) {
      shouldRebalance = true;
      
      if (volatility > 0.10) {
        priority = 'critical';
      } else if (volatility > 0.075) {
        priority = 'high';
      } else {
        priority = 'medium';
      }
      
      reasons.push(`Volatilite %${(volatility * 100).toFixed(1)} eşik değerini (%${(this.volatilityThreshold * 100)}) aştı`);
      actions.push('Portföy pozisyonlarını küçültün');
      actions.push('Stop-loss seviyelerini sıkılaştırın');
    }

    // Max drawdown check
    if (maxDrawdown > this.maxDrawdownThreshold) {
      shouldRebalance = true;
      if (priority === 'low') priority = 'high';
      
      reasons.push(`Maksimum düşüş %${(maxDrawdown * 100).toFixed(1)} eşik değerini (%${(this.maxDrawdownThreshold * 100)}) aştı`);
      actions.push('Risk pozisyonlarını azaltın');
      actions.push('Defansif pozisyonlara geçin (nakit/altın)');
    }

    // Risk deviation check
    const riskDeviation = Math.abs(currentRisk - targetRisk);
    if (riskDeviation > 0.05) { // 5% deviation
      shouldRebalance = true;
      if (priority === 'low') priority = 'medium';
      
      reasons.push(`Risk sapması %${(riskDeviation * 100).toFixed(1)} - Hedef risk: %${(targetRisk * 100).toFixed(1)}, Mevcut: %${(currentRisk * 100).toFixed(1)}`);
      actions.push('Portföy riskini hedef seviyeye getirin');
    }

    return {
      shouldRebalance,
      priority,
      reason: reasons.join('; '),
      suggestedActions: actions,
      volatilityThreshold: this.volatilityThreshold,
      currentVolatility: volatility,
    };
  }

  /**
   * Calculate position size adjustments for rebalancing
   */
  calculateRebalance(
    symbols: string[],
    currentWeights: Map<string, number>,
    metrics: PortfolioMetrics,
    targetWeights?: Map<string, number>
  ): PositionSize[] {
    const adjustments: PositionSize[] = [];

    symbols.forEach((symbol) => {
      const currentWeight = currentWeights.get(symbol) || 0;
      let targetWeight = targetWeights?.get(symbol) || currentWeight;
      
      // If volatility is high, reduce position sizes
      if (metrics.volatility > this.volatilityThreshold) {
        // Reduce all positions proportionally
        const reductionFactor = 1 - (metrics.volatility - this.volatilityThreshold) * 2; // Reduce by excess volatility
        targetWeight = Math.max(0, currentWeight * Math.max(0.5, reductionFactor)); // At least 50% of original
      }

      const adjustment = targetWeight - currentWeight;
      
      if (Math.abs(adjustment) > 0.01) { // Only adjust if change > 1%
        adjustments.push({
          symbol,
          currentWeight,
          targetWeight,
          adjustment,
          reason: this.getRebalanceReason(adjustment, metrics),
        });
      }
    });

    return adjustments;
  }

  /**
   * Get rebalance reason
   */
  private getRebalanceReason(adjustment: number, metrics: PortfolioMetrics): string {
    if (metrics.volatility > this.volatilityThreshold) {
      if (adjustment < 0) {
        return `Yüksek volatilite nedeniyle pozisyon küçültüldü (%${Math.abs(adjustment * 100).toFixed(1)} azaltma)`;
      } else {
        return `Yüksek volatilite nedeniyle pozisyon korundu (%${(adjustment * 100).toFixed(1)} artış)`;
      }
    }
    
    if (metrics.maxDrawdown > this.maxDrawdownThreshold) {
      return `Maksimum düşüş nedeniyle pozisyon ayarlandı (%${(adjustment * 100).toFixed(1)} değişim)`;
    }
    
    return `Risk optimizasyonu için pozisyon ayarlandı (%${(adjustment * 100).toFixed(1)} değişim)`;
  }

  /**
   * Record rebalance action
   */
  recordRebalance(reason: string): void {
    this.rebalanceHistory.push({
      timestamp: new Date().toISOString(),
      reason,
    });

    // Keep only last 100 rebalances
    if (this.rebalanceHistory.length > 100) {
      this.rebalanceHistory.shift();
    }
  }

  /**
   * Get rebalance history
   */
  getRebalanceHistory(): Array<{ timestamp: string; reason: string }> {
    return [...this.rebalanceHistory];
  }

  /**
   * Set volatility threshold
   */
  setVolatilityThreshold(threshold: number): void {
    this.volatilityThreshold = threshold;
  }
}

// Singleton instance
export const dynamicRiskRebalancer = new DynamicRiskRebalancer();

/**
 * Check if rebalance is needed
 */
export function checkRebalanceNeeded(metrics: PortfolioMetrics): RebalanceTrigger {
  return dynamicRiskRebalancer.checkRebalanceNeeded(metrics);
}

/**
 * Calculate rebalance adjustments
 */
export function calculateRebalance(
  symbols: string[],
  currentWeights: Map<string, number>,
  metrics: PortfolioMetrics,
  targetWeights?: Map<string, number>
): PositionSize[] {
  return dynamicRiskRebalancer.calculateRebalance(symbols, currentWeights, metrics, targetWeights);
}


