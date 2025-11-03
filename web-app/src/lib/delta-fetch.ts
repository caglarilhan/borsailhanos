/**
 * P1-3: Delta-fetch (sadece değişen sinyaller)
 * Sadece değişen sinyalleri çekmek için mekanizma
 */

export interface SignalDelta {
  symbol: string;
  horizon: string;
  changed: boolean;
  changes: {
    signal?: 'BUY' | 'SELL' | 'HOLD';
    confidence?: number;
    prediction?: number;
    timestamp?: string;
  };
}

export interface DeltaResponse {
  newSignals: SignalDelta[];
  updatedSignals: SignalDelta[];
  unchangedCount: number;
  totalCount: number;
}

/**
 * Compare two signal objects and detect changes
 */
export function compareSignals(
  oldSignal: any,
  newSignal: any,
  fieldsToCompare: string[] = ['signal', 'confidence', 'prediction']
): boolean {
  if (!oldSignal || !newSignal) return true; // New or missing signal = changed
  
  // Compare specified fields
  return fieldsToCompare.some(field => {
    const oldValue = oldSignal[field];
    const newValue = newSignal[field];
    
    // Handle different types
    if (typeof oldValue === 'number' && typeof newValue === 'number') {
      // For numbers, consider significant change (threshold)
      if (field === 'confidence' || field === 'prediction') {
        return Math.abs(oldValue - newValue) > 0.01; // 1% threshold
      }
      return oldValue !== newValue;
    }
    
    return oldValue !== newValue;
  });
}

/**
 * Calculate delta between old and new signals
 */
export function calculateDelta(
  oldSignals: any[],
  newSignals: any[],
  keyFields: string[] = ['symbol', 'horizon']
): DeltaResponse {
  // Create a map of old signals for quick lookup
  const oldSignalMap = new Map<string, any>();
  oldSignals.forEach(signal => {
    const key = keyFields.map(field => signal[field]).join('|');
    oldSignalMap.set(key, signal);
  });
  
  const newSignalList: SignalDelta[] = [];
  const updatedSignalList: SignalDelta[] = [];
  let unchangedCount = 0;
  
  newSignals.forEach(newSignal => {
    const key = keyFields.map(field => newSignal[field]).join('|');
    const oldSignal = oldSignalMap.get(key);
    
    if (!oldSignal) {
      // New signal
      newSignalList.push({
        symbol: newSignal.symbol || '',
        horizon: newSignal.horizon || '',
        changed: true,
        changes: {
          signal: newSignal.prediction >= 0.02 ? 'BUY' : newSignal.prediction <= -0.02 ? 'SELL' : 'HOLD',
          confidence: newSignal.confidence,
          prediction: newSignal.prediction,
          timestamp: newSignal.generated_at || newSignal.timestamp,
        },
      });
    } else {
      // Check if signal changed
      const hasChanged = compareSignals(oldSignal, newSignal);
      
      if (hasChanged) {
        // Detect what changed
        const changes: any = {};
        
        const oldSignalValue = oldSignal.prediction >= 0.02 ? 'BUY' : oldSignal.prediction <= -0.02 ? 'SELL' : 'HOLD';
        const newSignalValue = newSignal.prediction >= 0.02 ? 'BUY' : newSignal.prediction <= -0.02 ? 'SELL' : 'HOLD';
        
        if (oldSignalValue !== newSignalValue) {
          changes.signal = newSignalValue;
        }
        
        if (Math.abs((oldSignal.confidence || 0) - (newSignal.confidence || 0)) > 0.01) {
          changes.confidence = newSignal.confidence;
        }
        
        if (Math.abs((oldSignal.prediction || 0) - (newSignal.prediction || 0)) > 0.01) {
          changes.prediction = newSignal.prediction;
        }
        
        updatedSignalList.push({
          symbol: newSignal.symbol || '',
          horizon: newSignal.horizon || '',
          changed: true,
          changes,
        });
      } else {
        unchangedCount++;
      }
    }
  });
  
  return {
    newSignals: newSignalList,
    updatedSignals: updatedSignalList,
    unchangedCount,
    totalCount: newSignals.length,
  };
}

/**
 * Store last signals for delta comparison
 */
const LAST_SIGNALS_KEY = 'api_last_signals';

export function storeLastSignals(signals: any[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(LAST_SIGNALS_KEY, JSON.stringify({
      signals,
      timestamp: Date.now(),
    }));
  } catch (e) {
    console.warn('Failed to store last signals:', e);
  }
}

export function getLastSignals(): any[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(LAST_SIGNALS_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    
    // Check if data is too old (older than 1 hour)
    const age = Date.now() - (parsed.timestamp || 0);
    if (age > 60 * 60 * 1000) {
      localStorage.removeItem(LAST_SIGNALS_KEY);
      return [];
    }
    
    return parsed.signals || [];
  } catch (e) {
    console.warn('Failed to get last signals:', e);
    return [];
  }
}

/**
 * Delta-fetch wrapper: only fetch changed signals
 */
export async function deltaFetch<T extends any[]>(
  fetchFn: () => Promise<T>,
  compareFn?: (old: T, fresh: T) => DeltaResponse
): Promise<{ data: T; delta: DeltaResponse }> {
  // Fetch fresh data
  const freshData = await fetchFn();
  
  // Get last stored signals
  const lastSignals = getLastSignals();
  
  // Calculate delta
  const delta = compareFn 
    ? compareFn(lastSignals, freshData)
    : calculateDelta(lastSignals, freshData);
  
  // Store fresh data for next comparison
  storeLastSignals(freshData);
  
  return {
    data: freshData,
    delta,
  };
}

/**
 * Filter signals by delta (only return changed signals)
 */
export function filterByDelta<T extends any[]>(
  signals: T,
  delta: DeltaResponse
): T {
  if (delta.newSignals.length === 0 && delta.updatedSignals.length === 0) {
    return [] as T;
  }
  
  // Get all changed signal keys
  const changedKeys = new Set<string>();
  delta.newSignals.forEach(s => {
    changedKeys.add(`${s.symbol}|${s.horizon}`);
  });
  delta.updatedSignals.forEach(s => {
    changedKeys.add(`${s.symbol}|${s.horizon}`);
  });
  
  // Filter signals
  return signals.filter((s: any) => {
    const key = `${s.symbol}|${s.horizon}`;
    return changedKeys.has(key);
  }) as T;
}


