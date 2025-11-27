import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

interface PowerMetricPayload {
  title: string;
  value: string;
  deltaLabel: string;
  deltaValue: string;
  sublabel: string;
  accent: string;
  icon: string;
}

interface PositionPayload {
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
}

const rootDir = process.cwd();
const stackTunerPath = path.join(rootDir, 'stack_tuner_results.json');
const rlSummaryPath = path.join(rootDir, 'logs/rl_session_summary.json');

const DEFAULT_METRICS: PowerMetricPayload[] = [
  {
    title: 'Meta Ensemble Gücü',
    value: '%90.0',
    deltaLabel: '30g doğruluk',
    deltaValue: '+0.0pp',
    sublabel: 'LightGBM + LSTM + Transformer',
    accent: '#3b82f6',
    icon: '🧠',
  },
  {
    title: 'Regime Awareness',
    value: 'Risk-On',
    deltaLabel: 'Regime güveni',
    deltaValue: '0.70',
    sublabel: 'HMM + makro faktörler',
    accent: '#10b981',
    icon: '🌍',
  },
  {
    title: 'RL Positioning',
    value: '%35',
    deltaLabel: 'Pozisyon önerisi',
    deltaValue: 'Mid-Conviction',
    sublabel: 'DDPG lot optimizasyonu',
    accent: '#f59e0b',
    icon: '🎯',
  },
  {
    title: 'Sentiment Pulse',
    value: '+0.25',
    deltaLabel: 'FinBERT skoru',
    deltaValue: 'Pozitif',
    sublabel: 'News + Twitter + KAP',
    accent: '#ef4444',
    icon: '💬',
  },
];

const DEFAULT_POSITIONS: PositionPayload[] = [
  {
    symbol: 'THYAO',
    action: 'BUY',
    confidence: 0.9,
    entry: 250,
    target: 268,
    stop: 238,
    rlLots: 400,
    sentiment: 'positive',
    sentimentScore: 0.35,
    comment: 'Momentum + sentiment uyumlu, RL ajanı %3.4 risk öneriyor.',
    attentionFocus: ['1h Momentum', 'Sentiment Bias', 'VaR 95%'],
    regime: 'risk-on',
  },
];

async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data) as T;
  } catch (error) {
    return null;
  }
}

interface StackTunerRaw {
  best_score?: number;
  best_params?: Record<string, unknown>;
}

function buildMetrics(raw: StackTunerRaw | null): PowerMetricPayload[] {
  if (!raw) {
    return DEFAULT_METRICS;
  }
  const bestScore = typeof raw.best_score === 'number' ? raw.best_score * 100 : 0;
  const metaMetric = {
    ...DEFAULT_METRICS[0],
    value: `${bestScore.toFixed(1)}%`,
    deltaValue: `${(bestScore - 85).toFixed(1)}pp`,
    sublabel: raw.best_params ? 'StackTuner Optuna' : DEFAULT_METRICS[0].sublabel,
  };
  return [metaMetric, ...DEFAULT_METRICS.slice(1)];
}

interface RLSummaryEntry {
  action?: string;
  symbol?: string;
  confidence?: number;
  entry?: number;
  take_profit_pct?: number;
  stop_loss_pct?: number;
  rlLots?: number;
  position_value?: number;
  meta?: {
    sentiment?: { score?: number };
    timeframe_highlights?: Array<{ timeframe: string; momentum: number }>;
  };
  rationale?: string[];
}

function buildPositions(raw: RLSummaryEntry[] | null): PositionPayload[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return DEFAULT_POSITIONS;
  }
  return raw.slice(0, 4).map((entry: RLSummaryEntry): PositionPayload => {
    const action = (entry.action || 'HOLD').toUpperCase() as PositionPayload['action'];
    const sentimentScore = entry?.meta?.sentiment?.score ?? 0;
    const sentimentLabel: PositionPayload['sentiment'] =
      sentimentScore > 0.05 ? 'positive' : sentimentScore < -0.05 ? 'negative' : 'neutral';
    const basePrice = entry.entry ?? 250 + Math.random() * 30;
    const tpPct = entry.take_profit_pct ?? 1.5;
    const stopPct = entry.stop_loss_pct ?? -0.8;
    const target = basePrice * (1 + tpPct / 100);
    const stop = basePrice * (1 + stopPct / 100);
      const focus = entry.meta?.timeframe_highlights
      ?.slice(0, 3)
      .map((h) => `${h.timeframe} ${h.momentum >= 0 ? '↑' : '↓'} ${Math.abs(h.momentum).toFixed(2)}`) ?? ['Momentum Mix'];
    return {
      symbol: (entry.symbol || 'SYMBOL').replace('.IS', ''),
      action,
      confidence: entry.confidence ?? 0.75,
      entry: Number(basePrice.toFixed(1)),
      target: Number(target.toFixed(1)),
      stop: Number(stop.toFixed(1)),
      rlLots: Math.round(entry.rlLots ?? entry.position_value / 10 ?? 200),
      sentiment: sentimentLabel,
      sentimentScore,
      comment:
        entry.rationale?.slice(0, 2).join(' • ') ||
        'Meta-model ve RL ajanı bu pozisyonu nötr değerlendiriyor.',
      attentionFocus: focus,
      regime: sentimentScore > 0.1 ? 'risk-on' : sentimentScore < -0.1 ? 'risk-off' : 'neutral',
    };
  });
}

export async function GET() {
  const stackMetrics = await readJson<StackTunerRaw | null>(stackTunerPath);
  const rlSummary = await readJson<RLSummaryEntry[] | null>(rlSummaryPath);

  const data = {
    updatedAt: Date.now(),
    metrics: buildMetrics(stackMetrics),
    positions: buildPositions(rlSummary),
  };

  return NextResponse.json(data);
}

