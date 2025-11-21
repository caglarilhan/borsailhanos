'use client';

import { useEffect, useRef } from 'react';
import sparkline from 'sparkline';

type SentimentTrendProps = {
  data: Array<{ date: string; score: number }>;
};

export function SentimentTrend({ data }: SentimentTrendProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;
    const values = data.map((point) => point.score);
    sparkline(canvasRef.current, values, {
      width: canvasRef.current.clientWidth || 220,
      height: 60,
      lineColor: '#0ea5e9',
      startColor: '#22d3ee',
      endColor: '#0ea5e9',
      fillColor: '#bae6fd',
    });
  }, [data]);

  const latest = data[data.length - 1];

  return (
    <div>
      <canvas ref={canvasRef} width={260} height={60} />
      {latest && (
        <p className="mt-2 text-xs text-slate-500">
          Son değer {latest.date}: {latest.score >= 0 ? '+' : ''}
          {latest.score}
        </p>
      )}
    </div>
  );
}

export default SentimentTrend;

