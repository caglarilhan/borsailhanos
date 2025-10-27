"use client";
import { useEffect, useState } from "react";

/**
 * WebSocket bağlantısı ve online durumu yönetir
 * - Backend ile realtime iletişim
 * - Online/offline durumu takibi
 * - Heartbeat (ping) mekanizması
 */
export function useRealtime() {
  const [online, setOnline] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8081/ws";
    
    try {
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        setOnline(true);
        console.log("🔗 WebSocket connected");
      };
      
      socket.onclose = () => {
        setOnline(false);
        console.log("🔌 WebSocket disconnected");
      };
      
      socket.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        setOnline(false);
      };
      
      setWs(socket);
      
      // Heartbeat - 30 saniyede bir ping gönder
      const pingInterval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "ping" }));
        }
      }, 30000);
      
      return () => {
        clearInterval(pingInterval);
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      };
    } catch (error) {
      console.error("❌ WebSocket initialization error:", error);
      setOnline(false);
    }
  }, []);

  return { online, ws };
}
