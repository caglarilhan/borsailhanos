/**
 * P0-6: FinBERT Çıktısı Normalizasyonu
 * Sentiment toplamını 100%'e normalize etme
 */

export interface SentimentValues {
  positive: number;
  negative: number;
  neutral: number;
}

/**
 * Sentiment değerlerini normalize et (toplam 100%)
 */
export function normalizeSentiment(values: SentimentValues): SentimentValues {
  const { positive, negative, neutral } = values;
  
  // Negatif değerleri 0'a clamp et
  const pos = Math.max(0, positive);
  const neg = Math.max(0, negative);
  const neu = Math.max(0, neutral);
  
  const total = pos + neg + neu;
  
  // Toplam 0 ise, eşit dağıt (33.3% her biri)
  if (total === 0 || !isFinite(total)) {
    return {
      positive: 33.33,
      negative: 33.33,
      neutral: 33.34, // Toplam 100 için
    };
  }
  
  // Normalize et (toplam 100%)
  return {
    positive: Number(((pos / total) * 100).toFixed(1)),
    negative: Number(((neg / total) * 100).toFixed(1)),
    neutral: Number(((neu / total) * 100).toFixed(1)),
  };
}

/**
 * Sentiment array'ini normalize et
 */
export function normalizeSentimentArray(
  sentiments: Array<{ symbol: string; positive: number; negative: number; neutral: number }>
): Array<{ symbol: string; positive: number; negative: number; neutral: number; isValid: boolean }> {
  return sentiments.map(s => {
    const normalized = normalizeSentiment({
      positive: s.positive,
      negative: s.negative,
      neutral: s.neutral,
    });
    
    // Validation: Toplam 95-105 arası ise kabul edilebilir (yuvarlama hatası)
    const total = normalized.positive + normalized.negative + normalized.neutral;
    const isValid = total >= 95 && total <= 105;
    
    return {
      ...s,
      ...normalized,
      isValid,
    };
  });
}

/**
 * Sentiment değerlerini kontrol et (invalid flag ekle)
 */
export function validateSentiment(
  values: SentimentValues
): { values: SentimentValues; isValid: boolean; error?: string } {
  const normalized = normalizeSentiment(values);
  const total = normalized.positive + normalized.negative + normalized.neutral;
  
  // Toplam 95-105 arası ise kabul edilebilir (yuvarlama hatası)
  if (total >= 95 && total <= 105) {
    return { values: normalized, isValid: true };
  }
  
  // Toplam çok farklıysa invalid
  return {
    values: normalized,
    isValid: false,
    error: `Sentiment toplamı ${total.toFixed(1)}% (beklenen: 100%)`,
  };
}

/**
 * Sentiment skorunu hesapla (0-1 arası, 1 = çok pozitif)
 */
export function calculateSentimentScore(values: SentimentValues): number {
  const normalized = normalizeSentiment(values);
  
  // Pozitif - negatif ağırlıklı skor
  return (normalized.positive - normalized.negative) / 100 + 0.5; // 0-1 arası
}


