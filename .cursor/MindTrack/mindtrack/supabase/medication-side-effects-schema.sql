-- Medication Side Effects Tracking Schema for American Psychiatry
-- Comprehensive system for monitoring, reporting, and analyzing medication side effects

-- Side effects database
CREATE TABLE IF NOT EXISTS side_effects_database (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_id UUID NOT NULL,
    side_effect_name VARCHAR(100) NOT NULL,
    side_effect_category VARCHAR(50), -- 'gastrointestinal', 'neurological', 'cardiovascular', 'dermatological', 'endocrine', 'hematological'
    frequency VARCHAR(20), -- 'very_common', 'common', 'uncommon', 'rare', 'very_rare'
    severity_levels VARCHAR(50)[], -- ['mild', 'moderate', 'severe']
    onset_timing VARCHAR(50), -- 'immediate', 'early', 'delayed', 'late'
    duration_pattern VARCHAR(50), -- 'transient', 'persistent', 'intermittent', 'progressive'
    risk_factors TEXT[],
    monitoring_parameters TEXT[],
    management_strategies TEXT,
    contraindications TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient side effects tracking
CREATE TABLE IF NOT EXISTS patient_side_effects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL,
    side_effect_name VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'mild', 'moderate', 'severe', 'life_threatening'
    onset_date DATE,
    onset_time TIME,
    duration_days INTEGER,
    frequency VARCHAR(50), -- 'constant', 'intermittent', 'episodic', 'occasional'
    intensity_scale INTEGER CHECK (intensity_scale >= 1 AND intensity_scale <= 10),
    impact_on_daily_life VARCHAR(50), -- 'none', 'minimal', 'moderate', 'significant', 'severe'
    associated_symptoms TEXT[],
    triggers TEXT[],
    alleviating_factors TEXT[],
    aggravating_factors TEXT[],
    current_status VARCHAR(20) DEFAULT 'active', -- 'active', 'resolved', 'improving', 'worsening'
    resolution_date DATE,
    action_taken VARCHAR(100), -- 'dose_reduced', 'medication_stopped', 'medication_changed', 'symptomatic_treatment', 'none'
    outcome VARCHAR(50), -- 'resolved', 'improved', 'unchanged', 'worsened'
    notes TEXT,
    reported_by UUID,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Side effects monitoring schedule
CREATE TABLE IF NOT EXISTS side_effects_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL,
    side_effect_name VARCHAR(100),
    monitoring_type VARCHAR(50), -- 'clinical_assessment', 'lab_test', 'imaging', 'questionnaire'
    monitoring_frequency VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'quarterly', 'as_needed'
    next_monitoring_date DATE,
    last_monitoring_date DATE,
    monitoring_parameters TEXT[],
    alert_thresholds TEXT,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Side effects severity assessment tools
CREATE TABLE IF NOT EXISTS side_effects_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL,
    assessment_date DATE,
    assessment_type VARCHAR(50), -- 'clinical_interview', 'questionnaire', 'lab_results', 'patient_report'
    assessment_tool VARCHAR(100), -- 'NCI_CTCAE', 'custom_scale', 'patient_rated'
    side_effects_assessed TEXT[],
    severity_scores JSONB, -- {"nausea": 2, "fatigue": 3, "headache": 1}
    functional_impact_score INTEGER CHECK (functional_impact_score >= 0 AND functional_impact_score <= 10),
    quality_of_life_score INTEGER CHECK (quality_of_life_score >= 0 AND quality_of_life_score <= 10),
    overall_severity VARCHAR(20), -- 'mild', 'moderate', 'severe', 'life_threatening'
    intervention_required BOOLEAN DEFAULT FALSE,
    intervention_type VARCHAR(100),
    follow_up_date DATE,
    assessed_by UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FDA adverse event reporting
CREATE TABLE IF NOT EXISTS fda_adverse_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL,
    side_effect_name VARCHAR(100),
    report_date DATE,
    report_type VARCHAR(50), -- 'initial', 'follow_up', 'serious', 'expedited'
    seriousness VARCHAR(20), -- 'non_serious', 'serious', 'life_threatening', 'fatal'
    outcome VARCHAR(50), -- 'recovered', 'recovering', 'not_recovered', 'fatal', 'unknown'
    causality_assessment VARCHAR(50), -- 'definite', 'probable', 'possible', 'unlikely', 'unassessable'
    fda_case_number VARCHAR(50),
    report_status VARCHAR(20) DEFAULT 'submitted', -- 'draft', 'submitted', 'acknowledged', 'under_review', 'closed'
    fda_response TEXT,
    reported_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Side effects trends and analytics
CREATE TABLE IF NOT EXISTS side_effects_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_id UUID NOT NULL,
    analysis_period_start DATE,
    analysis_period_end DATE,
    total_patients INTEGER,
    patients_with_side_effects INTEGER,
    side_effects_incidence_rate DECIMAL(5,2),
    most_common_side_effects JSONB, -- {"nausea": 25, "headache": 18, "fatigue": 15}
    severity_distribution JSONB, -- {"mild": 60, "moderate": 30, "severe": 10}
    time_to_onset_distribution JSONB, -- {"<1_week": 40, "1-4_weeks": 35, ">4_weeks": 25}
    resolution_time_distribution JSONB, -- {"<1_week": 50, "1-4_weeks": 30, ">4_weeks": 20}
    discontinuation_rate DECIMAL(5,2),
    risk_factors_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Side effects alerts and notifications
CREATE TABLE IF NOT EXISTS side_effects_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    alert_type VARCHAR(50), -- 'new_side_effect', 'worsening_severity', 'serious_reaction', 'monitoring_due'
    medication_id UUID NOT NULL,
    side_effect_name VARCHAR(100),
    alert_message TEXT,
    severity VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
    action_required BOOLEAN DEFAULT FALSE,
    action_description TEXT,
    alert_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged_by UUID,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'acknowledged', 'resolved', 'escalated'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Side effects education materials
CREATE TABLE IF NOT EXISTS side_effects_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_id UUID NOT NULL,
    side_effect_name VARCHAR(100),
    education_type VARCHAR(50), -- 'patient_handout', 'video', 'interactive_module', 'infographic'
    title VARCHAR(200),
    content TEXT,
    content_url VARCHAR(500),
    target_audience VARCHAR(50), -- 'patient', 'caregiver', 'provider'
    language VARCHAR(10) DEFAULT 'en',
    difficulty_level VARCHAR(20), -- 'basic', 'intermediate', 'advanced'
    estimated_duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_side_effects_database_medication ON side_effects_database(medication_id);
CREATE INDEX IF NOT EXISTS idx_side_effects_database_category ON side_effects_database(side_effect_category);
CREATE INDEX IF NOT EXISTS idx_patient_side_effects_client ON patient_side_effects(client_id);
CREATE INDEX IF NOT EXISTS idx_patient_side_effects_medication ON patient_side_effects(medication_id);
CREATE INDEX IF NOT EXISTS idx_patient_side_effects_status ON patient_side_effects(current_status);
CREATE INDEX IF NOT EXISTS idx_patient_side_effects_severity ON patient_side_effects(severity);
CREATE INDEX IF NOT EXISTS idx_side_effects_monitoring_client ON side_effects_monitoring(client_id);
CREATE INDEX IF NOT EXISTS idx_side_effects_monitoring_next_date ON side_effects_monitoring(next_monitoring_date);
CREATE INDEX IF NOT EXISTS idx_side_effects_assessments_client ON side_effects_assessments(client_id);
CREATE INDEX IF NOT EXISTS idx_side_effects_assessments_date ON side_effects_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_fda_adverse_reports_client ON fda_adverse_reports(client_id);
CREATE INDEX IF NOT EXISTS idx_fda_adverse_reports_date ON fda_adverse_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_fda_adverse_reports_status ON fda_adverse_reports(report_status);
CREATE INDEX IF NOT EXISTS idx_side_effects_analytics_medication ON side_effects_analytics(medication_id);
CREATE INDEX IF NOT EXISTS idx_side_effects_analytics_period ON side_effects_analytics(analysis_period_start, analysis_period_end);
CREATE INDEX IF NOT EXISTS idx_side_effects_alerts_client ON side_effects_alerts(client_id);
CREATE INDEX IF NOT EXISTS idx_side_effects_alerts_status ON side_effects_alerts(status);
CREATE INDEX IF NOT EXISTS idx_side_effects_alerts_date ON side_effects_alerts(alert_date);
CREATE INDEX IF NOT EXISTS idx_side_effects_education_medication ON side_effects_education(medication_id);

-- Row Level Security Policies
ALTER TABLE side_effects_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_side_effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE side_effects_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE side_effects_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE fda_adverse_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE side_effects_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE side_effects_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE side_effects_education ENABLE ROW LEVEL SECURITY;

-- RLS Policies for side_effects_database
CREATE POLICY "Enable read access for authenticated users" ON side_effects_database
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON side_effects_database
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for patient_side_effects
CREATE POLICY "Enable read access for clinic members" ON patient_side_effects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = patient_side_effects.client_id
            )
        )
    );

CREATE POLICY "Enable insert for clinic members" ON patient_side_effects
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = patient_side_effects.client_id
            )
        )
    );

CREATE POLICY "Enable update for clinic members" ON patient_side_effects
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = patient_side_effects.client_id
            )
        )
    );

-- RLS Policies for side_effects_monitoring
CREATE POLICY "Enable read access for clinic members" ON side_effects_monitoring
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = side_effects_monitoring.client_id
            )
        )
    );

CREATE POLICY "Enable insert for clinic members" ON side_effects_monitoring
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = side_effects_monitoring.client_id
            )
        )
    );

CREATE POLICY "Enable update for clinic members" ON side_effects_monitoring
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = side_effects_monitoring.client_id
            )
        )
    );

-- RLS Policies for side_effects_assessments
CREATE POLICY "Enable read access for clinic members" ON side_effects_assessments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = side_effects_assessments.client_id
            )
        )
    );

CREATE POLICY "Enable insert for clinic members" ON side_effects_assessments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = side_effects_assessments.client_id
            )
        )
    );

-- RLS Policies for fda_adverse_reports
CREATE POLICY "Enable read access for clinic members" ON fda_adverse_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = fda_adverse_reports.client_id
            )
        )
    );

CREATE POLICY "Enable insert for clinic members" ON fda_adverse_reports
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = fda_adverse_reports.client_id
            )
        )
    );

-- RLS Policies for side_effects_analytics
CREATE POLICY "Enable read access for authenticated users" ON side_effects_analytics
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON side_effects_analytics
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for side_effects_alerts
CREATE POLICY "Enable read access for clinic members" ON side_effects_alerts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = side_effects_alerts.client_id
            )
        )
    );

CREATE POLICY "Enable insert for clinic members" ON side_effects_alerts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = side_effects_alerts.client_id
            )
        )
    );

CREATE POLICY "Enable update for clinic members" ON side_effects_alerts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clinic_members 
            WHERE clinic_members.user_id = auth.uid() 
            AND clinic_members.clinic_id = (
                SELECT clinic_id FROM clients WHERE clients.id = side_effects_alerts.client_id
            )
        )
    );

-- RLS Policies for side_effects_education
CREATE POLICY "Enable read access for authenticated users" ON side_effects_education
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON side_effects_education
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- PostgreSQL Functions for Side Effects Tracking

-- Function to get side effects for a medication
CREATE OR REPLACE FUNCTION get_medication_side_effects(
    medication_id UUID
)
RETURNS TABLE(
    side_effect_name VARCHAR(100),
    side_effect_category VARCHAR(50),
    frequency VARCHAR(20),
    severity_levels VARCHAR(50)[],
    onset_timing VARCHAR(50),
    duration_pattern VARCHAR(50),
    management_strategies TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sed.side_effect_name,
        sed.side_effect_category,
        sed.frequency,
        sed.severity_levels,
        sed.onset_timing,
        sed.duration_pattern,
        sed.management_strategies
    FROM side_effects_database sed
    WHERE sed.medication_id = $1
    ORDER BY sed.frequency DESC, sed.side_effect_name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get patient side effects
CREATE OR REPLACE FUNCTION get_patient_side_effects(
    patient_id UUID,
    medication_id UUID DEFAULT NULL
)
RETURNS TABLE(
    side_effect_name VARCHAR(100),
    severity VARCHAR(20),
    onset_date DATE,
    duration_days INTEGER,
    current_status VARCHAR(20),
    action_taken VARCHAR(100),
    outcome VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pse.side_effect_name,
        pse.severity,
        pse.onset_date,
        pse.duration_days,
        pse.current_status,
        pse.action_taken,
        pse.outcome
    FROM patient_side_effects pse
    WHERE pse.client_id = patient_id
    AND (medication_id IS NULL OR pse.medication_id = medication_id)
    ORDER BY pse.onset_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate side effects incidence rate
CREATE OR REPLACE FUNCTION calculate_side_effects_incidence(
    medication_id UUID,
    start_date DATE,
    end_date DATE
)
RETURNS DECIMAL AS $$
DECLARE
    total_patients INTEGER;
    patients_with_side_effects INTEGER;
    incidence_rate DECIMAL;
BEGIN
    -- Get total patients on medication
    SELECT COUNT(DISTINCT client_id)
    INTO total_patients
    FROM medication_adherence
    WHERE medication_id = $1
    AND start_date BETWEEN $2 AND $3;
    
    -- Get patients with side effects
    SELECT COUNT(DISTINCT client_id)
    INTO patients_with_side_effects
    FROM patient_side_effects
    WHERE medication_id = $1
    AND onset_date BETWEEN $2 AND $3;
    
    -- Calculate incidence rate
    IF total_patients > 0 THEN
        incidence_rate := (patients_with_side_effects::DECIMAL / total_patients::DECIMAL) * 100;
    ELSE
        incidence_rate := 0;
    END IF;
    
    RETURN incidence_rate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create side effects alert
CREATE OR REPLACE FUNCTION create_side_effects_alert(
    patient_id UUID,
    medication_id UUID,
    side_effect_name VARCHAR(100),
    alert_type VARCHAR(50),
    alert_message TEXT,
    severity VARCHAR(20)
)
RETURNS UUID AS $$
DECLARE
    alert_id UUID;
BEGIN
    INSERT INTO side_effects_alerts (
        client_id, medication_id, side_effect_name, alert_type,
        alert_message, severity, action_required
    ) VALUES (
        patient_id, medication_id, side_effect_name, alert_type,
        alert_message, severity, 
        CASE WHEN severity IN ('high', 'critical') THEN TRUE ELSE FALSE END
    ) RETURNING id INTO alert_id;
    
    RETURN alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate side effects report
CREATE OR REPLACE FUNCTION generate_side_effects_report(
    patient_id UUID,
    start_date DATE,
    end_date DATE
)
RETURNS JSONB AS $$
DECLARE
    report_data JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_side_effects', COUNT(*),
        'active_side_effects', COUNT(*) FILTER (WHERE current_status = 'active'),
        'resolved_side_effects', COUNT(*) FILTER (WHERE current_status = 'resolved'),
        'severe_side_effects', COUNT(*) FILTER (WHERE severity = 'severe'),
        'medications_with_side_effects', COUNT(DISTINCT medication_id),
        'side_effects_by_severity', jsonb_object_agg(severity, count) FILTER (WHERE severity IS NOT NULL),
        'side_effects_by_status', jsonb_object_agg(current_status, count) FILTER (WHERE current_status IS NOT NULL),
        'most_common_side_effects', (
            SELECT jsonb_object_agg(side_effect_name, count)
            FROM (
                SELECT side_effect_name, COUNT(*) as count
                FROM patient_side_effects
                WHERE client_id = patient_id
                AND onset_date BETWEEN start_date AND end_date
                GROUP BY side_effect_name
                ORDER BY count DESC
                LIMIT 5
            ) t
        )
    ) INTO report_data
    FROM patient_side_effects
    WHERE client_id = patient_id
    AND onset_date BETWEEN start_date AND end_date;
    
    RETURN report_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_side_effects_database_updated_at BEFORE UPDATE ON side_effects_database
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_side_effects_updated_at BEFORE UPDATE ON patient_side_effects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_side_effects_monitoring_updated_at BEFORE UPDATE ON side_effects_monitoring
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_side_effects_assessments_updated_at BEFORE UPDATE ON side_effects_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fda_adverse_reports_updated_at BEFORE UPDATE ON fda_adverse_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_side_effects_alerts_updated_at BEFORE UPDATE ON side_effects_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_side_effects_education_updated_at BEFORE UPDATE ON side_effects_education
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
