export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'signature';

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface VisibilityCondition {
  fieldId: string;
  operator: 'equals' | 'not_equals' | 'exists' | 'not_exists' | 'gt' | 'lt' | 'includes';
  value?: string | number | boolean;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: FormFieldOption[];
  min?: number;
  max?: number;
  pattern?: string;
  condition?: VisibilityCondition;
}

export interface FormTemplate {
  id: string;
  clinic_id: string;
  name: string;
  description?: string;
  version: number;
  fields: FormField[];
  created_at: string;
  updated_at: string;
}

export interface FormSubmission {
  id: string;
  template_id: string;
  client_id: string | null;
  submitted_by: string | null; // user id or null (kiosk)
  data: Record<string, unknown>;
  signature_data_url?: string | null;
  created_at: string;
}


