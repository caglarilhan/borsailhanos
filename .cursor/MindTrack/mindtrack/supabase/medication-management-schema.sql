-- Medication Management & Pharmacogenomics Schema
-- Run this after assessments-schema.sql

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  medication_name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255),
  dosage VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  route VARCHAR(50) DEFAULT 'oral',
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'discontinued', 'completed', 'on-hold')),
  dea_number VARCHAR(20),
  refills_remaining INTEGER DEFAULT 0,
  instructions TEXT,
  side_effects JSONB DEFAULT '[]'::jsonb,
  drug_interactions JSONB DEFAULT '[]'::jsonb,
  allergies JSONB DEFAULT '[]'::jsonb,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication titration tracking
CREATE TABLE IF NOT EXISTS medication_titrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  titration_date DATE NOT NULL,
  old_dosage VARCHAR(100),
  new_dosage VARCHAR(100) NOT NULL,
  reason TEXT,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 10),
  side_effects_rating INTEGER CHECK (side_effects_rating >= 1 AND side_effects_rating <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Side effects tracking
CREATE TABLE IF NOT EXISTS medication_side_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  side_effect_name VARCHAR(255) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe', 'life-threatening')),
  onset_date DATE NOT NULL,
  resolution_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'improving')),
  action_taken TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pharmacogenomic test results
CREATE TABLE IF NOT EXISTS pharmacogenomic_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  test_name VARCHAR(255) NOT NULL,
  test_date DATE NOT NULL,
  lab_name VARCHAR(255),
  test_results JSONB NOT NULL,
  interpretation TEXT,
  recommendations JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('ordered', 'in-progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Genetic markers for drug metabolism
CREATE TABLE IF NOT EXISTS genetic_markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  gene_name VARCHAR(100) NOT NULL,
  variant VARCHAR(100),
  phenotype VARCHAR(100),
  metabolizer_status VARCHAR(50),
  clinical_significance TEXT,
  drug_recommendations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Therapeutic drug monitoring
CREATE TABLE IF NOT EXISTS drug_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  test_date DATE NOT NULL,
  drug_level NUMERIC(6,2),
  unit VARCHAR(20),
  therapeutic_range_min NUMERIC(6,2),
  therapeutic_range_max NUMERIC(6,2),
  toxic_range_min NUMERIC(6,2),
  toxic_range_max NUMERIC(6,2),
  interpretation VARCHAR(50),
  recommendations TEXT,
  lab_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication adherence tracking
CREATE TABLE IF NOT EXISTS medication_adherence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  adherence_date DATE NOT NULL,
  taken BOOLEAN DEFAULT true,
  dose_taken VARCHAR(100),
  time_taken TIME,
  reason_missed TEXT,
  side_effects_noted TEXT,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medications_client_id ON medications(client_id);
CREATE INDEX IF NOT EXISTS idx_medications_clinic_id ON medications(clinic_id);
CREATE INDEX IF NOT EXISTS idx_medications_owner_id ON medications(owner_id);
CREATE INDEX IF NOT EXISTS idx_medications_status ON medications(status);
CREATE INDEX IF NOT EXISTS idx_medications_start_date ON medications(start_date);

CREATE INDEX IF NOT EXISTS idx_medication_titrations_medication_id ON medication_titrations(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_titrations_client_id ON medication_titrations(client_id);
CREATE INDEX IF NOT EXISTS idx_medication_titrations_date ON medication_titrations(titration_date);

CREATE INDEX IF NOT EXISTS idx_medication_side_effects_medication_id ON medication_side_effects(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_side_effects_client_id ON medication_side_effects(client_id);
CREATE INDEX IF NOT EXISTS idx_medication_side_effects_status ON medication_side_effects(status);

CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_tests_client_id ON pharmacogenomic_tests(client_id);
CREATE INDEX IF NOT EXISTS idx_pharmacogenomic_tests_date ON pharmacogenomic_tests(test_date);

CREATE INDEX IF NOT EXISTS idx_genetic_markers_client_id ON genetic_markers(client_id);
CREATE INDEX IF NOT EXISTS idx_genetic_markers_gene ON genetic_markers(gene_name);

CREATE INDEX IF NOT EXISTS idx_drug_levels_medication_id ON drug_levels(medication_id);
CREATE INDEX IF NOT EXISTS idx_drug_levels_client_id ON drug_levels(client_id);
CREATE INDEX IF NOT EXISTS idx_drug_levels_date ON drug_levels(test_date);

CREATE INDEX IF NOT EXISTS idx_medication_adherence_medication_id ON medication_adherence(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_adherence_client_id ON medication_adherence(client_id);
CREATE INDEX IF NOT EXISTS idx_medication_adherence_date ON medication_adherence(adherence_date);

-- Enable RLS
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_titrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_side_effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacogenomic_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE genetic_markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_adherence ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can only access medications in their clinic" ON medications
  FOR ALL USING (
    clinic_id = get_user_clinic(auth.uid())
  );

CREATE POLICY "Users can only access medication titrations in their clinic" ON medication_titrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM medications m 
      WHERE m.id = medication_titrations.medication_id 
      AND m.clinic_id = get_user_clinic(auth.uid())
    )
  );

CREATE POLICY "Users can only access medication side effects in their clinic" ON medication_side_effects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM medications m 
      WHERE m.id = medication_side_effects.medication_id 
      AND m.clinic_id = get_user_clinic(auth.uid())
    )
  );

CREATE POLICY "Users can only access pharmacogenomic tests in their clinic" ON pharmacogenomic_tests
  FOR ALL USING (
    clinic_id = get_user_clinic(auth.uid())
  );

CREATE POLICY "Users can only access genetic markers in their clinic" ON genetic_markers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = genetic_markers.client_id 
      AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can only access drug levels in their clinic" ON drug_levels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM medications m 
      WHERE m.id = drug_levels.medication_id 
      AND m.clinic_id = get_user_clinic(auth.uid())
    )
  );

CREATE POLICY "Users can only access medication adherence in their clinic" ON medication_adherence
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM medications m 
      WHERE m.id = medication_adherence.medication_id 
      AND m.clinic_id = get_user_clinic(auth.uid())
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medication_side_effects_updated_at
  BEFORE UPDATE ON medication_side_effects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pharmacogenomic_tests_updated_at
  BEFORE UPDATE ON pharmacogenomic_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Functions for medication management
CREATE OR REPLACE FUNCTION get_client_medication_history(client_uuid UUID)
RETURNS TABLE (
  medication_id UUID,
  medication_name VARCHAR(255),
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  start_date DATE,
  end_date DATE,
  status VARCHAR(20),
  effectiveness_rating INTEGER,
  side_effects_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.medication_name,
    m.dosage,
    m.frequency,
    m.start_date,
    m.end_date,
    m.status,
    mt.effectiveness_rating,
    COUNT(mse.id)::INTEGER as side_effects_count
  FROM medications m
  LEFT JOIN medication_titrations mt ON m.id = mt.medication_id
  LEFT JOIN medication_side_effects mse ON m.id = mse.medication_id
  WHERE m.client_id = client_uuid
  GROUP BY m.id, mt.effectiveness_rating
  ORDER BY m.start_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get medication adherence rate
CREATE OR REPLACE FUNCTION get_medication_adherence_rate(client_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  medication_name VARCHAR(255),
  adherence_rate NUMERIC,
  total_doses INTEGER,
  missed_doses INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.medication_name,
    (COUNT(CASE WHEN ma.taken THEN 1 END) * 100.0 / COUNT(*))::NUMERIC as adherence_rate,
    COUNT(*)::INTEGER as total_doses,
    COUNT(CASE WHEN NOT ma.taken THEN 1 END)::INTEGER as missed_doses
  FROM medications m
  JOIN medication_adherence ma ON m.id = ma.medication_id
  WHERE m.client_id = client_uuid
    AND ma.adherence_date >= CURRENT_DATE - INTERVAL '1 day' * days_back
  GROUP BY m.id, m.medication_name
  ORDER BY adherence_rate DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
