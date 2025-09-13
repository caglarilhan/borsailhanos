'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Smartphone, 
  Watch, 
  Activity, 
  Heart, 
  Zap, 
  TrendingUp, 
  Users, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Download,
  Upload,
  Settings,
  Eye,
  EyeOff,
  Bell,
  Shield,
  Wifi,
  Battery,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  PieChart,
  LineChart,
  Target,
  Award,
  Star,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react';

// Interfaces
interface MobileApp {
  id: string;
  app_id: string;
  app_name: string;
  app_description?: string;
  app_type: 'patient_app' | 'provider_app' | 'monitoring_app' | 'education_app';
  platform: 'ios' | 'android' | 'web' | 'cross_platform';
  version: string;
  app_store_url?: string;
  play_store_url?: string;
  api_endpoint?: string;
  authentication_method?: string;
  features?: string[];
  permissions?: string[];
  privacy_policy_url?: string;
  terms_of_service_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface WearableDevice {
  id: string;
  device_id: string;
  device_name: string;
  device_type: 'smartwatch' | 'fitness_tracker' | 'heart_monitor' | 'sleep_tracker' | 'mood_tracker';
  manufacturer: string;
  model: string;
  platform: 'ios' | 'android' | 'web' | 'cross_platform';
  supported_metrics?: string[];
  data_types?: string[];
  connectivity?: string;
  battery_life_hours?: number;
  water_resistance?: string;
  price_range?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface MobileHealthData {
  id: string;
  patient_id: string;
  device_id?: string;
  data_type: 'heart_rate' | 'steps' | 'sleep' | 'mood' | 'medication_adherence' | 'symptoms';
  metric_name: string;
  metric_value?: number;
  metric_unit?: string;
  raw_data?: any;
  processed_data?: any;
  data_quality_score?: number;
  collection_timestamp: string;
  upload_timestamp: string;
  data_source?: string;
  is_validated: boolean;
  validation_notes?: string;
  created_at: string;
  updated_at: string;
}

interface RemotePatientMonitoring {
  id: string;
  monitoring_id: string;
  patient_id: string;
  practitioner_id: string;
  monitoring_type: 'continuous' | 'scheduled' | 'event_triggered' | 'on_demand';
  monitoring_frequency?: string;
  monitored_metrics: string[];
  alert_thresholds?: any;
  monitoring_start_date: string;
  monitoring_end_date?: string;
  is_active: boolean;
  patient_consent: boolean;
  consent_date?: string;
  data_sharing_level: string;
  monitoring_notes?: string;
  created_at: string;
  updated_at: string;
}

interface MobileHealthAnalytics {
  id: string;
  analysis_date: string;
  analysis_period_months: number;
  practitioner_id?: string;
  total_patients_monitored: number;
  total_devices_active: number;
  total_data_points_collected: number;
  average_data_quality_score?: number;
  patient_engagement_rate?: number;
  medication_adherence_rate?: number;
  symptom_tracking_completion_rate?: number;
  alert_response_time_avg_hours?: number;
  false_positive_rate?: number;
  patient_satisfaction_score?: number;
  cost_per_patient_monitored?: number;
  roi_percentage?: number;
  clinical_outcomes?: any;
  device_usage_statistics?: any;
  engagement_trends?: any;
  cost_effectiveness?: any;
  created_at: string;
  updated_at: string;
}

// Mock data
const mockMobileApps: MobileApp[] = [
  {
    id: '1',
    app_id: 'mindtrack-patient-v1',
    app_name: 'MindTrack Patient App',
    app_description: 'Comprehensive mental health tracking and medication management app for patients',
    app_type: 'patient_app',
    platform: 'cross_platform',
    version: '2.1.0',
    app_store_url: 'https://apps.apple.com/mindtrack',
    play_store_url: 'https://play.google.com/mindtrack',
    api_endpoint: 'https://api.mindtrack.com/v2',
    authentication_method: 'oauth',
    features: ['medication_reminders', 'symptom_tracking', 'mood_logging', 'appointment_scheduling'],
    permissions: ['notifications', 'location', 'camera', 'storage'],
    privacy_policy_url: 'https://mindtrack.com/privacy',
    terms_of_service_url: 'https://mindtrack.com/terms',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    app_id: 'mindtrack-provider-v1',
    app_name: 'MindTrack Provider Portal',
    app_description: 'Professional portal for psychiatrists and mental health providers',
    app_type: 'provider_app',
    platform: 'web',
    version: '3.0.0',
    api_endpoint: 'https://api.mindtrack.com/v3',
    authentication_method: 'jwt',
    features: ['patient_management', 'analytics', 'prescription_management', 'telehealth'],
    permissions: ['read_patient_data', 'write_prescriptions', 'access_analytics'],
    privacy_policy_url: 'https://mindtrack.com/privacy',
    terms_of_service_url: 'https://mindtrack.com/terms',
    is_active: true,
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-10T09:00:00Z'
  }
];

const mockWearableDevices: WearableDevice[] = [
  {
    id: '1',
    device_id: 'apple-watch-series-9',
    device_name: 'Apple Watch Series 9',
    device_type: 'smartwatch',
    manufacturer: 'Apple',
    model: 'Series 9',
    platform: 'ios',
    supported_metrics: ['heart_rate', 'steps', 'sleep', 'ecg', 'blood_oxygen'],
    data_types: ['continuous', 'spot_check', 'workout'],
    connectivity: 'bluetooth',
    battery_life_hours: 18,
    water_resistance: '50m',
    price_range: 'premium',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    device_id: 'fitbit-charge-6',
    device_name: 'Fitbit Charge 6',
    device_type: 'fitness_tracker',
    manufacturer: 'Fitbit',
    model: 'Charge 6',
    platform: 'cross_platform',
    supported_metrics: ['heart_rate', 'steps', 'sleep', 'stress', 'skin_temperature'],
    data_types: ['continuous', 'workout'],
    connectivity: 'bluetooth',
    battery_life_hours: 7,
    water_resistance: '50m',
    price_range: 'mid_range',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockMobileHealthData: MobileHealthData[] = [
  {
    id: '1',
    patient_id: 'patient-1',
    device_id: 'device-1',
    data_type: 'heart_rate',
    metric_name: 'Resting Heart Rate',
    metric_value: 72,
    metric_unit: 'bpm',
    data_quality_score: 95,
    collection_timestamp: '2024-01-20T08:00:00Z',
    upload_timestamp: '2024-01-20T08:05:00Z',
    data_source: 'Apple Watch Series 9',
    is_validated: true,
    validation_notes: 'Within normal range',
    created_at: '2024-01-20T08:05:00Z',
    updated_at: '2024-01-20T08:05:00Z'
  },
  {
    id: '2',
    patient_id: 'patient-1',
    device_id: 'device-1',
    data_type: 'sleep',
    metric_name: 'Sleep Duration',
    metric_value: 7.5,
    metric_unit: 'hours',
    data_quality_score: 88,
    collection_timestamp: '2024-01-20T06:30:00Z',
    upload_timestamp: '2024-01-20T06:35:00Z',
    data_source: 'Apple Watch Series 9',
    is_validated: true,
    validation_notes: 'Good sleep quality',
    created_at: '2024-01-20T06:35:00Z',
    updated_at: '2024-01-20T06:35:00Z'
  }
];

const mockRemotePatientMonitoring: RemotePatientMonitoring[] = [
  {
    id: '1',
    monitoring_id: 'monitor-001',
    patient_id: 'patient-1',
    practitioner_id: 'practitioner-1',
    monitoring_type: 'continuous',
    monitoring_frequency: 'real_time',
    monitored_metrics: ['heart_rate', 'sleep', 'medication_adherence', 'mood'],
    alert_thresholds: {
      heart_rate: { min: 50, max: 120 },
      sleep: { min: 6, max: 10 },
      medication_adherence: { min: 80 }
    },
    monitoring_start_date: '2024-01-15',
    is_active: true,
    patient_consent: true,
    consent_date: '2024-01-15',
    data_sharing_level: 'practitioner',
    monitoring_notes: 'High-risk patient requiring continuous monitoring',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
];

const mockMobileHealthAnalytics: MobileHealthAnalytics[] = [
  {
    id: '1',
    analysis_date: '2024-01-20',
    analysis_period_months: 12,
    practitioner_id: 'practitioner-1',
    total_patients_monitored: 45,
    total_devices_active: 38,
    total_data_points_collected: 125000,
    average_data_quality_score: 92.5,
    patient_engagement_rate: 87.3,
    medication_adherence_rate: 94.2,
    symptom_tracking_completion_rate: 78.9,
    alert_response_time_avg_hours: 2.3,
    false_positive_rate: 8.5,
    patient_satisfaction_score: 4.6,
    cost_per_patient_monitored: 45.0,
    roi_percentage: 350.0,
    clinical_outcomes: {
      improved_adherence: 85.0,
      reduced_hospitalizations: 25.0,
      better_symptom_control: 78.0,
      increased_patient_satisfaction: 92.0
    },
    device_usage_statistics: {
      smartwatch: { total_devices: 25, active_devices: 22, average_usage_hours: 14.5 },
      fitness_tracker: { total_devices: 20, active_devices: 16, average_usage_hours: 12.0 }
    },
    engagement_trends: {
      daily_active_users: 75.0,
      weekly_active_users: 85.0,
      monthly_active_users: 92.0,
      engagement_trend: 'increasing'
    },
    cost_effectiveness: {
      cost_per_patient_per_month: 45.0,
      savings_per_patient: 200.0,
      roi_percentage: 350.0
    },
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z'
  }
];

// Helper functions
const getAppTypeIcon = (type: string) => {
  switch (type) {
    case 'patient_app': return <Smartphone className="h-4 w-4" />;
    case 'provider_app': return <Users className="h-4 w-4" />;
    case 'monitoring_app': return <Activity className="h-4 w-4" />;
    case 'education_app': return <FileText className="h-4 w-4" />;
    default: return <Smartphone className="h-4 w-4" />;
  }
};

const getDeviceTypeIcon = (type: string) => {
  switch (type) {
    case 'smartwatch': return <Watch className="h-4 w-4" />;
    case 'fitness_tracker': return <Activity className="h-4 w-4" />;
    case 'heart_monitor': return <Heart className="h-4 w-4" />;
    case 'sleep_tracker': return <Clock className="h-4 w-4" />;
    case 'mood_tracker': return <TrendingUp className="h-4 w-4" />;
    default: return <Watch className="h-4 w-4" />;
  }
};

const getDataTypeIcon = (type: string) => {
  switch (type) {
    case 'heart_rate': return <Heart className="h-4 w-4" />;
    case 'steps': return <Activity className="h-4 w-4" />;
    case 'sleep': return <Clock className="h-4 w-4" />;
    case 'mood': return <TrendingUp className="h-4 w-4" />;
    case 'medication_adherence': return <CheckCircle className="h-4 w-4" />;
    case 'symptoms': return <AlertTriangle className="h-4 w-4" />;
    default: return <Activity className="h-4 w-4" />;
  }
};

const getMonitoringTypeIcon = (type: string) => {
  switch (type) {
    case 'continuous': return <Activity className="h-4 w-4" />;
    case 'scheduled': return <Calendar className="h-4 w-4" />;
    case 'event_triggered': return <Zap className="h-4 w-4" />;
    case 'on_demand': return <Eye className="h-4 w-4" />;
    default: return <Activity className="h-4 w-4" />;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

export function MobileHealthManagement() {
  const [mobileApps, setMobileApps] = useState<MobileApp[]>(mockMobileApps);
  const [wearableDevices, setWearableDevices] = useState<WearableDevice[]>(mockWearableDevices);
  const [mobileHealthData, setMobileHealthData] = useState<MobileHealthData[]>(mockMobileHealthData);
  const [remotePatientMonitoring, setRemotePatientMonitoring] = useState<RemotePatientMonitoring[]>(mockRemotePatientMonitoring);
  const [mobileHealthAnalytics, setMobileHealthAnalytics] = useState<MobileHealthAnalytics[]>(mockMobileHealthAnalytics);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Overview stats
  const totalApps = mobileApps.length;
  const activeApps = mobileApps.filter(app => app.is_active).length;
  const totalDevices = wearableDevices.length;
  const activeDevices = wearableDevices.filter(device => device.is_active).length;
  const totalDataPoints = mobileHealthData.length;
  const activeMonitoring = remotePatientMonitoring.filter(monitoring => monitoring.is_active).length;
  const averageDataQuality = mobileHealthData.reduce((sum, data) => sum + (data.data_quality_score || 0), 0) / mobileHealthData.length;
  const patientEngagementRate = mobileHealthAnalytics[0]?.patient_engagement_rate || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mobile Health (mHealth)</h2>
          <p className="text-muted-foreground">
            Comprehensive mobile health and wearable device integration for American psychiatrists
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mobile Apps</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApps}</div>
            <p className="text-xs text-muted-foreground">
              {activeApps} active apps
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wearable Devices</CardTitle>
            <Watch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDevices}</div>
            <p className="text-xs text-muted-foreground">
              {activeDevices} active devices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDataPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Quality score: {averageDataQuality.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Monitoring</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMonitoring}</div>
            <p className="text-xs text-muted-foreground">
              Engagement: {formatPercentage(patientEngagementRate)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mobile-apps">Mobile Apps</TabsTrigger>
          <TabsTrigger value="wearable-devices">Wearable Devices</TabsTrigger>
          <TabsTrigger value="health-data">Health Data</TabsTrigger>
          <TabsTrigger value="remote-monitoring">Remote Monitoring</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Mobile Health Data */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Health Data</CardTitle>
                <CardDescription>Latest data points from mobile devices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mobileHealthData.slice(0, 5).map((data) => (
                  <div key={data.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getDataTypeIcon(data.data_type)}
                      <div>
                        <p className="font-medium">{data.metric_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {data.metric_value} {data.metric_unit}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={data.is_validated ? "default" : "secondary"}>
                        {data.is_validated ? "Validated" : "Pending"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(data.collection_timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Active Monitoring */}
            <Card>
              <CardHeader>
                <CardTitle>Active Monitoring</CardTitle>
                <CardDescription>Patients currently being monitored</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {remotePatientMonitoring.filter(m => m.is_active).map((monitoring) => (
                  <div key={monitoring.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getMonitoringTypeIcon(monitoring.monitoring_type)}
                      <div>
                        <p className="font-medium">{monitoring.monitoring_id}</p>
                        <p className="text-sm text-muted-foreground">
                          {monitoring.monitoring_type} • {monitoring.monitoring_frequency}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={monitoring.patient_consent ? "default" : "destructive"}>
                        {monitoring.patient_consent ? "Consented" : "No Consent"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Started {formatDate(monitoring.monitoring_start_date)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Analytics Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Mobile Health Analytics</CardTitle>
              <CardDescription>Key performance indicators and trends</CardDescription>
            </CardHeader>
            <CardContent>
              {mobileHealthAnalytics.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatPercentage(mobileHealthAnalytics[0].medication_adherence_rate || 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Medication Adherence</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPercentage(mobileHealthAnalytics[0].symptom_tracking_completion_rate || 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Symptom Tracking</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {(mobileHealthAnalytics[0].alert_response_time_avg_hours || 0).toFixed(1)}h
                    </div>
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {formatCurrency(mobileHealthAnalytics[0].cost_per_patient_monitored || 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Cost per Patient</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mobile Apps Tab */}
        <TabsContent value="mobile-apps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mobile Applications</CardTitle>
              <CardDescription>Available mobile apps for patients and providers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mobileApps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getAppTypeIcon(app.app_type)}
                      <div>
                        <h3 className="font-semibold">{app.app_name}</h3>
                        <p className="text-sm text-muted-foreground">{app.app_description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{app.app_type.replace('_', ' ')}</Badge>
                          <Badge variant="outline">{app.platform}</Badge>
                          <Badge variant="outline">v{app.version}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={app.is_active ? "default" : "secondary"}>
                        {app.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wearable Devices Tab */}
        <TabsContent value="wearable-devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wearable Devices</CardTitle>
              <CardDescription>Supported wearable devices and their capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {wearableDevices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getDeviceTypeIcon(device.device_type)}
                      <div>
                        <h3 className="font-semibold">{device.device_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {device.manufacturer} {device.model}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{device.device_type.replace('_', ' ')}</Badge>
                          <Badge variant="outline">{device.platform}</Badge>
                          <Badge variant="outline">{device.price_range}</Badge>
                          {device.battery_life_hours && (
                            <Badge variant="outline">{device.battery_life_hours}h battery</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={device.is_active ? "default" : "secondary"}>
                        {device.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Data Tab */}
        <TabsContent value="health-data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mobile Health Data</CardTitle>
              <CardDescription>Data collected from mobile devices and apps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mobileHealthData.map((data) => (
                  <div key={data.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getDataTypeIcon(data.data_type)}
                      <div>
                        <h3 className="font-semibold">{data.metric_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {data.data_source} • {formatDate(data.collection_timestamp)}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{data.data_type.replace('_', ' ')}</Badge>
                          {data.data_quality_score && (
                            <Badge variant="outline">
                              Quality: {data.data_quality_score}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {data.metric_value} {data.metric_unit}
                      </div>
                      <Badge variant={data.is_validated ? "default" : "secondary"}>
                        {data.is_validated ? "Validated" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Remote Monitoring Tab */}
        <TabsContent value="remote-monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Remote Patient Monitoring</CardTitle>
              <CardDescription>Active monitoring programs for patients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {remotePatientMonitoring.map((monitoring) => (
                  <div key={monitoring.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getMonitoringTypeIcon(monitoring.monitoring_type)}
                      <div>
                        <h3 className="font-semibold">{monitoring.monitoring_id}</h3>
                        <p className="text-sm text-muted-foreground">
                          Started {formatDate(monitoring.monitoring_start_date)}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{monitoring.monitoring_type}</Badge>
                          <Badge variant="outline">{monitoring.monitoring_frequency}</Badge>
                          <Badge variant="outline">{monitoring.monitored_metrics.length} metrics</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={monitoring.is_active ? "default" : "secondary"}>
                        {monitoring.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant={monitoring.patient_consent ? "default" : "destructive"}>
                        {monitoring.patient_consent ? "Consented" : "No Consent"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mobile Health Analytics</CardTitle>
              <CardDescription>Performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              {mobileHealthAnalytics.length > 0 && (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {mobileHealthAnalytics[0].total_patients_monitored}
                      </div>
                      <p className="text-sm text-muted-foreground">Patients Monitored</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {mobileHealthAnalytics[0].total_devices_active}
                      </div>
                      <p className="text-sm text-muted-foreground">Active Devices</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {mobileHealthAnalytics[0].total_data_points_collected.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">Data Points</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatPercentage(mobileHealthAnalytics[0].roi_percentage || 0)}
                      </div>
                      <p className="text-sm text-muted-foreground">ROI</p>
                    </div>
                  </div>

                  {/* Clinical Outcomes */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Clinical Outcomes</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {Object.entries(mobileHealthAnalytics[0].clinical_outcomes || {}).map(([key, value]) => (
                        <div key={key} className="text-center p-4 border rounded-lg">
                          <div className="text-xl font-bold text-green-600">
                            {formatPercentage(value as number)}
                          </div>
                          <p className="text-sm text-muted-foreground capitalize">
                            {key.replace(/_/g, ' ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Device Usage Statistics */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Device Usage Statistics</h3>
                    <div className="space-y-4">
                      {Object.entries(mobileHealthAnalytics[0].device_usage_statistics || {}).map(([deviceType, stats]: [string, any]) => (
                        <div key={deviceType} className="p-4 border rounded-lg">
                          <h4 className="font-semibold capitalize mb-2">{deviceType.replace('_', ' ')}</h4>
                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="text-center">
                              <div className="text-lg font-bold">{stats.total_devices}</div>
                              <p className="text-sm text-muted-foreground">Total Devices</p>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold">{stats.active_devices}</div>
                              <p className="text-sm text-muted-foreground">Active Devices</p>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold">{stats.average_usage_hours}h</div>
                              <p className="text-sm text-muted-foreground">Avg Usage</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

