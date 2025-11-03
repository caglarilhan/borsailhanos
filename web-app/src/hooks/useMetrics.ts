/**
 * P5.2: useMetrics Hook - metricsStore selector
 * Tüm panellerde aynı hook → tek kaynak
 */

import { useMetricsStore } from '@/store/metrics-store';
import { ForecastMetric, RiskMetric, AlphaMetric, SentimentMetric, DriftMetric } from '@/lib/metrics-schema';

/**
 * Get forecast for symbol and window
 */
export function useForecast(symbol: string, window: string): ForecastMetric | undefined {
  return useMetricsStore((state) => state.getForecast(symbol, window));
}

/**
 * Get risk score (24h) for symbol
 * P5.2: Risk score tek kaynak → riskScore_24h
 */
export function useRisk24h(symbol: string): RiskMetric | undefined {
  return useMetricsStore((state) => state.getRisk24h(symbol));
}

/**
 * Get alpha (24h vs XU030_24h) for symbol
 * P5.2: Alpha tek benchmark → XU030_24h
 */
export function useAlpha24h(symbol: string): AlphaMetric | undefined {
  return useMetricsStore((state) => state.getAlpha24h(symbol));
}

/**
 * Get sentiment for symbol and window
 */
export function useSentiment(symbol: string, window?: string): SentimentMetric | undefined {
  return useMetricsStore((state) => state.getSentiment(symbol, window));
}

/**
 * Get drift (24s) for symbol
 * P5.2: Drift format → pp
 */
export function useDrift24s(symbol: string): DriftMetric | undefined {
  return useMetricsStore((state) => state.getDrift24s(symbol));
}

/**
 * Get demo/live mode
 * P5.2: Mock/Live splitter
 */
export function useIsDemo(): boolean {
  return useMetricsStore((state) => state.isDemo);
}

/**
 * Get all metrics for symbol (convenience hook)
 */
export function useAllMetrics(symbol: string) {
  const forecast = useForecast(symbol, '1d');
  const risk24h = useRisk24h(symbol);
  const alpha24h = useAlpha24h(symbol);
  const sentiment = useSentiment(symbol, '1d');
  const drift24s = useDrift24s(symbol);
  const isDemo = useIsDemo();
  
  return {
    forecast,
    risk24h,
    alpha24h,
    sentiment,
    drift24s,
    isDemo,
  };
}


