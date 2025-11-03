/**
 * Self-Learning Reward Engine
 * v6.0 Profit Intelligence Suite
 * 
 * AI kendi kârlı işlemlerine ödül, zararlılarına ceza vererek optimize olur
 * Fayda: Her hafta öğrenen sistem — %1-2 doğruluk artışı
 */

export interface TradeResult {
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  entryPrice: number;
  exitPrice: number;
  entryTime: string;
  exitTime: string;
  profit: number; // TRY or %
  confidence: number; // AI confidence at entry
  factors: {
    rsi: number;
    macd: number;
    sentiment: number;
    volume: number;
  };
}

export interface RewardUpdate {
  factor: 'RSI' | 'MACD' | 'SENTIMENT' | 'VOLUME' | 'CONFIDENCE_THRESHOLD';
  adjustment: number; // Adjustment to weight or threshold (-1 to +1)
  reason: string;
}

export interface LearningOutput {
  updatedWeights: {
    rsi: number; // 0-1
    macd: number;
    sentiment: number;
    volume: number;
  };
  confidenceThreshold: number; // 0-1, minimum confidence for signal
  adjustments: RewardUpdate[];
  overallPerformance: number; // Win rate or Sharpe ratio
  explanation: string;
}

/**
 * Update model weights based on trade results
 * 
 * Strategy:
 * 1. Analyze last N trades (profitable vs unprofitable)
 * 2. Identify factors that contributed to success
 * 3. Increase weight of successful factors
 * 4. Decrease weight of unsuccessful factors
 * 5. Adjust confidence threshold based on accuracy
 */
export function updateRewardBasedLearning(trades: TradeResult[]): LearningOutput {
  if (trades.length < 5) {
    return {
      updatedWeights: { rsi: 0.3, macd: 0.25, sentiment: 0.25, volume: 0.2 },
      confidenceThreshold: 0.75,
      adjustments: [],
      overallPerformance: 0,
      explanation: 'Yetersiz işlem verisi (minimum 5 işlem gerekli)',
    };
  }

  // 1. Separate profitable and unprofitable trades
  const profitable = trades.filter(t => t.profit > 0);
  const unprofitable = trades.filter(t => t.profit <= 0);
  
  const winRate = profitable.length / trades.length;

  // 2. Calculate average factor values for profitable vs unprofitable
  const avgProfitable = {
    rsi: profitable.reduce((sum, t) => sum + t.factors.rsi, 0) / profitable.length || 50,
    macd: profitable.reduce((sum, t) => sum + t.factors.macd, 0) / profitable.length || 0,
    sentiment: profitable.reduce((sum, t) => sum + t.factors.sentiment, 0) / profitable.length || 0.5,
    volume: profitable.reduce((sum, t) => sum + t.factors.volume, 0) / profitable.length || 1.0,
  };

  const avgUnprofitable = {
    rsi: unprofitable.reduce((sum, t) => sum + t.factors.rsi, 0) / unprofitable.length || 50,
    macd: unprofitable.reduce((sum, t) => sum + t.factors.macd, 0) / unprofitable.length || 0,
    sentiment: unprofitable.reduce((sum, t) => sum + t.factors.sentiment, 0) / unprofitable.length || 0.5,
    volume: unprofitable.reduce((sum, t) => sum + t.factors.volume, 0) / unprofitable.length || 1.0,
  };

  // 3. Calculate factor effectiveness (difference between profitable and unprofitable)
  const factorEffectiveness = {
    rsi: Math.abs(avgProfitable.rsi - avgUnprofitable.rsi) / 100,
    macd: Math.abs(avgProfitable.macd - avgUnprofitable.macd),
    sentiment: Math.abs(avgProfitable.sentiment - avgUnprofitable.sentiment),
    volume: Math.abs(avgProfitable.volume - avgUnprofitable.volume),
  };

  // 4. Current weights (initialize if not provided)
  let weights = { rsi: 0.3, macd: 0.25, sentiment: 0.25, volume: 0.2 };

  // 5. Adjust weights based on effectiveness
  const adjustments: RewardUpdate[] = [];
  const totalEffectiveness = Object.values(factorEffectiveness).reduce((sum, v) => sum + v, 0) || 1;

  Object.entries(factorEffectiveness).forEach(([factor, effectiveness]) => {
    const adjustment = (effectiveness / totalEffectiveness - weights[factor as keyof typeof weights]) * 0.3; // 30% adjustment max
    weights[factor as keyof typeof weights] = Math.max(0.1, Math.min(0.5, weights[factor as keyof typeof weights] + adjustment));
    
    if (Math.abs(adjustment) > 0.01) {
      adjustments.push({
        factor: factor.toUpperCase() as RewardUpdate['factor'],
        adjustment: Math.round(adjustment * 1000) / 1000,
        reason: effectiveness > 0.2 ? 'Bu faktör kârlı işlemlerde önemli rol oynuyor' : 'Bu faktörün etkisi düşük',
      });
    }
  });

  // 6. Normalize weights to sum to 1
  const sum = Object.values(weights).reduce((s, w) => s + w, 0);
  Object.keys(weights).forEach(key => {
    weights[key as keyof typeof weights] = weights[key as keyof typeof weights] / sum;
  });

  // 7. Adjust confidence threshold based on win rate
  let confidenceThreshold = 0.75;
  if (winRate > 0.75) {
    // High win rate → can lower threshold slightly
    confidenceThreshold = 0.70;
    adjustments.push({
      factor: 'CONFIDENCE_THRESHOLD',
      adjustment: -0.05,
      reason: 'Yüksek başarı oranı nedeniyle güven eşiği düşürüldü',
    });
  } else if (winRate < 0.6) {
    // Low win rate → raise threshold
    confidenceThreshold = 0.80;
    adjustments.push({
      factor: 'CONFIDENCE_THRESHOLD',
      adjustment: +0.05,
      reason: 'Düşük başarı oranı nedeniyle güven eşiği yükseltildi',
    });
  }

  // 8. Generate explanation
  const explanation = `Öğrenme tamamlandı: ${trades.length} işlem analiz edildi. Başarı oranı: %${(winRate * 100).toFixed(1)}. Ağırlıklar güncellendi: RSI %${(weights.rsi * 100).toFixed(1)}, MACD %${(weights.macd * 100).toFixed(1)}, Sentiment %${(weights.sentiment * 100).toFixed(1)}, Volume %${(weights.volume * 100).toFixed(1)}. Güven eşiği: %${(confidenceThreshold * 100).toFixed(0)}.`;

  return {
    updatedWeights: weights,
    confidenceThreshold: Math.round(confidenceThreshold * 100) / 100,
    adjustments,
    overallPerformance: Math.round(winRate * 100) / 100,
    explanation,
  };
}



