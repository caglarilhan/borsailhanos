/**
 * P1-2: API Cache Layer (TTL=15dk)
 * Browser-side cache (localStorage + IndexedDB) for API responses
 */

import { setWithTTL, getWithTTL, cleanExpiredItems } from './storage-ttl';

const CACHE_TTL_15_MIN = 15 * 60 * 1000; // 15 minutes in milliseconds
const CACHE_TTL_5_MIN = 5 * 60 * 1000; // 5 minutes for fast-changing data

export interface CacheConfig {
  ttl?: number;
  keyPrefix?: string;
  enableCache?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
}

class APICacheLayer {
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalRequests: 0,
  };

  /**
   * Generate cache key from URL and params
   */
  private getCacheKey(url: string, params?: Record<string, any>): string {
    const prefix = 'api_cache:';
    const urlKey = url.replace(/[^a-zA-Z0-9]/g, '_');
    if (params && Object.keys(params).length > 0) {
      const paramsKey = JSON.stringify(params).replace(/[^a-zA-Z0-9]/g, '_');
      return `${prefix}${urlKey}_${paramsKey}`;
    }
    return `${prefix}${urlKey}`;
  }

  /**
   * Get cached response
   */
  get<T>(url: string, params?: Record<string, any>): T | null {
    if (typeof window === 'undefined') return null; // SSR safe
    
    const cacheKey = this.getCacheKey(url, params);
    const cached = getWithTTL<T>(cacheKey);
    
    this.stats.totalRequests++;
    
    if (cached) {
      this.stats.hits++;
      this.updateHitRate();
      return cached;
    }
    
    this.stats.misses++;
    this.updateHitRate();
    return null;
  }

  /**
   * Set cached response
   */
  set<T>(url: string, data: T, config: CacheConfig = {}): void {
    if (typeof window === 'undefined') return; // SSR safe
    
    const { ttl = CACHE_TTL_15_MIN, enableCache = true } = config;
    if (!enableCache) return;
    
    const cacheKey = this.getCacheKey(url);
    setWithTTL(cacheKey, data, ttl);
  }

  /**
   * Invalidate cache for specific URL pattern
   */
  invalidate(pattern: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('api_cache:') && key.includes(pattern)) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('Failed to invalidate cache:', e);
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('api_cache:')) {
          localStorage.removeItem(key);
        }
      });
      this.stats = { hits: 0, misses: 0, hitRate: 0, totalRequests: 0 };
    } catch (e) {
      console.warn('Failed to clear cache:', e);
    }
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    if (this.stats.totalRequests > 0) {
      this.stats.hitRate = (this.stats.hits / this.stats.totalRequests) * 100;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Clean expired items (should be called periodically)
   */
  cleanup(): void {
    cleanExpiredItems();
  }
}

// Singleton instance
export const apiCache = new APICacheLayer();

/**
 * Cache wrapper for API functions
 */
export async function withCache<T>(
  url: string,
  fetchFn: () => Promise<T>,
  config: CacheConfig = {}
): Promise<T> {
  const { enableCache = true, ttl } = config;
  
  // Try to get from cache
  if (enableCache) {
    const cached = apiCache.get<T>(url);
    if (cached !== null) {
      return cached;
    }
  }
  
  // Fetch from API
  const data = await fetchFn();
  
  // Cache the response
  if (enableCache) {
    apiCache.set(url, data, { ttl });
  }
  
  return data;
}

/**
 * Determine TTL based on endpoint type
 */
export function getTTLForEndpoint(url: string): number {
  // Fast-changing data (5 minutes)
  if (url.includes('predictions') || url.includes('signals') || url.includes('realtime')) {
    return CACHE_TTL_5_MIN;
  }
  
  // Medium-changing data (10 minutes)
  if (url.includes('sentiment') || url.includes('metrics')) {
    return 10 * 60 * 1000;
  }
  
  // Slow-changing data (15 minutes)
  if (url.includes('overview') || url.includes('analysis') || url.includes('backtest')) {
    return CACHE_TTL_15_MIN;
  }
  
  // Default: 15 minutes
  return CACHE_TTL_15_MIN;
}

/**
 * Cleanup expired cache items periodically
 */
if (typeof window !== 'undefined') {
  // Cleanup every 5 minutes
  setInterval(() => {
    apiCache.cleanup();
  }, 5 * 60 * 1000);
}


