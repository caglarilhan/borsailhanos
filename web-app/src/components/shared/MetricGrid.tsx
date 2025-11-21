import clsx from 'clsx';

type MetricItem = {
  label: string;
  value: string | number;
  helper?: string;
  trend?: number; // positive/negative percentage
};

type MetricGridProps = {
  items: MetricItem[];
  columns?: 2 | 3 | 4;
};

export function MetricGrid({ items, columns = 3 }: MetricGridProps) {
  const colClass =
    columns === 4
      ? 'grid-cols-2 md:grid-cols-4'
      : columns === 2
        ? 'grid-cols-2'
        : 'grid-cols-2 md:grid-cols-3';

  return (
    <div className={clsx('grid gap-4', colClass)}>
      {items.map((item) => (
        <article
          key={item.label}
          className="rounded-xl border border-slate-100 bg-slate-50/80 p-3"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {item.label}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-semibold text-slate-900">
              {item.value}
            </span>
            {typeof item.trend === 'number' && (
              <span
                className={clsx(
                  'text-xs font-medium',
                  item.trend === 0
                    ? 'text-slate-500'
                    : item.trend > 0
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                )}
              >
                {item.trend > 0 ? '+' : ''}
                {item.trend}%
              </span>
            )}
          </div>
          {item.helper && (
            <p className="text-xs text-slate-500">{item.helper}</p>
          )}
        </article>
      ))}
    </div>
  );
}

export default MetricGrid;

