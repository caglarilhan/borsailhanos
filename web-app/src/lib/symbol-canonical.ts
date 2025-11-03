/**
 * Canonical symbol mapping (e.g., MIGRS -> MGROS)
 */

const CANONICAL_MAP: Record<string, string> = {
  MIGRS: 'MGROS',
  MIGRO: 'MGROS',
};

export function toCanonicalSymbol(sym: string): string {
  const up = (sym || '').toUpperCase();
  return CANONICAL_MAP[up] || up;
}


