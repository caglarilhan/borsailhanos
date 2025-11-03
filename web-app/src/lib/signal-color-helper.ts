/**
 * Signal Color Helper
 * Fix: Sinyal Motoru - BUY/SELL/HOLD renk kodlaması + Confidence bazlı renkler
 * if conf > 0.8 → yeşil ; 0.7–0.8 → sarı ; < 0.7 → kırmızı
 */

export interface SignalColorConfig {
  signalColor: string; // Background color
  textColor: string; // Text color
  borderColor: string; // Border color
}

/**
 * Get signal badge color based on signal type
 */
export function getSignalBadgeColor(signal: 'BUY' | 'SELL' | 'HOLD'): SignalColorConfig {
  switch (signal) {
    case 'BUY':
      return {
        signalColor: 'bg-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
      };
    case 'SELL':
      return {
        signalColor: 'bg-red-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
      };
    case 'HOLD':
      return {
        signalColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-200',
      };
  }
}

/**
 * Get confidence color based on confidence level
 * >80% → yeşil ; 70–80% → sarı ; <70% → kırmızı
 */
export function getConfidenceColor(confidence: number): SignalColorConfig {
  const confPct = Math.round(confidence * 100);
  
  if (confPct >= 80) {
    return {
      signalColor: 'bg-green-100',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
    };
  } else if (confPct >= 70) {
    return {
      signalColor: 'bg-yellow-100',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200',
    };
  } else {
    return {
      signalColor: 'bg-red-100',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
    };
  }
}

/**
 * Get combined signal + confidence color
 */
export function getSignalConfidenceColor(signal: 'BUY' | 'SELL' | 'HOLD', confidence: number): SignalColorConfig {
  const confPct = Math.round(confidence * 100);
  
  // Priority: Confidence > Signal type
  if (confPct >= 80) {
    return {
      signalColor: 'bg-green-100',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
    };
  } else if (confPct >= 70) {
    return {
      signalColor: 'bg-yellow-100',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200',
    };
  } else {
    // Low confidence: Use signal color but darker
    return getSignalBadgeColor(signal);
  }
}

