/**
 * CSRF Token Endpoint
 * Generates CSRF token for login forms
 * OWASP-level security
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const CSRF_TOKEN_COOKIE = 'csrf_token';
const CSRF_TOKEN_MAX_AGE = 3600; // 1 hour

export async function GET() {
  try {
    const cookieStore = await cookies();
    let token = cookieStore.get(CSRF_TOKEN_COOKIE)?.value;

    // Generate new token if not exists or expired
    if (!token) {
      token = crypto.randomBytes(32).toString('hex');
    }

    // Set CSRF token cookie
    const response = NextResponse.json({ token });
    response.cookies.set(CSRF_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: CSRF_TOKEN_MAX_AGE,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { error: 'Token oluşturulamadı' },
      { status: 500 }
    );
  }
}

