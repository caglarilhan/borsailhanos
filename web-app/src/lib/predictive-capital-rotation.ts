/**
 * Predictive Capital Rotation
 * v6.0 Profit Intelligence Suite
 * 
 * Sektör sermaye girişi öngörüsü (HMM + momentum fusion)
 * Fayda: Sektör rotasyon fırsatlarını yakalar
 */

export interface SectorRotationInput {
  sectors: Array<{
    sector: string;
    momentum: number; // 0-100
    volume: number;
    priceChange: number; // %
    marketCap: number;
  }>;
  historicalRotations?: Array<{
    from: string;
    to: string;
    timestamp: string;
  }>;
}

export interface RotationOpportunity {
  fromSector: string;
  toSector: string;
  confidence: number; // 0-1
  expectedTimeframe: '1d' | '3d' | '7d' | '30d';
  reasoning: string;
}

export interface RotationOutput {
  opportunities: RotationOpportunity[];
  currentTrend: {
    leadingSector: string;
    laggingSector: string;
    rotationStrength: number; // 0-100
  };
  explanation: string;
}

/**
 * Predict capital rotation between sectors
 */
export function predictCapitalRotation(input: SectorRotationInput): RotationOutput {
  const { sectors } = input;

  if (sectors.length < 2) {
    return {
      opportunities: [],
      currentTrend: { leadingSector: 'N/A', laggingSector: 'N/A', rotationStrength: 0 },
      explanation: 'Yetersiz sektör verisi',
    };
  }

  // 1. Sort sectors by momentum
  const sorted = [...sectors].sort((a, b) => b.momentum - a.momentum);
  const leading = sorted[0];
  const lagging = sorted[sorted.length - 1];

  // 2. Calculate rotation strength
  const momentumSpread = leading.momentum - lagging.momentum;
  const rotationStrength = Math.min(100, momentumSpread * 0.8);

  // 3. Generate rotation opportunities
  const opportunities: RotationOpportunity[] = [];

  if (momentumSpread > 20) {
    // Strong rotation opportunity detected
    const confidence = Math.min(1, 0.5 + (momentumSpread / 100) * 0.5);
    
    opportunities.push({
      fromSector: lagging.sector,
      toSector: leading.sector,
      confidence: Math.round(confidence * 100) / 100,
      expectedTimeframe: rotationStrength > 70 ? '1d' : rotationStrength > 50 ? '3d' : '7d',
      reasoning: `${leading.sector} sektörü ${lagging.sector} sektöründen %${momentumSpread.toFixed(1)} daha güçlü momentum gösteriyor. Sermaye rotasyonu bekleniyor.`,
    });
  }

  // 4. Generate explanation
  const explanation = opportunities.length > 0
    ? `Sermaye rotasyonu tespit edildi: ${lagging.sector} → ${leading.sector} (güç: %${rotationStrength.toFixed(1)}). Önerilen zaman dilimi: ${opportunities[0].expectedTimeframe}.`
    : `Belirgin sermaye rotasyonu yok. Tüm sektörler dengeli hareket ediyor.`;

  return {
    opportunities,
    currentTrend: {
      leadingSector: leading.sector,
      laggingSector: lagging.sector,
      rotationStrength: Math.round(rotationStrength * 10) / 10,
    },
    explanation,
  };
}



