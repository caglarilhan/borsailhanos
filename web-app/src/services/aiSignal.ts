export const MODEL_VERSION = '4.6.1';

export type RiskLevel = 'Low' | 'Medium' | 'High';

export type SignalRecord = {
  id: string;
  symbol: string;
  confidence: number;
  riskLevel: RiskLevel;
  timeframe: '15m' | '1h' | '4h' | '1d';
  modelReasoning: string;
  currentPrice: number;
  expectedPrice: number;
  sigmaBand: { lower: number; upper: number };
  predictionInterval: { p5: number; p95: number };
  mock?: boolean;
};

export type SignalResponse = {
  modelVersion: string;
  updatedAt: string;
  data: SignalRecord[];
};

export async function getSignals(): Promise<SignalResponse> {
  const now = new Date().toISOString();
  return {
    modelVersion: MODEL_VERSION,
    updatedAt: now,
    data: [
      {
        id: 'sig-thyao',
        symbol: 'THYAO',
        confidence: 0.87,
        riskLevel: 'Medium',
        timeframe: '1h',
        modelReasoning:
          'EMA20/50 kesişimi ile yükseliş momentumuna işaret eden RSI toparlanması',
        currentPrice: 245.5,
        expectedPrice: 260.0,
        sigmaBand: { lower: 238.0, upper: 252.0 },
        predictionInterval: { p5: 232.3, p95: 272.4 },
        mock: true,
      },
      {
        id: 'sig-asels',
        symbol: 'ASELS',
        confidence: 0.74,
        riskLevel: 'Low',
        timeframe: '4h',
        modelReasoning:
          'RSI nötr bölgede kalırken MACD sıfır çizgisi üzerinde pozitif sapma yakaladı',
        currentPrice: 48.2,
        expectedPrice: 52.4,
        sigmaBand: { lower: 46.9, upper: 49.6 },
        predictionInterval: { p5: 44.2, p95: 54.8 },
        mock: true,
      },
    ],
  };
}

export async function getSignalById(id: string): Promise<SignalRecord | undefined> {
  const { data } = await getSignals();
  return data.find((signal) => signal.id === id);
}

