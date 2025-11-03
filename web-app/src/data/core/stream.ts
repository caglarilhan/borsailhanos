/**
 * P5.2: Real-time Data Stream Layer
 * Gerçek zamanlı veri besleme - Finnhub, Yahoo Finance entegrasyonu
 */

export interface PriceData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  timestamp: string;
  source: 'finnhub' | 'yfinance' | 'investing' | 'mock';
  marketCap?: number;
  peRatio?: number;
  dividendYield?: number;
}

export interface CandlestickData {
  symbol: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  interval: '1m' | '5m' | '15m' | '30m' | '1h' | '1d';
}

/**
 * Yahoo Finance API Client (Free, no API key required)
 */
export class YahooFinanceClient {
  private baseUrl = 'https://query1.finance.yahoo.com/v8/finance/chart';

  /**
   * Fetch real-time price data from Yahoo Finance
   * @param symbol - Stock symbol (e.g., 'XU030.IS' for BIST30)
   * @returns Price data or null if error
   */
  async getPrice(symbol: string): Promise<PriceData | null> {
    try {
      // Convert BIST symbols to Yahoo format
      const yahooSymbol = this.convertToYahooSymbol(symbol);
      const url = `${this.baseUrl}/${yahooSymbol}?interval=1d&range=1d`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      });

      if (!response.ok) {
        console.warn(`⚠️ Yahoo Finance API error for ${symbol}: ${response.status}`);
        return null;
      }

      const data = await response.json();
      const result = data.chart?.result?.[0];
      
      if (!result || !result.meta) {
        console.warn(`⚠️ Invalid Yahoo Finance data for ${symbol}`);
        return null;
      }

      const meta = result.meta;
      const currentPrice = meta.regularMarketPrice || meta.previousClose || 0;
      const previousClose = meta.previousClose || currentPrice;
      const change = currentPrice - previousClose;
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

      return {
        symbol,
        price: currentPrice,
        change,
        changePercent,
        volume: meta.regularMarketVolume || 0,
        high: meta.regularMarketDayHigh || currentPrice,
        low: meta.regularMarketDayLow || currentPrice,
        open: meta.regularMarketDayOpen || currentPrice,
        timestamp: new Date().toISOString(),
        source: 'yfinance',
        marketCap: meta.marketCap,
        peRatio: meta.trailingPE,
        dividendYield: meta.dividendYield ? meta.dividendYield * 100 : undefined,
      };
    } catch (error) {
      console.error(`❌ Yahoo Finance fetch error for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Fetch historical candlestick data
   * @param symbol - Stock symbol
   * @param interval - Time interval
   * @param period - Period (e.g., '1d', '5d', '1mo')
   * @returns Candlestick data array
   */
  async getCandlesticks(
    symbol: string,
    interval: '1m' | '5m' | '15m' | '30m' | '1h' | '1d' = '15m',
    period: '1d' | '5d' | '1mo' | '3mo' = '1d'
  ): Promise<CandlestickData[]> {
    try {
      const yahooSymbol = this.convertToYahooSymbol(symbol);
      const url = `${this.baseUrl}/${yahooSymbol}?interval=${interval}&range=${period}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      });

      if (!response.ok) {
        console.warn(`⚠️ Yahoo Finance candlestick API error: ${response.status}`);
        return [];
      }

      const data = await response.json();
      const result = data.chart?.result?.[0];
      
      if (!result || !result.timestamp || !result.indicators) {
        return [];
      }

      const timestamps = result.timestamp || [];
      const quotes = result.indicators.quote[0] || {};
      const opens = quotes.open || [];
      const highs = quotes.high || [];
      const lows = quotes.low || [];
      const closes = quotes.close || [];
      const volumes = quotes.volume || [];

      return timestamps.map((ts: number, i: number) => ({
        symbol,
        timestamp: new Date(ts * 1000).toISOString(),
        open: opens[i] || 0,
        high: highs[i] || 0,
        low: lows[i] || 0,
        close: closes[i] || 0,
        volume: volumes[i] || 0,
        interval,
      })).filter((c: CandlestickData) => c.close > 0);
    } catch (error) {
      console.error(`❌ Yahoo Finance candlestick fetch error:`, error);
      return [];
    }
  }

  /**
   * Convert BIST symbols to Yahoo Finance format
   */
  private convertToYahooSymbol(symbol: string): string {
    // BIST symbols need .IS suffix for Yahoo Finance
    if (!symbol.includes('.')) {
      return `${symbol}.IS`;
    }
    return symbol;
  }

  /**
   * Batch fetch prices for multiple symbols
   */
  async getBulkPrices(symbols: string[]): Promise<Map<string, PriceData>> {
    const results = new Map<string, PriceData>();
    
    // Yahoo Finance doesn't support batch requests, so fetch sequentially
    // Rate limit: ~100 requests/minute (add delay between requests)
    for (const symbol of symbols) {
      const data = await this.getPrice(symbol);
      if (data) {
        results.set(symbol, data);
      }
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }
}

/**
 * Finnhub API Client (Requires API key)
 */
export class FinnhubClient {
  private apiKey: string | null;
  private baseUrl = 'https://finnhub.io/api/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_FINNHUB_API_KEY || null;
  }

  /**
   * Fetch real-time quote from Finnhub
   */
  async getQuote(symbol: string): Promise<PriceData | null> {
    if (!this.apiKey) {
      console.warn('⚠️ Finnhub API key not configured');
      return null;
    }

    try {
      // Convert BIST symbol to Finnhub format
      const finnhubSymbol = this.convertToFinnhubSymbol(symbol);
      const url = `${this.baseUrl}/quote?symbol=${finnhubSymbol}&token=${this.apiKey}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`⚠️ Finnhub API error: ${response.status}`);
        return null;
      }

      const data = await response.json();
      
      if (data.error) {
        console.warn(`⚠️ Finnhub API error: ${data.error}`);
        return null;
      }

      const currentPrice = data.c || 0;
      const previousClose = data.pc || currentPrice;
      const change = currentPrice - previousClose;
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

      return {
        symbol,
        price: currentPrice,
        change,
        changePercent,
        volume: data.v || 0,
        high: data.h || currentPrice,
        low: data.l || currentPrice,
        open: data.o || currentPrice,
        timestamp: new Date().toISOString(),
        source: 'finnhub',
      };
    } catch (error) {
      console.error(`❌ Finnhub fetch error:`, error);
      return null;
    }
  }

  /**
   * Convert BIST symbols to Finnhub format
   */
  private convertToFinnhubSymbol(symbol: string): string {
    // Finnhub uses BIST symbols directly but may need different format
    return symbol.replace('.IS', '');
  }
}

/**
 * Multi-layer data fetcher (tries multiple sources with fallback)
 */
export class RealTimeDataFetcher {
  private yahooClient: YahooFinanceClient;
  private finnhubClient: FinnhubClient;

  constructor() {
    this.yahooClient = new YahooFinanceClient();
    this.finnhubClient = new FinnhubClient();
  }

  /**
   * Fetch price data with fallback chain: Finnhub → Yahoo Finance → Mock
   */
  async fetchPrice(symbol: string, useMock: boolean = false): Promise<PriceData> {
    // Try Finnhub first (if API key available)
    const finnhubData = await this.finnhubClient.getQuote(symbol);
    if (finnhubData) {
      return finnhubData;
    }

    // Fallback to Yahoo Finance
    const yahooData = await this.yahooClient.getPrice(symbol);
    if (yahooData) {
      return yahooData;
    }

    // Last resort: mock data (for testing)
    if (useMock) {
      return this.generateMockPrice(symbol);
    }

    // If all fails, return error state
    throw new Error(`Unable to fetch price data for ${symbol}`);
  }

  /**
   * Fetch candlestick data (Yahoo Finance preferred)
   */
  async fetchCandlesticks(
    symbol: string,
    interval: '1m' | '5m' | '15m' | '30m' | '1h' | '1d' = '15m',
    period: '1d' | '5d' | '1mo' | '3mo' = '1d'
  ): Promise<CandlestickData[]> {
    return await this.yahooClient.getCandlesticks(symbol, interval, period);
  }

  /**
   * Generate mock price data (fallback)
   */
  private generateMockPrice(symbol: string): PriceData {
    // Seeded random for consistency
    const seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    
    const basePrice = 100 + (random(seed) * 200);
    const change = (random(seed + 1) - 0.5) * 10;
    const price = basePrice + change;
    
    return {
      symbol,
      price,
      change,
      changePercent: (change / basePrice) * 100,
      volume: Math.floor(random(seed + 2) * 10000000),
      high: price + Math.abs(change) * 0.5,
      low: price - Math.abs(change) * 0.5,
      open: basePrice,
      timestamp: new Date().toISOString(),
      source: 'mock',
    };
  }

  /**
   * Fetch prices for BIST30 symbols in bulk
   */
  async fetchBIST30Prices(useMock: boolean = false): Promise<Map<string, PriceData>> {
    const bist30Symbols = [
      'THYAO', 'AKBNK', 'GARAN', 'ISCTR', 'YKBNK', 'SAHOL', 'EREGL', 'TCELL',
      'HALKB', 'TUPRS', 'ASELS', 'KOZAL', 'SASA', 'SISE', 'PETKM', 'BRISA',
      'VAKBN', 'ENKAI', 'TTKOM', 'TTRAK', 'OTKAR', 'MIGRS', 'TRKCM', 'TOASO',
      'BIMAS', 'FROTO', 'AYCES', 'ZOREN', 'SOKM', 'NETAS'
    ];

    const results = new Map<string, PriceData>();

    for (const symbol of bist30Symbols) {
      try {
        const data = await this.fetchPrice(symbol, useMock);
        results.set(symbol, data);
        // Rate limiting: small delay between requests
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`❌ Failed to fetch ${symbol}:`, error);
      }
    }

    return results;
  }
}

// Singleton instance
export const realTimeDataFetcher = new RealTimeDataFetcher();


