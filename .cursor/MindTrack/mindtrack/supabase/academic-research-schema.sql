-- Academic Research and Education Schema
-- Run this after telepsychiatry-schema.sql

-- Research studies
CREATE TABLE IF NOT EXISTS research_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  study_title VARCHAR(500) NOT NULL,
  study_type VARCHAR(100) NOT NULL CHECK (study_type IN (
    'clinical_trial', 'observational', 'case_control', 'cohort', 
    'cross_sectional', 'longitudinal', 'qualitative', 'mixed_methods',
    'systematic_review', 'meta_analysis', 'pilot', 'feasibility'
  )),
  study_status VARCHAR(50) NOT NULL CHECK (study_status IN (
    'planning', 'recruiting', 'active', 'data_collection', 
    'analysis', 'completed', 'published', 'terminated'
  )),
  irb_approval_number VARCHAR(255),
  irb_approval_date DATE,
  irb_expiration_date DATE,
  funding_source VARCHAR(255),
  grant_number VARCHAR(255),
  budget_amount NUMERIC(12,2),
  study_description TEXT,
  research_question TEXT,
  hypothesis TEXT,
  inclusion_criteria JSONB DEFAULT '[]'::jsonb,
  exclusion_criteria JSONB DEFAULT '[]'::jsonb,
  primary_outcomes JSONB DEFAULT '[]'::jsonb,
  secondary_outcomes JSONB DEFAULT '[]'::jsonb,
  study_duration_months INTEGER,
  target_sample_size INTEGER,
  current_sample_size INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  principal_investigator VARCHAR(255),
  co_investigators JSONB DEFAULT '[]'::jsonb,
  research_coordinators JSONB DEFAULT '[]'::jsonb,
  data_collection_methods JSONB DEFAULT '[]'::jsonb,
  statistical_analysis_plan TEXT,
  publication_plan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study participants
CREATE TABLE IF NOT EXISTS study_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES research_studies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  enrollment_date DATE NOT NULL,
  consent_date DATE,
  consent_version VARCHAR(50),
  consent_document_signed BOOLEAN DEFAULT false,
  consent_document_path VARCHAR(500),
  randomization_group VARCHAR(100),
  treatment_arm VARCHAR(100),
  baseline_assessment_date DATE,
  baseline_assessment_completed BOOLEAN DEFAULT false,
  follow_up_schedule JSONB DEFAULT '[]'::jsonb,
  last_follow_up_date DATE,
  next_follow_up_date DATE,
  study_completion_date DATE,
  withdrawal_date DATE,
  withdrawal_reason TEXT,
  adverse_events JSONB DEFAULT '[]'::jsonb,
  protocol_deviations JSONB DEFAULT '[]'::jsonb,
  data_quality_issues JSONB DEFAULT '[]'::jsonb,
  compensation_provided BOOLEAN DEFAULT false,
  compensation_amount NUMERIC(8,2),
  compensation_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Research data collection
CREATE TABLE IF NOT EXISTS research_data_collection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES study_participants(id) ON DELETE CASCADE,
  study_id UUID NOT NULL REFERENCES research_studies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  data_collection_date DATE NOT NULL,
  visit_number INTEGER,
  visit_type VARCHAR(100) CHECK (visit_type IN (
    'screening', 'baseline', 'follow_up', 'end_of_study', 
    'safety_visit', 'efficacy_visit', 'adverse_event'
  )),
  data_collector VARCHAR(255),
  assessment_tools JSONB DEFAULT '[]'::jsonb,
  clinical_measures JSONB DEFAULT '{}'::jsonb,
  laboratory_results JSONB DEFAULT '{}'::jsonb,
  imaging_results JSONB DEFAULT '{}'::jsonb,
  questionnaire_responses JSONB DEFAULT '{}'::jsonb,
  behavioral_observations JSONB DEFAULT '{}'::jsonb,
  adverse_events_reported JSONB DEFAULT '[]'::jsonb,
  protocol_deviations JSONB DEFAULT '[]'::jsonb,
  data_quality_notes TEXT,
  missing_data_reasons JSONB DEFAULT '[]'::jsonb,
  data_entry_completed BOOLEAN DEFAULT false,
  data_verification_completed BOOLEAN DEFAULT false,
  data_verifier VARCHAR(255),
  verification_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Academic publications
CREATE TABLE IF NOT EXISTS academic_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  publication_type VARCHAR(50) NOT NULL CHECK (publication_type IN (
    'journal_article', 'book_chapter', 'conference_presentation', 
    'poster_presentation', 'case_report', 'review_article',
    'editorial', 'letter_to_editor', 'book', 'other'
  )),
  title VARCHAR(500) NOT NULL,
  authors JSONB NOT NULL,
  journal_name VARCHAR(255),
  journal_impact_factor NUMERIC(5,3),
  publication_date DATE,
  volume VARCHAR(50),
  issue VARCHAR(50),
  pages VARCHAR(50),
  doi VARCHAR(255),
  pmid VARCHAR(50),
  abstract TEXT,
  keywords JSONB DEFAULT '[]'::jsonb,
  research_study_id UUID REFERENCES research_studies(id),
  related_studies JSONB DEFAULT '[]'::jsonb,
  citation_count INTEGER DEFAULT 0,
  altmetric_score NUMERIC(8,2),
  open_access BOOLEAN DEFAULT false,
  publication_status VARCHAR(50) DEFAULT 'submitted' CHECK (publication_status IN (
    'submitted', 'under_review', 'revision_requested', 'accepted', 
    'published', 'rejected', 'withdrawn'
  )),
  submission_date DATE,
  acceptance_date DATE,
  rejection_date DATE,
  rejection_reasons TEXT,
  revision_requests JSONB DEFAULT '[]'::jsonb,
  publication_url VARCHAR(500),
  pdf_path VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Continuing medical education
CREATE TABLE IF NOT EXISTS continuing_medical_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  activity_title VARCHAR(500) NOT NULL,
  activity_type VARCHAR(100) NOT NULL CHECK (activity_type IN (
    'conference', 'workshop', 'webinar', 'online_course', 
    'journal_club', 'grand_rounds', 'case_discussion', 'simulation',
    'research_presentation', 'teaching', 'mentoring', 'other'
  )),
  activity_date DATE,
  activity_duration_hours NUMERIC(5,2),
  provider VARCHAR(255),
  accreditation_number VARCHAR(255),
  ama_credits NUMERIC(5,2),
  specialty_credits JSONB DEFAULT '{}'::jsonb,
  learning_objectives JSONB DEFAULT '[]'::jsonb,
  topics_covered JSONB DEFAULT '[]'::jsonb,
  speakers JSONB DEFAULT '[]'::jsonb,
  location VARCHAR(255),
  virtual_platform VARCHAR(100),
  registration_fee NUMERIC(8,2),
  travel_expenses NUMERIC(8,2),
  completion_certificate BOOLEAN DEFAULT false,
  certificate_path VARCHAR(500),
  evaluation_completed BOOLEAN DEFAULT false,
  evaluation_score NUMERIC(3,1),
  evaluation_comments TEXT,
  knowledge_acquired JSONB DEFAULT '[]'::jsonb,
  skills_improved JSONB DEFAULT '[]'::jsonb,
  practice_changes JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teaching and mentoring
CREATE TABLE IF NOT EXISTS teaching_mentoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  activity_type VARCHAR(100) NOT NULL CHECK (activity_type IN (
    'medical_student_teaching', 'resident_supervision', 'fellow_mentoring',
    'nurse_education', 'social_worker_training', 'peer_consultation',
    'community_education', 'patient_education', 'family_education',
    'research_mentoring', 'clinical_teaching', 'other'
  )),
  activity_title VARCHAR(500) NOT NULL,
  activity_date DATE,
  duration_hours NUMERIC(5,2),
  learners JSONB DEFAULT '[]'::jsonb,
  learner_count INTEGER,
  learning_objectives JSONB DEFAULT '[]'::jsonb,
  teaching_methods JSONB DEFAULT '[]'::jsonb,
  topics_covered JSONB DEFAULT '[]'::jsonb,
  assessment_methods JSONB DEFAULT '[]'::jsonb,
  learner_evaluations JSONB DEFAULT '[]'::jsonb,
  average_evaluation_score NUMERIC(3,1),
  feedback_received TEXT,
  improvements_made JSONB DEFAULT '[]'::jsonb,
  research_study_id UUID REFERENCES research_studies(id),
  publication_id UUID REFERENCES academic_publications(id),
  compensation_provided BOOLEAN DEFAULT false,
  compensation_amount NUMERIC(8,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professional development
CREATE TABLE IF NOT EXISTS professional_development (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  development_area VARCHAR(100) NOT NULL CHECK (development_area IN (
    'clinical_skills', 'research_methods', 'teaching_skills', 
    'leadership', 'management', 'technology', 'cultural_competency',
    'ethics', 'quality_improvement', 'patient_safety', 'other'
  )),
  activity_title VARCHAR(500) NOT NULL,
  activity_type VARCHAR(100) NOT NULL CHECK (activity_type IN (
    'training', 'certification', 'workshop', 'conference', 
    'online_course', 'mentoring', 'coaching', 'self_study',
    'project_work', 'committee_work', 'other'
  )),
  start_date DATE,
  completion_date DATE,
  duration_hours NUMERIC(5,2),
  provider VARCHAR(255),
  cost NUMERIC(8,2),
  goals JSONB DEFAULT '[]'::jsonb,
  objectives_achieved JSONB DEFAULT '[]'::jsonb,
  skills_developed JSONB DEFAULT '[]'::jsonb,
  knowledge_gained JSONB DEFAULT '[]'::jsonb,
  impact_on_practice TEXT,
  certification_obtained BOOLEAN DEFAULT false,
  certification_name VARCHAR(255),
  certification_expiry_date DATE,
  continuing_education_credits NUMERIC(5,2),
  evaluation_completed BOOLEAN DEFAULT false,
  evaluation_score NUMERIC(3,1),
  evaluation_feedback TEXT,
  follow_up_actions JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_research_studies_clinic_id ON research_studies(clinic_id);
CREATE INDEX IF NOT EXISTS idx_research_studies_type ON research_studies(study_type);
CREATE INDEX IF NOT EXISTS idx_research_studies_status ON research_studies(study_status);

CREATE INDEX IF NOT EXISTS idx_study_participants_study_id ON study_participants(study_id);
CREATE INDEX IF NOT EXISTS idx_study_participants_client_id ON study_participants(client_id);
CREATE INDEX IF NOT EXISTS idx_study_participants_enrollment_date ON study_participants(enrollment_date);

CREATE INDEX IF NOT EXISTS idx_research_data_collection_participant_id ON research_data_collection(participant_id);
CREATE INDEX IF NOT EXISTS idx_research_data_collection_study_id ON research_data_collection(study_id);
CREATE INDEX IF NOT EXISTS idx_research_data_collection_client_id ON research_data_collection(client_id);
CREATE INDEX IF NOT EXISTS idx_research_data_collection_date ON research_data_collection(data_collection_date);

CREATE INDEX IF NOT EXISTS idx_academic_publications_clinic_id ON academic_publications(clinic_id);
CREATE INDEX IF NOT EXISTS idx_academic_publications_type ON academic_publications(publication_type);
CREATE INDEX IF NOT EXISTS idx_academic_publications_status ON academic_publications(publication_status);
CREATE INDEX IF NOT EXISTS idx_academic_publications_date ON academic_publications(publication_date);

CREATE INDEX IF NOT EXISTS idx_continuing_medical_education_owner_id ON continuing_medical_education(owner_id);
CREATE INDEX IF NOT EXISTS idx_continuing_medical_education_type ON continuing_medical_education(activity_type);
CREATE INDEX IF NOT EXISTS idx_continuing_medical_education_date ON continuing_medical_education(activity_date);

CREATE INDEX IF NOT EXISTS idx_teaching_mentoring_owner_id ON teaching_mentoring(owner_id);
CREATE INDEX IF NOT EXISTS idx_teaching_mentoring_type ON teaching_mentoring(activity_type);
CREATE INDEX IF NOT EXISTS idx_teaching_mentoring_date ON teaching_mentoring(activity_date);

CREATE INDEX IF NOT EXISTS idx_professional_development_owner_id ON professional_development(owner_id);
CREATE INDEX IF NOT EXISTS idx_professional_development_area ON professional_development(development_area);
CREATE INDEX IF NOT EXISTS idx_professional_development_date ON professional_development(start_date);

-- Enable RLS
ALTER TABLE research_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_data_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE continuing_medical_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE teaching_mentoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_development ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can only access research studies in their clinic" ON research_studies
  FOR ALL USING (
    clinic_id = get_user_clinic(auth.uid())
  );

CREATE POLICY "Users can only access study participants in their clinic" ON study_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM research_studies rs 
      WHERE rs.id = study_participants.study_id 
      AND rs.clinic_id = get_user_clinic(auth.uid())
    )
  );

CREATE POLICY "Users can only access research data collection in their clinic" ON research_data_collection
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM research_studies rs 
      WHERE rs.id = research_data_collection.study_id 
      AND rs.clinic_id = get_user_clinic(auth.uid())
    )
  );

CREATE POLICY "Users can only access academic publications in their clinic" ON academic_publications
  FOR ALL USING (
    clinic_id = get_user_clinic(auth.uid())
  );

CREATE POLICY "Users can only access their own CME activities" ON continuing_medical_education
  FOR ALL USING (
    owner_id = auth.uid()
  );

CREATE POLICY "Users can only access their own teaching activities" ON teaching_mentoring
  FOR ALL USING (
    owner_id = auth.uid()
  );

CREATE POLICY "Users can only access their own professional development" ON professional_development
  FOR ALL USING (
    owner_id = auth.uid()
  );

-- Create triggers for updated_at
CREATE TRIGGER update_research_studies_updated_at
  BEFORE UPDATE ON research_studies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_participants_updated_at
  BEFORE UPDATE ON study_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_research_data_collection_updated_at
  BEFORE UPDATE ON research_data_collection
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_academic_publications_updated_at
  BEFORE UPDATE ON academic_publications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_continuing_medical_education_updated_at
  BEFORE UPDATE ON continuing_medical_education
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teaching_mentoring_updated_at
  BEFORE UPDATE ON teaching_mentoring
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professional_development_updated_at
  BEFORE UPDATE ON professional_development
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Functions for academic research
CREATE OR REPLACE FUNCTION get_active_research_studies(clinic_uuid UUID)
RETURNS TABLE (
  study_id UUID,
  study_title VARCHAR(500),
  study_type VARCHAR(100),
  study_status VARCHAR(50),
  target_sample_size INTEGER,
  current_sample_size INTEGER,
  enrollment_rate NUMERIC(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rs.id,
    rs.study_title,
    rs.study_type,
    rs.study_status,
    rs.target_sample_size,
    rs.current_sample_size,
    CASE 
      WHEN rs.target_sample_size > 0 THEN 
        (rs.current_sample_size::NUMERIC / rs.target_sample_size::NUMERIC) * 100
      ELSE 0
    END as enrollment_rate
  FROM research_studies rs
  WHERE rs.clinic_id = clinic_uuid
    AND rs.study_status IN ('recruiting', 'active', 'data_collection')
  ORDER BY rs.start_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get research publications by year
CREATE OR REPLACE FUNCTION get_publications_by_year(clinic_uuid UUID, year_param INTEGER)
RETURNS TABLE (
  publication_id UUID,
  title VARCHAR(500),
  publication_type VARCHAR(50),
  journal_name VARCHAR(255),
  impact_factor NUMERIC(5,3),
  citation_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ap.id,
    ap.title,
    ap.publication_type,
    ap.journal_name,
    ap.journal_impact_factor,
    ap.citation_count
  FROM academic_publications ap
  WHERE ap.clinic_id = clinic_uuid
    AND EXTRACT(YEAR FROM ap.publication_date) = year_param
    AND ap.publication_status = 'published'
  ORDER BY ap.publication_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate CME credits by year
CREATE OR REPLACE FUNCTION calculate_cme_credits_by_year(user_uuid UUID, year_param INTEGER)
RETURNS TABLE (
  total_credits NUMERIC(5,2),
  ama_credits NUMERIC(5,2),
  specialty_credits JSONB,
  activity_count INTEGER
) AS $$
DECLARE
  total_credits_calc NUMERIC(5,2) := 0;
  ama_credits_calc NUMERIC(5,2) := 0;
  specialty_credits_calc JSONB := '{}'::jsonb;
  activity_count_calc INTEGER := 0;
BEGIN
  SELECT 
    COALESCE(SUM(cme.activity_duration_hours), 0),
    COALESCE(SUM(cme.ama_credits), 0),
    COUNT(*)
  INTO total_credits_calc, ama_credits_calc, activity_count_calc
  FROM continuing_medical_education cme
  WHERE cme.owner_id = user_uuid
    AND EXTRACT(YEAR FROM cme.activity_date) = year_param;

  -- Aggregate specialty credits
  SELECT jsonb_object_agg(key, value)
  INTO specialty_credits_calc
  FROM (
    SELECT 
      jsonb_object_keys(specialty_credits) as key,
      SUM((specialty_credits->>jsonb_object_keys(specialty_credits))::NUMERIC) as value
    FROM continuing_medical_education cme,
         jsonb_object_keys(cme.specialty_credits) as specialty_credits
    WHERE cme.owner_id = user_uuid
      AND EXTRACT(YEAR FROM cme.activity_date) = year_param
    GROUP BY jsonb_object_keys(specialty_credits)
  ) as specialty_summary;

  RETURN QUERY SELECT 
    total_credits_calc,
    ama_credits_calc,
    specialty_credits_calc,
    activity_count_calc;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
