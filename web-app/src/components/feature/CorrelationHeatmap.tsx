'use client';

import { useQuery } from '@tanstack/react-query';
import { getMarketSnapshot } from '@/services/marketData';
import { Card } from '@/components/shared/Card';

function heatColor(value: number) {
  if (value >= 0.5) return 'bg-emerald-500/30 text-emerald-900';
  if (value >= 0.1) return 'bg-emerald-300/30 text-emerald-800';
  if (value <= -0.5) return 'bg-rose-500/30 text-rose-900';
  if (value <= -0.1) return 'bg-rose-300/30 text-rose-900';
  return 'bg-slate-200/60 text-slate-700';
}

export function CorrelationHeatmap() {
  const { data, isLoading } = useQuery({
    queryKey: ['feature-correlation'],
    queryFn: getMarketSnapshot,
    refetchInterval: 15000,
  });

  const symbols = data?.data.heatmap ?? [];

  return (
    <Card
      className="col-span-12"
      title="Korelasyon Heatmap"
      subtitle="Sektör performans dağılımı"
    >
      {isLoading ? (
        <p className="text-sm text-slate-500">Heatmap yükleniyor...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {symbols.map((item) => (
            <div
              key={item.symbol}
              className={`rounded-2xl border border-slate-100 p-4 text-center text-sm font-semibold ${heatColor(
                item.change / 10
              )}`}
            >
              <p>{item.symbol}</p>
              <p className="text-xs font-medium">
                {item.change >= 0 ? '+' : ''}
                {item.change.toFixed(2)}%
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default CorrelationHeatmap;

