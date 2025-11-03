/**
 * P5.2: Sector Momentum Rotation Analysis
 * AI, sektörler arası "momentum rotasyonu" hesaplasın
 * "Teknolojiden enerjiye para akışı başladı (%+3,1)."
 */

export interface Sector {
  name: string;
  symbols: string[]; // Symbols in this sector
  momentum: number; // -1 to +1
  volumeChange: number; // Percentage change
  priceChange: number; // Percentage change
  marketCap: number;
  previousMomentum?: number;
}

export interface MomentumRotation {
  from: Sector;
  to: Sector;
  rotationStrength: number; // 0-1
  rotationPercentage: number; // Percentage of capital rotating
  direction: 'inflow' | 'outflow';
  timestamp: string;
  description: string;
}

export interface SectorClusterInsight {
  sectors: Sector[];
  rotations: MomentumRotation[];
  dominantTrend: {
    strongestSector: Sector;
    weakestSector: Sector;
    trend: 'sector_rotation' | 'broad_rally' | 'broad_selloff' | 'mixed';
  };
  recommendation: string;
  timestamp: string;
}

/**
 * Sector Momentum Analyzer
 */
export class SectorMomentumAnalyzer {
  /**
   * Calculate sector momentum from symbol data
   */
  calculateSectorMomentum(
    sectors: Sector[],
    correlationMatrix: Map<string, Map<string, number>> // symbol -> symbol -> correlation
  ): SectorClusterInsight {
    // Calculate momentum for each sector
    const updatedSectors = sectors.map((sector) => {
      const momentum = this.calculateSectorMomentumValue(sector);
      return {
        ...sector,
        momentum,
      };
    });

    // Find momentum rotations
    const rotations = this.detectMomentumRotations(updatedSectors);

    // Determine dominant trend
    const dominantTrend = this.determineDominantTrend(updatedSectors);

    // Generate recommendation
    const recommendation = this.generateRecommendation(dominantTrend, rotations);

    return {
      sectors: updatedSectors,
      rotations,
      dominantTrend,
      recommendation,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Calculate momentum value for a sector
   */
  private calculateSectorMomentumValue(sector: Sector): number {
    // Combine price change, volume change, and market cap
    const priceWeight = 0.5;
    const volumeWeight = 0.3;
    const marketCapWeight = 0.2;

    const normalizedPriceChange = Math.max(-1, Math.min(1, sector.priceChange / 10)); // Normalize to -1 to +1
    const normalizedVolumeChange = Math.max(-1, Math.min(1, sector.volumeChange / 50)); // Normalize to -1 to +1
    const normalizedMarketCap = Math.log10(sector.marketCap || 1) / 12; // Normalize using log

    const momentum = 
      (normalizedPriceChange * priceWeight) +
      (normalizedVolumeChange * volumeWeight) +
      (normalizedMarketCap * marketCapWeight);

    return Math.max(-1, Math.min(1, momentum));
  }

  /**
   * Detect momentum rotations between sectors
   */
  private detectMomentumRotations(sectors: Sector[]): MomentumRotation[] {
    const rotations: MomentumRotation[] = [];

    // Compare sectors pairwise
    for (let i = 0; i < sectors.length; i++) {
      for (let j = i + 1; j < sectors.length; j++) {
        const sectorA = sectors[i];
        const sectorB = sectors[j];

        // Check if momentum shifted from A to B
        const momentumShift = sectorB.momentum - sectorA.momentum;
        
        if (Math.abs(momentumShift) > 0.2) { // Significant shift
          const rotationStrength = Math.abs(momentumShift);
          const rotationPercentage = Math.abs(momentumShift) * 100;

          const direction = momentumShift > 0 ? 'inflow' : 'outflow';
          const from = momentumShift > 0 ? sectorA : sectorB;
          const to = momentumShift > 0 ? sectorB : sectorA;

          rotations.push({
            from,
            to,
            rotationStrength,
            rotationPercentage,
            direction,
            timestamp: new Date().toISOString(),
            description: this.generateRotationDescription(from, to, rotationPercentage, direction),
          });
        }
      }
    }

    // Sort by rotation strength (strongest first)
    return rotations.sort((a, b) => b.rotationStrength - a.rotationStrength);
  }

  /**
   * Generate rotation description
   */
  private generateRotationDescription(
    from: Sector,
    to: Sector,
    percentage: number,
    direction: 'inflow' | 'outflow'
  ): string {
    if (direction === 'inflow') {
      return `${from.name} sektöründen ${to.name} sektörüne para akışı başladı (%+${percentage.toFixed(1)}).`;
    } else {
      return `${from.name} sektöründen ${to.name} sektörüne para çıkışı var (%${percentage.toFixed(1)}).`;
    }
  }

  /**
   * Determine dominant trend
   */
  private determineDominantTrend(sectors: Sector[]): {
    strongestSector: Sector;
    weakestSector: Sector;
    trend: 'sector_rotation' | 'broad_rally' | 'broad_selloff' | 'mixed';
  } {
    // Find strongest and weakest sectors
    const sorted = [...sectors].sort((a, b) => b.momentum - a.momentum);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];

    // Determine trend
    const positiveCount = sectors.filter((s) => s.momentum > 0.1).length;
    const negativeCount = sectors.filter((s) => s.momentum < -0.1).length;
    const total = sectors.length;

    let trend: 'sector_rotation' | 'broad_rally' | 'broad_selloff' | 'mixed' = 'mixed';
    
    if (positiveCount / total > 0.7) {
      trend = 'broad_rally';
    } else if (negativeCount / total > 0.7) {
      trend = 'broad_selloff';
    } else if (Math.abs(strongest.momentum - weakest.momentum) > 0.5) {
      trend = 'sector_rotation';
    }

    return {
      strongestSector: strongest,
      weakestSector: weakest,
      trend,
    };
  }

  /**
   * Generate recommendation based on trend
   */
  private generateRecommendation(
    dominantTrend: {
      strongestSector: Sector;
      weakestSector: Sector;
      trend: 'sector_rotation' | 'broad_rally' | 'broad_selloff' | 'mixed';
    },
    rotations: MomentumRotation[]
  ): string {
    const { strongestSector, weakestSector, trend } = dominantTrend;

    if (trend === 'sector_rotation' && rotations.length > 0) {
      const topRotation = rotations[0];
      return `${topRotation.description} ${topRotation.to.name} sektöründe fırsat oluşabilir.`;
    } else if (trend === 'broad_rally') {
      return `Geniş tabanlı yükseliş: Tüm sektörler pozitif momentum gösteriyor. ${strongestSector.name} sektörü lider.`;
    } else if (trend === 'broad_selloff') {
      return `Geniş tabanlı düşüş: Tüm sektörler negatif momentum gösteriyor. ${weakestSector.name} sektörü en zayıf. Defansif pozisyona geç.`;
    } else {
      return `Karışık trend: Sektörler arası rotasyon var. ${strongestSector.name} güçlü, ${weakestSector.name} zayıf.`;
    }
  }
}

// Singleton instance
export const sectorMomentumAnalyzer = new SectorMomentumAnalyzer();

/**
 * Analyze sector momentum and rotations
 */
export function analyzeSectorMomentum(
  sectors: Sector[],
  correlationMatrix: Map<string, Map<string, number>>
): SectorClusterInsight {
  return sectorMomentumAnalyzer.calculateSectorMomentum(sectors, correlationMatrix);
}


