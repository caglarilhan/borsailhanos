/**
 * P5.2: Symbol-Specific AI Explanation
 * Sembol bazlı AI açıklaması üret
 */

export interface SymbolExplanation {
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  factors: Array<{
    factor: string;
    value: number;
    weight: number;
    impact: number;
    description: string;
  }>;
  explanation: string;
  technicalAnalysis: string;
  fundamentalAnalysis?: string;
  sentimentAnalysis?: string;
  recommendation: string;
  timestamp: string;
}

/**
 * Symbol-Specific Explanation Generator
 */
export class SymbolExplanationGenerator {
  /**
   * Generate explanation for a symbol
   */
  generateExplanation(
    symbol: string,
    signal: 'BUY' | 'SELL' | 'HOLD',
    confidence: number,
    metrics: {
      rsi?: number;
      macd?: number;
      sentiment?: number;
      volume?: number;
      momentum?: number;
      price?: number;
      targetPrice?: number;
      stopPrice?: number;
    }
  ): SymbolExplanation {
    const factors: Array<{
      factor: string;
      value: number;
      weight: number;
      impact: number;
      description: string;
    }> = [];

    // RSI factor
    if (metrics.rsi !== undefined) {
      factors.push({
        factor: 'RSI',
        value: metrics.rsi,
        weight: 0.15,
        impact: this.calculateRSIImpact(metrics.rsi),
        description: this.getRSIDescription(metrics.rsi),
      });
    }

    // MACD factor
    if (metrics.macd !== undefined) {
      factors.push({
        factor: 'MACD',
        value: metrics.macd,
        weight: 0.10,
        impact: this.calculateMACDImpact(metrics.macd),
        description: this.getMACDDescription(metrics.macd),
      });
    }

    // Sentiment factor
    if (metrics.sentiment !== undefined) {
      factors.push({
        factor: 'Sentiment',
        value: metrics.sentiment,
        weight: 0.30,
        impact: (metrics.sentiment - 0.5) * 2, // -1 to +1
        description: this.getSentimentDescription(metrics.sentiment),
      });
    }

    // Volume factor
    if (metrics.volume !== undefined) {
      factors.push({
        factor: 'Volume',
        value: metrics.volume,
        weight: 0.20,
        impact: Math.max(-1, Math.min(1, (metrics.volume - 1) * 2)),
        description: this.getVolumeDescription(metrics.volume),
      });
    }

    // Momentum factor
    if (metrics.momentum !== undefined) {
      factors.push({
        factor: 'Momentum',
        value: metrics.momentum,
        weight: 0.15,
        impact: metrics.momentum,
        description: this.getMomentumDescription(metrics.momentum),
      });
    }

    // Generate explanations
    const technicalAnalysis = this.generateTechnicalAnalysis(factors);
    const sentimentAnalysis = metrics.sentiment !== undefined 
      ? this.generateSentimentAnalysis(metrics.sentiment)
      : undefined;
    
    const explanation = this.generateOverallExplanation(signal, factors, confidence);
    const recommendation = this.generateRecommendation(signal, confidence, factors);

    return {
      symbol,
      signal,
      confidence,
      factors,
      explanation,
      technicalAnalysis,
      sentimentAnalysis,
      recommendation,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generate technical analysis summary
   */
  private generateTechnicalAnalysis(
    factors: Array<{ factor: string; description: string; impact: number }>
  ): string {
    const bullishFactors = factors.filter((f) => f.impact > 0.1);
    const bearishFactors = factors.filter((f) => f.impact < -0.1);

    if (bullishFactors.length > bearishFactors.length) {
      return `Teknik analiz: ${bullishFactors.length} yükseliş faktörü, ${bearishFactors.length} düşüş faktörü. ${bullishFactors.map((f) => f.description).join(' ')}`;
    } else if (bearishFactors.length > bullishFactors.length) {
      return `Teknik analiz: ${bearishFactors.length} düşüş faktörü, ${bullishFactors.length} yükseliş faktörü. ${bearishFactors.map((f) => f.description).join(' ')}`;
    } else {
      return `Teknik analiz: Faktörler dengeli. Yanal hareket bekleniyor.`;
    }
  }

  /**
   * Generate sentiment analysis summary
   */
  private generateSentimentAnalysis(sentiment: number): string {
    const percent = (sentiment * 100).toFixed(1);
    if (sentiment > 0.7) {
      return `Sentiment analizi: Çok pozitif (%${percent}). Haberler ve analist görüşleri yükseliş destekliyor.`;
    } else if (sentiment < 0.3) {
      return `Sentiment analizi: Çok negatif (%${percent}). Haberler ve analist görüşleri düşüş gösteriyor.`;
    } else {
      return `Sentiment analizi: Nötr (%${percent}). Haberler dengeli, belirsizlik var.`;
    }
  }

  /**
   * Generate overall explanation
   */
  private generateOverallExplanation(
    signal: 'BUY' | 'SELL' | 'HOLD',
    factors: Array<{ factor: string; impact: number; description: string }>,
    confidence: number
  ): string {
    const topFactors = factors
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
      .slice(0, 3);

    if (signal === 'BUY') {
      return `${signal} sinyali (güven %${(confidence * 100).toFixed(1)}). En önemli faktörler: ${topFactors.map((f) => `${f.factor} (${f.description})`).join(', ')}.`;
    } else if (signal === 'SELL') {
      return `${signal} sinyali (güven %${(confidence * 100).toFixed(1)}). En önemli faktörler: ${topFactors.map((f) => `${f.factor} (${f.description})`).join(', ')}.`;
    } else {
      return `HOLD pozisyonu (güven %${(confidence * 100).toFixed(1)}). Faktörler dengeli, yeni sinyal bekleniyor.`;
    }
  }

  /**
   * Generate recommendation
   */
  private generateRecommendation(
    signal: 'BUY' | 'SELL' | 'HOLD',
    confidence: number,
    factors: Array<{ impact: number }>
  ): string {
    const totalImpact = factors.reduce((sum, f) => sum + (f.impact * 0.25), 0);
    
    if (signal === 'BUY' && confidence >= 0.75) {
      return `Güçlü ${signal} sinyali. Pozisyon alınabilir, stop-loss %3 seviyesi önerilir.`;
    } else if (signal === 'BUY' && confidence >= 0.65) {
      return `${signal} sinyali orta güvenli. Küçük pozisyon alınabilir, stop-loss %3 seviyesi önerilir.`;
    } else if (signal === 'SELL' && confidence >= 0.75) {
      return `Güçlü ${signal} sinyali. Pozisyon kapatılabilir veya hedge düşünülebilir.`;
    } else if (signal === 'HOLD') {
      return `HOLD pozisyonu önerilir. Yeni sinyal bekleniyor.`;
    }

    return `${signal} sinyali düşük güvenli. İzlenebilir, teyit sinyali beklenebilir.`;
  }

  /**
   * Calculate RSI impact
   */
  private calculateRSIImpact(rsi: number): number {
    if (rsi < 30) return (30 - rsi) / 30; // Oversold = bullish
    if (rsi > 70) return -(rsi - 70) / 30; // Overbought = bearish
    return 0;
  }

  /**
   * Get RSI description
   */
  private getRSIDescription(rsi: number): string {
    if (rsi < 30) return `RSI ${rsi.toFixed(0)} (aşırı satım) → AL sinyali destekliyor`;
    if (rsi > 70) return `RSI ${rsi.toFixed(0)} (aşırı alım) → SAT sinyali destekliyor`;
    return `RSI ${rsi.toFixed(0)} (nötr)`;
  }

  /**
   * Calculate MACD impact
   */
  private calculateMACDImpact(macd: number): number {
    return Math.max(-1, Math.min(1, macd * 2));
  }

  /**
   * Get MACD description
   */
  private getMACDDescription(macd: number): string {
    if (macd > 0.5) return `MACD +${macd.toFixed(2)} (güçlü yükseliş)`;
    if (macd < -0.5) return `MACD ${macd.toFixed(2)} (güçlü düşüş)`;
    return `MACD ${macd.toFixed(2)} (nötr)`;
  }

  /**
   * Get sentiment description
   */
  private getSentimentDescription(sentiment: number): string {
    const percent = (sentiment * 100).toFixed(1);
    if (sentiment > 0.7) return `Sentiment %${percent} (çok pozitif)`;
    if (sentiment < 0.3) return `Sentiment %${percent} (çok negatif)`;
    return `Sentiment %${percent} (nötr)`;
  }

  /**
   * Get volume description
   */
  private getVolumeDescription(volume: number): string {
    const change = ((volume - 1) * 100).toFixed(1);
    if (volume > 1.2) return `Hacim %${change} artış`;
    if (volume < 0.8) return `Hacim %${Math.abs(parseFloat(change))} azalış`;
    return `Hacim normal`;
  }

  /**
   * Get momentum description
   */
  private getMomentumDescription(momentum: number): string {
    const percent = (momentum * 100).toFixed(1);
    if (momentum > 0.1) return `Momentum +%${percent} (yükseliş)`;
    if (momentum < -0.1) return `Momentum %${percent} (düşüş)`;
    return `Momentum nötr`;
  }
}

// Singleton instance
export const symbolExplanationGenerator = new SymbolExplanationGenerator();

/**
 * Generate symbol-specific explanation
 */
export function generateSymbolExplanation(
  symbol: string,
  signal: 'BUY' | 'SELL' | 'HOLD',
  confidence: number,
  metrics: {
    rsi?: number;
    macd?: number;
    sentiment?: number;
    volume?: number;
    momentum?: number;
    price?: number;
    targetPrice?: number;
    stopPrice?: number;
  }
): SymbolExplanation {
  return symbolExplanationGenerator.generateExplanation(symbol, signal, confidence, metrics);
}


