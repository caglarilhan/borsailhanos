/**
 * P0-C2: Metrik Validasyonu (clamp + validasyon)
 * Drift, sentiment, confidence için validasyon ve clamp
 */

export interface MetricValidation {
  isValid: boolean;
  clamped: boolean;
  warnings: string[];
  value: number;
}

/**
 * Clamp and validate drift (percentage points)
 * Range: -10pp to +10pp
 */
export function validateDrift(drift: number): MetricValidation {
  const original = drift;
  const clamped = Math.max(-10, Math.min(10, drift));
  const isValid = isFinite(drift) && !isNaN(drift);
  const wasClamped = original !== clamped;
  
  const warnings: string[] = [];
  if (wasClamped) {
    warnings.push(`Drift ${original.toFixed(1)}pp clamped to ${clamped.toFixed(1)}pp (range: -10pp to +10pp)`);
  }
  if (!isValid) {
    warnings.push(`Invalid drift value: ${drift}`);
  }
  
  return {
    isValid,
    clamped: wasClamped,
    warnings,
    value: clamped,
  };
}

/**
 * Clamp and validate confidence
 * Range: 0 to 1 (or 0% to 100%)
 */
export function validateConfidence(confidence: number, isPercentage: boolean = false): MetricValidation {
  const max = isPercentage ? 100 : 1;
  const original = confidence;
  const clamped = Math.max(0, Math.min(max, confidence));
  const isValid = isFinite(confidence) && !isNaN(confidence) && confidence >= 0;
  const wasClamped = original !== clamped;
  
  const warnings: string[] = [];
  if (wasClamped) {
    warnings.push(`Confidence ${original.toFixed(2)}${isPercentage ? '%' : ''} clamped to ${clamped.toFixed(2)}${isPercentage ? '%' : ''} (range: 0-${max}${isPercentage ? '%' : ''})`);
  }
  if (!isValid) {
    warnings.push(`Invalid confidence value: ${confidence}`);
  }
  
  return {
    isValid,
    clamped: wasClamped,
    warnings,
    value: clamped,
  };
}

/**
 * Clamp and validate sentiment percentage
 * Range: 0% to 100%
 */
export function validateSentimentPercentage(sentiment: number): MetricValidation {
  const original = sentiment;
  const clamped = Math.max(0, Math.min(100, sentiment));
  const isValid = isFinite(sentiment) && !isNaN(sentiment) && sentiment >= 0;
  const wasClamped = original !== clamped;
  
  const warnings: string[] = [];
  if (wasClamped) {
    warnings.push(`Sentiment ${original.toFixed(1)}% clamped to ${clamped.toFixed(1)}% (range: 0-100%)`);
  }
  if (!isValid) {
    warnings.push(`Invalid sentiment value: ${sentiment}`);
  }
  
  return {
    isValid,
    clamped: wasClamped,
    warnings,
    value: clamped,
  };
}

/**
 * Validate all metrics at once
 */
export function validateAllMetrics(metrics: {
  drift?: number;
  confidence?: number;
  sentiment?: number;
}): {
  drift?: MetricValidation;
  confidence?: MetricValidation;
  sentiment?: MetricValidation;
  hasWarnings: boolean;
  allValid: boolean;
} {
  const results: any = {};
  let hasWarnings = false;
  let allValid = true;
  
  if (metrics.drift !== undefined) {
    results.drift = validateDrift(metrics.drift);
    if (results.drift.clamped || !results.drift.isValid) hasWarnings = true;
    if (!results.drift.isValid) allValid = false;
  }
  
  if (metrics.confidence !== undefined) {
    results.confidence = validateConfidence(metrics.confidence);
    if (results.confidence.clamped || !results.confidence.isValid) hasWarnings = true;
    if (!results.confidence.isValid) allValid = false;
  }
  
  if (metrics.sentiment !== undefined) {
    results.sentiment = validateSentimentPercentage(metrics.sentiment);
    if (results.sentiment.clamped || !results.sentiment.isValid) hasWarnings = true;
    if (!results.sentiment.isValid) allValid = false;
  }
  
  return {
    ...results,
    hasWarnings,
    allValid,
  };
}


