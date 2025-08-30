"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Wifi, 
  WifiOff, 
  Download, 
  Upload, 
  RefreshCw, 
  Bell, 
  BellOff, 
  Fingerprint, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Shield, 
  Zap, 
  Battery, 
  BatteryCharging, 
  BatteryFull, 
  BatteryLow, 
  Signal, 
  SignalHigh, 
  SignalMedium, 
  SignalLow, 
  SignalZero, 
  Play, 
  Pause, 
  Stop, 
  Settings, 
  Plus, 
  Minus, 
  Edit, 
  Trash2, 
  Copy, 
  Share2, 
  Save, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Clock, 
  Calendar, 
  User, 
  Users, 
  Star, 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  Flag, 
  Bookmark, 
  MessageSquare, 
  Phone, 
  Mail, 
  Video, 
  Camera, 
  CameraOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  RotateCw, 
  Maximize, 
  Minimize, 
  Fullscreen, 
  FullscreenExit, 
  Grid, 
  List, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  Menu, 
  MoreHorizontal, 
  MoreVertical, 
  X, 
  Check, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Target, 
  Brain, 
  BookOpen, 
  FileText, 
  Database, 
  Server, 
  Cloud, 
  Globe, 
  MapPin, 
  Navigation, 
  Compass, 
  Layers, 
  GitBranch, 
  Cpu, 
  HardDrive, 
  Memory, 
  Network, 
  Wifi2, 
  Bluetooth, 
  BluetoothOff, 
  Airplay, 
  Cast, 
  MonitorOff, 
  MonitorSpeaker, 
  Headphones, 
  Speaker, 
  SpeakerOff, 
  Radio, 
  Tv, 
  Gamepad2, 
  Controller, 
  Mouse, 
  Keyboard, 
  Printer, 
  Scanner, 
  Fax, 
  Archive, 
  Folder, 
  File, 
  FilePlus, 
  FileMinus, 
  FileEdit, 
  FileSearch, 
  FileDownload, 
  FileUpload, 
  FileShare, 
  FileLock, 
  FileUnlock, 
  FileHeart, 
  FileStar, 
  FileAward, 
  FileCrown, 
  FileZap, 
  FileTarget, 
  FileShield, 
  FileSettings, 
  FileInfo, 
  FileAlert, 
  FileCheckCircle, 
  FileXCircle, 
  FilePlusCircle, 
  FileMinusCircle, 
  FileEditCircle, 
  FileSearchCircle, 
  FileDownloadCircle, 
  FileUploadCircle, 
  FileShareCircle, 
  FileLockCircle, 
  FileUnlockCircle, 
  FileHeartCircle, 
  FileStarCircle, 
  FileAwardCircle, 
  FileCrownCircle, 
  FileZapCircle, 
  FileTargetCircle, 
  FileShieldCircle, 
  FileSettingsCircle, 
  FileInfoCircle, 
  FileAlertCircle
} from "lucide-react";

// Mobile App Development için gerekli interface'ler
interface MobileApp {
  id: string;
  name: string;
  platform: 'ios' | 'android' | 'cross-platform';
  version: string;
  status: 'development' | 'testing' | 'staging' | 'production' | 'maintenance';
  features: {
    name: string;
    description: string;
    status: 'planned' | 'in-development' | 'testing' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'critical';
  }[];
  performance: {
    appSize: number;
    launchTime: number;
    memoryUsage: number;
    batteryUsage: number;
    crashRate: number;
    userRating: number;
  };
  security: {
    biometricAuth: boolean;
    encryption: boolean;
    certificatePinning: boolean;
    jailbreakDetection: boolean;
    rootDetection: boolean;
    lastSecurityAudit: Date;
  };
  offline: {
    enabled: boolean;
    dataSync: boolean;
    offlineStorage: number;
    syncFrequency: string;
    lastSync: Date;
  };
  notifications: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    inAppEnabled: boolean;
    notificationTypes: string[];
  };
  analytics: {
    activeUsers: number;
    dailySessions: number;
    retentionRate: number;
    userEngagement: number;
    featureUsage: Record<string, number>;
  };
  deployment: {
    lastDeploy: Date;
    deploymentChannel: string;
    buildNumber: string;
    releaseNotes: string;
    rollbackVersion?: string;
  };
  createdDate: Date;
  updatedDate: Date;
}

interface MobileDevice {
  id: string;
  type: 'smartphone' | 'tablet' | 'wearable';
  platform: 'ios' | 'android' | 'web';
  model: string;
  osVersion: string;
  screenSize: string;
  resolution: string;
  status: 'active' | 'inactive' | 'testing' | 'maintenance';
  performance: {
    cpu: number;
    memory: number;
    storage: number;
    battery: number;
    network: string;
  };
  features: {
    biometric: boolean;
    camera: boolean;
    gps: boolean;
    bluetooth: boolean;
    nfc: boolean;
    fingerprint: boolean;
    faceId: boolean;
  };
  lastSeen: Date;
  appVersion: string;
  userAgent: string;
}

interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'reminder' | 'promotion' | 'emergency';
  target: 'all' | 'specific' | 'segment';
  recipients: string[];
  scheduledFor: Date;
  sentAt?: Date;
  status: 'scheduled' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  metadata: {
    campaignId?: string;
    deepLink?: string;
    imageUrl?: string;
    actionButtons?: string[];
  };
}

interface OfflineSync {
  id: string;
  userId: string;
  deviceId: string;
  dataType: 'patients' | 'appointments' | 'notes' | 'medications' | 'all';
  syncStatus: 'pending' | 'in-progress' | 'completed' | 'failed' | 'conflict';
  lastSync: Date;
  nextSync: Date;
  dataSize: number;
  recordsCount: number;
  conflicts: {
    field: string;
    localValue: string;
    serverValue: string;
    resolution: 'local' | 'server' | 'manual';
  }[];
  errors: {
    code: string;
    message: string;
    timestamp: Date;
  }[];
}

interface MobileAnalytics {
  id: string;
  date: Date;
  metrics: {
    activeUsers: number;
    newUsers: number;
    sessions: number;
    sessionDuration: number;
    screenViews: number;
    crashes: number;
    errors: number;
  };
  devices: {
    ios: number;
    android: number;
    web: number;
  };
  features: {
    feature: string;
    usage: number;
    engagement: number;
  }[];
  performance: {
    avgLoadTime: number;
    avgMemoryUsage: number;
    avgBatteryUsage: number;
    networkErrors: number;
  };
  userBehavior: {
    mostUsedFeature: string;
    avgSessionLength: number;
    retentionRate: number;
    churnRate: number;
  };
}

// Mobile App Development Component - Mobil uygulama geliştirme
export function MobileAppDevelopment() {
  // State management - Durum yönetimi
  const [mobileApps, setMobileApps] = useState<MobileApp[]>([]);
  const [mobileDevices, setMobileDevices] = useState<MobileDevice[]>([]);
  const [pushNotifications, setPushNotifications] = useState<PushNotification[]>([]);
  const [offlineSyncs, setOfflineSyncs] = useState<OfflineSync[]>([]);
  const [mobileAnalytics, setMobileAnalytics] = useState<MobileAnalytics | null>(null);
  const [selectedApp, setSelectedApp] = useState<MobileApp | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateApp, setShowCreateApp] = useState(false);
  const [showCreateNotification, setShowCreateNotification] = useState(false);
  const [appPerformance, setAppPerformance] = useState(95.8);

  // Mock data initialization - Test verilerini yükleme
  useEffect(() => {
    // Simulated data loading - Test verisi simülasyonu
    const mockMobileApps: MobileApp[] = [
      {
        id: '1',
        name: 'MindTrack Mobile',
        platform: 'cross-platform',
        version: '2.1.0',
        status: 'production',
        features: [
          {
            name: 'Patient Management',
            description: 'View and manage patient information',
            status: 'completed',
            priority: 'high'
          },
          {
            name: 'Appointment Scheduling',
            description: 'Schedule and manage appointments',
            status: 'completed',
            priority: 'high'
          },
          {
            name: 'Telehealth',
            description: 'Video conferencing for remote sessions',
            status: 'testing',
            priority: 'critical'
          },
          {
            name: 'Offline Mode',
            description: 'Work without internet connection',
            status: 'in-development',
            priority: 'medium'
          }
        ],
        performance: {
          appSize: 45.2,
          launchTime: 2.1,
          memoryUsage: 156,
          batteryUsage: 8.5,
          crashRate: 0.02,
          userRating: 4.8
        },
        security: {
          biometricAuth: true,
          encryption: true,
          certificatePinning: true,
          jailbreakDetection: true,
          rootDetection: true,
          lastSecurityAudit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        offline: {
          enabled: true,
          dataSync: true,
          offlineStorage: 512,
          syncFrequency: 'hourly',
          lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        notifications: {
          pushEnabled: true,
          emailEnabled: true,
          smsEnabled: false,
          inAppEnabled: true,
          notificationTypes: ['appointments', 'messages', 'reminders', 'alerts']
        },
        analytics: {
          activeUsers: 1250,
          dailySessions: 3400,
          retentionRate: 78.5,
          userEngagement: 85.2,
          featureUsage: {
            'Patient Management': 95,
            'Appointment Scheduling': 88,
            'Telehealth': 72,
            'Notes': 65
          }
        },
        deployment: {
          lastDeploy: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          deploymentChannel: 'App Store',
          buildNumber: '2.1.0.1234',
          releaseNotes: 'Bug fixes and performance improvements'
        },
        createdDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        updatedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockMobileDevices: MobileDevice[] = [
      {
        id: '1',
        type: 'smartphone',
        platform: 'ios',
        model: 'iPhone 15 Pro',
        osVersion: 'iOS 17.2',
        screenSize: '6.1 inch',
        resolution: '2556 x 1179',
        status: 'active',
        performance: {
          cpu: 85,
          memory: 72,
          storage: 45,
          battery: 78,
          network: '5G'
        },
        features: {
          biometric: true,
          camera: true,
          gps: true,
          bluetooth: true,
          nfc: true,
          fingerprint: false,
          faceId: true
        },
        lastSeen: new Date(Date.now() - 30 * 60 * 1000),
        appVersion: '2.1.0',
        userAgent: 'MindTrack/2.1.0 (iPhone; iOS 17.2; Scale/3.0)'
      }
    ];

    const mockPushNotifications: PushNotification[] = [
      {
        id: '1',
        title: 'New Appointment',
        message: 'You have a new appointment scheduled for tomorrow at 10:00 AM',
        type: 'reminder',
        target: 'specific',
        recipients: ['user_123', 'user_456'],
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'scheduled',
        deliveryRate: 98.5,
        openRate: 45.2,
        clickRate: 12.8,
        metadata: {
          campaignId: 'appointment_reminder_001',
          deepLink: 'mindtrack://appointment/12345',
          actionButtons: ['View', 'Reschedule', 'Cancel']
        }
      }
    ];

    const mockOfflineSyncs: OfflineSync[] = [
      {
        id: '1',
        userId: 'user_123',
        deviceId: 'device_456',
        dataType: 'all',
        syncStatus: 'completed',
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
        nextSync: new Date(Date.now() + 58 * 60 * 1000),
        dataSize: 15.2,
        recordsCount: 1250,
        conflicts: [],
        errors: []
      }
    ];

    const mockMobileAnalytics: MobileAnalytics = {
      id: '1',
      date: new Date(),
      metrics: {
        activeUsers: 1250,
        newUsers: 45,
        sessions: 3400,
        sessionDuration: 480,
        screenViews: 12500,
        crashes: 12,
        errors: 8
      },
      devices: {
        ios: 65,
        android: 30,
        web: 5
      },
      features: [
        {
          feature: 'Patient Management',
          usage: 95,
          engagement: 88
        },
        {
          feature: 'Appointment Scheduling',
          usage: 88,
          engagement: 82
        },
        {
          feature: 'Telehealth',
          usage: 72,
          engagement: 78
        }
      ],
      performance: {
        avgLoadTime: 2.1,
        avgMemoryUsage: 156,
        avgBatteryUsage: 8.5,
        networkErrors: 0.5
      },
      userBehavior: {
        mostUsedFeature: 'Patient Management',
        avgSessionLength: 480,
        retentionRate: 78.5,
        churnRate: 2.1
      }
    };

    setMobileApps(mockMobileApps);
    setMobileDevices(mockMobileDevices);
    setPushNotifications(mockPushNotifications);
    setOfflineSyncs(mockOfflineSyncs);
    setMobileAnalytics(mockMobileAnalytics);
  }, []);

  // Create mobile app - Mobil uygulama oluşturma
  const createMobileApp = useCallback(async (
    name: string,
    platform: MobileApp['platform'],
    features: string[]
  ) => {
    setLoading(true);
    
    try {
      // Simulated app creation - Uygulama oluşturma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newApp: MobileApp = {
        id: `app_${Date.now()}`,
        name,
        platform,
        version: '1.0.0',
        status: 'development',
        features: features.map(feature => ({
          name: feature,
          description: `${feature} feature`,
          status: 'planned',
          priority: 'medium'
        })),
        performance: {
          appSize: 0,
          launchTime: 0,
          memoryUsage: 0,
          batteryUsage: 0,
          crashRate: 0,
          userRating: 0
        },
        security: {
          biometricAuth: false,
          encryption: true,
          certificatePinning: false,
          jailbreakDetection: false,
          rootDetection: false,
          lastSecurityAudit: new Date()
        },
        offline: {
          enabled: false,
          dataSync: false,
          offlineStorage: 0,
          syncFrequency: 'daily',
          lastSync: new Date()
        },
        notifications: {
          pushEnabled: false,
          emailEnabled: false,
          smsEnabled: false,
          inAppEnabled: true,
          notificationTypes: []
        },
        analytics: {
          activeUsers: 0,
          dailySessions: 0,
          retentionRate: 0,
          userEngagement: 0,
          featureUsage: {}
        },
        deployment: {
          lastDeploy: new Date(),
          deploymentChannel: 'Development',
          buildNumber: '1.0.0.1',
          releaseNotes: 'Initial release'
        },
        createdDate: new Date(),
        updatedDate: new Date()
      };
      
      setMobileApps(prev => [newApp, ...prev]);
      
      return newApp;
      
    } catch (error) {
      console.error('Mobile app creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send push notification - Push bildirimi gönderme
  const sendPushNotification = useCallback(async (
    title: string,
    message: string,
    recipients: string[]
  ) => {
    setLoading(true);
    
    try {
      // Simulated notification sending - Bildirim gönderme simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newNotification: PushNotification = {
        id: `notification_${Date.now()}`,
        title,
        message,
        type: 'info',
        target: 'specific',
        recipients,
        scheduledFor: new Date(),
        sentAt: new Date(),
        status: 'sent',
        deliveryRate: 98.5,
        openRate: 0,
        clickRate: 0,
        metadata: {
          deepLink: 'mindtrack://notification',
          actionButtons: ['View', 'Dismiss']
        }
      };
      
      setPushNotifications(prev => [newNotification, ...prev]);
      
      return newNotification;
      
    } catch (error) {
      console.error('Push notification sending failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate mobile metrics - Mobil metriklerini hesaplama
  const calculateMobileMetrics = useCallback(() => {
    const totalApps = mobileApps.length;
    const productionApps = mobileApps.filter(app => app.status === 'production').length;
    const totalDevices = mobileDevices.length;
    const activeDevices = mobileDevices.filter(device => device.status === 'active').length;
    const totalNotifications = pushNotifications.length;
    const sentNotifications = pushNotifications.filter(notif => notif.status === 'sent').length;
    const totalSyncs = offlineSyncs.length;
    const completedSyncs = offlineSyncs.filter(sync => sync.syncStatus === 'completed').length;
    
    return {
      totalApps,
      productionApps,
      appProductionRate: totalApps > 0 ? Math.round((productionApps / totalApps) * 100) : 0,
      totalDevices,
      activeDevices,
      deviceActivationRate: totalDevices > 0 ? Math.round((activeDevices / totalDevices) * 100) : 0,
      totalNotifications,
      sentNotifications,
      notificationDeliveryRate: totalNotifications > 0 ? Math.round((sentNotifications / totalNotifications) * 100) : 0,
      totalSyncs,
      completedSyncs,
      syncSuccessRate: totalSyncs > 0 ? Math.round((completedSyncs / totalSyncs) * 100) : 0
    };
  }, [mobileApps, mobileDevices, pushNotifications, offlineSyncs]);

  const metrics = calculateMobileMetrics();

  return (
    <div className="space-y-6">
      {/* Header Section - Başlık Bölümü */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📱 Mobile App Development</h2>
          <p className="text-gray-600">Cross-platform mobile application development and management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Smartphone className="h-3 w-3 mr-1" />
            {metrics.productionApps} Production Apps
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Activity className="h-3 w-3 mr-1" />
            {appPerformance}% Performance
          </Badge>
        </div>
      </div>

      {/* Mobile Overview - Mobil Genel Bakış */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Mobile Apps</CardTitle>
            <Smartphone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics.productionApps}</div>
            <p className="text-xs text-blue-700">
              {metrics.totalApps} total apps
            </p>
            <Progress value={metrics.appProductionRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Active Devices</CardTitle>
            <Tablet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{metrics.activeDevices}</div>
            <p className="text-xs text-green-700">
              {metrics.totalDevices} total devices
            </p>
            <Progress value={metrics.deviceActivationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Push Notifications</CardTitle>
            <Bell className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{metrics.sentNotifications}</div>
            <p className="text-xs text-purple-700">
              {metrics.totalNotifications} total notifications
            </p>
            <Progress value={metrics.notificationDeliveryRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Offline Sync</CardTitle>
            <RefreshCw className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{metrics.completedSyncs}</div>
            <p className="text-xs text-orange-700">
              {metrics.totalSyncs} total syncs
            </p>
            <Progress value={metrics.syncSuccessRate} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Mobile Apps - Mobil Uygulamalar */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Smartphone className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-blue-900">Mobile Applications</span>
            </div>
            <Button
              onClick={() => setShowCreateApp(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create App
            </Button>
          </CardTitle>
          <CardDescription className="text-blue-700">
            Manage mobile applications and their features
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {mobileApps.map((app) => (
              <div key={app.id} className="border border-blue-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-blue-900">{app.name}</div>
                    <div className="text-sm text-blue-600">v{app.version} • {app.platform}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={app.status === 'production' ? 'default' : 'secondary'} className="bg-blue-100 text-blue-800">
                      {app.status}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {app.features.length} features
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      ⭐ {app.performance.userRating}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Performance</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Size: {app.performance.appSize} MB</div>
                      <div>Launch: {app.performance.launchTime}s</div>
                      <div>Memory: {app.performance.memoryUsage} MB</div>
                      <div>Battery: {app.performance.batteryUsage}%</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Security</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Biometric: {app.security.biometricAuth ? '✅' : '❌'}</div>
                      <div>Encryption: {app.security.encryption ? '✅' : '❌'}</div>
                      <div>Certificate Pinning: {app.security.certificatePinning ? '✅' : '❌'}</div>
                      <div>Jailbreak Detection: {app.security.jailbreakDetection ? '✅' : '❌'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Offline</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Enabled: {app.offline.enabled ? '✅' : '❌'}</div>
                      <div>Data Sync: {app.offline.dataSync ? '✅' : '❌'}</div>
                      <div>Storage: {app.offline.offlineStorage} MB</div>
                      <div>Sync: {app.offline.syncFrequency}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Analytics</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Active Users: {app.analytics.activeUsers}</div>
                      <div>Daily Sessions: {app.analytics.dailySessions}</div>
                      <div>Retention: {app.analytics.retentionRate}%</div>
                      <div>Engagement: {app.analytics.userEngagement}%</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Devices - Mobil Cihazlar */}
      <Card className="border-2 border-green-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Tablet className="h-5 w-5 mr-2 text-green-600" />
              <span className="text-green-900">Mobile Devices</span>
            </div>
            <Button
              onClick={() => setShowCreateNotification(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Bell className="h-4 w-4 mr-2" />
              Send Notification
            </Button>
          </CardTitle>
          <CardDescription className="text-green-700">
            Monitor connected mobile devices and their status
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {mobileDevices.map((device) => (
              <div key={device.id} className="border border-green-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-green-900">{device.model}</div>
                    <div className="text-sm text-green-600">{device.platform} • {device.osVersion}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={device.status === 'active' ? 'default' : 'secondary'} className="bg-green-100 text-green-800">
                      {device.status}
                    </Badge>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      {device.type}
                    </Badge>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      {device.resolution}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Performance</h4>
                    <div className="space-y-1 text-sm text-green-600">
                      <div>CPU: {device.performance.cpu}%</div>
                      <div>Memory: {device.performance.memory}%</div>
                      <div>Storage: {device.performance.storage}%</div>
                      <div>Battery: {device.performance.battery}%</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Features</h4>
                    <div className="space-y-1 text-sm text-green-600">
                      <div>Biometric: {device.features.biometric ? '✅' : '❌'}</div>
                      <div>Camera: {device.features.camera ? '✅' : '❌'}</div>
                      <div>GPS: {device.features.gps ? '✅' : '❌'}</div>
                      <div>Bluetooth: {device.features.bluetooth ? '✅' : '❌'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Info</h4>
                    <div className="space-y-1 text-sm text-green-600">
                      <div>Last Seen: {device.lastSeen.toLocaleDateString()}</div>
                      <div>App Version: {device.appVersion}</div>
                      <div>Network: {device.performance.network}</div>
                      <div>Screen: {device.screenSize}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
