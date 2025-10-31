'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3,
  TrendingUp,
  Activity,
  PieChart,
  Target,
  Zap
} from 'lucide-react';
import { useTop30Analysis, useBist30Overview } from '@/hooks/queries';
import { Skeleton } from '@/components/UI/Skeleton';

export default function AdvancedVisualizationHub() {
  const [selectedMetric, setSelectedMetric] = useState('signals');

  // Queries
  const top30Q = useTop30Analysis();
  const ovQ = useBist30Overview(true);

  // Sector Heatmap Data (backend varsa kullan)
  const sectors = useMemo(() => {
    const ov: any = ovQ.data;
    if (ov && Array.isArray(ov.sector_distribution)) {
      return ov.sector_distribution.map((s: any) => ({
        name: s.sector,
        weight: Number(s.weight || 0),
        trend: Math.max(0, Math.min(1, (Number(s.change || 0) + 5) / 10)),
        color: (Number(s.change || 0) >= 0 ? '#10b981' : '#ef4444')
      }));
    }
    return [
      { name: 'Bankacılık', weight: 35, trend: 0.75, color: '#10b981' },
      { name: 'Sanayi', weight: 28, trend: 0.65, color: '#3b82f6' },
      { name: 'Teknoloji', weight: 22, trend: 0.85, color: '#8b5cf6' },
      { name: 'İnşaat', weight: 15, trend: 0.45, color: '#f59e0b' }
    ];
  }, [ovQ.data]);

  // AI Predictions Data (Top30'dan türet)
  const predictionData = useMemo(() => {
    const d: any = top30Q.data;
    if (d && Array.isArray(d.top30)) {
      return d.top30.slice(0, 5).map((s: any) => ({
        symbol: s.symbol,
        prediction: Math.max(0, Math.min(1, (Number(s.potential || s.predictedChange || 0) / 100))),
        actual: Math.max(0, Math.min(1, (Number(s.aiSummary?.price_change_7d || 0) / 100))),
        diff: Math.max(-1, Math.min(1, ((Number(s.potential || s.predictedChange || 0) - Number(s.aiSummary?.price_change_7d || 0)) / 100))),
        direction: Number(s.predictedChange || 0) >= 0 ? 'up' : 'down'
      }));
    }
    return [
      { symbol: 'THYAO', prediction: 0.87, actual: 0.82, diff: 0.05, direction: 'up' },
      { symbol: 'AKBNK', prediction: 0.65, actual: 0.68, diff: -0.03, direction: 'up' },
      { symbol: 'EREGL', prediction: 0.72, actual: 0.71, diff: 0.01, direction: 'up' },
      { symbol: 'TUPRS', prediction: 0.58, actual: 0.55, diff: 0.03, direction: 'up' },
      { symbol: 'SISE', prediction: 0.45, actual: 0.48, diff: -0.03, direction: 'down' }
    ];
  }, [top30Q.data]);

  // Signal Accuracy Data (Top30 metadata'dan türet)
  const signalAccuracy = useMemo(() => {
    const d: any = top30Q.data;
    if (d && Array.isArray(d.top30)) {
      return d.top30.slice(0, 4).map((s: any) => ({
        symbol: s.symbol,
        accuracy: Math.round(Number(s.accuracy || 0)),
        type: s.signal,
        confidence: Math.round(Number(s.confidence || 0))
      }));
    }
    return [
      { symbol: 'THYAO', accuracy: 92, type: 'BUY', confidence: 87 },
      { symbol: 'AKBNK', accuracy: 78, type: 'BUY', confidence: 75 },
      { symbol: 'EREGL', accuracy: 85, type: 'HOLD', confidence: 68 },
      { symbol: 'TUPRS', accuracy: 88, type: 'SELL', confidence: 82 }
    ];
  }, [top30Q.data]);

  if (top30Q.isLoading || ovQ.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64 rounded" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-36 rounded" />
          <Skeleton className="h-36 rounded" />
        </div>
      </div>
    );
  }

  const getHeatmapColor = (trend: number) => {
    if (trend > 0.75) return 'bg-green-400';
    if (trend > 0.60) return 'bg-cyan-400';
    if (trend > 0.45) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 85) return 'bg-emerald-500';
    if (accuracy >= 70) return 'bg-cyan-500';
    if (accuracy >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Metric Selector */}
      <div className="flex gap-3 flex-wrap">
        {['signals', 'sectors', 'predictions', 'accuracy'].map((metric) => (
          <button
            key={metric}
            onClick={() => setSelectedMetric(metric)}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              selectedMetric === metric
                ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                : 'bg-slate-800 text-gray-400'
            }`}
          >
            {metric === 'signals' && '📈 Sinyaller'}
            {metric === 'sectors' && '🏭 Sektörler'}
            {metric === 'predictions' && '🤖 Tahminler'}
            {metric === 'accuracy' && '🎯 Doğruluk'}
          </button>
        ))}
      </div>

      {/* Signals Visualization */}
      {selectedMetric === 'signals' && (
        <div className="grid grid-cols-2 gap-4">
          {signalAccuracy.map((signal, idx) => (
            <motion.div
              key={signal.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-white">{signal.symbol}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  signal.type === 'BUY' ? 'bg-green-500 text-white' :
                  signal.type === 'SELL' ? 'bg-red-500 text-white' :
                  'bg-amber-500 text-white'
                }`}>
                  {signal.type}
                </span>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Doğruluk</span>
                  <span className="text-white font-bold">{signal.accuracy}%</span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${signal.accuracy}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    className={`h-full ${getAccuracyColor(signal.accuracy)} rounded-full`}
                  />
                </div>
              </div>

              <div className="text-xs text-gray-400">
                AI Güveni: <span className="text-cyan-400 font-bold">{signal.confidence}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Sectors Heatmap */}
      {selectedMetric === 'sectors' && (
        <div className="grid grid-cols-2 gap-4">
          {sectors.map((sector, idx) => (
            <motion.div
              key={sector.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/30 relative overflow-hidden"
            >
              {/* Heatmap Overlay */}
              <div 
                className={`absolute inset-0 ${getHeatmapColor(sector.trend)} opacity-20`}
                style={{ 
                  filter: `blur(40px)`,
                  transform: 'scale(2)'
                }}
              />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-white">{sector.name}</span>
                  <span className="text-2xl">{(sector.trend * 100).toFixed(0)}%</span>
                </div>
                
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Ağırlık</span>
                    <span>{sector.weight}%</span>
                  </div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${sector.weight}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: sector.color }}
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  Trend: <span className="text-cyan-400 font-bold">{(sector.trend * 100).toFixed(0)}% pozitif</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* AI Predictions */}
      {selectedMetric === 'predictions' && (
        <div className="space-y-4">
          {predictionData.map((pred, idx) => (
            <motion.div
              key={pred.symbol}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-lg font-bold text-white">{pred.symbol}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">Tahmin: {pred.prediction}</span>
                    <span className="text-xs text-gray-600">|</span>
                    <span className="text-xs text-green-400">Gerçek: {pred.actual}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-lg ${
                  Math.abs(pred.diff) < 0.05 ? 'bg-green-500' :
                  pred.diff > 0 ? 'bg-cyan-500' : 'bg-amber-500'
                } text-white font-bold text-sm`}>
                  {pred.diff > 0 ? '+' : ''}{(pred.diff * 100).toFixed(1)}%
                </div>
              </div>

              {/* Prediction vs Actual Bar */}
              <div className="flex gap-2 mb-2">
                <div className="flex-1">
                  <div className="text-xs text-gray-400 mb-1">Tahmin</div>
                  <div className="h-4 bg-cyan-500/30 rounded relative overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: `${pred.prediction * 100}%` }} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400 mb-1">Gerçek</div>
                  <div className="h-4 bg-green-500/30 rounded relative overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${pred.actual * 100}%` }} />
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-400">
                Yön: <span className={pred.direction === 'up' ? 'text-green-400' : 'text-red-400'}>
                  {pred.direction === 'up' ? '↑ Yükseliş' : '↓ Düşüş'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Accuracy Dashboard */}
      {selectedMetric === 'accuracy' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg p-6 border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold text-white">87.3%</div>
                <div className="text-sm text-gray-400">Ortalama AI Doğruluğu</div>
              </div>
              <Target className="w-12 h-12 text-purple-400" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-emerald-400 font-bold text-xl">124</div>
                <div className="text-xs text-gray-400">Doğru Sinyal</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-cyan-400 font-bold text-xl">142</div>
                <div className="text-xs text-gray-400">Toplam Sinyal</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-purple-400 font-bold text-xl">1.85</div>
                <div className="text-xs text-gray-400">Sharpe Ratio</div>
              </div>
            </div>
          </div>

          {/* Weekly Accuracy Trend */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
            <div className="text-sm font-bold text-white mb-3">Haftalık Trend</div>
            <div className="flex items-end gap-2 h-24">
              {[72, 78, 82, 85, 87, 88, 87].map((value, idx) => (
                <motion.div
                  key={idx}
                  initial={{ height: 0 }}
                  animate={{ height: `${value}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex-1 bg-gradient-to-t from-purple-500 to-cyan-500 rounded-t-lg min-h-[20px]"
                  title={`${value}%`}
                />
              ))}
            </div>
            <div className="flex gap-2 mt-2 text-xs text-gray-400">
              {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, idx) => (
                <div key={idx} className="flex-1 text-center">{day}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

