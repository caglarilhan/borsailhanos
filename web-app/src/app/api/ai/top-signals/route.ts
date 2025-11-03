import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get('limit') || 5);
  const pool = [
    { index: 'BIST 30', symbol: 'THYAO', action: 'BUY', comment: 'Momentum güçlü, RSI 68, pozitif sentiment.', horizon: '5g' },
    { index: 'BIST 30', symbol: 'EREGL', action: 'BUY', comment: 'Volatilite düşük, 7 günlük artış %4.2.', horizon: '5g' },
    { index: 'BIST 30', symbol: 'AKBNK', action: 'BUY', comment: 'Derinlik güçlü, spread dar, volatilite kontrol altında.', horizon: '5g' },
    { index: 'BIST 30', symbol: 'SISE', action: 'HOLD', comment: 'Destek üstünde konsolidasyon, haber akışı nötr.', horizon: '5g' },
    { index: 'NASDAQ', symbol: 'NVDA', action: 'BUY', comment: 'AI segment lideri, tahmini %5 yükseliş.', horizon: '5g' },
    { index: 'NASDAQ', symbol: 'AAPL', action: 'HOLD', comment: 'Konsolidasyon, destek 190 $.', horizon: '5g' },
    { index: 'NASDAQ', symbol: 'TSLA', action: 'SELL', comment: 'Momentum negatif, risk yüksek.', horizon: '5g' },
  ];
  // Kota: BIST 30'dan en az 3, NASDAQ'tan en az 2 öneri
  const bist = pool.filter(x => x.index.includes('BIST')).slice(0, 3);
  const nasdaq = pool.filter(x => x.index.includes('NASDAQ')).slice(0, 2);
  let items = [...bist, ...nasdaq];
  if (items.length < limit) {
    const rest = pool.filter(x => !items.find(y => y.symbol === x.symbol)).slice(0, limit - items.length);
    items = [...items, ...rest];
  }
  items = items.slice(0, Math.max(1, Math.min(10, limit)));
  return NextResponse.json({ updatedAt: Date.now(), items, accuracy: 0.842, window: '5g' });
}


