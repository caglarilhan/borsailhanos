/**
 * P5.2: AI Explain Mode (Şeffaflık Katmanı)
 * Kullanıcı "neden bu sinyal çıktı?" dediğinde: Modelin karar ağacını açıklar
 * "RSI 33 (aşırı satım), FinBERT pozitif %72, hacim artışı %14 → AL."
 */

export interface ExplainableFactor {
  factor: 'rsi' | 'macd' | 'sentiment' | 'volume' | 'momentum' | 'trend' | 'regime' | 'correlation';
  value: number;
  weight: number; // 0-1 contribution weight
  impact: number; // -1 to +1 impact on signal
  direction: 'bullish' | 'bearish' | 'neutral';
  description: string;
}

export interface ExplainableDecision {
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number; // 0-1
  factors: ExplainableFactor[];
  totalImpact: number; // Sum of weighted impacts
  explanation: string;
  decisionTree: Array<{
    step: string;
    condition: string;
    result: string;
  }>;
  timestamp: string;
}

export interface XAIWaterfall {
  factors: Array<{
    factor: string;
    base: number; // Starting value
    contribution: number; // Contribution to final signal
    cumulative: number; // Cumulative sum
  }>;
  finalSignal: number; // -1 to +1
  explanation: string;
}

/**
 * AI Explain Mode
 */
export class AIExplainMode {
  /**
   * Explain signal decision
   */
  explainDecision(
    signal: 'BUY' | 'SELL' | 'HOLD',
    confidence: number,
    metrics: {
      rsi?: number;
      macd?: number;
      sentiment?: number;
      volume?: number;
      momentum?: number;
      trend?: 'bullish' | 'bearish' | 'neutral';
      regime?: 'risk_on' | 'risk_off' | 'neutral';
    }
  ): ExplainableDecision {
    const factors: ExplainableFactor[] = [];

    // RSI factor
    if (metrics.rsi !== undefined) {
      const rsiValue = metrics.rsi;
      const rsiImpact = this.calculateRSIImpact(rsiValue);
      const rsiWeight = 0.15;
      
      factors.push({
        factor: 'rsi',
        value: rsiValue,
        weight: rsiWeight,
        impact: rsiImpact,
        direction: rsiValue < 30 ? 'bullish' : rsiValue > 70 ? 'bearish' : 'neutral',
        description: this.getRSIDescription(rsiValue),
      });
    }

    // MACD factor
    if (metrics.macd !== undefined) {
      const macdValue = metrics.macd;
      const macdImpact = this.calculateMACDImpact(macdValue);
      const macdWeight = 0.10;
      
      factors.push({
        factor: 'macd',
        value: macdValue,
        weight: macdWeight,
        impact: macdImpact,
        direction: macdValue > 0 ? 'bullish' : macdValue < 0 ? 'bearish' : 'neutral',
        description: this.getMACDDescription(macdValue),
      });
    }

    // Sentiment factor
    if (metrics.sentiment !== undefined) {
      const sentimentValue = metrics.sentiment; // 0-1 scale
      const sentimentImpact = (sentimentValue - 0.5) * 2; // -1 to +1
      const sentimentWeight = 0.30;
      
      factors.push({
        factor: 'sentiment',
        value: sentimentValue,
        weight: sentimentWeight,
        impact: sentimentImpact,
        direction: sentimentValue > 0.6 ? 'bullish' : sentimentValue < 0.4 ? 'bearish' : 'neutral',
        description: this.getSentimentDescription(sentimentValue),
      });
    }

    // Volume factor
    if (metrics.volume !== undefined) {
      const volumeValue = metrics.volume; // Volume ratio (e.g., 1.2 = 20% above average)
      const volumeImpact = Math.max(-1, Math.min(1, (volumeValue - 1) * 2)); // Normalize to -1 to +1
      const volumeWeight = 0.20;
      
      factors.push({
        factor: 'volume',
        value: volumeValue,
        weight: volumeWeight,
        impact: volumeImpact,
        direction: volumeValue > 1.2 ? 'bullish' : volumeValue < 0.8 ? 'bearish' : 'neutral',
        description: this.getVolumeDescription(volumeValue),
      });
    }

    // Momentum factor
    if (metrics.momentum !== undefined) {
      const momentumValue = metrics.momentum; // -1 to +1
      const momentumImpact = momentumValue;
      const momentumWeight = 0.15;
      
      factors.push({
        factor: 'momentum',
        value: momentumValue,
        weight: momentumWeight,
        impact: momentumImpact,
        direction: momentumValue > 0.1 ? 'bullish' : momentumValue < -0.1 ? 'bearish' : 'neutral',
        description: this.getMomentumDescription(momentumValue),
      });
    }

    // Regime factor
    if (metrics.regime) {
      const regimeImpact = metrics.regime === 'risk_on' ? 0.3 : metrics.regime === 'risk_off' ? -0.3 : 0;
      const regimeWeight = 0.10;
      
      factors.push({
        factor: 'regime',
        value: metrics.regime === 'risk_on' ? 1 : metrics.regime === 'risk_off' ? -1 : 0,
        weight: regimeWeight,
        impact: regimeImpact,
        direction: metrics.regime === 'risk_on' ? 'bullish' : metrics.regime === 'risk_off' ? 'bearish' : 'neutral',
        description: this.getRegimeDescription(metrics.regime),
      });
    }

    // Calculate total impact
    const totalImpact = factors.reduce((sum, f) => sum + (f.impact * f.weight), 0);

    // Generate explanation
    const explanation = this.generateExplanation(signal, factors, totalImpact);

    // Generate decision tree
    const decisionTree = this.generateDecisionTree(signal, factors);

    return {
      signal,
      confidence,
      factors,
      totalImpact,
      explanation,
      decisionTree,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Calculate RSI impact
   */
  private calculateRSIImpact(rsi: number): number {
    // RSI < 30 = oversold = bullish (positive impact)
    // RSI > 70 = overbought = bearish (negative impact)
    if (rsi < 30) {
      return (30 - rsi) / 30; // 0 to 1 as RSI goes from 30 to 0
    } else if (rsi > 70) {
      return -(rsi - 70) / 30; // 0 to -1 as RSI goes from 70 to 100
    } else {
      return 0; // Neutral zone
    }
  }

  /**
   * Get RSI description
   */
  private getRSIDescription(rsi: number): string {
    if (rsi < 30) {
      return `RSI ${rsi.toFixed(0)} (aşırı satım) → AL sinyali destekliyor`;
    } else if (rsi > 70) {
      return `RSI ${rsi.toFixed(0)} (aşırı alım) → SAT sinyali destekliyor`;
    } else {
      return `RSI ${rsi.toFixed(0)} (nötr bölge) → sinyal etkisi yok`;
    }
  }

  /**
   * Calculate MACD impact
   */
  private calculateMACDImpact(macd: number): number {
    // Positive MACD = bullish, Negative MACD = bearish
    return Math.max(-1, Math.min(1, macd * 2)); // Normalize to -1 to +1
  }

  /**
   * Get MACD description
   */
  private getMACDDescription(macd: number): string {
    if (macd > 0.5) {
      return `MACD +${macd.toFixed(2)} (güçlü yükseliş momentumu) → AL sinyali destekliyor`;
    } else if (macd < -0.5) {
      return `MACD ${macd.toFixed(2)} (güçlü düşüş momentumu) → SAT sinyali destekliyor`;
    } else {
      return `MACD ${macd.toFixed(2)} (nötr) → sinyal etkisi sınırlı`;
    }
  }

  /**
   * Get sentiment description
   */
  private getSentimentDescription(sentiment: number): string {
    const percent = (sentiment * 100).toFixed(1);
    if (sentiment > 0.7) {
      return `Sentiment %${percent} (çok pozitif) → AL sinyali destekliyor`;
    } else if (sentiment < 0.3) {
      return `Sentiment %${percent} (çok negatif) → SAT sinyali destekliyor`;
    } else {
      return `Sentiment %${percent} (nötr) → sinyal etkisi dengeli`;
    }
  }

  /**
   * Get volume description
   */
  private getVolumeDescription(volume: number): string {
    const change = ((volume - 1) * 100).toFixed(1);
    if (volume > 1.2) {
      return `Hacim %${change} artış (güçlü ilgi) → AL sinyali destekliyor`;
    } else if (volume < 0.8) {
      return `Hacim %${Math.abs(parseFloat(change))} azalış (ilgisizlik) → SAT sinyali destekliyor`;
    } else {
      return `Hacim normal seviyede → sinyal etkisi sınırlı`;
    }
  }

  /**
   * Get momentum description
   */
  private getMomentumDescription(momentum: number): string {
    const percent = (momentum * 100).toFixed(1);
    if (momentum > 0.1) {
      return `Momentum +%${percent} (yükseliş trendi) → AL sinyali destekliyor`;
    } else if (momentum < -0.1) {
      return `Momentum %${percent} (düşüş trendi) → SAT sinyali destekliyor`;
    } else {
      return `Momentum nötr → sinyal etkisi yok`;
    }
  }

  /**
   * Get regime description
   */
  private getRegimeDescription(regime: 'risk_on' | 'risk_off' | 'neutral'): string {
    if (regime === 'risk_on') {
      return `Risk-On rejimi (piyasa yükseliş eğilimi) → AL sinyali destekliyor`;
    } else if (regime === 'risk_off') {
      return `Risk-Off rejimi (piyasa düşüş eğilimi) → SAT sinyali destekliyor`;
    } else {
      return `Nötr rejim → sinyal etkisi yok`;
    }
  }

  /**
   * Generate explanation text
   */
  private generateExplanation(
    signal: 'BUY' | 'SELL' | 'HOLD',
    factors: ExplainableFactor[],
    totalImpact: number
  ): string {
    const bullishFactors = factors.filter((f) => f.direction === 'bullish' && f.impact > 0.1);
    const bearishFactors = factors.filter((f) => f.direction === 'bearish' && f.impact < -0.1);

    let explanation = '';

    if (signal === 'BUY') {
      if (bullishFactors.length > 0) {
        const topFactors = bullishFactors
          .sort((a, b) => b.impact * b.weight - a.impact * a.weight)
          .slice(0, 3);
        
        explanation = `BUY sinyali şu faktörlerden destekleniyor: ${topFactors.map((f) => f.description).join(' • ')}`;
      } else {
        explanation = `BUY sinyali zayıf destekleniyor (toplam etki: ${(totalImpact * 100).toFixed(1)}%)`;
      }
    } else if (signal === 'SELL') {
      if (bearishFactors.length > 0) {
        const topFactors = bearishFactors
          .sort((a, b) => a.impact * a.weight - b.impact * b.weight)
          .slice(0, 3);
        
        explanation = `SELL sinyali şu faktörlerden destekleniyor: ${topFactors.map((f) => f.description).join(' • ')}`;
      } else {
        explanation = `SELL sinyali zayıf destekleniyor (toplam etki: ${(totalImpact * 100).toFixed(1)}%)`;
      }
    } else {
      explanation = `HOLD pozisyonu: Faktörler dengeli (toplam etki: ${(totalImpact * 100).toFixed(1)}%)`;
    }

    return explanation;
  }

  /**
   * Generate decision tree
   */
  private generateDecisionTree(
    signal: 'BUY' | 'SELL' | 'HOLD',
    factors: ExplainableFactor[]
  ): Array<{ step: string; condition: string; result: string }> {
    const tree: Array<{ step: string; condition: string; result: string }> = [];

    // Step 1: Check sentiment
    const sentiment = factors.find((f) => f.factor === 'sentiment');
    if (sentiment) {
      tree.push({
        step: '1',
        condition: sentiment.value > 0.6 ? 'Sentiment > %60' : sentiment.value < 0.4 ? 'Sentiment < %40' : 'Sentiment %40-60',
        result: sentiment.value > 0.6 ? 'AL sinyali desteklendi' : sentiment.value < 0.4 ? 'SAT sinyali desteklendi' : 'Nötr',
      });
    }

    // Step 2: Check RSI
    const rsi = factors.find((f) => f.factor === 'rsi');
    if (rsi) {
      tree.push({
        step: '2',
        condition: rsi.value < 30 ? 'RSI < 30' : rsi.value > 70 ? 'RSI > 70' : 'RSI 30-70',
        result: rsi.value < 30 ? 'Aşırı satım → AL sinyali' : rsi.value > 70 ? 'Aşırı alım → SAT sinyali' : 'Nötr',
      });
    }

    // Step 3: Check volume
    const volume = factors.find((f) => f.factor === 'volume');
    if (volume) {
      tree.push({
        step: '3',
        condition: volume.value > 1.2 ? 'Hacim > %120' : volume.value < 0.8 ? 'Hacim < %80' : 'Hacim normal',
        result: volume.value > 1.2 ? 'Yüksek ilgi → AL sinyali' : volume.value < 0.8 ? 'Düşük ilgi → SAT sinyali' : 'Nötr',
      });
    }

    // Step 4: Final decision
    tree.push({
      step: '4',
      condition: `Toplam etki: ${(factors.reduce((sum, f) => sum + (f.impact * f.weight), 0) * 100).toFixed(1)}%`,
      result: signal === 'BUY' ? 'BUY sinyali oluştu' : signal === 'SELL' ? 'SELL sinyali oluştu' : 'HOLD pozisyonu',
    });

    return tree;
  }

  /**
   * Generate XAI waterfall chart data
   */
  generateWaterfall(factors: ExplainableFactor[], baseSignal: number = 0): XAIWaterfall {
    let cumulative = baseSignal;

    const waterfallFactors = factors.map((f) => {
      const contribution = f.impact * f.weight;
      cumulative += contribution;

      return {
        factor: f.factor,
        base: cumulative - contribution,
        contribution,
        cumulative,
      };
    });

    return {
      factors: waterfallFactors,
      finalSignal: cumulative,
      explanation: this.generateWaterfallExplanation(waterfallFactors),
    };
  }

  /**
   * Generate waterfall explanation
   */
  private generateWaterfallExplanation(
    factors: Array<{ factor: string; contribution: number; cumulative: number }>
  ): string {
    const contributions = factors
      .filter((f) => Math.abs(f.contribution) > 0.05) // Only significant contributions
      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

    if (contributions.length === 0) {
      return 'Sinyal faktörleri dengeli';
    }

    const top3 = contributions.slice(0, 3);
    return `En büyük katkılar: ${top3.map((f) => 
      `${f.factor} ${f.contribution > 0 ? '+' : ''}${(f.contribution * 100).toFixed(1)}pp`
    ).join(', ')}`;
  }

  /**
   * Export explanation to JSON
   */
  exportToJSON(decision: ExplainableDecision): string {
    return JSON.stringify(decision, null, 2);
  }
}

// Singleton instance
export const aiExplainMode = new AIExplainMode();

/**
 * Explain signal decision
 */
export function explainSignalDecision(
  signal: 'BUY' | 'SELL' | 'HOLD',
  confidence: number,
  metrics: {
    rsi?: number;
    macd?: number;
    sentiment?: number;
    volume?: number;
    momentum?: number;
    trend?: 'bullish' | 'bearish' | 'neutral';
    regime?: 'risk_on' | 'risk_off' | 'neutral';
  }
): ExplainableDecision {
  return aiExplainMode.explainDecision(signal, confidence, metrics);
}

/**
 * Generate waterfall chart
 */
export function generateXAIWaterfall(
  factors: ExplainableFactor[],
  baseSignal: number = 0
): XAIWaterfall {
  return aiExplainMode.generateWaterfall(factors, baseSignal);
}


