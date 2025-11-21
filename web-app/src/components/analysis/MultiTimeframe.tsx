'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMarketSnapshot } from '@/services/marketData';
import { Card } from '@/components/shared/Card';
import Heatmap from '@/components/analysis/Heatmap';
import useViewport from '@/hooks/useViewport';

const TIMEFRAMES = ['15m', '1h', '4h', '1d'] as const;

export function MultiTimeframe() {
  const { isMobile } = useViewport();
  const [timeframe, setTimeframe] = useState<(typeof TIMEFRAMES)[number]>('15m');
  const { data, isLoading } = useQuery({
    queryKey: ['market-snapshot'],
    queryFn: getMarketSnapshot,
    refetchInterval: 15000,
  });

  const timeframeHeatmap = useMemo(() => {
    const symbols = data?.data.heatmap ?? [];
    const multiplier =
      timeframe === '15m' ? 0.5 : timeframe === '1h' ? 1 : timeframe === '4h' ? 1.5 : 2;
    return symbols.map((entry) => ({
      symbol: entry.symbol,
      change: entry.change * multiplier,
    }));
  }, [data, timeframe]);

  const topSignals = useMemo(() => {
    const sorted = [...timeframeHeatmap].sort((a, b) => b.change - a.change);
    return sorted.slice(0, 4);
  }, [timeframeHeatmap]);

  return (
    <Card
      title="Çoklu Zaman Analizi"
      subtitle="Heatmap + top sinyal listesi"
      className="col-span-12 xl:col-span-8"
    >
      <div className="sticky top-16 z-10 flex overflow-x-auto rounded-full border border-slate-200 bg-slate-50 p-1 text-xs font-semibold text-slate-600">
        {TIMEFRAMES.map((frame) => (
          <button
            key={frame}
            type="button"
            onClick={() => setTimeframe(frame)}
            className={`flex-1 rounded-full px-3 py-2 ${
              timeframe === frame ? 'bg-white text-slate-900 shadow-sm' : ''
            }`}
          >
            {frame.toUpperCase()}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="mt-4 text-sm text-slate-500">Heatmap yükleniyor...</p>
      ) : (
        <div className="mt-4 space-y-4">
          <Heatmap symbols={timeframeHeatmap} compact={isMobile} />
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Top sinyaller</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {topSignals.map((item) => (
                <li key={item.symbol} className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{item.symbol}</span>
                  <span className={item.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                    {item.change >= 0 ? '+' : ''}
                    {item.change.toFixed(2)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}

export default MultiTimeframe;

