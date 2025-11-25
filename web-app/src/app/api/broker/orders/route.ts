import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

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

