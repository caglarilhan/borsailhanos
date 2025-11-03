/**
 * P5.2: TraderGPT Tone Adaptation
 * Kullanıcının moduna göre "tone" değişimi - Agresif/Pasif/Balanced
 */

export type UserMode = 'aggressive' | 'passive' | 'balanced';
export type ToneStyle = 'professional' | 'casual' | 'urgent' | 'cautious' | 'supportive';

export interface ToneContext {
  userMode: UserMode;
  tradeFrequency: number; // Trades per day
  riskTolerance: number; // 0-1
  recentPerformance: 'positive' | 'negative' | 'neutral';
}

export interface Message {
  role: 'user' | 'assistant';
  text: string;
  tone?: ToneStyle;
  timestamp: string;
}

/**
 * TraderGPT Tone Adapter
 */
export class TraderGPTToneAdapter {
  /**
   * Generate message with appropriate tone based on user mode
   */
  generateMessage(
    baseMessage: string,
    context: ToneContext
  ): string {
    const { userMode, tradeFrequency, riskTolerance, recentPerformance } = context;

    // Detect tone style
    const tone = this.detectTone(context);

    // Adapt message based on tone
    let adaptedMessage = baseMessage;

    if (userMode === 'aggressive') {
      // Urgent, action-oriented tone
      adaptedMessage = this.applyAggressiveTone(baseMessage, tone, tradeFrequency);
    } else if (userMode === 'passive') {
      // Cautious, supportive tone
      adaptedMessage = this.applyPassiveTone(baseMessage, tone, recentPerformance);
    } else {
      // Balanced, professional tone
      adaptedMessage = this.applyBalancedTone(baseMessage, tone);
    }

    return adaptedMessage;
  }

  /**
   * Detect tone style from context
   */
  private detectTone(context: ToneContext): ToneStyle {
    const { userMode, tradeFrequency, riskTolerance } = context;

    if (userMode === 'aggressive' || tradeFrequency > 5) {
      return 'urgent';
    } else if (userMode === 'passive' || riskTolerance < 0.3) {
      return 'cautious';
    } else if (context.recentPerformance === 'negative') {
      return 'supportive';
    } else {
      return 'professional';
    }
  }

  /**
   * Apply aggressive tone
   */
  private applyAggressiveTone(
    message: string,
    tone: ToneStyle,
    tradeFrequency: number
  ): string {
    if (tone === 'urgent') {
      // High-frequency trader: urgent, action-oriented
      if (message.includes('fırsat') || message.includes('sinyal')) {
        return `⚡ ${message} Fırsat kısa sürede bitebilir, hızlı karar ver!`;
      }
      
      if (message.includes('risk') || message.includes('dikkat')) {
        return `⚠️ ${message} Ancak agresif moddasın - pozisyon boyutunu kontrol et.`;
      }
    }

    return message;
  }

  /**
   * Apply passive tone
   */
  private applyPassiveTone(
    message: string,
    tone: ToneStyle,
    recentPerformance: 'positive' | 'negative' | 'neutral'
  ): string {
    if (tone === 'cautious') {
      // Low-frequency, risk-averse trader: cautious, supportive
      if (message.includes('BUY') || message.includes('SELL')) {
        return `🛡️ ${message} Risk yüksek görünüyor - beklemede kalmak daha akıllıca olabilir.`;
      }
      
      if (recentPerformance === 'negative') {
        return `💙 ${message} Son işlemlerde kayıp var, acele etmeden ilerle.`;
      }
    }

    return message;
  }

  /**
   * Apply balanced tone
   */
  private applyBalancedTone(
    message: string,
    tone: ToneStyle
  ): string {
    if (tone === 'professional') {
      // Professional, informative tone
      return message;
    } else if (tone === 'supportive') {
      // Supportive tone for negative performance
      return `💡 ${message} Sistem performansını izliyoruz, gerekirse ayarlama yapacağız.`;
    }

    return message;
  }

  /**
   * Generate personalized trading advice
   */
  generateAdvice(
    signal: 'BUY' | 'SELL' | 'HOLD',
    confidence: number,
    context: ToneContext
  ): string {
    const { userMode } = context;

    if (signal === 'BUY' && confidence >= 0.75) {
      if (userMode === 'aggressive') {
        return `🔥 Güçlü BUY sinyali (%${(confidence * 100).toFixed(1)} güven). Pozisyon al, hızlı davran!`;
      } else if (userMode === 'passive') {
        return `✅ BUY sinyali var (%${(confidence * 100).toFixed(1)} güven). Küçük pozisyonla test et, stop-loss kullan.`;
      } else {
        return `📈 BUY sinyali (%${(confidence * 100).toFixed(1)} güven). Pozisyon alınabilir, stop-loss: %-3.`;
      }
    } else if (signal === 'SELL' && confidence >= 0.75) {
      if (userMode === 'aggressive') {
        return `📉 Güçlü SELL sinyali (%${(confidence * 100).toFixed(1)} güven). Pozisyon kapat veya kısa pozisyon al!`;
      } else if (userMode === 'passive') {
        return `⚠️ SELL sinyali var (%${(confidence * 100).toFixed(1)} güven). Pozisyon küçült veya koruyucu stop kullan.`;
      } else {
        return `📉 SELL sinyali (%${(confidence * 100).toFixed(1)} güven). Pozisyon kapatılabilir, stop-loss: %+3.`;
      }
    } else if (signal === 'HOLD' || confidence < 0.75) {
      if (userMode === 'aggressive') {
        return `⏸️ Sinyal zayıf (%${(confidence * 100).toFixed(1)} güven). Bekle, daha güçlü sinyal gelene kadar izle.`;
      } else if (userMode === 'passive') {
        return `💤 Sinyal belirsiz (%${(confidence * 100).toFixed(1)} güven). İzleme modunda kal, yeni sinyal bekleniyor.`;
      } else {
        return `⏸️ HOLD pozisyonu (%${(confidence * 100).toFixed(1)} güven). Yeni sinyal bekleniyor.`;
      }
    }

    return `Sinyal: ${signal} (Güven: %${(confidence * 100).toFixed(1)})`;
  }

  /**
   * Analyze user behavior and suggest mode
   */
  analyzeUserBehavior(tradeHistory: Array<{
    timestamp: string;
    action: 'BUY' | 'SELL' | 'HOLD';
    frequency: number;
  }>): {
    suggestedMode: UserMode;
    reasoning: string;
  } {
    if (tradeHistory.length === 0) {
      return {
        suggestedMode: 'balanced',
        reasoning: 'Yeterli işlem geçmişi yok - varsayılan balanced mod',
      };
    }

    // Calculate trade frequency
    const today = new Date();
    const last7Days = tradeHistory.filter((t) => {
      const tradeDate = new Date(t.timestamp);
      return (today.getTime() - tradeDate.getTime()) / (1000 * 60 * 60 * 24) <= 7;
    });

    const avgDailyTrades = last7Days.length / 7;

    // High frequency = aggressive
    if (avgDailyTrades > 5) {
      return {
        suggestedMode: 'aggressive',
        reasoning: `Yüksek işlem sıklığı (günde ${avgDailyTrades.toFixed(1)} işlem) - Agresif mod öneriliyor`,
      };
    }

    // Low frequency = passive
    if (avgDailyTrades < 1) {
      return {
        suggestedMode: 'passive',
        reasoning: `Düşük işlem sıklığı (günde ${avgDailyTrades.toFixed(1)} işlem) - Pasif mod öneriliyor`,
      };
    }

    // Medium frequency = balanced
    return {
      suggestedMode: 'balanced',
      reasoning: `Orta işlem sıklığı (günde ${avgDailyTrades.toFixed(1)} işlem) - Balanced mod uygun`,
    };
  }
}

// Singleton instance
export const traderGPTToneAdapter = new TraderGPTToneAdapter();

/**
 * Generate message with tone adaptation
 */
export function generateToneMessage(
  baseMessage: string,
  context: ToneContext
): string {
  return traderGPTToneAdapter.generateMessage(baseMessage, context);
}

/**
 * Generate trading advice with tone
 */
export function generateToneAdvice(
  signal: 'BUY' | 'SELL' | 'HOLD',
  confidence: number,
  context: ToneContext
): string {
  return traderGPTToneAdapter.generateAdvice(signal, confidence, context);
}


