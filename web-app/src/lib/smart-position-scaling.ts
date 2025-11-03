/**
 * Smart Position Scaling
 * v6.0 Profit Intelligence Suite
 * 
 * AI, volatiliteye göre pozisyon büyüklüğünü otomatik ayarlar
 * Örnek: Volatilite ↑ → pozisyon %60'a düşürülür
 */

export interface PositionScalingInput {
  symbol: string;
  basePosition: number; // Base position size (percentage or absolute)
  currentVolatility: number; // 0-1 scale (annualized)
  averageVolatility: number; // 0-1 scale (30-day average)
  aiConfidence: number; // 0-1
  riskLevel: 'low' | 'medium' | 'high' | 'aggressive';
  portfolioEquity: number; // Total portfolio value
}

export interface PositionScalingOutput {
  symbol: string;
  originalPosition: number;
  scaledPosition: number;
  scaleFactor: number; // 0.5-1.5 multiplier
  volatilityAdjustment: number; // -% adjustment
  confidenceAdjustment: number; // +% adjustment
  recommendedAllocation: number; // Final allocation (TRY or %)
  explanation: string;
  warning?: string;
}

/**
 * Calculate smart position scaling based on volatility
 * 
 * Formula:
 * - Base position adjusted for volatility deviation
 * - Confidence boost/reduction applied
 * - Risk level constraint enforced
 * 
 * Volatility adjustment:
 * - If currentVol > avgVol × 1.5 → reduce by 40%
 * - If currentVol < avgVol × 0.7 → increase by 20%
 * - Linear scaling between these thresholds
 * 
 * Confidence adjustment:
 * - Confidence > 0.85 → +15%
 * - Confidence < 0.6 → -30%
 * - Linear scaling between these thresholds
 */
export function calculateSmartPositionScaling(input: PositionScalingInput): PositionScalingOutput {
  const { symbol, basePosition, currentVolatility, averageVolatility, aiConfidence, riskLevel, portfolioEquity } = input;

  // 1. Calculate volatility adjustment
  const volatilityRatio = averageVolatility > 0 ? currentVolatility / averageVolatility : 1;
  let volatilityAdjustment = 0;
  let volatilityScaleFactor = 1.0;

  if (volatilityRatio > 1.5) {
    // High volatility: reduce position by up to 40%
    volatilityAdjustment = -40;
    volatilityScaleFactor = 0.6; // Reduce to 60%
  } else if (volatilityRatio < 0.7) {
    // Low volatility: increase position by up to 20%
    volatilityAdjustment = +20;
    volatilityScaleFactor = 1.2; // Increase to 120%
  } else {
    // Linear scaling between 0.7 and 1.5
    const slope = (1.5 - 0.7) / (1.2 - 0.6); // Map 0.7-1.5 to 1.2-0.6
    volatilityScaleFactor = 1.2 - (volatilityRatio - 0.7) * slope;
    volatilityAdjustment = (volatilityScaleFactor - 1) * 100;
  }

  // 2. Calculate confidence adjustment
  let confidenceAdjustment = 0;
  let confidenceScaleFactor = 1.0;

  if (aiConfidence > 0.85) {
    confidenceAdjustment = +15;
    confidenceScaleFactor = 1.15;
  } else if (aiConfidence < 0.6) {
    confidenceAdjustment = -30;
    confidenceScaleFactor = 0.7;
  } else {
    // Linear scaling between 0.6 and 0.85
    const slope = (0.85 - 0.6) / (1.15 - 0.7); // Map 0.6-0.85 to 0.7-1.15
    confidenceScaleFactor = 0.7 + (aiConfidence - 0.6) * slope;
    confidenceAdjustment = (confidenceScaleFactor - 1) * 100;
  }

  // 3. Apply risk level constraint
  let riskLevelMaxScale = 1.0;
  let riskLevelMinScale = 1.0;
  
  switch (riskLevel) {
    case 'low':
      riskLevelMaxScale = 0.8; // Max 80% of base
      riskLevelMinScale = 0.5; // Min 50% of base
      break;
    case 'medium':
      riskLevelMaxScale = 1.0; // Max 100% of base
      riskLevelMinScale = 0.6; // Min 60% of base
      break;
    case 'high':
      riskLevelMaxScale = 1.2; // Max 120% of base
      riskLevelMinScale = 0.7; // Min 70% of base
      break;
    case 'aggressive':
      riskLevelMaxScale = 1.5; // Max 150% of base
      riskLevelMinScale = 0.8; // Min 80% of base
      break;
  }

  // 4. Combine adjustments
  let combinedScaleFactor = volatilityScaleFactor * confidenceScaleFactor;
  
  // Apply risk level constraints
  combinedScaleFactor = Math.max(riskLevelMinScale, Math.min(riskLevelMaxScale, combinedScaleFactor));

  // 5. Calculate final scaled position
  const scaledPosition = basePosition * combinedScaleFactor;
  const recommendedAllocation = portfolioEquity * scaledPosition; // Assuming basePosition is percentage

  // 6. Generate warning if necessary
  let warning: string | undefined;
  if (volatilityRatio > 2.0) {
    warning = 'Yüksek volatilite uyarısı: Pozisyon boyutu otomatik azaltıldı';
  } else if (aiConfidence < 0.5) {
    warning = 'Düşük AI güveni: Pozisyon boyutu azaltıldı, dikkatli yaklaşın';
  } else if (combinedScaleFactor > 1.3) {
    warning = 'Agresif pozisyon: Yüksek güven ve düşük volatilite nedeniyle pozisyon artırıldı';
  }

  // 7. Generate explanation
  const volText = volatilityRatio > 1.5 ? 'yüksek' : volatilityRatio < 0.7 ? 'düşük' : 'normal';
  const confText = aiConfidence > 0.85 ? 'yüksek güven' : aiConfidence < 0.6 ? 'düşük güven' : 'orta güven';
  const explanation = `${symbol}: Orijinal pozisyon ${basePosition.toFixed(1)}% → Ölçeklenmiş pozisyon ${scaledPosition.toFixed(1)}% (${volText} volatilite, ${confText}). Toplam tahsis: ${formatCurrencyTRY(recommendedAllocation)}.`;

  return {
    symbol,
    originalPosition: basePosition,
    scaledPosition: Math.round(scaledPosition * 100) / 100,
    scaleFactor: Math.round(combinedScaleFactor * 100) / 100,
    volatilityAdjustment: Math.round(volatilityAdjustment * 10) / 10,
    confidenceAdjustment: Math.round(confidenceAdjustment * 10) / 10,
    recommendedAllocation: Math.round(recommendedAllocation * 100) / 100,
    explanation,
    warning,
  };
}

/**
 * Format currency for display
 */
function formatCurrencyTRY(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}



