/**
 * Sprint 2: Risk Normalization
 * Convert risk score from 0-5 scale to 1-10 scale
 * 0-2 = Düşük (Low), 3-6 = Orta (Medium), 7+ = Yüksek (High)
 */

export function normalizeRisk(riskOld: number): number {
  // Convert 0-5 scale to 1-10 scale
  // Formula: (riskOld / 5) * 10, clamped to 1-10
  const normalized = Math.max(1, Math.min(10, (riskOld / 5) * 10));
  return Math.round(normalized * 10) / 10; // Round to 1 decimal
}

export function getRiskLevel(normalized: number): 'Düşük' | 'Orta' | 'Yüksek' {
  if (normalized <= 2) return 'Düşük';
  if (normalized <= 6) return 'Orta';
  return 'Yüksek';
}

export function getRiskColor(normalized: number): string {
  if (normalized <= 2) return 'text-green-600';
  if (normalized <= 6) return 'text-yellow-600';
  return 'text-red-600';
}

export function getRiskBgColor(normalized: number): string {
  if (normalized <= 2) return 'bg-green-500/20 border-green-400/30';
  if (normalized <= 6) return 'bg-amber-500/20 border-amber-400/30';
  return 'bg-red-500/20 border-red-400/30';
}

