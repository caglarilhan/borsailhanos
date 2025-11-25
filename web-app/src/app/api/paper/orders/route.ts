import { NextResponse } from 'next/server';
import { listOrders, placePaperOrder } from '@/lib/paperTradingStore';

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
  const userId = body.userId || 'paper-demo';
  const { symbol, action, quantity, price } = body;
  if (!symbol || !action || !quantity || !price) {
    return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 });
  }
  try {
    const result = await placePaperOrder({
      userId,
      symbol,
      action,
      quantity: Number(quantity),
      price: Number(price),
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Paper order failed' }, { status: 400 });
  }
}
