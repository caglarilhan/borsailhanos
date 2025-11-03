/**
 * Sentiment-Momentum Fusion Index (SMF)
 * v6.0 Profit Intelligence Suite
 * 
 * Birleşik skor: FinBERT sentiment + Price momentum = 0-100 SMF skoru
 */

export interface SMFInput {
  symbol: string;
  sentiment: {
    positive: number; // 0-1
    negative: number; // 0-1
    neutral: number; // 0-1
  };
  momentum: {
    rsi: number; // 0-100
    macd: number; // MACD signal difference (normalized)
    volume: number; // Volume ratio vs average (0-2)
    priceChange: number; // Price change % (last 24h)
  };
}

export interface SMFOutput {
  symbol: string;
  smfScore: number; // 0-100
  breakdown: {
    sentimentScore: number; // 0-50
    momentumScore: number; // 0-50
  };
  signal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  confidence: number; // 0-1
  explanation: string;
}

/**
 * Calculate SMF Index (0-100)
 * 
 * Formula:
 * SMF = (Sentiment Score × 0.5) + (Momentum Score × 0.5)
 * 
 * Sentiment Score (0-50):
 * - Positive sentiment weighted: pos × 30 + neu × 10 - neg × 10
 * - Normalized to 0-50 range
 * 
 * Momentum Score (0-50):
 * - RSI normalized: (RSI / 100) × 15
 * - MACD normalized: (MACD + 1) / 2 × 10 (assuming MACD range -1 to 1)
 * - Volume ratio: (volume / 2) × 10
 * - Price change: priceChange × 0.5 (capped at 15)
 * 
 * Total: 0-50 (momentum) + 0-50 (sentiment) = 0-100
 */
export function calculateSMFIndex(input: SMFInput): SMFOutput {
  const { symbol, sentiment, momentum } = input;

  // 1. Calculate Sentiment Score (0-50)
  // Normalize sentiment to sum = 1
  const sentimentSum = sentiment.positive + sentiment.negative + sentiment.neutral || 1;
  const normalizedPos = sentiment.positive / sentimentSum;
  const normalizedNeg = sentiment.negative / sentimentSum;
  const normalizedNeu = sentiment.neutral / sentimentSum;

  // Sentiment contribution: Positive heavily weighted, neutral moderate, negative penalty
  const sentimentRaw = (normalizedPos * 30) + (normalizedNeu * 10) - (normalizedNeg * 10);
  const sentimentScore = Math.max(0, Math.min(50, sentimentRaw + 25)); // Shift to 0-50 range

  // 2. Calculate Momentum Score (0-50)
  // RSI contribution (0-15 points)
  const rsiNormalized = momentum.rsi / 100; // 0-1
  const rsiScore = rsiNormalized * 15; // 0-15

  // MACD contribution (0-10 points)
  // Assume MACD is normalized to -1 to +1 range
  const macdNormalized = (momentum.macd + 1) / 2; // -1 to +1 → 0 to 1
  const macdScore = macdNormalized * 10; // 0-10

  // Volume contribution (0-10 points)
  // Volume ratio: 1.0 = average, >1 = above average
  const volumeNormalized = Math.min(2, Math.max(0, momentum.volume)) / 2; // 0-1
  const volumeScore = volumeNormalized * 10; // 0-10

  // Price change contribution (0-15 points)
  // Price change % capped at ±30%
  const priceChangeCapped = Math.max(-30, Math.min(30, momentum.priceChange));
  const priceChangeNormalized = (priceChangeCapped + 30) / 60; // -30 to +30 → 0 to 1
  const priceChangeScore = priceChangeNormalized * 15; // 0-15

  const momentumScore = rsiScore + macdScore + volumeScore + priceChangeScore;
  const momentumScoreClamped = Math.max(0, Math.min(50, momentumScore));

  // 3. Calculate total SMF Score (0-100)
  const smfScore = sentimentScore + momentumScoreClamped;

  // 4. Determine signal
  let signal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  let confidence: number;
  
  if (smfScore >= 80) {
    signal = 'STRONG_BUY';
    confidence = 0.9 + ((smfScore - 80) / 20) * 0.1; // 0.9-1.0
  } else if (smfScore >= 65) {
    signal = 'BUY';
    confidence = 0.75 + ((smfScore - 65) / 15) * 0.15; // 0.75-0.9
  } else if (smfScore >= 45) {
    signal = 'NEUTRAL';
    confidence = 0.5 + ((smfScore - 45) / 20) * 0.25; // 0.5-0.75
  } else if (smfScore >= 30) {
    signal = 'SELL';
    confidence = 0.5 - ((30 - smfScore) / 15) * 0.25; // 0.25-0.5
  } else {
    signal = 'STRONG_SELL';
    confidence = Math.max(0.1, 0.25 - ((30 - smfScore) / 30) * 0.15); // 0.1-0.25
  }

  // 5. Generate explanation
  const sentimentLabel = normalizedPos > 0.6 ? 'güçlü pozitif' : normalizedPos > 0.4 ? 'pozitif' : normalizedNeg > 0.4 ? 'negatif' : 'nötr';
  const momentumLabel = momentumScoreClamped > 35 ? 'yüksek momentum' : momentumScoreClamped > 25 ? 'orta momentum' : 'düşük momentum';
  
  const explanation = `${symbol}: SMF ${smfScore.toFixed(1)}/100 → ${signal.replace('_', ' ')} (${sentimentLabel} duygu + ${momentumLabel}, %${(confidence * 100).toFixed(0)} güven)`;

  return {
    symbol,
    smfScore: Math.round(smfScore * 10) / 10, // Round to 1 decimal
    breakdown: {
      sentimentScore: Math.round(sentimentScore * 10) / 10,
      momentumScore: Math.round(momentumScoreClamped * 10) / 10,
    },
    signal,
    confidence: Math.round(confidence * 100) / 100,
    explanation,
  };
}

/**
 * Batch calculate SMF for multiple symbols
 */
export function calculateSMFBatch(inputs: SMFInput[]): SMFOutput[] {
  return inputs.map(calculateSMFIndex);
}

/**
 * Get SMF color for UI
 */
export function getSMFColor(smfScore: number): string {
  if (smfScore >= 80) return '#10b981'; // emerald-500 - Strong Buy
  if (smfScore >= 65) return '#34d399'; // emerald-400 - Buy
  if (smfScore >= 45) return '#fbbf24'; // amber-400 - Neutral
  if (smfScore >= 30) return '#f87171'; // red-400 - Sell
  return '#ef4444'; // red-500 - Strong Sell
}

/**
 * Get SMF label for UI
 */
export function getSMFLabel(smfScore: number): string {
  if (smfScore >= 80) return 'Güçlü Alım';
  if (smfScore >= 65) return 'Alım';
  if (smfScore >= 45) return 'Nötr';
  if (smfScore >= 30) return 'Satış';
  return 'Güçlü Satış';
}



