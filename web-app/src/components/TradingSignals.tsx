import React, { useState, useEffect } from 'react';
import { useTop30Analysis } from '@/hooks/queries';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  BellIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

interface TradingSignal {
  symbol: string;
  signal: string;
  confidence: number;
  price: number;
  change: number;
  timestamp: string;
  xaiExplanation?: string;
  shapValues?: Record<string, number>;
  confluenceScore?: number;
  marketRegime?: string;
  sentimentScore?: number;
  expectedReturn?: number;
  stopLoss?: number;
  takeProfit?: number;
}

interface TradingSignalsProps {
  signals?: TradingSignal[];
  isLoading?: boolean;
}

const TradingSignals: React.FC<TradingSignalsProps> = (props) => {
  const { signals = [], isLoading = false } = props;
  const [isLoadingState, setIsLoading] = useState<boolean>(isLoading);
  const [allSignals, setAllSignals] = useState<TradingSignal[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    reconnecting: false,
    error: null as string | null
  });

  // WebSocket bağlantısı
  useEffect(() => {
    let attempts = 0;
    let ws: WebSocket | null = null;
    const connectWebSocket = () => {
      const url = process.env.NEXT_PUBLIC_REALTIME_URL || 'ws://localhost:8081';
      ws = new WebSocket(url);
      ws.onopen = () => {
        attempts = 0;
        setIsConnected(true);
        setConnectionStatus({ connected: true, reconnecting: false, error: null });
      };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'signals') {
            setAllSignals(data.signals);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('❌ WebSocket message error:', error);
        }
      };
      ws.onclose = () => {
        setIsConnected(false);
        setConnectionStatus({ connected: false, reconnecting: true, error: null });
        attempts += 1;
        const delay = Math.min(30000, 1000 * Math.pow(2, attempts));
        setTimeout(connectWebSocket, delay);
      };
      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionStatus({ connected: false, reconnecting: true, error: 'Connection failed' });
        try { ws?.close(); } catch {}
      };
    };
    connectWebSocket();
    return () => { try { ws?.close(); } catch {} };
  }, []);

  // react-query: Top30Analysis'tan fallback sinyaller türet
  const top30Q = useTop30Analysis();
  useEffect(() => {
    setIsLoading(Boolean(top30Q.isLoading || top30Q.isFetching));
    const d: any = top30Q.data;
    if (!isConnected && d && Array.isArray(d.top30)) {
      const mapped: TradingSignal[] = d.top30.slice(0, 20).map((s: any) => ({
        symbol: s.symbol,
        signal: s.signal,
        confidence: (s.confidence || 0) / 100,
        price: Number(s.currentPrice || 0),
        change: Number(s.predictedChange || 0),
        timestamp: new Date().toISOString(),
        xaiExplanation: s.aiSummaryText || 'AI özet verisi',
        confluenceScore: (s.accuracy || 0) / 100,
        sentimentScore: (s.aiSummary?.sentiment_score || 0) / 100,
        expectedReturn: Number(s.potential || s.predictedChange || 0),
      }));
      setAllSignals(mapped);
    }
  }, [top30Q.data, top30Q.isLoading, top30Q.isFetching, isConnected]);

  useEffect(() => {
    // WebSocket yoksa query auto-refetch devrede; ekstra interval gerekmez
  }, [isConnected]);

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />;
      case 'SELL':
        return <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />;
      default:
        return <MinusIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return 'text-green-500 bg-green-50 border-green-200';
      case 'SELL':
        return 'text-red-500 bg-red-50 border-red-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleAddToWatchlist = async (symbol: string) => {
    try {
      const response = await fetch('http://localhost:8002/api/watchlists/1/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: symbol,
          name: symbol,
          notes: `AI Signal - ${new Date().toLocaleDateString()}`
        })
      });
      
      if (response.ok) {
        console.log(`✅ ${symbol} added to watchlist`);
        // Show success notification
      } else {
        console.error(`❌ Failed to add ${symbol} to watchlist`);
      }
    } catch (error) {
      console.error(`❌ Error adding ${symbol} to watchlist:`, error);
    }
  };

  const handleSetAlert = async (symbol: string, price: number) => {
    try {
      const response = await fetch('http://localhost:8003/api/notifications/price-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: symbol,
          price: price,
          change: 0,
          user_id: 'default_user'
        })
      });
      
      if (response.ok) {
        console.log(`✅ Price alert set for ${symbol} at ${price}`);
        // Show success notification
      } else {
        console.error(`❌ Failed to set alert for ${symbol}`);
      }
    } catch (error) {
      console.error(`❌ Error setting alert for ${symbol}:`, error);
    }
  };

  const handleShareSignal = (signal: TradingSignal) => {
    const shareText = `${signal.symbol}: ${signal.signal} sinyali - Güven: ${(signal.confidence * 100).toFixed(1)}% - Fiyat: ₺${signal.price.toFixed(2)}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'BIST AI Trading Signal',
        text: shareText,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      console.log('📋 Signal copied to clipboard');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ChartBarIcon className="w-6 h-6 text-blue-600" />
          AI Trading Sinyalleri
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2 ml-4">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Canlı Bağlantı' : 'Bağlantı Yok'}
            </span>
            {connectionStatus.reconnecting && (
              <span className="text-sm text-yellow-600">Yeniden bağlanıyor...</span>
            )}
          </div>
        </h2>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => top30Q.refetch()}
            disabled={isLoading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
            title="Sinyalleri Yenile"
          >
            <ArrowTrendingUpIcon className="w-4 h-4" />
            {isLoading ? 'Yükleniyor...' : 'Yenile'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Sinyaller yükleniyor...</p>
        </div>
      ) : allSignals.length === 0 ? (
        <div className="text-center py-8">
          <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sinyal Bulunamadı</h3>
          <p className="text-gray-600 mb-4">Şu anda aktif AI sinyali bulunmuyor.</p>
          <button
            onClick={() => top30Q.refetch()}
            className="btn-primary"
          >
            Tekrar Dene
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sembol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sinyal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Güven
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fiyat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Değişim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Açıklama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beklenen Getiri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allSignals.map((signal, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {signal.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSignalColor(signal.signal)}`}>
                      {getSignalIcon(signal.signal)}
                      <span className="ml-1">{signal.signal}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getConfidenceColor(signal.confidence)}`}>
                      {(signal.confidence * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₺{signal.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={signal.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {signal.change >= 0 ? '+' : ''}{signal.change.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={signal.xaiExplanation}>
                      {signal.xaiExplanation}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={signal.expectedReturn >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {signal.expectedReturn >= 0 ? '+' : ''}{signal.expectedReturn.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToWatchlist(signal.symbol)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        title="Watchlist'e Ekle"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSetAlert(signal.symbol, signal.price)}
                        className="p-1 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded"
                        title="Fiyat Alarmı Kur"
                      >
                        <BellIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShareSignal(signal)}
                        className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                        title="Sinyali Paylaş"
                      >
                        <ShareIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TradingSignals;