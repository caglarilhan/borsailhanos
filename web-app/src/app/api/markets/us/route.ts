import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

interface UsMarketRow {
  symbol: string;
  price: number;
  changePct: number;
  volume: number;
  market?: string;
}

interface UsMarketSnapshot {
  generatedAt?: string;
  source?: string;
  symbols?: UsMarketRow[];
}

const rootDir = process.cwd();
const snapshotPath = path.join(rootDir, 'data', 'snapshots', 'us_market_snapshot.json');

const FALLBACK: UsMarketSnapshot = {
  generatedAt: new Date().toISOString(),
  source: 'mock-fallback',
  symbols: [
    { symbol: 'AAPL', price: 180.2, changePct: 0.8, volume: 31_000_000 },
    { symbol: 'MSFT', price: 418.5, changePct: -0.3, volume: 22_500_000 },
  ],
};

async function readSnapshot(): Promise<UsMarketSnapshot> {
  try {
    const file = await fs.readFile(snapshotPath, 'utf8');
    const payload = JSON.parse(file) as UsMarketSnapshot;
    if (!payload.symbols || payload.symbols.length === 0) {
      return FALLBACK;
    }
    return payload;
  } catch (error) {
    return FALLBACK;
  }
}

export async function GET() {
  const snapshot = await readSnapshot();
  return NextResponse.json(snapshot, {
    headers: {
      'Cache-Control': 's-maxage=60, stale-while-revalidate=120',
    },
  });
}
