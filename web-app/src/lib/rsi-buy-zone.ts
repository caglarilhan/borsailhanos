/**
 * P5.2: RSI Buy Zone Rules
 * RSI bazlı buy zone kuralı: <30 uyarı, 40-60 nötr, >70 sat
 */

export interface RSIBuyZoneResult {
  zone: 'oversold' | 'neutral' | 'overbought' | 'buy_zone' | 'sell_zone';
  signal: 'BUY' | 'SELL' | 'HOLD' | 'WARNING';
  confidence: number; // 0-1 scale
  message: string;
  color: string;
}

/**
 * Determine RSI buy zone and signal
 */
export function getRSIBuyZone(rsi: number | null | undefined): RSIBuyZoneResult {
  if (rsi === null || rsi === undefined || isNaN(rsi)) {
    return {
      zone: 'neutral',
      signal: 'HOLD',
      confidence: 0.5,
      message: 'RSI verisi mevcut değil',
      color: 'text-slate-600',
    };
  }

  // RSI < 30: Oversold (potential buy signal)
  if (rsi < 30) {
    return {
      zone: 'oversold',
      signal: 'BUY',
      confidence: 0.75, // High confidence for oversold
      message: `RSI ${rsi.toFixed(1)} - Aşırı satım bölgesi. Potansiyel al sinyali.`,
      color: 'text-green-600',
    };
  }

  // RSI 30-40: Buy zone (strong buy signal)
  if (rsi >= 30 && rsi < 40) {
    return {
      zone: 'buy_zone',
      signal: 'BUY',
      confidence: 0.85, // Very high confidence
      message: `RSI ${rsi.toFixed(1)} - Alış bölgesi. Güçlü al sinyali.`,
      color: 'text-emerald-600',
    };
  }

  // RSI 40-60: Neutral zone
  if (rsi >= 40 && rsi <= 60) {
    return {
      zone: 'neutral',
      signal: 'HOLD',
      confidence: 0.5,
      message: `RSI ${rsi.toFixed(1)} - Nötr bölge. Bekle ve gör stratejisi uygun.`,
      color: 'text-amber-600',
    };
  }

  // RSI 60-70: Sell zone (caution)
  if (rsi > 60 && rsi <= 70) {
    return {
      zone: 'sell_zone',
      signal: 'WARNING',
      confidence: 0.65,
      message: `RSI ${rsi.toFixed(1)} - Dikkat bölgesi. Aşırı alım yaklaşıyor.`,
      color: 'text-yellow-600',
    };
  }

  // RSI > 70: Overbought (sell signal)
  return {
    zone: 'overbought',
    signal: 'SELL',
    confidence: 0.80, // High confidence for overbought
    message: `RSI ${rsi.toFixed(1)} - Aşırı alım bölgesi. Potansiyel sat sinyali.`,
    color: 'text-red-600',
  };
}

/**
 * Validate RSI vs prediction signal consistency
 */
export function validateRSISignalConsistency(
  rsi: number | null | undefined,
  predictionSignal: 'BUY' | 'SELL' | 'HOLD'
): { isValid: boolean; warning?: string; recommendation?: string } {
  if (rsi === null || rsi === undefined || isNaN(rsi) || predictionSignal === 'HOLD') {
    return { isValid: true };
  }

  const rsiZone = getRSIBuyZone(rsi);

  // Check if RSI signal conflicts with prediction signal
  if (predictionSignal === 'BUY' && (rsiZone.zone === 'overbought' || rsiZone.signal === 'SELL')) {
    return {
      isValid: false,
      warning: `Çelişki: AI al sinyali veriyor ancak RSI ${rsi.toFixed(1)} (aşırı alım).`,
      recommendation: 'RSI aşırı alım bölgesinde. Al sinyali dikkatle değerlendirilmeli.',
    };
  }

  if (predictionSignal === 'SELL' && (rsiZone.zone === 'oversold' || rsiZone.signal === 'BUY')) {
    return {
      isValid: false,
      warning: `Çelişki: AI sat sinyali veriyor ancak RSI ${rsi.toFixed(1)} (aşırı satım).`,
      recommendation: 'RSI aşırı satım bölgesinde. Sat sinyali dikkatle değerlendirilmeli.',
    };
  }

  return { isValid: true };
}


