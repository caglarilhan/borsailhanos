/**
 * Live Data Validation
 * NaN and null filtering for real API data
 */

/**
 * Validate and clean numeric value
 */
export function validateNumber(value: any, fallback: number = 0): number {
  if (value === null || value === undefined || isNaN(value)) {
    return fallback;
  }
  const num = Number(value);
  return isNaN(num) ? fallback : num;
}

/**
 * Validate and clean array of numbers
 */
export function validateNumberArray(values: any[], fallback: number = 0): number[] {
  if (!Array.isArray(values)) return [];
  return values.map(v => validateNumber(v, fallback));
}

/**
 * Validate price data
 */
export interface PriceData {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  timestamp: string;
}

export function validatePriceData(data: any): PriceData | null {
  if (!data || typeof data !== 'object') return null;
  
  const price = validateNumber(data.price);
  const change = validateNumber(data.change || data.change_pct);
  const volume = validateNumber(data.volume || data.volume_24h, 0);
  
  // If critical fields are invalid, return null
  if (!data.symbol || price === 0) return null;
  
  return {
    symbol: String(data.symbol || ''),
    price,
    change,
    volume,
    timestamp: data.timestamp || new Date().toISOString(),
  };
}

/**
 * Validate prediction data
 */
export interface PredictionData {
  symbol: string;
  prediction: number; // -1 to +1
  confidence: number; // 0 to 1
  horizon: string;
  valid_until: string;
}

export function validatePredictionData(data: any): PredictionData | null {
  if (!data || typeof data !== 'object') return null;
  
  const prediction = validateNumber(data.prediction, 0);
  const confidence = validateNumber(data.confidence || data.conf, 0);
  
  // Clamp values to valid ranges
  const clampedPrediction = Math.max(-1, Math.min(1, prediction));
  const clampedConfidence = Math.max(0, Math.min(1, confidence));
  
  if (!data.symbol || clampedConfidence === 0) return null;
  
  return {
    symbol: String(data.symbol || ''),
    prediction: clampedPrediction,
    confidence: clampedConfidence,
    horizon: String(data.horizon || '1d'),
    valid_until: data.valid_until || data.validUntil || new Date(Date.now() + 86400000).toISOString(),
  };
}

/**
 * Batch validate and filter array
 */
export function filterValidData<T>(
  dataArray: any[],
  validator: (data: any) => T | null
): T[] {
  if (!Array.isArray(dataArray)) return [];
  
  return dataArray
    .map(validator)
    .filter((item): item is T => item !== null);
}

