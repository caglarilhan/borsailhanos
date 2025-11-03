/**
 * P5.2: Drift Anomaly Detector
 * Drift ±10pp clamp ve anomaly flag
 */

export interface DriftAnomalyResult {
  drift: number; // Normalized drift in percentage points
  isAnomaly: boolean;
  anomalyReason?: string;
  normalized: number; // Clamped drift value
  warning?: string;
}

/**
 * Detect drift anomaly and clamp to ±10pp
 */
export function detectDriftAnomaly(
  drift: number, // Raw drift value (could be in % or pp)
  maxDrift: number = 10.0 // Maximum drift in pp (default: 10pp)
): DriftAnomalyResult {
  // Convert to percentage points if needed (if > 100, assume it's in percentage)
  let driftPP: number;
  if (Math.abs(drift) > 100) {
    // Likely in percentage scale (e.g., 86.0 = 86%), convert to pp
    driftPP = drift / 10; // Divide by 10 to convert % to pp (e.g., 86% → 8.6pp)
  } else {
    driftPP = drift;
  }

  // Clamp to ±10pp
  const normalized = Math.max(-maxDrift, Math.min(maxDrift, driftPP));

  // Check for anomaly
  const isAnomaly = Math.abs(driftPP) > maxDrift;
  
  let anomalyReason: string | undefined;
  let warning: string | undefined;

  if (isAnomaly) {
    anomalyReason = `Drift değeri ±${maxDrift}pp sınırını aşıyor (${driftPP.toFixed(1)}pp)`;
    warning = `⚠️ Anomali: Drift ${driftPP.toFixed(1)}pp normal aralığın dışında. Normalize edildi: ${normalized.toFixed(1)}pp`;
  }

  return {
    drift: driftPP,
    isAnomaly,
    anomalyReason,
    normalized,
    warning,
  };
}


