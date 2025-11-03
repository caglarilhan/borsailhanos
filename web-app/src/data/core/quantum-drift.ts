/**
 * P5.2: Quantum Drift Prototype (v5.8 Hedefi)
 * Model "olası piyasa kırılmalarını" sezgisel olarak algılayacak
 * "Piyasa davranışı normal dağılımdan %4.3 saptı — dikkatli ol."
 */

export interface MarketDistribution {
  prices: number[];
  volumes: number[];
  returns: number[];
  mean: number;
  std: number;
  skewness: number;
  kurtosis: number;
}

export interface DriftAnomaly {
  type: 'volatility_spike' | 'volume_anomaly' | 'price_jump' | 'correlation_break' | 'regime_shift';
  severity: 'low' | 'medium' | 'high' | 'critical';
  deviation: number; // Percentage deviation from normal
  timestamp: string;
  description: string;
  confidence: number; // 0-1
  suggestedAction?: string;
}

export interface QuantumDriftSignal {
  anomalies: DriftAnomaly[];
  overallDeviation: number; // Overall market deviation from normal (0-1)
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  alert: string;
  timestamp: string;
}

/**
 * Quantum Drift Predictor
 * Detects market behavior anomalies using statistical methods
 */
export class QuantumDriftPredictor {
  private historyWindow = 30; // Days
  private zScoreThreshold = 2.5; // Standard deviations
  private isolationForest: any; // Would use sklearn IsolationForest in production

  /**
   * Analyze market distribution for anomalies
   */
  analyzeMarketDrift(
    recentData: {
      prices: number[];
      volumes: number[];
      returns: number[];
    }
  ): QuantumDriftSignal {
    // Calculate distribution statistics
    const distribution = this.calculateDistribution(recentData);

    // Detect anomalies
    const anomalies: DriftAnomaly[] = [];

    // Volatility spike
    const volAnomaly = this.detectVolatilityAnomaly(distribution, recentData);
    if (volAnomaly) anomalies.push(volAnomaly);

    // Volume anomaly
    const volumeAnomaly = this.detectVolumeAnomaly(distribution, recentData);
    if (volumeAnomaly) anomalies.push(volumeAnomaly);

    // Price jump
    const priceAnomaly = this.detectPriceJump(distribution, recentData);
    if (priceAnomaly) anomalies.push(priceAnomaly);

    // Correlation break (if multiple symbols)
    const correlationAnomaly = this.detectCorrelationBreak(recentData);
    if (correlationAnomaly) anomalies.push(correlationAnomaly);

    // Calculate overall deviation
    const overallDeviation = this.calculateOverallDeviation(distribution, anomalies);

    // Determine risk level
    const riskLevel = this.determineRiskLevel(overallDeviation, anomalies);

    // Generate alert
    const alert = this.generateAlert(overallDeviation, anomalies, riskLevel);

    return {
      anomalies,
      overallDeviation,
      riskLevel,
      alert,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Calculate distribution statistics
   */
  private calculateDistribution(data: {
    prices: number[];
    volumes: number[];
    returns: number[];
  }): MarketDistribution {
    const returns = data.returns;

    // Mean
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;

    // Standard deviation
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const std = Math.sqrt(variance);

    // Skewness (measure of asymmetry)
    const skewness = returns.reduce((sum, r) => {
      return sum + Math.pow((r - mean) / std, 3);
    }, 0) / returns.length;

    // Kurtosis (measure of tail heaviness)
    const kurtosis = returns.reduce((sum, r) => {
      return sum + Math.pow((r - mean) / std, 4);
    }, 0) / returns.length - 3; // Excess kurtosis

    return {
      prices: data.prices,
      volumes: data.volumes,
      returns,
      mean,
      std,
      skewness,
      kurtosis,
    };
  }

  /**
   * Detect volatility spike anomaly
   */
  private detectVolatilityAnomaly(
    distribution: MarketDistribution,
    recentData: { returns: number[] }
  ): DriftAnomaly | null {
    // Calculate recent volatility
    const recentReturns = recentData.returns.slice(-5); // Last 5 days
    const recentStd = Math.sqrt(
      recentReturns.reduce((sum, r) => sum + Math.pow(r - distribution.mean, 2), 0) / recentReturns.length
    );

    // Z-score: (recent_std - mean_std) / std_of_stds
    const zScore = (recentStd - distribution.std) / (distribution.std * 0.1); // Approximate std of stds

    if (Math.abs(zScore) > this.zScoreThreshold) {
      const deviation = Math.abs(zScore - this.zScoreThreshold);
      
      let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (deviation > 3) severity = 'critical';
      else if (deviation > 2) severity = 'high';
      else if (deviation > 1) severity = 'medium';

      return {
        type: 'volatility_spike',
        severity,
        deviation: deviation * 10, // Convert to percentage
        timestamp: new Date().toISOString(),
        description: `Volatilite normalden %${(deviation * 10).toFixed(1)} saptı (Z-score: ${zScore.toFixed(2)})`,
        confidence: Math.min(1, Math.abs(zScore) / 4), // Higher z-score = higher confidence
        suggestedAction: severity === 'critical' ? 'Pozisyonları azalt, volatilite azalana kadar bekle' : undefined,
      };
    }

    return null;
  }

  /**
   * Detect volume anomaly
   */
  private detectVolumeAnomaly(
    distribution: MarketDistribution,
    recentData: { volumes: number[] }
  ): DriftAnomaly | null {
    const recentVolumes = recentData.volumes.slice(-5);
    const meanVolume = distribution.volumes.reduce((a, b) => a + b, 0) / distribution.volumes.length;
    const recentMean = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;

    const deviation = ((recentMean - meanVolume) / meanVolume) * 100;

    if (Math.abs(deviation) > 50) { // 50% deviation threshold
      const severity = Math.abs(deviation) > 100 ? 'critical' : Math.abs(deviation) > 75 ? 'high' : 'medium';

      return {
        type: 'volume_anomaly',
        severity,
        deviation: Math.abs(deviation),
        timestamp: new Date().toISOString(),
        description: `Hacim normalden %${Math.abs(deviation).toFixed(1)} ${deviation > 0 ? 'yüksek' : 'düşük'}`,
        confidence: Math.min(1, Math.abs(deviation) / 150),
        suggestedAction: deviation > 100 ? 'Yüksek hacim: Fırsat veya risk, dikkatli ol' : undefined,
      };
    }

    return null;
  }

  /**
   * Detect price jump
   */
  private detectPriceJump(
    distribution: MarketDistribution,
    recentData: { prices: number[] }
  ): DriftAnomaly | null {
    const recentPrices = recentData.prices.slice(-2); // Last 2 prices
    if (recentPrices.length < 2) return null;

    const priceChange = (recentPrices[1] - recentPrices[0]) / recentPrices[0];
    const zScore = priceChange / distribution.std;

    if (Math.abs(zScore) > this.zScoreThreshold) {
      const deviation = Math.abs(zScore - this.zScoreThreshold) * distribution.std * 100;
      
      const severity = deviation > 10 ? 'critical' : deviation > 7 ? 'high' : deviation > 5 ? 'medium' : 'low';

      return {
        type: 'price_jump',
        severity,
        deviation,
        timestamp: new Date().toISOString(),
        description: `Fiyat normalden %${deviation.toFixed(1)} ${priceChange > 0 ? 'yükseldi' : 'düştü'} (Z-score: ${zScore.toFixed(2)})`,
        confidence: Math.min(1, Math.abs(zScore) / 4),
        suggestedAction: severity === 'critical' ? 'Büyük fiyat hareketi: Stop-loss kontrol et, pozisyon boyutunu gözden geçir' : undefined,
      };
    }

    return null;
  }

  /**
   * Detect correlation break
   */
  private detectCorrelationBreak(
    recentData: { prices: number[]; returns: number[] }
  ): DriftAnomaly | null {
    // In production, this would compare correlation matrix before/after
    // For now, detect if returns are diverging from expected pattern
    const returns = recentData.returns;
    if (returns.length < 10) return null;

    // Calculate rolling correlation (simplified)
    const recentReturns = returns.slice(-5);
    const previousReturns = returns.slice(-10, -5);

    const recentVolatility = Math.sqrt(
      recentReturns.reduce((sum, r) => sum + r * r, 0) / recentReturns.length
    );
    const previousVolatility = Math.sqrt(
      previousReturns.reduce((sum, r) => sum + r * r, 0) / previousReturns.length
    );

    const volatilityChange = Math.abs((recentVolatility - previousVolatility) / previousVolatility);

    if (volatilityChange > 0.5) { // 50% change
      const severity = volatilityChange > 1 ? 'critical' : volatilityChange > 0.75 ? 'high' : 'medium';

      return {
        type: 'correlation_break',
        severity,
        deviation: volatilityChange * 100,
        timestamp: new Date().toISOString(),
        description: `Korelasyon kırıldı: Volatilite %${(volatilityChange * 100).toFixed(1)} değişti`,
        confidence: Math.min(1, volatilityChange / 1.5),
        suggestedAction: severity === 'critical' ? 'Piyasa yapısı değişti: Stratejini gözden geçir' : undefined,
      };
    }

    return null;
  }

  /**
   * Calculate overall deviation
   */
  private calculateOverallDeviation(
    distribution: MarketDistribution,
    anomalies: DriftAnomaly[]
  ): number {
    if (anomalies.length === 0) return 0;

    // Weight anomalies by severity and combine
    const severityWeights: Record<string, number> = {
      critical: 1.0,
      high: 0.7,
      medium: 0.4,
      low: 0.2,
    };

    const weightedDeviation = anomalies.reduce((sum, a) => {
      return sum + (a.deviation * severityWeights[a.severity] * a.confidence);
    }, 0);

    // Normalize to 0-1
    return Math.min(1, weightedDeviation / 100);
  }

  /**
   * Determine risk level
   */
  private determineRiskLevel(
    overallDeviation: number,
    anomalies: DriftAnomaly[]
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (anomalies.some((a) => a.severity === 'critical')) {
      return 'critical';
    } else if (overallDeviation > 0.5 || anomalies.some((a) => a.severity === 'high')) {
      return 'high';
    } else if (overallDeviation > 0.2 || anomalies.some((a) => a.severity === 'medium')) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Generate alert message
   */
  private generateAlert(
    overallDeviation: number,
    anomalies: DriftAnomaly[],
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
  ): string {
    if (anomalies.length === 0) {
      return 'Piyasa davranışı normal seviyede';
    }

    const topAnomaly = anomalies.sort((a, b) => 
      (b.deviation * b.confidence) - (a.deviation * a.confidence)
    )[0];

    if (riskLevel === 'critical') {
      return `🚨 Piyasa davranışı normal dağılımdan %${(overallDeviation * 100).toFixed(1)} saptı — dikkatli ol. ${topAnomaly.description}`;
    } else if (riskLevel === 'high') {
      return `⚠️ Piyasa davranışı normalden %${(overallDeviation * 100).toFixed(1)} saptı. ${topAnomaly.description}`;
    } else {
      return `ℹ️ Piyasa davranışı hafif sapma gösteriyor (%${(overallDeviation * 100).toFixed(1)}). ${topAnomaly.description}`;
    }
  }
}

// Singleton instance
export const quantumDriftPredictor = new QuantumDriftPredictor();

/**
 * Analyze market drift for anomalies
 */
export function analyzeMarketDrift(recentData: {
  prices: number[];
  volumes: number[];
  returns: number[];
}): QuantumDriftSignal {
  return quantumDriftPredictor.analyzeMarketDrift(recentData);
}


