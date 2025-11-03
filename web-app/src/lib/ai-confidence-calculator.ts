/**
 * P5.2: AI Confidence Calculator
 * Ortalama sinyal confidence'tan dinamik AI güven göstergesi hesapla
 */

export interface SignalConfidence {
  symbol: string;
  confidence: number; // 0-1 scale
  timestamp?: string;
}

/**
 * Calculate average AI confidence from signals
 */
export function calculateAverageAIConfidence(signals: SignalConfidence[]): number {
  if (signals.length === 0) return 0.87; // Default fallback

  const total = signals.reduce((sum, s) => sum + (s.confidence || 0), 0);
  const average = total / signals.length;
  
  // Clamp to 0-1 range
  return Math.max(0, Math.min(1, average));
}

/**
 * Get AI confidence level (text label)
 */
export function getAIConfidenceLevel(confidence: number): { level: string; color: string; description: string } {
  const confidencePct = confidence * 100;

  if (confidencePct >= 85) {
    return {
      level: 'Yüksek',
      color: 'text-emerald-600',
      description: 'AI güven seviyesi yüksek. Sinyaller güvenilir.',
    };
  } else if (confidencePct >= 70) {
    return {
      level: 'Orta',
      color: 'text-amber-600',
      description: 'AI güven seviyesi orta. Sinyaller dikkatle değerlendirilmeli.',
    };
  } else {
    return {
      level: 'Düşük',
      color: 'text-red-600',
      description: 'AI güven seviyesi düşük. Sinyaller riskli olabilir.',
    };
  }
}

/**
 * Calculate confidence trend (7-day drift)
 */
export function calculateConfidenceTrend(confidenceHistory: number[]): { 
  trend: 'up' | 'down' | 'stable'; 
  change: number; 
  changePercent: number;
} {
  if (confidenceHistory.length < 2) {
    return { trend: 'stable', change: 0, changePercent: 0 };
  }

  const first = confidenceHistory[0];
  const last = confidenceHistory[confidenceHistory.length - 1];
  const change = last - first;
  const changePercent = first !== 0 ? (change / first) * 100 : 0;

  if (Math.abs(changePercent) < 1) {
    return { trend: 'stable', change, changePercent };
  }

  return {
    trend: change > 0 ? 'up' : 'down',
    change,
    changePercent,
  };
}


