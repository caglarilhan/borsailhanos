'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { getChartData } from '@/services/marketData';
import { Card } from '@/components/shared/Card';
import IndicatorLegend from '@/components/charts/IndicatorLegend';
import { Badge } from '@/components/shared/Badge';

const ReactECharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
});

const SYMBOLS = ['THYAO', 'TUPRS', 'ASELS', 'SISE', 'EREGL'];

const LEGEND_ITEMS = [
  { label: 'Price', color: '#1d4ed8', description: 'Ana fiyat serisi' },
  { label: 'EMA20', color: '#34d399', description: 'Kısa trend' },
  { label: 'EMA50', color: '#fbbf24', description: 'Orta trend' },
  { label: 'RSI', color: '#a855f7', description: 'Momentum' },
  { label: 'MACD', color: '#f87171', description: 'Trend gücü' },
];

export function MarketCharts() {
  const [symbol, setSymbol] = useState<string>('THYAO');
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['chart-data', symbol],
    queryFn: () => getChartData(symbol),
    refetchInterval: 15000,
  });

  const chartOptions = useMemo(() => {
    const series = data?.data ?? [];
    const timestamps = series.map((point) => point.timestamp);
    return {
      animation: false,
      backgroundColor: '#ffffff',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0f172a',
        borderWidth: 0,
      },
      axisPointer: { link: [{ xAxisIndex: [0, 1] }] },
      grid: [
        { left: '6%', right: '4%', height: '50%' },
        { left: '6%', right: '4%', top: '58%', height: '15%' },
        { left: '6%', right: '4%', top: '75%', height: '15%' },
      ],
      xAxis: [
        {
          type: 'category',
          data: timestamps,
          boundaryGap: false,
          axisLabel: { formatter: (value: number) => new Date(value).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) },
        },
        { type: 'category', gridIndex: 1, data: timestamps, boundaryGap: false, axisLabel: { show: false } },
        { type: 'category', gridIndex: 2, data: timestamps, boundaryGap: false, axisLabel: { show: false } },
      ],
      yAxis: [
        { scale: true, splitNumber: 4 },
        { gridIndex: 1, splitNumber: 2 },
        { gridIndex: 2, splitNumber: 2 },
      ],
      dataZoom: [
        { type: 'inside', xAxisIndex: [0, 1, 2] },
        { type: 'slider', xAxisIndex: [0, 1, 2] },
      ],
      series: [
        {
          name: 'Fiyat',
          type: 'line',
          data: series.map((point) => point.price),
          lineStyle: { color: '#1d4ed8', width: 2 },
          showSymbol: false,
        },
        {
          name: 'EMA20',
          type: 'line',
          data: series.map((point) => point.indicators.ema20),
          lineStyle: { color: '#34d399', width: 1, type: 'dashed' },
          showSymbol: false,
        },
        {
          name: 'EMA50',
          type: 'line',
          data: series.map((point) => point.indicators.ema50),
          lineStyle: { color: '#fbbf24', width: 1, type: 'dotted' },
          showSymbol: false,
        },
        {
          name: 'Hacim',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: series.map((point) => point.volume),
          itemStyle: { color: '#94a3b8' },
        },
        {
          name: 'RSI',
          type: 'line',
          xAxisIndex: 2,
          yAxisIndex: 2,
          data: series.map((point) => point.indicators.rsi),
          lineStyle: { color: '#a855f7' },
          markLine: {
            silent: true,
            data: [{ yAxis: 70 }, { yAxis: 30 }],
            lineStyle: { color: '#cbd5f5', type: 'dashed' },
          },
        },
        {
          name: 'MACD',
          type: 'bar',
          xAxisIndex: 2,
          yAxisIndex: 2,
          data: series.map((point) => point.indicators.macdHistogram),
          itemStyle: {
            color: (params: { value: number }) => (params.value >= 0 ? '#10b981' : '#ef4444'),
          },
        },
      ],
    };
  }, [data]);

  return (
    <Card
      title="Grafikler"
      subtitle="Fiyat + Hacim + RSI + MACD"
      className="col-span-12 xl:col-span-16"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {SYMBOLS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSymbol(item)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold 
                ${symbol === item ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
            >
              {item}
            </button>
          ))}
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
          >
            Yenile
          </button>
        </div>
      }
    >
      <IndicatorLegend items={LEGEND_ITEMS} />
      <div className="mt-6 min-h-[360px] rounded-2xl border border-slate-100">
        {isLoading && <p className="p-4 text-sm text-slate-500">Grafik verisi yükleniyor...</p>}
        {isError && <p className="p-4 text-sm text-rose-600">Grafik verisi alınamadı.</p>}
        {!isLoading && !isError && data && (
          <ReactECharts
            option={chartOptions}
            style={{ height: 420, width: '100%' }}
            notMerge
            opts={{ renderer: 'svg' }}
          />
        )}
      </div>
      {data && (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <Badge text="Zoom & Pan aktif" variant="outline" color="slate" />
          <span>Son güncelleme: {new Date(data.updatedAt).toLocaleTimeString('tr-TR')}</span>
          <span>Model {data.modelVersion}</span>
        </div>
      )}
    </Card>
  );
}

export default MarketCharts;

