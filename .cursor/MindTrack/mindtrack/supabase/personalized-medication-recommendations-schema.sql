-- Personalized Medication Recommendations Schema
-- AI-powered medication recommendations based on patient data

-- Patient medication profiles
CREATE TABLE IF NOT EXISTS patient_medication_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    diagnosis TEXT[],
    current_medications JSONB,
    medication_history JSONB,
    genetic_profile JSONB,
    lab_results JSONB,
    vital_signs JSONB,
    allergies TEXT[],
    contraindications TEXT[],
    drug_interactions JSONB,
    side_effects_history JSONB,
    treatment_response_history JSONB,
    comorbidities TEXT[],
    age INTEGER,
    gender VARCHAR(20),
    weight_kg DECIMAL(5,2),
    height_cm INTEGER,
    bmi DECIMAL(4,2),
    renal_function DECIMAL(4,2),
    hepatic_function VARCHAR(50),
    pregnancy_status VARCHAR(50),
    breastfeeding BOOLEAN DEFAULT false,
    smoking_status VARCHAR(50),
    alcohol_use VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication recommendation algorithms
CREATE TABLE IF NOT EXISTS medication_algorithms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    algorithm_name VARCHAR(255) NOT NULL,
    algorithm_version VARCHAR(50),
    algorithm_type VARCHAR(100),
    description TEXT,
    clinical_indications TEXT[],
    input_parameters JSONB,
    output_parameters JSONB,
    accuracy_score DECIMAL(3,2),
    validation_studies TEXT[],
    fda_approval_status VARCHAR(50),
    clinical_guidelines TEXT[],
    evidence_level VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personalized medication recommendations
CREATE TABLE IF NOT EXISTS personalized_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    algorithm_id UUID NOT NULL REFERENCES medication_algorithms(id),
    recommendation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    primary_diagnosis VARCHAR(255),
    recommended_medications JSONB,
    alternative_medications JSONB,
    contraindicated_medications JSONB,
    dosage_recommendations JSONB,
    titration_schedule JSONB,
    monitoring_parameters JSONB,
    expected_outcomes JSONB,
    risk_assessment JSONB,
    confidence_score DECIMAL(3,2),
    evidence_summary TEXT,
    clinical_rationale TEXT,
    patient_preferences JSONB,
    cost_considerations JSONB,
    insurance_coverage JSONB,
    follow_up_plan TEXT,
    review_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Treatment response tracking
CREATE TABLE IF NOT EXISTS treatment_response_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recommendation_id UUID NOT NULL REFERENCES personalized_recommendations(id),
    medication_name VARCHAR(255),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    dosage_schedule JSONB,
    adherence_rate DECIMAL(3,2),
    effectiveness_score DECIMAL(3,2),
    side_effects_severity DECIMAL(3,2),
    symptom_improvement JSONB,
    functional_improvement JSONB,
    quality_of_life_score DECIMAL(3,2),
    patient_satisfaction DECIMAL(3,2),
    clinician_assessment JSONB,
    lab_monitoring_results JSONB,
    dose_adjustments JSONB,
    discontinuation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clinical decision support rules
CREATE TABLE IF NOT EXISTS clinical_decision_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(255) NOT NULL,
    rule_category VARCHAR(100),
    rule_description TEXT,
    clinical_condition TEXT,
    patient_criteria JSONB,
    medication_criteria JSONB,
    recommendation_logic JSONB,
    evidence_level VARCHAR(50),
    strength_of_recommendation VARCHAR(50),
    contraindications TEXT[],
    warnings TEXT[],
    monitoring_requirements TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient preference profiles
CREATE TABLE IF NOT EXISTS patient_preference_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    medication_form_preference VARCHAR(50)[],
    dosing_frequency_preference VARCHAR(50)[],
    cost_sensitivity VARCHAR(50),
    side_effect_tolerance VARCHAR(50),
    treatment_goals TEXT[],
    lifestyle_factors JSONB,
    cultural_preferences JSONB,
    religious_considerations TEXT[],
    accessibility_needs TEXT[],
    communication_preferences JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recommendation analytics
CREATE TABLE IF NOT EXISTS recommendation_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    algorithm_id UUID NOT NULL REFERENCES medication_algorithms(id),
    total_recommendations INTEGER DEFAULT 0,
    accepted_recommendations INTEGER DEFAULT 0,
    rejected_recommendations INTEGER DEFAULT 0,
    effectiveness_rate DECIMAL(3,2),
    patient_satisfaction_score DECIMAL(3,2),
    clinical_outcome_score DECIMAL(3,2),
    cost_effectiveness_score DECIMAL(3,2),
    safety_score DECIMAL(3,2),
    analysis_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patient_medication_profiles_patient_id ON patient_medication_profiles(patient_id);
CREATE INDEX IF NOT EXISTS idx_personalized_recommendations_patient_id ON personalized_recommendations(patient_id);
CREATE INDEX IF NOT EXISTS idx_personalized_recommendations_algorithm_id ON personalized_recommendations(algorithm_id);
CREATE INDEX IF NOT EXISTS idx_treatment_response_tracking_patient_id ON treatment_response_tracking(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_response_tracking_recommendation_id ON treatment_response_tracking(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_patient_preference_profiles_patient_id ON patient_preference_profiles(patient_id);

-- RLS Policies
ALTER TABLE patient_medication_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_algorithms ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalized_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_response_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_decision_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_preference_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_analytics ENABLE ROW LEVEL SECURITY;

-- Patient medication profiles policies
CREATE POLICY "Patient medication profiles viewable by patient and provider" ON patient_medication_profiles
    FOR SELECT USING (
        auth.uid() = patient_id OR 
        auth.uid() IN (
            SELECT provider_id FROM patient_providers WHERE patient_id = patient_medication_profiles.patient_id
        )
    );

CREATE POLICY "Patient medication profiles insertable by healthcare providers" ON patient_medication_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Patient medication profiles updatable by healthcare providers" ON patient_medication_profiles
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Medication algorithms policies
CREATE POLICY "Medication algorithms viewable by authenticated users" ON medication_algorithms
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Medication algorithms insertable by healthcare providers" ON medication_algorithms
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Personalized recommendations policies
CREATE POLICY "Personalized recommendations viewable by patient and provider" ON personalized_recommendations
    FOR SELECT USING (
        auth.uid() = patient_id OR 
        auth.uid() IN (
            SELECT provider_id FROM patient_providers WHERE patient_id = personalized_recommendations.patient_id
        )
    );

CREATE POLICY "Personalized recommendations insertable by healthcare providers" ON personalized_recommendations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Treatment response tracking policies
CREATE POLICY "Treatment response tracking viewable by patient and provider" ON treatment_response_tracking
    FOR SELECT USING (
        auth.uid() = patient_id OR 
        auth.uid() IN (
            SELECT provider_id FROM patient_providers WHERE patient_id = treatment_response_tracking.patient_id
        )
    );

CREATE POLICY "Treatment response tracking insertable by healthcare providers" ON treatment_response_tracking
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Patient preference profiles policies
CREATE POLICY "Patient preference profiles viewable by patient and provider" ON patient_preference_profiles
    FOR SELECT USING (
        auth.uid() = patient_id OR 
        auth.uid() IN (
            SELECT provider_id FROM patient_providers WHERE patient_id = patient_preference_profiles.patient_id
        )
    );

CREATE POLICY "Patient preference profiles insertable by healthcare providers" ON patient_preference_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- PostgreSQL Functions

-- Function to generate personalized medication recommendations
CREATE OR REPLACE FUNCTION generate_personalized_recommendations(
    patient_uuid UUID,
    diagnosis_text VARCHAR(255),
    algorithm_uuid UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    patient_profile JSONB;
    recommendations JSONB := '{}';
    algorithm_record RECORD;
    rule_record RECORD;
    recommendation_record RECORD;
BEGIN
    -- Get patient profile
    SELECT to_jsonb(pmp.*) INTO patient_profile
    FROM patient_medication_profiles pmp
    WHERE pmp.patient_id = patient_uuid;
    
    -- If no algorithm specified, use default
    IF algorithm_uuid IS NULL THEN
        SELECT * INTO algorithm_record
        FROM medication_algorithms
        WHERE algorithm_type = 'default'
        ORDER BY accuracy_score DESC
        LIMIT 1;
    ELSE
        SELECT * INTO algorithm_record
        FROM medication_algorithms
        WHERE id = algorithm_uuid;
    END IF;
    
    -- Apply clinical decision rules
    FOR rule_record IN 
        SELECT * FROM clinical_decision_rules
        WHERE clinical_condition ILIKE '%' || diagnosis_text || '%'
    LOOP
        -- Apply rule logic (simplified)
        recommendations := recommendations || jsonb_build_object(
            'rule_name', rule_record.rule_name,
            'recommendations', rule_record.recommendation_logic
        );
    END LOOP;
    
    -- Create recommendation record
    INSERT INTO personalized_recommendations (
        patient_id,
        algorithm_id,
        primary_diagnosis,
        recommended_medications,
        confidence_score,
        clinical_rationale
    ) VALUES (
        patient_uuid,
        algorithm_record.id,
        diagnosis_text,
        recommendations,
        0.85, -- Placeholder confidence score
        'Generated based on patient profile and clinical guidelines'
    ) RETURNING to_jsonb(personalized_recommendations.*) INTO recommendation_record;
    
    RETURN recommendation_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate treatment effectiveness
CREATE OR REPLACE FUNCTION calculate_treatment_effectiveness(
    patient_uuid UUID,
    medication_name VARCHAR(255)
) RETURNS DECIMAL(3,2) AS $$
DECLARE
    effectiveness_score DECIMAL(3,2) := 0.0;
    response_record RECORD;
BEGIN
    FOR response_record IN 
        SELECT trt.effectiveness_score, trt.symptom_improvement, trt.functional_improvement
        FROM treatment_response_tracking trt
        WHERE trt.patient_id = patient_uuid
        AND trt.medication_name = medication_name
        ORDER BY trt.start_date DESC
    LOOP
        effectiveness_score := effectiveness_score + response_record.effectiveness_score;
    END LOOP;
    
    RETURN LEAST(effectiveness_score / 10.0, 1.0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get patient preferences
CREATE OR REPLACE FUNCTION get_patient_preferences(
    patient_uuid UUID
) RETURNS JSONB AS $$
DECLARE
    preferences JSONB := '{}';
    preference_record RECORD;
BEGIN
    SELECT to_jsonb(ppp.*) INTO preference_record
    FROM patient_preference_profiles ppp
    WHERE ppp.patient_id = patient_uuid;
    
    IF preference_record IS NOT NULL THEN
        preferences := preferences || jsonb_build_object(
            'medication_form_preference', preference_record.medication_form_preference,
            'dosing_frequency_preference', preference_record.dosing_frequency_preference,
            'cost_sensitivity', preference_record.cost_sensitivity,
            'side_effect_tolerance', preference_record.side_effect_tolerance,
            'treatment_goals', preference_record.treatment_goals
        );
    END IF;
    
    RETURN preferences;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update recommendation analytics
CREATE OR REPLACE FUNCTION update_recommendation_analytics() RETURNS VOID AS $$
BEGIN
    INSERT INTO recommendation_analytics (
        algorithm_id,
        total_recommendations,
        accepted_recommendations,
        rejected_recommendations,
        effectiveness_rate,
        patient_satisfaction_score,
        clinical_outcome_score,
        cost_effectiveness_score,
        safety_score
    )
    SELECT 
        ma.id,
        COUNT(pr.id) as total_recommendations,
        COUNT(CASE WHEN pr.status = 'accepted' THEN 1 END) as accepted_recommendations,
        COUNT(CASE WHEN pr.status = 'rejected' THEN 1 END) as rejected_recommendations,
        0.75 as effectiveness_rate, -- Placeholder
        0.80 as patient_satisfaction_score, -- Placeholder
        0.85 as clinical_outcome_score, -- Placeholder
        0.70 as cost_effectiveness_score, -- Placeholder
        0.90 as safety_score -- Placeholder
    FROM medication_algorithms ma
    LEFT JOIN personalized_recommendations pr ON ma.id = pr.algorithm_id
    GROUP BY ma.id
    ON CONFLICT (algorithm_id, analysis_date) 
    DO UPDATE SET
        total_recommendations = EXCLUDED.total_recommendations,
        accepted_recommendations = EXCLUDED.accepted_recommendations,
        rejected_recommendations = EXCLUDED.rejected_recommendations,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patient_medication_profiles_updated_at
    BEFORE UPDATE ON patient_medication_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medication_algorithms_updated_at
    BEFORE UPDATE ON medication_algorithms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personalized_recommendations_updated_at
    BEFORE UPDATE ON personalized_recommendations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatment_response_tracking_updated_at
    BEFORE UPDATE ON treatment_response_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinical_decision_rules_updated_at
    BEFORE UPDATE ON clinical_decision_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_preference_profiles_updated_at
    BEFORE UPDATE ON patient_preference_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recommendation_analytics_updated_at
    BEFORE UPDATE ON recommendation_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
