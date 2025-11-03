/**
 * Event-Driven Alpha Alerts
 * v6.0 Profit Intelligence Suite
 * 
 * TCMB, FED, bilanço gibi olayların olası etkisini tahmin eder
 * Fayda: Etkinlik öncesi pozisyon koruma veya fırsat girişi
 */

export interface EventAlert {
  eventType: 'TCMB_FAIZ' | 'FED_FAIZ' | 'BILANCO' | 'SECIM' | 'MAKRO_VERI' | 'OTHER';
  eventName: string;
  scheduledDate: string; // ISO timestamp
  symbol?: string; // Affected symbol (if specific)
  sector?: string; // Affected sector
  expectedImpact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED';
  impactMagnitude: number; // 0-100
  confidence: number; // 0-1
  recommendation: string;
  actionRequired: 'HEDGE' | 'REDUCE_POSITION' | 'INCREASE_POSITION' | 'WAIT' | 'NONE';
  timeframe: 'IMMEDIATE' | '1H' | '4H' | '24H';
}

export interface EventAlertInput {
  events: Array<{
    type: EventAlert['eventType'];
    name: string;
    date: string;
    symbol?: string;
    sector?: string;
  }>;
  currentPortfolio: Array<{
    symbol: string;
    weight: number;
    sector: string;
  }>;
}

/**
 * Generate event-driven alerts
 */
export function generateEventAlerts(input: EventAlertInput): EventAlert[] {
  const { events, currentPortfolio } = input;

  const alerts: EventAlert[] = events.map(event => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Determine expected impact based on event type
    let expectedImpact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED' = 'NEUTRAL';
    let impactMagnitude = 0;
    let recommendation = '';
    let actionRequired: 'HEDGE' | 'REDUCE_POSITION' | 'INCREASE_POSITION' | 'WAIT' | 'NONE' = 'WAIT';
    let confidence = 0.5;

    switch (event.type) {
      case 'TCMB_FAIZ':
        expectedImpact = 'MIXED';
        impactMagnitude = 75;
        confidence = 0.8;
        recommendation = 'TCMB faiz kararı yaklaşıyor. Bankacılık sektörü için önemli. Hedge veya pozisyon azaltma düşünülebilir.';
        actionRequired = hoursUntilEvent < 24 ? 'HEDGE' : 'REDUCE_POSITION';
        break;
      case 'FED_FAIZ':
        expectedImpact = 'NEGATIVE';
        impactMagnitude = 60;
        confidence = 0.7;
        recommendation = 'FED faiz kararı BIST\'i etkileyebilir. Dolar bazlı sektörlere dikkat.';
        actionRequired = hoursUntilEvent < 48 ? 'HEDGE' : 'WAIT';
        break;
      case 'BILANCO':
        expectedImpact = event.symbol ? 'POSITIVE' : 'MIXED';
        impactMagnitude = 50;
        confidence = 0.6;
        recommendation = `${event.symbol || 'Şirket'} bilanço açıklaması yaklaşıyor. Pozisyon gözden geçirilmeli.`;
        actionRequired = hoursUntilEvent < 24 ? 'WAIT' : 'NONE';
        break;
      case 'SECIM':
        expectedImpact = 'MIXED';
        impactMagnitude = 80;
        confidence = 0.9;
        recommendation = 'Seçim yaklaşıyor. Yüksek volatilite beklentisi. Pozisyon azaltma öneriliyor.';
        actionRequired = hoursUntilEvent < 72 ? 'REDUCE_POSITION' : 'WAIT';
        break;
      default:
        expectedImpact = 'NEUTRAL';
        impactMagnitude = 30;
        confidence = 0.4;
        recommendation = 'Etkinlik etkisi belirsiz. Normal takip öneriliyor.';
        actionRequired = 'WAIT';
    }

    // Check if portfolio is affected
    const affectedSymbols = event.symbol 
      ? currentPortfolio.filter(p => p.symbol === event.symbol)
      : event.sector
      ? currentPortfolio.filter(p => p.sector === event.sector)
      : currentPortfolio;

    if (affectedSymbols.length === 0) {
      actionRequired = 'NONE';
      recommendation += ' (Portföyünüzde etkilenen hisse yok)';
    }

    const timeframe: 'IMMEDIATE' | '1H' | '4H' | '24H' = hoursUntilEvent < 1 
      ? 'IMMEDIATE'
      : hoursUntilEvent < 4
      ? '1H'
      : hoursUntilEvent < 24
      ? '4H'
      : '24H';

    return {
      eventType: event.type,
      eventName: event.name,
      scheduledDate: event.date,
      symbol: event.symbol,
      sector: event.sector,
      expectedImpact,
      impactMagnitude: Math.round(impactMagnitude * 10) / 10,
      confidence: Math.round(confidence * 100) / 100,
      recommendation,
      actionRequired,
      timeframe,
    };
  });

  // Sort by urgency (timeframe)
  const timeframeOrder = { 'IMMEDIATE': 0, '1H': 1, '4H': 2, '24H': 3 };
  alerts.sort((a, b) => timeframeOrder[a.timeframe] - timeframeOrder[b.timeframe]);

  return alerts;
}



