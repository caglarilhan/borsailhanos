/**
 * P5.2: Realtime Confidence Overlay (Grafik Üzeri Güven Bandı)
 * Confidence %'i anlık olarak trendin arkasına "heat zone" şeklinde yansıt
 * Düşük güven alanları → sarı, yüksek güven → yeşil
 */

export interface ConfidenceDataPoint {
  timestamp: string;
  price: number;
  confidence: number; // 0-1
  volume?: number;
}

export interface ConfidenceOverlayData {
  timestamps: string[];
  prices: number[];
  confidence: number[];
  heatZones: Array<{
    start: number; // Index
    end: number; // Index
    minConfidence: number;
    maxConfidence: number;
    averageConfidence: number;
    color: string; // Hex color
    label: 'high' | 'medium' | 'low';
  }>;
  bands: {
    high: Array<{ timestamp: string; price: number }>; // Mean + 1σ
    low: Array<{ timestamp: string; price: number }>; // Mean - 1σ
  };
}

export interface ConfidenceColorMapping {
  high: string; // Green for high confidence
  medium: string; // Yellow for medium confidence
  low: string; // Red for low confidence
}

/**
 * Realtime Confidence Overlay Generator
 */
export class RealtimeConfidenceOverlay {
  private colorMapping: ConfidenceColorMapping = {
    high: '#10b981', // Emerald-500
    medium: '#eab308', // Yellow-500
    low: '#ef4444', // Red-500
  };

  /**
   * Generate confidence overlay data for chart
   */
  generateOverlay(
    dataPoints: ConfidenceDataPoint[],
    window: number = 30
  ): ConfidenceOverlayData {
    if (dataPoints.length === 0) {
      return {
        timestamps: [],
        prices: [],
        confidence: [],
        heatZones: [],
        bands: {
          high: [],
          low: [],
        },
      };
    }

    // Sort by timestamp
    const sorted = [...dataPoints].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Extract arrays
    const timestamps = sorted.map((d) => d.timestamp);
    const prices = sorted.map((d) => d.price);
    const confidence = sorted.map((d) => d.confidence);

    // Calculate heat zones
    const heatZones = this.calculateHeatZones(sorted, window);

    // Calculate confidence bands
    const bands = this.calculateConfidenceBands(sorted);

    return {
      timestamps,
      prices,
      confidence,
      heatZones,
      bands,
    };
  }

  /**
   * Calculate heat zones (continuous areas of similar confidence)
   */
  private calculateHeatZones(
    dataPoints: ConfidenceDataPoint[],
    window: number
  ): Array<{
    start: number;
    end: number;
    minConfidence: number;
    maxConfidence: number;
    averageConfidence: number;
    color: string;
    label: 'high' | 'medium' | 'low';
  }> {
    const zones: Array<{
      start: number;
      end: number;
      minConfidence: number;
      maxConfidence: number;
      averageConfidence: number;
      color: string;
      label: 'high' | 'medium' | 'low';
    }> = [];

    let currentZone: {
      start: number;
      end: number;
      confidences: number[];
    } | null = null;

    dataPoints.forEach((point, index) => {
      const conf = point.confidence;
      const label = this.getConfidenceLabel(conf);

      // Check if we should extend current zone or start new one
      if (currentZone === null) {
        // Start new zone
        currentZone = {
          start: index,
          end: index,
          confidences: [conf],
        };
      } else {
        // Check if confidence level is similar (within 0.1)
        const currentLabel = this.getConfidenceLabel(
          currentZone.confidences.reduce((a, b) => a + b, 0) / currentZone.confidences.length
        );

        if (label === currentLabel && Math.abs(conf - currentZone.confidences[0]) < 0.1) {
          // Extend current zone
          currentZone.end = index;
          currentZone.confidences.push(conf);
        } else {
          // Finalize current zone and start new one
          const avgConf = currentZone.confidences.reduce((a, b) => a + b, 0) / currentZone.confidences.length;
          zones.push({
            start: currentZone.start,
            end: currentZone.end,
            minConfidence: Math.min(...currentZone.confidences),
            maxConfidence: Math.max(...currentZone.confidences),
            averageConfidence: avgConf,
            color: this.colorMapping[this.getConfidenceLabel(avgConf)],
            label: this.getConfidenceLabel(avgConf),
          });

          // Start new zone
          currentZone = {
            start: index,
            end: index,
            confidences: [conf],
          };
        }
      }
    });

    // Finalize last zone
    if (currentZone !== null) {
      const avgConf = currentZone.confidences.reduce((a, b) => a + b, 0) / currentZone.confidences.length;
      zones.push({
        start: currentZone.start,
        end: currentZone.end,
        minConfidence: Math.min(...currentZone.confidences),
        maxConfidence: Math.max(...currentZone.confidences),
        averageConfidence: avgConf,
        color: this.colorMapping[this.getConfidenceLabel(avgConf)],
        label: this.getConfidenceLabel(avgConf),
      });
    }

    return zones;
  }

  /**
   * Get confidence label
   */
  private getConfidenceLabel(confidence: number): 'high' | 'medium' | 'low' {
    if (confidence >= 0.7) return 'high';
    if (confidence >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Calculate confidence bands (price ± 1σ based on confidence)
   */
  private calculateConfidenceBands(
    dataPoints: ConfidenceDataPoint[]
  ): {
    high: Array<{ timestamp: string; price: number }>;
    low: Array<{ timestamp: string; price: number }>;
  } {
    const bands: {
      high: Array<{ timestamp: string; price: number }>;
      low: Array<{ timestamp: string; price: number }>;
    } = {
      high: [],
      low: [],
    };

    // Calculate mean price and std
    const prices = dataPoints.map((d) => d.price);
    const meanPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - meanPrice, 2), 0) / prices.length;
    const stdPrice = Math.sqrt(variance);

    dataPoints.forEach((point) => {
      // Adjust band width based on confidence
      // Low confidence = wider band, high confidence = narrower band
      const confidenceMultiplier = 1 - point.confidence; // Inverse: low conf = high multiplier
      const bandWidth = stdPrice * confidenceMultiplier * 2; // 2σ for low confidence, 0σ for high

      bands.high.push({
        timestamp: point.timestamp,
        price: point.price + bandWidth,
      });

      bands.low.push({
        timestamp: point.timestamp,
        price: point.price - bandWidth,
      });
    });

    return bands;
  }

  /**
   * Get color for confidence level
   */
  getColor(confidence: number): string {
    const label = this.getConfidenceLabel(confidence);
    return this.colorMapping[label];
  }

  /**
   * Get opacity for confidence level (for heat zone rendering)
   */
  getOpacity(confidence: number): number {
    // Higher confidence = higher opacity
    return Math.max(0.2, Math.min(0.8, confidence));
  }
}

// Singleton instance
export const realtimeConfidenceOverlay = new RealtimeConfidenceOverlay();

/**
 * Generate confidence overlay
 */
export function generateConfidenceOverlay(
  dataPoints: ConfidenceDataPoint[],
  window: number = 30
): ConfidenceOverlayData {
  return realtimeConfidenceOverlay.generateOverlay(dataPoints, window);
}

/**
 * Get color for confidence
 */
export function getConfidenceColor(confidence: number): string {
  return realtimeConfidenceOverlay.getColor(confidence);
}

/**
 * Get opacity for confidence
 */
export function getConfidenceOpacity(confidence: number): number {
  return realtimeConfidenceOverlay.getOpacity(confidence);
}


