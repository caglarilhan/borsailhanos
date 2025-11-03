/**
 * P5.2: Slippage & Transaction Cost (Tcost)
 * Slippage ve Tcost ekle (12-25bps BIST)
 */

export interface TransactionCost {
  symbol: string;
  orderType: 'MARKET' | 'LIMIT' | 'STOP';
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  marketPrice: number; // Current market price
  slippageBps: number; // Slippage in basis points (bps)
  commissionBps: number; // Commission in basis points (bps)
  taxBps: number; // Tax in basis points (bps)
  totalCostBps: number; // Total cost in basis points
  totalCostTRY: number; // Total cost in TRY
  executionPrice: number; // Final execution price (with slippage)
  netProceeds: number; // Net proceeds after costs
}

export interface TransactionCostConfig {
  market: 'BIST' | 'NASDAQ' | 'NYSE';
  slippageBps: {
    market: number; // Market order slippage (default: 15 bps for BIST)
    limit: number; // Limit order slippage (default: 5 bps)
    stop: number; // Stop order slippage (default: 25 bps)
  };
  commissionBps: number; // Broker commission (default: 5 bps for BIST)
  taxBps: number; // Transaction tax (default: 5 bps for BIST sell)
  stampTaxBps: number; // Stamp tax (default: 2 bps for BIST)
}

/**
 * Transaction Cost Calculator
 */
export class TransactionCostCalculator {
  private config: TransactionCostConfig = {
    market: 'BIST',
    slippageBps: {
      market: 15, // 15 bps = 0.15% for market orders
      limit: 5, // 5 bps = 0.05% for limit orders
      stop: 25, // 25 bps = 0.25% for stop orders
    },
    commissionBps: 5, // 5 bps = 0.05% broker commission
    taxBps: 5, // 5 bps = 0.05% transaction tax (on sell)
    stampTaxBps: 2, // 2 bps = 0.02% stamp tax
  };

  /**
   * Update configuration
   */
  updateConfig(config: Partial<TransactionCostConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get configuration
   */
  getConfig(): TransactionCostConfig {
    return { ...this.config };
  }

  /**
   * Calculate transaction cost
   */
  calculateCost(
    symbol: string,
    orderType: 'MARKET' | 'LIMIT' | 'STOP',
    side: 'BUY' | 'SELL',
    quantity: number,
    marketPrice: number
  ): TransactionCost {
    // Get slippage based on order type
    const slippageBps = this.config.slippageBps[orderType.toLowerCase() as 'market' | 'limit' | 'stop'];

    // Calculate slippage cost
    const slippagePercent = slippageBps / 10000; // Convert bps to decimal
    const slippageDirection = side === 'BUY' ? 1 : -1; // Buy: price goes up, Sell: price goes down
    const executionPrice = marketPrice * (1 + slippageDirection * slippagePercent);

    // Calculate commission (both buy and sell)
    const commissionBps = this.config.commissionBps;
    const commissionPercent = commissionBps / 10000;
    const commissionCost = marketPrice * quantity * commissionPercent;

    // Calculate tax (only on sell for BIST)
    const taxBps = side === 'SELL' ? this.config.taxBps : 0;
    const taxPercent = taxBps / 10000;
    const taxCost = marketPrice * quantity * taxPercent;

    // Calculate stamp tax (both buy and sell)
    const stampTaxBps = this.config.stampTaxBps;
    const stampTaxPercent = stampTaxBps / 10000;
    const stampTaxCost = marketPrice * quantity * stampTaxPercent;

    // Total cost in basis points
    const totalCostBps = slippageBps + commissionBps + taxBps + stampTaxBps;

    // Total cost in TRY
    const totalCostTRY = commissionCost + taxCost + stampTaxCost;

    // Gross proceeds
    const grossProceeds = executionPrice * quantity;

    // Net proceeds (after all costs)
    const netProceeds = side === 'BUY'
      ? grossProceeds + totalCostTRY // Buy: add costs
      : grossProceeds - totalCostTRY; // Sell: subtract costs

    return {
      symbol,
      orderType,
      side,
      quantity,
      price: marketPrice, // Original price
      marketPrice,
      slippageBps,
      commissionBps,
      taxBps,
      totalCostBps,
      totalCostTRY,
      executionPrice,
      netProceeds,
    };
  }

  /**
   * Calculate total cost for multiple transactions
   */
  calculateBatchCost(
    transactions: Array<{
      symbol: string;
      orderType: 'MARKET' | 'LIMIT' | 'STOP';
      side: 'BUY' | 'SELL';
      quantity: number;
      marketPrice: number;
    }>
  ): {
    totalCostBps: number;
    totalCostTRY: number;
    transactions: TransactionCost[];
  } {
    const transactionCosts = transactions.map((t) =>
      this.calculateCost(t.symbol, t.orderType, t.side, t.quantity, t.marketPrice)
    );

    const totalCostBps = transactionCosts.reduce((sum, t) => sum + t.totalCostBps, 0);
    const totalCostTRY = transactionCosts.reduce((sum, t) => sum + t.totalCostTRY, 0);

    return {
      totalCostBps: totalCostBps / transactions.length, // Average
      totalCostTRY,
      transactions: transactionCosts,
    };
  }

  /**
   * Adjust expected return for transaction costs
   */
  adjustReturnForCosts(
    expectedReturn: number, // Expected return as percentage
    orderType: 'MARKET' | 'LIMIT' | 'STOP',
    side: 'BUY' | 'SELL'
  ): number {
    const slippageBps = this.config.slippageBps[orderType.toLowerCase() as 'market' | 'limit' | 'stop'];
    const commissionBps = this.config.commissionBps;
    const taxBps = side === 'SELL' ? this.config.taxBps : 0;
    const stampTaxBps = this.config.stampTaxBps;

    const totalCostBps = slippageBps + commissionBps + taxBps + stampTaxBps;
    const totalCostPercent = totalCostBps / 100; // Convert bps to percentage

    // Adjust return (subtract costs)
    const adjustedReturn = expectedReturn - totalCostPercent;

    return adjustedReturn;
  }
}

// Singleton instance
export const transactionCostCalculator = new TransactionCostCalculator();

/**
 * Calculate transaction cost
 */
export function calculateTransactionCost(
  symbol: string,
  orderType: 'MARKET' | 'LIMIT' | 'STOP',
  side: 'BUY' | 'SELL',
  quantity: number,
  marketPrice: number
): TransactionCost {
  return transactionCostCalculator.calculateCost(symbol, orderType, side, quantity, marketPrice);
}

/**
 * Adjust return for transaction costs
 */
export function adjustReturnForCosts(
  expectedReturn: number,
  orderType: 'MARKET' | 'LIMIT' | 'STOP',
  side: 'BUY' | 'SELL'
): number {
  return transactionCostCalculator.adjustReturnForCosts(expectedReturn, orderType, side);
}


