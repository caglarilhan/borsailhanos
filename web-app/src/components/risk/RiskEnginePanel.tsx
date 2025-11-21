import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPortfolioStats, getRiskParityWeights } from '@/services/riskEngine';
import { runMarkowitz, runHRP } from '@/services/portfolioOptimizer';
import { Card } from '@/components/shared/Card';
import { MetricGrid } from '@/components/shared/MetricGrid';
import { Badge } from '@/components/shared/Badge';

const OPTIMIZER_ASSETS = [
  { symbol: 'THYAO', expectedReturn: 0.18, volatility: 0.22 },
  { symbol: 'TUPRS', expectedReturn: 0.14, volatility: 0.18 },
  { symbol: 'ASELS', expectedReturn: 0.16, volatility: 0.2 },
  { symbol: 'SISE', expectedReturn: 0.1, volatility: 0.15 },
  { symbol: 'EREGL', expectedReturn: 0.12, volatility: 0.16 },
];

function formatPercent(value: number, fraction = 2) {
  return `${value.toFixed(fraction)}%`;
}

export function RiskEnginePanel() {
  const queryClient = useQueryClient();
  const [targetRisk, setTargetRisk] = useState(0.12);

  const { data: stats } = useQuery({
    queryKey: ['portfolio-stats'],
    queryFn: getPortfolioStats,
    refetchInterval: 15000,
  });

  const { data: riskParity } = useQuery({
    queryKey: ['risk-parity'],
    queryFn: getRiskParityWeights,
    refetchInterval: 30000,
  });

  const { data: markowitz } = useQuery({
    queryKey: ['optimizer', 'markowitz', targetRisk],
    queryFn: () => runMarkowitz(OPTIMIZER_ASSETS, targetRisk),
  });

  const { data: hrp } = useQuery({
    queryKey: ['optimizer', 'hrp'],
    queryFn: () => runHRP(OPTIMIZER_ASSETS),
  });

  const metrics = useMemo(() => {
    const portfolio = stats?.data;
    if (!portfolio) {
      return [
        { label: 'Beta', value: '—' },
        { label: 'Sharpe', value: '—' },
        { label: 'Max Drawdown', value: '—' },
      ];
    }
    return [
      { label: 'Beta', value: portfolio.beta.toFixed(2), helper: 'BIST100 korelasyonu' },
      { label: 'Sharpe', value: portfolio.sharpe.toFixed(2), helper: 'Risk-adjusted return' },
      { label: 'Max Drawdown', value: `${portfolio.maxDrawdown}%`, helper: 'Son 90 gün' },
    ];
  }, [stats]);

  const handleRiskChange = (value: number) => {
    setTargetRisk(value);
    queryClient.invalidateQueries({ queryKey: ['optimizer', 'markowitz'] });
  };

  return (
    <Card
      title="Risk & Portföy Motoru"
      subtitle="Stop-loss, volatility bandı ve optimizasyon"
      className="col-span-12 xl:col-span-8"
      actions={
        stats?.modelVersion && (
          <Badge text={`Model ${stats.modelVersion}`} variant="outline" color="slate" />
        )
      }
    >
      <MetricGrid items={metrics} columns={3} />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-100 p-4">
          <p className="text-sm font-semibold text-slate-900">Risk Bantları</p>
          <p className="text-xs text-slate-500">Volatilite bandı, stop/take seviyeleri</p>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Stop-Loss</span>
              <Badge text={`${stats?.data.stopLoss ?? '-'}%`} color="red" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Take-Profit</span>
              <Badge text={`${stats?.data.takeProfit ?? '-'}%`} color="green" />
            </div>
            <div>
              <p className="text-slate-500">Volatilite Bandı</p>
              {stats?.data.volatilityBand ? (
                <p className="text-xs text-slate-600">
                  {stats.data.volatilityBand.lower}% ile {stats.data.volatilityBand.upper}%
                </p>
              ) : (
                <p className="text-xs text-slate-400">Veri bekleniyor</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 p-4">
          <p className="text-sm font-semibold text-slate-900">Risk-Parity Ağırlıkları</p>
          <p className="text-xs text-slate-500">Volatilite normalize edilmiş dağılım</p>
          <div className="mt-4 space-y-3">
            {riskParity?.data?.map((item) => (
              <div key={item.symbol} className="flex items-center gap-3 text-sm">
                <span className="w-12 font-semibold text-slate-900">{item.symbol}</span>
                <div className="h-2 flex-1 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${item.weight * 100}%` }}
                  />
                </div>
                <span className="w-12 text-right text-slate-600">
                  {(item.weight * 100).toFixed(1)}%
                </span>
              </div>
            )) || <p className="text-xs text-slate-400">Veri bekleniyor</p>}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-100 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Markowitz Optimizer</p>
            <p className="text-xs text-slate-500">Hedef risk düzeyi: {formatPercent(targetRisk * 100)}</p>
          </div>
          <Badge text="Risk-Parity + HRP" variant="outline" color="blue" />
        </div>
        <input
          type="range"
          min={0.05}
          max={0.25}
          step={0.01}
          value={targetRisk}
          onChange={(event) => handleRiskChange(Number(event.target.value))}
          className="mt-4 w-full accent-blue-600"
        />
        <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Markowitz Çıktısı</p>
            {markowitz?.data?.weights?.map((weight) => (
              <div key={weight.symbol} className="flex items-center justify-between text-slate-700">
                <span>{weight.symbol}</span>
                <span>{formatPercent(weight.weight * 100, 1)}</span>
              </div>
            )) || <p className="text-xs text-slate-400">Hesaplanıyor...</p>}
            {markowitz && (
              <p className="mt-2 text-xs text-slate-500">
                Beklenen Getiri: {formatPercent(markowitz.data.expectedReturn * 100)} • Volatilite:{' '}
                {formatPercent(markowitz.data.volatility * 100)}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">HRP (Hierarchical)</p>
            {hrp?.data?.weights?.map((weight) => (
              <div key={weight.symbol} className="flex items-center justify-between text-slate-700">
                <span>{weight.symbol}</span>
                <span>{formatPercent(weight.weight * 100, 1)}</span>
              </div>
            )) || <p className="text-xs text-slate-400">Hesaplanıyor...</p>}
            {hrp && (
              <p className="mt-2 text-xs text-slate-500">
                Beklenen Getiri: {formatPercent(hrp.data.expectedReturn * 100)} • Volatilite:{' '}
                {formatPercent(hrp.data.volatility * 100)}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default RiskEnginePanel;

