'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/config';
import { 
  ShieldCheckIcon,
  ChartBarIcon,
  CalculatorIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface Position {
  symbol: string;
  shares: number;
  allocation_percent: number;
  position_value: number;
  volatility: number;
  confidence: number;
  kelly_fraction: number;
  stop_loss: number;
  take_profit: number;
}

interface PortfolioMetrics {
  total_allocation: number;
  cash_remaining: number;
  portfolio_volatility: number;
  max_drawdown: number;
  sharpe_ratio: number;
  var_95: number;
  expected_return: number;
}

interface VaRData {
  portfolio_value: number;
  confidence_level: number;
  time_horizon_days: number;
  var_amount: number;
  var_percent: number;
  cvar_amount: number;
  cvar_percent: number;
  max_loss: number;
  probability_of_loss: number;
  simulations: number;
}

interface MonteCarloStats {
  mean_final_value: number;
  median_final_value: number;
  mean_return: number;
  volatility: number;
  percentile_5: number;
  percentile_95: number;
  probability_of_loss: number;
  max_gain: number;
  max_loss: number;
}

export default function RiskManagement() {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'var' | 'monte_carlo'>('portfolio');
  const [portfolioValue, setPortfolioValue] = useState<number>(100000);
  const [symbols, setSymbols] = useState<string>('THYAO,ASELS,TUPRS');
  const [riskTolerance, setRiskTolerance] = useState<number>(0.02);
  const [confidenceLevel, setConfidenceLevel] = useState<number>(0.95);
  const [timeHorizon, setTimeHorizon] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [varData, setVarData] = useState<VaRData | null>(null);
  const [monteCarloData, setMonteCarloData] = useState<any>(null);

  const fetchPortfolioRisk = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/risk/portfolio?symbols=${symbols}&portfolio_value=${portfolioValue}&risk_tolerance=${riskTolerance}`);
      const data = await response.json();
      setPortfolioData(data);
    } catch (error) {
      console.error('Portfolio risk fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVaR = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/risk/var?portfolio_value=${portfolioValue}&confidence=${confidenceLevel}&horizon_days=1`);
      const data = await response.json();
      setVarData(data);
    } catch (error) {
      console.error('VaR fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonteCarlo = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/risk/monte_carlo?portfolio_value=${portfolioValue}&horizon_days=${timeHorizon}&simulations=1000`);
      const data = await response.json();
      setMonteCarloData(data);
    } catch (error) {
      console.error('Monte Carlo fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'portfolio') fetchPortfolioRisk();
    else if (activeTab === 'var') fetchVaR();
    else if (activeTab === 'monte_carlo') fetchMonteCarlo();
  }, [activeTab, portfolioValue, symbols, riskTolerance, confidenceLevel, timeHorizon]);

  const getRiskColor = (value: number, type: 'return' | 'risk' | 'volatility') => {
    if (type === 'return') {
      return value > 0 ? 'text-green-600' : 'text-red-600';
    } else if (type === 'risk') {
      return value > 0.1 ? 'text-red-600' : value > 0.05 ? 'text-yellow-600' : 'text-green-600';
    } else {
      return value > 0.25 ? 'text-red-600' : value > 0.15 ? 'text-yellow-600' : 'text-green-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Risk Management</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Portföy Değeri:</label>
            <input
              type="number"
              value={portfolioValue}
              onChange={(e) => setPortfolioValue(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm w-32"
            />
          </div>
          <button
            onClick={() => {
              if (activeTab === 'portfolio') fetchPortfolioRisk();
              else if (activeTab === 'var') fetchVaR();
              else if (activeTab === 'monte_carlo') fetchMonteCarlo();
            }}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Hesaplanıyor...' : 'Yenile'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'portfolio', name: 'Portföy Risk Analizi', icon: ShieldCheckIcon },
            { id: 'var', name: 'Value at Risk (VaR)', icon: ExclamationTriangleIcon },
            { id: 'monte_carlo', name: 'Monte Carlo Simülasyonu', icon: CalculatorIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Portfolio Risk Tab */}
      {activeTab === 'portfolio' && portfolioData && (
        <div className="space-y-6">
          {/* Portfolio Input */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Portföy Parametreleri</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semboller</label>
                <input
                  type="text"
                  value={symbols}
                  onChange={(e) => setSymbols(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="THYAO,ASELS,TUPRS"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Toleransı</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="0.1"
                  value={riskTolerance}
                  onChange={(e) => setRiskTolerance(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Portföy Değeri (₺)</label>
                <input
                  type="number"
                  value={portfolioValue}
                  onChange={(e) => setPortfolioValue(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          {/* Portfolio Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Portföy Metrikleri</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{portfolioData.metrics.total_allocation}%</div>
                <div className="text-sm text-gray-600">Toplam Ayrım</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">₺{portfolioData.metrics.cash_remaining.toLocaleString('tr-TR')}</div>
                <div className="text-sm text-gray-600">Kalan Nakit</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getRiskColor(portfolioData.metrics.portfolio_volatility/100, 'volatility')}`}>
                  {portfolioData.metrics.portfolio_volatility}%
                </div>
                <div className="text-sm text-gray-600">Portföy Volatilitesi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{portfolioData.metrics.sharpe_ratio}</div>
                <div className="text-sm text-gray-600">Sharpe Oranı</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className={`text-xl font-bold ${getRiskColor(portfolioData.metrics.max_drawdown/100, 'risk')}`}>
                  {portfolioData.metrics.max_drawdown}%
                </div>
                <div className="text-sm text-gray-600">Maksimum Düşüş</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${getRiskColor(portfolioData.metrics.expected_return/100, 'return')}`}>
                  {portfolioData.metrics.expected_return}%
                </div>
                <div className="text-sm text-gray-600">Beklenen Getiri</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-600">₺{portfolioData.metrics.var_95.toLocaleString('tr-TR')}</div>
                <div className="text-sm text-gray-600">VaR 95%</div>
              </div>
            </div>
          </div>

          {/* Positions */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Pozisyonlar</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sembol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hisse</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ayrım %</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pozisyon Değeri</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volatilite</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Güven</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stop Loss</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Take Profit</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.values(portfolioData.positions).map((position: Position) => (
                    <tr key={position.symbol}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{position.symbol}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{position.shares}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{position.allocation_percent}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₺{position.position_value.toLocaleString('tr-TR')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{position.volatility}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(position.confidence * 100).toFixed(1)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">₺{position.stop_loss.toLocaleString('tr-TR')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">₺{position.take_profit.toLocaleString('tr-TR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VaR Tab */}
      {activeTab === 'var' && varData && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Value at Risk (VaR) Analizi</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">₺{varData.var_amount.toLocaleString('tr-TR')}</div>
                <div className="text-sm text-gray-600">VaR Miktarı</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{varData.var_percent}%</div>
                <div className="text-sm text-gray-600">VaR Yüzdesi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">₺{varData.cvar_amount.toLocaleString('tr-TR')}</div>
                <div className="text-sm text-gray-600">CVaR Miktarı</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{varData.cvar_percent}%</div>
                <div className="text-sm text-gray-600">CVaR Yüzdesi</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-xl font-bold text-red-600">₺{varData.max_loss.toLocaleString('tr-TR')}</div>
                <div className="text-sm text-gray-600">Maksimum Kayıp</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-600">{varData.probability_of_loss}%</div>
                <div className="text-sm text-gray-600">Kayıp Olasılığı</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{varData.simulations.toLocaleString('tr-TR')}</div>
                <div className="text-sm text-gray-600">Simülasyon Sayısı</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monte Carlo Tab */}
      {activeTab === 'monte_carlo' && monteCarloData && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monte Carlo Simülasyon Sonuçları</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">₺{monteCarloData.statistics.mean_final_value.toLocaleString('tr-TR')}</div>
                <div className="text-sm text-gray-600">Ortalama Değer</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">₺{monteCarloData.statistics.median_final_value.toLocaleString('tr-TR')}</div>
                <div className="text-sm text-gray-600">Medyan Değer</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getRiskColor(monteCarloData.statistics.mean_return/100, 'return')}`}>
                  {monteCarloData.statistics.mean_return}%
                </div>
                <div className="text-sm text-gray-600">Ortalama Getiri</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{monteCarloData.statistics.volatility}%</div>
                <div className="text-sm text-gray-600">Volatilite</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-xl font-bold text-red-600">₺{monteCarloData.statistics.percentile_5.toLocaleString('tr-TR')}</div>
                <div className="text-sm text-gray-600">%5 Persentil</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">₺{monteCarloData.statistics.percentile_95.toLocaleString('tr-TR')}</div>
                <div className="text-sm text-gray-600">%95 Persentil</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-600">{monteCarloData.statistics.probability_of_loss}%</div>
                <div className="text-sm text-gray-600">Kayıp Olasılığı</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{monteCarloData.simulations.toLocaleString('tr-TR')}</div>
                <div className="text-sm text-gray-600">Simülasyon</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
