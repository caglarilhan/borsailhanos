/**
 * P5.2: Self-Learning Weight Adjustment
 * Meta-Model Engine çıktısı tek yönlü (ensemble weight sabit) → Dinamik ağırlık ayarlama
 * w_sentiment += alpha * (profit_realized - profit_predicted)
 */

export interface ModelWeights {
  sentiment: number; // FinBERT weight (0-1)
  momentum: number; // Momentum weight (0-1)
  volume: number; // Volume weight (0-1)
  rsi: number; // RSI weight (0-1)
  macd: number; // MACD weight (0-1)
  total: number; // Should sum to 1
}

export interface TradeOutcome {
  symbol: string;
  signalId: string;
  predictedProfit: number; // Predicted profit (0-1 scale)
  realizedProfit: number; // Actual profit (0-1 scale)
  timestamp: string;
}

export interface LearningState {
  weights: ModelWeights;
  learningRate: number; // alpha (default 0.05)
  history: TradeOutcome[];
  lastUpdate: string;
}

/**
 * Self-Learning Weight Adjustment System
 */
export class SelfLearningWeights {
  private state: LearningState;
  private learningRate: number = 0.05; // alpha = 0.05

  constructor(initialWeights?: Partial<ModelWeights>) {
    this.state = {
      weights: {
        sentiment: initialWeights?.sentiment ?? 0.30,
        momentum: initialWeights?.momentum ?? 0.25,
        volume: initialWeights?.volume ?? 0.20,
        rsi: initialWeights?.rsi ?? 0.15,
        macd: initialWeights?.macd ?? 0.10,
        total: 1.0,
      },
      learningRate: this.learningRate,
      history: [],
      lastUpdate: new Date().toISOString(),
    };

    // Normalize initial weights
    this.normalizeWeights();
  }

  /**
   * Update weights based on realized profit vs predicted profit
   * w_sentiment += alpha * (profit_realized - profit_predicted)
   */
  updateWeights(outcome: TradeOutcome): ModelWeights {
    const { predictedProfit, realizedProfit } = outcome;
    const error = realizedProfit - predictedProfit; // Prediction error
    
    // Calculate weight adjustments for each component
    const adjustments: Partial<ModelWeights> = {};
    
    // Adjust sentiment weight if sentiment was a major factor
    if (this.state.weights.sentiment > 0.25) {
      adjustments.sentiment = this.state.weights.sentiment + (this.learningRate * error);
    }
    
    // Adjust momentum weight if momentum was a major factor
    if (this.state.weights.momentum > 0.25) {
      adjustments.momentum = this.state.weights.momentum + (this.learningRate * error);
    }
    
    // Adjust volume weight
    adjustments.volume = this.state.weights.volume + (this.learningRate * error * 0.5);
    
    // Adjust RSI weight
    adjustments.rsi = this.state.weights.rsi + (this.learningRate * error * 0.3);
    
    // Adjust MACD weight
    adjustments.macd = this.state.weights.macd + (this.learningRate * error * 0.3);
    
    // Apply adjustments (with constraints)
    Object.entries(adjustments).forEach(([key, value]) => {
      if (key !== 'total') {
        // Clamp weights to [0, 0.5] to prevent dominance
        const clamped = Math.max(0, Math.min(0.5, value));
        (this.state.weights as any)[key] = clamped;
      }
    });
    
    // Normalize weights to sum to 1
    this.normalizeWeights();
    
    // Store outcome in history
    this.state.history.push(outcome);
    if (this.state.history.length > 1000) {
      // Keep only last 1000 trades
      this.state.history.shift();
    }
    
    this.state.lastUpdate = new Date().toISOString();
    
    return { ...this.state.weights };
  }

  /**
   * Normalize weights so they sum to 1
   */
  private normalizeWeights(): void {
    const { sentiment, momentum, volume, rsi, macd } = this.state.weights;
    const sum = sentiment + momentum + volume + rsi + macd;
    
    if (sum > 0) {
      this.state.weights.sentiment = sentiment / sum;
      this.state.weights.momentum = momentum / sum;
      this.state.weights.volume = volume / sum;
      this.state.weights.rsi = rsi / sum;
      this.state.weights.macd = macd / sum;
      this.state.weights.total = 1.0;
    }
  }

  /**
   * Get current weights
   */
  getWeights(): ModelWeights {
    return { ...this.state.weights };
  }

  /**
   * Get learning statistics
   */
  getStatistics(): {
    totalTrades: number;
    averageError: number;
    weightDrift: number;
  } {
    const history = this.state.history;
    if (history.length === 0) {
      return {
        totalTrades: 0,
        averageError: 0,
        weightDrift: 0,
      };
    }

    const errors = history.map(
      (o) => Math.abs(o.realizedProfit - o.predictedProfit)
    );
    const averageError = errors.reduce((a, b) => a + b, 0) / errors.length;
    
    // Calculate weight drift (how much weights have changed from initial)
    const initialWeights = { sentiment: 0.30, momentum: 0.25, volume: 0.20, rsi: 0.15, macd: 0.10 };
    const weightDrift = Math.sqrt(
      Math.pow(this.state.weights.sentiment - initialWeights.sentiment, 2) +
      Math.pow(this.state.weights.momentum - initialWeights.momentum, 2) +
      Math.pow(this.state.weights.volume - initialWeights.volume, 2) +
      Math.pow(this.state.weights.rsi - initialWeights.rsi, 2) +
      Math.pow(this.state.weights.macd - initialWeights.macd, 2)
    );

    return {
      totalTrades: history.length,
      averageError,
      weightDrift,
    };
  }

  /**
   * Reset weights to initial values
   */
  reset(): void {
    this.state.weights = {
      sentiment: 0.30,
      momentum: 0.25,
      volume: 0.20,
      rsi: 0.15,
      macd: 0.10,
      total: 1.0,
    };
    this.state.history = [];
    this.state.lastUpdate = new Date().toISOString();
  }
}

/**
 * Global self-learning weights instance
 */
export const selfLearningWeights = new SelfLearningWeights();

/**
 * Update weights based on trade outcome
 */
export function updateModelWeights(outcome: TradeOutcome): ModelWeights {
  return selfLearningWeights.updateWeights(outcome);
}

/**
 * Get current model weights
 */
export function getModelWeights(): ModelWeights {
  return selfLearningWeights.getWeights();
}


