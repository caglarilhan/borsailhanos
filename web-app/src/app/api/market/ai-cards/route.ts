import { NextResponse } from 'next/server';
import type { AiPositionCard, AiPowerMetric } from '@/types/ai-power';

const DEFAULT_SYMBOLS = ['THYAO.IS', 'EREGL.IS', 'TUPRS.IS', 'AKBNK.IS', 'KRDMD.IS'];

function buildFallback(): { metrics: AiPowerMetric[]; positions: AiPositionCard[]; updatedAt: number } {
  const now = Date.now();
  const fallbackPositions: AiPositionCard[] = DEFAULT_SYMBOLS.map((symbol, idx) => ({
    symbol: symbol.replace('.IS', ''),
    action: idx % 3 === 0 ? 'BUY' : idx % 3 === 1 ? 'SELL' : 'HOLD',
    confidence: 0.65,
    entry: 200 + idx * 5,
    target: 205 + idx * 5,
    stop: 195 + idx * 5,
    rlLots: 200 + idx * 20,
    sentiment: 'neutral',
    sentimentScore: 0,
    comment: 'Twelve Data fallback',
    attentionFocus: ['Momentum', 'Volume'],
    regime: 'neutral',
  }));

  const fallbackMetrics: AiPowerMetric[] = [
    {
      title: 'Meta Ensemble',
      value: '%88',
      deltaLabel: 'Doğruluk',
      deltaValue: '+1.2pp',
      sublabel: 'TwelveData fallback',
      accent: '#0ea5e9',
      icon: '🧠',
    },
  ];

  return {
    metrics: fallbackMetrics,
    positions: fallbackPositions,
    updatedAt: now,
  };
}

export async function GET() {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(buildFallback(), { status: 200 });
  }

  try {
    const symbols = process.env.TWELVE_DATA_SYMBOLS?.split(',').map((s) => s.trim()).filter(Boolean) || DEFAULT_SYMBOLS;
    const params = new URLSearchParams({
      symbol: symbols.join(','),
      interval: '5min',
      outputsize: '2',
      timezone: 'Europe/Istanbul',
      apikey: apiKey,
    });

    const response = await fetch(`https://api.twelvedata.com/time_series?${params.toString()}`);
    if (!response.ok) {
      console.error('Twelve Data fetch failed:', response.status, response.statusText);
      return NextResponse.json(buildFallback(), { status: 200 });
    }

    const raw = await response.json();
    const positions: AiPositionCard[] = [];

    symbols.forEach((symbol) => {
      const data = raw[symbol];
      const values = Array.isArray(data?.values) ? data.values : [];
      if (values.length === 0) return;

      const latest = Number(values[0]?.close ?? 0);
      const previous = Number(values[1]?.close ?? latest);
      if (!latest || !previous) return;

      const change = latest - previous;
      const changePct = previous !== 0 ? (change / previous) * 100 : 0;
      const sentimentScore = Math.max(-1, Math.min(1, changePct / 10));

      positions.push({
        symbol: symbol.replace('.IS', ''),
        action: change >= 0 ? 'BUY' : 'SELL',
        confidence: Math.min(0.95, Math.abs(changePct) / 5 + 0.6),
        entry: Number(latest.toFixed(2)),
        target: Number((latest * (change >= 0 ? 1.02 : 0.98)).toFixed(2)),
        stop: Number((latest * (change >= 0 ? 0.98 : 1.02)).toFixed(2)),
        rlLots: Math.max(100, Math.round(500 * Math.random())),
        sentiment: sentimentScore > 0.1 ? 'positive' : sentimentScore < -0.1 ? 'negative' : 'neutral',
        sentimentScore,
        comment: `Twelve Data ${change >= 0 ? 'yükseliş' : 'gerileme'} sinyali (${changePct.toFixed(2)}%)`,
        attentionFocus: change >= 0 ? ['Momentum', 'Volume'] : ['Risk', 'Hedge'],
        regime: changePct > 0.5 ? 'risk-on' : changePct < -0.5 ? 'risk-off' : 'neutral',
      });
    });

    const averageChange =
      positions.reduce((acc, card) => {
        const entry = card.entry;
        const target = card.target;
        const pct = ((target - entry) / entry) * 100;
        return acc + pct;
      }, 0) / Math.max(1, positions.length);

    const metrics: AiPowerMetric[] = [
      {
        title: 'Twelve Data Momentum',
        value: `${averageChange >= 0 ? '+' : ''}${averageChange.toFixed(2)}%`,
        deltaLabel: 'Ortalama hedef',
        deltaValue: `${positions.length} hisse`,
        sublabel: '5 dk interval',
        accent: averageChange >= 0 ? '#10b981' : '#ef4444',
        icon: averageChange >= 0 ? '📈' : '⚠️',
      },
    ];

    return NextResponse.json({
      metrics,
      positions,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Twelve Data integration error:', error);
    return NextResponse.json(buildFallback(), { status: 200 });
  }
}


