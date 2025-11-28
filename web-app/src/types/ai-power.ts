'use client';

export interface AiPowerMetric {
  title: string;
  value: string;
  deltaLabel: string;
  deltaValue: string;
  sublabel: string;
  accent: string;
  icon: string;
}

export interface AiPositionCard {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  entry: number;
  target: number;
  stop: number;
  rlLots: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  comment: string;
  attentionFocus: string[];
  regime: 'risk-on' | 'risk-off' | 'neutral';
  sparklineSeries?: number[];
}


