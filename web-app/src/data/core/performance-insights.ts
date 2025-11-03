/**
 * P5.2: Performance Insights
 * Kullanıcı performans raporu: win rate / avg R:R / trading style
 */

export interface TradeRecord {
  id: string;
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  entryPrice: number;
  exitPrice?: number;
  entryTime: string;
  exitTime?: string;
  profit?: number; // Realized profit/loss
  returnPercent?: number; // Return as percentage
  confidence: number;
  wasCorrect?: boolean; // Directional accuracy
  holdingPeriod?: number; // Hours
}

export interface PerformanceMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number; // 0-1
  averageReturn: number; // Average return percentage
  averageRR: number; // Average Risk:Reward ratio
  sharpeRatio: number; // Risk-adjusted return
  maxDrawdown: number; // Maximum drawdown percentage
  tradingStyle: 'scalper' | 'swing' | 'position' | 'mixed';
  bestSymbol: string;
  worstSymbol: string;
  averageHoldingPeriod: number; // Hours
  profitFactor: number; // Sum of wins / Sum of losses
}

export interface PerformanceInsight {
  metric: string;
  value: string;
  trend: 'improving' | 'worsening' | 'stable';
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Performance Insights Generator
 */
export class PerformanceInsightsGenerator {
  private trades: TradeRecord[] = [];
  private maxTrades = 10000;

  /**
   * Record trade
   */
  recordTrade(trade: Omit<TradeRecord, 'id' | 'entryTime'>): string {
    const id = this.generateID();
    const newTrade: TradeRecord = {
      ...trade,
      id,
      entryTime: trade.entryTime || new Date().toISOString(),
    };

    // Calculate profit if exit price is available
    if (trade.exitPrice && trade.entryPrice) {
      const priceReturn = (trade.exitPrice - trade.entryPrice) / trade.entryPrice;
      const directionMultiplier = trade.signal === 'BUY' ? 1 : -1;
      newTrade.profit = priceReturn * directionMultiplier * trade.entryPrice;
      newTrade.returnPercent = priceReturn * directionMultiplier * 100;
      
      // Determine if trade was correct (directional accuracy)
      newTrade.wasCorrect = 
        (trade.signal === 'BUY' && newTrade.profit > 0) ||
        (trade.signal === 'SELL' && newTrade.profit < 0) ||
        (trade.signal === 'HOLD');
    }

    // Calculate holding period
    if (trade.exitTime && trade.entryTime) {
      const entry = new Date(trade.entryTime);
      const exit = new Date(trade.exitTime);
      newTrade.holdingPeriod = (exit.getTime() - entry.getTime()) / (1000 * 60 * 60); // Hours
    }

    this.trades.push(newTrade);

    // Keep only recent trades
    if (this.trades.length > this.maxTrades) {
      this.trades.shift();
    }

    return id;
  }

  /**
   * Calculate performance metrics
   */
  calculateMetrics(period: '7d' | '30d' | '90d' | 'all' = '30d'): PerformanceMetrics {
    const now = new Date();
    let filteredTrades = [...this.trades];

    // Filter by period
    if (period !== 'all') {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const cutoff = new Date();
      cutoff.setDate(now.getDate() - days);
      
      filteredTrades = filteredTrades.filter((t) => 
        new Date(t.entryTime) >= cutoff
      );
    }

    // Filter completed trades only
    const completedTrades = filteredTrades.filter((t) => t.profit !== undefined);

    if (completedTrades.length === 0) {
      return this.getEmptyMetrics();
    }

    // Basic metrics
    const totalTrades = completedTrades.length;
    const winningTrades = completedTrades.filter((t) => (t.profit || 0) > 0).length;
    const losingTrades = completedTrades.filter((t) => (t.profit || 0) < 0).length;
    const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;

    // Average return
    const returns = completedTrades
      .map((t) => t.returnPercent || 0)
      .filter((r) => !isNaN(r));
    const averageReturn = returns.length > 0
      ? returns.reduce((a, b) => a + b, 0) / returns.length
      : 0;

    // Average Risk:Reward (simplified)
    const wins = completedTrades
      .filter((t) => (t.profit || 0) > 0)
      .map((t) => Math.abs(t.returnPercent || 0));
    const losses = completedTrades
      .filter((t) => (t.profit || 0) < 0)
      .map((t) => Math.abs(t.returnPercent || 0));
    
    const avgWin = wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0;
    const averageRR = avgLoss > 0 ? avgWin / avgLoss : avgWin;

    // Sharpe ratio (simplified)
    const returnStd = returns.length > 1
      ? Math.sqrt(
          returns.reduce((sum, r) => sum + Math.pow(r - averageReturn, 2), 0) / returns.length
        )
      : 0;
    const sharpeRatio = returnStd > 0 ? averageReturn / returnStd : 0;

    // Maximum drawdown
    let maxDrawdown = 0;
    let peak = 0;
    let cumulative = 0;
    
    completedTrades.forEach((t) => {
      cumulative += t.returnPercent || 0;
      if (cumulative > peak) {
        peak = cumulative;
      }
      const drawdown = peak - cumulative;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    // Trading style (based on average holding period)
    const holdingPeriods = completedTrades
      .map((t) => t.holdingPeriod || 0)
      .filter((h) => h > 0);
    const averageHoldingPeriod = holdingPeriods.length > 0
      ? holdingPeriods.reduce((a, b) => a + b, 0) / holdingPeriods.length
      : 0;
    
    let tradingStyle: 'scalper' | 'swing' | 'position' | 'mixed' = 'mixed';
    if (averageHoldingPeriod < 4) {
      tradingStyle = 'scalper';
    } else if (averageHoldingPeriod < 24) {
      tradingStyle = 'swing';
    } else if (averageHoldingPeriod >= 24) {
      tradingStyle = 'position';
    }

    // Best/worst symbol
    const symbolPerformance = new Map<string, { profit: number; count: number }>();
    completedTrades.forEach((t) => {
      const existing = symbolPerformance.get(t.symbol) || { profit: 0, count: 0 };
      symbolPerformance.set(t.symbol, {
        profit: existing.profit + (t.profit || 0),
        count: existing.count + 1,
      });
    });

    const bestSymbol = Array.from(symbolPerformance.entries())
      .sort((a, b) => b[1].profit - a[1].profit)[0]?.[0] || '—';
    
    const worstSymbol = Array.from(symbolPerformance.entries())
      .sort((a, b) => a[1].profit - b[1].profit)[0]?.[0] || '—';

    // Profit factor
    const totalWins = completedTrades
      .filter((t) => (t.profit || 0) > 0)
      .reduce((sum, t) => sum + (t.profit || 0), 0);
    const totalLosses = Math.abs(
      completedTrades
        .filter((t) => (t.profit || 0) < 0)
        .reduce((sum, t) => sum + (t.profit || 0), 0)
    );
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      averageReturn,
      averageRR,
      sharpeRatio,
      maxDrawdown,
      tradingStyle,
      bestSymbol,
      worstSymbol,
      averageHoldingPeriod,
      profitFactor,
    };
  }

  /**
   * Generate insights and recommendations
   */
  generateInsights(metrics: PerformanceMetrics): PerformanceInsight[] {
    const insights: PerformanceInsight[] = [];

    // Win rate insight
    if (metrics.winRate < 0.5) {
      insights.push({
        metric: 'Win Rate',
        value: `${(metrics.winRate * 100).toFixed(1)}%`,
        trend: 'worsening',
        recommendation: 'Win rate düşük. Sinyal filtrelemeyi sıkılaştır, yalnızca yüksek güvenli sinyalleri al.',
        priority: 'high',
      });
    } else if (metrics.winRate > 0.6) {
      insights.push({
        metric: 'Win Rate',
        value: `${(metrics.winRate * 100).toFixed(1)}%`,
        trend: 'improving',
        recommendation: 'Win rate iyi. Mevcut stratejiyi koru, pozisyon boyutunu kademeli artırabilirsin.',
        priority: 'low',
      });
    }

    // Risk:Reward insight
    if (metrics.averageRR < 1.5) {
      insights.push({
        metric: 'Risk:Reward',
        value: `${metrics.averageRR.toFixed(1)}:1`,
        trend: 'worsening',
        recommendation: 'R:R düşük. Hedef fiyatlarını gözden geçir, stop-loss seviyelerini optimize et.',
        priority: 'high',
      });
    }

    // Drawdown insight
    if (metrics.maxDrawdown > 20) {
      insights.push({
        metric: 'Maksimum Düşüş',
        value: `${metrics.maxDrawdown.toFixed(1)}%`,
        trend: 'worsening',
        recommendation: 'Maksimum düşüş yüksek. Risk yönetimini güçlendir, pozisyon boyutlarını küçült.',
        priority: 'critical',
      });
    }

    // Trading style insight
    insights.push({
      metric: 'Trading Style',
      value: metrics.tradingStyle === 'scalper' ? 'Scalper' : metrics.tradingStyle === 'swing' ? 'Swing' : 'Position',
      trend: 'stable',
      recommendation: `Ortalama pozisyon süresi ${metrics.averageHoldingPeriod.toFixed(1)} saat. ${metrics.tradingStyle === 'scalper' ? 'Scalper' : metrics.tradingStyle === 'swing' ? 'Swing trader' : 'Position trader'} profiline uygun.`,
      priority: 'low',
    });

    return insights;
  }

  /**
   * Get empty metrics
   */
  private getEmptyMetrics(): PerformanceMetrics {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      averageReturn: 0,
      averageRR: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      tradingStyle: 'mixed',
      bestSymbol: '—',
      worstSymbol: '—',
      averageHoldingPeriod: 0,
      profitFactor: 0,
    };
  }

  /**
   * Get trade history
   */
  getTradeHistory(limit: number = 100): TradeRecord[] {
    return this.trades
      .slice(-limit)
      .sort((a, b) => 
        new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()
      );
  }

  /**
   * Generate unique ID
   */
  private generateID(): string {
    return `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const performanceInsightsGenerator = new PerformanceInsightsGenerator();

/**
 * Record trade
 */
export function recordTrade(trade: Omit<TradeRecord, 'id' | 'entryTime'>): string {
  return performanceInsightsGenerator.recordTrade(trade);
}

/**
 * Calculate performance metrics
 */
export function calculatePerformanceMetrics(period: '7d' | '30d' | '90d' | 'all' = '30d'): PerformanceMetrics {
  return performanceInsightsGenerator.calculateMetrics(period);
}

/**
 * Generate insights
 */
export function generatePerformanceInsights(metrics: PerformanceMetrics): PerformanceInsight[] {
  return performanceInsightsGenerator.generateInsights(metrics);
}


