import clsx from 'clsx';

type HeatmapProps = {
  symbols: Array<{ symbol: string; change: number }>;
  compact?: boolean;
};

export function Heatmap({ symbols, compact = false }: HeatmapProps) {
  return (
    <div
      className={clsx(
        'grid gap-2',
        compact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4 xl:grid-cols-6'
      )}
    >
      {symbols.map((item) => {
        const isPositive = item.change >= 0;
        const color = isPositive ? 'bg-emerald-500/20 text-emerald-800' : 'bg-rose-500/20 text-rose-800';
        return (
          <div
            key={item.symbol}
            className={clsx(
              'rounded-xl border border-slate-100 p-3 text-center text-sm font-semibold',
              color
            )}
          >
            <p>{item.symbol}</p>
            <p className="text-xs font-medium">
              {isPositive ? '+' : ''}
              {item.change.toFixed(2)}%
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default Heatmap;

