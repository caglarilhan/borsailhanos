/**
 * localStorage TTL (Time-To-Live) utility
 * Adds expiry mechanism to localStorage data
 */

interface StoredData<T> {
  data: T;
  expiry: number; // Unix timestamp in milliseconds
}

const TTL_24_HOURS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Set item with TTL
 */
export function setWithTTL<T>(key: string, value: T, ttl: number = TTL_24_HOURS): void {
  try {
    const item: StoredData<T> = {
      data: value,
      expiry: Date.now() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (e) {
    console.error(`Failed to set item with TTL: ${key}`, e);
  }
}

/**
 * Get item with TTL check
 * Returns null if expired or not found
 */
export function getWithTTL<T>(key: string): T | null {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item: StoredData<T> = JSON.parse(itemStr);
    
    // Check if expired
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key); // Clean up expired item
      return null;
    }

    return item.data;
  } catch (e) {
    console.error(`Failed to get item with TTL: ${key}`, e);
    return null;
  }
}

/**
 * Clean expired items (call periodically)
 */
export function cleanExpiredItems(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      try {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return;

        const item = JSON.parse(itemStr);
        if (item.expiry && Date.now() > item.expiry) {
          localStorage.removeItem(key);
        }
      } catch {
        // Skip non-TTL items or invalid JSON
      }
    });
  } catch (e) {
    console.error('Failed to clean expired items', e);
  }
}

