export function computeMaxDrawdown(equity: number[]): number {
  if (!equity || equity.length === 0) return 0;
  let peak = equity[0];
  let maxDd = 0;
  for (let i = 1; i < equity.length; i++) {
    peak = Math.max(peak, equity[i]);
    const dd = (equity[i] - peak) / peak; // negative
    maxDd = Math.min(maxDd, dd);
  }
  return Math.abs(maxDd); // as positive ratio
}

export function computeSortino(returns: number[], rf: number = 0): number {
  if (!returns || returns.length === 0) return 0;
  const excess = returns.map(r => r - rf);
  const mean = excess.reduce((a, b) => a + b, 0) / excess.length;
  const downside = excess.filter(r => r < 0);
  const downsideVar = downside.length > 0 ? downside.reduce((a, r) => a + r * r, 0) / downside.length : 0;
  const downsideDev = Math.sqrt(downsideVar);
  if (downsideDev === 0) return mean > 0 ? Infinity : 0;
  return mean / downsideDev;
}

export function computeCalmar(returns: number[], equity: number[]): number {
  const mean = returns && returns.length ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const mdd = computeMaxDrawdown(equity);
  if (mdd === 0) return mean > 0 ? Infinity : 0;
  return mean / mdd;
}



