/**
 * Login API Endpoint
 * OWASP-level security:
 * - CSRF protection
 * - Rate limiting
 * - Password hashing (Argon2id)
 * - Session management
 * - Audit logging
 * - Generic error messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX_ATTEMPTS = 10;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Session store (in production, use Redis or database)
const sessionStore = new Map<string, { userId: string; expiresAt: number }>();

interface LoginRequest {
  username: string;
  password: string;
  remember: boolean;
}

/**
 * Get client identifier for rate limiting
 */
function getClientId(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `${ip}:${userAgent}`;
}

/**
 * Check rate limit
 */
function checkRateLimit(clientId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(clientId);

  if (!record || record.resetAt < now) {
    // Reset or create new record
    rateLimitStore.set(clientId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true };
  }

  if (record.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Increment count
  record.count++;
  rateLimitStore.set(clientId, record);

  return { allowed: true };
}

/**
 * Verify CSRF token
 */
async function verifyCSRFToken(request: NextRequest): Promise<boolean> {
  const token = request.headers.get('X-CSRF-Token');
  if (!token) return false;

  const cookieStore = await cookies();
  const cookieToken = cookieStore.get('csrf_token')?.value;

  return token === cookieToken;
}

/**
 * Verify password (mock - in production, use Argon2id)
 * TODO: Replace with actual Argon2id verification against database
 */
async function verifyPassword(username: string, password: string): Promise<boolean> {
  // Mock verification - in production, hash password and compare with database
  // Example: const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });
  // const storedHash = await getUserPasswordHash(username);
  // return await argon2.verify(storedHash, password);
  
  // For now, simple mock (REMOVE IN PRODUCTION)
  return username.length >= 3 && password.length >= 8;
}

/**
 * Create session
 */
function createSession(userId: string, remember: boolean): string {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiresAt = remember
    ? Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
    : Date.now() + 24 * 60 * 60 * 1000; // 1 day

  sessionStore.set(sessionId, { userId, expiresAt });

  return sessionId;
}

/**
 * Audit log (in production, write to database/logging service)
 */
function auditLog(
  event: 'login_success' | 'login_failed',
  username: string,
  request: NextRequest
): void {
  const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  console.log(`[AUDIT] ${event}: username=${username}, ip=${ip}, userAgent=${userAgent}`);
  
  // In production, write to secure logging service (e.g., CloudWatch, Datadog)
}

export async function POST(request: NextRequest) {
  try {
    // Verify CSRF token
    const csrfValid = await verifyCSRFToken(request);
    if (!csrfValid) {
      return NextResponse.json(
        { error: 'Kullanıcı adı veya parola hatalı. Tekrar deneyin.' },
        { status: 403 }
      );
    }

    // Rate limiting
    const clientId = getClientId(request);
    const rateLimit = checkRateLimit(clientId);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin.',
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter),
          },
        }
      );
    }

    // Parse request body
    const body: LoginRequest = await request.json();
    const { username, password, remember } = body;

    // Validate input
    if (!username || !password) {
      auditLog('login_failed', username || 'unknown', request);
      return NextResponse.json(
        { error: 'Kullanıcı adı veya parola hatalı. Tekrar deneyin.' },
        { status: 400 }
      );
    }

    // Normalize timing to prevent timing attacks
    const startTime = Date.now();
    const isValid = await verifyPassword(username.trim(), password);
    const elapsed = Date.now() - startTime;
    
    // Fixed delay to prevent timing attacks (min 500ms)
    const fixedDelay = Math.max(500 - elapsed, 0);
    await new Promise(resolve => setTimeout(resolve, fixedDelay));

    if (!isValid) {
      auditLog('login_failed', username, request);
      return NextResponse.json(
        { error: 'Kullanıcı adı veya parola hatalı. Tekrar deneyin.' },
        { status: 401 }
      );
    }

    // Create session
    const userId = username; // In production, get actual user ID from database
    const sessionId = createSession(userId, remember);

    // Set session cookie
    const cookieStore = await cookies();
    const response = NextResponse.json({
      success: true,
      redirect: '/',
    });

    response.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 1 day
      path: '/',
    });

    // Audit success
    auditLog('login_success', username, request);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}

