"use client";
import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketState {
  connected: boolean;
  reconnecting: boolean;
  error: string | null;
  lastMessage: any;
}

interface UseWebSocketOptions {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket({
  url,
  reconnectInterval = 5000,
  maxReconnectAttempts = 10,
  onMessage,
  onConnect,
  onDisconnect
}: UseWebSocketOptions) {
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    reconnecting: false,
    error: null,
    lastMessage: null
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        console.log('🔗 WebSocket connected');
        setState(prev => ({
          ...prev,
          connected: true,
          reconnecting: false,
          error: null
        }));
        reconnectAttemptsRef.current = 0;
        onConnect?.();

        // Start ping interval
        pingIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000); // Ping every 30 seconds
      };

      wsRef.current.onclose = (event) => {
        console.warn('🔌 WebSocket disconnected:', event.code, event.reason);
        setState(prev => ({
          ...prev,
          connected: false,
          reconnecting: true,
          error: `Disconnected: ${event.reason || event.code}`
        }));

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        onDisconnect?.();

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`🔄 Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else {
          console.error('❌ Max reconnection attempts reached');
          setState(prev => ({
            ...prev,
            reconnecting: false,
            error: 'Connection failed - max attempts reached'
          }));
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setState(prev => ({
          ...prev,
          connected: false,
          reconnecting: false,
          error: 'WebSocket error'
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle pong response
          if (data.type === 'pong') {
            return;
          }

          setState(prev => ({
            ...prev,
            lastMessage: data
          }));

          onMessage?.(data);
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      setState(prev => ({
        ...prev,
        connected: false,
        reconnecting: false,
        error: 'Failed to establish WebSocket connection'
      }));
    }
  }, [url, reconnectInterval, maxReconnectAttempts, onMessage, onConnect, onDisconnect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setState(prev => ({
      ...prev,
      connected: false,
      reconnecting: false,
      error: null
    }));
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message');
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    sendMessage
  };
}

export default useWebSocket;


