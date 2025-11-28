/**
 * Canonical Price Store API
 * Tek kaynak fiyat verisi endpoint'i
 */

import { NextResponse } from 'next/server';
import type { PriceData, Market, PriceSource } from '@/types/price-store';

const DEFAULT_SYMBOLS = ['THYAO.IS', 'EREGL.IS', 'TUPRS.IS', 'AKBNK.IS', 'KRDMD.IS', 'AAPL', 'MSFT', 'GOOGL'];

function detectMarket(symbol: string): Market {
  if (symbol.endsWith('.IS')) return 'BIST';
  if (['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA'].includes(symbol)) return 'NASDAQ';
  return 'NYSE';
}

function buildFallbackPrices(): PriceData[] {
  const now = Date.now();
  return DEFAULT_SYMBOLS.map((symbol, idx) => {
    const basePrice = symbol.endsWith('.IS') ? 200 + idx * 5 : 150 + idx * 10;
    const changePct = (Math.random() - 0.5) * 4; // -2% to +2%
    const change = (basePrice * changePct) / 100;
    
    return {
      symbol: symbol.replace('.IS', ''),
      market: detectMarket(symbol),
      price: Number(basePrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePct: Number(changePct.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 100000,
      timestamp: now,
      source: 'fallback' as PriceSource,
      rsi: 50 + (Math.random() - 0.5) * 20,
      ema20: basePrice * (1 + (Math.random() - 0.5) * 0.02),
      ema50: basePrice * (1 + (Math.random() - 0.5) * 0.03),
      high24h: basePrice * 1.02,
      low24h: basePrice * 0.98,
      open: basePrice * (1 + (Math.random() - 0.5) * 0.01),
      previousClose: basePrice - change,
    };
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get('symbols');
  const marketParam = searchParams.get('market') as Market | null;
  
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  const requestedSymbols = symbolsParam 
    ? symbolsParam.split(',').map(s => s.trim()).filter(Boolean)
    : DEFAULT_SYMBOLS;

  // If no API key, return fallback
  if (!apiKey) {
    const fallback = buildFallbackPrices();
    const filtered = marketParam 
      ? fallback.filter(p => p.market === marketParam)
      : fallback;
    
    return NextResponse.json({
      prices: filtered,
      lastUpdated: Date.now(),
      status: 'offline',
      primarySource: 'fallback' as PriceSource,
    }, {
      headers: {
        'Cache-Control': 's-maxage=30, stale-while-revalidate=60',
      },
    });
  }

  try {
    // Filter BIST symbols (Twelve Data format: SYMBOL.IS)
    const bistSymbols = requestedSymbols.filter(s => s.endsWith('.IS') || !s.includes('.'));
    const usSymbols = requestedSymbols.filter(s => !s.endsWith('.IS') && s.includes('.'));

    const prices: PriceData[] = [];
    const now = Date.now();

    // Fetch BIST symbols from Twelve Data
    if (bistSymbols.length > 0) {
      const symbolsForApi = bistSymbols.map(s => s.endsWith('.IS') ? s : `${s}.IS`);
      const params = new URLSearchParams({
        symbol: symbolsForApi.join(','),
        interval: '5min',
        outputsize: '2',
        timezone: 'Europe/Istanbul',
        apikey: apiKey,
      });

      const response = await fetch(`https://api.twelvedata.com/time_series?${params.toString()}`);
      
      if (response.ok) {
        const raw = await response.json();
        
        symbolsForApi.forEach((symbol) => {
          const data = raw[symbol];
          const values = Array.isArray(data?.values) ? data.values : [];
          if (values.length === 0) return;

          const latest = Number(values[0]?.close ?? 0);
          const previous = Number(values[1]?.close ?? latest);
          if (!latest || latest === 0) return;

          const change = latest - previous;
          const changePct = previous !== 0 ? (change / previous) * 100 : 0;

          prices.push({
            symbol: symbol.replace('.IS', ''),
            market: 'BIST',
            price: Number(latest.toFixed(2)),
            change: Number(change.toFixed(2)),
            changePct: Number(changePct.toFixed(2)),
            volume: Number(values[0]?.volume ?? 0),
            timestamp: now,
            source: 'live' as PriceSource,
            high24h: Number(values[0]?.high ?? latest),
            low24h: Number(values[0]?.low ?? latest),
            open: Number(values[0]?.open ?? latest),
            previousClose: previous,
          });
        });
      }
    }

    // If we have live prices, return them
    if (prices.length > 0) {
      const filtered = marketParam 
        ? prices.filter(p => p.market === marketParam)
        : prices;
      
      return NextResponse.json({
        prices: filtered,
        lastUpdated: now,
        status: 'live' as const,
        primarySource: 'live' as PriceSource,
      }, {
        headers: {
          'Cache-Control': 's-maxage=30, stale-while-revalidate=60',
        },
      });
    }

    // Fallback if no live data
    const fallback = buildFallbackPrices();
    const filtered = marketParam 
      ? fallback.filter(p => p.market === marketParam)
      : fallback;

    return NextResponse.json({
      prices: filtered,
      lastUpdated: now,
      status: 'degraded' as const,
      primarySource: 'fallback' as PriceSource,
    }, {
      headers: {
        'Cache-Control': 's-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('[PRICE_STORE_API] Error:', error);
    const fallback = buildFallbackPrices();
    const filtered = marketParam 
      ? fallback.filter(p => p.market === marketParam)
      : fallback;

    return NextResponse.json({
      prices: filtered,
      lastUpdated: Date.now(),
      status: 'offline' as const,
      primarySource: 'fallback' as PriceSource,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, {
      headers: {
        'Cache-Control': 's-maxage=30, stale-while-revalidate=60',
      },
    });
  }
}

