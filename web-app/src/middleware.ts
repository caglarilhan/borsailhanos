import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin route guard
  if (pathname.startsWith('/admin')) {
    // Gerçek implementasyonda: cookie veya JWT token'den role al
    const userRole = request.cookies.get('userRole')?.value || 'user';
    
    // Mock: admin role check (gerçek implementasyonda backend auth service kullanılmalı)
    if (userRole !== 'admin' && userRole !== 'Admin') {
      // Unauthorized: redirect to home
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};

