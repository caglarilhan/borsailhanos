export interface PredictionRow {
  symbol: string;
  prediction: number; // -1..+1 expected
  confidence: number; // 0..1 expected
  horizon?: string | any;
  valid_until?: string;
  generated_at?: string;
}

// Keep one row per symbol: prefer higher confidence, then newer generated_at
export function sanitizePredictions(rows: PredictionRow[]): PredictionRow[] {
  const bySymbol = new Map<string, PredictionRow>();
  for (const r of rows) {
    if (!r || !r.symbol) continue;
    // clamp prediction/confidence to safe ranges
    const pred = clamp(r.prediction, -1, 1);
    const conf = clamp(r.confidence, 0, 1);
    const row: PredictionRow = { ...r, prediction: pred, confidence: conf };
    const prev = bySymbol.get(r.symbol);
    if (!prev) { bySymbol.set(r.symbol, row); continue; }
    const prevTs = Date.parse(prev.generated_at || prev.valid_until || '');
    const ts = Date.parse(row.generated_at || row.valid_until || '');
    if (row.confidence > prev.confidence || (row.confidence === prev.confidence && ts > prevTs)) {
      bySymbol.set(r.symbol, row);
    }
  }
  return Array.from(bySymbol.values());
}

export function normalizeSentimentTriple(p: number, n: number, u: number) {
  const P = toUnit(p), N = toUnit(n), U = toUnit(u);
  const s = P + N + U;
  if (s <= 0) return { positive: 0, negative: 0, neutral: 1 };
  return { positive: P / s, negative: N / s, neutral: U / s };
}

export function clampPP(pp: number, limit: number = 10) {
  if (!isFinite(pp)) return 0;
  return Math.max(-limit, Math.min(limit, pp));
}

export function fixSignedZero(x: number) {
  const v = Number(x);
  return Object.is(v, -0) ? 0 : v;
}

function toUnit(x: number) {
  if (!isFinite(x) || x < 0) return 0;
  return x > 1 ? x / 100 : x;
}

function clamp(x: number, lo: number, hi: number) {
  if (!isFinite(x)) return lo;
  return Math.max(lo, Math.min(hi, x));
}


