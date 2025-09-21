"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bell, BellOff, Settings, CheckCircle, AlertCircle, Info, X } from "lucide-react";

interface NotificationCenterProps {
  userId: string;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  appointmentReminders: boolean;
  medicationReminders: boolean;
  labResults: boolean;
  systemUpdates: boolean;
}

export default function NotificationCenter({ userId }: NotificationCenterProps) {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [settings, setSettings] = React.useState<NotificationSettings>({
    email: true,
    sms: true,
    push: true,
    appointmentReminders: true,
    medicationReminders: true,
    labResults: true,
    systemUpdates: false
  });
  const [isConnected, setIsConnected] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  // Mock notifications - in real app, these would come from WebSocket/API
  React.useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'success',
        title: 'Appointment Confirmed',
        message: 'Your appointment with Dr. Sarah Johnson on September 20th at 10:00 AM has been confirmed.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        isRead: false,
        actionUrl: '/appointments',
        actionText: 'View Details',
        priority: 'normal'
      },
      {
        id: '2',
        type: 'warning',
        title: 'Medication Reminder',
        message: 'Time to take your Metformin 500mg. Please take with food.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        isRead: false,
        priority: 'high'
      },
      {
        id: '3',
        type: 'info',
        title: 'Lab Results Available',
        message: 'Your Complete Blood Count results are now available in your patient portal.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        isRead: true,
        actionUrl: '/lab-results',
        actionText: 'View Results',
        priority: 'normal'
      },
      {
        id: '4',
        type: 'error',
        title: 'Payment Required',
        message: 'Your payment for the recent consultation is overdue. Please update your payment method.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        isRead: false,
        actionUrl: '/billing',
        actionText: 'Pay Now',
        priority: 'urgent'
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
    setIsConnected(true);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setUnreadCount(prev => prev - 1);
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      const newNotifications = prev.filter(n => n.id !== notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => prev - 1);
      }
      return newNotifications;
    });
  };

  const updateSettings = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      return `${days} days ago`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Notifications</CardTitle>
                <CardDescription>
                  {isConnected ? 'Connected' : 'Disconnected'} • {unreadCount} unread
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? 'default' : 'secondary'}>
                {isConnected ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Live
                  </>
                ) : (
                  <>
                    <BellOff className="h-3 w-3 mr-1" />
                    Offline
                  </>
                )}
              </Badge>
              {unreadCount > 0 && (
                <Button size="sm" variant="outline" onClick={markAllAsRead}>
                  Mark All Read
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-4 border rounded-lg transition-colors ${
                    !notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                          {!notification.isRead && (
                            <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          {notification.actionUrl && notification.actionText && (
                            <Button size="sm" variant="outline" className="h-6 text-xs">
                              {notification.actionText}
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {!notification.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                            className="h-6 w-6 p-0"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNotification(notification.id)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Delivery Methods */}
          <div>
            <h4 className="font-medium mb-3">Delivery Methods</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Email Notifications</div>
                  <div className="text-sm text-gray-500">Receive notifications via email</div>
                </div>
                <Switch
                  checked={settings.email}
                  onCheckedChange={(checked) => updateSettings('email', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">SMS Notifications</div>
                  <div className="text-sm text-gray-500">Receive notifications via text message</div>
                </div>
                <Switch
                  checked={settings.sms}
                  onCheckedChange={(checked) => updateSettings('sms', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Push Notifications</div>
                  <div className="text-sm text-gray-500">Receive browser push notifications</div>
                </div>
                <Switch
                  checked={settings.push}
                  onCheckedChange={(checked) => updateSettings('push', checked)}
                />
              </div>
            </div>
          </div>

          {/* Notification Types */}
          <div>
            <h4 className="font-medium mb-3">Notification Types</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Appointment Reminders</div>
                  <div className="text-sm text-gray-500">Reminders for upcoming appointments</div>
                </div>
                <Switch
                  checked={settings.appointmentReminders}
                  onCheckedChange={(checked) => updateSettings('appointmentReminders', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Medication Reminders</div>
                  <div className="text-sm text-gray-500">Reminders to take medications</div>
                </div>
                <Switch
                  checked={settings.medicationReminders}
                  onCheckedChange={(checked) => updateSettings('medicationReminders', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Lab Results</div>
                  <div className="text-sm text-gray-500">Notifications when lab results are available</div>
                </div>
                <Switch
                  checked={settings.labResults}
                  onCheckedChange={(checked) => updateSettings('labResults', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">System Updates</div>
                  <div className="text-sm text-gray-500">Updates about system maintenance and features</div>
                </div>
                <Switch
                  checked={settings.systemUpdates}
                  onCheckedChange={(checked) => updateSettings('systemUpdates', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


