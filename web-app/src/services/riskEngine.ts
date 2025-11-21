export const MODEL_VERSION = '4.6.1';

export type PortfolioMetrics = {
  beta: number;
  sharpe: number;
  maxDrawdown: number;
  volatilityBand: { lower: number; upper: number };
  stopLoss: number;
  takeProfit: number;
};

export type RiskParityWeights = Array<{ symbol: string; weight: number }>;

export type RiskProfile = 'Conservative' | 'Balanced' | 'Aggressive';

export type RiskEngineResponse<T> = {
  modelVersion: string;
  updatedAt: string;
  data: T;
};

export async function getPortfolioStats(): Promise<RiskEngineResponse<PortfolioMetrics>> {
  return {
    modelVersion: MODEL_VERSION,
    updatedAt: new Date().toISOString(),
    data: {
      beta: 0.92,
      sharpe: 1.65,
      maxDrawdown: -8.4,
      volatilityBand: { lower: -1.8, upper: 2.4 },
      stopLoss: -3.5,
      takeProfit: 5.0,
    },
  };
}

export async function getRiskParityWeights(): Promise<
  RiskEngineResponse<RiskParityWeights>
> {
  return {
    modelVersion: MODEL_VERSION,
    updatedAt: new Date().toISOString(),
    data: [
      { symbol: 'THYAO', weight: 0.32 },
      { symbol: 'TUPRS', weight: 0.24 },
      { symbol: 'ASELS', weight: 0.18 },
      { symbol: 'SISE', weight: 0.15 },
      { symbol: 'EREGL', weight: 0.11 },
    ],
  };
}

export type RiskQuestionAnswer = {
  questionId: string;
  value: number; // 1-5 arası skor
};

export async function evaluateRiskProfile(
  answers: RiskQuestionAnswer[]
): Promise<RiskEngineResponse<{ profile: RiskProfile; score: number }>> {
  const score =
    answers.reduce((acc, curr) => acc + curr.value, 0) / Math.max(answers.length, 1);
  let profile: RiskProfile = 'Balanced';
  if (score <= 2.5) profile = 'Conservative';
  if (score >= 4) profile = 'Aggressive';

  return {
    modelVersion: MODEL_VERSION,
    updatedAt: new Date().toISOString(),
    data: { profile, score: Number(score.toFixed(2)) },
  };
}

