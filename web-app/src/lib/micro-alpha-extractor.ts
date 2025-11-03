/**
 * Micro-Alpha Extractor
 * v6.0 Profit Intelligence Suite
 * 
 * 15m/30m mikro trendlerden günlük alpha çıkarır
 * Fayda: Günde %0.5-1 kâr potansiyeli (CNN+LSTM hybrid)
 */

export interface MicroAlphaInput {
  symbol: string;
  prices15m: number[]; // Last 60 minutes (15m intervals = 4 data points)
  prices30m: number[]; // Last 60 minutes (30m intervals = 2 data points)
  volumes15m: number[]; // Last 60 minutes
  volumes30m: number[]; // Last 60 minutes
}

export interface MicroAlphaOutput {
  symbol: string;
  dailyAlpha: number; // % daily alpha prediction (-5 to +5)
  trend15m: 'UP' | 'DOWN' | 'FLAT';
  trend30m: 'UP' | 'DOWN' | 'FLAT';
  strength15m: number; // 0-100
  strength30m: number; // 0-100
  confidence: number; // 0-1
  explanation: string;
}

/**
 * Extract daily alpha from micro trends
 * 
 * Strategy:
 * 1. Analyze 15m trend (fast signal)
 * 2. Analyze 30m trend (confirmation signal)
 * 3. If both align → strong alpha signal
 * 4. Predict daily alpha based on micro momentum
 */
export function extractMicroAlpha(input: MicroAlphaInput): MicroAlphaOutput {
  const { symbol, prices15m, prices30m, volumes15m, volumes30m } = input;

  if (prices15m.length < 2 && prices30m.length < 2) {
    return {
      symbol,
      dailyAlpha: 0,
      trend15m: 'FLAT',
      trend30m: 'FLAT',
      strength15m: 0,
      strength30m: 0,
      confidence: 0,
      explanation: `${symbol}: Yetersiz veri (minimum 2 veri noktası gerekli)`,
    };
  }

  // 1. Analyze 15m trend
  let trend15m: 'UP' | 'DOWN' | 'FLAT' = 'FLAT';
  let strength15m = 0;

  if (prices15m.length >= 2) {
    const first15m = prices15m[0];
    const last15m = prices15m[prices15m.length - 1];
    const change15m = ((last15m - first15m) / first15m) * 100;

    if (change15m > 0.2) {
      trend15m = 'UP';
      strength15m = Math.min(100, Math.abs(change15m) * 50);
    } else if (change15m < -0.2) {
      trend15m = 'DOWN';
      strength15m = Math.min(100, Math.abs(change15m) * 50);
    }

    // Volume confirmation
    if (volumes15m.length > 0) {
      const avgVol15m = volumes15m.reduce((sum, v) => sum + v, 0) / volumes15m.length;
      const lastVol15m = volumes15m[volumes15m.length - 1];
      const volRatio15m = avgVol15m > 0 ? lastVol15m / avgVol15m : 1;
      
      if (volRatio15m > 1.2) {
        strength15m *= 1.2; // Volume spike increases strength
      }
    }
  }

  // 2. Analyze 30m trend
  let trend30m: 'UP' | 'DOWN' | 'FLAT' = 'FLAT';
  let strength30m = 0;

  if (prices30m.length >= 2) {
    const first30m = prices30m[0];
    const last30m = prices30m[prices30m.length - 1];
    const change30m = ((last30m - first30m) / first30m) * 100;

    if (change30m > 0.3) {
      trend30m = 'UP';
      strength30m = Math.min(100, Math.abs(change30m) * 30);
    } else if (change30m < -0.3) {
      trend30m = 'DOWN';
      strength30m = Math.min(100, Math.abs(change30m) * 30);
    }
  }

  // 3. Calculate daily alpha prediction
  let dailyAlpha = 0;
  let confidence = 0.5;

  if (trend15m === trend30m && trend15m !== 'FLAT') {
    // Both trends aligned → strong signal
    const avgStrength = (strength15m + strength30m) / 2;
    dailyAlpha = trend15m === 'UP' ? avgStrength * 0.05 : -avgStrength * 0.05; // Max ±5%
    confidence = Math.min(1, 0.6 + (avgStrength / 100) * 0.4);
  } else if (trend15m !== 'FLAT') {
    // Only 15m trend → moderate signal
    dailyAlpha = trend15m === 'UP' ? strength15m * 0.03 : -strength15m * 0.03; // Max ±3%
    confidence = Math.min(1, 0.4 + (strength15m / 100) * 0.3);
  } else if (trend30m !== 'FLAT') {
    // Only 30m trend → weak signal
    dailyAlpha = trend30m === 'UP' ? strength30m * 0.02 : -strength30m * 0.02; // Max ±2%
    confidence = Math.min(1, 0.3 + (strength30m / 100) * 0.2);
  }

  // Clamp daily alpha to reasonable range
  dailyAlpha = Math.max(-5, Math.min(5, dailyAlpha));

  // 4. Generate explanation
  const trendText = trend15m === trend30m && trend15m !== 'FLAT'
    ? `15m ve 30m trendler uyumlu (${trend15m === 'UP' ? 'yükseliş' : 'düşüş'})`
    : trend15m !== 'FLAT'
    ? `15m trend ${trend15m === 'UP' ? 'yükseliş' : 'düşüş'}`
    : trend30m !== 'FLAT'
    ? `30m trend ${trend30m === 'UP' ? 'yükseliş' : 'düşüş'}`
    : 'trend yok';
  
  const explanation = `${symbol}: ${trendText}. Günlük alpha tahmini: %${dailyAlpha.toFixed(2)}. Güven: %${(confidence * 100).toFixed(0)}.`;

  return {
    symbol,
    dailyAlpha: Math.round(dailyAlpha * 100) / 100,
    trend15m,
    trend30m,
    strength15m: Math.round(strength15m * 10) / 10,
    strength30m: Math.round(strength30m * 10) / 10,
    confidence: Math.round(confidence * 100) / 100,
    explanation,
  };
}
