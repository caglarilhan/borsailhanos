"use client";

import * as React from "react";
import ClinicSettings from "@/components/clinic/clinic-settings";
import ClinicMembers from "@/components/clinic/clinic-members";
import PermissionManager from "@/components/clinic/permission-manager";
import MemberGroups from "@/components/clinic/member-groups";
import type { Clinic, ClinicSettings as ClinicSettingsType, ClinicMember } from "@/types/clinic";

/**
 * Clinic Settings Tab Component - Main clinic management interface
 * 
 * Bu component ne işe yarar:
 * - Clinic settings management
 * - Team members management
 * - Permission management
 * - Tab-based navigation
 * - Professional clinic administration interface
 */

export default function ClinicSettingsTab() {
  /**
   * Clinic data state'ini yönetir
   * Bu state ne işe yarar:
   * - Clinic information storage
   * - Settings data management
   * - Form state synchronization
   */
  const [clinic, setClinic] = React.useState<Clinic | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  /**
   * Members management state'ini yönetir
   * Bu state ne işe yarar:
   * - Team members data
   * - Member operations state
   * - Loading ve error handling
   */
  const [members, setMembers] = React.useState<ClinicMember[]>([]);
  const [membersLoading, setMembersLoading] = React.useState(false);
  const [membersError, setMembersError] = React.useState<string | null>(null);

  /**
   * Permission management state'ini yönetir
   * Bu state ne işe yarar:
   * - Role-based permissions
   * - Custom permission sets
   * - Permission operations state
   */
  const [permissions, setPermissions] = React.useState<any>({});
  const [customPermissionSets, setCustomPermissionSets] = React.useState<any[]>([]);
  const [permissionsLoading, setPermissionsLoading] = React.useState(false);
  const [permissionsError, setPermissionsError] = React.useState<string | null>(null);

  /**
   * Active tab state'ini yönetir
   * Bu state ne işe yarar:
   * - Tab navigation
   * - Content switching
   * - User experience optimization
   */
  const [activeTab, setActiveTab] = React.useState<'settings' | 'members' | 'groups' | 'permissions'>('settings');

  // Groups state
  const [groups, setGroups] = React.useState<any[]>([]);
  const [groupsLoading, setGroupsLoading] = React.useState(false);
  const [groupsError, setGroupsError] = React.useState<string | null>(null);

  /**
   * Component mount'ta data'ları fetch eder
   * Bu useEffect ne işe yarar:
   * - Initial data loading
   * - State initialization
   * - Error handling setup
   */
  React.useEffect(() => {
    fetchClinicData();
    fetchMembers();
    fetchPermissions();
    fetchGroups();
  }, []);

  /**
   * Clinic data'larını fetch eder
   * Bu fonksiyon ne işe yarar:
   * - API call to clinic endpoint
   * - Data state management
   * - Error handling
   * - Loading state management
   */
  const fetchClinicData = async () => {
    try {
      const response = await fetch('/api/clinics');
      if (!response.ok) {
        throw new Error('Failed to fetch clinic data');
      }
      const data = await response.json();
      setClinic(data);
    } catch (error) {
      console.error('Error fetching clinic data:', error);
      setError('Failed to load clinic data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clinic members'larını fetch eder
   * Bu fonksiyon ne işe yarar:
   * - API call to members endpoint
   * - Members state management
   * - Error handling
   * - Loading state management
   */
  const fetchMembers = async () => {
    setMembersLoading(true);
    try {
      const response = await fetch('/api/clinics/members');
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembersError('Failed to load members');
    } finally {
      setMembersLoading(false);
    }
  };

  /**
   * Clinic permissions'larını fetch eder
   * Bu fonksiyon ne işe yarar:
   * - API call to permissions endpoint
   * - Permissions state management
   * - Error handling
   * - Loading state management
   */
  const fetchPermissions = async () => {
    setPermissionsLoading(true);
    try {
      const response = await fetch('/api/clinics/permissions');
      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }
      const data = await response.json();
      setPermissions(data.permissions || {});
      setCustomPermissionSets(data.customPermissionSets || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissionsError('Failed to load permissions');
    } finally {
      setPermissionsLoading(false);
    }
  };

  /**
   * Clinic settings'leri kaydeder
   * Bu fonksiyon ne işe yarar:
   * - API call to update clinic
   * - Success/error handling
   * - State synchronization
   * - User feedback
   */
  const handleSaveSettings = async (settings: ClinicSettingsType) => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/clinics', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save clinic settings');
      }

      const updatedClinic = await response.json();
      setClinic(updatedClinic);
      setSuccess(true);
      
      // Success message'ı 3 saniye sonra temizle
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save settings';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Yeni team member davet eder
   * Bu fonksiyon ne işe yarar:
   * - API call to invite member
   * - Members list refresh
   * - Error handling
   * - User feedback
   */
  const handleInviteMember = async (email: string, role: 'admin' | 'therapist' | 'assistant') => {
    try {
      const response = await fetch('/api/clinics/members/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to invite member');
      }

      // Refresh members list
      await fetchMembers();
    } catch (error) {
      throw error;
    }
  };

  /**
   * Member role'unu günceller
   * Bu fonksiyon ne işe yarar:
   * - API call to update role
   * - Members list refresh
   * - Error handling
   * - User feedback
   */
  const handleUpdateRole = async (memberId: string, role: 'admin' | 'therapist' | 'assistant') => {
    try {
      const response = await fetch(`/api/clinics/members/${memberId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update role');
      }

      // Refresh members list
      await fetchMembers();
    } catch (error) {
      throw error;
    }
  };

  /**
   * Member'ı kaldırır
   * Bu fonksiyon ne işe yarar:
   * - API call to remove member
   * - Members list refresh
   * - Error handling
   * - User feedback
   */
  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/clinics/members/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove member');
      }

      // Refresh members list
      await fetchMembers();
    } catch (error) {
      throw error;
    }
  };

  /**
   * Member davet'ini yeniden gönderir
   * Bu fonksiyon ne işe yarar:
   * - API call to resend invite
   * - Error handling
   * - User feedback
   */
  const handleResendInvite = async (memberId: string) => {
    try {
      const response = await fetch(`/api/clinics/members/${memberId}/resend-invite`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to resend invite');
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * Role permissions'larını günceller
   * Bu fonksiyon ne işe yarar:
   * - API call to update permissions
   * - Permissions state refresh
   * - Error handling
   * - User feedback
   */
  const handleUpdatePermissions = async (role: string, permissions: any[]) => {
    try {
      const response = await fetch('/api/clinics/permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, permissions }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update permissions');
      }

      // Refresh permissions
      await fetchPermissions();
    } catch (error) {
      throw error;
    }
  };

  /**
   * Custom permission set oluşturur
   * Bu fonksiyon ne işe yarar:
   * - API call to create custom set
   * - Permissions state refresh
   * - Error handling
   * - User feedback
   */
  const handleCreateCustomSet = async (set: any) => {
    try {
      const response = await fetch('/api/clinics/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(set),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create custom permission set');
      }

      // Refresh permissions
      await fetchPermissions();
    } catch (error) {
      throw error;
    }
  };

  /**
   * Custom permission set'i günceller
   * Bu fonksiyon ne işe yarar:
   * - API call to update custom set
   * - Permissions state refresh
   * - Error handling
   * - User feedback
   */
  const handleUpdateCustomSet = async (id: string, set: any) => {
    try {
      const response = await fetch(`/api/clinics/permissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(set),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update custom permission set');
      }

      // Refresh permissions
      await fetchPermissions();
    } catch (error) {
      throw error;
    }
  };

  /**
   * Custom permission set'i siler
   * Bu fonksiyon ne işe yarar:
   * - API call to delete custom set
   * - Permissions state refresh
   * - Error handling
   * - User feedback
   */
  const handleDeleteCustomSet = async (id: string) => {
    try {
      const response = await fetch(`/api/clinics/permissions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete custom permission set');
      }

      // Refresh permissions
      await fetchPermissions();
    } catch (error) {
      throw error;
    }
  };

  // Groups API wiring
  const fetchGroups = async () => {
    setGroupsLoading(true);
    setGroupsError(null);
    try {
      const res = await fetch('/api/clinics/groups');
      if (!res.ok) throw new Error('Failed to fetch groups');
      const data = await res.json();
      // Map API rows to MemberGroups component shape (minimal fields)
      const mapped = (data || []).map((g: any) => ({
        id: g.id,
        name: g.name,
        description: g.description || '',
        type: mapGroupTypeToUi(g.group_type),
        category: '',
        memberCount: 0,
        isActive: !!g.is_active,
        isPublic: g.privacy === 'public',
        createdAt: g.created_at,
        updatedAt: g.updated_at,
        createdBy: g.created_by,
        members: []
      }));
      setGroups(mapped);
    } catch (e: any) {
      setGroupsError(e?.message || 'Failed to load groups');
    } finally {
      setGroupsLoading(false);
    }
  };

  const mapGroupTypeToDb = (t: string) => {
    // UI types -> db enum: team|discipline|cohort|custom
    switch (t) {
      case 'project': return 'team';
      case 'cross_functional': return 'team';
      case 'specialty': return 'discipline';
      case 'location': return 'cohort';
      case 'department': return 'discipline';
      default: return 'custom';
    }
  };

  const mapGroupTypeToUi = (t: string) => {
    // db enum -> UI types
    switch (t) {
      case 'team': return 'project';
      case 'discipline': return 'department';
      case 'cohort': return 'location';
      default: return 'department';
    }
  };

  const handleCreateGroupApi = async (data: any) => {
    const payload = {
      name: data.name,
      description: data.description,
      group_type: mapGroupTypeToDb(data.type),
      privacy: data.isPublic ? 'public' : 'private'
    };
    const res = await fetch('/api/clinics/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create group');
    }
    await fetchGroups();
  };

  const handleUpdateGroupApi = async (id: string, data: any) => {
    const payload = {
      id,
      name: data.name,
      description: data.description,
      group_type: data.type ? mapGroupTypeToDb(data.type) : undefined,
      privacy: typeof data.isPublic === 'boolean' ? (data.isPublic ? 'public' : 'private') : undefined
    };
    const res = await fetch('/api/clinics/groups', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update group');
    }
    await fetchGroups();
  };

  const handleDeleteGroupApi = async (id: string) => {
    const res = await fetch(`/api/clinics/groups?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete group');
    }
    await fetchGroups();
  };

  /**
   * Loading state'ini render eder
   * Bu fonksiyon ne işe yarar:
   * - Skeleton loading UI
   * - User experience optimization
   * - Loading state indication
   */
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

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
      {/* Header Section - Başlık bölümü */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Clinic Management</h2>
        <p className="text-gray-600">
          Manage your clinic settings, team members, and permissions
        </p>
      </div>

      {/* Success & Error Messages - Başarı ve hata mesajları */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          Clinic settings saved successfully!
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Tab Navigation - Tab navigasyonu */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Clinic Settings
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'members'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Team Members
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'groups'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Groups
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Permissions
          </button>
        </nav>
      </div>

      {/* Tab Content - Tab içeriği */}
      {activeTab === 'settings' ? (
        <ClinicSettings
          clinic={clinic}
          onSave={handleSaveSettings}
          saving={saving}
        />
      ) : activeTab === 'members' ? (
        <ClinicMembers
          members={members}
          onInviteMember={handleInviteMember}
          onUpdateRole={handleUpdateRole}
          onRemoveMember={handleRemoveMember}
          onResendInvite={handleResendInvite}
          loading={membersLoading}
        />
      ) : activeTab === 'groups' ? (
        <MemberGroups
          groups={groups}
          onCreateGroup={handleCreateGroupApi}
          onUpdateGroup={handleUpdateGroupApi}
          onDeleteGroup={handleDeleteGroupApi}
          onAddMember={async (groupId, memberData) => {
            await fetch('/api/clinics/groups/members', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ group_id: groupId, member_id: memberData.memberId, role: memberData.role })
            }).then(async (res) => {
              if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Failed to add member');
              }
              await fetchGroups();
            });
          }}
          onRemoveMember={async (groupId, memberId) => {
            const res = await fetch(`/api/clinics/groups/members?groupId=${encodeURIComponent(groupId)}&memberId=${encodeURIComponent(memberId)}`, {
              method: 'DELETE'
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(err.error || 'Failed to remove member');
            }
            await fetchGroups();
          }}
          onUpdateMemberRole={async (groupId, memberId, role) => {
            const res = await fetch('/api/clinics/groups/members', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ group_id: groupId, member_id: memberId, role })
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(err.error || 'Failed to update role');
            }
            await fetchGroups();
          }}
          loading={groupsLoading}
        />
      ) : (
        <PermissionManager
          rolePermissions={Object.entries(permissions).map(([role, perms]) => ({
            role: role as 'admin' | 'therapist' | 'assistant',
            permissions: perms as any[]
          }))}
          customPermissionSets={customPermissionSets}
          onUpdatePermissions={handleUpdatePermissions}
          onCreateCustomSet={handleCreateCustomSet}
          onUpdateCustomSet={handleUpdateCustomSet}
          onDeleteCustomSet={handleDeleteCustomSet}
          loading={permissionsLoading}
        />
      )}
    </div>
  );
}
