/**
 * P0-7: XAI Ağırlıkları Tek Kaynak (Single Source of Truth)
 * Tüm XAI faktör ağırlıkları buradan yönetilir
 */

export type XAIFactor = 'RSI' | 'MACD' | 'Sentiment' | 'Volume';

export interface XAIWeights {
  RSI: number;
  MACD: number;
  Sentiment: number;
  Volume: number;
}

/**
 * SSOT: Tek XAI yapılandırma tablosu
 * Tüm XAI hesaplamaları bu ağırlıkları kullanmalı
 */
export const DEFAULT_XAI_WEIGHTS: XAIWeights = {
  RSI: 0.22,
  MACD: 0.25,
  Sentiment: 0.33,
  Volume: 0.20,
};

/**
 * Ağırlıkları normalize et (toplam 1.0 olmalı)
 */
export function normalizeWeights(weights: Partial<XAIWeights>): XAIWeights {
  const w = { ...DEFAULT_XAI_WEIGHTS, ...weights };
  const total = w.RSI + w.MACD + w.Sentiment + w.Volume;
  
  if (total === 0) return DEFAULT_XAI_WEIGHTS;
  
  return {
    RSI: w.RSI / total,
    MACD: w.MACD / total,
    Sentiment: w.Sentiment / total,
    Volume: w.Volume / total,
  };
}

/**
 * XAI ağırlıklarını al (SSOT)
 */
export function getXAIWeights(): XAIWeights {
  // Environment variable'dan override edilebilir
  const envWeights = process.env.NEXT_PUBLIC_XAI_WEIGHTS;
  if (envWeights) {
    try {
      const parsed = JSON.parse(envWeights) as Partial<XAIWeights>;
      return normalizeWeights(parsed);
    } catch (e) {
      console.warn('Failed to parse NEXT_PUBLIC_XAI_WEIGHTS:', e);
    }
  }

  // Client-side: localStorage'dan oku (user preference)
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('xaiWeights');
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<XAIWeights>;
        return normalizeWeights(parsed);
      }
    } catch (e) {
      console.warn('Failed to read xaiWeights from localStorage:', e);
    }
  }

  return DEFAULT_XAI_WEIGHTS;
}

/**
 * XAI ağırlıklarını kaydet (user preference)
 */
export function setXAIWeights(weights: Partial<XAIWeights>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const normalized = normalizeWeights(weights);
    localStorage.setItem('xaiWeights', JSON.stringify(normalized));
    localStorage.setItem('xaiWeightsUpdatedAt', new Date().toISOString());
  } catch (e) {
    console.error('Failed to save xaiWeights to localStorage:', e);
  }
}

/**
 * Faktör ağırlıklarını formatla (yüzde olarak)
 */
export function formatXAIWeights(weights: XAIWeights): Record<string, string> {
  return {
    RSI: `${(weights.RSI * 100).toFixed(0)}%`,
    MACD: `${(weights.MACD * 100).toFixed(0)}%`,
    Sentiment: `${(weights.Sentiment * 100).toFixed(0)}%`,
    Volume: `${(weights.Volume * 100).toFixed(0)}%`,
  };
}

/**
 * Faktör katkısını hesapla (ağırlık * değer)
 */
export function calculateFactorContribution(
  factor: XAIFactor,
  value: number,
  weights: XAIWeights = getXAIWeights()
): number {
  return weights[factor] * value;
}

/**
 * Toplam faktör skorunu hesapla
 */
export function calculateTotalFactorScore(
  factors: {
    RSI?: number;
    MACD?: number;
    Sentiment?: number;
    Volume?: number;
  },
  weights: XAIWeights = getXAIWeights()
): number {
  let total = 0;
  
  if (factors.RSI !== undefined) total += weights.RSI * factors.RSI;
  if (factors.MACD !== undefined) total += weights.MACD * factors.MACD;
  if (factors.Sentiment !== undefined) total += weights.Sentiment * factors.Sentiment;
  if (factors.Volume !== undefined) total += weights.Volume * factors.Volume;
  
  return total;
}


