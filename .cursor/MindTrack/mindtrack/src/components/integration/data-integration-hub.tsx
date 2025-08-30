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
  Database, 
  Link, 
  Link2, 
  LinkBreak, 
  LinkBreak2,
  Network, 
  Wifi, 
  WifiOff, 
  Signal, 
  SignalHigh, 
  SignalMedium, 
  SignalLow,
  Activity, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  Users,
  User,
  UserCheck,
  UserX,
  MessageSquare,
  Send,
  FileText,
  FilePlus,
  FileCheck,
  FileX,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Star,
  Heart,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Search,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Share2,
  Lock,
  Unlock,
  Shield,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  BookOpen,
  Settings2,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  LockKeyhole,
  UnlockKeyhole,
  EyeIcon,
  EyeOffIcon,
  AlertCircle,
  Info,
  HelpCircle,
  ExternalLink,
  Brain,
  BookOpen
} from "lucide-react";

// Data Integration & API Hub için gerekli interface'ler
interface ExternalSystem {
  id: string;
  name: string;
  type: 'ehr' | 'lab' | 'pharmacy' | 'imaging' | 'billing' | 'custom';
  vendor: string;
  status: 'connected' | 'disconnected' | 'error' | 'maintenance';
  connectionType: 'api' | 'hl7' | 'fhir' | 'custom';
  endpoint: string;
  credentials: {
    apiKey?: string;
    username?: string;
    password?: string;
    certificate?: string;
  };
  lastSync: Date;
  syncFrequency: string;
  dataMapping: {
    sourceField: string;
    targetField: string;
    transformation?: string;
  }[];
  metrics: {
    totalRecords: number;
    syncedRecords: number;
    failedRecords: number;
    lastSyncDuration: number;
    avgResponseTime: number;
  };
}

interface APIManagement {
  id: string;
  name: string;
  version: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  parameters: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  responseSchema: Record<string, unknown>;
  rateLimit: {
    requests: number;
    window: string;
  };
  authentication: 'none' | 'api_key' | 'oauth2' | 'jwt';
  status: 'active' | 'deprecated' | 'beta';
  usage: {
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    avgResponseTime: number;
  };
  documentation: string;
}

interface DataSyncJob {
  id: string;
  name: string;
  sourceSystem: string;
  targetSystem: string;
  syncType: 'full' | 'incremental' | 'real-time';
  schedule: string;
  status: 'running' | 'completed' | 'failed' | 'scheduled' | 'paused';
  lastRun: Date;
  nextRun: Date;
  progress: number; // 0-100
  recordsProcessed: number;
  recordsTotal: number;
  errors: {
    message: string;
    timestamp: Date;
    recordId?: string;
  }[];
  performance: {
    startTime: Date;
    endTime?: Date;
    duration?: number;
    recordsPerSecond: number;
  };
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  method: 'POST' | 'PUT' | 'PATCH';
  headers: Record<string, string>;
  authentication: {
    type: 'none' | 'basic' | 'bearer' | 'custom';
    credentials?: Record<string, string>;
  };
  status: 'active' | 'inactive' | 'error';
  retryPolicy: {
    maxRetries: number;
    backoffStrategy: 'linear' | 'exponential';
    retryDelay: number;
  };
  metrics: {
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    avgResponseTime: number;
    lastDelivery: Date;
  };
}

interface DataMapping {
  id: string;
  name: string;
  sourceSystem: string;
  targetSystem: string;
  mappingType: 'field' | 'object' | 'array' | 'custom';
  rules: {
    sourceField: string;
    targetField: string;
    transformation: 'direct' | 'format' | 'calculate' | 'lookup' | 'custom';
    transformationRule?: string;
    validation?: string;
    required: boolean;
  }[];
  validationRules: {
    field: string;
    rule: string;
    message: string;
  }[];
  isActive: boolean;
  lastUpdated: Date;
  version: string;
}

interface IntegrationEvent {
  id: string;
  timestamp: Date;
  eventType: 'sync_started' | 'sync_completed' | 'sync_failed' | 'api_call' | 'webhook_triggered' | 'error';
  source: string;
  target?: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  data?: Record<string, unknown>;
  resolved: boolean;
  resolution?: string;
}

// Data Integration & API Hub Component - Veri entegrasyonu ve API merkezi
export function DataIntegrationHub() {
  // State management - Uygulama durumunu yönetmek için
  const [externalSystems, setExternalSystems] = useState<ExternalSystem[]>([]);
  const [apiManagement, setApiManagement] = useState<APIManagement[]>([]);
  const [dataSyncJobs, setDataSyncJobs] = useState<DataSyncJob[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [dataMappings, setDataMappings] = useState<DataMapping[]>([]);
  const [integrationEvents, setIntegrationEvents] = useState<IntegrationEvent[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<ExternalSystem | null>(null);
  const [selectedAPI, setSelectedAPI] = useState<APIManagement | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateSystem, setShowCreateSystem] = useState(false);
  const [showCreateAPI, setShowCreateAPI] = useState(false);
  const [systemHealth, setSystemHealth] = useState('healthy');
  const [syncSuccessRate, setSyncSuccessRate] = useState(98.5);

  // Mock data initialization - Test verilerini yüklemek için
  useEffect(() => {
    // Simulated data loading - Gerçek API'den veri çekme simülasyonu
    const mockExternalSystems: ExternalSystem[] = [
      {
        id: '1',
        name: 'Epic EHR System',
        type: 'ehr',
        vendor: 'Epic Systems',
        status: 'connected',
        connectionType: 'fhir',
        endpoint: 'https://api.epic.com/fhir/r4',
        credentials: {
          apiKey: 'epic_***',
          certificate: 'epic_cert.pem'
        },
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
        syncFrequency: 'Every 15 minutes',
        dataMapping: [
          {
            sourceField: 'patient.id',
            targetField: 'patientId',
            transformation: 'direct'
          },
          {
            sourceField: 'patient.name',
            targetField: 'fullName',
            transformation: 'format'
          }
        ],
        metrics: {
          totalRecords: 15420,
          syncedRecords: 15280,
          failedRecords: 140,
          lastSyncDuration: 45,
          avgResponseTime: 280
        }
      },
      {
        id: '2',
        name: 'LabCorp Laboratory',
        type: 'lab',
        vendor: 'LabCorp',
        status: 'connected',
        connectionType: 'hl7',
        endpoint: 'https://api.labcorp.com/hl7',
        credentials: {
          username: 'labcorp_user',
          password: 'labcorp_***'
        },
        lastSync: new Date(Date.now() - 30 * 60 * 1000),
        syncFrequency: 'Every 30 minutes',
        dataMapping: [
          {
            sourceField: 'lab_result.test_code',
            targetField: 'testCode',
            transformation: 'direct'
          },
          {
            sourceField: 'lab_result.value',
            targetField: 'resultValue',
            transformation: 'calculate'
          }
        ],
        metrics: {
          totalRecords: 8920,
          syncedRecords: 8840,
          failedRecords: 80,
          lastSyncDuration: 30,
          avgResponseTime: 150
        }
      }
    ];

    const mockAPIManagement: APIManagement[] = [
      {
        id: '1',
        name: 'Patient Data API',
        version: 'v2.1',
        endpoint: '/api/patients',
        method: 'GET',
        description: 'Retrieve patient information and medical records',
        parameters: [
          {
            name: 'patientId',
            type: 'string',
            required: true,
            description: 'Unique patient identifier'
          },
          {
            name: 'includeHistory',
            type: 'boolean',
            required: false,
            description: 'Include medical history'
          }
        ],
        responseSchema: {
          patient: {
            id: 'string',
            name: 'string',
            dateOfBirth: 'string',
            medicalHistory: 'array'
          }
        },
        rateLimit: {
          requests: 1000,
          window: '1 hour'
        },
        authentication: 'oauth2',
        status: 'active',
        usage: {
          totalCalls: 15420,
          successfulCalls: 15280,
          failedCalls: 140,
          avgResponseTime: 180
        },
        documentation: 'https://docs.mindtrack.com/api/patients'
      },
      {
        id: '2',
        name: 'Appointment Management API',
        version: 'v1.8',
        endpoint: '/api/appointments',
        method: 'POST',
        description: 'Create and manage appointment schedules',
        parameters: [
          {
            name: 'patientId',
            type: 'string',
            required: true,
            description: 'Patient identifier'
          },
          {
            name: 'appointmentDate',
            type: 'string',
            required: true,
            description: 'Appointment date and time'
          }
        ],
        responseSchema: {
          appointment: {
            id: 'string',
            patientId: 'string',
            date: 'string',
            status: 'string'
          }
        },
        rateLimit: {
          requests: 500,
          window: '1 hour'
        },
        authentication: 'api_key',
        status: 'active',
        usage: {
          totalCalls: 8920,
          successfulCalls: 8840,
          failedCalls: 80,
          avgResponseTime: 220
        },
        documentation: 'https://docs.mindtrack.com/api/appointments'
      }
    ];

    const mockDataSyncJobs: DataSyncJob[] = [
      {
        id: '1',
        name: 'Patient Data Sync',
        sourceSystem: 'Epic EHR',
        targetSystem: 'MindTrack',
        syncType: 'incremental',
        schedule: 'Every 15 minutes',
        status: 'running',
        lastRun: new Date(Date.now() - 10 * 60 * 1000),
        nextRun: new Date(Date.now() + 5 * 60 * 1000),
        progress: 75,
        recordsProcessed: 150,
        recordsTotal: 200,
        errors: [
          {
            message: 'Invalid patient ID format',
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            recordId: 'patient_123'
          }
        ],
        performance: {
          startTime: new Date(Date.now() - 15 * 60 * 1000),
          duration: 45,
          recordsPerSecond: 3.3
        }
      }
    ];

    const mockWebhooks: Webhook[] = [
      {
        id: '1',
        name: 'Patient Update Webhook',
        url: 'https://external-system.com/webhook/patient-update',
        events: ['patient.created', 'patient.updated', 'patient.deleted'],
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'webhook_***'
        },
        authentication: {
          type: 'bearer',
          credentials: {
            token: 'bearer_***'
          }
        },
        status: 'active',
        retryPolicy: {
          maxRetries: 3,
          backoffStrategy: 'exponential',
          retryDelay: 1000
        },
        metrics: {
          totalDeliveries: 1247,
          successfulDeliveries: 1230,
          failedDeliveries: 17,
          avgResponseTime: 180,
          lastDelivery: new Date(Date.now() - 5 * 60 * 1000)
        }
      }
    ];

    const mockDataMappings: DataMapping[] = [
      {
        id: '1',
        name: 'Epic to MindTrack Patient Mapping',
        sourceSystem: 'Epic EHR',
        targetSystem: 'MindTrack',
        mappingType: 'object',
        rules: [
          {
            sourceField: 'patient.resource.id',
            targetField: 'patientId',
            transformation: 'direct',
            required: true
          },
          {
            sourceField: 'patient.resource.name[0].given',
            targetField: 'firstName',
            transformation: 'format',
            transformationRule: 'join(" ")',
            required: true
          }
        ],
        validationRules: [
          {
            field: 'patientId',
            rule: 'required',
            message: 'Patient ID is required'
          }
        ],
        isActive: true,
        lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000),
        version: '2.1'
      }
    ];

    const mockIntegrationEvents: IntegrationEvent[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        eventType: 'sync_started',
        source: 'Epic EHR',
        target: 'MindTrack',
        description: 'Patient data synchronization started',
        severity: 'info',
        resolved: true
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        eventType: 'error',
        source: 'LabCorp',
        description: 'Connection timeout during lab results sync',
        severity: 'warning',
        resolved: false
      }
    ];

    setExternalSystems(mockExternalSystems);
    setApiManagement(mockAPIManagement);
    setDataSyncJobs(mockDataSyncJobs);
    setWebhooks(mockWebhooks);
    setDataMappings(mockDataMappings);
    setIntegrationEvents(mockIntegrationEvents);
  }, []);

  // Connect external system - Harici sistem bağlantısı
  const connectExternalSystem = useCallback(async (
    name: string,
    type: ExternalSystem['type'],
    vendor: string,
    connectionType: ExternalSystem['connectionType'],
    endpoint: string,
    credentials: ExternalSystem['credentials']
  ) => {
    setLoading(true);
    
    try {
      // Simulated system connection - Sistem bağlantısı simülasyonu
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newSystem: ExternalSystem = {
        id: `system_${Date.now()}`,
        name,
        type,
        vendor,
        status: 'connected',
        connectionType,
        endpoint,
        credentials,
        lastSync: new Date(),
        syncFrequency: 'Every 30 minutes',
        dataMapping: [],
        metrics: {
          totalRecords: 0,
          syncedRecords: 0,
          failedRecords: 0,
          lastSyncDuration: 0,
          avgResponseTime: 0
        }
      };
      
      setExternalSystems(prev => [...prev, newSystem]);
      
      return newSystem;
      
    } catch (error) {
      console.error('System connection failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create API endpoint - API endpoint oluşturma
  const createAPIEndpoint = useCallback(async (
    name: string,
    version: string,
    endpoint: string,
    method: APIManagement['method'],
    description: string,
    parameters: APIManagement['parameters']
  ) => {
    setLoading(true);
    
    try {
      // Simulated API creation - API oluşturma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newAPI: APIManagement = {
        id: `api_${Date.now()}`,
        name,
        version,
        endpoint,
        method,
        description,
        parameters,
        responseSchema: {},
        rateLimit: {
          requests: 1000,
          window: '1 hour'
        },
        authentication: 'api_key',
        status: 'active',
        usage: {
          totalCalls: 0,
          successfulCalls: 0,
          failedCalls: 0,
          avgResponseTime: 0
        },
        documentation: `https://docs.mindtrack.com/api/${endpoint}`
      };
      
      setApiManagement(prev => [...prev, newAPI]);
      
      return newAPI;
      
    } catch (error) {
      console.error('API creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Start data sync job - Veri senkronizasyon işi başlatma
  const startDataSyncJob = useCallback(async (jobId: string) => {
    setLoading(true);
    
    try {
      // Simulated sync job start - Senkronizasyon işi başlatma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setDataSyncJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'running', lastRun: new Date() }
          : job
      ));
      
    } catch (error) {
      console.error('Sync job start failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create webhook - Webhook oluşturma
  const createWebhook = useCallback(async (
    name: string,
    url: string,
    events: string[],
    method: Webhook['method'],
    headers: Record<string, string>
  ) => {
    setLoading(true);
    
    try {
      // Simulated webhook creation - Webhook oluşturma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      const newWebhook: Webhook = {
        id: `webhook_${Date.now()}`,
        name,
        url,
        events,
        method,
        headers,
        authentication: {
          type: 'none'
        },
        status: 'active',
        retryPolicy: {
          maxRetries: 3,
          backoffStrategy: 'exponential',
          retryDelay: 1000
        },
        metrics: {
          totalDeliveries: 0,
          successfulDeliveries: 0,
          failedDeliveries: 0,
          avgResponseTime: 0,
          lastDelivery: new Date()
        }
      };
      
      setWebhooks(prev => [...prev, newWebhook]);
      
      return newWebhook;
      
    } catch (error) {
      console.error('Webhook creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate integration metrics - Entegrasyon metriklerini hesaplama
  const calculateIntegrationMetrics = useCallback(() => {
    const totalSystems = externalSystems.length;
    const connectedSystems = externalSystems.filter(s => s.status === 'connected').length;
    const totalAPIs = apiManagement.length;
    const activeAPIs = apiManagement.filter(api => api.status === 'active').length;
    const totalSyncJobs = dataSyncJobs.length;
    const runningSyncJobs = dataSyncJobs.filter(job => job.status === 'running').length;
    const totalWebhooks = webhooks.length;
    const activeWebhooks = webhooks.filter(webhook => webhook.status === 'active').length;
    const totalMappings = dataMappings.length;
    const activeMappings = dataMappings.filter(mapping => mapping.isActive).length;
    
    const totalRecords = externalSystems.reduce((sum, system) => sum + system.metrics.totalRecords, 0);
    const syncedRecords = externalSystems.reduce((sum, system) => sum + system.metrics.syncedRecords, 0);
    const syncRate = totalRecords > 0 ? Math.round((syncedRecords / totalRecords) * 100) : 0;
    
    const totalAPICalls = apiManagement.reduce((sum, api) => sum + api.usage.totalCalls, 0);
    const successfulAPICalls = apiManagement.reduce((sum, api) => sum + api.usage.successfulCalls, 0);
    const apiSuccessRate = totalAPICalls > 0 ? Math.round((successfulAPICalls / totalAPICalls) * 100) : 0;
    
    return {
      totalSystems,
      connectedSystems,
      connectionRate: totalSystems > 0 ? Math.round((connectedSystems / totalSystems) * 100) : 0,
      totalAPIs,
      activeAPIs,
      totalSyncJobs,
      runningSyncJobs,
      totalWebhooks,
      activeWebhooks,
      totalMappings,
      activeMappings,
      totalRecords,
      syncedRecords,
      syncRate,
      totalAPICalls,
      successfulAPICalls,
      apiSuccessRate
    };
  }, [externalSystems, apiManagement, dataSyncJobs, webhooks, dataMappings]);

  const metrics = calculateIntegrationMetrics();

  return (
    <div className="space-y-6">
      {/* Header Section - Başlık Bölümü */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🔗 Data Integration & API Hub</h2>
          <p className="text-gray-600">External system integrations and API management</p>
        </div>
                 <div className="flex items-center space-x-2">
           <Badge variant="outline" className="bg-green-50 text-green-700">
             <Network className="h-3 w-3 mr-1" />
             {metrics.connectionRate}% Connected
           </Badge>
           <Badge variant="outline" className="bg-blue-50 text-blue-700">
             <Activity className="h-3 w-3 mr-1" />
             {metrics.syncRate}% Sync Rate
           </Badge>
           <Badge variant="outline" className="bg-purple-50 text-purple-700">
             <Link className="h-3 w-3 mr-1" />
             {metrics.apiSuccessRate}% API Success
           </Badge>
         </div>
      </div>

      {/* Integration Overview - Entegrasyon Genel Bakış */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">External Systems</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics.totalSystems}</div>
            <p className="text-xs text-blue-700">
              {metrics.connectedSystems} connected
            </p>
            <Progress value={metrics.connectionRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">API Endpoints</CardTitle>
            <Link className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{metrics.totalAPIs}</div>
            <p className="text-xs text-green-700">
              {metrics.activeAPIs} active
            </p>
            <Progress value={(metrics.activeAPIs / metrics.totalAPIs) * 100} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Sync Jobs</CardTitle>
            <RefreshCw className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{metrics.totalSyncJobs}</div>
            <p className="text-xs text-purple-700">
              {metrics.runningSyncJobs} running
            </p>
            <Progress value={(metrics.runningSyncJobs / metrics.totalSyncJobs) * 100} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Webhooks</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{metrics.totalWebhooks}</div>
            <p className="text-xs text-orange-700">
              {metrics.activeWebhooks} active
            </p>
            <Progress value={(metrics.activeWebhooks / metrics.totalWebhooks) * 100} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* External Systems - Harici Sistemler */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-blue-900">External Systems</span>
            </div>
            <Button
              onClick={() => setShowCreateSystem(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Connect System
            </Button>
          </CardTitle>
          <CardDescription className="text-blue-700">
            EHR, Lab, Pharmacy, and custom system integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {externalSystems.map((system) => (
              <div key={system.id} className="border border-blue-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-blue-900">{system.name}</div>
                    <div className="text-sm text-blue-600">
                      {system.vendor} • {system.connectionType.toUpperCase()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={system.status === 'connected' ? 'default' : 'destructive'} className="bg-blue-100 text-blue-800">
                      {system.status}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {system.type.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Connection Info</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Endpoint: {system.endpoint}</div>
                      <div>Last Sync: {system.lastSync.toLocaleDateString()}</div>
                      <div>Frequency: {system.syncFrequency}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Sync Metrics</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Total Records: {system.metrics.totalRecords.toLocaleString()}</div>
                      <div>Synced: {system.metrics.syncedRecords.toLocaleString()}</div>
                      <div>Failed: {system.metrics.failedRecords.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Performance</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Avg Response: {system.metrics.avgResponseTime}ms</div>
                      <div>Last Duration: {system.metrics.lastSyncDuration}s</div>
                      <div>Success Rate: {Math.round((system.metrics.syncedRecords / system.metrics.totalRecords) * 100)}%</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Management - API Yönetimi */}
      <Card className="border-2 border-green-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Link className="h-5 w-5 mr-2 text-green-600" />
              <span className="text-green-900">API Management</span>
            </div>
            <Button
              onClick={() => setShowCreateAPI(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create API
            </Button>
          </CardTitle>
          <CardDescription className="text-green-700">
            RESTful API endpoints and documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {apiManagement.map((api) => (
              <div key={api.id} className="border border-green-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-green-900">{api.name}</div>
                    <div className="text-sm text-green-600">
                      {api.method} {api.endpoint} • v{api.version}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={api.status === 'active' ? 'default' : 'secondary'} className="bg-green-100 text-green-800">
                      {api.status}
                    </Badge>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      {api.authentication}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">API Details</h4>
                    <p className="text-sm text-green-600 mb-2">{api.description}</p>
                    <div className="space-y-1 text-sm text-green-600">
                      <div>Rate Limit: {api.rateLimit.requests}/{api.rateLimit.window}</div>
                      <div>Parameters: {api.parameters.length}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Usage Metrics</h4>
                    <div className="space-y-1 text-sm text-green-600">
                      <div>Total Calls: {api.usage.totalCalls.toLocaleString()}</div>
                      <div>Success Rate: {Math.round((api.usage.successfulCalls / api.usage.totalCalls) * 100)}%</div>
                      <div>Avg Response: {api.usage.avgResponseTime}ms</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Sync Jobs - Veri Senkronizasyon İşleri */}
      <Card className="border-2 border-purple-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
          <CardTitle className="flex items-center">
            <RefreshCw className="h-5 w-5 mr-2 text-purple-600" />
            <span className="text-purple-900">Data Sync Jobs</span>
          </CardTitle>
          <CardDescription className="text-purple-700">
            Automated data synchronization and monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {dataSyncJobs.map((job) => (
              <div key={job.id} className="border border-purple-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-purple-900">{job.name}</div>
                    <div className="text-sm text-purple-600">
                      {job.sourceSystem} → {job.targetSystem} • {job.syncType}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={job.status === 'running' ? 'default' : 'secondary'} className="bg-purple-100 text-purple-800">
                      {job.status}
                    </Badge>
                    <Badge variant="outline" className="border-purple-300 text-purple-700">
                      {job.schedule}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">Progress</h4>
                    <div className="space-y-2">
                      <Progress value={job.progress} className="h-2" />
                      <div className="text-sm text-purple-600">
                        {job.recordsProcessed} / {job.recordsTotal} records
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">Schedule</h4>
                    <div className="space-y-1 text-sm text-purple-600">
                      <div>Last Run: {job.lastRun.toLocaleDateString()}</div>
                      <div>Next Run: {job.nextRun.toLocaleDateString()}</div>
                      <div>Errors: {job.errors.length}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">Performance</h4>
                    <div className="space-y-1 text-sm text-purple-600">
                      <div>Duration: {job.performance.duration || 'Running'}s</div>
                      <div>Records/sec: {job.performance.recordsPerSecond}</div>
                      <div>Status: {job.status}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhooks - Webhook'lar */}
      <Card className="border-2 border-orange-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200">
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-orange-600" />
            <span className="text-orange-900">Webhooks</span>
          </CardTitle>
          <CardDescription className="text-orange-700">
            Event-driven integrations and real-time notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="border border-orange-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-orange-900">{webhook.name}</div>
                    <div className="text-sm text-orange-600">
                      {webhook.method} {webhook.url}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'} className="bg-orange-100 text-orange-800">
                      {webhook.status}
                    </Badge>
                    <Badge variant="outline" className="border-orange-300 text-orange-700">
                      {webhook.events.length} events
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-orange-800">Events</h4>
                    <div className="space-y-1 text-sm text-orange-600">
                      {webhook.events.map((event, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1 text-orange-500" />
                          {event}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-orange-800">Delivery Metrics</h4>
                    <div className="space-y-1 text-sm text-orange-600">
                      <div>Total: {webhook.metrics.totalDeliveries.toLocaleString()}</div>
                      <div>Success: {webhook.metrics.successfulDeliveries.toLocaleString()}</div>
                      <div>Failed: {webhook.metrics.failedDeliveries.toLocaleString()}</div>
                      <div>Success Rate: {Math.round((webhook.metrics.successfulDeliveries / webhook.metrics.totalDeliveries) * 100)}%</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-orange-800">Configuration</h4>
                    <div className="space-y-1 text-sm text-orange-600">
                      <div>Auth: {webhook.authentication.type}</div>
                      <div>Retries: {webhook.retryPolicy.maxRetries}</div>
                      <div>Avg Response: {webhook.metrics.avgResponseTime}ms</div>
                      <div>Last Delivery: {webhook.metrics.lastDelivery.toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Events - Entegrasyon Olayları */}
      <Card className="border-2 border-gray-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-gray-600" />
            <span className="text-gray-900">Integration Events</span>
          </CardTitle>
          <CardDescription className="text-gray-700">
            Real-time integration monitoring and alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {integrationEvents.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">{event.eventType.replace('_', ' ').toUpperCase()}</div>
                    <div className="text-sm text-gray-600">
                      {event.source} {event.target ? `→ ${event.target}` : ''} • {event.timestamp.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={event.severity === 'error' ? 'destructive' : 'secondary'} className="bg-gray-100 text-gray-800">
                      {event.severity}
                    </Badge>
                    <Badge variant={event.resolved ? 'default' : 'outline'} className="bg-green-100 text-green-800">
                      {event.resolved ? 'Resolved' : 'Open'}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-gray-800">Description</h4>
                    <p className="text-sm text-gray-600">{event.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-gray-800">Status</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Severity: {event.severity}</div>
                      <div>Resolved: {event.resolved ? 'Yes' : 'No'}</div>
                      {event.resolution && <div>Resolution: {event.resolution}</div>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
                 </CardContent>
       </Card>

       {/* Data Mapping Management - Veri Eşleme Yönetimi */}
       <Card className="border-2 border-teal-100 shadow-lg">
         <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-200">
           <CardTitle className="flex items-center">
             <FileText className="h-5 w-5 mr-2 text-teal-600" />
             <span className="text-teal-900">Data Mapping Management</span>
           </CardTitle>
           <CardDescription className="text-teal-700">
             Field mapping and data transformation rules
           </CardDescription>
         </CardHeader>
         <CardContent className="p-6">
           <div className="space-y-4">
             {dataMappings.map((mapping) => (
               <div key={mapping.id} className="border border-teal-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex items-center justify-between mb-3">
                   <div>
                     <div className="font-semibold text-teal-900">{mapping.name}</div>
                     <div className="text-sm text-teal-600">
                       {mapping.sourceSystem} → {mapping.targetSystem} • {mapping.mappingType}
                     </div>
                   </div>
                   <div className="flex items-center space-x-2">
                     <Badge variant={mapping.isActive ? 'default' : 'secondary'} className="bg-teal-100 text-teal-800">
                       {mapping.isActive ? 'Active' : 'Inactive'}
                     </Badge>
                     <Badge variant="outline" className="border-teal-300 text-teal-700">
                       v{mapping.version}
                     </Badge>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <h4 className="font-semibold text-sm mb-2 text-teal-800">Mapping Rules</h4>
                     <div className="space-y-2">
                       {mapping.rules.slice(0, 3).map((rule, index) => (
                         <div key={index} className="text-sm text-teal-600 border-l-2 border-teal-300 pl-2">
                           <div className="font-medium">{rule.sourceField} → {rule.targetField}</div>
                           <div className="text-xs">Transformation: {rule.transformation}</div>
                           {rule.required && <div className="text-xs text-red-600">Required</div>}
                         </div>
                       ))}
                     </div>
                   </div>
                   
                   <div>
                     <h4 className="font-semibold text-sm mb-2 text-teal-800">Validation Rules</h4>
                     <div className="space-y-1 text-sm text-teal-600">
                       {mapping.validationRules.map((validation, index) => (
                         <div key={index} className="flex items-center">
                           <CheckCircle className="h-3 w-3 mr-1 text-teal-500" />
                           {validation.field}: {validation.rule}
                         </div>
                       ))}
                     </div>
                     
                     <h5 className="font-semibold text-sm mb-2 mt-3 text-teal-800">Status</h5>
                     <div className="space-y-1 text-sm text-teal-600">
                       <div>Active: {mapping.isActive ? 'Yes' : 'No'}</div>
                       <div>Version: {mapping.version}</div>
                       <div>Last Updated: {mapping.lastUpdated.toLocaleDateString()}</div>
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
