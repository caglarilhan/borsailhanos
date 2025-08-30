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
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Lock, 
  Unlock, 
  Key, 
  Fingerprint, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Zap, 
  Activity, 
  Clock, 
  Calendar, 
  User, 
  Users, 
  Settings, 
  Plus, 
  Minus, 
  Edit, 
  Trash2, 
  Copy, 
  Download, 
  Upload, 
  RefreshCw, 
  Save, 
  Bell, 
  BellOff, 
  Database, 
  Server, 
  Cloud, 
  Wifi, 
  WifiOff, 
  Network, 
  HardDrive, 
  Cpu, 
  Memory, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  BookOpen, 
  FileText, 
  Globe, 
  MapPin, 
  Phone, 
  Mail, 
  MessageSquare, 
  Info, 
  HelpCircle, 
  ExternalLink, 
  Link, 
  Link2, 
  LinkBreak, 
  LinkBreak2, 
  GitBranch, 
  Layers, 
  Filter, 
  Search, 
  MoreHorizontal, 
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
  MoreVertical, 
  X, 
  Check, 
  Star, 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  Flag, 
  Bookmark, 
  Tag, 
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

// Advanced Security Features için gerekli interface'ler
interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  type: 'authentication' | 'authorization' | 'encryption' | 'network' | 'data' | 'compliance';
  status: 'active' | 'inactive' | 'draft' | 'testing';
  priority: 'low' | 'medium' | 'high' | 'critical';
  rules: {
    rule: string;
    description: string;
    enforcement: 'strict' | 'moderate' | 'flexible';
    action: 'block' | 'warn' | 'log' | 'notify';
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
    nextAudit: Date;
  };
  monitoring: {
    enabled: boolean;
    alerts: {
      type: 'violation' | 'attempt' | 'success' | 'failure';
      threshold: number;
      action: string;
    }[];
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BiometricAuth {
  id: string;
  userId: string;
  type: 'fingerprint' | 'face' | 'voice' | 'iris' | 'palm';
  status: 'enabled' | 'disabled' | 'pending' | 'failed';
  device: string;
  accuracy: number;
  lastUsed: Date;
  usageCount: number;
  security: {
    templateEncrypted: boolean;
    localStorage: boolean;
    backupEnabled: boolean;
    fallbackMethod: string;
  };
  metadata: {
    deviceModel: string;
    osVersion: string;
    appVersion: string;
    location: string;
  };
}

interface ZeroTrustPolicy {
  id: string;
  name: string;
  description: string;
  principle: 'never-trust' | 'always-verify' | 'assume-breach' | 'least-privilege';
  status: 'active' | 'inactive' | 'testing';
  components: {
    identity: {
      mfaRequired: boolean;
      deviceTrust: boolean;
      locationBased: boolean;
      timeBased: boolean;
    };
    network: {
      microsegmentation: boolean;
      encryptedTraffic: boolean;
      accessControl: boolean;
      monitoring: boolean;
    };
    data: {
      encryption: boolean;
      classification: boolean;
      accessLogging: boolean;
      backupEncryption: boolean;
    };
  };
  enforcement: {
    mode: 'strict' | 'moderate' | 'flexible';
    gracePeriod: number;
    fallbackAction: string;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface HardwareSecurityModule {
  id: string;
  name: string;
  type: 'hsm' | 'tpm' | 'secure-enclave' | 'smart-card';
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  model: string;
  manufacturer: string;
  firmwareVersion: string;
  capabilities: {
    keyGeneration: boolean;
    keyStorage: boolean;
    encryption: boolean;
    signing: boolean;
    randomGeneration: boolean;
  };
  keys: {
    id: string;
    type: 'rsa' | 'ecc' | 'aes' | 'hmac';
    size: number;
    purpose: string;
    status: 'active' | 'inactive' | 'expired';
    createdDate: Date;
    expiryDate: Date;
  }[];
  performance: {
    operationsPerSecond: number;
    latency: number;
    uptime: number;
    errorRate: number;
  };
  security: {
    tamperDetection: boolean;
    physicalSecurity: boolean;
    auditLogging: boolean;
    backupEnabled: boolean;
  };
  location: string;
  lastMaintenance: Date;
  nextMaintenance: Date;
}

interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  type: 'breach' | 'intrusion' | 'malware' | 'phishing' | 'ddos' | 'insider-threat';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
  detection: {
    method: string;
    timestamp: Date;
    source: string;
    confidence: number;
  };
  impact: {
    systems: string[];
    users: number;
    data: string[];
    financial: number;
    reputation: string;
  };
  response: {
    team: string[];
    actions: {
      action: string;
      timestamp: Date;
      responsible: string;
      status: 'pending' | 'in-progress' | 'completed';
    }[];
    timeline: {
      detected: Date;
      contained: Date;
      resolved: Date;
      closed: Date;
    };
  };
  lessons: {
    what: string;
    why: string;
    how: string;
    prevention: string[];
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface EncryptionPolicy {
  id: string;
  name: string;
  description: string;
  type: 'data-at-rest' | 'data-in-transit' | 'data-in-use';
  algorithm: 'aes-256' | 'rsa-4096' | 'ecc-p256' | 'chacha20' | 'blowfish';
  keySize: number;
  mode: 'cbc' | 'gcm' | 'ctr' | 'ecb';
  keyManagement: {
    rotation: boolean;
    rotationPeriod: number;
    backup: boolean;
    backupLocation: string;
    escrow: boolean;
  };
  scope: {
    databases: string[];
    files: string[];
    communications: string[];
    backups: string[];
  };
  compliance: {
    standards: string[];
    requirements: string[];
    auditTrail: boolean;
    reporting: boolean;
  };
  performance: {
    overhead: number;
    latency: number;
    throughput: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Advanced Security Features Component - Gelişmiş güvenlik özellikleri
export function AdvancedSecurityFeatures() {
  // State management - Durum yönetimi
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([]);
  const [biometricAuths, setBiometricAuths] = useState<BiometricAuth[]>([]);
  const [zeroTrustPolicies, setZeroTrustPolicies] = useState<ZeroTrustPolicy[]>([]);
  const [hardwareSecurityModules, setHardwareSecurityModules] = useState<HardwareSecurityModule[]>([]);
  const [securityIncidents, setSecurityIncidents] = useState<SecurityIncident[]>([]);
  const [encryptionPolicies, setEncryptionPolicies] = useState<EncryptionPolicy[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<SecurityPolicy | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreatePolicy, setShowCreatePolicy] = useState(false);
  const [showCreateIncident, setShowCreateIncident] = useState(false);
  const [securityScore, setSecurityScore] = useState(94.5);

  // Mock data initialization - Test verilerini yükleme
  useEffect(() => {
    // Simulated data loading - Test verisi simülasyonu
    const mockSecurityPolicies: SecurityPolicy[] = [
      {
        id: '1',
        name: 'Multi-Factor Authentication Policy',
        description: 'Enforces MFA for all user accounts',
        type: 'authentication',
        status: 'active',
        priority: 'critical',
        rules: [
          {
            rule: 'MFA Required',
            description: 'All users must enable MFA within 7 days',
            enforcement: 'strict',
            action: 'block'
          },
          {
            rule: 'Backup Codes',
            description: 'Users must generate backup codes',
            enforcement: 'strict',
            action: 'warn'
          }
        ],
        scope: {
          users: ['all'],
          roles: ['admin', 'user', 'moderator'],
          resources: ['login', 'sensitive-data'],
          environments: ['production', 'staging']
        },
        compliance: {
          standards: ['HIPAA', 'SOC2', 'GDPR'],
          requirements: ['Strong authentication', 'MFA enforcement'],
          auditSchedule: 'Quarterly',
          lastAudit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          nextAudit: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
        },
        monitoring: {
          enabled: true,
          alerts: [
            {
              type: 'violation',
              threshold: 1,
              action: 'Immediate account suspension'
            }
          ]
        },
        createdBy: 'security-admin@mindtrack.com',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockBiometricAuths: BiometricAuth[] = [
      {
        id: '1',
        userId: 'user_123',
        type: 'fingerprint',
        status: 'enabled',
        device: 'iPhone 15 Pro',
        accuracy: 98.5,
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
        usageCount: 1250,
        security: {
          templateEncrypted: true,
          localStorage: true,
          backupEnabled: false,
          fallbackMethod: 'passcode'
        },
        metadata: {
          deviceModel: 'iPhone 15 Pro',
          osVersion: 'iOS 17.2',
          appVersion: '2.1.0',
          location: 'San Francisco, CA'
        }
      }
    ];

    const mockZeroTrustPolicies: ZeroTrustPolicy[] = [
      {
        id: '1',
        name: 'Network Access Control',
        description: 'Zero trust network access for all resources',
        principle: 'never-trust',
        status: 'active',
        components: {
          identity: {
            mfaRequired: true,
            deviceTrust: true,
            locationBased: true,
            timeBased: true
          },
          network: {
            microsegmentation: true,
            encryptedTraffic: true,
            accessControl: true,
            monitoring: true
          },
          data: {
            encryption: true,
            classification: true,
            accessLogging: true,
            backupEncryption: true
          }
        },
        enforcement: {
          mode: 'strict',
          gracePeriod: 300,
          fallbackAction: 'deny'
        },
        createdBy: 'security-admin@mindtrack.com',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockHardwareSecurityModules: HardwareSecurityModule[] = [
      {
        id: '1',
        name: 'AWS CloudHSM',
        type: 'hsm',
        status: 'active',
        model: 'CloudHSM v2',
        manufacturer: 'AWS',
        firmwareVersion: '3.4.0',
        capabilities: {
          keyGeneration: true,
          keyStorage: true,
          encryption: true,
          signing: true,
          randomGeneration: true
        },
        keys: [
          {
            id: 'key_1',
            type: 'rsa',
            size: 4096,
            purpose: 'SSL/TLS',
            status: 'active',
            createdDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
            expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
          }
        ],
        performance: {
          operationsPerSecond: 10000,
          latency: 5,
          uptime: 99.99,
          errorRate: 0.001
        },
        security: {
          tamperDetection: true,
          physicalSecurity: true,
          auditLogging: true,
          backupEnabled: true
        },
        location: 'us-west-2',
        lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockSecurityIncidents: SecurityIncident[] = [
      {
        id: '1',
        title: 'Suspicious Login Attempt',
        description: 'Multiple failed login attempts from unknown IP',
        type: 'intrusion',
        severity: 'medium',
        status: 'resolved',
        detection: {
          method: 'Automated monitoring',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          source: 'Security monitoring system',
          confidence: 85
        },
        impact: {
          systems: ['Authentication service'],
          users: 0,
          data: ['No data compromised'],
          financial: 0,
          reputation: 'None'
        },
        response: {
          team: ['Security team', 'IT admin'],
          actions: [
            {
              action: 'IP blocked',
              timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000),
              responsible: 'Security team',
              status: 'completed'
            }
          ],
          timeline: {
            detected: new Date(Date.now() - 24 * 60 * 60 * 1000),
            contained: new Date(Date.now() - 23 * 60 * 60 * 1000),
            resolved: new Date(Date.now() - 22 * 60 * 60 * 1000),
            closed: new Date(Date.now() - 20 * 60 * 60 * 1000)
          }
        },
        lessons: {
          what: 'Failed login attempts from suspicious IP',
          why: 'Automated attack attempt',
          how: 'IP blocking and monitoring',
          prevention: ['Enhanced monitoring', 'Rate limiting', 'Geolocation blocking']
        },
        createdBy: 'security-monitor@mindtrack.com',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000)
      }
    ];

    const mockEncryptionPolicies: EncryptionPolicy[] = [
      {
        id: '1',
        name: 'Data Encryption Standard',
        description: 'Encrypt all sensitive data at rest and in transit',
        type: 'data-at-rest',
        algorithm: 'aes-256',
        keySize: 256,
        mode: 'gcm',
        keyManagement: {
          rotation: true,
          rotationPeriod: 90,
          backup: true,
          backupLocation: 'HSM',
          escrow: false
        },
        scope: {
          databases: ['patient-data', 'financial-data'],
          files: ['documents', 'backups'],
          communications: ['api', 'web'],
          backups: ['daily', 'weekly', 'monthly']
        },
        compliance: {
          standards: ['HIPAA', 'SOC2', 'PCI-DSS'],
          requirements: ['Data encryption', 'Key management'],
          auditTrail: true,
          reporting: true
        },
        performance: {
          overhead: 2.5,
          latency: 15,
          throughput: 1000
        },
        createdBy: 'security-admin@mindtrack.com',
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    ];

    setSecurityPolicies(mockSecurityPolicies);
    setBiometricAuths(mockBiometricAuths);
    setZeroTrustPolicies(mockZeroTrustPolicies);
    setHardwareSecurityModules(mockHardwareSecurityModules);
    setSecurityIncidents(mockSecurityIncidents);
    setEncryptionPolicies(mockEncryptionPolicies);
  }, []);

  // Create security policy - Güvenlik politikası oluşturma
  const createSecurityPolicy = useCallback(async (
    name: string,
    type: SecurityPolicy['type'],
    priority: SecurityPolicy['priority']
  ) => {
    setLoading(true);
    
    try {
      // Simulated policy creation - Politika oluşturma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newPolicy: SecurityPolicy = {
        id: `policy_${Date.now()}`,
        name,
        description: `${name} security policy`,
        type,
        status: 'draft',
        priority,
        rules: [],
        scope: {
          users: ['all'],
          roles: ['admin'],
          resources: ['all'],
          environments: ['production']
        },
        compliance: {
          standards: [],
          requirements: [],
          auditSchedule: 'Monthly',
          lastAudit: new Date(),
          nextAudit: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        monitoring: {
          enabled: false,
          alerts: []
        },
        createdBy: 'security-admin@mindtrack.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setSecurityPolicies(prev => [newPolicy, ...prev]);
      
      return newPolicy;
      
    } catch (error) {
      console.error('Security policy creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create security incident - Güvenlik olayı oluşturma
  const createSecurityIncident = useCallback(async (
    title: string,
    type: SecurityIncident['type'],
    severity: SecurityIncident['severity']
  ) => {
    setLoading(true);
    
    try {
      // Simulated incident creation - Olay oluşturma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newIncident: SecurityIncident = {
        id: `incident_${Date.now()}`,
        title,
        description: `${title} security incident`,
        type,
        severity,
        status: 'open',
        detection: {
          method: 'Manual report',
          timestamp: new Date(),
          source: 'Security team',
          confidence: 90
        },
        impact: {
          systems: [],
          users: 0,
          data: [],
          financial: 0,
          reputation: 'None'
        },
        response: {
          team: ['Security team'],
          actions: [],
          timeline: {
            detected: new Date(),
            contained: new Date(),
            resolved: new Date(),
            closed: new Date()
          }
        },
        lessons: {
          what: '',
          why: '',
          how: '',
          prevention: []
        },
        createdBy: 'security-admin@mindtrack.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setSecurityIncidents(prev => [newIncident, ...prev]);
      
      return newIncident;
      
    } catch (error) {
      console.error('Security incident creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate security metrics - Güvenlik metriklerini hesaplama
  const calculateSecurityMetrics = useCallback(() => {
    const totalPolicies = securityPolicies.length;
    const activePolicies = securityPolicies.filter(policy => policy.status === 'active').length;
    const totalBiometrics = biometricAuths.length;
    const enabledBiometrics = biometricAuths.filter(bio => bio.status === 'enabled').length;
    const totalZeroTrust = zeroTrustPolicies.length;
    const activeZeroTrust = zeroTrustPolicies.filter(zt => zt.status === 'active').length;
    const totalHSMs = hardwareSecurityModules.length;
    const activeHSMs = hardwareSecurityModules.filter(hsm => hsm.status === 'active').length;
    const totalIncidents = securityIncidents.length;
    const resolvedIncidents = securityIncidents.filter(incident => incident.status === 'resolved').length;
    const totalEncryption = encryptionPolicies.length;
    const activeEncryption = encryptionPolicies.filter(enc => enc.status === 'active').length;
    
    return {
      totalPolicies,
      activePolicies,
      policyActivationRate: totalPolicies > 0 ? Math.round((activePolicies / totalPolicies) * 100) : 0,
      totalBiometrics,
      enabledBiometrics,
      biometricActivationRate: totalBiometrics > 0 ? Math.round((enabledBiometrics / totalBiometrics) * 100) : 0,
      totalZeroTrust,
      activeZeroTrust,
      zeroTrustActivationRate: totalZeroTrust > 0 ? Math.round((activeZeroTrust / totalZeroTrust) * 100) : 0,
      totalHSMs,
      activeHSMs,
      hsmActivationRate: totalHSMs > 0 ? Math.round((activeHSMs / totalHSMs) * 100) : 0,
      totalIncidents,
      resolvedIncidents,
      incidentResolutionRate: totalIncidents > 0 ? Math.round((resolvedIncidents / totalIncidents) * 100) : 0,
      totalEncryption,
      activeEncryption,
      encryptionActivationRate: totalEncryption > 0 ? Math.round((activeEncryption / totalEncryption) * 100) : 0
    };
  }, [securityPolicies, biometricAuths, zeroTrustPolicies, hardwareSecurityModules, securityIncidents, encryptionPolicies]);

  const metrics = calculateSecurityMetrics();

  return (
    <div className="space-y-6">
      {/* Header Section - Başlık Bölümü */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🔐 Advanced Security Features</h2>
          <p className="text-gray-600">Zero trust architecture and advanced security controls</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <ShieldCheck className="h-3 w-3 mr-1" />
            {securityScore}% Security Score
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Activity className="h-3 w-3 mr-1" />
            {metrics.activePolicies} Active Policies
          </Badge>
        </div>
      </div>

      {/* Security Overview - Güvenlik Genel Bakış */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Security Policies</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{metrics.activePolicies}</div>
            <p className="text-xs text-green-700">
              {metrics.totalPolicies} total policies
            </p>
            <Progress value={metrics.policyActivationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Biometric Auth</CardTitle>
            <Fingerprint className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics.enabledBiometrics}</div>
            <p className="text-xs text-blue-700">
              {metrics.totalBiometrics} total users
            </p>
            <Progress value={metrics.biometricActivationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Zero Trust</CardTitle>
            <Lock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{metrics.activeZeroTrust}</div>
            <p className="text-xs text-purple-700">
              {metrics.totalZeroTrust} total policies
            </p>
            <Progress value={metrics.zeroTrustActivationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Security Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{metrics.resolvedIncidents}</div>
            <p className="text-xs text-orange-700">
              {metrics.totalIncidents} total incidents
            </p>
            <Progress value={metrics.incidentResolutionRate} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Security Policies - Güvenlik Politikaları */}
      <Card className="border-2 border-green-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-600" />
              <span className="text-green-900">Security Policies</span>
            </div>
            <Button
              onClick={() => setShowCreatePolicy(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Policy
            </Button>
          </CardTitle>
          <CardDescription className="text-green-700">
            Manage security policies and compliance requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {securityPolicies.map((policy) => (
              <div key={policy.id} className="border border-green-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-green-900">{policy.name}</div>
                    <div className="text-sm text-green-600">{policy.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={policy.status === 'active' ? 'default' : 'secondary'} className="bg-green-100 text-green-800">
                      {policy.status}
                    </Badge>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      {policy.type}
                    </Badge>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      {policy.priority}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Rules</h4>
                    <div className="space-y-1 text-sm text-green-600">
                      <div>Total Rules: {policy.rules.length}</div>
                      <div>Strict Rules: {policy.rules.filter(r => r.enforcement === 'strict').length}</div>
                      <div>Moderate Rules: {policy.rules.filter(r => r.enforcement === 'moderate').length}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Compliance</h4>
                    <div className="space-y-1 text-sm text-green-600">
                      <div>Standards: {policy.compliance.standards.length}</div>
                      <div>Requirements: {policy.compliance.requirements.length}</div>
                      <div>Audit Schedule: {policy.compliance.auditSchedule}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Monitoring</h4>
                    <div className="space-y-1 text-sm text-green-600">
                      <div>Enabled: {policy.monitoring.enabled ? '✅' : '❌'}</div>
                      <div>Alerts: {policy.monitoring.alerts.length}</div>
                      <div>Last Updated: {policy.updatedAt.toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hardware Security Modules - Donanım Güvenlik Modülleri */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Server className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-blue-900">Hardware Security Modules</span>
            </div>
            <Button
              onClick={() => setShowCreateIncident(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Report Incident
            </Button>
          </CardTitle>
          <CardDescription className="text-blue-700">
            Monitor hardware security modules and cryptographic operations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {hardwareSecurityModules.map((hsm) => (
              <div key={hsm.id} className="border border-blue-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-blue-900">{hsm.name}</div>
                    <div className="text-sm text-blue-600">{hsm.model} • {hsm.manufacturer}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={hsm.status === 'active' ? 'default' : 'secondary'} className="bg-blue-100 text-blue-800">
                      {hsm.status}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {hsm.type}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      v{hsm.firmwareVersion}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Capabilities</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Key Generation: {hsm.capabilities.keyGeneration ? '✅' : '❌'}</div>
                      <div>Key Storage: {hsm.capabilities.keyStorage ? '✅' : '❌'}</div>
                      <div>Encryption: {hsm.capabilities.encryption ? '✅' : '❌'}</div>
                      <div>Signing: {hsm.capabilities.signing ? '✅' : '❌'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Performance</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Ops/sec: {hsm.performance.operationsPerSecond.toLocaleString()}</div>
                      <div>Latency: {hsm.performance.latency}ms</div>
                      <div>Uptime: {hsm.performance.uptime}%</div>
                      <div>Error Rate: {hsm.performance.errorRate}%</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Security</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Tamper Detection: {hsm.security.tamperDetection ? '✅' : '❌'}</div>
                      <div>Physical Security: {hsm.security.physicalSecurity ? '✅' : '❌'}</div>
                      <div>Audit Logging: {hsm.security.auditLogging ? '✅' : '❌'}</div>
                      <div>Backup: {hsm.security.backupEnabled ? '✅' : '❌'}</div>
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
