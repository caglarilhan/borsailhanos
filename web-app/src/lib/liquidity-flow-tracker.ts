/**
 * Liquidity Flow Tracker
 * v6.0 Profit Intelligence Suite
 * 
 * Kurumsal alım-satım izleri (yüksek hacim spike'ları) otomatik tespit edilir
 * Fayda: "Smart money" hareketlerini takip eder
 */

export interface LiquidityFlowInput {
  symbol: string;
  volumes: number[]; // Last 60 minutes
  prices: number[]; // Last 60 minutes
  averageVolume: number; // 60-minute average
}

export interface LiquidityFlow {
  symbol: string;
  hasSmartMoney: boolean;
  flowDirection: 'INFLOW' | 'OUTFLOW' | 'NEUTRAL';
  flowStrength: number; // 0-100
  spikeCount: number;
  confidence: number;
  explanation: string;
}

/**
 * Track liquidity flow (smart money movements)
 * 
 * Indicators:
 * 1. Volume spike > 3x average → potential smart money
 * 2. Price increase during spike → inflow (buying)
 * 3. Price decrease during spike → outflow (selling)
 * 4. Multiple consecutive spikes → strong smart money signal
 */
export function trackLiquidityFlow(input: LiquidityFlowInput): LiquidityFlow {
  const { symbol, volumes, prices, averageVolume } = input;

  if (volumes.length < 10) {
    return {
      symbol,
      hasSmartMoney: false,
      flowDirection: 'NEUTRAL',
      flowStrength: 0,
      spikeCount: 0,
      confidence: 0,
      explanation: `${symbol}: Yetersiz veri`,
    };
  }

  // 1. Detect volume spikes (> 3x average = smart money indicator)
  const spikes = volumes.map((v, i) => ({
    volume: v,
    ratio: averageVolume > 0 ? v / averageVolume : 1,
    price: prices[i],
    index: i,
  })).filter(s => s.ratio > 3.0);

  // 2. Analyze flow direction
  let flowDirection: 'INFLOW' | 'OUTFLOW' | 'NEUTRAL' = 'NEUTRAL';
  let flowStrength = 0;
  let hasSmartMoney = false;

  if (spikes.length > 0) {
    hasSmartMoney = true;
    
    // Check price change during spikes
    const spikePriceChanges = spikes.map(spike => {
      const idx = spike.index;
      if (idx === 0) return 0;
      const prevPrice = prices[idx - 1];
      return ((spike.price - prevPrice) / prevPrice) * 100;
    });

    const avgPriceChange = spikePriceChanges.reduce((sum, c) => sum + c, 0) / spikePriceChanges.length;

    if (avgPriceChange > 0.5) {
      flowDirection = 'INFLOW'; // Smart money buying
      flowStrength = Math.min(100, spikes.length * 20 + Math.abs(avgPriceChange) * 10);
    } else if (avgPriceChange < -0.5) {
      flowDirection = 'OUTFLOW'; // Smart money selling
      flowStrength = Math.min(100, spikes.length * 20 + Math.abs(avgPriceChange) * 10);
    } else {
      flowDirection = 'NEUTRAL';
      flowStrength = Math.min(50, spikes.length * 10);
    }
  }

  // 3. Calculate confidence
  const confidence = hasSmartMoney
    ? Math.min(1, 0.5 + (spikes.length / 10) * 0.3 + (flowStrength / 100) * 0.2)
    : 0;

  // 4. Generate explanation
  const flowText = flowDirection === 'INFLOW' ? 'giriş (smart money alım)' :
                   flowDirection === 'OUTFLOW' ? 'çıkış (smart money satım)' :
                   'nötr';
  const explanation = hasSmartMoney
    ? `${symbol}: Smart money hareketi tespit edildi (${flowText}). ${spikes.length} hacim spike'ı. Akış gücü: ${flowStrength.toFixed(0)}/100.`
    : `${symbol}: Smart money hareketi tespit edilmedi. Normal hacim seviyesi.`;

  return {
    symbol,
    hasSmartMoney,
    flowDirection,
    flowStrength: Math.round(flowStrength * 10) / 10,
    spikeCount: spikes.length,
    confidence: Math.round(confidence * 100) / 100,
    explanation,
  };
}



