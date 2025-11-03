/**
 * P5.2: AI Drift Monitor 2.0
 * Model Sağlığı Gösterge Paneli - Model drift ölçümü (Δ accuracy / 24h)
 */

export interface DriftMetrics {
  accuracy: number; // Current accuracy (0-1)
  previousAccuracy: number; // Accuracy 24h ago
  accuracyDrift: number; // Δ accuracy / 24h
  predictionError: number; // Average prediction error
  confidenceDrift: number; // Change in confidence over time
  modelDrift: number; // Overall model drift (0-1)
  timestamp: string;
}

export interface ModelHealthStatus {
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  score: number; // 0-100 health score
  driftLevel: 'low' | 'medium' | 'high' | 'critical';
  alerts: string[];
  recommendations: string[];
  lastRetrain?: string; // ISO timestamp
  nextRetrainSuggested?: string; // ISO timestamp
}

export interface DriftHistoryEntry {
  timestamp: string;
  accuracy: number;
  drift: number;
  status: 'healthy' | 'warning' | 'critical';
}

/**
 * AI Drift Monitor 2.0
 */
export class DriftMonitor2 {
  private driftThreshold = 0.03; // 3% drift threshold
  private accuracyThreshold = 0.70; // 70% accuracy threshold
  private history: DriftHistoryEntry[] = [];
  private maxHistorySize = 1000;

  /**
   * Monitor model drift
   */
  monitorDrift(metrics: DriftMetrics): ModelHealthStatus {
    const { accuracy, accuracyDrift, modelDrift, timestamp } = metrics;
    
    // Calculate health score (0-100)
    const accuracyScore = Math.max(0, Math.min(100, accuracy * 100));
    const driftScore = Math.max(0, Math.min(100, (1 - Math.abs(modelDrift)) * 100));
    const healthScore = (accuracyScore * 0.6) + (driftScore * 0.4);

    // Determine drift level
    let driftLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (Math.abs(modelDrift) > 0.15) {
      driftLevel = 'critical';
    } else if (Math.abs(modelDrift) > 0.10) {
      driftLevel = 'high';
    } else if (Math.abs(modelDrift) > 0.05) {
      driftLevel = 'medium';
    }

    // Determine status
    let status: 'healthy' | 'warning' | 'critical' | 'unknown' = 'healthy';
    const alerts: string[] = [];
    const recommendations: string[] = [];

    // Accuracy check
    if (accuracy < this.accuracyThreshold) {
      status = 'critical';
      alerts.push(`⚠️ Model doğruluğu %${(accuracy * 100).toFixed(1)} eşik değerinin (%${(this.accuracyThreshold * 100)}) altında`);
      recommendations.push('Acil model güncellemesi gerekli');
      recommendations.push('Yeni veri seti ile yeniden eğitim yapın');
    } else if (accuracy < this.accuracyThreshold + 0.05) {
      status = 'warning';
      alerts.push(`⚠️ Model doğruluğu düşük (%${(accuracy * 100).toFixed(1)})`);
      recommendations.push('Model performansını izleyin');
    }

    // Drift check: if (drift > 3%) → red alert
    if (Math.abs(accuracyDrift) > this.driftThreshold) {
      if (status === 'healthy') status = 'warning';
      if (Math.abs(accuracyDrift) > 0.10) status = 'critical';
      
      alerts.push(`⚠️ Model tutarlılığı düştü (Δ accuracy: %${(accuracyDrift * 100).toFixed(1)} / 24h)`);
      recommendations.push('Yeniden kalibrasyon önerilir');
      
      if (Math.abs(accuracyDrift) > 0.10) {
        alerts.push(`🚨 Kritik: Model drift %${(Math.abs(accuracyDrift) * 100).toFixed(1)} / 24h`);
        recommendations.push('Acil model yeniden eğitimi gerekli');
      }
    }

    // Add to history
    this.addToHistory({
      timestamp,
      accuracy,
      drift: modelDrift,
      status,
    });

    // Calculate next retrain suggestion
    const nextRetrainSuggested = this.calculateNextRetrain(metrics);

    return {
      status,
      score: Math.round(healthScore),
      driftLevel,
      alerts,
      recommendations,
      nextRetrainSuggested,
    };
  }

  /**
   * Add entry to drift history
   */
  private addToHistory(entry: DriftHistoryEntry): void {
    this.history.push(entry);
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Calculate next retrain suggestion
   */
  private calculateNextRetrain(metrics: DriftMetrics): string | undefined {
    const { accuracyDrift, modelDrift } = metrics;
    
    // If drift is significant, suggest immediate retrain
    if (Math.abs(modelDrift) > 0.10 || Math.abs(accuracyDrift) > 0.10) {
      return new Date().toISOString(); // Immediate
    }

    // If drift is moderate, suggest retrain in 1 week
    if (Math.abs(modelDrift) > 0.05 || Math.abs(accuracyDrift) > 0.05) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek.toISOString();
    }

    // If healthy, suggest retrain in 1 month
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString();
  }

  /**
   * Get drift history
   */
  getDriftHistory(days: number = 7): DriftHistoryEntry[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return this.history.filter((entry) => 
      new Date(entry.timestamp) >= cutoff
    );
  }

  /**
   * Get drift trend
   */
  getDriftTrend(): {
    trend: 'improving' | 'worsening' | 'stable';
    rate: number; // Drift change rate
  } {
    if (this.history.length < 2) {
      return { trend: 'stable', rate: 0 };
    }

    const recent = this.history.slice(-10); // Last 10 entries
    const oldest = recent[0];
    const newest = recent[recent.length - 1];

    const driftChange = newest.drift - oldest.drift;

    if (Math.abs(driftChange) < 0.01) {
      return { trend: 'stable', rate: driftChange };
    } else if (driftChange < 0) {
      return { trend: 'improving', rate: driftChange }; // Drift decreasing = improving
    } else {
      return { trend: 'worsening', rate: driftChange };
    }
  }

  /**
   * Get benchmark comparison
   */
  getBenchmarkComparison(currentAccuracy: number): {
    benchmark: number;
    deviation: number;
    status: 'above' | 'below' | 'at';
  } {
    const benchmark = 0.80; // 80% benchmark
    const deviation = currentAccuracy - benchmark;

    return {
      benchmark,
      deviation,
      status: deviation > 0.01 ? 'above' : deviation < -0.01 ? 'below' : 'at',
    };
  }
}

// Singleton instance
export const driftMonitor2 = new DriftMonitor2();

/**
 * Monitor model drift
 */
export function monitorModelDrift(metrics: DriftMetrics): ModelHealthStatus {
  return driftMonitor2.monitorDrift(metrics);
}

/**
 * Get drift history
 */
export function getDriftHistory(days: number = 7): DriftHistoryEntry[] {
  return driftMonitor2.getDriftHistory(days);
}


