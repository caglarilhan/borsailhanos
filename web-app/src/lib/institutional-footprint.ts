/**
 * Institutional Footprint AI
 * v6.0 Profit Intelligence Suite
 * 
 * Hacim + zaman + fiyat pattern'lerinden büyük fon izlerini tespit eder
 * Fayda: "Borsa köpekbalıklarının" girdiği yeri gösterir
 */

export interface InstitutionalInput {
  symbol: string;
  prices: number[]; // Last 30 days
  volumes: number[]; // Last 30 days
  timestamps: string[];
  averageVolume: number; // 30-day average
}

export interface InstitutionalFootprint {
  symbol: string;
  hasInstitutionalActivity: boolean;
  activityStrength: number; // 0-100
  activityType: 'BUYING' | 'SELLING' | 'ACCUMULATING' | 'DISTRIBUTING' | 'NONE';
  confidence: number; // 0-1
  explanation: string;
  recommendedAction: 'BUY' | 'SELL' | 'WAIT';
}

/**
 * Detect institutional footprint
 * 
 * Pattern indicators:
 * 1. Large volume spikes (> 2x average) with price stability → accumulation
 * 2. Large volume spikes with price decline → distribution
 * 3. Persistent volume increase over time → institutional entry
 * 4. Unusual trading times (off-hours) → institutional activity
 */
export function detectInstitutionalFootprint(input: InstitutionalInput): InstitutionalFootprint {
  const { symbol, prices, volumes, timestamps, averageVolume } = input;

  if (volumes.length < 10 || prices.length < 10) {
    return {
      symbol,
      hasInstitutionalActivity: false,
      activityStrength: 0,
      activityType: 'NONE',
      confidence: 0,
      explanation: `${symbol}: Yetersiz veri`,
      recommendedAction: 'WAIT',
    };
  }

  // 1. Detect volume spikes (> 2x average)
  const volumeSpikes = volumes.map((v, i) => ({
    volume: v,
    ratio: averageVolume > 0 ? v / averageVolume : 1,
    price: prices[i],
    timestamp: timestamps[i],
  })).filter(s => s.ratio > 2.0);

  // 2. Analyze spike patterns
  let activityType: 'BUYING' | 'SELLING' | 'ACCUMULATING' | 'DISTRIBUTING' | 'NONE' = 'NONE';
  let activityStrength = 0;
  let hasInstitutionalActivity = false;

  if (volumeSpikes.length >= 3) {
    // Check if spikes are associated with price increases or decreases
    const spikePriceChanges = volumeSpikes.slice(-5).map((spike, idx) => {
      const spikeIdx = volumes.indexOf(spike.volume);
      const prevIdx = Math.max(0, spikeIdx - 1);
      return spikeIdx > 0 ? ((prices[spikeIdx] - prices[prevIdx]) / prices[prevIdx]) * 100 : 0;
    });

    const avgPriceChange = spikePriceChanges.reduce((sum, c) => sum + c, 0) / spikePriceChanges.length;

    if (avgPriceChange > 1) {
      // Price up during spikes → buying/accumulation
      activityType = volumeSpikes.length > 5 ? 'ACCUMULATING' : 'BUYING';
      hasInstitutionalActivity = true;
      activityStrength = Math.min(100, volumeSpikes.length * 15 + Math.abs(avgPriceChange) * 10);
    } else if (avgPriceChange < -1) {
      // Price down during spikes → selling/distribution
      activityType = volumeSpikes.length > 5 ? 'DISTRIBUTING' : 'SELLING';
      hasInstitutionalActivity = true;
      activityStrength = Math.min(100, volumeSpikes.length * 15 + Math.abs(avgPriceChange) * 10);
    }
  }

  // 3. Check for persistent volume increase (institutional entry pattern)
  const recentVolumes = volumes.slice(-10);
  const olderVolumes = volumes.slice(-20, -10);
  const recentAvg = recentVolumes.reduce((sum, v) => sum + v, 0) / recentVolumes.length;
  const olderAvg = olderVolumes.length > 0 ? olderVolumes.reduce((sum, v) => sum + v, 0) / olderVolumes.length : averageVolume;

  if (recentAvg > olderAvg * 1.5 && activityStrength < 50) {
    activityType = 'ACCUMULATING';
    hasInstitutionalActivity = true;
    activityStrength = Math.max(activityStrength, 60);
  }

  // 4. Calculate confidence
  const confidence = hasInstitutionalActivity
    ? Math.min(1, 0.6 + (activityStrength / 100) * 0.4)
    : 0;

  // 5. Determine recommended action
  let recommendedAction: 'BUY' | 'SELL' | 'WAIT' = 'WAIT';
  if (activityType === 'BUYING' || activityType === 'ACCUMULATING') {
    recommendedAction = 'BUY';
  } else if (activityType === 'SELLING' || activityType === 'DISTRIBUTING') {
    recommendedAction = 'SELL';
  }

  // 6. Generate explanation
  const activityText = activityType === 'ACCUMULATING' ? 'birikim (institutional accumulation)' :
                       activityType === 'BUYING' ? 'alım (institutional buying)' :
                       activityType === 'DISTRIBUTING' ? 'dağıtım (institutional distribution)' :
                       activityType === 'SELLING' ? 'satım (institutional selling)' : 'faaliyet yok';
  const explanation = hasInstitutionalActivity
    ? `${symbol}: Kurumsal yatırımcı faaliyeti tespit edildi (${activityText}). Aktivite gücü: ${activityStrength.toFixed(0)}/100. ${volumeSpikes.length} hacim spike'ı gözlendi.`
    : `${symbol}: Kurumsal yatırımcı faaliyeti tespit edilmedi. Normal perakende hacim.`;

  return {
    symbol,
    hasInstitutionalActivity,
    activityStrength: Math.round(activityStrength * 10) / 10,
    activityType,
    confidence: Math.round(confidence * 100) / 100,
    explanation,
    recommendedAction,
  };
}



