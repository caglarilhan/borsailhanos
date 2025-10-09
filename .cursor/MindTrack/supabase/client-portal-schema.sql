-- Client portal schema for Supabase
-- This file contains tables and policies for patient portal functionality

-- Patient profiles table
CREATE TABLE IF NOT EXISTS patient_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  medical_record_number VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20),
  phone VARCHAR(20),
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  address_line1 VARCHAR(200),
  address_line2 VARCHAR(200),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  insurance_provider VARCHAR(100),
  insurance_number VARCHAR(100),
  allergies TEXT[],
  medical_conditions TEXT[],
  medications TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for patient profiles
CREATE INDEX IF NOT EXISTS idx_patient_profiles_user_id ON patient_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_profiles_medical_record_number ON patient_profiles(medical_record_number);
CREATE INDEX IF NOT EXISTS idx_patient_profiles_is_active ON patient_profiles(is_active);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  type VARCHAR(100) NOT NULL, -- consultation, follow-up, checkup, etc.
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, completed, cancelled, no-show
  notes TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for appointments
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  prescribed_by UUID NOT NULL,
  instructions TEXT,
  status VARCHAR(50) DEFAULT 'active', -- active, completed, discontinued
  side_effects TEXT[],
  adherence_tracking BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for medications
CREATE INDEX IF NOT EXISTS idx_medications_patient_id ON medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_medications_status ON medications(status);
CREATE INDEX IF NOT EXISTS idx_medications_start_date ON medications(start_date);

-- Medication adherence tracking
CREATE TABLE IF NOT EXISTS medication_adherence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  taken BOOLEAN DEFAULT false,
  time_taken TIME,
  notes TEXT,
  side_effects TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for medication adherence
CREATE INDEX IF NOT EXISTS idx_medication_adherence_medication_id ON medication_adherence(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_adherence_patient_id ON medication_adherence(patient_id);
CREATE INDEX IF NOT EXISTS idx_medication_adherence_date ON medication_adherence(date);

-- Lab results table
CREATE TABLE IF NOT EXISTS lab_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  test_name VARCHAR(200) NOT NULL,
  test_code VARCHAR(50),
  test_date DATE NOT NULL,
  ordered_by UUID NOT NULL,
  lab_name VARCHAR(200),
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, abnormal, critical
  results JSONB,
  normal_range VARCHAR(200),
  interpretation TEXT,
  recommendations TEXT,
  is_critical BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for lab results
CREATE INDEX IF NOT EXISTS idx_lab_results_patient_id ON lab_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_test_date ON lab_results(test_date);
CREATE INDEX IF NOT EXISTS idx_lab_results_status ON lab_results(status);
CREATE INDEX IF NOT EXISTS idx_lab_results_is_critical ON lab_results(is_critical);

-- Patient documents table
CREATE TABLE IF NOT EXISTS patient_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL, -- report, prescription, image, etc.
  document_name VARCHAR(200) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(100),
  uploaded_by UUID NOT NULL,
  description TEXT,
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,
  access_level VARCHAR(50) DEFAULT 'patient', -- patient, doctor, admin
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for patient documents
CREATE INDEX IF NOT EXISTS idx_patient_documents_patient_id ON patient_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_documents_type ON patient_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_patient_documents_uploaded_by ON patient_documents(uploaded_by);

-- Patient portal access logs
CREATE TABLE IF NOT EXISTS portal_access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL, -- login, view_appointments, download_document, etc.
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for portal access logs
CREATE INDEX IF NOT EXISTS idx_portal_access_logs_patient_id ON portal_access_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_portal_access_logs_user_id ON portal_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_portal_access_logs_created_at ON portal_access_logs(created_at);

-- Patient notifications table
CREATE TABLE IF NOT EXISTS patient_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL, -- appointment_reminder, medication_reminder, lab_result, etc.
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  action_url VARCHAR(500),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for patient notifications
CREATE INDEX IF NOT EXISTS idx_patient_notifications_patient_id ON patient_notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_notifications_is_read ON patient_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_patient_notifications_type ON patient_notifications(type);
CREATE INDEX IF NOT EXISTS idx_patient_notifications_created_at ON patient_notifications(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_patient_profiles_updated_at 
  BEFORE UPDATE ON patient_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at 
  BEFORE UPDATE ON appointments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at 
  BEFORE UPDATE ON medications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_results_updated_at 
  BEFORE UPDATE ON lab_results 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_documents_updated_at 
  BEFORE UPDATE ON patient_documents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for patient_profiles
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;

-- Patients can view their own profile
CREATE POLICY "Patients can view own profile" ON patient_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Patients can update their own profile
CREATE POLICY "Patients can update own profile" ON patient_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Patients can view their own appointments
CREATE POLICY "Patients can view own appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patient_profiles 
      WHERE patient_profiles.id = appointments.patient_id 
      AND patient_profiles.user_id = auth.uid()
    )
  );

-- RLS Policies for medications
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Patients can view their own medications
CREATE POLICY "Patients can view own medications" ON medications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patient_profiles 
      WHERE patient_profiles.id = medications.patient_id 
      AND patient_profiles.user_id = auth.uid()
    )
  );

-- RLS Policies for medication_adherence
ALTER TABLE medication_adherence ENABLE ROW LEVEL SECURITY;

-- Patients can view and update their own medication adherence
CREATE POLICY "Patients can view own adherence" ON medication_adherence
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patient_profiles 
      WHERE patient_profiles.id = medication_adherence.patient_id 
      AND patient_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can update own adherence" ON medication_adherence
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM patient_profiles 
      WHERE patient_profiles.id = medication_adherence.patient_id 
      AND patient_profiles.user_id = auth.uid()
    )
  );

-- RLS Policies for lab_results
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;

-- Patients can view their own lab results
CREATE POLICY "Patients can view own lab results" ON lab_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patient_profiles 
      WHERE patient_profiles.id = lab_results.patient_id 
      AND patient_profiles.user_id = auth.uid()
    )
  );

-- RLS Policies for patient_documents
ALTER TABLE patient_documents ENABLE ROW LEVEL SECURITY;

-- Patients can view their own documents
CREATE POLICY "Patients can view own documents" ON patient_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patient_profiles 
      WHERE patient_profiles.id = patient_documents.patient_id 
      AND patient_profiles.user_id = auth.uid()
    )
  );

-- RLS Policies for portal_access_logs
ALTER TABLE portal_access_logs ENABLE ROW LEVEL SECURITY;

-- Patients can view their own access logs
CREATE POLICY "Patients can view own access logs" ON portal_access_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patient_profiles 
      WHERE patient_profiles.id = portal_access_logs.patient_id 
      AND patient_profiles.user_id = auth.uid()
    )
  );

-- RLS Policies for patient_notifications
ALTER TABLE patient_notifications ENABLE ROW LEVEL SECURITY;

-- Patients can view their own notifications
CREATE POLICY "Patients can view own notifications" ON patient_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patient_profiles 
      WHERE patient_profiles.id = patient_notifications.patient_id 
      AND patient_profiles.user_id = auth.uid()
    )
  );

-- Patients can update their own notifications (mark as read)
CREATE POLICY "Patients can update own notifications" ON patient_notifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM patient_profiles 
      WHERE patient_profiles.id = patient_notifications.patient_id 
      AND patient_profiles.user_id = auth.uid()
    )
  );










