/** Minimal i18n helper (tr-TR) */
const tr: Record<string, string> = {
  'ai.dailySummary': 'AI Günlük Özeti+',
  'risk.score': 'Risk Skoru',
  'risk.low': 'Düşük',
  'risk.medium': 'Orta',
  'risk.high': 'Yüksek',
  'updated.at': 'Güncellendi',
  'confidence': 'Güven',
  'buy': 'AL',
  'sell': 'SAT',
  'hold': 'TUT',
};
export function t(key: string, fallback?: string): string { return tr[key] ?? fallback ?? key; }


