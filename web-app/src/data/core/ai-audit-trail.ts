/**
 * P5.2: AI Audit Trail (Karar Günlüğü)
 * "AI Decision Log" tablosu: Tarih, sinyal, güven, gerçekleşen sonuç
 * Export → CSV / PDF
 */

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number; // 0-1
  predictedReturn: number; // Predicted return (0-1 scale)
  entryPrice: number;
  targetPrice?: number;
  stopPrice?: number;
  exitPrice?: number; // Actual exit price (if exited)
  exitTime?: string; // Actual exit time
  actualReturn?: number; // Actual realized return
  wasCorrect?: boolean; // Directional accuracy
  factors: Array<{
    factor: string;
    value: number;
    weight: number;
    impact: number;
  }>;
  explanation?: string;
  userAction?: 'opened' | 'closed' | 'ignored';
}

export interface AuditTrailSummary {
  totalSignals: number;
  correctSignals: number;
  accuracy: number; // 0-1
  averageReturn: number;
  averageConfidence: number;
  sharpeRatio?: number;
  winRate: number; // 0-1
  profitFactor: number; // Sum of profits / sum of losses
}

export interface AuditExportOptions {
  format: 'csv' | 'json' | 'pdf';
  startDate?: string;
  endDate?: string;
  symbols?: string[];
  signals?: ('BUY' | 'SELL' | 'HOLD')[];
}

/**
 * AI Audit Trail
 */
export class AIAuditTrail {
  private logs: AuditLogEntry[] = [];
  private maxLogSize = 50000; // Keep last 50k entries

  /**
   * Log AI decision
   */
  logDecision(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): string {
    const id = this.generateID();
    const timestamp = new Date().toISOString();

    const logEntry: AuditLogEntry = {
      ...entry,
      id,
      timestamp,
    };

    this.logs.push(logEntry);

    // Keep only recent logs
    if (this.logs.length > this.maxLogSize) {
      this.logs.shift();
    }

    return id;
  }

  /**
   * Update log entry with actual outcome
   */
  updateOutcome(
    id: string,
    outcome: {
      exitPrice?: number;
      exitTime?: string;
      actualReturn?: number;
      wasCorrect?: boolean;
    }
  ): boolean {
    const index = this.logs.findIndex((log) => log.id === id);
    if (index === -1) return false;

    this.logs[index] = {
      ...this.logs[index],
      ...outcome,
    };

    return true;
  }

  /**
   * Get audit log entries
   */
  getLogs(
    filters?: {
      symbol?: string;
      signal?: 'BUY' | 'SELL' | 'HOLD';
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ): AuditLogEntry[] {
    let filtered = [...this.logs];

    if (filters?.symbol) {
      filtered = filtered.filter((log) => log.symbol === filters.symbol);
    }

    if (filters?.signal) {
      filtered = filtered.filter((log) => log.signal === filters.signal);
    }

    if (filters?.startDate) {
      filtered = filtered.filter((log) => log.timestamp >= filters.startDate!);
    }

    if (filters?.endDate) {
      filtered = filtered.filter((log) => log.timestamp <= filters.endDate!);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }

  /**
   * Get audit trail summary
   */
  getSummary(
    filters?: {
      startDate?: string;
      endDate?: string;
      symbols?: string[];
    }
  ): AuditTrailSummary {
    let filtered = [...this.logs];

    if (filters?.startDate) {
      filtered = filtered.filter((log) => log.timestamp >= filters.startDate!);
    }

    if (filters?.endDate) {
      filtered = filtered.filter((log) => log.timestamp <= filters.endDate!);
    }

    if (filters?.symbols && filters.symbols.length > 0) {
      filtered = filtered.filter((log) => filters.symbols!.includes(log.symbol));
    }

    // Only count exited trades
    const exitedTrades = filtered.filter((log) => log.actualReturn !== undefined);

    const totalSignals = filtered.length;
    const correctSignals = exitedTrades.filter((log) => log.wasCorrect).length;
    const accuracy = exitedTrades.length > 0 ? correctSignals / exitedTrades.length : 0;

    const returns = exitedTrades
      .map((log) => log.actualReturn || 0)
      .filter((r) => !isNaN(r));
    
    const averageReturn = returns.length > 0
      ? returns.reduce((a, b) => a + b, 0) / returns.length
      : 0;

    const averageConfidence = filtered.length > 0
      ? filtered.reduce((sum, log) => sum + log.confidence, 0) / filtered.length
      : 0;

    // Calculate Sharpe ratio (simplified)
    const returnStd = returns.length > 1
      ? Math.sqrt(
          returns.reduce((sum, r) => sum + Math.pow(r - averageReturn, 2), 0) / returns.length
        )
      : 0;
    
    const sharpeRatio = returnStd > 0 ? averageReturn / returnStd : 0;

    // Win rate
    const wins = exitedTrades.filter((log) => (log.actualReturn || 0) > 0).length;
    const winRate = exitedTrades.length > 0 ? wins / exitedTrades.length : 0;

    // Profit factor
    const profits = exitedTrades
      .map((log) => log.actualReturn || 0)
      .filter((r) => r > 0)
      .reduce((sum, r) => sum + r, 0);
    
    const losses = Math.abs(
      exitedTrades
        .map((log) => log.actualReturn || 0)
        .filter((r) => r < 0)
        .reduce((sum, r) => sum + r, 0)
    );

    const profitFactor = losses > 0 ? profits / losses : profits > 0 ? Infinity : 0;

    return {
      totalSignals,
      correctSignals,
      accuracy,
      averageReturn,
      averageConfidence,
      sharpeRatio,
      winRate,
      profitFactor,
    };
  }

  /**
   * Export audit trail to CSV
   */
  exportToCSV(options?: AuditExportOptions): string {
    let filtered = this.getLogs({
      startDate: options?.startDate,
      endDate: options?.endDate,
      signal: options?.signals?.[0], // CSV export typically single signal
    });

    if (options?.symbols && options.symbols.length > 0) {
      filtered = filtered.filter((log) => options.symbols!.includes(log.symbol));
    }

    // CSV headers
    const headers = [
      'ID',
      'Tarih',
      'Sembol',
      'Sinyal',
      'Güven',
      'Tahmin Edilen Getiri',
      'Giriş Fiyatı',
      'Hedef Fiyat',
      'Stop Fiyat',
      'Çıkış Fiyatı',
      'Çıkış Zamanı',
      'Gerçekleşen Getiri',
      'Doğru Mu',
      'Açıklama',
    ];

    // CSV rows
    const rows = filtered.map((log) => [
      log.id,
      log.timestamp,
      log.symbol,
      log.signal,
      log.confidence.toFixed(3),
      log.predictedReturn.toFixed(4),
      log.entryPrice.toFixed(2),
      log.targetPrice?.toFixed(2) || '',
      log.stopPrice?.toFixed(2) || '',
      log.exitPrice?.toFixed(2) || '',
      log.exitTime || '',
      log.actualReturn?.toFixed(4) || '',
      log.wasCorrect ? 'Evet' : 'Hayır',
      log.explanation || '',
    ]);

    // Combine headers and rows
    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    return csv;
  }

  /**
   * Export audit trail to JSON
   */
  exportToJSON(options?: AuditExportOptions): string {
    const filtered = this.getLogs({
      startDate: options?.startDate,
      endDate: options?.endDate,
    });

    let result = filtered;

    if (options?.symbols && options.symbols.length > 0) {
      result = result.filter((log) => options.symbols!.includes(log.symbol));
    }

    if (options?.signals && options.signals.length > 0) {
      result = result.filter((log) => options.signals!.includes(log.signal));
    }

    return JSON.stringify(result, null, 2);
  }

  /**
   * Generate unique ID
   */
  private generateID(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const aiAuditTrail = new AIAuditTrail();

/**
 * Log AI decision
 */
export function logAIDecision(
  entry: Omit<AuditLogEntry, 'id' | 'timestamp'>
): string {
  return aiAuditTrail.logDecision(entry);
}

/**
 * Update audit log outcome
 */
export function updateAuditOutcome(
  id: string,
  outcome: {
    exitPrice?: number;
    exitTime?: string;
    actualReturn?: number;
    wasCorrect?: boolean;
  }
): boolean {
  return aiAuditTrail.updateOutcome(id, outcome);
}

/**
 * Get audit logs
 */
export function getAuditLogs(
  filters?: {
    symbol?: string;
    signal?: 'BUY' | 'SELL' | 'HOLD';
    startDate?: string;
    endDate?: string;
    limit?: number;
  }
): AuditLogEntry[] {
  return aiAuditTrail.getLogs(filters);
}

/**
 * Get audit summary
 */
export function getAuditSummary(
  filters?: {
    startDate?: string;
    endDate?: string;
    symbols?: string[];
  }
): AuditTrailSummary {
  return aiAuditTrail.getSummary(filters);
}

/**
 * Export to CSV
 */
export function exportAuditToCSV(options?: AuditExportOptions): string {
  return aiAuditTrail.exportToCSV(options);
}

/**
 * Export to JSON
 */
export function exportAuditToJSON(options?: AuditExportOptions): string {
  return aiAuditTrail.exportToJSON(options);
}


