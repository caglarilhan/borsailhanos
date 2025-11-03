/**
 * P5.2: Reinforcement Learning System
 * AI kendi hatalarından öğrensin: reward = gerçekleşen getiri - tahmin edilen getiri
 */

export interface TradeOutcome {
  signalId: string;
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  predictedReturn: number; // Predicted return (0-1 scale, e.g., 0.05 = 5%)
  predictedConfidence: number; // 0-1
  entryPrice: number;
  exitPrice?: number; // If exited
  entryTime: string; // ISO timestamp
  exitTime?: string; // ISO timestamp
  actualReturn?: number; // Actual return (calculated after exit)
  slippage?: number; // Transaction cost + slippage (0-1 scale)
  reward?: number; // reward = actualReturn - predictedReturn - slippage
  wasCorrect?: boolean; // Directional accuracy
}

export interface LearningUpdate {
  weights: {
    sentiment: number;
    momentum: number;
    volume: number;
    rsi: number;
    macd: number;
  };
  bias: number; // Model bias correction
  learningRate: number;
  totalReward: number; // Cumulative reward
  totalTrades: number;
  averageReward: number;
  lastUpdate: string;
}

export interface RLConfig {
  learningRate: number; // α (default 0.05)
  discountFactor: number; // γ (default 0.95)
  explorationRate: number; // ε (default 0.1)
  slippageCost: number; // Default transaction cost (e.g., 0.0015 = 15 bps)
}

/**
 * Reinforcement Learning Agent
 */
export class RLAgent {
  private config: RLConfig;
  private history: TradeOutcome[] = [];
  private learningState: LearningUpdate;

  constructor(config?: Partial<RLConfig>) {
    this.config = {
      learningRate: config?.learningRate ?? 0.05,
      discountFactor: config?.discountFactor ?? 0.95,
      explorationRate: config?.explorationRate ?? 0.1,
      slippageCost: config?.slippageCost ?? 0.0015, // 15 bps default
    };

    this.learningState = {
      weights: {
        sentiment: 0.30,
        momentum: 0.25,
        volume: 0.20,
        rsi: 0.15,
        macd: 0.10,
      },
      bias: 0.0,
      learningRate: this.config.learningRate,
      totalReward: 0,
      totalTrades: 0,
      averageReward: 0,
      lastUpdate: new Date().toISOString(),
    };
  }

  /**
   * Record trade outcome and learn from it
   * reward = gerçekleşen getiri - tahmin edilen getiri - slippage
   */
  learnFromTrade(outcome: TradeOutcome): LearningUpdate {
    // Calculate actual return if exit price is available
    if (outcome.exitPrice && outcome.entryPrice) {
      const priceReturn = (outcome.exitPrice - outcome.entryPrice) / outcome.entryPrice;
      const directionMultiplier = outcome.signal === 'BUY' ? 1 : -1;
      outcome.actualReturn = priceReturn * directionMultiplier;
      
      // Calculate slippage if not provided
      if (outcome.slippage === undefined) {
        outcome.slippage = this.config.slippageCost;
      }

      // Calculate reward: actual - predicted - slippage
      outcome.reward = (outcome.actualReturn || 0) - outcome.predictedReturn - outcome.slippage;
      
      // Determine if prediction was correct (directional accuracy)
      outcome.wasCorrect = 
        (outcome.signal === 'BUY' && outcome.actualReturn > 0) ||
        (outcome.signal === 'SELL' && outcome.actualReturn < 0) ||
        (outcome.signal === 'HOLD');
    }

    // Add to history
    this.history.push(outcome);
    if (this.history.length > 10000) {
      // Keep only last 10k trades
      this.history.shift();
    }

    // Update learning state if reward is available
    if (outcome.reward !== undefined) {
      this.updateWeights(outcome);
    }

    return { ...this.learningState };
  }

  /**
   * Update model weights based on reward
   * w_i += α * reward * feature_i
   */
  private updateWeights(outcome: TradeOutcome): void {
    const { reward = 0, predictedConfidence } = outcome;
    
    // Update weights proportionally to their contribution
    // Positive reward = increase weights, negative reward = decrease weights
    const adjustment = this.config.learningRate * reward;
    
    // Adjust weights based on confidence (higher confidence = larger adjustment)
    const confidenceMultiplier = predictedConfidence;
    
    this.learningState.weights.sentiment = Math.max(0, Math.min(0.5, 
      this.learningState.weights.sentiment + adjustment * confidenceMultiplier * 0.3
    ));
    
    this.learningState.weights.momentum = Math.max(0, Math.min(0.5, 
      this.learningState.weights.momentum + adjustment * confidenceMultiplier * 0.25
    ));
    
    this.learningState.weights.volume = Math.max(0, Math.min(0.5, 
      this.learningState.weights.volume + adjustment * confidenceMultiplier * 0.20
    ));
    
    this.learningState.weights.rsi = Math.max(0, Math.min(0.5, 
      this.learningState.weights.rsi + adjustment * confidenceMultiplier * 0.15
    ));
    
    this.learningState.weights.macd = Math.max(0, Math.min(0.5, 
      this.learningState.weights.macd + adjustment * confidenceMultiplier * 0.10
    ));
    
    // Normalize weights to sum to 1
    this.normalizeWeights();
    
    // Update bias
    this.learningState.bias += adjustment * 0.1;
    
    // Update statistics
    this.learningState.totalReward += reward;
    this.learningState.totalTrades += 1;
    this.learningState.averageReward = this.learningState.totalReward / this.learningState.totalTrades;
    this.learningState.lastUpdate = new Date().toISOString();
  }

  /**
   * Normalize weights to sum to 1
   */
  private normalizeWeights(): void {
    const { sentiment, momentum, volume, rsi, macd } = this.learningState.weights;
    const sum = sentiment + momentum + volume + rsi + macd;
    
    if (sum > 0) {
      this.learningState.weights.sentiment = sentiment / sum;
      this.learningState.weights.momentum = momentum / sum;
      this.learningState.weights.volume = volume / sum;
      this.learningState.weights.rsi = rsi / sum;
      this.learningState.weights.macd = macd / sum;
    }
  }

  /**
   * Get current learning state
   */
  getLearningState(): LearningUpdate {
    return { ...this.learningState };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): {
    totalTrades: number;
    correctTrades: number;
    accuracy: number;
    totalReward: number;
    averageReward: number;
    sharpeRatio: number; // Risk-adjusted return
  } {
    const completedTrades = this.history.filter((t) => t.actualReturn !== undefined);
    const correctTrades = completedTrades.filter((t) => t.wasCorrect).length;
    
    const rewards = completedTrades
      .map((t) => t.reward || 0)
      .filter((r) => !isNaN(r));
    
    const avgReward = rewards.length > 0 
      ? rewards.reduce((a, b) => a + b, 0) / rewards.length 
      : 0;
    
    // Calculate Sharpe ratio (simplified)
    const rewardStd = rewards.length > 1
      ? Math.sqrt(
          rewards.reduce((sum, r) => sum + Math.pow(r - avgReward, 2), 0) / rewards.length
        )
      : 0;
    
    const sharpeRatio = rewardStd > 0 ? avgReward / rewardStd : 0;

    return {
      totalTrades: completedTrades.length,
      correctTrades,
      accuracy: completedTrades.length > 0 ? correctTrades / completedTrades.length : 0,
      totalReward: this.learningState.totalReward,
      averageReward: avgReward,
      sharpeRatio,
    };
  }

  /**
   * Reset learning state
   */
  reset(): void {
    this.history = [];
    this.learningState = {
      weights: {
        sentiment: 0.30,
        momentum: 0.25,
        volume: 0.20,
        rsi: 0.15,
        macd: 0.10,
      },
      bias: 0.0,
      learningRate: this.config.learningRate,
      totalReward: 0,
      totalTrades: 0,
      averageReward: 0,
      lastUpdate: new Date().toISOString(),
    };
  }
}

// Singleton instance
export const rlAgent = new RLAgent();

/**
 * Learn from trade outcome
 */
export function learnFromTrade(outcome: TradeOutcome): LearningUpdate {
  return rlAgent.learnFromTrade(outcome);
}

/**
 * Get RL performance metrics
 */
export function getRLPerformance() {
  return rlAgent.getPerformanceMetrics();
}


