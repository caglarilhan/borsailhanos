-- Medication Safety Schema
-- Comprehensive medication safety management for American psychiatrists

-- Medication safety alerts
CREATE TABLE IF NOT EXISTS medication_safety_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_name VARCHAR(255) NOT NULL,
    alert_code VARCHAR(100) UNIQUE NOT NULL, -- 'FDA-ALERT-2024-001', 'DEA-WARNING-2024-002', etc.
    alert_type VARCHAR(50) NOT NULL, -- 'fda_safety', 'black_box_warning', 'drug_recall', 'interaction_alert', 'contraindication', 'dosing_error'
    severity_level VARCHAR(20) NOT NULL, -- 'critical', 'high', 'medium', 'low'
    medication_name VARCHAR(255) NOT NULL,
    medication_class VARCHAR(100),
    alert_description TEXT NOT NULL,
    alert_details TEXT,
    affected_population TEXT,
    risk_factors TEXT[],
    symptoms_to_watch TEXT[],
    recommended_actions TEXT[],
    contraindications TEXT[],
    monitoring_requirements TEXT[],
    reporting_requirements TEXT[],
    fda_alert_number VARCHAR(100),
    fda_alert_date DATE,
    fda_alert_url VARCHAR(500),
    dea_schedule VARCHAR(10), -- 'I', 'II', 'III', 'IV', 'V'
    black_box_warning BOOLEAN DEFAULT FALSE,
    boxed_warning_text TEXT,
    pregnancy_category VARCHAR(10), -- 'A', 'B', 'C', 'D', 'X'
    lactation_warning BOOLEAN DEFAULT FALSE,
    pediatric_warning BOOLEAN DEFAULT FALSE,
    geriatric_warning BOOLEAN DEFAULT FALSE,
    renal_warning BOOLEAN DEFAULT FALSE,
    hepatic_warning BOOLEAN DEFAULT FALSE,
    cardiac_warning BOOLEAN DEFAULT FALSE,
    psychiatric_warning BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    effective_date DATE NOT NULL,
    expiration_date DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient medication safety assessments
CREATE TABLE IF NOT EXISTS patient_medication_safety_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    assessment_type VARCHAR(50) NOT NULL, -- 'initial', 'follow_up', 'medication_change', 'adverse_event', 'annual'
    current_medications JSONB NOT NULL, -- Current medication list with dosages
    medication_allergies TEXT[],
    drug_interactions JSONB, -- Detected drug interactions
    contraindications JSONB, -- Detected contraindications
    risk_factors JSONB, -- Patient-specific risk factors
    safety_score DECIMAL(3,2), -- 0.00 to 1.00 (1.00 = highest safety)
    risk_level VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
    safety_recommendations TEXT[],
    monitoring_plan TEXT[],
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    assessment_notes TEXT,
    assessed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication error reports
CREATE TABLE IF NOT EXISTS medication_error_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    error_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    error_type VARCHAR(50) NOT NULL, -- 'prescribing', 'dispensing', 'administration', 'monitoring', 'documentation'
    error_category VARCHAR(50) NOT NULL, -- 'wrong_drug', 'wrong_dose', 'wrong_route', 'wrong_time', 'wrong_patient', 'omission', 'commission'
    severity_level VARCHAR(20) NOT NULL, -- 'critical', 'major', 'moderate', 'minor'
    medication_name VARCHAR(255) NOT NULL,
    intended_dose VARCHAR(100),
    actual_dose VARCHAR(100),
    intended_route VARCHAR(50),
    actual_route VARCHAR(50),
    intended_frequency VARCHAR(50),
    actual_frequency VARCHAR(50),
    error_description TEXT NOT NULL,
    contributing_factors TEXT[],
    root_cause_analysis TEXT,
    immediate_actions_taken TEXT[],
    patient_harm BOOLEAN DEFAULT FALSE,
    harm_description TEXT,
    harm_severity VARCHAR(20), -- 'none', 'mild', 'moderate', 'severe', 'life_threatening'
    corrective_actions TEXT[],
    preventive_measures TEXT[],
    reported_to_fda BOOLEAN DEFAULT FALSE,
    fda_report_number VARCHAR(100),
    reported_to_state BOOLEAN DEFAULT FALSE,
    state_report_number VARCHAR(100),
    internal_review_completed BOOLEAN DEFAULT FALSE,
    review_date DATE,
    review_notes TEXT,
    reported_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adverse event reports
CREATE TABLE IF NOT EXISTS adverse_event_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    event_type VARCHAR(50) NOT NULL, -- 'adverse_drug_reaction', 'allergic_reaction', 'overdose', 'toxicity', 'withdrawal', 'interaction'
    severity_level VARCHAR(20) NOT NULL, -- 'mild', 'moderate', 'severe', 'life_threatening', 'fatal'
    causality_assessment VARCHAR(20) NOT NULL, -- 'definite', 'probable', 'possible', 'unlikely', 'conditional'
    medication_name VARCHAR(255) NOT NULL,
    medication_dose VARCHAR(100),
    medication_route VARCHAR(50),
    medication_frequency VARCHAR(50),
    time_to_onset VARCHAR(50), -- 'immediate', 'acute', 'subacute', 'latent'
    event_description TEXT NOT NULL,
    symptoms_experienced TEXT[],
    signs_observed TEXT[],
    laboratory_abnormalities JSONB,
    vital_signs_abnormalities JSONB,
    treatment_provided TEXT[],
    outcome VARCHAR(50), -- 'recovered', 'recovering', 'not_recovered', 'recovered_with_sequelae', 'fatal'
    outcome_date DATE,
    sequelae_description TEXT,
    dechallenge_result VARCHAR(50), -- 'positive', 'negative', 'not_applicable'
    rechallenge_result VARCHAR(50), -- 'positive', 'negative', 'not_performed'
    reported_to_fda BOOLEAN DEFAULT FALSE,
    fda_report_number VARCHAR(100),
    fda_report_date DATE,
    reported_to_manufacturer BOOLEAN DEFAULT FALSE,
    manufacturer_report_number VARCHAR(100),
    manufacturer_report_date DATE,
    reported_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication safety monitoring
CREATE TABLE IF NOT EXISTS medication_safety_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    monitoring_type VARCHAR(50) NOT NULL, -- 'therapeutic_drug_monitoring', 'adverse_effects', 'interactions', 'compliance', 'efficacy'
    monitoring_frequency VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'as_needed'
    monitoring_parameters TEXT[],
    baseline_values JSONB,
    target_values JSONB,
    alert_thresholds JSONB,
    last_monitoring_date DATE,
    next_monitoring_date DATE,
    monitoring_results JSONB,
    abnormal_values JSONB,
    clinical_significance VARCHAR(50), -- 'normal', 'mild_abnormality', 'moderate_abnormality', 'severe_abnormality'
    action_required BOOLEAN DEFAULT FALSE,
    action_taken TEXT[],
    monitoring_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    monitored_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication safety analytics
CREATE TABLE IF NOT EXISTS medication_safety_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    analysis_period_months INTEGER NOT NULL DEFAULT 12,
    total_patients INTEGER NOT NULL DEFAULT 0,
    total_medications INTEGER NOT NULL DEFAULT 0,
    total_safety_assessments INTEGER NOT NULL DEFAULT 0,
    total_error_reports INTEGER NOT NULL DEFAULT 0,
    total_adverse_events INTEGER NOT NULL DEFAULT 0,
    average_safety_score DECIMAL(3,2),
    high_risk_patients INTEGER NOT NULL DEFAULT 0,
    critical_alerts INTEGER NOT NULL DEFAULT 0,
    medication_errors_by_type JSONB, -- Error distribution by type
    adverse_events_by_severity JSONB, -- Adverse events by severity
    most_problematic_medications JSONB, -- Medications with most issues
    common_error_patterns JSONB, -- Common error patterns
    safety_trends JSONB, -- Safety trends over time
    compliance_rates JSONB, -- Compliance with safety protocols
    fda_reporting_rates JSONB, -- FDA reporting compliance
    cost_of_adverse_events DECIMAL(10,2),
    prevented_errors INTEGER NOT NULL DEFAULT 0,
    safety_improvement_metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_medication_safety_alerts_type ON medication_safety_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_medication_safety_alerts_severity ON medication_safety_alerts(severity_level);
CREATE INDEX IF NOT EXISTS idx_medication_safety_alerts_medication ON medication_safety_alerts(medication_name);
CREATE INDEX IF NOT EXISTS idx_medication_safety_alerts_active ON medication_safety_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_medication_safety_alerts_effective_date ON medication_safety_alerts(effective_date);

CREATE INDEX IF NOT EXISTS idx_patient_medication_safety_assessments_patient_id ON patient_medication_safety_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_medication_safety_assessments_date ON patient_medication_safety_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_patient_medication_safety_assessments_type ON patient_medication_safety_assessments(assessment_type);
CREATE INDEX IF NOT EXISTS idx_patient_medication_safety_assessments_risk_level ON patient_medication_safety_assessments(risk_level);

CREATE INDEX IF NOT EXISTS idx_medication_error_reports_patient_id ON medication_error_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_medication_error_reports_date ON medication_error_reports(error_date);
CREATE INDEX IF NOT EXISTS idx_medication_error_reports_type ON medication_error_reports(error_type);
CREATE INDEX IF NOT EXISTS idx_medication_error_reports_severity ON medication_error_reports(severity_level);
CREATE INDEX IF NOT EXISTS idx_medication_error_reports_harm ON medication_error_reports(patient_harm);

CREATE INDEX IF NOT EXISTS idx_adverse_event_reports_patient_id ON adverse_event_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_adverse_event_reports_date ON adverse_event_reports(event_date);
CREATE INDEX IF NOT EXISTS idx_adverse_event_reports_type ON adverse_event_reports(event_type);
CREATE INDEX IF NOT EXISTS idx_adverse_event_reports_severity ON adverse_event_reports(severity_level);
CREATE INDEX IF NOT EXISTS idx_adverse_event_reports_causality ON adverse_event_reports(causality_assessment);

CREATE INDEX IF NOT EXISTS idx_medication_safety_monitoring_patient_id ON medication_safety_monitoring(patient_id);
CREATE INDEX IF NOT EXISTS idx_medication_safety_monitoring_medication ON medication_safety_monitoring(medication_name);
CREATE INDEX IF NOT EXISTS idx_medication_safety_monitoring_type ON medication_safety_monitoring(monitoring_type);
CREATE INDEX IF NOT EXISTS idx_medication_safety_monitoring_active ON medication_safety_monitoring(is_active);
CREATE INDEX IF NOT EXISTS idx_medication_safety_monitoring_next_date ON medication_safety_monitoring(next_monitoring_date);

CREATE INDEX IF NOT EXISTS idx_medication_safety_analytics_date ON medication_safety_analytics(analysis_date);

-- RLS Policies
ALTER TABLE medication_safety_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_medication_safety_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_error_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE adverse_event_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_safety_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_safety_analytics ENABLE ROW LEVEL SECURITY;

-- Medication safety alerts policies (system-wide read access)
CREATE POLICY "Users can view medication safety alerts" ON medication_safety_alerts
    FOR SELECT USING (true);

CREATE POLICY "Users can insert medication safety alerts" ON medication_safety_alerts
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update medication safety alerts" ON medication_safety_alerts
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete medication safety alerts" ON medication_safety_alerts
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Patient medication safety assessments policies
CREATE POLICY "Users can view safety assessments for their clients" ON patient_medication_safety_assessments
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert safety assessments for their clients" ON patient_medication_safety_assessments
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update safety assessments for their clients" ON patient_medication_safety_assessments
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete safety assessments for their clients" ON patient_medication_safety_assessments
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Medication error reports policies
CREATE POLICY "Users can view error reports for their clients" ON medication_error_reports
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert error reports for their clients" ON medication_error_reports
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update error reports for their clients" ON medication_error_reports
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete error reports for their clients" ON medication_error_reports
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Adverse event reports policies
CREATE POLICY "Users can view adverse events for their clients" ON adverse_event_reports
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert adverse events for their clients" ON adverse_event_reports
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update adverse events for their clients" ON adverse_event_reports
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete adverse events for their clients" ON adverse_event_reports
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Medication safety monitoring policies
CREATE POLICY "Users can view safety monitoring for their clients" ON medication_safety_monitoring
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert safety monitoring for their clients" ON medication_safety_monitoring
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update safety monitoring for their clients" ON medication_safety_monitoring
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete safety monitoring for their clients" ON medication_safety_monitoring
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM clients WHERE owner_id = auth.uid()
        )
    );

-- Medication safety analytics policies (system-wide access)
CREATE POLICY "Users can view medication safety analytics" ON medication_safety_analytics
    FOR SELECT USING (true);

CREATE POLICY "Users can insert medication safety analytics" ON medication_safety_analytics
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update medication safety analytics" ON medication_safety_analytics
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete medication safety analytics" ON medication_safety_analytics
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Functions for medication safety

-- Function to assess patient medication safety
CREATE OR REPLACE FUNCTION assess_patient_medication_safety(
    p_patient_id UUID,
    p_current_medications JSONB,
    p_medication_allergies TEXT[] DEFAULT NULL,
    p_assessment_type VARCHAR(50) DEFAULT 'follow_up'
)
RETURNS TABLE (
    assessment_id UUID,
    safety_score DECIMAL(3,2),
    risk_level VARCHAR(20),
    detected_interactions JSONB,
    detected_contraindications JSONB,
    risk_factors JSONB,
    safety_recommendations TEXT[]
) AS $$
DECLARE
    v_assessment_id UUID;
    v_safety_score DECIMAL(3,2) := 1.0;
    v_risk_level VARCHAR(20) := 'low';
    v_detected_interactions JSONB := '{}';
    v_detected_contraindications JSONB := '{}';
    v_risk_factors JSONB := '{}';
    v_safety_recommendations TEXT[] := '{}';
    v_medication_count INTEGER;
    v_interaction_count INTEGER := 0;
    v_contraindication_count INTEGER := 0;
    v_allergy_count INTEGER := 0;
BEGIN
    -- Count medications
    v_medication_count := jsonb_array_length(p_current_medications);
    
    -- Count allergies
    IF p_medication_allergies IS NOT NULL THEN
        v_allergy_count := array_length(p_medication_allergies, 1);
    END IF;
    
    -- Simple safety scoring algorithm
    -- Start with perfect score and deduct for risks
    
    -- Deduct for number of medications (polypharmacy risk)
    IF v_medication_count > 5 THEN
        v_safety_score := v_safety_score - 0.2;
        v_risk_factors := jsonb_set(v_risk_factors, '{polypharmacy}', 'true');
        v_safety_recommendations := array_append(v_safety_recommendations, 'Consider medication review for polypharmacy');
    ELSIF v_medication_count > 3 THEN
        v_safety_score := v_safety_score - 0.1;
        v_risk_factors := jsonb_set(v_risk_factors, '{polypharmacy}', 'moderate');
    END IF;
    
    -- Deduct for allergies
    IF v_allergy_count > 0 THEN
        v_safety_score := v_safety_score - (v_allergy_count * 0.1);
        v_risk_factors := jsonb_set(v_risk_factors, '{allergies}', to_jsonb(v_allergy_count));
        v_safety_recommendations := array_append(v_safety_recommendations, 'Monitor for allergic reactions');
    END IF;
    
    -- Simulate interaction detection (in real implementation, this would use drug interaction database)
    -- For demonstration, we'll create mock interactions
    IF v_medication_count > 1 THEN
        v_interaction_count := 1; -- Simulate finding 1 interaction
        v_detected_interactions := jsonb_build_object(
            'interaction_1', jsonb_build_object(
                'medication_1', 'Sertraline',
                'medication_2', 'Warfarin',
                'severity', 'moderate',
                'description', 'Increased bleeding risk'
            )
        );
        v_safety_score := v_safety_score - 0.15;
        v_safety_recommendations := array_append(v_safety_recommendations, 'Monitor INR closely due to drug interaction');
    END IF;
    
    -- Simulate contraindication detection
    -- For demonstration, we'll create mock contraindications
    IF v_medication_count > 0 THEN
        v_contraindication_count := 1; -- Simulate finding 1 contraindication
        v_detected_contraindications := jsonb_build_object(
            'contraindication_1', jsonb_build_object(
                'medication', 'Lithium',
                'condition', 'Severe renal impairment',
                'severity', 'high',
                'description', 'Lithium contraindicated in severe renal impairment'
            )
        );
        v_safety_score := v_safety_score - 0.2;
        v_safety_recommendations := array_append(v_safety_recommendations, 'Consider alternative medication due to contraindication');
    END IF;
    
    -- Determine risk level based on safety score
    IF v_safety_score < 0.5 THEN
        v_risk_level := 'critical';
    ELSIF v_safety_score < 0.7 THEN
        v_risk_level := 'high';
    ELSIF v_safety_score < 0.8 THEN
        v_risk_level := 'medium';
    ELSE
        v_risk_level := 'low';
    END IF;
    
    -- Ensure safety score doesn't go below 0
    v_safety_score := GREATEST(0.0, v_safety_score);
    
    -- Create assessment record
    INSERT INTO patient_medication_safety_assessments (
        patient_id,
        assessment_type,
        current_medications,
        medication_allergies,
        drug_interactions,
        contraindications,
        risk_factors,
        safety_score,
        risk_level,
        safety_recommendations
    ) VALUES (
        p_patient_id,
        p_assessment_type,
        p_current_medications,
        p_medication_allergies,
        v_detected_interactions,
        v_detected_contraindications,
        v_risk_factors,
        v_safety_score,
        v_risk_level,
        v_safety_recommendations
    ) RETURNING id INTO v_assessment_id;
    
    RETURN QUERY
    SELECT 
        v_assessment_id,
        v_safety_score,
        v_risk_level,
        v_detected_interactions,
        v_detected_contraindications,
        v_risk_factors,
        v_safety_recommendations;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate medication safety analytics
CREATE OR REPLACE FUNCTION generate_medication_safety_analytics(
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
        'analysis_date', p_analysis_date,
        'analysis_period_months', p_analysis_period_months,
        'total_patients', (
            SELECT COUNT(DISTINCT patient_id) FROM patient_medication_safety_assessments
            WHERE assessment_date >= v_start_date
        ),
        'total_medications', (
            SELECT COUNT(*) FROM patient_medication_safety_assessments
            WHERE assessment_date >= v_start_date
        ),
        'total_safety_assessments', (
            SELECT COUNT(*) FROM patient_medication_safety_assessments
            WHERE assessment_date >= v_start_date
        ),
        'total_error_reports', (
            SELECT COUNT(*) FROM medication_error_reports
            WHERE error_date >= v_start_date
        ),
        'total_adverse_events', (
            SELECT COUNT(*) FROM adverse_event_reports
            WHERE event_date >= v_start_date
        ),
        'average_safety_score', (
            SELECT AVG(safety_score) FROM patient_medication_safety_assessments
            WHERE assessment_date >= v_start_date
        ),
        'high_risk_patients', (
            SELECT COUNT(*) FROM patient_medication_safety_assessments
            WHERE assessment_date >= v_start_date
            AND risk_level IN ('high', 'critical')
        ),
        'critical_alerts', (
            SELECT COUNT(*) FROM medication_safety_alerts
            WHERE effective_date >= v_start_date
            AND severity_level = 'critical'
        ),
        'medication_errors_by_type', (
            SELECT jsonb_object_agg(
                error_type,
                error_count
            )
            FROM (
                SELECT 
                    error_type,
                    COUNT(*) as error_count
                FROM medication_error_reports
                WHERE error_date >= v_start_date
                GROUP BY error_type
            ) errors
        ),
        'adverse_events_by_severity', (
            SELECT jsonb_object_agg(
                severity_level,
                event_count
            )
            FROM (
                SELECT 
                    severity_level,
                    COUNT(*) as event_count
                FROM adverse_event_reports
                WHERE event_date >= v_start_date
                GROUP BY severity_level
            ) events
        ),
        'most_problematic_medications', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'medication_name', medication_name,
                    'error_count', error_count,
                    'adverse_event_count', adverse_event_count
                )
            )
            FROM (
                SELECT 
                    medication_name,
                    COUNT(*) as error_count,
                    0 as adverse_event_count
                FROM medication_error_reports
                WHERE error_date >= v_start_date
                GROUP BY medication_name
                UNION ALL
                SELECT 
                    medication_name,
                    0 as error_count,
                    COUNT(*) as adverse_event_count
                FROM adverse_event_reports
                WHERE event_date >= v_start_date
                GROUP BY medication_name
            ) medications
            ORDER BY (error_count + adverse_event_count) DESC
            LIMIT 10
        ),
        'safety_trends', (
            SELECT jsonb_build_object(
                'safety_score_trend', (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'month', month,
                            'average_score', average_score
                        )
                    )
                    FROM (
                        SELECT 
                            DATE_TRUNC('month', assessment_date) as month,
                            AVG(safety_score) as average_score
                        FROM patient_medication_safety_assessments
                        WHERE assessment_date >= v_start_date
                        GROUP BY month
                        ORDER BY month
                    ) trends
                ),
                'error_trend', (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'month', month,
                            'error_count', error_count
                        )
                    )
                    FROM (
                        SELECT 
                            DATE_TRUNC('month', error_date) as month,
                            COUNT(*) as error_count
                        FROM medication_error_reports
                        WHERE error_date >= v_start_date
                        GROUP BY month
                        ORDER BY month
                    ) trends
                )
            )
        )
    ) INTO v_analytics;
    
    RETURN v_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update medication safety analytics
CREATE OR REPLACE FUNCTION update_medication_safety_analytics(
    p_analysis_date DATE DEFAULT CURRENT_DATE,
    p_analysis_period_months INTEGER DEFAULT 12
)
RETURNS VOID AS $$
DECLARE
    v_analytics JSONB;
BEGIN
    SELECT generate_medication_safety_analytics(p_analysis_date, p_analysis_period_months) INTO v_analytics;
    
    INSERT INTO medication_safety_analytics (
        analysis_date,
        analysis_period_months,
        total_patients,
        total_medications,
        total_safety_assessments,
        total_error_reports,
        total_adverse_events,
        average_safety_score,
        high_risk_patients,
        critical_alerts,
        medication_errors_by_type,
        adverse_events_by_severity,
        most_problematic_medications,
        safety_trends
    ) VALUES (
        p_analysis_date,
        p_analysis_period_months,
        (v_analytics->>'total_patients')::INTEGER,
        (v_analytics->>'total_medications')::INTEGER,
        (v_analytics->>'total_safety_assessments')::INTEGER,
        (v_analytics->>'total_error_reports')::INTEGER,
        (v_analytics->>'total_adverse_events')::INTEGER,
        (v_analytics->>'average_safety_score')::DECIMAL(3,2),
        (v_analytics->>'high_risk_patients')::INTEGER,
        (v_analytics->>'critical_alerts')::INTEGER,
        v_analytics->'medication_errors_by_type',
        v_analytics->'adverse_events_by_severity',
        v_analytics->'most_problematic_medications',
        v_analytics->'safety_trends'
    )
    ON CONFLICT (analysis_date) 
    DO UPDATE SET
        analysis_period_months = EXCLUDED.analysis_period_months,
        total_patients = EXCLUDED.total_patients,
        total_medications = EXCLUDED.total_medications,
        total_safety_assessments = EXCLUDED.total_safety_assessments,
        total_error_reports = EXCLUDED.total_error_reports,
        total_adverse_events = EXCLUDED.total_adverse_events,
        average_safety_score = EXCLUDED.average_safety_score,
        high_risk_patients = EXCLUDED.high_risk_patients,
        critical_alerts = EXCLUDED.critical_alerts,
        medication_errors_by_type = EXCLUDED.medication_errors_by_type,
        adverse_events_by_severity = EXCLUDED.adverse_events_by_severity,
        most_problematic_medications = EXCLUDED.most_problematic_medications,
        safety_trends = EXCLUDED.safety_trends,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update analytics when new safety assessment is added
CREATE OR REPLACE FUNCTION trigger_update_medication_safety_analytics()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_medication_safety_analytics();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER medication_safety_analytics_trigger
    AFTER INSERT OR UPDATE ON patient_medication_safety_assessments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_medication_safety_analytics();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_medication_safety_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER medication_safety_alerts_updated_at
    BEFORE UPDATE ON medication_safety_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_medication_safety_updated_at();

CREATE TRIGGER patient_medication_safety_assessments_updated_at
    BEFORE UPDATE ON patient_medication_safety_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_medication_safety_updated_at();

CREATE TRIGGER medication_error_reports_updated_at
    BEFORE UPDATE ON medication_error_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_medication_safety_updated_at();

CREATE TRIGGER adverse_event_reports_updated_at
    BEFORE UPDATE ON adverse_event_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_medication_safety_updated_at();

CREATE TRIGGER medication_safety_monitoring_updated_at
    BEFORE UPDATE ON medication_safety_monitoring
    FOR EACH ROW
    EXECUTE FUNCTION update_medication_safety_updated_at();

CREATE TRIGGER medication_safety_analytics_updated_at
    BEFORE UPDATE ON medication_safety_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_medication_safety_updated_at();

