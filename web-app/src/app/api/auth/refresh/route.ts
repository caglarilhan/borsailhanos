/**
 * Refresh Token Endpoint
 * - Rotates session_id cookie (simple rotation mock)
 * - Echoes user role from cookie
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const oldSession = cookieStore.get('session_id')?.value;
    const role = cookieStore.get('user_role')?.value || 'trader';

    if (!oldSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newSession = crypto.randomBytes(32).toString('hex');

    const response = NextResponse.json({ success: true, user: { role } });
    response.cookies.set('session_id', newSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes short-lived
      path: '/',
    });

    return response;
  } catch (e) {
    return NextResponse.json({ error: 'Refresh failed' }, { status: 500 });
  }
}


