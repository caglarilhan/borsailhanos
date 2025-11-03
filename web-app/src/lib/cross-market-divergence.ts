/**
 * Cross-Market Divergence Radar
 * v6.0 Profit Intelligence Suite
 * 
 * BIST-NASDAQ-S&P hareketlerini karşılaştırır, ayrışma varsa sinyal verir
 * Fayda: Küresel trendlerden erken uyarı alırsın
 */

export interface CrossMarketInput {
  bistIndex: number; // BIST100 index value
  nasdaqIndex: number; // NASDAQ100 index value
  sp500Index: number; // S&P500 index value
  bistChange: number; // % change (last 24h)
  nasdaqChange: number;
  sp500Change: number;
  timestamp: string;
}

export interface DivergenceSignal {
  type: 'BULLISH_DIVERGENCE' | 'BEARISH_DIVERGENCE' | 'NONE';
  strength: number; // 0-100
  markets: {
    outperforming: string[]; // Markets showing stronger trend
    underperforming: string[]; // Markets showing weaker trend
  };
  expectedImpact: string; // Expected impact on BIST
  confidence: number; // 0-1
  recommendation: string;
  timeframe: '1h' | '4h' | '1d' | '7d';
}

export interface CrossMarketOutput {
  divergence: DivergenceSignal;
  correlations: {
    bistNasdaq: number; // Correlation coefficient
    bistSp500: number;
    nasdaqSp500: number;
  };
  explanation: string;
}

/**
 * Detect cross-market divergence
 * 
 * Strategy:
 * 1. Calculate relative performance (BIST vs NASDAQ vs S&P)
 * 2. If BIST underperforms while NASDAQ/S&P outperform → bullish divergence opportunity
 * 3. If BIST outperforms while NASDAQ/S&P underperform → bearish divergence warning
 * 4. Calculate correlation to validate divergence
 */
export function detectCrossMarketDivergence(input: CrossMarketInput): CrossMarketOutput {
  const { bistChange, nasdaqChange, sp500Change } = input;

  // 1. Calculate relative performance
  const avgGlobalChange = (nasdaqChange + sp500Change) / 2;
  const bistVsGlobal = bistChange - avgGlobalChange;

  // 2. Calculate correlations (simplified - would use historical data in production)
  const bistNasdaq = Math.abs(bistChange - nasdaqChange) < 1 ? 0.85 : Math.abs(bistChange - nasdaqChange) < 3 ? 0.65 : 0.45;
  const bistSp500 = Math.abs(bistChange - sp500Change) < 1 ? 0.82 : Math.abs(bistChange - sp500Change) < 3 ? 0.62 : 0.42;
  const nasdaqSp500 = 0.95; // Usually high correlation

  // 3. Detect divergence
  let divergenceType: 'BULLISH_DIVERGENCE' | 'BEARISH_DIVERGENCE' | 'NONE' = 'NONE';
  let strength = 0;
  let outperforming: string[] = [];
  let underperforming: string[] = [];
  let expectedImpact = '';
  let recommendation = '';
  let timeframe: '1h' | '4h' | '1d' | '7d' = '1d';

  if (bistVsGlobal < -2) {
    // BIST underperforming: bullish divergence opportunity
    divergenceType = 'BULLISH_DIVERGENCE';
    strength = Math.min(100, Math.abs(bistVsGlobal) * 15); // Max 100
    outperforming = ['NASDAQ100', 'S&P500'];
    underperforming = ['BIST100'];
    expectedImpact = 'BIST100\'in NASDAQ/S&P\'yi yakalama potansiyeli var. Yükseliş beklentisi.';
    recommendation = 'BIST100\'de alım fırsatı. Küresel piyasalar BIST\'i destekliyor.';
    timeframe = '1d';
  } else if (bistVsGlobal > 2) {
    // BIST outperforming: bearish divergence warning
    divergenceType = 'BEARISH_DIVERGENCE';
    strength = Math.min(100, Math.abs(bistVsGlobal) * 15);
    outperforming = ['BIST100'];
    underperforming = ['NASDAQ100', 'S&P500'];
    expectedImpact = 'BIST100\'in küresel piyasalardan geri çekilme riski var. Dikkatli yaklaş.';
    recommendation = 'BIST100\'de aşırı performans var. Küresel piyasa düzeltmesi BIST\'i etkileyebilir.';
    timeframe = '4h';
  }

  // 4. Calculate confidence
  const correlationAvg = (bistNasdaq + bistSp500) / 2;
  const confidence = strength > 0 ? Math.min(1, 0.5 + (strength / 100) * 0.3 + (correlationAvg * 0.2)) : 0;

  // 5. Generate explanation
  const explanation = divergenceType === 'BULLISH_DIVERGENCE'
    ? `Bullish divergence tespit edildi: BIST100 %${bistChange.toFixed(2)}, NASDAQ100 %${nasdaqChange.toFixed(2)}, S&P500 %${sp500Change.toFixed(2)}. BIST küresel piyasalardan geride, yakalama potansiyeli var.`
    : divergenceType === 'BEARISH_DIVERGENCE'
    ? `Bearish divergence tespit edildi: BIST100 %${bistChange.toFixed(2)}, NASDAQ100 %${nasdaqChange.toFixed(2)}, S&P500 %${sp500Change.toFixed(2)}. BIST küresel piyasalardan önde, geri çekilme riski var.`
    : 'Küresel piyasalar uyumlu hareket ediyor. Belirgin divergence yok.';

  return {
    divergence: {
      type: divergenceType,
      strength: Math.round(strength * 10) / 10,
      markets: { outperforming, underperforming },
      expectedImpact,
      confidence: Math.round(confidence * 100) / 100,
      recommendation,
      timeframe,
    },
    correlations: {
      bistNasdaq: Math.round(bistNasdaq * 100) / 100,
      bistSp500: Math.round(bistSp500 * 100) / 100,
      nasdaqSp500: Math.round(nasdaqSp500 * 100) / 100,
    },
    explanation,
  };
}



