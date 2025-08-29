/**
 * Permission Manager Component - Advanced role-based permission management interface
 * 
 * Bu component ne işe yarar:
 * - Admin'lerin permission'ları customize edebilmesi
 * - Role-based permission matrix'i görsel olarak düzenleme
 * - Custom permission set'leri oluşturma ve yönetme
 * - Granular access control için professional interface
 */

"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
  Users, 
  Settings, 
  Save, 
  RotateCcw, 
  Copy, 
  Download,
  Upload,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  MoreVertical
} from "lucide-react";

// Permission types - Bu interface'ler permission sistemini tanımlar
interface Permission {
  id: string;
  resource: string;        // Hangi kaynak (clients, appointments, notes, etc.)
  action: string;          // Hangi işlem (create, read, update, delete, manage)
  granted: boolean;        // Permission verildi mi?
  description: string;     // Permission açıklaması
}

interface RolePermissions {
  role: 'admin' | 'therapist' | 'assistant';
  permissions: Permission[];
}

interface CustomPermissionSet {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isDefault: boolean;
  createdAt: string;
}

/**
 * Permission Manager Props - Component'e gerekli data'ları geçer
 * Bu interface ne işe yarar:
 * - Permission data'larını component'e geçer
 * - Event handler'ları tanımlar
 * - Configuration options sağlar
 */
interface PermissionManagerProps {
  rolePermissions: RolePermissions[];
  customPermissionSets: CustomPermissionSet[];
  onUpdatePermissions: (role: string, permissions: Permission[]) => Promise<void>;
  onCreateCustomSet: (set: Omit<CustomPermissionSet, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateCustomSet: (id: string, set: Partial<CustomPermissionSet>) => Promise<void>;
  onDeleteCustomSet: (id: string) => Promise<void>;
  loading?: boolean;
}

/**
 * Permission Manager Component - Ana component
 * Bu component ne işe yarar:
 * - Professional permission management interface
 * - Role-based permission editing
 * - Custom permission set creation
 * - Visual permission matrix
 */
export default function PermissionManager({
  rolePermissions,
  customPermissionSets,
  onUpdatePermissions,
  onCreateCustomSet,
  onUpdateCustomSet,
  onDeleteCustomSet,
  loading = false
}: PermissionManagerProps) {
  
  /**
   * Component state'ini initialize eder
   * Bu state ne işe yarar:
   * - UI state management
   * - Permission editing state
   * - Custom set management
   * - User interactions tracking
   */
  const [uiState, setUiState] = React.useState({
    activeTab: 'roles' as 'roles' | 'custom' | 'templates',
    editingRole: null as string | null,
    showCreateDialog: false,
    showEditDialog: false,
    selectedCustomSet: null as CustomPermissionSet | null,
    searchTerm: '',
    filterResource: 'all' as 'all' | string,
    showAdvancedOptions: false
  });

  /**
   * Permission editing state'ini yönetir
   * Bu state ne işe yarar:
   * - Temporary permission changes
   * - Unsaved modifications
   * - Edit mode tracking
   */
  const [editingPermissions, setEditingPermissions] = React.useState<{
    [role: string]: Permission[]
  }>({});

  /**
   * Custom permission set form state'ini yönetir
   * Bu state ne işe yarar:
   * - Custom set creation form
   * - Form validation
   * - User input tracking
   */
  const [customSetForm, setCustomSetForm] = React.useState({
    name: '',
    description: '',
    permissions: [] as Permission[]
  });

  /**
   * Form submission state'ini yönetir
   * Bu state ne işe yarar:
   * - Loading states
   * - Error handling
   * - Success feedback
   */
  const [formState, setFormState] = React.useState({
    loading: false,
    error: null as string | null,
    success: null as string | null
  });

  /**
   * Permission editing'i başlatır
   * Bu fonksiyon ne işe yarar:
   * - Edit mode'u aktif eder
   * - Current permissions'ları editing state'e kopyalar
   * - User experience optimization
   */
  const startEditingPermissions = (role: string) => {
    const roleData = rolePermissions.find(rp => rp.role === role);
    if (roleData) {
      setEditingPermissions(prev => ({
        ...prev,
        [role]: [...roleData.permissions]
      }));
      setUiState(prev => ({ ...prev, editingRole: role }));
    }
  };

  /**
   * Permission editing'i iptal eder
   * Bu fonksiyon ne işe yarar:
   * - Edit mode'u kapatır
   * - Changes'ları discard eder
   * - State'i reset eder
   */
  const cancelEditingPermissions = (role: string) => {
    setEditingPermissions(prev => {
      const newState = { ...prev };
      delete newState[role];
      return newState;
    });
    setUiState(prev => ({ ...prev, editingRole: null }));
  };

  /**
   * Permission değişikliğini kaydeder
   * Bu fonksiyon ne işe yarar:
   * - API call yapar
   * - Success/error handling
   * - State management
   * - User feedback
   */
  const savePermissions = async (role: string) => {
    const permissions = editingPermissions[role];
    if (!permissions) return;

    setFormState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await onUpdatePermissions(role, permissions);
      
      setFormState(prev => ({ ...prev, loading: false, success: 'Permissions updated successfully!' }));
      setUiState(prev => ({ ...prev, editingRole: null }));
      
      // Clean up editing state
      setEditingPermissions(prev => {
        const newState = { ...prev };
        delete newState[role];
        return newState;
      });

      // Success message'ı 3 saniye sonra temizle
      setTimeout(() => {
        setFormState(prev => ({ ...prev, success: null }));
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update permissions';
      setFormState(prev => ({ ...prev, loading: false, error: errorMessage }));
    }
  };

  /**
   * Permission toggle'ını yönetir
   * Bu fonksiyon ne işe yarar:
   * - Individual permission'ları toggle eder
   * - Edit mode'da permission state'ini günceller
   * - User interaction handling
   */
  const togglePermission = (role: string, permissionId: string) => {
    if (!editingPermissions[role]) return;

    setEditingPermissions(prev => ({
      ...prev,
      [role]: prev[role].map(permission => 
        permission.id === permissionId 
          ? { ...permission, granted: !permission.granted }
          : permission
      )
    }));
  };

  /**
   * Custom permission set'i oluşturur
   * Bu fonksiyon ne işe yarar:
   * - Form validation
   * - API call
   * - Success/error handling
   * - Form reset
   */
  const handleCreateCustomSet = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customSetForm.name.trim() || customSetForm.permissions.length === 0) {
      setFormState(prev => ({ ...prev, error: 'Name and permissions are required' }));
      return;
    }

    setFormState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await onCreateCustomSet({
        name: customSetForm.name.trim(),
        description: customSetForm.description.trim(),
        permissions: customSetForm.permissions
      });
      
      setFormState(prev => ({ ...prev, loading: false, success: 'Custom permission set created!' }));
      setCustomSetForm({ name: '', description: '', permissions: [] });
      setUiState(prev => ({ ...prev, showCreateDialog: false }));
      
      setTimeout(() => {
        setFormState(prev => ({ ...prev, success: null }));
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create permission set';
      setFormState(prev => ({ ...prev, loading: false, error: errorMessage }));
    }
  };

  /**
   * Permission matrix'ini render eder
   * Bu fonksiyon ne işe yarar:
   * - Visual permission grid'i oluşturur
   * - Role-based permission display
   * - Interactive permission editing
   * - Professional UI presentation
   */
  const renderPermissionMatrix = () => {
    // Available resources ve actions'ları tanımla
    const resources = ['clients', 'appointments', 'notes', 'billing', 'clinic', 'assessments'];
    const actions = ['create', 'read', 'update', 'delete', 'manage'];

    return (
      <div className="space-y-6">
        {rolePermissions.map((roleData) => (
          <Card key={roleData.role}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    roleData.role === 'admin' ? 'bg-red-100 text-red-600' :
                    roleData.role === 'therapist' ? 'bg-blue-100 text-blue-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="capitalize">{roleData.role} Permissions</CardTitle>
                    <CardDescription>
                      Manage access levels for {roleData.role} role
                    </CardDescription>
                  </div>
                </div>
                
                {uiState.editingRole === roleData.role ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cancelEditingPermissions(roleData.role)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => savePermissions(roleData.role)}
                      disabled={formState.loading}
                    >
                      {formState.loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEditingPermissions(roleData.role)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Permissions
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-2 font-medium text-gray-700">Resource</th>
                      {actions.map(action => (
                        <th key={action} className="text-center p-2 font-medium text-gray-700 capitalize">
                          {action}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map(resource => (
                      <tr key={resource} className="border-b border-gray-100">
                        <td className="p-2 font-medium text-gray-900 capitalize">
                          {resource}
                        </td>
                        {actions.map(action => {
                          const permission = roleData.permissions.find(p => 
                            p.resource === resource && p.action === action
                          );
                          const isEditing = uiState.editingRole === roleData.role;
                          const editingPermission = editingPermissions[roleData.role]?.find(p => 
                            p.resource === resource && p.action === action
                          );
                          
                          return (
                            <td key={action} className="p-2 text-center">
                              {isEditing ? (
                                <Switch
                                  checked={editingPermission?.granted || false}
                                  onCheckedChange={() => togglePermission(roleData.role, editingPermission?.id || '')}
                                  className="mx-auto"
                                />
                              ) : (
                                <Badge 
                                  variant={permission?.granted ? "default" : "secondary"}
                                  className={permission?.granted ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                                >
                                  {permission?.granted ? (
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  {permission?.granted ? 'Allowed' : 'Denied'}
                                </Badge>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  /**
   * Custom permission sets'leri render eder
   * Bu fonksiyon ne işe yarar:
   * - Custom permission set'leri listeler
   * - Set management operations
   * - Professional set display
   * - User interaction handling
   */
  const renderCustomPermissionSets = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Custom Permission Sets</h3>
          <p className="text-gray-600">
            Create and manage custom permission configurations
          </p>
        </div>
        
        <Dialog open={uiState.showCreateDialog} onOpenChange={(open) => 
          setUiState(prev => ({ ...prev, showCreateDialog: open }))
        }>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Custom Set
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Custom Permission Set</DialogTitle>
              <DialogDescription>
                Define a custom set of permissions for specific use cases
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateCustomSet} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="setName">Set Name *</Label>
                  <Input
                    id="setName"
                    value={customSetForm.name}
                    onChange={(e) => setCustomSetForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Senior Therapist, Office Manager"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="setDescription">Description</Label>
                  <Input
                    id="setDescription"
                    value={customSetForm.description}
                    onChange={(e) => setCustomSetForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this permission set"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-600 mb-3">
                    Select the permissions to include in this set:
                  </p>
                  {/* Permission selection grid would go here */}
                  <div className="text-center text-gray-500">
                    Permission selection interface will be implemented here
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUiState(prev => ({ ...prev, showCreateDialog: false }))}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formState.loading}>
                  {formState.loading ? 'Creating...' : 'Create Permission Set'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customPermissionSets.map((set) => (
          <Card key={set.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{set.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {set.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {set.isDefault && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Permissions:</span>
                  <span className="font-medium">
                    {set.permissions.filter(p => p.granted).length} / {set.permissions.length}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Created: {new Date(set.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  {!set.isDefault && (
                    <Button variant="outline" size="sm" className="flex-1">
                      <Copy className="h-3 w-3 mr-1" />
                      Duplicate
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  /**
   * Permission templates'lerini render eder
   * Bu fonksiyon ne işe yarar:
   * - Pre-defined permission templates'leri gösterir
   * - Template application
   * - Best practices display
   * - Quick setup options
   */
  const renderPermissionTemplates = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Permission Templates</h3>
        <p className="text-gray-600">
          Use pre-defined permission sets for common roles and scenarios
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* HIPAA Compliance Template */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              HIPAA Compliance
            </CardTitle>
            <CardDescription className="text-blue-700">
              Strict access control for healthcare compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-blue-800">
                <p>• Minimal access to sensitive data</p>
                <p>• Audit logging enabled</p>
                <p>• Role-based restrictions</p>
              </div>
              <Button variant="outline" size="sm" className="w-full border-blue-300 text-blue-700">
                Apply Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Collaborative Therapy Template */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Collaborative Therapy
            </CardTitle>
            <CardDescription className="text-green-700">
              Team-based therapy with shared access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-green-800">
                <p>• Shared client access</p>
                <p>• Collaborative note-taking</p>
                <p>• Team communication tools</p>
              </div>
              <Button variant="outline" size="sm" className="w-full border-green-300 text-green-700">
                Apply Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Administrative Template */}
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-900 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Administrative
            </CardTitle>
            <CardDescription className="text-purple-700">
              Full administrative access and control
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-purple-800">
                <p>• Complete system access</p>
                <p>• User management</p>
                <p>• System configuration</p>
              </div>
              <Button variant="outline" size="sm" className="w-full border-purple-300 text-purple-700">
                Apply Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

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
          <h2 className="text-2xl font-bold text-gray-900">Permission Management</h2>
          <p className="text-gray-600">
            Manage role-based permissions and access control for your clinic
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </div>

      {/* Error & Success Messages */}
      {formState.error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertTriangle className="h-5 w-5" />
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
            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'roles' }))}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              uiState.activeTab === 'roles'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Role Permissions
          </button>
          <button
            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'custom' }))}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              uiState.activeTab === 'custom'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Custom Sets
          </button>
          <button
            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'templates' }))}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              uiState.activeTab === 'templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Templates
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {uiState.activeTab === 'roles' && renderPermissionMatrix()}
      {uiState.activeTab === 'custom' && renderCustomPermissionSets()}
      {uiState.activeTab === 'templates' && renderPermissionTemplates()}
    </div>
  );
}
