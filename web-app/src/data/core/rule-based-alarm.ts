/**
 * P5.2: Rule-based Alarm System
 * Conf≥%85 & Δ≥5% koşulları
 */

export interface AlarmRule {
  id: string;
  symbol?: string; // Specific symbol or '*' for all
  condition: {
    confidence?: {
      operator: '>=' | '<=' | '==' | '!=';
      value: number; // 0-100 percentage
    };
    priceChange?: {
      operator: '>=' | '<=' | '==' | '!=';
      value: number; // Percentage change
    };
    volume?: {
      operator: '>=' | '<=' | '==' | '!=';
      value: number; // Volume ratio
    };
    rsi?: {
      operator: '>=' | '<=' | '==' | '!=';
      value: number; // RSI value
    };
    signal?: 'BUY' | 'SELL' | 'HOLD' | '*'; // Signal type
  };
  action: {
    type: 'notification' | 'email' | 'telegram' | 'webhook';
    message: string;
  };
  enabled: boolean;
  createdAt: string;
  lastTriggered?: string;
}

export interface AlarmTrigger {
  ruleId: string;
  symbol: string;
  triggeredAt: string;
  condition: string;
  value: any;
  message: string;
}

/**
 * Rule-based Alarm System
 */
export class RuleBasedAlarmSystem {
  private rules: AlarmRule[] = [];
  private triggers: AlarmTrigger[] = [];
  private maxTriggers = 1000;

  /**
   * Add alarm rule
   */
  addRule(rule: Omit<AlarmRule, 'id' | 'createdAt'>): string {
    const id = this.generateID();
    const newRule: AlarmRule = {
      ...rule,
      id,
      createdAt: new Date().toISOString(),
    };
    
    this.rules.push(newRule);
    return id;
  }

  /**
   * Remove alarm rule
   */
  removeRule(ruleId: string): boolean {
    const index = this.rules.findIndex((r) => r.id === ruleId);
    if (index === -1) return false;
    
    this.rules.splice(index, 1);
    return true;
  }

  /**
   * Get all rules
   */
  getRules(): AlarmRule[] {
    return [...this.rules];
  }

  /**
   * Get rules for a symbol
   */
  getRulesForSymbol(symbol: string): AlarmRule[] {
    return this.rules.filter((r) => !r.symbol || r.symbol === '*' || r.symbol === symbol);
  }

  /**
   * Check if conditions are met and trigger alarms
   */
  checkConditions(
    symbol: string,
    data: {
      confidence?: number; // 0-1
      priceChange?: number; // Percentage change
      volume?: number; // Volume ratio
      rsi?: number;
      signal?: 'BUY' | 'SELL' | 'HOLD';
    }
  ): AlarmTrigger[] {
    const triggers: AlarmTrigger[] = [];
    const applicableRules = this.getRulesForSymbol(symbol).filter((r) => r.enabled);

    applicableRules.forEach((rule) => {
      if (this.evaluateConditions(rule.condition, data)) {
        const trigger: AlarmTrigger = {
          ruleId: rule.id,
          symbol,
          triggeredAt: new Date().toISOString(),
          condition: this.formatCondition(rule.condition),
          value: data,
          message: this.formatMessage(rule.action.message, symbol, data),
        };

        triggers.push(trigger);
        this.recordTrigger(trigger);
        
        // Update rule lastTriggered
        rule.lastTriggered = trigger.triggeredAt;
      }
    });

    return triggers;
  }

  /**
   * Evaluate conditions
   */
  private evaluateConditions(
    condition: AlarmRule['condition'],
    data: {
      confidence?: number;
      priceChange?: number;
      volume?: number;
      rsi?: number;
      signal?: 'BUY' | 'SELL' | 'HOLD';
    }
  ): boolean {
    // Check confidence condition
    if (condition.confidence) {
      const { operator, value } = condition.confidence;
      const dataValue = (data.confidence || 0) * 100; // Convert to percentage
      
      if (!this.compareValues(dataValue, operator, value)) {
        return false;
      }
    }

    // Check priceChange condition
    if (condition.priceChange) {
      const { operator, value } = condition.priceChange;
      const dataValue = data.priceChange || 0;
      
      if (!this.compareValues(dataValue, operator, value)) {
        return false;
      }
    }

    // Check volume condition
    if (condition.volume) {
      const { operator, value } = condition.volume;
      const dataValue = data.volume || 0;
      
      if (!this.compareValues(dataValue, operator, value)) {
        return false;
      }
    }

    // Check RSI condition
    if (condition.rsi) {
      const { operator, value } = condition.rsi;
      const dataValue = data.rsi || 0;
      
      if (!this.compareValues(dataValue, operator, value)) {
        return false;
      }
    }

    // Check signal condition
    if (condition.signal && condition.signal !== '*') {
      if (data.signal !== condition.signal) {
        return false;
      }
    }

    return true;
  }

  /**
   * Compare values based on operator
   */
  private compareValues(a: number, operator: '>=' | '<=' | '==' | '!=', b: number): boolean {
    switch (operator) {
      case '>=':
        return a >= b;
      case '<=':
        return a <= b;
      case '==':
        return Math.abs(a - b) < 0.01; // Float comparison with tolerance
      case '!=':
        return Math.abs(a - b) >= 0.01;
      default:
        return false;
    }
  }

  /**
   * Format condition string
   */
  private formatCondition(condition: AlarmRule['condition']): string {
    const parts: string[] = [];

    if (condition.confidence) {
      parts.push(`Güven ${condition.confidence.operator} ${condition.confidence.value}%`);
    }

    if (condition.priceChange) {
      parts.push(`Fiyat Değişimi ${condition.priceChange.operator} ${condition.priceChange.value}%`);
    }

    if (condition.volume) {
      parts.push(`Hacim ${condition.volume.operator} ${condition.volume.value}`);
    }

    if (condition.rsi) {
      parts.push(`RSI ${condition.rsi.operator} ${condition.rsi.value}`);
    }

    if (condition.signal && condition.signal !== '*') {
      parts.push(`Sinyal = ${condition.signal}`);
    }

    return parts.join(' & ');
  }

  /**
   * Format message with placeholders
   */
  private formatMessage(
    template: string,
    symbol: string,
    data: {
      confidence?: number;
      priceChange?: number;
      volume?: number;
      rsi?: number;
      signal?: 'BUY' | 'SELL' | 'HOLD';
    }
  ): string {
    let message = template;
    
    message = message.replace('{symbol}', symbol);
    message = message.replace('{confidence}', ((data.confidence || 0) * 100).toFixed(1));
    message = message.replace('{priceChange}', (data.priceChange || 0).toFixed(2));
    message = message.replace('{volume}', (data.volume || 0).toFixed(2));
    message = message.replace('{rsi}', (data.rsi || 0).toFixed(1));
    message = message.replace('{signal}', data.signal || 'HOLD');
    
    return message;
  }

  /**
   * Record trigger
   */
  private recordTrigger(trigger: AlarmTrigger): void {
    this.triggers.push(trigger);
    
    // Keep only recent triggers
    if (this.triggers.length > this.maxTriggers) {
      this.triggers.shift();
    }
  }

  /**
   * Get trigger history
   */
  getTriggerHistory(limit: number = 100): AlarmTrigger[] {
    return this.triggers
      .slice(-limit)
      .sort((a, b) => 
        new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
      );
  }

  /**
   * Generate unique ID
   */
  private generateID(): string {
    return `alarm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create default rules
   */
  createDefaultRules(): string[] {
    // Rule 1: High confidence + significant price change
    const rule1Id = this.addRule({
      symbol: '*',
      condition: {
        confidence: { operator: '>=', value: 85 },
        priceChange: { operator: '>=', value: 5 },
      },
      action: {
        type: 'notification',
        message: '{symbol}: Güçlü sinyal! Güven {confidence}%, Fiyat değişimi {priceChange}%',
      },
      enabled: true,
    });

    // Rule 2: Low confidence alert
    const rule2Id = this.addRule({
      symbol: '*',
      condition: {
        confidence: { operator: '<=', value: 60 },
      },
      action: {
        type: 'notification',
        message: '{symbol}: Düşük güven uyarısı ({confidence}%)',
      },
      enabled: true,
    });

    // Rule 3: RSI overbought/oversold
    const rule3Id = this.addRule({
      symbol: '*',
      condition: {
        rsi: { operator: '>=', value: 75 },
      },
      action: {
        type: 'notification',
        message: '{symbol}: Aşırı alım sinyali (RSI {rsi})',
      },
      enabled: true,
    });

    return [rule1Id, rule2Id, rule3Id];
  }
}

// Singleton instance
export const ruleBasedAlarmSystem = new RuleBasedAlarmSystem();

/**
 * Add alarm rule
 */
export function addAlarmRule(rule: Omit<AlarmRule, 'id' | 'createdAt'>): string {
  return ruleBasedAlarmSystem.addRule(rule);
}

/**
 * Check conditions and trigger alarms
 */
export function checkAlarmConditions(
  symbol: string,
  data: {
    confidence?: number;
    priceChange?: number;
    volume?: number;
    rsi?: number;
    signal?: 'BUY' | 'SELL' | 'HOLD';
  }
): AlarmTrigger[] {
  return ruleBasedAlarmSystem.checkConditions(symbol, data);
}

/**
 * Get alarm rules
 */
export function getAlarmRules(): AlarmRule[] {
  return ruleBasedAlarmSystem.getRules();
}


