"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  BellOff, 
  Send, 
  Settings, 
  Users, 
  Calendar, 
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  Edit,
  Plus,
  Filter,
  Search
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'appointment' | 'message' | 'reminder' | 'alert' | 'custom';
  title: string;
  body: string;
  data?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationSubscription {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  isActive: boolean;
  createdAt: string;
}

interface NotificationLog {
  id: string;
  templateId: string;
  userId: string;
  title: string;
  body: string;
  sentAt: string;
  deliveredAt?: string;
  clickedAt?: string;
  status: 'sent' | 'delivered' | 'clicked' | 'failed';
  error?: string;
}

export default function PushNotifications() {
  const { toast } = useToast();
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  
  const [templates, setTemplates] = React.useState<NotificationTemplate[]>([]);
  const [subscriptions, setSubscriptions] = React.useState<NotificationSubscription[]>([]);
  const [logs, setLogs] = React.useState<NotificationLog[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [permission, setPermission] = React.useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = React.useState(false);
  const [serviceWorker, setServiceWorker] = React.useState<ServiceWorkerRegistration | null>(null);

  // Check notification support and permission
  React.useEffect(() => {
    const checkSupport = () => {
      setIsSupported('Notification' in window && 'serviceWorker' in navigator);
      if ('Notification' in window) {
        setPermission(Notification.permission);
      }
    };

    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          setServiceWorker(registration);
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }
    };

    checkSupport();
    registerServiceWorker();
  }, []);

  // Load data
  const fetchTemplates = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications/templates');
      if (!res.ok) throw new Error('Failed to fetch templates');
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to load templates: ${e.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchSubscriptions = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications/subscriptions');
      if (!res.ok) throw new Error('Failed to fetch subscriptions');
      const data = await res.json();
      setSubscriptions(data.subscriptions || []);
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to load subscriptions: ${e.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchLogs = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications/logs');
      if (!res.ok) throw new Error('Failed to fetch logs');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to load logs: ${e.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchTemplates();
    fetchSubscriptions();
    fetchLogs();
  }, [fetchTemplates, fetchSubscriptions, fetchLogs]);

  // Request notification permission
  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported on this device.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newPermission = await Notification.requestPermission();
      setPermission(newPermission);
      
      if (newPermission === 'granted') {
        toast({
          title: "Success",
          description: "Notification permission granted!",
        });
        // Subscribe to push notifications
        await subscribeToPush();
      } else {
        toast({
          title: "Permission Denied",
          description: "You can enable notifications later in your browser settings.",
        });
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      toast({
        title: "Error",
        description: "Failed to request notification permission.",
        variant: "destructive",
      });
    }
  };

  // Subscribe to push notifications
  const subscribeToPush = async () => {
    if (!serviceWorker) {
      toast({
        title: "Error",
        description: "Service Worker not available.",
        variant: "destructive",
      });
      return;
    }

    try {
      const subscription = await serviceWorker.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      // Send subscription to server
      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });

      if (!res.ok) throw new Error('Failed to save subscription');

      toast({
        title: "Success",
        description: "Successfully subscribed to push notifications!",
      });

      fetchSubscriptions();
    } catch (error) {
      console.error('Subscription failed:', error);
      toast({
        title: "Error",
        description: "Failed to subscribe to push notifications.",
        variant: "destructive",
      });
    }
  };

  // Unsubscribe from push notifications
  const unsubscribeFromPush = async () => {
    if (!serviceWorker) return;

    try {
      const subscription = await serviceWorker.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove subscription from server
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subscription.endpoint
          })
        });

        toast({
          title: "Success",
          description: "Successfully unsubscribed from push notifications.",
        });

        fetchSubscriptions();
      }
    } catch (error) {
      console.error('Unsubscription failed:', error);
      toast({
        title: "Error",
        description: "Failed to unsubscribe from push notifications.",
        variant: "destructive",
      });
    }
  };

  // Send test notification
  const sendTestNotification = async () => {
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Notification',
          body: 'This is a test notification from MindTrack.',
          data: { type: 'test' }
        })
      });

      if (!res.ok) throw new Error('Failed to send notification');

      toast({
        title: "Success",
        description: "Test notification sent!",
      });

      fetchLogs();
    } catch (error) {
      console.error('Test notification failed:', error);
      toast({
        title: "Error",
        description: "Failed to send test notification.",
        variant: "destructive",
      });
    }
  };

  // Create notification template
  const createTemplate = async (template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await fetch('/api/notifications/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      });

      if (!res.ok) throw new Error('Failed to create template');

      toast({
        title: "Success",
        description: "Notification template created successfully!",
      });

      fetchTemplates();
    } catch (error) {
      console.error('Template creation failed:', error);
      toast({
        title: "Error",
        description: "Failed to create notification template.",
        variant: "destructive",
      });
    }
  };

  // Send notification using template
  const sendNotification = async (templateId: string, userIds?: string[]) => {
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          userIds: userIds || []
        })
      });

      if (!res.ok) throw new Error('Failed to send notification');

      toast({
        title: "Success",
        description: "Notification sent successfully!",
      });

      fetchLogs();
    } catch (error) {
      console.error('Notification send failed:', error);
      toast({
        title: "Error",
        description: "Failed to send notification.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: NotificationLog['status']) => {
    switch (status) {
      case 'sent': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'clicked': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: NotificationLog['status']) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'clicked': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Push Notifications</h2>
          <p className="text-gray-600">Manage push notifications and templates</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isSupported ? 'default' : 'secondary'}>
            {isSupported ? <Bell className="h-3 w-3 mr-1" /> : <BellOff className="h-3 w-3 mr-1" />}
            {isSupported ? 'Supported' : 'Not Supported'}
          </Badge>
          <Badge variant={permission === 'granted' ? 'default' : 'secondary'}>
            {permission === 'granted' ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
            {permission === 'granted' ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
      </div>

      {/* Permission Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Push Notifications</div>
              <div className="text-sm text-gray-600">
                Receive real-time notifications for appointments, messages, and updates
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {permission === 'granted' ? (
                <Button onClick={unsubscribeFromPush} variant="outline" size="sm">
                  <BellOff className="h-4 w-4 mr-2" />
                  Disable
                </Button>
              ) : (
                <Button onClick={requestPermission} size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Enable
                </Button>
              )}
            </div>
          </div>

          {permission === 'granted' && (
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Test Notification</div>
                <div className="text-sm text-gray-600">
                  Send a test notification to verify setup
                </div>
              </div>
              <Button onClick={sendTestNotification} variant="outline" size="sm">
                <Send className="h-4 w-4 mr-2" />
                Send Test
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Notification Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates" className="space-y-4">
            <TabsList>
              <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions ({subscriptions.length})</TabsTrigger>
              <TabsTrigger value="logs">Logs ({logs.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Input placeholder="Search templates..." className="w-64" />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="appointment">Appointment</SelectItem>
                      <SelectItem value="message">Message</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </div>

              <div className="space-y-2">
                {templates.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No templates created yet</p>
                ) : (
                  templates.map((template) => (
                    <div key={template.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <div className="font-medium">{template.name}</div>
                            <Badge variant="outline">{template.type}</Badge>
                            {template.isActive && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Active
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{template.title}</div>
                          <div className="text-sm text-gray-500 mt-1">{template.body}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sendNotification(template.id)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Send
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="subscriptions" className="space-y-4">
              <div className="space-y-2">
                {subscriptions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No active subscriptions</p>
                ) : (
                  subscriptions.map((subscription) => (
                    <div key={subscription.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">Subscription #{subscription.id.slice(0, 8)}</div>
                          <div className="text-sm text-gray-600">
                            Created: {new Date(subscription.createdAt).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            Endpoint: {subscription.endpoint.slice(0, 50)}...
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={subscription.isActive ? 'default' : 'secondary'}>
                            {subscription.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <div className="space-y-2">
                {logs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No notification logs</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <div className="font-medium">{log.title}</div>
                            {getStatusIcon(log.status)}
                            <Badge className={getStatusColor(log.status)}>
                              {log.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{log.body}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            Sent: {new Date(log.sentAt).toLocaleString()}
                            {log.deliveredAt && (
                              <span> | Delivered: {new Date(log.deliveredAt).toLocaleString()}</span>
                            )}
                            {log.clickedAt && (
                              <span> | Clicked: {new Date(log.clickedAt).toLocaleString()}</span>
                            )}
                          </div>
                          {log.error && (
                            <div className="text-sm text-red-600 mt-1">Error: {log.error}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Push Notification Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Setting Up Push Notifications</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Enable notification permission using the "Enable" button</li>
                <li>Create notification templates for different types of messages</li>
                <li>Send test notifications to verify setup</li>
                <li>Monitor notification logs for delivery status</li>
              </ol>
            </div>

            <div>
              <h4 className="font-medium mb-2">Notification Types</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li><strong>Appointment:</strong> Reminders and confirmations</li>
                <li><strong>Message:</strong> New messages from clients</li>
                <li><strong>Reminder:</strong> General reminders and alerts</li>
                <li><strong>Alert:</strong> Urgent notifications</li>
                <li><strong>Custom:</strong> Custom notifications</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Browser Support</h4>
              <div className="text-sm text-gray-600">
                <p>Push notifications are supported in:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Chrome 42+</li>
                  <li>Firefox 44+</li>
                  <li>Safari 16+</li>
                  <li>Edge 17+</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
