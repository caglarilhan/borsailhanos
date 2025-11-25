import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

type SentimentLabel = 'positive' | 'neutral' | 'negative';

interface SentimentRow {
  symbol: string;
  headline: string;
  sentiment: SentimentLabel;
  score: number;
  confidence: number;
  summary: string;
  topics: string[];
  model: string;
  sourceUrl?: string;
}

interface SentimentPayload {
  generatedAt: string;
  source: string;
  items: SentimentRow[];
  aggregate?: {
    bullish: number;
    bearish: number;
    neutral: number;
    topSectors: { name: string; weight: number }[];
  };
}

const rootDir = process.cwd();
const dataPath = path.join(rootDir, 'data', 'snapshots', 'us_sentiment_sample.json');

const FALLBACK: SentimentPayload = {
  generatedAt: new Date().toISOString(),
  source: 'mock-fallback',
  items: [
    {
      symbol: 'AAPL',
      headline: 'Apple AI Suite 3.0',
      sentiment: 'positive',
      score: 0.42,
      confidence: 0.81,
      summary: 'Yeni on-device AI, iPhone satışlarını hızlandırabilir.',
      topics: ['AI', 'Hardware'],
      model: 'ProsusAI/finbert',
    },
  ],
  aggregate: {
    bullish: 0.55,
    bearish: 0.2,
    neutral: 0.25,
    topSectors: [
      { name: 'AI', weight: 0.4 },
      { name: 'Fintech', weight: 0.22 },
    ],
  },
};

async function readPayload(): Promise<SentimentPayload> {
  try {
    const data = await fs.readFile(dataPath, 'utf8');
    const parsed = JSON.parse(data) as SentimentPayload;
    return parsed;
  } catch (error) {
    return FALLBACK;
  }
}

export async function GET() {
  const payload = await readPayload();
  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
    },
  });
}
