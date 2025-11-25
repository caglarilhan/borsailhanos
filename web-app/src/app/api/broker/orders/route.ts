import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const payload = await request.json();
  return NextResponse.json({
    success: true,
    orders: [
      {
        broker: 'MockTrade',
        ...payload,
        status: 'accepted',
        order_id: `MOCK-${Date.now()}`,
      },
    ],
  });
}

