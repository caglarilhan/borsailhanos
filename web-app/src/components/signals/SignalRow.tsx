import { SignalRecord } from '@/services/aiSignal';
import { Badge } from '@/components/shared/Badge';
import clsx from 'clsx';

type SignalRowProps = {
  signal: SignalRecord;
};

const RISK_COLOR: Record<SignalRecord['riskLevel'], 'green' | 'amber' | 'red'> = {
  Low: 'green',
  Medium: 'amber',
  High: 'red',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(value);
}

export function SignalRow({ signal }: SignalRowProps) {
  const shapBreakdown = [
    { label: 'Teknik', value: 42 },
    { label: 'Fundamental', value: 28 },
    { label: 'Sentiment', value: 18 },
    { label: 'Makro', value: 12 },
  ];

  return (
    <tr className="border-b border-slate-100 text-sm last:border-0">
      <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">
        <div className="flex items-center gap-2">
          {signal.symbol}
          {signal.mock && (
            <Badge text="MOCK" variant="outline" color="amber" />
          )}
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {signal.timeframe}
          </span>
        </div>
        <p className="text-xs text-slate-500">Model {signal.mock ? 'Demo' : 'Production'}</p>
      </td>

      <td className="w-64 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
              <span>Confidence</span>
              <span>{Math.round(signal.confidence * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${signal.confidence * 100}%` }}
              />
            </div>
          </div>
          <Badge
            text={signal.riskLevel}
            variant="solid"
            color={RISK_COLOR[signal.riskLevel]}
          />
        </div>
      </td>

      <td className="max-w-xs px-4 py-3">
        <p className="text-sm text-slate-700 line-clamp-2">{signal.modelReasoning}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
          {shapBreakdown.map((item) => (
            <span key={item.label} className="flex items-center gap-1">
              <span
                className={clsx(
                  'inline-block h-2 w-2 rounded-full',
                  item.label === 'Teknik'
                    ? 'bg-blue-500'
                    : item.label === 'Fundamental'
                      ? 'bg-emerald-500'
                      : item.label === 'Sentiment'
                        ? 'bg-amber-500'
                        : 'bg-violet-500'
                )}
              />
              {item.label} {item.value}%
            </span>
          ))}
        </div>
      </td>

      <td className="px-4 py-3 text-right">
        <p className="font-semibold text-slate-900">{formatCurrency(signal.currentPrice)}</p>
        <p className="text-xs text-slate-500">Beklenen: {formatCurrency(signal.expectedPrice)}</p>
      </td>

      <td className="px-4 py-3 text-right text-xs text-slate-600">
        <p>±1σ: {formatCurrency(signal.sigmaBand.lower)} – {formatCurrency(signal.sigmaBand.upper)}</p>
        <p>PI (P5–P95): {formatCurrency(signal.predictionInterval.p5)} – {formatCurrency(signal.predictionInterval.p95)}</p>
      </td>
    </tr>
  );
}

export default SignalRow;

