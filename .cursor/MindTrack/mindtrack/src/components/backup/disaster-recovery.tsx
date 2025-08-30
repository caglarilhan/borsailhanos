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
  Shield, 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Play, 
  Pause, 
  Stop, 
  Settings, 
  Eye, 
  Archive, 
  GitBranch, 
  Layers, 
  Filter, 
  Search, 
  MoreHorizontal,
  Bell,
  Calendar,
  Clock,
  User,
  Users,
  Info,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bookmark,
  Edit,
  Trash2,
  Copy,
  Share2,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Save,
  Printer,
  Lock,
  Unlock,
  Globe,
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
  Server,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";

// Backup & Disaster Recovery için gerekli interface'ler
interface BackupJob {
  id: string;
  name: string;
  description: string;
  type: 'full' | 'incremental' | 'differential' | 'snapshot';
  status: 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelled';
  source: {
    type: 'database' | 'filesystem' | 'application' | 'configuration';
    path: string;
    size: number;
  };
  destination: {
    type: 'local' | 'cloud' | 'tape' | 'network';
    path: string;
    provider?: string;
    region?: string;
  };
  schedule: {
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'on-demand';
    time: string;
    timezone: string;
    isEnabled: boolean;
  };
  retention: {
    policy: string;
    days: number;
    versions: number;
  };
  encryption: {
    enabled: boolean;
    algorithm: string;
    keyManagement: string;
  };
  compression: {
    enabled: boolean;
    algorithm: string;
    ratio: number;
  };
  progress: {
    current: number;
    total: number;
    percentage: number;
    speed: number;
    estimatedTime: number;
  };
  metadata: {
    startTime: Date;
    endTime?: Date;
    duration?: number;
    size: number;
    checksum: string;
    version: string;
  };
  logs: {
    timestamp: Date;
    level: 'info' | 'warning' | 'error' | 'debug';
    message: string;
  }[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface RecoveryPlan {
  id: string;
  name: string;
  description: string;
  type: 'rto' | 'rpo' | 'disaster' | 'business-continuity';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'active' | 'testing' | 'archived';
  objectives: {
    rto: number; // Recovery Time Objective (hours)
    rpo: number; // Recovery Point Objective (hours)
    sla: number; // Service Level Agreement (%)
  };
  scope: {
    systems: string[];
    applications: string[];
    databases: string[];
    data: string[];
  };
  procedures: {
    step: number;
    action: string;
    description: string;
    estimatedTime: number;
    responsible: string;
    dependencies: string[];
  }[];
  resources: {
    personnel: string[];
    equipment: string[];
    locations: string[];
    contacts: {
      name: string;
      role: string;
      phone: string;
      email: string;
    }[];
  };
  testing: {
    lastTest: Date;
    nextTest: Date;
    frequency: string;
    results: {
      success: boolean;
      issues: string[];
      recommendations: string[];
    };
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DisasterRecovery {
  id: string;
  name: string;
  description: string;
  type: 'natural' | 'technical' | 'human-error' | 'cyber-attack';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'mitigated';
  impact: {
    systems: string[];
    users: number;
    downtime: number;
    dataLoss: number;
    cost: number;
  };
  timeline: {
    detected: Date;
    declared: Date;
    response: Date;
    recovery: Date;
    resolved?: Date;
  };
  response: {
    team: string[];
    actions: {
      timestamp: Date;
      action: string;
      responsible: string;
      status: 'pending' | 'in-progress' | 'completed';
    }[];
    communications: {
      timestamp: Date;
      type: 'internal' | 'external' | 'customer';
      message: string;
      recipients: string[];
    }[];
  };
  recovery: {
    plan: string;
    steps: {
      step: number;
      action: string;
      status: 'pending' | 'in-progress' | 'completed' | 'failed';
      startTime?: Date;
      endTime?: Date;
      notes: string;
    }[];
    progress: number;
    estimatedCompletion: Date;
  };
  lessons: {
    what: string;
    why: string;
    how: string;
    recommendations: string[];
  };
  createdDate: Date;
  updatedDate: Date;
}

interface BackupStorage {
  id: string;
  name: string;
  type: 'local' | 'cloud' | 'tape' | 'network';
  provider?: string;
  location: string;
  capacity: number;
  used: number;
  available: number;
  utilization: number;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  performance: {
    readSpeed: number;
    writeSpeed: number;
    latency: number;
    throughput: number;
  };
  security: {
    encryption: boolean;
    accessControl: boolean;
    auditLogging: boolean;
    compliance: string[];
  };
  redundancy: {
    replication: boolean;
    copies: number;
    locations: string[];
  };
  maintenance: {
    lastCheck: Date;
    nextCheck: Date;
    health: number;
    issues: string[];
  };
  costs: {
    storage: number;
    bandwidth: number;
    operations: number;
    total: number;
  };
  createdDate: Date;
  updatedDate: Date;
}

interface BackupPolicy {
  id: string;
  name: string;
  description: string;
  type: 'data-protection' | 'compliance' | 'business-continuity';
  status: 'active' | 'inactive' | 'draft';
  scope: {
    applications: string[];
    databases: string[];
    filesystems: string[];
    configurations: string[];
  };
  rules: {
    frequency: string;
    retention: string;
    encryption: boolean;
    compression: boolean;
    verification: boolean;
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
      type: 'failure' | 'delay' | 'size' | 'verification';
      threshold: number;
      action: string;
    }[];
  };
  reporting: {
    frequency: string;
    recipients: string[];
    format: string;
    metrics: string[];
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BackupVerification {
  id: string;
  backupJobId: string;
  type: 'integrity' | 'restore' | 'performance' | 'compliance';
  status: 'pending' | 'running' | 'passed' | 'failed';
  method: 'checksum' | 'restore-test' | 'performance-test' | 'audit';
  results: {
    integrity: boolean;
    restoreTime: number;
    dataLoss: number;
    performance: number;
    compliance: boolean;
  };
  issues: {
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    resolution: string;
  }[];
  metadata: {
    startTime: Date;
    endTime?: Date;
    duration?: number;
    tester: string;
    environment: string;
  };
  createdDate: Date;
  updatedDate: Date;
}

// Backup & Disaster Recovery Component - Yedekleme ve felaket kurtarma
export function DisasterRecovery() {
  // State management - Durum yönetimi
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([]);
  const [recoveryPlans, setRecoveryPlans] = useState<RecoveryPlan[]>([]);
  const [disasterRecovery, setDisasterRecovery] = useState<DisasterRecovery[]>([]);
  const [backupStorage, setBackupStorage] = useState<BackupStorage[]>([]);
  const [backupPolicies, setBackupPolicies] = useState<BackupPolicy[]>([]);
  const [backupVerifications, setBackupVerifications] = useState<BackupVerification[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<BackupJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateBackup, setShowCreateBackup] = useState(false);
  const [showCreateRecoveryPlan, setShowCreateRecoveryPlan] = useState(false);
  const [backupSuccessRate, setBackupSuccessRate] = useState(98.5);

  // Mock data initialization - Test verilerini yükleme
  useEffect(() => {
    // Simulated data loading - Test verisi simülasyonu
    const mockBackupJobs: BackupJob[] = [
      {
        id: '1',
        name: 'Daily Database Backup',
        description: 'Full backup of main PostgreSQL database',
        type: 'full',
        status: 'completed',
        source: {
          type: 'database',
          path: '/var/lib/postgresql/data',
          size: 2048576000
        },
        destination: {
          type: 'cloud',
          path: 's3://mindtrack-backups/database/',
          provider: 'AWS S3',
          region: 'us-east-1'
        },
        schedule: {
          frequency: 'daily',
          time: '02:00',
          timezone: 'UTC',
          isEnabled: true
        },
        retention: {
          policy: '30 days retention',
          days: 30,
          versions: 30
        },
        encryption: {
          enabled: true,
          algorithm: 'AES-256',
          keyManagement: 'AWS KMS'
        },
        compression: {
          enabled: true,
          algorithm: 'gzip',
          ratio: 0.75
        },
        progress: {
          current: 2048576000,
          total: 2048576000,
          percentage: 100,
          speed: 1024000,
          estimatedTime: 1800
        },
        metadata: {
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - 23 * 60 * 60 * 1000),
          duration: 1800,
          size: 1536432000,
          checksum: 'sha256:abc123def456',
          version: '1.0.0'
        },
        logs: [
          {
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            level: 'info',
            message: 'Backup job started'
          },
          {
            timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000),
            level: 'info',
            message: 'Backup job completed successfully'
          }
        ],
        createdBy: 'backup_system@mindtrack.com',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ];

    const mockRecoveryPlans: RecoveryPlan[] = [
      {
        id: '1',
        name: 'Critical Systems Recovery',
        description: 'Recovery plan for critical business systems',
        type: 'disaster',
        priority: 'critical',
        status: 'active',
        objectives: {
          rto: 4,
          rpo: 1,
          sla: 99.9
        },
        scope: {
          systems: ['Database', 'Application Server', 'File Storage'],
          applications: ['Patient Portal', 'Admin Dashboard', 'API Services'],
          databases: ['PostgreSQL Main', 'Redis Cache', 'Analytics DB'],
          data: ['Patient Records', 'Configuration', 'Logs']
        },
        procedures: [
          {
            step: 1,
            action: 'Assess Damage',
            description: 'Evaluate the extent of system damage',
            estimatedTime: 30,
            responsible: 'System Administrator',
            dependencies: []
          },
          {
            step: 2,
            action: 'Restore Database',
            description: 'Restore database from latest backup',
            estimatedTime: 120,
            responsible: 'Database Administrator',
            dependencies: ['Assess Damage']
          }
        ],
        resources: {
          personnel: ['System Admin', 'DB Admin', 'DevOps Engineer'],
          equipment: ['Backup Servers', 'Network Equipment', 'Monitoring Tools'],
          locations: ['Primary DC', 'Secondary DC', 'Cloud Environment'],
          contacts: [
            {
              name: 'John Doe',
              role: 'System Administrator',
              phone: '+1-555-0123',
              email: 'john.doe@mindtrack.com'
            }
          ]
        },
        testing: {
          lastTest: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          nextTest: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          frequency: 'monthly',
          results: {
            success: true,
            issues: ['Network latency during restore'],
            recommendations: ['Optimize network configuration']
          }
        },
        createdBy: 'admin@mindtrack.com',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockDisasterRecovery: DisasterRecovery[] = [
      {
        id: '1',
        name: 'Database Server Failure',
        description: 'Primary database server experienced hardware failure',
        type: 'technical',
        severity: 'high',
        status: 'resolved',
        impact: {
          systems: ['Patient Portal', 'Admin Dashboard'],
          users: 1250,
          downtime: 180,
          dataLoss: 0,
          cost: 5000
        },
        timeline: {
          detected: new Date(Date.now() - 24 * 60 * 60 * 1000),
          declared: new Date(Date.now() - 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
          response: new Date(Date.now() - 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
          recovery: new Date(Date.now() - 24 * 60 * 60 * 1000 + 120 * 60 * 1000),
          resolved: new Date(Date.now() - 24 * 60 * 60 * 1000 + 180 * 60 * 1000)
        },
        response: {
          team: ['System Admin', 'DB Admin', 'DevOps Engineer'],
          actions: [
            {
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
              action: 'Activated disaster recovery plan',
              responsible: 'System Administrator',
              status: 'completed'
            }
          ],
          communications: [
            {
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
              type: 'internal',
              message: 'Database server failure detected, activating DR plan',
              recipients: ['Management Team', 'IT Team']
            }
          ]
        },
        recovery: {
          plan: 'Critical Systems Recovery',
          steps: [
            {
              step: 1,
              action: 'Failover to secondary database',
              status: 'completed',
              startTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
              endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
              notes: 'Successfully failed over to secondary database'
            }
          ],
          progress: 100,
          estimatedCompletion: new Date(Date.now() - 24 * 60 * 60 * 1000 + 180 * 60 * 1000)
        },
        lessons: {
          what: 'Database server hardware failure',
          why: 'Hardware degradation over time',
          how: 'Implemented automatic failover and monitoring',
          recommendations: [
            'Implement proactive hardware monitoring',
            'Schedule regular hardware maintenance',
            'Improve failover automation'
          ]
        },
        createdDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedDate: new Date(Date.now() - 24 * 60 * 60 * 1000 + 180 * 60 * 1000)
      }
    ];

    const mockBackupStorage: BackupStorage[] = [
      {
        id: '1',
        name: 'AWS S3 Backup Storage',
        type: 'cloud',
        provider: 'Amazon Web Services',
        location: 'us-east-1',
        capacity: 1073741824000, // 1TB
        used: 214748364800, // 200GB
        available: 858993459200, // 800GB
        utilization: 20,
        status: 'online',
        performance: {
          readSpeed: 100,
          writeSpeed: 50,
          latency: 50,
          throughput: 1000
        },
        security: {
          encryption: true,
          accessControl: true,
          auditLogging: true,
          compliance: ['HIPAA', 'SOC2', 'ISO27001']
        },
        redundancy: {
          replication: true,
          copies: 3,
          locations: ['us-east-1', 'us-west-2', 'eu-west-1']
        },
        maintenance: {
          lastCheck: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          nextCheck: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          health: 98,
          issues: []
        },
        costs: {
          storage: 50,
          bandwidth: 25,
          operations: 15,
          total: 90
        },
        createdDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        updatedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockBackupPolicies: BackupPolicy[] = [
      {
        id: '1',
        name: 'Data Protection Policy',
        description: 'Comprehensive data protection and backup policy',
        type: 'data-protection',
        status: 'active',
        scope: {
          applications: ['Patient Portal', 'Admin Dashboard', 'API Services'],
          databases: ['PostgreSQL', 'Redis', 'Analytics'],
          filesystems: ['/var/www', '/var/log', '/etc'],
          configurations: ['Application Config', 'Database Config', 'Network Config']
        },
        rules: {
          frequency: 'Daily full backup, hourly incremental',
          retention: '30 days for full backups, 7 days for incremental',
          encryption: true,
          compression: true,
          verification: true
        },
        compliance: {
          standards: ['HIPAA', 'SOC2', 'ISO27001'],
          requirements: ['Data encryption', 'Access control', 'Audit logging'],
          auditSchedule: 'Quarterly',
          lastAudit: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        },
        monitoring: {
          enabled: true,
          alerts: [
            {
              type: 'failure',
              threshold: 1,
              action: 'Immediate notification to admin team'
            }
          ]
        },
        reporting: {
          frequency: 'Weekly',
          recipients: ['admin@mindtrack.com', 'security@mindtrack.com'],
          format: 'PDF',
          metrics: ['Success rate', 'Size', 'Duration', 'Verification results']
        },
        createdBy: 'admin@mindtrack.com',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockBackupVerifications: BackupVerification[] = [
      {
        id: '1',
        backupJobId: '1',
        type: 'restore',
        status: 'passed',
        method: 'restore-test',
        results: {
          integrity: true,
          restoreTime: 1800,
          dataLoss: 0,
          performance: 95,
          compliance: true
        },
        issues: [],
        metadata: {
          startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 1800 * 1000),
          duration: 1800,
          tester: 'backup_system@mindtrack.com',
          environment: 'test'
        },
        createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 1800 * 1000)
      }
    ];

    setBackupJobs(mockBackupJobs);
    setRecoveryPlans(mockRecoveryPlans);
    setDisasterRecovery(mockDisasterRecovery);
    setBackupStorage(mockBackupStorage);
    setBackupPolicies(mockBackupPolicies);
    setBackupVerifications(mockBackupVerifications);
  }, []);

  // Create backup job - Yedekleme işi oluşturma
  const createBackupJob = useCallback(async (
    name: string,
    description: string,
    type: BackupJob['type'],
    source: BackupJob['source'],
    destination: BackupJob['destination']
  ) => {
    setLoading(true);
    
    try {
      // Simulated backup creation - Yedekleme oluşturma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const backupJob: BackupJob = {
        id: `backup_${Date.now()}`,
        name,
        description,
        type,
        status: 'scheduled',
        source,
        destination,
        schedule: {
          frequency: 'daily',
          time: '02:00',
          timezone: 'UTC',
          isEnabled: true
        },
        retention: {
          policy: '30 days retention',
          days: 30,
          versions: 30
        },
        encryption: {
          enabled: true,
          algorithm: 'AES-256',
          keyManagement: 'AWS KMS'
        },
        compression: {
          enabled: true,
          algorithm: 'gzip',
          ratio: 0.75
        },
        progress: {
          current: 0,
          total: source.size,
          percentage: 0,
          speed: 0,
          estimatedTime: 0
        },
        metadata: {
          startTime: new Date(),
          size: 0,
          checksum: '',
          version: '1.0.0'
        },
        logs: [
          {
            timestamp: new Date(),
            level: 'info',
            message: 'Backup job created'
          }
        ],
        createdBy: 'current_user',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setBackupJobs(prev => [backupJob, ...prev]);
      
      return backupJob;
      
    } catch (error) {
      console.error('Backup job creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Execute recovery plan - Kurtarma planı çalıştırma
  const executeRecoveryPlan = useCallback(async (
    planId: string,
    environment: string
  ) => {
    setLoading(true);
    
    try {
      // Simulated recovery execution - Kurtarma çalıştırma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Update recovery plan status
      setRecoveryPlans(prev => prev.map(plan => 
        plan.id === planId 
          ? { ...plan, status: 'testing', updatedAt: new Date() }
          : plan
      ));
      
      return { success: true, message: 'Recovery plan executed successfully' };
      
    } catch (error) {
      console.error('Recovery plan execution failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate backup metrics - Yedekleme metriklerini hesaplama
  const calculateBackupMetrics = useCallback(() => {
    const totalBackups = backupJobs.length;
    const successfulBackups = backupJobs.filter(b => b.status === 'completed').length;
    const totalRecoveryPlans = recoveryPlans.length;
    const activeRecoveryPlans = recoveryPlans.filter(r => r.status === 'active').length;
    const totalDisasters = disasterRecovery.length;
    const resolvedDisasters = disasterRecovery.filter(d => d.status === 'resolved').length;
    const totalStorage = backupStorage.length;
    const onlineStorage = backupStorage.filter(s => s.status === 'online').length;
    
    return {
      totalBackups,
      successfulBackups,
      backupSuccessRate: totalBackups > 0 ? Math.round((successfulBackups / totalBackups) * 100) : 0,
      totalRecoveryPlans,
      activeRecoveryPlans,
      planActivationRate: totalRecoveryPlans > 0 ? Math.round((activeRecoveryPlans / totalRecoveryPlans) * 100) : 0,
      totalDisasters,
      resolvedDisasters,
      disasterResolutionRate: totalDisasters > 0 ? Math.round((resolvedDisasters / totalDisasters) * 100) : 0,
      totalStorage,
      onlineStorage,
      storageAvailabilityRate: totalStorage > 0 ? Math.round((onlineStorage / totalStorage) * 100) : 0
    };
  }, [backupJobs, recoveryPlans, disasterRecovery, backupStorage]);

  const metrics = calculateBackupMetrics();

  return (
    <div className="space-y-6">
      {/* Header Section - Başlık Bölümü */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🛡️ Backup & Disaster Recovery</h2>
          <p className="text-gray-600">Comprehensive backup and disaster recovery management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Shield className="h-3 w-3 mr-1" />
            {metrics.successfulBackups} Successful Backups
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Activity className="h-3 w-3 mr-1" />
            {backupSuccessRate}% Success Rate
          </Badge>
        </div>
      </div>

      {/* Backup Overview - Yedekleme Genel Bakış */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Backup Jobs</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics.successfulBackups}</div>
            <p className="text-xs text-blue-700">
              {metrics.totalBackups} total jobs
            </p>
            <Progress value={metrics.backupSuccessRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Recovery Plans</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{metrics.activeRecoveryPlans}</div>
            <p className="text-xs text-green-700">
              {metrics.totalRecoveryPlans} total plans
            </p>
            <Progress value={metrics.planActivationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-900">Disaster Recovery</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{metrics.resolvedDisasters}</div>
            <p className="text-xs text-red-700">
              {metrics.totalDisasters} total incidents
            </p>
            <Progress value={metrics.disasterResolutionRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{metrics.onlineStorage}</div>
            <p className="text-xs text-purple-700">
              {metrics.totalStorage} total storage
            </p>
            <Progress value={metrics.storageAvailabilityRate} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Backup Jobs - Yedekleme İşleri */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-blue-900">Backup Jobs</span>
            </div>
            <Button
              onClick={() => setShowCreateBackup(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Backup
            </Button>
          </CardTitle>
          <CardDescription className="text-blue-700">
            Manage backup jobs and their execution
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {backupJobs.map((backup) => (
              <div key={backup.id} className="border border-blue-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-blue-900">{backup.name}</div>
                    <div className="text-sm text-blue-600">{backup.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={backup.status === 'completed' ? 'default' : 'secondary'} className="bg-blue-100 text-blue-800">
                      {backup.status}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {backup.type}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {backup.destination.type}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Progress</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Progress: {backup.progress.percentage}%</div>
                      <div>Size: {(backup.metadata.size / 1024 / 1024 / 1024).toFixed(2)} GB</div>
                      <div>Duration: {Math.round(backup.metadata.duration! / 60)} min</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Schedule</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Frequency: {backup.schedule.frequency}</div>
                      <div>Time: {backup.schedule.time}</div>
                      <div>Enabled: {backup.schedule.isEnabled ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Security</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Encryption: {backup.encryption.enabled ? 'Enabled' : 'Disabled'}</div>
                      <div>Algorithm: {backup.encryption.algorithm}</div>
                      <div>Compression: {backup.compression.enabled ? 'Enabled' : 'Disabled'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Info</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Created: {backup.createdAt.toLocaleDateString()}</div>
                      <div>Updated: {backup.updatedAt.toLocaleDateString()}</div>
                      <div>Created By: {backup.createdBy}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recovery Plans - Kurtarma Planları */}
      <Card className="border-2 border-green-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-600" />
              <span className="text-green-900">Recovery Plans</span>
            </div>
            <Button
              onClick={() => setShowCreateRecoveryPlan(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </CardTitle>
          <CardDescription className="text-green-700">
            Manage disaster recovery and business continuity plans
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {recoveryPlans.map((plan) => (
              <div key={plan.id} className="border border-green-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-green-900">{plan.name}</div>
                    <div className="text-sm text-green-600">{plan.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={plan.priority === 'critical' ? 'default' : 'secondary'} className="bg-green-100 text-green-800">
                      {plan.priority}
                    </Badge>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      {plan.status}
                    </Badge>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      RTO: {plan.objectives.rto}h
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Objectives</h4>
                    <div className="space-y-1 text-sm text-green-600">
                      <div>RTO: {plan.objectives.rto} hours</div>
                      <div>RPO: {plan.objectives.rpo} hours</div>
                      <div>SLA: {plan.objectives.sla}%</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Scope</h4>
                    <div className="space-y-1 text-sm text-green-600">
                      <div>Systems: {plan.scope.systems.length}</div>
                      <div>Applications: {plan.scope.applications.length}</div>
                      <div>Databases: {plan.scope.databases.length}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Testing</h4>
                    <div className="space-y-1 text-sm text-green-600">
                      <div>Last Test: {plan.testing.lastTest.toLocaleDateString()}</div>
                      <div>Next Test: {plan.testing.nextTest.toLocaleDateString()}</div>
                      <div>Success: {plan.testing.results.success ? 'Yes' : 'No'}</div>
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
