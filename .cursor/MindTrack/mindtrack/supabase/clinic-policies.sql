-- White-label Clinic Mode RLS Policies
-- Run this after clinic-schema.sql

-- Enable RLS on new tables
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_members ENABLE ROW LEVEL SECURITY;

-- Clinics policies
CREATE POLICY "Users can view clinics they are members of" ON clinics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinic_members 
      WHERE clinic_id = clinics.id 
      AND user_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "Only clinic admins can update clinic settings" ON clinics
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM clinic_members 
      WHERE clinic_id = clinics.id 
      AND user_id = auth.uid() 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

-- Clinic members policies
CREATE POLICY "Users can view clinic members of their clinic" ON clinic_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinic_members cm
      WHERE cm.clinic_id = clinic_members.clinic_id 
      AND cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Only clinic admins can manage clinic members" ON clinic_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_members cm
      WHERE cm.clinic_id = clinic_members.clinic_id 
      AND cm.user_id = auth.uid() 
      AND cm.role = 'admin' 
      AND cm.status = 'active'
    )
  );

-- Update existing table policies to include clinic_id
-- Clients
DROP POLICY IF EXISTS "Users can only access their own clients" ON clients;
CREATE POLICY "Users can only access clients in their clinic" ON clients
  FOR ALL USING (
    clinic_id = get_user_clinic(auth.uid())
  );

-- Appointments
DROP POLICY IF EXISTS "Users can only access their own appointments" ON appointments;
CREATE POLICY "Users can only access appointments in their clinic" ON appointments
  FOR ALL USING (
    clinic_id = get_user_clinic(auth.uid())
  );

-- Notes
DROP POLICY IF EXISTS "Users can only access their own notes" ON notes;
CREATE POLICY "Users can only access notes in their clinic" ON notes
  FOR ALL USING (
    clinic_id = get_user_clinic(auth.uid())
  );

-- Invoices
DROP POLICY IF EXISTS "Users can only access their own invoices" ON invoices;
CREATE POLICY "Users can only access invoices in their clinic" ON invoices
  FOR ALL USING (
    clinic_id = get_user_clinic(auth.uid())
  );

-- Files
DROP POLICY IF EXISTS "Users can only access their own files" ON files;
CREATE POLICY "Users can only access files in their clinic" ON files
  FOR ALL USING (
    clinic_id = get_user_clinic(auth.uid())
  );

-- Audit logs
DROP POLICY IF EXISTS "Users can only access their own audit logs" ON audit_logs;
CREATE POLICY "Users can only access audit logs in their clinic" ON audit_logs
  FOR ALL USING (
    clinic_id = get_user_clinic(auth.uid())
  );
