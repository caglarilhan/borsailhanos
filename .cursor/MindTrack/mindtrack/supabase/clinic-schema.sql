-- White-label Clinic Mode Schema
-- Run this after the main schema.sql

-- Clinics table
CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  secondary_color VARCHAR(7) DEFAULT '#1F2937',
  website_url TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clinic members (users in clinics)
CREATE TABLE IF NOT EXISTS clinic_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'therapist', 'assistant')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(clinic_id, user_id)
);

-- Update existing tables to include clinic_id
ALTER TABLE clients ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id);
ALTER TABLE notes ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id);
ALTER TABLE files ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clinic_members_clinic_id ON clinic_members(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_members_user_id ON clinic_members(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_clinic_id ON clients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_notes_clinic_id ON notes(clinic_id);
CREATE INDEX IF NOT EXISTS idx_invoices_clinic_id ON invoices(clinic_id);

-- Function to get user's clinic
CREATE OR REPLACE FUNCTION get_user_clinic(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
  clinic_uuid UUID;
BEGIN
  SELECT clinic_id INTO clinic_uuid
  FROM clinic_members
  WHERE user_id = user_uuid AND status = 'active'
  LIMIT 1;
  
  RETURN clinic_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set clinic_id automatically
CREATE OR REPLACE FUNCTION set_clinic_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.clinic_id IS NULL THEN
    NEW.clinic_id := get_user_clinic(auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for clinic_id
CREATE TRIGGER set_clinic_id_clients
  BEFORE INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION set_clinic_id();

CREATE TRIGGER set_clinic_id_appointments
  BEFORE INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION set_clinic_id();

CREATE TRIGGER set_clinic_id_notes
  BEFORE INSERT ON notes
  FOR EACH ROW
  EXECUTE FUNCTION set_clinic_id();

CREATE TRIGGER set_clinic_id_invoices
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION set_clinic_id();

CREATE TRIGGER set_clinic_id_files
  BEFORE INSERT ON files
  FOR EACH ROW
  EXECUTE FUNCTION set_clinic_id();

CREATE TRIGGER set_clinic_id_audit_logs
  BEFORE INSERT ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION set_clinic_id();
