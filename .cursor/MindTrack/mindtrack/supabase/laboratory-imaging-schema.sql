-- Laboratory Tests & Brain Imaging Schema
-- Run this after medication-management-schema.sql

-- Laboratory tests table
CREATE TABLE IF NOT EXISTS laboratory_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  test_name VARCHAR(255) NOT NULL,
  test_category VARCHAR(100) NOT NULL,
  test_date DATE NOT NULL,
  lab_name VARCHAR(255),
  ordering_provider VARCHAR(255),
  status VARCHAR(20) DEFAULT 'ordered' CHECK (status IN ('ordered', 'in-progress', 'completed', 'cancelled', 'abnormal')),
  results JSONB NOT NULL,
  reference_ranges JSONB,
  interpretation TEXT,
  clinical_significance TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Psychiatric-specific lab tests
CREATE TABLE IF NOT EXISTS psychiatric_lab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_test_id UUID NOT NULL REFERENCES laboratory_tests(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  test_type VARCHAR(100) NOT NULL CHECK (test_type IN ('lithium', 'depakote', 'lamictal', 'metabolic_panel', 'thyroid', 'hormone', 'drug_screen', 'genetic')),
  medication_related BOOLEAN DEFAULT false,
  medication_name VARCHAR(255),
  therapeutic_range_min NUMERIC(8,2),
  therapeutic_range_max NUMERIC(8,2),
  toxic_range_min NUMERIC(8,2),
  toxic_range_max NUMERIC(8,2),
  result_value NUMERIC(8,2),
  unit VARCHAR(20),
  is_abnormal BOOLEAN DEFAULT false,
  abnormality_type VARCHAR(50),
  clinical_action TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brain imaging studies
CREATE TABLE IF NOT EXISTS brain_imaging (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  imaging_type VARCHAR(50) NOT NULL CHECK (imaging_type IN ('mri', 'ct', 'pet', 'spect', 'eeg', 'fmri', 'dti')),
  study_date DATE NOT NULL,
  facility_name VARCHAR(255),
  radiologist VARCHAR(255),
  ordering_provider VARCHAR(255),
  clinical_indication TEXT,
  technique TEXT,
  findings TEXT,
  impression TEXT,
  recommendations TEXT,
  status VARCHAR(20) DEFAULT 'ordered' CHECK (status IN ('ordered', 'in-progress', 'completed', 'cancelled')),
  report_url TEXT,
  images_url TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Neuropsychological assessments
CREATE TABLE IF NOT EXISTS neuropsychological_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  assessment_date DATE NOT NULL,
  assessor VARCHAR(255),
  referral_reason TEXT,
  clinical_history TEXT,
  test_battery JSONB NOT NULL,
  results JSONB NOT NULL,
  interpretation TEXT,
  recommendations TEXT,
  follow_up_date DATE,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cognitive domains assessment
CREATE TABLE IF NOT EXISTS cognitive_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neuropsych_assessment_id UUID NOT NULL REFERENCES neuropsychological_assessments(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  domain_name VARCHAR(100) NOT NULL CHECK (domain_name IN ('memory', 'attention', 'executive_function', 'language', 'visuospatial', 'processing_speed')),
  test_name VARCHAR(255),
  raw_score NUMERIC(8,2),
  scaled_score NUMERIC(8,2),
  percentile INTEGER,
  t_score NUMERIC(8,2),
  interpretation VARCHAR(50),
  clinical_significance TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency psychiatry and crisis intervention
CREATE TABLE IF NOT EXISTS crisis_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  crisis_date TIMESTAMP WITH TIME ZONE NOT NULL,
  crisis_type VARCHAR(50) NOT NULL CHECK (crisis_type IN ('suicide_risk', 'violence_risk', 'psychosis', 'mania', 'severe_depression', 'substance_abuse', 'other')),
  risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
  presenting_problem TEXT,
  risk_factors JSONB,
  protective_factors JSONB,
  intervention_provided TEXT,
  safety_plan TEXT,
  disposition VARCHAR(100),
  follow_up_required BOOLEAN DEFAULT true,
  follow_up_date DATE,
  emergency_contact_notified BOOLEAN DEFAULT false,
  police_involved BOOLEAN DEFAULT false,
  hospitalization_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Safety plans
CREATE TABLE IF NOT EXISTS safety_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  crisis_intervention_id UUID REFERENCES crisis_interventions(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  plan_date DATE NOT NULL,
  triggers JSONB,
  warning_signs JSONB,
  coping_strategies JSONB,
  emergency_contacts JSONB,
  professional_contacts JSONB,
  crisis_resources JSONB,
  safety_measures TEXT,
  review_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_laboratory_tests_client_id ON laboratory_tests(client_id);
CREATE INDEX IF NOT EXISTS idx_laboratory_tests_clinic_id ON laboratory_tests(clinic_id);
CREATE INDEX IF NOT EXISTS idx_laboratory_tests_date ON laboratory_tests(test_date);
CREATE INDEX IF NOT EXISTS idx_laboratory_tests_status ON laboratory_tests(status);

CREATE INDEX IF NOT EXISTS idx_psychiatric_lab_tests_lab_test_id ON psychiatric_lab_tests(lab_test_id);
CREATE INDEX IF NOT EXISTS idx_psychiatric_lab_tests_client_id ON psychiatric_lab_tests(client_id);
CREATE INDEX IF NOT EXISTS idx_psychiatric_lab_tests_type ON psychiatric_lab_tests(test_type);

CREATE INDEX IF NOT EXISTS idx_brain_imaging_client_id ON brain_imaging(client_id);
CREATE INDEX IF NOT EXISTS idx_brain_imaging_clinic_id ON brain_imaging(clinic_id);
CREATE INDEX IF NOT EXISTS idx_brain_imaging_date ON brain_imaging(study_date);
CREATE INDEX IF NOT EXISTS idx_brain_imaging_type ON brain_imaging(imaging_type);

CREATE INDEX IF NOT EXISTS idx_neuropsychological_assessments_client_id ON neuropsychological_assessments(client_id);
CREATE INDEX IF NOT EXISTS idx_neuropsychological_assessments_clinic_id ON neuropsychological_assessments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_neuropsychological_assessments_date ON neuropsychological_assessments(assessment_date);

CREATE INDEX IF NOT EXISTS idx_cognitive_domains_assessment_id ON cognitive_domains(neuropsych_assessment_id);
CREATE INDEX IF NOT EXISTS idx_cognitive_domains_client_id ON cognitive_domains(client_id);
CREATE INDEX IF NOT EXISTS idx_cognitive_domains_domain ON cognitive_domains(domain_name);

CREATE INDEX IF NOT EXISTS idx_crisis_interventions_client_id ON crisis_interventions(client_id);
CREATE INDEX IF NOT EXISTS idx_crisis_interventions_clinic_id ON crisis_interventions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_crisis_interventions_date ON crisis_interventions(crisis_date);
CREATE INDEX IF NOT EXISTS idx_crisis_interventions_type ON crisis_interventions(crisis_type);
CREATE INDEX IF NOT EXISTS idx_crisis_interventions_risk ON crisis_interventions(risk_level);

CREATE INDEX IF NOT EXISTS idx_safety_plans_client_id ON safety_plans(client_id);
CREATE INDEX IF NOT EXISTS idx_safety_plans_date ON safety_plans(plan_date);
CREATE INDEX IF NOT EXISTS idx_safety_plans_status ON safety_plans(status);

-- Enable RLS
ALTER TABLE laboratory_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychiatric_lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE brain_imaging ENABLE ROW LEVEL SECURITY;
ALTER TABLE neuropsychological_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cognitive_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can only access laboratory tests in their clinic" ON laboratory_tests
  FOR ALL USING (
    clinic_id = get_user_clinic(auth.uid())
  );

CREATE POLICY "Users can only access psychiatric lab tests in their clinic" ON psychiatric_lab_tests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM laboratory_tests lt 
      WHERE lt.id = psychiatric_lab_tests.lab_test_id 
      AND lt.clinic_id = get_user_clinic(auth.uid())
    )
  );

CREATE POLICY "Users can only access brain imaging in their clinic" ON brain_imaging
  FOR ALL USING (
    clinic_id = get_user_clinic(auth.uid())
  );

CREATE POLICY "Users can only access neuropsychological assessments in their clinic" ON neuropsychological_assessments
  FOR ALL USING (
    clinic_id = get_user_clinic(auth.uid())
  );

CREATE POLICY "Users can only access cognitive domains in their clinic" ON cognitive_domains
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM neuropsychological_assessments na 
      WHERE na.id = cognitive_domains.neuropsych_assessment_id 
      AND na.clinic_id = get_user_clinic(auth.uid())
    )
  );

CREATE POLICY "Users can only access crisis interventions in their clinic" ON crisis_interventions
  FOR ALL USING (
    clinic_id = get_user_clinic(auth.uid())
  );

CREATE POLICY "Users can only access safety plans in their clinic" ON safety_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = safety_plans.client_id 
      AND c.owner_id = auth.uid()
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_laboratory_tests_updated_at
  BEFORE UPDATE ON laboratory_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brain_imaging_updated_at
  BEFORE UPDATE ON brain_imaging
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_neuropsychological_assessments_updated_at
  BEFORE UPDATE ON neuropsychological_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crisis_interventions_updated_at
  BEFORE UPDATE ON crisis_interventions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_safety_plans_updated_at
  BEFORE UPDATE ON safety_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Functions for lab and imaging management
CREATE OR REPLACE FUNCTION get_client_lab_history(client_uuid UUID, days_back INTEGER DEFAULT 365)
RETURNS TABLE (
  test_id UUID,
  test_name VARCHAR(255),
  test_date DATE,
  status VARCHAR(20),
  is_abnormal BOOLEAN,
  follow_up_required BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lt.id,
    lt.test_name,
    lt.test_date,
    lt.status,
    plt.is_abnormal,
    lt.follow_up_required
  FROM laboratory_tests lt
  LEFT JOIN psychiatric_lab_tests plt ON lt.id = plt.lab_test_id
  WHERE lt.client_id = client_uuid
    AND lt.test_date >= CURRENT_DATE - INTERVAL '1 day' * days_back
  ORDER BY lt.test_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get abnormal lab results
CREATE OR REPLACE FUNCTION get_abnormal_lab_results(client_uuid UUID)
RETURNS TABLE (
  test_name VARCHAR(255),
  test_date DATE,
  result_value NUMERIC(8,2),
  unit VARCHAR(20),
  abnormality_type VARCHAR(50),
  clinical_action TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    plt.test_type,
    lt.test_date,
    plt.result_value,
    plt.unit,
    plt.abnormality_type,
    plt.clinical_action
  FROM psychiatric_lab_tests plt
  JOIN laboratory_tests lt ON plt.lab_test_id = lt.id
  WHERE lt.client_id = client_uuid
    AND plt.is_abnormal = true
  ORDER BY lt.test_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get crisis intervention history
CREATE OR REPLACE FUNCTION get_crisis_intervention_history(client_uuid UUID, days_back INTEGER DEFAULT 365)
RETURNS TABLE (
  crisis_id UUID,
  crisis_type VARCHAR(50),
  crisis_date TIMESTAMP WITH TIME ZONE,
  risk_level VARCHAR(20),
  disposition VARCHAR(100),
  hospitalization_required BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ci.id,
    ci.crisis_type,
    ci.crisis_date,
    ci.risk_level,
    ci.disposition,
    ci.hospitalization_required
  FROM crisis_interventions ci
  WHERE ci.client_id = client_uuid
    AND ci.crisis_date >= CURRENT_TIMESTAMP - INTERVAL '1 day' * days_back
  ORDER BY ci.crisis_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
