import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { placeAlpacaOrder } from '@/lib/alpacaClient';

function authorize(request: Request) {
  const token = process.env.PAPER_API_TOKEN;
  if (!token) return;
  const header = request.headers.get('x-paper-token');
  if (header !== token) {
    throw new Error('Unauthorized');
  }
}

export async function POST(request: Request) {
  try {
    authorize(request);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const payload = await request.json();
  const useAlpaca = payload.useAlpaca !== false; // Default: true
  
  // Alpaca kullanılıyorsa gerçek emir gönder
  if (useAlpaca && payload.symbol && payload.action && payload.quantity) {
    try {
      const requestedType =
        typeof payload.order_type === 'string'
          ? payload.order_type.toLowerCase()
          : undefined;
      const alpacaOrderType = requestedType || (payload.price ? 'limit' : 'market');
      let limitPrice: number | undefined;
      let stopPrice: number | undefined;
      if (payload.price) {
        const numericPrice = Number(payload.price);
        if (alpacaOrderType === 'limit') {
          limitPrice = numericPrice;
        } else if (alpacaOrderType === 'stop') {
          stopPrice = numericPrice;
        } else if (alpacaOrderType === 'stop_limit') {
          limitPrice = numericPrice;
          stopPrice = numericPrice;
        } else {
          limitPrice = numericPrice;
        }
      }
      const order = await placeAlpacaOrder({
        symbol: payload.symbol.toUpperCase(),
        qty: Number(payload.quantity),
        side: payload.action.toLowerCase() as 'buy' | 'sell',
        order_type: alpacaOrderType as 'market' | 'limit' | 'stop' | 'stop_limit',
        limit_price: limitPrice,
        stop_price: stopPrice,
      });
      
      const orderLog = {
        broker: 'Alpaca',
        ...payload,
        alpaca_order_id: order?.id,
        status: order?.status || 'submitted',
        order_id: order?.id || `ALPACA-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
      
      // Log to file
      try {
        const rootDir = process.cwd();
        const logDir = path.join(rootDir, 'logs');
        const logPath = path.join(logDir, 'ai_order_history.jsonl');
        await fs.mkdir(logDir, { recursive: true });
        await fs.appendFile(logPath, JSON.stringify(orderLog) + '\n', 'utf8');
      } catch (error) {
        console.warn('AI order log write failed', error);
      }
      
      return NextResponse.json({
        success: true,
        orders: [orderLog],
      });
    } catch (error: unknown) {
      console.error('Alpaca order error:', error);
      // Fallback to mock on error
    }
  }
  
  // Fallback: Mock order
  const order = {
    broker: 'MockTrade',
    ...payload,
    status: 'accepted',
    order_id: `MOCK-${Date.now()}`,
  };

  try {
    const rootDir = process.cwd();
    const logDir = path.join(rootDir, 'logs');
    const logPath = path.join(logDir, 'ai_order_history.jsonl');
    await fs.mkdir(logDir, { recursive: true });
    await fs.appendFile(logPath, JSON.stringify({ ...order, timestamp: new Date().toISOString() }) + '\n', 'utf8');
  } catch (error) {
    console.warn('AI order log write failed', error);
  }

  return NextResponse.json({
    success: true,
    orders: [order],
  });
}

