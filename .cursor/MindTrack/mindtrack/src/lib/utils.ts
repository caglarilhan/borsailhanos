import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Lightweight in-memory LRU cache with TTL support
// - Uses Map iteration order to approximate LRU behavior
// - Each entry stores value and optional expiration timestamp
// - Suitable for per-instance server runtime caching (non-distributed)
export class LRUCache<K, V> {
  private readonly maxEntries: number
  private readonly store: Map<K, { value: V; expiresAt?: number }>

  constructor(maxEntries: number = 200) {
    this.maxEntries = Math.max(1, maxEntries)
    this.store = new Map()
  }

  get(key: K): V | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      // Expired: remove and miss
      this.store.delete(key)
      return undefined
    }

    // Touch: move to the end (most recently used)
    this.store.delete(key)
    this.store.set(key, entry)
    return entry.value
  }

  set(key: K, value: V, ttlMs?: number): void {
    const expiresAt = ttlMs && ttlMs > 0 ? Date.now() + ttlMs : undefined

    if (this.store.has(key)) {
      this.store.delete(key)
    }
    this.store.set(key, { value, expiresAt })

    // Evict oldest if over capacity
    if (this.store.size > this.maxEntries) {
      const oldestKey = this.store.keys().next().value
      if (oldestKey !== undefined) this.store.delete(oldestKey)
    }
  }

  has(key: K): boolean {
    return this.get(key) !== undefined
  }

  delete(key: K): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }
}

// Global cache instance for server runtime (note: not distributed)
// Safe for caching computed analytics and static config per-request window
export const globalLRUCache = new LRUCache<string, unknown>(300)
