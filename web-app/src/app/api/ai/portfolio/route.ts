import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    updatedAt: Date.now(),
    allocation: [
      { symbol: 'THYAO', weight: 0.30 },
      { symbol: 'EREGL', weight: 0.25 },
      { symbol: 'AKBNK', weight: 0.20 },
      { symbol: 'NVDA', weight: 0.15 },
      { symbol: 'AAPL', weight: 0.10 },
    ],
    forecast: { days: 30, expectedReturnPct: 0.08, riskScore: 2.9, riskLabel: 'Düşük' },
    note: 'Tahmin penceresi: 30 gün • Meta-ensemble optimizasyonu',
  };
  return NextResponse.json(data);
}


