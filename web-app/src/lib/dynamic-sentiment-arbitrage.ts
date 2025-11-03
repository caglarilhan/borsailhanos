/**
 * Dynamic Sentiment Arbitrage
 * v6.0 Profit Intelligence Suite
 * 
 * Aynı sektör hisseleri arasındaki duygu farkını fırsata çevirir
 * Örnek: "SISE pozitif %85, TRKCM %40 → spread trade"
 * Fayda: Risksiz alpha üretimi (mean reversion)
 */

export interface SentimentArbitrageInput {
  sector: string;
  symbols: Array<{
    symbol: string;
    sentiment: {
      positive: number;
      negative: number;
      neutral: number;
    };
    price: number;
    volatility: number;
  }>;
}

export interface ArbitrageOpportunity {
  symbolLong: string; // Buy this (higher sentiment)
  symbolShort: string; // Sell this (lower sentiment)
  sentimentSpread: number; // Sentiment difference (0-100)
  expectedMeanReversion: number; // Expected convergence %
  confidence: number; // 0-1
  recommendedAllocation: number; // % of portfolio for this trade
  explanation: string;
}

export interface SentimentArbitrageOutput {
  sector: string;
  opportunities: ArbitrageOpportunity[];
  bestOpportunity: ArbitrageOpportunity | null;
}

/**
 * Find sentiment arbitrage opportunities within a sector
 * 
 * Strategy:
 * 1. Calculate normalized sentiment scores for each symbol
 * 2. Find pairs with large sentiment spread (> 30%)
 * 3. Recommend long on high sentiment, short on low sentiment
 * 4. Expect mean reversion (sentiment convergence)
 */
export function findSentimentArbitrage(input: SentimentArbitrageInput): SentimentArbitrageOutput {
  const { sector, symbols } = input;

  if (symbols.length < 2) {
    return {
      sector,
      opportunities: [],
      bestOpportunity: null,
    };
  }

  // 1. Calculate normalized sentiment scores (0-100)
  const sentimentScores = symbols.map(s => {
    const sum = s.sentiment.positive + s.sentiment.negative + s.sentiment.neutral || 1;
    const normalizedPos = s.sentiment.positive / sum;
    const normalizedNeg = s.sentiment.negative / sum;
    // Sentiment score: positive weighted, negative penalty
    const score = (normalizedPos * 70) - (normalizedNeg * 30) + 50; // Shift to 0-100 range
    return {
      symbol: s.symbol,
      sentimentScore: Math.max(0, Math.min(100, score)),
      price: s.price,
      volatility: s.volatility,
    };
  });

  // 2. Find pairs with large sentiment spread
  const opportunities: ArbitrageOpportunity[] = [];

  for (let i = 0; i < sentimentScores.length; i++) {
    for (let j = i + 1; j < sentimentScores.length; j++) {
      const s1 = sentimentScores[i];
      const s2 = sentimentScores[j];
      
      const sentimentSpread = Math.abs(s1.sentimentScore - s2.sentimentScore);
      
      // Only consider pairs with spread > 30%
      if (sentimentSpread > 30) {
        // Long the higher sentiment, short the lower sentiment
        const isLongHigher = s1.sentimentScore > s2.sentimentScore;
        const symbolLong = isLongHigher ? s1.symbol : s2.symbol;
        const symbolShort = isLongHigher ? s2.symbol : s1.symbol;
        
        // Expected mean reversion: half of the spread (conservative)
        const expectedMeanReversion = sentimentSpread * 0.5;
        
        // Confidence based on spread magnitude and volatility match
        const avgVolatility = (s1.volatility + s2.volatility) / 2;
        const volDifference = Math.abs(s1.volatility - s2.volatility);
        const volatilityMatch = 1 - Math.min(1, volDifference / avgVolatility);
        
        const confidence = Math.min(1, 0.5 + (sentimentSpread / 100) * 0.3 + volatilityMatch * 0.2);
        
        // Recommended allocation: 2-5% of portfolio based on confidence
        const recommendedAllocation = confidence > 0.7 ? 5 : confidence > 0.5 ? 3 : 2;
        
        opportunities.push({
          symbolLong,
          symbolShort,
          sentimentSpread: Math.round(sentimentSpread * 10) / 10,
          expectedMeanReversion: Math.round(expectedMeanReversion * 10) / 10,
          confidence: Math.round(confidence * 100) / 100,
          recommendedAllocation,
          explanation: `${symbolLong} (sentiment %${isLongHigher ? s1.sentimentScore.toFixed(1) : s2.sentimentScore.toFixed(1)}) ↔ ${symbolShort} (sentiment %${isLongHigher ? s2.sentimentScore.toFixed(1) : s1.sentimentScore.toFixed(1)}). Spread: %${sentimentSpread.toFixed(1)}. Beklenen yakınsama: %${expectedMeanReversion.toFixed(1)}.`,
        });
      }
    }
  }

  // Sort by expected mean reversion (descending)
  opportunities.sort((a, b) => b.expectedMeanReversion - a.expectedMeanReversion);

  // Find best opportunity (highest confidence + good spread)
  const bestOpportunity = opportunities.length > 0
    ? opportunities.reduce((best, opp) => 
        opp.confidence * opp.sentimentSpread > best.confidence * best.sentimentSpread ? opp : best
      )
    : null;

  return {
    sector,
    opportunities,
    bestOpportunity,
  };
}

/**
 * Get arbitrage color for UI
 */
export function getArbitrageColor(confidence: number): string {
  if (confidence > 0.7) return '#10b981'; // emerald-500 - High confidence
  if (confidence > 0.5) return '#34d399'; // emerald-400 - Medium confidence
  return '#fbbf24'; // amber-400 - Low confidence
}



