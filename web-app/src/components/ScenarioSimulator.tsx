/**
 * 🚀 Borsailhanos AI Smart Trader - Scenario Simulator UI
 * ==============================================
 * 
 * Kullanıcının değişkenleri girip senaryoyu görselleştirmesi için React komponenti.
 * Predictive Twin Engine ile entegre çalışır.
 * 
 * Özellikler:
 * - Senaryo seçimi
 * - Parametre ayarlama
 * - Görsel simülasyon
 * - Risk analizi
 * - Portfolio simülasyonu
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  PlayIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

interface Scenario {
  name: string;
  description: string;
  parameters: {
    trend_multiplier: number;
    volatility_multiplier: number;
    volume_multiplier: number;
  };
  probability: number;
  impact: 'positive' | 'negative' | 'neutral';
}

interface SimulationResult {
  symbol: string;
  scenario: string;
  current_price: number;
  predicted_price: number;
  price_change: number;
  price_change_pct: number;
  confidence_interval: [number, number];
  probability: number;
  risk_score: number;
  expected_return: number;
  volatility: number;
  simulation_data: Array<{
    run: number;
    final_price: number;
    price_change_pct: number;
    max_price: number;
    min_price: number;
    volatility: number;
  }>;
  timestamp: string;
}

interface ScenarioSimulatorProps {
  symbol: string;
  currentPrice: number;
  onSimulationComplete?: (result: SimulationResult) => void;
}

const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  symbol,
  currentPrice,
  onSimulationComplete
}) => {
  // State
  const [selectedScenario, setSelectedScenario] = useState<string>('bull_market');
  const [customParameters, setCustomParameters] = useState({
    trend_multiplier: 1.0,
    volatility_multiplier: 1.0,
    volume_multiplier: 1.0,
    forecast_days: 30,
    monte_carlo_runs: 1000
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Senaryo tanımları
  const scenarios: Record<string, Scenario> = {
    bull_market: {
      name: 'Bull Market',
      description: 'Güçlü yükseliş trendi',
      parameters: {
        trend_multiplier: 1.5,
        volatility_multiplier: 0.8,
        volume_multiplier: 1.3
      },
      probability: 0.3,
      impact: 'positive'
    },
    bear_market: {
      name: 'Bear Market',
      description: 'Düşüş trendi',
      parameters: {
        trend_multiplier: -1.2,
        volatility_multiplier: 1.5,
        volume_multiplier: 1.2
      },
      probability: 0.2,
      impact: 'negative'
    },
    sideways_market: {
      name: 'Sideways Market',
      description: 'Yatay hareket',
      parameters: {
        trend_multiplier: 0.1,
        volatility_multiplier: 0.6,
        volume_multiplier: 0.8
      },
      probability: 0.3,
      impact: 'neutral'
    },
    high_volatility: {
      name: 'High Volatility',
      description: 'Yüksek volatilite',
      parameters: {
        trend_multiplier: 0.0,
        volatility_multiplier: 2.0,
        volume_multiplier: 1.5
      },
      probability: 0.15,
      impact: 'neutral'
    },
    low_volatility: {
      name: 'Low Volatility',
      description: 'Düşük volatilite',
      parameters: {
        trend_multiplier: 0.2,
        volatility_multiplier: 0.4,
        volume_multiplier: 0.7
      },
      probability: 0.05,
      impact: 'neutral'
    }
  };

  // Senaryo simülasyonu çalıştır
  const runSimulation = useCallback(async () => {
    try {
      setIsSimulating(true);
      setError(null);

      const response = await fetch('/api/ai/simulate-scenario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol,
          scenario_name: selectedScenario,
          current_price: currentPrice,
          custom_parameters: customParameters
        })
      });

      if (!response.ok) {
        throw new Error(`Simulation failed: ${response.statusText}`);
      }

      const result: SimulationResult = await response.json();
      setSimulationResult(result);
      
      if (onSimulationComplete) {
        onSimulationComplete(result);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  }, [symbol, selectedScenario, currentPrice, customParameters, onSimulationComplete]);

  // Senaryo değiştiğinde parametreleri güncelle
  useEffect(() => {
    const scenario = scenarios[selectedScenario];
    if (scenario) {
      setCustomParameters(prev => ({
        ...prev,
        ...scenario.parameters
      }));
    }
  }, [selectedScenario]);

  // Impact icon'u getir
  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive':
        return <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />;
      case 'negative':
        return <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />;
      default:
        return <MinusIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  // Risk seviyesi rengi
  const getRiskColor = (riskScore: number) => {
    if (riskScore < 30) return 'text-green-600';
    if (riskScore < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          🎯 Senaryo Simülatörü
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {symbol} - ₺{currentPrice.toFixed(2)}
        </div>
      </div>

      {/* Senaryo Seçimi */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Senaryo Seçin
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(scenarios).map(([key, scenario]) => (
            <button
              key={key}
              onClick={() => setSelectedScenario(key)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedScenario === key
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {scenario.name}
                </span>
                {getImpactIcon(scenario.impact)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {scenario.description}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                Olasılık: %{(scenario.probability * 100).toFixed(0)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Parametre Ayarları */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Parametre Ayarları
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trend Çarpanı
            </label>
            <input
              type="number"
              step="0.1"
              value={customParameters.trend_multiplier}
              onChange={(e) => setCustomParameters(prev => ({
                ...prev,
                trend_multiplier: parseFloat(e.target.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Volatilite Çarpanı
            </label>
            <input
              type="number"
              step="0.1"
              value={customParameters.volatility_multiplier}
              onChange={(e) => setCustomParameters(prev => ({
                ...prev,
                volatility_multiplier: parseFloat(e.target.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hacim Çarpanı
            </label>
            <input
              type="number"
              step="0.1"
              value={customParameters.volume_multiplier}
              onChange={(e) => setCustomParameters(prev => ({
                ...prev,
                volume_multiplier: parseFloat(e.target.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tahmin Günü
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={customParameters.forecast_days}
              onChange={(e) => setCustomParameters(prev => ({
                ...prev,
                forecast_days: parseInt(e.target.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Simülasyon Butonu */}
      <div className="mb-6">
        <button
          onClick={runSimulation}
          disabled={isSimulating}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          {isSimulating ? (
            <>
              <ClockIcon className="w-5 h-5 mr-2 animate-spin" />
              Simülasyon Çalışıyor...
            </>
          ) : (
            <>
              <PlayIcon className="w-5 h-5 mr-2" />
              Simülasyonu Başlat
            </>
          )}
        </button>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-400">{error}</span>
          </div>
        </div>
      )}

      {/* Simülasyon Sonuçları */}
      {simulationResult && (
        <div className="space-y-6">
          {/* Özet */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Simülasyon Sonuçları
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₺{simulationResult.predicted_price.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Tahmin Edilen Fiyat
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  simulationResult.price_change_pct >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {simulationResult.price_change_pct >= 0 ? '+' : ''}{simulationResult.price_change_pct.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Fiyat Değişimi
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getRiskColor(simulationResult.risk_score)}`}>
                  {simulationResult.risk_score.toFixed(0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Risk Skoru
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {simulationResult.expected_return.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Beklenen Getiri
                </div>
              </div>
            </div>
          </div>

          {/* Güven Aralığı */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
              📊 Güven Aralığı (%95)
            </h5>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Alt Sınır: ₺{simulationResult.confidence_interval[0].toFixed(2)}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Üst Sınır: ₺{simulationResult.confidence_interval[1].toFixed(2)}
              </span>
            </div>
          </div>

          {/* Senaryo Bilgileri */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
              🎯 Senaryo Detayları
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Senaryo:</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  {scenarios[simulationResult.scenario]?.name}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Olasılık:</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  %{(simulationResult.probability * 100).toFixed(0)}
                </div>
              </div>
            </div>
          </div>

          {/* Simülasyon İstatistikleri */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
              📈 Simülasyon İstatistikleri
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Toplam Simülasyon:</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  {simulationResult.simulation_data.length} adet
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Volatilite:</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  {simulationResult.volatility.toFixed(1)}%
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Simülasyon Tarihi:</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  {new Date(simulationResult.timestamp).toLocaleString('tr-TR')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioSimulator;