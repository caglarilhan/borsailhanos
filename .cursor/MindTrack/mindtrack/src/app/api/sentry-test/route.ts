import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  try {
    throw new Error('Sentry test error');
  } catch (e) {
    // Sentry NextJS SDK global handler yakalayacak
    return NextResponse.json({ ok: true, message: 'Error thrown for Sentry test' });
  }
}




