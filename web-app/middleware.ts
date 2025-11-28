import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || process.env.SECRETS_MASTER_KEY || 'default-secret-change-in-production'
);

/**
 * Verify JWT token from cookie
 */
async function verifyAuthToken(token: string): Promise<{ userId: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      role: payload.role as string,
    };
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get JWT token from cookie
  const authToken = request.cookies.get('auth_token')?.value;
  const sessionId = request.cookies.get('session_id')?.value;
  const userRoleCookie = request.cookies.get('user_role')?.value;
  
  console.log(`[MIDDLEWARE] ${pathname} - auth_token: ${authToken ? 'present' : 'missing'}, session_id: ${sessionId ? 'present' : 'missing'}, user_role: ${userRoleCookie || 'missing'}`);
  
  let userRole: string | null = null;
  let userId: string | null = null;

  if (authToken) {
    const verified = await verifyAuthToken(authToken);
    if (verified) {
      userRole = verified.role;
      userId = verified.userId;
      console.log(`[MIDDLEWARE] JWT verified - userId: ${userId}, role: ${userRole}`);
    } else {
      console.warn(`[MIDDLEWARE] JWT verification failed for token`);
    }
  }

  // Fallback to user_role cookie for backward compatibility
  if (!userRole) {
    userRole = userRoleCookie || null;
    if (userRole) {
      console.log(`[MIDDLEWARE] Using user_role cookie: ${userRole}`);
    }
  }

  // Admin route guard
  if (pathname.startsWith('/admin')) {
    if (userRole !== 'admin' && userRole !== 'Admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      const response = NextResponse.redirect(url);
      response.headers.set('x-admin-denied', 'true');
      return response;
    }
  }

  // Auth guard for protected routes
  if (pathname.startsWith('/feature') || pathname.startsWith('/settings') || pathname.startsWith('/dashboard')) {
    const hasAuth = authToken || sessionId;
    
    if (!hasAuth) {
      console.warn(`[MIDDLEWARE] No auth token or session_id found for ${pathname}, redirecting to login`);
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    } else {
      console.log(`[MIDDLEWARE] Auth check passed for ${pathname}`);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/feature/:path*',
    '/settings',
    '/dashboard/:path*',
  ],
};
