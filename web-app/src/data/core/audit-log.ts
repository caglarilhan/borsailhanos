/**
 * P5.2: Audit Log (Trade-by-Trade PnL)
 * İşlem log tablosu (trade-by-trade PnL)
 */

export interface TradeLog {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL' | 'HOLD';
  orderType: 'MARKET' | 'LIMIT' | 'STOP';
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  entryTime: string;
  exitTime?: string;
  commission: number; // Commission in TRY
  slippage: number; // Slippage in TRY
  tax: number; // Tax in TRY
  totalCost: number; // Total cost in TRY
  grossPnL: number; // Gross profit/loss in TRY
  netPnL: number; // Net profit/loss in TRY (after costs)
  returnPercent: number; // Return as percentage
  holdingPeriod: number; // Holding period in hours
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number; // 0-1
  reason: string;
}

export interface AuditLogSummary {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  totalGrossPnL: number;
  totalNetPnL: number;
  totalCosts: number;
  averageReturn: number;
  winRate: number; // 0-1
  profitFactor: number; // Sum of wins / Sum of losses
  bestTrade: TradeLog | null;
  worstTrade: TradeLog | null;
  averageHoldingPeriod: number; // Hours
  sharpeRatio: number;
}

/**
 * Audit Log Manager
 */
export class AuditLogManager {
  private trades: TradeLog[] = [];
  private maxTrades = 10000;

  /**
   * Log trade entry
   */
  logEntry(
    symbol: string,
    side: 'BUY' | 'SELL',
    orderType: 'MARKET' | 'LIMIT' | 'STOP',
    quantity: number,
    entryPrice: number,
    signal: 'BUY' | 'SELL' | 'HOLD',
    confidence: number,
    commission: number,
    slippage: number,
    tax: number,
    reason: string
  ): string {
    const id = this.generateID();
    const trade: TradeLog = {
      id,
      symbol,
      side,
      orderType,
      quantity,
      entryPrice,
      entryTime: new Date().toISOString(),
      commission,
      slippage,
      tax,
      totalCost: commission + slippage + tax,
      grossPnL: 0, // Will be calculated on exit
      netPnL: 0, // Will be calculated on exit
      returnPercent: 0, // Will be calculated on exit
      holdingPeriod: 0, // Will be calculated on exit
      status: 'OPEN',
      signal,
      confidence,
      reason,
    };

    this.trades.push(trade);

    // Keep only recent trades
    if (this.trades.length > this.maxTrades) {
      this.trades.shift();
    }

    return id;
  }

  /**
   * Log trade exit
   */
  logExit(
    tradeId: string,
    exitPrice: number,
    exitCommission: number,
    exitSlippage: number,
    exitTax: number
  ): boolean {
    const trade = this.trades.find((t) => t.id === tradeId);
    if (!trade || trade.status !== 'OPEN') {
      return false;
    }

    trade.exitPrice = exitPrice;
    trade.exitTime = new Date().toISOString();
    trade.status = 'CLOSED';

    // Calculate PnL
    const grossValue = (exitPrice - trade.entryPrice) * trade.quantity;
    const exitCost = exitCommission + exitSlippage + exitTax;
    trade.grossPnL = trade.side === 'BUY' ? grossValue : -grossValue;
    trade.netPnL = trade.grossPnL - trade.totalCost - exitCost;
    trade.returnPercent = ((trade.netPnL / (trade.entryPrice * trade.quantity)) * 100);

    // Calculate holding period
    const entry = new Date(trade.entryTime);
    const exit = new Date(trade.exitTime);
    trade.holdingPeriod = (exit.getTime() - entry.getTime()) / (1000 * 60 * 60); // Hours

    return true;
  }

  /**
   * Cancel trade
   */
  cancelTrade(tradeId: string): boolean {
    const trade = this.trades.find((t) => t.id === tradeId);
    if (!trade || trade.status !== 'OPEN') {
      return false;
    }

    trade.status = 'CANCELLED';
    return true;
  }

  /**
   * Get trade history
   */
  getHistory(limit: number = 100): TradeLog[] {
    return this.trades
      .slice(-limit)
      .sort((a, b) => 
        new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()
      );
  }

  /**
   * Get open trades
   */
  getOpenTrades(): TradeLog[] {
    return this.trades.filter((t) => t.status === 'OPEN');
  }

  /**
   * Get closed trades
   */
  getClosedTrades(): TradeLog[] {
    return this.trades.filter((t) => t.status === 'CLOSED');
  }

  /**
   * Get trades for symbol
   */
  getTradesForSymbol(symbol: string): TradeLog[] {
    return this.trades.filter((t) => t.symbol === symbol);
  }

  /**
   * Get audit log summary
   */
  getSummary(): AuditLogSummary {
    const closedTrades = this.getClosedTrades();

    if (closedTrades.length === 0) {
      return {
        totalTrades: this.trades.length,
        openTrades: this.getOpenTrades().length,
        closedTrades: 0,
        totalGrossPnL: 0,
        totalNetPnL: 0,
        totalCosts: 0,
        averageReturn: 0,
        winRate: 0,
        profitFactor: 0,
        bestTrade: null,
        worstTrade: null,
        averageHoldingPeriod: 0,
        sharpeRatio: 0,
      };
    }

    const totalGrossPnL = closedTrades.reduce((sum, t) => sum + t.grossPnL, 0);
    const totalNetPnL = closedTrades.reduce((sum, t) => sum + t.netPnL, 0);
    const totalCosts = closedTrades.reduce((sum, t) => sum + t.totalCost, 0);

    const returns = closedTrades.map((t) => t.returnPercent);
    const averageReturn = returns.reduce((a, b) => a + b, 0) / returns.length;

    const wins = closedTrades.filter((t) => t.netPnL > 0);
    const losses = closedTrades.filter((t) => t.netPnL < 0);
    const winRate = wins.length / closedTrades.length;

    const totalWins = wins.reduce((sum, t) => sum + t.netPnL, 0);
    const totalLosses = Math.abs(losses.reduce((sum, t) => sum + t.netPnL, 0));
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;

    const bestTrade = closedTrades.reduce((best, t) => (t.netPnL > best.netPnL ? t : best), closedTrades[0]);
    const worstTrade = closedTrades.reduce((worst, t) => (t.netPnL < worst.netPnL ? t : worst), closedTrades[0]);

    const holdingPeriods = closedTrades
      .map((t) => t.holdingPeriod)
      .filter((h) => h > 0);
    const averageHoldingPeriod = holdingPeriods.length > 0
      ? holdingPeriods.reduce((a, b) => a + b, 0) / holdingPeriods.length
      : 0;

    // Sharpe ratio (simplified)
    const returnStd = returns.length > 1
      ? Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - averageReturn, 2), 0) / returns.length)
      : 0;
    const sharpeRatio = returnStd > 0 ? averageReturn / returnStd : 0;

    return {
      totalTrades: this.trades.length,
      openTrades: this.getOpenTrades().length,
      closedTrades: closedTrades.length,
      totalGrossPnL,
      totalNetPnL,
      totalCosts,
      averageReturn,
      winRate,
      profitFactor,
      bestTrade,
      worstTrade,
      averageHoldingPeriod,
      sharpeRatio,
    };
  }

  /**
   * Clear audit log
   */
  clear(): void {
    this.trades = [];
  }

  /**
   * Generate unique ID
   */
  private generateID(): string {
    return `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const auditLogManager = new AuditLogManager();

/**
 * Log trade entry
 */
export function logTradeEntry(
  symbol: string,
  side: 'BUY' | 'SELL',
  orderType: 'MARKET' | 'LIMIT' | 'STOP',
  quantity: number,
  entryPrice: number,
  signal: 'BUY' | 'SELL' | 'HOLD',
  confidence: number,
  commission: number,
  slippage: number,
  tax: number,
  reason: string
): string {
  return auditLogManager.logEntry(symbol, side, orderType, quantity, entryPrice, signal, confidence, commission, slippage, tax, reason);
}

/**
 * Log trade exit
 */
export function logTradeExit(
  tradeId: string,
  exitPrice: number,
  exitCommission: number,
  exitSlippage: number,
  exitTax: number
): boolean {
  return auditLogManager.logExit(tradeId, exitPrice, exitCommission, exitSlippage, exitTax);
}

/**
 * Get audit log summary
 */
export function getAuditLogSummary(): AuditLogSummary {
  return auditLogManager.getSummary();
}

/**
 * Get trade history
 */
export function getTradeHistory(limit: number = 100): TradeLog[] {
  return auditLogManager.getHistory(limit);
}


