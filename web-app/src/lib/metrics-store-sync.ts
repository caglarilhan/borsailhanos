/**
 * P5.2: Metrics Store Sync
 * BistSignals'ten gelen verileri metricsStore'a aktarır
 */

import { useMetricsStore } from '@/store/metrics-store';
import { ForecastMetric, RiskMetric, AlphaMetric, SentimentMetric, DriftMetric } from '@/lib/metrics-schema';

export interface PredictionRow {
  symbol: string;
  prediction: number;
  confidence: number;
  horizon?: string;
  price?: number;
  target?: number;
  stop?: number;
  rsi?: number;
  macd?: number;
  volume_ratio?: number;
}

export interface SentimentData {
  overall?: {
    positive?: number;
    negative?: number;
    neutral?: number;
  };
  by_symbol?: Record<string, {
    positive?: number;
    negative?: number;
    neutral?: number;
  }>;
}

/**
 * Sync predictions to metricsStore
 */
export function syncPredictionsToStore(rows: PredictionRow[], window: string = '1d') {
  const store = useMetricsStore.getState();
  
  rows.forEach(row => {
    // Create ForecastMetric
    const forecast: ForecastMetric = {
      symbol: row.symbol,
      type: 'forecast',
      asOf: new Date().toISOString(),
      window: window as any,
      benchmark: 'XU030_24h',
      tz: 'Europe/Istanbul',
      source: 'live', // TODO: Determine from data source
      value: row.prediction || 0,
      confidence: row.confidence || 0,
      target: row.target,
      stop: row.stop,
      side: (row.prediction || 0) >= 0.02 ? 'BUY' : (row.prediction || 0) <= -0.02 ? 'SELL' : 'HOLD',
    };
    
    store.setForecast(row.symbol, forecast);
    
    // Create RiskMetric (if available)
    if (row.rsi !== undefined || row.macd !== undefined) {
      const riskValue = Math.max(0, Math.min(5, 5 - (row.confidence || 0) * 5)); // Inverse confidence
      const risk: RiskMetric = {
        symbol: row.symbol,
        type: 'risk',
        asOf: new Date().toISOString(),
        window: window as any,
        benchmark: 'XU030_24h',
        tz: 'Europe/Istanbul',
        source: 'live',
        value: riskValue,
        components: {
          volatility: row.volume_ratio ? Math.min(1, row.volume_ratio) : undefined,
        },
        level: riskValue <= 2.5 ? 'low' : riskValue <= 4 ? 'medium' : 'high',
      };
      
      store.setRisk(row.symbol, risk);
    }
    
    // Create AlphaMetric
    const alpha: AlphaMetric = {
      symbol: row.symbol,
      type: 'alpha',
      asOf: new Date().toISOString(),
      window: window as any,
      benchmark: 'XU030_24h',
      tz: 'Europe/Istanbul',
      source: 'live',
      value: (row.prediction || 0) * 100 - 4.2, // vs XU030_24h
      benchmark_return: 4.2,
      window_return: (row.prediction || 0) * 100,
    };
    
    store.setAlpha(row.symbol, alpha);
  });
}

/**
 * Sync sentiment to metricsStore
 */
export function syncSentimentToStore(sentimentData: SentimentData, window: string = '1d') {
  const store = useMetricsStore.getState();
  
  // Overall sentiment
  if (sentimentData.overall) {
    const ov = sentimentData.overall;
    const sentiment: SentimentMetric = {
      symbol: 'OVERALL',
      type: 'sentiment',
      asOf: new Date().toISOString(),
      window: window as any,
      benchmark: 'XU030_24h',
      tz: 'Europe/Istanbul',
      source: 'live',
      value: (ov.positive || 0) * 100,
      components: {
        positive: (ov.positive || 0) * 100,
        negative: (ov.negative || 0) * 100,
        neutral: (ov.neutral || 0) * 100,
      },
      source: 'finbert',
    };
    
    store.setSentiment('OVERALL', sentiment);
  }
  
  // By symbol sentiment
  if (sentimentData.by_symbol) {
    Object.entries(sentimentData.by_symbol).forEach(([symbol, data]) => {
      const sentiment: SentimentMetric = {
        symbol,
        type: 'sentiment',
        asOf: new Date().toISOString(),
        window: window as any,
        benchmark: 'XU030_24h',
        tz: 'Europe/Istanbul',
        source: 'live',
        value: (data.positive || 0) * 100,
        components: {
          positive: (data.positive || 0) * 100,
          negative: (data.negative || 0) * 100,
          neutral: (data.neutral || 0) * 100,
        },
        source: 'finbert',
      };
      
      store.setSentiment(symbol, sentiment);
    });
  }
}

/**
 * Sync drift to metricsStore
 */
export function syncDriftToStore(symbol: string, driftValue: number, flag?: 'MOM' | 'VOL' | 'NEWS' | 'NONE') {
  const store = useMetricsStore.getState();
  
  const drift: DriftMetric = {
    symbol,
    type: 'drift',
    asOf: new Date().toISOString(),
    window: '24s',
    benchmark: 'XU030_24h',
    tz: 'Europe/Istanbul',
    source: 'live',
    value: driftValue,
    threshold: 2.5,
    flag: flag || 'NONE',
  };
  
  store.setDrift(symbol, drift);
}


