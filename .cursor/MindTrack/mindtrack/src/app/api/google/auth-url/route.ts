import { NextResponse } from 'next/server';
import { generateAuthUrl } from '@/lib/google-calendar';

export async function GET() {
  try {
    const url = generateAuthUrl();
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Google auth url error:', error);
    return NextResponse.json({ error: 'Failed to generate auth url' }, { status: 500 });
  }
}
