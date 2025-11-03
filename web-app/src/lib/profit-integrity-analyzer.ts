/**
 * Profit Integrity Analyzer
 * v6.0 Profit Intelligence Suite
 * 
 * AI geçmiş 90 günlük işlem sonuçlarını analiz eder
 * Hangi strateji, hangi saat, hangi hisse en fazla kâr ettirdi → otomatik rapor
 */

export interface TradeAnalysis {
  symbol: string;
  entryTime: string;
  exitTime: string;
  profit: number;
  strategy: string;
  timeframe: string;
  confidence: number;
}

export interface ProfitAnalysis {
  period: string; // "90 days"
  totalTrades: number;
  profitableTrades: number;
  totalProfit: number;
  winRate: number;
  bestStrategy: {
    strategy: string;
    profit: number;
    winRate: number;
  };
  bestSymbol: {
    symbol: string;
    profit: number;
    tradeCount: number;
  };
  bestHour: {
    hour: number;
    profit: number;
    tradeCount: number;
  };
  recommendations: string[];
}

/**
 * Analyze 90-day trading performance
 */
export function analyzeProfitIntegrity(trades: TradeAnalysis[]): ProfitAnalysis {
  const period = '90 gün';
  const totalTrades = trades.length;
  const profitableTrades = trades.filter(t => t.profit > 0).length;
  const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
  const winRate = totalTrades > 0 ? profitableTrades / totalTrades : 0;

  // Best strategy
  const strategyProfits: Record<string, { profit: number; wins: number; count: number }> = {};
  trades.forEach(t => {
    if (!strategyProfits[t.strategy]) {
      strategyProfits[t.strategy] = { profit: 0, wins: 0, count: 0 };
    }
    strategyProfits[t.strategy].profit += t.profit;
    strategyProfits[t.strategy].count += 1;
    if (t.profit > 0) strategyProfits[t.strategy].wins += 1;
  });

  const bestStrategy = Object.entries(strategyProfits)
    .map(([strategy, data]) => ({
      strategy,
      profit: data.profit,
      winRate: data.count > 0 ? data.wins / data.count : 0,
    }))
    .sort((a, b) => b.profit - a.profit)[0] || { strategy: 'N/A', profit: 0, winRate: 0 };

  // Best symbol
  const symbolProfits: Record<string, { profit: number; count: number }> = {};
  trades.forEach(t => {
    if (!symbolProfits[t.symbol]) {
      symbolProfits[t.symbol] = { profit: 0, count: 0 };
    }
    symbolProfits[t.symbol].profit += t.profit;
    symbolProfits[t.symbol].count += 1;
  });

  const bestSymbol = Object.entries(symbolProfits)
    .map(([symbol, data]) => ({
      symbol,
      profit: data.profit,
      tradeCount: data.count,
    }))
    .sort((a, b) => b.profit - a.profit)[0] || { symbol: 'N/A', profit: 0, tradeCount: 0 };

  // Best hour
  const hourProfits: Record<number, { profit: number; count: number }> = {};
  trades.forEach(t => {
    const hour = new Date(t.entryTime).getHours();
    if (!hourProfits[hour]) {
      hourProfits[hour] = { profit: 0, count: 0 };
    }
    hourProfits[hour].profit += t.profit;
    hourProfits[hour].count += 1;
  });

  const bestHour = Object.entries(hourProfits)
    .map(([hour, data]) => ({
      hour: parseInt(hour),
      profit: data.profit,
      tradeCount: data.count,
    }))
    .sort((a, b) => b.profit - a.profit)[0] || { hour: 0, profit: 0, tradeCount: 0 };

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (bestStrategy.profit > totalProfit * 0.4) {
    recommendations.push(`${bestStrategy.strategy} stratejisi en kârlı (%${(bestStrategy.profit / totalProfit * 100).toFixed(1)}). Bu stratejiye odaklan.`);
  }
  
  if (bestSymbol.profit > totalProfit * 0.3) {
    recommendations.push(`${bestSymbol.symbol} en kârlı hisse (+${formatCurrencyTRY(bestSymbol.profit)}). Bu hissede deneyimin güçlü.`);
  }
  
  if (bestHour.profit > totalProfit * 0.2) {
    recommendations.push(`Saat ${bestHour.hour}:00'da yapılan işlemler en kârlı. Bu saatleri tercih et.`);
  }

  if (winRate < 0.6) {
    recommendations.push(`Başarı oranı düşük (%${(winRate * 100).toFixed(1)}). Güven eşiğini yükselt veya strateji değiştir.`);
  }

  return {
    period,
    totalTrades,
    profitableTrades,
    totalProfit: Math.round(totalProfit * 100) / 100,
    winRate: Math.round(winRate * 100) / 100,
    bestStrategy,
    bestSymbol,
    bestHour,
    recommendations,
  };
}

function formatCurrencyTRY(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}



