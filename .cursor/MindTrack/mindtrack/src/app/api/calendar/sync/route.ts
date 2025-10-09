import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest) {
  // Stub: ileri sürümlerde Google Calendar API ile senkron yapılacak
  return NextResponse.json({ ok: true, message: 'Calendar sync stub' });
}




