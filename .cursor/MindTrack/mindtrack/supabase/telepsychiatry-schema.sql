-- Telepsychiatry and Remote Care Schema
-- Run this after genetic-counseling-schema.sql

-- Telepsychiatry sessions
CREATE TABLE IF NOT EXISTS telepsychiatry_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('initial', 'follow_up', 'emergency', 'medication_management', 'therapy', 'assessment', 'consultation')),
  session_duration_minutes INTEGER NOT NULL,
  platform VARCHAR(100) DEFAULT 'zoom' CHECK (platform IN ('zoom', 'doxy_me', 'thera_link', 'vsee', 'skype', 'facetime', 'other')),
  session_url VARCHAR(500),
  meeting_id VARCHAR(255),
  password VARCHAR(255),
  session_status VARCHAR(20) DEFAULT 'scheduled' CHECK (session_status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled')),
  cancellation_reason TEXT,
  rescheduled_to TIMESTAMP WITH TIME ZONE,
  session_notes TEXT,
  clinical_impression TEXT,
  treatment_plan_updates TEXT,
  medication_changes JSONB DEFAULT '[]'::jsonb,
  follow_up_date DATE,
  billing_code VARCHAR(20),
  insurance_authorization VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Remote monitoring devices
CREATE TABLE IF NOT EXISTS remote_monitoring_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  device_type VARCHAR(100) NOT NULL CHECK (device_type IN (
    'smartphone_app', 'smart_watch', 'sleep_tracker', 'mood_tracker', 
    'activity_monitor', 'medication_reminder', 'heart_rate_monitor',
    'blood_pressure_monitor', 'glucose_monitor', 'other'
  )),
  device_name VARCHAR(255),
  device_model VARCHAR(255),
  serial_number VARCHAR(255),
  manufacturer VARCHAR(255),
  integration_platform VARCHAR(100),
  api_key VARCHAR(255),
  setup_date DATE NOT NULL,
  activation_date DATE,
  deactivation_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'replaced', 'lost')),
  data_frequency VARCHAR(50) DEFAULT 'daily',
  monitoring_parameters JSONB DEFAULT '[]'::jsonb,
  alerts_enabled BOOLEAN DEFAULT true,
  alert_thresholds JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Remote monitoring data
CREATE TABLE IF NOT EXISTS remote_monitoring_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES remote_monitoring_devices(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  data_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  data_type VARCHAR(100) NOT NULL CHECK (data_type IN (
    'mood', 'sleep', 'activity', 'heart_rate', 'blood_pressure', 
    'medication_adherence', 'symptoms', 'stress_level', 'anxiety_level',
    'depression_score', 'suicide_risk', 'other'
  )),
  data_value JSONB NOT NULL,
  data_quality VARCHAR(20) DEFAULT 'good' CHECK (data_quality IN ('excellent', 'good', 'fair', 'poor', 'invalid')),
  source VARCHAR(50) DEFAULT 'device' CHECK (source IN ('device', 'manual_entry', 'app', 'other')),
  processed BOOLEAN DEFAULT false,
  flagged_for_review BOOLEAN DEFAULT false,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Digital therapeutics
CREATE TABLE IF NOT EXISTS digital_therapeutics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  therapeutic_name VARCHAR(255) NOT NULL,
  therapeutic_type VARCHAR(100) NOT NULL CHECK (therapeutic_type IN (
    'cbt_app', 'dbt_app', 'mindfulness_app', 'exposure_therapy', 
    'biofeedback', 'neurofeedback', 'virtual_reality', 'gamification',
    'social_support', 'education', 'other'
  )),
  platform VARCHAR(100),
  prescription_date DATE NOT NULL,
  start_date DATE,
  completion_date DATE,
  status VARCHAR(20) DEFAULT 'prescribed' CHECK (status IN ('prescribed', 'active', 'completed', 'discontinued', 'paused')),
  dosage_frequency VARCHAR(50),
  session_duration_minutes INTEGER,
  total_sessions_prescribed INTEGER,
  sessions_completed INTEGER DEFAULT 0,
  adherence_rate NUMERIC(5,2),
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 10),
  side_effects JSONB DEFAULT '[]'::jsonb,
  contraindications JSONB DEFAULT '[]'::jsonb,
  integration_with_treatment BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Remote crisis intervention
CREATE TABLE IF NOT EXISTS remote_crisis_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  crisis_date TIMESTAMP WITH TIME ZONE NOT NULL,
  crisis_type VARCHAR(100) NOT NULL CHECK (crisis_type IN (
    'suicidal_ideation', 'suicide_attempt', 'homicidal_ideation', 
    'psychosis', 'mania', 'severe_depression', 'anxiety_attack',
    'substance_use', 'self_harm', 'violence_risk', 'other'
  )),
  crisis_severity VARCHAR(20) NOT NULL CHECK (crisis_severity IN ('low', 'moderate', 'high', 'critical')),
  intervention_method VARCHAR(50) NOT NULL CHECK (intervention_method IN ('phone', 'video', 'text', 'app', 'in_person', 'other')),
  intervention_duration_minutes INTEGER,
  crisis_triggers JSONB DEFAULT '[]'::jsonb,
  safety_plan_activated BOOLEAN DEFAULT false,
  safety_plan_effectiveness INTEGER CHECK (safety_plan_effectiveness >= 1 AND safety_plan_effectiveness <= 10),
  emergency_services_contacted BOOLEAN DEFAULT false,
  emergency_services_details TEXT,
  hospitalization_recommended BOOLEAN DEFAULT false,
  hospitalization_details TEXT,
  follow_up_plan TEXT,
  crisis_resolved BOOLEAN DEFAULT false,
  resolution_time_minutes INTEGER,
  post_crisis_assessment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Remote medication management
CREATE TABLE IF NOT EXISTS remote_medication_management (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  session_date DATE NOT NULL,
  session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('medication_review', 'side_effect_assessment', 'dose_adjustment', 'medication_education', 'adherence_monitoring')),
  medications_reviewed JSONB DEFAULT '[]'::jsonb,
  side_effects_assessed JSONB DEFAULT '[]'::jsonb,
  dose_changes JSONB DEFAULT '[]'::jsonb,
  adherence_rate NUMERIC(5,2),
  adherence_barriers JSONB DEFAULT '[]'::jsonb,
  adherence_strategies JSONB DEFAULT '[]'::jsonb,
  medication_education_topics JSONB DEFAULT '[]'::jsonb,
  lab_results_reviewed JSONB DEFAULT '[]'::jsonb,
  drug_interactions_checked BOOLEAN DEFAULT false,
  drug_interactions_found JSONB DEFAULT '[]'::jsonb,
  next_refill_date DATE,
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Telepsychiatry compliance
CREATE TABLE IF NOT EXISTS telepsychiatry_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES telepsychiatry_sessions(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  compliance_check_date DATE NOT NULL,
  hipaa_compliant BOOLEAN DEFAULT true,
  hipaa_violations JSONB DEFAULT '[]'::jsonb,
  state_licensing_compliant BOOLEAN DEFAULT true,
  state_licensing_violations JSONB DEFAULT '[]'::jsonb,
  insurance_compliant BOOLEAN DEFAULT true,
  insurance_violations JSONB DEFAULT '[]'::jsonb,
  informed_consent_obtained BOOLEAN DEFAULT true,
  consent_documentation TEXT,
  emergency_procedures_discussed BOOLEAN DEFAULT true,
  emergency_contact_verified BOOLEAN DEFAULT true,
  emergency_contact_details JSONB,
  backup_plan_discussed BOOLEAN DEFAULT true,
  backup_plan_details TEXT,
  session_recorded BOOLEAN DEFAULT false,
  recording_consent_obtained BOOLEAN DEFAULT false,
  recording_purpose TEXT,
  recording_retention_policy TEXT,
  technical_issues JSONB DEFAULT '[]'::jsonb,
  technical_issue_resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_telepsychiatry_sessions_client_id ON telepsychiatry_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_telepsychiatry_sessions_clinic_id ON telepsychiatry_sessions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_telepsychiatry_sessions_date ON telepsychiatry_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_telepsychiatry_sessions_status ON telepsychiatry_sessions(session_status);

CREATE INDEX IF NOT EXISTS idx_remote_monitoring_devices_client_id ON remote_monitoring_devices(client_id);
CREATE INDEX IF NOT EXISTS idx_remote_monitoring_devices_type ON remote_monitoring_devices(device_type);
CREATE INDEX IF NOT EXISTS idx_remote_monitoring_devices_status ON remote_monitoring_devices(status);

CREATE INDEX IF NOT EXISTS idx_remote_monitoring_data_device_id ON remote_monitoring_data(device_id);
CREATE INDEX IF NOT EXISTS idx_remote_monitoring_data_client_id ON remote_monitoring_data(client_id);
CREATE INDEX IF NOT EXISTS idx_remote_monitoring_data_timestamp ON remote_monitoring_data(data_timestamp);
CREATE INDEX IF NOT EXISTS idx_remote_monitoring_data_type ON remote_monitoring_data(data_type);

CREATE INDEX IF NOT EXISTS idx_digital_therapeutics_client_id ON digital_therapeutics(client_id);
CREATE INDEX IF NOT EXISTS idx_digital_therapeutics_type ON digital_therapeutics(therapeutic_type);
CREATE INDEX IF NOT EXISTS idx_digital_therapeutics_status ON digital_therapeutics(status);

CREATE INDEX IF NOT EXISTS idx_remote_crisis_interventions_client_id ON remote_crisis_interventions(client_id);
CREATE INDEX IF NOT EXISTS idx_remote_crisis_interventions_date ON remote_crisis_interventions(crisis_date);
CREATE INDEX IF NOT EXISTS idx_remote_crisis_interventions_type ON remote_crisis_interventions(crisis_type);
CREATE INDEX IF NOT EXISTS idx_remote_crisis_interventions_severity ON remote_crisis_interventions(crisis_severity);

CREATE INDEX IF NOT EXISTS idx_remote_medication_management_client_id ON remote_medication_management(client_id);
CREATE INDEX IF NOT EXISTS idx_remote_medication_management_date ON remote_medication_management(session_date);

CREATE INDEX IF NOT EXISTS idx_telepsychiatry_compliance_session_id ON telepsychiatry_compliance(session_id);
CREATE INDEX IF NOT EXISTS idx_telepsychiatry_compliance_client_id ON telepsychiatry_compliance(client_id);

-- Enable RLS
ALTER TABLE telepsychiatry_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE remote_monitoring_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE remote_monitoring_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_therapeutics ENABLE ROW LEVEL SECURITY;
ALTER TABLE remote_crisis_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE remote_medication_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE telepsychiatry_compliance ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can only access telepsychiatry sessions in their clinic" ON telepsychiatry_sessions
  FOR ALL USING (
    clinic_id = get_user_clinic(auth.uid())
  );

CREATE POLICY "Users can only access remote monitoring devices in their clinic" ON remote_monitoring_devices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = remote_monitoring_devices.client_id 
      AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can only access remote monitoring data in their clinic" ON remote_monitoring_data
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = remote_monitoring_data.client_id 
      AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can only access digital therapeutics in their clinic" ON digital_therapeutics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = digital_therapeutics.client_id 
      AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can only access remote crisis interventions in their clinic" ON remote_crisis_interventions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = remote_crisis_interventions.client_id 
      AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can only access remote medication management in their clinic" ON remote_medication_management
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = remote_medication_management.client_id 
      AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can only access telepsychiatry compliance in their clinic" ON telepsychiatry_compliance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = telepsychiatry_compliance.client_id 
      AND c.owner_id = auth.uid()
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_telepsychiatry_sessions_updated_at
  BEFORE UPDATE ON telepsychiatry_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_remote_monitoring_devices_updated_at
  BEFORE UPDATE ON remote_monitoring_devices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_remote_monitoring_data_updated_at
  BEFORE UPDATE ON remote_monitoring_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_digital_therapeutics_updated_at
  BEFORE UPDATE ON digital_therapeutics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_remote_crisis_interventions_updated_at
  BEFORE UPDATE ON remote_crisis_interventions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_remote_medication_management_updated_at
  BEFORE UPDATE ON remote_medication_management
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_telepsychiatry_compliance_updated_at
  BEFORE UPDATE ON telepsychiatry_compliance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Functions for telepsychiatry
CREATE OR REPLACE FUNCTION get_client_telepsychiatry_history(client_uuid UUID, days_back INTEGER DEFAULT 365)
RETURNS TABLE (
  session_date TIMESTAMP WITH TIME ZONE,
  session_type VARCHAR(50),
  session_duration_minutes INTEGER,
  platform VARCHAR(100),
  session_status VARCHAR(20),
  session_notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ts.session_date,
    ts.session_type,
    ts.session_duration_minutes,
    ts.platform,
    ts.session_status,
    ts.session_notes
  FROM telepsychiatry_sessions ts
  WHERE ts.client_id = client_uuid
    AND ts.session_date >= NOW() - INTERVAL '1 day' * days_back
  ORDER BY ts.session_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get crisis intervention alerts
CREATE OR REPLACE FUNCTION get_crisis_intervention_alerts(hours_back INTEGER DEFAULT 24)
RETURNS TABLE (
  client_id UUID,
  client_name VARCHAR(255),
  crisis_type VARCHAR(100),
  crisis_severity VARCHAR(20),
  crisis_date TIMESTAMP WITH TIME ZONE,
  intervention_method VARCHAR(50),
  crisis_resolved BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rci.client_id,
    c.first_name || ' ' || c.last_name as client_name,
    rci.crisis_type,
    rci.crisis_severity,
    rci.crisis_date,
    rci.intervention_method,
    rci.crisis_resolved
  FROM remote_crisis_interventions rci
  JOIN clients c ON c.id = rci.client_id
  WHERE rci.crisis_date >= NOW() - INTERVAL '1 hour' * hours_back
    AND rci.crisis_severity IN ('high', 'critical')
    AND rci.crisis_resolved = false
  ORDER BY rci.crisis_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate telepsychiatry adherence
CREATE OR REPLACE FUNCTION calculate_telepsychiatry_adherence(client_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  total_sessions INTEGER,
  completed_sessions INTEGER,
  adherence_rate NUMERIC(5,2),
  average_session_duration NUMERIC(5,2)
) AS $$
DECLARE
  total_sessions_count INTEGER := 0;
  completed_sessions_count INTEGER := 0;
  total_duration NUMERIC := 0;
  avg_duration NUMERIC := 0;
  adherence_rate_calc NUMERIC := 0;
BEGIN
  -- Get total sessions
  SELECT COUNT(*), 
         COUNT(CASE WHEN session_status = 'completed' THEN 1 END),
         COALESCE(AVG(session_duration_minutes), 0)
  INTO total_sessions_count, completed_sessions_count, avg_duration
  FROM telepsychiatry_sessions
  WHERE client_id = client_uuid
    AND session_date >= NOW() - INTERVAL '1 day' * days_back;

  -- Calculate adherence rate
  IF total_sessions_count > 0 THEN
    adherence_rate_calc := (completed_sessions_count::NUMERIC / total_sessions_count::NUMERIC) * 100;
  END IF;

  RETURN QUERY SELECT 
    total_sessions_count,
    completed_sessions_count,
    adherence_rate_calc,
    avg_duration;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
