-- Psychiatric Genetic Counseling Schema
-- Run this after hospital-integration-schema.sql

-- Family history tracking
CREATE TABLE IF NOT EXISTS family_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  family_member VARCHAR(255) NOT NULL,
  relationship VARCHAR(50) NOT NULL,
  age INTEGER,
  living_status VARCHAR(20) DEFAULT 'living' CHECK (living_status IN ('living', 'deceased', 'unknown')),
  psychiatric_conditions JSONB DEFAULT '[]'::jsonb,
  medical_conditions JSONB DEFAULT '[]'::jsonb,
  substance_use_disorders JSONB DEFAULT '[]'::jsonb,
  suicide_attempts INTEGER DEFAULT 0,
  suicide_completions INTEGER DEFAULT 0,
  age_of_onset JSONB,
  treatment_history JSONB DEFAULT '[]'::jsonb,
  genetic_testing_completed BOOLEAN DEFAULT false,
  genetic_test_results JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Genetic counseling sessions
CREATE TABLE IF NOT EXISTS genetic_counseling_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  session_date DATE NOT NULL,
  session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('initial', 'follow_up', 'results_disclosure', 'family_session')),
  counselor_name VARCHAR(255),
  session_duration_minutes INTEGER,
  session_format VARCHAR(50) DEFAULT 'in_person' CHECK (session_format IN ('in_person', 'telehealth', 'phone')),
  family_members_present JSONB DEFAULT '[]'::jsonb,
  session_summary TEXT,
  genetic_risks_discussed JSONB DEFAULT '[]'::jsonb,
  testing_recommendations JSONB DEFAULT '[]'::jsonb,
  family_planning_discussed BOOLEAN DEFAULT false,
  family_planning_details TEXT,
  informed_consent_obtained BOOLEAN DEFAULT false,
  consent_details TEXT,
  follow_up_plan TEXT,
  next_session_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Genetic risk assessments
CREATE TABLE IF NOT EXISTS genetic_risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  assessment_date DATE NOT NULL,
  risk_category VARCHAR(50) NOT NULL CHECK (risk_category IN ('schizophrenia', 'bipolar_disorder', 'major_depression', 'autism', 'adhd', 'anxiety_disorders', 'substance_use', 'suicide', 'other')),
  risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'very_high')),
  family_history_score INTEGER CHECK (family_history_score >= 0 AND family_history_score <= 10),
  genetic_variants JSONB DEFAULT '[]'::jsonb,
  environmental_factors JSONB DEFAULT '[]'::jsonb,
  protective_factors JSONB DEFAULT '[]'::jsonb,
  risk_factors JSONB DEFAULT '[]'::jsonb,
  probability_estimate NUMERIC(5,2),
  confidence_interval JSONB,
  clinical_recommendations TEXT,
  prevention_strategies TEXT,
  monitoring_recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Genetic testing orders
CREATE TABLE IF NOT EXISTS genetic_testing_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  order_date DATE NOT NULL,
  test_type VARCHAR(100) NOT NULL CHECK (test_type IN (
    'psychiatric_panel', 'schizophrenia_panel', 'bipolar_panel', 'depression_panel',
    'autism_panel', 'adhd_panel', 'anxiety_panel', 'substance_use_panel',
    'pharmacogenomic_panel', 'whole_exome', 'whole_genome', 'custom_panel'
  )),
  testing_lab VARCHAR(255),
  test_description TEXT,
  clinical_indication TEXT,
  insurance_coverage BOOLEAN DEFAULT false,
  insurance_provider VARCHAR(255),
  authorization_number VARCHAR(255),
  out_of_pocket_cost NUMERIC(10,2),
  sample_collection_date DATE,
  sample_type VARCHAR(50) DEFAULT 'saliva' CHECK (sample_type IN ('saliva', 'blood', 'buccal', 'other')),
  expected_results_date DATE,
  status VARCHAR(20) DEFAULT 'ordered' CHECK (status IN ('ordered', 'sample_collected', 'in_progress', 'completed', 'cancelled', 'failed')),
  results_received_date DATE,
  results_summary TEXT,
  clinical_interpretation TEXT,
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Genetic variants and phenotypes
CREATE TABLE IF NOT EXISTS genetic_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  variant_id VARCHAR(255),
  gene_name VARCHAR(100),
  chromosome VARCHAR(10),
  position INTEGER,
  reference_allele VARCHAR(10),
  alternate_allele VARCHAR(10),
  variant_type VARCHAR(50),
  clinical_significance VARCHAR(50) CHECK (clinical_significance IN ('pathogenic', 'likely_pathogenic', 'uncertain_significance', 'likely_benign', 'benign')),
  psychiatric_implications TEXT,
  penetrance NUMERIC(5,2),
  odds_ratio NUMERIC(8,4),
  confidence_interval JSONB,
  population_frequency NUMERIC(8,6),
  inheritance_pattern VARCHAR(50),
  associated_conditions JSONB DEFAULT '[]'::jsonb,
  drug_response_implications TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family communication plans
CREATE TABLE IF NOT EXISTS family_communication_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  plan_date DATE NOT NULL,
  genetic_findings_summary TEXT,
  family_members_to_notify JSONB DEFAULT '[]'::jsonb,
  communication_method VARCHAR(50) CHECK (communication_method IN ('in_person', 'phone', 'video', 'letter', 'email')),
  communication_timeline TEXT,
  information_to_share TEXT,
  information_to_withhold TEXT,
  support_resources JSONB DEFAULT '[]'::jsonb,
  potential_reactions JSONB DEFAULT '[]'::jsonb,
  coping_strategies TEXT,
  follow_up_plan TEXT,
  consent_for_family_contact BOOLEAN DEFAULT false,
  family_contact_details JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reproductive planning
CREATE TABLE IF NOT EXISTS reproductive_planning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  planning_date DATE NOT NULL,
  reproductive_goals TEXT,
  genetic_risks_assessed JSONB DEFAULT '[]'::jsonb,
  risk_mitigation_strategies JSONB DEFAULT '[]'::jsonb,
  preconception_counseling BOOLEAN DEFAULT false,
  preconception_recommendations TEXT,
  prenatal_testing_options JSONB DEFAULT '[]'::jsonb,
  prenatal_testing_recommendations TEXT,
  assisted_reproductive_technologies JSONB DEFAULT '[]'::jsonb,
  adoption_considerations TEXT,
  family_planning_timeline TEXT,
  partner_genetic_testing BOOLEAN DEFAULT false,
  partner_testing_recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_family_history_client_id ON family_history(client_id);
CREATE INDEX IF NOT EXISTS idx_family_history_relationship ON family_history(relationship);

CREATE INDEX IF NOT EXISTS idx_genetic_counseling_sessions_client_id ON genetic_counseling_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_genetic_counseling_sessions_clinic_id ON genetic_counseling_sessions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_genetic_counseling_sessions_date ON genetic_counseling_sessions(session_date);

CREATE INDEX IF NOT EXISTS idx_genetic_risk_assessments_client_id ON genetic_risk_assessments(client_id);
CREATE INDEX IF NOT EXISTS idx_genetic_risk_assessments_category ON genetic_risk_assessments(risk_category);
CREATE INDEX IF NOT EXISTS idx_genetic_risk_assessments_level ON genetic_risk_assessments(risk_level);

CREATE INDEX IF NOT EXISTS idx_genetic_testing_orders_client_id ON genetic_testing_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_genetic_testing_orders_clinic_id ON genetic_testing_orders(clinic_id);
CREATE INDEX IF NOT EXISTS idx_genetic_testing_orders_date ON genetic_testing_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_genetic_testing_orders_status ON genetic_testing_orders(status);

CREATE INDEX IF NOT EXISTS idx_genetic_variants_client_id ON genetic_variants(client_id);
CREATE INDEX IF NOT EXISTS idx_genetic_variants_gene ON genetic_variants(gene_name);
CREATE INDEX IF NOT EXISTS idx_genetic_variants_significance ON genetic_variants(clinical_significance);

CREATE INDEX IF NOT EXISTS idx_family_communication_plans_client_id ON family_communication_plans(client_id);
CREATE INDEX IF NOT EXISTS idx_family_communication_plans_date ON family_communication_plans(plan_date);

CREATE INDEX IF NOT EXISTS idx_reproductive_planning_client_id ON reproductive_planning(client_id);
CREATE INDEX IF NOT EXISTS idx_reproductive_planning_date ON reproductive_planning(planning_date);

-- Enable RLS
ALTER TABLE family_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE genetic_counseling_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE genetic_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE genetic_testing_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE genetic_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_communication_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reproductive_planning ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can only access family history in their clinic" ON family_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = family_history.client_id 
      AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can only access genetic counseling sessions in their clinic" ON genetic_counseling_sessions
  FOR ALL USING (
    clinic_id = get_user_clinic(auth.uid())
  );

CREATE POLICY "Users can only access genetic risk assessments in their clinic" ON genetic_risk_assessments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = genetic_risk_assessments.client_id 
      AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can only access genetic testing orders in their clinic" ON genetic_testing_orders
  FOR ALL USING (
    clinic_id = get_user_clinic(auth.uid())
  );

CREATE POLICY "Users can only access genetic variants in their clinic" ON genetic_variants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = genetic_variants.client_id 
      AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can only access family communication plans in their clinic" ON family_communication_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = family_communication_plans.client_id 
      AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can only access reproductive planning in their clinic" ON reproductive_planning
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = reproductive_planning.client_id 
      AND c.owner_id = auth.uid()
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_family_history_updated_at
  BEFORE UPDATE ON family_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_genetic_counseling_sessions_updated_at
  BEFORE UPDATE ON genetic_counseling_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_genetic_risk_assessments_updated_at
  BEFORE UPDATE ON genetic_risk_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_genetic_testing_orders_updated_at
  BEFORE UPDATE ON genetic_testing_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_genetic_variants_updated_at
  BEFORE UPDATE ON genetic_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_communication_plans_updated_at
  BEFORE UPDATE ON family_communication_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reproductive_planning_updated_at
  BEFORE UPDATE ON reproductive_planning
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Functions for genetic counseling
CREATE OR REPLACE FUNCTION get_family_psychiatric_history(client_uuid UUID)
RETURNS TABLE (
  family_member VARCHAR(255),
  relationship VARCHAR(50),
  conditions JSONB,
  suicide_attempts INTEGER,
  suicide_completions INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fh.family_member,
    fh.relationship,
    fh.psychiatric_conditions,
    fh.suicide_attempts,
    fh.suicide_completions
  FROM family_history fh
  WHERE fh.client_id = client_uuid
    AND (fh.psychiatric_conditions != '[]'::jsonb OR fh.suicide_attempts > 0 OR fh.suicide_completions > 0)
  ORDER BY fh.relationship, fh.family_member;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate genetic risk score
CREATE OR REPLACE FUNCTION calculate_genetic_risk_score(client_uuid UUID, condition VARCHAR(50))
RETURNS TABLE (
  risk_score NUMERIC,
  risk_level VARCHAR(20),
  contributing_factors JSONB
) AS $$
DECLARE
  family_score INTEGER := 0;
  genetic_score NUMERIC := 0;
  environmental_score NUMERIC := 0;
  total_score NUMERIC := 0;
  risk_level VARCHAR(20);
  factors JSONB := '[]'::jsonb;
BEGIN
  -- Calculate family history score
  SELECT COALESCE(SUM(
    CASE 
      WHEN fh.relationship = 'parent' THEN 3
      WHEN fh.relationship = 'sibling' THEN 2
      WHEN fh.relationship = 'grandparent' THEN 1
      ELSE 0
    END
  ), 0) INTO family_score
  FROM family_history fh
  WHERE fh.client_id = client_uuid
    AND fh.psychiatric_conditions ? condition;

  -- Calculate genetic variant score
  SELECT COALESCE(SUM(gv.odds_ratio), 0) INTO genetic_score
  FROM genetic_variants gv
  WHERE gv.client_id = client_uuid
    AND gv.associated_conditions ? condition;

  -- Calculate total score
  total_score := (family_score * 0.4) + (genetic_score * 0.4) + (environmental_score * 0.2);

  -- Determine risk level
  IF total_score >= 8 THEN
    risk_level := 'very_high';
  ELSIF total_score >= 6 THEN
    risk_level := 'high';
  ELSIF total_score >= 4 THEN
    risk_level := 'moderate';
  ELSE
    risk_level := 'low';
  END IF;

  -- Build contributing factors
  factors := jsonb_build_object(
    'family_history_score', family_score,
    'genetic_variant_score', genetic_score,
    'environmental_score', environmental_score
  );

  RETURN QUERY SELECT total_score, risk_level, factors;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
