/**
 * Integration & API Component - Professional integration management interface
 * 
 * Bu component ne işe yarar:
 * - Third-party integrations
 * - API management
 * - Webhook configuration
 * - Data synchronization
 * - Professional integration dashboard
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
  Zap, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Eye,
  EyeOff,
  Lock,
  Unlock,
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
  Shield,
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
  GitPullRequestReviewUnsubmittedUnsubmittedUnsubmitted,
  FileText,
  Key,
  Link,
  ExternalLink,
  Database,
  Server,
  Cloud,
  Wifi,
  WifiOff,
  Signal,
  SignalZero,
  SignalLow,
  SignalMedium,
  SignalHigh,
  SignalMax
} from "lucide-react";

// Integration ve API types - Bu interface'ler integration ve API data'larını tanımlar
interface IntegrationData {
  integrations: Integration[];
  apis: ApiEndpoint[];
  webhooks: Webhook[];
  syncStatus: SyncStatus[];
  apiKeys: ApiKey[];
  usage: ApiUsage[];
  logs: IntegrationLog[];
}

interface Integration {
  id: string;
  name: string;
  type: 'calendar' | 'email' | 'sms' | 'payment' | 'ehr' | 'analytics' | 'storage' | 'communication' | 'custom';
  provider: string;
  status: 'active' | 'inactive' | 'error' | 'pending';
  description: string;
  icon: string;
  version: string;
  lastSync: string;
  nextSync: string;
  syncFrequency: string;
  configuration: IntegrationConfig;
  permissions: IntegrationPermissions;
  health: IntegrationHealth;
  createdAt: string;
  updatedAt: string;
}

interface IntegrationConfig {
  enabled: boolean;
  autoSync: boolean;
  syncInterval: number;
  retryAttempts: number;
  timeout: number;
  webhookUrl?: string;
  apiKey?: string;
  secretKey?: string;
  customSettings: Record<string, any>;
}

interface IntegrationPermissions {
  read: boolean;
  write: boolean;
  delete: boolean;
  admin: boolean;
  custom: Record<string, boolean>;
}

interface IntegrationHealth {
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  lastCheck: string;
  responseTime: number;
  errorRate: number;
  uptime: number;
  issues: HealthIssue[];
}

interface HealthIssue {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface ApiEndpoint {
  id: string;
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  version: string;
  status: 'active' | 'deprecated' | 'maintenance';
  rateLimit: {
    requests: number;
    period: string;
  };
  authentication: 'none' | 'api_key' | 'oauth' | 'jwt' | 'basic';
  parameters: ApiParameter[];
  responses: ApiResponse[];
  usage: {
    totalRequests: number;
    successRate: number;
    avgResponseTime: number;
    lastUsed: string;
  };
  documentation: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example: string;
}

interface ApiResponse {
  status: number;
  description: string;
  schema: any;
  example: any;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive' | 'error';
  secret: string;
  retryPolicy: {
    maxAttempts: number;
    backoffStrategy: 'linear' | 'exponential';
  };
  lastDelivery: string;
  successRate: number;
  totalDeliveries: number;
  failedDeliveries: number;
  createdAt: string;
  updatedAt: string;
}

interface SyncStatus {
  integrationId: string;
  integrationName: string;
  lastSync: string;
  nextSync: string;
  status: 'success' | 'failed' | 'in_progress' | 'pending';
  recordsProcessed: number;
  recordsFailed: number;
  duration: number;
  error?: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  status: 'active' | 'inactive' | 'expired';
  createdAt: string;
  expiresAt?: string;
  lastUsed: string;
  usageCount: number;
  createdBy: string;
}

interface ApiUsage {
  date: string;
  requests: number;
  errors: number;
  avgResponseTime: number;
  uniqueUsers: number;
  topEndpoints: Array<{
    endpoint: string;
    requests: number;
  }>;
}

interface IntegrationLog {
  id: string;
  integrationId: string;
  integrationName: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  timestamp: string;
  details: any;
  userId?: string;
  userName?: string;
}

/**
 * Integration & API Props - Component'e gerekli data'ları geçer
 * Bu interface ne işe yarar:
 * - Integration data'larını component'e geçer
 * - Event handler'ları tanımlar
 * - Configuration options sağlar
 */
interface IntegrationApiProps {
  data: IntegrationData;
  onToggleIntegration: (id: string, enabled: boolean) => Promise<void>;
  onConfigureIntegration: (id: string, config: IntegrationConfig) => Promise<void>;
  onTestIntegration: (id: string) => Promise<void>;
  onSyncIntegration: (id: string) => Promise<void>;
  onCreateWebhook: (webhook: Partial<Webhook>) => Promise<void>;
  onUpdateWebhook: (id: string, webhook: Partial<Webhook>) => Promise<void>;
  onDeleteWebhook: (id: string) => Promise<void>;
  onCreateApiKey: (apiKey: Partial<ApiKey>) => Promise<void>;
  onUpdateApiKey: (id: string, apiKey: Partial<ApiKey>) => Promise<void>;
  onDeleteApiKey: (id: string) => Promise<void>;
  onRefreshData: () => Promise<void>;
  loading?: boolean;
}

/**
 * Integration & API Component - Ana component
 * Bu component ne işe yarar:
 * - Professional integration dashboard
 * - API management
 * - Webhook configuration
 * - Data synchronization
 * - User experience optimization
 */
export default function IntegrationApi({
  data,
  onToggleIntegration,
  onConfigureIntegration,
  onTestIntegration,
  onSyncIntegration,
  onCreateWebhook,
  onUpdateWebhook,
  onDeleteWebhook,
  onCreateApiKey,
  onUpdateApiKey,
  onDeleteApiKey,
  onRefreshData,
  loading = false
}: IntegrationApiProps) {
  
  /**
   * Component state'ini initialize eder
   * Bu state ne işe yarar:
   * - UI state management
   * - Integration selection
   * - Configuration state
   * - User interactions
   */
  const [uiState, setUiState] = React.useState({
    activeTab: 'overview' as 'overview' | 'integrations' | 'apis' | 'webhooks' | 'keys' | 'logs',
    selectedIntegration: null as Integration | null,
    showConfigDialog: false,
    showWebhookDialog: false,
    showApiKeyDialog: false,
    showTestDialog: false,
    searchTerm: '',
    filterType: 'all' as 'all' | string,
    filterStatus: 'all' as 'all' | string,
    sortBy: 'name' as 'name' | 'status' | 'lastSync' | 'type',
    sortOrder: 'asc' as 'asc' | 'desc'
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
   * Integration status badge'ini render eder
   * Bu fonksiyon ne işe yarar:
   * - Visual status indication
   * - Color coding
   * - User experience
   * - Status clarity
   */
  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: EyeOff },
      error: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    const Icon = config.icon;

    return (
      <Badge variant="secondary" className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  /**
   * Integration health indicator'ını render eder
   * Bu fonksiyon ne işe yarar:
   * - Health status display
   * - Visual indicators
   * - User experience
   * - Health clarity
   */
  const renderHealthIndicator = (health: IntegrationHealth) => {
    const healthConfig = {
      healthy: { color: 'text-green-600', icon: CheckCircle },
      warning: { color: 'text-yellow-600', icon: AlertCircle },
      error: { color: 'text-red-600', icon: AlertCircle },
      unknown: { color: 'text-gray-600', icon: Info }
    };

    const config = healthConfig[health.status as keyof typeof healthConfig] || healthConfig.unknown;
    const Icon = config.icon;

    return (
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${config.color}`} />
        <span className={`text-sm font-medium ${config.color}`}>
          {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
        </span>
        <span className="text-xs text-gray-500">
          {health.responseTime}ms
        </span>
      </div>
    );
  };

  /**
   * Overview metrics'lerini render eder
   * Bu fonksiyon ne işe yarar:
   * - Key metrics display
   * - Integration status
   * - API usage
   * - User experience
   */
  const renderOverview = () => {
    const { integrations, apis, webhooks, apiKeys } = data;

    const activeIntegrations = integrations.filter(i => i.status === 'active').length;
    const totalIntegrations = integrations.length;
    const activeApis = apis.filter(a => a.status === 'active').length;
    const totalApis = apis.length;
    const activeWebhooks = webhooks.filter(w => w.status === 'active').length;
    const totalWebhooks = webhooks.length;
    const activeApiKeys = apiKeys.filter(k => k.status === 'active').length;
    const totalApiKeys = apiKeys.length;

    return (
      <div className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-900">{activeIntegrations}</div>
                  <div className="text-sm text-blue-700">Active Integrations</div>
                  <div className="text-xs text-blue-600">
                    {totalIntegrations} total
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Server className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-900">{activeApis}</div>
                  <div className="text-sm text-green-700">Active APIs</div>
                  <div className="text-xs text-green-600">
                    {totalApis} total
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-violet-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Link className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-900">{activeWebhooks}</div>
                  <div className="text-sm text-purple-700">Active Webhooks</div>
                  <div className="text-xs text-purple-600">
                    {totalWebhooks} total
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-orange-50 to-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Key className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-900">{activeApiKeys}</div>
                  <div className="text-sm text-orange-700">Active API Keys</div>
                  <div className="text-xs text-orange-600">
                    {totalApiKeys} total
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Status */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Integration Status</CardTitle>
            <CardDescription>
              Overview of all integrations and their health status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrations.slice(0, 5).map((integration) => (
                <div key={integration.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Zap className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{integration.name}</div>
                      <div className="text-sm text-gray-600">{integration.provider}</div>
                      <div className="text-xs text-gray-500">
                        Last sync: {new Date(integration.lastSync).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {renderStatusBadge(integration.status)}
                    {renderHealthIndicator(integration.health)}
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>
              Common integration and API management tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                onClick={() => setUiState(prev => ({ ...prev, activeTab: 'integrations' }))}
                className="h-20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <div className="text-center">
                  <Zap className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Manage Integrations</div>
                </div>
              </Button>

              <Button 
                variant="outline"
                onClick={() => setUiState(prev => ({ ...prev, activeTab: 'apis' }))}
                className="h-20 border-green-300 text-green-700 hover:bg-green-50"
              >
                <div className="text-center">
                  <Server className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">API Management</div>
                </div>
              </Button>

              <Button 
                variant="outline"
                onClick={() => setUiState(prev => ({ ...prev, activeTab: 'webhooks' }))}
                className="h-20 border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <div className="text-center">
                  <Link className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Webhooks</div>
                </div>
              </Button>

              <Button 
                variant="outline"
                onClick={() => setUiState(prev => ({ ...prev, activeTab: 'keys' }))}
                className="h-20 border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <div className="text-center">
                  <Key className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">API Keys</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  /**
   * Integrations list'ini render eder
   * Bu fonksiyon ne işe yarar:
   * - Integrations display
   * - Configuration management
   * - Health monitoring
   * - User experience
   */
  const renderIntegrations = () => {
    const { integrations } = data;

    return (
      <div className="space-y-6">
        {/* Integrations Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Integrations</h3>
            <p className="text-gray-600">
              Manage third-party integrations and data synchronization
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
            <Button 
              onClick={() => setUiState(prev => ({ ...prev, showConfigDialog: true }))}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {integrations.map((integration) => (
            <Card key={integration.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Zap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {integration.provider} • v{integration.version}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status and Health */}
                <div className="flex items-center justify-between">
                  {renderStatusBadge(integration.status)}
                  {renderHealthIndicator(integration.health)}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600">{integration.description}</p>

                {/* Sync Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Sync:</span>
                    <span className="text-gray-900">
                      {new Date(integration.lastSync).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Next Sync:</span>
                    <span className="text-gray-900">
                      {new Date(integration.nextSync).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Frequency:</span>
                    <span className="text-gray-900">{integration.syncFrequency}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setUiState(prev => ({ ...prev, selectedIntegration: integration, showConfigDialog: true }))}
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Configure
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => onTestIntegration(integration.id)}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Test
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => onSyncIntegration(integration.id)}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Sync
                  </Button>
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
          <h2 className="text-2xl font-bold text-gray-900">Integration & API</h2>
          <p className="text-gray-600">
            Manage third-party integrations, APIs, and data synchronization
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
            onClick={() => setUiState(prev => ({ ...prev, showConfigDialog: true }))}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
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
            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'integrations' }))}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              uiState.activeTab === 'integrations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Integrations
          </button>
          <button
            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'apis' }))}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              uiState.activeTab === 'apis'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            APIs
          </button>
          <button
            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'webhooks' }))}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              uiState.activeTab === 'webhooks'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Webhooks
          </button>
          <button
            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'keys' }))}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              uiState.activeTab === 'keys'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            API Keys
          </button>
          <button
            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'logs' }))}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              uiState.activeTab === 'logs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Logs
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {uiState.activeTab === 'overview' && renderOverview()}
      {uiState.activeTab === 'integrations' && renderIntegrations()}
      {uiState.activeTab === 'apis' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Server className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">API Management</h3>
          <p className="text-gray-600 mb-4">
            Manage API endpoints, documentation, and usage
          </p>
          <Button 
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            <Server className="h-4 w-4 mr-2" />
            View APIs
          </Button>
        </div>
      )}
      {uiState.activeTab === 'webhooks' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Link className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Webhook Management</h3>
          <p className="text-gray-600 mb-4">
            Configure webhooks for real-time event notifications
          </p>
          <Button 
            onClick={() => setUiState(prev => ({ ...prev, showWebhookDialog: true }))}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
          >
            <Link className="h-4 w-4 mr-2" />
            Create Webhook
          </Button>
        </div>
      )}
      {uiState.activeTab === 'keys' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="h-8 w-8 text-orange-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">API Key Management</h3>
          <p className="text-gray-600 mb-4">
            Create and manage API keys for secure access
          </p>
          <Button 
            onClick={() => setUiState(prev => ({ ...prev, showApiKeyDialog: true }))}
            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
          >
            <Key className="h-4 w-4 mr-2" />
            Create API Key
          </Button>
        </div>
      )}
      {uiState.activeTab === 'logs' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="h-8 w-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Integration Logs</h3>
          <p className="text-gray-600 mb-4">
            View logs and monitor integration activities
          </p>
          <Button 
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Activity className="h-4 w-4 mr-2" />
            View Logs
          </Button>
        </div>
      )}

      {/* Dialogs will be implemented here */}
      {/* Integration Config Dialog, Webhook Dialog, API Key Dialog */}
    </div>
  );
}
