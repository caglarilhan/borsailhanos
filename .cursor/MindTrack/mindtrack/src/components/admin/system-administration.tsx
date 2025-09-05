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
  Settings, 
  Users, 
  Shield, 
  Database, 
  Server, 
  Globe, 
  Key, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Save, 
  RefreshCw, 
  Play, 
  Pause, 
  Square, 
  Plus, 
  Minus, 
  Edit, 
  Trash2, 
  Copy, 
  Download, 
  Upload, 
  Archive, 
  Bell,
  Calendar,
  Clock,
  User,
  Info,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bookmark,
  Share2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Printer,
  MapPin,
  Phone,
  Mail,
  Video,
  Image,
  File,
  Folder,
  BarChart,
  PieChart,
  LineChart,
  ScatterChart,
  AreaChart,
  Table,
  List,
  Grid,
  Columns,
  Rows,
  SortAsc,
  SortDesc,
  FilterIcon,
  Search as SearchIcon,
  Database as DatabaseIcon,
  BarChart3,
  TrendingUp,
  Target,
  Activity,
  Zap,
  Brain,
  BookOpen,
  Tag,
  MessageSquare,
  FileText,
  Cpu,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  XCircle,
  GitBranch,
  Layers,
  Filter,
  Search,
  MoreHorizontal
} from "lucide-react";

// System Administration & Configuration için gerekli interface'ler
interface SystemConfig {
  id: string;
  name: string;
  category: 'security' | 'performance' | 'database' | 'network' | 'application' | 'monitoring';
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  description: string;
  defaultValue: string;
  isRequired: boolean;
  isSensitive: boolean;
  validation: {
    pattern?: string;
    min?: number;
    max?: number;
    allowedValues?: string[];
  };
  environment: 'development' | 'staging' | 'production';
  lastModified: Date;
  modifiedBy: string;
  version: number;
  status: 'active' | 'inactive' | 'deprecated';
}

interface UserManagement {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'moderator' | 'viewer';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  permissions: {
    dashboard: boolean;
    analytics: boolean;
    patients: boolean;
    appointments: boolean;
    settings: boolean;
    admin: boolean;
  };
  security: {
    mfaEnabled: boolean;
    lastLogin: Date;
    failedAttempts: number;
    passwordExpiry: Date;
    ipWhitelist: string[];
  };
  profile: {
    avatar?: string;
    phone?: string;
    department?: string;
    title?: string;
    timezone: string;
    language: string;
  };
  activity: {
    lastActivity: Date;
    loginCount: number;
    sessionDuration: number;
    actions: {
      action: string;
      timestamp: Date;
      ip: string;
      userAgent: string;
    }[];
  };
  createdDate: Date;
  updatedDate: Date;
}

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  type: 'password' | 'session' | 'access' | 'data' | 'network';
  status: 'active' | 'inactive' | 'draft';
  rules: {
    rule: string;
    description: string;
    enforcement: 'strict' | 'moderate' | 'flexible';
    action: 'block' | 'warn' | 'log';
  }[];
  scope: {
    users: string[];
    roles: string[];
    resources: string[];
    environments: string[];
  };
  compliance: {
    standards: string[];
    requirements: string[];
    auditSchedule: string;
    lastAudit: Date;
  };
  monitoring: {
    enabled: boolean;
    alerts: {
      type: 'violation' | 'attempt' | 'success';
      threshold: number;
      action: string;
    }[];
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SystemHealth {
  id: string;
  timestamp: Date;
  status: 'healthy' | 'warning' | 'critical' | 'down';
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
    database: number;
  };
  services: {
    name: string;
    status: 'running' | 'stopped' | 'error' | 'starting';
    uptime: number;
    responseTime: number;
    errorRate: number;
  }[];
  alerts: {
    id: string;
    type: 'performance' | 'security' | 'availability' | 'error';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
    isResolved: boolean;
  }[];
  maintenance: {
    scheduled: boolean;
    startTime?: Date;
    endTime?: Date;
    description?: string;
    impact: 'none' | 'low' | 'medium' | 'high';
  };
}

interface AuditLog {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  resource: string;
  details: {
    before?: any;
    after?: any;
    changes?: string[];
  };
  ip: string;
  userAgent: string;
  sessionId: string;
  category: 'authentication' | 'authorization' | 'data-access' | 'configuration' | 'system';
  severity: 'info' | 'warning' | 'error' | 'critical';
  status: 'success' | 'failure' | 'pending';
  metadata: {
    requestId: string;
    duration: number;
    size: number;
  };
}

interface MaintenanceSchedule {
  id: string;
  title: string;
  description: string;
  type: 'routine' | 'emergency' | 'upgrade' | 'security' | 'backup';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  schedule: {
    startTime: Date;
    endTime: Date;
    duration: number;
    timezone: string;
  };
  impact: {
    systems: string[];
    users: number;
    downtime: number;
    description: string;
  };
  tasks: {
    step: number;
    task: string;
    description: string;
    estimatedTime: number;
    responsible: string;
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
  }[];
  notifications: {
    type: 'email' | 'sms' | 'in-app' | 'webhook';
    recipients: string[];
    message: string;
    sentAt?: Date;
  }[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SystemBackup {
  id: string;
  name: string;
  description: string;
  type: 'configuration' | 'database' | 'files' | 'full-system';
  status: 'scheduled' | 'running' | 'completed' | 'failed';
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'on-demand';
    time: string;
    timezone: string;
    isEnabled: boolean;
  };
  storage: {
    location: string;
    size: number;
    compression: boolean;
    encryption: boolean;
  };
  retention: {
    policy: string;
    days: number;
    versions: number;
  };
  verification: {
    enabled: boolean;
    lastVerified: Date;
    integrity: boolean;
    restoreTest: boolean;
  };
  metadata: {
    createdDate: Date;
    lastBackup: Date;
    nextBackup: Date;
    createdBy: string;
  };
}

// System Administration & Configuration Component - Sistem yönetimi ve yapılandırma
export function SystemAdministration() {
  // State management - Durum yönetimi
  const [systemConfigs, setSystemConfigs] = useState<SystemConfig[]>([]);
  const [userManagement, setUserManagement] = useState<UserManagement[]>([]);
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>([]);
  const [systemBackups, setSystemBackups] = useState<SystemBackup[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreatePolicy, setShowCreatePolicy] = useState(false);
  const [systemUptime, setSystemUptime] = useState(99.8);

  // Mock data initialization - Test verilerini yükleme
  useEffect(() => {
    // Simulated data loading - Test verisi simülasyonu
    const mockSystemConfigs: SystemConfig[] = [
      {
        id: '1',
        name: 'Database Connection Pool',
        category: 'database',
        key: 'db.pool.size',
        value: '20',
        type: 'number',
        description: 'Maximum number of database connections in the pool',
        defaultValue: '10',
        isRequired: true,
        isSensitive: false,
        validation: {
          min: 1,
          max: 100
        },
        environment: 'production',
        lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        modifiedBy: 'admin@mindtrack.com',
        version: 3,
        status: 'active'
      }
    ];

    const mockUserManagement: UserManagement[] = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@mindtrack.com',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'admin',
        status: 'active',
        permissions: {
          dashboard: true,
          analytics: true,
          patients: true,
          appointments: true,
          settings: true,
          admin: true
        },
        security: {
          mfaEnabled: true,
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
          failedAttempts: 0,
          passwordExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8']
        },
        profile: {
          avatar: '/avatars/admin.jpg',
          phone: '+1-555-0123',
          department: 'IT',
          title: 'System Administrator',
          timezone: 'UTC',
          language: 'en'
        },
        activity: {
          lastActivity: new Date(Date.now() - 30 * 60 * 1000),
          loginCount: 1250,
          sessionDuration: 480,
          actions: [
            {
              action: 'Configuration Update',
              timestamp: new Date(Date.now() - 30 * 60 * 1000),
              ip: '192.168.1.100',
              userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
            }
          ]
        },
        createdDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        updatedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockSecurityPolicies: SecurityPolicy[] = [
      {
        id: '1',
        name: 'Password Policy',
        description: 'Enforces strong password requirements',
        type: 'password',
        status: 'active',
        rules: [
          {
            rule: 'Minimum 8 characters',
            description: 'Passwords must be at least 8 characters long',
            enforcement: 'strict',
            action: 'block'
          },
          {
            rule: 'Complexity requirements',
            description: 'Must contain uppercase, lowercase, number, and special character',
            enforcement: 'strict',
            action: 'block'
          }
        ],
        scope: {
          users: ['all'],
          roles: ['admin', 'user', 'moderator'],
          resources: ['login', 'password-change'],
          environments: ['production', 'staging']
        },
        compliance: {
          standards: ['HIPAA', 'SOC2'],
          requirements: ['Strong authentication', 'Password complexity'],
          auditSchedule: 'Monthly',
          lastAudit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        monitoring: {
          enabled: true,
          alerts: [
            {
              type: 'violation',
              threshold: 1,
              action: 'Immediate notification to security team'
            }
          ]
        },
        createdBy: 'admin@mindtrack.com',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockSystemHealth: SystemHealth = {
      id: '1',
      timestamp: new Date(),
      status: 'healthy',
      metrics: {
        cpu: 45,
        memory: 62,
        disk: 78,
        network: 95,
        database: 88
      },
      services: [
        {
          name: 'Web Server',
          status: 'running',
          uptime: 99.9,
          responseTime: 125,
          errorRate: 0.01
        },
        {
          name: 'Database',
          status: 'running',
          uptime: 99.8,
          responseTime: 45,
          errorRate: 0.005
        }
      ],
      alerts: [
        {
          id: 'alert1',
          type: 'performance',
          severity: 'low',
          message: 'Disk usage approaching threshold',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isResolved: false
        }
      ],
      maintenance: {
        scheduled: false
      }
    };

    const mockAuditLogs: AuditLog[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        user: 'admin@mindtrack.com',
        action: 'UPDATE_CONFIG',
        resource: 'db.pool.size',
        details: {
          before: '15',
          after: '20',
          changes: ['Increased database pool size from 15 to 20']
        },
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        sessionId: 'session_12345',
        category: 'configuration',
        severity: 'info',
        status: 'success',
        metadata: {
          requestId: 'req_67890',
          duration: 150,
          size: 1024
        }
      }
    ];

    const mockMaintenanceSchedules: MaintenanceSchedule[] = [
      {
        id: '1',
        title: 'Database Maintenance',
        description: 'Routine database optimization and cleanup',
        type: 'routine',
        status: 'scheduled',
        priority: 'medium',
        schedule: {
          startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
          duration: 120,
          timezone: 'UTC'
        },
        impact: {
          systems: ['Database', 'Analytics'],
          users: 50,
          downtime: 30,
          description: 'Read-only mode during maintenance'
        },
        tasks: [
          {
            step: 1,
            task: 'Database backup',
            description: 'Create full backup before maintenance',
            estimatedTime: 30,
            responsible: 'DB Admin',
            status: 'pending'
          }
        ],
        notifications: [
          {
            type: 'email',
            recipients: ['admin@mindtrack.com', 'users@mindtrack.com'],
            message: 'Scheduled maintenance notification'
          }
        ],
        createdBy: 'admin@mindtrack.com',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ];

    const mockSystemBackups: SystemBackup[] = [
      {
        id: '1',
        name: 'Configuration Backup',
        description: 'Backup of all system configurations',
        type: 'configuration',
        status: 'completed',
        schedule: {
          frequency: 'daily',
          time: '03:00',
          timezone: 'UTC',
          isEnabled: true
        },
        storage: {
          location: 's3://mindtrack-config-backups/',
          size: 52428800, // 50MB
          compression: true,
          encryption: true
        },
        retention: {
          policy: '30 days retention',
          days: 30,
          versions: 30
        },
        verification: {
          enabled: true,
          lastVerified: new Date(Date.now() - 24 * 60 * 60 * 1000),
          integrity: true,
          restoreTest: true
        },
        metadata: {
          createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000),
          nextBackup: new Date(Date.now() + 24 * 60 * 60 * 1000),
          createdBy: 'backup_system@mindtrack.com'
        }
      }
    ];

    setSystemConfigs(mockSystemConfigs);
    setUserManagement(mockUserManagement);
    setSecurityPolicies(mockSecurityPolicies);
    setSystemHealth(mockSystemHealth);
    setAuditLogs(mockAuditLogs);
    setMaintenanceSchedules(mockMaintenanceSchedules);
    setSystemBackups(mockSystemBackups);
  }, []);

  // Update system configuration - Sistem yapılandırması güncelleme
  const updateSystemConfig = useCallback(async (
    configId: string,
    newValue: string,
    reason: string
  ) => {
    setLoading(true);
    
    try {
      // Simulated configuration update - Yapılandırma güncelleme simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSystemConfigs(prev => prev.map(config => 
        config.id === configId 
          ? { 
              ...config, 
              value: newValue, 
              lastModified: new Date(),
              version: config.version + 1
            }
          : config
      ));
      
      return { success: true, message: 'Configuration updated successfully' };
      
    } catch (error) {
      console.error('Configuration update failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create user - Kullanıcı oluşturma
  const createUser = useCallback(async (
    username: string,
    email: string,
    role: UserManagement['role']
  ) => {
    setLoading(true);
    
    try {
      // Simulated user creation - Kullanıcı oluşturma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newUser: UserManagement = {
        id: `user_${Date.now()}`,
        username,
        email,
        firstName: '',
        lastName: '',
        role,
        status: 'pending',
        permissions: {
          dashboard: role === 'admin',
          analytics: role === 'admin',
          patients: true,
          appointments: true,
          settings: role === 'admin',
          admin: role === 'admin'
        },
        security: {
          mfaEnabled: false,
          lastLogin: new Date(),
          failedAttempts: 0,
          passwordExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          ipWhitelist: []
        },
        profile: {
          timezone: 'UTC',
          language: 'en'
        },
        activity: {
          lastActivity: new Date(),
          loginCount: 0,
          sessionDuration: 0,
          actions: []
        },
        createdDate: new Date(),
        updatedDate: new Date()
      };
      
      setUserManagement(prev => [newUser, ...prev]);
      
      return newUser;
      
    } catch (error) {
      console.error('User creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate admin metrics - Admin metriklerini hesaplama
  const calculateAdminMetrics = useCallback(() => {
    const totalConfigs = systemConfigs.length;
    const activeConfigs = systemConfigs.filter(c => c.status === 'active').length;
    const totalUsers = userManagement.length;
    const activeUsers = userManagement.filter(u => u.status === 'active').length;
    const totalPolicies = securityPolicies.length;
    const activePolicies = securityPolicies.filter(p => p.status === 'active').length;
    const totalMaintenance = maintenanceSchedules.length;
    const scheduledMaintenance = maintenanceSchedules.filter(m => m.status === 'scheduled').length;
    
    return {
      totalConfigs,
      activeConfigs,
      configActivationRate: totalConfigs > 0 ? Math.round((activeConfigs / totalConfigs) * 100) : 0,
      totalUsers,
      activeUsers,
      userActivationRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
      totalPolicies,
      activePolicies,
      policyActivationRate: totalPolicies > 0 ? Math.round((activePolicies / totalPolicies) * 100) : 0,
      totalMaintenance,
      scheduledMaintenance,
      maintenanceSchedulingRate: totalMaintenance > 0 ? Math.round((scheduledMaintenance / totalMaintenance) * 100) : 0
    };
  }, [systemConfigs, userManagement, securityPolicies, maintenanceSchedules]);

  const metrics = calculateAdminMetrics();

  return (
    <div className="space-y-6">
      {/* Header Section - Başlık Bölümü */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">⚙️ System Administration & Configuration</h2>
          <p className="text-gray-600">Comprehensive system administration and configuration management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Settings className="h-3 w-3 mr-1" />
            {metrics.activeConfigs} Active Configs
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Activity className="h-3 w-3 mr-1" />
            {systemUptime}% Uptime
          </Badge>
        </div>
      </div>

      {/* Admin Overview - Admin Genel Bakış */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">System Configs</CardTitle>
            <Settings className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics.activeConfigs}</div>
            <p className="text-xs text-blue-700">
              {metrics.totalConfigs} total configs
            </p>
            <Progress value={metrics.configActivationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Users</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{metrics.activeUsers}</div>
            <p className="text-xs text-green-700">
              {metrics.totalUsers} total users
            </p>
            <Progress value={metrics.userActivationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Security Policies</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{metrics.activePolicies}</div>
            <p className="text-xs text-purple-700">
              {metrics.totalPolicies} total policies
            </p>
            <Progress value={metrics.policyActivationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Maintenance</CardTitle>
            <Server className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{metrics.scheduledMaintenance}</div>
            <p className="text-xs text-orange-700">
              {metrics.totalMaintenance} total schedules
            </p>
            <Progress value={metrics.maintenanceSchedulingRate} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* System Configuration - Sistem Yapılandırması */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-blue-900">System Configuration</span>
            </div>
            <Button
              onClick={() => setShowCreateUser(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Config
            </Button>
          </CardTitle>
          <CardDescription className="text-blue-700">
            Manage system configurations and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {systemConfigs.map((config) => (
              <div key={config.id} className="border border-blue-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-blue-900">{config.name}</div>
                    <div className="text-sm text-blue-600">{config.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={config.status === 'active' ? 'default' : 'secondary'} className="bg-blue-100 text-blue-800">
                      {config.status}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {config.category}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      v{config.version}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Configuration</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Key: {config.key}</div>
                      <div>Value: {config.isSensitive ? '***' : config.value}</div>
                      <div>Type: {config.type}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Environment</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Environment: {config.environment}</div>
                      <div>Required: {config.isRequired ? 'Yes' : 'No'}</div>
                      <div>Sensitive: {config.isSensitive ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Validation</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      {config.validation.min && <div>Min: {config.validation.min}</div>}
                      {config.validation.max && <div>Max: {config.validation.max}</div>}
                      {config.validation.pattern && <div>Pattern: {config.validation.pattern}</div>}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Info</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Modified: {config.lastModified.toLocaleDateString()}</div>
                      <div>By: {config.modifiedBy}</div>
                      <div>Default: {config.defaultValue}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Management - Kullanıcı Yönetimi */}
      <Card className="border-2 border-green-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-600" />
              <span className="text-green-900">User Management</span>
            </div>
            <Button
              onClick={() => setShowCreateUser(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </CardTitle>
          <CardDescription className="text-green-700">
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {userManagement.map((user) => (
              <div key={user.id} className="border border-green-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-green-900">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-green-600">{user.email}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="bg-green-100 text-green-800">
                      {user.status}
                    </Badge>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      {user.role}
                    </Badge>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      {user.security.mfaEnabled ? 'MFA' : 'No MFA'}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Security</h4>
                    <div className="space-y-1 text-sm text-green-600">
                      <div>Last Login: {user.security.lastLogin.toLocaleDateString()}</div>
                      <div>Failed Attempts: {user.security.failedAttempts}</div>
                      <div>Password Expiry: {user.security.passwordExpiry.toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Activity</h4>
                    <div className="space-y-1 text-sm text-green-600">
                      <div>Last Activity: {user.activity.lastActivity.toLocaleDateString()}</div>
                      <div>Login Count: {user.activity.loginCount}</div>
                      <div>Session Duration: {user.activity.sessionDuration} min</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Profile</h4>
                    <div className="space-y-1 text-sm text-green-600">
                      <div>Department: {user.profile.department || 'N/A'}</div>
                      <div>Title: {user.profile.title || 'N/A'}</div>
                      <div>Timezone: {user.profile.timezone}</div>
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




