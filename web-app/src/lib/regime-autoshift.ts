/**
 * Regime Auto-Shift Engine
 * v6.0 Profit Intelligence Suite
 * 
 * CDS, VIX, USDTRY bazlı risk-on/off otomatik tespit ve portföy rebalance
 */

export interface MacroIndicators {
  cds: number; // CDS 5-year (Turkey)
  vix: number; // VIX index
  usdtry: number; // USD/TRY exchange rate
  timestamp: string;
}

export interface RegimeState {
  regime: 'risk-on' | 'risk-off' | 'neutral';
  confidence: number; // 0-1
  cdsLevel: 'low' | 'medium' | 'high' | 'very_high';
  vixLevel: 'low' | 'medium' | 'high' | 'very_high';
  usdtryLevel: 'stable' | 'rising' | 'falling';
  recommendation: string;
  portfolioAction: 'increase_risk' | 'reduce_risk' | 'maintain' | 'hedge';
  suggestedRiskScale: number; // 0.5-1.5 multiplier
}

/**
 * Detect market regime from macro indicators
 * 
 * Risk-On Criteria:
 * - CDS < 350
 * - VIX < 20
 * - USDTRY stable or falling
 * 
 * Risk-Off Criteria:
 * - CDS > 450
 * - VIX > 25
 * - USDTRY rising rapidly
 * 
 * Neutral:
 * - Mixed signals or moderate levels
 */
export function detectRegime(macro: MacroIndicators, previousRegime?: RegimeState): RegimeState {
  const { cds, vix, usdtry } = macro;

  // CDS Level (0-10 scale, higher = more risk)
  let cdsLevel: 'low' | 'medium' | 'high' | 'very_high';
  let cdsScore = 0;
  if (cds < 300) {
    cdsLevel = 'low';
    cdsScore = 2;
  } else if (cds < 400) {
    cdsLevel = 'medium';
    cdsScore = 5;
  } else if (cds < 500) {
    cdsLevel = 'high';
    cdsScore = 7.5;
  } else {
    cdsLevel = 'very_high';
    cdsScore = 10;
  }

  // VIX Level
  let vixLevel: 'low' | 'medium' | 'high' | 'very_high';
  let vixScore = 0;
  if (vix < 15) {
    vixLevel = 'low';
    vixScore = 2;
  } else if (vix < 20) {
    vixLevel = 'medium';
    vixScore = 5;
  } else if (vix < 25) {
    vixLevel = 'high';
    vixScore = 7.5;
  } else {
    vixLevel = 'very_high';
    vixScore = 10;
  }

  // USDTRY Level (assume stable if no change data, would need history for proper detection)
  // For now, use absolute level
  let usdtryLevel: 'stable' | 'rising' | 'falling' = 'stable';
  let usdtryScore = 0;
  if (usdtry < 32) {
    usdtryLevel = 'falling';
    usdtryScore = 2;
  } else if (usdtry < 34) {
    usdtryLevel = 'stable';
    usdtryScore = 5;
  } else {
    usdtryLevel = 'rising';
    usdtryScore = 7.5;
  }

  // Calculate total risk score (0-30)
  const totalRiskScore = (cdsScore + vixScore + usdtryScore) / 3; // Average, 0-10

  // Determine regime
  let regime: 'risk-on' | 'risk-off' | 'neutral';
  let confidence: number;
  let portfolioAction: 'increase_risk' | 'reduce_risk' | 'maintain' | 'hedge';
  let suggestedRiskScale: number;
  let recommendation: string;

  if (totalRiskScore < 3.5) {
    regime = 'risk-on';
    confidence = 0.85 + (3.5 - totalRiskScore) / 3.5 * 0.15; // 0.85-1.0
    portfolioAction = 'increase_risk';
    suggestedRiskScale = 1.2; // Increase positions by 20%
    recommendation = 'Risk-on rejim: Pozisyon boyutunu artırabilir, yüksek momentum hisselere odaklan';
  } else if (totalRiskScore > 7.5) {
    regime = 'risk-off';
    confidence = 0.85 + (totalRiskScore - 7.5) / 2.5 * 0.15; // 0.85-1.0
    portfolioAction = totalRiskScore > 9 ? 'hedge' : 'reduce_risk';
    suggestedRiskScale = totalRiskScore > 9 ? 0.5 : 0.7; // Reduce positions by 30-50%
    recommendation = totalRiskScore > 9
      ? 'Risk-off rejim: Hedge öneriliyor (VIOP long, altın/USD pozisyon)'
      : 'Risk-off rejim: Pozisyon boyutunu azalt, yüksek volatilite hisselerden kaçın';
  } else {
    regime = 'neutral';
    confidence = 0.6 + (7.5 - totalRiskScore) / 4 * 0.25; // 0.6-0.85
    portfolioAction = 'maintain';
    suggestedRiskScale = 1.0; // Maintain current positions
    recommendation = 'Nötr rejim: Mevcut pozisyonları koru, seçici yaklaş';
  }

  // Check for regime change
  const regimeChanged = previousRegime && previousRegime.regime !== regime;
  if (regimeChanged) {
    recommendation += ` [REJIM DEGISIMI: ${previousRegime.regime} → ${regime}]`;
  }

  return {
    regime,
    confidence: Math.round(confidence * 100) / 100,
    cdsLevel,
    vixLevel,
    usdtryLevel,
    recommendation,
    portfolioAction,
    suggestedRiskScale: Math.round(suggestedRiskScale * 100) / 100,
  };
}

/**
 * Apply regime-based portfolio scaling
 */
export function applyRegimeScaling(
  currentWeights: Array<{ symbol: string; weight: number }>,
  regimeState: RegimeState
): Array<{ symbol: string; weight: number }> {
  const scale = regimeState.suggestedRiskScale;
  
  return currentWeights.map((w) => ({
    symbol: w.symbol,
    weight: Math.max(0, Math.min(1, w.weight * scale)), // Clamp to 0-1
  }));
}

/**
 * Get regime color for UI
 */
export function getRegimeColor(regime: RegimeState['regime']): string {
  switch (regime) {
    case 'risk-on':
      return '#10b981'; // emerald-500
    case 'risk-off':
      return '#ef4444'; // red-500
    default:
      return '#fbbf24'; // amber-400
  }
}

/**
 * Get regime badge label for UI
 */
export function getRegimeLabel(regime: RegimeState['regime']): string {
  switch (regime) {
    case 'risk-on':
      return 'Risk-On';
    case 'risk-off':
      return 'Risk-Off';
    default:
      return 'Nötr';
  }
}



