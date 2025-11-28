/**
 * Timestamp Store Types
 * Tekil global timestamp sağlayıcısı için tip tanımları
 */

export type TimestampLabel =
  | 'prices'
  | 'aiPower'
  | 'sentiment'
  | 'usRadar'
  | 'aiLearning';

export interface TimestampStore {
  prices: number | null;
  aiPower: number | null;
  sentiment: number | null;
  usRadar: number | null;
  aiLearning: number | null;
}

export interface TimestampFormatOptions {
  relative?: boolean;
  fallback?: string;
  locale?: string;
}


