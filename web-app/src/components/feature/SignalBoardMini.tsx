'use client';

import { useQuery } from '@tanstack/react-query';
import { getSignals } from '@/services/aiSignal';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';

export function SignalBoardMini() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['feature-signals'],
    queryFn: getSignals,
    refetchInterval: 15000,
  });

  const rows = data?.data.slice(0, 10) ?? [];

  return (
    <Card
      className="col-span-12"
      title="Mini Sinyal Listesi"
      subtitle="Son 10 AI sinyali"
      actions={
        data?.modelVersion && (
          <Badge text={`Model ${data.modelVersion}`} variant="outline" color="blue" />
        )
      }
    >
      <div className="overflow-x-auto">
        <table className="min-w-[560px] text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Sembol</th>
              <th className="px-3 py-2">Confidence</th>
              <th className="px-3 py-2">Risk</th>
              <th className="px-3 py-2 text-right">Fiyat</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-slate-500">
                  Sinyaller yükleniyor...
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-rose-600">
                  Veri alınamadı
                </td>
              </tr>
            )}
            {rows.map((signal) => (
              <tr key={signal.id} className="border-t border-slate-100">
                <td className="px-3 py-3 font-semibold text-slate-900">{signal.symbol}</td>
                <td className="px-3 py-3">{Math.round(signal.confidence * 100)}%</td>
                <td className="px-3 py-3">
                  <Badge text={signal.riskLevel} color="amber" />
                </td>
                <td className="px-3 py-3 text-right font-semibold text-slate-900">
                  ₺{signal.currentPrice.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default SignalBoardMini;

