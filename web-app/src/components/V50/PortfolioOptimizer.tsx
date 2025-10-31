'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  PieChart, 
  Calculator,
  Zap,
  Target,
  Coins
} from 'lucide-react';

interface OptimizationResult {
  weights: Record<string, number>;
  expected_return: number;
  volatility: number;
  sharpe_ratio: number;
  method: string;
  tax_efficiency?: number;
}

interface EfficientFrontierPoint {
  target_return: number;
  risk: number;
  sharpe: number;
}

export default function PortfolioOptimizer() {
  const [symbols, setSymbols] = useState(['THYAO', 'AKBNK', 'EREGL', 'TUPRS', 'SISE']);
  const [method, setMethod] = useState<'max_sharpe' | 'risk_parity' | 'tax_aware' | 'personalized'>('personalized');
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [frontier, setFrontier] = useState<EfficientFrontierPoint[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Kişiselleştirme profili
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | 'aggressive'>('medium');
  const [investmentHorizon, setInvestmentHorizon] = useState<'1m' | '6m' | '1y' | '5y'>('6m');
  const [sectorPreference, setSectorPreference] = useState<'all' | 'technology' | 'banking' | 'energy' | 'industry' | 'construction' | 'retail'>('all');
  const [personalizedPortfolio, setPersonalizedPortfolio] = useState<any>(null);

  // Dashboard'dan localStorage'dan profil ayarlarını oku
  useEffect(() => {
    const storedRisk = localStorage.getItem('portfolioRiskLevel');
    const storedHorizon = localStorage.getItem('portfolioHorizon');
    const storedSector = localStorage.getItem('portfolioSectorPreference');
    
    if (storedRisk) setRiskLevel(storedRisk as 'low' | 'medium' | 'high' | 'aggressive');
    if (storedHorizon) setInvestmentHorizon(storedHorizon as '1m' | '6m' | '1y' | '5y');
    if (storedSector) setSectorPreference(storedSector as 'all' | 'technology' | 'banking' | 'energy' | 'industry' | 'construction' | 'retail');
  }, []);

  // localStorage değişikliklerini dinle (Dashboard'dan gelen güncellemeler için)
  useEffect(() => {
    const handleStorageChange = () => {
      const storedRisk = localStorage.getItem('portfolioRiskLevel');
      const storedHorizon = localStorage.getItem('portfolioHorizon');
      const storedSector = localStorage.getItem('portfolioSectorPreference');
      
      if (storedRisk) setRiskLevel(storedRisk as 'low' | 'medium' | 'high' | 'aggressive');
      if (storedHorizon) setInvestmentHorizon(storedHorizon as '1m' | '6m' | '1y' | '5y');
      if (storedSector) setSectorPreference(storedSector as 'all' | 'technology' | 'banking' | 'energy' | 'industry' | 'construction' | 'retail');
    };

    window.addEventListener('storage', handleStorageChange);
    // localStorage.setItem çağrıları aynı window'da tetiklenmediği için manuel polling
    const interval = setInterval(handleStorageChange, 500);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const optimize = async () => {
    setLoading(true);
    try {
      if (method === 'personalized') {
        // Kişiselleştirilmiş portföy
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:18085';
        const queryParams = new URLSearchParams({
          risk: riskLevel,
          horizon: investmentHorizon,
          sectors: sectorPreference
        });
        const response = await fetch(`${API_BASE_URL}/api/portfolio/personalized?${queryParams}`, { cache: 'no-store' });
        const data = await response.json();
        setPersonalizedPortfolio(data);
        
        // Standardize format for display
        const weights: Record<string, number> = {};
        data.portfolio.forEach((p: any) => {
          weights[p.symbol] = p.recommendedAllocation / 100;
        });
        setResult({
          weights,
          expected_return: data.portfolio.reduce((sum: number, p: any) => sum + (p.score / 100) * (p.recommendedAllocation / 100), 0),
          volatility: riskLevel === 'low' ? 0.15 : riskLevel === 'medium' ? 0.22 : riskLevel === 'high' ? 0.30 : 0.40,
          sharpe_ratio: riskLevel === 'low' ? 1.2 : riskLevel === 'medium' ? 1.5 : riskLevel === 'high' ? 1.8 : 2.0,
          method: 'personalized'
        });
      } else {
        // Standart optimizasyon
        const optResponse = await fetch('/api/v5/portfolio/optimize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbols, method, risk_free_rate: 0.15 })
        });
        const optData = await optResponse.json();
        setResult(optData.optimization_result);

        // Fetch efficient frontier
        const frontierResponse = await fetch('/api/v5/portfolio/frontier', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbols })
        });
        const frontierData = await frontierResponse.json();
        setFrontier(frontierData.frontier_points);
      }
    } catch (error) {
      console.error('Optimization error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Optimization Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 rounded-xl border border-slate-700/50 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <PieChart className="w-6 h-6 text-green-400" />
              Portfolio Optimizer
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Markowitz + Risk Parity + Tax-Aware
            </p>
          </div>
        </div>

        {/* Method Selection */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => setMethod('personalized')}
            className={`px-4 py-3 rounded-lg border-2 transition-all ${
              method === 'personalized'
                ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
            }`}
          >
            <Target className="w-5 h-5 mx-auto mb-1" />
            <div className="text-xs font-medium">Kişisel</div>
          </button>
          <button
            onClick={() => setMethod('max_sharpe')}
            className={`px-4 py-3 rounded-lg border-2 transition-all ${
              method === 'max_sharpe'
                ? 'border-green-400 bg-green-400/10 text-green-400'
                : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
            }`}
          >
            <Zap className="w-5 h-5 mx-auto mb-1" />
            <div className="text-xs font-medium">Max Sharpe</div>
          </button>
          <button
            onClick={() => setMethod('risk_parity')}
            className={`px-4 py-3 rounded-lg border-2 transition-all ${
              method === 'risk_parity'
                ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
            }`}
          >
            <Target className="w-5 h-5 mx-auto mb-1" />
            <div className="text-xs font-medium">Risk Parity</div>
          </button>
          <button
            onClick={() => setMethod('tax_aware')}
            className={`px-4 py-3 rounded-lg border-2 transition-all ${
              method === 'tax_aware'
                ? 'border-purple-400 bg-purple-400/10 text-purple-400'
                : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
            }`}
          >
            <Coins className="w-5 h-5 mx-auto mb-1" />
            <div className="text-xs font-medium">Tax-Aware</div>
          </button>
        </div>

        {/* Kişiselleştirme Profili */}
        {method === 'personalized' && (
          <div className="space-y-4 mb-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <div className="text-sm font-semibold text-slate-300 mb-3">Kişiselleştirme Profili</div>
            
            {/* Risk Seviyesi */}
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Risk Seviyesi</label>
              <div className="grid grid-cols-4 gap-2">
                {(['low', 'medium', 'high', 'aggressive'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setRiskLevel(level)}
                    className={`px-3 py-2 rounded text-xs font-medium transition-all ${
                      riskLevel === level
                        ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/50'
                        : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    {level === 'low' ? 'Düşük' : level === 'medium' ? 'Orta' : level === 'high' ? 'Yüksek' : 'Agresif'}
                  </button>
                ))}
              </div>
            </div>

            {/* Yatırım Süresi */}
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Yatırım Süresi</label>
              <div className="grid grid-cols-4 gap-2">
                {(['1m', '6m', '1y', '5y'] as const).map((horizon) => (
                  <button
                    key={horizon}
                    onClick={() => setInvestmentHorizon(horizon)}
                    className={`px-3 py-2 rounded text-xs font-medium transition-all ${
                      investmentHorizon === horizon
                        ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/50'
                        : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    {horizon === '1m' ? '1 Ay' : horizon === '6m' ? '6 Ay' : horizon === '1y' ? '1 Yıl' : '5 Yıl'}
                  </button>
                ))}
              </div>
            </div>

            {/* Sektör Tercihi */}
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Sektör Tercihi</label>
              <select
                value={sectorPreference}
                onChange={(e) => setSectorPreference(e.target.value as any)}
                className="w-full px-3 py-2 rounded text-xs bg-slate-700/50 text-slate-300 border border-slate-600 focus:border-yellow-400/50 focus:outline-none"
              >
                <option value="all">Tüm Sektörler</option>
                <option value="technology">Teknoloji</option>
                <option value="banking">Bankacılık</option>
                <option value="energy">Enerji</option>
                <option value="industry">Sanayi</option>
                <option value="construction">İnşaat</option>
                <option value="retail">Perakende</option>
              </select>
            </div>
          </div>
        )}

        <button
          onClick={optimize}
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg shadow-green-500/20"
        >
          {loading ? 'Hesaplanıyor...' : 'Portföyü Optimize Et'}
        </button>
      </motion.div>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 rounded-xl border border-slate-700/50 p-6"
        >
          <h4 className="text-lg font-bold text-white mb-4">Optimal Portfolio</h4>

          {/* Weights */}
          <div className="space-y-3 mb-6">
            {Object.entries(result.weights).map(([symbol, weight]) => (
              <div key={symbol} className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{symbol}</span>
                  <span className="text-cyan-400 font-bold">{(weight * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${weight * 100}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
              <div className="text-sm text-slate-400 mb-1">Expected Return</div>
              <div className="text-2xl font-bold text-green-400">
                {(result.expected_return * 100).toFixed(2)}%
              </div>
            </div>
            <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
              <div className="text-sm text-slate-400 mb-1">Volatility</div>
              <div className="text-2xl font-bold text-amber-400">
                {(result.volatility * 100).toFixed(2)}%
              </div>
            </div>
            <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
              <div className="text-sm text-slate-400 mb-1">Sharpe Ratio</div>
              <div className="text-2xl font-bold text-cyan-400">
                {result.sharpe_ratio.toFixed(2)}
              </div>
            </div>
            {result.tax_efficiency && (
              <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
                <div className="text-sm text-slate-400 mb-1">Tax Efficiency</div>
                <div className="text-2xl font-bold text-purple-400">
                  {(result.tax_efficiency * 100).toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Efficient Frontier */}
      {frontier.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 rounded-xl border border-slate-700/50 p-6"
        >
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Efficient Frontier
          </h4>
          
          <div className="relative h-64 bg-slate-800/40 rounded-lg border border-slate-700/30 p-4">
            {/* Simple visualization */}
            <svg className="w-full h-full">
              <defs>
                <linearGradient id="frontierGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              
              {/* Draw frontier curve (simplified) */}
              <path
                d={`M ${frontier.map((p, idx) => 
                  `${(idx / (frontier.length - 1)) * 100}% ${100 - (p.sharpe * 20)}%`
                ).join(' L ')}`}
                fill="none"
                stroke="url(#frontierGradient)"
                strokeWidth="2"
              />
              
              {/* User portfolio point (if exists) */}
              {result && (
                <circle
                  cx="50%"
                  cy={`${100 - (result.sharpe_ratio * 20)}%`}
                  r="8"
                  fill="#10b981"
                  className="animate-pulse"
                />
              )}
            </svg>
          </div>

          <div className="mt-4 text-sm text-slate-400 text-center">
            Risk-Getiri optimal frontier • Kullanıcı portföyü: 💚 nokta
          </div>
        </motion.div>
      )}
    </div>
  );
}

