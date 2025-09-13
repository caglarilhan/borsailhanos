"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Bell, 
  BellOff, 
  RefreshCw, 
  CheckCircle,
  XCircle,
  Clock,
  Database
} from 'lucide-react';
import { useMobileApp } from '@/hooks/useMobileApp';

export default function MobileAppDevelopment() {
  const {
    isOffline,
    lastSync,
    deviceId,
    appConfig,
    syncStatus,
    offlineData,
    syncData,
    updateAppConfig,
    toggleOfflineMode,
  } = useMobileApp();

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'syncing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      case 'syncing': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Smartphone className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Mobile App Development</h1>
          <p className="text-gray-600">React Native mobile app with offline capabilities and push notifications</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="offline">Offline Mode</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5" />
                  <span>App Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Device ID:</span>
                  <Badge variant="outline">{deviceId?.substring(0, 12)}...</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Platform:</span>
                  <Badge variant="secondary">React Native</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Version:</span>
                  <Badge variant="secondary">1.0.0</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant={isOffline ? "destructive" : "default"}>
                    {isOffline ? "Offline" : "Online"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RefreshCw className="h-5 w-5" />
                  <span>Sync Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  {getSyncStatusIcon(syncStatus)}
                  <span className={`text-sm font-medium ${getSyncStatusColor(syncStatus)}`}>
                    {syncStatus.charAt(0).toUpperCase() + syncStatus.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Sync:</span>
                  <span className="text-sm">
                    {lastSync ? new Date(lastSync).toLocaleString() : 'Never'}
                  </span>
                </div>
                <Button 
                  onClick={syncData} 
                  disabled={syncStatus === 'syncing'}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Now
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Offline Data</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Patients:</span>
                    <Badge variant="outline">{offlineData.patients.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Appointments:</span>
                    <Badge variant="outline">{offlineData.appointments.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Notes:</span>
                    <Badge variant="outline">{offlineData.notes.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Medications:</span>
                    <Badge variant="outline">{offlineData.medications.length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mobile App Features</CardTitle>
              <CardDescription>Comprehensive mobile app capabilities for healthcare professionals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Core Features</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Offline Mode Support</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Push Notifications</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Data Synchronization</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Biometric Authentication</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Advanced Features</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Real-time Sync</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Conflict Resolution</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Background Processing</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Secure Storage</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {isOffline ? <WifiOff className="h-5 w-5 text-red-600" /> : <Wifi className="h-5 w-5 text-green-600" />}
                <span>Offline Mode</span>
              </CardTitle>
              <CardDescription>Manage offline capabilities and data storage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Enable Offline Mode</h3>
                  <p className="text-sm text-gray-600">Allow app to work without internet connection</p>
                </div>
                <Switch
                  checked={appConfig.offlineMode}
                  onCheckedChange={toggleOfflineMode}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {appConfig.pushNotifications ? <Bell className="h-5 w-5 text-green-600" /> : <BellOff className="h-5 w-5 text-gray-600" />}
                <span>Push Notifications</span>
              </CardTitle>
              <CardDescription>Configure notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Enable Push Notifications</h3>
                  <p className="text-sm text-gray-600">Receive notifications for appointments and reminders</p>
                </div>
                <Switch
                  checked={appConfig.pushNotifications}
                  onCheckedChange={(checked) => updateAppConfig({ pushNotifications: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}