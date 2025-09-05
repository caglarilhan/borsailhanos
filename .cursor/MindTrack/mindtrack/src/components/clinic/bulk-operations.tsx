/**
 * Bulk Operations Component - Professional bulk management interface
 * 
 * Bu component ne işe yarar:
 * - Toplu member invitations
 * - Mass role updates
 * - Batch permission changes
 * - CSV import/export
 * - Professional bulk management interface
 */

"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Users, 
  UserPlus, 
  Shield, 
  Settings, 
  Upload, 
  Download,
  CheckCircle,
  AlertCircle,
  Info,
  Plus,
  Play,
  Stop,
  Eye,
  Zap,
  Filter,
  Search,
  MoreVertical,
  ArrowUpDown,
  Clock,
  Calendar,
  UserCheck,
  UserX,
  RefreshCw,
  BarChart3,
  Activity,
  Square
} from "lucide-react";

// Bulk operation types - Bu interface'ler bulk operations'ları tanımlar
interface BulkOperation {
  id: string;
  type: 'invite' | 'role_update' | 'permission_update' | 'import' | 'export';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  title: string;
  description: string;
  totalItems: number;
  processedItems: number;
  successCount: number;
  errorCount: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  errors?: string[];
}

interface BulkInviteData {
  emails: string[];
  role: 'admin' | 'therapist' | 'assistant';
  message: string;
  sendWelcomeEmail: boolean;
  assignDefaultPermissions: boolean;
}

interface BulkRoleUpdateData {
  memberIds: string[];
  newRole: 'admin' | 'therapist' | 'assistant';
  reason: string;
  notifyMembers: boolean;
}

interface BulkPermissionData {
  memberIds: string[];
  permissions: {
    resource: string;
    action: string;
    granted: boolean;
  }[];
  reason: string;
}

/**
 * Bulk Operations Props - Component'e gerekli data'ları geçer
 * Bu interface ne işe yarar:
 * - Bulk operations data'larını component'e geçer
 * - Event handler'ları tanımlar
 * - Configuration options sağlar
 */
interface BulkOperationsProps {
  operations: BulkOperation[];
  onBulkInvite: (data: BulkInviteData) => Promise<void>;
  onBulkRoleUpdate: (data: BulkRoleUpdateData) => Promise<void>;
  onBulkPermissionUpdate: (data: BulkPermissionData) => Promise<void>;
  onImportCSV: (file: File) => Promise<void>;
  onExportData: (type: string) => Promise<void>;
  onCancelOperation: (operationId: string) => Promise<void>;
  onRetryOperation: (operationId: string) => Promise<void>;
  loading?: boolean;
}

/**
 * Bulk Operations Component - Ana component
 * Bu component ne işe yarar:
 * - Professional bulk management interface
 * - Operation tracking ve monitoring
 * - Progress visualization
 * - User experience optimization
 */
export default function BulkOperations({
  operations,
  onBulkInvite,
  onBulkRoleUpdate,
  onBulkPermissionUpdate,
  onImportCSV,
  onExportData,
  onCancelOperation,
  onRetryOperation,
  loading = false
}: BulkOperationsProps) {
  
  /**
   * Component state'ini initialize eder
   * Bu state ne işe yarar:
   * - UI state management
   * - Form data management
   * - Operation tracking
   * - User interactions
   */
  const [uiState, setUiState] = React.useState({
    activeTab: 'operations' as 'operations' | 'invite' | 'role_update' | 'permission_update' | 'import_export',
    showInviteDialog: false,
    showRoleUpdateDialog: false,
    showPermissionDialog: false,
    showImportDialog: false,
    selectedOperation: null as BulkOperation | null,
    searchTerm: '',
    filterStatus: 'all' as 'all' | string,
    sortBy: 'createdAt' as 'createdAt' | 'status' | 'type' | 'totalItems',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  /**
   * Form state'lerini yönetir
   * Bu state ne işe yarar:
   * - Form data storage
   * - Validation state
   * - User input tracking
   * - Form submission state
   */
  const [inviteForm, setInviteForm] = React.useState<BulkInviteData>({
    emails: [],
    role: 'therapist',
    message: '',
    sendWelcomeEmail: true,
    assignDefaultPermissions: true
  });

  const [roleUpdateForm, setRoleUpdateForm] = React.useState<BulkRoleUpdateData>({
    memberIds: [],
    newRole: 'therapist',
    reason: '',
    notifyMembers: true
  });

  const [permissionForm, setPermissionForm] = React.useState<BulkPermissionData>({
    memberIds: [],
    permissions: [],
    reason: ''
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
    success: null as string | null,
    progress: 0
  });

  /**
   * CSV file state'ini yönetir
   * Bu state ne işe yarar:
   * - File selection
   * - File validation
   * - Upload state
   * - Error handling
   */
  const [csvFile, setCsvFile] = React.useState<File | null>(null);
  const [csvPreview, setCsvPreview] = React.useState<string[][]>([]);

  /**
   * CSV file'ı handle eder
   * Bu fonksiyon ne işe yarar:
   * - File selection
   * - File validation
   * - Preview generation
   * - Error handling
   */
  const handleCsvFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setFormState(prev => ({ ...prev, error: 'Please select a valid CSV file' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormState(prev => ({ ...prev, error: 'File size must be less than 5MB' }));
      return;
    }

    setCsvFile(file);
    setFormState(prev => ({ ...prev, error: null }));

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim()));
      setCsvPreview(rows.slice(0, 10)); // Show first 10 rows
    };
    reader.readAsText(file);
  };

  /**
   * Bulk invite form'u submit eder
   * Bu fonksiyon ne işe yarar:
   * - Form validation
   * - API call
   * - Success/error handling
   * - Form reset
   */
  const handleBulkInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteForm.emails.length || !inviteForm.role) {
      setFormState(prev => ({ ...prev, error: 'Please provide emails and select a role' }));
      return;
    }

    setFormState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await onBulkInvite(inviteForm);
      
      setFormState(prev => ({ ...prev, loading: false, success: 'Bulk invitations sent successfully!' }));
      setInviteForm({ emails: [], role: 'therapist', message: '', sendWelcomeEmail: true, assignDefaultPermissions: true });
      setUiState(prev => ({ ...prev, showInviteDialog: false }));
      
      setTimeout(() => {
        setFormState(prev => ({ ...prev, success: null }));
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send bulk invitations';
      setFormState(prev => ({ ...prev, loading: false, error: errorMessage }));
    }
  };

  /**
   * Bulk role update form'u submit eder
   * Bu fonksiyon ne işe yarar:
   * - Form validation
   * - API call
   * - Success/error handling
   * - Form reset
   */
  const handleBulkRoleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roleUpdateForm.memberIds.length || !roleUpdateForm.newRole) {
      setFormState(prev => ({ ...prev, error: 'Please select members and a new role' }));
      return;
    }

    setFormState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await onBulkRoleUpdate(roleUpdateForm);
      
      setFormState(prev => ({ ...prev, loading: false, success: 'Bulk role updates completed successfully!' }));
      setRoleUpdateForm({ memberIds: [], newRole: 'therapist', reason: '', notifyMembers: true });
      setUiState(prev => ({ ...prev, showRoleUpdateDialog: false }));
      
      setTimeout(() => {
        setFormState(prev => ({ ...prev, success: null }));
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update roles';
      setFormState(prev => ({ ...prev, loading: false, error: errorMessage }));
    }
  };

  /**
   * CSV import'i handle eder
   * Bu fonksiyon ne işe yarar:
   * - File validation
   * - API call
   * - Success/error handling
   * - Progress tracking
   */
  const handleCsvImport = async () => {
    if (!csvFile) {
      setFormState(prev => ({ ...prev, error: 'Please select a CSV file' }));
      return;
    }

    setFormState(prev => ({ ...prev, loading: true, error: null, progress: 0 }));

    try {
      await onImportCSV(csvFile);
      
      setFormState(prev => ({ ...prev, loading: false, success: 'CSV import completed successfully!' }));
      setCsvFile(null);
      setCsvPreview([]);
      setUiState(prev => ({ ...prev, showImportDialog: false }));
      
      setTimeout(() => {
        setFormState(prev => ({ ...prev, success: null }));
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import CSV';
      setFormState(prev => ({ ...prev, loading: false, error: errorMessage }));
    }
  };

  /**
   * Operations'ları filter eder
   * Bu fonksiyon ne işe yarar:
   * - Search functionality
   * - Status filtering
   * - Sorting
   * - Data organization
   */
  const getFilteredOperations = () => {
    let filtered = operations;

    // Search filter
    if (uiState.searchTerm) {
      filtered = filtered.filter(op => 
        op.title.toLowerCase().includes(uiState.searchTerm.toLowerCase()) ||
        op.description.toLowerCase().includes(uiState.searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (uiState.filterStatus !== 'all') {
      filtered = filtered.filter(op => op.status === uiState.filterStatus);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any = a[uiState.sortBy];
      let bValue: any = b[uiState.sortBy];

      if (uiState.sortBy === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (uiState.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  /**
   * Operation status badge'ini render eder
   * Bu fonksiyon ne işe yarar:
   * - Visual status indication
   * - Color coding
   * - User experience
   * - Status clarity
   */
  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      in_progress: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: Square }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant="secondary" className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  /**
   * Operation type badge'ini render eder
   * Bu fonksiyon ne işe yarar:
   * - Visual type indication
   * - Color coding
   * - User experience
   * - Type clarity
   */
  const renderTypeBadge = (type: string) => {
    const typeConfig = {
      invite: { color: 'bg-blue-100 text-blue-800', icon: UserPlus },
      role_update: { color: 'bg-purple-100 text-purple-800', icon: Shield },
      permission_update: { color: 'bg-green-100 text-green-800', icon: Settings },
      import: { color: 'bg-orange-100 text-orange-800', icon: Upload },
      export: { color: 'bg-indigo-100 text-indigo-800', icon: Download }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.invite;
    const Icon = config.icon;

    return (
      <Badge variant="secondary" className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  /**
   * Operations list'ini render eder
   * Bu fonksiyon ne işe yarar:
   * - Operations display
   * - Status tracking
   * - Progress visualization
   * - Action buttons
   */
  const renderOperationsList = () => {
    const filteredOperations = getFilteredOperations();

    return (
      <div className="space-y-6">
        {/* Operations Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Operations</h3>
            <p className="text-gray-600">
              Track the progress of your bulk operations
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Operations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOperations.map((operation) => (
            <Card key={operation.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {renderTypeBadge(operation.type)}
                      {renderStatusBadge(operation.status)}
                    </div>
                    <CardTitle className="text-lg">{operation.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {operation.description}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      {operation.processedItems} / {operation.totalItems}
                    </span>
                  </div>
                  <Progress 
                    value={(operation.processedItems / operation.totalItems) * 100} 
                    className="h-2" 
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{operation.successCount}</div>
                    <div className="text-green-700">Success</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded-lg">
                    <div className="text-lg font-bold text-red-600">{operation.errorCount}</div>
                    <div className="text-red-700">Errors</div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Created: {new Date(operation.createdAt).toLocaleDateString()}</span>
                  </div>
                  {operation.startedAt && (
                    <div className="flex items-center gap-1">
                      <Play className="h-3 w-3" />
                      <span>Started: {new Date(operation.startedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {operation.completedAt && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Completed: {new Date(operation.completedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  {operation.status === 'in_progress' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onCancelOperation(operation.id)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Square className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  )}
                  
                  {operation.status === 'failed' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onRetryOperation(operation.id)}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOperations.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No operations found</h3>
            <p className="text-gray-600">
              Start a new bulk operation to see it here
            </p>
          </div>
        )}
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
          <h2 className="text-2xl font-bold text-gray-900">Bulk Operations</h2>
          <p className="text-gray-600">
            Manage multiple members and operations efficiently
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button 
            onClick={() => setUiState(prev => ({ ...prev, showInviteDialog: true }))}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Bulk Invite
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
            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'operations' }))}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              uiState.activeTab === 'operations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Operations
          </button>
          <button
            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'invite' }))}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              uiState.activeTab === 'invite'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Bulk Invite
          </button>
          <button
            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'role_update' }))}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              uiState.activeTab === 'role_update'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Role Updates
          </button>
          <button
            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'permission_update' }))}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              uiState.activeTab === 'permission_update'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Permission Updates
          </button>
          <button
            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'import_export' }))}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              uiState.activeTab === 'import_export'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Import/Export
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {uiState.activeTab === 'operations' && renderOperationsList()}
      {uiState.activeTab === 'invite' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Bulk Member Invitations</h3>
          <p className="text-gray-600 mb-4">
            Invite multiple team members at once with role assignments
          </p>
          <Button 
            onClick={() => setUiState(prev => ({ ...prev, showInviteDialog: true }))}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Start Bulk Invite
          </Button>
        </div>
      )}
      {uiState.activeTab === 'role_update' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Bulk Role Updates</h3>
          <p className="text-gray-600 mb-4">
            Update roles for multiple team members simultaneously
          </p>
          <Button 
            onClick={() => setUiState(prev => ({ ...prev, showRoleUpdateDialog: true }))}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
          >
            <Shield className="h-4 w-4 mr-2" />
            Start Role Updates
          </Button>
        </div>
      )}
      {uiState.activeTab === 'permission_update' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Bulk Permission Updates</h3>
          <p className="text-gray-600 mb-4">
            Modify permissions for multiple team members at once
          </p>
          <Button 
            onClick={() => setUiState(prev => ({ ...prev, showPermissionDialog: true }))}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Settings className="h-4 w-4 mr-2" />
            Start Permission Updates
          </Button>
        </div>
      )}
      {uiState.activeTab === 'import_export' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="h-8 w-8 text-orange-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Import & Export</h3>
          <p className="text-gray-600 mb-4">
            Import member data from CSV or export existing data
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button 
              onClick={() => setUiState(prev => ({ ...prev, showImportDialog: true }))}
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button 
              variant="outline"
              onClick={() => onExportData('members')}
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs will be implemented here */}
      {/* Bulk Invite Dialog, Role Update Dialog, Permission Dialog, Import Dialog */}
    </div>
  );
}
