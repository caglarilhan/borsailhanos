/**
 * JWT Token Utilities
 * Edge Runtime compatible JWT signing/verification using jose
 */

import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || process.env.SECRETS_MASTER_KEY || 'default-secret-change-in-production'
);

export interface JWTPayload {
  userId: string;
  role: 'admin' | 'trader' | 'guest';
  iat?: number;
  exp?: number;
}

/**
 * Sign JWT token
 */
export async function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d') // 30 days default
    .sign(JWT_SECRET);

  return token;
}

/**
 * Sign JWT token with custom expiration
 */
export async function signTokenWithExpiration(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  expiresIn: string | number
): Promise<string> {
  const expirationTime = typeof expiresIn === 'number' 
    ? `${expiresIn}s` 
    : expiresIn;

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch (error) {
    console.error('[JWT] Token verification failed:', error);
    return null;
  }
}

/**
 * Get JWT secret (for testing/debugging)
 */
export function getJWTSecret(): string {
  return process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || process.env.SECRETS_MASTER_KEY || 'default-secret-change-in-production';
}

