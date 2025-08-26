-- Outcome Tracking & Assessments Schema
-- Run this after clinic-schema.sql

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('phq9', 'gad7', 'bdi', 'bai', 'custom')),
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  severity VARCHAR(30) NOT NULL CHECK (severity IN ('minimal', 'mild', 'moderate', 'moderately_severe', 'severe')),
  answers JSONB NOT NULL, -- Store assessment answers as JSON
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessment templates table (for custom assessments)
CREATE TABLE IF NOT EXISTS assessment_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  questions JSONB NOT NULL, -- Store questions as JSON
  scoring JSONB NOT NULL, -- Store scoring rules as JSON
  severity_levels JSONB NOT NULL, -- Store severity levels as JSON
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessments_client_id ON assessments(client_id);
CREATE INDEX IF NOT EXISTS idx_assessments_clinic_id ON assessments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_assessments_owner_id ON assessments(owner_id);
CREATE INDEX IF NOT EXISTS idx_assessments_type ON assessments(type);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at);
CREATE INDEX IF NOT EXISTS idx_assessment_templates_clinic_id ON assessment_templates(clinic_id);
CREATE INDEX IF NOT EXISTS idx_assessment_templates_owner_id ON assessment_templates(owner_id);

-- Enable RLS
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assessments
CREATE POLICY "Users can only access assessments in their clinic" ON assessments
  FOR ALL USING (
    clinic_id = get_user_clinic(auth.uid())
  );

-- RLS Policies for assessment_templates
CREATE POLICY "Users can only access assessment templates in their clinic" ON assessment_templates
  FOR ALL USING (
    clinic_id = get_user_clinic(auth.uid())
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_templates_updated_at
  BEFORE UPDATE ON assessment_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get client assessment history
CREATE OR REPLACE FUNCTION get_client_assessment_history(client_uuid UUID)
RETURNS TABLE (
  assessment_id UUID,
  assessment_type VARCHAR(20),
  score INTEGER,
  max_score INTEGER,
  severity VARCHAR(30),
  created_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.type,
    a.score,
    a.max_score,
    a.severity,
    a.created_at
  FROM assessments a
  WHERE a.client_id = client_uuid
  ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get clinic assessment statistics
CREATE OR REPLACE FUNCTION get_clinic_assessment_stats(clinic_uuid UUID)
RETURNS TABLE (
  total_assessments BIGINT,
  avg_score NUMERIC,
  most_common_type VARCHAR(20),
  most_common_severity VARCHAR(30)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_assessments,
    AVG(score)::NUMERIC as avg_score,
    MODE() WITHIN GROUP (ORDER BY type) as most_common_type,
    MODE() WITHIN GROUP (ORDER BY severity) as most_common_severity
  FROM assessments
  WHERE clinic_id = clinic_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
