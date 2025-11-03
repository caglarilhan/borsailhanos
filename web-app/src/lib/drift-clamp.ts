/**
 * P0-4: Confidence & Drift Clamp
 * Drift değerlerini -5pp ile +5pp arasına clamp etme
 */

/**
 * Drift değerini clamp et (-5pp ile +5pp arası)
 * @param drift Raw drift değeri (confidence farkı, 0-1 arası)
 * @returns Clamped drift değeri (pp cinsinden)
 */
export function clampDrift(drift: number): number {
  // Drift confidence farkından geliyorsa, pp'ye çevir
  const driftPP = drift * 100;
  
  // Clamp: -5pp ile +5pp arası
  return Math.max(-5, Math.min(5, driftPP));
}

/**
 * Confidence değerini clamp et (0-100 arası)
 * @param confidence Raw confidence değeri
 * @returns Clamped confidence değeri (0-100)
 */
export function clampConfidence(confidence: number): number {
  return Math.max(0, Math.min(100, confidence * 100));
}

/**
 * Drift ve confidence değerlerini normalize et
 * @param drift Raw drift değeri
 * @param confidence Raw confidence değeri
 * @returns Normalized {driftPP, confidencePercent}
 */
export function normalizeDriftAndConfidence(
  drift: number,
  confidence: number
): { driftPP: number; confidencePercent: number } {
  return {
    driftPP: clampDrift(drift),
    confidencePercent: clampConfidence(confidence),
  };
}

/**
 * Drift trend analizi (son 7 gün)
 * @param driftHistory Drift geçmişi array'i
 * @returns {trend: 'up' | 'down' | 'stable', avgDrift: number}
 */
export function analyzeDriftTrend(driftHistory: number[]): {
  trend: 'up' | 'down' | 'stable';
  avgDrift: number;
  volatility: number;
} {
  if (!driftHistory || driftHistory.length === 0) {
    return { trend: 'stable', avgDrift: 0, volatility: 0 };
  }

  // Son 7 değeri al (veya tümü)
  const recent = driftHistory.slice(-7);
  const avgDrift = recent.reduce((a, b) => a + b, 0) / recent.length;
  
  // Volatility (standart sapma)
  const variance = recent.reduce((sum, val) => sum + Math.pow(val - avgDrift, 2), 0) / recent.length;
  const volatility = Math.sqrt(variance);
  
  // Trend: son 3 değerin ortalaması vs ilk 3 değerin ortalaması
  if (recent.length >= 6) {
    const firstHalf = recent.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const secondHalf = recent.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const diff = secondHalf - firstHalf;
    
    if (diff > 0.5) return { trend: 'up', avgDrift, volatility };
    if (diff < -0.5) return { trend: 'down', avgDrift, volatility };
  }
  
  return { trend: 'stable', avgDrift, volatility };
}


