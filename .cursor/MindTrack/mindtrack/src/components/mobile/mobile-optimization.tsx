"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Smartphone, 
  Tablet, 
  Laptop, 
  Monitor, 
  Wifi, 
  WifiOff, 
  Signal, 
  SignalHigh, 
  SignalMedium, 
  SignalLow,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryHigh,
  BatteryEmpty,
  BatteryWarning,
  BatteryAlert,
  BatteryCheck,
  BatteryX,
  BatteryPlus,
  BatteryMinus,
  BatteryEdit,
  BatterySettings,
  BatteryRefresh,
  BatteryPlay,
  BatteryPause,
  BatteryStop,
  BatteryCopy,
  BatteryShare,
  BatteryDownload,
  BatteryUpload,
  BatteryFilter,
  BatterySearch,
  BatteryEye,
  BatteryEyeOff,
  BatteryLock,
  BatteryUnlock,
  BatteryShield,
  BatteryUser,
  BatteryUserCheck,
  BatteryUserX,
  BatteryPhone,
  BatteryMail,
  BatteryMessageSquare,
  BatteryBell,
  BatteryBellOff,
  BatteryBookOpen,
  BatteryFileText,
  BatteryFileCheck,
  BatteryFileX,
  BatteryFilePlus,
  BatteryFileMinus,
  BatteryFileEdit,
  BatteryFileAlertCircle,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Share2,
  Filter,
  Search,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Target,
  Star,
  Heart,
  Zap,
  Brain,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  User,
  Users,
  Building,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Server,
  Database,
  Cloud,
  Phone,
  Mail,
  MessageSquare,
  Bell,
  BellOff,
  BookOpen,
  FileText,
  FileCheck,
  FileX,
  FilePlus,
  FileMinus,
  FileEdit,
  FileAlertCircle
} from "lucide-react";

// Mobile Optimization için gerekli interface'ler
interface DeviceInfo {
  id: string;
  type: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  platform: 'ios' | 'android' | 'web' | 'desktop';
  screenSize: {
    width: number;
    height: number;
  };
  userAgent: string;
  connection: 'wifi' | '4g' | '3g' | '2g' | 'offline';
  batteryLevel?: number;
  isCharging?: boolean;
  lastSeen: Date;
  isActive: boolean;
}

interface PerformanceMetrics {
  id: string;
  deviceId: string;
  timestamp: Date;
  loadTime: number; // milliseconds
  renderTime: number; // milliseconds
  memoryUsage: number; // MB
  cpuUsage: number; // percentage
  networkLatency: number; // milliseconds
  cacheHitRate: number; // percentage
  errorRate: number; // percentage
  userSatisfaction: number; // 1-5 scale
}

interface OfflineCapability {
  id: string;
  feature: string;
  isAvailable: boolean;
  dataSize: number; // KB
  lastSync: Date;
  syncStatus: 'synced' | 'pending' | 'failed' | 'conflict';
  priority: 'high' | 'medium' | 'low';
}

interface PushNotification {
  id: string;
  title: string;
  body: string;
  type: 'appointment' | 'reminder' | 'message' | 'system' | 'marketing';
  priority: 'high' | 'normal' | 'low';
  scheduledFor: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  actionTaken?: string;
  deviceId: string;
  userId: string;
}

interface MobileAppConfig {
  id: string;
  version: string;
  buildNumber: string;
  minVersion: string;
  targetVersion: string;
  features: {
    offlineMode: boolean;
    pushNotifications: boolean;
    biometricAuth: boolean;
    darkMode: boolean;
    accessibility: boolean;
    voiceCommands: boolean;
    gestureNavigation: boolean;
  };
  settings: {
    autoSync: boolean;
    backgroundRefresh: boolean;
    locationServices: boolean;
    analytics: boolean;
    crashReporting: boolean;
  };
  lastUpdated: Date;
}

// Mobile Optimization Component - Mobil optimizasyon sistemi
export function MobileOptimization() {
  // State management - Uygulama durumunu yönetmek için
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics[]>([]);
  const [offlineCapabilities, setOfflineCapabilities] = useState<OfflineCapability[]>([]);
  const [pushNotifications, setPushNotifications] = useState<PushNotification[]>([]);
  const [appConfig, setAppConfig] = useState<MobileAppConfig | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeviceDetails, setShowDeviceDetails] = useState(false);
  const [showPerformanceReport, setShowPerformanceReport] = useState(false);
  const [showOfflineSettings, setShowOfflineSettings] = useState(false);

  // Mock data initialization - Test verilerini yüklemek için
  useEffect(() => {
    // Simulated data loading - Gerçek API'den veri çekme simülasyonu
    const mockDevices: DeviceInfo[] = [
      {
        id: '1',
        type: 'mobile',
        platform: 'ios',
        screenSize: { width: 375, height: 812 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        connection: 'wifi',
        batteryLevel: 85,
        isCharging: false,
        lastSeen: new Date(),
        isActive: true
      },
      {
        id: '2',
        type: 'mobile',
        platform: 'android',
        screenSize: { width: 360, height: 800 },
        userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G991B)',
        connection: '4g',
        batteryLevel: 45,
        isCharging: true,
        lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
        isActive: true
      },
      {
        id: '3',
        type: 'tablet',
        platform: 'ios',
        screenSize: { width: 768, height: 1024 },
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)',
        connection: 'wifi',
        batteryLevel: 92,
        isCharging: false,
        lastSeen: new Date(Date.now() - 600000), // 10 minutes ago
        isActive: false
      }
    ];

    const mockPerformanceMetrics: PerformanceMetrics[] = [
      {
        id: '1',
        deviceId: '1',
        timestamp: new Date(),
        loadTime: 1200,
        renderTime: 450,
        memoryUsage: 45.2,
        cpuUsage: 12.5,
        networkLatency: 85,
        cacheHitRate: 78.5,
        errorRate: 0.2,
        userSatisfaction: 4.5
      },
      {
        id: '2',
        deviceId: '2',
        timestamp: new Date(Date.now() - 300000),
        loadTime: 1800,
        renderTime: 620,
        memoryUsage: 52.8,
        cpuUsage: 18.3,
        networkLatency: 120,
        cacheHitRate: 65.2,
        errorRate: 0.8,
        userSatisfaction: 4.2
      }
    ];

    const mockOfflineCapabilities: OfflineCapability[] = [
      {
        id: '1',
        feature: 'Patient Records',
        isAvailable: true,
        dataSize: 2048,
        lastSync: new Date(),
        syncStatus: 'synced',
        priority: 'high'
      },
      {
        id: '2',
        feature: 'Appointment Calendar',
        isAvailable: true,
        dataSize: 512,
        lastSync: new Date(Date.now() - 600000),
        syncStatus: 'pending',
        priority: 'high'
      },
      {
        id: '3',
        feature: 'Analytics Dashboard',
        isAvailable: false,
        dataSize: 0,
        lastSync: new Date(Date.now() - 3600000),
        syncStatus: 'failed',
        priority: 'medium'
      }
    ];

    const mockPushNotifications: PushNotification[] = [
      {
        id: '1',
        title: 'Appointment Reminder',
        body: 'Your appointment with Dr. Ayşe Kaya is in 30 minutes',
        type: 'appointment',
        priority: 'high',
        scheduledFor: new Date(Date.now() + 1800000),
        deviceId: '1',
        userId: 'user_1'
      },
      {
        id: '2',
        title: 'New Message',
        body: 'You have a new message from your therapist',
        type: 'message',
        priority: 'normal',
        scheduledFor: new Date(),
        sentAt: new Date(),
        deliveredAt: new Date(Date.now() + 5000),
        deviceId: '1',
        userId: 'user_1'
      }
    ];

    const mockAppConfig: MobileAppConfig = {
      id: '1',
      version: '2.1.0',
      buildNumber: '210',
      minVersion: '1.5.0',
      targetVersion: '2.2.0',
      features: {
        offlineMode: true,
        pushNotifications: true,
        biometricAuth: true,
        darkMode: true,
        accessibility: true,
        voiceCommands: false,
        gestureNavigation: true
      },
      settings: {
        autoSync: true,
        backgroundRefresh: true,
        locationServices: false,
        analytics: true,
        crashReporting: true
      },
      lastUpdated: new Date()
    };

    setDevices(mockDevices);
    setPerformanceMetrics(mockPerformanceMetrics);
    setOfflineCapabilities(mockOfflineCapabilities);
    setPushNotifications(mockPushNotifications);
    setAppConfig(mockAppConfig);
  }, []);

  // Detect device capabilities - Cihaz yeteneklerini algılama
  const detectDeviceCapabilities = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    // Screen size detection - Ekran boyutu algılama
    const screenSize = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    // Device type detection - Cihaz tipi algılama
    let deviceType: DeviceInfo['type'] = 'unknown';
    if (screenSize.width < 768) deviceType = 'mobile';
    else if (screenSize.width < 1024) deviceType = 'tablet';
    else deviceType = 'desktop';
    
    // Platform detection - Platform algılama
    let platform: DeviceInfo['platform'] = 'web';
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) platform = 'ios';
    else if (/Android/.test(navigator.userAgent)) platform = 'android';
    else if (/Windows|Mac|Linux/.test(navigator.userAgent)) platform = 'desktop';
    
    // Connection detection - Bağlantı algılama
    let connection: DeviceInfo['connection'] = 'wifi';
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn.effectiveType === '4g') connection = '4g';
      else if (conn.effectiveType === '3g') connection = '3g';
      else if (conn.effectiveType === '2g') connection = '2g';
    }
    
    return {
      screenSize,
      deviceType,
      platform,
      connection,
      userAgent: navigator.userAgent
    };
  }, []);

  // Optimize for device - Cihaz için optimizasyon
  const optimizeForDevice = useCallback(async (deviceId: string) => {
    setLoading(true);
    
    try {
      // Simulated optimization - Optimizasyon simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const device = devices.find(d => d.id === deviceId);
      if (!device) throw new Error('Device not found');
      
      // Apply device-specific optimizations - Cihaza özel optimizasyonlar
      const optimizations = {
        imageCompression: device.type === 'mobile' ? 0.7 : 0.9,
        cacheStrategy: device.connection === 'wifi' ? 'aggressive' : 'conservative',
        preloadResources: device.type === 'mobile' ? false : true,
        lazyLoading: device.type === 'mobile' ? true : false,
        offlineMode: device.connection === 'offline' ? true : false
      };
      
      console.log('Applied optimizations:', optimizations);
      
      return optimizations;
      
    } catch (error) {
      console.error('Device optimization failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [devices]);

  // Monitor performance - Performans izleme
  const monitorPerformance = useCallback(async () => {
    setLoading(true);
    
    try {
      // Simulated performance monitoring - Performans izleme simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const startTime = performance.now();
      
      // Simulate performance metrics - Performans metrikleri simülasyonu
      const newMetrics: PerformanceMetrics = {
        id: `metric_${Date.now()}`,
        deviceId: 'current_device',
        timestamp: new Date(),
        loadTime: Math.random() * 2000 + 500,
        renderTime: Math.random() * 1000 + 200,
        memoryUsage: Math.random() * 100 + 20,
        cpuUsage: Math.random() * 50 + 5,
        networkLatency: Math.random() * 200 + 50,
        cacheHitRate: Math.random() * 100,
        errorRate: Math.random() * 5,
        userSatisfaction: Math.random() * 2 + 3
      };
      
      setPerformanceMetrics(prev => [newMetrics, ...prev]);
      
      const endTime = performance.now();
      console.log(`Performance monitoring completed in ${endTime - startTime}ms`);
      
      return newMetrics;
      
    } catch (error) {
      console.error('Performance monitoring failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send push notification - Push bildirimi gönderme
  const sendPushNotification = useCallback(async (
    title: string,
    body: string,
    type: PushNotification['type'],
    priority: PushNotification['priority'],
    deviceIds: string[]
  ) => {
    setLoading(true);
    
    try {
      // Simulated push notification sending - Push bildirimi gönderme simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newNotifications: PushNotification[] = deviceIds.map(deviceId => ({
        id: `push_${Date.now()}_${deviceId}`,
        title,
        body,
        type,
        priority,
        scheduledFor: new Date(),
        sentAt: new Date(),
        deliveredAt: new Date(Date.now() + 1000),
        deviceId,
        userId: 'current_user'
      }));
      
      setPushNotifications(prev => [...newNotifications, ...prev]);
      
      return newNotifications;
      
    } catch (error) {
      console.error('Push notification sending failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync offline data - Çevrimdışı veri senkronizasyonu
  const syncOfflineData = useCallback(async () => {
    setLoading(true);
    
    try {
      // Simulated offline sync - Çevrimdışı senkronizasyon simülasyonu
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const updatedCapabilities = offlineCapabilities.map(capability => ({
        ...capability,
        lastSync: new Date(),
        syncStatus: Math.random() > 0.1 ? 'synced' : 'failed' as const
      }));
      
      setOfflineCapabilities(updatedCapabilities);
      
      const syncedCount = updatedCapabilities.filter(c => c.syncStatus === 'synced').length;
      console.log(`Synced ${syncedCount} out of ${updatedCapabilities.length} features`);
      
      return { syncedCount, totalCount: updatedCapabilities.length };
      
    } catch (error) {
      console.error('Offline sync failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [offlineCapabilities]);

  // Calculate performance score - Performans skoru hesaplama
  const calculatePerformanceScore = useCallback(() => {
    if (performanceMetrics.length === 0) return 0;
    
    const latestMetrics = performanceMetrics[0];
    
    // Performance scoring algorithm - Performans puanlama algoritması
    let score = 100;
    
    // Load time penalty - Yükleme süresi cezası
    if (latestMetrics.loadTime > 2000) score -= 20;
    else if (latestMetrics.loadTime > 1000) score -= 10;
    
    // Render time penalty - Render süresi cezası
    if (latestMetrics.renderTime > 500) score -= 15;
    else if (latestMetrics.renderTime > 300) score -= 8;
    
    // Memory usage penalty - Bellek kullanımı cezası
    if (latestMetrics.memoryUsage > 80) score -= 15;
    else if (latestMetrics.memoryUsage > 60) score -= 8;
    
    // Network latency penalty - Ağ gecikmesi cezası
    if (latestMetrics.networkLatency > 150) score -= 10;
    else if (latestMetrics.networkLatency > 100) score -= 5;
    
    // Error rate penalty - Hata oranı cezası
    if (latestMetrics.errorRate > 2) score -= 20;
    else if (latestMetrics.errorRate > 1) score -= 10;
    
    // User satisfaction bonus - Kullanıcı memnuniyeti bonusu
    if (latestMetrics.userSatisfaction >= 4.5) score += 10;
    else if (latestMetrics.userSatisfaction >= 4.0) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }, [performanceMetrics]);

  const performanceScore = calculatePerformanceScore();

  return (
    <div className="space-y-6">
      {/* Header Section - Başlık Bölümü */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📱 Mobile Optimization</h2>
          <p className="text-gray-600">Cross-platform mobile experience and performance optimization</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Smartphone className="h-3 w-3 mr-1" />
            {devices.filter(d => d.isActive).length} Active Devices
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            {performanceScore}% Performance Score
          </Badge>
        </div>
      </div>

      {/* Device Overview - Cihaz Genel Bakış */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.filter(d => d.isActive).length}</div>
            <p className="text-xs text-muted-foreground">
              {devices.filter(d => d.type === 'mobile').length} mobile, {devices.filter(d => d.type === 'tablet').length} tablet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceScore}%</div>
            <p className="text-xs text-muted-foreground">
              {performanceScore >= 80 ? 'Excellent' : performanceScore >= 60 ? 'Good' : 'Needs improvement'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline Sync</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {offlineCapabilities.filter(c => c.syncStatus === 'synced').length}/{offlineCapabilities.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Features synchronized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Push Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pushNotifications.length}</div>
            <p className="text-xs text-muted-foreground">
              {pushNotifications.filter(n => n.deliveredAt).length} delivered today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Device Management - Cihaz Yönetimi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Smartphone className="h-5 w-5 mr-2" />
              Connected Devices
            </div>
            <Button
              onClick={monitorPerformance}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Activity className="h-4 w-4 mr-2" />
              )}
              Monitor Performance
            </Button>
          </CardTitle>
          <CardDescription>
            Monitor and optimize performance across all connected devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {device.type === 'mobile' && <Smartphone className="h-5 w-5 text-blue-600" />}
                    {device.type === 'tablet' && <Tablet className="h-5 w-5 text-green-600" />}
                    {device.type === 'desktop' && <Laptop className="h-5 w-5 text-purple-600" />}
                    <div>
                      <div className="font-semibold">
                        {device.platform === 'ios' ? 'iOS' : device.platform === 'android' ? 'Android' : 'Web'} Device
                      </div>
                      <div className="text-sm text-gray-600">
                        {device.screenSize.width}x{device.screenSize.height} • {device.connection}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Battery className="h-4 w-4" />
                    <span className="text-sm">{device.batteryLevel}%</span>
                    {device.isCharging && <BatteryCharging className="h-4 w-4 text-green-500" />}
                  </div>
                  <Badge variant={device.isActive ? 'default' : 'secondary'}>
                    {device.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => optimizeForDevice(device.id)}
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Optimize
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics - Performans Metrikleri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Performance Metrics
          </CardTitle>
          <CardDescription>
            Real-time performance monitoring and optimization insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceMetrics.slice(0, 3).map((metric) => (
              <div key={metric.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">Performance Snapshot</div>
                    <div className="text-sm text-gray-600">
                      {metric.timestamp.toLocaleString()}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {metric.loadTime < 1000 ? 'Fast' : metric.loadTime < 2000 ? 'Normal' : 'Slow'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Load Time</div>
                    <div className="font-semibold">{metric.loadTime}ms</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Memory Usage</div>
                    <div className="font-semibold">{metric.memoryUsage.toFixed(1)}MB</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Network Latency</div>
                    <div className="font-semibold">{metric.networkLatency}ms</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">User Satisfaction</div>
                    <div className="font-semibold">{metric.userSatisfaction}/5</div>
                  </div>
                </div>
              </div>
            ))}
            
            {performanceMetrics.length === 0 && (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No performance data yet</p>
                <p className="text-sm text-gray-400">Click "Monitor Performance" to start collecting metrics</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Offline Capabilities - Çevrimdışı Yetenekler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <WifiOff className="h-5 w-5 mr-2" />
              Offline Capabilities
            </div>
            <Button
              onClick={syncOfflineData}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync Now
            </Button>
          </CardTitle>
          <CardDescription>
            Manage offline features and data synchronization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {offlineCapabilities.map((capability) => (
              <div key={capability.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {capability.isAvailable ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <div className="font-semibold">{capability.feature}</div>
                      <div className="text-sm text-gray-600">
                        {capability.dataSize}KB • Last sync: {capability.lastSync.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={
                      capability.syncStatus === 'synced' ? 'default' :
                      capability.syncStatus === 'pending' ? 'secondary' : 'destructive'
                    }
                  >
                    {capability.syncStatus}
                  </Badge>
                  <Badge variant="outline">
                    {capability.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications - Push Bildirimleri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Push Notifications
            </div>
            <Button
              onClick={() => sendPushNotification(
                'Test Notification',
                'This is a test push notification',
                'system',
                'normal',
                devices.filter(d => d.isActive).map(d => d.id)
              )}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Bell className="h-4 w-4 mr-2" />
              Send Test
            </Button>
          </CardTitle>
          <CardDescription>
            Manage push notifications and delivery tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pushNotifications.slice(0, 5).map((notification) => (
              <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {notification.type === 'appointment' && <Calendar className="h-4 w-4 text-blue-500" />}
                    {notification.type === 'message' && <MessageSquare className="h-4 w-4 text-green-500" />}
                    {notification.type === 'system' && <Settings className="h-4 w-4 text-gray-500" />}
                    <div>
                      <div className="font-semibold">{notification.title}</div>
                      <div className="text-sm text-gray-600">{notification.body}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={notification.priority === 'high' ? 'destructive' : 'secondary'}>
                    {notification.priority}
                  </Badge>
                  {notification.deliveredAt && (
                    <Badge variant="outline" className="text-green-600">
                      Delivered
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            
            {pushNotifications.length === 0 && (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No push notifications sent</p>
                <p className="text-sm text-gray-400">Send a test notification to see delivery tracking</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* App Configuration - Uygulama Yapılandırması */}
      {appConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              App Configuration
            </CardTitle>
            <CardDescription>
              Mobile app settings and feature configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">App Version</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current Version:</span>
                    <span className="font-semibold">{appConfig.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Build Number:</span>
                    <span className="font-semibold">{appConfig.buildNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Updated:</span>
                    <span className="font-semibold">{appConfig.lastUpdated.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Features</h4>
                <div className="space-y-2">
                  {Object.entries(appConfig.features).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <Badge variant={enabled ? 'default' : 'secondary'}>
                        {enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}







