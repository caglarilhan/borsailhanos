/*
  🚀 BIST AI Smart Trader - AI Lab Dashboard
  RL, Bayesian, ve Strategy metriklerini tek panelde gösteren dashboard.
  AI'nin öğrenme sürecini canlı izleme.
*/

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChartBarIcon, 
  CpuChipIcon, 
  LightBulbIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface RLMetrics {
  episode: number;
  total_reward: number;
  average_reward: number;
  epsilon: number;
  loss: number;
  q_values: number[];
  timestamp: string;
}

interface BayesianProgress {
  iteration: number;
  best_objective: number;
  current_objective: number;
  acquisition_value: number;
  parameters: Record<string, any>;
  timestamp: string;
}

interface StrategyPerformance {
  strategy_name: string;
  total_return: number;
  sharpe_ratio: number;
  max_drawdown: number;
  win_rate: number;
  total_trades: number;
  ranking: number;
}

interface AILabDashboardProps {
  onMetricUpdate?: (metric: string, value: any) => void;
}

const AILabDashboard: React.FC<AILabDashboardProps> = ({ onMetricUpdate }) => {
  // State
  const [activeTab, setActiveTab] = useState<'rl' | 'bayesian' | 'strategy'>('rl');
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // RL Metrics
  const [rlMetrics, setRlMetrics] = useState<RLMetrics[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'training' | 'paused'>('idle');
  
  // Bayesian Progress
  const [bayesianProgress, setBayesianProgress] = useState<BayesianProgress[]>([]);
  const [optimizationStatus, setOptimizationStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  
  // Strategy Performance
  const [strategyPerformances, setStrategyPerformances] = useState<StrategyPerformance[]>([]);
  const [bestStrategy, setBestStrategy] = useState<string>('');
  
  // Alerts
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'success' | 'warning' | 'error';
    message: string;
    timestamp: Date;
  }>>([]);

  // WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket(process.env.NEXT_PUBLIC_REALTIME_URL || 'ws://localhost:8000/ws');
      
      ws.onopen = () => {
        setIsConnected(true);
        console.log('🔗 AI Lab WebSocket connected');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleRealtimeData(data);
        } catch (error) {
          console.error('❌ WebSocket message error:', error);
        }
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        console.log('🔌 AI Lab WebSocket disconnected');
        // Reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
      };
    };
    
    connectWebSocket();
  }, []);

  // Handle realtime data
  const handleRealtimeData = useCallback((data: any) => {
    try {
      setLastUpdate(new Date());
      
      // RL Metrics
      if (data.type === 'rl_metrics') {
        setRlMetrics(prev => [...prev.slice(-99), data.metrics]);
        setCurrentEpisode(data.metrics.episode);
        setTrainingStatus(data.metrics.training_status || 'training');
        
        // Check for alerts
        if (data.metrics.average_reward > 0.8) {
          addAlert('success', `🎉 RL Agent achieved high reward: ${data.metrics.average_reward.toFixed(3)}`);
        }
      }
      
      // Bayesian Progress
      if (data.type === 'bayesian_progress') {
        setBayesianProgress(prev => [...prev.slice(-99), data.progress]);
        setOptimizationStatus(data.progress.status || 'running');
        
        // Check for alerts
        if (data.progress.best_objective > 0.9) {
          addAlert('success', `🎯 Bayesian optimization found excellent parameters: ${data.progress.best_objective.toFixed(3)}`);
        }
      }
      
      // Strategy Performance
      if (data.type === 'strategy_performance') {
        setStrategyPerformances(data.performances);
        setBestStrategy(data.best_strategy);
        
        // Check for alerts
        const bestPerf = data.performances.find((p: StrategyPerformance) => p.strategy_name === data.best_strategy);
        if (bestPerf && bestPerf.total_return > 0.2) {
          addAlert('success', `📈 Strategy ${data.best_strategy} achieved 20%+ return!`);
        }
      }
      
    } catch (error) {
      console.error('❌ Handle realtime data error:', error);
    }
  }, []);

  // Add alert
  const addAlert = (type: 'success' | 'warning' | 'error', message: string) => {
    const alert = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    };
    
    setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
    
    // Auto remove after 10 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== alert.id));
    }, 10000);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'training':
      case 'running':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'completed':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'paused':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'training':
      case 'running':
        return <ClockIcon className="w-4 h-4 animate-spin" />;
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'paused':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🧠 AI Lab Dashboard
        </h2>
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {/* Last Update */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last update: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-600 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('rl')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rl'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <CpuChipIcon className="w-4 h-4 inline mr-1" />
            Reinforcement Learning
          </button>
          <button
            onClick={() => setActiveTab('bayesian')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bayesian'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <LightBulbIcon className="w-4 h-4 inline mr-1" />
            Bayesian Optimization
          </button>
          <button
            onClick={() => setActiveTab('strategy')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'strategy'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <ChartBarIcon className="w-4 h-4 inline mr-1" />
            Strategy Intelligence
          </button>
        </nav>
      </div>

      {/* RL Tab */}
      {activeTab === 'rl' && (
        <div className="space-y-6">
          {/* RL Status */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                RL Training Status
              </h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trainingStatus)}`}>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(trainingStatus)}
                  <span className="capitalize">{trainingStatus}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentEpisode}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Current Episode
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {rlMetrics.length > 0 ? rlMetrics[rlMetrics.length - 1]?.average_reward.toFixed(3) : '0.000'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Average Reward
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {rlMetrics.length > 0 ? rlMetrics[rlMetrics.length - 1]?.epsilon.toFixed(3) : '1.000'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Epsilon
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {rlMetrics.length > 0 ? rlMetrics[rlMetrics.length - 1]?.loss.toFixed(4) : '0.0000'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Loss
                </div>
              </div>
            </div>
          </div>

          {/* RL Learning Curve */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Learning Curve
            </h3>
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              📈 Learning curve chart will be rendered here
            </div>
          </div>
        </div>
      )}

      {/* Bayesian Tab */}
      {activeTab === 'bayesian' && (
        <div className="space-y-6">
          {/* Bayesian Status */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Bayesian Optimization Status
              </h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(optimizationStatus)}`}>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(optimizationStatus)}
                  <span className="capitalize">{optimizationStatus}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {bayesianProgress.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Iterations
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {bayesianProgress.length > 0 ? bayesianProgress[bayesianProgress.length - 1]?.best_objective.toFixed(3) : '0.000'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Best Objective
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {bayesianProgress.length > 0 ? bayesianProgress[bayesianProgress.length - 1]?.acquisition_value.toFixed(3) : '0.000'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Acquisition Value
                </div>
              </div>
            </div>
          </div>

          {/* Optimization Progress */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Optimization Progress
            </h3>
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              📊 Optimization progress chart will be rendered here
            </div>
          </div>
        </div>
      )}

      {/* Strategy Tab */}
      {activeTab === 'strategy' && (
        <div className="space-y-6">
          {/* Strategy Performance */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Strategy Performance
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Best: <span className="font-medium text-green-600">{bestStrategy}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {strategyPerformances.map((strategy, index) => (
                <div key={strategy.strategy_name} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {strategy.strategy_name}
                    </h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      #{strategy.ranking}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Return:</span>
                      <span className={`text-sm font-medium ${strategy.total_return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(strategy.total_return * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Sharpe:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {strategy.sharpe_ratio.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Win Rate:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {(strategy.win_rate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Trades:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {strategy.total_trades}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="fixed top-4 right-4 space-y-2 z-50">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg shadow-lg max-w-sm ${
                alert.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
                alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' :
                'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {alert.type === 'success' ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  ) : alert.type === 'warning' ? (
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {alert.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AILabDashboard;
