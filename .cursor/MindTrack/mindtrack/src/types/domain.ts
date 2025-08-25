export type UUID = string;

export interface Client {
  id: UUID;
  owner_id: UUID;
  name: string;
  email: string | null;
  phone: string | null;
  insurance: string | null;
  status: "active" | "inactive" | string;
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


