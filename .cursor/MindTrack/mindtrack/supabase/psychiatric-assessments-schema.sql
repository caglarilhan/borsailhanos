-- Psychiatric Assessment Tools Schema
-- Run this after laboratory-imaging-schema.sql

-- Standardized psychiatric assessments
CREATE TABLE IF NOT EXISTS psychiatric_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  assessment_type VARCHAR(100) NOT NULL CHECK (assessment_type IN (
    'dsm5', 'icd10', 'mse', 'phq9', 'gad7', 'bdi', 'bai', 'madrs', 'ymrs', 
    'panss', 'hamd', 'hama', 'cgi', 'gaf', 'sofas', 'bprs', 'sans', 'saps',
    'cdi', 'beck_anxiety', 'beck_depression', 'beck_hopelessness', 'beck_suicide',
    'mmpi', 'mmpi2', 'mmpi3', 'pai', 'mapi', 'mapi2', 'mapi3', 'mapi4',
    'wais', 'wisc', 'stanford_binet', 'kaufman', 'woodcock_johnson',
    'memory_tests', 'attention_tests', 'executive_function_tests',
    'personality_tests', 'projective_tests', 'cognitive_tests'
  )),
  assessment_date DATE NOT NULL,
  assessor VARCHAR(255),
  administration_method VARCHAR(50) DEFAULT 'in_person' CHECK (administration_method IN ('in_person', 'telehealth', 'self_report', 'caregiver_report')),
  duration_minutes INTEGER,
  raw_scores JSONB,
  scaled_scores JSONB,
  percentile_scores JSONB,
  t_scores JSONB,
  interpretation TEXT,
  clinical_significance TEXT,
  recommendations TEXT,
  follow_up_date DATE,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DSM-5 diagnostic criteria
CREATE TABLE IF NOT EXISTS dsm5_diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  diagnosis_date DATE NOT NULL,
  primary_diagnosis VARCHAR(255),
  secondary_diagnoses JSONB DEFAULT '[]'::jsonb,
  provisional_diagnoses JSONB DEFAULT '[]'::jsonb,
  differential_diagnoses JSONB DEFAULT '[]'::jsonb,
  diagnostic_criteria JSONB,
  severity_level VARCHAR(50),
  specifiers JSONB DEFAULT '[]'::jsonb,
  comorbidities JSONB DEFAULT '[]'::jsonb,
  ruling_out JSONB DEFAULT '[]'::jsonb,
  clinical_justification TEXT,
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mental Status Examination
CREATE TABLE IF NOT EXISTS mental_status_examinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  examination_date DATE NOT NULL,
  appearance TEXT,
  behavior TEXT,
  mood TEXT,
  affect TEXT,
  speech TEXT,
  thought_process TEXT,
  thought_content TEXT,
  perception TEXT,
  cognition TEXT,
  insight TEXT,
  judgment TEXT,
  impulse_control TEXT,
  risk_assessment TEXT,
  overall_impression TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suicide risk assessments
CREATE TABLE IF NOT EXISTS suicide_risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  assessment_date DATE NOT NULL,
  current_ideation BOOLEAN DEFAULT false,
  ideation_frequency VARCHAR(50),
  ideation_intensity INTEGER CHECK (ideation_intensity >= 1 AND ideation_intensity <= 10),
  plan_exists BOOLEAN DEFAULT false,
  plan_details TEXT,
  means_access BOOLEAN DEFAULT false,
  means_details TEXT,
  intent_level INTEGER CHECK (intent_level >= 1 AND intent_level <= 10),
  protective_factors JSONB DEFAULT '[]'::jsonb,
  risk_factors JSONB DEFAULT '[]'::jsonb,
  previous_attempts INTEGER DEFAULT 0,
  attempt_details TEXT,
  family_history BOOLEAN DEFAULT false,
  family_history_details TEXT,
  risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
  intervention_required BOOLEAN DEFAULT false,
  intervention_type VARCHAR(100),
  safety_plan_created BOOLEAN DEFAULT false,
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Violence risk assessments
CREATE TABLE IF NOT EXISTS violence_risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  assessment_date DATE NOT NULL,
  current_agitation BOOLEAN DEFAULT false,
  agitation_level INTEGER CHECK (agitation_level >= 1 AND agitation_level <= 10),
  verbal_threats BOOLEAN DEFAULT false,
  threat_details TEXT,
  physical_aggression BOOLEAN DEFAULT false,
  aggression_details TEXT,
  target_identification BOOLEAN DEFAULT false,
  target_details TEXT,
  weapon_access BOOLEAN DEFAULT false,
  weapon_details TEXT,
  substance_use BOOLEAN DEFAULT false,
  substance_details TEXT,
  psychotic_symptoms BOOLEAN DEFAULT false,
  psychotic_details TEXT,
  command_hallucinations BOOLEAN DEFAULT false,
  command_details TEXT,
  protective_factors JSONB DEFAULT '[]'::jsonb,
  risk_factors JSONB DEFAULT '[]'::jsonb,
  previous_violence BOOLEAN DEFAULT false,
  violence_history TEXT,
  risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
  intervention_required BOOLEAN DEFAULT false,
  intervention_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Substance use assessments
CREATE TABLE IF NOT EXISTS substance_use_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  assessment_date DATE NOT NULL,
  substances_used JSONB DEFAULT '[]'::jsonb,
  frequency_of_use JSONB,
  quantity_used JSONB,
  route_of_administration JSONB,
  age_of_first_use JSONB,
  longest_period_abstinence JSONB,
  withdrawal_symptoms JSONB DEFAULT '[]'::jsonb,
  tolerance_evidence BOOLEAN DEFAULT false,
  tolerance_details TEXT,
  craving_intensity INTEGER CHECK (craving_intensity >= 1 AND craving_intensity <= 10),
  social_impact TEXT,
  occupational_impact TEXT,
  legal_impact TEXT,
  health_impact TEXT,
  financial_impact TEXT,
  family_impact TEXT,
  asam_level VARCHAR(20),
  readiness_for_change VARCHAR(50),
  treatment_history JSONB DEFAULT '[]'::jsonb,
  relapse_history JSONB DEFAULT '[]'::jsonb,
  risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
  treatment_recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_psychiatric_assessments_client_id ON psychiatric_assessments(client_id);
CREATE INDEX IF NOT EXISTS idx_psychiatric_assessments_clinic_id ON psychiatric_assessments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_psychiatric_assessments_type ON psychiatric_assessments(assessment_type);
CREATE INDEX IF NOT EXISTS idx_psychiatric_assessments_date ON psychiatric_assessments(assessment_date);

CREATE INDEX IF NOT EXISTS idx_dsm5_diagnoses_client_id ON dsm5_diagnoses(client_id);
CREATE INDEX IF NOT EXISTS idx_dsm5_diagnoses_date ON dsm5_diagnoses(diagnosis_date);

CREATE INDEX IF NOT EXISTS idx_mental_status_examinations_client_id ON mental_status_examinations(client_id);
CREATE INDEX IF NOT EXISTS idx_mental_status_examinations_date ON mental_status_examinations(examination_date);

CREATE INDEX IF NOT EXISTS idx_suicide_risk_assessments_client_id ON suicide_risk_assessments(client_id);
CREATE INDEX IF NOT EXISTS idx_suicide_risk_assessments_date ON suicide_risk_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_suicide_risk_assessments_level ON suicide_risk_assessments(risk_level);

CREATE INDEX IF NOT EXISTS idx_violence_risk_assessments_client_id ON violence_risk_assessments(client_id);
CREATE INDEX IF NOT EXISTS idx_violence_risk_assessments_date ON violence_risk_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_violence_risk_assessments_level ON violence_risk_assessments(risk_level);

CREATE INDEX IF NOT EXISTS idx_substance_use_assessments_client_id ON substance_use_assessments(client_id);
CREATE INDEX IF NOT EXISTS idx_substance_use_assessments_date ON substance_use_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_substance_use_assessments_level ON substance_use_assessments(risk_level);

-- Enable RLS
ALTER TABLE psychiatric_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsm5_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE mental_status_examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE suicide_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE violence_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE substance_use_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can only access psychiatric assessments in their clinic" ON psychiatric_assessments
  FOR ALL USING (
    clinic_id = get_user_clinic(auth.uid())
  );

CREATE POLICY "Users can only access DSM-5 diagnoses in their clinic" ON dsm5_diagnoses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = dsm5_diagnoses.client_id 
      AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can only access mental status examinations in their clinic" ON mental_status_examinations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = mental_status_examinations.client_id 
      AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can only access suicide risk assessments in their clinic" ON suicide_risk_assessments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = suicide_risk_assessments.client_id 
      AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can only access violence risk assessments in their clinic" ON violence_risk_assessments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = violence_risk_assessments.client_id 
      AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can only access substance use assessments in their clinic" ON substance_use_assessments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = substance_use_assessments.client_id 
      AND c.owner_id = auth.uid()
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_psychiatric_assessments_updated_at
  BEFORE UPDATE ON psychiatric_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dsm5_diagnoses_updated_at
  BEFORE UPDATE ON dsm5_diagnoses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mental_status_examinations_updated_at
  BEFORE UPDATE ON mental_status_examinations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suicide_risk_assessments_updated_at
  BEFORE UPDATE ON suicide_risk_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_violence_risk_assessments_updated_at
  BEFORE UPDATE ON violence_risk_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_substance_use_assessments_updated_at
  BEFORE UPDATE ON substance_use_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Functions for psychiatric assessments
CREATE OR REPLACE FUNCTION get_client_assessment_history(client_uuid UUID, days_back INTEGER DEFAULT 365)
RETURNS TABLE (
  assessment_id UUID,
  assessment_type VARCHAR(100),
  assessment_date DATE,
  status VARCHAR(20),
  interpretation TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pa.id,
    pa.assessment_type,
    pa.assessment_date,
    pa.status,
    pa.interpretation
  FROM psychiatric_assessments pa
  WHERE pa.client_id = client_uuid
    AND pa.assessment_date >= CURRENT_DATE - INTERVAL '1 day' * days_back
  ORDER BY pa.assessment_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get high-risk clients
CREATE OR REPLACE FUNCTION get_high_risk_clients(clinic_uuid UUID)
RETURNS TABLE (
  client_id UUID,
  client_name VARCHAR(255),
  risk_type VARCHAR(50),
  risk_level VARCHAR(20),
  assessment_date DATE,
  follow_up_required BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.first_name || ' ' || c.last_name as client_name,
    'Suicide Risk' as risk_type,
    sra.risk_level,
    sra.assessment_date,
    sra.intervention_required
  FROM suicide_risk_assessments sra
  JOIN clients c ON sra.client_id = c.id
  WHERE c.clinic_id = clinic_uuid
    AND sra.risk_level IN ('high', 'critical')
    AND sra.assessment_date >= CURRENT_DATE - INTERVAL '7 days'
  
  UNION ALL
  
  SELECT 
    c.id,
    c.first_name || ' ' || c.last_name as client_name,
    'Violence Risk' as risk_type,
    vra.risk_level,
    vra.assessment_date,
    vra.intervention_required
  FROM violence_risk_assessments vra
  JOIN clients c ON vra.client_id = c.id
  WHERE c.clinic_id = clinic_uuid
    AND vra.risk_level IN ('high', 'critical')
    AND vra.assessment_date >= CURRENT_DATE - INTERVAL '7 days'
  
  UNION ALL
  
  SELECT 
    c.id,
    c.first_name || ' ' || c.last_name as client_name,
    'Substance Use Risk' as risk_type,
    sua.risk_level,
    sua.assessment_date,
    false
  FROM substance_use_assessments sua
  JOIN clients c ON sua.client_id = c.id
  WHERE c.clinic_id = clinic_uuid
    AND sua.risk_level IN ('high', 'critical')
    AND sua.assessment_date >= CURRENT_DATE - INTERVAL '7 days'
  
  ORDER BY assessment_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
