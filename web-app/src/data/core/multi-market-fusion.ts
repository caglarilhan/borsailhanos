/**
 * P5.2: Multi-Market Fusion Table
 * BIST100, NASDAQ100, S&P100 tablo birleşimi
 * Korelasyonlar arası pivot (örneğin AKBNK–JPMorgan)
 */

export interface Market {
  name: 'BIST30' | 'BIST100' | 'NASDAQ100' | 'S&P100';
  region: 'TR' | 'US';
  symbols: string[];
  lastUpdate: string;
}

export interface CrossMarketCorrelation {
  symbolA: string;
  symbolB: string;
  marketA: string;
  marketB: string;
  correlation: number; // -1 to 1
  pValue: number; // Statistical significance
  window: '1d' | '7d' | '30d';
  timestamp: string;
}

export interface MultiMarketSignal {
  symbol: string;
  market: 'BIST30' | 'BIST100' | 'NASDAQ100' | 'S&P100';
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  price: number;
  change: number; // Percentage change
  volume: number;
  correlation?: {
    correlatedSymbols: Array<{
      symbol: string;
      market: string;
      correlation: number;
    }>;
  };
  timestamp: string;
}

export interface MultiMarketFusion {
  markets: Market[];
  signals: MultiMarketSignal[];
  crossCorrelations: CrossMarketCorrelation[];
  pivotCorrelations: Array<{
    symbol: string;
    market: string;
    correlations: Array<{
      correlatedSymbol: string;
      correlatedMarket: string;
      correlation: number;
    }>;
  }>;
  timestamp: string;
}

/**
 * Multi-Market Fusion Engine
 */
export class MultiMarketFusionEngine {
  private markets: Map<string, Market> = new Map();

  /**
   * Register market
   */
  registerMarket(market: Market): void {
    this.markets.set(market.name, market);
  }

  /**
   * Calculate cross-market correlation
   */
  calculateCrossMarketCorrelation(
    symbolA: string,
    symbolB: string,
    marketA: string,
    marketB: string,
    returnsA: number[],
    returnsB: number[]
  ): CrossMarketCorrelation | null {
    if (returnsA.length !== returnsB.length || returnsA.length < 10) {
      return null;
    }

    // Calculate Pearson correlation
    const meanA = returnsA.reduce((a, b) => a + b, 0) / returnsA.length;
    const meanB = returnsB.reduce((a, b) => a + b, 0) / returnsB.length;

    const covariance = returnsA.reduce((sum, r, i) => {
      return sum + (r - meanA) * (returnsB[i] - meanB);
    }, 0) / returnsA.length;

    const stdA = Math.sqrt(
      returnsA.reduce((sum, r) => sum + Math.pow(r - meanA, 2), 0) / returnsA.length
    );
    const stdB = Math.sqrt(
      returnsB.reduce((sum, r) => sum + Math.pow(r - meanB, 2), 0) / returnsB.length
    );

    const correlation = stdA > 0 && stdB > 0 ? covariance / (stdA * stdB) : 0;

    // Calculate p-value (simplified)
    const tStat = correlation * Math.sqrt((returnsA.length - 2) / (1 - correlation * correlation));
    const pValue = this.calculatePValue(Math.abs(tStat), returnsA.length - 2);

    return {
      symbolA,
      symbolB,
      marketA,
      marketB,
      correlation,
      pValue,
      window: returnsA.length >= 30 ? '30d' : returnsA.length >= 7 ? '7d' : '1d',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Calculate p-value (simplified t-test)
   */
  private calculatePValue(tStat: number, df: number): number {
    // Simplified p-value calculation
    // In production, use proper t-distribution
    if (Math.abs(tStat) > 2.5) return 0.01; // Significant
    if (Math.abs(tStat) > 2.0) return 0.05; // Significant at 5%
    if (Math.abs(tStat) > 1.96) return 0.05;
    return 0.10; // Not significant
  }

  /**
   * Find pivot correlations for a symbol
   */
  findPivotCorrelations(
    symbol: string,
    market: string,
    allSignals: MultiMarketSignal[],
    correlationMatrix: Map<string, Map<string, number>>
  ): Array<{
    correlatedSymbol: string;
    correlatedMarket: string;
    correlation: number;
  }> {
    const correlations: Array<{
      correlatedSymbol: string;
      correlatedMarket: string;
      correlation: number;
    }> = [];

    // Find correlated symbols across markets
    allSignals.forEach((signal) => {
      if (signal.symbol === symbol && signal.market === market) return;

      const key = `${signal.market}:${signal.symbol}`;
      const correlation = correlationMatrix.get(`${market}:${symbol}`)?.get(key);

      if (correlation !== undefined && Math.abs(correlation) > 0.5) {
        correlations.push({
          correlatedSymbol: signal.symbol,
          correlatedMarket: signal.market,
          correlation,
        });
      }
    });

    // Sort by absolute correlation (strongest first)
    correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

    return correlations.slice(0, 10); // Top 10 correlations
  }

  /**
   * Fuse multi-market signals
   */
  fuseSignals(
    signals: MultiMarketSignal[],
    correlationMatrix: Map<string, Map<string, number>>
  ): MultiMarketFusion {
    // Group by market
    const markets: Market[] = [];
    const marketMap = new Map<string, string[]>();

    signals.forEach((signal) => {
      if (!marketMap.has(signal.market)) {
        marketMap.set(signal.market, []);
        markets.push({
          name: signal.market,
          region: signal.market.startsWith('BIST') ? 'TR' : 'US',
          symbols: [],
          lastUpdate: signal.timestamp,
        });
      }

      marketMap.get(signal.market)!.push(signal.symbol);
    });

    // Update market symbols
    markets.forEach((market) => {
      market.symbols = Array.from(new Set(marketMap.get(market.name) || []));
    });

    // Calculate cross-market correlations
    const crossCorrelations: CrossMarketCorrelation[] = [];

    // For each signal, find correlated symbols in other markets
    signals.forEach((signalA) => {
      signals.forEach((signalB) => {
        if (signalA.symbol === signalB.symbol && signalA.market === signalB.market) return;
        if (signalA.market === signalB.market) return; // Same market

        const keyA = `${signalA.market}:${signalA.symbol}`;
        const keyB = `${signalB.market}:${signalB.symbol}`;

        const correlation = correlationMatrix.get(keyA)?.get(keyB);

        if (correlation !== undefined && Math.abs(correlation) > 0.3) {
          // Mock returns for correlation calculation
          // In production, use actual returns
          const returnsA = Array.from({ length: 30 }, () => (Math.random() - 0.5) * 0.02);
          const returnsB = Array.from({ length: 30 }, () => (Math.random() - 0.5) * 0.02);

          const crossCorr = this.calculateCrossMarketCorrelation(
            signalA.symbol,
            signalB.symbol,
            signalA.market,
            signalB.market,
            returnsA,
            returnsB
          );

          if (crossCorr) {
            crossCorrelations.push(crossCorr);
          }
        }
      });
    });

    // Find pivot correlations
    const pivotCorrelations = signals.map((signal) => ({
      symbol: signal.symbol,
      market: signal.market,
      correlations: this.findPivotCorrelations(
        signal.symbol,
        signal.market,
        signals,
        correlationMatrix
      ),
    }));

    // Add correlation info to signals
    const enrichedSignals = signals.map((signal) => {
      const pivot = pivotCorrelations.find(
        (p) => p.symbol === signal.symbol && p.market === signal.market
      );

      return {
        ...signal,
        correlation: pivot ? {
          correlatedSymbols: pivot.correlations.map((c) => ({
            symbol: c.correlatedSymbol,
            market: c.correlatedMarket,
            correlation: c.correlation,
          })),
        } : undefined,
      };
    });

    return {
      markets,
      signals: enrichedSignals,
      crossCorrelations,
      pivotCorrelations,
      timestamp: new Date().toISOString(),
    };
  }
}

// Singleton instance
export const multiMarketFusionEngine = new MultiMarketFusionEngine();

/**
 * Fuse multi-market signals
 */
export function fuseMultiMarketSignals(
  signals: MultiMarketSignal[],
  correlationMatrix: Map<string, Map<string, number>>
): MultiMarketFusion {
  return multiMarketFusionEngine.fuseSignals(signals, correlationMatrix);
}

/**
 * Calculate cross-market correlation
 */
export function calculateCrossMarketCorrelation(
  symbolA: string,
  symbolB: string,
  marketA: string,
  marketB: string,
  returnsA: number[],
  returnsB: number[]
): CrossMarketCorrelation | null {
  return multiMarketFusionEngine.calculateCrossMarketCorrelation(
    symbolA,
    symbolB,
    marketA,
    marketB,
    returnsA,
    returnsB
  );
}


