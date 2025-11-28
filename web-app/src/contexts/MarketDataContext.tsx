'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import type { AiPowerMetric, AiPositionCard } from '@/types/ai-power';
import type { SentimentPayload } from '@/types/sentiment';
import type { PriceData, PriceStoreContextValue, Market, PriceSource } from '@/types/price-store';
import type { TimestampLabel, TimestampStore, TimestampFormatOptions } from '@/types/timestamp';

type AiPowerSnapshot = {
  metrics: AiPowerMetric[];
  positions: AiPositionCard[];
};

interface MarketDataContextValue extends PriceStoreContextValue {
  aiPower: AiPowerSnapshot;
  sentiment: SentimentPayload | null;
  sentimentUpdatedAt: number | null;
  loading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  timestamps: TimestampStore;
  getTimestamp: (label: TimestampLabel) => number | null;
  formatTimestamp: (label: TimestampLabel, options?: TimestampFormatOptions) => string;
  globalLastUpdated: number | null;
}

const MarketDataContext = createContext<MarketDataContextValue | undefined>(undefined);

export function MarketDataProvider({ children }: { children: React.ReactNode }) {
  // AI Power & Sentiment state
  const [aiPower, setAiPower] = useState<AiPowerSnapshot>({ metrics: [], positions: [] });
  const [sentiment, setSentiment] = useState<SentimentPayload | null>(null);
  const [sentimentUpdatedAt, setSentimentUpdatedAt] = useState<number | null>(null);
  
  // Price Store state
  const [prices, setPrices] = useState<Map<string, PriceData>>(new Map());
  const [priceLastUpdated, setPriceLastUpdated] = useState<number | null>(null);
  const [priceStatus, setPriceStatus] = useState<'live' | 'degraded' | 'offline'>('offline');
  const [primarySource, setPrimarySource] = useState<PriceSource>('fallback');
  
  // General state
  const [globalLastUpdated, setGlobalLastUpdated] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [timestamps, setTimestamps] = useState<TimestampStore>({
    prices: null,
    aiPower: null,
    sentiment: null,
    usRadar: null,
    aiLearning: null,
  });

  const updateTimestamp = useCallback((label: TimestampLabel, value: number | null = Date.now()) => {
    setTimestamps((prev) => ({
      ...prev,
      [label]: value,
    }));
  }, []);

  // Fetch canonical prices
  const fetchPrices = useCallback(async () => {
    try {
      const response = await fetch('/api/market/prices', { cache: 'no-store' });
      let payload: any = null;

      try {
        payload = await response.json();
      } catch (parseError) {
        console.warn('[PRICE_STORE] Failed to parse /api/market/prices JSON:', parseError);
      }

      const priceArray: PriceData[] = Array.isArray(payload?.prices) ? payload.prices : [];

      if (!response.ok && priceArray.length === 0) {
        throw new Error(
          payload?.error || `Price fetch failed (status ${response.status})`,
        );
      }

      const priceMap = new Map<string, PriceData>();
      priceArray.forEach((price) => {
        priceMap.set(price.symbol, price);
      });

      setPrices(priceMap);
      const resolvedUpdatedAt = payload?.lastUpdated ? Number(payload.lastUpdated) : Date.now();
      setPriceLastUpdated(resolvedUpdatedAt);
      setPriceStatus(payload?.status || (response.ok ? 'live' : 'offline'));
      setPrimarySource(payload?.primarySource || 'fallback');
      updateTimestamp('prices', resolvedUpdatedAt);

      return priceMap;
    } catch (err) {
      console.error('[PRICE_STORE] Fetch error:', err);
      setPriceStatus('offline');
      updateTimestamp('prices', null);
      return new Map<string, PriceData>();
    }
  }, [updateTimestamp]);

  // Fetch AI Power & Sentiment
  const fetchMarketData = useCallback(async () => {
    setIsFetching(true);
    setError(null);

    try {
      const [aiResponse, sentimentResponse, pricesMap] = await Promise.all([
        fetch('/api/market/ai-cards', { cache: 'no-store' }),
        fetch('/api/ai/us-sentiment', { cache: 'no-store' }),
        fetchPrices(), // Fetch prices in parallel
      ]);

      if (!aiResponse.ok) {
        throw new Error(`AI power fetch failed (status ${aiResponse.status})`);
      }

      const aiPayload = await aiResponse.json();
      setAiPower({
        metrics: Array.isArray(aiPayload?.metrics) ? aiPayload.metrics : [],
        positions: Array.isArray(aiPayload?.positions) ? aiPayload.positions : [],
      });

      const aiUpdatedAt = aiPayload?.updatedAt ? Number(aiPayload.updatedAt) : Date.now();
      updateTimestamp('aiPower', aiUpdatedAt);

      if (sentimentResponse.ok) {
        const sentimentPayload: SentimentPayload = await sentimentResponse.json();
        setSentiment(sentimentPayload);
        const sentimentTime = sentimentPayload?.generatedAt
          ? Date.parse(sentimentPayload.generatedAt)
          : Date.now();
        const resolvedSentiment = Number.isNaN(sentimentTime) ? Date.now() : sentimentTime;
        setSentimentUpdatedAt(resolvedSentiment);
        updateTimestamp('sentiment', resolvedSentiment);
      } else {
        setSentiment(null);
        setSentimentUpdatedAt(null);
        updateTimestamp('sentiment', null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Market data fetch failed');
    } finally {
      setIsFetching(false);
    }
  }, [fetchPrices, priceLastUpdated, sentimentUpdatedAt, updateTimestamp]);

  useEffect(() => {
    const values = Object.values(timestamps).filter((value): value is number => typeof value === 'number');
    if (values.length === 0) {
      setGlobalLastUpdated(null);
      return;
    }
    setGlobalLastUpdated(Math.min(...values));
  }, [timestamps]);

  useEffect(() => {
    fetchMarketData();
    const intervalId = setInterval(fetchMarketData, 60_000);
    return () => clearInterval(intervalId);
  }, [fetchMarketData]);

  // Price Store helper functions
  const getPrice = useCallback((symbol: string): PriceData | null => {
    return prices.get(symbol) || null;
  }, [prices]);

  const getPrices = useCallback((symbols: string[]): PriceData[] => {
    return symbols.map(s => prices.get(s)).filter((p): p is PriceData => p !== undefined);
  }, [prices]);

  const getMarketPrices = useCallback((market: Market): PriceData[] => {
    return Array.from(prices.values()).filter(p => p.market === market);
  }, [prices]);

  const isFresh = useCallback((symbol: string, maxAgeSeconds: number = 300): boolean => {
    const price = prices.get(symbol);
    if (!price || !priceLastUpdated) return false;
    const ageSeconds = (Date.now() - price.timestamp) / 1000;
    return ageSeconds <= maxAgeSeconds;
  }, [prices, priceLastUpdated]);

  const refresh = useCallback(async () => {
    await fetchMarketData();
  }, [fetchMarketData]);

  const getTimestamp = useCallback((label: TimestampLabel): number | null => {
    return timestamps[label];
  }, [timestamps]);

  const formatTimestamp = useCallback(
    (label: TimestampLabel, options?: TimestampFormatOptions): string => {
      const timestamp = timestamps[label];
      if (!timestamp) {
        return options?.fallback ?? 'Veri bekleniyor';
      }
      if (options?.relative) {
        const diffSeconds = Math.round((Date.now() - timestamp) / 1000);
        if (diffSeconds < 60) return `${diffSeconds} sn önce`;
        const diffMinutes = Math.round(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes} dk önce`;
        const diffHours = Math.round(diffMinutes / 60);
        return `${diffHours} sa önce`;
      }
      const locale = options?.locale ?? 'tr-TR';
      return new Date(timestamp).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    },
    [timestamps],
  );

  const value = useMemo<MarketDataContextValue>(
    () => ({
      // Price Store (PriceStoreContextValue interface)
      prices,
      lastUpdated: priceLastUpdated, // Price store lastUpdated
      status: priceStatus,
      primarySource,
      error,
      getPrice,
      getPrices,
      getMarketPrices,
      isFresh,
      refresh,
      globalLastUpdated,
      timestamps,
      getTimestamp,
      formatTimestamp,
      // Market Data (additional fields)
      aiPower,
      sentiment,
      sentimentUpdatedAt,
      loading: isFetching && aiPower.metrics.length === 0 && prices.size === 0,
      isRefreshing: isFetching,
    }),
    [
      prices,
      priceLastUpdated,
      priceStatus,
      primarySource,
      error,
      getPrice,
      getPrices,
      getMarketPrices,
      isFresh,
      refresh,
      globalLastUpdated,
      timestamps,
      getTimestamp,
      formatTimestamp,
      aiPower,
      sentiment,
      sentimentUpdatedAt,
      isFetching,
    ],
  );

  return <MarketDataContext.Provider value={value}>{children}</MarketDataContext.Provider>;
}

export function useMarketData() {
  const context = useContext(MarketDataContext);
  if (!context) {
    throw new Error('useMarketData must be used within MarketDataProvider');
  }
  return context;
}


