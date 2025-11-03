/**
 * P5.2: Real-time Macro Sensitivity Layer
 * TCMB, FED, ECB karar takvimi API'si - Makro sentiment değişimi ve otomatik rejim switch
 */

export interface MacroEvent {
  id: string;
  institution: 'TCMB' | 'FED' | 'ECB' | 'BOJ' | 'BOE';
  eventType: 'rate_decision' | 'inflation_report' | 'policy_statement' | 'press_conference';
  scheduledTime: string; // ISO timestamp
  actualTime?: string; // ISO timestamp (if happened)
  status: 'scheduled' | 'happened' | 'cancelled';
  impact: 'high' | 'medium' | 'low';
  previousRate?: number;
  newRate?: number;
  change?: number; // Rate change in basis points
  sentimentShift?: 'risk_on' | 'risk_off' | 'neutral';
}

export interface MacroCalendar {
  events: MacroEvent[];
  lastUpdate: string;
  timezone: string;
}

export interface RegimeShift {
  from: 'risk_on' | 'risk_off' | 'neutral';
  to: 'risk_on' | 'risk_off' | 'neutral';
  trigger: MacroEvent;
  confidence: number; // 0-1
  timestamp: string;
  reason: string;
}

/**
 * Macro Calendar Client
 * Fetches central bank decision calendars from TradingEconomics or Forexfactory RSS
 */
export class MacroCalendarClient {
  /**
   * Fetch TCMB (Turkish Central Bank) decision calendar
   */
  async fetchTCMBCalendar(): Promise<MacroEvent[]> {
    try {
      // TradingEconomics API or RSS feed
      // For now, use mock data structure
      // In production, integrate with TradingEconomics API or scrape from their website
      return this.generateMockTCMBEvents();
    } catch (error) {
      console.error('❌ TCMB calendar fetch error:', error);
      return [];
    }
  }

  /**
   * Fetch FED (US Federal Reserve) decision calendar
   */
  async fetchFEDCalendar(): Promise<MacroEvent[]> {
    try {
      // FED calendar from their official website or TradingEconomics
      return this.generateMockFEDEvents();
    } catch (error) {
      console.error('❌ FED calendar fetch error:', error);
      return [];
    }
  }

  /**
   * Fetch ECB (European Central Bank) decision calendar
   */
  async fetchECBCalendar(): Promise<MacroEvent[]> {
    try {
      // ECB calendar from their official website or TradingEconomics
      return this.generateMockECBEvents();
    } catch (error) {
      console.error('❌ ECB calendar fetch error:', error);
      return [];
    }
  }

  /**
   * Aggregate all central bank calendars
   */
  async fetchAllCalendars(): Promise<MacroCalendar> {
    const [tcmb, fed, ecb] = await Promise.all([
      this.fetchTCMBCalendar(),
      this.fetchFEDCalendar(),
      this.fetchECBCalendar(),
    ]);

    return {
      events: [...tcmb, ...fed, ...ecb].sort((a, b) => 
        new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
      ),
      lastUpdate: new Date().toISOString(),
      timezone: 'Europe/Istanbul',
    };
  }

  /**
   * Get upcoming events (next 30 days)
   */
  getUpcomingEvents(calendar: MacroCalendar, days: number = 30): MacroEvent[] {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);

    return calendar.events.filter((event) => {
      const eventTime = new Date(event.scheduledTime);
      return eventTime >= now && eventTime <= future && event.status === 'scheduled';
    });
  }

  /**
   * Generate mock TCMB events
   */
  private generateMockTCMBEvents(): MacroEvent[] {
    const now = new Date();
    const events: MacroEvent[] = [];

    // Next TCMB rate decision (typically first Thursday of month)
    const nextDecision = new Date(now);
    nextDecision.setDate(1);
    nextDecision.setMonth(nextDecision.getMonth() + 1);
    // Find first Thursday
    while (nextDecision.getDay() !== 4) {
      nextDecision.setDate(nextDecision.getDate() + 1);
    }

    events.push({
      id: 'tcmb-rate-1',
      institution: 'TCMB',
      eventType: 'rate_decision',
      scheduledTime: nextDecision.toISOString(),
      status: 'scheduled',
      impact: 'high',
      previousRate: 45.0, // Example: 45%
      sentimentShift: undefined,
    });

    // Add inflation report (typically mid-month)
    const inflationReport = new Date(now);
    inflationReport.setDate(15);
    inflationReport.setMonth(inflationReport.getMonth() + 1);
    
    events.push({
      id: 'tcmb-inflation-1',
      institution: 'TCMB',
      eventType: 'inflation_report',
      scheduledTime: inflationReport.toISOString(),
      status: 'scheduled',
      impact: 'medium',
      sentimentShift: undefined,
    });

    return events;
  }

  /**
   * Generate mock FED events
   */
  private generateMockFEDEvents(): MacroEvent[] {
    const now = new Date();
    const events: MacroEvent[] = [];

    // FED typically meets 8 times per year
    const nextFOMC = new Date(now);
    nextFOMC.setMonth(nextFOMC.getMonth() + 1);
    // Find Tuesday or Wednesday (typical FOMC meeting days)
    while (nextFOMC.getDay() !== 2 && nextFOMC.getDay() !== 3) {
      nextFOMC.setDate(nextFOMC.getDate() + 1);
    }

    events.push({
      id: 'fed-fomc-1',
      institution: 'FED',
      eventType: 'rate_decision',
      scheduledTime: nextFOMC.toISOString(),
      status: 'scheduled',
      impact: 'high',
      previousRate: 5.25, // Example: 5.25%
      sentimentShift: undefined,
    });

    return events;
  }

  /**
   * Generate mock ECB events
   */
  private generateMockECBEvents(): MacroEvent[] {
    const now = new Date();
    const events: MacroEvent[] = [];

    // ECB typically meets every 6 weeks
    const nextECB = new Date(now);
    nextECB.setDate(nextECB.getDate() + 42); // ~6 weeks

    events.push({
      id: 'ecb-rate-1',
      institution: 'ECB',
      eventType: 'rate_decision',
      scheduledTime: nextECB.toISOString(),
      status: 'scheduled',
      impact: 'high',
      previousRate: 4.5, // Example: 4.5%
      sentimentShift: undefined,
    });

    return events;
  }
}

/**
 * Macro Sentiment Analyzer
 * Analyzes macro events and determines sentiment shifts
 */
export class MacroSentimentAnalyzer {
  /**
   * Analyze macro event and determine regime shift
   */
  analyzeEvent(event: MacroEvent): RegimeShift | null {
    if (event.status !== 'happened' || !event.newRate) {
      return null;
    }

    const { institution, previousRate, newRate, change } = event;
    
    if (!previousRate || !newRate || change === undefined) {
      return null;
    }

    let from: 'risk_on' | 'risk_off' | 'neutral' = 'neutral';
    let to: 'risk_on' | 'risk_off' | 'neutral' = 'neutral';
    let confidence = 0.7;
    let reason = '';

    // Rate cut = Risk-On (more liquidity, easier money)
    // Rate hike = Risk-Off (less liquidity, tighter money)
    
    if (change < 0) {
      // Rate cut
      from = 'risk_off';
      to = 'risk_on';
      confidence = 0.75;
      reason = `${institution} faiz indirimi (${Math.abs(change)} baz puan) → Risk-On rejimine geçiş. Daha fazla likidite, piyasa yükseliş eğilimi.`;
    } else if (change > 0) {
      // Rate hike
      from = 'risk_on';
      to = 'risk_off';
      confidence = 0.75;
      reason = `${institution} faiz artışı (+${change} baz puan) → Risk-Off rejimine geçiş. Sıkı para politikası, piyasa düşüş eğilimi.`;
    } else {
      // No change
      to = 'neutral';
      confidence = 0.5;
      reason = `${institution} faiz değişikliği yok → Nötr rejim. Beklemede kal.`;
    }

    // Higher confidence for TCMB (more direct impact on BIST)
    if (institution === 'TCMB') {
      confidence = Math.min(1.0, confidence + 0.15);
    }

    return {
      from,
      to,
      trigger: event,
      confidence,
      timestamp: event.actualTime || event.scheduledTime,
      reason,
    };
  }

  /**
   * Get current regime based on recent macro events
   */
  getCurrentRegime(events: MacroEvent[]): {
    regime: 'risk_on' | 'risk_off' | 'neutral';
    confidence: number;
    lastShift?: RegimeShift;
  } {
    const recentEvents = events
      .filter((e) => e.status === 'happened')
      .sort((a, b) => 
        new Date(b.actualTime || b.scheduledTime).getTime() - 
        new Date(a.actualTime || a.scheduledTime).getTime()
      )
      .slice(0, 3); // Last 3 events

    if (recentEvents.length === 0) {
      return {
        regime: 'neutral',
        confidence: 0.5,
      };
    }

    // Analyze most recent event
    const lastShift = this.analyzeEvent(recentEvents[0]);
    
    if (lastShift) {
      return {
        regime: lastShift.to,
        confidence: lastShift.confidence,
        lastShift,
      };
    }

    return {
      regime: 'neutral',
      confidence: 0.5,
    };
  }
}

/**
 * Macro Context Layer
 * Main interface for macro sensitivity
 */
export class MacroContextLayer {
  private calendarClient: MacroCalendarClient;
  private sentimentAnalyzer: MacroSentimentAnalyzer;

  constructor() {
    this.calendarClient = new MacroCalendarClient();
    this.sentimentAnalyzer = new MacroSentimentAnalyzer();
  }

  /**
   * Get macro context for AI predictions
   */
  async getMacroContext(): Promise<{
    calendar: MacroCalendar;
    upcomingEvents: MacroEvent[];
    currentRegime: {
      regime: 'risk_on' | 'risk_off' | 'neutral';
      confidence: number;
      lastShift?: RegimeShift;
    };
    regimeShifts: RegimeShift[];
  }> {
    const calendar = await this.calendarClient.fetchAllCalendars();
    const upcomingEvents = this.calendarClient.getUpcomingEvents(calendar, 30);
    const currentRegime = this.sentimentAnalyzer.getCurrentRegime(calendar.events);
    
    // Analyze recent events for regime shifts
    const recentEvents = calendar.events
      .filter((e) => e.status === 'happened')
      .slice(-5); // Last 5 events
    
    const regimeShifts = recentEvents
      .map((e) => this.sentimentAnalyzer.analyzeEvent(e))
      .filter((s): s is RegimeShift => s !== null);

    return {
      calendar,
      upcomingEvents,
      currentRegime,
      regimeShifts,
    };
  }

  /**
   * Check if regime shift should trigger portfolio rebalance
   */
  shouldRebalance(regimeShift: RegimeShift): boolean {
    // High confidence regime shift = rebalance
    return regimeShift.confidence >= 0.7 && regimeShift.from !== regimeShift.to;
  }

  /**
   * Get macro-aware signal adjustment
   * Adjusts AI signals based on macro context
   */
  adjustSignalForMacro(
    signal: 'BUY' | 'SELL' | 'HOLD',
    confidence: number,
    regime: 'risk_on' | 'risk_off' | 'neutral'
  ): {
    adjustedSignal: 'BUY' | 'SELL' | 'HOLD';
    adjustedConfidence: number;
    macroImpact: string;
  } {
    let adjustedSignal = signal;
    let adjustedConfidence = confidence;
    let macroImpact = '';

    // Risk-Off regime: Reduce BUY signals, increase SELL signals
    if (regime === 'risk_off') {
      if (signal === 'BUY') {
        adjustedSignal = 'HOLD';
        adjustedConfidence = confidence * 0.7;
        macroImpact = 'Risk-Off rejimi: BUY sinyali HOLD\'a düşürüldü';
      } else if (signal === 'SELL') {
        adjustedConfidence = Math.min(1.0, confidence * 1.1);
        macroImpact = 'Risk-Off rejimi: SELL sinyali güçlendi';
      }
    }
    
    // Risk-On regime: Increase BUY signals, reduce SELL signals
    else if (regime === 'risk_on') {
      if (signal === 'BUY') {
        adjustedConfidence = Math.min(1.0, confidence * 1.1);
        macroImpact = 'Risk-On rejimi: BUY sinyali güçlendi';
      } else if (signal === 'SELL') {
        adjustedSignal = 'HOLD';
        adjustedConfidence = confidence * 0.7;
        macroImpact = 'Risk-On rejimi: SELL sinyali HOLD\'a düşürüldü';
      }
    }

    return {
      adjustedSignal,
      adjustedConfidence,
      macroImpact,
    };
  }
}

// Singleton instances
export const macroCalendarClient = new MacroCalendarClient();
export const macroContextLayer = new MacroContextLayer();


