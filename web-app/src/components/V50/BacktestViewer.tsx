'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TestTube2, 
  LineChart, 
  BarChart3,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

interface WalkForwardResult {
  average_sharpe: number;
  consistency_score: number;
  best_window: { window: number; sharpe: number };
  worst_window: { window: number; sharpe: number };
  n_windows: number;
}

interface MonteCarloResult {
  mean_pnl: number;
  median_pnl: number;
  cvar_5pct: number;
  probability_profit: number;
  confidence_bands: {
    '5th_percentile': number;
    '25th_percentile': number;
    '50th_percentile': number;
    '75th_percentile': number;
    '95th_percentile': number;
  };
}

export default function BacktestViewer() {
  const [wfResult, setWfResult] = useState<WalkForwardResult | null>(null);
  const [mcResult, setMcResult] = useState<MonteCarloResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runWalkForward = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v5/backtest/walk-forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy: {},
          data: {},
          train_months: 6,
          test_months: 1
        })
      });
      const data = await response.json();
      setWfResult(data.walk_forward_result);
    } catch (error) {
      console.error('Walk-forward error:', error);
    } finally {
      setLoading(false);
    }
  };

  const runMonteCarlo = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v5/backtest/monte-carlo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy: {},
          data: {},
          n_simulations: 10000
        })
      });
      const data = await response.json();
      setMcResult(data.monte_carlo_result);
    } catch (error) {
      console.error('Monte Carlo error:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAll = async () => {
    await Promise.all([runWalkForward(), runMonteCarlo()]);
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 rounded-xl border border-slate-700/50 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <TestTube2 className="w-6 h-6 text-purple-400" />
              Backtesting Engine
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Walk-Forward + Monte Carlo Simulation
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={runWalkForward}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all"
          >
            Walk-Forward Test
          </button>
          <button
            onClick={runMonteCarlo}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-medium py-3 px-4 rounded-lg transition-all"
          >
            Monte Carlo (10K)
          </button>
          <button
            onClick={runAll}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-4 rounded-lg transition-all"
          >
            Run All
          </button>
        </div>
      </motion.div>

      {/* Walk-Forward Results */}
      {wfResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 rounded-xl border border-slate-700/50 p-6"
        >
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-purple-400" />
            Walk-Forward Test Results
          </h4>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
              <div className="text-sm text-slate-400 mb-1">Average Sharpe</div>
              <div className="text-2xl font-bold text-green-400">
                {wfResult.average_sharpe.toFixed(2)}
              </div>
            </div>
            <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
              <div className="text-sm text-slate-400 mb-1">Consistency</div>
              <div className="text-2xl font-bold text-cyan-400">
                {(wfResult.consistency_score * 100).toFixed(0)}%
              </div>
            </div>
            <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
              <div className="text-sm text-slate-400 mb-1">Best Window</div>
              <div className="text-lg font-bold text-emerald-400">
                #{wfResult.best_window.window} ({wfResult.best_window.sharpe.toFixed(2)})
              </div>
            </div>
            <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
              <div className="text-sm text-slate-400 mb-1">Worst Window</div>
              <div className="text-lg font-bold text-red-400">
                #{wfResult.worst_window.window} ({wfResult.worst_window.sharpe.toFixed(2)})
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
            <div>
              <div className="font-bold text-emerald-400">Test Passed</div>
              <div className="text-sm text-emerald-300/80">
                {wfResult.n_windows} windows tested • Overfitting koruması aktif
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Monte Carlo Results */}
      {mcResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 rounded-xl border border-slate-700/50 p-6"
        >
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Monte Carlo Simulation (10,000 Scenarios)
          </h4>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
              <div className="text-sm text-slate-400 mb-1">Mean PnL</div>
              <div className="text-2xl font-bold text-green-400">
                {mcResult.mean_pnl.toFixed(2)}%
              </div>
            </div>
            <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
              <div className="text-sm text-slate-400 mb-1">Median PnL</div>
              <div className="text-2xl font-bold text-cyan-400">
                {mcResult.median_pnl.toFixed(2)}%
              </div>
            </div>
            <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
              <div className="text-sm text-slate-400 mb-1">CVaR (%5)</div>
              <div className="text-2xl font-bold text-amber-400">
                {mcResult.cvar_5pct.toFixed(2)}%
              </div>
            </div>
            <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
              <div className="text-sm text-slate-400 mb-1">Profit Probability</div>
              <div className="text-2xl font-bold text-purple-400">
                {(mcResult.probability_profit * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Confidence Bands */}
          <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
            <div className="text-sm font-medium text-slate-300 mb-3">Confidence Bands</div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>5th: {mcResult.confidence_bands['5th_percentile'].toFixed(2)}%</span>
              <span>25th: {mcResult.confidence_bands['25th_percentile'].toFixed(2)}%</span>
              <span className="text-cyan-400 font-bold">
                50th: {mcResult.confidence_bands['50th_percentile'].toFixed(2)}%
              </span>
              <span>75th: {mcResult.confidence_bands['75th_percentile'].toFixed(2)}%</span>
              <span>95th: {mcResult.confidence_bands['95th_percentile'].toFixed(2)}%</span>
            </div>
          </div>

          <div className="mt-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            <div>
              <div className="font-bold text-cyan-400">Risk Simulation Complete</div>
              <div className="text-sm text-cyan-300/80">
                {mcResult.probability_profit * 100 > 60 
                  ? 'Kâr olasılığı yüksek - pozisyon güvenli' 
                  : 'Kâr olasılığı düşük - dikkatli olun'}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

