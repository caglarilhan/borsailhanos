import { useEffect, useState } from 'react';

interface RealtimeOptions {
  url: string;
  onMessage: (data: any) => void;
  onError?: (error: any) => void;
  enabled?: boolean;
}

export function useRealtime({ url, onMessage, onError, enabled = true }: RealtimeOptions) {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let eventSource: EventSource | null = null;
    let retryTimeout: NodeJS.Timeout;

    const connect = () => {
      setStatus('connecting');
      
      try {
        eventSource = new EventSource(url);

        eventSource.onopen = () => {
          setStatus('connected');
          setRetryCount(0);
          console.log('✅ Realtime bağlantı kuruldu:', url);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            onMessage(data);
          } catch (error) {
            console.error('❌ Realtime data parse hatası:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('❌ Realtime bağlantı hatası:', error);
          setStatus('disconnected');
          eventSource?.close();
          
          if (onError) onError(error);

          // Exponential backoff ile yeniden bağlan
          const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
          retryTimeout = setTimeout(() => {
            setRetryCount(prev => prev + 1);
            connect();
          }, delay);
        };
      } catch (error) {
        console.error('❌ EventSource oluşturma hatası:', error);
        setStatus('disconnected');
      }
    };

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [url, enabled, retryCount]);

  return { status, retryCount };
}

// Kullanım örneği için helper hook'lar
export function useRealtimePrices(onPriceUpdate: (price: any) => void, enabled = true) {
  return useRealtime({
    url: 'http://localhost:8081/stream/prices',
    onMessage: onPriceUpdate,
    enabled
  });
}

export function useRealtimeSignals(onSignalUpdate: (signal: any) => void, enabled = true) {
  return useRealtime({
    url: 'http://localhost:8081/stream/signals',
    onMessage: onSignalUpdate,
    enabled
  });
}

export function useRealtimeRisk(onRiskUpdate: (risk: any) => void, enabled = true) {
  return useRealtime({
    url: 'http://localhost:8081/stream/risk',
    onMessage: onRiskUpdate,
    enabled
  });
}
