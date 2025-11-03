/**
 * P0-8: Consensus Logic
 * Farklı ufuklarda (horizon) tutarlılık kontrolü ve çoğunluk sinyali
 */

export type SignalDirection = 'BUY' | 'SELL' | 'HOLD';
export type Horizon = '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '7d' | '30d';

export interface HorizonSignal {
  horizon: Horizon;
  signal: SignalDirection;
  confidence: number;
}

export interface ConsensusResult {
  consensusSignal: SignalDirection;
  consistencyScore: number; // 0-1 arası (1 = tam tutarlı)
  majorityCount: number;
  totalCount: number;
  conflictingSignals: HorizonSignal[];
  weightedConfidence: number;
}

/**
 * Horizon'ları ağırlıklandır (kısa vadeli daha az ağırlık)
 */
const HORIZON_WEIGHTS: Record<Horizon, number> = {
  '5m': 0.5,
  '15m': 0.6,
  '30m': 0.7,
  '1h': 0.8,
  '4h': 0.9,
  '1d': 1.0,
  '7d': 1.0,
  '30d': 0.9,
};

/**
 * Consensus sinyali hesapla (çoğunluk kuralı + ağırlıklı oy)
 */
export function calculateConsensus(signals: HorizonSignal[]): ConsensusResult {
  if (!signals || signals.length === 0) {
    return {
      consensusSignal: 'HOLD',
      consistencyScore: 0,
      majorityCount: 0,
      totalCount: 0,
      conflictingSignals: [],
      weightedConfidence: 0,
    };
  }

  // Ağırlıklı oy sayısı
  const votes: Record<SignalDirection, number> = {
    BUY: 0,
    SELL: 0,
    HOLD: 0,
  };

  const conflicting: HorizonSignal[] = [];
  let totalWeight = 0;
  let weightedConfSum = 0;

  signals.forEach(({ horizon, signal, confidence }) => {
    const weight = HORIZON_WEIGHTS[horizon] || 0.5;
    votes[signal] += weight;
    totalWeight += weight;
    weightedConfSum += confidence * weight;

    // Çelişkili sinyal kontrolü (yüksek confidence ama farklı yön)
    const avgConf = signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;
    const otherSignals = signals.filter(s => s.signal !== signal && s.confidence > avgConf);
    if (otherSignals.length > 0 && confidence > 0.7) {
      conflicting.push({ horizon, signal, confidence });
    }
  });

  // En çok oy alan sinyal (ağırlıklı)
  let consensusSignal: SignalDirection = 'HOLD';
  let maxVotes = 0;
  
  (Object.keys(votes) as SignalDirection[]).forEach((sig) => {
    if (votes[sig] > maxVotes) {
      maxVotes = votes[sig];
      consensusSignal = sig;
    }
  });

  // Tutarlılık skoru: çoğunluk oyu / toplam oy
  const consistencyScore = maxVotes / Math.max(1, totalWeight);
  
  // Ağırlıklı confidence
  const weightedConfidence = totalWeight > 0 ? weightedConfSum / totalWeight : 0;

  // Çelişkili sinyaller (çoğunluk dışında kalanlar)
  const conflictingSignals = conflicting.filter(s => s.signal !== consensusSignal);

  return {
    consensusSignal,
    consistencyScore,
    majorityCount: Math.round(maxVotes),
    totalCount: signals.length,
    conflictingSignals,
    weightedConfidence,
  };
}

/**
 * Momentum düzeltmesi: Kısa vadeli sinyaller trend'e göre ayarla
 */
export function applyMomentumCorrection(
  signals: HorizonSignal[],
  currentTrend: 'up' | 'down' | 'neutral' = 'neutral'
): HorizonSignal[] {
  return signals.map(s => {
    // Kısa vadeli sinyaller (5m, 15m, 30m) trend'e göre ayarla
    if (['5m', '15m', '30m'].includes(s.horizon)) {
      if (currentTrend === 'up' && s.signal === 'SELL' && s.confidence < 0.6) {
        // Zayıf SELL sinyali yükseliş trendinde HOLD'a çevir
        return { ...s, signal: 'HOLD', confidence: s.confidence * 0.8 };
      }
      if (currentTrend === 'down' && s.signal === 'BUY' && s.confidence < 0.6) {
        // Zayıf BUY sinyali düşüş trendinde HOLD'a çevir
        return { ...s, signal: 'HOLD', confidence: s.confidence * 0.8 };
      }
    }
    return s;
  });
}

/**
 * Tutarlılık metrikleri hesapla
 */
export function calculateConsistencyMetrics(signals: HorizonSignal[]): {
  overallConsistency: number;
  shortTermConsistency: number;
  longTermConsistency: number;
  signalStrength: 'strong' | 'medium' | 'weak';
} {
  if (!signals || signals.length === 0) {
    return {
      overallConsistency: 0,
      shortTermConsistency: 0,
      longTermConsistency: 0,
      signalStrength: 'weak',
    };
  }

  const shortTerm = signals.filter(s => ['5m', '15m', '30m', '1h'].includes(s.horizon));
  const longTerm = signals.filter(s => ['1d', '7d', '30d'].includes(s.horizon));

  const consensus = calculateConsensus(signals);
  const shortConsensus = calculateConsensus(shortTerm);
  const longConsensus = calculateConsensus(longTerm);

  // Signal strength
  let signalStrength: 'strong' | 'medium' | 'weak' = 'weak';
  if (consensus.consistencyScore >= 0.8 && consensus.weightedConfidence >= 0.75) {
    signalStrength = 'strong';
  } else if (consensus.consistencyScore >= 0.6 && consensus.weightedConfidence >= 0.6) {
    signalStrength = 'medium';
  }

  return {
    overallConsistency: consensus.consistencyScore,
    shortTermConsistency: shortConsensus.consistencyScore,
    longTermConsistency: longConsensus.consistencyScore,
    signalStrength,
  };
}


