import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Expected: { symbol, verdict: 'up'|'down', reason?, userId? }
    const event = {
      ...body,
      ts: Date.now(),
      ua: req.headers.get('user-agent') || 'unknown'
    };
    console.info('[feedback]', JSON.stringify(event));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}


