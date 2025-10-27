"use client";
import { useState, useEffect, useRef, useCallback } from "react";

interface WebSocketState {
  connected: boolean;
  reconnecting: boolean;
  error: string | null;
  lastMessage: any;
  lastPing: number | null;
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
  onDisconnect,
}: UseWebSocketOptions) {
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    reconnecting: false,
    error: null,
    lastMessage: null,
    lastPing: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const pingInterval = useRef<NodeJS.Timeout | null>(null);
  const pongTimeout = useRef<NodeJS.Timeout | null>(null);

  const onMessageRef = useRef(onMessage);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
  }, [onMessage, onConnect, onDisconnect]);

  const updateState = (patch: Partial<WebSocketState>) =>
    setState((prev) => ({ ...prev, ...patch }));

  const cleanup = () => {
    if (pingInterval.current) clearInterval(pingInterval.current);
    if (pongTimeout.current) clearTimeout(pongTimeout.current);
    if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
  };

  const connect = useCallback(() => {
    if (!url || url.trim() === "") return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    cleanup();

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ [WS] Connected:", url);
      reconnectAttempts.current = 0;
      updateState({ connected: true, reconnecting: false, error: null });
      onConnectRef.current?.();

      // heartbeat
      pingInterval.current = setInterval(() => {
        try {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
            updateState({ lastPing: Date.now() });

            pongTimeout.current = setTimeout(() => {
              console.warn("⚠️ [WS] Pong timeout, closing...");
              ws.close(4000, "Ping timeout");
            }, 10000);
          }
        } catch (e) {
          console.error("Ping error:", e);
        }
      }, 30000);
    };

    ws.onmessage = (event) => {
      try {
        const raw = event.data;
        let data: any;
        try {
          data = JSON.parse(raw);
        } catch {
          data = { type: "raw", payload: raw };
        }

        if (data.type === "pong") {
          if (pongTimeout.current) clearTimeout(pongTimeout.current);
          return;
        }

        updateState({ lastMessage: data });
        onMessageRef.current?.(data);
        window?.dispatchEvent?.(
          new CustomEvent("ws_message", { detail: data })
        );
      } catch (err) {
        console.error("Parse error:", err);
      }
    };

    ws.onerror = (event) => {
      console.warn("⚠️ [WS] Connection issue:", event);
      updateState({ error: "Connection error", connected: false });
    };

    ws.onclose = (event) => {
      console.warn(`🔌 [WS] Closed (${event.code})`, event.reason);
      updateState({
        connected: false,
        reconnecting: true,
        error: `Closed: ${event.reason || event.code}`,
      });
      onDisconnectRef.current?.();
      cleanup();

      if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = reconnectInterval * Math.pow(2, reconnectAttempts.current);
          reconnectAttempts.current++;
          console.log(
            `🔄 [WS] Reconnect attempt ${reconnectAttempts.current} in ${delay}ms`
          );
          reconnectTimeout.current = setTimeout(connect, delay);
      } else {
        console.error("❌ [WS] Max reconnect attempts reached");
        updateState({
          reconnecting: false,
          error: "Bağlantı başarısız, sayfayı yenileyin.",
        });
      }
    };
  }, [url, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    cleanup();
    if (wsRef.current) {
      wsRef.current.close(1000, "Manual disconnect");
      wsRef.current = null;
    }
    updateState({ connected: false, reconnecting: false });
  }, []);

  const sendMessage = useCallback((message: any) => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
      } else {
        console.warn("⚠️ [WS] Not open, queue or retry later");
      }
    } catch (err) {
      console.error("❌ [WS] Send failed:", err);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [url]);

  useEffect(() => {
    const onOnline = () => {
      if (!state.connected) {
        console.log("🌐 [WS] Network online, reconnecting...");
        connect();
      }
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [state.connected, connect]);

  return { ...state, connect, disconnect, sendMessage };
}

export default useWebSocket;
