export const fmtTRY = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 });
export const fmtNum = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 });
export const fmtPct1 = new Intl.NumberFormat('tr-TR', { style: 'percent', maximumFractionDigits: 1 });

export function clampPercent(x: number): number {
  if (!isFinite(x)) return 0;
  return Math.max(0, Math.min(100, x));
}

export function clampPP(pp: number): number {
  if (!isFinite(pp)) return 0;
  const v = Math.max(-10, Math.min(10, pp));
  return v;
}


