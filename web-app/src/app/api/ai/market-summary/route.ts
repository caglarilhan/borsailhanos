import { NextResponse } from 'next/server';

export async function GET() {
  // Mock demo data: FinBERT-TR + MetaModel-US agregasyonunun özetlenmiş hali
  const now = Date.now();
  const data = {
    updatedAt: now,
    indices: [
      { name: 'BIST 100', code: 'BIST', stance: 'positive', confidence: 0.68 },
      { name: 'NASDAQ', code: 'NASDAQ', stance: 'neutral', confidence: 0.54 },
      { name: 'S&P 500', code: 'SPX', stance: 'positive', confidence: 0.61 },
    ],
    sectors: [
      { name: 'Teknoloji', changePct: 0.032 },
      { name: 'Enerji', changePct: -0.011 },
    ],
    source: 'FinBERT-TR & FinGPT-US',
  };
  return NextResponse.json(data);
}


