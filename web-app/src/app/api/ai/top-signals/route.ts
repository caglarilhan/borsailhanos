import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get('limit') || 5);
  const items = [
    { index: 'BIST 30', symbol: 'THYAO', action: 'BUY', comment: 'Momentum güçlü, RSI 68, pozitif sentiment.', horizon: '5g' },
    { index: 'BIST 30', symbol: 'EREGL', action: 'BUY', comment: 'Volatilite düşük, 7 günlük artış %4.2.', horizon: '5g' },
    { index: 'NASDAQ', symbol: 'NVDA', action: 'BUY', comment: 'AI segment lideri, tahmini %5 yükseliş.', horizon: '5g' },
    { index: 'NASDAQ', symbol: 'AAPL', action: 'HOLD', comment: 'Konsolidasyon, destek 190 $.', horizon: '5g' },
    { index: 'NASDAQ', symbol: 'TSLA', action: 'SELL', comment: 'Momentum negatif, risk yüksek.', horizon: '5g' },
  ].slice(0, Math.max(1, Math.min(10, limit)));
  return NextResponse.json({ updatedAt: Date.now(), items, accuracy: 0.842, window: '5g' });
}


