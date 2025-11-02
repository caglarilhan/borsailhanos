'use client';

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SentimentCorrelationGraphProps {
  symbol: string;
  sentimentHistory: Array<{ date: string; sentiment: number; price: number }>;
}

export function SentimentCorrelationGraph({ symbol, sentimentHistory }: SentimentCorrelationGraphProps) {
  const data = useMemo(() => {
    return sentimentHistory.map((item) => ({
      date: new Date(item.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
      sentiment: (item.sentiment * 100).toFixed(1),
      price: item.price,
      priceNormalized: ((item.price - Math.min(...sentimentHistory.map(h => h.price))) / (Math.max(...sentimentHistory.map(h => h.price)) - Math.min(...sentimentHistory.map(h => h.price)) || 1)) * 100,
    }));
  }, [sentimentHistory]);

  // Calculate correlation coefficient
  const correlation = useMemo(() => {
    if (sentimentHistory.length < 2) return 0;
    const sentiments = sentimentHistory.map(h => h.sentiment);
    const prices = sentimentHistory.map(h => h.price);
    const n = sentiments.length;
    const sumS = sentiments.reduce((a, b) => a + b, 0);
    const sumP = prices.reduce((a, b) => a + b, 0);
    const sumSP = sentiments.reduce((sum, s, i) => sum + s * prices[i], 0);
    const sumS2 = sentiments.reduce((sum, s) => sum + s * s, 0);
    const sumP2 = prices.reduce((sum, p) => sum + p * p, 0);
    const numerator = n * sumSP - sumS * sumP;
    const denominator = Math.sqrt((n * sumS2 - sumS * sumS) * (n * sumP2 - sumP * sumP));
    return denominator === 0 ? 0 : numerator / denominator;
  }, [sentimentHistory]);

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">
          📊 Sentiment-Fiyat Korelasyonu ({symbol})
        </h3>
        <div className="text-xs text-slate-600">
          Korelasyon: <span className={`font-bold ${Math.abs(correlation) > 0.7 ? 'text-green-600' : Math.abs(correlation) > 0.4 ? 'text-yellow-600' : 'text-red-600'}`}>
            {correlation.toFixed(2)}
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
          <YAxis yAxisId="left" stroke="#64748b" fontSize={10} />
          <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
            labelStyle={{ fontWeight: 'bold' }}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="sentiment"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={false}
            name="Sentiment (%)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="priceNormalized"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            name="Fiyat (normalize)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

