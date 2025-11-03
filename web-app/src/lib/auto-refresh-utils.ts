/**
 * Auto Refresh Utilities
 * Health Check Fix: Veri Katmanı - Real-time refresh (60s interval)
 * 60 saniyelik throttle refresh mekanizması
 */

/**
 * Throttled refresh function
 * @param callback - Function to call on refresh
 * @param intervalMs - Interval in milliseconds (default: 60000 = 60s)
 * @returns Cleanup function
 */
export function useThrottledRefresh(
  callback: () => void,
  intervalMs: number = 60000
): () => void {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  const throttledCallback = () => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= intervalMs) {
      lastCall = now;
      callback();
    } else {
      // Schedule callback for remaining time
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        callback();
      }, intervalMs - timeSinceLastCall);
    }
  };

  // Cleanup function
  return () => {
    if (timeoutId) clearTimeout(timeoutId);
  };
}

/**
 * React hook for throttled refresh
 */
export function useAutoRefresh(
  callback: () => void,
  intervalMs: number = 60000
): void {
  const { useEffect } = require('react');
  
  useEffect(() => {
    const interval = setInterval(() => {
      callback();
    }, intervalMs);
    
    return () => clearInterval(interval);
  }, [callback, intervalMs]);
}

/**
 * Real-time data refresh with exponential backoff
 */
export class RealTimeRefresh {
  private interval: number;
  private callback: () => void;
  private currentInterval: NodeJS.Timeout | null = null;
  private backoffMultiplier: number = 1;
  private maxBackoff: number = 300000; // 5 minutes

  constructor(callback: () => void, initialInterval: number = 60000) {
    this.callback = callback;
    this.interval = initialInterval;
  }

  start(): void {
    this.stop(); // Ensure no duplicate intervals
    this.currentInterval = setInterval(() => {
      try {
        this.callback();
        this.backoffMultiplier = 1; // Reset on success
      } catch (error) {
        console.error('Refresh error:', error);
        // Exponential backoff on error
        this.backoffMultiplier = Math.min(
          this.backoffMultiplier * 2,
          this.maxBackoff / this.interval
        );
        this.restart();
      }
    }, this.interval * this.backoffMultiplier);
  }

  stop(): void {
    if (this.currentInterval) {
      clearInterval(this.currentInterval);
      this.currentInterval = null;
    }
  }

  restart(): void {
    this.stop();
    this.start();
  }

  setInterval(intervalMs: number): void {
    this.interval = intervalMs;
    this.restart();
  }
}

