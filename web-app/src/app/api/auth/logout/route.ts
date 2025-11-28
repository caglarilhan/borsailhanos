'use server';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const response = NextResponse.json({ success: true });
  const expiredCookie = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 0,
    path: '/',
  };

  const store = await cookies();
  
  // Clear JWT token
  if (store.get('auth_token')) {
    response.cookies.set('auth_token', '', expiredCookie);
  }
  
  // Clear legacy session cookies (backward compatibility)
  if (store.get('session_id')) {
    response.cookies.set('session_id', '', expiredCookie);
  }
  if (store.get('user_role')) {
    response.cookies.set('user_role', '', expiredCookie);
  }

  return response;
}


