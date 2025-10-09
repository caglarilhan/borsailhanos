"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Wifi, 
  WifiOff,
  Bell,
  BellOff,
  Settings,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAFeatures {
  installable: boolean;
  offline: boolean;
  pushNotifications: boolean;
  backgroundSync: boolean;
  shareTarget: boolean;
}

export default function PWAInstaller() {
  const { toast } = useToast();
  const [installPrompt, setInstallPrompt] = React.useState<PWAInstallPrompt | null>(null);
  const [isInstalled, setIsInstalled] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [features, setFeatures] = React.useState<PWAFeatures>({
    installable: false,
    offline: false,
    pushNotifications: false,
    backgroundSync: false,
    shareTarget: false
  });
  const [notificationPermission, setNotificationPermission] = React.useState<NotificationPermission>('default');
  const [showInstallPrompt, setShowInstallPrompt] = React.useState(false);

  React.useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt({
        prompt: async () => {
          (e as any).prompt();
          const choiceResult = await (e as any).userChoice;
          return choiceResult;
        },
        userChoice: (e as any).userChoice
      });
      setFeatures(prev => ({ ...prev, installable: true }));
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      toast({
        title: "Success",
        description: "MindTrack has been installed successfully!",
      });
    };

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Check notification permission
    const checkNotificationPermission = () => {
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    };

    // Check service worker support
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            setFeatures(prev => ({ ...prev, offline: true }));
            
            // Check for background sync
            if ('sync' in window.ServiceWorkerRegistration.prototype) {
              setFeatures(prev => ({ ...prev, backgroundSync: true }));
            }
          }
        } catch (error) {
          console.error('Service Worker check failed:', error);
        }
      }
    };

    // Check share target support
    const checkShareTarget = () => {
      if ('share' in navigator) {
        setFeatures(prev => ({ ...prev, shareTarget: true }));
      }
    };

    // Initialize
    checkInstalled();
    checkNotificationPermission();
    checkServiceWorker();
    checkShareTarget();

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const handleInstall = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        toast({
          title: "Success",
          description: "MindTrack is being installed...",
        });
      } else {
        toast({
          title: "Installation Cancelled",
          description: "You can install MindTrack later from your browser menu.",
        });
      }
    } catch (error) {
      console.error('Installation failed:', error);
      toast({
        title: "Error",
        description: "Installation failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Not Supported",
        description: "Notifications are not supported on this device.",
        variant: "destructive",
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        setFeatures(prev => ({ ...prev, pushNotifications: true }));
        toast({
          title: "Success",
          description: "Notification permission granted!",
        });
      } else {
        toast({
          title: "Permission Denied",
          description: "You can enable notifications later in your browser settings.",
        });
      }
    } catch (error) {
      console.error('Notification permission request failed:', error);
      toast({
        title: "Error",
        description: "Failed to request notification permission.",
        variant: "destructive",
      });
    }
  };

  const sendTestNotification = async () => {
    if (notificationPermission !== 'granted') {
      await requestNotificationPermission();
      return;
    }

    try {
      const notification = new Notification('MindTrack Test', {
        body: 'This is a test notification from MindTrack PWA.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'test-notification',
        requireInteraction: true
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Test notification failed:', error);
      toast({
        title: "Error",
        description: "Failed to send test notification.",
        variant: "destructive",
      });
    }
  };

  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      toast({
        title: "Not Supported",
        description: "Service Workers are not supported on this device.",
        variant: "destructive",
      });
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      
      setFeatures(prev => ({ ...prev, offline: true }));
      toast({
        title: "Success",
        description: "Service Worker registered successfully!",
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      toast({
        title: "Error",
        description: "Failed to register Service Worker.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-gray-400" />
    );
  };

  const getStatusText = (status: boolean) => {
    return status ? 'Enabled' : 'Disabled';
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">PWA Installer & Features</h2>
          <p className="text-gray-600">Install MindTrack as a Progressive Web App</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isOnline ? 'default' : 'secondary'}>
            {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
          {isInstalled && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Installed
            </Badge>
          )}
        </div>
      </div>

      {/* Installation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Installation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isInstalled ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800">MindTrack is Installed</h3>
              <p className="text-gray-600">You can now use MindTrack as a native app on your device.</p>
            </div>
          ) : features.installable ? (
            <div className="text-center py-8">
              <Smartphone className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Install MindTrack</h3>
              <p className="text-gray-600 mb-4">
                Install MindTrack as a Progressive Web App for a native app experience.
              </p>
              <Button onClick={handleInstall} size="lg">
                <Download className="h-4 w-4 mr-2" />
                Install App
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Installation Not Available</h3>
              <p className="text-gray-600">
                Your browser doesn't support PWA installation or the app is already installed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            PWA Features Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(features.offline)}
                <div>
                  <div className="font-medium">Offline Support</div>
                  <div className="text-sm text-gray-600">Work without internet connection</div>
                </div>
              </div>
              <Badge className={getStatusColor(features.offline)}>
                {getStatusText(features.offline)}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(features.pushNotifications)}
                <div>
                  <div className="font-medium">Push Notifications</div>
                  <div className="text-sm text-gray-600">Receive real-time updates</div>
                </div>
              </div>
              <Badge className={getStatusColor(features.pushNotifications)}>
                {getStatusText(features.pushNotifications)}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(features.backgroundSync)}
                <div>
                  <div className="font-medium">Background Sync</div>
                  <div className="text-sm text-gray-600">Sync data when online</div>
                </div>
              </div>
              <Badge className={getStatusColor(features.backgroundSync)}>
                {getStatusText(features.backgroundSync)}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(features.shareTarget)}
                <div>
                  <div className="font-medium">Share Target</div>
                  <div className="text-sm text-gray-600">Receive shared content</div>
                </div>
              </div>
              <Badge className={getStatusColor(features.shareTarget)}>
                {getStatusText(features.shareTarget)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Push Notifications</div>
              <div className="text-sm text-gray-600">
                Receive appointment reminders, messages, and updates
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={notificationPermission === 'granted' ? 'default' : 'secondary'}>
                {notificationPermission === 'granted' ? 'Enabled' : 'Disabled'}
              </Badge>
              {notificationPermission !== 'granted' && (
                <Button onClick={requestNotificationPermission} size="sm">
                  Enable
                </Button>
              )}
            </div>
          </div>

          {notificationPermission === 'granted' && (
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Test Notification</div>
                <div className="text-sm text-gray-600">
                  Send a test notification to verify setup
                </div>
              </div>
              <Button onClick={sendTestNotification} variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Send Test
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Worker Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Monitor className="h-5 w-5 mr-2" />
            Service Worker Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Register Service Worker</div>
              <div className="text-sm text-gray-600">
                Enable offline functionality and background sync
              </div>
            </div>
            <Button onClick={registerServiceWorker} variant="outline" size="sm">
              Register
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            <p>
              Service Workers enable offline functionality, background sync, and push notifications.
              They run in the background even when the app is closed.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Installation Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Installation Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Desktop (Chrome/Edge)</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Click the install button above</li>
                <li>Or click the install icon in the address bar</li>
                <li>Or go to Menu → Install MindTrack</li>
              </ol>
            </div>

            <div>
              <h4 className="font-medium mb-2">Mobile (Android)</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Open in Chrome browser</li>
                <li>Tap the menu (three dots)</li>
                <li>Select "Add to Home screen"</li>
                <li>Tap "Add" to confirm</li>
              </ol>
            </div>

            <div>
              <h4 className="font-medium mb-2">Mobile (iOS)</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Open in Safari browser</li>
                <li>Tap the share button</li>
                <li>Select "Add to Home Screen"</li>
                <li>Tap "Add" to confirm</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
