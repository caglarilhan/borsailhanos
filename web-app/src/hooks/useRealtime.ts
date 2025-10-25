/**
 * 🚀 BIST AI Smart Trader - Realtime Hook
 * ======================================
 * 
 * WebSocket bağlantısını frontend'e bağlayan React hook.
 * Gerçek zamanlı fiyat güncellemeleri ve sinyal değişikliklerini yönetir.
 * 
 * Özellikler:
 * - WebSocket bağlantı yönetimi
 * - Otomatik yeniden bağlanma
 * - Sinyal ve fiyat güncellemeleri
 * - Smart notifications
 * - Connection status tracking
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface PriceData {
  symbol: string;
  price: number;
  change: number;
  change_pct: number;
  volume: number;
  timestamp: string;
}

interface SignalData {
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD' | 'STRONG_BUY' | 'STRONG_SELL';
  confidence: number;
  timestamp: string;
  source: string;
  metadata?: {
    old_signal?: string;
    signal_strength?: string;
    confidence_change?: number;
  };
}

interface NotificationData {
  type: string;
  symbol?: string;
  signal?: string;
  confidence?: number;
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface ConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  error: string | null;
  lastConnected: string | null;
}

interface RealtimeData {
  prices: Record<string, PriceData>;
  signals: Record<string, SignalData>;
  notifications: NotificationData[];
  connectionStatus: ConnectionStatus;
}

interface UseRealtimeOptions {
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  serverUrl?: string;
  onNotification?: (notification: NotificationData) => void;
  onSignalChange?: (signal: SignalData) => void;
  onPriceUpdate?: (price: PriceData) => void;
}

export const useRealtime = (options: UseRealtimeOptions = {}) => {
  const {
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectDelay = 3000,
    serverUrl = process.env.NEXT_PUBLIC_REALTIME_URL || 'ws://localhost:8002',
    onNotification,
    onSignalChange,
    onPriceUpdate
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const [data, setData] = useState<RealtimeData>({
    prices: {},
    signals: {},
    notifications: [],
    connectionStatus: {
      connected: false,
      reconnecting: false,
      error: null,
      lastConnected: null
    }
  });

  // WebSocket bağlantısını başlat
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    try {
      console.log('🔌 Connecting to WebSocket server:', serverUrl);
      
      socketRef.current = io(serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: false, // Manuel reconnection kullanacağız
        autoConnect: false
      });

      // Bağlantı event'leri
      socketRef.current.on('connect', () => {
        console.log('✅ WebSocket connected');
        reconnectAttemptsRef.current = 0;
        
        setData(prev => ({
          ...prev,
          connectionStatus: {
            connected: true,
            reconnecting: false,
            error: null,
            lastConnected: new Date().toISOString()
          }
        }));
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('❌ WebSocket disconnected:', reason);
        
        setData(prev => ({
          ...prev,
          connectionStatus: {
            ...prev.connectionStatus,
            connected: false,
            error: reason
          }
        }));

        // Otomatik yeniden bağlanma
        if (reconnectAttemptsRef.current < reconnectAttempts) {
          handleReconnect();
        }
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
        
        setData(prev => ({
          ...prev,
          connectionStatus: {
            ...prev.connectionStatus,
            connected: false,
            error: error.message
          }
        }));
      });

      // Fiyat güncellemeleri
      socketRef.current.on('price_update', (payload: { symbol: string; data: PriceData; timestamp: string }) => {
        console.log('📈 Price update received:', payload.symbol, payload.data.price);
        
        setData(prev => ({
          ...prev,
          prices: {
            ...prev.prices,
            [payload.symbol]: payload.data
          }
        }));

        // Callback çağır
        if (onPriceUpdate) {
          onPriceUpdate(payload.data);
        }
      });

      // Sinyal güncellemeleri
      socketRef.current.on('signal_update', (payload: { symbol: string; data: SignalData; changed: boolean; timestamp: string }) => {
        console.log('🔔 Signal update received:', payload.symbol, payload.data.signal);
        
        setData(prev => ({
          ...prev,
          signals: {
            ...prev.signals,
            [payload.symbol]: payload.data
          }
        }));

        // Callback çağır
        if (onSignalChange && payload.changed) {
          onSignalChange(payload.data);
        }
      });

      // Smart notifications
      socketRef.current.on('smart_notification', (notification: NotificationData) => {
        console.log('📱 Smart notification received:', notification.message);
        
        setData(prev => ({
          ...prev,
          notifications: [notification, ...prev.notifications].slice(0, 50) // Son 50 bildirim
        }));

        // Callback çağır
        if (onNotification) {
          onNotification(notification);
        }

        // Tarayıcı bildirimi göster
        showBrowserNotification(notification);
      });

      // Bağlantı durumu
      socketRef.current.on('connection_status', (status) => {
        console.log('📊 Connection status:', status);
      });

      // Abonelik onayları
      socketRef.current.on('subscription_confirmed', (data) => {
        console.log('✅ Subscription confirmed:', data.symbol);
      });

      socketRef.current.on('unsubscription_confirmed', (data) => {
        console.log('❌ Unsubscription confirmed:', data.symbol);
      });

      // Aktif semboller
      socketRef.current.on('active_symbols', (data) => {
        console.log('📊 Active symbols:', data.symbols);
      });

      // Hata mesajları
      socketRef.current.on('error', (error) => {
        console.error('❌ Socket error:', error);
      });

      // Bağlantıyı başlat
      socketRef.current.connect();

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      
      setData(prev => ({
        ...prev,
        connectionStatus: {
          ...prev.connectionStatus,
          connected: false,
          error: error instanceof Error ? error.message : 'Connection failed'
        }
      }));
    }
  }, [serverUrl, reconnectAttempts, onNotification, onSignalChange, onPriceUpdate]);

  // Yeniden bağlanma
  const handleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectAttemptsRef.current++;
    
    setData(prev => ({
      ...prev,
      connectionStatus: {
        ...prev.connectionStatus,
        reconnecting: true,
        error: `Reconnecting... (${reconnectAttemptsRef.current}/${reconnectAttempts})`
      }
    }));

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`🔄 Reconnection attempt ${reconnectAttemptsRef.current}/${reconnectAttempts}`);
      connect();
    }, reconnectDelay);
  }, [connect, reconnectDelay, reconnectAttempts]);

  // Bağlantıyı kes
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setData(prev => ({
      ...prev,
      connectionStatus: {
        connected: false,
        reconnecting: false,
        error: null,
        lastConnected: prev.connectionStatus.lastConnected
      }
    }));
  }, []);

  // Sembol aboneliği
  const subscribeToSymbol = useCallback((symbol: string) => {
    if (socketRef.current?.connected) {
      console.log('📡 Subscribing to symbol:', symbol);
      socketRef.current.emit('subscribe_symbol', { symbol: symbol.toUpperCase() });
    } else {
      console.warn('⚠️ Cannot subscribe: WebSocket not connected');
    }
  }, []);

  // Sembol aboneliğinden çık
  const unsubscribeFromSymbol = useCallback((symbol: string) => {
    if (socketRef.current?.connected) {
      console.log('📡 Unsubscribing from symbol:', symbol);
      socketRef.current.emit('unsubscribe_symbol', { symbol: symbol.toUpperCase() });
    } else {
      console.warn('⚠️ Cannot unsubscribe: WebSocket not connected');
    }
  }, []);

  // Aktif sembolleri getir
  const getActiveSymbols = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('get_active_symbols');
    }
  }, []);

  // Tarayıcı bildirimi göster
  const showBrowserNotification = useCallback((notification: NotificationData) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.message, {
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        tag: `bist-ai-${notification.type}`,
        requireInteraction: notification.priority === 'high' || notification.priority === 'critical',
        data: {
          symbol: notification.symbol,
          type: notification.type
        }
      });

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
      };
    }
  }, []);

  // Bildirim izni iste
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('📱 Notification permission:', permission);
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  // Web Push aboneliği
  const subscribeToWebPush = useCallback(async (userId: string) => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      // Backend'e aboneliği gönder
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          subscription: subscription.toJSON()
        })
      });

      if (response.ok) {
        console.log('✅ Web push subscription successful');
        return true;
      } else {
        console.error('❌ Web push subscription failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Web push subscription error:', error);
      return false;
    }
  }, []);

  // Component mount/unmount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Data
    prices: data.prices,
    signals: data.signals,
    notifications: data.notifications,
    connectionStatus: data.connectionStatus,
    
    // Actions
    connect,
    disconnect,
    subscribeToSymbol,
    unsubscribeFromSymbol,
    getActiveSymbols,
    requestNotificationPermission,
    subscribeToWebPush,
    
    // Utilities
    isConnected: data.connectionStatus.connected,
    isReconnecting: data.connectionStatus.reconnecting,
    hasError: !!data.connectionStatus.error
  };
};

export default useRealtime;