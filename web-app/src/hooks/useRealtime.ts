import { useState, useEffect, useRef, useCallback } from 'react';

interface RealtimeData {
  prices: Record<string, any>;
  signals: any[];
  notifications: any[];
  connectionStatus: {
    connected: boolean;
    reconnecting: boolean;
    error: string | null;
  };
  performanceStats: {
    latency: number;
    memoryUsage: number;
    cpuUsage: number;
    inferenceCount: number;
  };
}

interface UseRealtimeReturn extends RealtimeData {
  connect: () => void;
  disconnect: () => void;
  subscribeToSymbol: (symbol: string) => void;
  unsubscribeFromSymbol: (symbol: string) => void;
  getActiveSymbols: () => string[];
  requestNotificationPermission: () => Promise<boolean>;
  subscribeToWebPush: () => Promise<void>;
  isConnected: boolean;
  isReconnecting: boolean;
  hasError: boolean;
}

export const useRealtime = (): UseRealtimeReturn => {
  const [data, setData] = useState<RealtimeData>({
    prices: {},
    signals: [],
    notifications: [],
    connectionStatus: {
      connected: false,
      reconnecting: false,
      error: null
    },
    performanceStats: {
      latency: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      inferenceCount: 0
    }
  });

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const subscribedSymbolsRef = useRef<Set<string>>(new Set());
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  const reconnectDelay = 5000; // 5 seconds
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startFallbackMode = useCallback(() => {
    console.log('🔄 Starting fallback mode - using REST API');
    
    // Clear any existing fallback interval
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
    }
    
    // Start fallback polling every 5 seconds
    fallbackIntervalRef.current = setInterval(async () => {
      try {
        // Fetch signals
        const signalsResponse = await fetch('/api/signals');
        if (signalsResponse.ok) {
          const signals = await signalsResponse.json();
          setData(prev => ({
            ...prev,
            signals: signals || []
          }));
        }
        
        // Fetch prices
        const pricesResponse = await fetch('/api/prices');
        if (pricesResponse.ok) {
          const prices = await pricesResponse.json();
          setData(prev => ({
            ...prev,
            prices: { ...prev.prices, ...prices }
          }));
        }
        
        console.log('📡 Fallback data fetched successfully');
      } catch (error) {
        console.error('❌ Fallback fetch failed:', error);
      }
    }, 5000);
  }, []);

  const stopFallbackMode = useCallback(() => {
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
      console.log('🔄 Fallback mode stopped');
    }
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_REALTIME_URL || 'ws://localhost:8081';
    
    try {
      socketRef.current = new WebSocket(wsUrl);
      
      socketRef.current.onopen = () => {
        console.log('🔗 WebSocket connected');
        setData(prev => ({
          ...prev,
          connectionStatus: {
            connected: true,
            reconnecting: false,
            error: null
          }
        }));
        
        reconnectAttemptsRef.current = 0;
        
        // Stop fallback mode when WebSocket reconnects
        stopFallbackMode();
        
        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
        
        // Resubscribe to symbols
        subscribedSymbolsRef.current.forEach(symbol => {
          socketRef.current?.send(JSON.stringify({
            type: 'subscribe',
            symbol: symbol
          }));
        });
      };

      socketRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'pong':
              // Update latency
              setData(prev => ({
                ...prev,
                performanceStats: {
                  ...prev.performanceStats,
                  latency: Date.now() - message.timestamp
                }
              }));
              break;
              
            case 'signals':
              setData(prev => ({
                ...prev,
                signals: message.signals || []
              }));
              break;
              
            case 'prices':
            case 'price_update':
              setData(prev => ({
                ...prev,
                prices: { ...prev.prices, ...message.prices }
              }));
              break;
              
            case 'notification':
              setData(prev => ({
                ...prev,
                notifications: [...prev.notifications, message.notification]
              }));
              break;
              
            case 'performance_stats':
              setData(prev => ({
                ...prev,
                performanceStats: {
                  latency: message.latency || 0,
                  memoryUsage: message.memory_usage || 0,
                  cpuUsage: message.cpu_usage || 0,
                  inferenceCount: message.inference_count || 0
                }
              }));
              break;
              
            case 'connection':
              console.log('📡 Connection status:', message.status);
              break;
              
            case 'heartbeat':
              // Server heartbeat - no action needed
              break;
              
            default:
              console.log('📨 Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      socketRef.current.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        
        setData(prev => ({
          ...prev,
          connectionStatus: {
            connected: false,
            reconnecting: true,
            error: null
          }
        }));
        
        // Clear heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }
        
        // Start fallback mode after 3 failed attempts
        if (reconnectAttemptsRef.current >= 3) {
          console.log('🔄 Starting fallback mode after 3 failed attempts');
          startFallbackMode();
        }
        
        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`🔄 Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay);
        } else {
          console.error('❌ Max reconnection attempts reached - staying in fallback mode');
          setData(prev => ({
            ...prev,
            connectionStatus: {
              connected: false,
              reconnecting: false,
              error: 'Connection failed - using fallback mode'
            }
          }));
        }
      };

      socketRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setData(prev => ({
          ...prev,
          connectionStatus: {
            connected: false,
            reconnecting: false,
            error: 'Connection error'
          }
        }));
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      setData(prev => ({
        ...prev,
        connectionStatus: {
          connected: false,
          reconnecting: false,
          error: 'Failed to create connection'
        }
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    setData(prev => ({
      ...prev,
      connectionStatus: {
        connected: false,
        reconnecting: false,
        error: null
      }
    }));
  }, []);

  const subscribeToSymbol = useCallback((symbol: string) => {
    subscribedSymbolsRef.current.add(symbol);
    
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'subscribe',
        symbol: symbol
      }));
    }
  }, []);

  const unsubscribeFromSymbol = useCallback((symbol: string) => {
    subscribedSymbolsRef.current.delete(symbol);
    
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'unsubscribe',
        symbol: symbol
      }));
    }
  }, []);

  const getActiveSymbols = useCallback(() => {
    return Array.from(subscribedSymbolsRef.current);
  }, []);

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('❌ This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('❌ Notification permission denied');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, []);

  const subscribeToWebPush = useCallback(async () => {
    const hasPermission = await requestNotificationPermission();
    
    if (!hasPermission) {
      console.log('❌ Cannot subscribe to push notifications without permission');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY
      });

      // Send subscription to backend
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'push_subscription',
          subscription: subscription
        }));
      }

      console.log('✅ Push notification subscription successful');
    } catch (error) {
      console.error('❌ Failed to subscribe to push notifications:', error);
    }
  }, [requestNotificationPermission]);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    // Data
    prices: data.prices,
    signals: data.signals,
    notifications: data.notifications,
    connectionStatus: data.connectionStatus,
    performanceStats: data.performanceStats,

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