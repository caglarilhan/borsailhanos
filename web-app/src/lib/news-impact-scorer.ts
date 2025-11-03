/**
 * News Impact Scorer
 * v6.0 Profit Intelligence Suite
 * 
 * FinBERT sentiment → gerçek fiyat etkisi çevirici
 * Sadece işe yarayan haberlere işlem açılır
 */

export interface NewsArticle {
  title: string;
  content?: string;
  source: string;
  timestamp: string;
  sentiment?: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export interface NewsImpactInput {
  symbol: string;
  article: NewsArticle;
  currentPrice: number;
  recentVolume: number; // Son 1 saat hacim
  averageVolume: number; // Ortalama hacim (son 7 gün)
  historicalImpact?: Array<{
    sentiment: number; // Positive sentiment score
    priceChange: number; // Actual price change % after news
    volumeSpike: number; // Volume ratio
    timestamp: string;
  }>;
}

export interface NewsImpactOutput {
  symbol: string;
  impactScore: number; // 0-100, gerçek fiyat etkisi skoru
  expectedPriceChange: number; // Tahmini fiyat değişimi (%)
  volumeReaction: 'high' | 'medium' | 'low' | 'none'; // Hacim tepkisi
  recommendedAction: 'BUY' | 'SELL' | 'WAIT' | 'IGNORE';
  confidence: number; // 0-1
  explanation: string;
  timeframe: 'immediate' | '1h' | '4h' | '24h'; // Etki zaman aralığı
}

/**
 * Score news impact based on:
 * 1. FinBERT sentiment strength
 * 2. Volume reaction (if volume spike = high impact, if no volume = low impact)
 * 3. Historical correlation (if available)
 * 
 * Formula:
 * Impact Score = (Sentiment Strength × 0.4) + (Volume Reaction × 0.4) + (Historical Correlation × 0.2)
 */
export function scoreNewsImpact(input: NewsImpactInput): NewsImpactOutput {
  const { symbol, article, currentPrice, recentVolume, averageVolume, historicalImpact } = input;

  // 1. Calculate sentiment strength (0-40 points)
  const sentiment = article.sentiment || { positive: 0.5, negative: 0.3, neutral: 0.2 };
  const sentimentSum = sentiment.positive + sentiment.negative + sentiment.neutral || 1;
  const normalizedPos = sentiment.positive / sentimentSum;
  const normalizedNeg = sentiment.negative / sentimentSum;
  
  // Sentiment strength: how clear is the sentiment?
  const sentimentClarity = Math.abs(normalizedPos - normalizedNeg); // 0-1, higher = clearer
  const sentimentBias = normalizedPos - normalizedNeg; // -1 to +1, positive = bullish
  
  // Sentiment strength score (0-40)
  const sentimentStrength = sentimentClarity * 40 * (sentimentBias >= 0 ? 1 : -1); // -40 to +40
  const sentimentScore = Math.abs(sentimentStrength); // 0-40

  // 2. Calculate volume reaction (0-40 points)
  const volumeRatio = averageVolume > 0 ? recentVolume / averageVolume : 1;
  let volumeReaction: 'high' | 'medium' | 'low' | 'none';
  let volumeScore = 0;
  
  if (volumeRatio > 2.0) {
    volumeReaction = 'high';
    volumeScore = 40;
  } else if (volumeRatio > 1.5) {
    volumeReaction = 'medium';
    volumeScore = 30;
  } else if (volumeRatio > 1.2) {
    volumeReaction = 'low';
    volumeScore = 15;
  } else {
    volumeReaction = 'none';
    volumeScore = 5; // Low score if no volume reaction
  }

  // 3. Historical correlation (0-20 points)
  let historicalScore = 10; // Default moderate
  if (historicalImpact && historicalImpact.length > 0) {
    // Calculate average historical impact correlation
    const correlations = historicalImpact.map(h => {
      const sentimentMatch = Math.abs(h.sentiment - normalizedPos) < 0.2 ? 1 : 0;
      const volumeMatch = Math.abs(h.volumeSpike - volumeRatio) < 0.3 ? 1 : 0;
      return (sentimentMatch + volumeMatch) / 2;
    });
    const avgCorrelation = correlations.reduce((sum, c) => sum + c, 0) / correlations.length;
    historicalScore = avgCorrelation * 20;
  }

  // 4. Calculate total impact score (0-100)
  let impactScore = sentimentScore + volumeScore + historicalScore;
  
  // Adjust for sentiment direction
  // If sentiment is positive but no volume reaction = lower impact (false positive)
  // If sentiment is negative but volume spike = higher impact (real concern)
  if (sentimentBias > 0 && volumeReaction === 'none') {
    impactScore *= 0.5; // Reduce impact if positive sentiment but no volume
  } else if (sentimentBias < 0 && volumeReaction === 'high') {
    impactScore *= 1.2; // Increase impact if negative sentiment with volume spike
  }
  
  impactScore = Math.min(100, Math.max(0, impactScore));

  // 5. Calculate expected price change
  // Based on sentiment strength and historical patterns
  const basePriceChange = sentimentBias * 2; // Base: ±2% per sentiment unit
  const volumeMultiplier = volumeRatio > 1.5 ? 1.5 : volumeRatio > 1.2 ? 1.2 : 1.0;
  const expectedPriceChange = basePriceChange * volumeMultiplier * (impactScore / 100);
  
  // Cap at ±5% for realistic expectations
  const cappedPriceChange = Math.max(-5, Math.min(5, expectedPriceChange));

  // 6. Determine recommended action
  let recommendedAction: 'BUY' | 'SELL' | 'WAIT' | 'IGNORE';
  let confidence: number;
  
  if (impactScore < 20) {
    recommendedAction = 'IGNORE';
    confidence = 0.3;
  } else if (sentimentBias > 0.3 && volumeReaction !== 'none' && impactScore > 60) {
    recommendedAction = 'BUY';
    confidence = 0.7 + (impactScore - 60) / 40 * 0.3; // 0.7-1.0
  } else if (sentimentBias < -0.3 && volumeReaction !== 'none' && impactScore > 60) {
    recommendedAction = 'SELL';
    confidence = 0.7 + (impactScore - 60) / 40 * 0.3; // 0.7-1.0
  } else {
    recommendedAction = 'WAIT';
    confidence = 0.4 + (impactScore / 100) * 0.3; // 0.4-0.7
  }

  // 7. Determine impact timeframe
  let timeframe: 'immediate' | '1h' | '4h' | '24h';
  if (volumeReaction === 'high' && sentimentClarity > 0.6) {
    timeframe = 'immediate'; // Strong volume + clear sentiment = immediate impact
  } else if (volumeReaction === 'medium' || sentimentClarity > 0.4) {
    timeframe = '1h'; // Moderate reaction = 1 hour
  } else if (volumeReaction === 'low') {
    timeframe = '4h'; // Low volume = delayed impact
  } else {
    timeframe = '24h'; // No clear reaction = long-term
  }

  // 8. Generate explanation
  const sentimentText = sentimentBias > 0.3 ? 'güçlü pozitif' : sentimentBias > 0 ? 'pozitif' : sentimentBias < -0.3 ? 'güçlü negatif' : 'negatif';
  const impactText = impactScore > 70 ? 'yüksek' : impactScore > 50 ? 'orta' : impactScore > 30 ? 'düşük' : 'çok düşük';
  const explanation = `${symbol}: ${impactScore.toFixed(1)}/100 etki skoru (${sentimentText} duygu, ${volumeReaction} hacim tepkisi). Tahmini fiyat değişimi: ${cappedPriceChange >= 0 ? '+' : ''}${cappedPriceChange.toFixed(2)}% (${timeframe} zaman aralığı). Öneri: ${recommendedAction}.`;

  return {
    symbol,
    impactScore: Math.round(impactScore * 10) / 10,
    expectedPriceChange: Math.round(cappedPriceChange * 100) / 100,
    volumeReaction,
    recommendedAction,
    confidence: Math.round(confidence * 100) / 100,
    explanation,
    timeframe,
  };
}

/**
 * Get impact color for UI
 */
export function getImpactColor(impactScore: number): string {
  if (impactScore >= 70) return '#10b981'; // emerald-500 - High impact
  if (impactScore >= 50) return '#34d399'; // emerald-400 - Medium-high
  if (impactScore >= 30) return '#fbbf24'; // amber-400 - Medium
  return '#94a3b8'; // slate-400 - Low impact
}

/**
 * Get impact label
 */
export function getImpactLabel(impactScore: number): string {
  if (impactScore >= 70) return 'Yüksek Etki';
  if (impactScore >= 50) return 'Orta-Yüksek Etki';
  if (impactScore >= 30) return 'Orta Etki';
  return 'Düşük Etki';
}



