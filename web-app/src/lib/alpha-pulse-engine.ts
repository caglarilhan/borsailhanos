/**
 * Alpha Pulse Engine
 * v6.0 Profit Intelligence Suite
 * 
 * Fiyat hareketleri başlamadan 1-3 dakika önce "ön-momentum nabzını" yakalar
 * Teknoloji: Fourier Transform + FastGRU sequence detector (mock implementation)
 */

export interface AlphaPulseInput {
  symbol: string;
  prices: number[]; // Son 60 dakika fiyatları (1dk resolution)
  volumes: number[]; // Son 60 dakika hacimleri
  timestamps: string[]; // ISO timestamps
}

export interface AlphaPulseOutput {
  symbol: string;
  pulseStrength: number; // 0-100, higher = stronger pre-momentum signal
  timeToPulse: number; // Tahmini dakika cinsinden pulse'a kalan süre (1-3 dk)
  direction: 'UP' | 'DOWN' | 'NEUTRAL';
  confidence: number; // 0-1
  explanation: string;
  recommendedAction: 'BUY' | 'SELL' | 'WAIT';
  potentialAlpha: number; // %0.3-0.8 erken giriş avantajı
}

/**
 * Detect pre-momentum pulse using simplified Fourier analysis
 * 
 * Real implementation would use:
 * - FFT (Fast Fourier Transform) to detect frequency patterns
 * - FastGRU (Gated Recurrent Unit) for sequence prediction
 * - Volume spike detection
 * 
 * Mock implementation uses:
 * - Price velocity analysis
 * - Volume momentum
 * - Price acceleration patterns
 */
export function detectAlphaPulse(input: AlphaPulseInput): AlphaPulseOutput {
  const { symbol, prices, volumes, timestamps } = input;

  if (prices.length < 10) {
    return {
      symbol,
      pulseStrength: 0,
      timeToPulse: 0,
      direction: 'NEUTRAL',
      confidence: 0,
      explanation: `${symbol}: Yetersiz veri (minimum 10 veri noktası gerekli)`,
      recommendedAction: 'WAIT',
      potentialAlpha: 0,
    };
  }

  // 1. Calculate price velocity (rate of change)
  const recentPrices = prices.slice(-10); // Son 10 dakika
  const priceChanges: number[] = [];
  for (let i = 1; i < recentPrices.length; i++) {
    priceChanges.push((recentPrices[i] - recentPrices[i - 1]) / recentPrices[i - 1]);
  }
  const avgPriceChange = priceChanges.reduce((sum, c) => sum + c, 0) / priceChanges.length;
  const priceVolatility = Math.sqrt(
    priceChanges.reduce((sum, c) => sum + Math.pow(c - avgPriceChange, 2), 0) / priceChanges.length
  );

  // 2. Calculate volume momentum
  const recentVolumes = volumes.slice(-10);
  const avgVolume = recentVolumes.reduce((sum, v) => sum + v, 0) / recentVolumes.length;
  const currentVolume = recentVolumes[recentVolumes.length - 1];
  const volumeRatio = avgVolume > 0 ? currentVolume / avgVolume : 1;

  // 3. Calculate price acceleration (second derivative approximation)
  const priceAcceleration = priceChanges.length >= 2
    ? priceChanges[priceChanges.length - 1] - priceChanges[priceChanges.length - 2]
    : 0;

  // 4. Detect pulse pattern
  // Strong upward pulse: positive acceleration + high volume + rising prices
  // Strong downward pulse: negative acceleration + high volume + falling prices
  
  const upwardSignal = avgPriceChange > 0.001 && priceAcceleration > 0 && volumeRatio > 1.2;
  const downwardSignal = avgPriceChange < -0.001 && priceAcceleration < 0 && volumeRatio > 1.2;
  
  let direction: 'UP' | 'DOWN' | 'NEUTRAL';
  let pulseStrength = 0;
  let confidence = 0;

  if (upwardSignal) {
    direction = 'UP';
    // Pulse strength based on acceleration and volume
    pulseStrength = Math.min(100, Math.abs(priceAcceleration) * 1000 + (volumeRatio - 1) * 20);
    confidence = Math.min(1, 0.5 + (Math.abs(priceAcceleration) * 50) + ((volumeRatio - 1) * 0.2));
  } else if (downwardSignal) {
    direction = 'DOWN';
    pulseStrength = Math.min(100, Math.abs(priceAcceleration) * 1000 + (volumeRatio - 1) * 20);
    confidence = Math.min(1, 0.5 + (Math.abs(priceAcceleration) * 50) + ((volumeRatio - 1) * 0.2));
  } else {
    direction = 'NEUTRAL';
    pulseStrength = Math.max(0, Math.abs(priceAcceleration) * 500);
    confidence = Math.max(0, Math.abs(priceAcceleration) * 25);
  }

  // 5. Estimate time to pulse (1-3 minutes)
  // Based on acceleration rate
  const timeToPulse = pulseStrength > 50 
    ? 1 + (3 - 1) * (1 - pulseStrength / 100) // 1-3 dakika arası
    : 0;

  // 6. Calculate potential alpha advantage (0.3-0.8%)
  const potentialAlpha = pulseStrength > 70
    ? 0.3 + (pulseStrength - 70) / 30 * 0.5 // 0.3% to 0.8%
    : pulseStrength > 50
    ? 0.1 + (pulseStrength - 50) / 20 * 0.2 // 0.1% to 0.3%
    : 0;

  // 7. Determine recommended action
  let recommendedAction: 'BUY' | 'SELL' | 'WAIT';
  if (direction === 'UP' && pulseStrength > 60 && confidence > 0.6) {
    recommendedAction = 'BUY';
  } else if (direction === 'DOWN' && pulseStrength > 60 && confidence > 0.6) {
    recommendedAction = 'SELL';
  } else {
    recommendedAction = 'WAIT';
  }

  // 8. Generate explanation
  const directionText = direction === 'UP' ? 'yükseliş' : direction === 'DOWN' ? 'düşüş' : 'nötr';
  const volumeText = volumeRatio > 1.5 ? 'yüksek hacim' : volumeRatio > 1.2 ? 'artmış hacim' : 'normal hacim';
  const explanation = `${symbol}: ${pulseStrength.toFixed(1)}/100 pulse gücü (${directionText} yönü, ${volumeText}). Tahmini ${timeToPulse.toFixed(1)} dk içinde momentum başlayabilir. Potansiyel alpha avantajı: %${potentialAlpha.toFixed(2)}.`;

  return {
    symbol,
    pulseStrength: Math.round(pulseStrength * 10) / 10,
    timeToPulse: Math.round(timeToPulse * 10) / 10,
    direction,
    confidence: Math.round(confidence * 100) / 100,
    explanation,
    recommendedAction,
    potentialAlpha: Math.round(potentialAlpha * 100) / 100,
  };
}

/**
 * Batch detect alpha pulse for multiple symbols
 */
export function detectAlphaPulseBatch(inputs: AlphaPulseInput[]): AlphaPulseOutput[] {
  return inputs.map(detectAlphaPulse);
}

/**
 * Get pulse color for UI
 */
export function getPulseColor(pulseStrength: number, direction: 'UP' | 'DOWN' | 'NEUTRAL'): string {
  if (pulseStrength < 30) return '#94a3b8'; // slate-400 - Weak
  if (direction === 'UP') return '#10b981'; // emerald-500 - Strong Up
  if (direction === 'DOWN') return '#ef4444'; // red-500 - Strong Down
  return '#fbbf24'; // amber-400 - Neutral
}

/**
 * Format pulse strength label
 */
export function getPulseLabel(pulseStrength: number): string {
  if (pulseStrength >= 80) return 'Çok Güçlü';
  if (pulseStrength >= 60) return 'Güçlü';
  if (pulseStrength >= 40) return 'Orta';
  if (pulseStrength >= 20) return 'Zayıf';
  return 'Sinyal Yok';
}



