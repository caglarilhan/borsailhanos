export type SentimentLabel = 'positive' | 'neutral' | 'negative';

export interface SentimentRow {
  symbol: string;
  headline: string;
  sentiment: SentimentLabel;
  score: number;
  confidence: number;
  summary: string;
  topics: string[];
  model: string;
  sourceUrl?: string;
}

export interface SentimentPayload {
  generatedAt: string;
  source: string;
  items: SentimentRow[];
  aggregate?: {
    bullish: number;
    bearish: number;
    neutral: number;
    topSectors: { name: string; weight: number }[];
  };
}


