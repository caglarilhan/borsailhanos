'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import sparkline from 'sparkline';
import { getChartData } from '@/services/marketData';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';

const SYMBOLS = ['THYAO', 'ASELS', 'TUPRS'];

export function TrendModule() {
  const [symbol, setSymbol] = useState('THYAO');
  const { data, isLoading } = useQuery({
    queryKey: ['feature-trend', symbol],
    queryFn: () => getChartData(symbol),
    refetchInterval: 15000,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prices = useMemo(() => data?.data.map((point) => point.price) ?? [], [data]);

  useEffect(() => {
    if (!canvasRef.current || prices.length === 0) return;
    sparkline(canvasRef.current, prices, {
      width: canvasRef.current.clientWidth || 280,
      height: 80,
      lineColor: '#2563eb',
      fillColor: '#bfdbfe',
    });
  }, [prices]);

  const change24h = useMemo(() => {
    if (prices.length < 2) return 0;
    const first = prices[0];
    const last = prices[prices.length - 1];
    return ((last - first) / first) * 100;
  }, [prices]);

  return (
    <Card
      className="col-span-12"
      title="Trend Analizi"
      subtitle="24s / 7g fiyat eğimi"
      actions={
        <div className="flex items-center gap-2">
          {SYMBOLS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSymbol(item)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                symbol === item ? 'border-blue-500 text-blue-700' : 'border-slate-200 text-slate-600'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      }
    >
      {isLoading ? (
        <p className="text-sm text-slate-500">Trend verisi yükleniyor...</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge
              text={`${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`}
              color={change24h >= 0 ? 'green' : 'red'}
            />
            <p className="text-sm text-slate-600">
              Son 24 saatlik yön: {change24h >= 0 ? 'Yukarı' : 'Aşağı'}
            </p>
          </div>
          <canvas ref={canvasRef} width={320} height={80} />
        </div>
      )}
    </Card>
  );
}

export default TrendModule;

