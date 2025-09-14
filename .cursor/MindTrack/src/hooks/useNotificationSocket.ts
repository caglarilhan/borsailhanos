"use client";

import * as React from "react";
import { io, Socket } from "socket.io-client";

interface NotificationSocketProps {
  userId: string;
  onNotification?: (notification: any) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export function useNotificationSocket({ 
  userId, 
  onNotification, 
  onConnectionChange 
}: NotificationSocketProps) {
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);

  // Initialize socket connection
  React.useEffect(() => {
    if (!userId) return;

    // In production, use your actual server URL
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      auth: {
        userId: userId
      },
      transports: ['websocket', 'polling']
    });

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('Connected to notification server');
      setIsConnected(true);
      onConnectionChange?.(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from notification server');
      setIsConnected(false);
      onConnectionChange?.(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
      onConnectionChange?.(false);
    });

    // Notification event handlers
    socketInstance.on('notification', (notification) => {
      console.log('Received notification:', notification);
      setNotifications(prev => [notification, ...prev]);
      onNotification?.(notification);
    });

    socketInstance.on('notification_read', (notificationId) => {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
    });

    socketInstance.on('notification_deleted', (notificationId) => {
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
    });

    socketInstance.on('notifications_bulk_update', (updatedNotifications) => {
      setNotifications(updatedNotifications);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [userId, onNotification, onConnectionChange]);

  // Send notification actions
  const markAsRead = React.useCallback((notificationId: string) => {
    if (socket && isConnected) {
      socket.emit('mark_notification_read', notificationId);
    }
  }, [socket, isConnected]);

  const deleteNotification = React.useCallback((notificationId: string) => {
    if (socket && isConnected) {
      socket.emit('delete_notification', notificationId);
    }
  }, [socket, isConnected]);

  const markAllAsRead = React.useCallback(() => {
    if (socket && isConnected) {
      socket.emit('mark_all_notifications_read');
    }
  }, [socket, isConnected]);

  const updateSettings = React.useCallback((settings: any) => {
    if (socket && isConnected) {
      socket.emit('update_notification_settings', settings);
    }
  }, [socket, isConnected]);

  const subscribeToChannel = React.useCallback((channel: string) => {
    if (socket && isConnected) {
      socket.emit('subscribe_to_channel', channel);
    }
  }, [socket, isConnected]);

  const unsubscribeFromChannel = React.useCallback((channel: string) => {
    if (socket && isConnected) {
      socket.emit('unsubscribe_from_channel', channel);
    }
  }, [socket, isConnected]);

  // Request permission for push notifications
  const requestPushPermission = React.useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  // Send push notification
  const sendPushNotification = React.useCallback((title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        ...options
      });
    }
  }, []);

  return {
    socket,
    isConnected,
    notifications,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    updateSettings,
    subscribeToChannel,
    unsubscribeFromChannel,
    requestPushPermission,
    sendPushNotification
  };
}

