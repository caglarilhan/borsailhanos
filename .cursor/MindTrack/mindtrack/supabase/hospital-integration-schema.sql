-- Hospital Integration & Inpatient Care Schema
-- Run this after psychiatric-assessments-schema.sql

-- Hospital systems integration
CREATE TABLE IF NOT EXISTS hospital_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  hospital_name VARCHAR(255) NOT NULL,
  hospital_system VARCHAR(100) NOT NULL CHECK (hospital_system IN ('epic', 'cerner', 'meditech', 'allscripts', 'custom')),
  integration_type VARCHAR(50) NOT NULL CHECK (integration_type IN ('hl7', 'fhir', 'api', 'direct_connection')),
  connection_status VARCHAR(20) DEFAULT 'inactive' CHECK (connection_status IN ('active', 'inactive', 'testing', 'error')),
  api_endpoint TEXT,
  api_key TEXT,
  username VARCHAR(255),
  password_hash TEXT,
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_frequency_minutes INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inpatient admissions
CREATE TABLE IF NOT EXISTS inpatient_admissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id),
  hospital_id UUID REFERENCES hospital_integrations(id),
  admission_date TIMESTAMP WITH TIME ZONE NOT NULL,
  discharge_date TIMESTAMP WITH TIME ZONE,
  admission_type VARCHAR(50) NOT NULL CHECK (admission_type IN ('voluntary', 'involuntary', 'emergency', 'planned')),
  admission_reason TEXT NOT NULL,
  admitting_diagnosis VARCHAR(255),
  primary_diagnosis VARCHAR(255),
  secondary_diagnoses JSONB DEFAULT '[]'::jsonb,
  unit_type VARCHAR(50) CHECK (unit_type IN ('psychiatric', 'medical', 'icu', 'step_down', 'rehabilitation')),
  room_number VARCHAR(50),
  bed_number VARCHAR(50),
  attending_physician VARCHAR(255),
  consulting_psychiatrist VARCHAR(255),
  case_manager VARCHAR(255),
  insurance_provider VARCHAR(255),
  insurance_policy_number VARCHAR(255),
  authorization_number VARCHAR(255),
  length_of_stay_days INTEGER,
  discharge_disposition VARCHAR(100) CHECK (discharge_disposition IN ('home', 'skilled_nursing', 'rehabilitation', 'group_home', 'shelter', 'jail', 'other')),
  discharge_instructions TEXT,
  follow_up_appointment_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'discharged', 'transferred', 'eloped', 'deceased')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inpatient progress notes
CREATE TABLE IF NOT EXISTS inpatient_progress_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id UUID NOT NULL REFERENCES inpatient_admissions(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  note_date TIMESTAMP WITH TIME ZONE NOT NULL,
  note_type VARCHAR(50) NOT NULL CHECK (note_type IN ('admission', 'daily', 'progress', 'discharge', 'consultation', 'emergency')),
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  mental_status TEXT,
  medication_changes TEXT,
  side_effects TEXT,
  risk_assessment TEXT,
  safety_concerns TEXT,
  family_contact TEXT,
  discharge_planning TEXT,
  author VARCHAR(255),
  cosigner VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hospital consultations
CREATE TABLE IF NOT EXISTS hospital_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id),
  hospital_id UUID REFERENCES hospital_integrations(id),
  consultation_date TIMESTAMP WITH TIME ZONE NOT NULL,
  requesting_service VARCHAR(100),
  requesting_physician VARCHAR(255),
  consultation_reason TEXT NOT NULL,
  primary_diagnosis VARCHAR(255),
  secondary_diagnoses JSONB DEFAULT '[]'::jsonb,
  mental_status_examination TEXT,
  assessment TEXT,
  recommendations TEXT,
  medication_recommendations TEXT,
  follow_up_recommendations TEXT,
  urgency_level VARCHAR(20) DEFAULT 'routine' CHECK (urgency_level IN ('routine', 'urgent', 'emergency')),
  response_time_minutes INTEGER,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  completed_date TIMESTAMP WITH TIME ZONE,
  consultant VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency psychiatry
CREATE TABLE IF NOT EXISTS emergency_psychiatry_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id),
  hospital_id UUID REFERENCES hospital_integrations(id),
  visit_date TIMESTAMP WITH TIME ZONE NOT NULL,
  arrival_time TIMESTAMP WITH TIME ZONE,
  triage_time TIMESTAMP WITH TIME ZONE,
  physician_evaluation_time TIMESTAMP WITH TIME ZONE,
  disposition_time TIMESTAMP WITH TIME ZONE,
  chief_complaint TEXT NOT NULL,
  presenting_problem TEXT,
  mental_status_examination TEXT,
  risk_assessment TEXT,
  disposition VARCHAR(100) CHECK (disposition IN ('discharge', 'admission', 'transfer', 'referral', 'observation')),
  disposition_details TEXT,
  medications_given JSONB DEFAULT '[]'::jsonb,
  restraints_used BOOLEAN DEFAULT false,
  restraints_details TEXT,
  seclusion_used BOOLEAN DEFAULT false,
  seclusion_details TEXT,
  police_involved BOOLEAN DEFAULT false,
  police_details TEXT,
  family_notified BOOLEAN DEFAULT false,
  family_details TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  follow_up_location VARCHAR(255),
  total_time_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discharge planning
CREATE TABLE IF NOT EXISTS discharge_planning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id UUID NOT NULL REFERENCES inpatient_admissions(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  planning_date DATE NOT NULL,
  discharge_date DATE,
  housing_arrangements VARCHAR(255),
  housing_details TEXT,
  transportation_arrangements VARCHAR(255),
  transportation_details TEXT,
  medication_management VARCHAR(255),
  medication_details TEXT,
  outpatient_appointments JSONB DEFAULT '[]'::jsonb,
  case_management_services JSONB DEFAULT '[]'::jsonb,
  social_services JSONB DEFAULT '[]'::jsonb,
  vocational_services JSONB DEFAULT '[]'::jsonb,
  substance_abuse_treatment JSONB DEFAULT '[]'::jsonb,
  family_involvement TEXT,
  safety_plan TEXT,
  relapse_prevention_plan TEXT,
  crisis_intervention_plan TEXT,
  follow_up_schedule TEXT,
  barriers_to_discharge JSONB DEFAULT '[]'::jsonb,
  discharge_readiness_score INTEGER CHECK (discharge_readiness_score >= 1 AND discharge_readiness_score <= 10),
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hospital transfers
CREATE TABLE IF NOT EXISTS hospital_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  from_hospital_id UUID REFERENCES hospital_integrations(id),
  to_hospital_id UUID REFERENCES hospital_integrations(id),
  transfer_date TIMESTAMP WITH TIME ZONE NOT NULL,
  transfer_reason TEXT NOT NULL,
  transfer_type VARCHAR(50) CHECK (transfer_type IN ('medical', 'psychiatric', 'rehabilitation', 'specialized_care')),
  from_unit VARCHAR(100),
  to_unit VARCHAR(100),
  from_physician VARCHAR(255),
  to_physician VARCHAR(255),
  transfer_summary TEXT,
  medications_transferred JSONB DEFAULT '[]'::jsonb,
  records_transferred BOOLEAN DEFAULT false,
  family_notified BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hospital_integrations_clinic_id ON hospital_integrations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_hospital_integrations_status ON hospital_integrations(connection_status);

CREATE INDEX IF NOT EXISTS idx_inpatient_admissions_client_id ON inpatient_admissions(client_id);
CREATE INDEX IF NOT EXISTS idx_inpatient_admissions_clinic_id ON inpatient_admissions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_inpatient_admissions_hospital_id ON inpatient_admissions(hospital_id);
CREATE INDEX IF NOT EXISTS idx_inpatient_admissions_date ON inpatient_admissions(admission_date);
CREATE INDEX IF NOT EXISTS idx_inpatient_admissions_status ON inpatient_admissions(status);

CREATE INDEX IF NOT EXISTS idx_inpatient_progress_notes_admission_id ON inpatient_progress_notes(admission_id);
CREATE INDEX IF NOT EXISTS idx_inpatient_progress_notes_client_id ON inpatient_progress_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_inpatient_progress_notes_date ON inpatient_progress_notes(note_date);

CREATE INDEX IF NOT EXISTS idx_hospital_consultations_client_id ON hospital_consultations(client_id);
CREATE INDEX IF NOT EXISTS idx_hospital_consultations_clinic_id ON hospital_consultations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_hospital_consultations_date ON hospital_consultations(consultation_date);
CREATE INDEX IF NOT EXISTS idx_hospital_consultations_status ON hospital_consultations(status);

CREATE INDEX IF NOT EXISTS idx_emergency_psychiatry_visits_client_id ON emergency_psychiatry_visits(client_id);
CREATE INDEX IF NOT EXISTS idx_emergency_psychiatry_visits_clinic_id ON emergency_psychiatry_visits(clinic_id);
CREATE INDEX IF NOT EXISTS idx_emergency_psychiatry_visits_date ON emergency_psychiatry_visits(visit_date);

CREATE INDEX IF NOT EXISTS idx_discharge_planning_admission_id ON discharge_planning(admission_id);
CREATE INDEX IF NOT EXISTS idx_discharge_planning_client_id ON discharge_planning(client_id);
CREATE INDEX IF NOT EXISTS idx_discharge_planning_date ON discharge_planning(planning_date);

CREATE INDEX IF NOT EXISTS idx_hospital_transfers_client_id ON hospital_transfers(client_id);
CREATE INDEX IF NOT EXISTS idx_hospital_transfers_date ON hospital_transfers(transfer_date);
CREATE INDEX IF NOT EXISTS idx_hospital_transfers_status ON hospital_transfers(status);

-- Enable RLS
ALTER TABLE hospital_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inpatient_admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inpatient_progress_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_psychiatry_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE discharge_planning ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_transfers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can only access hospital integrations in their clinic" ON hospital_integrations
  FOR ALL USING (
    clinic_id = get_user_clinic(auth.uid())
  );

CREATE POLICY "Users can only access inpatient admissions in their clinic" ON inpatient_admissions
  FOR ALL USING (
    clinic_id = get_user_clinic(auth.uid())
  );

CREATE POLICY "Users can only access inpatient progress notes in their clinic" ON inpatient_progress_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM inpatient_admissions ia 
      WHERE ia.id = inpatient_progress_notes.admission_id 
      AND ia.clinic_id = get_user_clinic(auth.uid())
    )
  );

CREATE POLICY "Users can only access hospital consultations in their clinic" ON hospital_consultations
  FOR ALL USING (
    clinic_id = get_user_clinic(auth.uid())
  );

CREATE POLICY "Users can only access emergency psychiatry visits in their clinic" ON emergency_psychiatry_visits
  FOR ALL USING (
    clinic_id = get_user_clinic(auth.uid())
  );

CREATE POLICY "Users can only access discharge planning in their clinic" ON discharge_planning
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM inpatient_admissions ia 
      WHERE ia.id = discharge_planning.admission_id 
      AND ia.clinic_id = get_user_clinic(auth.uid())
    )
  );

CREATE POLICY "Users can only access hospital transfers in their clinic" ON hospital_transfers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = hospital_transfers.client_id 
      AND c.owner_id = auth.uid()
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_hospital_integrations_updated_at
  BEFORE UPDATE ON hospital_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inpatient_admissions_updated_at
  BEFORE UPDATE ON inpatient_admissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inpatient_progress_notes_updated_at
  BEFORE UPDATE ON inpatient_progress_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hospital_consultations_updated_at
  BEFORE UPDATE ON hospital_consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_psychiatry_visits_updated_at
  BEFORE UPDATE ON emergency_psychiatry_visits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discharge_planning_updated_at
  BEFORE UPDATE ON discharge_planning
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hospital_transfers_updated_at
  BEFORE UPDATE ON hospital_transfers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Functions for hospital integration
CREATE OR REPLACE FUNCTION get_active_inpatient_clients(clinic_uuid UUID)
RETURNS TABLE (
  client_id UUID,
  client_name VARCHAR(255),
  hospital_name VARCHAR(255),
  admission_date TIMESTAMP WITH TIME ZONE,
  length_of_stay_days INTEGER,
  primary_diagnosis VARCHAR(255),
  attending_physician VARCHAR(255)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.first_name || ' ' || c.last_name as client_name,
    hi.hospital_name,
    ia.admission_date,
    ia.length_of_stay_days,
    ia.primary_diagnosis,
    ia.attending_physician
  FROM inpatient_admissions ia
  JOIN clients c ON ia.client_id = c.id
  LEFT JOIN hospital_integrations hi ON ia.hospital_id = hi.id
  WHERE ia.clinic_id = clinic_uuid
    AND ia.status = 'active'
  ORDER BY ia.admission_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get emergency psychiatry statistics
CREATE OR REPLACE FUNCTION get_emergency_psychiatry_stats(clinic_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  total_visits INTEGER,
  average_wait_time_minutes NUMERIC,
  admission_rate NUMERIC,
  most_common_disposition VARCHAR(100),
  police_involvement_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_visits,
    AVG(EXTRACT(EPOCH FROM (physician_evaluation_time - triage_time))/60)::NUMERIC as average_wait_time_minutes,
    (COUNT(CASE WHEN disposition = 'admission' THEN 1 END) * 100.0 / COUNT(*))::NUMERIC as admission_rate,
    MODE() WITHIN GROUP (ORDER BY disposition) as most_common_disposition,
    (COUNT(CASE WHEN police_involved THEN 1 END) * 100.0 / COUNT(*))::NUMERIC as police_involvement_rate
  FROM emergency_psychiatry_visits
  WHERE clinic_id = clinic_uuid
    AND visit_date >= CURRENT_DATE - INTERVAL '1 day' * days_back;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
