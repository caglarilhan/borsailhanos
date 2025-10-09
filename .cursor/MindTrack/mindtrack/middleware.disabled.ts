import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
  const now = Date.now();
  const key = `rl:${ip}`;
  // Basit in-memory rate limit (demo). Prod için KV/Redis önerilir.
  // @ts-ignore
  if (!globalThis.__rl) globalThis.__rl = new Map<string, number>();
  // @ts-ignore
  const last = globalThis.__rl.get(key) as number | undefined;
  if (last && now - last < 1000) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }
  // @ts-ignore
  globalThis.__rl.set(key, now);
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*']
};
