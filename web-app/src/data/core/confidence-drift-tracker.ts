/**
 * P5.2: AI Confidence Drift Tracker 2.0
 * 24s, 7g, 30g bazlı drift grafiği
 * Alert: "Confidence düşüşü >10% → retraining öner"
 */

export interface ConfidenceDataPoint {
  timestamp: string;
  confidence: number; // 0-1
  accuracy?: number; // 0-1
  window: '24s' | '7d' | '30d';
}

export interface ConfidenceDriftMetrics {
  window: '24s' | '7d' | '30d';
  current: number;
  previous: number;
  drift: number; // Change in percentage points
  trend: 'improving' | 'worsening' | 'stable';
  alertLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  recommendation?: string;
}

export interface ConfidenceOverlay {
  timestamps: string[];
  confidence: number[];
  min: number;
  max: number;
  mean: number;
  std: number;
  bands: {
    upper: number; // Mean + 1σ
    lower: number; // Mean - 1σ
    confidence95: {
      upper: number; // Mean + 1.96σ
      lower: number; // Mean - 1.96σ
    };
  };
}

/**
 * Confidence Drift Tracker 2.0
 */
export class ConfidenceDriftTracker {
  private history: ConfidenceDataPoint[] = [];
  private maxHistorySize = 10000;

  /**
   * Record confidence data point
   */
  recordConfidence(
    confidence: number,
    window: '24s' | '7d' | '30d',
    accuracy?: number
  ): void {
    this.history.push({
      timestamp: new Date().toISOString(),
      confidence,
      accuracy,
      window,
    });

    // Keep only recent history
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Calculate drift metrics for a window
   */
  calculateDrift(window: '24s' | '7d' | '30d'): ConfidenceDriftMetrics | null {
    const windowData = this.history.filter((d) => d.window === window);
    if (windowData.length < 2) return null;

    // Sort by timestamp
    const sorted = [...windowData].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const current = sorted[sorted.length - 1].confidence;
    const previous = sorted[sorted.length - 2].confidence;
    const drift = current - previous;

    // Determine trend
    const recentData = sorted.slice(-10); // Last 10 data points
    const trend = this.determineTrend(recentData.map((d) => d.confidence));

    // Determine alert level
    const alertLevel = this.determineAlertLevel(Math.abs(drift), trend);

    // Generate recommendation
    const recommendation = this.generateRecommendation(drift, alertLevel);

    return {
      window,
      current,
      previous,
      drift,
      trend,
      alertLevel,
      recommendation,
    };
  }

  /**
   * Determine trend
   */
  private determineTrend(confidences: number[]): 'improving' | 'worsening' | 'stable' {
    if (confidences.length < 3) return 'stable';

    // Calculate linear regression slope
    const n = confidences.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = confidences;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    if (slope > 0.01) return 'improving';
    if (slope < -0.01) return 'worsening';
    return 'stable';
  }

  /**
   * Determine alert level
   */
  private determineAlertLevel(
    drift: number,
    trend: 'improving' | 'worsening' | 'stable'
  ): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    // Convert drift to percentage points
    const driftPP = drift * 100;

    if (trend === 'worsening' && driftPP > 10) {
      return 'critical';
    } else if (trend === 'worsening' && driftPP > 7) {
      return 'high';
    } else if (trend === 'worsening' && driftPP > 5) {
      return 'medium';
    } else if (trend === 'worsening' && driftPP > 3) {
      return 'low';
    } else if (trend === 'improving' && driftPP > 5) {
      return 'low'; // Positive drift is less concerning
    }

    return 'none';
  }

  /**
   * Generate recommendation
   */
  private generateRecommendation(
    drift: number,
    alertLevel: 'none' | 'low' | 'medium' | 'high' | 'critical'
  ): string | undefined {
    if (alertLevel === 'none') return undefined;

    const driftPP = drift * 100;

    if (alertLevel === 'critical') {
      return `Confidence düşüşü %${Math.abs(driftPP).toFixed(1)} → Acil retraining önerilir`;
    } else if (alertLevel === 'high') {
      return `Confidence düşüşü %${Math.abs(driftPP).toFixed(1)} → Retraining düşünülmeli`;
    } else if (alertLevel === 'medium') {
      return `Confidence düşüşü %${Math.abs(driftPP).toFixed(1)} → Model performansını izle`;
    } else {
      return `Confidence değişimi %${Math.abs(driftPP).toFixed(1)} → Dikkatli izle`;
    }
  }

  /**
   * Generate confidence overlay for chart
   */
  generateOverlay(window: '24s' | '7d' | '30d', period: number = 30): ConfidenceOverlay {
    const windowData = this.history
      .filter((d) => d.window === window)
      .slice(-period); // Last N data points

    if (windowData.length === 0) {
      return {
        timestamps: [],
        confidence: [],
        min: 0,
        max: 1,
        mean: 0.5,
        std: 0.1,
        bands: {
          upper: 0.6,
          lower: 0.4,
          confidence95: {
            upper: 0.7,
            lower: 0.3,
          },
        },
      };
    }

    const confidences = windowData.map((d) => d.confidence);
    const timestamps = windowData.map((d) => d.timestamp);

    // Calculate statistics
    const mean = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    const variance = confidences.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / confidences.length;
    const std = Math.sqrt(variance);

    const min = Math.min(...confidences);
    const max = Math.max(...confidences);

    // Calculate confidence bands
    const upper = mean + std;
    const lower = mean - std;
    const upper95 = mean + 1.96 * std;
    const lower95 = mean - 1.96 * std;

    return {
      timestamps,
      confidence: confidences,
      min,
      max,
      mean,
      std,
      bands: {
        upper,
        lower,
        confidence95: {
          upper: upper95,
          lower: lower95,
        },
      },
    };
  }

  /**
   * Get confidence history for a window
   */
  getHistory(window: '24s' | '7d' | '30d', limit: number = 100): ConfidenceDataPoint[] {
    return this.history
      .filter((d) => d.window === window)
      .slice(-limit)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Get all drift metrics
   */
  getAllDriftMetrics(): {
    '24s': ConfidenceDriftMetrics | null;
    '7d': ConfidenceDriftMetrics | null;
    '30d': ConfidenceDriftMetrics | null;
  } {
    return {
      '24s': this.calculateDrift('24s'),
      '7d': this.calculateDrift('7d'),
      '30d': this.calculateDrift('30d'),
    };
  }
}

// Singleton instance
export const confidenceDriftTracker = new ConfidenceDriftTracker();

/**
 * Record confidence data point
 */
export function recordConfidence(
  confidence: number,
  window: '24s' | '7d' | '30d',
  accuracy?: number
): void {
  confidenceDriftTracker.recordConfidence(confidence, window, accuracy);
}

/**
 * Calculate drift metrics
 */
export function calculateConfidenceDrift(
  window: '24s' | '7d' | '30d'
): ConfidenceDriftMetrics | null {
  return confidenceDriftTracker.calculateDrift(window);
}

/**
 * Generate confidence overlay
 */
export function generateConfidenceOverlay(
  window: '24s' | '7d' | '30d',
  period: number = 30
): ConfidenceOverlay {
  return confidenceDriftTracker.generateOverlay(window, period);
}


