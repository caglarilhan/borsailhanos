type IndicatorLegendProps = {
  items: Array<{ label: string; color: string; description?: string }>;
};

export function IndicatorLegend({ items }: IndicatorLegendProps) {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-slate-600">
      {items.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5"
        >
          <span className="flex items-center gap-1 font-semibold text-slate-900">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </span>
          {item.description && <span className="text-slate-500">{item.description}</span>}
        </span>
      ))}
    </div>
  );
}

export default IndicatorLegend;

