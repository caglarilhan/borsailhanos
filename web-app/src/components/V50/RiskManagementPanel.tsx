'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingDown, 
  Shield, 
  AlertTriangle,
  DollarSign,
  BarChart3
} from 'lucide-react';

interface RiskHeatmapItem {
  symbol: string;
  weight: number;
  cvar: number;
  risk_contribution: number;
  color: string;
}

interface RiskSummary {
  total_portfolio_cvar: number;
  max_risk_stock: string;
  max_risk_contribution: number;
  risk_heatmap: RiskHeatmapItem[];
}

interface StopLossRecommendation {
  symbol: string;
  current_price: number;
  atr_stop: number;
  adjusted_stop: number;
  distance_pct: number;
  ai_confidence: number;
  risk_tier: string;
}

export default function RiskManagementPanel() {
  const [portfolio, setPortfolio] = useState({
    'THYAO': 0.40,
    'AKBNK': 0.30,
    'EREGL': 0.30
  });
  
  const [riskSummary, setRiskSummary] = useState<RiskSummary | null>(null);
  const [stopLossRecs, setStopLossRecs] = useState<StopLossRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch CVaR data
  const fetchCVaR = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v5/risk/cvar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolio })
      });
      const data = await response.json();
      setRiskSummary(data.summary);
    } catch (error) {
      console.error('CVaR fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stop-loss recommendations
  const fetchStopLoss = async () => {
    const symbols = Object.keys(portfolio);
    const recs = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const response = await fetch('/api/v5/risk/stop-loss', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symbol, ai_confidence: 0.85 })
          });
          return await response.json();
        } catch (error) {
          return null;
        }
      })
    );
    setStopLossRecs(recs.filter(Boolean));
  };

  useEffect(() => {
    fetchCVaR();
    fetchStopLoss();
  }, []);

  const getRiskColor = (cvar: number) => {
    if (cvar < 2) return 'text-emerald-400';
    if (cvar < 4) return 'text-amber-400';
    return 'text-red-400';
  };

  const getRiskTierBadge = (tier: string) => {
    const styles = {
      low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      high: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return styles[tier as keyof typeof styles] || styles.low;
  };

  return (
    <div className="space-y-6">
      {/* CVaR Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 rounded-xl border border-slate-700/50 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-cyan-400" />
              CVaR Risk Heatmap
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Portfolio risk dağılımı (Conditional Value at Risk %5)
            </p>
          </div>
        </div>

        {riskSummary && (
          <div className="space-y-4">
            {/* Heatmap Bars */}
            {riskSummary.risk_heatmap.map((item, idx) => (
              <div key={item.symbol} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300 font-medium">{item.symbol}</span>
                  <span className={getRiskColor(item.cvar)}>
                    CVaR: %{item.cvar.toFixed(2)} | Risk: %{item.risk_contribution.toFixed(2)}
                  </span>
                </div>
                
                <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.risk_contribution * 10}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    style={{ backgroundColor: item.color }}
                    className="h-full rounded-full"
                  />
                </div>
              </div>
            ))}

            {/* Summary Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">
                  {riskSummary.total_portfolio_cvar.toFixed(2)}%
                </div>
                <div className="text-xs text-slate-400">Portfolio CVaR</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">
                  {riskSummary.max_risk_stock}
                </div>
                <div className="text-xs text-slate-400">Max Risk Stock</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {riskSummary.max_risk_contribution.toFixed(2)}%
                </div>
                <div className="text-xs text-slate-400">Risk Contribution</div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Dynamic Stop-Loss Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 rounded-xl border border-slate-700/50 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-purple-400" />
              Dynamic Stop-Loss Recommendations
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              ATR bazlı + AI confidence adjustment
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {stopLossRecs.map((rec, idx) => (
            <div
              key={rec.symbol}
              className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskTierBadge(rec.risk_tier)}`}>
                    {rec.risk_tier.toUpperCase()}
                  </div>
                  <span className="text-lg font-bold text-white">{rec.symbol}</span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-emerald-400">
                    {rec.current_price.toFixed(2)} ₺
                  </div>
                  <div className="text-xs text-slate-400">Current Price</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-cyan-400 font-medium">ATR Stop</div>
                  <div className="text-slate-300">{rec.atr_stop.toFixed(2)} ₺</div>
                </div>
                <div>
                  <div className="text-purple-400 font-medium">Adjusted Stop</div>
                  <div className="text-slate-300">{rec.adjusted_stop.toFixed(2)} ₺</div>
                </div>
                <div>
                  <div className="text-amber-400 font-medium">Distance</div>
                  <div className="text-slate-300">%{rec.distance_pct.toFixed(2)}</div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                <span>🤖 AI Confidence: {(rec.ai_confidence * 100).toFixed(0)}%</span>
                <span>📊 Risk Tier: {rec.risk_tier}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Alert Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-xl p-4 flex items-center gap-4"
      >
        <AlertTriangle className="w-6 h-6 text-amber-400" />
        <div className="flex-1">
          <div className="font-bold text-amber-400">Risk Uyarısı</div>
          <div className="text-sm text-amber-300/80">
            Portföyünüzde yüksek risk taşıyan pozisyonlar tespit edildi. 
            CVaR değeri %4.5 - yatırımcı riskini gözden geçirin.
          </div>
        </div>
      </motion.div>
    </div>
  );
}

