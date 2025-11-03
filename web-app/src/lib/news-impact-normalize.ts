/**
 * News Impact Normalize
 * Sprint 6: AI Yorum & Haber - Impact normalizasyonu
 * FinBERT confidence + haber başlık sentiment korelasyonu ile impact hesaplama
 */

import { scoreNewsImpact, type NewsImpactOutput } from './news-impact-scorer';
import type { NewsArticle } from './news-impact-scorer';

export interface NewsItem {
  title?: string;
  symbol?: string;
  sentiment?: string;
  published_at?: string;
  url?: string;
}

/**
 * Normalize news impact score (0-100)
 * Uses FinBERT confidence + headline sentiment correlation
 */
export function normalizeNewsImpact(newsItem: NewsItem): number {
  // Convert sentiment string to sentiment object (normalized to 100%)
  // Sprint 8: Sentiment normalizasyonu düzeltmesi - %100 toplam garantisi
  const sentimentMap = newsItem.sentiment === 'Pozitif' 
    ? { positive: 0.7, negative: 0.1, neutral: 0.2 } // Total: 1.0
    : newsItem.sentiment === 'Negatif'
    ? { positive: 0.1, negative: 0.7, neutral: 0.2 } // Total: 1.0
    : { positive: 0.33, negative: 0.33, neutral: 0.34 }; // Total: 1.0
  
  // Normalize to ensure sum = 1.0
  const total = sentimentMap.positive + sentimentMap.negative + sentimentMap.neutral;
  if (Math.abs(total - 1.0) > 0.01) {
    sentimentMap.positive /= total;
    sentimentMap.negative /= total;
    sentimentMap.neutral /= total;
  }

  const article: NewsArticle = {
    title: newsItem.title || '',
    source: 'news',
    timestamp: newsItem.published_at || new Date().toISOString(),
    sentiment: sentimentMap,
  };

  const impact = scoreNewsImpact({
    symbol: newsItem.symbol || 'THYAO',
    article,
    currentPrice: 100, // Mock - will be replaced with real price
    recentVolume: 1000000, // Mock - will be replaced with real volume
    averageVolume: 1000000, // Mock - will be replaced with real volume
  });

  return Math.max(0, Math.min(100, impact.impactScore));
}

/**
 * Get impact level label (Low, Medium, High)
 */
export function getImpactLevel(impactScore: number): 'Düşük' | 'Orta' | 'Yüksek' {
  if (impactScore >= 60) return 'Yüksek';
  if (impactScore >= 40) return 'Orta';
  return 'Düşük';
}

/**
 * Get impact color for UI
 */
export function getImpactLevelColor(impactScore: number): string {
  if (impactScore >= 60) return 'bg-red-50 text-red-700 border-red-200';
  if (impactScore >= 40) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  return 'bg-green-50 text-green-700 border-green-200';
}

