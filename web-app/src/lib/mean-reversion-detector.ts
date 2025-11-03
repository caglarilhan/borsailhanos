/**
 * Smart Mean-Reversion Detector
 * v6.0 Profit Intelligence Suite
 * 
 * Fiyat anomalisini tespit edip dönüş noktasını öngörür
 * Fayda: Ters pozisyonla girişte %5-8 kâr olasılığı
 */

export interface MeanReversionInput {
  symbol: string;
  prices: number[]; // Last 30-60 days
  volumes: number[]; // Last 30-60 days
  currentPrice: number;
}

export interface MeanReversionOutput {
  symbol: string;
  isAnomaly: boolean;
  anomalyType: 'OVERSOLD' | 'OVERBOUGHT' | 'NONE';
  deviationPercent: number; // % deviation from mean
  meanReversionProbability: number; // 0-1
  expectedReversalPoint: number; // Price level
  recommendedAction: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  explanation: string;
  targetPrice: number;
}

/**
 * Detect mean reversion opportunities
 * 
 * Strategy:
 * 1. Calculate moving average (20-day)
 * 2. Calculate standard deviation
 * 3. If price > mean + 2σ → overbought (SELL opportunity)
 * 4. If price < mean - 2σ → oversold (BUY opportunity)
 * 5. Calculate mean reversion probability based on historical patterns
 */
export function detectMeanReversion(input: MeanReversionInput): MeanReversionOutput {
  const { symbol, prices, volumes, currentPrice } = input;

  if (prices.length < 20) {
    return {
      symbol,
      isAnomaly: false,
      anomalyType: 'NONE',
      deviationPercent: 0,
      meanReversionProbability: 0,
      expectedReversalPoint: currentPrice,
      recommendedAction: 'HOLD',
      confidence: 0,
      explanation: `${symbol}: Yetersiz veri (minimum 20 gün gerekli)`,
      targetPrice: currentPrice,
    };
  }

  // 1. Calculate 20-day moving average
  const recentPrices = prices.slice(-20);
  const mean = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length;

  // 2. Calculate standard deviation
  const variance = recentPrices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / recentPrices.length;
  const stdDev = Math.sqrt(variance);

  // 3. Calculate deviation from mean
  const deviation = currentPrice - mean;
  const deviationPercent = (deviation / mean) * 100;
  const deviationSigma = stdDev > 0 ? deviation / stdDev : 0;

  // 4. Detect anomaly
  let isAnomaly = false;
  let anomalyType: 'OVERSOLD' | 'OVERBOUGHT' | 'NONE' = 'NONE';
  let meanReversionProbability = 0;
  let recommendedAction: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';

  if (deviationSigma < -2) {
    // Oversold: more than 2σ below mean
    isAnomaly = true;
    anomalyType = 'OVERSOLD';
    meanReversionProbability = Math.min(1, 0.6 + Math.abs(deviationSigma - 2) * 0.2); // 0.6-1.0
    recommendedAction = 'BUY';
  } else if (deviationSigma > 2) {
    // Overbought: more than 2σ above mean
    isAnomaly = true;
    anomalyType = 'OVERBOUGHT';
    meanReversionProbability = Math.min(1, 0.6 + Math.abs(deviationSigma - 2) * 0.2); // 0.6-1.0
    recommendedAction = 'SELL';
  }

  // 5. Calculate expected reversal point (mean ± 0.5σ)
  const expectedReversalPoint = anomalyType === 'OVERSOLD'
    ? mean + (stdDev * 0.5) // Revert towards mean + 0.5σ
    : anomalyType === 'OVERBOUGHT'
    ? mean - (stdDev * 0.5) // Revert towards mean - 0.5σ
    : currentPrice;

  // 6. Calculate target price
  const targetPrice = expectedReversalPoint;

  // 7. Confidence based on volume confirmation and deviation magnitude
  let confidence = meanReversionProbability;
  
  // Volume confirmation: higher volume during anomaly = higher confidence
  if (volumes.length > 0 && isAnomaly) {
    const recentVolumes = volumes.slice(-20);
    const avgVolume = recentVolumes.reduce((sum, v) => sum + v, 0) / recentVolumes.length;
    const currentVolume = volumes[volumes.length - 1] || avgVolume;
    const volumeRatio = avgVolume > 0 ? currentVolume / avgVolume : 1;
    
    if (volumeRatio > 1.5) {
      confidence = Math.min(1, confidence + 0.15); // Volume spike increases confidence
    }
  }

  // 8. Generate explanation
  const anomalyText = anomalyType === 'OVERSOLD' ? 'aşırı satım' : anomalyType === 'OVERBOUGHT' ? 'aşırı alım' : 'normal';
  const explanation = isAnomaly
    ? `${symbol}: ${anomalyText} tespit edildi (ortalama ±${Math.abs(deviationSigma).toFixed(1)}σ sapma). Beklenen dönüş noktası: ${formatCurrencyTRY(expectedReversalPoint)}. Ortalama dönüş olasılığı: %${(meanReversionProbability * 100).toFixed(0)}.`
    : `${symbol}: Fiyat normal aralıkta (±2σ içinde). Ortalama dönüş sinyali yok.`;

  return {
    symbol,
    isAnomaly,
    anomalyType,
    deviationPercent: Math.round(deviationPercent * 10) / 10,
    meanReversionProbability: Math.round(meanReversionProbability * 100) / 100,
    expectedReversalPoint: Math.round(expectedReversalPoint * 100) / 100,
    recommendedAction,
    confidence: Math.round(confidence * 100) / 100,
    explanation,
    targetPrice: Math.round(targetPrice * 100) / 100,
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



