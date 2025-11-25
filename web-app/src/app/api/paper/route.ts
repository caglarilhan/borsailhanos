import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ error: 'Paper trading API not implemented' }, { status: 501 });
}
