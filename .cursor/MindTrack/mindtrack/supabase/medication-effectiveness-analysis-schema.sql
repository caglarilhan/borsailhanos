-- Medication Effectiveness Analysis Schema
-- Comprehensive medication effectiveness tracking for American psychiatrists

-- Medication effectiveness assessments
CREATE TABLE IF NOT EXISTS medication_effectiveness_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    assessment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    assessment_type VARCHAR(50) NOT NULL, -- 'initial', 'follow_up', 'dose_adjustment', 'discontinuation'
    assessment_method VARCHAR(50) NOT NULL, -- 'clinical_interview', 'rating_scale', 'patient_report', 'caregiver_report'
    primary_diagnosis VARCHAR(255) NOT NULL,
    secondary_diagnoses TEXT[],
    baseline_symptoms TEXT,
    current_symptoms TEXT,
    symptom_severity_score INTEGER CHECK (symptom_severity_score >= 0 AND symptom_severity_score <= 10),
    functional_impairment_score INTEGER CHECK (functional_impairment_score >= 0 AND functional_impairment_score <= 10),
    quality_of_life_score INTEGER CHECK (quality_of_life_score >= 0 AND quality_of_life_score <= 10),
    medication_adherence_score INTEGER CHECK (medication_adherence_score >= 0 AND medication_adherence_score <= 100),
    side_effects_present BOOLEAN DEFAULT FALSE,
    side_effects_severity INTEGER CHECK (side_effects_severity >= 0 AND side_effects_severity <= 10),
    side_effects_description TEXT,
    effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5), -- 1=very poor, 5=excellent
    global_impression_score INTEGER CHECK (global_impression_score >= 1 AND global_impression_score <= 7), -- CGI-S scale
    clinical_notes TEXT,
    treatment_plan_changes TEXT,
    next_assessment_date DATE,
    assessed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Standardized rating scales
CREATE TABLE IF NOT EXISTS rating_scale_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES medication_effectiveness_assessments(id) ON DELETE CASCADE,
    scale_name VARCHAR(100) NOT NULL, -- 'PHQ-9', 'GAD-7', 'HAM-D', 'YMRS', 'PANSS', etc.
    scale_version VARCHAR(20),
    assessment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    total_score INTEGER NOT NULL,
    severity_level VARCHAR(50), -- 'minimal', 'mild', 'moderate', 'severe'
    individual_items JSONB, -- Store individual item scores
    interpretation TEXT,
    administered_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Treatment response tracking
CREATE TABLE IF NOT EXISTS treatment_response_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    treatment_start_date DATE NOT NULL,
    treatment_end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    response_category VARCHAR(50) NOT NULL, -- 'remission', 'response', 'partial_response', 'no_response', 'worsening'
    response_criteria TEXT,
    time_to_response_days INTEGER,
    time_to_remission_days INTEGER,
    relapse_events INTEGER DEFAULT 0,
    last_relapse_date DATE,
    dose_optimization_attempts INTEGER DEFAULT 0,
    medication_changes INTEGER DEFAULT 0,
    discontinuation_reason VARCHAR(100),
    discontinuation_date DATE,
    clinical_outcome TEXT,
    functional_recovery_score INTEGER CHECK (functional_recovery_score >= 0 AND functional_recovery_score <= 100),
    quality_of_life_improvement INTEGER CHECK (quality_of_life_improvement >= -100 AND quality_of_life_improvement <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comparative effectiveness studies
CREATE TABLE IF NOT EXISTS comparative_effectiveness_studies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_name VARCHAR(255) NOT NULL,
    study_type VARCHAR(50) NOT NULL, -- 'retrospective', 'prospective', 'registry', 'real_world_evidence'
    primary_condition VARCHAR(255) NOT NULL,
    medications_compared TEXT[] NOT NULL,
    study_population_size INTEGER,
    study_duration_months INTEGER,
    primary_endpoint VARCHAR(255),
    secondary_endpoints TEXT[],
    inclusion_criteria TEXT,
    exclusion_criteria TEXT,
    statistical_methods TEXT,
    results_summary TEXT,
    effectiveness_comparison JSONB, -- Store comparative results
    safety_profile JSONB,
    cost_effectiveness_data JSONB,
    study_limitations TEXT,
    clinical_implications TEXT,
    publication_status VARCHAR(50), -- 'published', 'preprint', 'conference', 'unpublished'
    publication_reference TEXT,
    study_sponsor VARCHAR(255),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication effectiveness analytics
CREATE TABLE IF NOT EXISTS medication_effectiveness_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    analysis_period_start DATE NOT NULL,
    analysis_period_end DATE NOT NULL,
    total_patients INTEGER NOT NULL DEFAULT 0,
    total_assessments INTEGER NOT NULL DEFAULT 0,
    average_effectiveness_rating DECIMAL(3,2),
    response_rate DECIMAL(5,2), -- percentage
    remission_rate DECIMAL(5,2), -- percentage
    average_time_to_response_days DECIMAL(8,2),
    average_time_to_remission_days DECIMAL(8,2),
    relapse_rate DECIMAL(5,2), -- percentage
    discontinuation_rate DECIMAL(5,2), -- percentage
    average_treatment_duration_days DECIMAL(8,2),
    side_effects_rate DECIMAL(5,2), -- percentage
    severe_side_effects_rate DECIMAL(5,2), -- percentage
    dose_optimization_rate DECIMAL(5,2), -- percentage
    functional_recovery_rate DECIMAL(5,2), -- percentage
    quality_of_life_improvement_average DECIMAL(5,2),
    cost_per_response DECIMAL(10,2),
    cost_per_remission DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient-reported outcomes
CREATE TABLE IF NOT EXISTS patient_reported_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    assessment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    outcome_type VARCHAR(50) NOT NULL, -- 'symptom_severity', 'functional_status', 'quality_of_life', 'medication_satisfaction'
    outcome_measure VARCHAR(100) NOT NULL, -- 'PHQ-9', 'GAD-7', 'SF-36', 'medication_satisfaction_scale'
    score DECIMAL(8,2) NOT NULL,
    score_range_min INTEGER NOT NULL,
    score_range_max INTEGER NOT NULL,
    normalized_score DECIMAL(5,2), -- 0-100 scale
    interpretation VARCHAR(50), -- 'improved', 'stable', 'worsened'
    change_from_baseline DECIMAL(8,2),
    clinically_meaningful_change BOOLEAN,
    patient_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_medication_effectiveness_patient_id ON medication_effectiveness_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_medication_effectiveness_medication_id ON medication_effectiveness_assessments(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_effectiveness_date ON medication_effectiveness_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_medication_effectiveness_type ON medication_effectiveness_assessments(assessment_type);
CREATE INDEX IF NOT EXISTS idx_medication_effectiveness_rating ON medication_effectiveness_assessments(effectiveness_rating);

CREATE INDEX IF NOT EXISTS idx_rating_scale_patient_id ON rating_scale_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_rating_scale_medication_id ON rating_scale_assessments(medication_id);
CREATE INDEX IF NOT EXISTS idx_rating_scale_name ON rating_scale_assessments(scale_name);
CREATE INDEX IF NOT EXISTS idx_rating_scale_date ON rating_scale_assessments(assessment_date);

CREATE INDEX IF NOT EXISTS idx_treatment_response_patient_id ON treatment_response_tracking(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_response_medication_id ON treatment_response_tracking(medication_id);
CREATE INDEX IF NOT EXISTS idx_treatment_response_category ON treatment_response_tracking(response_category);
CREATE INDEX IF NOT EXISTS idx_treatment_response_active ON treatment_response_tracking(is_active);

CREATE INDEX IF NOT EXISTS idx_comparative_studies_condition ON comparative_effectiveness_studies(primary_condition);
CREATE INDEX IF NOT EXISTS idx_comparative_studies_type ON comparative_effectiveness_studies(study_type);
CREATE INDEX IF NOT EXISTS idx_comparative_studies_status ON comparative_effectiveness_studies(publication_status);

CREATE INDEX IF NOT EXISTS idx_effectiveness_analytics_medication_id ON medication_effectiveness_analytics(medication_id);
CREATE INDEX IF NOT EXISTS idx_effectiveness_analytics_period ON medication_effectiveness_analytics(analysis_period_start, analysis_period_end);

CREATE INDEX IF NOT EXISTS idx_patient_outcomes_patient_id ON patient_reported_outcomes(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_outcomes_medication_id ON patient_reported_outcomes(medication_id);
CREATE INDEX IF NOT EXISTS idx_patient_outcomes_type ON patient_reported_outcomes(outcome_type);
CREATE INDEX IF NOT EXISTS idx_patient_outcomes_date ON patient_reported_outcomes(assessment_date);

-- RLS Policies
ALTER TABLE medication_effectiveness_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_scale_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_response_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparative_effectiveness_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_effectiveness_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_reported_outcomes ENABLE ROW LEVEL SECURITY;

-- Medication effectiveness assessments policies
CREATE POLICY "Users can view effectiveness assessments for their clients" ON medication_effectiveness_assessments
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert effectiveness assessments for their clients" ON medication_effectiveness_assessments
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update effectiveness assessments for their clients" ON medication_effectiveness_assessments
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete effectiveness assessments for their clients" ON medication_effectiveness_assessments
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Rating scale assessments policies
CREATE POLICY "Users can view rating scales for their clients" ON rating_scale_assessments
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert rating scales for their clients" ON rating_scale_assessments
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update rating scales for their clients" ON rating_scale_assessments
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete rating scales for their clients" ON rating_scale_assessments
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Treatment response tracking policies
CREATE POLICY "Users can view treatment responses for their clients" ON treatment_response_tracking
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert treatment responses for their clients" ON treatment_response_tracking
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update treatment responses for their clients" ON treatment_response_tracking
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete treatment responses for their clients" ON treatment_response_tracking
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Comparative effectiveness studies policies (read-only for all users)
CREATE POLICY "Users can view comparative studies" ON comparative_effectiveness_studies
    FOR SELECT USING (true);

CREATE POLICY "Users can insert comparative studies" ON comparative_effectiveness_studies
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own comparative studies" ON comparative_effectiveness_studies
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own comparative studies" ON comparative_effectiveness_studies
    FOR DELETE USING (created_by = auth.uid());

-- Medication effectiveness analytics policies
CREATE POLICY "Users can view effectiveness analytics" ON medication_effectiveness_analytics
    FOR SELECT USING (true);

CREATE POLICY "Users can insert effectiveness analytics" ON medication_effectiveness_analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update effectiveness analytics" ON medication_effectiveness_analytics
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete effectiveness analytics" ON medication_effectiveness_analytics
    FOR DELETE USING (true);

-- Patient reported outcomes policies
CREATE POLICY "Users can view patient outcomes for their clients" ON patient_reported_outcomes
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert patient outcomes for their clients" ON patient_reported_outcomes
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update patient outcomes for their clients" ON patient_reported_outcomes
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete patient outcomes for their clients" ON patient_reported_outcomes
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Functions for medication effectiveness analysis

-- Function to calculate medication effectiveness metrics
CREATE OR REPLACE FUNCTION calculate_medication_effectiveness_metrics(
    p_medication_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_patients BIGINT,
    total_assessments BIGINT,
    average_effectiveness_rating DECIMAL(3,2),
    response_rate DECIMAL(5,2),
    remission_rate DECIMAL(5,2),
    average_time_to_response_days DECIMAL(8,2),
    average_time_to_remission_days DECIMAL(8,2),
    relapse_rate DECIMAL(5,2),
    discontinuation_rate DECIMAL(5,2),
    side_effects_rate DECIMAL(5,2),
    functional_recovery_rate DECIMAL(5,2)
) AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
BEGIN
    v_start_date := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '1 year');
    v_end_date := COALESCE(p_end_date, CURRENT_DATE);
    
    RETURN QUERY
    WITH effectiveness_data AS (
        SELECT 
            mea.patient_id,
            mea.effectiveness_rating,
            mea.assessment_date,
            trt.response_category,
            trt.time_to_response_days,
            trt.time_to_remission_days,
            trt.relapse_events,
            trt.discontinuation_reason,
            mea.side_effects_present,
            trt.functional_recovery_score
        FROM medication_effectiveness_assessments mea
        LEFT JOIN treatment_response_tracking trt ON mea.patient_id = trt.patient_id 
            AND mea.medication_id = trt.medication_id
        WHERE mea.medication_id = p_medication_id
        AND mea.assessment_date::DATE BETWEEN v_start_date AND v_end_date
    ),
    metrics AS (
        SELECT 
            COUNT(DISTINCT patient_id) as total_patients,
            COUNT(*) as total_assessments,
            AVG(effectiveness_rating) as avg_rating,
            COUNT(*) FILTER (WHERE response_category IN ('response', 'remission')) as response_count,
            COUNT(*) FILTER (WHERE response_category = 'remission') as remission_count,
            AVG(time_to_response_days) as avg_time_to_response,
            AVG(time_to_remission_days) as avg_time_to_remission,
            COUNT(*) FILTER (WHERE relapse_events > 0) as relapse_count,
            COUNT(*) FILTER (WHERE discontinuation_reason IS NOT NULL) as discontinuation_count,
            COUNT(*) FILTER (WHERE side_effects_present) as side_effects_count,
            COUNT(*) FILTER (WHERE functional_recovery_score >= 70) as functional_recovery_count
        FROM effectiveness_data
    )
    SELECT 
        metrics.total_patients,
        metrics.total_assessments,
        metrics.avg_rating,
        CASE WHEN metrics.total_assessments > 0 THEN (metrics.response_count::DECIMAL / metrics.total_assessments) * 100 ELSE 0 END,
        CASE WHEN metrics.total_assessments > 0 THEN (metrics.remission_count::DECIMAL / metrics.total_assessments) * 100 ELSE 0 END,
        metrics.avg_time_to_response,
        metrics.avg_time_to_remission,
        CASE WHEN metrics.total_assessments > 0 THEN (metrics.relapse_count::DECIMAL / metrics.total_assessments) * 100 ELSE 0 END,
        CASE WHEN metrics.total_assessments > 0 THEN (metrics.discontinuation_count::DECIMAL / metrics.total_assessments) * 100 ELSE 0 END,
        CASE WHEN metrics.total_assessments > 0 THEN (metrics.side_effects_count::DECIMAL / metrics.total_assessments) * 100 ELSE 0 END,
        CASE WHEN metrics.total_assessments > 0 THEN (metrics.functional_recovery_count::DECIMAL / metrics.total_assessments) * 100 ELSE 0 END
    FROM metrics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate effectiveness report
CREATE OR REPLACE FUNCTION generate_effectiveness_report(
    p_medication_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
    v_report JSONB;
BEGIN
    v_start_date := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '1 year');
    v_end_date := COALESCE(p_end_date, CURRENT_DATE);
    
    SELECT jsonb_build_object(
        'medication_id', p_medication_id,
        'report_period', jsonb_build_object(
            'start_date', v_start_date,
            'end_date', v_end_date
        ),
        'metrics', (
            SELECT jsonb_build_object(
                'total_patients', total_patients,
                'total_assessments', total_assessments,
                'average_effectiveness_rating', average_effectiveness_rating,
                'response_rate', response_rate,
                'remission_rate', remission_rate,
                'average_time_to_response_days', average_time_to_response_days,
                'average_time_to_remission_days', average_time_to_remission_days,
                'relapse_rate', relapse_rate,
                'discontinuation_rate', discontinuation_rate,
                'side_effects_rate', side_effects_rate,
                'functional_recovery_rate', functional_recovery_rate
            )
            FROM calculate_medication_effectiveness_metrics(p_medication_id, v_start_date, v_end_date)
        ),
        'rating_scales', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'scale_name', scale_name,
                    'total_assessments', COUNT(*),
                    'average_score', AVG(total_score),
                    'severity_distribution', jsonb_object_agg(severity_level, count)
                )
            )
            FROM (
                SELECT 
                    scale_name,
                    total_score,
                    severity_level,
                    COUNT(*) as count
                FROM rating_scale_assessments
                WHERE medication_id = p_medication_id
                AND assessment_date::DATE BETWEEN v_start_date AND v_end_date
                GROUP BY scale_name, total_score, severity_level
            ) grouped_scales
            GROUP BY scale_name
        ),
        'patient_outcomes', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'outcome_type', outcome_type,
                    'outcome_measure', outcome_measure,
                    'average_score', AVG(score),
                    'average_normalized_score', AVG(normalized_score),
                    'improvement_rate', COUNT(*) FILTER (WHERE interpretation = 'improved')::DECIMAL / COUNT(*) * 100
                )
            )
            FROM patient_reported_outcomes
            WHERE medication_id = p_medication_id
            AND assessment_date::DATE BETWEEN v_start_date AND v_end_date
            GROUP BY outcome_type, outcome_measure
        )
    ) INTO v_report;
    
    RETURN v_report;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update effectiveness analytics
CREATE OR REPLACE FUNCTION update_medication_effectiveness_analytics(
    p_medication_id UUID,
    p_analysis_period_start DATE DEFAULT CURRENT_DATE - INTERVAL '1 year',
    p_analysis_period_end DATE DEFAULT CURRENT_DATE
)
RETURNS VOID AS $$
DECLARE
    v_metrics RECORD;
BEGIN
    SELECT * FROM calculate_medication_effectiveness_metrics(
        p_medication_id, 
        p_analysis_period_start, 
        p_analysis_period_end
    ) INTO v_metrics;
    
    INSERT INTO medication_effectiveness_analytics (
        medication_id,
        analysis_period_start,
        analysis_period_end,
        total_patients,
        total_assessments,
        average_effectiveness_rating,
        response_rate,
        remission_rate,
        average_time_to_response_days,
        average_time_to_remission_days,
        relapse_rate,
        discontinuation_rate,
        side_effects_rate,
        functional_recovery_rate
    ) VALUES (
        p_medication_id,
        p_analysis_period_start,
        p_analysis_period_end,
        v_metrics.total_patients,
        v_metrics.total_assessments,
        v_metrics.average_effectiveness_rating,
        v_metrics.response_rate,
        v_metrics.remission_rate,
        v_metrics.average_time_to_response_days,
        v_metrics.average_time_to_remission_days,
        v_metrics.relapse_rate,
        v_metrics.discontinuation_rate,
        v_metrics.side_effects_rate,
        v_metrics.functional_recovery_rate
    )
    ON CONFLICT (medication_id, analysis_period_start, analysis_period_end) 
    DO UPDATE SET
        total_patients = EXCLUDED.total_patients,
        total_assessments = EXCLUDED.total_assessments,
        average_effectiveness_rating = EXCLUDED.average_effectiveness_rating,
        response_rate = EXCLUDED.response_rate,
        remission_rate = EXCLUDED.remission_rate,
        average_time_to_response_days = EXCLUDED.average_time_to_response_days,
        average_time_to_remission_days = EXCLUDED.average_time_to_remission_days,
        relapse_rate = EXCLUDED.relapse_rate,
        discontinuation_rate = EXCLUDED.discontinuation_rate,
        side_effects_rate = EXCLUDED.side_effects_rate,
        functional_recovery_rate = EXCLUDED.functional_recovery_rate,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update analytics when new assessment is added
CREATE OR REPLACE FUNCTION trigger_update_effectiveness_analytics()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_medication_effectiveness_analytics(NEW.medication_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER medication_effectiveness_analytics_trigger
    AFTER INSERT OR UPDATE ON medication_effectiveness_assessments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_effectiveness_analytics();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_effectiveness_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER medication_effectiveness_assessments_updated_at
    BEFORE UPDATE ON medication_effectiveness_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_effectiveness_updated_at();

CREATE TRIGGER rating_scale_assessments_updated_at
    BEFORE UPDATE ON rating_scale_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_effectiveness_updated_at();

CREATE TRIGGER treatment_response_tracking_updated_at
    BEFORE UPDATE ON treatment_response_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_effectiveness_updated_at();

CREATE TRIGGER comparative_effectiveness_studies_updated_at
    BEFORE UPDATE ON comparative_effectiveness_studies
    FOR EACH ROW
    EXECUTE FUNCTION update_effectiveness_updated_at();

CREATE TRIGGER medication_effectiveness_analytics_updated_at
    BEFORE UPDATE ON medication_effectiveness_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_effectiveness_updated_at();

CREATE TRIGGER patient_reported_outcomes_updated_at
    BEFORE UPDATE ON patient_reported_outcomes
    FOR EACH ROW
    EXECUTE FUNCTION update_effectiveness_updated_at();




