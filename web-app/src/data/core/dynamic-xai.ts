/**
 * P5.2: Dynamic XAI (Explainable AI) Explanation System
 * TraderGPT açıklaması statik → Dinamik, duruma göre açıklama üretimi
 */

export interface XAIExplanation {
  summary: string; // Main explanation (1 sentence)
  details: string[]; // Detailed reasons
  confidence: number; // 0-1
  riskFactors: string[];
  recommendation: string;
}

export interface SignalContext {
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  rsi?: number;
  macd?: number;
  macdCross?: 'bullish' | 'bearish' | 'none';
  volume?: number;
  priceChange?: number;
  sentiment?: number;
  confidence: number;
}

/**
 * Dynamic XAI Explanation Generator
 */
export class DynamicXAI {
  /**
   * Generate dynamic explanation based on signal context
   */
  generateExplanation(context: SignalContext): XAIExplanation {
    const {
      symbol,
      signal,
      rsi,
      macd,
      macdCross,
      volume,
      priceChange,
      sentiment,
      confidence,
    } = context;

    const details: string[] = [];
    const riskFactors: string[] = [];
    let summary = '';
    let recommendation = '';

    // RSI-based explanation
    if (rsi !== undefined) {
      if (rsi >= 70) {
        details.push(`RSI ${rsi.toFixed(1)} seviyesinde aşırı alım bölgesinde; kar satışı olasılığı yüksek.`);
        if (signal === 'BUY') {
          riskFactors.push('RSI aşırı alım seviyesinde - BUY sinyali riskli olabilir');
        }
      } else if (rsi <= 30) {
        details.push(`RSI ${rsi.toFixed(1)} seviyesinde aşırı satım bölgesinde; fırsat oluşabilir.`);
        if (signal === 'SELL') {
          riskFactors.push('RSI aşırı satım seviyesinde - SELL sinyali riskli olabilir');
        }
      } else {
        details.push(`RSI ${rsi.toFixed(1)} seviyesinde nötr bölgede.`);
      }
    }

    // MACD-based explanation
    if (macdCross !== undefined && macdCross !== 'none') {
      if (macdCross === 'bullish') {
        details.push('MACD bullish kesişim sinyali: Trend dönüşü onaylandı.');
        if (signal === 'BUY') {
          details.push('MACD momentum göstergesi yükseliş sinyalini destekliyor.');
        }
      } else if (macdCross === 'bearish') {
        details.push('MACD bearish kesişim sinyali: Düşüş trendi güçleniyor.');
        if (signal === 'SELL') {
          details.push('MACD momentum göstergesi düşüş sinyalini destekliyor.');
        }
      }
    }

    // Volume-based explanation
    if (volume !== undefined) {
      if (volume > 1.5) {
        details.push(`Hacim artışı (%${((volume - 1) * 100).toFixed(1)}) momentumu güçlendiriyor.`);
      } else if (volume < 0.8) {
        details.push(`Hacim azalışı (%${((1 - volume) * 100).toFixed(1)}) sinyal güvenilirliğini azaltıyor.`);
        riskFactors.push('Düşük hacim - sinyal zayıf olabilir');
      }
    }

    // Sentiment-based explanation
    if (sentiment !== undefined) {
      if (sentiment > 0.65) {
        details.push(`FinBERT sentiment pozitif (%${(sentiment * 100).toFixed(1)}); haberler olumlu yönde.`);
        if (signal === 'BUY') {
          details.push('Sentiment analizi yükseliş sinyalini destekliyor.');
        }
      } else if (sentiment < 0.35) {
        details.push(`FinBERT sentiment negatif (%${(sentiment * 100).toFixed(1)}); haberler olumsuz yönde.`);
        if (signal === 'SELL') {
          details.push('Sentiment analizi düşüş sinyalini destekliyor.');
        }
      } else {
        details.push(`Sentiment nötr (%${(sentiment * 100).toFixed(1)}); haberler karışık.`);
      }
    }

    // Price change explanation
    if (priceChange !== undefined) {
      if (priceChange > 2) {
        details.push(`Güçlü fiyat artışı (+%${priceChange.toFixed(2)}); momentum yüksek.`);
      } else if (priceChange < -2) {
        details.push(`Güçlü fiyat düşüşü (%${priceChange.toFixed(2)}); risk yüksek.`);
        riskFactors.push('Hızlı fiyat düşüşü - volatilite artabilir');
      }
    }

    // Confidence-based explanation
    if (confidence < 0.75) {
      riskFactors.push(`Düşük güven seviyesi (%${(confidence * 100).toFixed(1)}) - Dikkatli yaklaşın`);
      details.push(`⚠️ Model güveni düşük (%${(confidence * 100).toFixed(1)}); karar vermeden önce ek analiz önerilir.`);
    }

    // Generate summary
    if (signal === 'BUY') {
      summary = `${symbol} için yükseliş sinyali tespit edildi.`;
      if (confidence >= 0.75) {
        summary += ' Güçlü sinyal - pozisyon alınabilir.';
      } else {
        summary += ' Orta güven - dikkatli yaklaşılmalı.';
      }
      recommendation = riskFactors.length > 0
        ? `Risk faktörleri mevcut. Küçük pozisyon ile test edin. Stop loss: %-3`
        : `Pozisyon alınabilir. Stop loss: %-3, Hedef: %+5`;
    } else if (signal === 'SELL') {
      summary = `${symbol} için düşüş sinyali tespit edildi.`;
      if (confidence >= 0.75) {
        summary += ' Güçlü sinyal - pozisyon kapatılabilir veya kısa pozisyon alınabilir.';
      } else {
        summary += ' Orta güven - dikkatli yaklaşılmalı.';
      }
      recommendation = riskFactors.length > 0
        ? `Risk faktörleri mevcut. Pozisyon küçültün veya koruyucu stop kullanın.`
        : `Pozisyon kapatılabilir. Stop loss: %+3, Hedef: %-5`;
    } else {
      summary = `${symbol} için nötr pozisyon öneriliyor.`;
      recommendation = `Piyasa belirsiz. Yeni sinyal bekleniyor. İzleme modunda kalın.`;
    }

    // Add risk factors to details if confidence is low
    if (confidence < 0.75) {
      details.push('Düşük güven seviyesi nedeniyle pozisyon boyutunu küçük tutun.');
    }

    return {
      summary,
      details,
      confidence,
      riskFactors,
      recommendation,
    };
  }

  /**
   * Generate explanation with user behavior context (aggressive/passive)
   */
  generatePersonalizedExplanation(
    context: SignalContext,
    userMode: 'aggressive' | 'passive' | 'balanced'
  ): XAIExplanation {
    const baseExplanation = this.generateExplanation(context);

    // Adjust recommendation based on user mode
    if (userMode === 'aggressive') {
      if (baseExplanation.confidence >= 0.7) {
        baseExplanation.recommendation = `Fırsat kısa ömürlü olabilir - hızlı davranın. Pozisyon: Normal. Stop: Geniş (%-5)`;
      }
    } else if (userMode === 'passive') {
      if (baseExplanation.confidence < 0.8) {
        baseExplanation.recommendation = `Risk yüksek - izleme modunda kalmak daha güvenli. Pozisyon almayın.`;
      } else {
        baseExplanation.recommendation = `Pozisyon alınabilir ancak küçük tutun. Stop: Sıkı (%-2)`;
      }
    }

    return baseExplanation;
  }
}

// Singleton instance
export const dynamicXAI = new DynamicXAI();

/**
 * Generate XAI explanation
 */
export function generateXAIExplanation(context: SignalContext): XAIExplanation {
  return dynamicXAI.generateExplanation(context);
}

/**
 * Generate personalized XAI explanation
 */
export function generatePersonalizedXAIExplanation(
  context: SignalContext,
  userMode: 'aggressive' | 'passive' | 'balanced'
): XAIExplanation {
  return dynamicXAI.generatePersonalizedExplanation(context, userMode);
}


