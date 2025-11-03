/**
 * P5.2: Data Latency Tracker
 * Data latency etiketi ekle ("Delay: 15s" gibi)
 */

export interface DataLatency {
  symbol: string;
  timestamp: string; // Last update timestamp
  delay: number; // Delay in milliseconds
  status: 'fresh' | 'delayed' | 'stale' | 'error';
}

export interface LatencyStatus {
  delay: number; // Milliseconds
  delaySeconds: number; // Seconds (rounded)
  status: 'fresh' | 'delayed' | 'stale' | 'error';
  color: string;
  label: string;
}

/**
 * Calculate data latency
 */
export function calculateLatency(lastUpdate: string | Date): LatencyStatus {
  const now = new Date();
  const last = typeof lastUpdate === 'string' ? new Date(lastUpdate) : lastUpdate;
  
  if (isNaN(last.getTime())) {
    return {
      delay: Infinity,
      delaySeconds: Infinity,
      status: 'error',
      color: 'text-red-600',
      label: 'Veri yok',
    };
  }

  const delay = now.getTime() - last.getTime();
  const delaySeconds = Math.round(delay / 1000);

  let status: 'fresh' | 'delayed' | 'stale' | 'error' = 'fresh';
  let color = 'text-green-600';
  let label = '';

  if (delaySeconds < 5) {
    status = 'fresh';
    color = 'text-green-600';
    label = `${delaySeconds}s`;
  } else if (delaySeconds < 30) {
    status = 'delayed';
    color = 'text-yellow-600';
    label = `${delaySeconds}s`;
  } else if (delaySeconds < 300) {
    status = 'stale';
    color = 'text-orange-600';
    label = `${delaySeconds}s`;
  } else {
    status = 'error';
    color = 'text-red-600';
    label = `${Math.round(delaySeconds / 60)}dk`;
  }

  return {
    delay,
    delaySeconds,
    status,
    color,
    label,
  };
}

/**
 * Format latency label
 */
export function formatLatencyLabel(latency: LatencyStatus): string {
  if (latency.status === 'error') {
    return 'Veri yok';
  }
  
  return `Delay: ${latency.label}`;
}


