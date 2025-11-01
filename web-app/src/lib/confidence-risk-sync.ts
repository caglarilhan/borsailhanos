/**
 * P1-02: AI Confidence / Risk Skoru Uyumu
 * Confidence ve Risk skorlarını normalize edip renk eşleştirme sağlar
 */

/**
 * Get confidence color based on percentage (0-100)
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return 'text-green-600 bg-green-50 border-green-200';
  if (confidence >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-red-600 bg-red-50 border-red-200';
}

/**
 * Get risk level label based on normalized risk score (0-10)
 */
export function getRiskLabel(risk: number): string {
  if (risk <= 2) return 'Düşük';
  if (risk <= 6) return 'Orta';
  return 'Yüksek';
}

/**
 * Get risk color based on normalized risk score (0-10)
 */
export function getRiskColor(risk: number): string {
  if (risk <= 2) return 'text-green-600 bg-green-50 border-green-200';
  if (risk <= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-red-600 bg-red-50 border-red-200';
}

/**
 * Sync confidence and risk colors for consistent UI
 */
export function syncConfidenceRiskColor(confidence: number, risk: number): {
  confidenceColor: string;
  riskColor: string;
  syncStatus: 'synced' | 'warning' | 'conflict';
} {
  const confColor = getConfidenceColor(confidence);
  const riskColor = getRiskColor(risk);
  
  // Check if colors are aligned (both green, both yellow, or both red)
  const confLevel = confidence >= 80 ? 'high' : confidence >= 60 ? 'medium' : 'low';
  const riskLevel = risk <= 2 ? 'low' : risk <= 6 ? 'medium' : 'high';
  
  // Sync: High confidence = Low risk, Medium confidence = Medium risk, Low confidence = High risk
  let syncStatus: 'synced' | 'warning' | 'conflict' = 'synced';
  if ((confLevel === 'high' && riskLevel !== 'low') || 
      (confLevel === 'low' && riskLevel !== 'high')) {
    syncStatus = 'warning';
  }
  if ((confLevel === 'high' && riskLevel === 'high') || 
      (confLevel === 'low' && riskLevel === 'low')) {
    syncStatus = 'conflict';
  }
  
  return {
    confidenceColor: confColor,
    riskColor: riskColor,
    syncStatus
  };
}

