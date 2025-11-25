import { NextResponse } from 'next/server';
import { listOrders, placePaperOrder } from '@/lib/paperTradingStore';
import { placeAlpacaOrder, getAlpacaOrders } from '@/lib/alpacaClient';

function authorize(request: Request) {
  const token = process.env.PAPER_API_TOKEN;
  if (!token) return;
  const header = request.headers.get('x-paper-token');
  if (header !== token) {
    throw new Error('Unauthorized');
  }
}

export async function GET(request: Request) {
  try {
    authorize(request);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const useAlpaca = searchParams.get('useAlpaca') === 'true';
  
  // Alpaca kullanılıyorsa gerçek emir geçmişini döndür
  if (useAlpaca) {
    const orders = await getAlpacaOrders(undefined, 50);
    return NextResponse.json({ orders });
  }
  
  // Fallback: local paper trading store
  const userId = searchParams.get('userId') || 'paper-demo';
  const orders = await listOrders(userId, 50);
  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  try {
    authorize(request);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const useAlpaca = body.useAlpaca === true;
  const { symbol, action, quantity, price } = body;
  
  if (!symbol || !action || !quantity) {
    return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 });
  }
  
  // Alpaca kullanılıyorsa gerçek emir gönder
  if (useAlpaca) {
    try {
      const order = await placeAlpacaOrder({
        symbol: symbol.toUpperCase(),
        qty: Number(quantity),
        side: action.toLowerCase() as 'buy' | 'sell',
        order_type: price ? 'limit' : 'market',
        limit_price: price ? Number(price) : undefined,
      });
      return NextResponse.json({
        success: true,
        orderId: order?.id,
        status: order?.status,
        order,
      });
    } catch (error: any) {
      return NextResponse.json({ error: error?.message || 'Alpaca order failed' }, { status: 400 });
    }
  }
  
  // Fallback: local paper trading store
  const userId = body.userId || 'paper-demo';
  try {
    const result = await placePaperOrder({
      userId,
      symbol,
      action,
      quantity: Number(quantity),
      price: Number(price) || 0,
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Paper order failed' }, { status: 400 });
  }
}
