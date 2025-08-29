export type UUID = string;

export interface Client {
  id: UUID;
  owner_id: UUID;
  name: string;
  email: string | null;
  phone: string | null;
  insurance: string | null;
  status: "active" | "inactive" | string;
  // US Healthcare System fields
  insurance_payer?: string;
  insurance_policy_number?: string;
  insurance_group_number?: string;
  insurance_payer_id?: string;
  coverage_type?: string;
  prior_authorization_required?: boolean;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  e_signature_consent?: boolean;
  e_signature_date?: string;
  created_at: string;
}

export interface Appointment {
  id: UUID;
  owner_id: UUID;
  client_id: UUID;
  date: string; // ISO date
  time: string; // HH:MM:SS
  status: "scheduled" | "completed" | "cancelled" | string;
  tele_link: string | null;
  created_at: string;
}

export interface Note {
  id: UUID;
  owner_id: UUID;
  client_id: UUID;
  type: string;
  content_encrypted: string;
  created_by: UUID | null;
  created_at: string;
}

export interface Invoice {
  id: UUID;
  owner_id: UUID;
  client_id: UUID;
  amount: number;
  cpt_code: string | null;
  pdf_url: string | null;
  status: "unpaid" | "paid" | "void" | string;
  // US Healthcare System fields
  cpt_codes?: string[];
  icd_codes?: string[];
  modifier_codes?: string[];
  pos_code?: string;
  diagnosis_pointers?: string[];
  superbill_generated?: boolean;
  superbill_url?: string;
  created_at: string;
}

export interface FileObject {
  id: UUID;
  owner_id: UUID;
  client_id: UUID | null;
  file_url: string;
  type: string | null;
  created_at: string;
}

export interface AuditLog {
  id: UUID;
  owner_id: UUID;
  action: string;
  entity: string;
  meta: Record<string, unknown> | null;
  timestamp: string;
}


