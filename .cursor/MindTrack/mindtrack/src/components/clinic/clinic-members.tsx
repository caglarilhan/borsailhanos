/**
 * Clinic Members Management Component - Professional staff management interface
 * 
 * Bu component ne işe yarar:
 * - Clinic staff management
 * - Role-based access control
 * - Member invitation system
 * - Permission management
 * - Professional team interface
 */

"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
  Mail, 
  Phone, 
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Star,
  Crown,
  User,
  Settings,
  Lock,
  Unlock,
  Send,
  Copy,
  Download,
  Filter,
  Search
} from "lucide-react";

import type { ClinicMember } from "@/types/clinic";

/**
 * Clinic Members Props - Component props'ları
 * Bu interface ne işe yarar:
 * - Component'e gerekli data'ları geçer
 * - Event handler'ları tanımlar
 * - Configuration options sağlar
 */
interface ClinicMembersProps {
  members: ClinicMember[];
  onInviteMember: (email: string, role: 'admin' | 'therapist' | 'assistant') => Promise<void>;
  onUpdateRole: (memberId: string, role: 'admin' | 'therapist' | 'assistant') => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
  onResendInvite: (memberId: string) => Promise<void>;
  loading?: boolean;
}

/**
 * Invite Member Form Data - Form state'i
 * Bu interface ne işe yarar:
 * - Invite form fields'ını yönetir
 * - User input'larını tutar
 * - Data validation için kullanılır
 */
interface InviteFormData {
  email: string;
  role: 'admin' | 'therapist' | 'assistant';
  message: string;
}

/**
 * Clinic Members Component - Ana component
 * Bu component ne işe yarar:
 * - Professional staff management interface
 * - Member invitation system
 * - Role management
 * - Permission control
 */
export default function ClinicMembers({
  members,
  onInviteMember,
  onUpdateRole,
  onRemoveMember,
  onResendInvite,
  loading = false
}: ClinicMembersProps) {
  
  /**
   * Component state'ini initialize eder
   * Bu state ne işe yarar:
   * - Form data management
   * - UI state tracking
   - User interactions
   */
  const [uiState, setUiState] = React.useState({
    showInviteDialog: false,
    showRemoveDialog: false,
    selectedMember: null as ClinicMember | null,
    searchTerm: '',
    roleFilter: 'all' as 'all' | 'admin' | 'therapist' | 'assistant',
    statusFilter: 'all' as 'all' | 'active' | 'inactive' | 'pending'
  });

  /**
   * Invite form state'ini yönetir
   * Bu state ne işe yarar:
   * - Invite form data
   * - Form validation
   * - User input tracking
   */
  const [inviteForm, setInviteForm] = React.useState<InviteFormData>({
    email: '',
    role: 'therapist',
    message: ''
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
   * Form field'larını günceller
   * Bu fonksiyon ne işe yarar:
   * - Form input changes
   * - State synchronization
   * - Data validation
   */
  const handleInviteFormChange = (field: keyof InviteFormData, value: string) => {
    setInviteForm(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Form validation yapar
   * Bu fonksiyon ne işe yarar:
   * - Required field validation
   * - Format validation
   * - Business rule validation
   */
  const validateInviteForm = (): string[] => {
    const errors: string[] = [];
    
    if (!inviteForm.email.trim()) {
      errors.push('Email address is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (!inviteForm.role) {
      errors.push('Role selection is required');
    }
    
    return errors;
  };

  /**
   * Member invitation'ı submit eder
   * Bu fonksiyon ne işe yarar:
   * - Form validation
   * - API call
   * - User feedback
   * - State management
   */
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateInviteForm();
    if (errors.length > 0) {
      setFormState(prev => ({ ...prev, error: errors.join(', ') }));
      return;
    }

    setFormState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await onInviteMember(inviteForm.email, inviteForm.role);
      
      setFormState(prev => ({ ...prev, loading: false, success: 'Invitation sent successfully!' }));
      setInviteForm({ email: '', role: 'therapist', message: '' });
      setUiState(prev => ({ ...prev, showInviteDialog: false }));
      
      // Success message'ı 3 saniye sonra temizle
      setTimeout(() => {
        setFormState(prev => ({ ...prev, success: null }));
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send invitation';
      setFormState(prev => ({ ...prev, loading: false, error: errorMessage }));
    }
  };

  /**
   * Member role'unu günceller
   * Bu fonksiyon ne işe yarar:
   * - Role updates
   * - Permission changes
   * - User feedback
   */
  const handleRoleUpdate = async (memberId: string, newRole: 'admin' | 'therapist' | 'assistant') => {
    try {
      await onUpdateRole(memberId, newRole);
      setFormState(prev => ({ ...prev, success: 'Role updated successfully!' }));
      
      setTimeout(() => {
        setFormState(prev => ({ ...prev, success: null }));
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update role';
      setFormState(prev => ({ ...prev, error: errorMessage }));
    }
  };

  /**
   * Member'ı kaldırır
   * Bu fonksiyon ne işe yarar:
   * - Member removal
   * - Confirmation dialog
   * - User feedback
   */
  const handleRemoveMember = async () => {
    if (!uiState.selectedMember) return;

    try {
      await onRemoveMember(uiState.selectedMember.id);
      setFormState(prev => ({ ...prev, success: 'Member removed successfully!' }));
      setUiState(prev => ({ ...prev, showRemoveDialog: false, selectedMember: null }));
      
      setTimeout(() => {
        setFormState(prev => ({ ...prev, success: null }));
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove member';
      setFormState(prev => ({ ...prev, error: errorMessage }));
    }
  };

  /**
   * Invite'ı yeniden gönderir
   * Bu fonksiyon ne işe yarar:
   * - Resend invitations
   * - User feedback
   * - State management
   */
  const handleResendInvite = async (memberId: string) => {
    try {
      await onResendInvite(memberId);
      setFormState(prev => ({ ...prev, success: 'Invitation resent successfully!' }));
      
      setTimeout(() => {
        setFormState(prev => ({ ...prev, success: null }));
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend invitation';
      setFormState(prev => ({ ...prev, error: errorMessage }));
    }
  };

  /**
   * Filtered members'ları hesaplar
   * Bu fonksiyon ne işe yarar:
   * - Search functionality
   * - Filter management
   * - Dynamic data filtering
   */
  const getFilteredMembers = () => {
    let filtered = members;

    // Search filter
    if (uiState.searchTerm) {
      const searchLower = uiState.searchTerm.toLowerCase();
      filtered = filtered.filter(member => 
        member.user_email?.toLowerCase().includes(searchLower) ||
        member.user_name?.toLowerCase().includes(searchLower) ||
        member.role.toLowerCase().includes(searchLower)
      );
    }

    // Role filter
    if (uiState.roleFilter !== 'all') {
      filtered = filtered.filter(member => member.role === uiState.roleFilter);
    }

    // Status filter
    if (uiState.statusFilter !== 'all') {
      filtered = filtered.filter(member => member.status === uiState.statusFilter);
    }

    return filtered;
  };

  /**
   * Role badge'ini render eder
   * Bu fonksiyon ne işe yarar:
   * - Role visualization
   * - Color coding
   * - User experience
   */
  const renderRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { color: 'bg-red-100 text-red-800 border-red-200', icon: Crown },
      therapist: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Star },
      assistant: { color: 'bg-green-100 text-green-800 border-green-200', icon: User }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.assistant;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  /**
   * Status badge'ini render eder
   * Bu fonksiyon ne işe yarar:
   * - Status visualization
   * - Color coding
   * - User experience
   */
  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  /**
   * Member actions menu'sunu render eder
   * Bu fonksiyon ne işe yarar:
   * - Action buttons
   * - Role management
   - Member operations
   */
  const renderMemberActions = (member: ClinicMember) => (
    <div className="flex items-center gap-2">
      {/* Role Update */}
      <Select
        value={member.role}
        onValueChange={(value: 'admin' | 'therapist' | 'assistant') => 
          handleRoleUpdate(member.id, value)
        }
      >
        <SelectTrigger className="w-32 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="therapist">Therapist</SelectItem>
          <SelectItem value="assistant">Assistant</SelectItem>
        </SelectContent>
      </Select>

      {/* Resend Invite (for pending members) */}
      {member.status === 'pending' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleResendInvite(member.id)}
          className="h-8 px-3"
        >
          <Send className="h-3 w-3 mr-1" />
          Resend
        </Button>
      )}

      {/* Remove Member */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setUiState(prev => ({ 
          ...prev, 
          showRemoveDialog: true, 
          selectedMember: member 
        }))}
        className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );

  /**
   * Invite Member Dialog'ını render eder
   * Bu fonksiyon ne işe yarar:
   * - Member invitation interface
   * - Form management
   * - User experience
   */
  const renderInviteDialog = () => (
    <Dialog open={uiState.showInviteDialog} onOpenChange={(open) => 
      setUiState(prev => ({ ...prev, showInviteDialog: open }))
    }>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Invite New Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join your clinic team
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={inviteForm.email}
              onChange={(e) => handleInviteFormChange('email', e.target.value)}
              placeholder="colleague@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={inviteForm.role}
              onValueChange={(value: 'admin' | 'therapist' | 'assistant') => 
                handleInviteFormChange('role', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin - Full access</SelectItem>
                <SelectItem value="therapist">Therapist - Clinical access</SelectItem>
                <SelectItem value="assistant">Assistant - Limited access</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              value={inviteForm.message}
              onChange={(e) => handleInviteFormChange('message', e.target.value)}
              placeholder="Add a personal note to your invitation..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setUiState(prev => ({ ...prev, showInviteDialog: false }))}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={formState.loading}>
              {formState.loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  /**
   * Remove Member Dialog'ını render eder
   * Bu fonksiyon ne işe yarar:
   * - Confirmation interface
   * - Safety confirmation
   * - User experience
   */
  const renderRemoveDialog = () => (
    <Dialog open={uiState.showRemoveDialog} onOpenChange={(open) => 
      setUiState(prev => ({ ...prev, showRemoveDialog: open }))
    }>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Remove Member
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this member from your clinic?
          </DialogDescription>
        </DialogHeader>

        {uiState.selectedMember && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {uiState.selectedMember.user_name || uiState.selectedMember.user_email}
                </p>
                <p className="text-sm text-gray-600">
                  Role: {uiState.selectedMember.role}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => setUiState(prev => ({ ...prev, showRemoveDialog: false }))}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemoveMember}
            disabled={formState.loading}
          >
            {formState.loading ? 'Removing...' : 'Remove Member'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  /**
   * Main component render
   * Bu render ne işe yarar:
   * - Professional layout structure
   * - Component organization
   * - User experience optimization
   */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clinic Members</h2>
          <p className="text-gray-600">
            Manage your clinic team, roles, and permissions
          </p>
        </div>
        
        {renderInviteDialog()}
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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium">Search Members</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or role..."
                  value={uiState.searchTerm}
                  onChange={(e) => setUiState(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full lg:w-48">
              <Label htmlFor="roleFilter" className="text-sm font-medium">Role</Label>
              <Select
                value={uiState.roleFilter}
                onValueChange={(value: any) => setUiState(prev => ({ ...prev, roleFilter: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="therapist">Therapist</SelectItem>
                  <SelectItem value="assistant">Assistant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full lg:w-48">
              <Label htmlFor="statusFilter" className="text-sm font-medium">Status</Label>
              <Select
                value={uiState.statusFilter}
                onValueChange={(value: any) => setUiState(prev => ({ ...prev, statusFilter: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Team Members ({getFilteredMembers().length})
          </CardTitle>
          <CardDescription>
            Manage roles and permissions for your clinic team
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading members...</p>
            </div>
          ) : getFilteredMembers().length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
              <p className="text-gray-600">
                {uiState.searchTerm || uiState.roleFilter !== 'all' || uiState.statusFilter !== 'all'
                  ? "Try adjusting your filters or search terms"
                  : "Invite your first team member to get started"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 font-medium text-gray-700">Member</th>
                    <th className="text-left p-3 font-medium text-gray-700">Role</th>
                    <th className="text-left p-3 font-medium text-gray-700">Status</th>
                    <th className="text-left p-3 font-medium text-gray-700">Joined</th>
                    <th className="text-right p-3 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredMembers().map((member) => (
                    <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {member.user_name || 'Unnamed User'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {member.user_email || 'No email'}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-3">
                        {renderRoleBadge(member.role)}
                      </td>
                      
                      <td className="p-3">
                        {renderStatusBadge(member.status)}
                      </td>
                      
                      <td className="p-3 text-gray-600">
                        {new Date(member.joined_at).toLocaleDateString()}
                      </td>
                      
                      <td className="p-3 text-right">
                        {renderMemberActions(member)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Member Dialog */}
      {renderRemoveDialog()}
    </div>
  );
}
