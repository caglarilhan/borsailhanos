-- Psychiatry & Psychology Specialized Schema
-- Medication management, therapy tools, provider type separation

-- Provider Types Table
CREATE TABLE IF NOT EXISTS provider_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('psychiatrist', 'psychologist')),
    specialization VARCHAR(100) DEFAULT NULL,
    license_number VARCHAR(100) DEFAULT NULL,
    license_state VARCHAR(50) DEFAULT NULL,
    license_expiry DATE DEFAULT NULL,
    board_certified BOOLEAN DEFAULT false,
    certifications TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Patient Medications Table (Psychiatry)
CREATE TABLE IF NOT EXISTS patient_medications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255) DEFAULT NULL,
    brand_name VARCHAR(255) DEFAULT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) DEFAULT NULL,
    instructions TEXT DEFAULT NULL,
    start_date DATE NOT NULL,
    end_date DATE DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'discontinued', 'completed')),
    side_effects TEXT[] DEFAULT '{}',
    prescribed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drug Interactions Table
CREATE TABLE IF NOT EXISTS drug_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medication1 VARCHAR(255) NOT NULL,
    medication2 VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('minor', 'moderate', 'major', 'contraindicated')),
    description TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    clinical_significance TEXT DEFAULT NULL,
    source VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab Monitoring Table
CREATE TABLE IF NOT EXISTS lab_monitoring (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medication_id UUID NOT NULL REFERENCES patient_medications(id) ON DELETE CASCADE,
    test_name VARCHAR(255) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    last_test DATE DEFAULT NULL,
    next_due DATE DEFAULT NULL,
    is_required BOOLEAN DEFAULT true,
    normal_range VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab Results Table
CREATE TABLE IF NOT EXISTS lab_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    test_name VARCHAR(255) NOT NULL,
    value VARCHAR(100) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    reference_range VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('normal', 'abnormal', 'critical')),
    date DATE NOT NULL,
    lab_name VARCHAR(255) DEFAULT NULL,
    ordered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    prescribed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    diagnosis TEXT NOT NULL,
    instructions TEXT DEFAULT NULL,
    valid_until DATE NOT NULL,
    is_electronic BOOLEAN DEFAULT true,
    digital_signature TEXT DEFAULT NULL,
    pharmacy_id VARCHAR(255) DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'signed', 'sent', 'filled', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescription Medications Table
CREATE TABLE IF NOT EXISTS prescription_medications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    quantity INTEGER DEFAULT NULL,
    refills INTEGER DEFAULT 0,
    instructions TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Therapy Sessions Table (Psychology)
CREATE TABLE IF NOT EXISTS therapy_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    duration INTEGER NOT NULL,
    type VARCHAR(20) DEFAULT 'individual' CHECK (type IN ('individual', 'group', 'family', 'couples')),
    modality VARCHAR(20) DEFAULT 'cbt' CHECK (modality IN ('cbt', 'dbt', 'emdr', 'mindfulness', 'psychodynamic', 'humanistic', 'other')),
    goals TEXT[] DEFAULT '{}',
    notes TEXT DEFAULT NULL,
    mood_rating INTEGER DEFAULT NULL CHECK (mood_rating >= 1 AND mood_rating <= 10),
    progress_notes TEXT DEFAULT NULL,
    next_session_plan TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Therapy Interventions Table
CREATE TABLE IF NOT EXISTS therapy_interventions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES therapy_sessions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    duration INTEGER DEFAULT NULL,
    effectiveness INTEGER DEFAULT NULL CHECK (effectiveness >= 1 AND effectiveness <= 10),
    notes TEXT DEFAULT NULL,
    tools TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Homework Assignments Table
CREATE TABLE IF NOT EXISTS homework_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES therapy_sessions(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'practice' CHECK (type IN ('journaling', 'practice', 'reading', 'exercise', 'other')),
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'completed', 'overdue')),
    patient_notes TEXT DEFAULT NULL,
    therapist_feedback TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Treatment Plans Table
CREATE TABLE IF NOT EXISTS treatment_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    diagnosis TEXT NOT NULL,
    goals JSONB DEFAULT '[]',
    interventions TEXT[] DEFAULT '{}',
    timeline VARCHAR(255) DEFAULT NULL,
    progress_metrics TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Treatment Goals Table
CREATE TABLE IF NOT EXISTS treatment_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    treatment_plan_id UUID NOT NULL REFERENCES treatment_plans(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    target_date DATE DEFAULT NULL,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    milestones TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Psychological Assessments Table
CREATE TABLE IF NOT EXISTS psychological_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('phq9', 'gad7', 'dass21', 'beck_depression', 'beck_anxiety', 'custom')),
    questions JSONB DEFAULT '[]',
    results JSONB DEFAULT '{}',
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessment Questions Table
CREATE TABLE IF NOT EXISTS assessment_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assessment_id UUID NOT NULL REFERENCES psychological_assessments(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('scale', 'multiple_choice', 'text', 'yes_no')),
    options TEXT[] DEFAULT NULL,
    required BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessment Results Table
CREATE TABLE IF NOT EXISTS assessment_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assessment_id UUID NOT NULL REFERENCES psychological_assessments(id) ON DELETE CASCADE,
    total_score INTEGER DEFAULT NULL,
    category_scores JSONB DEFAULT '{}',
    interpretation TEXT DEFAULT NULL,
    recommendations TEXT[] DEFAULT '{}',
    severity VARCHAR(20) DEFAULT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crisis Intervention Table
CREATE TABLE IF NOT EXISTS crisis_interventions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    crisis_type VARCHAR(50) NOT NULL CHECK (crisis_type IN ('suicidal_ideation', 'self_harm', 'psychotic_episode', 'manic_episode', 'panic_attack', 'other')),
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'immediate')),
    intervention_type VARCHAR(50) NOT NULL CHECK (intervention_type IN ('safety_planning', 'medication_adjustment', 'hospitalization', 'emergency_contact', 'therapy_session', 'other')),
    description TEXT NOT NULL,
    actions_taken TEXT[] DEFAULT '{}',
    follow_up_required BOOLEAN DEFAULT true,
    follow_up_date DATE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_provider_types_user_id ON provider_types(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_types_type ON provider_types(type);

CREATE INDEX IF NOT EXISTS idx_patient_medications_patient_id ON patient_medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_medications_prescribed_by ON patient_medications(prescribed_by);
CREATE INDEX IF NOT EXISTS idx_patient_medications_status ON patient_medications(status);
CREATE INDEX IF NOT EXISTS idx_patient_medications_start_date ON patient_medications(start_date);

CREATE INDEX IF NOT EXISTS idx_drug_interactions_medications ON drug_interactions(medication1, medication2);
CREATE INDEX IF NOT EXISTS idx_drug_interactions_severity ON drug_interactions(severity);

CREATE INDEX IF NOT EXISTS idx_lab_monitoring_medication_id ON lab_monitoring(medication_id);
CREATE INDEX IF NOT EXISTS idx_lab_monitoring_next_due ON lab_monitoring(next_due);

CREATE INDEX IF NOT EXISTS idx_lab_results_patient_id ON lab_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_date ON lab_results(date);
CREATE INDEX IF NOT EXISTS idx_lab_results_status ON lab_results(status);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_prescribed_by ON prescriptions(prescribed_by);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_valid_until ON prescriptions(valid_until);

CREATE INDEX IF NOT EXISTS idx_prescription_medications_prescription_id ON prescription_medications(prescription_id);

CREATE INDEX IF NOT EXISTS idx_therapy_sessions_patient_id ON therapy_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_therapist_id ON therapy_sessions(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_date ON therapy_sessions(date);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_modality ON therapy_sessions(modality);

CREATE INDEX IF NOT EXISTS idx_therapy_interventions_session_id ON therapy_interventions(session_id);

CREATE INDEX IF NOT EXISTS idx_homework_assignments_patient_id ON homework_assignments(patient_id);
CREATE INDEX IF NOT EXISTS idx_homework_assignments_therapist_id ON homework_assignments(therapist_id);
CREATE INDEX IF NOT EXISTS idx_homework_assignments_due_date ON homework_assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_homework_assignments_status ON homework_assignments(status);

CREATE INDEX IF NOT EXISTS idx_treatment_plans_patient_id ON treatment_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_therapist_id ON treatment_plans(therapist_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_status ON treatment_plans(status);

CREATE INDEX IF NOT EXISTS idx_treatment_goals_treatment_plan_id ON treatment_goals(treatment_plan_id);
CREATE INDEX IF NOT EXISTS idx_treatment_goals_status ON treatment_goals(status);

CREATE INDEX IF NOT EXISTS idx_psychological_assessments_patient_id ON psychological_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_psychological_assessments_therapist_id ON psychological_assessments(therapist_id);
CREATE INDEX IF NOT EXISTS idx_psychological_assessments_type ON psychological_assessments(type);
CREATE INDEX IF NOT EXISTS idx_psychological_assessments_completed_at ON psychological_assessments(completed_at);

CREATE INDEX IF NOT EXISTS idx_assessment_questions_assessment_id ON assessment_questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_order_index ON assessment_questions(order_index);

CREATE INDEX IF NOT EXISTS idx_assessment_results_assessment_id ON assessment_results(assessment_id);

CREATE INDEX IF NOT EXISTS idx_crisis_interventions_patient_id ON crisis_interventions(patient_id);
CREATE INDEX IF NOT EXISTS idx_crisis_interventions_provider_id ON crisis_interventions(provider_id);
CREATE INDEX IF NOT EXISTS idx_crisis_interventions_risk_level ON crisis_interventions(risk_level);
CREATE INDEX IF NOT EXISTS idx_crisis_interventions_created_at ON crisis_interventions(created_at);

-- Row Level Security (RLS) Policies
ALTER TABLE provider_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapy_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychological_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_interventions ENABLE ROW LEVEL SECURITY;

-- Provider Types RLS Policies
CREATE POLICY "Users can view their own provider type" ON provider_types
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own provider type" ON provider_types
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own provider type" ON provider_types
    FOR UPDATE USING (auth.uid() = user_id);

-- Patient Medications RLS Policies
CREATE POLICY "Providers can view patient medications" ON patient_medications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid() 
            AND type = 'psychiatrist'
        )
    );

CREATE POLICY "Psychiatrists can create patient medications" ON patient_medications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid() 
            AND type = 'psychiatrist'
        )
    );

CREATE POLICY "Psychiatrists can update patient medications" ON patient_medications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid() 
            AND type = 'psychiatrist'
        )
    );

-- Drug Interactions RLS Policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view drug interactions" ON drug_interactions
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Lab Monitoring RLS Policies
CREATE POLICY "Providers can view lab monitoring" ON lab_monitoring
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid() 
            AND type = 'psychiatrist'
        )
    );

CREATE POLICY "Psychiatrists can manage lab monitoring" ON lab_monitoring
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid() 
            AND type = 'psychiatrist'
        )
    );

-- Lab Results RLS Policies
CREATE POLICY "Providers can view lab results" ON lab_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Providers can create lab results" ON lab_results
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid()
        )
    );

-- Prescriptions RLS Policies
CREATE POLICY "Psychiatrists can view prescriptions" ON prescriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid() 
            AND type = 'psychiatrist'
        )
    );

CREATE POLICY "Psychiatrists can create prescriptions" ON prescriptions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid() 
            AND type = 'psychiatrist'
        )
    );

CREATE POLICY "Psychiatrists can update prescriptions" ON prescriptions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid() 
            AND type = 'psychiatrist'
        )
    );

-- Prescription Medications RLS Policies
CREATE POLICY "Psychiatrists can manage prescription medications" ON prescription_medications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid() 
            AND type = 'psychiatrist'
        )
    );

-- Therapy Sessions RLS Policies
CREATE POLICY "Therapists can view therapy sessions" ON therapy_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Therapists can create therapy sessions" ON therapy_sessions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Therapists can update therapy sessions" ON therapy_sessions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid()
        )
    );

-- Therapy Interventions RLS Policies
CREATE POLICY "Therapists can manage therapy interventions" ON therapy_interventions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid()
        )
    );

-- Homework Assignments RLS Policies
CREATE POLICY "Therapists can view homework assignments" ON homework_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Therapists can create homework assignments" ON homework_assignments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Therapists can update homework assignments" ON homework_assignments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid()
        )
    );

-- Treatment Plans RLS Policies
CREATE POLICY "Therapists can view treatment plans" ON treatment_plans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Therapists can create treatment plans" ON treatment_plans
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Therapists can update treatment plans" ON treatment_plans
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid()
        )
    );

-- Treatment Goals RLS Policies
CREATE POLICY "Therapists can manage treatment goals" ON treatment_goals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid()
        )
    );

-- Psychological Assessments RLS Policies
CREATE POLICY "Therapists can view psychological assessments" ON psychological_assessments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Therapists can create psychological assessments" ON psychological_assessments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Therapists can update psychological assessments" ON psychological_assessments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid()
        )
    );

-- Assessment Questions RLS Policies
CREATE POLICY "Therapists can manage assessment questions" ON assessment_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid()
        )
    );

-- Assessment Results RLS Policies
CREATE POLICY "Therapists can manage assessment results" ON assessment_results
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid()
        )
    );

-- Crisis Interventions RLS Policies
CREATE POLICY "Providers can view crisis interventions" ON crisis_interventions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Providers can create crisis interventions" ON crisis_interventions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Providers can update crisis interventions" ON crisis_interventions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM provider_types 
            WHERE user_id = auth.uid()
        )
    );

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_provider_types_updated_at BEFORE UPDATE ON provider_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_medications_updated_at BEFORE UPDATE ON patient_medications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drug_interactions_updated_at BEFORE UPDATE ON drug_interactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_monitoring_updated_at BEFORE UPDATE ON lab_monitoring
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapy_sessions_updated_at BEFORE UPDATE ON therapy_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_homework_assignments_updated_at BEFORE UPDATE ON homework_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatment_plans_updated_at BEFORE UPDATE ON treatment_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatment_goals_updated_at BEFORE UPDATE ON treatment_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check provider type
CREATE OR REPLACE FUNCTION get_provider_type(p_user_id UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
    provider_type VARCHAR(20);
BEGIN
    SELECT type INTO provider_type
    FROM provider_types
    WHERE user_id = p_user_id;
    
    RETURN COALESCE(provider_type, 'unknown');
END;
$$ language 'plpgsql';

-- Function to log medication changes
CREATE OR REPLACE FUNCTION log_medication_change()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO patient_portal_activity (
        patient_id, 
        activity_type, 
        description, 
        metadata
    ) VALUES (
        NEW.patient_id,
        'medication_updated',
        'Medication ' || NEW.name || ' was updated',
        jsonb_build_object(
            'medication_id', NEW.id,
            'old_status', COALESCE(OLD.status, 'new'),
            'new_status', NEW.status,
            'prescribed_by', NEW.prescribed_by
        )
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for medication changes
CREATE TRIGGER log_medication_changes AFTER UPDATE ON patient_medications
    FOR EACH ROW EXECUTE FUNCTION log_medication_change();
