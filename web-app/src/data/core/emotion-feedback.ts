/**
 * P5.2: Emotion-Market Feedback System
 * Kullanıcı davranışını AI öğreniyor olsun: Günde kaç kez trade yapıyor → risk davranış profili
 */

export interface TradeBehavior {
  userId: string;
  timestamp: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  symbol: string;
  confidence: number;
  profit?: number; // Realized profit
}

export interface EmotionProfile {
  userId: string;
  riskBehavior: 'impulsive' | 'calculated' | 'cautious' | 'fearful' | 'greedy';
  tradeFrequency: number; // Trades per day
  averageHoldingPeriod: number; // Hours
  profitRealization: 'quick' | 'delayed' | 'never'; // How quickly user takes profits
  lossAversion: number; // 0-1 (1 = high aversion)
  fomoIndex: number; // 0-1 (1 = high FOMO)
  lastUpdate: string;
}

export interface EmotionAlert {
  type: 'impulsive_trading' | 'overtrading' | 'fear_greed_imbalance' | 'profit_taking_issue';
  severity: 'low' | 'medium' | 'high';
  message: string;
  recommendation: string;
  timestamp: string;
}

/**
 * Emotion-Market Feedback System
 */
export class EmotionFeedbackSystem {
  private behaviorHistory: Map<string, TradeBehavior[]> = new Map(); // userId -> behaviors
  private emotionProfiles: Map<string, EmotionProfile> = new Map(); // userId -> profile

  /**
   * Record trade behavior
   */
  recordBehavior(behavior: TradeBehavior): void {
    const { userId } = behavior;
    
    if (!this.behaviorHistory.has(userId)) {
      this.behaviorHistory.set(userId, []);
    }

    const history = this.behaviorHistory.get(userId)!;
    history.push(behavior);

    // Keep only last 1000 behaviors per user
    if (history.length > 1000) {
      history.shift();
    }

    // Update emotion profile
    this.updateEmotionProfile(userId);
  }

  /**
   * Update emotion profile based on behavior
   */
  private updateEmotionProfile(userId: string): void {
    const behaviors = this.behaviorHistory.get(userId) || [];
    
    if (behaviors.length === 0) {
      return;
    }

    // Calculate trade frequency (trades per day)
    const now = new Date();
    const last7Days = behaviors.filter((b) => {
      const behaviorTime = new Date(b.timestamp);
      return (now.getTime() - behaviorTime.getTime()) / (1000 * 60 * 60 * 24) <= 7;
    });
    
    const tradeFrequency = last7Days.length / 7; // Average trades per day

    // Calculate average holding period
    const holdingPeriods = behaviors
      .filter((b) => b.action !== 'HOLD')
      .map((b) => {
        // For now, use mock holding period calculation
        // In production, track entry/exit times
        return 24; // Mock: 24 hours average
      });
    
    const averageHoldingPeriod = holdingPeriods.length > 0
      ? holdingPeriods.reduce((a, b) => a + b, 0) / holdingPeriods.length
      : 24;

    // Analyze profit realization
    const profitableTrades = behaviors.filter((b) => (b.profit || 0) > 0);
    const profitRealization: 'quick' | 'delayed' | 'never' = 
      profitableTrades.length / behaviors.length > 0.6 ? 'quick' :
      profitableTrades.length / behaviors.length > 0.3 ? 'delayed' :
      'never';

    // Calculate loss aversion (how quickly user exits losing trades)
    const losingTrades = behaviors.filter((b) => (b.profit || 0) < 0);
    const lossAversion = losingTrades.length > 0 
      ? Math.min(1, losingTrades.length / behaviors.length * 1.5) // Higher if more losses
      : 0.5;

    // Calculate FOMO index (frequency of trades after missed opportunities)
    const fomoIndex = Math.min(1, tradeFrequency / 5); // Normalize to 0-1 (5 trades/day = max FOMO)

    // Determine risk behavior
    let riskBehavior: 'impulsive' | 'calculated' | 'cautious' | 'fearful' | 'greedy' = 'calculated';
    
    if (tradeFrequency > 5 && fomoIndex > 0.7) {
      riskBehavior = 'impulsive';
    } else if (tradeFrequency < 1 && lossAversion > 0.7) {
      riskBehavior = 'fearful';
    } else if (profitRealization === 'never' && tradeFrequency > 3) {
      riskBehavior = 'greedy';
    } else if (tradeFrequency < 2 && lossAversion < 0.3) {
      riskBehavior = 'cautious';
    }

    const profile: EmotionProfile = {
      userId,
      riskBehavior,
      tradeFrequency,
      averageHoldingPeriod,
      profitRealization,
      lossAversion,
      fomoIndex,
      lastUpdate: new Date().toISOString(),
    };

    this.emotionProfiles.set(userId, profile);
  }

  /**
   * Get emotion profile for user
   */
  getEmotionProfile(userId: string): EmotionProfile | null {
    return this.emotionProfiles.get(userId) || null;
  }

  /**
   * Analyze behavior and generate alerts
   */
  analyzeBehavior(userId: string): EmotionAlert[] {
    const profile = this.getEmotionProfile(userId);
    const behaviors = this.behaviorHistory.get(userId) || [];

    if (!profile || behaviors.length === 0) {
      return [];
    }

    const alerts: EmotionAlert[] = [];

    // Impulsive trading alert
    if (profile.tradeFrequency > 5 && profile.fomoIndex > 0.7) {
      alerts.push({
        type: 'impulsive_trading',
        severity: 'high',
        message: `Bugün ${Math.round(profile.tradeFrequency)} kez işlem yaptın, impulsive trading riskin yüksek.`,
        recommendation: 'İşlem sıklığını azalt, stratejinizi gözden geçir. Her işlem öncesi dur-analiz et.',
        timestamp: new Date().toISOString(),
      });
    }

    // Overtrading alert
    if (profile.tradeFrequency > 8) {
      alerts.push({
        type: 'overtrading',
        severity: 'critical',
        message: `Aşırı işlem sıklığı (günde ${Math.round(profile.tradeFrequency)} işlem).`,
        recommendation: '24 saat bekle, sonra yeniden değerlendir. Overtrading genelde kayıplara yol açar.',
        timestamp: new Date().toISOString(),
      });
    }

    // Fear-Greed imbalance alert
    if (profile.lossAversion > 0.8 && profile.tradeFrequency > 3) {
      alerts.push({
        type: 'fear_greed_imbalance',
        severity: 'medium',
        message: `Yüksek loss aversion (%${(profile.lossAversion * 100).toFixed(0)}) ile yüksek işlem sıklığı çelişiyor.`,
        recommendation: 'Davranış tutarlılığını artır. Ya risk al ya da beklemede kal.',
        timestamp: new Date().toISOString(),
      });
    }

    // Profit taking issue alert
    if (profile.profitRealization === 'never' && behaviors.filter((b) => (b.profit || 0) > 0).length > 0) {
      alerts.push({
        type: 'profit_taking_issue',
        severity: 'medium',
        message: 'Kârlı pozisyonları kapatmıyorsun, kârlar eriyebilir.',
        recommendation: 'Kâr hedeflerini belirle ve hedefe ulaşınca pozisyon kapat. "Hepsini kazanma" hırsı riskli.',
        timestamp: new Date().toISOString(),
      });
    }

    return alerts;
  }

  /**
   * Get cognitive behavioral recommendation
   */
  getCBRecommendation(profile: EmotionProfile): string {
    if (profile.riskBehavior === 'impulsive') {
      return 'Impulsif trading modundasın. Her işlem öncesi 10 saniye bekle, "Bu işlem gerçekten gerekli mi?" diye sor.';
    } else if (profile.riskBehavior === 'fearful') {
      return 'Korku modundasın. Riskleri abartıyorsun olabilir. Küçük pozisyonlarla test et, güven kazan.';
    } else if (profile.riskBehavior === 'greedy') {
      return 'Açgözlülük modundasın. Kârlı pozisyonları zamanında kapat. "Hepsini kazanma" hırsı kayıplara yol açar.';
    } else if (profile.riskBehavior === 'cautious') {
      return 'İhtiyatlı modundasın. Bu iyi bir şey, ancak fırsatları kaçırma. Küçük pozisyonlarla risk alabilirsin.';
    } else {
      return 'Dengeli bir yaklaşımın var. Devam et, ancak davranış kalıplarını izlemeye devam et.';
    }
  }
}

// Singleton instance
export const emotionFeedbackSystem = new EmotionFeedbackSystem();

/**
 * Record trade behavior
 */
export function recordTradeBehavior(behavior: TradeBehavior): void {
  emotionFeedbackSystem.recordBehavior(behavior);
}

/**
 * Get emotion profile
 */
export function getEmotionProfile(userId: string): EmotionProfile | null {
  return emotionFeedbackSystem.getEmotionProfile(userId);
}

/**
 * Analyze behavior and get alerts
 */
export function analyzeBehavior(userId: string): EmotionAlert[] {
  return emotionFeedbackSystem.analyzeBehavior(userId);
}


