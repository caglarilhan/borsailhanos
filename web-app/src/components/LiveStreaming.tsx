'use client';

import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '@/lib/config';
import { 
  PlayIcon,
  PauseIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  ChartBarIcon,
  SignalIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface PriceData {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  timestamp: string;
}

interface TickData {
  symbol: string;
  price: number;
  volume: number;
  side: 'BUY' | 'SELL';
  timestamp: string;
}

interface SignalData {
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  price: number;
  reason: string;
  timestamp: string;
}

export default function LiveStreaming() {
  const [symbols, setSymbols] = useState<string>('THYAO,ASELS,TUPRS');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamType, setStreamType] = useState<'prices' | 'ticks' | 'signals'>('prices');
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [ticks, setTicks] = useState<TickData[]>([]);
  const [signals, setSignals] = useState<SignalData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startStreaming = () => {
    if (isStreaming) return;
    
    setIsStreaming(true);
    fetchStreamData();
    
    // Set up interval for continuous updates
    intervalRef.current = setInterval(fetchStreamData, 2000); // Update every 2 seconds
  };

  const stopStreaming = () => {
    setIsStreaming(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const fetchStreamData = async () => {
    try {
      const symbolList = symbols.split(',').map(s => s.trim()).join(',');
      
      if (streamType === 'prices') {
        const response = await fetch(`${API_BASE_URL}/api/stream/prices?symbols=${symbolList}`);
        const data = await response.json();
        if (data.prices) {
          setPrices(data.prices);
          setLastUpdate(data.timestamp);
        }
      } else if (streamType === 'ticks') {
        const response = await fetch(`${API_BASE_URL}/api/stream/ticks?symbol=${symbolList.split(',')[0]}&limit=20`);
        const data = await response.json();
        if (data.ticks) {
          setTicks(data.ticks);
          setLastUpdate(data.timestamp);
        }
      } else if (streamType === 'signals') {
        const response = await fetch(`${API_BASE_URL}/api/stream/signals?symbols=${symbolList}`);
        const data = await response.json();
        if (data.signals) {
          setSignals(prev => [...data.signals, ...prev].slice(0, 50)); // Keep last 50 signals
          setLastUpdate(data.timestamp);
        }
      }
    } catch (error) {
      console.error('Stream fetch error:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />;
    if (change < 0) return <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />;
    return <MinusIcon className="h-4 w-4 text-gray-600" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getSignalIcon = (signal: string) => {
    if (signal === 'BUY') return <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />;
    if (signal === 'SELL') return <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />;
    return <MinusIcon className="h-4 w-4 text-gray-600" />;
  };

  const getSignalColor = (signal: string) => {
    if (signal === 'BUY') return 'text-green-700 bg-green-50 border-green-200';
    if (signal === 'SELL') return 'text-red-700 bg-red-50 border-red-200';
    return 'text-gray-700 bg-gray-50 border-gray-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Live Streaming</h2>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Semboller (örn: THYAO,ASELS,TUPRS)"
            value={symbols}
            onChange={(e) => setSymbols(e.target.value.toUpperCase())}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            disabled={isStreaming}
          />
          <select
            value={streamType}
            onChange={(e) => setStreamType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            disabled={isStreaming}
          >
            <option value="prices">Fiyat Akışı</option>
            <option value="ticks">Tick Verisi</option>
            <option value="signals">Sinyal Akışı</option>
          </select>
          <button
            onClick={isStreaming ? stopStreaming : startStreaming}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              isStreaming 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isStreaming ? (
              <>
                <PauseIcon className="h-4 w-4 inline mr-2" />
                Durdur
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 inline mr-2" />
                Başlat
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${isStreaming ? 'text-green-600' : 'text-gray-500'}`}>
              <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-medium">
                {isStreaming ? 'Canlı Akış Aktif' : 'Akış Durduruldu'}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Tip: {streamType === 'prices' ? 'Fiyat Akışı' : streamType === 'ticks' ? 'Tick Verisi' : 'Sinyal Akışı'}
            </div>
          </div>
          {lastUpdate && (
            <div className="text-sm text-gray-500">
              Son güncelleme: {new Date(lastUpdate).toLocaleTimeString('tr-TR')}
            </div>
          )}
        </div>
      </div>

      {/* Price Stream */}
      {streamType === 'prices' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Canlı Fiyat Akışı</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(prices).map((price) => (
              <div key={price.symbol} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{price.symbol}</h4>
                  {getChangeIcon(price.change)}
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-gray-900">
                    ₺{price.price.toFixed(2)}
                  </div>
                  <div className={`text-sm font-medium ${getChangeColor(price.change)}`}>
                    {price.change > 0 ? '+' : ''}{price.change.toFixed(2)} ({price.change_percent > 0 ? '+' : ''}{price.change_percent.toFixed(2)}%)
                  </div>
                  <div className="text-xs text-gray-500">
                    Hacim: {price.volume.toLocaleString('tr-TR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tick Stream */}
      {streamType === 'ticks' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Tick Verisi</h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zaman
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fiyat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hacim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Yön
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ticks.map((tick, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(tick.timestamp).toLocaleTimeString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₺{tick.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tick.volume.toLocaleString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tick.side === 'BUY' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {tick.side}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Signal Stream */}
      {streamType === 'signals' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Sinyal Akışı</h3>
          <div className="space-y-3">
            {signals.map((signal, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{signal.symbol}</h4>
                      {getSignalIcon(signal.signal)}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSignalColor(signal.signal)}`}>
                        {signal.signal}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{signal.reason}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Fiyat: ₺{signal.price.toFixed(2)}</span>
                      <span>Güven: {(signal.confidence * 100).toFixed(1)}%</span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        {new Date(signal.timestamp).toLocaleTimeString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isStreaming && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Akış Başlatılmadı</h3>
          <p className="text-gray-600">Canlı veri akışını görmek için "Başlat" butonuna tıklayın.</p>
        </div>
      )}
    </div>
  );
}
