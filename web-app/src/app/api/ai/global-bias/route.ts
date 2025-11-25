import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

type SentimentAggregate = {
  bullish?: number;
  bearish?: number;
  neutral?: number;
};

type MarketRow = {
  symbol?: string;
  changePct?: number;
};

const rootDir = process.cwd();
const sentimentPath = path.join(rootDir, 'data', 'snapshots', 'us_sentiment_sample.json');
const marketPath = path.join(rootDir, 'data', 'snapshots', 'us_market_snapshot.json');

async function loadSentiment(): Promise<SentimentAggregate | null> {
  try {
    const raw = await fs.readFile(sentimentPath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed.aggregate || null;
  } catch (error) {
    return null;
  }
}

async function loadMarket(): Promise<MarketRow[]> {
  try {
    const raw = await fs.readFile(marketPath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.symbols) ? parsed.symbols : [];
  } catch (error) {
    return [];
  }
}

function computeGlobalBias(
  aggregate: SentimentAggregate | null,
  marketRows: MarketRow[]
) {
  const bullish = typeof aggregate?.bullish === 'number' ? aggregate.bullish : null;
  const bearish = typeof aggregate?.bearish === 'number' ? aggregate.bearish : null;
  const sentimentBias = bullish !== null && bearish !== null ? (bullish - bearish) * 100 : null;

  const sortedMarket = [...marketRows].sort((a, b) => (b.changePct || 0) - (a.changePct || 0));
  const leader = sortedMarket[0];
  const laggard = sortedMarket[sortedMarket.length - 1];
  const marketBias = leader && laggard && typeof leader.changePct === 'number' && typeof laggard.changePct === 'number'
    ? (leader.changePct + laggard.changePct) / 2
    : null;

  if (sentimentBias === null && marketBias === null) {
    return null;
  }
  const score = (sentimentBias ?? 0) * 0.6 + (marketBias ?? 0) * 0.4;
  const mode = score >= 15 ? 'risk_on' : score <= -15 ? 'risk_off' : 'neutral';
  const label = mode === 'risk_on' ? 'Risk-On' : mode === 'risk_off' ? 'Risk-Off' : 'Nötr';

  return {
    score,
    mode,
    label,
    sentimentBias,
    marketBias,
    leader: leader?.symbol,
    laggard: laggard?.symbol,
    updatedAt: new Date().toISOString(),
  };
}

export async function GET() {
  const aggregate = await loadSentiment();
  const marketRows = await loadMarket();
  const result = computeGlobalBias(aggregate, marketRows);

  if (!result) {
    return NextResponse.json({ score: null, mode: 'neutral', label: 'Nötr' });
  }

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 's-maxage=30, stale-while-revalidate=60',
    },
  });
}
