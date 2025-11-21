export const MODEL_VERSION = '4.6.1';

export type SentimentScore = {
  source: string;
  score: number; // -1 .. 1
  label: 'Bearish' | 'Neutral' | 'Bullish';
  headline: string;
  publishedAt: string;
};

export type SentimentTrendPoint = {
  date: string;
  score: number;
};

export type SentimentResponse<T> = {
  modelVersion: string;
  updatedAt: string;
  data: T;
};

export async function getSentimentFeed(): Promise<SentimentResponse<SentimentScore[]>> {
  return {
    modelVersion: MODEL_VERSION,
    updatedAt: new Date().toISOString(),
    data: [
      {
        source: 'KAP',
        score: 0.62,
        label: 'Bullish',
        headline: 'THYAO yolcu sayısında %12 artış açıkladı',
        publishedAt: new Date().toISOString(),
      },
      {
        source: 'Twitter',
        score: -0.22,
        label: 'Bearish',
        headline: 'TUPRS için kısa vadede satış baskısı iddiaları',
        publishedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
    ],
  };
}

export async function getSentimentTrend(): Promise<
  SentimentResponse<SentimentTrendPoint[]>
> {
  const today = new Date();
  const data: SentimentTrendPoint[] = Array.from({ length: 7 }).map((_, idx) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - idx));
    return {
      date: date.toISOString().slice(0, 10),
      score: Number((Math.sin(idx / 3) * 0.4).toFixed(2)),
    };
  });

  return {
    modelVersion: MODEL_VERSION,
    updatedAt: new Date().toISOString(),
    data,
  };
}

