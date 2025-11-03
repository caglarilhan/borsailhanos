/**
 * P5.2: Meta-Cognition (AI's Self-Awareness)
 * Model "drift" (performans sapması) tespit ettiğinde kendi kendini uyarır
 * if (drift > 5%) notify("Model drift detected — retraining suggested.")
 */

export interface DriftMetrics {
  accuracy: number; // 0-1
  predictionError: number; // Average error
  confidenceDrift: number; // Change in confidence over time
  modelDrift: number; // Overall model drift (0-1)
  lastCheck: string;
}

export interface RetrainRecommendation {
  shouldRetrain: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  suggestedActions: string[];
  estimatedImprovement: number; // Expected improvement (0-1)
}

/**
 * Meta-Cognition System (AI's AI)
 */
export class MetaCognitionSystem {
  private driftHistory: DriftMetrics[] = [];
  private driftThreshold = 0.05; // 5% drift threshold
  private accuracyThreshold = 0.70; // 70% accuracy threshold
  private maxHistorySize = 100;

  /**
   * Check for model drift and recommend retraining
   */
  checkDrift(currentMetrics: DriftMetrics): RetrainRecommendation {
    // Add to history
    this.driftHistory.push(currentMetrics);
    if (this.driftHistory.length > this.maxHistorySize) {
      this.driftHistory.shift();
    }

    // Calculate drift indicators
    const recentDrift = this.calculateRecentDrift();
    const accuracyDecline = this.calculateAccuracyDecline();
    const confidenceDrift = Math.abs(currentMetrics.confidenceDrift);

    // Determine if retraining is needed
    let shouldRetrain = false;
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const reasons: string[] = [];
    const actions: string[] = [];

    // Check model drift threshold
    if (currentMetrics.modelDrift > this.driftThreshold) {
      shouldRetrain = true;
      if (currentMetrics.modelDrift > 0.15) {
        priority = 'critical';
      } else if (currentMetrics.modelDrift > 0.10) {
        priority = 'high';
      } else {
        priority = 'medium';
      }
      reasons.push(`Model drift %${(currentMetrics.modelDrift * 100).toFixed(1)} eşik değerini (%${(this.driftThreshold * 100)}) aştı`);
      actions.push('Model yeniden eğitimi öneriliyor');
    }

    // Check accuracy decline
    if (accuracyDecline > 0.05) {
      shouldRetrain = true;
      if (priority === 'low') priority = 'medium';
      reasons.push(`Doğruluk %${(accuracyDecline * 100).toFixed(1)} düştü`);
      actions.push('Yeni veri seti ile yeniden eğitim gerekli');
    }

    // Check accuracy below threshold
    if (currentMetrics.accuracy < this.accuracyThreshold) {
      shouldRetrain = true;
      priority = 'high';
      reasons.push(`Doğruluk %${(currentMetrics.accuracy * 100).toFixed(1)} eşik değerinin (%${(this.accuracyThreshold * 100)}) altında`);
      actions.push('Acil model güncellemesi gerekli');
    }

    // Check confidence drift
    if (confidenceDrift > 0.10) {
      shouldRetrain = true;
      if (priority === 'low') priority = 'medium';
      reasons.push(`Güven sapması %${(confidenceDrift * 100).toFixed(1)} - Model tutarsız`);
      actions.push('Kalibrasyon güncellemesi öneriliyor');
    }

    // Calculate estimated improvement
    const estimatedImprovement = shouldRetrain
      ? Math.min(0.15, currentMetrics.modelDrift * 0.5)
      : 0;

    return {
      shouldRetrain,
      priority,
      reason: reasons.join('; '),
      suggestedActions: actions,
      estimatedImprovement,
    };
  }

  /**
   * Calculate recent drift trend
   */
  private calculateRecentDrift(): number {
    if (this.driftHistory.length < 2) return 0;

    const recent = this.driftHistory.slice(-5); // Last 5 checks
    const oldest = recent[0];
    const newest = recent[recent.length - 1];

    return newest.modelDrift - oldest.modelDrift;
  }

  /**
   * Calculate accuracy decline
   */
  private calculateAccuracyDecline(): number {
    if (this.driftHistory.length < 2) return 0;

    const recent = this.driftHistory.slice(-10); // Last 10 checks
    const oldest = recent[0];
    const newest = recent[recent.length - 1];

    return oldest.accuracy - newest.accuracy; // Positive = decline
  }

  /**
   * Get drift history
   */
  getDriftHistory(): DriftMetrics[] {
    return [...this.driftHistory];
  }

  /**
   * Reset drift history
   */
  reset(): void {
    this.driftHistory = [];
  }
}

// Singleton instance
export const metaCognitionSystem = new MetaCognitionSystem();

/**
 * Check for drift and get retraining recommendation
 */
export function checkModelDrift(metrics: DriftMetrics): RetrainRecommendation {
  return metaCognitionSystem.checkDrift(metrics);
}

/**
 * Notify user about drift detection
 */
export function notifyDrift(recommendation: RetrainRecommendation): void {
  if (!recommendation.shouldRetrain) return;

  const message = `⚠️ Model Drift Tespit Edildi — Yeniden Eğitim Öneriliyor\n\n` +
    `Öncelik: ${recommendation.priority.toUpperCase()}\n` +
    `Neden: ${recommendation.reason}\n` +
    `Önerilen Aksiyonlar:\n${recommendation.suggestedActions.map(a => `  • ${a}`).join('\n')}\n` +
    `Tahmini İyileşme: %${(recommendation.estimatedImprovement * 100).toFixed(1)}`;

  console.warn(message);

  // In production, this would trigger a notification or alert
  if (typeof window !== 'undefined') {
    // Dispatch custom event for UI to handle
    window.dispatchEvent(new CustomEvent('model-drift-detected', {
      detail: recommendation,
    }));
  }
}


