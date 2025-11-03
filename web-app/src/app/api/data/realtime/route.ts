/**
 * Real-Time Data API Endpoint
 * Sprint Final 1: Gerçek Veri Entegrasyonu - Finnhub/Yahoo Finance API
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:18085';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol') || 'THYAO';
    const source = searchParams.get('source') || 'yahoo'; // yahoo, finnhub, mock

    // Backend API'den gerçek veri çek
    const response = await fetch(`${API_BASE_URL}/api/data/realtime?symbol=${symbol}&source=${source}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      // Fallback: Mock data
      return NextResponse.json({
        symbol,
        price: 100 + Math.random() * 50,
        change: (Math.random() - 0.5) * 5,
        volume: Math.floor(Math.random() * 10000000),
        timestamp: new Date().toISOString(),
        source: 'mock',
      });
    }

    const data = await response.json();
    return NextResponse.json({
      ...data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Real-time data fetch error:', error);
    // Fallback: Mock data
    return NextResponse.json({
      symbol: 'THYAO',
      price: 100 + Math.random() * 50,
      change: (Math.random() - 0.5) * 5,
      volume: Math.floor(Math.random() * 10000000),
      timestamp: new Date().toISOString(),
      source: 'mock',
    });
  }
}

