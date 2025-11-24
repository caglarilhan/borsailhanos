'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  ChartBarIcon,
  CalculatorIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { buildPolylinePoints } from '@/lib/svgChart';

interface OptionChain {
  symbol: string;
  underlying_price: number;
  expiration_date: string;
  time_to_expiry: number;
  calls: OptionData[];
  puts: OptionData[];
}

interface OptionData {
  strike: number;
  price: number;
  intrinsic_value: number;
  time_value: number;
  moneyness: string;
  greeks: Greeks;
}

interface Greeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

interface StrategyAnalysis {
  symbol: string;
  strategy_type: string;
  analysis: any;
  greeks: Greeks;
  profit_loss: Array<{price: number, pnl: number}>;
  breakeven_points: number[];
  max_profit: number;
  max_loss: number;
}

interface OptionsAnalysisProps {
  isLoading?: boolean;
}

export default function OptionsAnalysis({ isLoading }: OptionsAnalysisProps) {
  const [optionChain, setOptionChain] = useState<OptionChain | null>(null);
  const [strategyAnalysis, setStrategyAnalysis] = useState<StrategyAnalysis | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('THYAO');
  const [selectedExpiration, setSelectedExpiration] = useState<string>('');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('long_call');
  const [strategyParams, setStrategyParams] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'chain' | 'strategy' | 'volatility'>('chain');
  const [showStrategyModal, setShowStrategyModal] = useState(false);

  const symbols = ['THYAO', 'ASELS', 'TUPRS', 'SISE', 'EREGL'];
  const strategies = [
    { value: 'long_call', label: 'Long Call' },
    { value: 'long_put', label: 'Long Put' },
    { value: 'covered_call', label: 'Covered Call' },
    { value: 'protective_put', label: 'Protective Put' },
    { value: 'straddle', label: 'Straddle' },
    { value: 'strangle', label: 'Strangle' },
    { value: 'iron_condor', label: 'Iron Condor' }
  ];

  useEffect(() => {
    loadOptionChain();
  }, [selectedSymbol, selectedExpiration]);

  const loadOptionChain = async () => {
    try {
      const expiration = selectedExpiration || '';
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:18085';
      const response = await fetch(`${base}/api/options/chain/${selectedSymbol}${expiration ? ('?expiration=' + expiration) : ''}`);
      const data = await response.json();
      setOptionChain(data);
    } catch (error) {
      console.error('Error loading option chain:', error);
    }
  };

  const analyzeStrategy = async () => {
    try {
      const sbase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:18085';
      const response = await fetch(`${sbase}/api/options/strategy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          symbol: selectedSymbol,
          strategy_type: selectedStrategy,
          params: strategyParams
        })
      });
      
      const data = await response.json();
      setStrategyAnalysis(data);
      setShowStrategyModal(true);
    } catch (error) {
      console.error('Error analyzing strategy:', error);
    }
  };

  const getMoneynessColor = (moneyness: string) => {
    switch (moneyness) {
      case 'ITM': return 'bg-green-100 text-green-800';
      case 'OTM': return 'bg-red-100 text-red-800';
      case 'ATM': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatGreek = (value: number, type: string) => {
  const pnlPath = useMemo(() => {
    if (!strategyAnalysis || !strategyAnalysis.profit_loss?.length) return '';
    return buildPolylinePoints(strategyAnalysis.profit_loss, 'pnl', { width: 600, height: 240, padding: 30 });
  }, [strategyAnalysis]);

    if (type === 'gamma') {
      return value.toFixed(6);
    }
    return value.toFixed(4);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Opsiyon Analizi</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-300 rounded"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CalculatorIcon className="h-6 w-6 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900">Opsiyon Analizi</h2>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
              Greeks
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-1"
            >
              {symbols.map(symbol => (
                <option key={symbol} value={symbol}>{symbol}</option>
              ))}
            </select>
            <button
              onClick={() => setShowStrategyModal(true)}
              className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
            >
              Strateji Analizi
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'chain', name: 'Opsiyon Zinciri', icon: ChartBarIcon },
                { id: 'strategy', name: 'Strateji Analizi', icon: CalculatorIcon },
                { id: 'volatility', name: 'Volatilite Yüzeyi', icon: ExclamationTriangleIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Option Chain Tab */}
        {activeTab === 'chain' && optionChain && (
          <div className="space-y-6">
            {/* Underlying Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{optionChain.symbol}</h3>
                  <p className="text-sm text-gray-600">
                    Vade: {optionChain.expiration_date} ({optionChain.time_to_expiry.toFixed(3)} yıl)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    ₺{optionChain.underlying_price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Spot Fiyat</p>
                </div>
              </div>
            </div>

            {/* Calls and Puts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calls */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <ArrowTrendingUpIcon className="h-5 w-5 text-green-500 mr-2" />
                  Call Opsiyonları
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {optionChain.calls.map((call, index) => (
                    <div key={index} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900">₺{call.strike.toFixed(2)}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMoneynessColor(call.moneyness)}`}>
                              {call.moneyness}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Prim: ₺{call.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ₺{call.price.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Δ {formatGreek(call.greeks.delta, 'delta')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Puts */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <ArrowTrendingDownIcon className="h-5 w-5 text-red-500 mr-2" />
                  Put Opsiyonları
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {optionChain.puts.map((put, index) => (
                    <div key={index} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900">₺{put.strike.toFixed(2)}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMoneynessColor(put.moneyness)}`}>
                              {put.moneyness}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Prim: ₺{put.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ₺{put.price.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Δ {formatGreek(put.greeks.delta, 'delta')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Strategy Analysis Tab */}
        {activeTab === 'strategy' && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Strateji Seçimi</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sembol
                  </label>
                  <select
                    value={selectedSymbol}
                    onChange={(e) => setSelectedSymbol(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    {symbols.map(symbol => (
                      <option key={symbol} value={symbol}>{symbol}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Strateji Türü
                  </label>
                  <select
                    value={selectedStrategy}
                    onChange={(e) => setSelectedStrategy(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    {strategies.map(strategy => (
                      <option key={strategy.value} value={strategy.value}>
                        {strategy.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <button
                  onClick={analyzeStrategy}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Stratejiyi Analiz Et
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Volatility Surface Tab */}
        {activeTab === 'volatility' && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Volatilite Yüzeyi</h3>
              <p className="text-gray-600">
                Volatilite yüzeyi analizi burada gösterilecek. Farklı strike fiyatları ve vade tarihleri için 
                volatilite değerleri görselleştirilecek.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Strategy Analysis Modal */}
      {showStrategyModal && strategyAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {strategyAnalysis.strategy_type.replace('_', ' ').toUpperCase()} Analizi
              </h3>
              <button
                onClick={() => setShowStrategyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Analysis Summary */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Analiz Özeti</h4>
                <div className="space-y-3">
                  {Object.entries(strategyAnalysis.analysis).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-sm text-gray-600 capitalize">
                        {key.replace('_', ' ')}:
                      </span>
                      <span className="text-sm font-medium">
                        {typeof value === 'number' ? `₺${value.toFixed(2)}` : value}
                      </span>
                    </div>
                  ))}
                </div>
                
                <h4 className="text-md font-semibold text-gray-900 mb-3 mt-6">Greeks</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Delta:</span>
                    <span className="text-sm font-medium">{formatGreek(strategyAnalysis.greeks.delta, 'delta')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Gamma:</span>
                    <span className="text-sm font-medium">{formatGreek(strategyAnalysis.greeks.gamma, 'gamma')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Theta:</span>
                    <span className="text-sm font-medium">{formatGreek(strategyAnalysis.greeks.theta, 'theta')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Vega:</span>
                    <span className="text-sm font-medium">{formatGreek(strategyAnalysis.greeks.vega, 'vega')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Rho:</span>
                    <span className="text-sm font-medium">{formatGreek(strategyAnalysis.greeks.rho, 'rho')}</span>
                  </div>
                </div>
              </div>
              
              {/* Profit/Loss Chart */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Kar/Zarar Grafiği</h4>
                <div className="h-64 bg-slate-50 rounded-lg p-3">
                  {pnlPath ? (
                    <svg width="100%" height="100%" viewBox="0 0 600 240" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <polygon
                        points={`30,210 ${pnlPath} 570,210`}
                        fill="url(#pnlFill)"
                      />
                      <polyline
                        points={pnlPath}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500">
                      P&L verisi yok
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}