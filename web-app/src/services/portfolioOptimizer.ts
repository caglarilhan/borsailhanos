export const MODEL_VERSION = '4.6.1';

export type OptimizerInput = {
  symbol: string;
  expectedReturn: number;
  volatility: number;
  correlation?: Record<string, number>;
};

export type OptimizerResult = {
  modelVersion: string;
  updatedAt: string;
  data: {
    weights: Array<{ symbol: string; weight: number }>;
    expectedReturn: number;
    risk: number;
    volatility: number;
  };
};

const normalizeWeights = (
  entries: Array<{ symbol: string; weight: number }>
): Array<{ symbol: string; weight: number }> => {
  const total = entries.reduce((sum, item) => sum + item.weight, 0) || 1;
  return entries.map((item) => ({
    symbol: item.symbol,
    weight: Number((item.weight / total).toFixed(3)),
  }));
};

export async function runMarkowitz(
  assets: OptimizerInput[],
  targetRisk = 0.12
): Promise<OptimizerResult> {
  const weights = normalizeWeights(
    assets.map((asset) => ({
      symbol: asset.symbol,
      weight: Math.max(0.01, targetRisk / Math.max(asset.volatility, 0.01)),
    }))
  );

  return {
    modelVersion: MODEL_VERSION,
    updatedAt: new Date().toISOString(),
    data: {
      weights,
      expectedReturn: 0.14,
      risk: targetRisk,
      volatility: targetRisk,
    },
  };
}

export async function runHRP(assets: OptimizerInput[]): Promise<OptimizerResult> {
  const weights = normalizeWeights(
    assets.map((asset, idx) => ({
      symbol: asset.symbol,
      weight: 1 / ((idx + 1) * Math.max(asset.volatility, 0.01)),
    }))
  );

  return {
    modelVersion: MODEL_VERSION,
    updatedAt: new Date().toISOString(),
    data: {
      weights,
      expectedReturn: 0.12,
      risk: 0.1,
      volatility: 0.1,
    },
  };
}

