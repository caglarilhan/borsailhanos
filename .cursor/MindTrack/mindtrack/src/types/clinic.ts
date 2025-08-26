export interface Clinic {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  website_url?: string;
  phone?: string;
  email?: string;
  address?: string;
  timezone: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface ClinicMember {
  id: string;
  clinic_id: string;
  user_id: string;
  role: 'admin' | 'therapist' | 'assistant';
  status: 'active' | 'inactive' | 'pending';
  joined_at: string;
  // Joined fields
  user_email?: string;
  user_name?: string;
  clinic_name?: string;
}

export interface ClinicSettings {
  name: string;
  description?: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  website_url?: string;
  phone?: string;
  email?: string;
  address?: string;
  timezone: string;
  currency: string;
}

export interface CreateClinicRequest {
  name: string;
  slug: string;
  description?: string;
  primary_color?: string;
  secondary_color?: string;
  website_url?: string;
  phone?: string;
  email?: string;
  address?: string;
  timezone?: string;
  currency?: string;
}

export interface InviteMemberRequest {
  email: string;
  role: 'admin' | 'therapist' | 'assistant';
}

export interface UpdateMemberRoleRequest {
  member_id: string;
  role: 'admin' | 'therapist' | 'assistant';
}

export interface ClinicStats {
  total_clients: number;
  total_appointments: number;
  total_notes: number;
  total_invoices: number;
  active_members: number;
  monthly_revenue?: number;
}

export const CLINIC_ROLES = {
  admin: {
    label: 'Admin',
    description: 'Full access to clinic settings and management',
    permissions: ['manage_clinic', 'manage_members', 'view_all_data', 'manage_billing']
  },
  therapist: {
    label: 'Therapist',
    description: 'Access to clinical data and client management',
    permissions: ['view_clients', 'manage_appointments', 'manage_notes', 'view_billing']
  },
  assistant: {
    label: 'Assistant',
    description: 'Limited access for administrative tasks',
    permissions: ['view_clients', 'view_appointments', 'view_notes', 'view_billing']
  }
} as const;

export type ClinicRole = keyof typeof CLINIC_ROLES;
