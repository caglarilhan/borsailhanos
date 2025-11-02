/**
 * AI Confidence Calibration
 * Platt Scaling + Isotonic Calibration
 */

/**
 * Platt Scaling (Sigmoid-based calibration)
 * Maps raw confidence scores to calibrated probabilities
 */
export function plattScaling(rawScore: number, a: number = 1.0, b: number = 0.0): number {
  // Sigmoid function: 1 / (1 + exp(-(a * rawScore + b)))
  const z = a * rawScore + b;
  return 1 / (1 + Math.exp(-z));
}

/**
 * Isotonic Calibration (piecewise constant mapping)
 * Requires calibration data with observed vs predicted
 */
export interface CalibrationPoint {
  predicted: number;
  observed: number;
}

export function isotonicCalibration(rawScore: number, calibrationData: CalibrationPoint[]): number {
  if (!calibrationData || calibrationData.length === 0) return rawScore;
  
  // Sort by predicted values
  const sorted = [...calibrationData].sort((a, b) => a.predicted - b.predicted);
  
  // Find the closest predicted value or interpolate
  for (let i = 0; i < sorted.length; i++) {
    if (rawScore <= sorted[i].predicted) {
      if (i === 0) return sorted[0].observed;
      // Interpolate between adjacent points
      const prev = sorted[i - 1];
      const curr = sorted[i];
      const ratio = (rawScore - prev.predicted) / (curr.predicted - prev.predicted || 0.001);
      return prev.observed + (curr.observed - prev.observed) * ratio;
    }
  }
  
  // If score is higher than all calibration points, use the last observed value
  return sorted[sorted.length - 1].observed;
}

/**
 * Reliability Diagram Data
 * Groups predictions into bins and calculates observed frequency
 */
export interface ReliabilityBin {
  binStart: number;
  binEnd: number;
  predictedAvg: number;
  observedFreq: number;
  count: number;
}

export function computeReliabilityDiagram(
  predictions: number[],
  outcomes: boolean[], // true = correct, false = incorrect
  numBins: number = 10
): ReliabilityBin[] {
  if (predictions.length !== outcomes.length || predictions.length === 0) {
    return [];
  }
  
  // Create bins
  const bins: ReliabilityBin[] = Array.from({ length: numBins }, (_, i) => ({
    binStart: i / numBins,
    binEnd: (i + 1) / numBins,
    predictedAvg: 0,
    observedFreq: 0,
    count: 0,
  }));
  
  // Group predictions into bins
  predictions.forEach((pred, idx) => {
    const binIndex = Math.min(Math.floor(pred * numBins), numBins - 1);
    bins[binIndex].count++;
    bins[binIndex].predictedAvg += pred;
    if (outcomes[idx]) bins[binIndex].observedFreq++;
  });
  
  // Calculate averages
  return bins.map(bin => ({
    ...bin,
    predictedAvg: bin.count > 0 ? bin.predictedAvg / bin.count : 0,
    observedFreq: bin.count > 0 ? bin.observedFreq / bin.count : 0,
  }));
}

/**
 * Calibration Error (ECE - Expected Calibration Error)
 */
export function calibrationError(reliabilityBins: ReliabilityBin[], totalCount: number): number {
  if (totalCount === 0) return 0;
  
  let ece = 0;
  reliabilityBins.forEach(bin => {
    const weight = bin.count / totalCount;
    ece += weight * Math.abs(bin.predictedAvg - bin.observedFreq);
  });
  
  return ece;
}

