/**
 * Adaptive Volatility Hedger
 * v6.0 Profit Intelligence Suite
 * 
 * AI, portföyün delta-riskini gerçek zamanlı hedge eder
 * Örnek: Bankacılık ağırlığı yüksek → VIOP long aç
 */

export interface PortfolioHedgeInput {
  portfolio: Array<{
    symbol: string;
    weight: number; // Portfolio weight (0-1)
    beta: number; // Market beta
    volatility: number; // 0-1 scale
    sector: string;
  }>;
  marketVolatility: number; // BIST100 volatility
  totalEquity: number; // Total portfolio value
  riskTolerance: 'low' | 'medium' | 'high';
}

export interface HedgeRecommendation {
  type: 'VIOP_LONG' | 'VIOP_SHORT' | 'GOLD' | 'USDTRY' | 'INVERSE_ETF' | 'NONE';
  amount: number; // TRY amount to hedge
  percentage: number; // % of portfolio
  instrument: string; // Specific instrument (e.g., "VIOP BIST30", "Altın/TL")
  explanation: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface PortfolioHedgeOutput {
  portfolioBeta: number; // Aggregate portfolio beta
  portfolioDelta: number; // Delta risk (sensitivity to market moves)
  hedgeNeeded: boolean;
  recommendations: HedgeRecommendation[];
  totalHedgeAmount: number;
  hedgeCoverage: number; // % of portfolio hedged
}

/**
 * Calculate adaptive hedge recommendations
 * 
 * Strategy:
 * 1. Calculate portfolio beta (weighted average)
 * 2. Calculate delta risk (beta × market volatility)
 * 3. If delta > threshold → recommend hedge
 * 4. Hedge type based on sector concentration and volatility
 */
export function calculateAdaptiveHedge(input: PortfolioHedgeInput): PortfolioHedgeOutput {
  const { portfolio, marketVolatility, totalEquity, riskTolerance } = input;

  // 1. Calculate portfolio beta (weighted average)
  const portfolioBeta = portfolio.reduce((sum, p) => sum + p.weight * p.beta, 0);

  // 2. Calculate portfolio delta risk
  // Delta = beta × market_volatility × portfolio_weight
  const portfolioDelta = portfolioBeta * marketVolatility;

  // 3. Calculate sector concentration
  const sectorWeights: Record<string, number> = {};
  portfolio.forEach(p => {
    sectorWeights[p.sector] = (sectorWeights[p.sector] || 0) + p.weight;
  });

  const maxSectorWeight = Math.max(...Object.values(sectorWeights));
  const maxSector = Object.entries(sectorWeights).find(([_, w]) => w === maxSectorWeight)?.[0] || '';

  // 4. Determine if hedge is needed
  const hedgeThreshold = {
    low: 0.15,   // Hedge if delta > 15%
    medium: 0.25, // Hedge if delta > 25%
    high: 0.35,   // Hedge if delta > 35%
  }[riskTolerance];

  const hedgeNeeded = portfolioDelta > hedgeThreshold;

  // 5. Generate hedge recommendations
  const recommendations: HedgeRecommendation[] = [];

  if (hedgeNeeded) {
    // Primary hedge: VIOP inverse position
    const hedgeAmount = totalEquity * Math.min(0.5, portfolioDelta - hedgeThreshold); // Up to 50% of portfolio
    const hedgePercentage = (hedgeAmount / totalEquity) * 100;

    if (hedgePercentage > 10) {
      recommendations.push({
        type: portfolioBeta > 1 ? 'VIOP_SHORT' : 'VIOP_LONG', // If beta > 1, market drops hurt more → short hedge
        amount: hedgeAmount * 0.6, // 60% of hedge via VIOP
        percentage: hedgePercentage * 0.6,
        instrument: 'VIOP BIST30',
        explanation: `Portföy beta ${portfolioBeta.toFixed(2)} nedeniyle VIOP pozisyonu öneriliyor (delta riski %${(portfolioDelta * 100).toFixed(1)}).`,
        priority: portfolioDelta > 0.3 ? 'HIGH' : 'MEDIUM',
      });

      // Secondary hedge: Gold if high volatility
      if (marketVolatility > 0.3) {
        recommendations.push({
          type: 'GOLD',
          amount: hedgeAmount * 0.3, // 30% via gold
          percentage: hedgePercentage * 0.3,
          instrument: 'Altın/TL',
          explanation: 'Yüksek volatilite nedeniyle altın hedge öneriliyor.',
          priority: 'MEDIUM',
        });
      }

      // Tertiary hedge: USDTRY if foreign exposure
      if (maxSectorWeight > 0.4 && (maxSector === 'Bankacılık' || maxSector === 'Teknoloji')) {
        recommendations.push({
          type: 'USDTRY',
          amount: hedgeAmount * 0.1, // 10% via USD
          percentage: hedgePercentage * 0.1,
          instrument: 'USD/TRY',
          explanation: `${maxSector} sektör ağırlığı (%${(maxSectorWeight * 100).toFixed(0)}) nedeniyle USD hedge öneriliyor.`,
          priority: 'LOW',
        });
      }
    }
  }

  // If no hedge needed but high sector concentration
  if (!hedgeNeeded && maxSectorWeight > 0.5) {
    recommendations.push({
      type: 'INVERSE_ETF',
      amount: totalEquity * 0.1, // 10% precautionary
      percentage: 10,
      instrument: `${maxSector} sektör inverse ETF`,
      explanation: `${maxSector} sektör konsantrasyonu (%${(maxSectorWeight * 100).toFixed(0)}) yüksek. Prekasyonel hedge öneriliyor.`,
      priority: 'LOW',
    });
  }

  // If no recommendations, add NONE
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'NONE',
      amount: 0,
      percentage: 0,
      instrument: 'N/A',
      explanation: 'Hedge gerekmiyor. Portföy delta riski düşük.',
      priority: 'LOW',
    });
  }

  const totalHedgeAmount = recommendations.reduce((sum, r) => sum + r.amount, 0);
  const hedgeCoverage = (totalHedgeAmount / totalEquity) * 100;

  return {
    portfolioBeta: Math.round(portfolioBeta * 100) / 100,
    portfolioDelta: Math.round(portfolioDelta * 100) / 100,
    hedgeNeeded,
    recommendations,
    totalHedgeAmount: Math.round(totalHedgeAmount * 100) / 100,
    hedgeCoverage: Math.round(hedgeCoverage * 10) / 10,
  };
}

/**
 * Get hedge type color for UI
 */
export function getHedgeColor(type: HedgeRecommendation['type']): string {
  switch (type) {
    case 'VIOP_LONG':
    case 'VIOP_SHORT':
      return '#10b981'; // emerald-500
    case 'GOLD':
      return '#fbbf24'; // amber-400
    case 'USDTRY':
      return '#3b82f6'; // blue-500
    case 'INVERSE_ETF':
      return '#8b5cf6'; // purple-500
    default:
      return '#94a3b8'; // slate-400
  }
}



