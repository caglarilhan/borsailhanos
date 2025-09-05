-- Clinical Guidelines Schema
-- Comprehensive clinical guidelines management for American psychiatrists

-- Clinical guidelines
CREATE TABLE IF NOT EXISTS clinical_guidelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guideline_name VARCHAR(255) NOT NULL,
    guideline_code VARCHAR(100) UNIQUE NOT NULL, -- 'APA-DEP-2023', 'FDA-SSRI-2024', etc.
    guideline_version VARCHAR(50) NOT NULL,
    guideline_type VARCHAR(50) NOT NULL, -- 'diagnosis', 'treatment', 'monitoring', 'screening', 'prevention'
    category VARCHAR(100) NOT NULL, -- 'depression', 'anxiety', 'bipolar', 'schizophrenia', 'substance_use'
    subcategory VARCHAR(100), -- 'major_depressive_disorder', 'generalized_anxiety_disorder', etc.
    issuing_organization VARCHAR(255) NOT NULL, -- 'APA', 'FDA', 'CMS', 'NICE', 'WHO'
    publication_date DATE NOT NULL,
    effective_date DATE NOT NULL,
    expiration_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'superseded', 'withdrawn', 'draft'
    evidence_level VARCHAR(20) NOT NULL, -- 'A', 'B', 'C', 'D' (A = highest quality evidence)
    recommendation_strength VARCHAR(20) NOT NULL, -- 'strong', 'moderate', 'weak', 'insufficient'
    target_population TEXT,
    exclusion_criteria TEXT,
    guideline_summary TEXT NOT NULL,
    full_guideline_text TEXT,
    key_recommendations TEXT[],
    clinical_algorithms JSONB, -- Structured clinical decision trees
    quality_measures JSONB, -- Associated quality measures
    references TEXT[], -- Literature references
    implementation_notes TEXT,
    cost_considerations TEXT,
    insurance_coverage JSONB, -- Insurance coverage information
    regulatory_compliance JSONB, -- Regulatory compliance requirements
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guideline recommendations
CREATE TABLE IF NOT EXISTS guideline_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guideline_id UUID NOT NULL REFERENCES clinical_guidelines(id) ON DELETE CASCADE,
    recommendation_number VARCHAR(20) NOT NULL, -- 'R1', 'R2', etc.
    recommendation_title VARCHAR(255) NOT NULL,
    recommendation_text TEXT NOT NULL,
    recommendation_type VARCHAR(50) NOT NULL, -- 'intervention', 'assessment', 'monitoring', 'referral', 'education'
    priority_level VARCHAR(20) NOT NULL, -- 'high', 'medium', 'low'
    evidence_level VARCHAR(20) NOT NULL, -- 'A', 'B', 'C', 'D'
    recommendation_strength VARCHAR(20) NOT NULL, -- 'strong', 'moderate', 'weak', 'insufficient'
    target_condition VARCHAR(255), -- Specific condition this applies to
    patient_population TEXT, -- Specific patient population
    contraindications TEXT[],
    prerequisites TEXT[], -- Prerequisites for this recommendation
    expected_outcomes TEXT[],
    implementation_steps TEXT[],
    monitoring_requirements TEXT[],
    follow_up_requirements TEXT[],
    cost_effectiveness_data JSONB,
    quality_metrics JSONB, -- Associated quality metrics
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient guideline applications
CREATE TABLE IF NOT EXISTS patient_guideline_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    guideline_id UUID NOT NULL REFERENCES clinical_guidelines(id) ON DELETE CASCADE,
    application_date DATE NOT NULL DEFAULT CURRENT_DATE,
    application_type VARCHAR(50) NOT NULL, -- 'diagnosis', 'treatment', 'monitoring', 'screening'
    patient_condition VARCHAR(255) NOT NULL,
    patient_symptoms TEXT[],
    patient_demographics JSONB, -- Age, gender, comorbidities, etc.
    guideline_applicability_score DECIMAL(3,2), -- 0.00 to 1.00
    applicable_recommendations UUID[] REFERENCES guideline_recommendations(id),
    non_applicable_recommendations UUID[] REFERENCES guideline_recommendations(id),
    application_notes TEXT,
    implementation_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'implemented', 'partial', 'not_applicable'
    implementation_date DATE,
    implementation_notes TEXT,
    outcome_assessment TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    quality_measures_applied JSONB,
    compliance_score DECIMAL(3,2), -- 0.00 to 1.00
    applied_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guideline compliance tracking
CREATE TABLE IF NOT EXISTS guideline_compliance_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    guideline_id UUID NOT NULL REFERENCES clinical_guidelines(id) ON DELETE CASCADE,
    recommendation_id UUID NOT NULL REFERENCES guideline_recommendations(id) ON DELETE CASCADE,
    tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
    compliance_status VARCHAR(50) NOT NULL, -- 'compliant', 'non_compliant', 'partial', 'not_applicable'
    compliance_score DECIMAL(3,2), -- 0.00 to 1.00
    compliance_notes TEXT,
    barriers_to_compliance TEXT[],
    interventions_applied TEXT[],
    outcome_achieved BOOLEAN,
    outcome_description TEXT,
    quality_measure_value DECIMAL(10,3),
    quality_measure_unit VARCHAR(50),
    next_assessment_date DATE,
    assessed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guideline analytics
CREATE TABLE IF NOT EXISTS guideline_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guideline_id UUID NOT NULL REFERENCES clinical_guidelines(id) ON DELETE CASCADE,
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    analysis_period_months INTEGER NOT NULL DEFAULT 12,
    total_applications INTEGER NOT NULL DEFAULT 0,
    total_patients INTEGER NOT NULL DEFAULT 0,
    average_applicability_score DECIMAL(3,2),
    average_compliance_score DECIMAL(3,2),
    compliance_rate DECIMAL(5,2), -- Percentage
    implementation_rate DECIMAL(5,2), -- Percentage
    outcome_achievement_rate DECIMAL(5,2), -- Percentage
    most_applied_recommendations JSONB, -- Most frequently applied recommendations
    least_applied_recommendations JSONB, -- Least frequently applied recommendations
    common_barriers JSONB, -- Most common barriers to compliance
    quality_measure_performance JSONB, -- Performance on quality measures
    cost_effectiveness_metrics JSONB, -- Cost-effectiveness analysis
    patient_outcomes JSONB, -- Patient outcome analysis
    provider_satisfaction DECIMAL(3,2), -- Provider satisfaction with guidelines
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guideline alerts and notifications
CREATE TABLE IF NOT EXISTS guideline_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    guideline_id UUID NOT NULL REFERENCES clinical_guidelines(id) ON DELETE CASCADE,
    recommendation_id UUID REFERENCES guideline_recommendations(id),
    alert_type VARCHAR(50) NOT NULL, -- 'non_compliance', 'overdue_assessment', 'guideline_update', 'quality_measure_alert'
    alert_severity VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    alert_message TEXT NOT NULL,
    alert_description TEXT,
    trigger_condition TEXT,
    current_value DECIMAL(10,3),
    threshold_value DECIMAL(10,3),
    alert_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    follow_up_required BOOLEAN DEFAULT TRUE,
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_clinical_guidelines_code ON clinical_guidelines(guideline_code);
CREATE INDEX IF NOT EXISTS idx_clinical_guidelines_type ON clinical_guidelines(guideline_type);
CREATE INDEX IF NOT EXISTS idx_clinical_guidelines_category ON clinical_guidelines(category);
CREATE INDEX IF NOT EXISTS idx_clinical_guidelines_organization ON clinical_guidelines(issuing_organization);
CREATE INDEX IF NOT EXISTS idx_clinical_guidelines_status ON clinical_guidelines(status);
CREATE INDEX IF NOT EXISTS idx_clinical_guidelines_effective_date ON clinical_guidelines(effective_date);

CREATE INDEX IF NOT EXISTS idx_guideline_recommendations_guideline_id ON guideline_recommendations(guideline_id);
CREATE INDEX IF NOT EXISTS idx_guideline_recommendations_type ON guideline_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_guideline_recommendations_priority ON guideline_recommendations(priority_level);
CREATE INDEX IF NOT EXISTS idx_guideline_recommendations_evidence ON guideline_recommendations(evidence_level);

CREATE INDEX IF NOT EXISTS idx_patient_guideline_applications_patient_id ON patient_guideline_applications(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_guideline_applications_guideline_id ON patient_guideline_applications(guideline_id);
CREATE INDEX IF NOT EXISTS idx_patient_guideline_applications_date ON patient_guideline_applications(application_date);
CREATE INDEX IF NOT EXISTS idx_patient_guideline_applications_status ON patient_guideline_applications(implementation_status);

CREATE INDEX IF NOT EXISTS idx_guideline_compliance_tracking_patient_id ON guideline_compliance_tracking(patient_id);
CREATE INDEX IF NOT EXISTS idx_guideline_compliance_tracking_guideline_id ON guideline_compliance_tracking(guideline_id);
CREATE INDEX IF NOT EXISTS idx_guideline_compliance_tracking_recommendation_id ON guideline_compliance_tracking(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_guideline_compliance_tracking_date ON guideline_compliance_tracking(tracking_date);
CREATE INDEX IF NOT EXISTS idx_guideline_compliance_tracking_status ON guideline_compliance_tracking(compliance_status);

CREATE INDEX IF NOT EXISTS idx_guideline_analytics_guideline_id ON guideline_analytics(guideline_id);
CREATE INDEX IF NOT EXISTS idx_guideline_analytics_date ON guideline_analytics(analysis_date);

CREATE INDEX IF NOT EXISTS idx_guideline_alerts_patient_id ON guideline_alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_guideline_alerts_guideline_id ON guideline_alerts(guideline_id);
CREATE INDEX IF NOT EXISTS idx_guideline_alerts_type ON guideline_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_guideline_alerts_severity ON guideline_alerts(alert_severity);
CREATE INDEX IF NOT EXISTS idx_guideline_alerts_acknowledged ON guideline_alerts(is_acknowledged);
CREATE INDEX IF NOT EXISTS idx_guideline_alerts_resolved ON guideline_alerts(is_resolved);

-- RLS Policies
ALTER TABLE clinical_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE guideline_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_guideline_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE guideline_compliance_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE guideline_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE guideline_alerts ENABLE ROW LEVEL SECURITY;

-- Clinical guidelines policies (system-wide read access)
CREATE POLICY "Users can view clinical guidelines" ON clinical_guidelines
    FOR SELECT USING (true);

CREATE POLICY "Users can insert clinical guidelines" ON clinical_guidelines
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update clinical guidelines" ON clinical_guidelines
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete clinical guidelines" ON clinical_guidelines
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Guideline recommendations policies (system-wide read access)
CREATE POLICY "Users can view guideline recommendations" ON guideline_recommendations
    FOR SELECT USING (true);

CREATE POLICY "Users can insert guideline recommendations" ON guideline_recommendations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update guideline recommendations" ON guideline_recommendations
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete guideline recommendations" ON guideline_recommendations
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Patient guideline applications policies
CREATE POLICY "Users can view guideline applications for their clients" ON patient_guideline_applications
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert guideline applications for their clients" ON patient_guideline_applications
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update guideline applications for their clients" ON patient_guideline_applications
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete guideline applications for their clients" ON patient_guideline_applications
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Guideline compliance tracking policies
CREATE POLICY "Users can view compliance tracking for their clients" ON guideline_compliance_tracking
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert compliance tracking for their clients" ON guideline_compliance_tracking
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update compliance tracking for their clients" ON guideline_compliance_tracking
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete compliance tracking for their clients" ON guideline_compliance_tracking
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Guideline analytics policies (system-wide access)
CREATE POLICY "Users can view guideline analytics" ON guideline_analytics
    FOR SELECT USING (true);

CREATE POLICY "Users can insert guideline analytics" ON guideline_analytics
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update guideline analytics" ON guideline_analytics
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete guideline analytics" ON guideline_analytics
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Guideline alerts policies
CREATE POLICY "Users can view guideline alerts for their clients" ON guideline_alerts
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert guideline alerts for their clients" ON guideline_alerts
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update guideline alerts for their clients" ON guideline_alerts
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete guideline alerts for their clients" ON guideline_alerts
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Functions for clinical guidelines

-- Function to apply clinical guidelines to a patient
CREATE OR REPLACE FUNCTION apply_clinical_guidelines(
    p_patient_id UUID,
    p_guideline_id UUID,
    p_application_type VARCHAR(50),
    p_patient_condition VARCHAR(255),
    p_patient_symptoms TEXT[] DEFAULT NULL,
    p_patient_demographics JSONB DEFAULT NULL
)
RETURNS TABLE (
    application_id UUID,
    applicability_score DECIMAL(3,2),
    applicable_recommendations UUID[],
    non_applicable_recommendations UUID[]
) AS $$
DECLARE
    v_application_id UUID;
    v_applicability_score DECIMAL(3,2) := 0.0;
    v_applicable_recommendations UUID[] := '{}';
    v_non_applicable_recommendations UUID[] := '{}';
    v_recommendation RECORD;
    v_score DECIMAL(3,2);
BEGIN
    -- Create guideline application record
    INSERT INTO patient_guideline_applications (
        patient_id,
        guideline_id,
        application_type,
        patient_condition,
        patient_symptoms,
        patient_demographics,
        implementation_status
    ) VALUES (
        p_patient_id,
        p_guideline_id,
        p_application_type,
        p_patient_condition,
        p_patient_symptoms,
        p_patient_demographics,
        'pending'
    ) RETURNING id INTO v_application_id;

    -- Evaluate each recommendation for applicability
    FOR v_recommendation IN 
        SELECT id, recommendation_text, target_condition, patient_population
        FROM guideline_recommendations
        WHERE guideline_id = p_guideline_id
    LOOP
        v_score := 0.0;
        
        -- Simple applicability scoring based on condition match
        IF v_recommendation.target_condition IS NULL OR 
           v_recommendation.target_condition ILIKE '%' || p_patient_condition || '%' THEN
            v_score := v_score + 0.5;
        END IF;
        
        -- Add score based on patient population match
        IF v_recommendation.patient_population IS NULL OR 
           v_recommendation.patient_population ILIKE '%general%' THEN
            v_score := v_score + 0.3;
        END IF;
        
        -- Add score based on symptoms match
        IF p_patient_symptoms IS NOT NULL AND array_length(p_patient_symptoms, 1) > 0 THEN
            v_score := v_score + 0.2;
        END IF;
        
        -- Determine if recommendation is applicable
        IF v_score >= 0.5 THEN
            v_applicable_recommendations := array_append(v_applicable_recommendations, v_recommendation.id);
        ELSE
            v_non_applicable_recommendations := array_append(v_non_applicable_recommendations, v_recommendation.id);
        END IF;
        
        v_applicability_score := v_applicability_score + v_score;
    END LOOP;
    
    -- Calculate average applicability score
    IF array_length(v_applicable_recommendations, 1) > 0 THEN
        v_applicability_score := v_applicability_score / array_length(v_applicable_recommendations, 1);
    END IF;
    
    -- Update application record with results
    UPDATE patient_guideline_applications
    SET 
        guideline_applicability_score = v_applicability_score,
        applicable_recommendations = v_applicable_recommendations,
        non_applicable_recommendations = v_non_applicable_recommendations
    WHERE id = v_application_id;
    
    RETURN QUERY
    SELECT 
        v_application_id,
        v_applicability_score,
        v_applicable_recommendations,
        v_non_applicable_recommendations;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track guideline compliance
CREATE OR REPLACE FUNCTION track_guideline_compliance(
    p_patient_id UUID,
    p_guideline_id UUID,
    p_recommendation_id UUID,
    p_compliance_status VARCHAR(50),
    p_compliance_score DECIMAL(3,2),
    p_compliance_notes TEXT DEFAULT NULL,
    p_barriers_to_compliance TEXT[] DEFAULT NULL,
    p_interventions_applied TEXT[] DEFAULT NULL,
    p_outcome_achieved BOOLEAN DEFAULT NULL,
    p_outcome_description TEXT DEFAULT NULL,
    p_quality_measure_value DECIMAL(10,3) DEFAULT NULL,
    p_quality_measure_unit VARCHAR(50) DEFAULT NULL,
    p_next_assessment_date DATE DEFAULT NULL,
    p_assessed_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_tracking_id UUID;
BEGIN
    INSERT INTO guideline_compliance_tracking (
        patient_id,
        guideline_id,
        recommendation_id,
        compliance_status,
        compliance_score,
        compliance_notes,
        barriers_to_compliance,
        interventions_applied,
        outcome_achieved,
        outcome_description,
        quality_measure_value,
        quality_measure_unit,
        next_assessment_date,
        assessed_by
    ) VALUES (
        p_patient_id,
        p_guideline_id,
        p_recommendation_id,
        p_compliance_status,
        p_compliance_score,
        p_compliance_notes,
        p_barriers_to_compliance,
        p_interventions_applied,
        p_outcome_achieved,
        p_outcome_description,
        p_quality_measure_value,
        p_quality_measure_unit,
        p_next_assessment_date,
        p_assessed_by
    ) RETURNING id INTO v_tracking_id;
    
    RETURN v_tracking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate guideline analytics
CREATE OR REPLACE FUNCTION generate_guideline_analytics(
    p_guideline_id UUID,
    p_analysis_date DATE DEFAULT CURRENT_DATE,
    p_analysis_period_months INTEGER DEFAULT 12
)
RETURNS JSONB AS $$
DECLARE
    v_start_date DATE;
    v_analytics JSONB;
BEGIN
    v_start_date := p_analysis_date - INTERVAL '1 month' * p_analysis_period_months;
    
    SELECT jsonb_build_object(
        'guideline_id', p_guideline_id,
        'analysis_date', p_analysis_date,
        'analysis_period_months', p_analysis_period_months,
        'total_applications', (
            SELECT COUNT(*) FROM patient_guideline_applications
            WHERE guideline_id = p_guideline_id
            AND application_date >= v_start_date
        ),
        'total_patients', (
            SELECT COUNT(DISTINCT patient_id) FROM patient_guideline_applications
            WHERE guideline_id = p_guideline_id
            AND application_date >= v_start_date
        ),
        'average_applicability_score', (
            SELECT AVG(guideline_applicability_score) FROM patient_guideline_applications
            WHERE guideline_id = p_guideline_id
            AND application_date >= v_start_date
        ),
        'average_compliance_score', (
            SELECT AVG(compliance_score) FROM guideline_compliance_tracking
            WHERE guideline_id = p_guideline_id
            AND tracking_date >= v_start_date
        ),
        'compliance_rate', (
            SELECT 
                CASE WHEN COUNT(*) > 0 
                     THEN COUNT(*) FILTER (WHERE compliance_status = 'compliant')::DECIMAL / COUNT(*) 
                     ELSE 0 END
            FROM guideline_compliance_tracking
            WHERE guideline_id = p_guideline_id
            AND tracking_date >= v_start_date
        ),
        'implementation_rate', (
            SELECT 
                CASE WHEN COUNT(*) > 0 
                     THEN COUNT(*) FILTER (WHERE implementation_status = 'implemented')::DECIMAL / COUNT(*) 
                     ELSE 0 END
            FROM patient_guideline_applications
            WHERE guideline_id = p_guideline_id
            AND application_date >= v_start_date
        ),
        'outcome_achievement_rate', (
            SELECT 
                CASE WHEN COUNT(*) > 0 
                     THEN COUNT(*) FILTER (WHERE outcome_achieved = TRUE)::DECIMAL / COUNT(*) 
                     ELSE 0 END
            FROM guideline_compliance_tracking
            WHERE guideline_id = p_guideline_id
            AND tracking_date >= v_start_date
        ),
        'most_applied_recommendations', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'recommendation_id', recommendation_id,
                    'application_count', application_count
                )
            )
            FROM (
                SELECT 
                    unnest(applicable_recommendations) as recommendation_id,
                    COUNT(*) as application_count
                FROM patient_guideline_applications
                WHERE guideline_id = p_guideline_id
                AND application_date >= v_start_date
                GROUP BY recommendation_id
                ORDER BY application_count DESC
                LIMIT 10
            ) top_recommendations
        ),
        'common_barriers', (
            SELECT jsonb_object_agg(
                barrier,
                barrier_count
            )
            FROM (
                SELECT 
                    unnest(barriers_to_compliance) as barrier,
                    COUNT(*) as barrier_count
                FROM guideline_compliance_tracking
                WHERE guideline_id = p_guideline_id
                AND tracking_date >= v_start_date
                AND barriers_to_compliance IS NOT NULL
                GROUP BY barrier
                ORDER BY barrier_count DESC
                LIMIT 10
            ) barriers
        )
    ) INTO v_analytics;
    
    RETURN v_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update guideline analytics
CREATE OR REPLACE FUNCTION update_guideline_analytics(
    p_guideline_id UUID,
    p_analysis_date DATE DEFAULT CURRENT_DATE,
    p_analysis_period_months INTEGER DEFAULT 12
)
RETURNS VOID AS $$
DECLARE
    v_analytics JSONB;
BEGIN
    SELECT generate_guideline_analytics(p_guideline_id, p_analysis_date, p_analysis_period_months) INTO v_analytics;
    
    INSERT INTO guideline_analytics (
        guideline_id,
        analysis_date,
        analysis_period_months,
        total_applications,
        total_patients,
        average_applicability_score,
        average_compliance_score,
        compliance_rate,
        implementation_rate,
        outcome_achievement_rate,
        most_applied_recommendations,
        common_barriers
    ) VALUES (
        p_guideline_id,
        p_analysis_date,
        p_analysis_period_months,
        (v_analytics->>'total_applications')::INTEGER,
        (v_analytics->>'total_patients')::INTEGER,
        (v_analytics->>'average_applicability_score')::DECIMAL(3,2),
        (v_analytics->>'average_compliance_score')::DECIMAL(3,2),
        (v_analytics->>'compliance_rate')::DECIMAL(5,2),
        (v_analytics->>'implementation_rate')::DECIMAL(5,2),
        (v_analytics->>'outcome_achievement_rate')::DECIMAL(5,2),
        v_analytics->'most_applied_recommendations',
        v_analytics->'common_barriers'
    )
    ON CONFLICT (guideline_id, analysis_date) 
    DO UPDATE SET
        analysis_period_months = EXCLUDED.analysis_period_months,
        total_applications = EXCLUDED.total_applications,
        total_patients = EXCLUDED.total_patients,
        average_applicability_score = EXCLUDED.average_applicability_score,
        average_compliance_score = EXCLUDED.average_compliance_score,
        compliance_rate = EXCLUDED.compliance_rate,
        implementation_rate = EXCLUDED.implementation_rate,
        outcome_achievement_rate = EXCLUDED.outcome_achievement_rate,
        most_applied_recommendations = EXCLUDED.most_applied_recommendations,
        common_barriers = EXCLUDED.common_barriers,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update analytics when new compliance tracking is added
CREATE OR REPLACE FUNCTION trigger_update_guideline_analytics()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_guideline_analytics(NEW.guideline_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER guideline_analytics_trigger
    AFTER INSERT OR UPDATE ON guideline_compliance_tracking
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_guideline_analytics();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_clinical_guidelines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clinical_guidelines_updated_at
    BEFORE UPDATE ON clinical_guidelines
    FOR EACH ROW
    EXECUTE FUNCTION update_clinical_guidelines_updated_at();

CREATE TRIGGER guideline_recommendations_updated_at
    BEFORE UPDATE ON guideline_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_clinical_guidelines_updated_at();

CREATE TRIGGER patient_guideline_applications_updated_at
    BEFORE UPDATE ON patient_guideline_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_clinical_guidelines_updated_at();

CREATE TRIGGER guideline_compliance_tracking_updated_at
    BEFORE UPDATE ON guideline_compliance_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_clinical_guidelines_updated_at();

CREATE TRIGGER guideline_analytics_updated_at
    BEFORE UPDATE ON guideline_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_clinical_guidelines_updated_at();

CREATE TRIGGER guideline_alerts_updated_at
    BEFORE UPDATE ON guideline_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_clinical_guidelines_updated_at();
