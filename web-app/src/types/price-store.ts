/**
 * Canonical Price Store Types
 * Tek kaynak fiyat verisi için type tanımları
 */

export type Market = 'BIST' | 'NYSE' | 'NASDAQ' | 'CRYPTO';

export type PriceSource = 'live' | 'snapshot' | 'fallback' | 'mock';

export interface PriceData {
  symbol: string;
  market: Market;
  price: number;
  change: number; // Absolute change
  changePct: number; // Percentage change
  volume: number;
  timestamp: number; // Unix timestamp in ms
  source: PriceSource;
  // Technical indicators (optional)
  rsi?: number;
  macd?: number;
  ema20?: number;
  ema50?: number;
  // Additional metadata
  high24h?: number;
  low24h?: number;
  open?: number;
  previousClose?: number;
}

export interface PriceStore {
  // Map of symbol -> PriceData
  prices: Map<string, PriceData>;
  // Last update timestamp
  lastUpdated: number | null;
  // Connection status
  status: 'live' | 'degraded' | 'offline';
  // Source information
  primarySource: PriceSource;
  // Error state
  error: string | null;
}

export interface PriceStoreContextValue extends PriceStore {
  // Get price for a symbol
  getPrice: (symbol: string) => PriceData | null;
  // Get prices for multiple symbols
  getPrices: (symbols: string[]) => PriceData[];
  // Get all prices for a market
  getMarketPrices: (market: Market) => PriceData[];
  // Refresh prices
  refresh: () => Promise<void>;
  // Check if price is fresh (within X seconds)
  isFresh: (symbol: string, maxAgeSeconds?: number) => boolean;
  // Global last updated (min of timestamps)
  globalLastUpdated?: number | null;
}

