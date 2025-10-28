/**
 * Backtest metadata and assumptions
 * Ensures consistency between backtest results and portfolio simulator
 */

export const backtestAssumptions = {
  // Time period
  period: 30, // days
  
  // Transaction costs
  slippage: 0.001, // 0.1% slippage
  commission: 0.0015, // 0.15% commission per trade
  
  // Rebalancing frequency
  rebalanceFreq: 'daily', // 'daily' | 'weekly' | 'monthly'
  
  // Starting capital (for simulation only)
  startingCapital: 100000, // TRY
  
  // Risk management
  maxPositionSize: 0.15, // Max 15% of portfolio per stock
  stopLoss: 0.05, // 5% stop loss
  takeProfit: 0.20, // 20% take profit
  
  // Market assumptions
  marketHours: '09:30-16:00', // BIST trading hours
  settlementDays: 2, // T+2 settlement
  
  // Data quality
  minDataPoints: 20, // Minimum data points for valid signal
  outlierThreshold: 0.15, // Remove outliers >15% from mean
};

export const backtestLabels = {
  period: 'Test süresi',
  slippage: 'Kayma maliyeti',
  commission: 'İşlem maliyeti',
  rebalanceFreq: 'Rebalans sıklığı',
  startingCapital: 'Başlangıç sermayesi',
  maxPositionSize: 'Maksimum pozisyon büyüklüğü',
  stopLoss: 'Stop loss seviyesi',
  takeProfit: 'Kar alma seviyesi',
  marketHours: 'İşlem saatleri',
  settlementDays: 'Settlement günü',
  minDataPoints: 'Minimum veri noktası',
  outlierThreshold: 'Aykırı değer eşiği',
};
