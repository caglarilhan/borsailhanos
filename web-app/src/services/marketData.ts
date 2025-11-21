export const MODEL_VERSION = '4.6.1';

export type MarketSnapshot = {
  index: string;
  changePercent: number;
  advanceDecline: { advancers: number; decliners: number };
  heatmap: Array<{ symbol: string; change: number }>;
};

export type ChartPoint = {
  timestamp: number;
  price: number;
  volume: number;
  indicators: {
    ema20: number;
    ema50: number;
    rsi: number;
    macd: number;
    macdSignal: number;
    macdHistogram: number;
  };
};

export type MarketSnapshotResponse = {
  modelVersion: string;
  updatedAt: string;
  data: MarketSnapshot;
};

export type ChartDataResponse = {
  modelVersion: string;
  updatedAt: string;
  data: ChartPoint[];
};

export async function getMarketSnapshot(): Promise<MarketSnapshotResponse> {
  return {
    modelVersion: MODEL_VERSION,
    updatedAt: new Date().toISOString(),
    data: {
      index: 'BIST100',
      changePercent: 1.24,
      advanceDecline: { advancers: 67, decliners: 32 },
      heatmap: [
        { symbol: 'THYAO', change: 2.3 },
        { symbol: 'TUPRS', change: -1.2 },
        { symbol: 'ASELS', change: 0.8 },
        { symbol: 'SISE', change: 1.1 },
      ],
    },
  };
}

export async function getChartData(symbol: string): Promise<ChartDataResponse> {
  const now = Date.now();
  const mockSeries: ChartPoint[] = Array.from({ length: 120 }).map((_, idx) => {
    const timestamp = now - (120 - idx) * 60 * 1000;
    const basePrice = 240 + Math.sin(idx / 10) * 5;
    return {
      timestamp,
      price: basePrice,
      volume: 1_000_000 + Math.cos(idx / 5) * 100_000,
      indicators: {
        ema20: basePrice - 1.2,
        ema50: basePrice - 2.4,
        rsi: 55 + Math.sin(idx / 8) * 10,
        macd: Math.sin(idx / 15) * 1.5,
        macdSignal: Math.sin(idx / 15) * 1.2,
        macdHistogram: Math.sin(idx / 15) * 0.3,
      },
    };
  });

  return {
    modelVersion: MODEL_VERSION,
    updatedAt: new Date().toISOString(),
    data: mockSeries,
  };
}

