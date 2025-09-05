'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Users,
  Activity,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Globe,
  Building,
  Receipt,
  Wallet,
  Database,
  Code,
  Settings,
  BookOpen,
  Award,
  Star,
  Lightbulb,
  Bell,
  Info,
  Key,
  Fingerprint,
  Smartphone,
  Mail,
  Phone,
  Calendar,
  FileText,
  TrendingUp,
  AlertCircle,
  UserCheck,
  UserX,
  LogIn,
  LogOut,
  RefreshCw,
  Monitor,
  Server,
  HardDrive,
  Network,
  Wifi,
  WifiOff
} from 'lucide-react';

// Interfaces
interface SecurityRole {
  id: string;
  role_name: string;
  role_description?: string;
  role_type: string;
  permissions: any;
  is_active: boolean;
}

interface AuditLog {
  id: string;
  user_id?: string;
  session_id?: string;
  action_type: string;
  resource_type: string;
  resource_id?: string;
  action_description?: string;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  error_message?: string;
  risk_level: string;
  compliance_category?: string;
  data_classification: string;
  timestamp: string;
}

interface SecurityIncident {
  id: string;
  incident_id: string;
  incident_type: string;
  severity: string;
  status: string;
  title: string;
  description: string;
  affected_users: number;
  affected_patients: number;
  data_compromised?: string[];
  detection_method?: string;
  detection_timestamp: string;
  containment_timestamp?: string;
  resolution_timestamp?: string;
  assigned_to?: string;
  investigation_notes?: string;
  remediation_actions?: string[];
  lessons_learned?: string;
  prevention_measures?: string[];
  regulatory_notification_required: boolean;
  regulatory_notification_sent: boolean;
}

interface ComplianceFramework {
  id: string;
  framework_name: string;
  framework_version: string;
  framework_type: string;
  description?: string;
  applicable_scope?: string[];
  requirements: any;
  controls: any;
  assessment_frequency_months: number;
  last_assessment_date?: string;
  next_assessment_date?: string;
  compliance_status: string;
  compliance_score?: number;
  is_active: boolean;
}

interface SecurityTrainingRecord {
  id: string;
  user_id: string;
  training_type: string;
  training_title: string;
  training_provider?: string;
  training_date: string;
  completion_date?: string;
  score?: number;
  passing_score: number;
  status: string;
  certificate_url?: string;
  expiration_date?: string;
  retake_required: boolean;
  retake_date?: string;
}

export function AdvancedSecurityCompliance() {
  const [activeTab, setActiveTab] = useState('overview');
  const [securityRoles, setSecurityRoles] = useState<SecurityRole[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [securityIncidents, setSecurityIncidents] = useState<SecurityIncident[]>([]);
  const [complianceFrameworks, setComplianceFrameworks] = useState<ComplianceFramework[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<SecurityTrainingRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data
  useEffect(() => {
    setSecurityRoles([
      {
        id: '1',
        role_name: 'Admin',
        role_description: 'Full system administration access',
        role_type: 'system',
        permissions: {
          'users.create': true,
          'users.read': true,
          'users.update': true,
          'users.delete': true,
          'security.manage': true,
          'compliance.view': true,
          'audit.view': true
        },
        is_active: true
      },
      {
        id: '2',
        role_name: 'Psychiatrist',
        role_description: 'Clinical access for psychiatrists',
        role_type: 'clinical',
        permissions: {
          'patients.create': true,
          'patients.read': true,
          'patients.update': true,
          'medications.prescribe': true,
          'appointments.manage': true,
          'reports.generate': true
        },
        is_active: true
      },
      {
        id: '3',
        role_name: 'Nurse',
        role_description: 'Nursing staff access',
        role_type: 'clinical',
        permissions: {
          'patients.read': true,
          'patients.update': true,
          'medications.administer': true,
          'vitals.record': true
        },
        is_active: true
      }
    ]);

    setAuditLogs([
      {
        id: '1',
        user_id: 'user-1',
        action_type: 'login',
        resource_type: 'authentication',
        action_description: 'User login',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: true,
        risk_level: 'low',
        compliance_category: 'hipaa',
        data_classification: 'internal',
        timestamp: '2024-01-25T14:00:00Z'
      },
      {
        id: '2',
        user_id: 'user-2',
        action_type: 'create',
        resource_type: 'patient',
        resource_id: 'patient-123',
        action_description: 'Created new patient record',
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        success: true,
        risk_level: 'medium',
        compliance_category: 'hipaa',
        data_classification: 'confidential',
        timestamp: '2024-01-25T14:15:00Z'
      },
      {
        id: '3',
        user_id: 'user-3',
        action_type: 'export',
        resource_type: 'patient_data',
        action_description: 'Exported patient data',
        ip_address: '192.168.1.102',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: false,
        error_message: 'Insufficient permissions',
        risk_level: 'high',
        compliance_category: 'hipaa',
        data_classification: 'restricted',
        timestamp: '2024-01-25T14:30:00Z'
      }
    ]);

    setSecurityIncidents([
      {
        id: '1',
        incident_id: 'INC-20240125-001',
        incident_type: 'unauthorized_access',
        severity: 'high',
        status: 'investigating',
        title: 'Suspicious login attempt from unknown IP',
        description: 'Multiple failed login attempts detected from IP address 203.0.113.1',
        affected_users: 1,
        affected_patients: 0,
        data_compromised: [],
        detection_method: 'automated_monitoring',
        detection_timestamp: '2024-01-25T15:00:00Z',
        assigned_to: 'admin-1',
        investigation_notes: 'Investigating source of unauthorized access attempts',
        remediation_actions: ['Blocked suspicious IP', 'Reset user password', 'Enabled MFA'],
        prevention_measures: ['Enhanced monitoring', 'IP whitelisting'],
        regulatory_notification_required: false,
        regulatory_notification_sent: false
      },
      {
        id: '2',
        incident_id: 'INC-20240125-002',
        incident_type: 'data_loss',
        severity: 'critical',
        status: 'contained',
        title: 'Potential data breach in patient records',
        description: 'Unauthorized access to patient records detected',
        affected_users: 2,
        affected_patients: 150,
        data_compromised: ['patient_names', 'medical_records', 'contact_info'],
        detection_method: 'audit_log_analysis',
        detection_timestamp: '2024-01-25T16:00:00Z',
        containment_timestamp: '2024-01-25T16:30:00Z',
        assigned_to: 'admin-1',
        investigation_notes: 'Contained the breach and investigating extent',
        remediation_actions: ['Revoked access', 'Notified affected patients', 'Enhanced security'],
        lessons_learned: 'Need better access controls',
        prevention_measures: ['Implement zero-trust', 'Regular access reviews'],
        regulatory_notification_required: true,
        regulatory_notification_sent: true,
        regulatory_notification_date: '2024-01-25T17:00:00Z'
      }
    ]);

    setComplianceFrameworks([
      {
        id: '1',
        framework_name: 'HIPAA',
        framework_version: 'v1.0',
        framework_type: 'hipaa',
        description: 'Health Insurance Portability and Accountability Act',
        applicable_scope: ['healthcare', 'patient_data', 'phi'],
        requirements: {
          'administrative_safeguards': true,
          'physical_safeguards': true,
          'technical_safeguards': true
        },
        controls: {
          'access_control': 'implemented',
          'audit_logging': 'implemented',
          'encryption': 'implemented'
        },
        assessment_frequency_months: 12,
        last_assessment_date: '2024-01-01',
        next_assessment_date: '2025-01-01',
        compliance_status: 'compliant',
        compliance_score: 95.0,
        is_active: true
      },
      {
        id: '2',
        framework_name: 'SOC 2 Type II',
        framework_version: 'v2.0',
        framework_type: 'soc2',
        description: 'Service Organization Control 2 Type II',
        applicable_scope: ['security', 'availability', 'confidentiality'],
        requirements: {
          'security': true,
          'availability': true,
          'confidentiality': true,
          'processing_integrity': true,
          'privacy': true
        },
        controls: {
          'access_controls': 'implemented',
          'system_operations': 'implemented',
          'change_management': 'implemented'
        },
        assessment_frequency_months: 12,
        last_assessment_date: '2024-01-15',
        next_assessment_date: '2025-01-15',
        compliance_status: 'compliant',
        compliance_score: 92.0,
        is_active: true
      }
    ]);

    setTrainingRecords([
      {
        id: '1',
        user_id: 'user-1',
        training_type: 'hipaa',
        training_title: 'HIPAA Privacy and Security Training',
        training_provider: 'Healthcare Compliance Institute',
        training_date: '2024-01-01',
        completion_date: '2024-01-15',
        score: 95.0,
        passing_score: 80.0,
        status: 'completed',
        certificate_url: 'https://example.com/certificates/hipaa-001.pdf',
        expiration_date: '2025-01-15',
        retake_required: false
      },
      {
        id: '2',
        user_id: 'user-2',
        training_type: 'security_awareness',
        training_title: 'Security Awareness Training',
        training_provider: 'Cybersecurity Academy',
        training_date: '2024-01-10',
        completion_date: '2024-01-20',
        score: 88.0,
        passing_score: 80.0,
        status: 'completed',
        certificate_url: 'https://example.com/certificates/security-002.pdf',
        expiration_date: '2025-01-20',
        retake_required: false
      },
      {
        id: '3',
        user_id: 'user-3',
        training_type: 'phishing',
        training_title: 'Phishing Awareness Training',
        training_provider: 'Security Training Corp',
        training_date: '2024-01-15',
        status: 'in_progress',
        passing_score: 80.0,
        retake_required: false
      }
    ]);
  }, []);

  const getRoleTypeColor = (type: string) => {
    switch (type) {
      case 'system': return 'destructive';
      case 'clinical': return 'default';
      case 'administrative': return 'secondary';
      case 'custom': return 'outline';
      default: return 'default';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'investigating': return 'secondary';
      case 'contained': return 'secondary';
      case 'resolved': return 'default';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'default';
      case 'partially_compliant': return 'secondary';
      case 'non_compliant': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'default';
    }
  };

  const getTrainingStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'failed': return 'destructive';
      case 'expired': return 'destructive';
      case 'assigned': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Advanced Security & Compliance</h2>
          <p className="text-muted-foreground">
            Comprehensive security management, compliance monitoring, and risk assessment
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Security Policy
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roles">Security Roles</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="incidents">Security Incidents</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="training">Security Training</TabsTrigger>
          <TabsTrigger value="policies">Security Policies</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Roles</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityRoles.length}</div>
                <p className="text-xs text-muted-foreground">
                  {securityRoles.filter(r => r.is_active).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Incidents</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityIncidents.length}</div>
                <p className="text-xs text-muted-foreground">
                  {securityIncidents.filter(i => i.status === 'open').length} open
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {complianceFrameworks.length > 0 ? Math.round(complianceFrameworks.reduce((sum, f) => sum + (f.compliance_score || 0), 0) / complianceFrameworks.length) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average compliance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Training Completion</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {trainingRecords.length > 0 ? Math.round((trainingRecords.filter(t => t.status === 'completed').length / trainingRecords.length) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Completion rate
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Incidents</CardTitle>
                <CardDescription>Latest security incidents and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {securityIncidents.slice(0, 3).map((incident) => (
                  <div key={incident.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{incident.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {incident.incident_type} - {new Date(incident.detection_timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </Badge>
                      <Badge variant={getStatusColor(incident.status)}>
                        {incident.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <CardDescription>Current compliance framework status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {complianceFrameworks.slice(0, 3).map((framework) => (
                  <div key={framework.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{framework.framework_name}</p>
                      <p className="text-xs text-muted-foreground">{framework.framework_version}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{framework.compliance_score}%</p>
                      <Badge variant={getComplianceStatusColor(framework.compliance_status)}>
                        {framework.compliance_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Security Roles</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Role
            </Button>
          </div>

          <div className="grid gap-4">
            {securityRoles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{role.role_name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getRoleTypeColor(role.role_type)}>
                        {role.role_type}
                      </Badge>
                      <Badge variant={role.is_active ? 'default' : 'secondary'}>
                        {role.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{role.role_description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Permissions</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.keys(role.permissions).map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Audit Logs</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {auditLogs.map((log) => (
              <Card key={log.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{log.action_type}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getRiskLevelColor(log.risk_level)}>
                        {log.risk_level}
                      </Badge>
                      <Badge variant={log.success ? 'default' : 'destructive'}>
                        {log.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {log.resource_type} - {new Date(log.timestamp).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">IP Address</p>
                        <p className="text-sm text-muted-foreground">{log.ip_address || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Data Classification</p>
                        <p className="text-sm text-muted-foreground">{log.data_classification}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Compliance Category</p>
                        <p className="text-sm text-muted-foreground">{log.compliance_category || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Resource ID</p>
                        <p className="text-sm text-muted-foreground">{log.resource_id || 'N/A'}</p>
                      </div>
                    </div>
                    {log.action_description && (
                      <div>
                        <p className="text-sm font-medium">Description</p>
                        <p className="text-sm text-muted-foreground">{log.action_description}</p>
                      </div>
                    )}
                    {log.error_message && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Error: {log.error_message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Security Incidents</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Report Incident
            </Button>
          </div>

          <div className="grid gap-4">
            {securityIncidents.map((incident) => (
              <Card key={incident.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{incident.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </Badge>
                      <Badge variant={getStatusColor(incident.status)}>
                        {incident.status}
                      </Badge>
                      <Badge variant="outline">{incident.incident_type}</Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {incident.incident_id} - {new Date(incident.detection_timestamp).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Description</p>
                      <p className="text-sm text-muted-foreground">{incident.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Affected Users</p>
                        <p className="text-sm text-muted-foreground">{incident.affected_users}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Affected Patients</p>
                        <p className="text-sm text-muted-foreground">{incident.affected_patients}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Detection Method</p>
                        <p className="text-sm text-muted-foreground">{incident.detection_method || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Assigned To</p>
                        <p className="text-sm text-muted-foreground">{incident.assigned_to || 'Unassigned'}</p>
                      </div>
                    </div>
                    {incident.data_compromised && incident.data_compromised.length > 0 && (
                      <div>
                        <p className="text-sm font-medium">Data Compromised</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {incident.data_compromised.map((data, index) => (
                            <Badge key={index} variant="destructive" className="text-xs">
                              {data}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {incident.remediation_actions && incident.remediation_actions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium">Remediation Actions</p>
                        <ul className="text-sm text-muted-foreground mt-2">
                          {incident.remediation_actions.map((action, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {incident.regulatory_notification_required && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Regulatory notification {incident.regulatory_notification_sent ? 'sent' : 'required'}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Compliance Frameworks</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Framework
            </Button>
          </div>

          <div className="grid gap-4">
            {complianceFrameworks.map((framework) => (
              <Card key={framework.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{framework.framework_name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getComplianceStatusColor(framework.compliance_status)}>
                        {framework.compliance_status}
                      </Badge>
                      <Badge variant="outline">{framework.framework_type}</Badge>
                      <Badge variant={framework.is_active ? 'default' : 'secondary'}>
                        {framework.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {framework.framework_version} - {framework.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Compliance Score</p>
                        <p className="text-sm text-muted-foreground">{framework.compliance_score || 'N/A'}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Assessment Frequency</p>
                        <p className="text-sm text-muted-foreground">{framework.assessment_frequency_months} months</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Last Assessment</p>
                        <p className="text-sm text-muted-foreground">
                          {framework.last_assessment_date ? new Date(framework.last_assessment_date).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Next Assessment</p>
                        <p className="text-sm text-muted-foreground">
                          {framework.next_assessment_date ? new Date(framework.next_assessment_date).toLocaleDateString() : 'Not scheduled'}
                        </p>
                      </div>
                    </div>
                    {framework.applicable_scope && framework.applicable_scope.length > 0 && (
                      <div>
                        <p className="text-sm font-medium">Applicable Scope</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {framework.applicable_scope.map((scope, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {scope}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Security Training Records</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Assign Training
            </Button>
          </div>

          <div className="grid gap-4">
            {trainingRecords.map((training) => (
              <Card key={training.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{training.training_title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getTrainingStatusColor(training.status)}>
                        {training.status}
                      </Badge>
                      <Badge variant="outline">{training.training_type}</Badge>
                    </div>
                  </div>
                  <CardDescription>
                    User {training.user_id} - {training.training_provider}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Training Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(training.training_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Completion Date</p>
                        <p className="text-sm text-muted-foreground">
                          {training.completion_date ? new Date(training.completion_date).toLocaleDateString() : 'Not completed'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Score</p>
                        <p className="text-sm text-muted-foreground">
                          {training.score ? `${training.score}%` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Passing Score</p>
                        <p className="text-sm text-muted-foreground">{training.passing_score}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Expiration Date</p>
                        <p className="text-sm text-muted-foreground">
                          {training.expiration_date ? new Date(training.expiration_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Retake Required</p>
                        <p className="text-sm text-muted-foreground">
                          {training.retake_required ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                    {training.certificate_url && (
                      <div>
                        <p className="text-sm font-medium">Certificate</p>
                        <a 
                          href={training.certificate_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Certificate
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Security Policies</CardTitle>
                <CardDescription>Current security policies and procedures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <FileText className="h-8 w-8" />
                  <span className="ml-2">Security policies will be displayed here</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
                <CardDescription>User access management and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <Lock className="h-8 w-8" />
                  <span className="ml-2">Access control settings will be displayed here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Security Analytics</CardTitle>
                <CardDescription>Security metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="h-8 w-8" />
                  <span className="ml-2">Security analytics chart will be displayed here</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>Security risk analysis and mitigation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <Target className="h-8 w-8" />
                  <span className="ml-2">Risk assessment dashboard will be displayed here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
