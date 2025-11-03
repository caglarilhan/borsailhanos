/**
 * P1-4: Rate-limit + CORS güvenlik
 * Client-side rate limiting for API calls
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  strategy?: 'sliding' | 'fixed'; // sliding window or fixed window
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Default rate limit configs by endpoint type
 */
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  predictions: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 req/min
  signals: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 req/min
  sentiment: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 req/min
  backtest: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 req/min
  default: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 req/min (burst)
};

class RateLimiter {
  private requests: Map<string, number[]> = new Map(); // endpoint -> timestamps[]

  /**
   * Check if request is allowed
   */
  check(endpoint: string, config?: RateLimitConfig): RateLimitResult {
    const now = Date.now();
    const limitConfig = config || this.getConfigForEndpoint(endpoint);
    
    // Get request history for this endpoint
    let requestHistory = this.requests.get(endpoint) || [];
    
    // Clean old requests outside the window
    const windowStart = now - limitConfig.windowMs;
    requestHistory = requestHistory.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    const remaining = Math.max(0, limitConfig.maxRequests - requestHistory.length);
    const allowed = remaining > 0;
    
    // Calculate reset time
    const oldestRequest = requestHistory[0];
    const resetTime = oldestRequest ? oldestRequest + limitConfig.windowMs : now + limitConfig.windowMs;
    
    // Calculate retry after (if not allowed)
    const retryAfter = allowed ? undefined : Math.ceil((resetTime - now) / 1000);
    
    return {
      allowed,
      remaining,
      resetTime,
      retryAfter,
    };
  }

  /**
   * Record a request
   */
  record(endpoint: string): void {
    const now = Date.now();
    const requestHistory = this.requests.get(endpoint) || [];
    requestHistory.push(now);
    this.requests.set(endpoint, requestHistory);
  }

  /**
   * Get config for endpoint type
   */
  private getConfigForEndpoint(endpoint: string): RateLimitConfig {
    // Check endpoint type
    if (endpoint.includes('predictions') || endpoint.includes('signals')) {
      return RATE_LIMIT_CONFIGS.predictions;
    }
    if (endpoint.includes('sentiment')) {
      return RATE_LIMIT_CONFIGS.sentiment;
    }
    if (endpoint.includes('backtest')) {
      return RATE_LIMIT_CONFIGS.backtest;
    }
    return RATE_LIMIT_CONFIGS.default;
  }

  /**
   * Clear rate limit history
   */
  clear(endpoint?: string): void {
    if (endpoint) {
      this.requests.delete(endpoint);
    } else {
      this.requests.clear();
    }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Rate limit wrapper for API calls
 */
export async function withRateLimit<T>(
  endpoint: string,
  fetchFn: () => Promise<T>,
  config?: RateLimitConfig
): Promise<T> {
  // Check rate limit
  const checkResult = rateLimiter.check(endpoint, config);
  
  if (!checkResult.allowed) {
    throw new Error(
      `Rate limit exceeded for ${endpoint}. Retry after ${checkResult.retryAfter}s. ` +
      `Limit: ${config?.maxRequests || RATE_LIMIT_CONFIGS.default.maxRequests} requests per ${config?.windowMs || 60000}ms`
    );
  }
  
  // Record request
  rateLimiter.record(endpoint);
  
  // Execute fetch
  try {
    return await fetchFn();
  } catch (error) {
    // On error, don't count towards rate limit (optional: could be configurable)
    // For now, we keep the record to prevent retry spam
    throw error;
  }
}

/**
 * Exponential backoff for retries
 */
export async function withRetry<T>(
  fetchFn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on rate limit (too many retries will hit rate limit again)
      if (error.message?.includes('Rate limit exceeded')) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * CORS validation (client-side check)
 */
export function validateCORS(url: string, allowedOrigins: string[] = []): boolean {
  if (typeof window === 'undefined') return true; // SSR safe
  
  try {
    const urlObj = new URL(url);
    const origin = window.location.origin;
    
    // Same origin is always allowed
    if (urlObj.origin === origin) {
      return true;
    }
    
    // Check against allowed origins
    if (allowedOrigins.length > 0) {
      return allowedOrigins.includes(urlObj.origin);
    }
    
    // Default: allow (browser will enforce CORS)
    return true;
  } catch (e) {
    console.warn('Failed to validate CORS:', e);
    return false;
  }
}


