/**
 * P5.2: Metrics Schema - Single Source of Truth (SSOT)
 * Zod + TS tipleri ile tüm metriklerin doğrulayıcısı
 */

import { z } from 'zod';

/**
 * Window types (time horizons)
 */
export const WindowSchema = z.enum(['5m', '15m', '30m', '1h', '4h', '1d', '7d', '30d', '24s']);
export type Window = z.infer<typeof WindowSchema>;

/**
 * Benchmark types
 */
export const BenchmarkSchema = z.enum(['BIST30', 'BIST100', 'XU030', 'XU030_24h', 'SP500', 'NASDAQ100']);
export type Benchmark = z.infer<typeof BenchmarkSchema>;

/**
 * Signal types
 */
export const SignalSchema = z.enum(['BUY', 'SELL', 'HOLD']);
export type Signal = z.infer<typeof SignalSchema>;

/**
 * Base metric schema (common fields)
 */
export const BaseMetricSchema = z.object({
  symbol: z.string().min(1).max(10), // e.g., 'THYAO', 'AKBNK'
  asOf: z.string().datetime(), // ISO 8601 timestamp
  window: WindowSchema,
  benchmark: BenchmarkSchema.default('XU030_24h'), // P5.2: Default benchmark
  tz: z.string().default('Europe/Istanbul'), // UTC+3
  source: z.enum(['mock', 'live']).default('mock'), // P5.2: Mock/Live splitter
});

/**
 * Forecast metric schema
 */
export const ForecastMetricSchema = BaseMetricSchema.extend({
  type: z.literal('forecast'),
  value: z.number().min(-2).max(2), // Expected return (e.g., 0.15 for +15%)
  confidence: z.number().min(0).max(1), // 0-1 scale
  pi90_lower: z.number().optional(), // Prediction interval 90% lower bound
  pi90_upper: z.number().optional(), // Prediction interval 90% upper bound
  target: z.number().positive().optional(), // Target price
  stop: z.number().positive().optional(), // Stop loss
  side: SignalSchema,
});

/**
 * Risk metric schema
 */
export const RiskMetricSchema = BaseMetricSchema.extend({
  type: z.literal('risk'),
  value: z.number().min(0).max(10), // Risk score 0-10
  components: z.object({
    volatility: z.number().min(0).max(1).optional(),
    drawdown: z.number().min(0).max(1).optional(),
    correlation: z.number().min(-1).max(1).optional(),
  }).optional(),
  level: z.enum(['low', 'medium', 'high']).optional(), // Derived from value
});

/**
 * Alpha metric schema (excess return vs benchmark)
 */
export const AlphaMetricSchema = BaseMetricSchema.extend({
  type: z.literal('alpha'),
  value: z.number(), // Alpha (excess return) in percentage points
  benchmark_return: z.number().optional(), // Benchmark return for comparison
  window_return: z.number().optional(), // Window return
});

/**
 * Sentiment metric schema
 */
export const SentimentMetricSchema = BaseMetricSchema.extend({
  type: z.literal('sentiment'),
  value: z.number().min(0).max(100), // Overall sentiment 0-100%
  components: z.object({
    positive: z.number().min(0).max(100),
    negative: z.number().min(0).max(100),
    neutral: z.number().min(0).max(100),
  }),
  source: z.enum(['finbert', 'twitter', 'news', 'kap']).optional(),
});

/**
 * Drift metric schema
 */
export const DriftMetricSchema = BaseMetricSchema.extend({
  type: z.literal('drift'),
  value: z.number().min(-10).max(10), // Drift in percentage points (pp)
  previous_value: z.number().optional(),
  threshold: z.number().default(2.5), // Default drift threshold (2.5pp)
  flag: z.enum(['MOM', 'VOL', 'NEWS', 'NONE']).optional(), // Drift type
});

/**
 * Combined metric schema (union)
 */
export const MetricSchema = z.discriminatedUnion('type', [
  ForecastMetricSchema,
  RiskMetricSchema,
  AlphaMetricSchema,
  SentimentMetricSchema,
  DriftMetricSchema,
]);

export type Metric = z.infer<typeof MetricSchema>;
export type ForecastMetric = z.infer<typeof ForecastMetricSchema>;
export type RiskMetric = z.infer<typeof RiskMetricSchema>;
export type AlphaMetric = z.infer<typeof AlphaMetricSchema>;
export type SentimentMetric = z.infer<typeof SentimentMetricSchema>;
export type DriftMetric = z.infer<typeof DriftMetricSchema>;

/**
 * Validate metric with schema
 */
export function validateMetric(data: unknown): { success: boolean; data?: Metric; error?: string } {
  try {
    const result = MetricSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error.errors.map(e => e.message).join(', ') };
    }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

/**
 * Clamp metric values according to schema
 */
export function clampMetricValues(metric: Partial<Metric>): Partial<Metric> {
  const clamped = { ...metric };
  
  if (metric.type === 'forecast') {
    if (typeof (metric as Partial<ForecastMetric>).value === 'number') {
      (clamped as Partial<ForecastMetric>).value = Math.max(-2, Math.min(2, (metric as Partial<ForecastMetric>).value!));
    }
    if (typeof (metric as Partial<ForecastMetric>).confidence === 'number') {
      (clamped as Partial<ForecastMetric>).confidence = Math.max(0, Math.min(1, (metric as Partial<ForecastMetric>).confidence!));
    }
  }
  
  if (metric.type === 'risk') {
    if (typeof (metric as Partial<RiskMetric>).value === 'number') {
      (clamped as Partial<RiskMetric>).value = Math.max(0, Math.min(10, (metric as Partial<RiskMetric>).value!));
    }
  }
  
  if (metric.type === 'sentiment') {
    if (typeof (metric as Partial<SentimentMetric>).value === 'number') {
      (clamped as Partial<SentimentMetric>).value = Math.max(0, Math.min(100, (metric as Partial<SentimentMetric>).value!));
    }
    const components = (metric as Partial<SentimentMetric>).components;
    if (components) {
      (clamped as Partial<SentimentMetric>).components = {
        positive: Math.max(0, Math.min(100, components.positive || 0)),
        negative: Math.max(0, Math.min(100, components.negative || 0)),
        neutral: Math.max(0, Math.min(100, components.neutral || 0)),
      };
      // Normalize to sum to 100
      const sum = (clamped as Partial<SentimentMetric>).components!.positive + 
                  (clamped as Partial<SentimentMetric>).components!.negative + 
                  (clamped as Partial<SentimentMetric>).components!.neutral;
      if (sum > 0) {
        (clamped as Partial<SentimentMetric>).components!.positive = (clamped as Partial<SentimentMetric>).components!.positive * 100 / sum;
        (clamped as Partial<SentimentMetric>).components!.negative = (clamped as Partial<SentimentMetric>).components!.negative * 100 / sum;
        (clamped as Partial<SentimentMetric>).components!.neutral = (clamped as Partial<SentimentMetric>).components!.neutral * 100 / sum;
      }
    }
  }
  
  if (metric.type === 'drift') {
    if (typeof (metric as Partial<DriftMetric>).value === 'number') {
      (clamped as Partial<DriftMetric>).value = Math.max(-10, Math.min(10, (metric as Partial<DriftMetric>).value!));
    }
  }
  
  return clamped;
}

/**
 * Get default benchmark for window
 */
export function getDefaultBenchmark(window: Window): Benchmark {
  if (window === '24s') {
    return 'XU030_24h'; // P5.2: Alpha tek benchmark
  }
  return 'XU030'; // Default for other windows
}

/**
 * Calculate risk level from risk score
 */
export function getRiskLevel(riskScore: number): 'low' | 'medium' | 'high' {
  if (riskScore <= 3) return 'low';
  if (riskScore <= 6) return 'medium';
  return 'high';
}


