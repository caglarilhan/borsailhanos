'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { runMarkowitz } from '@/services/portfolioOptimizer';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';

const ASSETS = [
  { symbol: 'THYAO', expectedReturn: 0.18, volatility: 0.22 },
  { symbol: 'ASELS', expectedReturn: 0.14, volatility: 0.18 },
  { symbol: 'TUPRS', expectedReturn: 0.16, volatility: 0.2 },
  { symbol: 'SISE', expectedReturn: 0.1, volatility: 0.15 },
];

export function PortfolioMini() {
  const [targetRisk, setTargetRisk] = useState(0.12);
  const { data, isLoading } = useQuery({
    queryKey: ['feature-portfolio', targetRisk],
    queryFn: () => runMarkowitz(ASSETS, targetRisk),
  });

  return (
    <Card
      className="col-span-12"
      title="Portföy Mini Optimizer"
      subtitle="Risk-parity slider"
    >
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>Hedef risk: {(targetRisk * 100).toFixed(1)}%</span>
        {data && (
          <Badge
            text={`Beklenen ${ (data.data.expectedReturn * 100).toFixed(1) }%`}
            variant="outline"
            color="green"
          />
        )}
      </div>
      <input
        type="range"
        min={0.05}
        max={0.25}
        step={0.01}
        value={targetRisk}
        onChange={(event) => setTargetRisk(Number(event.target.value))}
        className="mt-3 w-full accent-blue-600"
      />
      {isLoading ? (
        <p className="mt-4 text-sm text-slate-500">Ağırlıklar hesaplanıyor...</p>
      ) : (
        <div className="mt-4 space-y-2 text-sm text-slate-700">
          {data?.data.weights.map((weight) => (
            <div key={weight.symbol} className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">{weight.symbol}</span>
              <span>{(weight.weight * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default PortfolioMini;

