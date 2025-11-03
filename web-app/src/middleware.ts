import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // v4.6.1: Admin route guard - Enhanced security
  if (pathname.startsWith('/admin')) {
    // Gerçek implementasyonda: cookie veya JWT token'den role al
    const userRole = request.cookies.get('userRole')?.value || request.headers.get('x-user-role') || 'user';
    
    // Mock: admin role check (gerçek implementasyonda backend auth service kullanılmalı)
    if (userRole !== 'admin' && userRole !== 'Admin') {
      // Unauthorized: redirect to home with 403
      const url = request.nextUrl.clone();
      url.pathname = '/';
      const response = NextResponse.redirect(url);
      response.headers.set('x-admin-denied', 'true');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};

