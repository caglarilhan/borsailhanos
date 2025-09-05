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
  Link, 
  Network, 
  Database, 
  Globe, 
  Settings, 
  BarChart3,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Pause,
  Square,
  Download,
  Upload,
  Eye,
  EyeOff,
  Shield,
  Zap,
  Activity,
  TrendingUp,
  FileText,
  PieChart,
  LineChart,
  Target,
  Award,
  Star,
  Users,
  Server,
  Wifi,
  WifiOff,
  Plug,
  Unplug,
  ArrowRight,
  ArrowLeft,
  ArrowUpDown,
  Cloud,
  CloudOff,
  Lock,
  Unlock,
  Key,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  HardDrive,
  Cpu,
  MemoryStick
} from 'lucide-react';

// Interfaces
interface FHIRResource {
  id: string;
  resource_id: string;
  resource_type: 'Patient' | 'Practitioner' | 'Encounter' | 'Observation' | 'MedicationRequest' | 'DiagnosticReport' | 'Condition';
  fhir_version: string;
  resource_data: any;
  patient_id?: string;
  practitioner_id?: string;
  encounter_id?: string;
  created_at: string;
  updated_at: string;
  last_synced_at?: string;
  sync_status: 'synced' | 'pending' | 'failed' | 'conflict';
  sync_error?: string;
  version_number: number;
  is_active: boolean;
}

interface IntegrationConnection {
  id: string;
  connection_id: string;
  connection_name: string;
  source_system: string;
  target_system: string;
  connection_type: 'fhir' | 'api' | 'database' | 'file_transfer' | 'message_queue' | 'webhook';
  protocol_id?: string;
  api_standard_id?: string;
  endpoint_id?: string;
  authentication_config?: any;
  connection_config?: any;
  sync_frequency?: string;
  last_sync?: string;
  next_sync?: string;
  sync_status: 'active' | 'inactive' | 'error' | 'maintenance';
  error_count: number;
  last_error?: string;
  success_count: number;
  total_records_synced: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface DataSynchronizationLog {
  id: string;
  log_id: string;
  connection_id: string;
  sync_type: 'full_sync' | 'incremental_sync' | 'real_time_sync' | 'manual_sync';
  sync_direction: 'inbound' | 'outbound' | 'bidirectional';
  resource_type?: string;
  resource_count: number;
  success_count: number;
  error_count: number;
  sync_start_time: string;
  sync_end_time?: string;
  sync_duration_seconds?: number;
  sync_status: 'running' | 'completed' | 'failed' | 'cancelled';
  error_details?: string;
  sync_summary?: any;
  created_at: string;
}

interface InteroperabilityAnalytics {
  id: string;
  analysis_date: string;
  analysis_period_months: number;
  total_connections: number;
  active_connections: number;
  total_syncs: number;
  successful_syncs: number;
  failed_syncs: number;
  average_sync_time_seconds?: number;
  total_records_exchanged: number;
  data_quality_score?: number;
  system_uptime_percentage?: number;
  error_rate_percentage?: number;
  performance_metrics?: any;
  compliance_metrics?: any;
  cost_analysis?: any;
  created_at: string;
  updated_at: string;
}

// Mock data
const mockFHIRResources: FHIRResource[] = [
  {
    id: '1',
    resource_id: 'Patient-12345',
    resource_type: 'Patient',
    fhir_version: 'R4',
    resource_data: {
      resourceType: 'Patient',
      id: '12345',
      name: [{ use: 'official', family: 'Smith', given: ['John'] }],
      birthDate: '1980-01-15',
      gender: 'male'
    },
    patient_id: 'patient-1',
    practitioner_id: 'practitioner-1',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    last_synced_at: '2024-01-15T10:05:00Z',
    sync_status: 'synced',
    version_number: 1,
    is_active: true
  },
  {
    id: '2',
    resource_id: 'Practitioner-67890',
    resource_type: 'Practitioner',
    fhir_version: 'R4',
    resource_data: {
      resourceType: 'Practitioner',
      id: '67890',
      name: [{ use: 'official', family: 'Johnson', given: ['Dr. Sarah'] }],
      qualification: [{ code: { coding: [{ system: 'http://nucc.org/provider-taxonomy', code: '2084P0800X' }] } }]
    },
    practitioner_id: 'practitioner-1',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    last_synced_at: '2024-01-15T10:05:00Z',
    sync_status: 'synced',
    version_number: 1,
    is_active: true
  }
];

const mockIntegrationConnections: IntegrationConnection[] = [
  {
    id: '1',
    connection_id: 'CONN-001',
    connection_name: 'Epic EHR Integration',
    source_system: 'MindTrack',
    target_system: 'Epic EHR',
    connection_type: 'fhir',
    sync_frequency: 'real_time',
    last_sync: '2024-01-20T15:30:00Z',
    next_sync: '2024-01-20T15:31:00Z',
    sync_status: 'active',
    error_count: 0,
    success_count: 1250,
    total_records_synced: 1250,
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T15:30:00Z'
  },
  {
    id: '2',
    connection_id: 'CONN-002',
    connection_name: 'Cerner Lab System',
    source_system: 'MindTrack',
    target_system: 'Cerner Lab',
    connection_type: 'api',
    sync_frequency: 'hourly',
    last_sync: '2024-01-20T15:00:00Z',
    next_sync: '2024-01-20T16:00:00Z',
    sync_status: 'active',
    error_count: 2,
    last_error: 'Connection timeout',
    success_count: 98,
    total_records_synced: 100,
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T15:00:00Z'
  }
];

const mockDataSynchronizationLogs: DataSynchronizationLog[] = [
  {
    id: '1',
    log_id: 'SYNC-001',
    connection_id: 'CONN-001',
    sync_type: 'real_time_sync',
    sync_direction: 'bidirectional',
    resource_type: 'Patient',
    resource_count: 5,
    success_count: 5,
    error_count: 0,
    sync_start_time: '2024-01-20T15:30:00Z',
    sync_end_time: '2024-01-20T15:30:15Z',
    sync_duration_seconds: 15,
    sync_status: 'completed',
    sync_summary: { records_processed: 5, records_updated: 2, records_created: 3 },
    created_at: '2024-01-20T15:30:00Z'
  },
  {
    id: '2',
    log_id: 'SYNC-002',
    connection_id: 'CONN-002',
    sync_type: 'incremental_sync',
    sync_direction: 'inbound',
    resource_type: 'Observation',
    resource_count: 100,
    success_count: 98,
    error_count: 2,
    sync_start_time: '2024-01-20T15:00:00Z',
    sync_end_time: '2024-01-20T15:02:30Z',
    sync_duration_seconds: 150,
    sync_status: 'completed',
    error_details: '2 records failed validation',
    sync_summary: { records_processed: 100, records_updated: 98, records_failed: 2 },
    created_at: '2024-01-20T15:00:00Z'
  }
];

const mockInteroperabilityAnalytics: InteroperabilityAnalytics[] = [
  {
    id: '1',
    analysis_date: '2024-01-20',
    analysis_period_months: 12,
    total_connections: 8,
    active_connections: 6,
    total_syncs: 1250,
    successful_syncs: 1180,
    failed_syncs: 70,
    average_sync_time_seconds: 45.5,
    total_records_exchanged: 50000,
    data_quality_score: 96.5,
    system_uptime_percentage: 99.5,
    error_rate_percentage: 5.6,
    performance_metrics: {
      average_response_time_ms: 150.0,
      peak_throughput_per_hour: 10000,
      concurrent_connections: 50,
      data_volume_gb_per_day: 25.5
    },
    compliance_metrics: {
      hipaa_compliance: 100.0,
      fhir_compliance: 98.5,
      api_standards_compliance: 95.0,
      security_compliance: 99.0
    },
    cost_analysis: {
      integration_cost_per_month: 2500.0,
      data_transfer_cost: 150.0,
      maintenance_cost: 500.0,
      total_cost_savings: 15000.0
    },
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z'
  }
];

// Helper functions
const getResourceTypeIcon = (type: string) => {
  switch (type) {
    case 'Patient': return <Users className="h-4 w-4" />;
    case 'Practitioner': return <Award className="h-4 w-4" />;
    case 'Encounter': return <Calendar className="h-4 w-4" />;
    case 'Observation': return <Activity className="h-4 w-4" />;
    case 'MedicationRequest': return <Pill className="h-4 w-4" />;
    case 'DiagnosticReport': return <FileText className="h-4 w-4" />;
    case 'Condition': return <AlertTriangle className="h-4 w-4" />;
    default: return <Database className="h-4 w-4" />;
  }
};

const getConnectionTypeIcon = (type: string) => {
  switch (type) {
    case 'fhir': return <Link className="h-4 w-4" />;
    case 'api': return <Globe className="h-4 w-4" />;
    case 'database': return <Database className="h-4 w-4" />;
    case 'file_transfer': return <Upload className="h-4 w-4" />;
    case 'message_queue': return <ArrowUpDown className="h-4 w-4" />;
    case 'webhook': return <Zap className="h-4 w-4" />;
    default: return <Network className="h-4 w-4" />;
  }
};

const getSyncStatusIcon = (status: string) => {
  switch (status) {
    case 'synced': return <CheckCircle className="h-4 w-4" />;
    case 'pending': return <Clock className="h-4 w-4" />;
    case 'failed': return <AlertTriangle className="h-4 w-4" />;
    case 'conflict': return <AlertTriangle className="h-4 w-4" />;
    case 'active': return <Play className="h-4 w-4" />;
    case 'inactive': return <Pause className="h-4 w-4" />;
    case 'error': return <AlertTriangle className="h-4 w-4" />;
    case 'maintenance': return <Settings className="h-4 w-4" />;
    case 'running': return <RefreshCw className="h-4 w-4" />;
    case 'completed': return <CheckCircle className="h-4 w-4" />;
    case 'cancelled': return <Square className="h-4 w-4" />;
    default: return <Activity className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'synced': return 'default';
    case 'pending': return 'secondary';
    case 'failed': return 'destructive';
    case 'conflict': return 'destructive';
    case 'active': return 'default';
    case 'inactive': return 'secondary';
    case 'error': return 'destructive';
    case 'maintenance': return 'secondary';
    case 'running': return 'secondary';
    case 'completed': return 'default';
    case 'cancelled': return 'destructive';
    default: return 'outline';
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

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
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

export function InteroperabilityManagement() {
  const [fhirResources, setFhirResources] = useState<FHIRResource[]>(mockFHIRResources);
  const [integrationConnections, setIntegrationConnections] = useState<IntegrationConnection[]>(mockIntegrationConnections);
  const [dataSynchronizationLogs, setDataSynchronizationLogs] = useState<DataSynchronizationLog[]>(mockDataSynchronizationLogs);
  const [interoperabilityAnalytics, setInteroperabilityAnalytics] = useState<InteroperabilityAnalytics[]>(mockInteroperabilityAnalytics);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Overview stats
  const totalResources = fhirResources.length;
  const syncedResources = fhirResources.filter(resource => resource.sync_status === 'synced').length;
  const totalConnections = integrationConnections.length;
  const activeConnections = integrationConnections.filter(conn => conn.is_active && conn.sync_status === 'active').length;
  const totalSyncs = dataSynchronizationLogs.length;
  const successfulSyncs = dataSynchronizationLogs.filter(log => log.sync_status === 'completed').length;
  const systemUptime = interoperabilityAnalytics[0]?.system_uptime_percentage || 0;
  const dataQuality = interoperabilityAnalytics[0]?.data_quality_score || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Interoperability</h2>
          <p className="text-muted-foreground">
            Comprehensive interoperability and data exchange management for American psychiatrists
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Connection
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
            <CardTitle className="text-sm font-medium">FHIR Resources</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResources}</div>
            <p className="text-xs text-muted-foreground">
              {syncedResources} synced resources
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connections</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConnections}</div>
            <p className="text-xs text-muted-foreground">
              {activeConnections} active connections
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Syncs</CardTitle>
            <Sync className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSyncs}</div>
            <p className="text-xs text-muted-foreground">
              {successfulSyncs} successful syncs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(systemUptime)}</div>
            <p className="text-xs text-muted-foreground">
              Data quality: {formatPercentage(dataQuality)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fhir-resources">FHIR Resources</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="sync-logs">Sync Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent FHIR Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Recent FHIR Resources</CardTitle>
                <CardDescription>Latest synchronized resources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fhirResources.slice(0, 5).map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getResourceTypeIcon(resource.resource_type)}
                      <div>
                        <p className="font-medium">{resource.resource_id}</p>
                        <p className="text-sm text-muted-foreground">
                          {resource.resource_type} • FHIR {resource.fhir_version}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusColor(resource.sync_status)}>
                        {resource.sync_status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {resource.last_synced_at && formatDate(resource.last_synced_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Active Connections */}
            <Card>
              <CardHeader>
                <CardTitle>Active Connections</CardTitle>
                <CardDescription>Current integration connections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {integrationConnections.filter(conn => conn.is_active).map((connection) => (
                  <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getConnectionTypeIcon(connection.connection_type)}
                      <div>
                        <p className="font-medium">{connection.connection_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {connection.source_system} → {connection.target_system}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusColor(connection.sync_status)}>
                        {connection.sync_status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {connection.total_records_synced} records
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
              <CardTitle>Interoperability Analytics</CardTitle>
              <CardDescription>Key performance indicators and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {interoperabilityAnalytics.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatPercentage(interoperabilityAnalytics[0].compliance_metrics?.hipaa_compliance || 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">HIPAA Compliance</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPercentage(interoperabilityAnalytics[0].compliance_metrics?.fhir_compliance || 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">FHIR Compliance</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {interoperabilityAnalytics[0].performance_metrics?.average_response_time_ms || 0}ms
                    </div>
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {formatCurrency(interoperabilityAnalytics[0].cost_analysis?.total_cost_savings || 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Cost Savings</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FHIR Resources Tab */}
        <TabsContent value="fhir-resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>FHIR Resources</CardTitle>
              <CardDescription>FHIR-compliant resources and data exchange</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fhirResources.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getResourceTypeIcon(resource.resource_type)}
                      <div>
                        <h3 className="font-semibold">{resource.resource_id}</h3>
                        <p className="text-sm text-muted-foreground">
                          {resource.resource_type} • FHIR {resource.fhir_version} • Version {resource.version_number}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{resource.resource_type}</Badge>
                          <Badge variant="outline">FHIR {resource.fhir_version}</Badge>
                          {resource.patient_id && (
                            <Badge variant="outline">Patient Data</Badge>
                          )}
                          {resource.practitioner_id && (
                            <Badge variant="outline">Practitioner Data</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <Badge variant={getStatusColor(resource.sync_status)}>
                          {resource.sync_status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {resource.last_synced_at && formatDate(resource.last_synced_at)}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
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

        {/* Connections Tab */}
        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Connections</CardTitle>
              <CardDescription>Active data exchange connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrationConnections.map((connection) => (
                  <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getConnectionTypeIcon(connection.connection_type)}
                      <div>
                        <h3 className="font-semibold">{connection.connection_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {connection.source_system} → {connection.target_system}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{connection.connection_type}</Badge>
                          {connection.sync_frequency && (
                            <Badge variant="outline">{connection.sync_frequency}</Badge>
                          )}
                          <Badge variant="outline">{connection.total_records_synced} records</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <Badge variant={getStatusColor(connection.sync_status)}>
                          {connection.sync_status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {connection.last_sync && formatDate(connection.last_sync)}
                        </p>
                        {connection.error_count > 0 && (
                          <p className="text-xs text-red-600 mt-1">
                            {connection.error_count} errors
                          </p>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Logs Tab */}
        <TabsContent value="sync-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Synchronization Logs</CardTitle>
              <CardDescription>Detailed sync logs and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataSynchronizationLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getSyncStatusIcon(log.sync_status)}
                      <div>
                        <h3 className="font-semibold">{log.log_id}</h3>
                        <p className="text-sm text-muted-foreground">
                          {log.sync_type.replace('_', ' ')} • {log.sync_direction} • {log.resource_type}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{log.sync_type.replace('_', ' ')}</Badge>
                          <Badge variant="outline">{log.sync_direction}</Badge>
                          <Badge variant="outline">{log.resource_count} resources</Badge>
                          {log.sync_duration_seconds && (
                            <Badge variant="outline">{formatDuration(log.sync_duration_seconds)}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <Badge variant={getStatusColor(log.sync_status)}>
                          {log.sync_status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(log.sync_start_time)}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          {log.success_count} success, {log.error_count} errors
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
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

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interoperability Analytics</CardTitle>
              <CardDescription>Performance metrics and compliance analytics</CardDescription>
            </CardHeader>
            <CardContent>
              {interoperabilityAnalytics.length > 0 && (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {interoperabilityAnalytics[0].total_connections}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Connections</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {interoperabilityAnalytics[0].active_connections}
                      </div>
                      <p className="text-sm text-muted-foreground">Active Connections</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {interoperabilityAnalytics[0].total_syncs.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Syncs</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {interoperabilityAnalytics[0].total_records_exchanged.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">Records Exchanged</p>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-green-600">
                          {interoperabilityAnalytics[0].performance_metrics?.average_response_time_ms || 0}ms
                        </div>
                        <p className="text-sm text-muted-foreground">Avg Response Time</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-blue-600">
                          {interoperabilityAnalytics[0].performance_metrics?.peak_throughput_per_hour?.toLocaleString() || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">Peak Throughput/hr</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-purple-600">
                          {interoperabilityAnalytics[0].performance_metrics?.concurrent_connections || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">Concurrent Connections</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-orange-600">
                          {interoperabilityAnalytics[0].performance_metrics?.data_volume_gb_per_day || 0}GB
                        </div>
                        <p className="text-sm text-muted-foreground">Data Volume/Day</p>
                      </div>
                    </div>
                  </div>

                  {/* Compliance Metrics */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Compliance Metrics</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-green-600">
                          {formatPercentage(interoperabilityAnalytics[0].compliance_metrics?.hipaa_compliance || 0)}
                        </div>
                        <p className="text-sm text-muted-foreground">HIPAA Compliance</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-blue-600">
                          {formatPercentage(interoperabilityAnalytics[0].compliance_metrics?.fhir_compliance || 0)}
                        </div>
                        <p className="text-sm text-muted-foreground">FHIR Compliance</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-purple-600">
                          {formatPercentage(interoperabilityAnalytics[0].compliance_metrics?.api_standards_compliance || 0)}
                        </div>
                        <p className="text-sm text-muted-foreground">API Standards</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-orange-600">
                          {formatPercentage(interoperabilityAnalytics[0].compliance_metrics?.security_compliance || 0)}
                        </div>
                        <p className="text-sm text-muted-foreground">Security Compliance</p>
                      </div>
                    </div>
                  </div>

                  {/* Cost Analysis */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Cost Analysis</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-green-600">
                          {formatCurrency(interoperabilityAnalytics[0].cost_analysis?.integration_cost_per_month || 0)}
                        </div>
                        <p className="text-sm text-muted-foreground">Integration Cost/Month</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-blue-600">
                          {formatCurrency(interoperabilityAnalytics[0].cost_analysis?.data_transfer_cost || 0)}
                        </div>
                        <p className="text-sm text-muted-foreground">Data Transfer Cost</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-purple-600">
                          {formatCurrency(interoperabilityAnalytics[0].cost_analysis?.maintenance_cost || 0)}
                        </div>
                        <p className="text-sm text-muted-foreground">Maintenance Cost</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-orange-600">
                          {formatCurrency(interoperabilityAnalytics[0].cost_analysis?.total_cost_savings || 0)}
                        </div>
                        <p className="text-sm text-muted-foreground">Total Cost Savings</p>
                      </div>
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
