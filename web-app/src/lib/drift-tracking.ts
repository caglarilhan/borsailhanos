/**
 * Model Drift Tracking
 * Rolling window-based drift metrics (7-day)
 */

export interface DriftMetric {
  date: string;
  accuracy: number;
  confidence: number;
  drift: number; // Difference from baseline
}

export interface RollingDriftStats {
  windowSize: number;
  currentDrift: number;
  averageDrift: number;
  trend: 'improving' | 'degrading' | 'stable';
  volatility: number;
  metrics: DriftMetric[];
}

/**
 * Calculate rolling window drift statistics
 */
export function calculateRollingDrift(
  metrics: DriftMetric[],
  windowSize: number = 7
): RollingDriftStats {
  if (!metrics || metrics.length === 0) {
    return {
      windowSize,
      currentDrift: 0,
      averageDrift: 0,
      trend: 'stable',
      volatility: 0,
      metrics: [],
    };
  }
  
  // Use last N days (rolling window)
  const recentMetrics = metrics.slice(-windowSize);
  if (recentMetrics.length === 0) {
    return {
      windowSize,
      currentDrift: 0,
      averageDrift: 0,
      trend: 'stable',
      volatility: 0,
      metrics: [],
    };
  }
  
  // Baseline is the average of the first half of the window
  const baselineLength = Math.floor(recentMetrics.length / 2);
  const baseline = baselineLength > 0
    ? recentMetrics.slice(0, baselineLength).reduce((sum, m) => sum + m.accuracy, 0) / baselineLength
    : recentMetrics[0]?.accuracy || 0;
  
  // Current drift
  const current = recentMetrics[recentMetrics.length - 1];
  const currentDrift = current.accuracy - baseline;
  
  // Average drift over window
  const averageDrift = recentMetrics.reduce((sum, m) => sum + m.drift, 0) / recentMetrics.length;
  
  // Trend: compare last 3 days vs first 3 days
  const firstHalf = recentMetrics.slice(0, Math.floor(recentMetrics.length / 2));
  const secondHalf = recentMetrics.slice(-Math.floor(recentMetrics.length / 2));
  const firstAvg = firstHalf.reduce((sum, m) => sum + m.accuracy, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, m) => sum + m.accuracy, 0) / secondHalf.length;
  const diff = secondAvg - firstAvg;
  
  let trend: 'improving' | 'degrading' | 'stable' = 'stable';
  if (diff > 0.02) trend = 'improving';
  else if (diff < -0.02) trend = 'degrading';
  
  // Volatility (standard deviation of drift)
  const driftValues = recentMetrics.map(m => m.drift);
  const driftMean = averageDrift;
  const driftVariance = driftValues.reduce((sum, d) => sum + Math.pow(d - driftMean, 2), 0) / driftValues.length;
  const volatility = Math.sqrt(driftVariance);
  
  return {
    windowSize,
    currentDrift,
    averageDrift,
    trend,
    volatility,
    metrics: recentMetrics,
  };
}

/**
 * Detect significant drift (threshold-based)
 */
export function detectSignificantDrift(
  stats: RollingDriftStats,
  threshold: number = 0.05 // 5% drift threshold
): boolean {
  return Math.abs(stats.currentDrift) > threshold;
}

