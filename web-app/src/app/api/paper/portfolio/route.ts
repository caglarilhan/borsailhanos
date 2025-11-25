import { NextResponse } from 'next/server';
import { ensurePortfolio, getPortfolio } from '@/lib/paperTradingStore';

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
  const portfolio = await getPortfolio(userId);
  if (!portfolio) {
    const created = await ensurePortfolio(userId);
    return NextResponse.json(created);
  }
  return NextResponse.json(portfolio);
}

export async function POST(request: Request) {
  try {
    authorize(request);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const userId = body.userId || 'paper-demo';
  const initialCash = typeof body.initialCash === 'number' ? body.initialCash : 100000;
  const portfolio = await ensurePortfolio(userId, initialCash);
  return NextResponse.json(portfolio);
}
