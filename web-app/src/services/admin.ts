const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export type SystemMetrics = {
  latency: number;
  apiSuccess: number;
  modelVersion: string;
  memoryUsage: string;
  staleQueries: number;
};

export type UserStats = {
  totalUsers: number;
  dailyActive: number;
  topSymbols: { symbol: string; watchers: number }[];
};

export type ModelLog = {
  id: string;
  timestamp: string;
  inputLength: number;
  reasoningCost: number;
  outputSize: number;
};

export type FeatureFlags = {
  newDashboard: boolean;
  fastSignalMode: boolean;
  sentimentV2: boolean;
};

export async function getSystemMetrics(): Promise<SystemMetrics> {
  await delay();
  return {
    latency: 245,
    apiSuccess: 98.4,
    modelVersion: '4.6.1',
    memoryUsage: '5.3 GB / 8 GB',
    staleQueries: 12,
  };
}

export async function getUserStats(): Promise<UserStats> {
  await delay();
  return {
    totalUsers: 1234,
    dailyActive: 456,
    topSymbols: [
      { symbol: 'THYAO', watchers: 320 },
      { symbol: 'ASELS', watchers: 280 },
      { symbol: 'TUPRS', watchers: 210 },
    ],
  };
}

export async function getModelLogs(): Promise<ModelLog[]> {
  await delay();
  return Array.from({ length: 5 }).map((_, idx) => ({
    id: crypto.randomUUID(),
    timestamp: new Date(Date.now() - idx * 60000).toISOString(),
    inputLength: 150 + idx * 10,
    reasoningCost: Number((0.12 + idx * 0.01).toFixed(2)),
    outputSize: 64 + idx * 8,
  }));
}

export async function getFeatureFlags(): Promise<FeatureFlags> {
  await delay();
  return {
    newDashboard: true,
    fastSignalMode: false,
    sentimentV2: true,
  };
}

