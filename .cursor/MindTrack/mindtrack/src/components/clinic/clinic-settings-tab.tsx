"use client";

import * as React from "react";
import ClinicSettings from "@/components/clinic/clinic-settings";
import type { Clinic, ClinicSettings as ClinicSettingsType, ClinicMember } from "@/types/clinic";

export default function ClinicSettingsTab() {
  const [clinic, setClinic] = React.useState<Clinic | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  
  // Members state
  const [members, setMembers] = React.useState<ClinicMember[]>([]);
  const [membersLoading, setMembersLoading] = React.useState(false);
  const [membersError, setMembersError] = React.useState<string | null>(null);

  // Load clinic data on mount
  React.useEffect(() => {
    loadClinic();
  }, []);

  // Load members when clinic is available
  React.useEffect(() => {
    if (clinic) {
      loadMembers();
    }
  }, [clinic]);

  const loadClinic = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/clinics');
      if (!response.ok) {
        if (response.status === 404) {
          // No clinic found - this is normal for new users
          setClinic(undefined);
        } else {
          throw new Error('Failed to load clinic');
        }
      } else {
        const clinicData = await response.json();
        setClinic(clinicData);
      }
    } catch (err) {
      console.error('Failed to load clinic:', err);
      setError(err instanceof Error ? err.message : 'Failed to load clinic');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (settings: ClinicSettingsType) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const response = await fetch('/api/clinics', {
        method: clinic ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save clinic settings');
      }

      const savedClinic = await response.json();
      setClinic(savedClinic);
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save clinic settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save clinic settings');
    } finally {
      setSaving(false);
    }
  };

  const loadMembers = async () => {
    try {
      setMembersLoading(true);
      setMembersError(null);
      
      const response = await fetch('/api/clinics/members');
      if (!response.ok) {
        throw new Error('Failed to load members');
      }
      
      const membersData = await response.json();
      setMembers(membersData);
    } catch (err) {
      console.error('Failed to load members:', err);
      setMembersError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setMembersLoading(false);
    }
  };

  const handleInviteMember = async (email: string, role: 'admin' | 'therapist' | 'assistant') => {
    try {
      const response = await fetch('/api/clinics/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to invite member');
      }

      // Reload members list
      await loadMembers();
    } catch (err) {
      console.error('Failed to invite member:', err);
      throw err;
    }
  };

  const handleUpdateMemberRole = async (memberId: string, role: 'admin' | 'therapist' | 'assistant') => {
    try {
      const response = await fetch('/api/clinics/members', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ member_id: memberId, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update member role');
      }

      // Reload members list
      await loadMembers();
    } catch (err) {
      console.error('Failed to update member role:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j}>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                    <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-800 font-medium">Clinic settings saved successfully!</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      <ClinicSettings
        clinic={clinic}
        loading={saving}
        onSave={handleSave}
        members={members}
        onInviteMember={handleInviteMember}
        onUpdateMemberRole={handleUpdateMemberRole}
        membersLoading={membersLoading}
      />
    </div>
  );
}
