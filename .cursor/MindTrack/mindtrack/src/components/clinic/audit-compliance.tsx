/**
 * Audit Trail & Compliance Component - Professional compliance management interface
 * 
 * Bu component ne işe yarar:
 * - Activity logging
 * - Compliance monitoring
 * - Audit trail tracking
 * - Security event management
 * - Professional compliance dashboard
 */

"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Zap,
  Target,
  Filter,
  Search,
  Calendar,
  Clock,
  Download,
  Upload,
  RefreshCw,
  ArrowUpDown,
  MoreVertical,
  Users,
  User,
  UserCheck,
  UserX,
  Settings,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit,
  Trash2,
  Copy,
  Mail,
  Phone,
  Globe,
  Building,
  Briefcase,
  Star,
  Award,
  Crown,
  Heart,
  UserCog,
  UserMinus,
  UserPlus,
  UserPlus2,
  Users2,
  GitBranch,
  GitPullRequest,
  GitCommit,
  GitMerge,
  GitCompare,
  GitPullRequestClosed,
  GitPullRequestDraft,
  GitPullRequestMerged,
  GitPullRequestNew,
  GitPullRequestReopened,
  GitPullRequestReview,
  GitPullRequestReviewRequested,
  GitPullRequestReviewRequestedChanges,
  GitPullRequestReviewApproved,
  GitPullRequestReviewChangesRequested,
  GitPullRequestReviewCommented,
  GitPullRequestReviewDismissed,
  GitPullRequestReviewPending,
  GitPullRequestReviewSubmitted,
  GitPullRequestReviewUnsubmitted,
  GitPullRequestReviewUnsubmittedChanges,
  GitPullRequestReviewUnsubmittedCommented,
  GitPullRequestReviewUnsubmittedDismissed,
  GitPullRequestReviewUnsubmittedPending,
  GitPullRequestReviewUnsubmittedSubmitted,
  GitPullRequestReviewUnsubmittedUnsubmitted,
  GitPullRequestReviewUnsubmittedUnsubmittedChanges,
  GitPullRequestReviewUnsubmittedUnsubmittedCommented,
  GitPullRequestReviewUnsubmittedUnsubmittedDismissed,
  GitPullRequestReviewUnsubmittedUnsubmittedPending,
  GitPullRequestReviewUnsubmittedUnsubmittedSubmitted,
  GitPullRequestReviewUnsubmittedUnsubmittedUnsubmitted
} from "lucide-react";

// Audit ve Compliance types - Bu interface'ler audit ve compliance data'larını tanımlar
interface AuditData {
  activities: AuditActivity[];
  complianceStatus: ComplianceStatus[];
  securityEvents: SecurityEvent[];
  policyViolations: PolicyViolation[];
  accessLogs: AccessLog[];
  complianceMetrics: ComplianceMetrics;
  auditReports: AuditReport[];
}

interface AuditActivity {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed' | 'warning';
  details: string;
  category: 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'system' | 'admin';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ComplianceStatus {
  category: string;
  status: 'compliant' | 'non_compliant' | 'warning' | 'pending';
  score: number;
  lastChecked: string;
  nextCheck: string;
  issues: ComplianceIssue[];
  requirements: ComplianceRequirement[];
}

interface SecurityEvent {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  details: string;
  category: 'authentication' | 'authorization' | 'data_breach' | 'system' | 'network' | 'malware';
}

interface PolicyViolation {
  id: string;
  policyId: string;
  policyName: string;
  userId: string;
  userName: string;
  violationType: string;
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  assignedTo?: string;
  resolution?: string;
  resolvedAt?: string;
}

interface AccessLog {
  id: string;
  userId: string;
  userName: string;
  resource: string;
  resourceId: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: 'granted' | 'denied' | 'expired';
  reason?: string;
}

interface ComplianceMetrics {
  overallScore: number;
  hipaaCompliance: number;
  dataPrivacy: number;
  accessControl: number;
  auditTrail: number;
  securityScore: number;
  lastUpdated: string;
  trends: ComplianceTrend[];
}

interface ComplianceTrend {
  date: string;
  score: number;
  category: string;
}

interface AuditReport {
  id: string;
  name: string;
  type: 'compliance' | 'security' | 'access' | 'policy' | 'custom';
  status: 'generated' | 'generating' | 'failed';
  createdAt: string;
  generatedBy: string;
  period: {
    start: string;
    end: string;
  };
  fileSize?: string;
  downloadUrl?: string;
  summary: AuditReportSummary;
}

interface AuditReportSummary {
  totalActivities: number;
  securityEvents: number;
  policyViolations: number;
  complianceScore: number;
  recommendations: string[];
}

interface ComplianceIssue {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'dismissed';
  assignedTo?: string;
  dueDate?: string;
  resolvedAt?: string;
}

interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'met' | 'not_met' | 'partial' | 'not_applicable';
  evidence?: string;
  lastVerified: string;
}

/**
 * Audit & Compliance Props - Component'e gerekli data'ları geçer
 * Bu interface ne işe yarar:
 * - Audit data'larını component'e geçer
 * - Event handler'ları tanımlar
 * - Configuration options sağlar
 */
interface AuditComplianceProps {
  data: AuditData;
  onGenerateReport: (type: string, filters?: any) => Promise<void>;
  onExportData: (format: 'csv' | 'pdf' | 'excel', data: any) => Promise<void>;
  onRefreshData: () => Promise<void>;
  onFilterData: (filters: any) => Promise<void>;
  onResolveEvent: (eventId: string, resolution: string) => Promise<void>;
  onResolveViolation: (violationId: string, resolution: string) => Promise<void>;
  loading?: boolean;
}

/**
 * Audit & Compliance Component - Ana component
 * Bu component ne işe yarar:
 * - Professional compliance dashboard
 * - Audit trail management
 * - Security event tracking
 * - Compliance monitoring
 * - User experience optimization
 */
export default function AuditCompliance({
  data,
  onGenerateReport,
  onExportData,
  onRefreshData,
  onFilterData,
  onResolveEvent,
  onResolveViolation,
  loading = false
}: AuditComplianceProps) {
  
  /**
   * Component state'ini initialize eder
   * Bu state ne işe yarar:
   * - UI state management
   * - Filter state
   * - Report generation state
   * - User interactions
   */
  const [uiState, setUiState] = React.useState({
    activeTab: 'overview' as 'overview' | 'activities' | 'compliance' | 'security' | 'violations' | 'reports',
    selectedPeriod: '7d' as '1d' | '7d' | '30d' | '90d' | '1y' | 'all',
    selectedFilters: {} as any,
    showReportDialog: false,
    showExportDialog: false,
    selectedReportType: 'compliance' as string,
    selectedExportFormat: 'csv' as 'csv' | 'pdf' | 'excel',
    searchTerm: '',
    filterCategory: 'all' as 'all' | string,
    filterSeverity: 'all' as 'all' | string,
    sortBy: 'timestamp' as 'timestamp' | 'severity' | 'category' | 'user',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  /**
   * Form submission state'ini yönetir
   * Bu state ne işe yarar:
   * - Loading states
   * - Error handling
   * - Success feedback
   * - Progress tracking
   */
  const [formState, setFormState] = React.useState({
    loading: false,
    error: null as string | null,
    success: null as string | null
  });

  /**
   * Overview metrics'lerini render eder
   * Bu fonksiyon ne işe yarar:
   * - Key metrics display
   * - Compliance scores
   * - Security status
   * - User experience
   */
  const renderOverview = () => {
    const { complianceMetrics, activities, securityEvents, policyViolations } = data;

    const totalActivities = activities.length;
    const recentActivities = activities.filter(a => 
      new Date(a.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;
    const openSecurityEvents = securityEvents.filter(e => !e.resolved).length;
    const openViolations = policyViolations.filter(v => v.status === 'open').length;

    return (
      <div className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-900">{totalActivities}</div>
                  <div className="text-sm text-blue-700">Total Activities</div>
                  <div className="text-xs text-blue-600">
                    {recentActivities} in last 24h
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-900">{complianceMetrics.overallScore}%</div>
                  <div className="text-sm text-green-700">Compliance Score</div>
                  <div className="text-xs text-green-600">
                    Last updated: {new Date(complianceMetrics.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-red-50 to-rose-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-900">{openSecurityEvents}</div>
                  <div className="text-sm text-red-700">Open Security Events</div>
                  <div className="text-xs text-red-600">
                    {securityEvents.length} total events
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-orange-50 to-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-900">{openViolations}</div>
                  <div className="text-sm text-orange-700">Policy Violations</div>
                  <div className="text-xs text-orange-600">
                    {policyViolations.length} total violations
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Scores */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Compliance Breakdown</CardTitle>
            <CardDescription>
              Detailed compliance scores across different categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">{complianceMetrics.hipaaCompliance}%</div>
                <div className="text-sm font-medium text-gray-900">HIPAA Compliance</div>
                <div className="text-xs text-gray-600">Patient privacy</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">{complianceMetrics.dataPrivacy}%</div>
                <div className="text-sm font-medium text-gray-900">Data Privacy</div>
                <div className="text-xs text-gray-600">Data protection</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">{complianceMetrics.accessControl}%</div>
                <div className="text-sm font-medium text-gray-900">Access Control</div>
                <div className="text-xs text-gray-600">Permission management</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 mb-2">{complianceMetrics.auditTrail}%</div>
                <div className="text-sm font-medium text-gray-900">Audit Trail</div>
                <div className="text-xs text-gray-600">Activity logging</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>
              Common compliance and audit tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                onClick={() => setUiState(prev => ({ ...prev, showReportDialog: true }))}
                className="h-20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <div className="text-center">
                  <FileText className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Generate Report</div>
                </div>
              </Button>

              <Button 
                variant="outline"
                onClick={() => setUiState(prev => ({ ...prev, showExportDialog: true }))}
                className="h-20 border-green-300 text-green-700 hover:bg-green-50"
              >
                <div className="text-center">
                  <Download className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Export Data</div>
                </div>
              </Button>

              <Button 
                variant="outline"
                onClick={onRefreshData}
                className="h-20 border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <div className="text-center">
                  <RefreshCw className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Refresh Data</div>
                </div>
              </Button>

              <Button 
                variant="outline"
                className="h-20 border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <div className="text-center">
                  <Filter className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Apply Filters</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  /**
   * Activities list'ini render eder
   * Bu fonksiyon ne işe yarar:
   * - Activity log display
   * - Search ve filtering
   * - Activity details
   * - User experience
   */
  const renderActivities = () => {
    const { activities } = data;

    return (
      <div className="space-y-6">
        {/* Activities Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Activity Log</h3>
            <p className="text-gray-600">
              Track all user activities and system events
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Sort
            </Button>
            <Button variant="outline" size="sm" onClick={onRefreshData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search activities..."
                value={uiState.searchTerm}
                onChange={(e) => setUiState(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>
          
          <select
            value={uiState.filterCategory}
            onChange={(e) => setUiState(prev => ({ ...prev, filterCategory: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="authentication">Authentication</option>
            <option value="authorization">Authorization</option>
            <option value="data_access">Data Access</option>
            <option value="data_modification">Data Modification</option>
            <option value="system">System</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          {activities.slice(0, 20).map((activity) => (
            <Card key={activity.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.status === 'success' ? 'bg-green-100' :
                      activity.status === 'failed' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      <Activity className={`h-5 w-5 ${
                        activity.status === 'success' ? 'text-green-600' :
                        activity.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                      }`} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{activity.userName}</div>
                      <div className="text-sm text-gray-600">
                        {activity.action} on {activity.resource}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className={
                      activity.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      activity.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      activity.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }>
                      {activity.severity}
                    </Badge>
                    
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {activity.category}
                    </Badge>
                    
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Security events'lerini render eder
   * Bu fonksiyon ne işe yarar:
   * - Security events display
   * - Event resolution
   * - Security monitoring
   * - User experience
   */
  const renderSecurityEvents = () => {
    const { securityEvents } = data;

    return (
      <div className="space-y-6">
        {/* Security Events Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Security Events</h3>
            <p className="text-gray-600">
              Monitor and manage security-related events
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" onClick={onRefreshData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Security Events List */}
        <div className="space-y-4">
          {securityEvents.map((event) => (
            <Card key={event.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      event.severity === 'critical' ? 'bg-red-100' :
                      event.severity === 'high' ? 'bg-orange-100' :
                      event.severity === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                    }`}>
                      <AlertCircle className={`h-6 w-6 ${
                        event.severity === 'critical' ? 'text-red-600' :
                        event.severity === 'high' ? 'text-orange-600' :
                        event.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{event.type}</h4>
                        <Badge variant="secondary" className={
                          event.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          event.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          event.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }>
                          {event.severity}
                        </Badge>
                        {event.resolved ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Resolved
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            Open
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Time: {new Date(event.timestamp).toLocaleString()}</div>
                        {event.userName && <div>User: {event.userName}</div>}
                        {event.ipAddress && <div>IP: {event.ipAddress}</div>}
                        {event.resolved && event.resolvedBy && (
                          <div>Resolved by: {event.resolvedBy} on {new Date(event.resolvedAt!).toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!event.resolved && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onResolveEvent(event.id, 'Resolved by admin')}
                        className="text-green-600 border-green-300 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Main component render
   * Bu render ne işe yarar:
   * - Professional layout structure
   * - Tab navigation
   * - Component organization
   * - User experience optimization
   */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Trail & Compliance</h2>
          <p className="text-gray-600">
            Monitor compliance, track activities, and manage security events
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button 
            onClick={() => setUiState(prev => ({ ...prev, showReportDialog: true }))}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Error & Success Messages */}
      {formState.error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5" />
          {formState.error}
        </div>
      )}

      {formState.success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle className="h-5 w-5" />
          {formState.success}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'overview' }))}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              uiState.activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'activities' }))}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              uiState.activeTab === 'activities'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Activities
          </button>
          <button
            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'compliance' }))}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              uiState.activeTab === 'compliance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Compliance
          </button>
          <button
            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'security' }))}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              uiState.activeTab === 'security'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'violations' }))}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              uiState.activeTab === 'violations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Violations
          </button>
          <button
            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'reports' }))}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              uiState.activeTab === 'reports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Reports
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {uiState.activeTab === 'overview' && renderOverview()}
      {uiState.activeTab === 'activities' && renderActivities()}
      {uiState.activeTab === 'compliance' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Compliance Management</h3>
          <p className="text-gray-600 mb-4">
            Monitor compliance status and requirements
          </p>
          <Button 
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            View Compliance
          </Button>
        </div>
      )}
      {uiState.activeTab === 'security' && renderSecurityEvents()}
      {uiState.activeTab === 'violations' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Policy Violations</h3>
          <p className="text-gray-600 mb-4">
            Track and manage policy violations
          </p>
          <Button 
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            View Violations
          </Button>
        </div>
      )}
      {uiState.activeTab === 'reports' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Audit Reports</h3>
          <p className="text-gray-600 mb-4">
            Generate and download audit reports
          </p>
          <Button 
            onClick={() => setUiState(prev => ({ ...prev, showReportDialog: true }))}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      )}

      {/* Dialogs will be implemented here */}
      {/* Report Generation Dialog, Export Dialog */}
    </div>
  );
}
