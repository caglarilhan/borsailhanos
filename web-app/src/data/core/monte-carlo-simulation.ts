/**
 * P5.2: Monte Carlo Simulation
 * 100x simülasyon ekle (olasılık dağılımı)
 */

export interface MonteCarloResult {
  simulations: number[];
  mean: number;
  std: number;
  percentile5: number; // 5th percentile
  percentile25: number; // 25th percentile (Q1)
  percentile50: number; // 50th percentile (median)
  percentile75: number; // 75th percentile (Q3)
  percentile95: number; // 95th percentile
  min: number;
  max: number;
  probabilityPositive: number; // Probability of positive return
  expectedValue: number;
  confidenceInterval: {
    lower: number; // 95% CI lower
    upper: number; // 95% CI upper
  };
}

/**
 * Monte Carlo Simulator
 */
export class MonteCarloSimulator {
  /**
   * Run Monte Carlo simulation
   */
  simulate(
    baseReturn: number,
    volatility: number,
    periods: number = 1,
    simulations: number = 100
  ): MonteCarloResult {
    const results: number[] = [];

    // Run simulations
    for (let i = 0; i < simulations; i++) {
      let cumulativeReturn = 0;
      
      // Simulate each period
      for (let period = 0; period < periods; period++) {
        // Random shock from normal distribution
        const randomShock = this.generateNormalRandom() * volatility;
        cumulativeReturn += baseReturn + randomShock;
      }
      
      results.push(cumulativeReturn);
    }

    // Calculate statistics
    const mean = results.reduce((a, b) => a + b, 0) / results.length;
    const variance = results.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / results.length;
    const std = Math.sqrt(variance);

    // Sort for percentiles
    const sorted = [...results].sort((a, b) => a - b);

    const percentile5 = sorted[Math.floor(sorted.length * 0.05)];
    const percentile25 = sorted[Math.floor(sorted.length * 0.25)];
    const percentile50 = sorted[Math.floor(sorted.length * 0.50)];
    const percentile75 = sorted[Math.floor(sorted.length * 0.75)];
    const percentile95 = sorted[Math.floor(sorted.length * 0.95)];

    const min = Math.min(...results);
    const max = Math.max(...results);

    // Probability of positive return
    const positiveCount = results.filter((r) => r > 0).length;
    const probabilityPositive = positiveCount / results.length;

    // Expected value (mean)
    const expectedValue = mean;

    // 95% Confidence Interval
    const zScore = 1.96; // 95% CI
    const margin = zScore * std;
    const confidenceInterval = {
      lower: mean - margin,
      upper: mean + margin,
    };

    return {
      simulations: results,
      mean,
      std,
      percentile5,
      percentile25,
      percentile50,
      percentile75,
      percentile95,
      min,
      max,
      probabilityPositive,
      expectedValue,
      confidenceInterval,
    };
  }

  /**
   * Generate random number from standard normal distribution (Box-Muller)
   */
  private generateNormalRandom(): number {
    // Box-Muller transformation
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z;
  }
}

// Singleton instance
export const monteCarloSimulator = new MonteCarloSimulator();

/**
 * Run Monte Carlo simulation
 */
export function runMonteCarlo(
  baseReturn: number,
  volatility: number,
  periods: number = 1,
  simulations: number = 100
): MonteCarloResult {
  return monteCarloSimulator.simulate(baseReturn, volatility, periods, simulations);
}


