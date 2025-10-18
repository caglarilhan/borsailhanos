'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/config';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface SignalStatistic {
  symbol: string;
  total_signals: number;
  correct_signals: number;
  accuracy_rate: number;
  last_updated: string;
}

interface PendingSignal {
  id: number;
  symbol: string;
  signal: string;
  confidence: number;
  price: number;
  prediction_date: string;
  target_date: string;
}

export default function SignalTrackingPanel() {
  const [statistics, setStatistics] = useState<SignalStatistic[]>([]);
  const [pendingSignals, setPendingSignals] = useState<PendingSignal[]>([]);
  const [report, setReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'pending' | 'report'>('stats');

  useEffect(() => {
    loadStatistics();
    loadPendingSignals();
    loadReport();
  }, []);

  const loadStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tracking/statistics`);
      const data = await response.json();
      
      if (data.statistics) {
        const statsArray = Object.entries(data.statistics).map(([symbol, stats]: [string, any]) => ({
          symbol,
          ...stats
        }));
        setStatistics(statsArray);
      }
    } catch (error) {
      console.error('İstatistik yükleme hatası:', error);
    }
  };

  const loadPendingSignals = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tracking/pending`);
      const data = await response.json();
      
      if (data.pending_signals) {
        setPendingSignals(data.pending_signals);
      }
    } catch (error) {
      console.error('Bekleyen sinyaller yükleme hatası:', error);
    }
  };

  const loadReport = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tracking/report`);
      const data = await response.json();
      
      if (data.report) {
        setReport(data.report);
      }
    } catch (error) {
      console.error('Rapor yükleme hatası:', error);
    }
  };

  const updateSignalResult = async (signalId: number, actualPrice: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tracking/update?signal_id=${signalId}&actual_price=${actualPrice}`);
      const data = await response.json();
      
      if (data.success) {
        // Verileri yenile
        loadStatistics();
        loadPendingSignals();
        loadReport();
        alert('Sinyal sonucu güncellendi!');
      } else {
        alert('Güncelleme hatası: ' + data.error);
      }
    } catch (error) {
      console.error('Sonuç güncelleme hatası:', error);
      alert('Sonuç güncelleme hatası!');
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600 bg-green-100';
    if (accuracy >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'text-green-600 bg-green-100';
      case 'SELL': return 'text-red-600 bg-red-100';
      case 'HOLD': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Sinyal Takip Sistemi</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-full"></div>
          <div className="h-8 bg-gray-200 rounded w-full"></div>
          <div className="h-8 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Sinyal Takip Sistemi</h2>
      
      {/* Tab Navigation */}
      <div className="mb-6 flex space-x-4 border-b border-gray-200">
        {[
          { id: 'stats', name: 'İstatistikler', icon: ChartBarIcon },
          { id: 'pending', name: 'Bekleyen Sinyaller', icon: ClockIcon },
          { id: 'report', name: 'Detaylı Rapor', icon: ArrowTrendingUpIcon }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium flex items-center space-x-2 ${
              activeTab === tab.id 
                ? 'border-b-2 border-blue-600 text-blue-700' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Sembol Bazında Performans</h3>
          {statistics.length === 0 ? (
            <p className="text-gray-500">Henüz istatistik bulunmamaktadır.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statistics.map((stat, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{stat.symbol}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccuracyColor(stat.accuracy_rate)}`}>
                      {stat.accuracy_rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Doğru:</span>
                      <span className="font-medium text-green-600">{stat.correct_signals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Toplam:</span>
                      <span className="font-medium">{stat.total_signals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Son Güncelleme:</span>
                      <span className="text-xs">{new Date(stat.last_updated).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Sonuç Bekleyen Sinyaller</h3>
          {pendingSignals.length === 0 ? (
            <p className="text-gray-500">Sonuç bekleyen sinyal bulunmamaktadır.</p>
          ) : (
            <div className="space-y-3">
              {pendingSignals.map((signal) => (
                <div key={signal.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-gray-900">{signal.symbol}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSignalColor(signal.signal)}`}>
                        {signal.signal}
                      </span>
                      <span className="text-sm text-gray-600">{(signal.confidence * 100).toFixed(0)}% güven</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      Hedef: {new Date(signal.target_date).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span>Fiyat: ₺{signal.price.toFixed(2)}</span>
                      <span className="ml-4">Tahmin: {new Date(signal.prediction_date).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        placeholder="Güncel fiyat"
                        className="px-2 py-1 border rounded text-sm w-24"
                        id={`price-${signal.id}`}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById(`price-${signal.id}`) as HTMLInputElement;
                          const price = parseFloat(input.value);
                          if (price > 0) {
                            updateSignalResult(signal.id, price);
                          } else {
                            alert('Geçerli bir fiyat girin!');
                          }
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Güncelle
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'report' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Detaylı Performans Raporu</h3>
          {report ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">{report}</pre>
            </div>
          ) : (
            <p className="text-gray-500">Rapor bulunamadı.</p>
          )}
        </div>
      )}
    </div>
  );
}
