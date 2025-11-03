/**
 * P5.2: Drift Normalization
 * Drift normalize et, outlier clamp (±5pp sınırı)
 * +86.0 pp gibi "ölçek dışı" değer üretiyor → normalize edilmeli
 */

/**
 * Clamp drift value to ±5pp range
 */
export function clampDriftValue(drift: number, maxDrift: number = 5.0): number {
  // If drift is already in percentage points (pp), clamp directly
  if (Math.abs(drift) > 100) {
    // Likely in percentage scale (e.g., 86.0 = 86%), convert to pp and clamp
    const driftPP = drift / 100;
    return Math.max(-maxDrift, Math.min(maxDrift, driftPP));
  }
  
  // Already in pp scale, clamp directly
  return Math.max(-maxDrift, Math.min(maxDrift, drift));
}

/**
 * Normalize drift value with outlier detection
 */
export function normalizeDriftWithOutlier(drift: number): {
  normalized: number;
  isOutlier: boolean;
  original: number;
} {
  const maxDrift = 5.0; // ±5pp limit
  const original = drift;
  
  // Check if outlier
  const isOutlier = Math.abs(drift) > maxDrift;
  
  // Clamp to ±5pp
  const normalized = clampDriftValue(drift, maxDrift);
  
  return {
    normalized,
    isOutlier,
    original,
  };
}

/**
 * Validate drift value (check if within acceptable range)
 */
export function validateDriftValue(drift: number): {
  isValid: boolean;
  normalized: number;
  warning?: string;
} {
  const maxDrift = 5.0; // ±5pp limit
  
  if (Math.abs(drift) > maxDrift * 2) {
    // Extreme outlier (e.g., >10pp)
    return {
      isValid: false,
      normalized: clampDriftValue(drift, maxDrift),
      warning: `Drift değeri ${drift.toFixed(1)}pp ±5pp sınırını aşıyor. Normalize edildi: ${clampDriftValue(drift, maxDrift).toFixed(1)}pp`,
    };
  }
  
  if (Math.abs(drift) > maxDrift) {
    // Outlier but not extreme
    return {
      isValid: false,
      normalized: clampDriftValue(drift, maxDrift),
      warning: `Drift değeri ${drift.toFixed(1)}pp ±5pp sınırını aşıyor. Normalize edildi.`,
    };
  }
  
  return {
    isValid: true,
    normalized: drift,
  };
}


