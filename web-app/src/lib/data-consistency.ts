/**
 * P5.2: Data Consistency Utilities
 * Kritik buglar için tek kaynak fonksiyonlar
 */

/**
 * Remove duplicate symbols from predictions array
 * P0-C4: Aynı sembol iki kere listeleniyor (SISE iki kez) - Çözüm
 */
export function removeDuplicateSymbols<T extends { symbol: string }>(
  items: T[],
  getKey?: (item: T) => string
): T[] {
  const seen = new Set<string>();
  const unique: T[] = [];

  items.forEach((item) => {
    const key = getKey ? getKey(item) : item.symbol;
    
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  });

  return unique;
}

/**
 * Clamp sentiment percentage to 0-100
 * P0-C2: Sentiment yüzdesi uçmuş: "Sentiment Ort.: 4750.0%" - Çözüm
 */
export function clampSentimentPercent(value: number): number {
  // If value is already in 0-1 scale, convert to 0-100
  if (value >= 0 && value <= 1) {
    return Math.max(0, Math.min(100, value * 100));
  }
  
  // If value is in percentage scale, clamp to 0-100
  return Math.max(0, Math.min(100, value));
}

/**
 * Normalize sentiment array to sum to 100
 */
export function normalizeSentimentArray(positive: number, negative: number, neutral: number): {
  positive: number;
  negative: number;
  neutral: number;
} {
  // Clamp each value to 0-1 scale first
  const pos = clampSentimentPercent(positive) / 100;
  const neg = clampSentimentPercent(negative) / 100;
  const neu = clampSentimentPercent(neutral) / 100;

  const sum = pos + neg + neu;
  
  if (sum <= 0) {
    // Default to neutral if all zero
    return { positive: 0, negative: 0, neutral: 100 };
  }

  // Normalize to sum to 1
  return {
    positive: (pos / sum) * 100,
    negative: (neg / sum) * 100,
    neutral: (neu / sum) * 100,
  };
}

/**
 * Validate price and target consistency
 * P0-C1: "Gerçek Fiyat" 195,40 iken "30d hedef" 159,85 - Açıklama zorunlu
 */
export function validatePriceTargetConsistency(
  currentPrice: number,
  targetPrice: number,
  horizon: string,
  signal: 'BUY' | 'SELL' | 'HOLD'
): {
  isValid: boolean;
  explanation?: string;
  warning?: string;
} {
  if (!currentPrice || !targetPrice) {
    return { isValid: true }; // Cannot validate without prices
  }

  const priceChange = (targetPrice - currentPrice) / currentPrice;
  const percentChange = priceChange * 100;

  // For BUY signals, target should be higher than current
  if (signal === 'BUY' && targetPrice < currentPrice) {
    return {
      isValid: false,
      explanation: `${horizon} hedef fiyatı mevcut fiyatın altında. BUY sinyali için hedef fiyat yükselmeli.`,
      warning: '⚠️ Hedef fiyat çelişkisi',
    };
  }

  // For SELL signals, target should be lower than current
  if (signal === 'SELL' && targetPrice > currentPrice) {
    return {
      isValid: false,
      explanation: `${horizon} hedef fiyatı mevcut fiyatın üstünde. SELL sinyali için hedef fiyat düşmeli.`,
      warning: '⚠️ Hedef fiyat çelişkisi',
    };
  }

  // Check for extreme changes that might indicate data inconsistency
  if (Math.abs(percentChange) > 50) {
    return {
      isValid: true,
      warning: `%${Math.abs(percentChange).toFixed(1)} hedef değişimi çok yüksek - veri tutarlılığını kontrol edin.`,
    };
  }

  return { isValid: true };
}

/**
 * Check if user is admin (for showing mock API badges)
 * P0-C7: "Mock API v5.2" canlı ekranda görünmemeli - Çözüm
 */
export function shouldShowDebugInfo(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const isAdmin = localStorage.getItem('is_admin') === 'true';
    const isDev = process.env.NODE_ENV === 'development';
    return isAdmin || isDev;
  } catch {
    return false;
  }
}

/**
 * Format legal disclaimer text (remove command language)
 * P0-E: "Yatırım tavsiyesi değildir" ile emir dili çelişiyor - Çözüm
 */
export function formatLegalText(text: string): string {
  // Replace command language with suggestion language
  const replacements: Record<string, string> = {
    'küçük adımlarla artır': 'küçük adımlarla artırılabilir',
    'SL %3': 'stop-loss %3 seviyesi önerilir',
    'kapat': 'kapatılabilir',
    'al': 'alınabilir',
    'sat': 'satılabilir',
    'pozisyon aç': 'pozisyon açılabilir',
    'pozisyon kapat': 'pozisyon kapatılabilir',
  };

  let result = text;
  Object.entries(replacements).forEach(([cmd, suggestion]) => {
    result = result.replace(new RegExp(cmd, 'gi'), suggestion);
  });

  return result;
}

/**
 * Generate timeframe explanation for price target inconsistency
 */
export function generateTimeframeExplanation(
  shortHorizon: string,
  shortTarget: number,
  longHorizon: string,
  longTarget: number,
  currentPrice: number
): string {
  const shortChange = ((shortTarget - currentPrice) / currentPrice) * 100;
  const longChange = ((longTarget - currentPrice) / currentPrice) * 100;

  if (shortChange > 0 && longChange < 0) {
    return `${shortHorizon} için yükseliş hedefi var (%+${shortChange.toFixed(1)}), ancak ${longHorizon} için düşüş hedefi görülüyor (%${longChange.toFixed(1)}). Bu kısa vadeli pozitif momentumun uzun vadede zayıflayabileceğini gösterir.`;
  } else if (shortChange < 0 && longChange > 0) {
    return `${shortHorizon} için düşüş riski var (%${shortChange.toFixed(1)}), ancak ${longHorizon} için yükseliş hedefi görülüyor (%+${longChange.toFixed(1)}). Bu kısa vadeli düşüşün uzun vadede toparlanabileceğini gösterir.`;
  }

  return '';
}
