/**
 * Behavior-Linked Trade Filter
 * v6.0 Profit Intelligence Suite
 * 
 * Yatırımcının geçmiş psikolojik hatalarına göre filtre uygular
 * Örnek: "Son 3 gün erken satmışsın → AI satış onayını 2 dakika geciktirir"
 */

export interface UserBehavior {
  userId: string;
  recentTrades: Array<{
    symbol: string;
    action: 'BUY' | 'SELL';
    entryTime: string;
    exitTime: string;
    profit: number;
    holdingPeriod: number; // minutes
    confidence: number; // AI confidence at entry
  }>;
}

export interface BehaviorPattern {
  type: 'EARLY_EXIT' | 'LATE_ENTRY' | 'OVERTRADING' | 'HESITATION' | 'NONE';
  frequency: number; // 0-1
  impact: number; // Lost profit in TRY or %
  recommendation: string;
}

export interface BehaviorFilterOutput {
  userId: string;
  detectedPatterns: BehaviorPattern[];
  filters: {
    delayExit: number; // seconds to delay exit confirmation
    delayEntry: number; // seconds to delay entry confirmation
    confidenceBoost: number; // % boost to required confidence
    maxTradesPerDay: number; // Limit trades per day
  };
  explanation: string;
}

/**
 * Detect behavior patterns and generate filters
 */
export function generateBehaviorFilter(behavior: UserBehavior): BehaviorFilterOutput {
  const { userId, recentTrades } = behavior;

  if (recentTrades.length < 3) {
    return {
      userId,
      detectedPatterns: [],
      filters: { delayExit: 0, delayEntry: 0, confidenceBoost: 0, maxTradesPerDay: 10 },
      explanation: 'Yetersiz işlem verisi (minimum 3 işlem gerekli)',
    };
  }

  const patterns: BehaviorPattern[] = [];

  // 1. Detect early exit pattern
  const profitableTrades = recentTrades.filter(t => t.profit > 0);
  const avgHoldingPeriod = profitableTrades.reduce((sum, t) => sum + t.holdingPeriod, 0) / profitableTrades.length || 0;
  const earlyExits = recentTrades.filter(t => t.profit > 0 && t.holdingPeriod < avgHoldingPeriod * 0.5);
  
  if (earlyExits.length / recentTrades.length > 0.3) {
    patterns.push({
      type: 'EARLY_EXIT',
      frequency: earlyExits.length / recentTrades.length,
      impact: earlyExits.reduce((sum, t) => sum + Math.abs(t.profit) * 0.3, 0), // Estimated 30% lost profit
      recommendation: 'Erken çıkış paterni tespit edildi. AI satış onayını 2 dakika geciktirecek.',
    });
  }

  // 2. Detect hesitation pattern (late entry)
  const entries = recentTrades.map(t => ({ symbol: t.symbol, entryTime: t.entryTime, confidence: t.confidence }));
  const highConfidenceTrades = entries.filter(e => e.confidence > 0.85);
  const avgDelay = highConfidenceTrades.length > 0 ? 0 : 300; // Mock delay calculation

  if (avgDelay > 180) {
    patterns.push({
      type: 'LATE_ENTRY',
      frequency: highConfidenceTrades.length / entries.length,
      impact: avgDelay * 0.01, // Estimated loss per minute delay
      recommendation: 'Gecikmeli giriş paterni. AI güvenli sinyalleri hızlı onaylayacak.',
    });
  }

  // 3. Detect overtrading
  const tradesPerDay = recentTrades.length / 7; // Assuming 7-day window
  if (tradesPerDay > 5) {
    patterns.push({
      type: 'OVERTRADING',
      frequency: tradesPerDay / 10,
      impact: -tradesPerDay * 0.02, // Transaction cost impact
      recommendation: 'Aşırı işlem paterni. Günlük işlem limiti uygulanacak.',
    });
  }

  // 4. Generate filters
  const delayExit = patterns.find(p => p.type === 'EARLY_EXIT') ? 120 : 0; // 2 minutes
  const delayEntry = patterns.find(p => p.type === 'LATE_ENTRY') ? -60 : 0; // Negative = speed up
  const confidenceBoost = patterns.find(p => p.type === 'HESITATION') ? 0.05 : 0; // 5% boost
  const maxTradesPerDay = patterns.find(p => p.type === 'OVERTRADING') ? 3 : 10;

  // 5. Generate explanation
  const patternTexts = patterns.map(p => p.type.toLowerCase().replace('_', ' '));
  const explanation = patterns.length > 0
    ? `Davranış filtreleri uygulandı: ${patternTexts.join(', ')}. ${patterns.map(p => p.recommendation).join(' ')}`
    : 'Belirgin davranış paterni tespit edilmedi. Normal filtreleme uygulanıyor.';

  return {
    userId,
    detectedPatterns: patterns,
    filters: {
      delayExit,
      delayEntry,
      confidenceBoost: Math.round(confidenceBoost * 100) / 100,
      maxTradesPerDay,
    },
    explanation,
  };
}



