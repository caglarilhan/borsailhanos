'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSentimentFeed, getSentimentTrend } from '@/services/sentiment';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import SentimentTrend from '@/components/sentiment/SentimentTrend';

const LABEL_COLORS: Record<'Bearish' | 'Neutral' | 'Bullish', 'red' | 'amber' | 'green'> = {
  Bearish: 'red',
  Neutral: 'amber',
  Bullish: 'green',
};

const COLOR_CLASSES: Record<'Bearish' | 'Neutral' | 'Bullish', string> = {
  Bearish: 'border-rose-100 bg-rose-50 text-rose-700',
  Neutral: 'border-amber-100 bg-amber-50 text-amber-700',
  Bullish: 'border-emerald-100 bg-emerald-50 text-emerald-700',
};

export function SentimentPanel() {
  const feedQuery = useQuery({
    queryKey: ['sentiment-feed'],
    queryFn: getSentimentFeed,
    refetchInterval: 15000,
  });

  const trendQuery = useQuery({
    queryKey: ['sentiment-trend'],
    queryFn: getSentimentTrend,
    refetchInterval: 60000,
  });

  const aggregateScore = useMemo(() => {
    const data = feedQuery.data?.data ?? [];
    if (!data.length) return 0;
    const sum = data.reduce((acc, item) => acc + item.score, 0);
    return Number((sum / data.length).toFixed(2));
  }, [feedQuery.data]);

  return (
    <Card
      title="Sentiment & Haberler"
      subtitle="FinBERT skorları + 7 günlük trend"
      className="col-span-12 xl:col-span-8"
      actions={
        <Badge
          text={`Ortalama ${aggregateScore >= 0 ? '+' : ''}${aggregateScore}`}
          color={aggregateScore >= 0 ? 'green' : 'red'}
          variant="outline"
        />
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Sentiment feed</p>
          {feedQuery.isLoading ? (
            <p className="text-sm text-slate-500">Sentiment verisi yükleniyor...</p>
          ) : (
            <ul className="space-y-3">
              {feedQuery.data?.data.map((item) => (
                <li
                  key={`${item.source}-${item.publishedAt}`}
                  className={`rounded-2xl border p-4 text-sm ${COLOR_CLASSES[item.label]}`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">{item.source}</span>
                    <span>{new Date(item.publishedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="mt-2 font-semibold text-slate-900">{item.headline}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <Badge text={item.label} color={LABEL_COLORS[item.label]} />
                    <span className="font-mono text-sm">
                      {item.score >= 0 ? '+' : ''}
                      {item.score.toFixed(2)}
                    </span>
                  </div>
                </li>
              )) || <p className="text-xs text-slate-400">Gösterilecek haber yok</p>}
            </ul>
          )}
        </div>
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Son 7 gün trend</p>
          {trendQuery.isLoading ? (
            <p className="text-sm text-slate-500">Trend verisi yükleniyor...</p>
          ) : trendQuery.data?.data ? (
            <SentimentTrend data={trendQuery.data.data} />
          ) : (
            <p className="text-xs text-slate-400">Veri mevcut değil</p>
          )}
          <div className="rounded-2xl border border-slate-100 p-4 text-xs text-slate-600">
            <p className="font-semibold text-slate-900">Yorum</p>
            <p className="mt-1">
              Piyasada {aggregateScore >= 0 ? 'pozitif' : 'negatif'} bir eğilim var. Sentiment normalleştirme için
              haber filtreleri otomatik güncellendi.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default SentimentPanel;

