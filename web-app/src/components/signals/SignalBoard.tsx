import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSignals } from '@/services/aiSignal';
import { Card } from '@/components/shared/Card';
import { MetricGrid } from '@/components/shared/MetricGrid';
import { SignalRow } from '@/components/signals/SignalRow';
import { Badge } from '@/components/shared/Badge';
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export function SignalBoard() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['signals'],
    queryFn: getSignals,
    refetchInterval: 15000,
  });

  const metrics = useMemo(() => {
    if (!data?.data?.length) {
      return [
        { label: 'Sinyal Adedi', value: '—' },
        { label: 'Ortalama Güven', value: '—' },
        { label: 'Latency', value: '—' },
      ];
    }

    const totalConfidence = data.data.reduce((sum, s) => sum + s.confidence, 0);
    const avgConfidence = Math.round((totalConfidence / data.data.length) * 100);
    return [
      {
        label: 'Aktif Sinyal',
        value: data.data.length,
        helper: 'AI Ensemble',
      },
      {
        label: 'Ortalama Güven',
        value: `${avgConfidence}%`,
        helper: 'Toplam sinyal bazında',
      },
      {
        label: 'Latency',
        value: '210 ms',
        helper: 'Finnhub WS',
      },
    ];
  }, [data]);

  return (
    <Card
      title="AI Sinyalleri"
      subtitle="Explainability + Risk katmanı"
      actions={
        <div className="flex items-center gap-3">
          {data?.modelVersion && (
            <Badge
              text={`Model ${data.modelVersion}`}
              variant="outline"
              color="blue"
            />
          )}
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
          >
            <ArrowPathIcon className="h-4 w-4" />
            {isFetching ? 'Yükleniyor...' : 'Veriyi Yenile'}
          </button>
        </div>
      }
      className="col-span-12 xl:col-span-16"
    >
      <MetricGrid items={metrics} columns={3} />

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-[640px] table-auto">
          <thead className="sticky top-0 bg-white text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Sembol</th>
              <th className="px-4 py-3">Confidence & Risk</th>
              <th className="px-4 py-3">Model Reasoning</th>
              <th className="px-4 py-3 text-right">Fiyat</th>
              <th className="px-4 py-3 text-right">±1σ & PI</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">
                  Sinyaller yükleniyor...
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-rose-600">
                  <div className="flex items-center justify-center gap-2">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    Veri alınamadı. Tekrar deneyin.
                  </div>
                </td>
              </tr>
            )}
            {data?.data?.map((signal) => (
              <SignalRow key={signal.id} signal={signal} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default SignalBoard;

