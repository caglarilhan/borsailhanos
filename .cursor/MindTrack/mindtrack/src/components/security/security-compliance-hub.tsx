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
  Shield, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  Users,
  Database,
  Server,
  Cloud,
  Wifi,
  WifiOff,
  Key,
  Fingerprint,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  HardDrive,
  FileText,
  FileCheck,
  FileX,
  FileAlert,
  FileLock,
  FileUnlock,
  FileShield,
  FileKey,
  FileFingerprint,
  FileEye,
  FileEyeOff,
  FileAlertTriangle,
  FileCheckCircle,
  FileXCircle,
  FileClock,
  FileCalendar,
  FileUsers,
  FileDatabase,
  FileServer,
  FileCloud,
  FileWifi,
  FileWifiOff,
  FileKey2,
  FileFingerprint2,
  FileSmartphone,
  FileTablet,
  FileLaptop,
  FileMonitor,
  FileHardDrive,
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
  User,
  UserCheck,
  UserX,
  Phone,
  Mail,
  MessageSquare,
  Bell,
  BellOff,
  BookOpen,
  Activity,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Star,
  Heart,
  Brain,
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
  Link,
  Link2,
  LinkBreak,
  LinkBreak2,
  Network,
  Wifi2,
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
  BatteryFileAlertCircle
} from "lucide-react";

// Security & Compliance için gerekli interface'ler
interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  category: 'authentication' | 'authorization' | 'encryption' | 'audit' | 'compliance';
  status: 'active' | 'inactive' | 'pending' | 'failed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  lastUpdated: Date;
  nextReview: Date;
  compliance: {
    hipaa: boolean;
    gdpr: boolean;
    sox: boolean;
    pci: boolean;
  };
  requirements: string[];
  implementation: string;
}

interface ComplianceAudit {
  id: string;
  name: string;
  type: 'hipaa' | 'gdpr' | 'sox' | 'pci' | 'internal';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  score: number; // 0-100
  findings: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  startDate: Date;
  endDate: Date;
  auditor: string;
  recommendations: string[];
  nextAudit: Date;
}

interface DataEncryption {
  id: string;
  type: 'at_rest' | 'in_transit' | 'end_to_end';
  algorithm: string;
  keyStrength: number; // bits
  status: 'active' | 'rotating' | 'expired';
  lastRotated: Date;
  nextRotation: Date;
  compliance: {
    hipaa: boolean;
    gdpr: boolean;
    sox: boolean;
  };
  encryptionLevel: 'standard' | 'enhanced' | 'military';
}

interface AccessControl {
  id: string;
  userId: string;
  resource: string;
  permission: 'read' | 'write' | 'delete' | 'admin';
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  status: 'active' | 'expired' | 'revoked';
  reason: string;
  ipAddress?: string;
  deviceInfo?: {
    type: string;
    os: string;
    browser: string;
  };
}

interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  category: 'breach' | 'unauthorized_access' | 'data_loss' | 'malware' | 'phishing';
  affectedUsers: number;
  affectedData: string[];
  detectedAt: Date;
  resolvedAt?: Date;
  assignedTo: string;
  actions: string[];
  lessons: string[];
}

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details: Record<string, unknown>;
  sessionId: string;
  location?: {
    country: string;
    city: string;
    coordinates: [number, number];
  };
}

// Security & Compliance Hub Component - Güvenlik ve uyumluluk merkezi
export function SecurityComplianceHub() {
  // State management - Uygulama durumunu yönetmek için
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([]);
  const [complianceAudits, setComplianceAudits] = useState<ComplianceAudit[]>([]);
  const [dataEncryption, setDataEncryption] = useState<DataEncryption[]>([]);
  const [accessControls, setAccessControls] = useState<AccessControl[]>([]);
  const [securityIncidents, setSecurityIncidents] = useState<SecurityIncident[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<SecurityPolicy | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<ComplianceAudit | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreatePolicy, setShowCreatePolicy] = useState(false);
  const [showSecurityScan, setShowSecurityScan] = useState(false);
  const [complianceScore, setComplianceScore] = useState(0);
  const [securityScore, setSecurityScore] = useState(0);

  // Mock data initialization - Test verilerini yüklemek için
  useEffect(() => {
    // Simulated data loading - Gerçek API'den veri çekme simülasyonu
    const mockSecurityPolicies: SecurityPolicy[] = [
      {
        id: '1',
        name: 'HIPAA Data Protection Policy',
        description: 'Comprehensive policy for protecting patient health information',
        category: 'compliance',
        status: 'active',
        priority: 'critical',
        lastUpdated: new Date(),
        nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        compliance: {
          hipaa: true,
          gdpr: true,
          sox: false,
          pci: false
        },
        requirements: [
          'Encrypt all PHI at rest and in transit',
          'Implement access controls and audit trails',
          'Regular security assessments and updates',
          'Employee training on HIPAA compliance'
        ],
        implementation: 'Fully implemented with AES-256 encryption'
      },
      {
        id: '2',
        name: 'Multi-Factor Authentication Policy',
        description: 'Requires MFA for all user accounts',
        category: 'authentication',
        status: 'active',
        priority: 'high',
        lastUpdated: new Date(),
        nextReview: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        compliance: {
          hipaa: true,
          gdpr: true,
          sox: true,
          pci: true
        },
        requirements: [
          'SMS or app-based 2FA for all users',
          'Backup codes for account recovery',
          'Regular MFA status monitoring',
          'Grace period for MFA enrollment'
        ],
        implementation: 'SMS and TOTP app support enabled'
      },
      {
        id: '3',
        name: 'Data Backup and Recovery Policy',
        description: 'Ensures data availability and business continuity',
        category: 'audit',
        status: 'active',
        priority: 'high',
        lastUpdated: new Date(),
        nextReview: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        compliance: {
          hipaa: true,
          gdpr: true,
          sox: true,
          pci: false
        },
        requirements: [
          'Daily automated backups',
          'Off-site backup storage',
          'Regular backup testing and restoration',
          'Backup encryption and access controls'
        ],
        implementation: 'Automated daily backups with 30-day retention'
      }
    ];

    const mockComplianceAudits: ComplianceAudit[] = [
      {
        id: '1',
        name: 'HIPAA Annual Compliance Audit',
        type: 'hipaa',
        status: 'completed',
        score: 94,
        findings: {
          critical: 0,
          high: 1,
          medium: 3,
          low: 2
        },
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        auditor: 'HealthCare Compliance Associates',
        recommendations: [
          'Implement additional logging for admin actions',
          'Update employee training materials',
          'Enhance incident response procedures'
        ],
        nextAudit: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        name: 'GDPR Compliance Assessment',
        type: 'gdpr',
        status: 'in_progress',
        score: 87,
        findings: {
          critical: 0,
          high: 2,
          medium: 4,
          low: 1
        },
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        auditor: 'Data Protection Solutions',
        recommendations: [
          'Implement data retention policies',
          'Enhance user consent management',
          'Add data portability features'
        ],
        nextAudit: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockDataEncryption: DataEncryption[] = [
      {
        id: '1',
        type: 'at_rest',
        algorithm: 'AES-256-GCM',
        keyStrength: 256,
        status: 'active',
        lastRotated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextRotation: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        compliance: {
          hipaa: true,
          gdpr: true,
          sox: true
        },
        encryptionLevel: 'enhanced'
      },
      {
        id: '2',
        type: 'in_transit',
        algorithm: 'TLS 1.3',
        keyStrength: 256,
        status: 'active',
        lastRotated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        nextRotation: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        compliance: {
          hipaa: true,
          gdpr: true,
          sox: true
        },
        encryptionLevel: 'enhanced'
      },
      {
        id: '3',
        type: 'end_to_end',
        algorithm: 'AES-256 + RSA-2048',
        keyStrength: 256,
        status: 'active',
        lastRotated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        nextRotation: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        compliance: {
          hipaa: true,
          gdpr: true,
          sox: false
        },
        encryptionLevel: 'military'
      }
    ];

    const mockAccessControls: AccessControl[] = [
      {
        id: '1',
        userId: 'user_001',
        resource: 'patient_records',
        permission: 'read',
        grantedBy: 'admin_001',
        grantedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'active',
        reason: 'Therapist access for patient care',
        ipAddress: '192.168.1.100',
        deviceInfo: {
          type: 'desktop',
          os: 'macOS',
          browser: 'Chrome'
        }
      },
      {
        id: '2',
        userId: 'user_002',
        resource: 'admin_panel',
        permission: 'admin',
        grantedBy: 'admin_001',
        grantedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: 'active',
        reason: 'System administration',
        ipAddress: '192.168.1.101',
        deviceInfo: {
          type: 'laptop',
          os: 'Windows',
          browser: 'Firefox'
        }
      }
    ];

    const mockSecurityIncidents: SecurityIncident[] = [
      {
        id: '1',
        title: 'Suspicious Login Attempt',
        description: 'Multiple failed login attempts from unknown IP address',
        severity: 'medium',
        status: 'resolved',
        category: 'unauthorized_access',
        affectedUsers: 1,
        affectedData: ['user_credentials'],
        detectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        assignedTo: 'security_team_001',
        actions: [
          'IP address blocked',
          'User account locked',
          'Additional monitoring enabled'
        ],
        lessons: [
          'Implement rate limiting for login attempts',
          'Enhance anomaly detection'
        ]
      }
    ];

    const mockAuditLogs: AuditLog[] = [
      {
        id: '1',
        userId: 'user_001',
        action: 'login',
        resource: 'web_application',
        timestamp: new Date(),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        success: true,
        details: {
          method: 'password',
          mfa: true,
          sessionId: 'sess_123456'
        },
        sessionId: 'sess_123456',
        location: {
          country: 'Turkey',
          city: 'Istanbul',
          coordinates: [41.0082, 28.9784]
        }
      },
      {
        id: '2',
        userId: 'user_001',
        action: 'view_patient_record',
        resource: 'patient_123',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        success: true,
        details: {
          recordType: 'medical_history',
          accessMethod: 'web_interface'
        },
        sessionId: 'sess_123456'
      }
    ];

    setSecurityPolicies(mockSecurityPolicies);
    setComplianceAudits(mockComplianceAudits);
    setDataEncryption(mockDataEncryption);
    setAccessControls(mockAccessControls);
    setSecurityIncidents(mockSecurityIncidents);
    setAuditLogs(mockAuditLogs);

    // Calculate compliance and security scores - Uyumluluk ve güvenlik skorlarını hesapla
    const calculateComplianceScore = () => {
      const totalAudits = mockComplianceAudits.length;
      if (totalAudits === 0) return 0;
      
      const totalScore = mockComplianceAudits.reduce((sum, audit) => sum + audit.score, 0);
      return Math.round(totalScore / totalAudits);
    };

    const calculateSecurityScore = () => {
      const totalPolicies = mockSecurityPolicies.length;
      if (totalPolicies === 0) return 0;
      
      const activePolicies = mockSecurityPolicies.filter(policy => policy.status === 'active').length;
      const criticalPolicies = mockSecurityPolicies.filter(policy => 
        policy.status === 'active' && policy.priority === 'critical'
      ).length;
      
      const baseScore = (activePolicies / totalPolicies) * 100;
      const criticalBonus = criticalPolicies * 10;
      
      return Math.min(Math.round(baseScore + criticalBonus), 100);
    };

    setComplianceScore(calculateComplianceScore());
    setSecurityScore(calculateSecurityScore());
  }, []);

  // Run security scan - Güvenlik taraması çalıştırma
  const runSecurityScan = useCallback(async () => {
    setLoading(true);
    
    try {
      // Simulated security scan - Güvenlik taraması simülasyonu
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Security scan results - Güvenlik taraması sonuçları
      const scanResults = {
        vulnerabilities: {
          critical: 0,
          high: 1,
          medium: 3,
          low: 5
        },
        compliance: {
          hipaa: 98,
          gdpr: 95,
          sox: 92,
          pci: 88
        },
        recommendations: [
          'Update SSL certificates',
          'Implement additional logging',
          'Review access controls',
          'Enhance backup procedures'
        ]
      };
      
      // Update security score - Güvenlik skorunu güncelle
      const newSecurityScore = Math.max(0, securityScore - scanResults.vulnerabilities.high * 5);
      setSecurityScore(newSecurityScore);
      
      return scanResults;
      
    } catch (error) {
      console.error('Security scan failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [securityScore]);

  // Create security policy - Güvenlik politikası oluşturma
  const createSecurityPolicy = useCallback(async (
    name: string,
    description: string,
    category: SecurityPolicy['category'],
    priority: SecurityPolicy['priority'],
    requirements: string[],
    implementation: string
  ) => {
    setLoading(true);
    
    try {
      // Simulated policy creation - Politika oluşturma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newPolicy: SecurityPolicy = {
        id: `policy_${Date.now()}`,
        name,
        description,
        category,
        status: 'pending',
        priority,
        lastUpdated: new Date(),
        nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        compliance: {
          hipaa: category === 'compliance' || category === 'encryption',
          gdpr: category === 'compliance' || category === 'audit',
          sox: category === 'compliance',
          pci: category === 'encryption'
        },
        requirements,
        implementation
      };
      
      setSecurityPolicies(prev => [...prev, newPolicy]);
      setShowCreatePolicy(false);
      
      return newPolicy;
      
    } catch (error) {
      console.error('Security policy creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Rotate encryption keys - Şifreleme anahtarlarını döndürme
  const rotateEncryptionKeys = useCallback(async (encryptionId: string) => {
    setLoading(true);
    
    try {
      // Simulated key rotation - Anahtar döndürme simülasyonu
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setDataEncryption(prev => prev.map(enc => {
        if (enc.id === encryptionId) {
          return {
            ...enc,
            status: 'rotating',
            lastRotated: new Date(),
            nextRotation: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          };
        }
        return enc;
      }));
      
      // Update status after rotation - Döndürme sonrası durumu güncelle
      setTimeout(() => {
        setDataEncryption(prev => prev.map(enc => {
          if (enc.id === encryptionId) {
            return { ...enc, status: 'active' as const };
          }
          return enc;
        }));
      }, 3000);
      
    } catch (error) {
      console.error('Encryption key rotation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Revoke access control - Erişim kontrolünü iptal etme
  const revokeAccessControl = useCallback(async (accessId: string, reason: string) => {
    setLoading(true);
    
    try {
      // Simulated access revocation - Erişim iptali simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAccessControls(prev => prev.map(access => {
        if (access.id === accessId) {
          return {
            ...access,
            status: 'revoked' as const,
            reason: reason
          };
        }
        return access;
      }));
      
    } catch (error) {
      console.error('Access control revocation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Section - Başlık Bölümü */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🔐 Security & Compliance Hub</h2>
          <p className="text-gray-600">HIPAA compliance, data protection, and security management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Shield className="h-3 w-3 mr-1" />
            {complianceScore}% Compliance
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Lock className="h-3 w-3 mr-1" />
            {securityScore}% Security
          </Badge>
        </div>
      </div>

      {/* Security Overview - Güvenlik Genel Bakış */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceScore}%</div>
            <p className="text-xs text-muted-foreground">
              {complianceScore >= 90 ? 'Excellent' : complianceScore >= 80 ? 'Good' : 'Needs attention'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityScore}%</div>
            <p className="text-xs text-muted-foreground">
              {securityScore >= 90 ? 'Excellent' : securityScore >= 80 ? 'Good' : 'Needs attention'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityPolicies.filter(p => p.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              {securityPolicies.filter(p => p.priority === 'critical').length} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityIncidents.filter(i => i.status === 'open').length}</div>
            <p className="text-xs text-muted-foreground">
              {securityIncidents.filter(i => i.severity === 'critical').length} critical
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Policies - Güvenlik Politikaları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Policies
            </div>
            <Button
              onClick={() => setShowCreatePolicy(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Policy
            </Button>
          </CardTitle>
          <CardDescription>
            HIPAA, GDPR, and security policy management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityPolicies.map((policy) => (
              <div key={policy.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">{policy.name}</div>
                    <div className="text-sm text-gray-600">{policy.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={policy.status === 'active' ? 'default' : 'secondary'}>
                      {policy.status}
                    </Badge>
                    <Badge variant={policy.priority === 'critical' ? 'destructive' : 'outline'}>
                      {policy.priority}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Compliance</h4>
                    <div className="space-y-1">
                      {Object.entries(policy.compliance).map(([standard, compliant]) => (
                        <div key={standard} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{standard.toUpperCase()}:</span>
                          <Badge variant={compliant ? 'default' : 'secondary'} className="text-xs">
                            {compliant ? 'Compliant' : 'Non-compliant'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Requirements</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {policy.requirements.slice(0, 3).map((req, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Last updated: {policy.lastUpdated.toLocaleDateString()}</span>
                    <span>Next review: {policy.nextReview.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {securityPolicies.length === 0 && (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No security policies created</p>
                <p className="text-sm text-gray-400">Create your first security policy to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Audits - Uyumluluk Denetimleri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileCheck className="h-5 w-5 mr-2" />
            Compliance Audits
          </CardTitle>
          <CardDescription>
            HIPAA, GDPR, and regulatory compliance assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceAudits.map((audit) => (
              <div key={audit.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">{audit.name}</div>
                    <div className="text-sm text-gray-600">
                      {audit.type.toUpperCase()} Audit • {audit.auditor}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={audit.status === 'completed' ? 'default' : 'secondary'}>
                      {audit.status}
                    </Badge>
                    <Badge variant="outline">
                      {audit.score}% Score
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Findings</h4>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-red-600">Critical:</span>
                        <span className="text-sm font-semibold">{audit.findings.critical}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-orange-600">High:</span>
                        <span className="text-sm font-semibold">{audit.findings.high}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-yellow-600">Medium:</span>
                        <span className="text-sm font-semibold">{audit.findings.medium}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-600">Low:</span>
                        <span className="text-sm font-semibold">{audit.findings.low}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Timeline</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Start: {audit.startDate.toLocaleDateString()}</div>
                      <div>End: {audit.endDate.toLocaleDateString()}</div>
                      <div>Next: {audit.nextAudit.toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Recommendations</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {audit.recommendations.slice(0, 3).map((rec, index) => (
                        <li key={index} className="flex items-center">
                          <Star className="h-3 w-3 mr-1 text-yellow-500" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Encryption - Veri Şifreleme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Data Encryption
            </div>
            <Button
              onClick={() => setShowSecurityScan(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Security Scan
            </Button>
          </CardTitle>
          <CardDescription>
            Encryption status and key management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dataEncryption.map((encryption) => (
              <div key={encryption.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">{encryption.type.replace('_', ' ').toUpperCase()}</div>
                    <div className="text-sm text-gray-600">
                      {encryption.algorithm} • {encryption.keyStrength} bits
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={encryption.status === 'active' ? 'default' : 'secondary'}>
                      {encryption.status}
                    </Badge>
                    <Badge variant="outline">
                      {encryption.encryptionLevel}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Compliance</h4>
                    <div className="space-y-1">
                      {Object.entries(encryption.compliance).map(([standard, compliant]) => (
                        <div key={standard} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{standard.toUpperCase()}:</span>
                          <Badge variant={compliant ? 'default' : 'secondary'} className="text-xs">
                            {compliant ? 'Compliant' : 'Non-compliant'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Key Management</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Last rotated: {encryption.lastRotated.toLocaleDateString()}</div>
                      <div>Next rotation: {encryption.nextRotation.toLocaleDateString()}</div>
                    </div>
                    <Button
                      onClick={() => rotateEncryptionKeys(encryption.id)}
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      disabled={loading}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Rotate Keys
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Incidents - Güvenlik Olayları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Security Incidents
          </CardTitle>
          <CardDescription>
            Incident tracking and response management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityIncidents.map((incident) => (
              <div key={incident.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">{incident.title}</div>
                    <div className="text-sm text-gray-600">{incident.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={incident.severity === 'critical' ? 'destructive' : 'secondary'}>
                      {incident.severity}
                    </Badge>
                    <Badge variant={incident.status === 'resolved' ? 'default' : 'secondary'}>
                      {incident.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Impact</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Affected users: {incident.affectedUsers}</div>
                      <div>Category: {incident.category}</div>
                      <div>Detected: {incident.detectedAt.toLocaleDateString()}</div>
                      {incident.resolvedAt && (
                        <div>Resolved: {incident.resolvedAt.toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Actions Taken</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {incident.actions.map((action, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {incident.lessons.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <h4 className="font-semibold text-sm mb-2">Lessons Learned</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {incident.lessons.map((lesson, index) => (
                        <li key={index} className="flex items-center">
                          <Info className="h-3 w-3 mr-1 text-blue-500" />
                          {lesson}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            
            {securityIncidents.length === 0 && (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No security incidents reported</p>
                <p className="text-sm text-gray-400">All systems are operating normally</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}






