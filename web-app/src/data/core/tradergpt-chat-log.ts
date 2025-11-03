/**
 * P5.2: TraderGPT Chat Log
 * Chat log ve kısa özet ekle
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  symbol?: string; // If message is about a specific symbol
  signal?: 'BUY' | 'SELL' | 'HOLD'; // If message contains a signal
  confidence?: number; // 0-1
}

export interface ChatSummary {
  totalMessages: number;
  lastActivity: string;
  symbolsDiscussed: string[];
  signalsGiven: Array<{
    symbol: string;
    signal: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    timestamp: string;
  }>;
  summary: string; // AI-generated summary
}

/**
 * TraderGPT Chat Log Manager
 */
export class TraderGPTChatLog {
  private messages: ChatMessage[] = [];
  private maxMessages = 1000;

  /**
   * Add message to chat log
   */
  addMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): string {
    const id = this.generateID();
    const newMessage: ChatMessage = {
      ...message,
      id,
      timestamp: new Date().toISOString(),
    };

    this.messages.push(newMessage);

    // Keep only recent messages
    if (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }

    return id;
  }

  /**
   * Get chat history
   */
  getHistory(limit: number = 100): ChatMessage[] {
    return this.messages
      .slice(-limit)
      .sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
  }

  /**
   * Get messages for a symbol
   */
  getMessagesForSymbol(symbol: string): ChatMessage[] {
    return this.messages.filter((m) => m.symbol === symbol);
  }

  /**
   * Get chat summary
   */
  getSummary(): ChatSummary {
    const lastActivity = this.messages.length > 0
      ? this.messages[this.messages.length - 1].timestamp
      : new Date().toISOString();

    // Extract symbols discussed
    const symbols = Array.from(
      new Set(
        this.messages
          .filter((m) => m.symbol)
          .map((m) => m.symbol!)
      )
    );

    // Extract signals
    const signals = this.messages
      .filter((m) => m.signal && m.symbol)
      .map((m) => ({
        symbol: m.symbol!,
        signal: m.signal!,
        confidence: m.confidence || 0,
        timestamp: m.timestamp,
      }));

    // Generate summary
    const summary = this.generateSummary(symbols, signals);

    return {
      totalMessages: this.messages.length,
      lastActivity,
      symbolsDiscussed: symbols,
      signalsGiven: signals,
      summary,
    };
  }

  /**
   * Generate chat summary
   */
  private generateSummary(symbols: string[], signals: Array<{ symbol: string; signal: 'BUY' | 'SELL' | 'HOLD'; confidence: number; timestamp: string }>): string {
    if (signals.length === 0) {
      return 'Henüz sinyal verilmemiş.';
    }

    const recentSignals = signals.slice(-5); // Last 5 signals
    const buyCount = recentSignals.filter((s) => s.signal === 'BUY').length;
    const sellCount = recentSignals.filter((s) => s.signal === 'SELL').length;

    const symbolList = symbols.length > 0 ? symbols.slice(0, 5).join(', ') : '—';
    
    return `Son ${recentSignals.length} sinyal: ${buyCount} BUY, ${sellCount} SELL. Tartışılan semboller: ${symbolList}.`;
  }

  /**
   * Clear chat log
   */
  clear(): void {
    this.messages = [];
  }

  /**
   * Generate unique ID
   */
  private generateID(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const traderGPTChatLog = new TraderGPTChatLog();

/**
 * Add chat message
 */
export function addChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): string {
  return traderGPTChatLog.addMessage(message);
}

/**
 * Get chat history
 */
export function getChatHistory(limit: number = 100): ChatMessage[] {
  return traderGPTChatLog.getHistory(limit);
}

/**
 * Get chat summary
 */
export function getChatSummary(): ChatSummary {
  return traderGPTChatLog.getSummary();
}


