/**
 * P5.2: Risk Normalization (0-5 scale)
 * Risk skoru 0-5 ölçeğinde normalize edilir, 2 ondalığa sabitlenir
 * 0-2.5 = Düşük (Low), 2.5-4 = Orta (Medium), 4+ = Yüksek (High)
 */

export function normalizeRisk(riskOld: number): number {
  // P5.2: Risk score normalization (0-5 scale) - 2 decimal places
  // Clamp to 0-5 range
  const clamped = Math.max(0, Math.min(5, riskOld));
  return Math.round(clamped * 100) / 100; // Round to 2 decimals
}

export function getRiskLevel(normalized: number): 'Düşük' | 'Orta' | 'Yüksek' {
  // P5.2: Risk seviye haritası - 0-2.5 düşük / 2.5-4 orta / >4 yüksek
  if (normalized <= 2.5) return 'Düşük';
  if (normalized <= 4) return 'Orta';
  return 'Yüksek';
}

export function getRiskColor(normalized: number): string {
  // P5.2: Risk seviye haritası - 0-2.5 düşük / 2.5-4 orta / >4 yüksek
  if (normalized <= 2.5) return 'text-green-600';
  if (normalized <= 4) return 'text-yellow-600';
  return 'text-red-600';
}

export function getRiskBgColor(normalized: number): string {
  // P5.2: Risk seviye haritası - 0-2.5 düşük / 2.5-4 orta / >4 yüksek
  if (normalized <= 2.5) return 'bg-green-500/20 border-green-400/30';
  if (normalized <= 4) return 'bg-amber-500/20 border-amber-400/30';
  return 'bg-red-500/20 border-red-400/30';
}

